/**
 * Shared, pure wellness/UI utility functions.
 *
 * These were previously duplicated inline across Dashboard, JournalView and
 * InsightsView (different copies of `getMoodColor`, heatmap-day generation,
 * trend calculation, etc.). Centralizing them here:
 *  - removes duplication (Code Quality)
 *  - makes the logic unit-testable in isolation (Testing)
 *  - lets components memoize derived values cheaply (Efficiency)
 */

import type { MoodEntry, MoodLevel } from "@/types";

/** 1–5 mood scale -> color (red -> teal). Index 0 is unused. */
export const MOOD_COLOR_SCALE: Record<number, string> = {
    1: "#f43f5e",
    2: "#f97316",
    3: "#eab308",
    4: "#22c55e",
    5: "#14b89a",
};

/** Returns the color associated with a mood level (1-5), falling back to gray. */
export function getMoodColor(level: number): string {
    return MOOD_COLOR_SCALE[level] ?? "#6b7280";
}

/**
 * Returns the color associated with a stress level (1-5).
 * Stress is "inverted" on the same scale: high stress (5) maps to the same
 * red used for very low mood (1).
 */
export function getStressColor(level: number): string {
    return getMoodColor(6 - level);
}

export const RISK_COLORS: Record<string, string> = {
    low: "#14b89a",
    moderate: "#eab308",
    high: "#f97316",
    crisis: "#f43f5e",
};

export const RISK_BACKGROUNDS: Record<string, string> = {
    low: "rgba(20, 184, 154, 0.1)",
    moderate: "rgba(234, 179, 8, 0.1)",
    high: "rgba(249, 115, 22, 0.1)",
    crisis: "rgba(244, 63, 94, 0.1)",
};

/** Time-of-day aware greeting. Accepts a date for testability. */
export function getGreeting(date: Date = new Date()): string {
    const h = date.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
}

/**
 * Days remaining until `dateStr` (YYYY-MM-DD), or null if the date is
 * empty, invalid, or already in the past.
 */
export function daysUntilExam(dateStr: string, today: Date = new Date()): number | null {
    if (!dateStr) return null;
    const exam = new Date(dateStr);
    if (Number.isNaN(exam.getTime())) return null;
    const diff = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
}

/** Average of a list of numbers, or null for an empty list. */
export function average(values: number[]): number | null {
    if (values.length === 0) return null;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Compares the most recent entry against the oldest entry in `recent`
 * (entries are assumed newest-first, as returned by `getEntries`).
 */
export function computeMoodTrend(recent: MoodEntry[]): "up" | "down" | "stable" {
    if (recent.length < 2) return "stable";
    const newest = recent[0].mood;
    const oldest = recent[recent.length - 1].mood;
    if (newest > oldest) return "up";
    if (newest < oldest) return "down";
    return "stable";
}

export interface HeatmapDay {
    dateStr: string;
    entry: MoodEntry | null;
}

/** Builds an array of the last `days` days (oldest first) with any matching entry. */
export function getHeatmapDays(entries: MoodEntry[], days: number, today: Date = new Date()): HeatmapDay[] {
    const byDate = new Map(entries.map((e) => [e.date, e]));
    return Array.from({ length: days }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (days - 1 - i));
        const dateStr = d.toISOString().split("T")[0];
        return { dateStr, entry: byDate.get(dateStr) ?? null };
    });
}

export interface DaySummary {
    dateStr: string;
    day: string;
    mood: MoodLevel | null;
    stress: number | null;
}

/** Builds an array of the last `days` days (oldest first) with mood/stress summaries. */
export function getRecentDaySummaries(entries: MoodEntry[], days: number, today: Date = new Date()): DaySummary[] {
    const byDate = new Map(entries.map((e) => [e.date, e]));
    return Array.from({ length: days }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (days - 1 - i));
        const dateStr = d.toISOString().split("T")[0];
        const entry = byDate.get(dateStr) ?? null;
        return {
            dateStr,
            day: d.toLocaleDateString("en-IN", { weekday: "short" }),
            mood: entry?.mood ?? null,
            stress: entry?.stress ?? null,
        };
    });
}

/** Capitalizes the first letter of a string (e.g. "high" -> "High"). */
export function capitalize(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
}