import { NextRequest, NextResponse } from "next/server";

const COINBASE_API = "https://api.commerce.coinbase.com/charges";

export async function POST(req: NextRequest) {
    try {
        const { amount, machineId, items, contact } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: "Invalid amount" },
                { status: 400 }
            );
        }

        const apiKey = process.env.COINBASE_COMMERCE_API_KEY;

        if (!apiKey) {
            // Fallback: return a demo URL if no API key configured
            return NextResponse.json({
                chargeId: `demo_${Date.now()}`,
                hostedUrl: `https://commerce.coinbase.com/checkout/demo`,
                demo: true,
            });
        }

        const res = await fetch(COINBASE_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CC-Api-Key": apiKey,
                "X-CC-Version": "2018-03-22",
            },
            body: JSON.stringify({
                name: "OpenFridge Purchase",
                description: items
                    ?.map((i: { name: string; qty: number }) => `${i.qty}x ${i.name}`)
                    .join(", "),
                pricing_type: "fixed_price",
                local_price: {
                    amount: amount.toFixed(2),
                    currency: "USD",
                },
                metadata: {
                    machineId,
                    contact: JSON.stringify(contact),
                },
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Coinbase API error: ${err}`);
        }

        const { data } = await res.json();

        return NextResponse.json({
            chargeId: data.id,
            hostedUrl: data.hosted_url,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Charge creation failed";
        console.error("Coinbase Commerce error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
