import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * DECOMMISSIONED: Judge demo mock authentication has been completely removed
 * to prevent unauthorized access and enforce verified resident sessions.
 */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "judge_demo_decommissioned",
        message: "Judge demo access has been permanently removed. Please sign in with your verified resident account.",
      },
    },
    { status: 403 }
  );
}
