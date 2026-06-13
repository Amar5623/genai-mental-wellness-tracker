"use client";

import { useState } from "react";
import type { ExamType } from "@/types";
import { BookOpen, Brain, Heart, ArrowRight } from "lucide-react";

const EXAMS: { value: ExamType; label: string; desc: string }[] = [
  { value: "JEE",  label: "JEE Mains/Advanced", desc: "Engineering entrance" },
  { value: "NEET", label: "NEET",                desc: "Medical entrance" },
  { value: "CUET", label: "CUET",                desc: "Central universities" },
  { value: "CAT",  label: "CAT",                 desc: "MBA entrance" },
  { value: "GATE", label: "GATE",                desc: "PG engineering" },
  { value: "UPSC", label: "UPSC CSE",            desc: "Civil services" },
  { value: "OTHER",label: "Other",               desc: "Any competitive exam" },
];

interface Props {
  onComplete: (data: { name: string; examType: ExamType; examDate: string }) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [examType, setExamType] = useState<ExamType | null>(null);
  const [examDate, setExamDate] = useState("");

  const canProceed = [
    name.trim().length >= 2,
    examType !== null,
    true,
  ][step];

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    else {
      onComplete({
        name: name.trim(),
        examType: examType ?? "OTHER",
        examDate,
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #3b64f6, #14b89a)" }}
          >
            <Brain className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h1
            className="text-3xl mb-1"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
          >
            MindMate
          </h1>
          <p style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>
            Your AI companion through the exam journey
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-colors duration-300"
              style={{
                background: i <= step ? "var(--color-primary)" : "var(--color-border)",
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <div
          className="rounded-2xl p-8"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          {step === 0 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4" style={{ color: "var(--color-calm)" }} aria-hidden="true" />
                  <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
                    Step 1 of 3
                  </span>
                </div>
                <h2 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
                  What should I call you?
                </h2>
                <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
                  A first name is fine — this stays on your device only.
                </p>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your first name"
                maxLength={50}
                aria-label="Your first name"
                className="w-full px-4 py-3 rounded-xl text-base transition-colors"
                style={{
                  background: "var(--color-surface2)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  outline: "none",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--color-primary)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--color-border)")
                }
                onKeyDown={(e) => e.key === "Enter" && canProceed && handleNext()}
                autoFocus
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4" style={{ color: "var(--color-calm)" }} aria-hidden="true" />
                  <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
                    Step 2 of 3
                  </span>
                </div>
                <h2 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
                  Which exam are you preparing for?
                </h2>
                <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
                  I'll tailor advice to your specific exam context.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {EXAMS.map((exam) => (
                  <button
                    key={exam.value}
                    onClick={() => setExamType(exam.value)}
                    className="text-left p-3 rounded-xl transition-all duration-200"
                    style={{
                      background:
                        examType === exam.value
                          ? "rgba(59, 100, 246, 0.15)"
                          : "var(--color-surface2)",
                      border: `1px solid ${
                        examType === exam.value
                          ? "var(--color-primary)"
                          : "var(--color-border)"
                      }`,
                      color: "var(--color-text)",
                    }}
                    aria-pressed={examType === exam.value}
                  >
                    <div className="font-semibold text-sm">{exam.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                      {exam.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
                  Step 3 of 3
                </span>
                <h2 className="text-xl font-semibold mt-1" style={{ color: "var(--color-text)" }}>
                  When is your exam? (Optional)
                </h2>
                <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
                  I'll help you track your journey as the day approaches.
                </p>
              </div>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                aria-label="Exam date"
                className="w-full px-4 py-3 rounded-xl text-base"
                style={{
                  background: "var(--color-surface2)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  outline: "none",
                }}
                min={new Date().toISOString().split("T")[0]}
              />
              <div
                className="rounded-xl p-4"
                style={{ background: "rgba(20, 184, 154, 0.08)", border: "1px solid rgba(20, 184, 154, 0.2)" }}
              >
                <p className="text-sm" style={{ color: "var(--color-calm)" }}>
                  🔒 <strong>Your privacy matters.</strong> All journal entries and chat history
                  stay on your device. Nothing is stored on any server.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="w-full mt-8 py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
            style={{
              background: canProceed
                ? "linear-gradient(135deg, #3b64f6, #14b89a)"
                : "var(--color-surface2)",
              color: canProceed ? "white" : "var(--color-muted)",
              cursor: canProceed ? "pointer" : "not-allowed",
            }}
          >
            {step === 2 ? "Start my wellness journey" : "Continue"}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
