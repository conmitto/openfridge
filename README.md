# 🧊 OpenFridge — Autonomous Vending Kiosk

A modern, tablet-based autonomous vending kiosk platform with AI-powered item recognition, voice interaction, and seamless payments.

## Architecture

| Component | Stack | Location |
|---|---|---|
| **Operator Portal** | Next.js 14 · Tailwind CSS · Supabase | `apps/operator-portal` |
| **Kiosk App** | React Native (Expo) · iPad Landscape | `apps/kiosk` |
| **Shared Supabase** | TypeScript client & types | `packages/supabase` |

## Getting Started

```bash
# Install all dependencies
npm install

# Run the Operator Portal
npm run dev:portal

# Run the Kiosk App
npm run dev:kiosk
```

## Phases

1. **Database & Operator Portal** — Supabase schema, dashboard, POS, restock reports
2. **Kiosk Init & AI Config** — Setup screen, secure storage, landscape lock
3. **Vision & Voice UI** — Camera feed, Vision API loop, voice greetings, cart
4. **Checkout & Big Screen Action** — Stripe, Coinbase, animations, Twilio receipts
