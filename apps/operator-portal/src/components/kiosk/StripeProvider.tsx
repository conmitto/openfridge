"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { ReactNode } from "react";

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function StripeProvider({
    clientSecret,
    children,
}: {
    clientSecret: string;
    children: ReactNode;
}) {
    return (
        <Elements
            stripe={stripePromise}
            options={{
                clientSecret,
                appearance: {
                    theme: "night",
                    variables: {
                        colorPrimary: "#3b82f6",
                        colorBackground: "#0f172a",
                        colorText: "#e2e8f0",
                        colorDanger: "#ef4444",
                        fontFamily: "Inter, system-ui, sans-serif",
                        borderRadius: "12px",
                        spacingUnit: "4px",
                    },
                    rules: {
                        ".Input": {
                            backgroundColor: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            boxShadow: "none",
                        },
                        ".Input:focus": {
                            border: "1px solid #3b82f6",
                            boxShadow: "0 0 0 1px #3b82f6",
                        },
                        ".Tab": {
                            backgroundColor: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                        },
                        ".Tab--selected": {
                            backgroundColor: "rgba(59,130,246,0.15)",
                            border: "1px solid rgba(59,130,246,0.4)",
                        },
                    },
                },
            }}
        >
            {children}
        </Elements>
    );
}
