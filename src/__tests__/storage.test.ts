/**
 * Unit tests for storage utility functions.
 * Uses a localStorage mock since these run under jest-environment-jsdom.
 */

import {
  getEntries,
  saveEntry,
  getTodayEntry,
  getChatHistory,
  saveChatHistory,
  clearChatHistory,
  getProfile,
  saveProfile,
  getStreakDays,
  getRecentEntries,
} from "../lib/storage";
import type { MoodEntry, ChatMessage } from "../types";
import type { UserProfile } from "../lib/storage";

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

function makeEntry(overrides: Partial<MoodEntry> = {}): MoodEntry {
  return {
    id: overrides.id ?? overrides.date ?? "e1",
    date: overrides.date ?? "2024-01-01",
    mood: overrides.mood ?? 3,
    stress: overrides.stress ?? 3,
    journalText: overrides.journalText ?? "",
    examType: overrides.examType ?? "JEE",
    tags: overrides.tags ?? [],
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    ...overrides,
  };
}

function seedEntries(entries: Partial<MoodEntry>[]) {
  const full = entries.map((e, i) => makeEntry({ id: e.date ?? `e${i}`, ...e }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
}

beforeEach(() => {
  localStorage.clear();
});

// ─── getEntries / saveEntry ────────────────────────────────────────────────────

describe("getEntries", () => {
  it("returns an empty array when nothing is stored", () => {
    expect(getEntries()).toEqual([]);
  });

  it("returns an empty array if stored JSON is corrupted", () => {
    localStorage.setItem(STORAGE_KEY, "{not valid json");
    expect(getEntries()).toEqual([]);
  });
});

describe("saveEntry", () => {
  it("adds a new entry to the front of the list", () => {
    const entry = makeEntry({ id: "a", date: "2024-01-01" });
    saveEntry(entry);
    const entries = getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe("a");
  });

  it("updates an existing entry in place rather than duplicating it", () => {
    const entry = makeEntry({ id: "a", date: "2024-01-01", mood: 3 });
    saveEntry(entry);

    const updated = makeEntry({ id: "a", date: "2024-01-01", mood: 5 });
    saveEntry(updated);

    const entries = getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].mood).toBe(5);
  });

  it("prepends newer entries while keeping older ones", () => {
    saveEntry(makeEntry({ id: "a", date: "2024-01-01" }));
    saveEntry(makeEntry({ id: "b", date: "2024-01-02" }));

    const entries = getEntries();
    expect(entries).toHaveLength(2);
    expect(entries[0].id).toBe("b");
    expect(entries[1].id).toBe("a");
  });

  it("caps stored history at 365 entries", () => {
    for (let i = 0; i < 400; i++) {
      saveEntry(makeEntry({ id: `e${i}`, date: `2024-${String((i % 12) + 1).padStart(2, "0")}-01` }));
    }
    expect(getEntries().length).toBeLessThanOrEqual(365);
  });
});

describe("getTodayEntry", () => {
  it("returns null when there is no entry for today", () => {
    seedEntries([{ date: "2000-01-01" }]);
    expect(getTodayEntry()).toBeNull();
  });

  it("returns the entry matching today's date", () => {
    const today = new Date().toISOString().split("T")[0];
    seedEntries([{ date: today, mood: 4, stress: 2 }]);
    const entry = getTodayEntry();
    expect(entry).not.toBeNull();
    expect(entry?.date).toBe(today);
    expect(entry?.mood).toBe(4);
  });
});

// ─── Chat history ───────────────────────────────────────────────────────────

describe("chat history", () => {
  const msg = (content: string, ts = "2024-01-01T00:00:00.000Z"): ChatMessage => ({
    role: "user",
    content,
    timestamp: ts,
  });

  it("returns an empty array when nothing is stored", () => {
    expect(getChatHistory()).toEqual([]);
  });

  it("returns an empty array if stored JSON is corrupted", () => {
    localStorage.setItem("mindmate_chat", "not json");
    expect(getChatHistory()).toEqual([]);
  });

  it("saves and retrieves chat history", () => {
    const messages = [msg("hello"), msg("world")];
    saveChatHistory(messages);
    expect(getChatHistory()).toEqual(messages);
  });

  it("caps stored history at 50 messages", () => {
    const messages = Array.from({ length: 80 }, (_, i) => msg(`msg ${i}`));
    saveChatHistory(messages);
    const stored = getChatHistory();
    expect(stored).toHaveLength(50);
    // Should keep the most recent 50 (tail), not the first 50.
    expect(stored[stored.length - 1].content).toBe("msg 79");
  });

  it("clears chat history", () => {
    saveChatHistory([msg("hello")]);
    clearChatHistory();
    expect(getChatHistory()).toEqual([]);
  });
});

// ─── User profile ───────────────────────────────────────────────────────────

describe("user profile", () => {
  const profile: UserProfile = {
    name: "Aman",
    examType: "JEE",
    examDate: "2026-05-01",
    onboarded: true,
  };

  it("returns null when no profile is stored", () => {
    expect(getProfile()).toBeNull();
  });

  it("returns null if stored JSON is corrupted", () => {
    localStorage.setItem("mindmate_profile", "{bad json");
    expect(getProfile()).toBeNull();
  });

  it("saves and retrieves a profile", () => {
    saveProfile(profile);
    expect(getProfile()).toEqual(profile);
  });

  it("overwrites a previously saved profile", () => {
    saveProfile(profile);
    saveProfile({ ...profile, name: "Riya" });
    expect(getProfile()?.name).toBe("Riya");
  });
});

// ─── getStreakDays ──────────────────────────────────────────────────────────

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
    // Skip yesterday -> gap
    seedEntries([
      { date: today.toISOString().split("T")[0] },
      { date: twoDaysAgo.toISOString().split("T")[0] },
    ]);
    expect(getStreakDays()).toBe(1);
  });

  it("returns 0 if today has no entry, even with a past streak", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    seedEntries([
      { date: yesterday.toISOString().split("T")[0] },
      { date: twoDaysAgo.toISOString().split("T")[0] },
    ]);
    expect(getStreakDays()).toBe(0);
  });
});

// ─── getRecentEntries ───────────────────────────────────────────────────────

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

  it("returns an empty array when there are no entries", () => {
    expect(getRecentEntries(7)).toEqual([]);
  });
});