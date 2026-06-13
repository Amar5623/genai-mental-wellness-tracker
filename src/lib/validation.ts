/**
 * Input validation and sanitization utilities.
 * Ensures safe, well-formed data enters the system.
 */

import type { ExamType, MoodLevel, StressLevel, ChatMessage } from "@/types";

const VALID_EXAM_TYPES: ExamType[] = ["JEE", "NEET", "CUET", "CAT", "GATE", "UPSC", "OTHER"];
const VALID_MOOD_LEVELS = [1, 2, 3, 4, 5] as const;

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
    .slice(-20); // keep last 20 messages only
}

/** Crisis keyword detection — returns true if text contains distress signals */
export function detectCrisis(text: string): boolean {
  const keywords = [
    "suicide", "kill myself", "end my life", "don't want to live",
    "no point in living", "want to die", "self-harm", "hurt myself",
    "can't go on", "give up on life",
  ];
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}
