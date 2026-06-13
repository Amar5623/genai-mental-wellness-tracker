import type { ReactNode, CSSProperties } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    role?: string;
    "aria-label"?: string;
    "aria-live"?: "off" | "polite" | "assertive";
}

/**
 * Shared rounded "panel" used throughout the app. Previously every view
 * repeated:
 *
 *   className="rounded-2xl p-5"
 *   style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
 *
 * Centralizing it here removes ~20 duplicated blocks across components and
 * gives us a single place to tweak the visual language.
 */
export default function Card({
    children,
    className = "",
    style,
    role,
    "aria-label": ariaLabel,
    "aria-live": ariaLive,
}: CardProps) {
    return (
        <div
            className={`rounded-2xl p-5 ${className}`}
            style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                ...style,
            }}
            role={role}
            aria-label={ariaLabel}
            aria-live={ariaLive}
        >
            {children}
        </div>
    );
}