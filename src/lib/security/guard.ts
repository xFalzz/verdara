/**
 * VERDARA CYBERSECURITY DEFENSE-IN-DEPTH MODULE
 * - Input sanitization (XSS, prototype pollution, prompt injection neutralization)
 * - Sliding-window IP/Session token-bucket rate limiter with auto-pruning
 * - Safe origin / CSRF verification
 * - PII email masking for public endpoints
 * - Numeric boundaries & latitude/longitude coordinate validation
 */

interface RateLimitBucket {
  tokens: number;
  lastRefillMs: number;
}

const rateBuckets = new Map<string, RateLimitBucket>();

/**
 * Periodically prunes inactive buckets to prevent unbounded memory growth.
 */
function pruneStaleBuckets(now: number) {
  if (rateBuckets.size < 1500) return;
  for (const [key, bucket] of rateBuckets.entries()) {
    if (now - bucket.lastRefillMs > 600_000) {
      rateBuckets.delete(key);
    }
  }
}

/**
 * Sanitizes user-supplied string against XSS, Trojan Source unicode,
 * and LLM prompt injection tokens.
 */
export function sanitizeInputText(input: unknown, maxLength = 400): string {
  if (typeof input !== "string") return "";

  return input
    // Neutralize null bytes and control chars
    .replace(/\0/g, "")
    // Neutralize Trojan Source directionality override characters
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, "")
    // Neutralize HTML tags and script protocols
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/on\w+=/gi, "")
    // Neutralize LLM Prompt Injection & Delimiter Overrides
    .replace(/\[\/?INST\]/gi, "")
    .replace(/<\|im_start\|>/gi, "")
    .replace(/<\|im_end\|>/gi, "")
    .replace(/<\/?user_input>/gi, "")
    .replace(/system:\s*/gi, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Verifies email follows standard RFC 5322 basic pattern without dangerous characters.
 */
export function isValidEmailFormat(email: string): boolean {
  const clean = email.trim();
  if (clean.length < 5 || clean.length > 160) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(clean);
}

/**
 * Masks user email for public-facing API summaries to prevent scraping.
 * Example: 'alex.rivera@example.com' -> 'al***@example.com'
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "anonymous@verdara.local";
  const [local, domain] = email.split("@");
  if (!local || !domain) return "user@verdara.local";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

/**
 * Deeply sanitizes JSON payloads against Prototype Pollution attacks.
 */
export function sanitizeObject<T>(input: T): T {
  if (!input || typeof input !== "object") return input;

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObject(item)) as unknown as T;
  }

  const cleanObj = {} as Record<string, unknown>;
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }
    cleanObj[key] = sanitizeObject(value);
  }
  return cleanObj as T;
}

/**
 * Safe numeric clamping to prevent NaN, Infinity, or out-of-range overflows.
 */
export function clampNumber(
  val: unknown,
  min: number,
  max: number,
  fallback: number
): number {
  if (typeof val !== "number" || isNaN(val) || !isFinite(val)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, val));
}

/**
 * Validates geographical coordinates (latitude -90 to +90, longitude -180 to +180).
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    isFinite(lat) &&
    isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Token-bucket sliding window rate limiter with auto-pruning.
 */
export function checkRateLimit(
  clientKey: string,
  capacity = 24,
  refillPerSec = 0.5
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  pruneStaleBuckets(now);

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

/**
 * CSRF and Origin verification for mutating requests.
 */
export function verifySafeOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");

  if (!origin || !host) {
    // Direct same-origin requests or non-browser test environments
    return true;
  }

  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}
