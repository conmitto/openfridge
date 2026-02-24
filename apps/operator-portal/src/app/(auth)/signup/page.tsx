"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Mail, Lock, User, Loader2, Snowflake, ArrowRight } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
                emailRedirectTo: "https://open-fridge.com/auth/callback",
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        // Create profile row
        if (data.user) {
            await supabase.from("profiles").upsert({
                id: data.user.id,
                full_name: fullName,
                onboarded: false,
            });
        }

        router.push("/dashboard");
        router.refresh();
    };

    return (
        <div style={{
            width: "100%", maxWidth: 420,
            animation: "fadeUp 0.5s ease both",
        }}>
            {/* Logo */}
            <div style={{
                display: "flex", alignItems: "center", gap: 12,
                justifyContent: "center", marginBottom: 40,
            }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 16,
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
                }}>
                    <Snowflake size={24} color="white" />
                </div>
                <span style={{
                    fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em",
                    background: "linear-gradient(135deg, #f1f5f9, #94a3b8)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                    OpenFridge
                </span>
            </div>

            {/* Card */}
            <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 24, padding: "36px 32px",
                backdropFilter: "blur(20px)",
            }}>
                <h1 style={{
                    fontSize: 22, fontWeight: 700, color: "#f1f5f9",
                    marginBottom: 6, letterSpacing: "-0.02em",
                }}>
                    Create your account
                </h1>
                <p style={{ fontSize: 14, color: "#4b5563", marginBottom: 28 }}>
                    Start managing autonomous vending kiosks
                </p>

                <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ position: "relative" }}>
                        <User size={16} style={{ position: "absolute", left: 14, top: 15, color: "#4b5563" }} />
                        <input
                            type="text"
                            placeholder="Full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ position: "relative" }}>
                        <Mail size={16} style={{ position: "absolute", left: 14, top: 15, color: "#4b5563" }} />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ position: "relative" }}>
                        <Lock size={16} style={{ position: "absolute", left: 14, top: 15, color: "#4b5563" }} />
                        <input
                            type="password"
                            placeholder="Password (min 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            style={inputStyle}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: "10px 14px", borderRadius: 12,
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.15)",
                            color: "#f87171", fontSize: 13, fontWeight: 500,
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%", padding: "14px 0",
                            borderRadius: 14, border: "none",
                            background: loading
                                ? "rgba(16,185,129,0.2)"
                                : "linear-gradient(135deg, #10b981, #06b6d4)",
                            color: "white", fontSize: 15, fontWeight: 700,
                            cursor: loading ? "wait" : "pointer",
                            display: "flex", alignItems: "center",
                            justifyContent: "center", gap: 8,
                            boxShadow: loading ? "none" : "0 6px 25px rgba(16,185,129,0.3)",
                            transition: "all 0.3s ease",
                            marginTop: 4,
                        }}
                    >
                        {loading ? (
                            <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Creating account...</>
                        ) : (
                            <>Create Account <ArrowRight size={16} /></>
                        )}
                    </button>
                </form>
            </div>

            {/* Footer */}
            <p style={{
                textAlign: "center", marginTop: 24,
                fontSize: 14, color: "#4b5563",
            }}>
                Already have an account?{" "}
                <Link href="/login" style={{
                    color: "#10b981", fontWeight: 600,
                    textDecoration: "none",
                }}>
                    Sign in
                </Link>
            </p>

            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 14px 14px 42px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e2e8f0", fontSize: 15,
    outline: "none",
    transition: "border-color 0.2s ease",
};
