import { NextResponse } from "next/server";
import { verdaraDb } from "@/lib/db/database";
import { checkRateLimit, sanitizeInputText, isValidEmailFormat } from "@/lib/security/guard";
import { createClientServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local-client";
  const rl = checkRateLimit(`profile-get:${ip}`, 30, 1);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const emailParam = searchParams.get("email");

  // Try fetching from authenticated Supabase session first
  try {
    const supabase = await createClientServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        return NextResponse.json({
          ok: true,
          profile: {
            id: profile.id,
            email: profile.email || user.email,
            displayName: profile.display_name || user.user_metadata?.full_name || "Verdara Resident",
            avatarUrl: profile.avatar_url || user.user_metadata?.avatar_url || "",
            city: profile.city || "Menlo Park",
            countryCode: profile.country_code || "US",
            role: profile.role || "resident",
            theme: profile.theme_preference || "dark",
            units: profile.units_preference || "metric",
            solarKwp: profile.solar_kwp || 19.8,
            annualSavingsUsd: profile.annual_savings_usd || 9651,
            co2SavedKg: profile.co2_saved_kg || 14200,
            createdAt: profile.created_at || user.created_at,
          },
        });
      }
    }
  } catch {
    // Supabase session not active or table not initialized yet
  }

  // Fallback to local database record
  if (emailParam && isValidEmailFormat(emailParam)) {
    const record = verdaraDb.getUserByEmail(emailParam);
    if (record) {
      return NextResponse.json({
        ok: true,
        profile: {
          id: record.id,
          email: record.email,
          displayName: record.displayName,
          avatarUrl: record.avatarUrl || "",
          city: record.city,
          countryCode: record.countryCode,
          role: record.role,
          level: record.level,
          xp: record.xp,
          createdAt: record.createdAt,
        },
      });
    }
  }

  return NextResponse.json({
    ok: true,
    profile: null,
  });
}

export async function PATCH(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local-client";
  const rl = checkRateLimit(`profile-patch:${ip}`, 15, 0.5);
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
    const avatarUrl = sanitizeInputText(body.avatarUrl, 300);
    const city = sanitizeInputText(body.city, 80);

    if (!email || !isValidEmailFormat(email)) {
      return NextResponse.json(
        { ok: false, error: "Valid email is required to update profile." },
        { status: 400 }
      );
    }

    // Attempt updating in Supabase if session exists
    try {
      const supabase = await createClientServer();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .update({
            display_name: displayName,
            avatar_url: avatarUrl,
            city: city,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        await supabase.auth.updateUser({
          data: {
            full_name: displayName,
            avatar_url: avatarUrl,
          },
        });
      }
    } catch {
      // Local database fallback
    }

    const updated = verdaraDb.updateUserProfile(email, {
      displayName,
      avatarUrl,
      city,
    });

    return NextResponse.json({
      ok: true,
      profile: updated,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to update resident profile." },
      { status: 500 }
    );
  }
}
