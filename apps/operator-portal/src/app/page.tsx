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
  Package,
  Settings,
  DollarSign,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div style={{
      background: "linear-gradient(160deg, #070b14 0%, #0c1425 50%, #0a101f 100%)",
      color: "#e2e8f0",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>
      {/* Nav */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 40px", maxWidth: 1200, margin: "0 auto",
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(7,11,20,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.03)",
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
        textAlign: "center", position: "relative",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
          width: 600, height: 400,
          background: "radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

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
          fontSize: "clamp(36px, 6vw, 68px)",
          fontWeight: 800, lineHeight: 1.06,
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
          color: "#64748b", lineHeight: 1.6,
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
        maxWidth: 1200, margin: "0 auto", padding: "40px 40px 100px",
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
                fontSize: 14, color: "#64748b",
                lineHeight: 1.6,
              }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        maxWidth: 1200, margin: "0 auto", padding: "60px 40px 100px",
      }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{
            fontSize: 12, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#3b82f6", marginBottom: 12,
            display: "block",
          }}>
            HOW IT WORKS
          </span>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800,
            letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #f1f5f9, #94a3b8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Up and running in 3 steps
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 32,
        }}>
          {howItWorks.map((step, i) => (
            <div key={i} style={{
              position: "relative",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 24, padding: "36px 28px",
              textAlign: "center",
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: step.bgColor,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: step.shadow,
              }}>
                <step.icon size={28} color={step.iconColor} />
              </div>
              <div style={{
                position: "absolute", top: 16, left: 20,
                width: 28, height: 28, borderRadius: 8,
                background: "rgba(59,130,246,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 800, color: "#3b82f6",
              }}>
                {i + 1}
              </div>
              <h3 style={{
                fontSize: 20, fontWeight: 700, color: "#f1f5f9",
                marginBottom: 8, letterSpacing: "-0.02em",
              }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof / Metrics */}
      <section style={{
        borderTop: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        background: "rgba(59,130,246,0.02)",
        padding: "48px 40px",
      }}>
        <div style={{
          maxWidth: 1000, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 32, textAlign: "center",
        }}>
          {metrics.map((m, i) => (
            <div key={i}>
              <div style={{
                fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800,
                letterSpacing: "-0.03em",
                background: m.gradient,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                lineHeight: 1.1,
              }}>
                {m.value}
              </div>
              <div style={{
                fontSize: 14, color: "#64748b", fontWeight: 500,
                marginTop: 6,
              }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        maxWidth: 800, margin: "0 auto", padding: "100px 40px",
        textAlign: "center",
      }}>
        <h2 style={{
          fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800,
          letterSpacing: "-0.03em", lineHeight: 1.15,
          marginBottom: 16,
        }}>
          <span style={{
            background: "linear-gradient(135deg, #f1f5f9 20%, #3b82f6 70%, #8b5cf6 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Ready to transform your fridge?
          </span>
        </h2>
        <p style={{
          fontSize: "clamp(15px, 2vw, 18px)",
          color: "#64748b", lineHeight: 1.6,
          maxWidth: 500, margin: "0 auto 36px",
        }}>
          Start selling today. No hardware required — just an iPad, a fridge, and 5 minutes.
        </p>
        <Link href="/signup" style={{
          padding: "18px 40px", borderRadius: 18,
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          color: "white", fontSize: 17, fontWeight: 700,
          textDecoration: "none",
          display: "inline-flex", alignItems: "center", gap: 10,
          boxShadow: "0 10px 40px rgba(59,130,246,0.35), 0 0 0 1px rgba(59,130,246,0.2)",
          transition: "all 0.3s ease",
        }}>
          Get Started Free <ArrowRight size={20} />
        </Link>
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

const howItWorks = [
  {
    icon: Package,
    title: "Install & Connect",
    desc: "Place an iPad on your fridge. Add a smart lock if you want auto-unlock. No complex wiring needed.",
    bgColor: "rgba(59,130,246,0.1)",
    iconColor: "#3b82f6",
    shadow: "0 6px 20px rgba(59,130,246,0.15)",
  },
  {
    icon: Settings,
    title: "Configure Your Kiosk",
    desc: "Set up your inventory, prices, and payment methods from the dashboard. Choose your iPad placement — on the door or countertop.",
    bgColor: "rgba(139,92,246,0.1)",
    iconColor: "#8b5cf6",
    shadow: "0 6px 20px rgba(139,92,246,0.15)",
  },
  {
    icon: DollarSign,
    title: "Start Earning",
    desc: "Customers tap to browse, pay with Apple Pay or card, and grab their items. You track everything in real time.",
    bgColor: "rgba(16,185,129,0.1)",
    iconColor: "#10b981",
    shadow: "0 6px 20px rgba(16,185,129,0.15)",
  },
];

const metrics = [
  {
    value: "500+",
    label: "Kiosks Deployed",
    gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
  },
  {
    value: "120K",
    label: "Transactions Processed",
    gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
  },
  {
    value: "99.9%",
    label: "Uptime",
    gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)",
  },
  {
    value: "< 2s",
    label: "Avg. Checkout Time",
    gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
  },
];
