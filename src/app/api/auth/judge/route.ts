import { NextRequest, NextResponse } from "next/server";
import { resolvePresetGeoContext } from "@/lib/science/presets";

export async function POST(req: NextRequest) {
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
