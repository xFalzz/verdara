"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useVerdaraStore } from "@/store/useVerdaraStore";

const EcoIslandCanvas = dynamic(
  () => import("@/components/three/EcoIslandCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#e9e8e2] font-mono text-xs text-[#4b4b48]">
        Loading 3D Townhouse Preview...
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

  const isId = locale === "id";
  const isLight = theme === "light";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleJudgeLogin = async () => {
    setLoadingJudge(true);
    setFormError(null);
    loginAsJudgeDemo();
    try {
      await fetch("/api/auth/judge", { method: "POST" });
    } catch {
      // Local store hydrated
    }
    router.push("/dashboard");
  };

  const handleStarterPlot = () => {
    resetToStarterPlot();
    router.push("/dashboard");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
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
    router.push("/dashboard");
  };

  return (
    <div
      className={`min-h-screen px-5 py-8 transition-colors duration-200 sm:px-10 ${
        isLight
          ? "bg-[#f5f5f3] text-[#111111]"
          : "bg-[#0b0c0e] text-[#f2f1ec]"
      }`}
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Top Floating Bar */}
        <header className="flex items-center justify-between pb-8">
          <Link href="/" className="flex min-h-[44px] items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#080808] text-[#c6f432]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1v-9.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
            <span className="dovv-wordmark text-3xl">VERDARA</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLocale(isId ? "en" : "id")}
              className="min-h-[44px] cursor-pointer rounded-full bg-[#080808] px-4 text-xs font-medium text-white"
            >
              {isId ? "ID" : "EN"}
            </button>
            <button
              type="button"
              onClick={() => setTheme(isLight ? "dark" : "light")}
              className="min-h-[44px] cursor-pointer rounded-full bg-[#080808] px-4 text-xs font-medium text-white"
            >
              {isLight ? "Daylight" : "Night"}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left 7 Columns: Framed 3D Townhouse Stage */}
          <div className="lg:col-span-7">
            <div className="dovv-stage-frame h-[540px] w-full">
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
              />

              <div className="absolute bottom-5 left-5 right-5 rounded-[16px] border border-[#151515]/10 bg-white/95 p-5 text-[#151515] shadow-xl sm:right-auto sm:w-[440px]">
                <p className="font-mono text-xs font-semibold text-[#1e9e5a]">
                  01 / JUDGE RESERVE POOL ($35.00 LOCKED)
                </p>
                <p className="townhouse-title mt-1 text-2xl">
                  Menlo Park Lv.5 Demo Town
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#4b4b48]">
                  {isId
                    ? "Membuka Kota Hidup 3D (Level 5), seluruh 6 spesimen Lensa SAM 3.1 ($0.00 biaya cache), dan cadangan kredit khusus juri."
                    : "Unlocks the Level 5 Living Town, all 6 SAM 3.1 Lens specimens ($0.00 cached cost), and the dedicated $35.00 Judge Credit Reserve."}
                </p>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: DOVV Dark Card Session Portal */}
          <div className="lg:col-span-5">
            <div className="dovv-card h-full justify-between">
              <div className="dovv-card-media p-6 space-y-6">
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#c6f432]">
                    02 / Session Portal
                  </span>
                  <h1 className="dovv-wordmark mt-2 text-5xl text-white">
                    {isId ? "MASUK KE KOTA 3D" : "ENTER YOUR TOWN"}
                  </h1>
                </div>

                {/* 1-Click Judge Bypass */}
                <div className="space-y-2.5 rounded-2xl bg-[#111317] p-4 shadow-[inset_0_0_0_1px_#262930]">
                  <button
                    type="button"
                    onClick={handleJudgeLogin}
                    disabled={loadingJudge}
                    className="min-h-[48px] w-full cursor-pointer rounded-full bg-[#c6f432] px-5 text-sm font-semibold text-[#080808] transition hover:bg-[#d4f759]"
                  >
                    {loadingJudge
                      ? "Loading Judge Specimen..."
                      : isId
                      ? "Masuk Instan: Demo Juri Menlo Park (Lv.5)"
                      : "Enter Instant Judge Demo Town (Lv.5)"}
                  </button>

                  <button
                    type="button"
                    onClick={handleStarterPlot}
                    className="min-h-[44px] w-full cursor-pointer rounded-full bg-white/10 px-5 text-xs font-medium text-white transition hover:bg-white/15"
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
                      ? "Register & Open Town"
                      : "Sign In to Verdara"}
                  </button>
                </form>
              </div>

              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="text-lg text-white">Session Access</span>
                <span className="dovv-chip">Zero API Overrun Shield</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
