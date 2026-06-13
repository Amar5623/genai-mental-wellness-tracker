/**
 * Input validation and sanitization utilities.
 * Ensures safe, well-formed data enters the system.
 */

import type { ExamType, MoodLevel, StressLevel, ChatMessage, EmotionAnalysis } from "@/types";

const VALID_EXAM_TYPES: ExamType[] = ["JEE", "NEET", "CUET", "CAT", "GATE", "UPSC", "OTHER"];
const VALID_MOOD_LEVELS = [1, 2, 3, 4, 5] as const;
const VALID_RISK_LEVELS = ["low", "moderate", "high", "crisis"] as const;

/** Strip HTML tags and trim whitespace */
export function sanitizeText(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "")     // strip HTML
    .replace(/[<>]/g, "")        // strip stray angle brackets
    .trim()
    .slice(0, 2000);             // hard cap
}

/** Validate exam type */
export function validateExamType(input: unknown): ExamType {
  if (typeof input === "string" && VALID_EXAM_TYPES.includes(input as ExamType)) {
    return input as ExamType;
  }
  return "OTHER";
}

/** Validate mood or stress level (1–5) */
export function validateLevel(input: unknown): MoodLevel | StressLevel {
  const num = Number(input);
  if (VALID_MOOD_LEVELS.includes(num as MoodLevel)) return num as MoodLevel;
  return 3;
}

/** Validate and sanitize chat message array */
export function validateMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter(
      (m): m is ChatMessage =>
        typeof m === "object" &&
        m !== null &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .map((m) => ({
      role: m.role,
      content: sanitizeText(m.content),
      timestamp: typeof m.timestamp === "string" ? m.timestamp : new Date().toISOString(),
    }))
    .filter((m) => m.content.length > 0)
    .slice(-20); // keep last 20 messages only
}

/**
 * Crisis keyword detection — returns true if text contains distress signals.
 *
 * Expanded beyond the original explicit-suicidality list to also catch
 * common indirect/euphemistic phrasings and self-harm language that
 * students in exam-stress contexts frequently use, without over-triggering
 * on normal venting ("I'm so stressed I could die" type hyperbole is
 * intentionally NOT included — only phrases with a clear distress signal).
 */
export function detectCrisis(text: string): boolean {
  const keywords = [
    // Direct suicidal ideation
    "suicide", "suicidal", "kill myself", "end my life", "ending my life",
    "don't want to live", "do not want to live", "no point in living",
    "no reason to live", "want to die", "wish i was dead", "wish i were dead",
    "better off dead", "can't go on", "cannot go on", "give up on life",
    "take my own life", "not worth living",

    // Self-harm
    "self-harm", "self harm", "hurt myself", "harming myself", "cutting myself",
    "punish myself physically",

    // Hopelessness / planning language
    "tired of living", "nothing left to live for", "everyone would be better without me",
    "planning to end it", "way to end it all",
  ];
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

/**
 * Validates and normalizes the JSON object returned by the Gemini analysis
 * call before it is trusted/forwarded to the client. Guards against:
 *  - missing/malformed fields (model didn't follow the schema)
 *  - oversized arrays/strings (defensive cap on payload size)
 *  - invalid riskLevel values (falls back to "moderate" rather than
 *    silently passing through an unrecognized value, since the UI uses
 *    riskLevel to decide whether to show crisis resources)
 *
 * Returns a fully-populated `EmotionAnalysis`-shaped object plus the
 * extra top-level fields used to build `WellnessInsight`.
 */
export interface RawAnalysisResponse extends Partial<EmotionAnalysis> {
  weeklyMoodTrend?: unknown;
  averageMood?: unknown;
  averageStress?: unknown;
  topTriggers?: unknown;
  streakAnalysis?: unknown;
}

function sanitizeStringArray(input: unknown, maxItems: number, maxLen = 200): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item): item is string => typeof item === "string")
    .map((item) => sanitizeText(item).slice(0, maxLen))
    .filter((item) => item.length > 0)
    .slice(0, maxItems);
}

function validateRiskLevel(input: unknown): EmotionAnalysis["riskLevel"] {
  if (typeof input === "string" && (VALID_RISK_LEVELS as readonly string[]).includes(input)) {
    return input as EmotionAnalysis["riskLevel"];
  }
  return "moderate";
}

function validateTrend(input: unknown): "improving" | "stable" | "declining" {
  if (input === "improving" || input === "stable" || input === "declining") return input;
  return "stable";
}

function validateNumber(input: unknown, fallback: number, min = 0, max = 5): number {
  const num = Number(input);
  if (Number.isFinite(num) && num >= min && num <= max) return num;
  return fallback;
}

/**
 * Validates the parsed Gemini JSON payload and a set of fallback values
 * (computed from the actual journal entries) used whenever the AI response
 * omits or malforms a field. This ensures `/api/analyze` never returns a
 * payload that doesn't match the `WellnessInsight` contract, even if the
 * model drifts from its instructions.
 */
export function validateAnalysisResponse(
  raw: unknown,
  fallback: { averageMood: number; averageStress: number; streakDays: number }
): {
  weeklyMoodTrend: "improving" | "stable" | "declining";
  averageMood: number;
  averageStress: number;
  topTriggers: string[];
  streakDays: number;
  analysis: EmotionAnalysis;
} {
  const parsed = (typeof raw === "object" && raw !== null ? raw : {}) as RawAnalysisResponse;

  const stressTriggers = sanitizeStringArray(parsed.stressTriggers, 5);
  const patterns = sanitizeStringArray(parsed.patterns, 4);
  const recommendedActions = sanitizeStringArray(parsed.recommendedActions, 5);
  const topTriggers = sanitizeStringArray(parsed.topTriggers, 3).length > 0
    ? sanitizeStringArray(parsed.topTriggers, 3)
    : stressTriggers.slice(0, 3);

  const dominantEmotion = sanitizeText(parsed.dominantEmotion).slice(0, 60) || "Mixed Emotions";
  const affirmation = sanitizeText(parsed.affirmation).slice(0, 400) ||
    "You're showing up for yourself by reflecting — that consistency matters more than any single day.";

  return {
    weeklyMoodTrend: validateTrend(parsed.weeklyMoodTrend),
    averageMood: validateNumber(parsed.averageMood, fallback.averageMood),
    averageStress: validateNumber(parsed.averageStress, fallback.averageStress),
    topTriggers: topTriggers.length > 0 ? topTriggers : ["No major triggers detected"],
    streakDays: fallback.streakDays,
    analysis: {
      dominantEmotion,
      stressTriggers: stressTriggers.length > 0 ? stressTriggers : ["No specific triggers detected"],
      patterns: patterns.length > 0 ? patterns : ["Not enough data to detect patterns yet"],
      riskLevel: validateRiskLevel(parsed.riskLevel),
      recommendedActions:
        recommendedActions.length > 0
          ? recommendedActions
          : ["Take a 5-minute mindful break", "Maintain your journaling streak", "Talk to a friend or mentor about how you're feeling"],
      affirmation,
    },
  };
}

/**
 * Validates and sanitizes a streamed/raw assistant chat response before it
 * is persisted or displayed. Strips any HTML/script content the model may
 * have echoed and enforces a sane length cap.
 */
export function validateAssistantResponse(input: unknown): string {
  const text = typeof input === "string" ? input : "";
  return text
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, 4000);
}