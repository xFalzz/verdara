"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import { WORLD_CITY_CATALOG } from "@/lib/science/presets";
import {
  VerdaraLogo,
  ZeggoRollText,
  CompactWorldCityPicker,
  VerdaraBottomDock,
} from "@/components/ui/InteractiveEffects";

export default function StudioShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    isAuthenticated,
    displayName,
    locale,
    units,
    theme,
    geo,
    housingCalc,
    level,
    xp,
    aiShield,
    setLocale,
    setUnits,
    setTheme,
    teleportToCity,
    setCustomCoordinates,
    loginAsJudgeDemo,
    loginWithEmail,
    loginWithOAuth,
    logout,
  } = useVerdaraStore();

  const [authChecked, setAuthChecked] = useState(false);
  const [notchOpen, setNotchOpen] = useState(false);
  const [notchSlide, setNotchSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchingGeo, setSearchingGeo] = useState(false);

  const isId = locale === "id";
  const isLight = theme === "light";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Restore session from sessionStorage if present; otherwise enforce login redirect
  useEffect(() => {
    if (isAuthenticated) {
      setAuthChecked(true);
      return;
    }
    try {
      const raw = window.sessionStorage.getItem("verdara_auth_session_v3");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.isAuthenticated) {
          if (parsed.isJudgeDemo) {
            loginAsJudgeDemo();
          } else if (
            parsed.authProvider === "google" ||
            parsed.authProvider === "facebook"
          ) {
            loginWithOAuth(parsed.authProvider, {
              email: parsed.email,
              displayName: parsed.displayName,
            });
          } else {
            loginWithEmail(
              parsed.email || "resident@verdara.app",
              parsed.displayName || "Verdara Resident"
            );
          }
          setAuthChecked(true);
          return;
        }
      }
    } catch {
      // Proceed to login redirect
    }
    setAuthChecked(true);
    router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
  }, [
    isAuthenticated,
    pathname,
    router,
    loginAsJudgeDemo,
    loginWithEmail,
    loginWithOAuth,
  ]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && notchOpen) {
        setNotchOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [notchOpen]);

  const topLinks = [
    { href: "/dashboard", labelEn: "Living Town", labelId: "Kota 3D" },
    { href: "/lens", labelEn: "SAM 3.1 Lens", labelId: "Lensa SAM" },
    { href: "/radar", labelEn: "3D Radar", labelId: "Radar 3D" },
    { href: "/council", labelEn: "AI Council", labelId: "Dewan AI" },
    { href: "/academy", labelEn: "Field Proofs", labelId: "Bukti Aksi" },
    { href: "/docs", labelEn: "Docs", labelId: "Dokumen" },
    { href: "/faq", labelEn: "FAQ", labelId: "Tanya Jawab" },
    { href: "/settings", labelEn: "Shield", labelId: "Perisai" },
  ];

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchingGeo(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          searchQuery.trim()
        )}&count=1&language=en&format=json`
      );
      const data = await res.json();
      if (data?.results?.[0]) {
        const hit = data.results[0];
        setCustomCoordinates(
          hit.latitude,
          hit.longitude,
          `${hit.name}${hit.admin1 ? `, ${hit.admin1}` : ""}`,
          (hit.country_code || "XX").toUpperCase()
        );
        setSearchQuery("");
      }
    } catch {
      // Fallback retains current preset
    } finally {
      setSearchingGeo(false);
    }
  };

  const remainingBudget = (
    aiShield.lifetimeCapUsd - aiShield.totalSpendUsd
  ).toFixed(2);

  // Strict Authentication Gate: never render protected workspace until authenticated
  if (!authChecked || !isAuthenticated) {
    return (
      <div
        className={`flex min-h-screen flex-col items-center justify-center px-4 text-center ${
          isLight
            ? "bg-[#f5f5f3] text-[#111111]"
            : "bg-[#0b0c0e] text-[#f2f1ec]"
        }`}
      >
        <div className="max-w-md rounded-[28px] border border-current/12 bg-[#08090c] p-8 text-white shadow-2xl">
          <div className="mx-auto mb-4 flex justify-center">
            <VerdaraLogo size={48} />
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#c6f432]">
            {isId ? "OTENTIKASI DIPERLUKAN" : "AUTHENTICATION REQUIRED"}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {isId
              ? "Silakan Masuk Terlebih Dahulu"
              : "Please Sign In to Access Studio"}
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-[#aaa9ad]">
            {isId
              ? "Mengalihkan Anda ke Portal Login Verdara. Anda dapat masuk dengan akun email atau menggunakan 1-Click Judge Demo (Lv.5)."
              : "Redirecting to the Verdara Session Portal. You can sign in with your resident email or launch the 1-Click Judge Demo (Lv.5)."}
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Link
              href={`/login?next=${encodeURIComponent(pathname || "/dashboard")}`}
              className="flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-[#c6f432] px-5 text-xs font-bold text-[#080808] transition hover:bg-[#d6ff4d]"
            >
              {isId ? "Buka Halaman Login →" : "Go to Login Portal →"}
            </Link>
            <Link
              href="/"
              className="flex min-h-[44px] items-center justify-center rounded-full bg-white/10 px-4 text-xs font-medium text-white hover:bg-white/20"
            >
              {isId ? "Beranda" : "Home"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pb-28 transition-colors duration-200 ${
        isLight
          ? "bg-[#f5f5f3] text-[#111111]"
          : "bg-[#0b0c0e] text-[#f2f1ec]"
      }`}
    >
      <a
        href="#main-workspace"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-[#080808] focus:px-5 focus:py-2.5 focus:font-mono focus:text-xs focus:font-bold focus:text-[#c6f432]"
      >
        {isId ? "Lewati ke ruang kerja utama" : "Skip to main workspace"}
      </a>

      {/* CLEAN, STRUCTURED SINGLE-ROW STUDIO HEADER */}
      <header className="sticky top-0 z-40 border-b border-current/8 bg-inherit/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] flex-nowrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
          {/* Left: Brand & City Picker */}
          <div className="flex min-w-0 shrink-0 items-center gap-3">
            <Link
              href="/"
              className="group flex min-h-[40px] shrink-0 items-center gap-2.5"
            >
              <VerdaraLogo size={36} />
              <div className="flex flex-col text-left">
                <span className="dovv-wordmark text-xl sm:text-2xl tracking-tight">
                  VERDARA
                </span>
                <span className="hidden font-mono text-[9px] uppercase tracking-[0.14em] opacity-60 sm:block">
                  Spatial Eco-OS · Lv.{level}
                </span>
              </div>
            </Link>

            <span className="hidden h-5 w-[1px] bg-current/15 sm:inline-block" />

            <CompactWorldCityPicker
              isLight={isLight}
              isId={isId}
              variant="hero"
              align="left"
            />
          </div>

          {/* Center: Clean Structured Navigation Links (Desktop) */}
          <nav
            aria-label={isId ? "Menu Ruang Kerja" : "Workspace Menu"}
            className="hidden items-center gap-1 rounded-full border border-current/10 bg-current/[0.03] p-1 xl:flex"
          >
            {topLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                    active
                      ? "bg-[#08090c] font-semibold text-[#c6f432] shadow-sm"
                      : "opacity-75 hover:bg-current/8 hover:opacity-100"
                  }`}
                >
                  {isId ? item.labelId : item.labelEn}
                </Link>
              );
            })}
          </nav>

          {/* Right: Compact Preferences, Studio Notch & Logout (100% Usable on Mobile & Desktop) */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <div
              className={`inline-flex items-center rounded-full border p-0.5 ${
                isLight
                  ? "border-black/10 bg-white"
                  : "border-white/12 bg-[#14161b]"
              }`}
            >
              <button
                type="button"
                onClick={() => setLocale(locale === "en" ? "id" : "en")}
                className="min-h-[32px] cursor-pointer rounded-full px-2 sm:px-2.5 font-mono text-[10px] sm:text-[11px] font-semibold transition hover:bg-current/10"
              >
                {locale.toUpperCase()}
              </button>
              <span className="h-3.5 w-[1px] bg-current/15" />
              <button
                type="button"
                onClick={() =>
                  setUnits(units === "metric" ? "imperial" : "metric")
                }
                className="min-h-[32px] cursor-pointer rounded-full px-2 sm:px-2.5 font-mono text-[10px] sm:text-[11px] transition hover:bg-current/10"
              >
                {units === "metric" ? "m²" : "ft²"}
              </button>
              <span className="h-3.5 w-[1px] bg-current/15" />
              <button
                type="button"
                onClick={() => setTheme(isLight ? "dark" : "light")}
                className="min-h-[32px] cursor-pointer rounded-full px-2 sm:px-2.5 font-mono text-[10px] sm:text-[11px] transition hover:bg-current/10"
                title={isLight ? "Day Mode" : "Night Mode"}
              >
                {isLight ? "☀" : "☾"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setNotchOpen(!notchOpen)}
              aria-expanded={notchOpen}
              className="zeggo-btn flex min-h-[36px] sm:min-h-[38px] shrink-0 cursor-pointer items-center gap-1.5 sm:gap-2 rounded-full bg-[#08090c] px-2.5 sm:px-3.5 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-[inset_0_0_0_1.5px_#262932] transition hover:bg-[#16181f]"
            >
              <span className="font-mono text-[10px] sm:text-[11px] text-[#c6f432]">
                {xp} XP
              </span>
              <span className="hidden sm:inline">
                <ZeggoRollText
                  text={
                    notchOpen
                      ? isId
                        ? "Tutup"
                        : "Close"
                      : isId
                      ? "Panel Studio"
                      : "Studio Panel"
                  }
                />
              </span>
              <span className="font-mono text-sm leading-none">
                {notchOpen ? "x" : "☰"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              title={displayName}
              className={`min-h-[36px] sm:min-h-[38px] shrink-0 cursor-pointer rounded-full border px-2.5 sm:px-3 text-[11px] sm:text-xs font-medium whitespace-nowrap transition ${
                isLight
                  ? "border-black/15 bg-white text-[#111] hover:bg-rose-50 hover:text-rose-700"
                  : "border-white/15 bg-[#14161b] text-[#e2e1dc] hover:bg-rose-950/40 hover:text-rose-300"
              }`}
            >
              {isId ? "Keluar" : "Logout"}
            </button>
          </div>
        </div>

        {/* Responsive Horizontal Drag-Slide Workspace Strip (< 1280px) */}
        <div className="mx-auto max-w-[1440px] border-t border-current/8 px-3 py-1.5 sm:px-8 xl:hidden">
          <nav
            data-lenis-prevent
            aria-label={isId ? "Menu Geser Ruang Kerja" : "Draggable Workspace Menu"}
            className="country-pill-rail flex flex-nowrap items-center gap-1.5 overflow-x-auto"
          >
            {topLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  draggable={false}
                  className={`min-h-[32px] shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition ${
                    active
                      ? "bg-[#08090c] font-semibold text-[#c6f432] shadow-sm"
                      : "bg-current/[0.04] opacity-80 hover:bg-current/10 hover:opacity-100"
                  }`}
                >
                  {isId ? item.labelId : item.labelEn}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* EXPANDABLE STUDIO PANEL WITH FULL MOBILE/DESKTOP NAVIGATION & MINI SLIDE CAROUSEL */}
      {notchOpen && (
        <div className="mx-auto mt-3 mb-4 max-w-[1440px] px-4 sm:px-8">
          <div className="rounded-[24px] sm:rounded-[28px] bg-[#08090c] p-4 sm:p-6 text-white shadow-[inset_0_0_0_1.5px_#262932,0_20px_50px_-12px_rgba(0,0,0,0.65)]">
            {/* Quick Workspace Navigation Grid for Mobile/Tablet (< 1280px) */}
            <div className="mb-5 border-b border-white/10 pb-4 xl:hidden">
              <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[#c6f432]">
                {isId ? "00 / Navigasi Ruang Kerja Studio" : "00 / Studio Workspaces"}
              </p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {topLinks.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setNotchOpen(false)}
                      className={`flex min-h-[38px] items-center justify-center rounded-xl px-3 py-1.5 text-center text-xs font-medium transition ${
                        active
                          ? "bg-[#c6f432] font-bold text-[#08090c]"
                          : "bg-[#15171d] text-[#c9c7c0] shadow-[inset_0_0_0_1px_#262932] hover:text-white"
                      }`}
                    >
                      {isId ? item.labelId : item.labelEn}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-5">
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#aaa9ad]">
                  {isId
                    ? "01 / Teleportasi Kota & Koordinat"
                    : "01 / City Teleport & Coordinate Search"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {WORLD_CITY_CATALOG.slice(0, 10).map((c) => {
                    const active =
                      Math.abs(geo.lat - c.lat) < 0.25 &&
                      Math.abs(geo.lng - c.lng) < 0.25;
                    return (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => {
                          if (c.presetId) {
                            teleportToCity(c.presetId);
                          } else {
                            setCustomCoordinates(
                              c.lat,
                              c.lng,
                              c.city,
                              c.countryCode
                            );
                          }
                        }}
                        className={`min-h-[34px] cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition ${
                          active
                            ? "bg-[#c6f432] font-semibold text-[#111111]"
                            : "bg-[#15171d] text-[#c9c7c0] shadow-[inset_0_0_0_1px_#2a2d36] hover:text-white"
                        }`}
                      >
                        {c.city} ({c.countryCode})
                      </button>
                    );
                  })}
                </div>
                <form onSubmit={handleCitySearch} className="flex gap-2 pt-1">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isId
                        ? "Cari kota dunia (mis. Bandung, Zurich)..."
                        : "Search any world city (e.g. Zurich, Austin)..."
                    }
                    className="min-h-[40px] flex-1 rounded-full bg-[#15171d] px-4 text-xs text-white placeholder-[#888] shadow-[inset_0_0_0_1px_#2c2f38] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={searchingGeo}
                    className="min-h-[40px] cursor-pointer rounded-full bg-white px-4 text-xs font-semibold text-[#080808] transition hover:bg-[#e5e5e0] disabled:opacity-50"
                  >
                    {searchingGeo
                      ? "..."
                      : isId
                      ? "Muat Kota"
                      : "Load City"}
                  </button>
                </form>
              </div>

              <div className="space-y-3 lg:col-span-3">
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#aaa9ad]">
                  {isId ? "02 / Sesi & Preferensi" : "02 / Session & Preferences"}
                </p>
                <div className="rounded-2xl bg-[#14161c] p-3.5 shadow-[inset_0_0_0_1px_#262932]">
                  <p className="font-mono text-[11px] text-[#c6f432]">
                    ACTIVE SESSION
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-white">
                    {displayName}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <Link
                      href="/docs"
                      onClick={() => setNotchOpen(false)}
                      className="rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] text-white hover:bg-white/20"
                    >
                      Docs
                    </Link>
                    <Link
                      href="/faq"
                      onClick={() => setNotchOpen(false)}
                      className="rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] text-white hover:bg-white/20"
                    >
                      FAQ
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        router.push("/login");
                      }}
                      className="cursor-pointer rounded-full bg-rose-500/20 px-3 py-1 font-mono text-[11px] text-rose-300 hover:bg-rose-500/30"
                    >
                      {isId ? "Keluar Sesi" : "Sign Out"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="overflow-hidden rounded-[24px] bg-[#14161c] p-4 shadow-[inset_0_0_0_1px_#262932]">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#c6f432]">
                      0{notchSlide + 1}/03 · STUDIO DECK
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map((idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNotchSlide(idx)}
                          aria-label={`Slide ${idx + 1}`}
                          className={`h-2 rounded-full transition-all ${
                            notchSlide === idx
                              ? "w-5 bg-[#c6f432]"
                              : "w-2 bg-white/25 hover:bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="overflow-hidden">
                    <div
                      className="dovv-slide-track"
                      style={{
                        transform: `translate3d(-${notchSlide * 100}%, 0, 0)`,
                      }}
                    >
                      <div className="w-full shrink-0 space-y-1.5 pr-1">
                        <p className="font-sans text-sm font-semibold text-white">
                          {geo.city} ({geo.koppen.code}) Roof Physics
                        </p>
                        <p className="font-mono text-xs text-[#aaa9ad]">
                          Solar: {housingCalc.solar.kwp} kWp · Rain:{" "}
                          {Math.round(
                            housingCalc.rainwater.litersYear / 1000
                          )}{" "}
                          m³/yr · TCI {housingCalc.thermal.tciScore}/100
                        </p>
                      </div>

                      <div className="w-full shrink-0 space-y-1.5 pr-1">
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="text-[#aaa9ad]">
                            $150 Meta API Pool
                          </span>
                          <span className="font-bold text-[#c6f432]">
                            ${remainingBudget} left
                          </span>
                        </div>
                        <p className="text-xs text-[#c9c7c0]">
                          $35 Judge Reserve locked · 6 Golden Specimens cached
                          at $0.00 (&lt;50ms).
                        </p>
                      </div>

                      <div className="w-full shrink-0 space-y-1.5 pr-1">
                        <p className="font-sans text-sm font-semibold text-white">
                          Enterprise Database v3.2 Active
                        </p>
                        <p className="text-xs text-[#aaa9ad]">
                          195 Countries · 28 Benchmark Cities · OWASP Security
                          Headers &amp; CSRF Guard.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN WORKSPACE CONTENT */}
      <main
        id="main-workspace"
        className="mx-auto max-w-[1440px] px-4 pt-5 sm:px-8"
      >
        {children}
      </main>

      {/* CLEAN ARCHITECTURAL COMMAND DOCK */}
      <VerdaraBottomDock />
    </div>
  );
}
