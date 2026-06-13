/**
 * Unit tests for storage utility functions.
 * Uses localStorage mock provided by jest-environment-jsdom.
 */

import { getStreakDays, getRecentEntries } from "../lib/storage";
import type { MoodEntry } from "../types";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, "localStorage", { value: localStorageMock });

const STORAGE_KEY = "mindmate_entries";

function seedEntries(entries: Partial<MoodEntry>[]) {
  const full = entries.map((e, i) => ({
    id: e.date ?? `e${i}`,
    date: e.date ?? "2024-01-01",
    mood: e.mood ?? 3,
    stress: e.stress ?? 3,
    journalText: e.journalText ?? "",
    examType: "JEE",
    tags: [],
    createdAt: new Date().toISOString(),
    ...e,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
}

beforeEach(() => {
  localStorage.clear();
});

describe("getStreakDays", () => {
  it("returns 0 when no entries", () => {
    expect(getStreakDays()).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    seedEntries([
      { date: today.toISOString().split("T")[0] },
      { date: yesterday.toISOString().split("T")[0] },
    ]);
    expect(getStreakDays()).toBe(2);
  });

  it("stops counting at gap", () => {
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    // Skip yesterday → gap
    seedEntries([
      { date: today.toISOString().split("T")[0] },
      { date: twoDaysAgo.toISOString().split("T")[0] },
    ]);
    expect(getStreakDays()).toBe(1);
  });
});

describe("getRecentEntries", () => {
  it("returns entries within the last N days", () => {
    const today = new Date();
    const old = new Date(today);
    old.setDate(old.getDate() - 10);

    seedEntries([
      { date: today.toISOString().split("T")[0] },
      { date: old.toISOString().split("T")[0] },
    ]);

    const recent = getRecentEntries(7);
    expect(recent).toHaveLength(1);
    expect(recent[0].date).toBe(today.toISOString().split("T")[0]);
  });

  it("returns all entries when all are within range", () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    seedEntries([
      { date: today.toISOString().split("T")[0] },
      { date: yesterday.toISOString().split("T")[0] },
    ]);
    expect(getRecentEntries(7)).toHaveLength(2);
  });
});
