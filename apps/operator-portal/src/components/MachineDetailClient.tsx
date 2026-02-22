"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import Link from "next/link";
import type { Machine, Inventory } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/utils";

interface MachineDetailClientProps {
    machine: Machine;
    inventory: Inventory[];
}

export default function MachineDetailClient({ machine, inventory: initialInventory }: MachineDetailClientProps) {
    const [inventory, setInventory] = useState(initialInventory);
    const [showAdd, setShowAdd] = useState(false);
    const [itemName, setItemName] = useState("");
    const [price, setPrice] = useState("");
    const [stockCount, setStockCount] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editStock, setEditStock] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const router = useRouter();
    const supabase = createClient();

    async function handleAddItem(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase
            .from("inventory")
            .insert({
                machine_id: machine.id,
                item_name: itemName,
                price: parseFloat(price),
                stock_count: parseInt(stockCount) || 0,
            } as any)
            .select()
            .single();

        if (!error && data) {
            setInventory([...inventory, data as Inventory]);
            setShowAdd(false);
            setItemName("");
            setPrice("");
            setStockCount("");
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        await supabase.from("inventory").delete().eq("id", id);
        setInventory(inventory.filter((i) => i.id !== id));
    }

    async function handleSaveEdit(id: string) {
        const updates: { stock_count?: number; price?: number } = {};
        if (editStock) updates.stock_count = parseInt(editStock);
        if (editPrice) updates.price = parseFloat(editPrice);

        await supabase.from("inventory").update(updates as any).eq("id", id);

        setInventory(
            inventory.map((i) =>
                i.id === id ? { ...i, ...updates } : i
            )
        );
        setEditingId(null);
    }

    function startEdit(item: Inventory) {
        setEditingId(item.id);
        setEditStock(String(item.stock_count));
        setEditPrice(String(item.price));
    }

    const statusColors: Record<string, string> = {
        active: "badge-active",
        inactive: "badge-inactive",
        maintenance: "badge-maintenance",
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <Link
                    href="/machines"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        color: "var(--text-muted)",
                        fontSize: 13,
                        textDecoration: "none",
                        marginBottom: 16,
                    }}
                >
                    <ArrowLeft size={16} /> Back to Machines
                </Link>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 700 }}>{machine.name}</h1>
                        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
                            {machine.location} · <span className={`badge ${statusColors[machine.status]}`}>{machine.status}</span>
                        </p>
                    </div>
                    <button className="btn-primary" onClick={() => setShowAdd(true)}>
                        <Plus size={18} /> Add Item
                    </button>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                    Inventory ({inventory.length} items)
                </h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.map((item) => (
                            <tr key={item.id}>
                                <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                                    {item.item_name}
                                </td>
                                <td>
                                    {editingId === item.id ? (
                                        <input
                                            className="input-dark"
                                            style={{ width: 80, padding: "6px 8px", fontSize: 13 }}
                                            value={editPrice}
                                            onChange={(e) => setEditPrice(e.target.value)}
                                            type="number"
                                            step="0.01"
                                        />
                                    ) : (
                                        formatCurrency(Number(item.price))
                                    )}
                                </td>
                                <td>
                                    {editingId === item.id ? (
                                        <input
                                            className="input-dark"
                                            style={{ width: 60, padding: "6px 8px", fontSize: 13 }}
                                            value={editStock}
                                            onChange={(e) => setEditStock(e.target.value)}
                                            type="number"
                                        />
                                    ) : (
                                        item.stock_count
                                    )}
                                </td>
                                <td>
                                    {item.stock_count === 0 ? (
                                        <span className="badge badge-low-stock">Out of Stock</span>
                                    ) : item.stock_count <= 5 ? (
                                        <span className="badge badge-maintenance">Low Stock</span>
                                    ) : (
                                        <span className="badge badge-active">In Stock</span>
                                    )}
                                </td>
                                <td style={{ textAlign: "right" }}>
                                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                        {editingId === item.id ? (
                                            <button
                                                className="btn-primary"
                                                style={{ padding: "6px 12px", fontSize: 12 }}
                                                onClick={() => handleSaveEdit(item.id)}
                                            >
                                                <Save size={14} /> Save
                                            </button>
                                        ) : (
                                            <button
                                                className="btn-secondary"
                                                style={{ padding: "6px 12px", fontSize: 12 }}
                                                onClick={() => startEdit(item)}
                                            >
                                                Edit
                                            </button>
                                        )}
                                        <button
                                            className="btn-danger"
                                            style={{ padding: "6px 10px" }}
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {inventory.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                                    No inventory items. Click &quot;Add Item&quot; to stock this machine.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Item Modal */}
            {showAdd && (
                <div className="modal-overlay" onClick={() => setShowAdd(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Add Inventory Item</h2>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
                            Add a new item to {machine.name}
                        </p>
                        <form onSubmit={handleAddItem}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                                    Item Name
                                </label>
                                <input
                                    className="input-dark"
                                    placeholder="e.g. Organic Cold Brew"
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    required
                                />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                                        Price ($)
                                    </label>
                                    <input
                                        className="input-dark"
                                        type="number"
                                        step="0.01"
                                        placeholder="4.99"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                                        Stock Count
                                    </label>
                                    <input
                                        className="input-dark"
                                        type="number"
                                        placeholder="10"
                                        value={stockCount}
                                        onChange={(e) => setStockCount(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? "Adding..." : "Add Item"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
