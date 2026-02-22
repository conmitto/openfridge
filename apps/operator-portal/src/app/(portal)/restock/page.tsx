import { createClient } from "@/lib/supabase/server";
import { AlertTriangle, Package, ArrowUpCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import RestockActions from "@/components/RestockActions";
import type { Inventory } from "@/lib/supabase/types";

interface LowStockItem extends Inventory {
    machines: { name: string; location: string } | null;
}

export default async function RestockPage() {
    const supabase = await createClient();

    // Get all inventory with low stock (≤ 5), joined with machine names
    const { data: rawItems } = await supabase
        .from("inventory")
        .select("*, machines(name, location)")
        .lte("stock_count", 5)
        .order("stock_count", { ascending: true });

    const lowStockItems = (rawItems ?? []) as unknown as LowStockItem[];

    // Group by machine
    const grouped = new Map<string, { machine: { name: string; location: string }; items: LowStockItem[] }>();

    lowStockItems.forEach((item) => {
        const machineInfo = item.machines;
        const machineName = machineInfo?.name ?? "Unknown Machine";
        if (!grouped.has(item.machine_id)) {
            grouped.set(item.machine_id, {
                machine: { name: machineName, location: machineInfo?.location ?? "" },
                items: [],
            });
        }
        grouped.get(item.machine_id)!.items.push(item);
    });

    const totalLow = lowStockItems.length;
    const outOfStock = lowStockItems.filter((i) => i.stock_count === 0).length;

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700 }}>Restock Report</h1>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
                    Items that need restocking (stock ≤ 5)
                </p>
            </div>

            {/* Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
                <div className="glass-card stat-card" style={{ padding: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8 }}>
                                Low Stock Items
                            </div>
                            <div style={{ fontSize: 32, fontWeight: 700, color: "var(--accent-amber)" }}>
                                {totalLow}
                            </div>
                        </div>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <AlertTriangle size={22} color="var(--accent-amber)" />
                        </div>
                    </div>
                </div>

                <div className="glass-card stat-card" style={{ padding: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8 }}>
                                Out of Stock
                            </div>
                            <div style={{ fontSize: 32, fontWeight: 700, color: "var(--accent-rose)" }}>
                                {outOfStock}
                            </div>
                        </div>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(244,63,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Package size={22} color="var(--accent-rose)" />
                        </div>
                    </div>
                </div>

                <div className="glass-card stat-card" style={{ padding: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8 }}>
                                Machines Affected
                            </div>
                            <div style={{ fontSize: 32, fontWeight: 700, color: "var(--accent-cyan)" }}>
                                {grouped.size}
                            </div>
                        </div>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(6,182,212,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ArrowUpCircle size={22} color="var(--accent-cyan)" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Grouped Reports */}
            {Array.from(grouped.entries()).map(([machineId, { machine, items }]) => (
                <div key={machineId} className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
                    <div style={{ marginBottom: 16 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>
                            {machine.name}
                        </h3>
                        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{machine.location}</p>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Price</th>
                                <th>Current Stock</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" }}>Quick Restock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(items ?? []).map((item) => (
                                <tr key={item.id}>
                                    <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                                        {item.item_name}
                                    </td>
                                    <td>{formatCurrency(Number(item.price))}</td>
                                    <td>
                                        <span style={{
                                            fontWeight: 700,
                                            color: item.stock_count === 0 ? "var(--accent-rose)" : "var(--accent-amber)",
                                            fontSize: 16,
                                        }}>
                                            {item.stock_count}
                                        </span>
                                    </td>
                                    <td>
                                        {item.stock_count === 0 ? (
                                            <span className="badge badge-low-stock">OUT OF STOCK</span>
                                        ) : (
                                            <span className="badge badge-maintenance">LOW</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <RestockActions itemId={item.id} currentStock={item.stock_count} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}

            {totalLow === 0 && (
                <div
                    className="glass-card"
                    style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}
                >
                    <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                    <p style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                        All stocked up!
                    </p>
                    <p style={{ fontSize: 14 }}>No items need restocking right now.</p>
                </div>
            )}
        </div>
    );
}
