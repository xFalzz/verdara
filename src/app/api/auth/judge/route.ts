import { NextRequest, NextResponse } from "next/server";
import { resolvePresetGeoContext } from "@/lib/science/presets";
import { checkRateLimit, verifySafeOrigin } from "@/lib/security/guard";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";

  // Rate limiting defense
  const rl = checkRateLimit(`judge-auth:${ip}`, 12, 0.2);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: { code: "rate_limited", message: "Too many authentication requests. Please wait." } },
      { status: 429 }
    );
  }

  // CSRF safe origin verification
  if (!verifySafeOrigin(req)) {
    return NextResponse.json(
      { error: { code: "unauthorized_origin", message: "Cross-site request blocked." } },
      { status: 403 }
    );
  }

  const ua = req.headers.get("user-agent") || "";
  if (/curl|python-requests|go-http-client|scrapy/i.test(ua)) {
    return NextResponse.json(
      { error: { code: "bot_blocked", message: "Automated User-Agent blocked." } },
      { status: 403 }
    );
  }

  const presetGeo = resolvePresetGeoContext("menlo_park", 10);

  return NextResponse.json({
    ok: true,
    judgeSession: {
      uid: `judge-${Date.now().toString(36)}`,
      displayName: "Meta Hackathon Judge (Menlo Park)",
      email: "judge+menlopark@verdara.app",
      isJudgeDemo: true,
      level: 5,
      xp: 1120,
      presetId: "menlo_park",
      geo: presetGeo,
      redirectTo: "/dashboard",
    },
  });
}
