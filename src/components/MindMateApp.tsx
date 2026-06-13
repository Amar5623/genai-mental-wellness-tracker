"use client";

import { useState, useEffect } from "react";
import { getProfile, saveProfile } from "@/lib/storage";
import type { UserProfile } from "@/lib/storage";
import type { ExamType } from "@/types";
import Onboarding from "./Onboarding";
import Dashboard from "./Dashboard";
import JournalView from "./JournalView";
import ChatView from "./ChatView";
import InsightsView from "./InsightsView";
import NavBar from "./NavBar";

export type ActiveView = "dashboard" | "journal" | "chat" | "insights";

export default function MindMateApp() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  useEffect(() => {
    const stored = getProfile();
    setProfile(stored);
    setLoading(false);
  }, []);

  const handleOnboard = (data: { name: string; examType: ExamType; examDate: string }) => {
    const newProfile: UserProfile = { ...data, onboarded: true };
    saveProfile(newProfile);
    setProfile(newProfile);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-2 border-mind-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>Loading MindMate…</p>
        </div>
      </div>
    );
  }

  if (!profile?.onboarded) {
    return <Onboarding onComplete={handleOnboard} />;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <NavBar active={activeView} onNavigate={setActiveView} profile={profile} />

      <main className="max-w-4xl mx-auto px-4 pb-24 pt-6">
        {activeView === "dashboard"  && <Dashboard profile={profile} onNavigate={setActiveView} />}
        {activeView === "journal"    && <JournalView profile={profile} />}
        {activeView === "chat"       && <ChatView profile={profile} />}
        {activeView === "insights"   && <InsightsView profile={profile} />}
      </main>
    </div>
  );
}
