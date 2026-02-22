"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
    Bot,
    Send,
    AlertTriangle,
    Package,
    TrendingUp,
    RefreshCw,
    Loader2,
    Sparkles,
    ChevronDown,
} from "lucide-react";

interface AlertCard {
    type: "low_stock" | "machine_issue" | "daily_summary";
    title: string;
    message: string;
    severity: "critical" | "warning" | "info";
    data?: Record<string, unknown>;
}

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export default function AgentPage() {
    const [alerts, setAlerts] = useState<AlertCard[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showAlerts, setShowAlerts] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Load alerts on mount
    useEffect(() => {
        loadAlerts();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const loadAlerts = async () => {
        setLoading(true);
        const newAlerts: AlertCard[] = [];

        // Low stock alerts
        const { data: inventory } = await supabase
            .from("inventory")
            .select("*, machines(name)")
            .lte("stock_count", 3)
            .order("stock_count", { ascending: true });

        if (inventory?.length) {
            const items = inventory.map((i) => {
                const machineName = Array.isArray(i.machines)
                    ? i.machines[0]?.name
                    : (i.machines as { name: string } | null)?.name ?? "Unknown";
                return `${i.item_name} (${i.stock_count} left) — ${machineName}`;
            });
            newAlerts.push({
                type: "low_stock",
                title: `${inventory.length} Low Stock Item${inventory.length > 1 ? "s" : ""}`,
                message: items.join("\n"),
                severity: inventory.some((i) => i.stock_count === 0) ? "critical" : "warning",
            });
        }

        // Machine issues
        const { data: machines } = await supabase
            .from("machines")
            .select("name, status, location")
            .neq("status", "active");

        if (machines?.length) {
            newAlerts.push({
                type: "machine_issue",
                title: `${machines.length} Machine${machines.length > 1 ? "s" : ""} Need Attention`,
                message: machines
                    .map((m) => `${m.name} — ${m.status} (${m.location})`)
                    .join("\n"),
                severity: "warning",
            });
        }

        // Daily summary
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { data: todaySales } = await supabase
            .from("sales")
            .select("total_price, quantity")
            .gte("sold_at", today.toISOString());

        const totalRevenue = todaySales?.reduce((s, r) => s + Number(r.total_price), 0) ?? 0;
        const totalItems = todaySales?.reduce((s, r) => s + r.quantity, 0) ?? 0;

        newAlerts.push({
            type: "daily_summary",
            title: "Today's Summary",
            message: `${totalItems} item${totalItems !== 1 ? "s" : ""} sold · $${totalRevenue.toFixed(2)} revenue`,
            severity: "info",
        });

        setAlerts(newAlerts);
        setLoading(false);
    };

    const handleSend = async () => {
        if (!input.trim() || sending) return;
        const userMsg = input.trim();
        setInput("");
        setMessages((m) => [...m, { role: "user", content: userMsg, timestamp: new Date() }]);
        setSending(true);

        try {
            const res = await fetch("/api/agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg }),
            });
            const data = await res.json();
            setMessages((m) => [
                ...m,
                { role: "assistant", content: data.reply || "I couldn't process that request.", timestamp: new Date() },
            ]);
        } catch {
            setMessages((m) => [
                ...m,
                { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again.", timestamp: new Date() },
            ]);
        }

        setSending(false);
    };

    const alertIcon = (type: string) => {
        switch (type) {
            case "low_stock": return <Package size={20} />;
            case "machine_issue": return <AlertTriangle size={20} />;
            case "daily_summary": return <TrendingUp size={20} />;
            default: return <Bot size={20} />;
        }
    };

    const alertColors = (severity: string) => {
        switch (severity) {
            case "critical": return { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.15)", accent: "#ef4444" };
            case "warning": return { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)", accent: "#f59e0b" };
            default: return { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.15)", accent: "#3b82f6" };
        }
    };

    return (
        <div style={{
            height: "calc(100vh - 56px)",
            display: "flex", flexDirection: "column",
            maxWidth: 800, margin: "0 auto", padding: "0 20px",
        }}>
            {/* Header */}
            <div style={{
                padding: "28px 0 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 14,
                        background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(249,115,22,0.15))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <Bot size={22} color="#f59e0b" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>Agent</h1>
                        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                            Insights and assistance for your kiosks
                        </p>
                    </div>
                </div>
                <button
                    onClick={loadAlerts}
                    style={{
                        background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                        borderRadius: 10, padding: 10, cursor: "pointer",
                        color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6,
                        fontSize: 13, fontWeight: 500,
                    }}
                >
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: "auto", paddingBottom: 20 }}>
                {/* Alert Cards */}
                {alerts.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <button
                            onClick={() => setShowAlerts(!showAlerts)}
                            style={{
                                background: "none", border: "none", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 8,
                                color: "var(--text-muted)", fontSize: 12, fontWeight: 600,
                                textTransform: "uppercase", letterSpacing: 1,
                                marginBottom: 12, padding: 0,
                            }}
                        >
                            <Sparkles size={14} color="#f59e0b" />
                            Active Alerts ({alerts.length})
                            <ChevronDown size={14} style={{
                                transform: showAlerts ? "rotate(0)" : "rotate(-90deg)",
                                transition: "transform 0.2s ease",
                            }} />
                        </button>

                        {showAlerts && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {loading ? (
                                    <div style={{
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        padding: 40, color: "var(--text-muted)",
                                    }}>
                                        <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                                    </div>
                                ) : (
                                    alerts.map((alert, i) => {
                                        const c = alertColors(alert.severity);
                                        return (
                                            <div key={i} className="glass-card" style={{
                                                display: "flex", gap: 14,
                                                padding: 18,
                                                background: c.bg,
                                                border: `1px solid ${c.border}`,
                                                animation: `fadeUp 0.3s ease ${i * 0.08}s both`,
                                            }}>
                                                <div style={{ color: c.accent, marginTop: 2, flexShrink: 0 }}>
                                                    {alertIcon(alert.type)}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{
                                                        fontSize: 14, fontWeight: 700,
                                                        color: c.accent, marginBottom: 4,
                                                    }}>
                                                        {alert.title}
                                                    </div>
                                                    <div style={{
                                                        fontSize: 13, color: "var(--text-muted)",
                                                        lineHeight: 1.6, whiteSpace: "pre-line",
                                                    }}>
                                                        {alert.message}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Chat messages */}
                {messages.length === 0 && !loading && (
                    <div style={{
                        textAlign: "center", padding: "40px 0",
                        color: "var(--text-muted)", fontSize: 14,
                    }}>
                        <Bot size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
                        <p style={{ fontWeight: 600, marginBottom: 4 }}>Ask me anything about your kiosks</p>
                        <p style={{ fontSize: 13, opacity: 0.7 }}>
                            Try &quot;What&apos;s my best-selling item?&quot; or &quot;Show low stock items&quot;
                        </p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                            marginBottom: 14,
                            animation: "fadeUp 0.2s ease both",
                        }}
                    >
                        <div style={{
                            maxWidth: "80%",
                            padding: "14px 18px",
                            borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                            background: msg.role === "user"
                                ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                                : "var(--bg-secondary)",
                            border: msg.role === "user"
                                ? "none"
                                : "1px solid var(--border-subtle)",
                            color: msg.role === "user" ? "white" : "var(--text-primary)",
                            fontSize: 14,
                            lineHeight: 1.6,
                            whiteSpace: "pre-wrap",
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {sending && (
                    <div style={{
                        display: "flex", gap: 6, padding: "12px 18px",
                        color: "var(--text-muted)", fontSize: 13,
                    }}>
                        <div style={{
                            width: 8, height: 8, borderRadius: 4,
                            background: "var(--text-muted)", opacity: 0.5,
                            animation: "pulse-dot 1s ease-in-out infinite",
                        }} />
                        <div style={{
                            width: 8, height: 8, borderRadius: 4,
                            background: "var(--text-muted)", opacity: 0.5,
                            animation: "pulse-dot 1s ease-in-out 0.2s infinite",
                        }} />
                        <div style={{
                            width: 8, height: 8, borderRadius: 4,
                            background: "var(--text-muted)", opacity: 0.5,
                            animation: "pulse-dot 1s ease-in-out 0.4s infinite",
                        }} />
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input bar */}
            <div style={{
                padding: "16px 0 24px",
                borderTop: "1px solid var(--border-subtle)",
            }}>
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    style={{
                        display: "flex", gap: 10,
                    }}
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about inventory, revenue, machine status..."
                        style={{
                            flex: 1,
                            padding: "14px 18px",
                            borderRadius: 14,
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-primary)",
                            fontSize: 14,
                            outline: "none",
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || sending}
                        style={{
                            width: 48, height: 48, borderRadius: 14,
                            background: input.trim()
                                ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                                : "var(--bg-secondary)",
                            border: input.trim() ? "none" : "1px solid var(--border-subtle)",
                            color: "white",
                            cursor: input.trim() ? "pointer" : "default",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.2s ease",
                            boxShadow: input.trim() ? "0 4px 15px rgba(59,130,246,0.3)" : "none",
                        }}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>

            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse-dot { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
            `}</style>
        </div>
    );
}
