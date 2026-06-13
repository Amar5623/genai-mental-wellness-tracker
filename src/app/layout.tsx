import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
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