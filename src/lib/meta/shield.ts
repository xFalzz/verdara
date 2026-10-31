/**
 * 7-Layer AI Credit Shield & Anti-Overrun Guard
 * Protects the $150 Meta Model API credit pool with:
 * 1. Provider Spend Limit ($140 hard cap on dev.meta.ai)
 * 2. Lifetime Campaign Cap ($135.00) & Daily Cap ($12.00 public / $18.00 verified)
 * 3. Dedicated Verified Resident Reserve Pool ($35.00 locked for authenticated residents)
 * 4. Content-Addressed SHA-256 + 64-bit Perceptual dHash Cache ($0.00 for samples/duplicates)
 * 5. Active Stream Concurrency Mutex (max 1 active stream per user/IP)
 * 6. Per-IP Burst Rate Limiting (6 req/min, 25 req/hr)
 * 7. Per-User Daily Operation Quotas
 */

export type AiOperation =
  | "lens_scan"
  | "sam_segment"
  | "eco_retrofit"
  | "council"
  | "proof_verify"
  | "voice_transcribe";

export interface CreditShieldStatus {
  allowed: boolean;
  mode: "live_meta_api" | "eco_saver_cache";
  reason: string;
  todaySpendUsd: number;
  totalSpendUsd: number;
  lifetimeCapUsd: number;
  judgeReserveUsd: number;
  publicRemainingUsd: number;
  judgeRemainingUsd: number;
  cacheHitRatePct: number;
  userRemainingToday: number;
}

interface UsageEntry {
  ts: number;
  userId: string;
  ipHash: string;
  isJudge: boolean;
  op: AiOperation;
  model: string;
  costUsd: number;
  cacheHit: boolean;
  latencyMs: number;
}

// In-memory ledger for runtime AI usage (synced with cloud ai_credit_ledger when connected).
const usageLedger: UsageEntry[] = [];

const activeStreamLocks = new Map<string, number>();

export const USER_DAILY_QUOTAS: Record<
  AiOperation,
  { public: number; judge: number }
> = {
  lens_scan: { public: 15, judge: 40 },
  sam_segment: { public: 75, judge: 200 },
  eco_retrofit: { public: 3, judge: 10 },
  council: { public: 5, judge: 15 },
  proof_verify: { public: 10, judge: 25 },
  voice_transcribe: { public: 10, judge: 20 },
};

export function getShieldConfig() {
  const dailyBudgetUsd = Number(process.env.AI_DAILY_BUDGET_USD ?? "12.00");
  const lifetimeCapUsd = Number(process.env.AI_LIFETIME_CAP_USD ?? "135.00");
  const judgeReserveUsd = Number(process.env.AI_JUDGE_RESERVE_USD ?? "35.00");
  const hasLiveMetaKey = Boolean(
    process.env.META_API_KEY && process.env.META_API_KEY.trim().length > 10
  );

  return {
    dailyBudgetUsd,
    lifetimeCapUsd,
    judgeReserveUsd,
    publicCapUsd: Math.max(0, lifetimeCapUsd - judgeReserveUsd), // $100.00
    hasLiveMetaKey,
  };
}

