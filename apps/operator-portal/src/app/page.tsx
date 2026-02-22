import Link from "next/link";
import {
  Snowflake,
  Lock,
  CreditCard,
  BarChart3,
  Bot,
  ChevronRight,
  Zap,
  Shield,
  Eye,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #070b14 0%, #0c1425 50%, #0a101f 100%)",
      color: "#e2e8f0",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>
      {/* Nav */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 40px", maxWidth: 1200, margin: "0 auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 15px rgba(59,130,246,0.3)",
          }}>
            <Snowflake size={20} color="white" />
          </div>
          <span style={{
            fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #f1f5f9, #94a3b8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            OpenFridge
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/login" style={{
            padding: "10px 20px", borderRadius: 12,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#94a3b8", fontSize: 14, fontWeight: 600,
            textDecoration: "none",
            transition: "all 0.2s ease",
          }}>
            Sign In
          </Link>
          <Link href="/signup" style={{
            padding: "10px 20px", borderRadius: 12,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            color: "white", fontSize: 14, fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 4px 15px rgba(59,130,246,0.3)",
            transition: "all 0.2s ease",
          }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: 1200, margin: "0 auto", padding: "100px 40px 80px",
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "8px 18px", borderRadius: 50,
          background: "rgba(59,130,246,0.08)",
          border: "1px solid rgba(59,130,246,0.15)",
          color: "#60a5fa", fontSize: 13, fontWeight: 600,
          marginBottom: 28,
        }}>
          <Zap size={14} />
          Autonomous Vending, Reimagined
        </div>
        <h1 style={{
          fontSize: "clamp(36px, 6vw, 64px)",
          fontWeight: 800, lineHeight: 1.08,
          letterSpacing: "-0.04em",
          marginBottom: 24,
        }}>
          <span style={{
            background: "linear-gradient(135deg, #f1f5f9 30%, #3b82f6 60%, #8b5cf6 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Turn any fridge into<br />a smart vending kiosk
          </span>
        </h1>
        <p style={{
          fontSize: "clamp(16px, 2vw, 20px)",
          color: "#4b5563", lineHeight: 1.6,
          maxWidth: 580, margin: "0 auto 40px",
        }}>
          Accept payments, track inventory, and manage your autonomous
          vending machines from one beautiful dashboard.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup" style={{
            padding: "16px 32px", borderRadius: 16,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            color: "white", fontSize: 16, fontWeight: 700,
            textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 8,
            boxShadow: "0 8px 30px rgba(59,130,246,0.3), 0 0 0 1px rgba(59,130,246,0.2)",
            transition: "all 0.3s ease",
          }}>
            Start Free <ChevronRight size={18} />
          </Link>
          <Link href="/kiosk/a1b2c3d4-0001-4000-8000-000000000001" style={{
            padding: "16px 32px", borderRadius: 16,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#94a3b8", fontSize: 16, fontWeight: 600,
            textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 8,
            transition: "all 0.3s ease",
          }}>
            <Eye size={18} /> View Demo Kiosk
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{
        maxWidth: 1200, margin: "0 auto", padding: "40px 40px 120px",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 24, padding: "32px 28px",
              backdropFilter: "blur(12px)",
              transition: "all 0.3s ease",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: f.bgColor, display: "flex",
                alignItems: "center", justifyContent: "center",
                marginBottom: 20,
                boxShadow: f.shadow,
              }}>
                <f.icon size={24} color={f.iconColor} />
              </div>
              <h3 style={{
                fontSize: 18, fontWeight: 700,
                color: "#f1f5f9", marginBottom: 8,
                letterSpacing: "-0.02em",
              }}>
                {f.title}
              </h3>
              <p style={{
                fontSize: 14, color: "#4b5563",
                lineHeight: 1.6,
              }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.04)",
        padding: "32px 40px",
        textAlign: "center",
        color: "#334155", fontSize: 13,
      }}>
        © 2025 OpenFridge · Built for autonomous vending
      </footer>
    </div>
  );
}

const features = [
  {
    icon: CreditCard,
    title: "Apple Pay & Stripe",
    desc: "Accept tap-to-pay, cards, and crypto. One-tap checkout on iPad with Apple Pay Express Checkout.",
    bgColor: "rgba(59,130,246,0.1)",
    iconColor: "#3b82f6",
    shadow: "0 4px 15px rgba(59,130,246,0.15)",
  },
  {
    icon: Lock,
    title: "Smart Lock Integration",
    desc: "Connect USB or WiFi smart locks. Fridge unlocks automatically after payment, re-locks on timer.",
    bgColor: "rgba(16,185,129,0.1)",
    iconColor: "#10b981",
    shadow: "0 4px 15px rgba(16,185,129,0.15)",
  },
  {
    icon: BarChart3,
    title: "Real-Time Dashboard",
    desc: "Revenue tracking, sales analytics, and inventory levels — all updating in real time.",
    bgColor: "rgba(139,92,246,0.1)",
    iconColor: "#8b5cf6",
    shadow: "0 4px 15px rgba(139,92,246,0.15)",
  },
  {
    icon: Bot,
    title: "AI Agent",
    desc: "Proactive alerts for low stock and machine issues. Ask questions about your business in natural language.",
    bgColor: "rgba(245,158,11,0.1)",
    iconColor: "#f59e0b",
    shadow: "0 4px 15px rgba(245,158,11,0.15)",
  },
  {
    icon: Eye,
    title: "Face Detection Greeting",
    desc: "Camera-powered idle screen detects customers and greets them by voice to drive engagement.",
    bgColor: "rgba(236,72,153,0.1)",
    iconColor: "#ec4899",
    shadow: "0 4px 15px rgba(236,72,153,0.15)",
  },
  {
    icon: Shield,
    title: "Multi-Tenant Security",
    desc: "Each operator sees only their own kiosks. Supabase Auth with row-level security out of the box.",
    bgColor: "rgba(6,182,212,0.1)",
    iconColor: "#06b6d4",
    shadow: "0 4px 15px rgba(6,182,212,0.15)",
  },
];
