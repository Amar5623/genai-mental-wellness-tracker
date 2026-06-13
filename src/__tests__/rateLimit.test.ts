/**
 * Unit tests for the in-memory rate limiter.
 */

import { rateLimit, getRateLimitStoreSize, clearRateLimit } from "../lib/rateLimit";

beforeEach(() => {
    // Clear between tests by using unique identifiers
});

describe("rateLimit", () => {
    it("allows the first request", () => {
        const id = `test-${Date.now()}-1`;
        const result = rateLimit(id);
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(19);
    });

    it("tracks multiple requests from same identifier", () => {
        const id = `test-${Date.now()}-2`;
        rateLimit(id); // 1st
        rateLimit(id); // 2nd
        const result = rateLimit(id); // 3rd
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(17);
    });

    it("blocks after MAX_REQUESTS (20) are exhausted", () => {
        const id = `test-${Date.now()}-3`;
        // Use up all 20 requests
        for (let i = 0; i < 20; i++) {
            rateLimit(id);
        }
        const result = rateLimit(id);
        expect(result.success).toBe(false);
        expect(result.remaining).toBe(0);
    });

    it("treats different identifiers independently", () => {
        const ts = Date.now();
        const id1 = `test-${ts}-A`;
        const id2 = `test-${ts}-B`;

        // Exhaust id1
        for (let i = 0; i < 20; i++) rateLimit(id1);

        const blocked = rateLimit(id1);
        const allowed = rateLimit(id2);

        expect(blocked.success).toBe(false);
        expect(allowed.success).toBe(true);
    });

    it("returns correct remaining count after each call", () => {
        const id = `test-${Date.now()}-4`;
        const first = rateLimit(id);
        expect(first.remaining).toBe(19);
        const second = rateLimit(id);
        expect(second.remaining).toBe(18);
    });
});

describe("clearRateLimit", () => {
    it("removes the entry so the identifier can start fresh", () => {
        const id = `test-clear-${Date.now()}`;
        // Exhaust limit
        for (let i = 0; i < 20; i++) rateLimit(id);
        expect(rateLimit(id).success).toBe(false);

        // Clear and retry
        clearRateLimit(id);
        expect(rateLimit(id).success).toBe(true);
    });
});

describe("getRateLimitStoreSize", () => {
    it("returns a non-negative number", () => {
        expect(getRateLimitStoreSize()).toBeGreaterThanOrEqual(0);
    });
});