import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

let _stripe: Stripe | null = null;
function getStripe() {
    if (!_stripe) {
        _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    }
    return _stripe;
}

export async function POST(req: NextRequest) {
    try {
        const { amount, machineId, items } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: "Invalid amount" },
                { status: 400 }
            );
        }

        const paymentIntent = await getStripe().paymentIntents.create({
            amount: Math.round(amount * 100), // Convert dollars to cents
            currency: "usd",
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                machineId,
                items: JSON.stringify(
                    items?.map((i: { name: string; qty: number }) => `${i.qty}x ${i.name}`)
                ),
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Payment failed";
        console.error("Stripe error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
