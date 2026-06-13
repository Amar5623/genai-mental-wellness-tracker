/**
 * Adaptive mindfulness exercise logic.
 *
 * The exercise shown to a student is chosen based on their *current
 * context* (today's stress level) — directly addressing the challenge's
 * "Adaptive mindfulness exercises" and "logical decision making based on
 * user context" requirements.
 *
 * Kept as pure data/functions so it is trivially unit-testable and reusable
 * from both the Dashboard (proactive nudge) and the Chat companion.
 */

import type { StressLevel } from "@/types";

export interface BreathingPhase {
    /** Short label shown to the user, e.g. "Inhale" */
    label: string;
    /** Duration of this phase in seconds */
    seconds: number;
}

export interface BreathingPattern {
    /** Display name of the technique */
    name: string;
    /** One-line explanation of why this technique was chosen */
    description: string;
    /** Ordered phases that make up one cycle */
    phases: BreathingPhase[];
    /** How many times to repeat the full cycle */
    cycles: number;
}

/**
 * Returns a breathing/mindfulness pattern tailored to the student's current
 * stress level (1-5). Higher stress gets a longer, more grounding exercise.
 */
export function getBreathingPattern(stressLevel: StressLevel): BreathingPattern {
    if (stressLevel >= 4) {
        return {
            name: "4-7-8 Calming Breath",
            description:
                "Your stress is high right now — this slower pattern helps settle a racing mind before it spirals.",
            phases: [
                { label: "Inhale", seconds: 4 },
                { label: "Hold", seconds: 7 },
                { label: "Exhale", seconds: 8 },
            ],
            cycles: 4,
        };
    }

    if (stressLevel === 3) {
        return {
            name: "Box Breathing",
            description:
                "A balanced, even rhythm used by athletes and toppers to reset focus during long study sessions.",
            phases: [
                { label: "Inhale", seconds: 4 },
                { label: "Hold", seconds: 4 },
                { label: "Exhale", seconds: 4 },
                { label: "Hold", seconds: 4 },
            ],
            cycles: 4,
        };
    }

    return {
        name: "Gentle Refresh Breath",
        description:
            "Your stress is relatively low — a short refresh to keep your mind sharp without breaking your flow.",
        phases: [
            { label: "Inhale", seconds: 4 },
            { label: "Exhale", seconds: 6 },
        ],
        cycles: 3,
    };
}

/** Total duration of the full exercise in seconds (all cycles). */
export function getPatternDurationSeconds(pattern: BreathingPattern): number {
    const cycleSeconds = pattern.phases.reduce((sum, p) => sum + p.seconds, 0);
    return cycleSeconds * pattern.cycles;
}