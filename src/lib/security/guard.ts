/**
 * VERDARA CYBERSECURITY DEFENSE-IN-DEPTH MODULE
 * - Input sanitization (XSS / script injection neutralization)
 * - Sliding-window IP/Session token-bucket rate limiter
 * - Strict payload schema and length validation
 */

interface RateLimitBucket {
  tokens: number;
  lastRefillMs: number;
}

const rateBuckets = new Map<string, RateLimitBucket>();

export function sanitizeInputText(input: unknown, maxLength = 400): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim()
    .slice(0, maxLength);
}

export function isValidEmailFormat(email: string): boolean {
  const clean = email.trim();
  if (clean.length < 5 || clean.length > 160) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
}

export function checkRateLimit(
  clientKey: string,
  capacity = 24,
  refillPerSec = 0.5
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const existing = rateBuckets.get(clientKey);

  if (!existing) {
    rateBuckets.set(clientKey, { tokens: capacity - 1, lastRefillMs: now });
    return { allowed: true, remaining: capacity - 1 };
  }

  const elapsedSec = Math.max(0, (now - existing.lastRefillMs) / 1000);
  const refilled = Math.min(capacity, existing.tokens + elapsedSec * refillPerSec);

  if (refilled < 1) {
    rateBuckets.set(clientKey, { tokens: refilled, lastRefillMs: now });
    return { allowed: false, remaining: 0 };
  }

  const remaining = Math.floor(refilled - 1);
  rateBuckets.set(clientKey, { tokens: refilled - 1, lastRefillMs: now });
  return { allowed: true, remaining };
}
