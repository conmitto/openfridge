"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Server,
    Package,
    AlertTriangle,
    Snowflake,
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/machines", label: "Machines", icon: Server },
    { href: "/inventory", label: "Inventory", icon: Package },
    { href: "/restock", label: "Restock", icon: AlertTriangle },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside
            style={{
                width: 260,
                minHeight: "100vh",
                background: "var(--bg-secondary)",
                borderRight: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                padding: "24px 16px",
            }}
        >
            {/* Logo */}
            <Link
                href="/dashboard"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    textDecoration: "none",
                    marginBottom: 40,
                    paddingLeft: 8,
                }}
            >
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "var(--gradient-blue)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Snowflake size={20} color="white" />
                </div>
                <div>
                    <div
                        style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            lineHeight: 1.2,
                        }}
                    >
                        OpenFridge
                    </div>
                    <div
                        style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: 1.5,
                        }}
                    >
                        Operator
                    </div>
                </div>
            </Link>

            {/* Navigation */}
            <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-link ${isActive ? "active" : ""}`}
                            style={{ textDecoration: "none" }}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div style={{ marginTop: "auto", paddingTop: 20 }}>
                <div
                    className="glass-card"
                    style={{
                        padding: 16,
                        background: "var(--gradient-card)",
                    }}
                >
                    <div
                        style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            marginBottom: 4,
                        }}
                    >
                        Need Help?
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                        Run schema.sql in your Supabase SQL Editor to initialize the database.
                    </div>
                </div>
            </div>
        </aside>
    );
}
