import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data, error } = await supabase
            .from("api_keys")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ keys: data ?? [] });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch keys";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { provider, api_key } = await req.json();

        if (!provider || !api_key) {
            return NextResponse.json({ error: "Missing provider or api_key" }, { status: 400 });
        }

        if (!["openai", "anthropic"].includes(provider)) {
            return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
        }

        // Upsert — one key per provider per user
        const { data, error } = await supabase
            .from("api_keys")
            .upsert(
                { user_id: user.id, provider, api_key } as any,
                { onConflict: "user_id,provider" }
            )
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ key: data });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to save key";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await req.json();

        // Double-check ownership
        const { error } = await supabase
            .from("api_keys")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete key";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
