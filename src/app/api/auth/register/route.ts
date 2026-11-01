import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, sanitizeInputText, isValidEmailFormat } from "@/lib/security/guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local-client";
  const rl = checkRateLimit(`auth-register:${ip}`, 10, 0.2); // max 10 signups per minute per IP
  if (!rl.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: "rate_limit_exceeded",
        message: "Terlalu banyak permintaan pendaftaran. Silakan coba lagi sebentar lagi.",
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const email = sanitizeInputText(body.email, 120).toLowerCase().trim();
    const password = typeof body.password === "string" ? body.password : "";
    const displayName = sanitizeInputText(body.displayName || "", 80).trim();

    if (!isValidEmailFormat(email)) {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_email",
          message: "Format alamat email tidak valid (contoh: nama@domain.com).",
        },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        {
          ok: false,
          error: "weak_password",
          message: "Kata sandi minimal harus terdiri dari 6 karakter.",
        },
        { status: 400 }
      );
    }

    const cleanName = displayName || email.split("@")[0];

    const supabaseAdmin = createAdminClient();

    // Create user in Supabase with email_confirm: true so user is never blocked by SMTP delays
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: cleanName,
      },
    });

    if (error) {
      if (
        error.message.toLowerCase().includes("already registered") ||
        error.message.toLowerCase().includes("user already exists") ||
        error.message.toLowerCase().includes("unique constraint")
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: "email_exists",
            message: "Alamat email ini sudah terdaftar. Silakan pilih tab Masuk (Sign In) untuk melanjutkan.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          ok: false,
          error: "supabase_error",
          message: error.message,
        },
        { status: 400 }
      );
    }

    if (!data?.user) {
      return NextResponse.json(
        {
          ok: false,
          error: "unknown_error",
          message: "Gagal membuat akun baru di Supabase.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        displayName: cleanName,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "internal_error",
        message: err?.message || "Terjadi kesalahan internal pada server pendaftaran.",
      },
      { status: 500 }
    );
  }
}
