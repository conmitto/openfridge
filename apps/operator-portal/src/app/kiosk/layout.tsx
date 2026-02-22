export default function KioskLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #0a0e1a 0%, #131832 40%, #0d1426 100%)",
            color: "#e2e8f0",
        }}>
            {children}
        </div>
    );
}
