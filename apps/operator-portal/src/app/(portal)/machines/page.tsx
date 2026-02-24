import { createClient } from "@/lib/supabase/server";
import MachinesClient from "@/components/MachinesClient";
import type { Machine } from "@/lib/supabase/types";

export default async function MachinesPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? "";

    const { data: machines } = await supabase
        .from("machines")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

    const machineIds = ((machines ?? []) as Machine[]).map((m) => m.id);

    // Get inventory counts per machine (only for user's machines)
    const { data: inventory } = await supabase.from("inventory").select("machine_id").in("machine_id", machineIds.length > 0 ? machineIds : ["none"]);

    const countMap = new Map<string, number>();
    ((inventory ?? []) as { machine_id: string }[]).forEach((item) => {
        countMap.set(item.machine_id, (countMap.get(item.machine_id) ?? 0) + 1);
    });

    const machinesWithCounts = ((machines ?? []) as Machine[]).map((m) => ({
        ...m,
        inventory_count: countMap.get(m.id) ?? 0,
    }));

    return <MachinesClient initialMachines={machinesWithCounts} />;
}

