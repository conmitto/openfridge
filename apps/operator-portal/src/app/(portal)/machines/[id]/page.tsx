import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import MachineDetailClient from "@/components/MachineDetailClient";
import type { Machine, Inventory } from "@/lib/supabase/types";

export default async function MachineDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: machine } = await supabase
        .from("machines")
        .select("*")
        .eq("id", id)
        .single();

    if (!machine) notFound();

    const { data: inventory } = await supabase
        .from("inventory")
        .select("*")
        .eq("machine_id", id)
        .order("created_at", { ascending: true });

    return (
        <MachineDetailClient machine={machine as Machine} inventory={(inventory ?? []) as Inventory[]} />
    );
}

