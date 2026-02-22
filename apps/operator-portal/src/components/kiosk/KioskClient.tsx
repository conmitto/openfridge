"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Machine, Inventory } from "@/lib/supabase/types";
import {
    ShoppingCart, Plus, Minus, Trash2, CreditCard,
    Bitcoin, Check, ArrowLeft, Mail, User,
    Loader2, Phone, Receipt, Lock, Unlock, AlertCircle,
} from "lucide-react";
import dynamic from "next/dynamic";
import StripeProvider from "./StripeProvider";
import PaymentForm from "./PaymentForm";

// Lazy-load webcam and idle screen to avoid SSR issues
const WebcamFeed = dynamic(() => import("./WebcamFeed"), { ssr: false });
const IdleScreen = dynamic(() => import("./IdleScreen"), { ssr: false });

// ─── Types ─────────────────────────────────────────────
interface CartItem {
    inventory: Inventory;
    quantity: number;
}

type CheckoutStep = "idle" | "browse" | "payment" | "contact" | "receipt";

// ─── Component ─────────────────────────────────────────
export default function KioskClient({
    machine,
    inventory,
}: {
    machine: Machine;
    inventory: Inventory[];
}) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [step, setStep] = useState<CheckoutStep>("idle");
    const [loaded, setLoaded] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
    const [contact, setContact] = useState({ name: "", email: "", phone: "" });
    const [confirming, setConfirming] = useState(false);
    const [confirmError, setConfirmError] = useState<string | null>(null);
    const [lockStatus, setLockStatus] = useState<{
        unlocked: boolean;
        expiresAt: string | null;
    } | null>(null);
    const [receiptCountdown, setReceiptCountdown] = useState(15);
    const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Simulate load delay for hydration
    useEffect(() => {
        const t = setTimeout(() => setLoaded(true), 300);
        return () => clearTimeout(t);
    }, []);

    // Inactivity timer — return to idle after 90s of browse with empty cart
    useEffect(() => {
        if (step === "browse" && cart.length === 0) {
            inactivityTimerRef.current = setTimeout(() => {
                setStep("idle");
            }, 90000);
        }
        return () => {
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        };
    }, [step, cart.length]);

    // ─── Cart Logic ────────────────────────────────────
    const addToCart = useCallback((item: Inventory) => {
        setCart((prev) => {
            const existing = prev.find((c) => c.inventory.id === item.id);
            if (existing) {
                if (existing.quantity >= item.stock_count) return prev;
                return prev.map((c) =>
                    c.inventory.id === item.id
                        ? { ...c, quantity: c.quantity + 1 }
                        : c
                );
            }
            return [...prev, { inventory: item, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((itemId: string) => {
        setCart((prev) => prev.filter((c) => c.inventory.id !== itemId));
    }, []);

    const updateQuantity = useCallback((itemId: string, delta: number) => {
        setCart((prev) =>
            prev
                .map((c) => {
                    if (c.inventory.id !== itemId) return c;
                    const newQty = c.quantity + delta;
                    if (newQty <= 0) return null;
                    if (newQty > c.inventory.stock_count) return c;
                    return { ...c, quantity: newQty };
                })
                .filter(Boolean) as CartItem[]
        );
    }, []);

    const cartTotal = cart.reduce(
        (sum, c) => sum + Number(c.inventory.price) * c.quantity, 0
    );
    const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

    // ─── Payment Flow ──────────────────────────────────
    const startStripeCheckout = async () => {
        try {
            const res = await fetch("/api/checkout/stripe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: cartTotal,
                    machineId: machine.id,
                    items: cart.map((c) => ({
                        name: c.inventory.item_name,
                        qty: c.quantity,
                    })),
                }),
            });
            const data = await res.json();
            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
                setPaymentIntentId(data.paymentIntentId);
                setStep("payment");
            }
        } catch (err) {
            console.error("Stripe init failed:", err);
        }
    };

    const startCoinbaseCheckout = async () => {
        try {
            const res = await fetch("/api/checkout/coinbase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: cartTotal,
                    machineId: machine.id,
                    items: cart.map((c) => ({
                        name: c.inventory.item_name,
                        qty: c.quantity,
                    })),
                    contact,
                }),
            });
            const data = await res.json();
            if (data.hostedUrl) {
                window.open(data.hostedUrl, "_blank");
            }
        } catch (err) {
            console.error("Coinbase init failed:", err);
        }
    };

    const handlePaymentSuccess = (piId: string) => {
        setPaymentIntentId(piId);
        setStep("contact");
    };

    const handleContactSubmit = async () => {
        setConfirming(true);
        setConfirmError(null);
        try {
            const res = await fetch("/api/checkout/stripe/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paymentIntentId,
                    contact,
                    machineId: machine.id,
                    items: cart.map((c) => ({
                        inventoryId: c.inventory.id,
                        name: c.inventory.item_name,
                        qty: c.quantity,
                        total: Number(c.inventory.price) * c.quantity,
                    })),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setConfirmError(data.error || "Order confirmation failed");
                setConfirming(false);
                return;
            }
            // Capture lock status
            if (data.lock) {
                setLockStatus({
                    unlocked: data.lock.unlocked,
                    expiresAt: data.lock.expiresAt,
                });
            }
        } catch (err) {
            console.error("Confirm error:", err);
            setConfirmError("Network error — please try again");
            setConfirming(false);
            return;
        }
        setConfirming(false);
        setReceiptCountdown(15);
        setStep("receipt");
    };

    const resetOrder = useCallback(() => {
        setCart([]);
        setStep("idle");
        setClientSecret(null);
        setPaymentIntentId(null);
        setContact({ name: "", email: "", phone: "" });
        setConfirmError(null);
        setLockStatus(null);
        setReceiptCountdown(15);
    }, []);

    // Auto-return to idle from receipt
    useEffect(() => {
        if (step !== "receipt") return;
        const interval = setInterval(() => {
            setReceiptCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    resetOrder();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [step, resetOrder]);

    const handleActivate = useCallback(() => {
        setStep("browse");
    }, []);

    // ─── Idle Screen ───────────────────────────────────
    if (step === "idle") {
        return <IdleScreen machine={machine} onActivate={handleActivate} />;
    }

    // ─── Receipt Screen ────────────────────────────────
    if (step === "receipt") {
        return (
            <div style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
                animation: "fadeIn 0.5s ease",
                padding: 40,
            }}>
                <div style={{
                    width: 90, height: 90, borderRadius: "50%",
                    background: "linear-gradient(135deg, #10b981, #06b6d4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 0 60px rgba(16,185,129,0.4)",
                    animation: "pulse 1.5s ease-in-out infinite",
                }}>
                    <Check size={44} color="white" strokeWidth={3} />
                </div>
                <h1 style={{
                    fontSize: 32, fontWeight: 800,
                    background: "linear-gradient(135deg, #10b981, #06b6d4)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                    Order Complete!
                </h1>

                {/* Lock status */}
                {lockStatus?.unlocked && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 10,
                        background: "rgba(16,185,129,0.1)",
                        border: "1px solid rgba(16,185,129,0.3)",
                        borderRadius: 12, padding: "12px 20px",
                        animation: "fadeIn 0.5s ease 0.3s both",
                    }}>
                        <Unlock size={20} color="#10b981" />
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#10b981" }}>
                                Fridge Unlocked
                            </div>
                            <div style={{ fontSize: 12, color: "#6ee7b7" }}>
                                Open the door within 30 seconds
                            </div>
                        </div>
                    </div>
                )}

                {/* Receipt card */}
                <div style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16, padding: "20px 28px",
                    minWidth: 320, maxWidth: 400,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                        <Receipt size={16} color="#64748b" />
                        <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>Receipt</span>
                    </div>
                    {cart.map((c) => (
                        <div key={c.inventory.id} style={{
                            display: "flex", justifyContent: "space-between",
                            padding: "6px 0", fontSize: 14, color: "#cbd5e1",
                        }}>
                            <span>{c.quantity}× {c.inventory.item_name}</span>
                            <span>${(Number(c.inventory.price) * c.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div style={{
                        borderTop: "1px solid rgba(255,255,255,0.08)",
                        marginTop: 12, paddingTop: 12,
                        display: "flex", justifyContent: "space-between",
                        fontSize: 18, fontWeight: 800, color: "#f1f5f9",
                    }}>
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    {contact.name && (
                        <div style={{ marginTop: 12, fontSize: 12, color: "#64748b" }}>
                            {contact.name} {contact.email && `· ${contact.email}`}
                        </div>
                    )}
                </div>

                <p style={{ fontSize: 14, color: "#94a3b8" }}>
                    Thank you for your purchase. Enjoy!
                </p>

                {/* Countdown + New Order */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <button
                        onClick={resetOrder}
                        style={{
                            padding: "10px 28px", borderRadius: 12,
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(255,255,255,0.05)",
                            color: "#94a3b8", fontSize: 14, fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        New Order
                    </button>
                    <span style={{ fontSize: 11, color: "#475569" }}>
                        Returning home in {receiptCountdown}s
                    </span>
                </div>

                <style>{`
                    @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
                `}</style>
            </div>
        );
    }

    // ─── Main Layout ───────────────────────────────────
    return (
        <div style={{
            height: "100vh", display: "flex", overflow: "hidden",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.4s ease",
        }}>
            {/* ─── Left: Product Grid + Webcam ─── */}
            <div style={{
                flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
            }}>
                {/* Header */}
                <div style={{
                    padding: "20px 28px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 16,
                            }}>❄️</div>
                            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>
                                {machine.name}
                            </h1>
                        </div>
                        <p style={{ fontSize: 12, color: "#64748b", paddingLeft: 46 }}>
                            {machine.location}
                        </p>
                    </div>
                    <div style={{
                        padding: "6px 14px", borderRadius: 16,
                        background: "rgba(16,185,129,0.12)",
                        color: "#10b981", fontSize: 12, fontWeight: 600,
                    }}>
                        {inventory.length} items
                    </div>
                </div>

                {/* Content area: Grid + Webcam */}
                <div style={{ flex: 1, overflow: "auto", padding: "20px 28px" }}>
                    {/* Product Grid */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                        gap: 14,
                    }}>
                        {inventory.map((item) => {
                            const inCart = cart.find((c) => c.inventory.id === item.id);
                            const isMaxed = inCart && inCart.quantity >= item.stock_count;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => addToCart(item)}
                                    disabled={!!isMaxed || step !== "browse"}
                                    style={{
                                        background: inCart
                                            ? "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.1))"
                                            : "rgba(255,255,255,0.03)",
                                        border: inCart
                                            ? "1px solid rgba(59,130,246,0.3)"
                                            : "1px solid rgba(255,255,255,0.06)",
                                        borderRadius: 14, padding: 16,
                                        cursor: isMaxed || step !== "browse" ? "not-allowed" : "pointer",
                                        textAlign: "left", transition: "all 0.2s ease",
                                        position: "relative",
                                        opacity: isMaxed ? 0.5 : 1,
                                        color: "inherit",
                                    }}
                                >
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 12,
                                        background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 24, marginBottom: 10,
                                    }}>
                                        {getItemEmoji(item.item_name)}
                                    </div>
                                    <h3 style={{
                                        fontSize: 14, fontWeight: 600, color: "#f1f5f9",
                                        marginBottom: 4, lineHeight: 1.3,
                                    }}>
                                        {item.item_name}
                                    </h3>
                                    <div style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                    }}>
                                        <span style={{
                                            fontSize: 18, fontWeight: 800,
                                            background: "linear-gradient(135deg, #10b981, #06b6d4)",
                                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                        }}>
                                            ${Number(item.price).toFixed(2)}
                                        </span>
                                        <span style={{
                                            fontSize: 10,
                                            color: item.stock_count <= 3 ? "#f59e0b" : "#64748b",
                                            fontWeight: 500,
                                        }}>
                                            {item.stock_count} left
                                        </span>
                                    </div>
                                    {inCart && (
                                        <div style={{
                                            position: "absolute", top: 8, right: 8,
                                            width: 24, height: 24, borderRadius: "50%",
                                            background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 11, fontWeight: 800, color: "white",
                                            boxShadow: "0 2px 10px rgba(59,130,246,0.4)",
                                        }}>
                                            {inCart.quantity}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Webcam — fixed square in bottom-left corner */}
                <div style={{
                    position: "fixed",
                    bottom: 20,
                    left: 20,
                    width: 200,
                    height: 200,
                    borderRadius: 14,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    zIndex: 10,
                }}>
                    <WebcamFeed />
                </div>
            </div>

            {/* ─── Right: Cart / Payment / Contact Panel ─── */}
            {/* Hidden when cart is empty and browsing */}
            <div style={{
                width: (step === "browse" && cart.length === 0) ? 0 : 360,
                minWidth: (step === "browse" && cart.length === 0) ? 0 : 360,
                borderLeft: (step === "browse" && cart.length === 0) ? "none" : "1px solid rgba(255,255,255,0.06)",
                display: "flex", flexDirection: "column",
                background: "rgba(0,0,0,0.2)",
                overflow: "hidden",
                opacity: (step === "browse" && cart.length === 0) ? 0 : 1,
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}>
                {/* Panel Header */}
                <div style={{
                    padding: "20px 22px 14px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    whiteSpace: "nowrap",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {step !== "browse" && (
                            <button
                                onClick={() => {
                                    if (step === "payment") setStep("browse");
                                    else if (step === "contact") setStep("browse");
                                }}
                                style={{
                                    background: "none", border: "none",
                                    color: "#64748b", cursor: "pointer", padding: 2,
                                }}
                            >
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <ShoppingCart size={18} color="#3b82f6" />
                        <h2 style={{ fontSize: 16, fontWeight: 700 }}>
                            {step === "browse" && "Your Cart"}
                            {step === "payment" && "Payment"}
                            {step === "contact" && "Contact Info"}
                        </h2>
                        {cartCount > 0 && step === "browse" && (
                            <span style={{
                                marginLeft: "auto",
                                background: "rgba(59,130,246,0.15)",
                                color: "#3b82f6", padding: "2px 8px",
                                borderRadius: 10, fontSize: 11, fontWeight: 700,
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </div>
                </div>

                {/* Panel Content */}
                <div style={{ flex: 1, overflow: "auto", padding: "10px 22px" }}>
                    {/* ── Browse: Cart Items ── */}
                    {step === "browse" && cart.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {cart.map((c) => (
                                <div key={c.inventory.id} style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: "10px 12px",
                                    background: "rgba(255,255,255,0.03)",
                                    borderRadius: 10,
                                    border: "1px solid rgba(255,255,255,0.05)",
                                }}>
                                    <div style={{
                                        width: 34, height: 34, borderRadius: 8,
                                        background: "rgba(59,130,246,0.1)",
                                        display: "flex", alignItems: "center",
                                        justifyContent: "center", fontSize: 18, flexShrink: 0,
                                    }}>
                                        {getItemEmoji(c.inventory.item_name)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: 12, fontWeight: 600, color: "#e2e8f0",
                                            whiteSpace: "nowrap", overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}>
                                            {c.inventory.item_name}
                                        </div>
                                        <div style={{ fontSize: 11, color: "#64748b" }}>
                                            ${Number(c.inventory.price).toFixed(2)} ea
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <button onClick={() => updateQuantity(c.inventory.id, -1)} style={qtyBtnStyle}>
                                            <Minus size={12} />
                                        </button>
                                        <span style={{
                                            width: 20, textAlign: "center",
                                            fontSize: 13, fontWeight: 700, color: "#f1f5f9",
                                        }}>
                                            {c.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(c.inventory.id, 1)}
                                            disabled={c.quantity >= c.inventory.stock_count}
                                            style={{
                                                ...qtyBtnStyle,
                                                background: "rgba(59,130,246,0.15)",
                                                color: "#3b82f6",
                                                opacity: c.quantity >= c.inventory.stock_count ? 0.4 : 1,
                                            }}
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                    <button onClick={() => removeFromCart(c.inventory.id)} style={{
                                        background: "none", border: "none",
                                        color: "#475569", cursor: "pointer", padding: 3,
                                    }}>
                                        <Trash2 size={13} />
                                    </button>
                                    <div style={{
                                        fontSize: 13, fontWeight: 700, color: "#f1f5f9",
                                        minWidth: 45, textAlign: "right",
                                    }}>
                                        ${(Number(c.inventory.price) * c.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Payment Step ── */}
                    {step === "payment" && clientSecret && (
                        <div style={{ paddingTop: 8 }}>
                            <div style={{
                                marginBottom: 16, padding: "12px 16px",
                                background: "rgba(59,130,246,0.08)",
                                border: "1px solid rgba(59,130,246,0.15)",
                                borderRadius: 12,
                            }}>
                                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Amount due</div>
                                <div style={{
                                    fontSize: 28, fontWeight: 800,
                                    background: "linear-gradient(135deg, #10b981, #06b6d4)",
                                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                }}>
                                    ${cartTotal.toFixed(2)}
                                </div>
                            </div>

                            <StripeProvider clientSecret={clientSecret}>
                                <PaymentForm total={cartTotal} onSuccess={handlePaymentSuccess} />
                            </StripeProvider>

                            <div style={{
                                textAlign: "center", marginTop: 16,
                                padding: "12px 0",
                                borderTop: "1px solid rgba(255,255,255,0.06)",
                            }}>
                                <span style={{ fontSize: 12, color: "#475569", display: "block", marginBottom: 10 }}>
                                    or pay with cryptocurrency
                                </span>
                                <button
                                    onClick={startCoinbaseCheckout}
                                    style={{
                                        width: "100%", padding: "12px 16px",
                                        borderRadius: 12,
                                        border: "1px solid rgba(245,158,11,0.3)",
                                        background: "rgba(245,158,11,0.08)",
                                        color: "#fbbf24", fontSize: 14, fontWeight: 600,
                                        cursor: "pointer", display: "flex",
                                        alignItems: "center", justifyContent: "center", gap: 8,
                                    }}
                                >
                                    <Bitcoin size={18} />
                                    Pay with Crypto (Coinbase)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Contact Step ── */}
                    {step === "contact" && (
                        <div style={{ paddingTop: 8 }}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: 8,
                                marginBottom: 16, color: "#10b981",
                            }}>
                                <Check size={18} />
                                <span style={{ fontSize: 14, fontWeight: 600 }}>Payment successful!</span>
                            </div>
                            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
                                Enter your contact info for the receipt (optional).
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <div style={{ position: "relative" }}>
                                    <User size={16} style={{
                                        position: "absolute", left: 12, top: 13, color: "#64748b",
                                    }} />
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={contact.name}
                                        onChange={(e) => setContact({ ...contact, name: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={{ position: "relative" }}>
                                    <Mail size={16} style={{
                                        position: "absolute", left: 12, top: 13, color: "#64748b",
                                    }} />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={contact.email}
                                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={{ position: "relative" }}>
                                    <Phone size={16} style={{
                                        position: "absolute", left: 12, top: 13, color: "#64748b",
                                    }} />
                                    <input
                                        type="tel"
                                        placeholder="Phone"
                                        value={contact.phone}
                                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleContactSubmit}
                                disabled={confirming}
                                style={{
                                    width: "100%", marginTop: 20,
                                    padding: "14px 0", borderRadius: 14,
                                    border: "none",
                                    background: confirming
                                        ? "rgba(16,185,129,0.3)"
                                        : "linear-gradient(135deg, #10b981, #06b6d4)",
                                    color: "white", fontSize: 15, fontWeight: 700,
                                    cursor: confirming ? "wait" : "pointer",
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center", gap: 8,
                                }}
                            >
                                {confirming ? (
                                    <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Confirming...</>
                                ) : (
                                    "Complete Order"
                                )}
                            </button>

                            <button
                                onClick={() => { handleContactSubmit(); }}
                                style={{
                                    width: "100%", marginTop: 8, padding: "10px 0",
                                    background: "none", border: "none",
                                    color: "#64748b", fontSize: 12, fontWeight: 500,
                                    cursor: "pointer",
                                }}
                            >
                                Skip — no receipt
                            </button>
                        </div>
                    )}
                </div>

                {/* Cart Footer (browse step only) */}
                {step === "browse" && cart.length > 0 && (
                    <div style={{
                        padding: "18px 22px",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        background: "rgba(0,0,0,0.15)",
                    }}>
                        <div style={{
                            display: "flex", justifyContent: "space-between",
                            marginBottom: 14, alignItems: "baseline",
                        }}>
                            <span style={{ fontSize: 13, color: "#94a3b8" }}>Total</span>
                            <span style={{
                                fontSize: 22, fontWeight: 800,
                                background: "linear-gradient(135deg, #10b981, #06b6d4)",
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                            }}>
                                ${cartTotal.toFixed(2)}
                            </span>
                        </div>

                        <button
                            onClick={startStripeCheckout}
                            style={{
                                width: "100%", padding: "13px 0",
                                borderRadius: 14, border: "none",
                                background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                                color: "white", fontSize: 15, fontWeight: 700,
                                cursor: "pointer", display: "flex",
                                alignItems: "center", justifyContent: "center", gap: 8,
                            }}
                        >
                            <CreditCard size={17} />
                            Checkout · ${cartTotal.toFixed(2)}
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                button:hover:not(:disabled) { transform: translateY(-1px); }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 3px; }
            `}</style>
        </div >
    );
}

// ─── Helpers ───────────────────────────────────────────
const qtyBtnStyle: React.CSSProperties = {
    width: 26, height: 26, borderRadius: 7,
    background: "rgba(255,255,255,0.06)",
    border: "none", color: "#94a3b8",
    display: "flex", alignItems: "center",
    justifyContent: "center", cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 12px 12px 38px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#e2e8f0", fontSize: 14,
    outline: "none",
};

function getItemEmoji(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes("coffee") || lower.includes("brew")) return "☕";
    if (lower.includes("lemonade") || lower.includes("lemon")) return "🍋";
    if (lower.includes("protein") || lower.includes("bar")) return "🍫";
    if (lower.includes("smoothie")) return "🥤";
    if (lower.includes("wrap") || lower.includes("sandwich")) return "🌯";
    if (lower.includes("water") || lower.includes("coconut")) return "🥥";
    if (lower.includes("juice")) return "🧃";
    if (lower.includes("soda") || lower.includes("cola")) return "🥤";
    if (lower.includes("tea")) return "🍵";
    if (lower.includes("salad")) return "🥗";
    if (lower.includes("cookie")) return "🍪";
    if (lower.includes("fruit")) return "🍎";
    return "🛒";
}
