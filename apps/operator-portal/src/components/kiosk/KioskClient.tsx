"use client";

import { useState, useCallback } from "react";
import type { Machine, Inventory } from "@/lib/supabase/types";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Smartphone, Bitcoin, X, Check } from "lucide-react";

interface CartItem {
    inventory: Inventory;
    quantity: number;
}

export default function KioskClient({
    machine,
    inventory,
}: {
    machine: Machine;
    inventory: Inventory[];
}) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCheckout, setShowCheckout] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);

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
        (sum, c) => sum + Number(c.inventory.price) * c.quantity,
        0
    );
    const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

    const handlePayment = (method: string) => {
        setShowCheckout(false);
        setOrderComplete(true);
        setTimeout(() => {
            setOrderComplete(false);
            setCart([]);
        }, 4000);
    };

    if (orderComplete) {
        return (
            <div style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 24,
                animation: "fadeIn 0.5s ease",
            }}>
                <div style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #10b981, #06b6d4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 60px rgba(16,185,129,0.4)",
                    animation: "pulse 1.5s ease-in-out infinite",
                }}>
                    <Check size={48} color="white" strokeWidth={3} />
                </div>
                <h1 style={{ fontSize: 36, fontWeight: 800, background: "linear-gradient(135deg, #10b981, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Order Complete!
                </h1>
                <p style={{ fontSize: 18, color: "#94a3b8" }}>
                    Thank you for your purchase. Enjoy!
                </p>
            </div>
        );
    }

    return (
        <div style={{ height: "100vh", display: "flex", overflow: "hidden" }}>
            {/* ─── Left: Product Grid ─── */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}>
                {/* Header */}
                <div style={{
                    padding: "24px 32px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <div>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 4,
                        }}>
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 18,
                            }}>
                                ❄️
                            </div>
                            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
                                {machine.name}
                            </h1>
                        </div>
                        <p style={{ fontSize: 13, color: "#64748b", paddingLeft: 52 }}>
                            {machine.location} · Tap items to add to cart
                        </p>
                    </div>
                    <div style={{
                        padding: "8px 16px",
                        borderRadius: 20,
                        background: "rgba(16,185,129,0.12)",
                        color: "#10b981",
                        fontSize: 13,
                        fontWeight: 600,
                    }}>
                        {inventory.length} items available
                    </div>
                </div>

                {/* Product Grid */}
                <div style={{
                    flex: 1,
                    overflow: "auto",
                    padding: "24px 32px",
                }}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: 16,
                    }}>
                        {inventory.map((item) => {
                            const inCart = cart.find((c) => c.inventory.id === item.id);
                            const isMaxed = inCart && inCart.quantity >= item.stock_count;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => addToCart(item)}
                                    disabled={!!isMaxed}
                                    style={{
                                        background: inCart
                                            ? "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.1))"
                                            : "rgba(255,255,255,0.03)",
                                        border: inCart
                                            ? "1px solid rgba(59,130,246,0.3)"
                                            : "1px solid rgba(255,255,255,0.06)",
                                        borderRadius: 16,
                                        padding: 20,
                                        cursor: isMaxed ? "not-allowed" : "pointer",
                                        textAlign: "left",
                                        transition: "all 0.2s ease",
                                        position: "relative",
                                        opacity: isMaxed ? 0.5 : 1,
                                        color: "inherit",
                                    }}
                                >
                                    {/* Item icon placeholder */}
                                    <div style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 14,
                                        background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 28,
                                        marginBottom: 14,
                                    }}>
                                        {getItemEmoji(item.item_name)}
                                    </div>

                                    <h3 style={{
                                        fontSize: 15,
                                        fontWeight: 600,
                                        color: "#f1f5f9",
                                        marginBottom: 6,
                                        lineHeight: 1.3,
                                    }}>
                                        {item.item_name}
                                    </h3>

                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}>
                                        <span style={{
                                            fontSize: 20,
                                            fontWeight: 800,
                                            background: "linear-gradient(135deg, #10b981, #06b6d4)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }}>
                                            ${Number(item.price).toFixed(2)}
                                        </span>
                                        <span style={{
                                            fontSize: 11,
                                            color: item.stock_count <= 3 ? "#f59e0b" : "#64748b",
                                            fontWeight: 500,
                                        }}>
                                            {item.stock_count} left
                                        </span>
                                    </div>

                                    {inCart && (
                                        <div style={{
                                            position: "absolute",
                                            top: 10,
                                            right: 10,
                                            width: 26,
                                            height: 26,
                                            borderRadius: "50%",
                                            background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 12,
                                            fontWeight: 800,
                                            color: "white",
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
            </div>

            {/* ─── Right: Cart Panel ─── */}
            <div style={{
                width: 360,
                borderLeft: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                flexDirection: "column",
                background: "rgba(0,0,0,0.2)",
            }}>
                {/* Cart Header */}
                <div style={{
                    padding: "24px 24px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <ShoppingCart size={20} color="#3b82f6" />
                        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Your Cart</h2>
                        {cartCount > 0 && (
                            <span style={{
                                marginLeft: "auto",
                                background: "rgba(59,130,246,0.15)",
                                color: "#3b82f6",
                                padding: "2px 10px",
                                borderRadius: 12,
                                fontSize: 12,
                                fontWeight: 700,
                            }}>
                                {cartCount} {cartCount === 1 ? "item" : "items"}
                            </span>
                        )}
                    </div>
                </div>

                {/* Cart Items */}
                <div style={{ flex: 1, overflow: "auto", padding: "12px 24px" }}>
                    {cart.length === 0 ? (
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            color: "#475569",
                            gap: 12,
                        }}>
                            <ShoppingCart size={40} strokeWidth={1.5} />
                            <p style={{ fontSize: 14, fontWeight: 500 }}>Cart is empty</p>
                            <p style={{ fontSize: 12, color: "#334155" }}>Tap items to add them</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {cart.map((c) => (
                                <div
                                    key={c.inventory.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        padding: "12px 14px",
                                        background: "rgba(255,255,255,0.03)",
                                        borderRadius: 12,
                                        border: "1px solid rgba(255,255,255,0.05)",
                                    }}
                                >
                                    <div style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 10,
                                        background: "rgba(59,130,246,0.1)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 20,
                                        flexShrink: 0,
                                    }}>
                                        {getItemEmoji(c.inventory.item_name)}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: "#e2e8f0",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}>
                                            {c.inventory.item_name}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#64748b" }}>
                                            ${Number(c.inventory.price).toFixed(2)} each
                                        </div>
                                    </div>

                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                    }}>
                                        <button
                                            onClick={() => updateQuantity(c.inventory.id, -1)}
                                            style={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: 8,
                                                background: "rgba(255,255,255,0.06)",
                                                border: "none",
                                                color: "#94a3b8",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span style={{
                                            width: 24,
                                            textAlign: "center",
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: "#f1f5f9",
                                        }}>
                                            {c.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(c.inventory.id, 1)}
                                            disabled={c.quantity >= c.inventory.stock_count}
                                            style={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: 8,
                                                background: "rgba(59,130,246,0.15)",
                                                border: "none",
                                                color: "#3b82f6",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: c.quantity >= c.inventory.stock_count ? "not-allowed" : "pointer",
                                                opacity: c.quantity >= c.inventory.stock_count ? 0.4 : 1,
                                            }}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(c.inventory.id)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "#475569",
                                            cursor: "pointer",
                                            padding: 4,
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </button>

                                    <div style={{
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: "#f1f5f9",
                                        minWidth: 50,
                                        textAlign: "right",
                                    }}>
                                        ${(Number(c.inventory.price) * c.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cart Footer */}
                {cart.length > 0 && (
                    <div style={{
                        padding: "20px 24px",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        background: "rgba(0,0,0,0.15)",
                    }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 16,
                        }}>
                            <span style={{ fontSize: 14, color: "#94a3b8" }}>Total</span>
                            <span style={{
                                fontSize: 24,
                                fontWeight: 800,
                                background: "linear-gradient(135deg, #10b981, #06b6d4)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}>
                                ${cartTotal.toFixed(2)}
                            </span>
                        </div>

                        {!showCheckout ? (
                            <button
                                onClick={() => setShowCheckout(true)}
                                style={{
                                    width: "100%",
                                    padding: "14px 0",
                                    borderRadius: 14,
                                    border: "none",
                                    background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                                    color: "white",
                                    fontSize: 16,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    transition: "transform 0.15s ease",
                                }}
                            >
                                <CreditCard size={18} />
                                Checkout · ${cartTotal.toFixed(2)}
                            </button>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 4,
                                }}>
                                    <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
                                        Select payment method
                                    </span>
                                    <button
                                        onClick={() => setShowCheckout(false)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "#64748b",
                                            cursor: "pointer",
                                            padding: 2,
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <button
                                    onClick={() => handlePayment("card")}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        borderRadius: 12,
                                        border: "1px solid rgba(59,130,246,0.3)",
                                        background: "rgba(59,130,246,0.1)",
                                        color: "#60a5fa",
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                    }}
                                >
                                    <CreditCard size={18} />
                                    Pay with Card
                                </button>

                                <button
                                    onClick={() => handlePayment("apple_pay")}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        borderRadius: 12,
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        background: "rgba(255,255,255,0.05)",
                                        color: "#f1f5f9",
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                    }}
                                >
                                    <Smartphone size={18} />
                                    Pay
                                </button>

                                <button
                                    onClick={() => handlePayment("crypto")}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        borderRadius: 12,
                                        border: "1px solid rgba(245,158,11,0.3)",
                                        background: "rgba(245,158,11,0.08)",
                                        color: "#fbbf24",
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                    }}
                                >
                                    <Bitcoin size={18} />
                                    Pay with Crypto
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                button:hover:not(:disabled) {
                    transform: translateY(-1px);
                }
                /* Custom scrollbar */
                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.08);
                    border-radius: 3px;
                }
            `}</style>
        </div>
    );
}

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
