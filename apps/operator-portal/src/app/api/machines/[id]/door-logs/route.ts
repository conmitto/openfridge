import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: machineId } = await params;
        const supabase = await createClient();

        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

        const { data, error } = await supabase
            .from("door_access_logs")
            .select("*")
            .eq("machine_id", machineId)
            .order("opened_at", { ascending: false })
            .limit(limit);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ logs: data ?? [] });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch door logs";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
