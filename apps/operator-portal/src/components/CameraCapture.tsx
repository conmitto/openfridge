"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, X, RotateCcw } from "lucide-react";

interface CameraCaptureProps {
    onCapture: (blob: Blob) => void;
    onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [streaming, setStreaming] = useState(false);
    const [captured, setCaptured] = useState<string | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", width: 640, height: 480 },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setStreaming(true);
            }
        } catch (err) {
            console.error("Camera access denied:", err);
        }
    }, []);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setStreaming(false);
    }, []);

    const takeSnapshot = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setCaptured(dataUrl);

        canvas.toBlob(
            (blob) => {
                if (blob) onCapture(blob);
            },
            "image/jpeg",
            0.85
        );

        stopCamera();
    }, [onCapture, stopCamera]);

    const retake = useCallback(() => {
        setCaptured(null);
        startCamera();
    }, [startCamera]);

    return (
        <div
            style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 16,
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border-subtle)",
                }}
            >
                <span style={{ fontSize: 14, fontWeight: 600 }}>Camera</span>
                <button
                    onClick={() => {
                        stopCamera();
                        onClose();
                    }}
                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                >
                    <X size={18} />
                </button>
            </div>

            <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", background: "#000" }}>
                {captured ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={captured} alt="Captured" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                )}
                <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>

            <div style={{ padding: 16, display: "flex", gap: 12, justifyContent: "center" }}>
                {!streaming && !captured && (
                    <button className="btn-primary" onClick={startCamera}>
                        <Camera size={18} /> Open Camera
                    </button>
                )}
                {streaming && !captured && (
                    <button className="btn-primary" onClick={takeSnapshot}>
                        <Camera size={18} /> Take Photo
                    </button>
                )}
                {captured && (
                    <button className="btn-secondary" onClick={retake}>
                        <RotateCcw size={18} /> Retake
                    </button>
                )}
            </div>
        </div>
    );
}
