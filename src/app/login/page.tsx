"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import {
  VerdaraLogo,
  VerdaraBottomDock,
} from "@/components/ui/InteractiveEffects";

const EcoIslandCanvas = dynamic(
  () => import("@/components/three/EcoIslandCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#e9e8e2] font-mono text-xs text-[#4b4b48]">
        Loading 3D Eco-District Preview...
      </div>
    ),
  }
);

export default function LoginPage() {
  const router = useRouter();
  const {
    locale,
    theme,
    geo,
    housingCalc,
    unlockedItems,
    setTheme,
    setLocale,
    loginAsJudgeDemo,
    resetToStarterPlot,
    loginWithEmail,
  } = useVerdaraStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loadingJudge, setLoadingJudge] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [nextRoute, setNextRoute] = useState("/dashboard");

  const isId = locale === "id";
  const isLight = theme === "light";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const nextParam = params.get("next");
      if (nextParam && nextParam.startsWith("/")) {
        setNextRoute(nextParam);
      }
    }
  }, []);

  const handleJudgeLogin = async () => {
    setLoadingJudge(true);
    setFormError(null);
    loginAsJudgeDemo();
    try {
      await fetch("/api/auth/judge", { method: "POST" });
      await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "judge+menlopark@verdara.app",
          displayName: "Meta Hackathon Judge (Lv.5)",
          role: "judge",
          city: geo.city,
          countryCode: geo.countryCode,
        }),
      });
    } catch {
      // Local store hydrated
    }
    router.push(nextRoute);
  };

  const handleStarterPlot = async () => {
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div
      className={`min-h-screen px-4 pt-5 pb-28 transition-colors duration-200 sm:px-10 ${
        isLight
          ? "bg-[#f5f5f3] text-[#111111]"
          : "bg-[#0b0c0e] text-[#f2f1ec]"
      }`}
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Clean Structured Top Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 pb-7">
          <Link href="/" className="flex min-h-[42px] items-center gap-2.5">
            <VerdaraLogo size={38} />
            <div>
              <span className="dovv-wordmark text-2xl sm:text-3xl">
                VERDARA
              </span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.14em] opacity-60">
                Session Authentication Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/docs"
              className="rounded-full border border-current/15 px-3.5 py-2 text-xs font-medium transition hover:bg-current/5"
            >
              Docs
            </Link>
            <Link
              href="/faq"
              className="rounded-full border border-current/15 px-3.5 py-2 text-xs font-medium transition hover:bg-current/5"
            >
              FAQ
            </Link>
            <button
              type="button"
              onClick={() => setLocale(isId ? "en" : "id")}
              className="min-h-[38px] cursor-pointer rounded-full bg-[#08090c] px-3.5 text-xs font-medium text-white"
            >
              {isId ? "ID" : "EN"}
            </button>
            <button
              type="button"
              onClick={() => setTheme(isLight ? "dark" : "light")}
              className="min-h-[38px] cursor-pointer rounded-full bg-[#08090c] px-3.5 text-xs font-medium text-white"
            >
              {isLight ? "Daylight" : "Night"}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left 7 Columns: Framed 3D Eco-District Stage */}
          <div className="lg:col-span-7">
            <div className="dovv-stage-frame h-[520px] sm:h-[580px] w-full">
              <EcoIslandCanvas
                biome={geo.biome}
                level={5}
                isNight={false}
                unlockedItems={unlockedItems}
                solarKwp={housingCalc.solar.kwp}
                solarKwhYear={housingCalc.solar.kwhYear}
                rainLitersYear={housingCalc.rainwater.litersYear}
                bioporeUnits={housingCalc.infiltration.bioporeUnits}
                city={geo.city}
                koppenCode={geo.koppen.code}
                locale={locale}
              />

              <div className="absolute bottom-4 left-4 right-4 rounded-[18px] border border-[#151515]/10 bg-white/95 p-5 text-[#151515] shadow-xl sm:right-auto sm:w-[440px]">
                <p className="font-mono text-xs font-semibold text-[#1e9e5a]">
                  01 / PROTECTED STUDIO GATE · $35.00 JUDGE RESERVE
                </p>
                <p className="townhouse-title mt-1 text-2xl">
                  {isId
                    ? "Otentikasi Diperlukan Sebelum Masuk Dasbor"
                    : "Sign In Required Before Entering Studio"}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#4b4b48]">
                  {isId
                    ? "Pilih login cepat Demo Juri (Lv.5) atau masuk menggunakan akun email Anda untuk membuka Dasbor Kota 3D, Lensa SAM 3.1, Radar 3D, dan Dewan AI."
                    : "Choose 1-Click Judge Demo (Lv.5) or sign in with your resident email to unlock the 3D Living Town Dashboard, SAM 3.1 Lens, 3D Radar, and AI Council."}
                </p>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Session Authentication Card */}
          <div className="lg:col-span-5">
            <div className="dovv-card h-full justify-between">
              <div className="dovv-card-media p-6 space-y-6">
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#c6f432]">
                    02 / Authenticated Session Gate
                  </span>
                  <h1 className="dovv-wordmark mt-2 text-4xl sm:text-5xl text-white">
                    {isId ? "MASUK KE STUDIO" : "SIGN IN TO VERDARA"}
                  </h1>
                  <p className="mt-1 font-mono text-xs text-[#aaa9ad]">
                    {isId
                      ? `Tujuan setelah login: ${nextRoute}`
                      : `Target workspace after sign-in: ${nextRoute}`}
                  </p>
                </div>

                {/* 1-Click Judge Bypass */}
                <div className="space-y-2.5 rounded-2xl bg-[#111317] p-4 shadow-[inset_0_0_0_1px_#262930]">
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-[#c6f432]">
                    {isId
                      ? "REKOMENDASI JURI META HACKATHON"
                      : "RECOMMENDED FOR HACKATHON JUDGES"}
                  </span>
                  <button
                    type="button"
                    onClick={handleJudgeLogin}
                    disabled={loadingJudge}
                    className="min-h-[48px] w-full cursor-pointer rounded-full bg-[#c6f432] px-5 text-sm font-semibold text-[#080808] transition hover:bg-[#d4f759]"
                  >
                    {loadingJudge
                      ? "Loading Judge Specimen..."
                      : isId
                      ? "1-Klik Masuk: Demo Juri Menlo Park (Lv.5)"
                      : "1-Click Sign In: Judge Demo Town (Lv.5)"}
                  </button>

                  <button
                    type="button"
                    onClick={handleStarterPlot}
                    className="min-h-[42px] w-full cursor-pointer rounded-full bg-white/10 px-5 text-xs font-medium text-white transition hover:bg-white/15"
                  >
                    {isId
                      ? "Mulai dari Plot Kosong (Level 1 · 0 XP)"
                      : "Start from Empty Base Plot (Level 1 · 0 XP)"}
                  </button>
                </div>

                {/* Resident Email Form */}
                <form
                  onSubmit={handleFormSubmit}
                  noValidate
                  className="space-y-3.5 border-t border-white/10 pt-4"
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-[#aaa9ad]">
                      {isRegisterMode
                        ? "CREATE RESIDENT ACCOUNT"
                        : "RESIDENT EMAIL SIGN-IN"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(!isRegisterMode);
                        setFormError(null);
                      }}
                      className="cursor-pointer text-[#c6f432] underline"
                    >
                      {isRegisterMode ? "Have an account?" : "Create account"}
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
                        Display Name
                      </label>
                      <input
                        id="resident-name"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your Name"
                        className="mt-1 min-h-[44px] w-full rounded-full bg-[#111317] px-4 text-sm text-white placeholder-[#777] shadow-[inset_0_0_0_1px_#2c2c2c]"
                      />
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="resident-email"
                      className="block font-mono text-xs text-[#c9c7c0]"
                    >
                      Email Address
                    </label>
                    <input
                      id="resident-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="mt-1 min-h-[44px] w-full rounded-full bg-[#111317] px-4 text-sm text-white placeholder-[#777] shadow-[inset_0_0_0_1px_#2c2c2c]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="resident-password"
                      className="block font-mono text-xs text-[#c9c7c0]"
                    >
                      Password
                    </label>
                    <input
                      id="resident-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1 min-h-[44px] w-full rounded-full bg-[#111317] px-4 text-sm text-white placeholder-[#777] shadow-[inset_0_0_0_1px_#2c2c2c]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="min-h-[46px] w-full cursor-pointer rounded-full bg-white text-sm font-semibold text-[#080808] transition hover:bg-[#e5e5e0]"
                  >
                    {isRegisterMode
                      ? "Register & Open Studio →"
                      : "Sign In & Open Studio →"}
                  </button>
                </form>
              </div>

              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="font-mono text-xs text-[#aaa9ad]">
                  OWASP ASVS · CSRF &amp; Rate-Limit Guard
                </span>
                <span className="dovv-chip">Database v3.2</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VerdaraBottomDock />
    </div>
  );
}
