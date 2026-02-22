"use client";

import { useCallback, useRef } from "react";

const GREETINGS = {
    morning: [
        "Good morning! Welcome.",
        "Rise and shine! What can I get you?",
        "Morning! Ready for a treat?",
    ],
    afternoon: [
        "Good afternoon! Welcome.",
        "Hey there! Need a pick-me-up?",
        "Afternoon! What sounds good?",
    ],
    evening: [
        "Good evening! Welcome.",
        "Hey! Grab something for the night.",
        "Evening! What can I get you?",
    ],
};

function getTimeOfDay(): "morning" | "afternoon" | "evening" {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
}

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export default function useVoiceGreeting() {
    const hasSpokenRef = useRef(false);
    const cooldownRef = useRef(false);

    const speak = useCallback((machineName?: string) => {
        if (hasSpokenRef.current || cooldownRef.current) return;
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

        hasSpokenRef.current = true;

        const timeOfDay = getTimeOfDay();
        let greeting = pickRandom(GREETINGS[timeOfDay]);

        // Sometimes add machine name
        if (machineName && Math.random() > 0.5) {
            greeting = greeting.replace(
                "Welcome.",
                `Welcome to ${machineName}.`
            );
        }

        const utterance = new SpeechSynthesisUtterance(greeting);
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        utterance.volume = 0.85;

        // Try to find a natural-sounding voice
        const voices = speechSynthesis.getVoices();
        const preferred = voices.find(
            (v) =>
                v.name.includes("Samantha") ||
                v.name.includes("Karen") ||
                v.name.includes("Daniel") ||
                v.name.includes("Google") ||
                v.name.includes("Natural")
        );
        if (preferred) utterance.voice = preferred;

        speechSynthesis.speak(utterance);

        // Set cooldown to prevent repeating within 10s
        cooldownRef.current = true;
        setTimeout(() => {
            cooldownRef.current = false;
        }, 10000);
    }, []);

    const reset = useCallback(() => {
        hasSpokenRef.current = false;
        speechSynthesis.cancel();
    }, []);

    return { speak, reset };
}
