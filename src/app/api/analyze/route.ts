/**
 * POST /api/analyze
 * Deep emotional pattern analysis powered by Google Gemini.
 * Uncovers hidden stress triggers across multiple journal entries.
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimit } from "@/lib/rateLimit";
import { validateExamType, sanitizeText } from "@/lib/validation";
import type { MoodEntry, EmotionAnalysis, WellnessInsight } from "@/types";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
- low: mood ≥ 4, stress ≤ 2 consistently
- moderate: mood 2-3 or stress 3-4 
- high: mood ≤ 2 or stress ≥ 4 frequently
- crisis: extreme distress language, suicidal ideation

Be specific to their exam type. Reference syllabus pressure, mock tests, coaching stress where relevant.
`.trim();
}

export async function POST(req: NextRequest): Promise<NextResponse> {
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

  const record  = body as Record<string, unknown>;
  const examType = validateExamType(record.examType);
  const rawEntries = record.entries;

  if (!Array.isArray(rawEntries) || rawEntries.length === 0) {
    return NextResponse.json({ error: "No entries provided", code: "BAD_REQUEST" }, { status: 400 });
  }

  // Sanitize entries
  const entries: MoodEntry[] = (rawEntries as MoodEntry[])
    .slice(0, 30)
    .map((e) => ({
      ...e,
      journalText: sanitizeText(e.journalText ?? ""),
    }));

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = buildAnalysisPrompt(entries, examType);

    const result = await model.generateContent(prompt);
    const text   = result.response.text().trim();

    // Strip potential markdown code fences
    const clean = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();

    let parsed: EmotionAnalysis & Partial<WellnessInsight>;
    try {
      parsed = JSON.parse(clean);
    } catch {
      console.error("[Gemini] JSON parse failed:", clean);
      return NextResponse.json(
        { error: "Analysis parsing failed", code: "PARSE_ERROR" },
        { status: 500 }
      );
    }

    const insight: WellnessInsight = {
      weeklyMoodTrend:
        (parsed.weeklyMoodTrend as WellnessInsight["weeklyMoodTrend"]) ?? "stable",
      averageMood:
        parsed.averageMood ?? entries.reduce((s, e) => s + e.mood, 0) / entries.length,
      averageStress:
        parsed.averageStress ?? entries.reduce((s, e) => s + e.stress, 0) / entries.length,
      topTriggers: parsed.topTriggers ?? parsed.stressTriggers?.slice(0, 3) ?? [],
      streakDays:  entries.length,
      analysis: {
        dominantEmotion:    parsed.dominantEmotion,
        stressTriggers:     parsed.stressTriggers,
        patterns:           parsed.patterns,
        riskLevel:          parsed.riskLevel,
        recommendedActions: parsed.recommendedActions,
        affirmation:        parsed.affirmation,
      },
    };

    return NextResponse.json(insight);
  } catch (err) {
    console.error("[Gemini Error]", err);
    return NextResponse.json(
      { error: "Analysis service temporarily unavailable", code: "AI_ERROR" },
      { status: 503 }
    );
  }
}
