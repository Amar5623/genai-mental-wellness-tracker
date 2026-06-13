/**
 * Unit tests for shared wellness/UI utility functions.
 */

import {
    getMoodColor,
    getStressColor,
    getGreeting,
    daysUntilExam,
    average,
    computeMoodTrend,
    getHeatmapDays,
    getRecentDaySummaries,
    capitalize,
    MOOD_COLOR_SCALE,
    RISK_COLORS,
} from "../lib/wellness";
import type { MoodEntry } from "../types";

function entry(date: string, mood: 1 | 2 | 3 | 4 | 5, stress: 1 | 2 | 3 | 4 | 5 = 3): MoodEntry {
    return {
        id: date,
        date,
        mood,
        stress,
        journalText: "",
        examType: "JEE",
        tags: [],
        createdAt: new Date().toISOString(),
    };
}

// ─── getMoodColor / getStressColor ────────────────────────────────────────

describe("getMoodColor", () => {
    it("returns the configured color for each level 1-5", () => {
        [1, 2, 3, 4, 5].forEach((level) => {
            expect(getMoodColor(level)).toBe(MOOD_COLOR_SCALE[level]);
        });
    });

    it("falls back to gray for out-of-range values", () => {
        expect(getMoodColor(0)).toBe("#6b7280");
        expect(getMoodColor(6)).toBe("#6b7280");
    });
});

describe("getStressColor", () => {
    it("inverts the mood scale (high stress -> mood-1 color)", () => {
        expect(getStressColor(5)).toBe(getMoodColor(1));
        expect(getStressColor(1)).toBe(getMoodColor(5));
    });
});

// ─── getGreeting ───────────────────────────────────────────────────────────

describe("getGreeting", () => {
    it("returns Good morning before noon", () => {
        expect(getGreeting(new Date("2024-01-01T08:00:00"))).toBe("Good morning");
    });

    it("returns Good afternoon between 12 and 17", () => {
        expect(getGreeting(new Date("2024-01-01T14:00:00"))).toBe("Good afternoon");
    });

    it("returns Good evening after 17", () => {
        expect(getGreeting(new Date("2024-01-01T20:00:00"))).toBe("Good evening");
    });
});

// ─── daysUntilExam ─────────────────────────────────────────────────────────

describe("daysUntilExam", () => {
    const today = new Date("2024-06-01T00:00:00");

    it("returns null for an empty date", () => {
        expect(daysUntilExam("", today)).toBeNull();
    });

    it("returns null for an invalid date string", () => {
        expect(daysUntilExam("not-a-date", today)).toBeNull();
    });

    it("returns null for a date in the past", () => {
        expect(daysUntilExam("2024-05-01", today)).toBeNull();
    });

    it("returns the number of days remaining for a future date", () => {
        expect(daysUntilExam("2024-06-11", today)).toBe(10);
    });
});

// ─── average ───────────────────────────────────────────────────────────────

describe("average", () => {
    it("returns null for an empty array", () => {
        expect(average([])).toBeNull();
    });

    it("computes the arithmetic mean", () => {
        expect(average([1, 2, 3, 4])).toBe(2.5);
    });
});

// ─── computeMoodTrend ──────────────────────────────────────────────────────

describe("computeMoodTrend", () => {
    it("returns stable with fewer than 2 entries", () => {
        expect(computeMoodTrend([])).toBe("stable");
        expect(computeMoodTrend([entry("2024-06-01", 3)])).toBe("stable");
    });

    it("returns up when the newest entry has a higher mood than the oldest", () => {
        const recent = [entry("2024-06-07", 5), entry("2024-06-01", 2)];
        expect(computeMoodTrend(recent)).toBe("up");
    });

    it("returns down when the newest entry has a lower mood than the oldest", () => {
        const recent = [entry("2024-06-07", 2), entry("2024-06-01", 5)];
        expect(computeMoodTrend(recent)).toBe("down");
    });

    it("returns stable when mood is unchanged", () => {
        const recent = [entry("2024-06-07", 3), entry("2024-06-01", 3)];
        expect(computeMoodTrend(recent)).toBe("stable");
    });
});

// ─── getHeatmapDays ────────────────────────────────────────────────────────

describe("getHeatmapDays", () => {
    const today = new Date("2024-06-10T00:00:00");

    it("returns the requested number of days, oldest first", () => {
        const days = getHeatmapDays([], 28, today);
        expect(days).toHaveLength(28);
        expect(days[27].dateStr).toBe("2024-06-10");
        expect(days[0].dateStr).toBe("2024-05-14");
    });

    it("attaches matching entries by date", () => {
        const days = getHeatmapDays([entry("2024-06-10", 4)], 28, today);
        expect(days[27].entry?.mood).toBe(4);
        expect(days[0].entry).toBeNull();
    });
});

// ─── getRecentDaySummaries ─────────────────────────────────────────────────

describe("getRecentDaySummaries", () => {
    const today = new Date("2024-06-10T00:00:00");

    it("returns mood/stress for matching days and null for missing days", () => {
        const summaries = getRecentDaySummaries([entry("2024-06-10", 4, 2)], 7, today);
        expect(summaries).toHaveLength(7);
        const todaySummary = summaries[summaries.length - 1];
        expect(todaySummary.mood).toBe(4);
        expect(todaySummary.stress).toBe(2);
        expect(summaries[0].mood).toBeNull();
    });
});

// ─── capitalize ────────────────────────────────────────────────────────────

describe("capitalize", () => {
    it("capitalizes the first letter only", () => {
        expect(capitalize("high")).toBe("High");
        expect(capitalize("moderate risk")).toBe("Moderate risk");
    });

    it("returns empty string unchanged", () => {
        expect(capitalize("")).toBe("");
    });
});

// ─── RISK_COLORS sanity check ────────────────────────────────────────────

describe("RISK_COLORS", () => {
    it("has an entry for every supported risk level", () => {
        ["low", "moderate", "high", "crisis"].forEach((level) => {
            expect(RISK_COLORS[level]).toBeDefined();
        });
    });
});