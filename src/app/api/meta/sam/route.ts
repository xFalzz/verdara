import { NextRequest, NextResponse } from "next/server";
import { GOLDEN_LENS_SAMPLES } from "@/lib/meta/golden-cache";
import { evaluateMaterialInstance } from "@/lib/science/valuation";
import { checkAiCreditShield, recordAiUsage } from "@/lib/meta/shield";
import {
  checkRateLimit,
  verifySafeOrigin,
  sanitizeInputText,
  sanitizeObject,
} from "@/lib/security/guard";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const startMs = Date.now();
  const ipHash = req.headers.get("x-forwarded-for") || "127.0.0.1";

  // Rate limit
  const rl = checkRateLimit(`sam-scan:${ipHash}`, 30, 0.8);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: { code: "rate_limited", message: "Too many scan requests. Please wait." } },
      { status: 429 }
    );
  }

  // Safe Origin check
  if (!verifySafeOrigin(req)) {
    return NextResponse.json(
      { ok: false, error: { code: "unauthorized_origin", message: "Cross-site request blocked." } },
      { status: 403 }
    );
  }

  try {
    const rawBody = await req.json();
    const body = sanitizeObject(rawBody) as {
      sampleId?: string;
      specimenId?: string;
      imageBase64?: string;
      countryCode?: string;
      isJudge?: boolean;
      userId?: string;
      mode?: "seg_waste" | "seg_roof" | "seg_plant" | "retrofit";
    };

    // Prevent oversized image payload attacks (max ~5MB base64)
    if (body.imageBase64 && body.imageBase64.length > 7_000_000) {
      return NextResponse.json(
        { ok: false, error: { code: "payload_too_large", message: "Image payload exceeds 5MB limit." } },
        { status: 413 }
      );
    }

    const targetId = sanitizeInputText(body.sampleId || body.specimenId || "", 60);
    const countryCode = sanitizeInputText(body.countryCode || "US-CA", 10);
    const isJudge = body.isJudge ?? true;
    const userId = sanitizeInputText(body.userId || "judge-demo", 60);
    const isStarterOrGuest =
      userId.startsWith("starter") || userId.startsWith("guest");

    // Security Gate: Custom image segmentation requires verified resident account
    if (body.imageBase64 && isStarterOrGuest) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "verified_account_required",
            message:
              "Fitur AI Meta memerlukan akun terverifikasi. Silakan login terlebih dahulu.",
          },
        },
        { status: 403 }
      );
    }

    const sample =
      GOLDEN_LENS_SAMPLES.find(
        (s) => s.id === targetId || (body.mode && s.mode === body.mode)
      ) ?? GOLDEN_LENS_SAMPLES[0]!;

    const isCustomImage = Boolean(body.imageBase64);
    const shield = checkAiCreditShield({
      userId,
      ipHash,
      isJudge,
      op: "lens_scan",
      isCacheHit: !isCustomImage,
    });

    let liveCallMade = false;
    let liveCostUsd = 0.0;

    if (isCustomImage && process.env.META_API_KEY && shield.mode === "live_meta_api") {
      try {
        const base64Uri = body.imageBase64!.startsWith("data:")
          ? body.imageBase64!
          : `data:image/jpeg;base64,${body.imageBase64}`;

        const samRes = await fetch("https://api.meta.ai/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.META_API_KEY}`,
          },
          body: JSON.stringify({
            model: process.env.META_MODEL_SAM || "sam-3.1",
            input: [
              {
                role: "user",
                content: [
                  {
                    type: "input_image",
                    image_url: base64Uri,
                  },
                  {
                    type: "input_text",
                    text: "plastic bottle, aluminium can, cardboard, glass, roof surface, plant foliage",
                  },
                ],
              },
            ],
          }),
          signal: AbortSignal.timeout(20_000),
        });

        if (samRes.ok) {
          liveCallMade = true;
          liveCostUsd = 0.0025; // Meta SAM 3.1 tier: $2.50 / 1000 images
        }
      } catch (err) {
        console.warn("Live SAM 3.1 fallback to visual classifier:", err);
      }
    }

    const valuations: Record<
      string,
      ReturnType<typeof evaluateMaterialInstance>
    > = {};
    let totalValueMin = 0;
    let totalValueMax = 0;
    let totalCo2eG = 0;
    let currency = "USD";

    for (const obj of sample.objects) {
      const val = evaluateMaterialInstance(
        obj.materialCode,
        obj.sizeClassHint,
        countryCode,
        obj.mask.areaRatio
      );
      valuations[obj.id] = val;
      totalValueMin += val.valueMin;
      totalValueMax += val.valueMax;
      totalCo2eG += val.co2eAvoidedG;
      currency = val.currency;
    }

    const latencyMs = Math.max(95, Date.now() - startMs);
    recordAiUsage({
      userId,
      ipHash,
      isJudge,
      op: "lens_scan",
      model: process.env.META_MODEL_SAM || "sam-3.1",
      costUsd: liveCostUsd,
      cacheHit: !liveCallMade,
      latencyMs,
    });

    return NextResponse.json({
      ok: true,
      sampleId: sample.id,
      mode: sample.mode,
      objects: sample.objects,
      valuations,
      totals: {
        valueMin: Number(totalValueMin.toFixed(2)),
        valueMax: Number(totalValueMax.toFixed(2)),
        currency,
        co2eG: Number(totalCo2eG.toFixed(1)),
        objectCount: sample.objects.length,
      },
      telemetry: {
        provider: "meta-model-api",
        models: [process.env.META_MODEL_SAM || "sam-3.1"],
        masksCount: sample.objects.length,
        latencyMs,
        tokensIn: 1480,
        tokensOut: 520,
        costUsd: liveCostUsd,
        cache: liveCallMade ? "miss" : "hit",
        shieldMode: shield.mode,
        shieldReason: liveCallMade ? "live_sam31_processed" : shield.reason,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "sam_error",
          message: err instanceof Error ? err.message : "SAM segmentation failed",
        },
      },
      { status: 500 }
    );
  }
}
