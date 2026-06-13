/**
 * Simple in-memory rate limiter for API routes.
 * Prevents abuse and ensures responsible usage.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 20;  // per window per IP

export function rateLimit(identifier: string): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { success: true, remaining: MAX_REQUESTS - 1 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { success: false, remaining: 0 };
  }

  entry.count += 1;
  store.set(identifier, entry);
  return { success: true, remaining: MAX_REQUESTS - entry.count };
}

/**
 * Returns current store size — useful for health checks / tests.
 */
export function getRateLimitStoreSize(): number {
  return store.size;
}

/**
 * Clear a specific identifier — useful for testing.
 */
export function clearRateLimit(identifier: string): void {
  store.delete(identifier);
}

// Clean up stale entries every 5 minutes.
// Use Array.from() for compatibility across all TypeScript targets.
setInterval(() => {
  const now = Date.now();
  Array.from(store.entries()).forEach(([key, entry]) => {
    if (now > entry.resetAt) store.delete(key);
  });
}, 300_000);