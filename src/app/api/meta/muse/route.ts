import { NextRequest, NextResponse } from "next/server";
import { executeVerdaraCouncil, type SiteBrief } from "@/lib/meta/client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ipHash = req.headers.get("x-forwarded-for") || "127.0.0.1";

  try {
    const body = (await req.json()) as {
      siteBrief: SiteBrief;
      prompt?: string;
      userId?: string;
      isJudge?: boolean;
      useOpenWeightModel?: boolean;
    };

    const result = await executeVerdaraCouncil(body.siteBrief, {
      userId: body.userId || "judge-demo",
      ipHash,
      isJudge: body.isJudge ?? true,
      useOpenWeightModel: body.useOpenWeightModel ?? false,
      userQuery: body.prompt,
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "muse_error",
          message:
            err instanceof Error ? err.message : "Muse Council execution failed",
        },
      },
      { status: 500 }
    );
  }
}
