"use client";

import { useState } from "react";
import {
    PaymentElement,
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
            <PaymentElement
                options={{
                    layout: "tabs",
                    wallets: {
                        applePay: "auto",
                        googlePay: "auto",
                    },
                }}
            />

            {error && (
                <div style={{
                    marginTop: 12,
                    padding: "10px 14px",
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 10,
                    color: "#f87171",
                    fontSize: 13,
                }}>
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || processing}
                style={{
                    width: "100%",
                    marginTop: 16,
                    padding: "14px 0",
                    borderRadius: 14,
                    border: "none",
                    background: processing
                        ? "rgba(59,130,246,0.3)"
                        : "linear-gradient(135deg, #3b82f6, #06b6d4)",
                    color: "white",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: processing ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s ease",
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
