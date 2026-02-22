"use client";

import { useEffect, useRef, useState } from "react";
import { Video, VideoOff } from "lucide-react";

export default function WebcamFeed() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [active, setActive] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user", width: 640, height: 480 },
                    audio: false,
                });
                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setActive(true);
            } catch {
                setError(true);
            }
        }

        startCamera();

        return () => {
            cancelled = true;
            streamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    if (error) {
        return (
            <div style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.3)",
                borderRadius: 16,
                color: "#475569",
                gap: 8,
            }}>
                <VideoOff size={28} />
                <span style={{ fontSize: 12, fontWeight: 500 }}>Camera unavailable</span>
            </div>
        );
    }

    return (
        <div style={{
            width: "100%",
            height: "100%",
            position: "relative",
            borderRadius: 16,
            overflow: "hidden",
            background: "rgba(0,0,0,0.4)",
        }}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: "scaleX(-1)",
                    opacity: active ? 1 : 0,
                    transition: "opacity 0.5s ease",
                }}
            />

            {/* Live badge */}
            <div style={{
                position: "absolute",
                top: 12,
                left: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
                padding: "5px 10px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 600,
                color: "#f1f5f9",
            }}>
                <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#ef4444",
                    boxShadow: "0 0 6px #ef4444",
                    animation: "blink 1.5s ease-in-out infinite",
                }} />
                LIVE
            </div>

            {!active && (
                <div style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                }}>
                    <Video size={32} className="animate-pulse" />
                </div>
            )}

            <style>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
}
