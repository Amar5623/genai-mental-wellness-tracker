"use client";

import { useState, useEffect } from "react";
import { getEntries, getRecentEntries } from "@/lib/storage";
import type { UserProfile } from "@/lib/storage";
import type { WellnessInsight, MoodEntry } from "@/types";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Calendar,
  Zap,
} from "lucide-react";

interface Props {
  profile: UserProfile;
}

function MoodBar({ value, max = 5, color }: { value: number; max?: number; color: string }) {
  return (
    <div
      className="h-2 rounded-full overflow-hidden"
      style={{ background: "var(--color-surface2)" }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${(value / max) * 100}%`, background: color }}
      />
    </div>
  );
}

function WeekChart({ entries }: { entries: MoodEntry[] }) {
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const entry = entries.find((e) => e.date === dateStr);
    return {
      day: d.toLocaleDateString("en-IN", { weekday: "short" }),
      mood: entry?.mood ?? null,
      stress: entry?.stress ?? null,
    };
  });

  const moodColors: Record<number, string> = {
    1: "#f43f5e", 2: "#f97316", 3: "#eab308", 4: "#22c55e", 5: "#14b89a",
  };

  return (
    <div className="space-y-3">
      <div
        className="flex items-end justify-between gap-2 h-24"
        role="img"
        aria-label="7-day mood chart"
      >
        {last7.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            {d.mood ? (
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: `${(d.mood / 5) * 80}px`,
                  background: moodColors[d.mood],
                  opacity: 0.85,
                }}
                title={`${d.day}: Mood ${d.mood}/5`}
              />
            ) : (
              <div
                className="w-full rounded-t-md"
                style={{ height: "8px", background: "var(--color-border)" }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {last7.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              {d.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InsightsView({ profile }: Props) {
  const [insight, setInsight]   = useState<WellnessInsight | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [entries, setEntries]   = useState<MoodEntry[]>([]);
  const [recent, setRecent]     = useState<MoodEntry[]>([]);

  useEffect(() => {
    const all = getEntries();
    const r   = getRecentEntries(7);
    setEntries(all);
    setRecent(r);
  }, []);

  const analyzeWithGemini = async () => {
    if (recent.length === 0) {
      setError("Add at least one journal entry to see your insights.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries: recent,
          examType: profile.examType,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Analysis failed. Try again.");
        return;
      }

      const data = await res.json() as WellnessInsight;
      setInsight(data);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const riskColors: Record<string, string> = {
    low:      "#14b89a",
    moderate: "#eab308",
    high:     "#f97316",
    crisis:   "#f43f5e",
  };

  const riskBg: Record<string, string> = {
    low:      "rgba(20, 184, 154, 0.1)",
    moderate: "rgba(234, 179, 8, 0.1)",
    high:     "rgba(249, 115, 22, 0.1)",
    crisis:   "rgba(244, 63, 94, 0.1)",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
        >
          Wellness Insights
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          Powered by Google Gemini · Patterns from your last 7 days
        </p>
      </div>

      {/* Summary stats */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            7-Day Overview
          </h2>
          <span className="text-xs ml-auto" style={{ color: "var(--color-muted)" }}>
            {recent.length} entries
          </span>
        </div>

        {recent.length > 0 ? (
          <>
            <WeekChart entries={entries} />
            <div className="grid grid-cols-2 gap-4 mt-5">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs" style={{ color: "var(--color-muted)" }}>Avg Mood</span>
                  <span className="text-xs font-bold" style={{ color: "#14b89a" }}>
                    {(recent.reduce((s, e) => s + e.mood, 0) / recent.length).toFixed(1)}/5
                  </span>
                </div>
                <MoodBar
                  value={recent.reduce((s, e) => s + e.mood, 0) / recent.length}
                  color="#14b89a"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs" style={{ color: "var(--color-muted)" }}>Avg Stress</span>
                  <span className="text-xs font-bold" style={{ color: "#f97316" }}>
                    {(recent.reduce((s, e) => s + e.stress, 0) / recent.length).toFixed(1)}/5
                  </span>
                </div>
                <MoodBar
                  value={recent.reduce((s, e) => s + e.stress, 0) / recent.length}
                  color="#f97316"
                />
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-center py-4" style={{ color: "var(--color-muted)" }}>
            No entries yet. Start journaling to see your patterns here.
          </p>
        )}
      </div>

      {/* AI Analysis CTA */}
      <button
        onClick={analyzeWithGemini}
        disabled={loading || recent.length === 0}
        className="w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all duration-200"
        style={{
          background:
            loading || recent.length === 0
              ? "var(--color-surface2)"
              : "linear-gradient(135deg, #3b64f6, #8b5cf6)",
          color: loading || recent.length === 0 ? "var(--color-muted)" : "white",
          cursor: loading || recent.length === 0 ? "not-allowed" : "pointer",
        }}
        aria-busy={loading}
        aria-label="Analyze my week with Gemini AI"
      >
        {loading ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" aria-hidden="true" />
            Gemini is analysing your patterns…
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" aria-hidden="true" />
            Analyse my week with Gemini AI
          </>
        )}
      </button>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          role="alert"
          style={{
            background: "rgba(249, 115, 22, 0.1)",
            border: "1px solid rgba(249, 115, 22, 0.3)",
            color: "#fb923c",
          }}
        >
          {error}
        </div>
      )}

      {/* Insight results */}
      {insight && (
        <div className="space-y-4 animate-fade-in">
          {/* Risk level */}
          <div
            className="rounded-2xl p-5"
            role="region"
            aria-label="Mental health risk assessment"
            style={{
              background: riskBg[insight.analysis.riskLevel] ?? "var(--color-surface)",
              border: `1px solid ${riskColors[insight.analysis.riskLevel] ?? "var(--color-border)"}44`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle
                className="w-4 h-4"
                style={{ color: riskColors[insight.analysis.riskLevel] }}
                aria-hidden="true"
              />
              <span className="text-sm font-semibold" style={{ color: riskColors[insight.analysis.riskLevel] }}>
                {insight.analysis.riskLevel.charAt(0).toUpperCase() + insight.analysis.riskLevel.slice(1)} Risk Level
              </span>
            </div>
            <p className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
              {insight.analysis.dominantEmotion}
            </p>
            {insight.analysis.riskLevel === "crisis" && (
              <p className="text-sm mt-2" style={{ color: "#fb7185" }}>
                Please contact iCall immediately: <strong>9152987821</strong>
              </p>
            )}
          </div>

          {/* Trend */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              {insight.weeklyMoodTrend === "improving" ? (
                <TrendingUp className="w-4 h-4 text-green-400" aria-hidden="true" />
              ) : insight.weeklyMoodTrend === "declining" ? (
                <TrendingDown className="w-4 h-4 text-red-400" aria-hidden="true" />
              ) : (
                <Minus className="w-4 h-4 text-yellow-400" aria-hidden="true" />
              )}
              <span className="text-sm font-semibold capitalize" style={{ color: "var(--color-text)" }}>
                Mood trend: {insight.weeklyMoodTrend}
              </span>
            </div>
          </div>

          {/* Stress Triggers */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--color-text)" }}>
              <Zap className="w-4 h-4" style={{ color: "#f97316" }} aria-hidden="true" />
              Stress Triggers Detected
            </h3>
            <ul className="space-y-2">
              {insight.analysis.stressTriggers.map((t, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm"
                  style={{ color: "var(--color-muted)" }}
                >
                  <span style={{ color: "#f97316", marginTop: "2px" }}>▸</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Patterns */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>
              Emotional Patterns
            </h3>
            <ul className="space-y-2">
              {insight.analysis.patterns.map((p, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm"
                  style={{ color: "var(--color-muted)" }}
                >
                  <span style={{ color: "var(--color-primary)", marginTop: "2px" }}>▸</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Actions */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>
              Recommended Actions
            </h3>
            <ol className="space-y-2">
              {insight.analysis.recommendedActions.map((a, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm"
                  style={{ color: "var(--color-muted)" }}
                >
                  <span
                    className="shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
                    style={{ background: "rgba(20, 184, 154, 0.15)", color: "#14b89a" }}
                  >
                    {i + 1}
                  </span>
                  {a}
                </li>
              ))}
            </ol>
          </div>

          {/* Affirmation */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "linear-gradient(135deg, rgba(59, 100, 246, 0.1), rgba(20, 184, 154, 0.1))",
              border: "1px solid rgba(59, 100, 246, 0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4" style={{ color: "var(--color-primary)" }} aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#6089fb" }}>
                Personal Affirmation
              </span>
            </div>
            <p className="text-sm leading-relaxed italic" style={{ color: "var(--color-text)" }}>
              "{insight.analysis.affirmation}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
