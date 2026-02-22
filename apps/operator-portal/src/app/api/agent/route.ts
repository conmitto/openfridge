import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Machine, Inventory, Sale } from "@/lib/supabase/types";

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();
        const supabase = await createClient();

        // Get context about the user's machines and inventory
        const { data: machines } = await supabase.from("machines").select("*") as { data: Machine[] | null };
        const { data: inventory } = await supabase.from("inventory").select("*") as { data: Inventory[] | null };
        const { data: recentSales } = await supabase
            .from("sales")
            .select("*")
            .order("sold_at", { ascending: false })
            .limit(20) as { data: Sale[] | null };

        // Build context summary
        const machineCount = machines?.length ?? 0;
        const activeMachines = machines?.filter((m) => m.status === "active").length ?? 0;
        const lowStock = inventory?.filter((i) => i.stock_count <= 3) ?? [];
        const outOfStock = inventory?.filter((i) => i.stock_count === 0) ?? [];
        const totalItems = inventory?.length ?? 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySales = recentSales?.filter((s) => new Date(s.sold_at) >= today) ?? [];
        const todayRevenue = todaySales.reduce((s, r) => s + Number(r.total_price), 0);

        const topItems = recentSales?.reduce((acc, s) => {
            acc[s.item_name] = (acc[s.item_name] || 0) + s.quantity;
            return acc;
        }, {} as Record<string, number>);
        const bestSeller = topItems ? Object.entries(topItems).sort((a, b) => b[1] - a[1])[0] : null;

        // For now, generate a smart contextual reply without OpenAI
        const reply = generateReply(message, {
            machineCount,
            activeMachines,
            lowStock: lowStock.map((i) => `${i.item_name} (${i.stock_count} left)`),
            outOfStock: outOfStock.map((i) => i.item_name),
            totalItems,
            todayRevenue,
            todaySalesCount: todaySales.length,
            bestSeller: bestSeller ? `${bestSeller[0]} (${bestSeller[1]} sold)` : "none",
            machines: machines?.map((m) => `${m.name} [${m.status}] @ ${m.location}`) ?? [],
        });

        return NextResponse.json({ reply });
    } catch (err) {
        console.error("Agent error:", err);
        return NextResponse.json(
            { reply: "I'm having trouble processing that. Please try again." },
            { status: 500 }
        );
    }
}

interface Context {
    machineCount: number;
    activeMachines: number;
    lowStock: string[];
    outOfStock: string[];
    totalItems: number;
    todayRevenue: number;
    todaySalesCount: number;
    bestSeller: string;
    machines: string[];
}

function generateReply(message: string, ctx: Context): string {
    const msg = message.toLowerCase();

    if (msg.includes("revenue") || msg.includes("sales") || msg.includes("money")) {
        return `📊 **Today's Revenue**: $${ctx.todayRevenue.toFixed(2)} from ${ctx.todaySalesCount} sale${ctx.todaySalesCount !== 1 ? "s" : ""}.\n\nYour best seller recently is: ${ctx.bestSeller}.`;
    }

    if (msg.includes("low stock") || msg.includes("restock") || msg.includes("running low")) {
        if (ctx.lowStock.length === 0) {
            return "✅ All items are well-stocked! Nothing needs restocking right now.";
        }
        return `⚠️ **${ctx.lowStock.length} item${ctx.lowStock.length > 1 ? "s" : ""} running low**:\n\n${ctx.lowStock.map((i) => `• ${i}`).join("\n")}${ctx.outOfStock.length > 0 ? `\n\n🔴 **Out of stock**: ${ctx.outOfStock.join(", ")}` : ""}`;
    }

    if (msg.includes("machine") || msg.includes("kiosk") || msg.includes("status")) {
        return `🏪 **${ctx.machineCount} machine${ctx.machineCount !== 1 ? "s" : ""}** total, **${ctx.activeMachines} active**.\n\n${ctx.machines.map((m) => `• ${m}`).join("\n")}`;
    }

    if (msg.includes("best sell") || msg.includes("popular") || msg.includes("top")) {
        return `🏆 **Best seller**: ${ctx.bestSeller}\n\nThis is based on recent sales across all your kiosks.`;
    }

    if (msg.includes("inventory") || msg.includes("items") || msg.includes("products")) {
        return `📦 **${ctx.totalItems} items** across ${ctx.machineCount} machine${ctx.machineCount !== 1 ? "s" : ""}.\n\n${ctx.lowStock.length > 0 ? `⚠️ ${ctx.lowStock.length} item${ctx.lowStock.length > 1 ? "s" : ""} need restocking.` : "✅ All items well-stocked!"}`;
    }

    if (msg.includes("help") || msg.includes("what can")) {
        return `🤖 I can help you with:\n\n• **Revenue** — "What's my revenue today?"\n• **Stock levels** — "Show low stock items"\n• **Machines** — "What's the status of my kiosks?"\n• **Best sellers** — "What's my best-selling item?"\n• **Inventory** — "How many items do I have?"\n\nJust ask in natural language!`;
    }

    // Default
    return `Here's a quick overview:\n\n🏪 ${ctx.activeMachines}/${ctx.machineCount} machines active\n📦 ${ctx.totalItems} inventory items\n💰 $${ctx.todayRevenue.toFixed(2)} revenue today\n${ctx.lowStock.length > 0 ? `⚠️ ${ctx.lowStock.length} low stock alert${ctx.lowStock.length > 1 ? "s" : ""}` : "✅ All items stocked"}\n\nAsk me about revenue, stock, machines, or best sellers!`;
}
