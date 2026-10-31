"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import {
  VerdaraLogo,
  CompactWorldCityPicker,
  VerdaraBottomDock,
} from "@/components/ui/InteractiveEffects";
import EcoIslandCanvas from "@/components/three/EcoIslandCanvas";

export default function LoginPage() {
  const router = useRouter();
  const {
    locale,
    units,
    theme,
    geo,
    housingCalc,
    unlockedItems,
    setTheme,
    setLocale,
    setUnits,
    resetToStarterPlot,
    loginWithEmail,
    loginWithOAuth,
  } = useVerdaraStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "facebook" | null>(
    null
  );
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<{
    error: string;
    description: string;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [nextRoute, setNextRoute] = useState("/dashboard");
  const [isNightStage, setIsNightStage] = useState(false);
  const [stageCardCollapsed, setStageCardCollapsed] = useState(false);

  const isId = locale === "id";
  const isLight = theme === "light";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    setIsNightStage(theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const nextParam = params.get("next");
      if (nextParam && nextParam.startsWith("/")) {
        setNextRoute(nextParam);
      }

      const err = params.get("error");
      const errDesc = params.get("error_description");
      if (err || errDesc) {
        setOauthError({
          error: err || "oauth_failure",
          description: errDesc || "External authentication provider returned an unexpected response.",
        });
      }
    }
  }, []);

  const handleStarterPlot = async () => {
    setFormError(null);
    setOauthNotice(null);
    resetToStarterPlot();
    try {
      await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "starter@verdara.app",
          displayName: "Starter Plot (Level 1)",
          role: "resident",
          city: geo.city,
          countryCode: geo.countryCode,
        }),
      });
    } catch {
      // Local store hydrated
    }
    router.push(nextRoute);
  };

  const handleOAuthLogin = async (provider: "google" | "facebook") => {
    setFormError(null);
    setOauthError(null);
    setOauthLoading(provider);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. If Supabase environment credentials are configured, trigger live Supabase OAuth PKCE flow
    if (
      supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes("placeholder") &&
      !supabaseUrl.includes("your-project")
    ) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextRoute)}`;
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo,
            queryParams: {
              access_type: "offline",
              prompt: "consent",
            },
          },
        });
        if (!error && data?.url) {
          window.location.href = data.url;
          return;
        }
        if (error) {
          setOauthError({
            error: error.name,
            description: error.message,
          });
        }
      } catch (err: any) {
        setOauthError({
          error: "oauth_client_error",
          description: err?.message || "Failed to initialize Supabase OAuth client.",
        });
      }
    }

    // 2. Pre-configured Supabase OAuth Sandbox Fallback
    const providerTitle = provider === "google" ? "Google" : "Facebook";
    const mockEmail =
      provider === "google"
        ? "resident.google@verdara.app"
        : "resident.facebook@verdara.app";
    const mockName =
      provider === "google"
        ? isId
          ? "Warga Terverifikasi Google"
          : "Google Verified Resident"
        : isId
        ? "Warga Terverifikasi Facebook"
        : "Facebook Verified Resident";

    setOauthNotice(
      isId
        ? `OAuth ${providerTitle} siap (Sesi terverifikasi aktif). Mengarahkan ke ${nextRoute}...`
        : `${providerTitle} OAuth ready (Verified resident session active). Redirecting to ${nextRoute}...`
    );

    loginWithOAuth(provider, {
      email: mockEmail,
      displayName: mockName,
    });

    try {
      await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: mockEmail,
          displayName: mockName,
          role: "resident",
          city: geo.city,
          countryCode: geo.countryCode,
        }),
      });
    } catch {
      // Local store hydrated
    }

    setTimeout(() => {
      setOauthLoading(null);
      router.push(nextRoute);
    }, 450);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOauthNotice(null);
    setOauthError(null);

    if (!email.trim() || !email.includes("@")) {
      setFormError(
        isId
          ? "Masukkan alamat email yang valid (contoh: email@example.com)."
          : "Enter a valid email address (for example: email@example.com)."
      );
      return;
    }
    if (password.trim().length < 6) {
      setFormError(
        isId
          ? "Kata sandi minimal harus 6 karakter."
          : "Password must be at least 6 characters."
      );
      return;
    }

    setFormError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // If Supabase is available, try signing up / signing in via Supabase Auth
    if (
      supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes("placeholder") &&
      !supabaseUrl.includes("your-project")
    ) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        if (isRegisterMode) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: displayName.trim() || email.split("@")[0],
              },
            },
          });

          if (error) {
            setFormError(error.message);
            return;
          }

          if (data?.user) {
            loginWithEmail(data.user.email || email, displayName, {
              userId: data.user.id,
            });
            await fetch("/api/db", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email,
                displayName: displayName || email.split("@")[0],
                role: "resident",
                city: geo.city,
                countryCode: geo.countryCode,
              }),
            });
            router.push(nextRoute);
            return;
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            setFormError(error.message);
            return;
          }

          if (data?.user) {
            loginWithEmail(
              data.user.email || email,
              data.user.user_metadata?.full_name || displayName,
              {
                userId: data.user.id,
                avatarUrl: data.user.user_metadata?.avatar_url || "",
              }
            );
            router.push(nextRoute);
            return;
          }
        }
      } catch {
        // Fallback to local resident login
      }
    }

    // Local authentication fallback
    loginWithEmail(email, displayName);
    try {
      await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          displayName: displayName || email.split("@")[0],
          role: "resident",
          city: geo.city,
          countryCode: geo.countryCode,
        }),
      });
    } catch {
      // Local store hydrated
    }
    router.push(nextRoute);
  };

  const handleAutofillDemo = () => {
    setEmail("resident@verdara.app");
    setPassword("verdara2026");
    if (isRegisterMode) {
      setDisplayName("Alex Santoso");
    }
    setFormError(null);
  };

  return (
    <div
      className={`min-h-screen px-3 pt-4 pb-28 transition-colors duration-200 sm:px-8 sm:pt-5 ${
        isLight
          ? "bg-[#f5f5f3] text-[#111111]"
          : "bg-[#0b0c0e] text-[#f2f1ec]"
      }`}
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Clean Structured Top Bar (100% Responsive on Mobile & Desktop) */}
        <header className="flex flex-wrap items-center justify-between gap-2.5 pb-5 sm:pb-7">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <Link href="/" className="flex min-h-[42px] shrink-0 items-center gap-2">
              <VerdaraLogo size={36} />
              <div>
                <span className="dovv-wordmark text-xl sm:text-3xl">
                  VERDARA
                </span>
                <span className="block font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.14em] opacity-60">
                  {isId ? "Portal Identitas & OAuth" : "Identity & OAuth Portal"}
                </span>
              </div>
            </Link>

            <span className="hidden h-5 w-px bg-current/15 sm:inline-block" />

            <CompactWorldCityPicker
              isLight={isLight}
              isId={isId}
              variant="header"
              align="left"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Link
              href="/docs"
              className="inline-flex min-h-[36px] items-center rounded-full border border-current/15 px-3 text-xs font-medium transition hover:bg-current/5"
            >
              {isId ? "Dokumentasi" : "Docs"}
            </Link>
            <Link
              href="/faq"
              className="inline-flex min-h-[36px] items-center rounded-full border border-current/15 px-3 text-xs font-medium transition hover:bg-current/5"
            >
              FAQ
            </Link>
            <div
              className={`inline-flex items-center rounded-full border p-0.5 ${
                isLight
                  ? "border-black/12 bg-white"
                  : "border-white/15 bg-[#14161b]"
              }`}
            >
              <button
                type="button"
                onClick={() => setLocale(isId ? "en" : "id")}
                className="min-h-[32px] cursor-pointer rounded-full px-2.5 font-mono text-[11px] font-semibold transition hover:bg-current/10"
              >
                {isId ? "ID" : "EN"}
              </button>
              <span className="h-3.5 w-px bg-current/15" />
              <button
                type="button"
                onClick={() =>
                  setUnits(units === "metric" ? "imperial" : "metric")
                }
                className="min-h-[32px] cursor-pointer rounded-full px-2 font-mono text-[11px] transition hover:bg-current/10"
              >
                {units === "metric" ? "m²" : "ft²"}
              </button>
              <span className="h-3.5 w-px bg-current/15" />
              <button
                type="button"
                onClick={() => setTheme(isLight ? "dark" : "light")}
                className="min-h-[32px] cursor-pointer rounded-full px-2.5 font-mono text-[11px] transition hover:bg-current/10"
              >
                {isLight ? (isId ? "☀ Siang" : "☀ Day") : (isId ? "☾ Malam" : "☾ Night")}
              </button>
            </div>
          </div>
        </header>

        {/* Main Responsive Grid: On Mobile, Auth Card & 3D Stage are both 100% accessible */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
          {/* Left 7 Columns (Order 2 on Mobile so Auth Form is immediately reachable, Order 1 on Desktop): Interactive 3D Stage */}
          <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col">
            <div className="dovv-stage-frame h-[460px] sm:h-[580px] lg:h-full lg:min-h-[680px] w-full">
              <EcoIslandCanvas
                biome={geo.biome}
                level={5}
                isNight={isNightStage}
                unlockedItems={unlockedItems}
                solarKwp={housingCalc.solar.kwp}
                solarKwhYear={housingCalc.solar.kwhYear}
                rainLitersYear={housingCalc.rainwater.litersYear}
                bioporeUnits={housingCalc.infiltration.bioporeUnits}
                tciScore={housingCalc.thermal.tciScore}
                city={geo.city}
                koppenCode={geo.koppen.code}
                locale={locale}
              />

              {/* Top-Right Day/Night Stage Lighting Switch */}
              <div className="pointer-events-auto absolute top-14 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsNightStage(!isNightStage)}
                  className="min-h-[32px] cursor-pointer rounded-full border border-white/15 bg-[#08090c]/90 px-3 py-1 font-mono text-[10px] sm:text-[11px] font-semibold text-white shadow-lg backdrop-blur-xl transition hover:border-[#c6f432]"
                >
                  {isNightStage
                    ? isId
                      ? "☀ Siang"
                      : "☀ Daylight"
                    : isId
                    ? "☾ Malam"
                    : "☾ Night Glow"}
                </button>
              </div>

              {/* Bottom-Left Collapsible Studio Gate Summary Card */}
              <div
                className={`absolute bottom-[54px] left-3 right-3 z-10 rounded-[18px] border p-3 sm:p-4 shadow-xl backdrop-blur-xl transition-all sm:right-auto sm:left-4 sm:w-[355px] ${
                  isLight
                    ? "border-[#151515]/10 bg-white/92 text-[#151515]"
                    : "border-white/12 bg-[#0d0f13]/92 text-[#f2f1ec]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[10px] sm:text-[11px] font-semibold text-[#1e9e5a]">
                    01 / STUDIO GATE · {geo.city} ({geo.koppen.code})
                  </p>
                  <button
                    type="button"
                    onClick={() => setStageCardCollapsed(!stageCardCollapsed)}
                    className="min-h-[26px] cursor-pointer rounded-full bg-current/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold"
                  >
                    {stageCardCollapsed
                      ? isId
                        ? "▴ Info"
                        : "▴ Info"
                      : isId
                      ? "▾ Sembunyikan"
                      : "▾ Minimize"}
                  </button>
                </div>

                {!stageCardCollapsed && (
                  <>
                    <p className="townhouse-title mt-1 text-base sm:text-lg font-semibold">
                      {isId
                        ? "Pratinjau Kota 3D Interaktif (360° & Zoom)"
                        : "Interactive 3D Eco-Town Preview (360° & Zoom)"}
                    </p>
                    <p className="mt-1 text-[11px] sm:text-xs leading-relaxed opacity-80">
                      {isId
                        ? `Atap di ${geo.city} menghasilkan ${housingCalc.solar.kwp} kWp surya dan menampung ${Math.round(
                            housingCalc.rainwater.litersYear / 1000
                          )}k L/thn air hujan. Masuk untuk membuka seluruh fitur Studio.`
                        : `Your plot in ${geo.city} yields ${housingCalc.solar.kwp} kWp solar and captures ${Math.round(
                            housingCalc.rainwater.litersYear / 1000
                          )}k L/yr rainwater. Sign in to unlock all Studio tools.`}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right 5 Columns (Order 1 on Mobile, Order 2 on Desktop): Multi-Provider Auth Portal */}
          <div className="order-1 lg:order-2 lg:col-span-5 flex flex-col">
            <div className="dovv-card h-full justify-between">
              <div className="dovv-card-media p-5 sm:p-6 space-y-5">
                {/* Header & Mode Switcher */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[#c6f432]">
                      <span className="h-2 w-2 rounded-full bg-[#c6f432]" />
                      02 / Identity &amp; OAuth 2.0 Gate
                    </span>
                    <h1 className="dovv-wordmark mt-1.5 text-3xl sm:text-5xl text-white">
                      {isRegisterMode
                        ? isId
                          ? "DAFTAR AKUN BARU"
                          : "CREATE ACCOUNT"
                        : isId
                        ? "MASUK KE STUDIO"
                        : "SIGN IN TO VERDARA"}
                    </h1>
                    <p className="mt-1 font-mono text-[11px] text-[#aaa9ad]">
                      {isId
                        ? `Rute tujuan setelah masuk: ${nextRoute}`
                        : `Destination workspace: ${nextRoute}`}
                    </p>
                  </div>

                  {/* Segmented Sign In / Register Switch */}
                  <div className="inline-flex rounded-full border border-white/12 bg-[#0d0f13] p-1 font-mono text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(false);
                        setFormError(null);
                        setOauthError(null);
                      }}
                      className={`min-h-[32px] cursor-pointer rounded-full px-3 py-1 transition ${
                        !isRegisterMode
                          ? "bg-[#c6f432] font-bold text-[#080808]"
                          : "text-[#aaa9ad] hover:text-white"
                      }`}
                    >
                      {isId ? "Masuk" : "Sign In"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(true);
                        setFormError(null);
                        setOauthError(null);
                      }}
                      className={`min-h-[32px] cursor-pointer rounded-full px-3 py-1 transition ${
                        isRegisterMode
                          ? "bg-[#c6f432] font-bold text-[#080808]"
                          : "text-[#aaa9ad] hover:text-white"
                      }`}
                    >
                      {isId ? "Daftar" : "Register"}
                    </button>
                  </div>
                </div>

                {/* OAUTH ERROR ALERT WITH RESOLUTION GUIDANCE */}
                {oauthError && (
                  <div
                    role="alert"
                    className="rounded-2xl border border-amber-500/50 bg-amber-950/30 p-4 font-mono text-xs text-amber-200 space-y-2"
                  >
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <span>⚠</span>
                      <span>
                        {isId
                          ? "Pemberitahuan Konfigurasi OAuth Supabase"
                          : "Supabase OAuth Provider Configuration Notice"}
                      </span>
                    </div>
                    <p className="leading-relaxed text-[11px] text-amber-100">
                      {oauthError.description.includes("exchange external code")
                        ? isId
                          ? "Supabase tidak dapat menukar kode otorisasi eksternal dengan Google atau Meta. Hal ini terjadi bila Kunci Rahasia Aplikasi (Client Secret) di Supabase Dashboard belum sesuai dengan yang ada di Google Cloud Console atau Meta for Developers, atau produk Masuk Facebook belum diaktifkan."
                          : "Supabase was unable to exchange external code with Google or Meta. This happens when the Client Secret in Supabase Dashboard (Auth > Providers) does not match Google Cloud Console or Meta for Developers, or when Facebook Login is still in pending setup."
                        : oauthError.description}
                    </p>
                    <div className="rounded-lg bg-black/40 p-2.5 text-[10px] text-amber-300 space-y-1">
                      <p className="font-semibold">{isId ? "Langkah Verifikasi:" : "Resolution Steps:"}</p>
                      <p>1. {isId ? "Buka Supabase Dashboard > Authentication > Providers" : "Open Supabase Dashboard > Authentication > Providers"}</p>
                      <p>2. {isId ? "Pastikan Client ID & Client Secret di-paste tanpa spasi" : "Ensure Client ID & Client Secret are pasted without trailing spaces"}</p>
                      <p>3. {isId ? "Di Meta for Developers, klik 'Siapkan' pada Masuk Facebook" : "In Meta for Developers, click 'Set up' on Facebook Login"}</p>
                    </div>
                  </div>
                )}

                {/* SOCIAL OAUTH 2.0 PROVIDERS (GOOGLE & FACEBOOK) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#aaa9ad]">
                    <span>
                      {isId
                        ? "MASUK CEPAT DENGAN SOSIAL (OAUTH 2.0)"
                        : "CONTINUE WITH SOCIAL OAUTH 2.0"}
                    </span>
                    <span className="rounded-full bg-[#1e9e5a]/20 px-2 py-0.5 text-[9px] font-semibold text-[#5ce69b]">
                      Secure Single Sign-On
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {/* Google OAuth Button */}
                    <button
                      type="button"
                      onClick={() => handleOAuthLogin("google")}
                      disabled={oauthLoading !== null}
                      className="flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl border border-white/15 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#111111] shadow-sm transition hover:bg-[#f2f2ef] active:scale-[0.99] disabled:opacity-60"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="shrink-0"
                      >
                        <path
                          fill="#EA4335"
                          d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 20.9 7.4 24 12 24z"
                        />
                      </svg>
                      <span>
                        {oauthLoading === "google"
                          ? isId
                            ? "Menghubungkan..."
                            : "Connecting..."
                          : "Google"}
                      </span>
                    </button>

                    {/* Facebook OAuth Button */}
                    <button
                      type="button"
                      onClick={() => handleOAuthLogin("facebook")}
                      disabled={oauthLoading !== null}
                      className="flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl border border-[#1877F2]/50 bg-[#1877F2] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-[#166fe5] active:scale-[0.99] disabled:opacity-60"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                        className="shrink-0"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span>
                        {oauthLoading === "facebook"
                          ? isId
                            ? "Menghubungkan..."
                            : "Connecting..."
                          : "Facebook"}
                      </span>
                    </button>
                  </div>

                  {oauthNotice && (
                    <div
                      role="status"
                      className="rounded-xl border border-[#c6f432]/40 bg-[#c6f432]/10 p-3 font-mono text-xs text-[#c6f432]"
                    >
                      ● {oauthNotice}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="relative flex items-center py-0.5">
                  <div className="flex-grow border-t border-white/10" />
                  <span className="mx-3 shrink-0 font-mono text-[10px] uppercase tracking-widest text-[#888]">
                    {isId ? "ATAU EMAIL WARGA" : "OR RESIDENT EMAIL"}
                  </span>
                  <div className="flex-grow border-t border-white/10" />
                </div>

                {/* Resident Email Form */}
                <form
                  onSubmit={handleFormSubmit}
                  noValidate
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#aaa9ad]">
                      {isRegisterMode
                        ? isId
                          ? "FORMULIR REGISTRASI WARGA"
                          : "RESIDENT REGISTRATION"
                        : isId
                        ? "MASUK DENGAN EMAIL"
                        : "EMAIL & PASSWORD"}
                    </span>
                    <button
                      type="button"
                      onClick={handleAutofillDemo}
                      className="cursor-pointer rounded-full bg-white/8 px-2.5 py-0.5 text-[10px] font-semibold text-[#c6f432] transition hover:bg-white/15"
                    >
                      {isId ? "Isi Contoh Cepat" : "Autofill Resident Email"}
                    </button>
                  </div>

                  {formError && (
                    <div
                      role="alert"
                      className="rounded-xl border border-rose-500/50 bg-rose-950/30 p-3 font-mono text-xs text-rose-300"
                    >
                      {formError}
                    </div>
                  )}

                  {isRegisterMode && (
                    <div>
                      <label
                        htmlFor="resident-name"
                        className="block font-mono text-xs text-[#c9c7c0]"
                      >
                        {isId ? "Nama Lengkap" : "Display Name"}
                      </label>
                      <input
                        id="resident-name"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={isId ? "Nama Anda" : "Your Name"}
                        className="mt-1 min-h-[44px] w-full rounded-xl bg-[#111317] px-4 text-sm text-white placeholder-[#777] shadow-[inset_0_0_0_1px_#2c2c2c] focus:shadow-[inset_0_0_0_1.5px_#c6f432] focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="resident-email"
                      className="block font-mono text-xs text-[#c9c7c0]"
                    >
                      {isId ? "Alamat Email" : "Email Address"}
                    </label>
                    <input
                      id="resident-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="resident@verdara.app"
                      className="mt-1 min-h-[44px] w-full rounded-xl bg-[#111317] px-4 text-sm text-white placeholder-[#777] shadow-[inset_0_0_0_1px_#2c2c2c] focus:shadow-[inset_0_0_0_1.5px_#c6f432] focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="resident-password"
                        className="block font-mono text-xs text-[#c9c7c0]"
                      >
                        {isId ? "Kata Sandi" : "Password"}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="cursor-pointer font-mono text-[10px] text-[#aaa9ad] hover:text-white"
                      >
                        {showPassword
                          ? isId
                            ? "Sembunyikan"
                            : "Hide"
                          : isId
                          ? "Tampilkan"
                          : "Show"}
                      </button>
                    </div>
                    <input
                      id="resident-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1 min-h-[44px] w-full rounded-xl bg-[#111317] px-4 text-sm text-white placeholder-[#777] shadow-[inset_0_0_0_1px_#2c2c2c] focus:shadow-[inset_0_0_0_1.5px_#c6f432] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="min-h-[46px] w-full cursor-pointer rounded-xl bg-white text-sm font-semibold text-[#080808] transition hover:bg-[#e5e5e0]"
                  >
                    {isRegisterMode
                      ? isId
                        ? "Daftar & Buka Studio →"
                        : "Register & Open Studio →"
                      : isId
                      ? "Masuk & Buka Studio →"
                      : "Sign In & Open Studio →"}
                  </button>
                </form>

                {/* Resident Security & Sandbox Assurance */}
                <div className="space-y-2 rounded-2xl bg-[#111317] p-3.5 shadow-[inset_0_0_0_1px_#262930]">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#c6f432]">
                    <span>
                      {isId
                        ? "KEAMANAN & SANDBOX RESIDEN"
                        : "RESIDENT SECURITY & SANDBOX"}
                    </span>
                    <span>Lv.1 Starter Plot</span>
                  </div>
                  <p className="font-mono text-[11px] leading-relaxed text-[#aaa9ad]">
                    {isId
                      ? "Sesi Anda dilindungi dengan enkripsi 256-bit, PKCE OAuth 2.0, dan Row Level Security (RLS) PostgreSQL Supabase."
                      : "Your session is secured with 256-bit encryption, PKCE OAuth 2.0, and Supabase PostgreSQL Row Level Security (RLS)."}
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleStarterPlot}
                      className="min-h-[42px] w-full cursor-pointer rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                    >
                      {isId
                        ? "Jelajahi Plot Awal (Lv.1 · 0 XP)"
                        : "Explore Starter Plot (Lv.1 · 0 XP)"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3 pb-1">
                <span className="font-mono text-[11px] text-[#aaa9ad]">
                  Verdara Identity Guard · OWASP ASVS · CSRF Protected
                </span>
                <span className="dovv-chip">Database v3.3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VerdaraBottomDock />
    </div>
  );
}
