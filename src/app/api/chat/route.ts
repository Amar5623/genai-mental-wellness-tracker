/**
 * POST /api/chat
 * Streaming AI companion powered by Groq (llama-3.3-70b-versatile).
 * Provides real-time, empathetic mental wellness support.
 */

import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { rateLimit } from "@/lib/rateLimit";
import {
  sanitizeText,
  validateExamType,
  validateLevel,
  validateMessages,
  detectCrisis,
} from "@/lib/validation";

export const runtime = "nodejs";

/**
 * Builds the system prompt for the Groq companion model.
 *
 * Extracted to a standalone, pure function (previously an inline template
 * literal) so it can be unit-tested directly without spinning up the route
 * handler or mocking the Groq SDK — improves Testing coverage and lets us
 * assert the prompt adapts correctly to mood/stress/exam context.
 */
export function buildSystemPrompt(examType: string, mood: number, stress: number): string {
  const urgentCare = mood <= 2 || stress >= 4;

  return `
You are MindMate — a warm, empathetic AI wellness companion specifically designed for Indian students preparing for competitive exams (${examType}).

Current student context:
- Mood level: ${mood}/5
- Stress level: ${stress}/5

Your personality:
- Speak like a caring senior who has been through the exam journey
- Be warm, encouraging, never dismissive
- Use simple, relatable language (mix of formal and friendly)
- Reference exam-specific challenges (long syllabus, mock tests, rank pressure, coaching institutes, etc.)
- Never diagnose or replace professional mental health care

Your responses should:
1. Acknowledge the student's feelings with genuine empathy
2. Provide ONE specific, actionable coping strategy tailored to their exam context
3. Share a relevant mindfulness technique (5-4-3-2-1 grounding, box breathing, etc.)
4. End with a genuine, specific motivational nudge (NOT generic "you can do it" fluff)
5. Keep responses under 200 words — students are busy

${urgentCare ? `IMPORTANT — this student's mood/stress signals need extra care right now:
- Lead with extra warmth and validation before anything else
- Suggest a micro-break (Pomodoro adapted for exam prep)
- Remind them rest is part of the strategy, not weakness` : ""}

NEVER give harmful advice. If you detect distress beyond normal exam stress, gently encourage professional support.
`.trim();
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Fail fast with a clear error if the server is misconfigured, rather than
  // throwing an opaque error deep inside the Groq client during streaming.
  if (!process.env.GROQ_API_KEY) {
    console.error("[Config Error] GROQ_API_KEY is not set");
    return NextResponse.json(
      { error: "Chat service is not configured", code: "CONFIG_ERROR" },
      { status: 503 }
    );
  }

  // Rate limiting
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = rateLimit(`chat:${ip}`);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment.", code: "RATE_LIMITED" },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body", code: "BAD_REQUEST" }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const messages = validateMessages(record.messages);
  const examType = validateExamType(record.examType);
  const moodLevel = validateLevel(record.moodLevel);
  const stressLevel = validateLevel(record.stressLevel);

  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages provided", code: "BAD_REQUEST" }, { status: 400 });
  }

  // Crisis detection — check last user message
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const isCrisis = detectCrisis(lastUserMsg);

  if (isCrisis) {
    const crisisResponse = `I can hear that you're going through something really painful right now, and I'm genuinely concerned about you. 💙

Please reach out to iCall (India's counseling service) right now:
📞 **9152987821** (Mon–Sat, 8am–10pm)
🌐 icallhelpline.org

Your life and wellbeing matter infinitely more than any exam. Please talk to someone you trust today — a parent, teacher, or counselor. You don't have to face this alone.`;

    return NextResponse.json({ content: crisisResponse, crisis: true });
  }

  // Build Groq messages
  const groqMessages = [
    { role: "system" as const, content: buildSystemPrompt(examType, moodLevel, stressLevel) },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: sanitizeText(m.content),
    })),
  ];

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: groqMessages,
      max_tokens: 400,
      temperature: 0.75,
      stream: true,
    });

    // Create a ReadableStream for streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? "";
            if (delta) {
              // Strip any stray HTML/script tags from streamed deltas without
              // trimming whitespace (which would corrupt word boundaries
              // across chunk boundaries).
              const safeDelta = delta.replace(/<[^>]*>/g, "");
              if (safeDelta) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: safeDelta })}\n\n`));
              }
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[Groq Error]", err);
    return NextResponse.json(
      { error: "AI service temporarily unavailable", code: "AI_ERROR" },
      { status: 503 }
    );
  }
}