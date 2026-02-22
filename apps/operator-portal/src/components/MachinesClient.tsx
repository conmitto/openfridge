"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, MapPin, Trash2, ExternalLink } from "lucide-react";
import type { Machine } from "@/lib/supabase/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface MachinesClientProps {
    initialMachines: (Machine & { inventory_count: number })[];
}

export default function MachinesClient({ initialMachines }: MachinesClientProps) {
    const [machines, setMachines] = useState(initialMachines);
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase
            .from("machines")
            .insert({ name, location, status: "active" })
            .select()
            .single();

        if (!error && data) {
            setMachines([...machines, { ...(data as Machine), inventory_count: 0 }]);
            setShowModal(false);
            setName("");
            setLocation("");
            router.refresh();
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this machine and all its inventory?")) return;
        await supabase.from("machines").delete().eq("id", id);
        setMachines(machines.filter((m) => m.id !== id));
        router.refresh();
    }

    const statusColors: Record<string, string> = {
        active: "badge-active",
        inactive: "badge-inactive",
        maintenance: "badge-maintenance",
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }} className="page-header">
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700 }}>Machines</h1>
                    <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
                        Manage your vending kiosks
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Add Machine
                </button>
            </div>

            {/* Machine Grid */}
            <div className="machine-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                {machines.map((machine) => (
                    <Link
                        key={machine.id}
                        href={`/machines/${machine.id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        <div className="glass-card" style={{ padding: 24, cursor: "pointer" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                <div>
                                    <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                                        {machine.name}
                                    </h3>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13 }}>
                                        <MapPin size={14} />
                                        {machine.location}
                                    </div>
                                </div>
                                <span className={`badge ${statusColors[machine.status]}`}>
                                    {machine.status}
                                </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                                    <span style={{ fontWeight: 600, color: "var(--accent-cyan)", fontSize: 20 }}>
                                        {machine.inventory_count}
                                    </span>{" "}
                                    items in stock
                                </div>
                                <div style={{ display: "flex", gap: 6 }}>
                                    <a
                                        href={`/kiosk/${machine.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="btn-secondary"
                                        style={{ padding: "6px 10px", fontSize: 12 }}
                                    >
                                        <ExternalLink size={14} />
                                        Kiosk
                                    </a>
                                    <button
                                        className="btn-danger"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDelete(machine.id);
                                        }}
                                        style={{ padding: "6px 10px" }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}

                {machines.length === 0 && (
                    <div
                        className="glass-card"
                        style={{
                            padding: 60,
                            textAlign: "center",
                            color: "var(--text-muted)",
                            gridColumn: "1 / -1",
                        }}
                    >
                        <p style={{ fontSize: 16, marginBottom: 8 }}>No machines yet</p>
                        <p style={{ fontSize: 13 }}>Click &quot;Add Machine&quot; to create your first kiosk</p>
                    </div>
                )}
            </div>

            {/* Create Machine Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
                            Create Machine
                        </h2>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
                            Register a new vending kiosk
                        </p>
                        <form onSubmit={handleCreate}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                                    Machine Name
                                </label>
                                <input
                                    className="input-dark"
                                    placeholder="e.g. HQ Lobby Fridge"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                                    Location
                                </label>
                                <input
                                    className="input-dark"
                                    placeholder="e.g. 123 Main St, Lobby"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    required
                                />
                            </div>
                            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? "Creating..." : "Create Machine"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
