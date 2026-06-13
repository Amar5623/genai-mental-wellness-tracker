"use client";

import { memo, useEffect, useMemo, useState } from "react";
import {
  getEntries,
  getStreakDays,
  getTodayEntry,
  getRecentEntries,
} from "@/lib/storage";
import type { UserProfile } from "@/lib/storage";
import type { MoodEntry, StressLevel } from "@/types";
import { MOOD_EMOJI } from "@/types";
import {
  average,
  computeMoodTrend,
  daysUntilExam,
  getGreeting,
  getHeatmapDays,
  getMoodColor,
  getStressColor,
} from "@/lib/wellness";
import type { ActiveView } from "./MindMateApp";
import Card from "./ui/Card";
import BreathingExercise from "./BreathingExercise";
import {
  Flame,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus,
  MessageCircle,
  BarChart2,
  AlertTriangle,
} from "lucide-react";

interface Props {
  profile: UserProfile;
  onNavigate: (v: ActiveView) => void;
}

const HEATMAP_DAYS = 28;
const RECENT_DAYS = 7;

export default function Dashboard({ profile, onNavigate }: Props) {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);
  const [recent, setRecent] = useState<MoodEntry[]>([]);

  useEffect(() => {
    setEntries(getEntries());
    setStreak(getStreakDays());
    setTodayEntry(getTodayEntry());
    setRecent(getRecentEntries(RECENT_DAYS));
  }, []);

  // Derived stats — recomputed only when their inputs actually change,
  // avoiding repeated array reduces on every render (and avoiding the
  // previous pattern of computing the same average 2-3 times in JSX).
  const avgMood = useMemo(() => average(recent.map((e) => e.mood)), [recent]);
  const avgStress = useMemo(() => average(recent.map((e) => e.stress)), [recent]);
  const trend = useMemo(() => computeMoodTrend(recent), [recent]);
  const daysLeft = useMemo(() => daysUntilExam(profile.examDate), [profile.examDate]);
  const heatmapDays = useMemo(() => getHeatmapDays(entries, HEATMAP_DAYS), [entries]);
  const greeting = useMemo(() => getGreeting(), []);

  const highStress = avgStress !== null && avgStress >= 4;
  const stressLevelForExercise: StressLevel = (todayEntry?.stress as StressLevel) ?? 3;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
        >
          {greeting}, {profile.name}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          {todayEntry
            ? `You logged in today ${MOOD_EMOJI[todayEntry.mood]} — keep the streak going!`
            : "How are you feeling today? Log your mood to get started."}
        </p>
      </div>

      {/* Exam countdown */}
      {daysLeft !== null && (
        <div
          className="rounded-2xl p-4 flex items-center justify-between"
          style={{
            background: "rgba(59, 100, 246, 0.08)",
            border: "1px solid rgba(59, 100, 246, 0.25)",
          }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#6089fb" }}>
              {profile.examType} Countdown
            </p>
            <p className="text-3xl font-bold mt-1" style={{ color: "var(--color-text)" }}>
              {daysLeft} <span className="text-base font-normal" style={{ color: "var(--color-muted)" }}>days to go</span>
            </p>
          </div>
          <div className="text-4xl" role="img" aria-label="Hourglass">
            ⏳
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Streak"
          value={`${streak}d`}
          sub="consecutive"
          Icon={Flame}
          color="#f97316"
        />
        <StatCard
          label="7-day Mood"
          value={avgMood !== null ? avgMood.toFixed(1) : "—"}
          sub="out of 5"
          Icon={trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus}
          color={trend === "up" ? "#14b89a" : trend === "down" ? "#f43f5e" : "#6b7280"}
        />
        <StatCard
          label="Avg Stress"
          value={avgStress !== null ? avgStress.toFixed(1) : "—"}
          sub="out of 5"
          Icon={AlertTriangle}
          color={avgStress !== null ? getStressColor(Math.round(avgStress)) : "#6b7280"}
        />
      </div>

      {/* Mood heatmap */}
      <Card>
        <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>
          28-Day Mood Map
        </h2>
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: "repeat(7, 1fr)" }}
          role="grid"
          aria-label="28-day mood heatmap"
        >
          {heatmapDays.map(({ dateStr, entry }) => (
            <div
              key={dateStr}
              className="aspect-square rounded-md transition-transform hover:scale-110"
              style={{
                background: entry ? getMoodColor(entry.mood) : "var(--color-surface2)",
                opacity: entry ? 1 : 0.4,
              }}
              role="gridcell"
              title={entry ? `${dateStr}: Mood ${entry.mood}/5` : `${dateStr}: No entry`}
              aria-label={entry ? `${dateStr}: Mood ${entry.mood} out of 5` : `${dateStr}: No entry`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>Mood scale:</span>
          {[1, 2, 3, 4, 5].map((m) => (
            <span key={m} className="flex items-center gap-1 text-xs" style={{ color: "var(--color-muted)" }}>
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: getMoodColor(m) }} />
              {m}
            </span>
          ))}
        </div>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <QuickAction
          label={todayEntry ? "Update today's log" : "Log today's mood"}
          sub="Daily check-in"
          Icon={BookOpen}
          color="#3b64f6"
          onClick={() => onNavigate("journal")}
        />
        <QuickAction
          label="Talk to MindMate"
          sub="AI companion"
          Icon={MessageCircle}
          color="#14b89a"
          onClick={() => onNavigate("chat")}
        />
        <QuickAction
          label="View insights"
          sub="Patterns & trends"
          Icon={BarChart2}
          color="#8b5cf6"
          onClick={() => onNavigate("insights")}
          className="col-span-2"
        />
      </div>

      {/* Adaptive mindfulness nudge — shown proactively when recent stress is high */}
      {highStress && <BreathingExercise stressLevel={stressLevelForExercise} />}

      {/* Crisis banner when high stress */}
      {highStress && (
        <div
          className="rounded-2xl p-4"
          role="alert"
          style={{
            background: "rgba(244, 63, 94, 0.08)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
          }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#f43f5e" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#fb7185" }}>
                High stress detected this week
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
                If you're feeling overwhelmed, please call iCall:{" "}
                <strong style={{ color: "var(--color-text)" }}>9152987821</strong> (free, confidential)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  Icon: React.ElementType;
  color: string;
}

const StatCard = memo(function StatCard({ label, value, sub, Icon, color }: StatCardProps) {
  return (
    <Card className="p-4">
      <Icon className="w-4 h-4 mb-2" style={{ color }} aria-hidden="true" />
      <div className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
        {value}
      </div>
      <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
        {label}
      </div>
      <div className="text-xs" style={{ color }}>
        {sub}
      </div>
    </Card>
  );
});

interface QuickActionProps {
  label: string;
  sub: string;
  Icon: React.ElementType;
  color: string;
  onClick: () => void;
  className?: string;
}

const QuickAction = memo(function QuickAction({ label, sub, Icon, color, onClick, className = "" }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-2xl p-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${className}`}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${color}22` }}
      >
        <Icon className="w-5 h-5" style={{ color }} aria-hidden="true" />
      </div>
      <div className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
        {label}
      </div>
      <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
        {sub}
      </div>
    </button>
  );
});