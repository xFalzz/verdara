/**
 * SAM 3.1 Polygon Normalization, IoU Deduplication & Proof-of-Action Scoring Engine
 */

export interface NormalizedMask {
  bbox: [number, number, number, number]; // [x, y, w, h] in [0..1]
  polygon: [number, number][];            // Normalized vertices [x, y] in [0..1]
  areaRatio: number;                      // 0..1 fraction of image area
}

export interface SegmentedCandidate {
  concept: string;
  score: number;
  mask: NormalizedMask;
  materialCode?: string;
  sizeClassHint?: "small" | "large" | "unknown";
}

/**
 * Computes Bounding-Box Intersection-over-Union (IoU) between two normalized masks.
 */
export function computeMaskIoU(a: NormalizedMask, b: NormalizedMask): number {
  const [ax, ay, aw, ah] = a.bbox;
  const [bx, by, bw, bh] = b.bbox;

  const x1 = Math.max(ax, bx);
  const y1 = Math.max(ay, by);
  const x2 = Math.min(ax + aw, bx + bw);
  const y2 = Math.min(ay + ah, by + bh);

  const interW = Math.max(0, x2 - x1);
  const interH = Math.max(0, y2 - y1);
  const interArea = interW * interH;

  if (interArea <= 0) return 0;

  const areaA = aw * ah;
  const areaB = bw * bh;
  const unionArea = areaA + areaB - interArea;

  return unionArea > 0 ? interArea / unionArea : 0;
}

/**
 * Filters noise (score < 0.45 or areaRatio < 0.002) and deduplicates overlapping
 * SAM 3.1 masks (IoU >= iouThreshold), retaining highest-confidence instances.
 */
export function filterAndDedupeMasks<T extends SegmentedCandidate>(
  candidates: T[],
  iouThreshold = 0.85,
  maxInstances = 15
): T[] {
  const valid = candidates
    .filter((c) => c.score >= 0.45 && c.mask.areaRatio >= 0.002)
    .sort((a, b) => b.score - a.score);

  const kept: T[] = [];
  for (const cand of valid) {
    const isDuplicate = kept.some(
      (existing) => computeMaskIoU(existing.mask, cand.mask) >= iouThreshold
    );
    if (!isDuplicate) {
      kept.push(cand);
      if (kept.length >= maxInstances) break;
    }
  }
  return kept;
}

/**
 * Computes plant leaf lesion percentage from SAM 3.1 leaf and lesion masks.
 */
export function computePlantLesionSeverity(
  leafAreaRatio: number,
  lesionAreaRatio: number
): {
  infectedPct: number;
  severity: "low" | "moderate" | "high";
} {
  if (leafAreaRatio <= 0.001) {
    return { infectedPct: 0, severity: "low" };
  }
  const pct = Math.min(
    100,
    Number(((lesionAreaRatio / leafAreaRatio) * 100).toFixed(1))
  );
  const severity = pct < 5 ? "low" : pct <= 25 ? "moderate" : "high";
  return { infectedPct: pct, severity };
}

export interface ProofRequirementSpec {
  concept: string;
  minCount: number;
  weight: number;
  required: boolean;
}

export interface ProofChecklistItem {
  concept: string;
  required: boolean;
  detectedCount: number;
  minCount: number;
  avgConfidence: number;
  passed: boolean;
}

/**
 * Deterministic SAM 3.1 Proof-of-Action Verification Scoring (Blueprint §8.5)
 */
export function evaluateProofOfAction(
  requirements: ProofRequirementSpec[],
  detectedByConcept: Record<string, number[]> // concept -> array of confidence scores >= 0.50
): {
  score: number;
  verified: boolean;
  checklist: ProofChecklistItem[];
} {
  let weightedSum = 0;
  let totalWeight = 0;
  let allRequiredCovered = true;
  const checklist: ProofChecklistItem[] = [];

  for (const req of requirements) {
    const scores = (detectedByConcept[req.concept] ?? [])
      .filter((s) => s >= 0.5)
      .sort((a, b) => b - a);

    const coverage = Math.min(1, scores.length / Math.max(1, req.minCount));
    const topScores = scores.slice(0, req.minCount);
    const quality =
      topScores.length > 0
        ? topScores.reduce((a, b) => a + b, 0) / topScores.length
        : 0;

    const part = coverage * (0.6 + 0.4 * quality);
    weightedSum += req.weight * part;
    totalWeight += req.weight;

    if (req.required && coverage < 1) {
      allRequiredCovered = false;
    }

    checklist.push({
      concept: req.concept,
      required: req.required,
      detectedCount: scores.length,
      minCount: req.minCount,
      avgConfidence: Number(quality.toFixed(2)),
      passed: coverage >= 1,
    });
  }

  const score =
    totalWeight > 0 ? Math.round((100 * weightedSum) / totalWeight) : 0;
  const verified = score >= 70 && allRequiredCovered;

  return { score, verified, checklist };
}
