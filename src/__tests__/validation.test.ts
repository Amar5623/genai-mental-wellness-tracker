/**
 * Unit tests for input validation and sanitization utilities.
 * Run with: npx jest (or vitest)
 */

import {
  sanitizeText,
  validateExamType,
  validateLevel,
  validateMessages,
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
});

// ─── detectCrisis ─────────────────────────────────────────────────────────────

describe("detectCrisis", () => {
  it("detects crisis keywords", () => {
    expect(detectCrisis("I want to kill myself")).toBe(true);
    expect(detectCrisis("I don't want to live anymore")).toBe(true);
    expect(detectCrisis("thinking about suicide")).toBe(true);
    expect(detectCrisis("feeling like I want to end my life")).toBe(true);
  });

  it("returns false for normal text", () => {
    expect(detectCrisis("I'm stressed about JEE")).toBe(false);
    expect(detectCrisis("feeling burnt out")).toBe(false);
    expect(detectCrisis("I need a break")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(detectCrisis("KILL MYSELF")).toBe(true);
  });
});
