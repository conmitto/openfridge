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
  ExternalLink,
  FileText,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div style={{
      color: "#e2e8f0",
      fontFamily: "Inter, system-ui, sans-serif",
      position: "relative",
    }}>
      {/* Animated mesh background */}
      <div className="landing-bg" />
      {/* Noise texture overlay */}
      <div className="landing-noise" />

      {/* All content above the bg layers */}
      <div style={{ position: "relative", zIndex: 2 }}>

        {/* Nav */}
        <nav className="landing-nav" style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 40px", maxWidth: 1200, margin: "0 auto",
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(5,8,16,0.8)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
          <div className="landing-nav-logo" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(59,130,246,0.25)",
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
            <span style={{
              fontSize: 11, fontWeight: 500, color: "#475569",
              marginLeft: 2, letterSpacing: "0.02em",
            }}>
              by{" "}
              <a
                href="https://conmitto.io"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#64748b", textDecoration: "none", transition: "color 0.2s" }}
              >
                Conmitto
              </a>
            </span>
          </div>
          <div className="landing-nav-buttons" style={{ display: "flex", gap: 12 }}>
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
            <Link href="/signup" className="landing-cta" style={{
              padding: "10px 20px", borderRadius: 12,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: "white", fontSize: 14, fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(59,130,246,0.25)",
            }}>
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="landing-hero" style={{
          maxWidth: 1200, margin: "0 auto", padding: "120px 40px 80px",
          textAlign: "center", position: "relative",
        }}>
          {/* Ambient glow */}
          <div style={{
            position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)",
            width: 800, height: 500,
            background: "radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div className="landing-badge" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 22px", borderRadius: 50,
            background: "rgba(59,130,246,0.07)",
            border: "1px solid rgba(59,130,246,0.12)",
            color: "#60a5fa", fontSize: 13, fontWeight: 600,
            marginBottom: 32,
            backdropFilter: "blur(8px)",
          }}>
            <Zap size={14} />
            Autonomous Vending, Reimagined
          </div>
          <h1 style={{
            fontSize: "clamp(36px, 6vw, 72px)",
            fontWeight: 800, lineHeight: 1.04,
            letterSpacing: "-0.045em",
            marginBottom: 28,
          }}>
            <span style={{
              background: "linear-gradient(140deg, #ffffff 0%, #e2e8f0 25%, #3b82f6 55%, #8b5cf6 85%, #c084fc 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Turn any fridge into<br />a smart vending kiosk
            </span>
          </h1>
          <p style={{
            fontSize: "clamp(16px, 2vw, 20px)",
            color: "#64748b", lineHeight: 1.7,
            maxWidth: 560, margin: "0 auto 44px",
            letterSpacing: "-0.01em",
          }}>
            Accept payments, track inventory, and manage your autonomous
            vending machines from one beautiful dashboard.
          </p>
          <div className="landing-hero-buttons" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" className="landing-cta" style={{
              padding: "18px 36px", borderRadius: 18,
              background: "linear-gradient(135deg, #3b82f6, #7c3aed)",
              color: "white", fontSize: 16, fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 10,
              boxShadow: "0 8px 30px rgba(59,130,246,0.3), 0 0 0 1px rgba(59,130,246,0.15)",
              letterSpacing: "-0.01em",
            }}>
              Start Free <ChevronRight size={18} />
            </Link>
            <Link href="/kiosk/a1b2c3d4-0001-4000-8000-000000000001" style={{
              padding: "18px 36px", borderRadius: 18,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#94a3b8", fontSize: 16, fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 10,
              transition: "all 0.3s ease",
              backdropFilter: "blur(8px)",
            }}>
              <Eye size={18} /> View Demo Kiosk
            </Link>
          </div>
        </section>

        {/* Divider */}
        <div className="landing-divider" />

        {/* Features */}
        <section className="landing-features" style={{
          maxWidth: 1200, margin: "0 auto", padding: "80px 40px 100px",
        }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "#3b82f6", marginBottom: 14,
              display: "block",
            }}>
              FEATURES
            </span>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800,
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #f1f5f9, #94a3b8)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Everything you need to sell smarter
            </h2>
          </div>
          <div className="landing-features-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}>
            {features.map((f, i) => (
              <div key={i} className="landing-card">
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
                  color: "#f1f5f9", marginBottom: 10,
                  letterSpacing: "-0.02em",
                }}>
                  {f.title}
                </h3>
                <p style={{
                  fontSize: 14, color: "#64748b",
                  lineHeight: 1.7,
                }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="landing-divider" />

        {/* How It Works */}
        <section className="landing-section" style={{
          maxWidth: 1200, margin: "0 auto", padding: "80px 40px 100px",
        }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "#3b82f6", marginBottom: 14,
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

          <div className="landing-steps-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 32,
          }}>
            {howItWorks.map((step, i) => (
              <div key={i} className="landing-card" style={{
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
                  marginBottom: 10, letterSpacing: "-0.02em",
                }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="landing-divider" />

        {/* Notion Doc Link */}
        <section className="landing-notion-section" style={{
          maxWidth: 700, margin: "0 auto", padding: "0 40px",
          marginTop: 80,
        }}>
          <a
            href="https://tinyurl.com/open-fridge"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-notion-card"
            style={{
              display: "flex", alignItems: "center", gap: 20,
              padding: "24px 28px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              background: "rgba(59,130,246,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 15px rgba(59,130,246,0.12)",
            }}>
              <FileText size={24} color="#3b82f6" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 16, fontWeight: 700, color: "#f1f5f9",
                marginBottom: 4, letterSpacing: "-0.02em",
              }}>
                Product Overview
              </div>
              <div style={{
                fontSize: 13, color: "#64748b", lineHeight: 1.5,
              }}>
                Read the full OpenFridge product doc — features, architecture, and roadmap.
              </div>
            </div>
            <ExternalLink size={18} color="#475569" style={{ flexShrink: 0 }} />
          </a>
        </section>

        {/* Final CTA */}
        <section className="landing-cta-section" style={{
          maxWidth: 800, margin: "0 auto", padding: "100px 40px",
          textAlign: "center",
        }}>
          <h2 style={{
            fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.12,
            marginBottom: 18,
          }}>
            <span style={{
              background: "linear-gradient(140deg, #ffffff 10%, #e2e8f0 30%, #3b82f6 65%, #8b5cf6 90%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Ready to transform your fridge?
            </span>
          </h2>
          <p style={{
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "#64748b", lineHeight: 1.7,
            maxWidth: 500, margin: "0 auto 40px",
          }}>
            Start selling today. No hardware required — just an iPad, a fridge, and 5 minutes.
          </p>
          <Link href="/signup" className="landing-cta" style={{
            padding: "20px 44px", borderRadius: 20,
            background: "linear-gradient(135deg, #3b82f6, #7c3aed)",
            color: "white", fontSize: 17, fontWeight: 700,
            textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 10,
            boxShadow: "0 10px 40px rgba(59,130,246,0.3), 0 0 0 1px rgba(59,130,246,0.15)",
            letterSpacing: "-0.01em",
          }}>
            Get Started Free <ArrowRight size={20} />
          </Link>
        </section>

        {/* Footer */}
        <footer className="landing-footer" style={{
          padding: "36px 40px",
          textAlign: "center",
          color: "#334155", fontSize: 13,
        }}>
          <div className="landing-divider" style={{ marginBottom: 28 }} />
          <div style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            gap: 6, flexWrap: "wrap",
          }}>
            <span>© 2026</span>
            <a
              href="https://conmitto.io"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-footer-link"
              style={{ fontWeight: 600 }}
            >
              Conmitto Inc
            </a>
            <span>·</span>
            <span>Built for autonomous vending</span>
          </div>
        </footer>

      </div>
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

