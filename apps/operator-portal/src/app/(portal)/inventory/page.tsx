"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera, Plus, Upload, ExternalLink } from "lucide-react";
import CameraCapture from "@/components/CameraCapture";
import type { Machine, Inventory } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/utils";

const AMAZON_AFFILIATE_TAG = "openfridge-20";

function ensureAffiliateTag(url: string): string {
    if (!url) return url;
    try {
        const u = new URL(url);
        if (u.hostname.includes("amazon")) {
            u.searchParams.set("tag", AMAZON_AFFILIATE_TAG);
            return u.toString();
        }
    } catch { /* not a valid URL, return as-is */ }
    return url;
}

export default function InventoryPage() {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [selectedMachine, setSelectedMachine] = useState<string>("");
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [showCamera, setShowCamera] = useState(false);
    const [showManual, setShowManual] = useState(false);
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
    const [itemName, setItemName] = useState("");
    const [price, setPrice] = useState("");
    const [purchasePrice, setPurchasePrice] = useState("");
    const [stockCount, setStockCount] = useState("");
    const [reorderUrl, setReorderUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id ?? "";
            const { data } = await supabase.from("machines").select("*").eq("owner_id", userId).order("name");
            setMachines((data ?? []) as Machine[]);
            if (data && data.length > 0) {
                setSelectedMachine((data[0] as Machine).id);
            }
        }
        load();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!selectedMachine) return;
        async function loadInventory() {
            const { data } = await supabase
                .from("inventory")
                .select("*")
                .eq("machine_id", selectedMachine)
                .order("created_at", { ascending: false });
            setInventory((data ?? []) as Inventory[]);
        }
        loadInventory();
    }, [selectedMachine]); // eslint-disable-line react-hooks/exhaustive-deps

    function handleCapture(blob: Blob) {
        setCapturedBlob(blob);
        setCapturedPreview(URL.createObjectURL(blob));
        setShowCamera(false);
        setShowManual(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedMachine) return;
        setLoading(true);

        let imageUrl: string | null = null;

        // Upload image if captured
        if (capturedBlob) {
            const fileName = `${selectedMachine}/${Date.now()}.jpg`;
            const { data: uploadData } = await supabase.storage
                .from("inventory-images")
                .upload(fileName, capturedBlob, { contentType: "image/jpeg" });

            if (uploadData) {
                const { data: urlData } = supabase.storage
                    .from("inventory-images")
                    .getPublicUrl(fileName);
                imageUrl = urlData.publicUrl;
            }
        }

        const finalReorderUrl = reorderUrl ? ensureAffiliateTag(reorderUrl) : null;

        const { data, error } = await supabase
            .from("inventory")
            .insert({
                machine_id: selectedMachine,
                item_name: itemName,
                price: parseFloat(price),
                purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
                stock_count: parseInt(stockCount) || 0,
                image_url: imageUrl,
                reorder_url: finalReorderUrl,
            } as any)
            .select()
            .single();

        if (!error && data) {
            setInventory([data as Inventory, ...inventory]);
            resetForm();
        }
        setLoading(false);
    }

    function resetForm() {
        setShowManual(false);
        setShowCamera(false);
        setCapturedBlob(null);
        setCapturedPreview(null);
        setItemName("");
        setPrice("");
        setPurchasePrice("");
        setStockCount("");
        setReorderUrl("");
    }

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700 }}>Inventory</h1>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
                    Snap a photo or manually log inventory items
                </p>
            </div>

            {/* Machine Selector */}
            <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                    Select Machine
                </label>
                <select
                    className="input-dark"
                    style={{ maxWidth: 400 }}
                    value={selectedMachine}
                    onChange={(e) => setSelectedMachine(e.target.value)}
                >
                    {machines.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.name} — {m.location}
                        </option>
                    ))}
                </select>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
                <button
                    className="btn-primary"
                    onClick={() => {
                        setShowCamera(true);
                        setShowManual(false);
                    }}
                >
                    <Camera size={18} /> Capture with Camera
                </button>
                <button
                    className="btn-secondary"
                    onClick={() => {
                        setShowManual(true);
                        setShowCamera(false);
                    }}
                >
                    <Plus size={18} /> Manual Entry
                </button>
            </div>

            {/* Camera */}
            {showCamera && (
                <div style={{ maxWidth: 500, marginBottom: 24 }}>
                    <CameraCapture
                        onCapture={handleCapture}
                        onClose={() => setShowCamera(false)}
                    />
                </div>
            )}

            {/* Add Item Form */}
            {showManual && (
                <div className="glass-card" style={{ padding: 24, maxWidth: 500, marginBottom: 32 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                        {capturedPreview ? "Log Captured Item" : "Add Item Manually"}
                    </h3>

                    {capturedPreview && (
                        <div style={{ marginBottom: 16, borderRadius: 10, overflow: "hidden" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={capturedPreview}
                                alt="Captured item"
                                style={{ width: "100%", height: 200, objectFit: "cover" }}
                            />
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
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
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                                    Sell Price ($)
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
                                    Cost / Purchase Price ($)
                                </label>
                                <input
                                    className="input-dark"
                                    type="number"
                                    step="0.01"
                                    placeholder="2.50"
                                    value={purchasePrice}
                                    onChange={(e) => setPurchasePrice(e.target.value)}
                                />
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
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
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                                    Reorder / Amazon Link
                                </label>
                                <input
                                    className="input-dark"
                                    type="url"
                                    placeholder="https://amazon.com/dp/..."
                                    value={reorderUrl}
                                    onChange={(e) => setReorderUrl(e.target.value)}
                                />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                            <button type="button" className="btn-secondary" onClick={resetForm}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                <Upload size={16} />
                                {loading ? "Saving..." : "Save Item"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Current Inventory Table */}
            <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                    Current Inventory ({inventory.length} items)
                </h3>
                <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Sell Price</th>
                                <th>Cost</th>
                                <th>Margin</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Reorder</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map((item) => {
                                const margin = item.purchase_price
                                    ? ((Number(item.price) - Number(item.purchase_price)) / Number(item.price) * 100).toFixed(0)
                                    : null;
                                return (
                                    <tr key={item.id}>
                                        <td style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-primary)", fontWeight: 500 }}>
                                            {item.image_url && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={item.image_url}
                                                    alt={item.item_name}
                                                    style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }}
                                                />
                                            )}
                                            {item.item_name}
                                        </td>
                                        <td>{formatCurrency(Number(item.price))}</td>
                                        <td style={{ color: item.purchase_price ? "var(--text-secondary)" : "var(--text-muted)" }}>
                                            {item.purchase_price ? formatCurrency(Number(item.purchase_price)) : "—"}
                                        </td>
                                        <td>
                                            {margin ? (
                                                <span style={{
                                                    color: Number(margin) > 50 ? "var(--accent-emerald)" : Number(margin) > 20 ? "var(--accent-amber)" : "var(--accent-rose)",
                                                    fontWeight: 600, fontSize: 13,
                                                }}>
                                                    {margin}%
                                                </span>
                                            ) : (
                                                <span style={{ color: "var(--text-muted)" }}>—</span>
                                            )}
                                        </td>
                                        <td>{item.stock_count}</td>
                                        <td>
                                            {item.stock_count === 0 ? (
                                                <span className="badge badge-low-stock">Out of Stock</span>
                                            ) : item.stock_count <= 5 ? (
                                                <span className="badge badge-maintenance">Low Stock</span>
                                            ) : (
                                                <span className="badge badge-active">In Stock</span>
                                            )}
                                        </td>
                                        <td>
                                            {item.reorder_url ? (
                                                <a
                                                    href={ensureAffiliateTag(item.reorder_url)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: "inline-flex", alignItems: "center", gap: 4,
                                                        padding: "5px 10px", borderRadius: 8,
                                                        background: "rgba(245,158,11,0.1)",
                                                        border: "1px solid rgba(245,158,11,0.2)",
                                                        color: "#f59e0b",
                                                        fontSize: 12, fontWeight: 600,
                                                        textDecoration: "none",
                                                        transition: "all 0.2s ease",
                                                    }}
                                                >
                                                    <ExternalLink size={12} />
                                                    {item.reorder_url.includes("amazon") ? "Amazon" : "Reorder"}
                                                </a>
                                            ) : (
                                                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {inventory.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                                        No items in this machine yet
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
