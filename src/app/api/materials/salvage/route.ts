import { NextRequest, NextResponse } from "next/server";
import { evaluateMaterialInstance, type MaterialCode, type SizeClassHint } from "@/lib/science/valuation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      items?: Array<{
        materialCode: MaterialCode;
        sizeHint?: SizeClassHint;
        areaRatio?: number;
      }>;
      countryCode?: string;
    };

    const countryCode = body.countryCode || "US-CA";
    const items = body.items || [
      { materialCode: "PET" as MaterialCode, sizeHint: "small" as SizeClassHint, areaRatio: 0.12 },
      { materialCode: "ALU" as MaterialCode, sizeHint: "small" as SizeClassHint, areaRatio: 0.08 },
    ];

    const results = items.map((item, idx) => {
      const evaluation = evaluateMaterialInstance(
        item.materialCode,
        item.sizeHint || "small",
        countryCode,
        item.areaRatio || 0.1
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
      totalValueMin,
      totalValueMax,
      totalCo2eAvoidedG: totalCo2eG,
      items: results,
      telemetry: {
        timestamp: new Date().toISOString(),
        engine: "EPA WARM v16 + Jurisdiction DRS Table v3.2",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: {
          code: "salvage_eval_error",
          message: err instanceof Error ? err.message : "Salvage evaluation failed",
        },
      },
      { status: 500 }
    );
  }
}
