export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(160deg, #070b14 0%, #0c1425 50%, #0a101f 100%)",
            padding: 24,
        }}>
            {children}
        </div>
    );
}
