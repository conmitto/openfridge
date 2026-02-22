"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Video, VideoOff } from "lucide-react";

export default function WebcamFeed() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [active, setActive] = useState(false);
    const [enabled, setEnabled] = useState(true);
    const [error, setError] = useState(false);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: 640, height: 360 },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setActive(true);
            setError(false);
        } catch {
            setError(true);
        }
    }, []);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setActive(false);
    }, []);

    useEffect(() => {
        if (enabled) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => {
            streamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, [enabled, startCamera, stopCamera]);

    const toggleCamera = () => setEnabled((prev) => !prev);

    // Camera off state
    if (!enabled || error) {
        return (
            <div style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.3)",
                borderRadius: 14,
                color: "#475569",
                gap: 8,
                position: "relative",
            }}>
                <VideoOff size={24} />
                <span style={{ fontSize: 11, fontWeight: 500 }}>
                    {error ? "Camera unavailable" : "Camera off"}
                </span>

                {/* Toggle button */}
                {!error && (
                    <button
                        onClick={toggleCamera}
                        style={{
                            position: "absolute", bottom: 10, right: 10,
                            width: 32, height: 32, borderRadius: 8,
                            background: "rgba(59,130,246,0.15)",
                            border: "1px solid rgba(59,130,246,0.3)",
                            color: "#3b82f6", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        <Video size={14} />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div style={{
            width: "100%",
            height: "100%",
            position: "relative",
            borderRadius: 14,
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

            {/* LIVE badge */}
            <div style={{
                position: "absolute",
                top: 8,
                left: 8,
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
                padding: "4px 8px",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 600,
                color: "#f1f5f9",
            }}>
                <div style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: "#ef4444",
                    boxShadow: "0 0 6px #ef4444",
                    animation: "blink 1.5s ease-in-out infinite",
                }} />
                LIVE
            </div>

            {/* Toggle off button */}
            <button
                onClick={toggleCamera}
                style={{
                    position: "absolute", bottom: 8, right: 8,
                    width: 32, height: 32, borderRadius: 8,
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#94a3b8", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s ease",
                }}
            >
                <VideoOff size={14} />
            </button>

            {!active && (
                <div style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                }}>
                    <Video size={28} className="animate-pulse" />
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
