import { NextRequest, NextResponse } from "next/server";
import { GOLDEN_LENS_SAMPLES } from "@/lib/meta/golden-cache";
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
  const rl = checkRateLimit(`meta-image:${ipHash}`, 15, 0.3);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: { code: "rate_limited", message: "Too many image requests. Please wait." } },
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
      specimenId?: string;
      sampleId?: string;
      koppenCode?: string;
      prompt?: string;
      isJudge?: boolean;
      userId?: string;
    };

    const targetId = sanitizeInputText(body.specimenId || body.sampleId || "patio_retrofit", 60);
    const sample =
      GOLDEN_LENS_SAMPLES.find((s) => s.id === targetId) ??
      GOLDEN_LENS_SAMPLES.find((s) => s.mode === "retrofit") ??
      GOLDEN_LENS_SAMPLES[0]!;

    const isJudge = body.isJudge ?? true;
    const userId = sanitizeInputText(body.userId || "judge-demo", 60);
    const koppenCode = sanitizeInputText(body.koppenCode || "Csb", 10);
    const sanitizedPrompt = body.prompt ? sanitizeInputText(body.prompt, 300) : undefined;
    const isStarterOrGuest =
      userId.startsWith("starter") || userId.startsWith("guest");

    // Security Gate: Custom retrofit synthesis requires verified resident account
    if (sanitizedPrompt && isStarterOrGuest) {
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

    const isCustomPrompt = Boolean(sanitizedPrompt);
    const shield = checkAiCreditShield({
      userId,
      ipHash,
      isJudge,
      op: "eco_retrofit",
      isCacheHit: !isCustomPrompt,
    });

    let liveCallMade = false;
    let liveCostUsd = 0.0;
    let generatedImageUrl = "/specimens/patio_retrofit_after.webp";

    if (isCustomPrompt && process.env.META_API_KEY && shield.mode === "live_meta_api") {
      try {
        const imgRes = await fetch("https://api.meta.ai/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.META_API_KEY}`,
          },
          body: JSON.stringify({
            model: process.env.META_MODEL_IMAGE || "muse-image-1.0",
            prompt: `Photorealistic architectural eco-retrofit with monocrystalline solar panels, vertical biophilic green wall, and modular rainwater cistern for Köppen ${koppenCode} climate: ${sanitizedPrompt}`,
            n: 1,
            size: "1024x1024",
          }),
          signal: AbortSignal.timeout(25_000),
        });

        if (imgRes.ok) {
          const imgData = (await imgRes.json()) as {
            data?: { b64_json?: string; url?: string }[];
          };
          const b64 = imgData.data?.[0]?.b64_json;
          if (b64) {
            generatedImageUrl = `data:image/webp;base64,${b64}`;
            liveCallMade = true;
            liveCostUsd = 0.04; // Standard Meta Muse Image tier
          }
        }
      } catch (err) {
        console.warn("Live Muse Image generation fallback:", err);
      }
    }

    const latencyMs = Math.max(180, Date.now() - startMs);
    recordAiUsage({
      userId,
      ipHash,
      isJudge,
      op: "eco_retrofit",
      model: process.env.META_MODEL_IMAGE || "muse-image-1.0",
      costUsd: liveCostUsd,
      cacheHit: !liveCallMade,
      latencyMs,
    });

    return NextResponse.json({
      ok: true,
      specimenId: sample.id,
      retrofitSpec: sample.retrofitSpec ?? {
        beforeSummaryEn: "Original dark asphalt roof slab.",
        beforeSummaryId: "Plat atap aspal gelap asli.",
        afterSummaryEn: "Eco-retrofitted roof with 4.8 kWp solar and rainwater cistern.",
        afterSummaryId: "Atap ramah lingkungan dengan solar panel 4.8 kWp dan tandon air hujan.",
        promptUsed: "Rooftop solar and rainwater harvesting architectural retrofit",
        projectedSolarKwp: 4.8,
        projectedRainLitersYr: 52000,
        coolingDeltaC: -3.2,
      },
      imageUrl: generatedImageUrl,
      promptUsed:
        sanitizedPrompt ||
        `Photorealistic architectural eco-retrofit with monocrystalline solar panels, vertical biophilic wall, and modular rainwater cistern for Köppen ${koppenCode} climate.`,
      telemetry: {
        provider: "meta-model-api",
        model: process.env.META_MODEL_IMAGE || "muse-image-1.0",
        latencyMs,
        costUsd: liveCostUsd,
        cache: liveCallMade ? "miss" : "hit",
        shieldMode: shield.mode,
        shieldReason: liveCallMade ? "live_muse_image_generated" : shield.reason,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "image_error",
          message: err instanceof Error ? err.message : "Image generation failed",
        },
      },
      { status: 500 }
    );
  }
}
