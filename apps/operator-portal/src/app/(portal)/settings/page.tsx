"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
    Key, Plus, Trash2, Eye, EyeOff, Bot,
    Loader2, CheckCircle2, AlertCircle, Shield,
} from "lucide-react";

interface StoredKey {
    id: string;
    provider: "openai" | "anthropic";
    api_key: string;
    created_at: string;
}

export default function SettingsPage() {
    const [keys, setKeys] = useState<StoredKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [provider, setProvider] = useState<"openai" | "anthropic">("openai");
    const [apiKey, setApiKey] = useState("");
    const [revealedId, setRevealedId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => { loadKeys(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    async function loadKeys() {
        setLoading(true);
        const res = await fetch("/api/settings/api-keys");
        const data = await res.json();
        setKeys(data.keys ?? []);
        setLoading(false);
    }

    async function handleSave() {
        if (!apiKey.trim()) return;
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch("/api/settings/api-keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider, api_key: apiKey }),
            });
            const data = await res.json();
            if (!res.ok) {
                setMessage({ type: "error", text: data.error ?? "Failed to save key" });
            } else {
                setMessage({ type: "success", text: `${provider === "openai" ? "OpenAI" : "Anthropic"} key saved successfully` });
                setApiKey("");
                setShowAdd(false);
                loadKeys();
            }
        } catch {
            setMessage({ type: "error", text: "Network error" });
        }
        setSaving(false);
    }

    async function handleDelete(id: string) {
        await fetch("/api/settings/api-keys", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setKeys(keys.filter((k) => k.id !== id));
        setMessage({ type: "success", text: "Key deleted" });
    }

    function maskKey(key: string): string {
        if (key.length <= 8) return "••••••••";
        return key.slice(0, 4) + "•".repeat(Math.min(key.length - 8, 24)) + key.slice(-4);
    }

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700 }}>Settings</h1>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
                    Manage your account and API keys
                </p>
            </div>

            {/* API Keys Section */}
            <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Shield size={20} color="var(--accent-blue)" />
                        <h3 style={{ fontSize: 18, fontWeight: 600 }}>AI Provider Keys</h3>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => setShowAdd(!showAdd)}
                        style={{ padding: "8px 16px", fontSize: 13 }}
                    >
                        <Plus size={16} /> Add Key
                    </button>
                </div>

                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>
                    Add your OpenAI or Anthropic API key to power the Agent chat with real AI responses.
                    Your key is stored securely and only used for your account.
                </p>

                {/* Feedback message */}
                {message && (
                    <div style={{
                        padding: "10px 14px", borderRadius: 12, marginBottom: 16,
                        display: "flex", alignItems: "center", gap: 8,
                        background: message.type === "success" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                        border: `1px solid ${message.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)"}`,
                        color: message.type === "success" ? "#10b981" : "#ef4444",
                        fontSize: 13, fontWeight: 500,
                    }}>
                        {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {message.text}
                    </div>
                )}

                {/* Add Key Form */}
                {showAdd && (
                    <div style={{
                        padding: 20, borderRadius: 16,
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border-subtle)",
                        marginBottom: 20,
                    }}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
                                Provider
                            </label>
                            <div style={{ display: "flex", gap: 8 }}>
                                {(["openai", "anthropic"] as const).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setProvider(p)}
                                        style={{
                                            padding: "10px 20px", borderRadius: 12,
                                            fontSize: 13, fontWeight: 600, cursor: "pointer",
                                            background: provider === p ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)",
                                            border: provider === p ? "1px solid rgba(59,130,246,0.3)" : "1px solid var(--border-subtle)",
                                            color: provider === p ? "var(--accent-blue)" : "var(--text-secondary)",
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        {p === "openai" ? "OpenAI" : "Anthropic (Claude)"}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                                API Key
                            </label>
                            <input
                                className="input-dark"
                                type="password"
                                placeholder={provider === "openai" ? "sk-..." : "sk-ant-..."}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                style={{ fontFamily: "monospace" }}
                            />
                        </div>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button className="btn-secondary" onClick={() => { setShowAdd(false); setApiKey(""); }}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleSave} disabled={saving || !apiKey.trim()}>
                                {saving ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving...</> : "Save Key"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Keys List */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                        <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                    </div>
                ) : keys.length === 0 ? (
                    <div style={{
                        textAlign: "center", padding: "32px 20px",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: 16, border: "1px solid var(--border-subtle)",
                    }}>
                        <Bot size={32} style={{ opacity: 0.2, marginBottom: 10 }} />
                        <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>
                            No API keys configured
                        </p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", opacity: 0.6, marginTop: 4 }}>
                            Add an OpenAI or Anthropic key to enable AI-powered Agent chat
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {keys.map((key) => (
                            <div key={key.id} style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "14px 16px", borderRadius: 14,
                                background: "rgba(255,255,255,0.02)",
                                border: "1px solid var(--border-subtle)",
                            }}>
                                <Key size={16} color="var(--text-muted)" />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                                        {key.provider === "openai" ? "OpenAI" : "Anthropic"}
                                    </div>
                                    <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace", marginTop: 2 }}>
                                        {revealedId === key.id ? key.api_key : maskKey(key.api_key)}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setRevealedId(revealedId === key.id ? null : key.id)}
                                    style={{
                                        background: "none", border: "none", cursor: "pointer",
                                        color: "var(--text-muted)", padding: 6,
                                    }}
                                >
                                    {revealedId === key.id ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <button
                                    onClick={() => handleDelete(key.id)}
                                    className="btn-danger"
                                    style={{ padding: "6px 10px" }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
