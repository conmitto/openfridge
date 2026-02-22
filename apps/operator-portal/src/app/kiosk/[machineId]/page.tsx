import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Machine, Inventory } from "@/lib/supabase/types";
import KioskClient from "@/components/kiosk/KioskClient";

export default async function KioskPage({
    params,
}: {
    params: Promise<{ machineId: string }>;
}) {
    const { machineId } = await params;
    const supabase = await createClient();

    const { data: machine } = await supabase
        .from("machines")
        .select("*")
        .eq("id", machineId)
        .single();

    if (!machine) notFound();

    const { data: inventory } = await supabase
        .from("inventory")
        .select("*")
        .eq("machine_id", machineId)
        .gt("stock_count", 0)
        .order("item_name");

    return (
        <KioskClient
            machine={machine as Machine}
            inventory={(inventory ?? []) as Inventory[]}
        />
    );
}
