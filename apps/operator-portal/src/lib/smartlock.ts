import { createClient } from "@/lib/supabase/server";

export interface UnlockResult {
    unlocked: boolean;
    expiresAt: string | null;
    error: string | null;
}

/**
 * Unlock a machine's smart lock after successful payment.
 * Looks up the machine's lock config from Supabase, then calls
 * the configured lock API URL to trigger an unlock.
 *
 * Works with any REST-based smart lock (August, Yale, Switchbot, custom ESP32, etc.)
 */
export async function unlockMachine(machineId: string): Promise<UnlockResult> {
    try {
        const supabase = await createClient();

        // Get machine lock config
        const { data: machine, error } = await supabase
            .from("machines")
            .select("lock_enabled, lock_api_url, lock_api_key, lock_duration_sec")
            .eq("id", machineId)
            .single();

        if (error || !machine) {
            return { unlocked: false, expiresAt: null, error: "Machine not found" };
        }

        if (!machine.lock_enabled) {
            return { unlocked: false, expiresAt: null, error: null };
        }

        if (!machine.lock_api_url) {
            return { unlocked: false, expiresAt: null, error: "No lock API URL configured" };
        }

        const duration = machine.lock_duration_sec || 30;
        const expiresAt = new Date(Date.now() + duration * 1000).toISOString();

        // Call the lock's REST API
        const res = await fetch(machine.lock_api_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(machine.lock_api_key
                    ? { Authorization: `Bearer ${machine.lock_api_key}` }
                    : {}),
            },
            body: JSON.stringify({
                action: "unlock",
                machineId,
                duration,
            }),
            signal: AbortSignal.timeout(5000), // 5s timeout
        });

        if (!res.ok) {
            console.error(`Lock API returned ${res.status}`);
            return { unlocked: false, expiresAt: null, error: `Lock API error: ${res.status}` };
        }

        console.log(`🔓 Machine ${machineId} unlocked for ${duration}s`);

        // Schedule re-lock (fire-and-forget)
        scheduleLock(machine.lock_api_url, machine.lock_api_key, machineId, duration);

        return { unlocked: true, expiresAt, error: null };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unlock failed";
        console.error("Smart lock error:", message);
        return { unlocked: false, expiresAt: null, error: message };
    }
}

/**
 * Schedule a re-lock after the unlock duration.
 * This runs in the background — does not block the response.
 */
function scheduleLock(
    apiUrl: string,
    apiKey: string | null,
    machineId: string,
    delaySec: number
) {
    setTimeout(async () => {
        try {
            await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
                },
                body: JSON.stringify({
                    action: "lock",
                    machineId,
                }),
                signal: AbortSignal.timeout(5000),
            });
            console.log(`🔒 Machine ${machineId} re-locked`);
        } catch (err) {
            console.error("Re-lock failed:", err);
        }
    }, delaySec * 1000);
}
