"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface FaceDetectionResult {
    faceDetected: boolean;
    faceCount: number;
}

// Declare the FaceDetector type for Chrome's Shape Detection API
declare class FaceDetector {
    constructor(options?: { fastMode?: boolean; maxDetectedFaces?: number });
    detect(image: HTMLVideoElement | HTMLCanvasElement | ImageBitmap): Promise<Array<{ boundingBox: DOMRect }>>;
}

export default function useFaceDetection(
    videoRef: React.RefObject<HTMLVideoElement | null>,
    enabled: boolean = true,
    intervalMs: number = 600
): FaceDetectionResult {
    const [result, setResult] = useState<FaceDetectionResult>({
        faceDetected: false,
        faceCount: 0,
    });
    const detectorRef = useRef<FaceDetector | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const prevFrameRef = useRef<ImageData | null>(null);

    // Initialize detector
    useEffect(() => {
        if ("FaceDetector" in window) {
            detectorRef.current = new FaceDetector({
                fastMode: true,
                maxDetectedFaces: 3,
            });
        }
    }, []);

    // Motion detection fallback using pixel diff
    const detectMotion = useCallback((video: HTMLVideoElement): boolean => {
        if (!canvasRef.current) {
            canvasRef.current = document.createElement("canvas");
            canvasRef.current.width = 120;
            canvasRef.current.height = 90;
        }
        const ctx = canvasRef.current.getContext("2d", { willReadFrequently: true });
        if (!ctx) return false;

        ctx.drawImage(video, 0, 0, 120, 90);
        const currentFrame = ctx.getImageData(0, 0, 120, 90);

        if (!prevFrameRef.current) {
            prevFrameRef.current = currentFrame;
            return false;
        }

        let diff = 0;
        const prev = prevFrameRef.current.data;
        const curr = currentFrame.data;
        for (let i = 0; i < curr.length; i += 16) {
            diff += Math.abs(curr[i] - prev[i]);
        }
        prevFrameRef.current = currentFrame;

        const avgDiff = diff / (curr.length / 16);
        return avgDiff > 12; // Threshold for significant motion
    }, []);

    // Detection loop
    useEffect(() => {
        if (!enabled) return;

        const interval = setInterval(async () => {
            const video = videoRef.current;
            if (!video || video.readyState < 2) return;

            // Try native FaceDetector first
            if (detectorRef.current) {
                try {
                    const faces = await detectorRef.current.detect(video);
                    setResult({
                        faceDetected: faces.length > 0,
                        faceCount: faces.length,
                    });
                    return;
                } catch {
                    // Fall through to motion detection
                }
            }

            // Fallback: motion detection
            const motion = detectMotion(video);
            setResult((prev) => ({
                faceDetected: motion || prev.faceDetected,
                faceCount: motion ? 1 : 0,
            }));
        }, intervalMs);

        return () => clearInterval(interval);
    }, [enabled, intervalMs, videoRef, detectMotion]);

    return result;
}
