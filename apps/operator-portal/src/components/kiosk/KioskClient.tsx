"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Machine, Inventory } from "@/lib/supabase/types";
import {
    ShoppingCart, Plus, Minus, Trash2, CreditCard,
    Bitcoin, Check, ArrowLeft, Mail, User,
    Loader2, Phone, Receipt, Lock, Unlock, AlertCircle, Info, X,
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
    const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
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
            transition: "opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            background: "linear-gradient(160deg, #070b14 0%, #0c1425 50%, #0a101f 100%)",
        }}>
            {/* ─── Left: Product Grid + Webcam ─── */}
            <div style={{
                flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
            }}>
                {/* Header */}
                <div style={{
                    padding: "24px 32px 20px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "rgba(0,0,0,0.2)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 14,
                            background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 20, boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
                        }}>❄️</div>
                        <div>
                            <h1 style={{
                                fontSize: 24, fontWeight: 800,
                                letterSpacing: "-0.03em",
                                background: "linear-gradient(135deg, #f1f5f9, #cbd5e1)",
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                            }}>
                                {machine.name}
                            </h1>
                            <p style={{ fontSize: 13, color: "#4b5563", marginTop: 1, letterSpacing: "0.02em" }}>
                                {machine.location}
                            </p>
                        </div>
                    </div>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "8px 18px", borderRadius: 28,
                        background: "rgba(16,185,129,0.08)",
                        border: "1px solid rgba(16,185,129,0.15)",
                    }}>
                        <div style={{
                            width: 7, height: 7, borderRadius: "50%",
                            background: "#10b981",
                            boxShadow: "0 0 8px rgba(16,185,129,0.6)",
                            animation: "pulse-dot 2s ease-in-out infinite",
                        }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#10b981" }}>
                            {inventory.length} items available
                        </span>
                    </div>
                </div>

                {/* Content area: Grid */}
                <div style={{
                    flex: 1, overflow: "auto", padding: "24px 32px 120px",
                }}>
                    {/* Greeting */}
                    <p style={{
                        fontSize: 15, color: "#475569", marginBottom: 20,
                        fontWeight: 500,
                    }}>
                        Tap an item to add it to your cart
                    </p>

                    {/* Product Grid — optimized for iPad landscape */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: 18,
                    }}>
                        {inventory.map((item, index) => {
                            const inCart = cart.find((c) => c.inventory.id === item.id);
                            const isMaxed = inCart && inCart.quantity >= item.stock_count;
                            const isOutOfStock = item.stock_count === 0;

                            return (
                                <div key={item.id} style={{ position: "relative" }}>
                                    <button
                                        onClick={() => addToCart(item)}
                                        disabled={!!isMaxed || isOutOfStock || step !== "browse"}
                                        style={{
                                            width: "100%",
                                            background: inCart
                                                ? "linear-gradient(145deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))"
                                                : "rgba(255,255,255,0.02)",
                                            border: inCart
                                                ? "1px solid rgba(59,130,246,0.25)"
                                                : "1px solid rgba(255,255,255,0.05)",
                                            borderRadius: 20, padding: "22px 20px",
                                            cursor: isMaxed || isOutOfStock || step !== "browse" ? "not-allowed" : "pointer",
                                            textAlign: "left",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            position: "relative",
                                            opacity: isMaxed || isOutOfStock ? 0.4 : 1,
                                            color: "inherit",
                                            backdropFilter: "blur(12px)",
                                            animation: `cardFadeIn 0.5s ease ${index * 0.06}s both`,
                                            overflow: "hidden",
                                        }}
                                    >
                                        {/* Shimmer overlay */}
                                        <div style={{
                                            position: "absolute", inset: 0, borderRadius: 20,
                                            background: "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.02) 50%, transparent 60%)",
                                            pointerEvents: "none",
                                        }} />

                                        <div style={{
                                            width: 56, height: 56, borderRadius: 16,
                                            background: inCart
                                                ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.15))"
                                                : "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.05))",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 28, marginBottom: 14,
                                            transition: "transform 0.3s ease, background 0.3s ease",
                                            transform: inCart ? "scale(1.05)" : "scale(1)",
                                        }}>
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.item_name} style={{
                                                    width: "100%", height: "100%", objectFit: "cover", borderRadius: 16,
                                                }} />
                                            ) : (
                                                getItemEmoji(item.item_name)
                                            )}
                                        </div>

                                        <h3 style={{
                                            fontSize: 16, fontWeight: 700, color: "#f1f5f9",
                                            marginBottom: 6, lineHeight: 1.3,
                                            letterSpacing: "-0.01em",
                                        }}>
                                            {item.item_name}
                                        </h3>

                                        <div style={{
                                            display: "flex", justifyContent: "space-between", alignItems: "flex-end",
                                        }}>
                                            <span style={{
                                                fontSize: 22, fontWeight: 800,
                                                background: "linear-gradient(135deg, #10b981, #06b6d4)",
                                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                            }}>
                                                ${Number(item.price).toFixed(2)}
                                            </span>
                                            <span style={{
                                                fontSize: 11, fontWeight: 600,
                                                color: isOutOfStock
                                                    ? "#ef4444"
                                                    : item.stock_count <= 3 ? "#f59e0b" : "#3f4f66",
                                                padding: "3px 8px", borderRadius: 8,
                                                background: isOutOfStock
                                                    ? "rgba(239,68,68,0.1)"
                                                    : item.stock_count <= 3 ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)",
                                            }}>
                                                {isOutOfStock ? "Sold out" : `${item.stock_count} left`}
                                            </span>
                                        </div>

                                        {/* Cart quantity badge */}
                                        {inCart && (
                                            <div style={{
                                                position: "absolute", top: 12, right: 12,
                                                width: 30, height: 30, borderRadius: "50%",
                                                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 13, fontWeight: 800, color: "white",
                                                boxShadow: "0 4px 15px rgba(59,130,246,0.5)",
                                                animation: "badgePop 0.3s ease",
                                            }}>
                                                {inCart.quantity}
                                            </div>
                                        )}
                                    </button>
                                    {/* More Info button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                                        style={{
                                            position: "absolute", bottom: 14, right: 14,
                                            width: 32, height: 32, borderRadius: 10,
                                            background: "rgba(255,255,255,0.06)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            color: "#64748b", cursor: "pointer",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            transition: "all 0.2s ease",
                                            zIndex: 2,
                                        }}
                                        title="More Info"
                                    >
                                        <Info size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Product Detail Modal */}
                {selectedItem && (
                    <div
                        onClick={() => setSelectedItem(null)}
                        style={{
                            position: "fixed", inset: 0,
                            background: "rgba(0,0,0,0.7)",
                            backdropFilter: "blur(8px)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            zIndex: 100,
                            animation: "fadeIn 0.2s ease",
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: "linear-gradient(160deg, #111827, #0d1426)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: 24, padding: 0,
                                width: "90%", maxWidth: 420,
                                animation: "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                overflow: "hidden",
                            }}
                        >
                            {/* Image / Emoji header */}
                            <div style={{
                                height: 180,
                                background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.08))",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                position: "relative",
                            }}>
                                {selectedItem.image_url ? (
                                    <img src={selectedItem.image_url} alt={selectedItem.item_name} style={{
                                        width: "100%", height: "100%", objectFit: "cover",
                                    }} />
                                ) : (
                                    <span style={{ fontSize: 72 }}>{getItemEmoji(selectedItem.item_name)}</span>
                                )}
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    style={{
                                        position: "absolute", top: 12, right: 12,
                                        width: 36, height: 36, borderRadius: 12,
                                        background: "rgba(0,0,0,0.5)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        color: "white", cursor: "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Content */}
                            <div style={{ padding: "24px 28px" }}>
                                <h2 style={{
                                    fontSize: 22, fontWeight: 800, color: "#f1f5f9",
                                    letterSpacing: "-0.02em", marginBottom: 6,
                                }}>
                                    {selectedItem.item_name}
                                </h2>

                                <div style={{
                                    display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
                                }}>
                                    <span style={{
                                        fontSize: 26, fontWeight: 800,
                                        background: "linear-gradient(135deg, #10b981, #06b6d4)",
                                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                    }}>
                                        ${Number(selectedItem.price).toFixed(2)}
                                    </span>
                                    <span style={{
                                        fontSize: 12, fontWeight: 600,
                                        color: selectedItem.stock_count <= 3 ? "#f59e0b" : "#64748b",
                                        padding: "4px 10px", borderRadius: 8,
                                        background: selectedItem.stock_count <= 3
                                            ? "rgba(245,158,11,0.1)"
                                            : "rgba(255,255,255,0.04)",
                                    }}>
                                        {selectedItem.stock_count} in stock
                                    </span>
                                </div>

                                {selectedItem.description && (
                                    <p style={{
                                        fontSize: 14, color: "#94a3b8", lineHeight: 1.6,
                                        marginBottom: 20,
                                    }}>
                                        {selectedItem.description}
                                    </p>
                                )}

                                {!selectedItem.description && (
                                    <p style={{
                                        fontSize: 13, color: "#475569", lineHeight: 1.6,
                                        marginBottom: 20, fontStyle: "italic",
                                    }}>
                                        No additional details available.
                                    </p>
                                )}

                                <button
                                    onClick={() => {
                                        addToCart(selectedItem);
                                        setSelectedItem(null);
                                    }}
                                    disabled={selectedItem.stock_count === 0}
                                    style={{
                                        width: "100%", padding: "14px 0",
                                        borderRadius: 14, border: "none",
                                        background: selectedItem.stock_count === 0
                                            ? "rgba(100,116,139,0.2)"
                                            : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                        color: "white", fontSize: 15, fontWeight: 700,
                                        cursor: selectedItem.stock_count === 0 ? "not-allowed" : "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                        boxShadow: selectedItem.stock_count === 0
                                            ? "none"
                                            : "0 6px 25px rgba(59,130,246,0.3)",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    <Plus size={16} />
                                    {selectedItem.stock_count === 0 ? "Sold Out" : "Add to Cart"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Webcam — frosted glass in bottom-left corner */}
                <div style={{
                    position: "fixed",
                    bottom: 24,
                    left: 24,
                    width: 180,
                    height: 180,
                    borderRadius: 20,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
                    zIndex: 10,
                    backdropFilter: "blur(8px)",
                }}>
                    <WebcamFeed />
                </div>
            </div>

            {/* ─── Right: Cart / Payment / Contact Panel ─── */}
            <div style={{
                width: (step === "browse" && cart.length === 0) ? 0 : 380,
                minWidth: (step === "browse" && cart.length === 0) ? 0 : 380,
                borderLeft: (step === "browse" && cart.length === 0) ? "none" : "1px solid rgba(255,255,255,0.04)",
                display: "flex", flexDirection: "column",
                background: "rgba(0,0,0,0.3)",
                backdropFilter: "blur(40px)",
                overflow: "hidden",
                opacity: (step === "browse" && cart.length === 0) ? 0 : 1,
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}>
                {/* Panel Header */}
                <div style={{
                    padding: "24px 24px 18px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
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
                                    background: "rgba(255,255,255,0.05)", border: "none",
                                    borderRadius: 10, width: 36, height: 36,
                                    color: "#94a3b8", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <ShoppingCart size={17} color="#3b82f6" />
                        </div>
                        <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>
                            {step === "browse" && "Your Cart"}
                            {step === "payment" && "Payment"}
                            {step === "contact" && "Contact Info"}
                        </h2>
                        {cartCount > 0 && step === "browse" && (
                            <span style={{
                                marginLeft: "auto",
                                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                color: "white", padding: "3px 10px",
                                borderRadius: 12, fontSize: 11, fontWeight: 700,
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </div>
                </div>

                {/* Panel Content */}
                <div style={{ flex: 1, overflow: "auto", padding: "12px 24px" }}>
                    {/* ── Browse: Cart Items ── */}
                    {step === "browse" && cart.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {cart.map((c) => (
                                <div key={c.inventory.id} style={{
                                    display: "flex", alignItems: "center", gap: 12,
                                    padding: "14px 16px",
                                    background: "rgba(255,255,255,0.03)",
                                    borderRadius: 14,
                                    border: "1px solid rgba(255,255,255,0.04)",
                                    transition: "all 0.2s ease",
                                    animation: "slideInRight 0.3s ease",
                                }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 12,
                                        background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.08))",
                                        display: "flex", alignItems: "center",
                                        justifyContent: "center", fontSize: 20, flexShrink: 0,
                                    }}>
                                        {getItemEmoji(c.inventory.item_name)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: 14, fontWeight: 600, color: "#e2e8f0",
                                            whiteSpace: "nowrap", overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}>
                                            {c.inventory.item_name}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#4b5563", marginTop: 2 }}>
                                            ${Number(c.inventory.price).toFixed(2)} each
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <button onClick={() => updateQuantity(c.inventory.id, -1)} style={qtyBtnStyle}>
                                            <Minus size={13} />
                                        </button>
                                        <span style={{
                                            width: 24, textAlign: "center",
                                            fontSize: 15, fontWeight: 800, color: "#f1f5f9",
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
                                            <Plus size={13} />
                                        </button>
                                    </div>
                                    <button onClick={() => removeFromCart(c.inventory.id)} style={{
                                        background: "rgba(239,68,68,0.08)", border: "none",
                                        borderRadius: 8, width: 32, height: 32,
                                        color: "#ef4444", cursor: "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        transition: "all 0.2s ease",
                                    }}>
                                        <Trash2 size={14} />
                                    </button>
                                    <div style={{
                                        fontSize: 15, fontWeight: 700, color: "#f1f5f9",
                                        minWidth: 55, textAlign: "right",
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
                                marginBottom: 20, padding: "16px 20px",
                                background: "linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.04))",
                                border: "1px solid rgba(59,130,246,0.1)",
                                borderRadius: 16,
                            }}>
                                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>Amount due</div>
                                <div style={{
                                    fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em",
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
                                textAlign: "center", marginTop: 20,
                                padding: "16px 0",
                                borderTop: "1px solid rgba(255,255,255,0.04)",
                            }}>
                                <span style={{ fontSize: 12, color: "#374151", display: "block", marginBottom: 12, fontWeight: 500 }}>
                                    or pay with cryptocurrency
                                </span>
                                <button
                                    onClick={startCoinbaseCheckout}
                                    style={{
                                        width: "100%", padding: "14px 16px",
                                        borderRadius: 14,
                                        border: "1px solid rgba(245,158,11,0.2)",
                                        background: "rgba(245,158,11,0.06)",
                                        color: "#fbbf24", fontSize: 14, fontWeight: 700,
                                        cursor: "pointer", display: "flex",
                                        alignItems: "center", justifyContent: "center", gap: 10,
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    <Bitcoin size={18} />
                                    Pay with Crypto
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Contact Step ── */}
                    {step === "contact" && (
                        <div style={{ paddingTop: 8 }}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: 10,
                                marginBottom: 20, padding: "12px 16px",
                                background: "rgba(16,185,129,0.06)",
                                borderRadius: 12, border: "1px solid rgba(16,185,129,0.12)",
                            }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: 8,
                                    background: "rgba(16,185,129,0.15)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <Check size={15} color="#10b981" />
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 700, color: "#10b981" }}>Payment successful!</span>
                            </div>

                            {confirmError && (
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    marginBottom: 16, padding: "10px 14px",
                                    background: "rgba(239,68,68,0.06)",
                                    borderRadius: 12, border: "1px solid rgba(239,68,68,0.15)",
                                    color: "#ef4444", fontSize: 13, fontWeight: 500,
                                }}>
                                    <AlertCircle size={16} />
                                    {confirmError}
                                </div>
                            )}

                            <p style={{ fontSize: 13, color: "#4b5563", marginBottom: 20, lineHeight: 1.5 }}>
                                Enter your contact info for a digital receipt.
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                <div style={{ position: "relative" }}>
                                    <User size={16} style={{
                                        position: "absolute", left: 14, top: 15, color: "#4b5563",
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
                                        position: "absolute", left: 14, top: 15, color: "#4b5563",
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
                                        position: "absolute", left: 14, top: 15, color: "#4b5563",
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
                                    width: "100%", marginTop: 24,
                                    padding: "16px 0", borderRadius: 16,
                                    border: "none",
                                    background: confirming
                                        ? "rgba(16,185,129,0.2)"
                                        : "linear-gradient(135deg, #10b981, #06b6d4)",
                                    color: "white", fontSize: 16, fontWeight: 700,
                                    cursor: confirming ? "wait" : "pointer",
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center", gap: 10,
                                    boxShadow: confirming ? "none" : "0 6px 30px rgba(16,185,129,0.25)",
                                    transition: "all 0.3s ease",
                                    letterSpacing: "-0.01em",
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
                                    width: "100%", marginTop: 10, padding: "12px 0",
                                    background: "none", border: "none",
                                    color: "#374151", fontSize: 13, fontWeight: 500,
                                    cursor: "pointer", transition: "color 0.2s",
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
                        padding: "20px 24px",
                        borderTop: "1px solid rgba(255,255,255,0.04)",
                        background: "rgba(0,0,0,0.25)",
                        backdropFilter: "blur(20px)",
                    }}>
                        <div style={{
                            display: "flex", justifyContent: "space-between",
                            marginBottom: 16, alignItems: "baseline",
                        }}>
                            <span style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>Total</span>
                            <span style={{
                                fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em",
                                background: "linear-gradient(135deg, #10b981, #06b6d4)",
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                            }}>
                                ${cartTotal.toFixed(2)}
                            </span>
                        </div>

                        <button
                            onClick={startStripeCheckout}
                            style={{
                                width: "100%", padding: "16px 0",
                                borderRadius: 16, border: "none",
                                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                color: "white", fontSize: 16, fontWeight: 700,
                                cursor: "pointer", display: "flex",
                                alignItems: "center", justifyContent: "center", gap: 10,
                                boxShadow: "0 6px 30px rgba(59,130,246,0.3), 0 0 0 1px rgba(59,130,246,0.2)",
                                transition: "all 0.2s ease",
                                letterSpacing: "-0.01em",
                                animation: "checkoutGlow 2s ease-in-out infinite",
                            }}
                        >
                            <CreditCard size={18} />
                            Checkout · ${cartTotal.toFixed(2)}
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes cardFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes badgePop { from { transform: scale(0); } 50% { transform: scale(1.2); } to { transform: scale(1); } }
                @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes checkoutGlow {
                    0%, 100% { box-shadow: 0 6px 30px rgba(59,130,246,0.3), 0 0 0 1px rgba(59,130,246,0.2); }
                    50% { box-shadow: 0 8px 40px rgba(139,92,246,0.4), 0 0 0 1px rgba(139,92,246,0.3); }
                }
                @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                button:hover:not(:disabled) { transform: translateY(-1px); }
                button:active:not(:disabled) { transform: translateY(0) scale(0.98); }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.04); border-radius: 2px; }
            `}</style>
        </div>
    );
}

// ─── Helpers ───────────────────────────────────────────
const qtyBtnStyle: React.CSSProperties = {
    width: 30, height: 30, borderRadius: 9,
    background: "rgba(255,255,255,0.06)",
    border: "none", color: "#94a3b8",
    display: "flex", alignItems: "center",
    justifyContent: "center", cursor: "pointer",
    transition: "all 0.15s ease",
};

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 14px 14px 42px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "#e2e8f0", fontSize: 15,
    outline: "none",
    transition: "border-color 0.2s ease, background 0.2s ease",
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
