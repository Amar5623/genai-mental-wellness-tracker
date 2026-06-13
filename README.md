# 🧠 MindMate — AI Wellness Companion for Exam Warriors

<div align="center">

![MindMate Banner](https://img.shields.io/badge/MindMate-Mental%20Wellness%20AI-3b64f6?style=for-the-badge&logo=brain)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)
![Groq](https://img.shields.io/badge/Groq-llama--3.3--70b-f54703?style=for-the-badge)
![Gemini](https://img.shields.io/badge/Gemini-1.5--flash-4285F4?style=for-the-badge&logo=google)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)

**An empathetic, always-available AI companion for students preparing for JEE, NEET, UPSC, CAT, GATE & CUET**

[🚀 Live Demo](https://mindmate-wellness.vercel.app) · [📦 Repository](https://github.com/your-username/mindmate)

</div>

---

## 🎯 Challenge Vertical: Mental Wellness Tracker

Built for **PromptWars Ahmedabad 2026** — solving the mental health crisis among competitive exam aspirants in India.

---

## 🌟 What Makes MindMate Different

Most wellness apps are **generic**. MindMate is **exam-aware**:

| Feature | Generic Apps | MindMate |
|---------|-------------|---------|
| AI responses | Generic advice | Exam-specific (JEE syllabus pressure, NEET mock tests, etc.) |
| Chat speed | 3–8 seconds | <1 second (Groq streaming) |
| Pattern analysis | Surface-level | Deep Gemini analysis across 30 days |
| Crisis safety | None | Multi-layer detection + iCall India |
| Privacy | Server-stored | 100% on-device (localStorage) |
| Dual AI models | Single model | Groq (speed) + Gemini (depth) |

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
│  │Countdown │  │Prompts   │  │Crisis 🚨 │  │Analysis│  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │              API Layer (Next.js Routes)              ││
│  │  /api/chat → Groq (llama-3.3-70b) streaming SSE    ││
│  │  /api/analyze → Gemini (gemini-1.5-flash) JSON      ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │         Security & Safety Layer                      ││
│  │  Rate limiting · Input sanitization · Crisis detect  ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🏠 Dashboard
- **28-day mood heatmap** — visual calendar showing emotional patterns at a glance
- **Exam countdown timer** — days remaining to your exam date
- **Streak tracker** — gamified consistency motivation
- **Smart alerts** — high-stress detection with crisis resource surfacing

### 📓 Daily Journal
- **5-level mood selector** with emoji (😔 → 😊)
- **Stress slider** with real-time feedback
- **AI writing prompts** — contextual journaling starters
- **Smart tag system** — pre-loaded exam-specific tags + custom tags
- **Character counter** with 1500-char cap

### 💬 MindMate Chat (Groq AI)
- **Streaming responses** — words appear character-by-character (<1s latency)
- **Exam-context awareness** — knows you're a JEE/NEET/UPSC aspirant
- **Mood-aware responses** — adapts tone based on today's logged mood & stress
- **Crisis detection** — multi-keyword detection triggers iCall India resources
- **Starter prompts** — removes blank-page paralysis
- **Persistent history** — remembers your last 50 messages

### 📊 Insights (Gemini AI)
- **7-day mood bar chart** — visual weekly overview
- **Deep pattern analysis** powered by Gemini 1.5 Flash:
  - Dominant emotional state identification
  - Hidden stress trigger detection
  - Behavioral pattern recognition
  - Risk level assessment (Low → Crisis)
  - Personalized action recommendations
  - Custom affirmation generated from your actual journey

---

## 🛡️ Safety & Ethics

MindMate takes mental health seriously:

1. **Crisis Detection**: Scans every message for distress signals. On detection → immediate iCall India number (9152987821) displayed, AI stops, human resources surface.

2. **Privacy First**: Zero server-side personal data storage. All journals and chat history stay in browser localStorage.

3. **Not a Replacement**: Always encourages professional support; never positions itself as therapy.

4. **Rate Limiting**: Prevents API abuse — 20 req/min per IP per endpoint.

5. **Input Sanitization**: All user inputs stripped of HTML/injection before AI processing.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Groq API key ([console.groq.com](https://console.groq.com))
- Google Gemini API key ([aistudio.google.com](https://aistudio.google.com))

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/mindmate.git
cd mindmate

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

Tests cover:
- Input validation & XSS sanitization (`src/__tests__/validation.test.ts`)
- Storage utility functions (`src/__tests__/storage.test.ts`)

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

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/mindmate)

---

## 📁 Project Structure

```
mindmate/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts        # Groq streaming endpoint
│   │   │   └── analyze/route.ts     # Gemini analysis endpoint
│   │   ├── layout.tsx               # Root layout + metadata
│   │   ├── page.tsx                 # Entry point
│   │   └── globals.css              # Design tokens + utilities
│   ├── components/
│   │   ├── MindMateApp.tsx          # Root client component
│   │   ├── Onboarding.tsx           # 3-step onboarding flow
│   │   ├── NavBar.tsx               # Top + bottom navigation
│   │   ├── Dashboard.tsx            # Home with heatmap + stats
│   │   ├── JournalView.tsx          # Daily mood logging
│   │   ├── ChatView.tsx             # Streaming AI companion
│   │   └── InsightsView.tsx         # Gemini pattern analysis
│   ├── lib/
│   │   ├── rateLimit.ts             # In-memory rate limiter
│   │   ├── storage.ts               # localStorage utilities
│   │   └── validation.ts            # Input sanitization + crisis detection
│   ├── types/
│   │   └── index.ts                 # Shared TypeScript types
│   └── __tests__/
│       ├── validation.test.ts       # Validation unit tests
│       └── storage.test.ts          # Storage unit tests
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
| Input sanitization | HTML strip + length cap on all user inputs |
| XSS prevention | No `dangerouslySetInnerHTML`; all content escaped |
| Env security | API keys server-side only, never exposed to client |
| Crisis safety | Multi-keyword detection with hard override |
| Data privacy | Zero PII on server; all data stays client-side |

---

## 📊 Evaluation Criteria Coverage

| Criteria | Implementation |
|----------|---------------|
| **Code Quality** | TypeScript strict mode, modular components, clear naming, no any types |
| **Security** | Rate limiting, input sanitization, XSS prevention, server-side API keys |
| **Efficiency** | Streaming SSE (no polling), localStorage (no DB overhead), lazy analysis |
| **Testing** | 12+ unit tests covering validation and storage utilities |
| **Accessibility** | Skip link, ARIA labels, aria-live regions, aria-pressed, reduced motion |
| **Problem Alignment** | Exam-specific AI, daily journaling, pattern detection, crisis support |

---

## 🧩 Assumptions Made

1. **Students are the primary users** — UI optimized for mobile-first experience
2. **Privacy is paramount** — local storage chosen over server DB intentionally  
3. **Speed matters** — Groq selected for chat due to sub-second response times vs Gemini for deep analysis
4. **India-specific resources** — iCall (9152987821) used as crisis line, not generic international numbers
5. **Exam diversity** — supports JEE, NEET, CUET, CAT, GATE, UPSC with tailored context
6. **Free tier friendly** — both Groq and Gemini offer generous free tiers for students

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
