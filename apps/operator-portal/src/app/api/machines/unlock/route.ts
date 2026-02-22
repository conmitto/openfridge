import { NextRequest, NextResponse } from "next/server";
import { unlockMachine } from "@/lib/smartlock";

/**
 * POST /api/machines/unlock
 * Manually trigger a smart lock unlock for a machine.
 * Primarily used for testing; production unlocks happen via the confirm route.
 */
export async function POST(req: NextRequest) {
    try {
        const { machineId } = await req.json();

        if (!machineId) {
            return NextResponse.json(
                { error: "machineId is required" },
                { status: 400 }
            );
        }

        const result = await unlockMachine(machineId);

        return NextResponse.json(result);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unlock failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
