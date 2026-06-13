"use client";

import { Brain, BookOpen, MessageCircle, BarChart2 } from "lucide-react";
import type { ActiveView } from "./MindMateApp";
import type { UserProfile } from "@/lib/storage";

interface Props {
  active: ActiveView;
  onNavigate: (v: ActiveView) => void;
  profile: UserProfile;
}

const NAV_ITEMS: { view: ActiveView; label: string; Icon: React.ElementType }[] = [
  { view: "dashboard", label: "Home",     Icon: Brain },
  { view: "journal",   label: "Journal",  Icon: BookOpen },
  { view: "chat",      label: "MindMate", Icon: MessageCircle },
  { view: "insights",  label: "Insights", Icon: BarChart2 },
];

export default function NavBar({ active, onNavigate, profile }: Props) {
  return (
    <>
      {/* Top bar */}
      <header
        className="sticky top-0 z-40 glass"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3b64f6, #14b89a)" }}
            >
              <Brain className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-sm" style={{ color: "var(--color-text)" }}>
              MindMate
            </span>
          </div>
          <span className="text-sm" style={{ color: "var(--color-muted)" }}>
            Hey, <span style={{ color: "var(--color-text)" }}>{profile.name}</span> 👋
          </span>
        </div>
      </header>

      {/* Bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 glass"
        style={{ borderTop: "1px solid var(--color-border)" }}
        aria-label="Main navigation"
      >
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-around">
          {NAV_ITEMS.map(({ view, label, Icon }) => {
            const isActive = active === view;
            return (
              <button
                key={view}
                onClick={() => onNavigate(view)}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200"
                style={{
                  color: isActive ? "var(--color-primary)" : "var(--color-muted)",
                  background: isActive ? "rgba(59, 100, 246, 0.1)" : "transparent",
                }}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
