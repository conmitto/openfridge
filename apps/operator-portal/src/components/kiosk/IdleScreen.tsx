"use client";

import { useRef, useEffect, useState } from "react";
import type { Machine } from "@/lib/supabase/types";
import WebcamFeed from "./WebcamFeed";
import type { WebcamFeedHandle } from "./WebcamFeed";
import useFaceDetection from "./useFaceDetection";
import useVoiceGreeting from "./useVoiceGreeting";
import { Scan, Sparkles } from "lucide-react";

function getTimeGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
}

function getTimeEmoji(): string {
    const hour = new Date().getHours();
    if (hour < 6) return "🌙";
    if (hour < 12) return "☀️";
    if (hour < 17) return "🌤️";
    if (hour < 20) return "🌅";
    return "🌙";
}

export default function IdleScreen({
    machine,
    onActivate,
}: {
    machine: Machine;
    onActivate: () => void;
}) {
    const webcamRef = useRef<WebcamFeedHandle>(null);
    const videoElRef = useRef<HTMLVideoElement | null>(null);
    const { speak } = useVoiceGreeting();
    const [greeting] = useState(getTimeGreeting());
    const [emoji] = useState(getTimeEmoji());
    const [time, setTime] = useState("");
    const [detected, setDetected] = useState(false);
    const [particles] = useState(() =>
        Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 2 + Math.random() * 4,
            duration: 15 + Math.random() * 20,
            delay: Math.random() * 10,
        }))
    );

    // Keep polling for the video element
    useEffect(() => {
        const interval = setInterval(() => {
            const el = webcamRef.current?.getVideoElement();
            if (el && el !== videoElRef.current) {
                videoElRef.current = el;
            }
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const { faceDetected } = useFaceDetection(videoElRef, true, 600);

    // Update clock
    useEffect(() => {
        const update = () => {
            const now = new Date();
            setTime(
                now.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                })
            );
        };
        update();
        const interval = setInterval(update, 10000);
        return () => clearInterval(interval);
    }, []);

    // Face detected → trigger greeting and transition
    useEffect(() => {
        if (faceDetected && !detected) {
            setDetected(true);
            speak(machine.name);
            // Delay to let greeting play, then activate
            setTimeout(() => {
                onActivate();
            }, 1800);
        }
    }, [faceDetected, detected, speak, machine.name, onActivate]);

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
            }}
            onClick={onActivate} // Tap to start as fallback
        >
            {/* Animated gradient background */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: detected
                        ? "radial-gradient(ellipse at 50% 30%, rgba(16,185,129,0.15) 0%, transparent 60%)"
                        : "radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.1) 0%, transparent 60%)",
                    transition: "background 1s ease",
                }}
            />

            {/* Floating particles */}
            {particles.map((p) => (
                <div
                    key={p.id}
                    style={{
                        position: "absolute",
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        borderRadius: "50%",
                        background: detected
                            ? "rgba(16,185,129,0.3)"
                            : "rgba(59,130,246,0.2)",
                        animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
                        transition: "background 1s ease",
                    }}
                />
            ))}

            {/* Time display */}
            <div
                style={{
                    position: "absolute",
                    top: 28,
                    right: 32,
                    fontSize: 14,
                    color: "#64748b",
                    fontWeight: 500,
                }}
            >
                {time}
            </div>

            {/* Machine badge */}
            <div
                style={{
                    position: "absolute",
                    top: 28,
                    left: 32,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                    }}
                >
                    ❄️
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
                        {machine.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                        {machine.location}
                    </div>
                </div>
            </div>

            {/* Center content */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 24,
                    zIndex: 1,
                    animation: "fadeIn 1s ease",
                }}
            >
                {/* Webcam circle for face detection */}
                <div
                    style={{
                        width: 180,
                        height: 180,
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: detected
                            ? "3px solid rgba(16,185,129,0.6)"
                            : "3px solid rgba(59,130,246,0.3)",
                        boxShadow: detected
                            ? "0 0 40px rgba(16,185,129,0.3), 0 0 80px rgba(16,185,129,0.1)"
                            : "0 0 40px rgba(59,130,246,0.2)",
                        transition: "all 0.8s ease",
                        animation: detected ? "none" : "breathe 3s ease-in-out infinite",
                    }}
                >
                    <WebcamFeed ref={webcamRef} large />
                </div>

                {/* Greeting text */}
                <div style={{ textAlign: "center" }}>
                    <div
                        style={{
                            fontSize: 42,
                            fontWeight: 800,
                            letterSpacing: "-0.03em",
                            background: detected
                                ? "linear-gradient(135deg, #10b981, #06b6d4)"
                                : "linear-gradient(135deg, #f1f5f9, #94a3b8)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            transition: "all 0.8s ease",
                            lineHeight: 1.2,
                        }}
                    >
                        {detected ? (
                            <>
                                {greeting}! {emoji}
                            </>
                        ) : (
                            <>
                                {greeting} {emoji}
                            </>
                        )}
                    </div>
                    <p
                        style={{
                            fontSize: 16,
                            color: detected ? "#10b981" : "#64748b",
                            marginTop: 8,
                            fontWeight: 500,
                            transition: "color 0.8s ease",
                        }}
                    >
                        {detected ? (
                            <>
                                <Sparkles
                                    size={14}
                                    style={{
                                        display: "inline",
                                        marginRight: 6,
                                        verticalAlign: "middle",
                                    }}
                                />
                                Welcome! Loading your menu...
                            </>
                        ) : (
                            <>
                                <Scan
                                    size={14}
                                    style={{
                                        display: "inline",
                                        marginRight: 6,
                                        verticalAlign: "middle",
                                        animation: "pulse 2s ease-in-out infinite",
                                    }}
                                />
                                Walk up to get started
                            </>
                        )}
                    </p>
                </div>

                {/* Tap hint */}
                {!detected && (
                    <p
                        style={{
                            fontSize: 11,
                            color: "#334155",
                            marginTop: 12,
                            animation: "fadeInUp 1s ease 0.5s both",
                        }}
                    >
                        or tap anywhere to begin
                    </p>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes breathe {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(59,130,246,0.2); }
                    50% { transform: scale(1.03); box-shadow: 0 0 60px rgba(59,130,246,0.3); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
                    25% { transform: translateY(-20px) translateX(10px); opacity: 0.7; }
                    50% { transform: translateY(-10px) translateX(-5px); opacity: 0.4; }
                    75% { transform: translateY(-30px) translateX(15px); opacity: 0.6; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
}
