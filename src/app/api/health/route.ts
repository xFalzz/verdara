import { NextResponse } from "next/server";
import { checkAiCreditShield, getShieldConfig } from "@/lib/meta/shield";

export async function GET() {
  const cfg = getShieldConfig();
  const shield = checkAiCreditShield({
    userId: "health-check",
    ipHash: "127.0.0.1",
    isJudge: true,
    op: "lens_scan",
    isCacheHit: true,
  });

  return NextResponse.json({
    ok: true,
    service: "verdara-spatial-intelligence",
    version: "3.0.0",
    timestamp: new Date().toISOString(),
    metaModels: {
      spark: process.env.META_MODEL_SPARK || "muse-spark",
      sam: process.env.META_MODEL_SAM || "sam-3-1",
      image: process.env.META_MODEL_IMAGE || "muse-image",
      voice: process.env.META_MODEL_VOICE || "muse-voice-transcribe",
      openWeight: process.env.META_MODEL_OPEN || "muse-spark-open",
    },
    creditShield: {
      ...cfg,
      status: shield,
    },
  });
}
