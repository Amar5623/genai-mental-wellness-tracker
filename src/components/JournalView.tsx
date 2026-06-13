"use client";

import { useState, useEffect } from "react";
import { getTodayEntry, saveEntry } from "@/lib/storage";
import type { UserProfile } from "@/lib/storage";
import type { MoodEntry, MoodLevel, StressLevel, ExamType } from "@/types";
import { MOOD_EMOJI, MOOD_LABELS, STRESS_LABELS } from "@/types";
import { Save, Check, Tag, X } from "lucide-react";

interface Props {
  profile: UserProfile;
}

const COMMON_TAGS = [
  "mock test", "studied hard", "distracted", "good sleep", "poor sleep",
  "productive", "procrastinated", "family tension", "peer pressure",
  "syllabus overwhelm", "revision", "new topic", "revision done",
];

export default function JournalView({ profile }: Props) {
  const today = new Date().toISOString().split("T")[0];

  const [mood, setMood]       = useState<MoodLevel>(3);
  const [stress, setStress]   = useState<StressLevel>(3);
  const [text, setText]       = useState("");
  const [tags, setTags]       = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [saved, setSaved]     = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const entry = getTodayEntry();
    if (entry) {
      setMood(entry.mood);
      setStress(entry.stress);
      setText(entry.journalText);
      setTags(entry.tags);
    }
  }, []);

  const handleTextChange = (val: string) => {
    if (val.length > 1500) return;
    setText(val);
    setCharCount(val.length);
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const t = customTag.trim().toLowerCase().slice(0, 30);
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
    }
    setCustomTag("");
  };

  const handleSave = () => {
    const entry: MoodEntry = {
      id:          today,
      date:        today,
      mood,
      stress,
      journalText: text.trim(),
      examType:    profile.examType as ExamType,
      tags,
      createdAt:   new Date().toISOString(),
    };
    saveEntry(entry);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const getMoodColor = (level: number): string => {
    const colors = ["", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#14b89a"];
    return colors[level] ?? "#6b7280";
  };

  const prompts = [
    "What's weighing on my mind the most today?",
    "One thing I'm proud of from my study session today…",
    "My biggest fear about the exam right now is…",
    "What would I tell my future self about today?",
    "The moment today when I felt most like myself was…",
  ];

  const [activePrompt] = useState(prompts[Math.floor(Math.random() * prompts.length)]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
        >
          Daily Journal
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Mood selector */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <label className="block text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>
          How are you feeling right now?
        </label>
        <div className="flex justify-between mb-3">
          {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setMood(level)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200"
              style={{
                background:
                  mood === level ? `${getMoodColor(level)}22` : "transparent",
                border: `2px solid ${mood === level ? getMoodColor(level) : "transparent"}`,
                transform: mood === level ? "scale(1.15)" : "scale(1)",
              }}
              aria-label={`Mood level ${level}: ${MOOD_LABELS[level]}`}
              aria-pressed={mood === level}
            >
              <span className="text-2xl" role="img" aria-hidden="true">{MOOD_EMOJI[level]}</span>
              <span className="text-xs font-medium" style={{ color: getMoodColor(level) }}>
                {MOOD_LABELS[level]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stress slider */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold" style={{ color: "var(--color-text)" }} htmlFor="stress-slider">
            Stress level
          </label>
          <span
            className="text-sm font-bold px-3 py-1 rounded-full"
            style={{
              background: `${getMoodColor(6 - stress)}22`,
              color: getMoodColor(6 - stress),
            }}
          >
            {stress}/5 — {STRESS_LABELS[stress]}
          </span>
        </div>
        <input
          id="stress-slider"
          type="range"
          min="1"
          max="5"
          value={stress}
          onChange={(e) => setStress(Number(e.target.value) as StressLevel)}
          className="w-full"
          style={{
            accentColor: getMoodColor(6 - stress),
          }}
          aria-valuemin={1}
          aria-valuemax={5}
          aria-valuenow={stress}
          aria-valuetext={STRESS_LABELS[stress]}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>Minimal</span>
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>Overwhelming</span>
        </div>
      </div>

      {/* Journal text */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold" style={{ color: "var(--color-text)" }} htmlFor="journal-text">
            Journal entry
          </label>
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>
            {charCount}/1500
          </span>
        </div>

        {/* Writing prompt */}
        <div
          className="rounded-xl p-3 mb-3 cursor-pointer select-none"
          style={{ background: "rgba(59, 100, 246, 0.08)", border: "1px solid rgba(59, 100, 246, 0.2)" }}
          onClick={() => setText((prev) => prev || activePrompt)}
          title="Click to use this prompt"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setText((prev) => prev || activePrompt)}
          aria-label={`Writing prompt: ${activePrompt}. Click to use.`}
        >
          <p className="text-xs italic" style={{ color: "#93b3fd" }}>
            💡 <em>{activePrompt}</em>
          </p>
        </div>

        <textarea
          id="journal-text"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Write freely — this is your safe space. No one else sees this."
          rows={6}
          className="w-full resize-none rounded-xl p-4 text-sm leading-relaxed transition-colors"
          style={{
            background: "var(--color-surface2)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
            outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
          aria-label="Journal entry text"
          aria-multiline="true"
        />
      </div>

      {/* Tags */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <label className="block text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>
          <Tag className="w-4 h-4 inline mr-1" aria-hidden="true" />
          What shaped today?
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {COMMON_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className="text-xs px-3 py-1.5 rounded-full transition-all duration-200"
              style={{
                background: tags.includes(tag) ? "rgba(59, 100, 246, 0.2)" : "var(--color-surface2)",
                border: `1px solid ${tags.includes(tag) ? "var(--color-primary)" : "var(--color-border)"}`,
                color: tags.includes(tag) ? "#93b3fd" : "var(--color-muted)",
              }}
              aria-pressed={tags.includes(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Custom tag input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
            placeholder="Add custom tag…"
            maxLength={30}
            aria-label="Add custom tag"
            className="flex-1 px-3 py-2 rounded-xl text-sm"
            style={{
              background: "var(--color-surface2)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              outline: "none",
            }}
          />
          <button
            onClick={addCustomTag}
            className="px-3 py-2 rounded-xl text-sm font-medium"
            style={{ background: "var(--color-primary)", color: "white" }}
            aria-label="Add tag"
          >
            Add
          </button>
        </div>

        {/* Selected custom tags */}
        {tags.filter((t) => !COMMON_TAGS.includes(t)).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags
              .filter((t) => !COMMON_TAGS.includes(t))
              .map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(20, 184, 154, 0.15)",
                    border: "1px solid rgba(20, 184, 154, 0.3)",
                    color: "#5ee9cb",
                  }}
                >
                  {tag}
                  <button
                    onClick={() => toggleTag(tag)}
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all duration-300"
        style={{
          background: saved
            ? "linear-gradient(135deg, #14b89a, #0d9078)"
            : "linear-gradient(135deg, #3b64f6, #14b89a)",
          color: "white",
        }}
        aria-label={saved ? "Entry saved" : "Save journal entry"}
      >
        {saved ? (
          <>
            <Check className="w-5 h-5" aria-hidden="true" />
            Saved!
          </>
        ) : (
          <>
            <Save className="w-5 h-5" aria-hidden="true" />
            Save today's entry
          </>
        )}
      </button>
    </div>
  );
}
