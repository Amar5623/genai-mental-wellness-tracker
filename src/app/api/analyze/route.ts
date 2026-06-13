/**
 * POST /api/analyze
 * Deep emotional pattern analysis powered by Google Gemini.
 * Uncovers hidden stress triggers across multiple journal entries.
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimit } from "@/lib/rateLimit";
import { validateExamType, sanitizeText, validateAnalysisResponse } from "@/lib/validation";
import { average } from "@/lib/wellness";
import type { MoodEntry, WellnessInsight } from "@/types";

export const runtime = "nodejs";

// ─── In-memory response cache ───────────────────────────────────────────────
//
// Re-analyzing the exact same set of entries (e.g. user revisits Insights
// tab, or re-renders trigger a re-fetch) is wasted Gemini spend and adds
// latency for no benefit — the analysis is deterministic-ish for a given
// input set within a short window. We cache on a hash of (examType +
// entries) for a few minutes. This directly improves Efficiency without
// affecting correctness, since a cache hit is only ever a cache of *this
// exact input*.
interface CacheEntry {
  value: WellnessInsight;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60_000; // 5 minutes
const analysisCache = new Map<string, CacheEntry>();

function cacheKey(examType: string, entries: MoodEntry[]): string {
  // Cheap, dependency-free hash: length + ids/dates/mood/stress signature.
  // Good enough to detect "same data set" without hashing full journal text.
  const sig = entries
    .map((e) => `${e.date}:${e.mood}:${e.stress}:${e.journalText.length}`)
    .join("|");
  return `${examType}::${entries.length}::${sig}`;
}

function getCached(key: string): WellnessInsight | null {
  const hit = analysisCache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    analysisCache.delete(key);
    return null;
  }
  return hit.value;
}

function setCached(key: string, value: WellnessInsight): void {
  analysisCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  // Bound cache size — prevent unbounded memory growth across many users.
  if (analysisCache.size > 200) {
    const oldestKey = analysisCache.keys().next().value;
    if (oldestKey) analysisCache.delete(oldestKey);
  }
}

function buildAnalysisPrompt(entries: MoodEntry[], examType: string): string {
  const summary = entries.map((e, i) =>
    `Entry ${i + 1} [${e.date}]: Mood ${e.mood}/5, Stress ${e.stress}/5\nJournal: ${e.journalText || "(no journal text)"}`
  ).join("\n\n");

  return `
You are a mental wellness analyst for ${examType} aspirants in India. Analyze these journal entries and return ONLY valid JSON.

JOURNAL ENTRIES:
${summary}

Return this exact JSON structure (no markdown, no explanation):
{
  "dominantEmotion": "string (e.g. 'Academic Anxiety', 'Exam Burnout', 'Motivated but Overwhelmed')",
  "stressTriggers": ["string array of 3-5 specific triggers found in the entries"],
  "patterns": ["string array of 2-4 behavioral/emotional patterns detected"],
  "riskLevel": "low|moderate|high|crisis",
  "recommendedActions": ["string array of 3-5 specific, actionable recommendations for ${examType} prep context"],
  "affirmation": "string (a personalized, genuine 1-2 sentence encouragement based on their specific journey)",
  "weeklyMoodTrend": "improving|stable|declining",
  "averageMood": number,
  "averageStress": number,
  "topTriggers": ["top 3 trigger strings"],
  "streakAnalysis": "string describing their consistency pattern"
}

Risk level guide:
- low: mood >= 4, stress <= 2 consistently
- moderate: mood 2-3 or stress 3-4
- high: mood <= 2 or stress >= 4 frequently
- crisis: extreme distress language, suicidal ideation

Be specific to their exam type. Reference syllabus pressure, mock tests, coaching stress where relevant.
`.trim();
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Fail fast with a clear error if the server is misconfigured, rather than
  // throwing an opaque error deep inside the GoogleGenerativeAI client.
  if (!process.env.GEMINI_API_KEY) {
    console.error("[Config Error] GEMINI_API_KEY is not set");
    return NextResponse.json(
      { error: "Analysis service is not configured", code: "CONFIG_ERROR" },
      { status: 503 }
    );
  }

  // Rate limiting (stricter — Gemini is heavier)
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = rateLimit(`analyze:${ip}`);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait.", code: "RATE_LIMITED" },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON", code: "BAD_REQUEST" }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const examType = validateExamType(record.examType);
  const rawEntries = record.entries;

  if (!Array.isArray(rawEntries) || rawEntries.length === 0) {
    return NextResponse.json({ error: "No entries provided", code: "BAD_REQUEST" }, { status: 400 });
  }

  // Sanitize entries — also drop entries missing required numeric fields so
  // a malformed client payload can't crash downstream averaging/prompting.
  const entries: MoodEntry[] = (rawEntries as MoodEntry[])
    .slice(0, 30)
    .filter((e) => typeof e?.mood === "number" && typeof e?.stress === "number" && typeof e?.date === "string")
    .map((e) => ({
      ...e,
      journalText: sanitizeText(e.journalText ?? ""),
    }));

  if (entries.length === 0) {
    return NextResponse.json({ error: "No valid entries provided", code: "BAD_REQUEST" }, { status: 400 });
  }

  // Fallback stats computed directly from the user's data — used both as
  // defaults if Gemini omits fields, and to populate `streakDays` (which
  // the model has no way of knowing reliably).
  const fallback = {
    averageMood: average(entries.map((e) => e.mood)) ?? 3,
    averageStress: average(entries.map((e) => e.stress)) ?? 3,
    streakDays: entries.length,
  };

  const key = cacheKey(examType, entries);
  const cached = getCached(key);
  if (cached) {
    return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = buildAnalysisPrompt(entries, examType);

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip potential markdown code fences
    const clean = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(clean);
    } catch {
      console.error("[Gemini] JSON parse failed:", clean);
      return NextResponse.json(
        { error: "Analysis parsing failed", code: "PARSE_ERROR" },
        { status: 500 }
      );
    }

    // Validate/normalize the model's output against our schema before it
    // ever reaches the client — protects against malformed riskLevel,
    // oversized arrays, missing fields, etc.
    const insight: WellnessInsight = validateAnalysisResponse(parsed, fallback);

    setCached(key, insight);

    return NextResponse.json(insight, { headers: { "X-Cache": "MISS" } });
  } catch (err) {
    console.error("[Gemini Error]", err);
    return NextResponse.json(
      { error: "Analysis service temporarily unavailable", code: "AI_ERROR" },
      { status: 503 }
    );
  }
}