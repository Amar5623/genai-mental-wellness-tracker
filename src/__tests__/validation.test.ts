/**
 * Unit tests for input validation and sanitization utilities.
 * Run with: npx jest
 */

import {
  sanitizeText,
  validateExamType,
  validateLevel,
  validateMessages,
  validateAnalysisResponse,
  validateAssistantResponse,
  detectCrisis,
} from "../lib/validation";

// ─── sanitizeText ─────────────────────────────────────────────────────────────

describe("sanitizeText", () => {
  it("strips HTML tags", () => {
    expect(sanitizeText("<script>alert('xss')</script>Hello")).toBe("Hello");
  });

  it("trims whitespace", () => {
    expect(sanitizeText("  hello  ")).toBe("hello");
  });

  it("caps at 2000 characters", () => {
    const long = "a".repeat(3000);
    expect(sanitizeText(long)).toHaveLength(2000);
  });

  it("returns empty string for non-string input", () => {
    expect(sanitizeText(null)).toBe("");
    expect(sanitizeText(undefined)).toBe("");
    expect(sanitizeText(42)).toBe("");
  });

  it("strips angle brackets", () => {
    expect(sanitizeText("a<b>c")).toBe("abc");
  });
});

// ─── validateExamType ─────────────────────────────────────────────────────────

describe("validateExamType", () => {
  it("accepts valid exam types", () => {
    const valid = ["JEE", "NEET", "CUET", "CAT", "GATE", "UPSC", "OTHER"];
    valid.forEach((e) => expect(validateExamType(e)).toBe(e));
  });

  it("falls back to OTHER for unknown values", () => {
    expect(validateExamType("INVALID")).toBe("OTHER");
    expect(validateExamType(null)).toBe("OTHER");
    expect(validateExamType(123)).toBe("OTHER");
  });
});

// ─── validateLevel ────────────────────────────────────────────────────────────

describe("validateLevel", () => {
  it("accepts levels 1–5", () => {
    [1, 2, 3, 4, 5].forEach((l) => expect(validateLevel(l)).toBe(l));
  });

  it("falls back to 3 for invalid levels", () => {
    expect(validateLevel(0)).toBe(3);
    expect(validateLevel(6)).toBe(3);
    expect(validateLevel("abc")).toBe(3);
    expect(validateLevel(null)).toBe(3);
  });

  it("accepts string numbers", () => {
    expect(validateLevel("4")).toBe(4);
  });
});

// ─── validateMessages ─────────────────────────────────────────────────────────

describe("validateMessages", () => {
  it("filters invalid message shapes", () => {
    const input = [
      { role: "user", content: "hello", timestamp: "2024-01-01" },
      { role: "invalid", content: "bad" },
      null,
      42,
    ];
    const result = validateMessages(input);
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe("hello");
  });

  it("sanitizes content", () => {
    const input = [{ role: "user", content: "<b>bold</b> text", timestamp: "2024-01-01" }];
    const result = validateMessages(input);
    expect(result[0].content).toBe("bold text");
  });

  it("limits to 20 messages", () => {
    const input = Array.from({ length: 30 }, (_, i) => ({
      role: "user",
      content: `msg ${i}`,
      timestamp: "2024-01-01",
    }));
    expect(validateMessages(input)).toHaveLength(20);
  });

  it("returns empty array for non-array input", () => {
    expect(validateMessages(null)).toEqual([]);
    expect(validateMessages("string")).toEqual([]);
  });

  it("drops messages that sanitize to empty content", () => {
    const input = [
      { role: "user", content: "<script></script>", timestamp: "2024-01-01" },
      { role: "user", content: "real message", timestamp: "2024-01-01" },
    ];
    const result = validateMessages(input);
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe("real message");
  });
});

// ─── detectCrisis ─────────────────────────────────────────────────────────────