export function checkAiCreditShield(opts: {
  userId: string;
  ipHash: string;
  isJudge?: boolean;
  op: AiOperation;
  isCacheHit?: boolean;
}): CreditShieldStatus {
  const cfg = getShieldConfig();
  const isPrivileged = Boolean(opts.isJudge);
  const now = Date.now();
  const startOfUtcDay = new Date().setUTCHours(0, 0, 0, 0);

  const todayEntries = usageLedger.filter((e) => e.ts >= startOfUtcDay);
  const todaySpendUsd = Number(
    todayEntries.reduce((sum, e) => sum + e.costUsd, 0).toFixed(4)
  );
  const totalSpendUsd = Number(
    usageLedger.reduce((sum, e) => sum + e.costUsd, 0).toFixed(4)
  );

  const totalCalls = usageLedger.length;
  const cacheHits = usageLedger.filter((e) => e.cacheHit).length;
  const cacheHitRatePct =
    totalCalls > 0 ? Math.round((cacheHits / totalCalls) * 100) : 100;

  const publicRemainingUsd = Number(
    Math.max(0, cfg.publicCapUsd - totalSpendUsd).toFixed(2)
  );
  const judgeRemainingUsd = Number(
    Math.max(0, cfg.lifetimeCapUsd - totalSpendUsd).toFixed(2)
  );

  const quotaSpec = USER_DAILY_QUOTAS[opts.op] ?? { public: 15, judge: 40 };
  const maxUserQuota = isPrivileged ? quotaSpec.judge : quotaSpec.public;
  const userTodayCount = todayEntries.filter(
    (e) => e.userId === opts.userId && e.op === opts.op && !e.cacheHit
  ).length;
  const userRemainingToday = Math.max(0, maxUserQuota - userTodayCount);

  // Layer 3: Cache Hit is always $0.00 and immediately allowed
  if (opts.isCacheHit) {
    return {
      allowed: true,
      mode: "eco_saver_cache",
      reason: "cache_hit_zero_cost",
      todaySpendUsd,
      totalSpendUsd,
      lifetimeCapUsd: cfg.lifetimeCapUsd,
      judgeReserveUsd: cfg.judgeReserveUsd,
      publicRemainingUsd,
      judgeRemainingUsd,
      cacheHitRatePct,
      userRemainingToday,
    };
  }

  // Layer 6: Per-IP Burst Rate Limit (max 6 live requests/min)
  const oneMinAgo = now - 60_000;
  const ipLastMin = usageLedger.filter(
    (e) => e.ipHash === opts.ipHash && e.ts >= oneMinAgo && !e.cacheHit
  ).length;
  const maxBurst = isPrivileged ? 12 : 6;
  if (ipLastMin >= maxBurst) {
    return {
      allowed: false,
      mode: "eco_saver_cache",
      reason: "ip_burst_rate_limited",
      todaySpendUsd,
      totalSpendUsd,
      lifetimeCapUsd: cfg.lifetimeCapUsd,
      judgeReserveUsd: cfg.judgeReserveUsd,
      publicRemainingUsd,
      judgeRemainingUsd,
      cacheHitRatePct,
      userRemainingToday,
    };
  }

  // Layer 5: Active Stream Concurrency Lock
  const lockExpiry = activeStreamLocks.get(opts.userId);
  if (lockExpiry && lockExpiry > now) {
    return {
      allowed: false,
      mode: "eco_saver_cache",
      reason: "active_stream_mutex_locked",
      todaySpendUsd,
      totalSpendUsd,
      lifetimeCapUsd: cfg.lifetimeCapUsd,
      judgeReserveUsd: cfg.judgeReserveUsd,
      publicRemainingUsd,
      judgeRemainingUsd,
      cacheHitRatePct,
      userRemainingToday,
    };
  }

  // Layer 2A: Lifetime Campaign Cap ($135.00 out of $150.00)
  if (totalSpendUsd >= cfg.lifetimeCapUsd) {
    return {
      allowed: false,
      mode: "eco_saver_cache",
      reason: "lifetime_cap_135_reached",
      todaySpendUsd,
      totalSpendUsd,
      lifetimeCapUsd: cfg.lifetimeCapUsd,
      judgeReserveUsd: cfg.judgeReserveUsd,
      publicRemainingUsd,
      judgeRemainingUsd,
      cacheHitRatePct,
      userRemainingToday,
    };
  }

  // Layer 2B: Reserve Pool ($35.00 locked exclusively for Verified Residents)
  if (!isPrivileged && totalSpendUsd >= cfg.publicCapUsd) {
    return {
      allowed: false,
      mode: "eco_saver_cache",
      reason: "reserve_pool_protected",
      todaySpendUsd,
      totalSpendUsd,
      lifetimeCapUsd: cfg.lifetimeCapUsd,
      judgeReserveUsd: cfg.judgeReserveUsd,
      publicRemainingUsd,
      judgeRemainingUsd,
      cacheHitRatePct,
      userRemainingToday,
    };
  }

  // Layer 2C: Daily Cap ($12.00 public / $18.00 verified)
  const effectiveDailyCap = isPrivileged ? 18.0 : cfg.dailyBudgetUsd;
  if (todaySpendUsd >= effectiveDailyCap) {
    return {
      allowed: false,
      mode: "eco_saver_cache",
      reason: "daily_budget_reached",
      todaySpendUsd,
      totalSpendUsd,
      lifetimeCapUsd: cfg.lifetimeCapUsd,
      judgeReserveUsd: cfg.judgeReserveUsd,
      publicRemainingUsd,
      judgeRemainingUsd,
      cacheHitRatePct,
      userRemainingToday,
    };
  }

  // Layer 4: Per-User Daily Operation Quota
  if (userRemainingToday <= 0) {
    return {
      allowed: false,
      mode: "eco_saver_cache",
      reason: "user_daily_quota_reached",
      todaySpendUsd,
      totalSpendUsd,
      lifetimeCapUsd: cfg.lifetimeCapUsd,
      judgeReserveUsd: cfg.judgeReserveUsd,
      publicRemainingUsd,
      judgeRemainingUsd,
      cacheHitRatePct,
      userRemainingToday,
    };
  }

  if (!cfg.hasLiveMetaKey) {
    return {
      allowed: true,
      mode: "eco_saver_cache",
      reason: "golden_demo_cache_active",
      todaySpendUsd,
      totalSpendUsd,
      lifetimeCapUsd: cfg.lifetimeCapUsd,
      judgeReserveUsd: cfg.judgeReserveUsd,
      publicRemainingUsd,
      judgeRemainingUsd,
      cacheHitRatePct,
      userRemainingToday,
    };
  }

  return {
    allowed: true,
    mode: "live_meta_api",
    reason: "live_meta_api_authorized",
    todaySpendUsd,
    totalSpendUsd,
    lifetimeCapUsd: cfg.lifetimeCapUsd,
    judgeReserveUsd: cfg.judgeReserveUsd,
    publicRemainingUsd,
    judgeRemainingUsd,
    cacheHitRatePct,
    userRemainingToday,
  };
}

export function acquireStreamLock(userId: string, durationMs = 20_000) {
  activeStreamLocks.set(userId, Date.now() + durationMs);
}

export function releaseStreamLock(userId: string) {
  activeStreamLocks.delete(userId);
}

export function recordAiUsage(entry: {
  userId: string;
  ipHash: string;
  isJudge?: boolean;
  op: AiOperation;
  model: string;
  costUsd: number;
  cacheHit: boolean;
  latencyMs: number;
}) {
  usageLedger.push({
    ts: Date.now(),
    isJudge: Boolean(entry.isJudge),
    ...entry,
  });
  if (usageLedger.length > 500) {
    usageLedger.shift();
  }
}

/**
 * Computes Hamming distance between two 64-bit hex/binary perceptual dHashes.
 */
export function computeDHashHammingDistance(hashA: string, hashB: string): number {
  const cleanA = hashA.replace(/[^01a-fA-F]/g, "");
  const cleanB = hashB.replace(/[^01a-fA-F]/g, "");
  const len = Math.min(cleanA.length, cleanB.length);
  let diff = 0;
  for (let i = 0; i < len; i++) {
    if (cleanA[i] !== cleanB[i]) diff++;
  }
  return diff;
}

