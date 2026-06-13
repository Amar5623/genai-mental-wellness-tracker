/**
 * Persistent storage utilities using localStorage.
 * All data remains on-device — no server storage of personal journaling.
 */

import type { MoodEntry, ChatMessage } from "@/types";

const KEYS = {
  ENTRIES: "mindmate_entries",
  CHAT:    "mindmate_chat",
  PROFILE: "mindmate_profile",
} as const;

export interface UserProfile {
  name: string;
  examType: string;
  examDate: string;
  onboarded: boolean;
}

// ─── Mood Entries ────────────────────────────────────────────────────────────

export function getEntries(): MoodEntry[] {
  try {
    const raw = localStorage.getItem(KEYS.ENTRIES);
    if (!raw) return [];
    return JSON.parse(raw) as MoodEntry[];
  } catch {
    return [];
  }
}

export function saveEntry(entry: MoodEntry): void {
  const entries = getEntries();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.unshift(entry);
  }
  localStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries.slice(0, 365)));
}

export function getTodayEntry(): MoodEntry | null {
  const today = new Date().toISOString().split("T")[0];
  return getEntries().find((e) => e.date === today) ?? null;
}

// ─── Chat History ────────────────────────────────────────────────────────────

export function getChatHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(KEYS.CHAT);
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

export function saveChatHistory(messages: ChatMessage[]): void {
  localStorage.setItem(KEYS.CHAT, JSON.stringify(messages.slice(-50)));
}

export function clearChatHistory(): void {
  localStorage.removeItem(KEYS.CHAT);
}

// ─── User Profile ────────────────────────────────────────────────────────────

export function getProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

// ─── Analytics Helpers ───────────────────────────────────────────────────────

export function getStreakDays(): number {
  const entries = getEntries();
  if (entries.length === 0) return 0;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (entries.some((e) => e.date === dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getRecentEntries(days = 7): MoodEntry[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return getEntries().filter((e) => new Date(e.date) >= cutoff);
}
