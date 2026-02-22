"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface RestockActionsProps {
    itemId: string;
    currentStock: number;
}

export default function RestockActions({ itemId, currentStock }: RestockActionsProps) {
    const [loading, setLoading] = useState(false);
    const [restockAmount, setRestockAmount] = useState(10);
    const [done, setDone] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    async function handleRestock() {
        setLoading(true);
        const newCount = currentStock + restockAmount;
        await supabase.from("inventory").update({ stock_count: newCount } as any).eq("id", itemId);
        setDone(true);
        setLoading(false);
        router.refresh();
    }

    if (done) {
        return (
            <span style={{ fontSize: 13, color: "var(--accent-emerald)", fontWeight: 600 }}>
                ✓ Restocked
            </span>
        );
    }

    return (
        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
            <select
                className="input-dark"
                style={{ width: 70, padding: "6px 8px", fontSize: 13 }}
                value={restockAmount}
                onChange={(e) => setRestockAmount(parseInt(e.target.value))}
            >
                <option value={5}>+5</option>
                <option value={10}>+10</option>
                <option value={20}>+20</option>
                <option value={50}>+50</option>
            </select>
            <button
                className="btn-primary"
                style={{ padding: "6px 12px", fontSize: 12 }}
                onClick={handleRestock}
                disabled={loading}
            >
                <Plus size={14} /> {loading ? "..." : "Restock"}
            </button>
        </div>
    );
}
