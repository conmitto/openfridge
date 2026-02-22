import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: LucideIcon;
    color: string;
}

export default function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
    return (
        <div className="glass-card stat-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8 }}>
                        {title}
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
                        {value}
                    </div>
                    {subtitle && (
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
                            {subtitle}
                        </div>
                    )}
                </div>
                <div
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: `${color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Icon size={22} color={color} />
                </div>
            </div>
        </div>
    );
}
