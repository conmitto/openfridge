import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { unlockMachine } from "@/lib/smartlock";

export async function POST(req: NextRequest) {
    try {
        const { paymentIntentId, contact, machineId, items } = await req.json();

        if (!paymentIntentId || !machineId || !items?.length) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Record each item as a sale and decrement inventory
        for (const item of items) {
            // Insert sale record
            await supabase.from("sales").insert({
                machine_id: machineId,
                inventory_id: item.inventoryId,
                item_name: item.name,
                quantity: item.qty,
                total_price: item.total,
                payment_method: "card",
            });

            // Decrement stock count
            const { data: current } = await supabase
                .from("inventory")
                .select("stock_count")
                .eq("id", item.inventoryId)
                .single();

            if (current) {
                await supabase
                    .from("inventory")
                    .update({
                        stock_count: Math.max(0, current.stock_count - item.qty),
                    } as Record<string, unknown>)
                    .eq("id", item.inventoryId);
            }
        }

        // Attempt smart lock unlock (non-blocking if not configured)
        const lockResult = await unlockMachine(machineId);

        // Log door access if unlocked
        if (lockResult.unlocked) {
            await supabase.from("door_access_logs").insert({
                machine_id: machineId,
                payment_intent_id: paymentIntentId,
                trigger: "purchase" as const,
            });
        }

        return NextResponse.json({
            success: true,
            orderId: paymentIntentId,
            contact,
            lock: {
                unlocked: lockResult.unlocked,
                expiresAt: lockResult.expiresAt,
                error: lockResult.error,
            },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Confirm failed";
        console.error("Confirm error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
