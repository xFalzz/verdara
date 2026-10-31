import { NextRequest, NextResponse } from "next/server";
import { evaluateMaterialInstance, type MaterialCode, type SizeClassHint } from "@/lib/science/valuation";
import {
  checkRateLimit,
  verifySafeOrigin,
  sanitizeInputText,
  sanitizeObject,
  clampNumber,
} from "@/lib/security/guard";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";

  // Rate limiting
  const rl = checkRateLimit(`salvage:${ip}`, 30, 1);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: { code: "rate_limited", message: "Too many salvage requests. Please wait." } },
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
      items?: Array<{
        materialCode: MaterialCode;
        sizeHint?: SizeClassHint;
        areaRatio?: number;
      }>;
      countryCode?: string;
    };

    const countryCode = sanitizeInputText(body.countryCode || "US-CA", 10);
    // Limit items to maximum 30 to prevent array-flooding DoS attacks
    const rawItems = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
    const items = rawItems.length > 0 ? rawItems : [
      { materialCode: "PET" as MaterialCode, sizeHint: "small" as SizeClassHint, areaRatio: 0.12 },
      { materialCode: "ALU" as MaterialCode, sizeHint: "small" as SizeClassHint, areaRatio: 0.08 },
    ];

    const results = items.map((item, idx) => {
      const evaluation = evaluateMaterialInstance(
        item.materialCode,
        item.sizeHint || "small",
        countryCode,
        clampNumber(item.areaRatio, 0.01, 1, 0.1)
      );
      return {
        id: `item-${idx}`,
        ...evaluation,
      };
    });

    const totalValueMin = results.reduce((acc, curr) => acc + curr.valueMin, 0);
    const totalValueMax = results.reduce((acc, curr) => acc + curr.valueMax, 0);
    const totalCo2eG = results.reduce((acc, curr) => acc + curr.co2eAvoidedG, 0);

    return NextResponse.json({
      ok: true,
      countryCode,
      currency: results[0]?.currency || "USD",
      totalValueMin: Number(totalValueMin.toFixed(2)),
      totalValueMax: Number(totalValueMax.toFixed(2)),
      totalCo2eAvoidedG: Number(totalCo2eG.toFixed(1)),
      items: results,
      telemetry: {
        timestamp: new Date().toISOString(),
        engine: "EPA WARM v16 + Jurisdiction DRS Table v3.2",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "salvage_eval_error",
          message: err instanceof Error ? err.message : "Salvage evaluation failed",
        },
      },
      { status: 500 }
    );
  }
}
