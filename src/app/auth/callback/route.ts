import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Supabase OAuth PKCE Callback Route Handler
 * Receives the code from external providers (Google, Facebook)
 * and exchanges it for a permanent session.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // If Supabase returned an OAuth configuration or exchange error
  if (error || errorDescription) {
    const errorUrl = new URL(`${origin}/login`);
    errorUrl.searchParams.set("error", error || "oauth_failure");
    if (errorDescription) {
      errorUrl.searchParams.set("error_description", errorDescription);
    }
    return NextResponse.redirect(errorUrl.toString());
  }

  if (code) {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore cookie mutations from read-only contexts
            }
          },
        },
      });

      const { data, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (!exchangeError && data?.session) {
        // Successful exchange, redirect to target workspace
        return NextResponse.redirect(`${origin}${next}`);
      }

      if (exchangeError) {
        const errorUrl = new URL(`${origin}/login`);
        errorUrl.searchParams.set("error", "code_exchange_failed");
        errorUrl.searchParams.set(
          "error_description",
          exchangeError.message || "Failed to exchange authorization code."
        );
        return NextResponse.redirect(errorUrl.toString());
      }
    }
  }

  // Fallback redirect to target route
  return NextResponse.redirect(`${origin}${next}`);
}
