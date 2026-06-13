// Core domain types for MindMate

export type ExamType = "JEE" | "NEET" | "CUET" | "CAT" | "GATE" | "UPSC" | "OTHER";

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export type StressLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  id: string;
  date: string; // ISO date string
  mood: MoodLevel;
  stress: StressLevel;
  journalText: string;
  examType: ExamType;
  tags: string[];
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface EmotionAnalysis {
  dominantEmotion: string;
  stressTriggers: string[];
  patterns: string[];
  riskLevel: "low" | "moderate" | "high" | "crisis";
  recommendedActions: string[];
  affirmation: string;
}

export interface WellnessInsight {
  weeklyMoodTrend: "improving" | "stable" | "declining";
  averageMood: number;
  averageStress: number;
  topTriggers: string[];
  streakDays: number;
  analysis: EmotionAnalysis;
}

export interface ChatRequest {
  messages: ChatMessage[];
  journalContext?: string;
  examType: ExamType;
  moodLevel: MoodLevel;
  stressLevel: StressLevel;
}

export interface AnalyzeRequest {
  entries: MoodEntry[];
  examType: ExamType;
}

export interface ApiError {
  error: string;
  code: string;
}

export const MOOD_LABELS: Record<MoodLevel, string> = {
  1: "Very Low",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great",
};

export const STRESS_LABELS: Record<StressLevel, string> = {
  1: "Minimal",
  2: "Mild",
  3: "Moderate",
  4: "High",
  5: "Overwhelming",
};

export const MOOD_EMOJI: Record<MoodLevel, string> = {
  1: "😔",
  2: "😟",
  3: "😐",
  4: "🙂",
  5: "😊",
};

export const EXAM_COLORS: Record<ExamType, string> = {
  JEE:   "#3b64f6",
  NEET:  "#14b89a",
  CUET:  "#f97316",
  CAT:   "#8b5cf6",
  GATE:  "#ec4899",
  UPSC:  "#ef4444",
  OTHER: "#6b7280",
};
