"use client";

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { Video, VideoOff } from "lucide-react";

export interface WebcamFeedHandle {
    getVideoElement: () => HTMLVideoElement | null;
}

const WebcamFeed = forwardRef<WebcamFeedHandle, { large?: boolean }>(
    function WebcamFeed({ large = false }, ref) {
        const videoRef = useRef<HTMLVideoElement>(null);
        const streamRef = useRef<MediaStream | null>(null);
        const [active, setActive] = useState(false);
        const [enabled, setEnabled] = useState(true);
        const [error, setError] = useState(false);

        useImperativeHandle(ref, () => ({
            getVideoElement: () => videoRef.current,
        }));

        const startCamera = useCallback(async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user", width: 640, height: 480 },
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

        if (!enabled || error) {
            return (
                <div style={{
                    width: "100%", height: "100%",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: large ? 20 : 14,
                    color: "#475569", gap: 8,
                    position: "relative",
                }}>
                    <VideoOff size={large ? 36 : 24} />
                    <span style={{ fontSize: large ? 14 : 11, fontWeight: 500 }}>
                        {error ? "Camera unavailable" : "Camera off"}
                    </span>
                    {!error && (
                        <button onClick={toggleCamera} style={{
                            position: "absolute", bottom: 10, right: 10,
                            width: 32, height: 32, borderRadius: 8,
                            background: "rgba(59,130,246,0.15)",
                            border: "1px solid rgba(59,130,246,0.3)",
                            color: "#3b82f6", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Video size={14} />
                        </button>
                    )}
                </div>
            );
        }

        return (
            <div style={{
                width: "100%", height: "100%",
                position: "relative",
                borderRadius: large ? 20 : 14,
                overflow: "hidden",
                background: "rgba(0,0,0,0.4)",
            }}>
                <video
                    ref={videoRef}
                    autoPlay playsInline muted
                    style={{
                        width: "100%", height: "100%",
                        objectFit: "cover",
                        transform: "scaleX(-1)",
                        opacity: active ? 1 : 0,
                        transition: "opacity 0.5s ease",
                    }}
                />

                <div style={{
                    position: "absolute", top: 8, left: 8,
                    display: "flex", alignItems: "center", gap: 5,
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(8px)",
                    padding: "4px 8px", borderRadius: 6,
                    fontSize: 10, fontWeight: 600, color: "#f1f5f9",
                }}>
                    <div style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: "#ef4444",
                        boxShadow: "0 0 6px #ef4444",
                        animation: "blink 1.5s ease-in-out infinite",
                    }} />
                    LIVE
                </div>

                {!large && (
                    <button onClick={toggleCamera} style={{
                        position: "absolute", bottom: 8, right: 8,
                        width: 32, height: 32, borderRadius: 8,
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#94a3b8", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <VideoOff size={14} />
                    </button>
                )}

                {!active && (
                    <div style={{
                        position: "absolute", inset: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#64748b",
                    }}>
                        <Video size={large ? 40 : 28} className="animate-pulse" />
                    </div>
                )}

                <style>{`
                    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                `}</style>
            </div>
        );
    }
);

export default WebcamFeed;
