"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Wind, Play, Pause, RotateCcw } from "lucide-react";
import type { StressLevel } from "@/types";
import { getBreathingPattern } from "@/lib/breathing";
import Card from "./ui/Card";

interface Props {
    /** Today's stress level (1-5) — used to pick an appropriate technique. */
    stressLevel: StressLevel;
    /** Optional: render a more compact version (e.g. inside the chat panel). */
    compact?: boolean;
}

interface Step {
    phaseIndex: number;
    cycle: number;
}

/**
 * Adaptive mindfulness / guided-breathing exercise.
 *
 * The challenge brief explicitly calls for "Adaptive mindfulness exercises"
 * and "logical decision making based on user context" — this component
 * picks a breathing technique based on the student's current stress level
 * (see `getBreathingPattern`) and guides them through it with a simple,
 * accessible animated visual + screen-reader announcements.
 */
export default function BreathingExercise({ stressLevel, compact = false }: Props) {
    const pattern = getBreathingPattern(stressLevel);

    // Flatten the pattern into a linear sequence of (phase, cycle) steps so the
    // timer logic only ever has to deal with "current step index".
    const steps: Step[] = useMemo(() => {
        const result: Step[] = [];
        for (let c = 1; c <= pattern.cycles; c++) {
            pattern.phases.forEach((_, phaseIndex) => result.push({ phaseIndex, cycle: c }));
        }
        return result;
    }, [pattern]);

    const [active, setActive] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [secondsLeft, setSecondsLeft] = useState(pattern.phases[0].seconds);
    const [announcement, setAnnouncement] = useState("");
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const current = steps[stepIndex];
    const phase = pattern.phases[current.phaseIndex];

    const reset = () => {
        setActive(false);
        setCompleted(false);
        setStepIndex(0);
        setSecondsLeft(pattern.phases[0].seconds);
        setAnnouncement("");
    };

    // If the recommended pattern changes (stress level updated elsewhere), reset.
    useEffect(() => {
        reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pattern]);

    useEffect(() => {
        if (!active) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        intervalRef.current = setInterval(() => {
            setSecondsLeft((prevSeconds) => {
                if (prevSeconds > 1) return prevSeconds - 1;

                // Current step is finishing — move on.
                setStepIndex((prevStep) => {
                    const isLastStep = prevStep === steps.length - 1;
                    if (isLastStep) {
                        setActive(false);
                        setCompleted(true);
                        setAnnouncement("Exercise complete. Well done!");
                        return prevStep;
                    }
                    const next = prevStep + 1;
                    const nextPhase = pattern.phases[steps[next].phaseIndex];
                    setAnnouncement(`${nextPhase.label} for ${nextPhase.seconds} seconds`);
                    setSecondsLeft(nextPhase.seconds);
                    return next;
                });

                return prevSeconds; // overwritten above when advancing to a new step
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [active, pattern, steps]);

    const handleStart = () => {
        if (completed) reset();
        setAnnouncement(`${pattern.phases[0].label} for ${pattern.phases[0].seconds} seconds`);
        setActive(true);
    };

    const handlePause = () => setActive(false);

    // Visual scale: bigger on "Inhale", smaller on "Exhale", steady on "Hold".
    const scale = phase.label === "Inhale" ? 1.25 : phase.label === "Exhale" ? 0.85 : 1.05;

    return (
        <Card className={compact ? "p-4" : ""}>
            <div className="flex items-center gap-2 mb-2">
                <Wind className="w-4 h-4" style={{ color: "var(--color-calm)" }} aria-hidden="true" />
                <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                    {pattern.name}
                </h3>
            </div>
            <p className="text-xs mb-4" style={{ color: "var(--color-muted)" }}>
                {pattern.description}
            </p>

            <div className="flex items-center gap-6">
                {/* Animated breathing circle */}
                <div
                    className="relative shrink-0 flex items-center justify-center rounded-full transition-transform ease-in-out"
                    style={{
                        width: compact ? 72 : 96,
                        height: compact ? 72 : 96,
                        background: "linear-gradient(135deg, rgba(59,100,246,0.25), rgba(20,184,154,0.25))",
                        border: "1px solid var(--color-border)",
                        transform: `scale(${active ? scale : 1})`,
                        transitionDuration: `${phase.seconds}s`,
                    }}
                    aria-hidden="true"
                >
                    <span className="text-sm font-semibold text-center px-1" style={{ color: "var(--color-text)" }}>
                        {active ? phase.label : completed ? "Done" : "Ready?"}
                    </span>
                </div>

                <div className="flex-1">
                    {active ? (
                        <>
                            <p className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
                                {secondsLeft}s
                            </p>
                            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                                {phase.label} · Cycle {current.cycle} of {pattern.cycles}
                            </p>
                        </>
                    ) : (
                        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                            {completed
                                ? "Nice work — take that calm with you."
                                : `${pattern.phases.length} phases · ${pattern.cycles} cycles`}
                        </p>
                    )}

                    <div className="flex gap-2 mt-3">
                        {!active ? (
                            <button
                                onClick={handleStart}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
                                style={{ background: "var(--color-primary)", color: "white" }}
                            >
                                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                                {completed ? "Do it again" : "Start"}
                            </button>
                        ) : (
                            <button
                                onClick={handlePause}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
                                style={{ background: "var(--color-surface2)", color: "var(--color-text)" }}
                            >
                                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                                Pause
                            </button>
                        )}
                        <button
                            onClick={reset}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl"
                            style={{ background: "transparent", color: "var(--color-muted)", border: "1px solid var(--color-border)" }}
                            aria-label="Reset breathing exercise"
                        >
                            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Screen-reader only announcements — updates once per phase, not every second */}
            <p className="sr-only" role="status" aria-live="polite">
                {announcement}
            </p>
        </Card>
    );
}