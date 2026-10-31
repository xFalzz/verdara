import { NextRequest, NextResponse } from "next/server";
import { executeVerdaraCouncil, type SiteBrief } from "@/lib/meta/client";
import {
  checkRateLimit,
  verifySafeOrigin,
  sanitizeInputText,
  sanitizeObject,
  clampNumber,
} from "@/lib/security/guard";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ipHash = req.headers.get("x-forwarded-for") || "127.0.0.1";

  // Sliding window rate limiting
  const rl = checkRateLimit(`council:${ipHash}`, 20, 0.4);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: { code: "rate_limited", message: "Too many deliberation requests. Please wait." } },
      { status: 429 }
    );
  }

  // Safe Origin check
  if (!verifySafeOrigin(req)) {
    return NextResponse.json(
      { error: { code: "unauthorized_origin", message: "Cross-site request blocked." } },
      { status: 403 }
    );
  }

  try {
    const rawBody = await req.json();
    const cleanBody = sanitizeObject(rawBody) as {
      siteBrief: SiteBrief;
      prompt?: string;
      userId?: string;
      isJudge?: boolean;
      useOpenWeightModel?: boolean;
    };

    if (!cleanBody || !cleanBody.siteBrief) {
      return NextResponse.json(
        { error: { code: "invalid_payload", message: "Missing siteBrief object." } },
        { status: 400 }
      );
    }

    const sanitizedPrompt = cleanBody.prompt
      ? sanitizeInputText(cleanBody.prompt, 300)
      : undefined;

    // Validate and clamp siteBrief numbers to prevent corrupted state
    const brief = cleanBody.siteBrief;
    brief.footprintM2 = clampNumber(brief.footprintM2, 10, 50000, 150);
    brief.solarKwp = clampNumber(brief.solarKwp, 0, 1000, 4.8);
    brief.solarKwhYear = clampNumber(brief.solarKwhYear, 0, 2000000, 6200);
    brief.bioporeUnits = clampNumber(brief.bioporeUnits, 0, 500, 8);
    brief.tciScore = clampNumber(brief.tciScore, 0, 100, 72);

    const result = await executeVerdaraCouncil(brief, {
      userId: sanitizeInputText(cleanBody.userId || "judge-demo", 50),
      ipHash,
      isJudge: cleanBody.isJudge ?? true,
      useOpenWeightModel: cleanBody.useOpenWeightModel ?? true,
      userQuery: sanitizedPrompt,
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: {
          code: "council_error",
          message: err instanceof Error ? err.message : "Council execution failed",
        },
      },
      { status: 500 }
    );
  }
}
