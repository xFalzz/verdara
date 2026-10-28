"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import {
  resolvePresetGeoContext,
  type CityPreset,
} from "@/lib/science/presets";
import { calculateHousingFootprint } from "@/lib/science/calculator";
import {
  formatArea,
  formatCurrency,
  formatTemp,
  formatVolume,
} from "@/lib/science/units";
import {
  ZeggoRollText,
  DovvInteractiveWordmark,
  DovvHoloSticker,
} from "@/components/ui/InteractiveEffects";

const EcoIslandCanvas = dynamic(
  () => import("@/components/three/EcoIslandCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#e9e8e2] font-mono text-xs text-[#4b4b48]">
        Loading 3D Townhouse Canvas...
      </div>
    ),
  }
);

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

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type TownSimMode = "run" | "break" | "heal";

export default function LandingPage() {
  const router = useRouter();
  const {
    locale,
    units,
    theme,
    activePresetId,
    geo,
    housingCalc,
    level,
    unlockedItems,
    aiShield,
    setLocale,
    setUnits,
    setTheme,
    teleportToCity,
    loginAsJudgeDemo,
  } = useVerdaraStore();

  const [isNightPreview, setIsNightPreview] = useState(false);
  const [townSimMode, setTownSimMode] = useState<TownSimMode>("run");
  const [activeSlide, setActiveSlide] = useState(0);
  const [headerNotchOpen, setHeaderNotchOpen] = useState(false);
  const [headerNotchSlide, setHeaderNotchSlide] = useState(0);
  const [domeCurveScale, setDomeCurveScale] = useState(0.85);
  const domeRef = useRef<SVGSVGElement | null>(null);

  const isId = locale === "id";
  const isLight = theme === "light";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Sync active slide when user switches city preset
  useEffect(() => {
    const idx = CITY_SPECIMENS.findIndex((c) => c.id === activePresetId);
    if (idx !== -1) {
      setActiveSlide(idx);
    }
  }, [activePresetId]);

  // DOVV Studio scroll-driven curved dome (.dome) interpolation
  useEffect(() => {
    const handleScroll = () => {
      if (!domeRef.current) return;
      const rect = domeRef.current.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const progress = Math.max(0, Math.min(1, 1 - rect.top / vh));
      setDomeCurveScale(0.35 + progress * 0.65);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const maxPrecip = Math.max(...geo.monthlyPrecipMm, 100);
  const remainingCredit = (
    aiShield.lifetimeCapUsd - aiShield.totalSpendUsd
  ).toFixed(2);

  // Townhouse.dev "Watch it Run, Break, and Heal" simulation states
  const simConfig = {
    run: {
      badge1: {
        dot: "bg-[#1e9e5a]",
        text: "text-[#14733f]",
        label: "SOLAR ROOF OK",
      },
      badge2: {
        dot: "bg-[#2a9dbd]",
        text: "text-[#146f8a]",
        label: "CISTERN FLOW NOMINAL",
      },
      badge3: {
        dot: "bg-[#1e9e5a]",
        text: "text-[#14733f]",
        label: `TCI ${housingCalc.thermal.tciScore}/100`,
      },
      title: isId
        ? "Seluruh kapling Anda berjalan stabil dalam satu gambar."
        : "Your whole plot running smoothly in one picture.",
      desc: isId
        ? `Atap ${formatArea(
            housingCalc.footprintM2,
            units,
            locale
          )} di ${geo.city} menghasilkan ${
            housingCalc.solar.kwp
          } kWp surya (${formatCurrency(
            housingCalc.solar.savingsYear,
            housingCalc.solar.currency,
            locale
          )}/thn) dan memanen ${formatVolume(
            housingCalc.rainwater.litersYear,
            units,
            locale
          )} air hujan per tahun tanpa limpasan berlebih.`
        : `A ${formatArea(
            housingCalc.footprintM2,
            units,
            locale
          )} roof in ${geo.city} yields ${
            housingCalc.solar.kwp
          } kWp solar (${formatCurrency(
            housingCalc.solar.savingsYear,
            housingCalc.solar.currency,
            locale
          )}/yr) and captures ${formatVolume(
            housingCalc.rainwater.litersYear,
            units,
            locale
          )} of rainwater per year with zero overflow.`,
    },
    break: {
      badge1: {
        dot: "bg-[#e5484d]",
        text: "text-[#b8252a]",
        label: "CISTERN OVERFLOW RISK",
      },
      badge2: {
        dot: "bg-[#e9a23b]",
        text: "text-[#8a5608]",
        label: "ROOF ALBEDO HEAT SPIKE",
      },
      badge3: {
        dot: "bg-[#e5484d]",
        text: "text-[#b8252a]",
        label: `PEAK ${maxPrecip} MM/MO SURGE`,
      },
      title: isId
        ? "Lihat titik kritis sebelum talang meluap atau atap memanas."
        : "Know before gutters overflow or roof thermal load spikes.",
      desc: isId
        ? `Simulasi puncak hujan ${maxPrecip} mm/bln di ${geo.city}: tanpa ${housingCalc.infiltration.bioporeUnits} sumur biopori dan tangki ${housingCalc.rainwater.recommendedCisternLiters}L, limpasan permukaan melonjak 42% dan suhu permukaan atap naik +4.2°C.`
        : `Peak ${maxPrecip} mm/month storm simulation in ${geo.city}: without ${housingCalc.infiltration.bioporeUnits} biopore shafts and a ${housingCalc.rainwater.recommendedCisternLiters}L cistern, surface runoff spikes 42% and roof skin temperature rises +4.2°C.`,
    },
    heal: {
      badge1: {
        dot: "bg-[#1e9e5a]",
        text: "text-[#14733f]",
        label: "SAM 3.1 RETROFIT APPLIED",
      },
      badge2: {
        dot: "bg-[#2a9dbd]",
        text: "text-[#146f8a]",
        label: `+${housingCalc.infiltration.bioporeUnits} BIOPORES ACTIVE`,
      },
      badge3: {
        dot: "bg-[#1e9e5a]",
        text: "text-[#14733f]",
        label: "COUNCIL ±3% VERIFIED",
      },
      title: isId
        ? "Dipindai SAM 3.1, dirancang Dewan AI, dan diverifikasi di lapangan."
        : "Scanned by SAM 3.1, routed by Council, healed in the field.",
      desc: isId
        ? `Masker poligon SAM 3.1 memetakan ${housingCalc.solar.panelCountEst} panel PV + pipa talang ke tangki ${housingCalc.rainwater.recommendedCisternLiters}L. Dr. Flora, Ir. Arka, dan Sirkula mengunci penghematan ${formatCurrency(
            housingCalc.solar.savingsYear,
            housingCalc.solar.currency,
            locale
          )}/thn dan meredam 100% banjir kapling.`
        : `SAM 3.1 polygon masks map ${housingCalc.solar.panelCountEst} PV panels + downspout routing into a ${housingCalc.rainwater.recommendedCisternLiters}L cistern. Dr. Flora, Ir. Arka, and Sirkula lock ${formatCurrency(
            housingCalc.solar.savingsYear,
            housingCalc.solar.currency,
            locale
          )}/yr in savings and absorb 100% of plot surge.`,
    },
  }[townSimMode];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isLight
          ? "bg-[#f5f5f3] text-[#111111]"
          : "bg-[#0b0c0e] text-[#f2f1ec]"
      }`}
    >
      {/* 1. DOVV STUDIO FLOATING TOP CHROME + EXPANDABLE NOTCH */}
      <header className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 pt-7 pb-2 sm:px-10">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="flex min-h-[44px] items-center gap-2.5"
            aria-label="Verdara Home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#080808] text-[#c6f432] shadow-[inset_0_0_0_1px_#2a2a2a]">
              <svg
                width="19"
                height="19"
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
            <span className="dovv-wordmark text-3xl tracking-tight">
              VERDARA
            </span>
          </Link>

          {/* City Specimen Switcher Pill */}
          <div
            role="group"
            aria-label={isId ? "Pilih Kota" : "Select City"}
            className="hidden flex-wrap items-center gap-1 rounded-full bg-[#080808] p-1 shadow-[inset_0_0_0_1px_#262626] lg:flex"
          >
            {CITY_SPECIMENS.map((c, idx) => {
              const active = activePresetId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    teleportToCity(c.id);
                    setActiveSlide(idx);
                  }}
                  className={`min-h-[36px] cursor-pointer rounded-full px-3.5 py-1 text-xs font-medium transition ${
                    active
                      ? "bg-[#c6f432] font-semibold text-[#080808]"
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
        </div>

        {/* Right Controls + DOVV Notch Trigger + Zeggo Roll CTA */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setLocale(locale === "en" ? "id" : "en")}
            className={`min-h-[44px] cursor-pointer rounded-full px-3.5 text-xs font-medium transition ${
              isLight
                ? "bg-white text-[#111] shadow-[0_0_0_1px_rgba(0,0,0,0.1)] hover:bg-[#eee]"
                : "bg-[#16181c] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
            }`}
          >
            {locale.toUpperCase()}
          </button>
          <button
            type="button"
            onClick={() =>
              setUnits(units === "metric" ? "imperial" : "metric")
            }
            className={`min-h-[44px] cursor-pointer rounded-full px-3.5 text-xs font-medium transition ${
              isLight
                ? "bg-white text-[#111] shadow-[0_0_0_1px_rgba(0,0,0,0.1)] hover:bg-[#eee]"
                : "bg-[#16181c] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
            }`}
          >
            {units === "metric" ? "Metric (m², L)" : "Imperial (ft², gal)"}
          </button>
          <button
            type="button"
            onClick={() => setTheme(isLight ? "dark" : "light")}
            className={`min-h-[44px] cursor-pointer rounded-full px-3.5 text-xs font-medium transition ${
              isLight
                ? "bg-white text-[#111] shadow-[0_0_0_1px_rgba(0,0,0,0.1)] hover:bg-[#eee]"
                : "bg-[#16181c] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
            }`}
          >
            {isLight ? "Daylight" : "Night"}
          </button>

          {/* DOVV Top-Right Expandable Notch Button */}
          <button
            type="button"
            onClick={() => setHeaderNotchOpen(!headerNotchOpen)}
            aria-expanded={headerNotchOpen}
            className="zeggo-btn flex min-h-[46px] cursor-pointer items-center gap-2 rounded-full bg-[#080808] px-4 text-xs font-medium text-white shadow-[inset_0_0_0_2px_#2c2c2c] transition hover:bg-[#1a1a1a]"
          >
            <span className="h-2 w-2 rounded-full bg-[#c6f432]" />
            <ZeggoRollText
              text={
                headerNotchOpen
                  ? isId
                    ? "Tutup Notch"
                    : "Close Notch"
                  : isId
                  ? "Slide Dek Studio"
                  : "Studio Deck (03)"
              }
            />
            <span className="font-mono text-sm leading-none">
              {headerNotchOpen ? "×" : "+"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              loginAsJudgeDemo();
              router.push("/dashboard");
            }}
            className="zeggo-btn group flex min-h-[46px] cursor-pointer items-center gap-2 rounded-full bg-[#080808] px-5 text-sm font-medium text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] transition hover:bg-[#222]"
          >
            <ZeggoRollText
              text={isId ? "Buka Kota 3D" : "Open Living Town"}
            />
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              <path
                d="M7 17 17 7M8.5 7H17v8.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* DOVV STUDIO EXPANDABLE TOP-RIGHT NOTCH WITH MINI SLIDE CAROUSEL */}
      {headerNotchOpen && (
        <div className="mx-auto mt-3 max-w-[1440px] px-5 sm:px-10">
          <div className="ml-auto max-w-[680px] rounded-[34px] bg-[#080808] p-5 text-white shadow-[inset_0_0_0_2px_#2c2c2c,0_24px_60px_-12px_rgba(0,0,0,0.65)]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="flex flex-col justify-between space-y-3 sm:col-span-5">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#aaa9ad]">
                    DOVV STUDIO NOTCH · LIVE NODE
                  </span>
                  <p className="mt-1 font-sans text-lg font-medium text-white">
                    {geo.city} ({geo.koppen.code})
                  </p>
                  <p className="font-mono text-xs text-[#c6f432]">
                    ${remainingCredit} / $150.00 Meta API Pool
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      loginAsJudgeDemo();
                      router.push("/dashboard");
                    }}
                    className="min-h-[38px] flex-1 cursor-pointer rounded-full bg-[#c6f432] px-3 text-xs font-semibold text-[#080808]"
                  >
                    Lv.5 Judge Demo
                  </button>
                  <Link
                    href="/settings"
                    className="flex min-h-[38px] items-center justify-center rounded-full bg-white/10 px-3 text-xs font-medium text-white"
                  >
                    Shield
                  </Link>
                </div>
              </div>

              {/* Mini 3-Slide Deck inside Notch (.slides) */}
              <div className="overflow-hidden rounded-[26px] bg-[#171717] p-4 shadow-[inset_0_0_0_1.5px_#2c2c2c] sm:col-span-7">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#c6f432]">
                    SLIDE 0{headerNotchSlide + 1}/03
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setHeaderNotchSlide(idx)}
                        aria-label={`Notch slide ${idx + 1}`}
                        className={`h-2 rounded-full transition-all ${
                          headerNotchSlide === idx
                            ? "w-5 bg-[#c6f432]"
                            : "w-2 bg-white/25"
                        }`}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => setHeaderNotchSlide((s) => (s + 2) % 3)}
                      className="ml-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white/10 font-mono text-xs"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeaderNotchSlide((s) => (s + 1) % 3)}
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white/10 font-mono text-xs"
                    >
                      →
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden">
                  <div
                    className="dovv-slide-track"
                    style={{
                      transform: `translate3d(-${headerNotchSlide * 100}%, 0, 0)`,
                    }}
                  >
                    <div className="w-full shrink-0 space-y-1">
                      <p className="text-xs font-semibold text-white">
                        01 / SAM 3.1 Zero-Shot Concept Masks
                      </p>
                      <p className="text-[11px] leading-relaxed text-[#aaa9ad]">
                        Segments rooftop solar slabs, rainwater downspouts, and
                        recyclable PET/Alu/e-waste with IoU &lt; 0.85 deduplication.
                      </p>
                    </div>
                    <div className="w-full shrink-0 space-y-1">
                      <p className="text-xs font-semibold text-white">
                        02 / NREL PVWatts v8 + ERA5 Hydrology
                      </p>
                      <p className="text-[11px] leading-relaxed text-[#aaa9ad]">
                        Computes {housingCalc.solar.kwp} kWp solar array yield
                        and {formatVolume(housingCalc.rainwater.litersYear, units, locale)}{" "}
                        monsoon capture for {geo.city}.
                      </p>
                    </div>
                    <div className="w-full shrink-0 space-y-1">
                      <p className="text-xs font-semibold text-white">
                        03 / Specialist Council (±3% Fact Guard)
                      </p>
                      <p className="text-[11px] leading-relaxed text-[#aaa9ad]">
                        Dr. Flora, Ir. Arka, and Sirkula synthesize a locked
                        Master Blueprint cross-checked against SITE_BRIEF.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DOVV STUDIO HERO SECTION (Cursor-Proximity Variable Font Wave + Draggable Holo Stickers + Zeggo Roll Buttons) */}
      <section className="mx-auto flex max-w-[1440px] flex-col items-center px-5 pt-10 pb-10 text-center sm:px-10 sm:pt-14">
        {/* DOVV Live Status Pill */}
        <button
          type="button"
          onClick={() => router.push("/radar")}
          className={`zeggo-btn group inline-flex min-h-[42px] cursor-pointer items-center gap-2.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition hover:-translate-y-0.5 ${
            isLight
              ? "bg-white text-[#111] shadow-[0_0_0_1px_rgba(0,0,0,0.07),0_6px_20px_-8px_rgba(0,0,0,0.22)]"
              : "bg-[#15171b] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_6px_20px_-8px_rgba(0,0,0,0.6)]"
          }`}
        >
          <span className="dovv-pill-dot">
            <span />
          </span>
          <span>
            {geo.city} ({geo.koppen.code}) · {housingCalc.solar.kwp} kWp Solar
          </span>
          <span className="hidden h-3.5 w-[1px] bg-current opacity-20 sm:inline-block" />
          <span className="hidden opacity-75 sm:inline">
            <ZeggoRollText
              text={isId ? "Inspeksi Fisika Atap" : "Inspect roof physics"}
            />
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="opacity-65 transition-transform group-hover:translate-x-0.5"
          >
            <path
              d="M5 12h14m0 0-6-6m6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Giant Interactive Variable Display Wordmark + DOVV Draggable Holographic Foil Stickers */}
        <div className="relative mt-7 flex w-full max-w-[1240px] flex-col items-center justify-center">
          <h1 className="sr-only">
            {isId
              ? "Verdara: Lihat ke dalam kota ekologis Anda, ukur tenaga surya atap, air hujan, dan daur ulang dalam ruang 3D."
              : "Verdara: See inside your living eco-town, audit solar roofs, rainwater pipes, and circular material recovery."}
          </h1>

          {/* Draggable Holo Sticker 1: Top-Left Orange */}
          <DovvHoloSticker
            label="Meta SAM 3.1 + Muse Spark"
            sublabel="Drag Me"
            variant="orange"
            rotationDeg={-8}
            className="absolute -top-7 left-2 z-20 hidden md:block lg:left-6"
          />

          {/* Draggable Holo Sticker 2: Top-Right Lime */}
          <DovvHoloSticker
            label={`${housingCalc.solar.kwp} kWp · ${formatCurrency(
              housingCalc.solar.savingsYear,
              housingCalc.solar.currency,
              locale
            )}/yr`}
            variant="lime"
            rotationDeg={9}
            className="absolute -top-6 right-2 z-20 hidden md:block lg:right-8"
          />

          {/* Draggable Holo Sticker 3: Bottom-Right Gold */}
          <DovvHoloSticker
            label="NREL PVWatts v8 · ERA5 10-Yr"
            variant="gold"
            rotationDeg={-6}
            className="absolute -bottom-6 right-6 z-20 hidden lg:block"
          />

          {/* DOVV Studio Cursor-Proximity Variable Font Wave Wordmark */}
          <DovvInteractiveWordmark
            lines={
              isId
                ? ["LIHAT KOTA EKOLOGIS", "HIDUP MILIK ANDA"]
                : ["SEE INSIDE YOUR", "LIVING ECO-TOWN"]
            }
            className="text-center text-[clamp(52px,13vw,182px)] tracking-tight"
          />
        </div>

        {/* Subtitle & Zeggo Character-Roll Pill Buttons */}
        <p
          className={`mt-6 max-w-[640px] text-base sm:text-lg leading-[1.45] tracking-[-0.02em] ${
            isLight ? "text-[#4b4b48]" : "text-[#c9c7c0]"
          }`}
        >
          {isId
            ? "Blok hunian Anda digambar sebagai kota hidup berisi atap surya, pipa air hujan, tangki sisterna, dan hub sirkular. Amati kinerjanya, uji saat badai datang, dan verifikasi perbaikan fisik."
            : "Your neighborhood drawn as a living town of solar roofs, rainwater pipes, cisterns, and circular hubs. Watch it run, stress-test monsoon surges, and verify real-world fixes."}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              loginAsJudgeDemo();
              router.push("/dashboard");
            }}
            className="zeggo-btn flex min-h-[48px] cursor-pointer items-center justify-center rounded-full bg-[#080808] px-7 text-[15px] font-medium text-white transition hover:bg-[#222222]"
          >
            <ZeggoRollText
              text={
                isId
                  ? "Masuk ke Kota Hidup 3D (Demo Juri Lv.5)"
                  : "Start with Judge Demo Town (Lv.5)"
              }
            />
          </button>

          <Link
            href="/lens"
            className={`zeggo-btn flex min-h-[48px] items-center justify-center rounded-full px-6 text-[15px] font-medium transition ${
              isLight
                ? "text-[#111] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.22)] hover:shadow-[inset_0_0_0_1px_#000]"
                : "text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)] hover:shadow-[inset_0_0_0_1px_#fff]"
            }`}
          >
            <ZeggoRollText
              text={
                isId
                  ? "Pindai Objek di Lensa SAM 3.1"
                  : "Open SAM 3.1 Spatial Lens"
              }
            />
          </Link>
        </div>

        {/* ZEGGO.COM.SG SIGNATURE SCROLL INDICATOR LINE (.zeggo-scroll-indicator) */}
        <div className="mt-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] opacity-65">
          <span>
            {isId ? "Gulir atau putar kota 3D" : "Scroll or orbit living town"}
          </span>
          <span className="zeggo-scroll-indicator" aria-hidden="true" />
        </div>
      </section>

      {/* 3. DOVV SHOWREEL FRAME + TOWNHOUSE.DEV "WATCH IT RUN, BREAK, AND HEAL" LIVE STAGE */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-10">
        <div className="dovv-stage-frame h-[580px] w-full sm:h-[670px] lg:h-[710px]">
          {/* Interactive 3D Townhouse Diorama */}
          <EcoIslandCanvas
            biome={geo.biome}
            level={level}
            isNight={isNightPreview || townSimMode === "break"}
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

          {/* Top-Left Townhouse Simulation Bar ("Watch it Run, Break, and Heal") */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1.5 rounded-full bg-[#080808]/90 p-1.5 backdrop-blur-md shadow-lg">
            {(
              [
                {
                  id: "run",
                  labelEn: "01 Watch it Run",
                  labelId: "01 Operasi Normal",
                  dot: "bg-[#1e9e5a]",
                },
                {
                  id: "break",
                  labelEn: "02 Monsoon Stress (Break)",
                  labelId: "02 Simulasi Badai (Kritis)",
                  dot: "bg-[#e5484d]",
                },
                {
                  id: "heal",
                  labelEn: "03 SAM 3.1 + Council Heal",
                  labelId: "03 Solusi SAM 3.1 + Dewan",
                  dot: "bg-[#2a9dbd]",
                },
              ] as const
            ).map((tab) => {
              const active = townSimMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTownSimMode(tab.id)}
                  className={`flex min-h-[36px] cursor-pointer items-center gap-2 rounded-full px-3.5 py-1 font-mono text-xs font-medium transition ${
                    active
                      ? "bg-white font-semibold text-[#111]"
                      : "text-[#c9c7c0] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${tab.dot}`} />
                  <span>{isId ? tab.labelId : tab.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Top-Right Lighting & Biome Pill inside Stage */}
          <div className="absolute top-4 right-4 z-10 hidden flex-wrap items-center gap-2 md:flex">
            <span className="rounded-full bg-[#080808]/90 px-3.5 py-1.5 font-mono text-xs font-medium text-white backdrop-blur-md">
              {geo.city} · Köppen {geo.koppen.code} ({geo.biome.toUpperCase()})
            </span>
            <button
              type="button"
              onClick={() => setIsNightPreview(!isNightPreview)}
              className="min-h-[38px] cursor-pointer rounded-full bg-white/95 px-3.5 py-1.5 font-mono text-xs font-semibold text-[#111] shadow-md transition hover:bg-white"
            >
              {isNightPreview ? "Switch to Daylight" : "Switch to Night Glow"}
            </button>
          </div>

          {/* TOWNHOUSE.DEV SIGNATURE BOTTOM-LEFT FLOATING PAPER CARD (.static-hero-words) */}
          <div
            className={`absolute bottom-4 left-4 right-4 z-10 rounded-[16px] border p-5 shadow-2xl backdrop-blur-md transition-all duration-300 sm:right-auto sm:bottom-6 sm:left-6 sm:w-[min(540px,46vw)] sm:p-6 ${
              isLight
                ? "border-[#151515]/10 bg-white/95 text-[#151515]"
                : "border-white/10 bg-[#16171a]/95 text-[#f2f1ec]"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
              <span
                className={`inline-flex items-center gap-1.5 font-semibold ${simConfig.badge1.text}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${simConfig.badge1.dot}`}
                />
                {simConfig.badge1.label}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 font-semibold ${simConfig.badge2.text}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${simConfig.badge2.dot}`}
                />
                {simConfig.badge2.label}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 font-semibold ${simConfig.badge3.text}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${simConfig.badge3.dot}`}
                />
                {simConfig.badge3.label}
              </span>
            </div>

            <h2 className="townhouse-title mt-2.5 text-2xl sm:text-4xl">
              {simConfig.title}
            </h2>

            <p
              className={`mt-2 text-xs sm:text-sm leading-relaxed ${
                isLight ? "text-[#4b4b48]" : "text-[#c9c7c0]"
              }`}
            >
              {simConfig.desc}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <Link
                href="/dashboard"
                className={`zeggo-btn inline-flex min-h-[44px] items-center rounded-[8px] px-4 text-xs sm:text-sm font-medium transition ${
                  isLight
                    ? "bg-[#151515] text-[#f6f6f3] hover:bg-[#2a2a2a]"
                    : "bg-[#f2f1ec] text-[#0f1012] hover:bg-white"
                }`}
              >
                <ZeggoRollText
                  text={isId ? "Inspeksi Kota Hidup" : "Inspect Living Town"}
                />
              </Link>
              <Link
                href="/radar"
                className="zeggo-btn inline-flex min-h-[44px] items-center rounded-[8px] border border-current/20 px-3.5 text-xs sm:text-sm font-medium"
              >
                <ZeggoRollText
                  text={
                    isId ? "Ubah Luas Atap" : "Adjust Roof Footprint (m²/ft²)"
                  }
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DOVV STUDIO 01/05 INTERACTIVE HORIZONTAL SLIDE DECK CAROUSEL (.dovv-slide-track) */}
      <section className="mx-auto max-w-[1440px] px-5 pt-24 pb-12 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] opacity-60">
              {isId
                ? "01 / Dek Geser Spesimen Iklim Dunia (DOVV Slide Track)"
                : "01 / Global Climate Specimen Slide Deck (DOVV Slide Track)"}
            </p>
            <h2 className="mt-2 text-[clamp(32px,4.5vw,64px)] font-normal leading-[1.06] tracking-[-0.04em]">
              {isId
                ? "Geser 5 spesimen kota dan bandingkan fisika atapnya."
                : "Slide across 5 global climate specimens in real time."}
            </h2>
          </div>

          {/* DOVV Studio Slide Counter (01/05) + Circular Prev/Next Buttons */}
          <div className="flex items-center gap-3">
            <span
              aria-live="polite"
              className="dovv-wordmark text-3xl sm:text-4xl tabular-nums"
            >
              0{activeSlide + 1}/0{CITY_SPECIMENS.length}
            </span>
            <button
              type="button"
              onClick={() =>
                setActiveSlide(
                  (s) => (s + CITY_SPECIMENS.length - 1) % CITY_SPECIMENS.length
                )
              }
              aria-label="Previous city specimen slide"
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#080808] text-white transition hover:scale-105 hover:bg-[#222]"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveSlide((s) => (s + 1) % CITY_SPECIMENS.length)
              }
              aria-label="Next city specimen slide"
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#080808] text-white transition hover:scale-105 hover:bg-[#222]"
            >
              →
            </button>
          </div>
        </div>

        {/* Horizontal Slide Viewport */}
        <div className="overflow-hidden rounded-[32px] bg-[#080808] p-6 sm:p-10 text-white shadow-[inset_0_0_0_2px_#262626]">
          <div
            className="dovv-slide-track"
            style={{
              transform: `translate3d(-${activeSlide * 100}%, 0, 0)`,
            }}
          >
            {CITY_SPECIMENS.map((spec, idx) => {
              const preset = resolvePresetGeoContext(spec.id, 10);
              const calc = calculateHousingFootprint({
                footprintM2: housingCalc.footprintM2,
                ghiKwhM2Day: preset.ghiKwhM2Day,
                annualPrecipMm: preset.koppen.pAnnMm,
                electricityTariff: preset.policy.electricityTariff,
                gridEfKgPerKwh: preset.policy.gridEfKgKwh,
                currency: preset.policy.currency,
                warmMonthMaxTempC: preset.warmMonthMaxTempC,
                greenCoverRatio: preset.greenCoverRatio,
                builtCoverRatio: preset.builtCoverRatio,
              });
              const isCurrent = activePresetId === spec.id;

              return (
                <div
                  key={spec.id}
                  className="w-full shrink-0 pr-2 sm:pr-4"
                  aria-hidden={activeSlide !== idx}
                >
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
                    <div className="space-y-4 lg:col-span-6">
                      <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
                        <span className="rounded-full bg-[#c6f432] px-3 py-1 font-bold text-[#080808]">
                          SPECIMEN 0{idx + 1} · {spec.iso}
                        </span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-white">
                          Köppen {preset.koppen.code} ({preset.koppen.nameEn})
                        </span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-[#c6f432]">
                          Biome: {preset.biome.toUpperCase()}
                        </span>
                      </div>

                      <h3 className="dovv-wordmark text-5xl sm:text-7xl text-white">
                        {preset.city}
                      </h3>

                      <p className="max-w-xl text-sm sm:text-base leading-relaxed text-[#c9c7c0]">
                        {isId
                          ? preset.koppen.descriptionId
                          : preset.koppen.descriptionEn}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => teleportToCity(spec.id)}
                          className={`zeggo-btn inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-full px-6 text-sm font-semibold transition ${
                            isCurrent
                              ? "bg-[#c6f432] text-[#080808]"
                              : "bg-white text-[#080808] hover:bg-[#c6f432]"
                          }`}
                        >
                          <ZeggoRollText
                            text={
                              isCurrent
                                ? isId
                                  ? `Aktif di Kota 3D (${preset.city})`
                                  : `Active in 3D Town (${preset.city})`
                                : isId
                                ? `Teleportasi ke ${preset.city}`
                                : `Teleport Town to ${preset.city}`
                            }
                          />
                        </button>
                        <Link
                          href="/radar"
                          onClick={() => teleportToCity(spec.id)}
                          className="zeggo-btn inline-flex min-h-[46px] items-center rounded-full border border-white/25 px-5 text-sm font-medium text-white hover:bg-white/10"
                        >
                          <ZeggoRollText
                            text={
                              isId ? "Buka Peta Radar 3D" : "Open in 3D Radar"
                            }
                          />
                        </Link>
                      </div>
                    </div>

                    {/* Right Telemetry Cards inside Slide */}
                    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 lg:col-span-6">
                      <div className="rounded-2xl bg-[#141619] p-5 shadow-[inset_0_0_0_1px_#2a2d34]">
                        <span className="font-mono text-[11px] text-[#aaa9ad]">
                          NREL PVWATTS V8 SOLAR
                        </span>
                        <p className="mt-1.5 font-mono text-2xl sm:text-3xl font-bold text-[#c6f432]">
                          {calc.solar.kwp} kWp
                        </p>
                        <p className="mt-1 font-mono text-xs text-[#c9c7c0]">
                          {Math.round(calc.solar.kwhYear).toLocaleString()}{" "}
                          kWh/yr ·{" "}
                          {formatCurrency(
                            calc.solar.savingsYear,
                            calc.solar.currency,
                            locale
                          )}
                          /yr
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#141619] p-5 shadow-[inset_0_0_0_1px_#2a2d34]">
                        <span className="font-mono text-[11px] text-[#aaa9ad]">
                          ERA5 RAINWATER HARVEST
                        </span>
                        <p className="mt-1.5 font-mono text-2xl sm:text-3xl font-bold text-cyan-300">
                          {formatVolume(
                            calc.rainwater.litersYear,
                            units,
                            locale
                          )}
                        </p>
                        <p className="mt-1 font-mono text-xs text-[#c9c7c0]">
                          {preset.koppen.pAnnMm} mm/yr · Cistern{" "}
                          {calc.rainwater.recommendedCisternLiters}L
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#141619] p-5 shadow-[inset_0_0_0_1px_#2a2d34]">
                        <span className="font-mono text-[11px] text-[#aaa9ad]">
                          THERMAL COMFORT & ALBEDO
                        </span>
                        <p className="mt-1.5 font-mono text-2xl sm:text-3xl font-bold text-amber-300">
                          TCI {calc.thermal.tciScore}/100
                        </p>
                        <p className="mt-1 font-mono text-xs text-[#c9c7c0]">
                          {formatTemp(preset.currentTempC, units)} · Cool Roof -
                          {calc.thermal.coolingTargetDegC}°C
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#141619] p-5 shadow-[inset_0_0_0_1px_#2a2d34]">
                        <span className="font-mono text-[11px] text-[#aaa9ad]">
                          OSM CIRCULAR HUBS
                        </span>
                        <p className="mt-1.5 font-mono text-2xl sm:text-3xl font-bold text-white">
                          {preset.hubs.length} Verified
                        </p>
                        <p className="mt-1 truncate font-mono text-xs text-[#c9c7c0]">
                          {preset.hubs[0]?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slide Dots Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
            <div className="flex flex-wrap gap-2">
              {CITY_SPECIMENS.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`min-h-[36px] cursor-pointer rounded-full px-3.5 text-xs font-mono transition ${
                    activeSlide === idx
                      ? "bg-[#c6f432] font-bold text-[#080808]"
                      : "bg-white/10 text-[#c9c7c0] hover:bg-white/20"
                  }`}
                >
                  0{idx + 1} {c.label}
                </button>
              ))}
            </div>
            <span className="font-mono text-xs text-[#aaa9ad]">
              {isId
                ? "Transisi pegas DOVV cubic-bezier(0.32, 1.1, 0.5, 1)"
                : "DOVV spring slide track · cubic-bezier(0.32, 1.1, 0.5, 1)"}
            </span>
          </div>
        </div>
      </section>

      {/* 5. ZEGGO.COM.SG STICKY-LEFT + SCROLLING-RIGHT SUBGRID (01/02/03) & DIAGONAL STAIRCASE CASCADE */}
      <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-10">
        {/* Part A: Zeggo Sticky Split Subgrid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="md:sticky md:top-24 space-y-4">
              <p className="font-mono text-xs uppercase tracking-[0.12em] opacity-60">
                {isId
                  ? "02 / Arsitektur Spasial Zeggo Subgrid"
                  : "02 / Spatial Engineering Architecture"}
              </p>
              <h2 className="text-[clamp(34px,4.4vw,60px)] font-normal leading-[1.06] tracking-[-0.04em]">
                {isId ? (
                  <>
                    Setiap klaim AI diikat pada{" "}
                    <span className="text-[#1e9e5a]">persamaan fisika</span>{" "}
                    yang dapat diaudit.
                  </>
                ) : (
                  <>
                    Every AI recommendation is anchored to{" "}
                    <span className="text-[#1e9e5a]">
                      auditable physics equations
                    </span>
                    .
                  </>
                )}
              </h2>
              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isLight ? "text-[#4b4b48]" : "text-[#c9c7c0]"
                }`}
              >
                {isId
                  ? "Kami memadukan segmentasi poligon Meta SAM 3.1 dengan persamaan hidrologi dan fotovoltaik deterministik, sehingga juri maupun pemilik rumah dapat memverifikasi setiap angka."
                  : "We fuse Meta SAM 3.1 zero-shot polygon segmentation with deterministic hydrology and photovoltaic equations so homeowners and judges can verify every single number."}
              </p>
            </div>
          </div>

          <div className="space-y-6 md:col-span-6 md:col-start-7">
            {[
              {
                num: "01",
                titleEn: "Zero-Shot Spatial Segmentation (Meta SAM 3.1)",
                titleId: "Segmentasi Spasial Zero-Shot (Meta SAM 3.1)",
                highlightEn: "IoU < 0.85 polygon deduplication",
                highlightId: "deduplikasi poligon IoU < 0.85",
                bodyEn:
                  "Extracts solar-ready roof slabs, gutter downspouts, permeable soil zones, and recyclable materials from a single photo with real-time SVG mask overlays.",
                bodyId:
                  "Mengekstrak bidang atap surya, pipa talang air hujan, zona tanah resapan, dan material daur ulang dari satu foto dengan lapisan masker SVG interaktif.",
                href: "/lens",
              },
              {
                num: "02",
                titleEn: "NREL PVWatts v8 & 10-Year ERA5 Climatology",
                titleId: "NREL PVWatts v8 & Klimatologi ERA5 10-Tahun",
                highlightEn: `${housingCalc.solar.kwp} kWp & ${formatVolume(
                  housingCalc.rainwater.litersYear,
                  units,
                  locale
                )}/yr`,
                highlightId: `${housingCalc.solar.kwp} kWp & ${formatVolume(
                  housingCalc.rainwater.litersYear,
                  units,
                  locale
                )}/thn`,
                bodyEn:
                  "Calculates usable roof area (0.68 ratio), panel density, performance ratio (0.78), and DIN 1989-1 rainwater harvesting without LLM hallucination.",
                bodyId:
                  "Menghitung rasio atap efektif (0.68), densitas panel, rasio performa (0.78), dan panen air hujan standar DIN 1989-1 tanpa halusinasi angka LLM.",
                href: "/radar",
              },
              {
                num: "03",
                titleEn: "Multi-Agent Specialist Council (±3% Fact Validator)",
                titleId: "Dewan Spesialis Multi-Agen (Validator Fakta ±3%)",
                highlightEn: "Dr. Flora, Ir. Arka & Sirkula",
                highlightId: "Dr. Flora, Ir. Arka & Sirkula",
                bodyEn:
                  "Three domain agents debate your plot using Meta Muse Spark (or open-weight mode) while a deterministic post-validator enforces ±3% numerical fidelity against SITE_BRIEF.",
                bodyId:
                  "Tiga agen spesialis membedah kapling Anda menggunakan Meta Muse Spark (atau mode open-weight) sementara validator deterministik menjaga akurasi angka ±3% terhadap SITE_BRIEF.",
                href: "/council",
              },
            ].map((item) => (
              <div
                key={item.num}
                className={`rounded-[28px] border p-7 transition hover:-translate-y-0.5 ${
                  isLight
                    ? "border-black/10 bg-white shadow-sm"
                    : "border-white/10 bg-[#141619]"
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="rounded-full bg-[#080808] px-3 py-1 font-bold text-[#c6f432]">
                    STEP {item.num}
                  </span>
                  <span className="font-semibold text-[#1e9e5a]">
                    {isId ? item.highlightId : item.highlightEn}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-medium tracking-[-0.03em]">
                  {isId ? item.titleId : item.titleEn}
                </h3>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    isLight ? "text-[#4b4b48]" : "text-[#c9c7c0]"
                  }`}
                >
                  {isId ? item.bodyId : item.bodyEn}
                </p>
                <Link
                  href={item.href}
                  className="zeggo-btn mt-4 inline-flex min-h-[40px] items-center gap-2 font-mono text-xs font-semibold text-[#1e9e5a]"
                >
                  <ZeggoRollText
                    text={
                      isId ? "Buka Modul Terkait →" : "Open Workspace Module →"
                    }
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Part B: Zeggo.com.sg 12-Column Diagonal Staircase Cascade (col-start-1, 4, 7, 10) */}
        <div className="mt-20">
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.12em] opacity-60">
            {isId
              ? "03 / Tangga Alur Verifikasi (Zeggo Staircase Cascade)"
              : "03 / Four-Stage Verification Cascade (Zeggo Staircase Grid)"}
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {[
              {
                step: "01",
                colClass: "md:col-start-1 md:col-span-3",
                title: isId ? "1. Pilih atau Cari Kota" : "1. Select or Geocode City",
                detail: `${geo.city} (${geo.koppen.code}) · ${geo.ghiKwhM2Day} kWh/m²/d`,
              },
              {
                step: "02",
                colClass: "md:col-start-4 md:col-span-3 md:mt-8",
                title: isId ? "2. Pindai dengan SAM 3.1" : "2. Segment with SAM 3.1",
                detail: `${housingCalc.solar.panelCountEst} PV Panels · ${housingCalc.rainwater.recommendedCisternLiters}L Cistern`,
              },
              {
                step: "03",
                colClass: "md:col-start-7 md:col-span-3 md:mt-16",
                title: isId ? "3. Sidang Dewan 3 Agen" : "3. Convene 3-Agent Council",
                detail: `Locked SITE_BRIEF · ±3% Fact Guard`,
              },
              {
                step: "04",
                colClass: "md:col-start-10 md:col-span-3 md:mt-24",
                title: isId ? "4. Bukti Fisik & Bangun Kota" : "4. Field Proof & Unlock Town",
                detail: `64-Bit dHash Anti-Cheat · Lv.${level} Town`,
              },
            ].map((st) => (
              <div
                key={st.step}
                className={`${st.colClass} rounded-[24px] bg-[#080808] p-6 text-white shadow-[inset_0_0_0_1.5px_#262626]`}
              >
                <span className="font-mono text-xs font-bold text-[#c6f432]">
                  STAGE {st.step}
                </span>
                <h3 className="mt-2 text-lg font-medium">{st.title}</h3>
                <p className="mt-1.5 font-mono text-xs text-[#aaa9ad]">
                  {st.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. DOVV STUDIO 2-COLUMN WORK / CAPABILITY BENTO GRID (.work + .dovv-card) */}
      <section className="mx-auto max-w-[1440px] px-5 pt-8 pb-28 sm:px-10">
        <div className="flex flex-col items-start justify-between gap-4 pb-12 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] opacity-60">
              {isId
                ? "04 / Empat Instrumen Spasial Inti"
                : "04 / Four Core Spatial Instruments"}
            </p>
            <h2 className="mt-2 text-[clamp(36px,5vw,72px)] font-normal leading-[1.05] tracking-[-0.05em]">
              {isId
                ? "Dibangun dengan fisika nyata, bukan sekadar obrolan."
                : "Built on deterministic physics, not chatbot guesswork."}
            </h2>
          </div>
          <Link
            href="/dashboard"
            className="zeggo-btn inline-flex min-h-[48px] items-center gap-2 rounded-full border border-current/25 px-6 text-sm font-medium transition hover:bg-[#080808] hover:text-white"
          >
            <ZeggoRollText
              text={
                isId ? "Jelajahi Semua Modul →" : "Explore all workspaces →"
              }
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* DOVV CARD 01: OMNI-SPATIAL LENS */}
          <Link href="/lens" className="dovv-card group">
            <div className="dovv-card-media aspect-[16/10] p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between font-mono text-xs text-[#aaa9ad]">
                <span>SAM 3.1 + MUSE SPARK + MUSE IMAGE</span>
                <span className="rounded-full bg-[#c6f432]/15 px-3 py-0.5 text-[#c6f432]">
                  IoU &lt; 0.85 Dedup
                </span>
              </div>

              <div className="my-auto grid grid-cols-3 gap-3 py-4">
                <div className="rounded-2xl border border-[#1e9e5a]/50 bg-[#1e9e5a]/10 p-3.5">
                  <span className="font-mono text-[10px] text-[#c6f432]">
                    #01 ROOF SLAB
                  </span>
                  <p className="mt-1 font-sans text-base font-semibold text-white">
                    {housingCalc.solar.panelCountEst} Solar Panels
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-[#aaa9ad]">
                    Conf: 96% · {housingCalc.solar.kwp} kWp
                  </p>
                </div>
                <div className="rounded-2xl border border-[#2a9dbd]/50 bg-[#2a9dbd]/10 p-3.5">
                  <span className="font-mono text-[10px] text-cyan-300">
                    #02 DOWNSPOUT
                  </span>
                  <p className="mt-1 font-sans text-base font-semibold text-white">
                    {housingCalc.rainwater.recommendedCisternLiters}L Cistern
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-[#aaa9ad]">
                    Conf: 94% · Runoff 0.85
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e9a23b]/50 bg-[#e9a23b]/10 p-3.5">
                  <span className="font-mono text-[10px] text-amber-300">
                    #03 CIRCULAR
                  </span>
                  <p className="mt-1 font-sans text-base font-semibold text-white">
                    PET / Alu / PCB
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-[#aaa9ad]">
                    EPA WARM v16 Valued
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-3 font-mono text-xs text-[#c9c7c0]">
                <span>6 Golden Demo Specimens Ready ($0.00 Cache)</span>
                <span className="text-[#c6f432] group-hover:translate-x-1 transition-transform">
                  Open Lens →
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-5 pb-2">
              <h3 className="text-2xl font-normal tracking-[-0.03em]">
                {isId
                  ? "Lensa Omni-Spasial SAM 3.1"
                  : "Omni-Spatial Lens & Eco-Retrofit"}
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="dovv-chip">SAM 3.1 Masks</span>
                <span className="dovv-chip">Before/After Curtain</span>
              </div>
            </div>
          </Link>

          {/* DOVV CARD 02: 3D URBAN ROOF RADAR */}
          <Link href="/radar" className="dovv-card group">
            <div className="dovv-card-media aspect-[16/10] p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between font-mono text-xs text-[#aaa9ad]">
                <span>MAPLIBRE GL 3D (55° PITCH) · NREL PVWATTS V8</span>
                <span className="rounded-full bg-cyan-400/15 px-3 py-0.5 text-cyan-300">
                  {geo.hubs.length} OSM Hubs
                </span>
              </div>

              <div className="my-auto grid grid-cols-2 gap-3 py-4">
                <div className="rounded-2xl bg-[#111317] p-4 shadow-[inset_0_0_0_1px_#262930]">
                  <span className="font-mono text-[10px] text-[#aaa9ad]">
                    ANNUAL SOLAR GENERATION
                  </span>
                  <p className="mt-1 font-mono text-2xl font-semibold text-[#c6f432]">
                    {Math.round(housingCalc.solar.kwhYear).toLocaleString()} kWh
                  </p>
                  <p className="mt-1 font-mono text-xs text-[#c9c7c0]">
                    Saves{" "}
                    {formatCurrency(
                      housingCalc.solar.savingsYear,
                      housingCalc.solar.currency,
                      locale
                    )}
                    /yr · {housingCalc.solar.co2eKgYear} kg CO2e
                  </p>
                </div>
                <div className="rounded-2xl bg-[#111317] p-4 shadow-[inset_0_0_0_1px_#262930]">
                  <span className="font-mono text-[10px] text-[#aaa9ad]">
                    MONSOON & RAIN HARVEST
                  </span>
                  <p className="mt-1 font-mono text-2xl font-semibold text-cyan-300">
                    {formatVolume(
                      housingCalc.rainwater.litersYear,
                      units,
                      locale
                    )}
                  </p>
                  <p className="mt-1 font-mono text-xs text-[#c9c7c0]">
                    {housingCalc.infiltration.bioporeUnits} biopore shafts ·{" "}
                    {geo.koppen.pAnnMm} mm/yr
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-3 font-mono text-xs text-[#c9c7c0]">
                <span>Nearest Hub: {geo.hubs[0]?.name}</span>
                <span className="text-[#c6f432] group-hover:translate-x-1 transition-transform">
                  Open 3D Radar →
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-5 pb-2">
              <h3 className="text-2xl font-normal tracking-[-0.03em]">
                {isId
                  ? "Radar Atap Urban 3D & Hub Sirkular"
                  : "3D Urban Roof Radar & Circular Hubs"}
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="dovv-chip">NREL PVWatts v8</span>
                <span className="dovv-chip">OpenStreetMap</span>
              </div>
            </div>
          </Link>

          {/* DOVV CARD 03: THE VERDARA SPECIALIST COUNCIL */}
          <Link href="/council" className="dovv-card group">
            <div className="dovv-card-media aspect-[16/10] p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between font-mono text-xs text-[#aaa9ad]">
                <span>META MUSE SPARK + OPEN-WEIGHT MODE</span>
                <span className="rounded-full bg-amber-400/15 px-3 py-0.5 text-amber-300">
                  ±3% Fact Validator
                </span>
              </div>

              <div className="my-auto space-y-2.5 py-3">
                {[
                  {
                    agent: "01 / Dr. Flora",
                    role: "Urban Botanist & Microclimate Ecologist",
                    status: "Verified vs SITE_BRIEF",
                    dot: "bg-[#1e9e5a]",
                  },
                  {
                    agent: "02 / Ir. Arka",
                    role: "Building Solar & Hydrological Systems Architect",
                    status: "Verified vs SITE_BRIEF",
                    dot: "bg-[#2a9dbd]",
                  },
                  {
                    agent: "03 / Sirkula",
                    role: "Circular Economy & Household Payback Strategist",
                    status: "Verified vs SITE_BRIEF",
                    dot: "bg-[#e9a23b]",
                  },
                ].map((ag) => (
                  <div
                    key={ag.agent}
                    className="flex items-center justify-between rounded-xl bg-[#111317] px-3.5 py-2.5 text-xs shadow-[inset_0_0_0_1px_#262930]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`h-2 w-2 rounded-full ${ag.dot}`} />
                      <span className="font-mono font-semibold text-white">
                        {ag.agent}
                      </span>
                      <span className="hidden text-[#aaa9ad] sm:inline">
                        {ag.role}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-[#c6f432]">
                      {ag.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-3 font-mono text-xs text-[#c9c7c0]">
                <span>Supports meta-models/muse-spark-open</span>
                <span className="text-[#c6f432] group-hover:translate-x-1 transition-transform">
                  Convene Council →
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-5 pb-2">
              <h3 className="text-2xl font-normal tracking-[-0.03em]">
                {isId
                  ? "Sidang Dewan Spesialis Multi-Agen"
                  : "The Verdara Specialist Council"}
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="dovv-chip">3 Specialist Agents</span>
                <span className="dovv-chip">Zero Hallucination</span>
              </div>
            </div>
          </Link>

          {/* DOVV CARD 04: VERIFIABLE FIELD-ACTION PROOFS */}
          <Link href="/academy" className="dovv-card group">
            <div className="dovv-card-media aspect-[16/10] p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between font-mono text-xs text-[#aaa9ad]">
                <span>SAM 3.1 PROOF ENGINE · 64-BIT PERCEPTUAL DHASH</span>
                <span className="rounded-full bg-[#c6f432]/15 px-3 py-0.5 text-[#c6f432]">
                  HTTP 409 Anti-Cheat
                </span>
              </div>

              <div className="my-auto grid grid-cols-2 gap-3 py-4">
                <div className="rounded-2xl bg-[#111317] p-4 shadow-[inset_0_0_0_1px_#262930]">
                  <span className="font-mono text-[10px] text-[#c6f432]">
                    STEP 01-02 / KÖPPEN PROTOCOL
                  </span>
                  <p className="mt-1 font-sans text-base font-semibold text-white">
                    Climate-Adaptive Field Gate
                  </p>
                  <p className="mt-1 text-xs text-[#aaa9ad]">
                    Adapts biopore depth, cistern sizing, and sorting rules to
                    Köppen {geo.koppen.code}.
                  </p>
                </div>
                <div className="rounded-2xl bg-[#111317] p-4 shadow-[inset_0_0_0_1px_#262930]">
                  <span className="font-mono text-[10px] text-amber-300">
                    STEP 03 / SAM 3.1 PROOF SCAN
                  </span>
                  <p className="mt-1 font-sans text-base font-semibold text-white">
                    Unlocks 3D Town Modules
                  </p>
                  <p className="mt-1 text-xs text-[#aaa9ad]">
                    Verifies physical objects in camera photos and blocks
                    duplicate dHash uploads.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-3 font-mono text-xs text-[#c9c7c0]">
                <span>4 Field Tracks · +150 to +220 Eco-XP per proof</span>
                <span className="text-[#c6f432] group-hover:translate-x-1 transition-transform">
                  Verify Field Proof →
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-5 pb-2">
              <h3 className="text-2xl font-normal tracking-[-0.03em]">
                {isId
                  ? "Verifikasi Bukti Fisik Akademi"
                  : "Verifiable Field-Action Proofs"}
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="dovv-chip">SAM 3.1 Verifier</span>
                <span className="dovv-chip">64-Bit dHash</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 7. DOVV STUDIO SCROLL-DRIVEN CURVED DOME DARK SECTION + ERA5 CHART & TOWNHOUSE GRADED LEDGER */}
      <section className="relative mt-4 w-full">
        {/* DOVV Studio Scroll-Driven Curved Dome Top Edge (svg.dome) */}
        <svg
          ref={domeRef}
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            transform: `translateY(1px) scaleY(${domeCurveScale.toFixed(3)})`,
            transformOrigin: "bottom center",
          }}
          className="block h-[42px] w-full fill-[#080808] transition-transform duration-150 sm:h-[76px]"
        >
          <path d="M0 100 Q50 -95 100 100 Z" />
        </svg>

        <div className="bg-[#080808] px-5 pt-16 pb-28 text-white sm:px-10 sm:pt-24">
          <div className="mx-auto max-w-[1440px] space-y-20">
            {/* Part A: ERA5 10-Year Monthly Climatology Bar Chart */}
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-5">
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#c6f432]">
                  05 / ERA5 10-Year Climatology ({geo.lat.toFixed(2)}°,{" "}
                  {geo.lng.toFixed(2)}°)
                </p>
                <h2 className="text-3xl font-normal leading-[1.08] tracking-[-0.04em] sm:text-5xl">
                  {isId
                    ? `Bagaimana curah hujan dan suhu di ${geo.city} menentukan ukuran sisterna & pendinginan atap?`
                    : `How do rainfall and temperature in ${geo.city} shape your cistern & solar roof?`}
                </h2>
                <p className="text-sm leading-relaxed text-[#aaa9ad]">
                  {isId ? geo.koppen.descriptionId : geo.koppen.descriptionEn}
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                  <div className="rounded-2xl bg-[#141414] p-4 shadow-[inset_0_0_0_1px_#242424]">
                    <span className="text-[#aaa9ad]">ANNUAL RAINFALL</span>
                    <p className="mt-1 text-xl font-bold text-white">
                      {geo.koppen.pAnnMm} mm/yr
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#141414] p-4 shadow-[inset_0_0_0_1px_#242424]">
                    <span className="text-[#aaa9ad]">SOLAR IRRADIANCE</span>
                    <p className="mt-1 text-xl font-bold text-[#c6f432]">
                      {geo.ghiKwhM2Day} kWh/m²/d
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] bg-[#121212] p-6 shadow-[inset_0_0_0_1px_#242424] lg:col-span-7">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-6 font-mono text-xs text-[#aaa9ad]">
                  <span>
                    12-MONTH ERA5 REANALYSIS · {geo.city.toUpperCase()} (
                    {geo.koppen.code})
                  </span>
                  <span>Bars: Rainfall (mm) · Top: Mean Temp</span>
                </div>

                <div className="grid grid-cols-12 items-end gap-2 h-52 pt-6">
                  {geo.monthlyPrecipMm.map((precipMm: number, idx: number) => {
                    const tempC = geo.monthlyTempC[idx] ?? 20;
                    const barHeightPct = Math.max(
                      8,
                      Math.round((precipMm / maxPrecip) * 100)
                    );
                    return (
                      <div
                        key={MONTHS_SHORT[idx]}
                        className="flex h-full flex-col items-center justify-end gap-1.5"
                      >
                        <span className="font-mono text-[10px] text-[#c9c7c0] tabular-nums">
                          {formatTemp(tempC, units)}
                        </span>
                        <div className="relative flex w-full flex-1 items-end justify-center rounded-lg bg-[#1c1c1c] p-0.5">
                          <div
                            style={{ height: `${barHeightPct}%` }}
                            className="w-full rounded-md bg-[#c6f432] transition-all duration-300"
                          />
                        </div>
                        <span className="font-mono text-[10px] text-[#aaa9ad] tabular-nums">
                          {precipMm}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-white">
                          {MONTHS_SHORT[idx]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Part B: Townhouse.dev Plain-Words Graded Ledger ("What it does") */}
            <div className="border-t border-[#222222] pt-16">
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#aaa9ad]">
                06 / Townhouse Health & 7-Layer Credit Shield
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-[24px] bg-[#121212] p-6 shadow-[inset_0_0_0_1px_#242424]">
                  <div className="flex items-center gap-2 font-mono text-xs text-[#1e9e5a]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#1e9e5a]" />
                    <span>GRADE: OPTIMAL · NREL PVWATTS V8</span>
                  </div>
                  <h3 className="mt-3 text-xl font-medium">
                    Your whole roof & water loop in plain words
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#aaa9ad]">
                    Every solar panel, downspout, cistern liter, and biopore
                    shaft is computed deterministically from your city&apos;s
                    latitude and 10-year ERA5 rainfall.
                  </p>
                </div>

                <div className="rounded-[24px] bg-[#121212] p-6 shadow-[inset_0_0_0_1px_#242424]">
                  <div className="flex items-center gap-2 font-mono text-xs text-[#e9a23b]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#e9a23b]" />
                    <span>GRADE: PROTECTED · $150 META API POOL</span>
                  </div>
                  <h3 className="mt-3 text-xl font-medium">
                    Know before AI credits or cisterns run out
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#aaa9ad]">
                    7-Layer AI Credit Shield locks a $35 Judge Reserve and
                    resolves all 6 Golden Demo Specimens in &lt;50ms at $0.00
                    via SHA-256 + 64-bit dHash caching (${remainingCredit} cap
                    remaining).
                  </p>
                </div>

                <div className="rounded-[24px] bg-[#121212] p-6 shadow-[inset_0_0_0_1px_#242424]">
                  <div className="flex items-center gap-2 font-mono text-xs text-[#2a9dbd]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#2a9dbd]" />
                    <span>GRADE: VERIFIED · ±3% FACT GUARD</span>
                  </div>
                  <h3 className="mt-3 text-xl font-medium">
                    Fixed, proven, and verified in the field
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#aaa9ad]">
                    Council agents are cross-checked against locked SITE_BRIEF
                    metrics, and field actions require Meta SAM 3.1 concept
                    masks before unlocking 3D town structures.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. DOVV STUDIO GIANT ARCHITECTURAL FOOTER (.footer + .hello-text + 4-Cell Grid) */}
      <footer
        className={`w-full overflow-clip pb-28 ${
          isLight ? "bg-[#f5f5f3] text-[#0b0b0b]" : "bg-[#0b0c0e] text-white"
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-4 pt-16 pb-6">
          <Link
            href="/dashboard"
            className="block select-none text-center transition-opacity hover:opacity-85"
          >
            <DovvInteractiveWordmark
              lines={["VERDARA TOWN"]}
              className="text-center text-[18.2vw] leading-[0.85]"
            />
          </Link>
        </div>

        <div
          className={`mx-auto grid max-w-[1440px] grid-cols-1 border-t md:grid-cols-2 xl:grid-cols-4 ${
            isLight ? "border-black/15" : "border-white/15"
          }`}
        >
          {/* Cell 1: Direct Action */}
          <div
            className={`flex flex-col gap-3.5 border-b p-8 xl:border-b-0 xl:border-r ${
              isLight ? "border-black/15" : "border-white/15"
            }`}
          >
            <span className="font-mono text-xs uppercase tracking-[0.12em] opacity-55">
              01 / Interactive Demo Specimen
            </span>
            <p className="text-2xl font-medium tracking-[-0.03em]">
              Menlo Park, California (US-CA · Csb)
            </p>
            <button
              type="button"
              onClick={() => {
                loginAsJudgeDemo();
                router.push("/dashboard");
              }}
              className="zeggo-btn mt-2 inline-flex min-h-[46px] cursor-pointer items-center gap-2 self-start rounded-full bg-[#080808] px-5 text-sm font-medium text-white transition hover:bg-[#222]"
            >
              <ZeggoRollText text="Launch Lv.5 Judge Town ↗" />
            </button>
          </div>

          {/* Cell 2: Spatial Workspaces (Archivo Condensed Uppercase Links) */}
          <div
            className={`flex flex-col gap-3.5 border-b p-8 xl:border-b-0 xl:border-r ${
              isLight ? "border-black/15" : "border-white/15"
            }`}
          >
            <span className="font-mono text-xs uppercase tracking-[0.12em] opacity-55">
              02 / Workspaces
            </span>
            <ul className="flex flex-col gap-2">
              {[
                { href: "/dashboard", label: "LIVING TOWN 3D" },
                { href: "/lens", label: "SAM 3.1 LENS" },
                { href: "/radar", label: "3D ROOF RADAR" },
                { href: "/council", label: "SPECIALIST COUNCIL" },
                { href: "/academy", label: "FIELD PROOFS" },
                { href: "/settings", label: "CREDIT SHIELD" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="dovv-wordmark inline-block text-2xl transition-all hover:pl-2 hover:opacity-65"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cell 3: Scientific Citations */}
          <div
            className={`flex flex-col gap-3.5 border-b p-8 md:border-b-0 xl:border-r ${
              isLight ? "border-black/15" : "border-white/15"
            }`}
          >
            <span className="font-mono text-xs uppercase tracking-[0.12em] opacity-55">
              03 / Physics & AI Stack
            </span>
            <ul className="space-y-1.5 text-sm opacity-80">
              <li>Meta SAM 3.1 Concept Segmentation</li>
              <li>Meta Muse Spark &amp; muse-spark-open</li>
              <li>NREL PVWatts v8 Rooftop Solar Model</li>
              <li>Open-Meteo ERA5 10-Yr Climatology</li>
              <li>Beck et al. (2018) Köppen-Geiger 1km</li>
              <li>US EPA WARM v16 Material Factors</li>
            </ul>
          </div>

          {/* Cell 4: Live Jurisdiction & Status */}
          <div className="flex flex-col justify-between gap-4 p-8">
            <div className="space-y-2">
              <span className="font-mono text-xs uppercase tracking-[0.12em] opacity-55">
                04 / Active Telemetry Node
              </span>
              <p className="dovv-wordmark text-3xl">{geo.city}</p>
              <div className="flex items-center gap-2 text-sm opacity-75">
                <span className="h-2 w-2 rounded-full bg-[#16c847]" />
                <span>
                  {geo.lat.toFixed(2)}°, {geo.lng.toFixed(2)}° · Köppen{" "}
                  {geo.koppen.code}
                </span>
              </div>
            </div>

            <p className="font-mono text-xs opacity-55">
              Verdara Spatial Studio · Zero External GLB · 60 FPS WebGL
            </p>
          </div>
        </div>
      </footer>

      {/* DOVV STUDIO FIXED BOTTOM PILL DOCK WITH ZEGGO ROLL TEXT */}
      <nav
        aria-label={isId ? "Navigasi Utama" : "Primary Navigation"}
        className="dovv-bottom-dock max-w-[96vw] overflow-x-auto"
      >
        {[
          { href: "/", labelEn: "Index", labelId: "Indeks", active: true },
          {
            href: "/dashboard",
            labelEn: "Living Town",
            labelId: "Kota 3D",
            active: false,
          },
          {
            href: "/lens",
            labelEn: "SAM 3.1 Lens",
            labelId: "Lensa SAM 3.1",
            active: false,
          },
          {
            href: "/radar",
            labelEn: "3D Radar",
            labelId: "Radar 3D",
            active: false,
          },
          {
            href: "/council",
            labelEn: "Council",
            labelId: "Dewan AI",
            active: false,
          },
          {
            href: "/academy",
            labelEn: "Field Proofs",
            labelId: "Bukti Aksi",
            active: false,
          },
          {
            href: "/settings",
            labelEn: "Shield",
            labelId: "Perisai",
            active: false,
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`zeggo-btn flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-4 text-xs sm:text-sm font-medium transition ${
              item.active
                ? "bg-[#c6f432] font-semibold text-[#080808]"
                : "text-white hover:bg-[#222222]"
            }`}
          >
            <ZeggoRollText text={isId ? item.labelId : item.labelEn} />
          </Link>
        ))}
      </nav>
    </div>
  );
}
