"use client";

import { useState } from "react";
import {
    PaymentElement,
    ExpressCheckoutElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { Loader2, Lock } from "lucide-react";

export default function PaymentForm({
    total,
    onSuccess,
}: {
    total: number;
    onSuccess: (paymentIntentId: string) => void;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showExpress, setShowExpress] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setProcessing(true);
        setError(null);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setError(submitError.message ?? "Payment failed");
            setProcessing(false);
            return;
        }

        const { error: confirmError, paymentIntent } =
            await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.href,
                },
                redirect: "if_required",
            });

        if (confirmError) {
            setError(confirmError.message ?? "Payment failed");
            setProcessing(false);
            return;
        }

        if (paymentIntent?.status === "succeeded") {
            onSuccess(paymentIntent.id);
        } else {
            setError("Payment was not completed. Please try again.");
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Express Checkout: Apple Pay / Google Pay / Link */}
            {showExpress && (
                <div style={{ marginBottom: 20 }}>
                    <ExpressCheckoutElement
                        options={{
                            buttonType: {
                                applePay: "buy",
                                googlePay: "buy",
                            },
                            buttonHeight: 52,
                            layout: {
                                maxColumns: 1,
                                maxRows: 2,
                            },
                        }}
                        onConfirm={async () => {
                            if (!stripe || !elements) return;
                            setProcessing(true);
                            setError(null);

                            const { error: confirmError, paymentIntent } =
                                await stripe.confirmPayment({
                                    elements,
                                    confirmParams: {
                                        return_url: window.location.href,
                                    },
                                    redirect: "if_required",
                                });

                            if (confirmError) {
                                setError(confirmError.message ?? "Express payment failed");
                                setProcessing(false);
                                return;
                            }

                            if (paymentIntent?.status === "succeeded") {
                                onSuccess(paymentIntent.id);
                            } else {
                                setError("Payment was not completed.");
                                setProcessing(false);
                            }
                        }}
                        onReady={({ availablePaymentMethods }) => {
                            // Hide express section if no wallet methods available
                            if (!availablePaymentMethods || Object.keys(availablePaymentMethods).length === 0) {
                                setShowExpress(false);
                            }
                        }}
                    />

                    {/* Divider */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: 14,
                        margin: "18px 0 0",
                    }}>
                        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                        <span style={{ fontSize: 12, color: "#4b5563", fontWeight: 500 }}>
                            or pay with card
                        </span>
                        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                    </div>
                </div>
            )}

            <PaymentElement
                options={{
                    layout: "tabs",
                    wallets: {
                        applePay: "never",
                        googlePay: "never",
                    },
                }}
            />

            {error && (
                <div style={{
                    marginTop: 12,
                    padding: "10px 14px",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    borderRadius: 12,
                    color: "#f87171",
                    fontSize: 13,
                    fontWeight: 500,
                }}>
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || processing}
                style={{
                    width: "100%",
                    marginTop: 18,
                    padding: "16px 0",
                    borderRadius: 16,
                    border: "none",
                    background: processing
                        ? "rgba(59,130,246,0.2)"
                        : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    color: "white",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: processing ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    transition: "all 0.3s ease",
                    boxShadow: processing ? "none" : "0 6px 30px rgba(59,130,246,0.25)",
                    letterSpacing: "-0.01em",
                }}
            >
                {processing ? (
                    <>
                        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                        Processing...
                    </>
                ) : (
                    <>
                        <Lock size={16} />
                        Pay ${total.toFixed(2)}
                    </>
                )}
            </button>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </form>
    );
}
