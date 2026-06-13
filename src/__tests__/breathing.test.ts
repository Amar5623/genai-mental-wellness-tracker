/**
 * Unit tests for the adaptive mindfulness/breathing pattern logic.
 * Verifies that the chosen exercise correctly adapts to the student's
 * current context (stress level) — required by the challenge brief.
 */

import { getBreathingPattern, getPatternDurationSeconds } from "../lib/breathing";

describe("getBreathingPattern", () => {
    it("returns the 4-7-8 calming breath for high stress (4-5)", () => {
        expect(getBreathingPattern(4).name).toBe("4-7-8 Calming Breath");
        expect(getBreathingPattern(5).name).toBe("4-7-8 Calming Breath");
    });

    it("returns box breathing for moderate stress (3)", () => {
        expect(getBreathingPattern(3).name).toBe("Box Breathing");
    });

    it("returns the gentle refresh breath for low stress (1-2)", () => {
        expect(getBreathingPattern(1).name).toBe("Gentle Refresh Breath");
        expect(getBreathingPattern(2).name).toBe("Gentle Refresh Breath");
    });

    it("every pattern has at least one phase and at least one cycle", () => {
        ([1, 2, 3, 4, 5] as const).forEach((level) => {
            const pattern = getBreathingPattern(level);
            expect(pattern.phases.length).toBeGreaterThan(0);
            expect(pattern.cycles).toBeGreaterThan(0);
            pattern.phases.forEach((phase) => {
                expect(phase.seconds).toBeGreaterThan(0);
                expect(phase.label.length).toBeGreaterThan(0);
            });
        });
    });
});

describe("getPatternDurationSeconds", () => {
    it("multiplies one cycle's duration by the number of cycles", () => {
        const pattern = getBreathingPattern(3); // box breathing: 4+4+4+4 = 16s, 4 cycles
        expect(getPatternDurationSeconds(pattern)).toBe(64);
    });

    it("matches the high-stress pattern duration", () => {
        const pattern = getBreathingPattern(5); // 4+7+8 = 19s, 4 cycles
        expect(getPatternDurationSeconds(pattern)).toBe(76);
    });
});