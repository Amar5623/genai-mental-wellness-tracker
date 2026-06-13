# 🧠 MindMate — AI Wellness Companion for Exam Warriors

<div align="center">

![MindMate Banner](https://img.shields.io/badge/MindMate-Mental%20Wellness%20AI-3b64f6?style=for-the-badge&logo=brain)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)
![Groq](https://img.shields.io/badge/Groq-llama--3.3--70b-f54703?style=for-the-badge)
![Gemini](https://img.shields.io/badge/Gemini-1.5--flash-4285F4?style=for-the-badge&logo=google)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)

**An empathetic, always-available AI companion for students preparing for JEE, NEET, UPSC, CAT, GATE & CUET**

[🚀 Live Demo](https://mindmate-jade.vercel.app/) · [📦 Repository](https://github.com/Amar5623/genai-mental-wellness-tracker)

</div>

---

## 🎯 Challenge Vertical: Mental Wellness Tracker

Built for **PromptWars Ahmedabad 2026** — solving the mental health crisis among competitive exam aspirants in India.

---

## 🌟 What Makes MindMate Different

Most wellness apps are **generic**. MindMate is **exam-aware** and **context-adaptive**:

| Feature | Generic Apps | MindMate |
|---------|-------------|---------|
| AI responses | Generic advice | Exam-specific (JEE syllabus pressure, NEET mock tests, etc.) |
| Chat speed | 3–8 seconds | <1 second (Groq streaming) |
| Pattern analysis | Surface-level | Deep Gemini analysis across 7+ days, schema-validated |
| Mindfulness | One-size-fits-all | **Adaptive breathing exercises chosen by your current stress level** |
| Crisis safety | None | Multi-layer, expanded keyword detection + iCall India |
| Privacy | Server-stored | 100% on-device (localStorage) |
| Dual AI models | Single model | Groq (speed) + Gemini (depth) |
| Repeat analysis | Always re-calls AI | Server-side response cache (5 min) — fewer Gemini calls |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MindMate App                          │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │Dashboard │  │ Journal  │  │   Chat   │  │Insights│  │
│  │          │  │          │  │          │  │        │  │
│  │Mood heatmap  Daily log │  │Groq AI   │  │Gemini  │  │
│  │Streak    │  │Tags      │  │Streaming │  │Pattern │  │
│  │Countdown │  │Prompts   │  │+Breathing│  │+Breathing│ │
│  │          │  │          │  │Crisis 🚨 │  │Analysis│  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │              API Layer (Next.js Routes)              ││
│  │  /api/chat → Groq (llama-3.3-70b) streaming SSE     ││
│  │  /api/analyze → Gemini (gemini-1.5-flash) + cache   ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │         Security & Safety Layer                      ││
│  │  Rate limiting · Sanitization · Schema validation    ││
│  │  Crisis detect (20+ phrases) · Env config checks     ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │         Shared Logic Layer (lib/)                     ││
│  │  wellness.ts — mood colors, trends, heatmap data     ││
│  │  breathing.ts — adaptive mindfulness patterns        ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🏠 Dashboard
- **28-day mood heatmap** — visual calendar showing emotional patterns at a glance
- **Exam countdown timer** — days remaining to your exam date
- **Streak tracker** — gamified consistency motivation
- **Smart alerts** — high-stress detection with crisis resource surfacing + adaptive breathing nudge

### 📓 Daily Journal
- **5-level mood selector** with emoji (😔 → 😊)
- **Stress slider** with real-time feedback
- **AI writing prompts** — contextual journaling starters
- **Smart tag system** — pre-loaded exam-specific tags + custom tags
- **Character counter** with 1500-char cap

### 💬 MindMate Chat (Groq AI)
- **Streaming responses** — words appear in real time (<1s latency), with chunk-boundary-safe SSE parsing
- **Exam-context awareness** — knows you're a JEE/NEET/UPSC aspirant
- **Mood-aware system prompt** — adapts tone and adds extra care guidance when mood ≤ 2 or stress ≥ 4
- **On-demand breathing exercise** — toggle a guided mindfulness break mid-conversation without losing chat context
- **Crisis detection** — expanded keyword/phrase detection (20+ patterns covering direct and indirect distress signals) triggers iCall India resources
- **Starter prompts** — removes blank-page paralysis
- **Persistent history** — remembers your last 50 messages

### 📊 Insights (Gemini AI)
- **7-day mood bar chart** — visual weekly overview, memoized for performance
- **Deep pattern analysis** powered by Gemini 1.5 Flash:
  - Dominant emotional state identification
  - Hidden stress trigger detection
  - Behavioral pattern recognition
  - Risk level assessment (Low → Crisis), **schema-validated server-side**
  - Personalized action recommendations
  - Custom affirmation generated from your actual journey
- **Adaptive mindfulness nudge** — when risk level is High or Crisis, an appropriately-paced breathing exercise is surfaced automatically alongside the analysis
- **Response caching** — identical analysis requests within 5 minutes are served from an in-memory cache, avoiding redundant Gemini calls

---

## 🧘 Adaptive Mindfulness (Breathing Exercises)

The challenge brief specifically calls for **"adaptive mindfulness exercises"** and **"logical decision making based on user context."** MindMate implements this with `lib/breathing.ts`:

| Stress Level | Technique | Why |
|---|---|---|
| 4–5 (High) | 4-7-8 Calming Breath | Slower exhale-dominant pattern to settle a racing mind |
| 3 (Moderate) | Box Breathing | Even rhythm used to reset focus during long study sessions |
| 1–2 (Low) | Gentle Refresh Breath | Short refresh that doesn't break study flow |

This logic is reused in three places: the Dashboard (proactive nudge on high-stress days), the Chat view (on-demand toggle), and the Insights view (automatic nudge when AI-detected risk is High/Crisis) — a single source of truth, fully unit tested.

---

## 🛡️ Safety & Ethics

MindMate takes mental health seriously:

1. **Expanded Crisis Detection**: Scans every message against 20+ direct and indirect distress phrases (suicidal ideation, self-harm, hopelessness language). On detection → AI is bypassed entirely, immediate iCall India number (9152987821) displayed.

2. **Privacy First**: Zero server-side personal data storage. All journals and chat history stay in browser localStorage.

3. **Not a Replacement**: Always encourages professional support; never positions itself as therapy.

4. **Rate Limiting**: Prevents API abuse — 20 req/min per IP per endpoint.

5. **Input Sanitization**: All user inputs stripped of HTML/script content and length-capped before AI processing.

6. **AI Output Validation**: Gemini's JSON response is schema-validated and sanitized before reaching the client — invalid risk levels, oversized arrays, or HTML-laced strings from the model are normalized or rejected, never trusted blindly.

7. **Config Safety**: Both API routes fail fast with a clear `CONFIG_ERROR` if required API keys are missing, instead of throwing opaque runtime errors.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Groq API key ([console.groq.com](https://console.groq.com))
- Google Gemini API key ([aistudio.google.com](https://aistudio.google.com))

### Installation

```bash
# Clone the repo
git clone https://github.com/Amar5623/genai-mental-wellness-tracker.git
cd genai-mental-wellness-tracker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see MindMate.

### Environment Variables

```env
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```

---

## 🧪 Testing

```bash
# Run all unit tests
npm test

# Run tests with coverage report
npm run test:coverage

# Type checking
npm run type-check

# Lint
npm run lint
```

Test suites (92 tests total):
- `validation.test.ts` — input sanitization, crisis detection, AI response schema validation
- `storage.test.ts` — mood entries, chat history, profile, streaks, recent-entry filtering
- `wellness.test.ts` — shared UI utilities (mood colors, trends, heatmap/day-summary builders)
- `breathing.test.ts` — adaptive breathing pattern selection logic
- `rateLimit.test.ts` — in-memory rate limiter behavior

---

## 🚢 Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel Dashboard:
# GROQ_API_KEY, GEMINI_API_KEY
```

Or click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Amar5623/genai-mental-wellness-tracker)

---

## 📁 Project Structure

```
genai-mental-wellness-tracker/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts        # Groq streaming endpoint (+ env check, prompt builder)
│   │   │   └── analyze/route.ts     # Gemini analysis endpoint (+ caching, validation, env check)
│   │   ├── layout.tsx               # Root layout + metadata
│   │   ├── page.tsx                 # Entry point
│   │   └── globals.css              # Design tokens + utilities
│   ├── components/
│   │   ├── MindMateApp.tsx          # Root client component
│   │   ├── Onboarding.tsx           # 3-step onboarding flow
│   │   ├── NavBar.tsx               # Top + bottom navigation
│   │   ├── Dashboard.tsx            # Home with heatmap + stats + breathing nudge
│   │   ├── JournalView.tsx          # Daily mood logging
│   │   ├── ChatView.tsx             # Streaming AI companion + on-demand breathing
│   │   ├── InsightsView.tsx         # Gemini pattern analysis + adaptive breathing nudge
│   │   ├── BreathingExercise.tsx    # Guided adaptive breathing widget
│   │   └── ui/Card.tsx              # Shared panel component
│   ├── lib/
│   │   ├── rateLimit.ts             # In-memory rate limiter
│   │   ├── storage.ts               # localStorage utilities
│   │   ├── validation.ts            # Sanitization, crisis detection, schema validation
│   │   ├── wellness.ts              # Shared mood/trend/heatmap utilities
│   │   └── breathing.ts             # Adaptive breathing pattern logic
│   ├── types/
│   │   └── index.ts                 # Shared TypeScript types
│   └── __tests__/
│       ├── validation.test.ts       # Validation + crisis + schema unit tests
│       ├── storage.test.ts          # Storage unit tests
│       ├── wellness.test.ts         # Wellness utility unit tests
│       ├── breathing.test.ts        # Breathing pattern unit tests
│       └── rateLimit.test.ts        # Rate limiter unit tests
├── .env.example                     # Environment template
├── jest.config.js                   # Test configuration
├── next.config.js                   # Next.js configuration
├── tailwind.config.ts               # Design system
└── tsconfig.json                    # TypeScript configuration
```

---

## 🎨 Design Philosophy

MindMate uses a deliberate **dark, calm aesthetic** — contrasting the high-energy stress of exam prep:

- **Dark background** (`#0d1117`) — reduces eye strain during late-night study sessions
- **Blue → Teal gradient** — calming, trust-building palette
- **DM Serif Display** — warmth for headings, counters the clinical feel of medical/engineering prep
- **Plus Jakarta Sans** — modern, highly legible body text
- **Motion** — minimal, purposeful (fade-in, slide-up) respecting `prefers-reduced-motion`
- **Mood heatmap** — signature visual element, instantly communicates emotional patterns

---

## 🔒 Security Measures

| Layer | Implementation |
|-------|---------------|
| Rate limiting | 20 req/min/IP per endpoint (in-memory) |
| Input sanitization | Script/style block removal + angle-bracket stripping + length cap on all user inputs |
| XSS prevention | No `dangerouslySetInnerHTML`; all content escaped; streamed AI deltas stripped of tags |
| AI output validation | Gemini JSON schema-validated and sanitized before returning to client |
| Env security | API keys server-side only, instantiated per-request, never exposed to client; missing keys fail fast with `CONFIG_ERROR` |
| Crisis safety | 20+ keyword/phrase detection with hard override, bypassing the LLM entirely |
| Data privacy | Zero PII on server; all data stays client-side |

---

## ⚡ Efficiency Improvements

| Area | Before | After |
|------|--------|-------|
| Repeated Gemini analysis | Every click hit the API | 5-min in-memory cache keyed on entry signature |
| Insights derived stats | Recomputed on every render | `useMemo` for averages, day summaries, breathing trigger |
| Chat SSE parsing | Could drop characters split across chunk boundaries | Buffered line-by-line parsing across reads |
| Duplicated UI logic | Mood colors, risk colors, day summaries duplicated across components | Centralized in `lib/wellness.ts`, shared via `Card` and pure functions |
| Today's mood lookup | Synchronous `localStorage` read on every render | Read once in `useEffect`, cached in state |

---

## 📊 Evaluation Criteria Coverage

| Criteria | Implementation |
|----------|---------------|
| **Code Quality** | TypeScript strict mode, modular components, shared `Card`/`wellness`/`breathing` utilities, extracted/testable prompt builder, no `any` types |
| **Security** | Rate limiting, script-aware sanitization, AI response schema validation, env-config checks, server-side API keys |
| **Efficiency** | Streaming SSE with buffered parsing, response caching for Gemini, memoized derived stats, deduplicated UI logic |
| **Testing** | 92 unit tests across validation, storage, wellness, breathing, and rate-limiting — including schema-validation and crisis-detection edge cases |
| **Accessibility** | Skip link, ARIA labels/roles, `aria-live`/`aria-pressed`/`aria-busy`, reduced motion, accessible breathing widget |
| **Problem Alignment** | Exam-specific AI, daily journaling, deep pattern detection, **adaptive mindfulness exercises driven by real-time stress context**, proactive crisis support |

---

## 🧩 Assumptions Made

1. **Students are the primary users** — UI optimized for mobile-first experience
2. **Privacy is paramount** — local storage chosen over server DB intentionally
3. **Speed matters** — Groq selected for chat due to sub-second response times vs Gemini for deep analysis
4. **India-specific resources** — iCall (9152987821) used as crisis line, not generic international numbers
5. **Exam diversity** — supports JEE, NEET, CUET, CAT, GATE, UPSC with tailored context
6. **Free tier friendly** — both Groq and Gemini offer generous free tiers for students
7. **AI is fallible** — Gemini's structured output is treated as untrusted input and validated/normalized before use, rather than assumed to always match the requested schema

---

## 📞 Mental Health Resources (India)

| Service | Contact | Hours |
|---------|---------|-------|
| iCall | 9152987821 | Mon–Sat 8am–10pm |
| Vandrevala Foundation | 1860-2662-345 | 24/7 |
| NIMHANS | 080-46110007 | 24/7 |

---

## 📜 License

MIT — Built for PromptWars Ahmedabad 2026

---

<div align="center">

Built with ❤️ for India's exam warriors · **MindMate**

*"Your rank doesn't define your worth. Your wellbeing is the foundation of your success."*

</div>