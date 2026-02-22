import { createClient } from "@/lib/supabase/server";
import { DollarSign, ShoppingCart, Server, AlertTriangle } from "lucide-react";
import StatCard from "@/components/StatCard";
import RevenueChart from "@/components/RevenueChart";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Sale, Machine, Inventory } from "@/lib/supabase/types";

export default async function DashboardPage() {
    const supabase = await createClient();

    // Fetch stats in parallel
    const [salesRes, machinesRes, lowStockRes] = await Promise.all([
        supabase.from("sales").select("*").order("sold_at", { ascending: false }),
        supabase.from("machines").select("*").eq("status", "active"),
        supabase.from("inventory").select("*").lte("stock_count", 5),
    ]);

    const sales = (salesRes.data ?? []) as Sale[];
    const machines = (machinesRes.data ?? []) as Machine[];
    const lowStock = (lowStockRes.data ?? []) as Inventory[];

    const totalRevenue = sales.reduce((sum: number, s) => sum + Number(s.total_price), 0);
    const todaySales = sales.filter(
        (s) => new Date(s.sold_at).toDateString() === new Date().toDateString()
    );
    const todayRevenue = todaySales.reduce((sum: number, s) => sum + Number(s.total_price), 0);

    // Build chart data: aggregate sales by date (last 30 days)
    const chartMap = new Map<string, { revenue: number; count: number }>();
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        chartMap.set(key, { revenue: 0, count: 0 });
    }
    sales.forEach((s) => {
        const key = new Date(s.sold_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const existing = chartMap.get(key);
        if (existing) {
            existing.revenue += Number(s.total_price);
            existing.count += s.quantity;
        }
    });
    const chartData = Array.from(chartMap.entries()).map(([date, vals]) => ({
        date,
        revenue: Math.round(vals.revenue * 100) / 100,
        count: vals.count,
    }));

    return (
        <div>
            <div className="page-header" style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700 }}>Dashboard</h1>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
                    Overview of your vending operations
                </p>
            </div>

            {/* Stat Cards */}
            <div
                className="stat-grid"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 20,
                    marginBottom: 32,
                }}
            >
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(totalRevenue)}
                    subtitle="All time"
                    icon={DollarSign}
                    color="#10b981"
                />
                <StatCard
                    title="Today's Sales"
                    value={formatCurrency(todayRevenue)}
                    subtitle={`${todaySales.length} transactions`}
                    icon={ShoppingCart}
                    color="#3b82f6"
                />
                <StatCard
                    title="Active Machines"
                    value={String(machines.length)}
                    subtitle="Online now"
                    icon={Server}
                    color="#06b6d4"
                />
                <StatCard
                    title="Low Stock Items"
                    value={String(lowStock.length)}
                    subtitle="Need restocking"
                    icon={AlertTriangle}
                    color="#f43f5e"
                />
            </div>

            {/* Revenue Chart */}
            <div style={{ marginBottom: 32 }}>
                <RevenueChart data={chartData} />
            </div>

            {/* Recent Transactions */}
            <div className="data-table-wrap">
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                        Recent Transactions
                    </h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Amount</th>
                                <th>Payment</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.slice(0, 10).map((sale) => (
                                <tr key={sale.id}>
                                    <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                                        {sale.item_name}
                                    </td>
                                    <td>{sale.quantity}</td>
                                    <td style={{ color: "var(--accent-emerald)" }}>
                                        {formatCurrency(Number(sale.total_price))}
                                    </td>
                                    <td>
                                        <span
                                            className="badge"
                                            style={{
                                                background:
                                                    sale.payment_method === "apple_pay"
                                                        ? "rgba(59,130,246,0.15)"
                                                        : sale.payment_method === "crypto"
                                                            ? "rgba(245,158,11,0.15)"
                                                            : "rgba(16,185,129,0.15)",
                                                color:
                                                    sale.payment_method === "apple_pay"
                                                        ? "var(--accent-blue)"
                                                        : sale.payment_method === "crypto"
                                                            ? "var(--accent-amber)"
                                                            : "var(--accent-emerald)",
                                            }}
                                        >
                                            {sale.payment_method === "apple_pay"
                                                ? "Apple Pay"
                                                : sale.payment_method === "crypto"
                                                    ? "Crypto"
                                                    : "Card"}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 13 }}>{formatDateTime(sale.sold_at)}</td>
                                </tr>
                            ))}
                            {sales.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                                        No transactions yet. Connect your Supabase to see data.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
