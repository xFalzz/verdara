"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import {
  findNearestPresetByCoords,
  type CityPreset,
} from "@/lib/science/presets";
import { formatTemp } from "@/lib/science/units";
import { ZeggoRollText } from "@/components/ui/InteractiveEffects";

const CITY_SPECIMENS: {
  id: CityPreset["id"];
  label: string;
  iso: string;
  koppen: string;
}[] = [
  { id: "menlo_park", label: "Menlo Park", iso: "US-CA", koppen: "Csb" },
  { id: "london", label: "London", iso: "GB", koppen: "Cfb" },
  { id: "tokyo", label: "Tokyo", iso: "JP", koppen: "Cfa" },
  { id: "dubai", label: "Dubai", iso: "AE", koppen: "BWh" },
  { id: "yogyakarta", label: "Yogyakarta", iso: "ID", koppen: "Am" },
];

export default function StudioShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    locale,
    units,
    theme,
    activePresetId,
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
  } = useVerdaraStore();

  const [notchOpen, setNotchOpen] = useState(false);
  const [notchSlide, setNotchSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchingGeo, setSearchingGeo] = useState(false);

  const isId = locale === "id";
  const isLight = theme === "light";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && notchOpen) {
        setNotchOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [notchOpen]);

  const navItems = [
    { href: "/", labelEn: "Index", labelId: "Indeks" },
    { href: "/dashboard", labelEn: "Living Town", labelId: "Kota 3D" },
    { href: "/lens", labelEn: "SAM 3.1 Lens", labelId: "Lensa SAM 3.1" },
    { href: "/radar", labelEn: "3D Radar", labelId: "Radar 3D" },
    { href: "/council", labelEn: "Council", labelId: "Dewan AI" },
    { href: "/academy", labelEn: "Field Proofs", labelId: "Bukti Aksi" },
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
        const nearestId = findNearestPresetByCoords(
          hit.latitude,
          hit.longitude
        );
        teleportToCity(nearestId);
        setCustomCoordinates(
          hit.latitude,
          hit.longitude,
          `${hit.name}${hit.admin1 ? `, ${hit.admin1}` : ""}`,
          hit.country_code || "US"
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

      {/* DOVV STUDIO + TOWNHOUSE FLOATING TOP CHROME */}
      <header className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 pt-6 pb-4 sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="group flex min-h-[44px] items-center gap-2.5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#080808] text-[#c6f432] shadow-[inset_0_0_0_1px_#2a2a2a]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1v-9.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="dovv-wordmark text-2xl tracking-tight">
              VERDARA
            </span>
          </Link>

          {/* Townhouse Live Status Pill */}
          <div
            className={`flex min-h-[40px] items-center gap-2.5 rounded-full px-3.5 py-1.5 text-xs font-medium shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_6px_20px_-8px_rgba(0,0,0,0.18)] ${
              isLight
                ? "bg-white text-[#111111]"
                : "bg-[#141619] text-[#f2f1ec] shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
            }`}
          >
            <span className="dovv-pill-dot">
              <span />
            </span>
            <span className="font-semibold">{geo.city}</span>
            <span className="h-3.5 w-[1px] bg-current opacity-20" />
            <span className="font-mono text-[11px] opacity-75">
              {geo.koppen.code} · {formatTemp(geo.currentTempC, units)} · AQI{" "}
              {geo.currentAqi}
            </span>
          </div>
        </div>

        {/* City Pills + DOVV Studio Expandable Notch Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label={isId ? "Pilih Kota" : "Select City"}
            className="hidden items-center gap-1 rounded-full bg-[#080808] p-1 shadow-[inset_0_0_0_1px_#262626] xl:flex"
          >
            {CITY_SPECIMENS.map((c) => {
              const active = activePresetId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => teleportToCity(c.id)}
                  className={`min-h-[36px] cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition ${
                    active
                      ? "bg-[#c6f432] font-semibold text-[#111111]"
                      : "text-[#c9c7c0] hover:bg-[#1c1c1c] hover:text-white"
                  }`}
                >
                  {c.label}{" "}
                  <span className="font-mono text-[10px] opacity-75">
                    {c.koppen}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setNotchOpen(!notchOpen)}
            aria-expanded={notchOpen}
            className="zeggo-btn flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-full bg-[#080808] px-4 py-2 text-xs font-medium text-white shadow-[inset_0_0_0_2px_#2c2c2c] transition hover:bg-[#181818]"
          >
            <span className="font-mono text-[11px] text-[#c6f432]">
              Lv.{level} · {xp} XP
            </span>
            <span className="h-3.5 w-[1px] bg-white/20" />
            <ZeggoRollText
              text={
                notchOpen
                  ? isId
                    ? "Tutup Studio"
                    : "Close Studio"
                  : isId
                  ? "Notch & Slide Studio"
                  : "Studio Notch & Slides"
              }
            />
            <span className="font-mono text-sm leading-none">
              {notchOpen ? "×" : "+"}
            </span>
          </button>
        </div>
      </header>

      {/* DOVV STUDIO EXPANDABLE NOTCH PANEL WITH MINI SLIDE CAROUSEL (.notch + .slides) */}
      {notchOpen && (
        <div className="mx-auto mb-6 max-w-[1440px] px-5 sm:px-8">
          <div className="rounded-[34px] bg-[#080808] p-5 sm:p-6 text-white shadow-[inset_0_0_0_2px_#2c2c2c,0_20px_50px_-12px_rgba(0,0,0,0.65)]">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Column: City Teleport + Coordinate Search */}
              <div className="space-y-3 lg:col-span-5">
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#aaa9ad]">
                  {isId
                    ? "01 / Teleportasi Kota & Koordinat"
                    : "01 / City Teleport & Coordinate Search"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CITY_SPECIMENS.map((c) => {
                    const active = activePresetId === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => teleportToCity(c.id)}
                        className={`min-h-[40px] cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                          active
                            ? "bg-[#c6f432] font-semibold text-[#111111]"
                            : "bg-[#171717] text-[#c9c7c0] shadow-[inset_0_0_0_1px_#2a2a2a] hover:text-white"
                        }`}
                      >
                        {c.label} ({c.iso} · {c.koppen})
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
                    className="min-h-[44px] flex-1 rounded-full bg-[#171717] px-4 text-xs text-white placeholder-[#888] shadow-[inset_0_0_0_1px_#2c2c2c] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={searchingGeo}
                    className="min-h-[44px] cursor-pointer rounded-full bg-white px-5 text-xs font-semibold text-[#080808] transition hover:bg-[#e5e5e0] disabled:opacity-50"
                  >
                    {searchingGeo
                      ? "..."
                      : isId
                      ? "Muat Kota"
                      : "Load City"}
                  </button>
                </form>
              </div>

              {/* Center Column: Studio Preferences */}
              <div className="space-y-3 lg:col-span-3">
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#aaa9ad]">
                  {isId
                    ? "02 / Preferensi Studio"
                    : "02 / Studio Preferences"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme(isLight ? "dark" : "light")}
                    className="min-h-[42px] cursor-pointer rounded-full bg-[#171717] px-4 py-2 font-mono text-xs font-medium text-white shadow-[inset_0_0_0_1px_#2c2c2c] hover:bg-[#222]"
                  >
                    Theme: {isLight ? "Chalk Daylight" : "Obsidian Night"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocale(locale === "en" ? "id" : "en")}
                    className="min-h-[42px] cursor-pointer rounded-full bg-[#171717] px-4 py-2 font-mono text-xs font-medium text-white shadow-[inset_0_0_0_1px_#2c2c2c] hover:bg-[#222]"
                  >
                    Lang: {locale.toUpperCase()}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setUnits(units === "metric" ? "imperial" : "metric")
                    }
                    className="min-h-[42px] cursor-pointer rounded-full bg-[#171717] px-4 py-2 font-mono text-xs font-medium text-white shadow-[inset_0_0_0_1px_#2c2c2c] hover:bg-[#222]"
                  >
                    Units:{" "}
                    {units === "metric"
                      ? "Metric (m², L)"
                      : "Imperial (ft², gal)"}
                  </button>
                </div>
              </div>

              {/* Right Column: DOVV STUDIO MINI SLIDE DECK (.slides inside .notch) */}
              <div className="lg:col-span-4">
                <div className="overflow-hidden rounded-[28px] bg-[#171717] p-4 shadow-[inset_0_0_0_1.5px_#2c2c2c]">
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
                          className={`h-2.5 rounded-full transition-all ${
                            notchSlide === idx
                              ? "w-6 bg-[#c6f432]"
                              : "w-2.5 bg-white/25 hover:bg-white/50"
                          }`}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => setNotchSlide((s) => (s + 2) % 3)}
                        aria-label="Previous slide"
                        className="ml-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/10 font-mono text-xs hover:bg-white/20"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotchSlide((s) => (s + 1) % 3)}
                        aria-label="Next slide"
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/10 font-mono text-xs hover:bg-white/20"
                      >
                        →
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Slide Track with DOVV cubic-bezier(0.32, 1.1, 0.5, 1) */}
                  <div className="overflow-hidden">
                    <div
                      className="dovv-slide-track"
                      style={{
                        transform: `translate3d(-${notchSlide * 100}%, 0, 0)`,
                      }}
                    >
                      {/* Mini Slide 1: Town Telemetry */}
                      <div className="w-full shrink-0 space-y-2 pr-1">
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
                        <button
                          type="button"
                          onClick={() => {
                            setNotchOpen(false);
                            router.push("/radar");
                          }}
                          className="mt-1 inline-flex min-h-[36px] cursor-pointer items-center rounded-full bg-[#c6f432] px-3.5 text-xs font-semibold text-[#080808]"
                        >
                          Inspect 3D Roof Radar →
                        </button>
                      </div>

                      {/* Mini Slide 2: 7-Layer AI Credit Shield */}
                      <div className="w-full shrink-0 space-y-2 pr-1">
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
                        <button
                          type="button"
                          onClick={() => {
                            setNotchOpen(false);
                            router.push("/settings");
                          }}
                          className="mt-1 inline-flex min-h-[36px] cursor-pointer items-center rounded-full bg-white/15 px-3.5 text-xs font-medium text-white hover:bg-white/25"
                        >
                          Open Credit Shield →
                        </button>
                      </div>

                      {/* Mini Slide 3: Lv.5 Judge Demo Session */}
                      <div className="w-full shrink-0 space-y-2 pr-1">
                        <p className="font-sans text-sm font-semibold text-white">
                          Judge Demo Profile (Lv.5 Unlocked)
                        </p>
                        <p className="text-xs text-[#aaa9ad]">
                          Unlocks all 6 Townhouse modules (Solar, Cistern,
                          Biopore, Greenhouse, Albedo, Sorting Hub).
                        </p>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              loginAsJudgeDemo();
                              setNotchOpen(false);
                            }}
                            className="min-h-[36px] flex-1 cursor-pointer rounded-full bg-[#c6f432] px-3 text-xs font-semibold text-[#111]"
                          >
                            Activate Lv.5 Town
                          </button>
                          <Link
                            href="/login"
                            onClick={() => setNotchOpen(false)}
                            className="flex min-h-[36px] items-center justify-center rounded-full bg-white/10 px-3 text-xs font-medium text-white"
                          >
                            Portal
                          </Link>
                        </div>
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
        className="mx-auto max-w-[1440px] px-5 pt-2 sm:px-8"
      >
        {children}
      </main>

      {/* DOVV STUDIO FIXED BOTTOM PILL DOCK (.scroll-nav) WITH ZEGGO ROLL TEXT */}
      <nav
        aria-label={isId ? "Navigasi Utama" : "Primary Navigation"}
        className="dovv-bottom-dock max-w-[96vw] overflow-x-auto"
      >
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`zeggo-btn flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-4 text-xs sm:text-sm font-medium transition ${
                active
                  ? "bg-[#c6f432] font-semibold text-[#080808]"
                  : "text-white hover:bg-[#222222]"
              }`}
            >
              <ZeggoRollText text={isId ? item.labelId : item.labelEn} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
