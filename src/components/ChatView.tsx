"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getChatHistory,
  saveChatHistory,
  clearChatHistory,
  getTodayEntry,
} from "@/lib/storage";
import type { UserProfile } from "@/lib/storage";
import type { ChatMessage, ExamType, MoodLevel, StressLevel } from "@/types";
import { MOOD_EMOJI } from "@/types";
import { Send, Trash2, Bot, User, AlertTriangle } from "lucide-react";

interface Props {
  profile: UserProfile;
}

const STARTER_MESSAGES = [
  "I'm feeling really burnt out from studying…",
  "I failed my last mock test and I'm devastated",
  "I can't focus at all today, everything feels pointless",
  "I'm scared I won't clear the exam",
  "I need a quick technique to calm my anxiety",
];

export default function ChatView({ profile }: Props) {
  const [messages, setMessages]     = useState<ChatMessage[]>([]);
  const [input, setInput]           = useState("");
  const [streaming, setStreaming]   = useState(false);
  const [crisis, setCrisis]         = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const endRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const todayEntry = getTodayEntry();
  const moodLevel: MoodLevel  = (todayEntry?.mood  as MoodLevel)  ?? 3;
  const stressLevel: StressLevel = (todayEntry?.stress as StressLevel) ?? 3;

  useEffect(() => {
    const history = getChatHistory();
    if (history.length === 0) {
      const welcome: ChatMessage = {
        role: "assistant",
        content: `Hey ${profile.name}! 👋 I'm MindMate, your wellness companion for the ${profile.examType} journey.\n\nI'm here to listen, support, and help you navigate the ups and downs of exam prep. Tell me how you're feeling today — or pick one of the prompts below to get started.`,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcome]);
    } else {
      setMessages(history);
    }
  }, [profile.name, profile.examType]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;
      setError(null);
      setCrisis(false);

      const userMsg: ChatMessage = {
        role: "user",
        content: text.trim(),
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput("");
      setStreaming(true);

      // Placeholder for AI response
      const aiMsg: ChatMessage = {
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };

      setMessages([...updatedMessages, aiMsg]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages,
            examType: profile.examType as ExamType,
            moodLevel,
            stressLevel,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          setError(err.error ?? "Something went wrong. Try again.");
          setMessages(updatedMessages); // remove empty AI bubble
          return;
        }

        // Check if it's a crisis response (non-streaming JSON)
        const contentType = res.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          const data = await res.json();
          if (data.crisis) setCrisis(true);
          const finalMsg: ChatMessage = {
            role: "assistant",
            content: data.content,
            timestamp: new Date().toISOString(),
          };
          const finalMessages = [...updatedMessages, finalMsg];
          setMessages(finalMessages);
          saveChatHistory(finalMessages);
          return;
        }

        // Stream SSE
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No stream");
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              accumulated += parsed.content;
              // Live update the last message
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = {
                  ...copy[copy.length - 1],
                  content: accumulated,
                };
                return copy;
              });
            } catch {
              // Ignore parse errors for partial chunks
            }
          }
        }

        const finalMessages: ChatMessage[] = [
          ...updatedMessages,
          {
            role: "assistant",
            content: accumulated,
            timestamp: new Date().toISOString(),
          },
        ];
        saveChatHistory(finalMessages);
      } catch (err) {
        console.error(err);
        setError("Connection issue. Please try again.");
        setMessages(updatedMessages);
      } finally {
        setStreaming(false);
        inputRef.current?.focus();
      }
    },
    [messages, streaming, profile.examType, moodLevel, stressLevel]
  );

  const handleClear = () => {
    clearChatHistory();
    const welcome: ChatMessage = {
      role: "assistant",
      content: `Fresh start! I'm here whenever you're ready to talk. 💙`,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcome]);
    setCrisis(false);
  };

  const lastIsStreaming =
    streaming && messages[messages.length - 1]?.role === "assistant";

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
          >
            MindMate Chat
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
            Powered by Groq · Ultra-fast AI companion
            {todayEntry && (
              <span className="ml-2">
                Today's mood: {MOOD_EMOJI[moodLevel]}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleClear}
          className="p-2 rounded-xl transition-colors"
          style={{ color: "var(--color-muted)" }}
          title="Clear chat history"
          aria-label="Clear chat history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto space-y-4 pr-1"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            msg={msg}
            isStreaming={lastIsStreaming && i === messages.length - 1}
          />
        ))}

        {/* Starter prompts */}
        {messages.length <= 1 && (
          <div className="space-y-2 animate-fade-in">
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              Try saying:
            </p>
            {STARTER_MESSAGES.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="block w-full text-left text-sm px-4 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
              >
                <span style={{ color: "var(--color-muted)" }}>"</span>{s}<span style={{ color: "var(--color-muted)" }}>"</span>
              </button>
            ))}
          </div>
        )}

        {/* Crisis banner */}
        {crisis && (
          <div
            className="rounded-2xl p-4"
            role="alert"
            aria-live="assertive"
            style={{
              background: "rgba(244, 63, 94, 0.1)",
              border: "1px solid rgba(244, 63, 94, 0.4)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" style={{ color: "#f43f5e" }} />
              <span className="text-sm font-semibold" style={{ color: "#fb7185" }}>
                Crisis support available
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              iCall (India): <strong style={{ color: "var(--color-text)" }}>9152987821</strong> · Free, confidential counseling
            </p>
          </div>
        )}

        {error && (
          <div
            className="text-sm px-4 py-3 rounded-xl"
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

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="pt-4">
        <div
          className="flex gap-2 p-2 rounded-2xl"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Share what's on your mind…"
            rows={2}
            maxLength={1000}
            disabled={streaming}
            className="flex-1 resize-none bg-transparent text-sm px-2 pt-1 focus:outline-none"
            style={{ color: "var(--color-text)" }}
            aria-label="Message input"
            aria-disabled={streaming}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
            className="self-end p-3 rounded-xl transition-all duration-200"
            style={{
              background:
                input.trim() && !streaming
                  ? "linear-gradient(135deg, #3b64f6, #14b89a)"
                  : "var(--color-surface2)",
              color:
                input.trim() && !streaming ? "white" : "var(--color-muted)",
            }}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: "var(--color-muted)" }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

function MessageBubble({
  msg,
  isStreaming,
}: {
  msg: ChatMessage;
  isStreaming: boolean;
}) {
  const isAI = msg.role === "assistant";

  return (
    <div
      className={`flex gap-3 ${isAI ? "" : "flex-row-reverse"} animate-slide-up`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1"
        style={{
          background: isAI
            ? "linear-gradient(135deg, #3b64f6, #14b89a)"
            : "var(--color-surface2)",
        }}
        aria-hidden="true"
      >
        {isAI ? (
          <Bot className="w-4 h-4 text-white" />
        ) : (
          <User className="w-4 h-4" style={{ color: "var(--color-muted)" }} />
        )}
      </div>

      {/* Bubble */}
      <div
        className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed prose-mindmate"
        style={{
          background: isAI ? "var(--color-surface)" : "rgba(59, 100, 246, 0.15)",
          border: `1px solid ${isAI ? "var(--color-border)" : "rgba(59, 100, 246, 0.3)"}`,
          color: "var(--color-text)",
          borderRadius: isAI ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
        }}
      >
        {msg.content ? (
          <span className={isStreaming ? "stream-cursor" : ""}>
            {msg.content.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < msg.content.split("\n").length - 1 && <br />}
              </span>
            ))}
          </span>
        ) : (
          <span className="stream-cursor text-transparent">·</span>
        )}
      </div>
    </div>
  );
}