describe("detectCrisis", () => {
  it("detects direct suicidal ideation keywords", () => {
    expect(detectCrisis("I want to kill myself")).toBe(true);
    expect(detectCrisis("I don't want to live anymore")).toBe(true);
    expect(detectCrisis("thinking about suicide")).toBe(true);
    expect(detectCrisis("feeling like I want to end my life")).toBe(true);
  });

  it("detects expanded indirect/hopelessness phrasings", () => {
    expect(detectCrisis("I feel like everyone would be better without me")).toBe(true);
    expect(detectCrisis("I'm so tired of living like this")).toBe(true);
    expect(detectCrisis("there's nothing left to live for")).toBe(true);
    expect(detectCrisis("I wish I were dead")).toBe(true);
    expect(detectCrisis("I've been cutting myself")).toBe(true);
    expect(detectCrisis("I feel not worth living")).toBe(true);
  });

  it("returns false for normal exam-stress venting", () => {
    expect(detectCrisis("I'm stressed about JEE")).toBe(false);
    expect(detectCrisis("feeling burnt out")).toBe(false);
    expect(detectCrisis("I need a break")).toBe(false);
    expect(detectCrisis("this mock test killed my confidence")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(detectCrisis("KILL MYSELF")).toBe(true);
  });
});

// ─── validateAnalysisResponse ──────────────────────────────────────────────────

describe("validateAnalysisResponse", () => {
  const fallback = { averageMood: 3.2, averageStress: 2.8, streakDays: 5 };

  it("passes through a well-formed response", () => {
    const raw = {
      dominantEmotion: "Exam Burnout",
      stressTriggers: ["Mock test scores", "Syllabus pressure"],
      patterns: ["Late-night studying"],
      riskLevel: "moderate",
      recommendedActions: ["Take a 10-minute walk", "Try box breathing"],
      affirmation: "You're doing better than you think.",
      weeklyMoodTrend: "improving",
      averageMood: 3.5,
      averageStress: 2.5,
      topTriggers: ["Mock test scores"],
    };
    const result = validateAnalysisResponse(raw, fallback);
    expect(result.analysis.dominantEmotion).toBe("Exam Burnout");
    expect(result.analysis.riskLevel).toBe("moderate");
    expect(result.weeklyMoodTrend).toBe("improving");
    expect(result.averageMood).toBe(3.5);
    expect(result.topTriggers).toEqual(["Mock test scores"]);
    expect(result.streakDays).toBe(5);
  });

  it("falls back gracefully for null/non-object input", () => {
    const result = validateAnalysisResponse(null, fallback);
    expect(result.analysis.riskLevel).toBe("moderate");
    expect(result.weeklyMoodTrend).toBe("stable");
    expect(result.averageMood).toBe(fallback.averageMood);
    expect(result.averageStress).toBe(fallback.averageStress);
    expect(result.analysis.stressTriggers.length).toBeGreaterThan(0);
    expect(result.analysis.recommendedActions.length).toBeGreaterThan(0);
    expect(result.analysis.affirmation.length).toBeGreaterThan(0);
  });

  it("rejects an invalid riskLevel and falls back to moderate", () => {
    const raw = { riskLevel: "extremely-bad", dominantEmotion: "Panic" };
    const result = validateAnalysisResponse(raw, fallback);
    expect(result.analysis.riskLevel).toBe("moderate");
  });

  it("rejects an invalid weeklyMoodTrend and falls back to stable", () => {
    const raw = { weeklyMoodTrend: "skyrocketing" };
    const result = validateAnalysisResponse(raw, fallback);
    expect(result.weeklyMoodTrend).toBe("stable");
  });

  it("caps array fields to their max sizes", () => {
    const raw = {
      stressTriggers: Array.from({ length: 20 }, (_, i) => `trigger ${i}`),
      patterns: Array.from({ length: 20 }, (_, i) => `pattern ${i}`),
      recommendedActions: Array.from({ length: 20 }, (_, i) => `action ${i}`),
      topTriggers: Array.from({ length: 20 }, (_, i) => `top ${i}`),
    };
    const result = validateAnalysisResponse(raw, fallback);
    expect(result.analysis.stressTriggers.length).toBeLessThanOrEqual(5);
    expect(result.analysis.patterns.length).toBeLessThanOrEqual(4);
    expect(result.analysis.recommendedActions.length).toBeLessThanOrEqual(5);
    expect(result.topTriggers.length).toBeLessThanOrEqual(3);
  });

  it("sanitizes HTML/script content from string fields", () => {
    const raw = {
      dominantEmotion: "<script>alert(1)</script>Anxiety",
      affirmation: "<b>You are strong</b>",
      stressTriggers: ["<img src=x onerror=alert(1)>Mock tests"],
    };
    const result = validateAnalysisResponse(raw, fallback);
    expect(result.analysis.dominantEmotion).not.toContain("<");
    expect(result.analysis.affirmation).not.toContain("<");
    expect(result.analysis.stressTriggers[0]).not.toContain("<");
  });

  it("derives topTriggers from stressTriggers when topTriggers is missing", () => {
    const raw = {
      stressTriggers: ["A", "B", "C", "D"],
    };
    const result = validateAnalysisResponse(raw, fallback);
    expect(result.topTriggers).toEqual(["A", "B", "C"]);
  });

  it("uses provided streakDays from fallback regardless of model output", () => {
    const raw = { streakDays: 999 };
    const result = validateAnalysisResponse(raw, fallback);
    expect(result.streakDays).toBe(fallback.streakDays);
  });

  it("clamps out-of-range averageMood/averageStress to fallback", () => {
    const raw = { averageMood: 99, averageStress: -5 };
    const result = validateAnalysisResponse(raw, fallback);
    expect(result.averageMood).toBe(fallback.averageMood);
    expect(result.averageStress).toBe(fallback.averageStress);
  });
});

// ─── validateAssistantResponse ─────────────────────────────────────────────────

describe("validateAssistantResponse", () => {
  it("strips HTML tags from assistant output", () => {
    expect(validateAssistantResponse("<b>Hello</b> there")).toBe("Hello there");
  });

  it("trims whitespace", () => {
    expect(validateAssistantResponse("  hi  ")).toBe("hi");
  });

  it("caps length at 4000 characters", () => {
    const long = "a".repeat(5000);
    expect(validateAssistantResponse(long)).toHaveLength(4000);
  });

  it("returns empty string for non-string input", () => {
    expect(validateAssistantResponse(null)).toBe("");
    expect(validateAssistantResponse(undefined)).toBe("");
  });
});