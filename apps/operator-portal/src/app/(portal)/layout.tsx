import Sidebar from "@/components/Sidebar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <main
                style={{
                    flex: 1,
                    overflowY: "auto",
                    height: "100vh",
                    padding: "32px 40px",
                }}
            >
                {children}
            </main>
        </div>
    );
}
