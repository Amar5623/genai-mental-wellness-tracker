import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

/**
 * Fonts are loaded via `next/font/google` instead of a CSS `@import` +
 * manual `<link>` tags. Previously both were present, causing the same
 * font family to be fetched twice and blocking render on an external
 * request to fonts.googleapis.com. `next/font` self-hosts the font files
 * at build time (zero extra network requests, no layout shift) and exposes
 * them as CSS variables that match the existing `--font-body` /
 * `--font-display` usage in globals.css and tailwind.config.ts.
 */
const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MindMate — Your AI Wellness Companion for Exam Warriors",
  description:
    "AI-powered mental wellness tracker for JEE, NEET, UPSC, CAT, GATE & CUET aspirants. Journal daily, track your mood, and get real-time empathetic support.",
  keywords: [
    "mental wellness",
    "JEE",
    "NEET",
    "UPSC",
    "student stress",
    "AI companion",
    "mood tracker",
    "exam preparation",
    "student mental health",
  ],
  authors: [{ name: "MindMate" }],
  openGraph: {
    title: "MindMate — AI Wellness for Exam Warriors",
    description:
      "Track your mental wellness through exam preparation with AI-powered support",
    type: "website",
  },
};

// viewport must be a separate export in Next.js 14+
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d1117",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>
        {/* Accessibility: skip to main content */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div id="main-content" role="main">
          {children}
        </div>
      </body>
    </html>
  );
}