import { NextResponse } from "next/server";
import { verdaraDb } from "@/lib/db/database";
import { checkRateLimit, sanitizeInputText, isValidEmailFormat } from "@/lib/security/guard";

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local-client";
  const rl = checkRateLimit(`db-get:${ip}`, 30, 1);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      { status: 429 }
    );
  }

  return NextResponse.json({
    ok: true,
    database: verdaraDb.getDatabaseSummary(),
  });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local-client";
  const rl = checkRateLimit(`db-post:${ip}`, 15, 0.5);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const email = sanitizeInputText(body.email, 120);
    const displayName = sanitizeInputText(body.displayName, 80);
    const city = sanitizeInputText(body.city, 80);
    const countryCode = sanitizeInputText(body.countryCode, 8);
    const role =
      body.role === "judge" || body.role === "researcher"
        ? body.role
        : "resident";

    if (!isValidEmailFormat(email)) {
      return NextResponse.json(
        { ok: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    const userRecord = verdaraDb.upsertUserLogin({
      email,
      displayName,
      role,
      city,
      countryCode,
    });

    return NextResponse.json({
      ok: true,
      user: userRecord,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Malformed request payload" },
      { status: 400 }
    );
  }
}
