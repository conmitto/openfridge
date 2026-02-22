"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Server,
    Package,
    AlertTriangle,
    Snowflake,
    Menu,
    X,
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/machines", label: "Machines", icon: Server },
    { href: "/inventory", label: "Inventory", icon: Package },
    { href: "/restock", label: "Restock", icon: AlertTriangle },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile viewport
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Desktop: always visible
    if (!isMobile) {
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
                <SidebarContent pathname={pathname} />
            </aside>
        );
    }

    // Mobile: hamburger + slide-out drawer
    return (
        <>
            {/* Mobile header bar */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 56,
                    background: "var(--bg-secondary)",
                    borderBottom: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 16px",
                    zIndex: 40,
                    gap: 12,
                }}
            >
                <button
                    onClick={() => setOpen(true)}
                    style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        padding: 4,
                    }}
                >
                    <Menu size={22} />
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: "var(--gradient-blue)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Snowflake size={14} color="white" />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>OpenFridge</span>
                </div>
            </div>

            {/* Overlay */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(4px)",
                        zIndex: 45,
                        animation: "fadeIn 0.2s ease",
                    }}
                />
            )}

            {/* Slide-out drawer */}
            <aside
                style={{
                    position: "fixed",
                    top: 0,
                    left: open ? 0 : -280,
                    width: 270,
                    height: "100vh",
                    background: "var(--bg-secondary)",
                    borderRight: "1px solid var(--border-subtle)",
                    display: "flex",
                    flexDirection: "column",
                    padding: "24px 16px",
                    zIndex: 50,
                    transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    overflowY: "auto",
                }}
            >
                <button
                    onClick={() => setOpen(false)}
                    style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                    }}
                >
                    <X size={18} />
                </button>
                <SidebarContent pathname={pathname} />
            </aside>
        </>
    );
}

function SidebarContent({ pathname }: { pathname: string }) {
    return (
        <>
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
        </>
    );
}
