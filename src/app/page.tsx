"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
  VerdaraLogo,
  ZeggoRollText,
  DovvInteractiveWordmark,
  DovvHoloSticker,
  TownhouseScrollRail,
  CompactWorldCityPicker,
  type ScrollRailChapter,
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

const LANDING_CHAPTERS: ScrollRailChapter[] = [
  { id: "chapter-hero", labelEn: "Overview", labelId: "Ringkasan" },
  { id: "chapter-town", labelEn: "Living Town 3D", labelId: "Kota 3D Hidup" },
  { id: "chapter-slides", labelEn: "5 Climate Decks", labelId: "5 Dek Iklim" },
  { id: "chapter-how", labelEn: "How It Works", labelId: "Cara Kerja" },
  { id: "chapter-tools", labelEn: "4 Core Tools", labelId: "4 Fitur Utama" },
  {
    id: "chapter-climate",
    labelEn: "Weather & Meta AI",
    labelId: "Cuaca & Meta AI",
  },
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

  const pageRef = useRef<HTMLDivElement | null>(null);
  const domeRef = useRef<SVGSVGElement | null>(null);

  const isId = locale === "id";
  const isLight = theme === "light";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const idx = CITY_SPECIMENS.findIndex((c) => c.id === activePresetId);
    if (idx !== -1) {
      setActiveSlide(idx);
    }
  }, [activePresetId]);

  // GSAP + ScrollTrigger Choreographed Page Animations
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced || !pageRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Hero entrance stagger
      gsap.fromTo(
        ".gsap-hero-item",
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.09,
          ease: "power3.out",
          clearProps: "transform,opacity",
        }
      );

      // 2. 3D Living Town Stage scroll-linked scale & lift
      gsap.fromTo(
        ".gsap-town-stage",
        { scale: 0.94, y: 36 },
        {
          scale: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#chapter-town",
            start: "top 88%",
            end: "top 25%",
            scrub: 0.5,
          },
        }
      );

      // 3. Section headings reveal
      gsap.utils.toArray<HTMLElement>(".gsap-section-heading").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 86%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // 4. Slide deck frame entrance
      gsap.fromTo(
        ".gsap-slide-frame",
        { y: 40, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#chapter-slides",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // 5. Zeggo Sticky-Left + Scrolling-Right step cards
      gsap.utils.toArray<HTMLElement>(".gsap-step-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 42, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            delay: i * 0.05,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // 6. Zeggo 12-Column Diagonal Staircase Cascade
      gsap.fromTo(
        ".gsap-stair-card",
        { y: 36, x: -16, opacity: 0 },
        {
          y: 0,
          x: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: "back.out(1.25)",
          scrollTrigger: {
            trigger: ".gsap-stair-grid",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // 7. 4 Core Bento Workspace Cards
      gsap.fromTo(
        ".gsap-bento-card",
        { y: 46, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.75,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#chapter-tools",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // 8. DOVV Studio Curved SVG Dome scrub
      if (domeRef.current) {
        gsap.fromTo(
          domeRef.current,
          { scaleY: 0.25 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: "#chapter-climate",
              start: "top 95%",
              end: "top 35%",
              scrub: 0.4,
            },
          }
        );
      }

      // 9. 12-Month ERA5 Rainfall Bars growth
      gsap.fromTo(
        ".gsap-era5-bar",
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: "bottom center",
          duration: 0.7,
          stagger: 0.04,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: ".gsap-era5-chart",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // 10. Meta Hackathon Judging Cards stagger
      gsap.fromTo(
        ".gsap-judge-card",
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".gsap-judge-grid",
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const maxPrecip = Math.max(...geo.monthlyPrecipMm, 100);
  const remainingCredit = (
    aiShield.lifetimeCapUsd - aiShield.totalSpendUsd
  ).toFixed(2);

  // Plain-language Townhouse.dev "Watch it Run, Break, and Heal" simulation states
  const simConfig = {
    run: {
      badge1: {
        dot: "bg-[#1e9e5a]",
        text: "text-[#14733f]",
        label: isId ? "SURYA ATAP AMAN" : "SOLAR ROOF OK",
      },
      badge2: {
        dot: "bg-[#2a9dbd]",
        text: "text-[#146f8a]",
        label: isId ? "ALIRAN AIR LANCAR" : "WATER FLOW STEADY",
      },
      badge3: {
        dot: "bg-[#1e9e5a]",
        text: "text-[#14733f]",
        label: isId
          ? `KENYAMANAN ${housingCalc.thermal.tciScore}/100`
          : `COMFORT ${housingCalc.thermal.tciScore}/100`,
      },
      title: isId
        ? "Seluruh potensi rumah Anda terlihat jelas dalam satu gambar."
        : "Your whole home's energy and water in one clear picture.",
      desc: isId
        ? `Atap seluas ${formatArea(
            housingCalc.footprintM2,
            units,
            locale
          )} di ${geo.city} menghasilkan listrik surya ${
            housingCalc.solar.kwp
          } kWp (hemat ${formatCurrency(
            housingCalc.solar.savingsYear,
            housingCalc.solar.currency,
            locale
          )}/tahun) dan menampung ${formatVolume(
            housingCalc.rainwater.litersYear,
            units,
            locale
          )} air hujan bersih setiap tahun.`
        : `A ${formatArea(
            housingCalc.footprintM2,
            units,
            locale
          )} roof in ${geo.city} generates ${
            housingCalc.solar.kwp
          } kWp of solar power (saving ${formatCurrency(
            housingCalc.solar.savingsYear,
            housingCalc.solar.currency,
            locale
          )}/yr) and collects ${formatVolume(
            housingCalc.rainwater.litersYear,
            units,
            locale
          )} of free rainwater every year.`,
    },
    break: {
      badge1: {
        dot: "bg-[#e5484d]",
        text: "text-[#b8252a]",
        label: isId ? "RAWAN BANJIR TALANG" : "OVERFLOW WARNING",
      },
      badge2: {
        dot: "bg-[#e9a23b]",
        text: "text-[#8a5608]",
        label: isId ? "ATAP TERLALU PANAS" : "ROOF HEAT SPIKE",
      },
      badge3: {
        dot: "bg-[#e5484d]",
        text: "text-[#b8252a]",
        label: isId
          ? `PUNCAK HUJAN ${maxPrecip} MM`
          : `PEAK ${maxPrecip} MM STORM`,
      },
      title: isId
        ? "Ketahui titik masalah sebelum air meluap atau tagihan listrik naik."
        : "Spot what overflows or overheats before it costs you money.",
      desc: isId
        ? `Saat puncak hujan ${maxPrecip} mm/bulan di ${geo.city}: tanpa ${housingCalc.infiltration.bioporeUnits} lubang resapan biopori dan tangki air ${housingCalc.rainwater.recommendedCisternLiters}L, air hujan terbuang ke jalan dan suhu atap naik +4.2°C.`
        : `During a ${maxPrecip} mm/month storm in ${geo.city}: without ${housingCalc.infiltration.bioporeUnits} biopore soak pits and a ${housingCalc.rainwater.recommendedCisternLiters}L tank, rainwater floods the street and roof heat spikes by +4.2°C.`,
    },
    heal: {
      badge1: {
        dot: "bg-[#1e9e5a]",
        text: "text-[#14733f]",
        label: isId ? "DIPINDAI META SAM 3.1" : "SCANNED BY META SAM 3.1",
      },
      badge2: {
        dot: "bg-[#2a9dbd]",
        text: "text-[#146f8a]",
        label: isId
          ? `+${housingCalc.infiltration.bioporeUnits} BIOPORI AKTIF`
          : `+${housingCalc.infiltration.bioporeUnits} BIOPORES ACTIVE`,
      },
      badge3: {
        dot: "bg-[#1e9e5a]",
        text: "text-[#14733f]",
        label: isId ? "DISETUJUI 3 PAKAR AI" : "3 AI EXPERTS VERIFIED",
      },
      title: isId
        ? "Dipindai dengan kamera AI, dihitung otomatis, dan langsung terpasang."
        : "Scanned by AI camera, calculated accurately, and ready to build.",
      desc: isId
        ? `Kamera Meta SAM 3.1 menandai posisi ${housingCalc.solar.panelCountEst} panel surya dan jalur pipa ke tangki ${housingCalc.rainwater.recommendedCisternLiters}L. Tiga pakar AI (Meta Muse Spark) memastikan Anda menghemat ${formatCurrency(
            housingCalc.solar.savingsYear,
            housingCalc.solar.currency,
            locale
          )}/tahun.`
        : `Meta SAM 3.1 outlines where ${housingCalc.solar.panelCountEst} solar panels and pipes connect to a ${housingCalc.rainwater.recommendedCisternLiters}L tank. Three Meta Muse Spark experts verify ${formatCurrency(
            housingCalc.solar.savingsYear,
            housingCalc.solar.currency,
            locale
          )}/yr in household savings.`,
    },
  }[townSimMode];

  return (
    <div
      ref={pageRef}
      className={`min-h-screen overflow-x-clip transition-colors duration-300 ${
        isLight
          ? "bg-[#f5f5f3] text-[#111111]"
          : "bg-[#0b0c0e] text-[#f2f1ec]"
      }`}
    >
      {/* TOWNHOUSE.DEV RIGHT CHAPTER SCROLL RAIL + TOP PROGRESS BAR */}
      <TownhouseScrollRail
        chapters={LANDING_CHAPTERS}
        isLight={isLight}
        isId={isId}
      />

      {/* 1. DOVV STUDIO SINGLE-LINE TOP CHROME + COMPACT CITY/COUNTRY PICKER */}
      <header className="mx-auto flex max-w-[1440px] flex-nowrap items-center justify-between gap-2 px-4 pt-5 pb-2 sm:px-10 sm:pt-6">
        <div className="flex min-w-0 shrink-0 items-center gap-2.5">
          <Link
            href="/"
            className="flex min-h-[42px] shrink-0 items-center gap-2"
            aria-label="Verdara Home"
          >
            <VerdaraLogo size={38} />
            <span className="dovv-wordmark text-2xl sm:text-[28px] tracking-tight">
              VERDARA
            </span>
          </Link>

          {/* Single-Row Quick City Switcher + Compact 195+ Countries Popover */}
          <div
            role="group"
            aria-label={isId ? "Pilih Kota" : "Select City"}
            className="hidden items-center gap-1 rounded-full bg-[#080808] p-1 shadow-[inset_0_0_0_1px_#262626] xl:flex"
          >
            {CITY_SPECIMENS.map((c, idx) => {
              const active =
                activePresetId === c.id &&
                geo.city.toLowerCase().includes(c.label.toLowerCase());
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    teleportToCity(c.id);
                    setActiveSlide(idx);
                  }}
                  className={`min-h-[34px] cursor-pointer rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition ${
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
            <CompactWorldCityPicker
              isLight={isLight}
              isId={isId}
              variant="header"
              align="left"
            />
          </div>
        </div>

        {/* Right Controls + DOVV Notch Trigger + Zeggo Roll CTA (Single Row, Never Wraps) */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setLocale(locale === "en" ? "id" : "en")}
            className={`min-h-[40px] shrink-0 cursor-pointer rounded-full px-3 text-xs font-semibold whitespace-nowrap transition ${
              isLight
                ? "bg-white text-[#111] shadow-[0_0_0_1px_rgba(0,0,0,0.1)] hover:bg-[#eee]"
                : "bg-[#16181c] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
            }`}
          >
            {locale === "id" ? "ID" : "EN"}
          </button>
          <button
            type="button"
            onClick={() =>
              setUnits(units === "metric" ? "imperial" : "metric")
            }
            className={`hidden min-h-[40px] shrink-0 cursor-pointer items-center rounded-full px-3 text-xs font-medium whitespace-nowrap transition sm:inline-flex ${
              isLight
                ? "bg-white text-[#111] shadow-[0_0_0_1px_rgba(0,0,0,0.1)] hover:bg-[#eee]"
                : "bg-[#16181c] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
            }`}
          >
            {units === "metric" ? "Metric (m²)" : "Imperial (ft²)"}
          </button>
          <button
            type="button"
            onClick={() => setTheme(isLight ? "dark" : "light")}
            className={`min-h-[40px] shrink-0 cursor-pointer rounded-full px-3 text-xs font-medium whitespace-nowrap transition ${
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
            className="zeggo-btn hidden min-h-[40px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-[#080808] px-3.5 text-xs font-medium whitespace-nowrap text-white shadow-[inset_0_0_0_2px_#2c2c2c] transition hover:bg-[#1a1a1a] lg:flex"
          >
            <span className="h-2 w-2 rounded-full bg-[#c6f432]" />
            <ZeggoRollText
              text={
                headerNotchOpen
                  ? isId
                    ? "Tutup"
                    : "Close"
                  : isId
                  ? "Info Juri (03)"
                  : "Judge Brief (03)"
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
            className="zeggo-btn group flex min-h-[40px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-[#080808] px-4 text-xs sm:text-sm font-medium whitespace-nowrap text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] transition hover:bg-[#222]"
          >
            <ZeggoRollText
              text={isId ? "Buka Kota 3D" : "Open Living Town"}
            />
            <svg
              width="14"
              height="14"
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
        <div className="mx-auto mt-3 max-w-[1440px] px-4 sm:px-10">
          <div className="ml-auto max-w-[680px] rounded-[34px] bg-[#080808] p-5 text-white shadow-[inset_0_0_0_2px_#2c2c2c,0_24px_60px_-12px_rgba(0,0,0,0.65)]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="flex flex-col justify-between space-y-3 sm:col-span-5">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#aaa9ad]">
                    META HACKATHON · LIVE NODE
                  </span>
                  <p className="mt-1 font-sans text-lg font-medium text-white">
                    {geo.city} ({geo.countryCode} · {geo.koppen.code})
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
                        01 / Meta SAM 3.1 Camera Scanner
                      </p>
                      <p className="text-[11px] leading-relaxed text-[#aaa9ad]">
                        {isId
                          ? "Memindai foto atap, talang air, halaman, dan botol/kaleng daur ulang secara otomatis dengan masker poligon presisi."
                          : "Automatically outlines roof space for solar panels, gutters for rain tanks, and bottles/cans for recycling cash."}
                      </p>
                    </div>
                    <div className="w-full shrink-0 space-y-1">
                      <p className="text-xs font-semibold text-white">
                        02 / Real Solar & Rainwater Math
                      </p>
                      <p className="text-[11px] leading-relaxed text-[#aaa9ad]">
                        {isId
                          ? `Menghitung ${housingCalc.solar.kwp} kWp listrik surya dan ${formatVolume(
                              housingCalc.rainwater.litersYear,
                              units,
                              locale
                            )} panen air hujan untuk ${geo.city}.`
                          : `Calculates ${housingCalc.solar.kwp} kWp solar output and ${formatVolume(
                              housingCalc.rainwater.litersYear,
                              units,
                              locale
                            )} rainwater harvest for ${geo.city}.`}
                      </p>
                    </div>
                    <div className="w-full shrink-0 space-y-1">
                      <p className="text-xs font-semibold text-white">
                        03 / Meta Muse Spark 3-Expert Council
                      </p>
                      <p className="text-[11px] leading-relaxed text-[#aaa9ad]">
                        {isId
                          ? "Tiga pakar AI (Botani, Arsitek Surya, Ekonomi Sirkular) menyusun rencana aksi rumah Anda tanpa mengarang angka."
                          : "Three AI specialists (Botanist, Solar Architect, Circular Economist) build your home plan with zero fake numbers."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CHAPTER 01: DOVV STUDIO HERO SECTION WITH COMPACT CITY/COUNTRY POPOVER */}
      <section
        id="chapter-hero"
        className="scroll-mt-20 mx-auto flex max-w-[1440px] flex-col items-center px-4 pt-6 pb-9 text-center sm:px-10 sm:pt-12"
      >
        {/* Compact Country & City Popover Pill (Small, Simple, Zero Page Clutter) */}
        <div className="gsap-hero-item relative z-30">
          <CompactWorldCityPicker
            isLight={isLight}
            isId={isId}
            variant="hero"
            align="center"
          />
        </div>

        {/* Giant Interactive Variable Display Wordmark + DOVV Draggable Holographic Foil Stickers */}
        <div className="gsap-hero-item relative mt-6 sm:mt-7 flex w-full max-w-[1240px] flex-col items-center justify-center">
          <h1 className="sr-only">
            {isId
              ? "Verdara: Ubah rumah dan lingkungan Anda menjadi kota hijau 3D. Hitung panel surya, panen air hujan, dan nilai daur ulang di kota mana pun di dunia dengan Meta SAM 3.1 dan Muse Spark."
              : "Verdara: Turn your home and neighborhood into a 3D living eco-town. Measure rooftop solar, rainwater harvest, and recycling value in any city on Earth with Meta SAM 3.1 and Muse Spark."}
          </h1>

          {/* Draggable Holo Sticker 1: Top-Left Orange */}
          <DovvHoloSticker
            label="Meta SAM 3.1 + Muse Spark"
            sublabel="Drag Sticker"
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
            sublabel={`${geo.city} (${geo.countryCode})`}
            variant="lime"
            rotationDeg={9}
            className="absolute -top-6 right-2 z-20 hidden md:block lg:right-8"
          />

          {/* Draggable Holo Sticker 3: Bottom-Right Gold */}
          <DovvHoloSticker
            label="195+ Countries · Real Physics"
            sublabel="NREL PVWatts · ERA5 Weather"
            variant="gold"
            rotationDeg={-6}
            className="absolute -bottom-6 right-6 z-20 hidden lg:block"
          />

          {/* DOVV Studio Cursor-Proximity Variable Font Wave Wordmark */}
          <DovvInteractiveWordmark
            lines={
              isId
                ? ["LIHAT KOTA HIJAU", "HIDUP MILIK ANDA"]
                : ["SEE INSIDE YOUR", "LIVING ECO-TOWN"]
            }
            className="text-center text-[clamp(42px,12.2vw,178px)] tracking-tight"
          />
        </div>

        {/* Plain-Language Subtitle & Zeggo Character-Roll Pill Buttons */}
        <p
          className={`gsap-hero-item mt-5 sm:mt-6 max-w-[680px] px-2 text-sm sm:text-lg leading-[1.55] tracking-[-0.015em] ${
            isLight ? "text-[#4b4b48]" : "text-[#c9c7c0]"
          }`}
        >
          {isId
            ? "Pilih kota Anda di atas atau foto rumah Anda. Verdara menggambar rumah Anda sebagai kota 3D yang hidup, menghitung berapa listrik surya, air hujan, dan uang daur ulang yang bisa Anda hemat, lalu memandu perbaikannya bersama 3 pakar AI Meta."
            : "Pick any city above or snap a photo of your home. Verdara draws your plot as a living 3D town, calculates exactly how much solar power, rainwater, and recycling cash you can save, and guides your upgrades with 3 Meta AI specialists."}
        </p>

        <div className="gsap-hero-item mt-6 sm:mt-7 flex w-full sm:w-auto flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 px-2">
          <button
            type="button"
            onClick={() => {
              loginAsJudgeDemo();
              router.push("/dashboard");
            }}
            className="zeggo-btn flex min-h-[48px] cursor-pointer items-center justify-center rounded-full bg-[#080808] px-7 text-sm sm:text-[15px] font-medium text-white transition hover:bg-[#222222]"
          >
            <ZeggoRollText
              text={
                isId
                  ? "Buka Kota Hidup 3D (Demo Juri Lv.5)"
                  : "Enter 3D Living Town (Lv.5 Judge Demo)"
              }
            />
          </button>

          <Link
            href="/lens"
            className={`zeggo-btn flex min-h-[48px] items-center justify-center rounded-full px-6 text-sm sm:text-[15px] font-medium transition ${
              isLight
                ? "text-[#111] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.22)] hover:shadow-[inset_0_0_0_1px_#000]"
                : "text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)] hover:shadow-[inset_0_0_0_1px_#fff]"
            }`}
          >
            <ZeggoRollText
              text={
                isId
                  ? "Pindai Foto dengan Meta SAM 3.1"
                  : "Scan Photo with Meta SAM 3.1"
              }
            />
          </Link>
        </div>

        {/* ZEGGO.COM.SG SIGNATURE SCROLL INDICATOR LINE (.zeggo-scroll-indicator) */}
        <div className="gsap-hero-item mt-7 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] opacity-65">
          <span>
            {isId
              ? "Gulir halaman atau putar kota 3D di bawah"
              : "Scroll page or orbit the 3D town below"}
          </span>
          <span className="zeggo-scroll-indicator" aria-hidden="true" />
        </div>
      </section>

      {/* 3. CHAPTER 02: TOWNHOUSE.DEV "WATCH IT RUN, BREAK, AND HEAL" LIVE 3D STAGE */}
      <section
        id="chapter-town"
        className="scroll-mt-20 mx-auto max-w-[1440px] px-3 sm:px-10"
      >
        <div className="gsap-town-stage dovv-stage-frame h-[620px] w-full sm:h-[680px] lg:h-[720px]">
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
          <div className="absolute top-3 left-3 right-3 sm:right-auto sm:top-4 sm:left-4 z-10 flex flex-wrap items-center gap-1 rounded-2xl sm:rounded-full bg-[#080808]/90 p-1.5 backdrop-blur-md shadow-lg">
            {(
              [
                {
                  id: "run",
                  labelEn: "01 Normal Day (Run)",
                  labelId: "01 Hari Normal",
                  dot: "bg-[#1e9e5a]",
                },
                {
                  id: "break",
                  labelEn: "02 Storm Surge (Break)",
                  labelId: "02 Uji Badai & Panas",
                  dot: "bg-[#e5484d]",
                },
                {
                  id: "heal",
                  labelEn: "03 AI Solution (Heal)",
                  labelId: "03 Solusi AI Meta",
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
                  className={`flex min-h-[34px] flex-1 sm:flex-initial justify-center cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] sm:text-xs font-medium transition ${
                    active
                      ? "bg-white font-semibold text-[#111]"
                      : "text-[#c9c7c0] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${tab.dot}`} />
                  <span className="truncate">
                    {isId ? tab.labelId : tab.labelEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Top-Right Lighting & Biome Pill inside Stage */}
          <div className="absolute top-4 right-4 z-10 hidden flex-wrap items-center gap-2 lg:flex">
            <span className="rounded-full bg-[#080808]/90 px-3.5 py-1.5 font-mono text-xs font-medium text-white backdrop-blur-md">
              {geo.city} ({geo.countryCode}) · {geo.koppen.code} (
              {geo.biome.toUpperCase()})
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
            className={`absolute bottom-3 left-3 right-3 z-10 rounded-[18px] border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 sm:right-auto sm:bottom-6 sm:left-6 sm:w-[min(540px,48vw)] sm:p-6 ${
              isLight
                ? "border-[#151515]/10 bg-white/95 text-[#151515]"
                : "border-white/10 bg-[#16171a]/95 text-[#f2f1ec]"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2.5 font-mono text-[10px] sm:text-[11px]">
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

            <h2 className="townhouse-title mt-2 text-xl sm:text-3xl lg:text-4xl">
              {simConfig.title}
            </h2>

            <p
              className={`mt-1.5 text-xs sm:text-sm leading-relaxed ${
                isLight ? "text-[#4b4b48]" : "text-[#c9c7c0]"
              }`}
            >
              {simConfig.desc}
            </p>

            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <Link
                href="/dashboard"
                className={`zeggo-btn inline-flex min-h-[42px] items-center rounded-[10px] px-4 text-xs sm:text-sm font-medium transition ${
                  isLight
                    ? "bg-[#151515] text-[#f6f6f3] hover:bg-[#2a2a2a]"
                    : "bg-[#f2f1ec] text-[#0f1012] hover:bg-white"
                }`}
              >
                <ZeggoRollText
                  text={
                    isId ? "Buka Dasbor Kota 3D" : "Inspect Full Living Town"
                  }
                />
              </Link>
              <Link
                href="/radar"
                className="zeggo-btn inline-flex min-h-[42px] items-center rounded-[10px] border border-current/20 px-3.5 text-xs sm:text-sm font-medium"
              >
                <ZeggoRollText
                  text={isId ? "Atur Luas Atap Rumah" : "Adjust Roof Size"}
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CHAPTER 03: DOVV STUDIO 01/05 INTERACTIVE HORIZONTAL SLIDE DECK CAROUSEL */}
      <section
        id="chapter-slides"
        className="scroll-mt-20 mx-auto max-w-[1440px] px-4 pt-20 pb-12 sm:px-10"
      >
        <div className="gsap-section-heading flex flex-wrap items-end justify-between gap-4 pb-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] opacity-60">
              {isId
                ? "01 / Bandingkan 5 Zona Iklim Utama Dunia"
                : "01 / Compare 5 Benchmark Climate Zones"}
            </p>
            <h2 className="mt-2 text-[clamp(28px,4.2vw,58px)] font-normal leading-[1.06] tracking-[-0.04em]">
              {isId
                ? "Geser kartu untuk melihat bagaimana cuaca memengaruhi rumah Anda."
                : "Slide through 5 climate zones to see how local weather shapes a home."}
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
              className="flex h-11 w-11 sm:h-12 sm:w-12 cursor-pointer items-center justify-center rounded-full bg-[#080808] text-white transition hover:scale-105 hover:bg-[#222]"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveSlide((s) => (s + 1) % CITY_SPECIMENS.length)
              }
              aria-label="Next city specimen slide"
              className="flex h-11 w-11 sm:h-12 sm:w-12 cursor-pointer items-center justify-center rounded-full bg-[#080808] text-white transition hover:scale-105 hover:bg-[#222]"
            >
              →
            </button>
          </div>
        </div>

        {/* Horizontal Slide Viewport */}
        <div className="gsap-slide-frame overflow-hidden rounded-[28px] sm:rounded-[32px] bg-[#080808] p-5 sm:p-10 text-white shadow-[inset_0_0_0_2px_#262626]">
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
                  className="w-full shrink-0 pr-1 sm:pr-4"
                  aria-hidden={activeSlide !== idx}
                >
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
                    <div className="space-y-4 lg:col-span-6">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                        <span className="rounded-full bg-[#c6f432] px-3 py-1 font-bold text-[#080808]">
                          ZONE 0{idx + 1} · {spec.iso}
                        </span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-white">
                          {preset.koppen.code} ({preset.koppen.nameEn})
                        </span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-[#c6f432]">
                          {preset.biome.toUpperCase()}
                        </span>
                      </div>

                      <h3 className="dovv-wordmark text-4xl sm:text-7xl text-white">
                        {preset.city}
                      </h3>

                      <p className="max-w-xl text-xs sm:text-base leading-relaxed text-[#c9c7c0]">
                        {isId
                          ? preset.koppen.descriptionId
                          : preset.koppen.descriptionEn}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => teleportToCity(spec.id)}
                          className={`zeggo-btn inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full px-5 sm:px-6 text-xs sm:text-sm font-semibold transition ${
                            isCurrent
                              ? "bg-[#c6f432] text-[#080808]"
                              : "bg-white text-[#080808] hover:bg-[#c6f432]"
                          }`}
                        >
                          <ZeggoRollText
                            text={
                              isCurrent
                                ? isId
                                  ? `Sedang Aktif (${preset.city})`
                                  : `Currently Active (${preset.city})`
                                : isId
                                ? `Terapkan Kota ${preset.city}`
                                : `Load ${preset.city} in 3D Town`
                            }
                          />
                        </button>
                        <Link
                          href="/radar"
                          onClick={() => teleportToCity(spec.id)}
                          className="zeggo-btn inline-flex min-h-[44px] items-center rounded-full border border-white/25 px-5 text-xs sm:text-sm font-medium text-white hover:bg-white/10"
                        >
                          <ZeggoRollText
                            text={
                              isId ? "Lihat di Peta 3D" : "View on 3D Map"
                            }
                          />
                        </Link>
                      </div>
                    </div>

                    {/* Right Telemetry Cards inside Slide */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-6">
                      <div className="th-node-card rounded-2xl bg-[#141619] p-4 sm:p-5 pl-6 shadow-[inset_0_0_0_1px_#2a2d34]">
                        <span className="th-map-bar bg-[#c6f432]" />
                        <span className="font-mono text-[11px] text-[#aaa9ad]">
                          {isId ? "LISTRIK PANEL SURYA" : "ROOFTOP SOLAR POWER"}
                        </span>
                        <p className="mt-1 font-mono text-2xl sm:text-3xl font-bold text-[#c6f432]">
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

                      <div className="th-node-card rounded-2xl bg-[#141619] p-4 sm:p-5 pl-6 shadow-[inset_0_0_0_1px_#2a2d34]">
                        <span className="th-map-bar bg-[#2a9dbd]" />
                        <span className="font-mono text-[11px] text-[#aaa9ad]">
                          {isId ? "PANEN AIR HUJAN" : "RAINWATER CAPTURED"}
                        </span>
                        <p className="mt-1 font-mono text-2xl sm:text-3xl font-bold text-cyan-300">
                          {formatVolume(
                            calc.rainwater.litersYear,
                            units,
                            locale
                          )}
                        </p>
                        <p className="mt-1 font-mono text-xs text-[#c9c7c0]">
                          {preset.koppen.pAnnMm} mm/yr · Tank{" "}
                          {calc.rainwater.recommendedCisternLiters}L
                        </p>
                      </div>

                      <div className="th-node-card rounded-2xl bg-[#141619] p-4 sm:p-5 pl-6 shadow-[inset_0_0_0_1px_#2a2d34]">
                        <span className="th-map-bar bg-[#e9a23b]" />
                        <span className="font-mono text-[11px] text-[#aaa9ad]">
                          {isId ? "KENYAMANAN SUHU" : "THERMAL COMFORT"}
                        </span>
                        <p className="mt-1 font-mono text-2xl sm:text-3xl font-bold text-amber-300">
                          {calc.thermal.tciScore}/100
                        </p>
                        <p className="mt-1 font-mono text-xs text-[#c9c7c0]">
                          {formatTemp(preset.currentTempC, units)} · Cool Roof -
                          {calc.thermal.coolingTargetDegC}°C
                        </p>
                      </div>

                      <div className="th-node-card rounded-2xl bg-[#141619] p-4 sm:p-5 pl-6 shadow-[inset_0_0_0_1px_#2a2d34]">
                        <span className="th-map-bar bg-[#1e9e5a]" />
                        <span className="font-mono text-[11px] text-[#aaa9ad]">
                          {isId ? "TITIK DAUR ULANG" : "RECYCLING DROP-OFFS"}
                        </span>
                        <p className="mt-1 font-mono text-2xl sm:text-3xl font-bold text-white">
                          {preset.hubs.length} Hubs
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
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {CITY_SPECIMENS.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`min-h-[36px] cursor-pointer rounded-full px-3 sm:px-3.5 text-xs font-mono transition ${
                    activeSlide === idx
                      ? "bg-[#c6f432] font-bold text-[#080808]"
                      : "bg-white/10 text-[#c9c7c0] hover:bg-white/20"
                  }`}
                >
                  0{idx + 1} {c.label}
                </button>
              ))}
            </div>
            <span className="font-mono text-[11px] text-[#aaa9ad]">
              {isId
                ? "Klik panah ← → untuk berpindah zona iklim"
                : "Click ← → arrows to compare climate zones"}
            </span>
          </div>
        </div>
      </section>

      {/* 5. CHAPTER 04: ZEGGO.COM.SG STICKY-LEFT + SCROLLING-RIGHT SUBGRID & STAIRCASE CASCADE */}
      <section
        id="chapter-how"
        className="scroll-mt-20 mx-auto max-w-[1440px] px-4 py-16 sm:px-10 sm:py-20"
      >
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="gsap-section-heading md:sticky md:top-24 space-y-4">
              <p className="font-mono text-xs uppercase tracking-[0.12em] opacity-60">
                {isId
                  ? "02 / Cara Kerja yang Mudah Dipahami"
                  : "02 / How Verdara Works in Plain Words"}
              </p>
              <h2 className="text-[clamp(30px,4.2vw,56px)] font-normal leading-[1.06] tracking-[-0.04em]">
                {isId ? (
                  <>
                    Bukan sekadar chatbot AI, tetapi{" "}
                    <span className="text-[#1e9e5a]">kalkulator nyata</span>{" "}
                    yang melihat rumah Anda.
                  </>
                ) : (
                  <>
                    Not just another AI chat, but{" "}
                    <span className="text-[#1e9e5a]">real home math</span>{" "}
                    powered by computer vision.
                  </>
                )}
              </h2>
              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isLight ? "text-[#4b4b48]" : "text-[#c9c7c0]"
                }`}
              >
                {isId
                  ? "Kebanyakan aplikasi AI hanya menebak angka. Di Verdara, model kamera Meta SAM 3.1 mengenali objek nyata di foto Anda, lalu rumus fisika menghitung penghematan listrik, air, dan uang secara akurat sebelum dijelaskan oleh 3 pakar AI Meta Muse Spark."
                  : "Most AI tools guess numbers. In Verdara, Meta SAM 3.1 camera vision finds real objects in your photo, physics formulas calculate your exact solar, water, and cash savings, and 3 Meta Muse Spark specialists explain your step-by-step plan."}
              </p>
            </div>
          </div>

          <div className="space-y-5 md:col-span-6 md:col-start-7">
            {[
              {
                num: "01",
                barColor: "bg-[#1e9e5a]",
                titleEn: "Step 1: Meta SAM 3.1 Sees Your Roof & Recyclables",
                titleId:
                  "Langkah 1: Kamera Meta SAM 3.1 Mengenali Atap & Barang Daur Ulang",
                highlightEn: "Zero-Shot Object Outlines",
                highlightId: "Deteksi Objek Otomatis",
                bodyEn:
                  "Upload a photo or pick a sample. Meta SAM 3.1 automatically draws precise outlines around roof areas for solar panels, gutters for rain tanks, and plastic/aluminum/e-waste items you can trade for cash.",
                bodyId:
                  "Unggah foto atau pilih contoh. Meta SAM 3.1 otomatis menggambar garis batas pada atap untuk panel surya, pipa talang untuk tangki hujan, serta botol plastik/kaleng yang bisa ditukar uang.",
                href: "/lens",
              },
              {
                num: "02",
                barColor: "bg-[#2a9dbd]",
                titleEn: "Step 2: Real Weather & Solar Math for Your Country",
                titleId: "Langkah 2: Hitungan Surya & Air Hujan Sesuai Negara Anda",
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
                  "Using official NREL solar equations and 10-year ERA5 rainfall records for your city, Verdara computes how many kWh of electricity and liters of rainwater your roof can harvest in local currency.",
                bodyId:
                  "Menggunakan rumus surya resmi NREL dan data curah hujan 10 tahun di kota Anda, Verdara menghitung berapa kWh listrik dan liter air hujan yang bisa dipanen beserta nilai hematnya dalam mata uang lokal.",
                href: "/radar",
              },
              {
                num: "03",
                barColor: "bg-[#e9a23b]",
                titleEn: "Step 3: 3 Meta Muse Spark Experts Build Your Plan",
                titleId:
                  "Langkah 3: 3 Pakar AI Meta Muse Spark Menyusun Rencana Anda",
                highlightEn: "Dr. Flora, Ir. Arka & Sirkula",
                highlightId: "Dr. Flora, Ir. Arka & Sirkula",
                bodyEn:
                  "Three AI specialists (an Urban Botanist, a Solar & Water Engineer, and a Circular Economist) debate your home's data and give you a practical action plan verified within ±3% accuracy.",
                bodyId:
                  "Tiga spesialis AI (Ahli Botani Kota, Insinyur Surya & Air, serta Ekonom Sirkular) membahas data rumah Anda dan menyusun langkah praktis yang terjamin akurat tanpa mengarang angka.",
                href: "/council",
              },
            ].map((item) => (
              <div
                key={item.num}
                className={`gsap-step-card th-node-card border p-6 pl-7 sm:p-7 sm:pl-8 ${
                  isLight
                    ? "border-black/10 bg-white shadow-sm"
                    : "border-white/10 bg-[#141619]"
                }`}
              >
                <span className={`th-map-bar ${item.barColor}`} />
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                  <span className="rounded-full bg-[#080808] px-3 py-1 font-bold text-[#c6f432]">
                    STEP {item.num}
                  </span>
                  <span className="font-semibold text-[#1e9e5a]">
                    {isId ? item.highlightId : item.highlightEn}
                  </span>
                </div>
                <h3 className="mt-3.5 text-xl sm:text-2xl font-medium tracking-[-0.03em]">
                  {isId ? item.titleId : item.titleEn}
                </h3>
                <p
                  className={`mt-2 text-xs sm:text-sm leading-relaxed ${
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
                      isId ? "Coba Fitur Ini Sekarang →" : "Try This Tool Now →"
                    }
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Zeggo.com.sg 12-Column Diagonal Staircase Cascade */}
        <div className="mt-16 sm:mt-20">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.12em] opacity-60">
            {isId
              ? "03 / Alur 4 Langkah dari Foto ke Kota 3D"
              : "03 / 4-Step Journey from Photo to Living 3D Town"}
          </p>
          <div className="gsap-stair-grid grid grid-cols-1 gap-4 md:grid-cols-12">
            {[
              {
                step: "01",
                colClass: "md:col-start-1 md:col-span-3",
                title: isId ? "1. Pilih Kota Dunia" : "1. Pick Any World City",
                detail: `${geo.city} (${geo.countryCode} · ${geo.koppen.code})`,
              },
              {
                step: "02",
                colClass: "md:col-start-4 md:col-span-3 md:mt-8",
                title: isId ? "2. Pindai Kamera SAM 3.1" : "2. Scan with SAM 3.1",
                detail: `${housingCalc.solar.panelCountEst} Solar Panels · ${housingCalc.rainwater.recommendedCisternLiters}L Tank`,
              },
              {
                step: "03",
                colClass: "md:col-start-7 md:col-span-3 md:mt-16",
                title: isId ? "3. Tanya 3 Pakar AI" : "3. Ask 3 AI Specialists",
                detail: `Meta Muse Spark + Open-Weight`,
              },
              {
                step: "04",
                colClass: "md:col-start-10 md:col-span-3 md:mt-24",
                title: isId ? "4. Bangun Kota 3D Anda" : "4. Grow Your 3D Town",
                detail: `Camera Proof · Level ${level} Eco-Town`,
              },
            ].map((st) => (
              <div
                key={st.step}
                className={`${st.colClass} gsap-stair-card th-node-card rounded-[24px] bg-[#080808] p-5 sm:p-6 pl-6 text-white shadow-[inset_0_0_0_1.5px_#262626]`}
              >
                <span className="th-map-bar bg-[#c6f432]" />
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

      {/* 6. CHAPTER 05: DOVV STUDIO 2-COLUMN WORK / CAPABILITY BENTO GRID */}
      <section
        id="chapter-tools"
        className="scroll-mt-20 mx-auto max-w-[1440px] px-4 pt-6 pb-24 sm:px-10"
      >
        <div className="gsap-section-heading flex flex-col items-start justify-between gap-4 pb-10 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] opacity-60">
              {isId
                ? "04 / Empat Alat Utama Verdara"
                : "04 / Four Interactive Tools Ready to Try"}
            </p>
            <h2 className="mt-2 text-[clamp(30px,4.8vw,68px)] font-normal leading-[1.05] tracking-[-0.04em]">
              {isId
                ? "Klik kartu mana pun untuk langsung mencoba fiturnya."
                : "Click any card below to launch the interactive workspace."}
            </h2>
          </div>
          <Link
            href="/dashboard"
            className="zeggo-btn inline-flex min-h-[46px] items-center gap-2 rounded-full border border-current/25 px-6 text-xs sm:text-sm font-medium transition hover:bg-[#080808] hover:text-white"
          >
            <ZeggoRollText
              text={
                isId ? "Buka Semua Fitur →" : "Open All Workspaces →"
              }
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* DOVV CARD 01: OMNI-SPATIAL LENS */}
          <Link href="/lens" className="gsap-bento-card dovv-card group">
            <div className="dovv-card-media p-5 flex flex-col justify-between min-h-[280px]">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[#aaa9ad]">
                <span>META SAM 3.1 + MUSE SPARK + MUSE IMAGE</span>
                <span className="rounded-full bg-[#c6f432]/15 px-3 py-0.5 text-[#c6f432]">
                  {isId ? "Deteksi Kamera AI" : "AI Camera Scanner"}
                </span>
              </div>

              <div className="my-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#1e9e5a]/50 bg-[#1e9e5a]/10 p-3.5">
                  <span className="font-mono text-[10px] text-[#c6f432]">
                    {isId ? "#01 ATAP SURYA" : "#01 ROOF SOLAR"}
                  </span>
                  <p className="mt-1 font-sans text-base font-semibold text-white">
                    {housingCalc.solar.panelCountEst} Panels
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-[#aaa9ad]">
                    {housingCalc.solar.kwp} kWp Capacity
                  </p>
                </div>
                <div className="rounded-2xl border border-[#2a9dbd]/50 bg-[#2a9dbd]/10 p-3.5">
                  <span className="font-mono text-[10px] text-cyan-300">
                    {isId ? "#02 PIPA AIR HUJAN" : "#02 RAIN PIPE"}
                  </span>
                  <p className="mt-1 font-sans text-base font-semibold text-white">
                    {housingCalc.rainwater.recommendedCisternLiters}L Tank
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-[#aaa9ad]">
                    {isId ? "Tampung Air Bersih" : "Rainwater Storage"}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e9a23b]/50 bg-[#e9a23b]/10 p-3.5">
                  <span className="font-mono text-[10px] text-amber-300">
                    {isId ? "#03 DAUR ULANG" : "#03 RECYCLABLES"}
                  </span>
                  <p className="mt-1 font-sans text-base font-semibold text-white">
                    PET / Alu / PCB
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-[#aaa9ad]">
                    {isId ? "Nilai Tunai Lokal" : "Local Cash Value"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-3 font-mono text-xs text-[#c9c7c0]">
                <span>
                  {isId
                    ? "6 Contoh Foto Siap Pakai (Instan & Gratis)"
                    : "6 Ready-to-Test Photo Specimens ($0.00 Cache)"}
                </span>
                <span className="text-[#c6f432] group-hover:translate-x-1 transition-transform">
                  {isId ? "Buka Lensa →" : "Open Lens →"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-5 pb-2">
              <div>
                <h3 className="text-xl sm:text-2xl font-normal tracking-[-0.03em]">
                  {isId
                    ? "1. Lensa Kamera AI (Meta SAM 3.1)"
                    : "1. AI Camera Lens & Before/After Retrofit"}
                </h3>
                <p className="mt-1 text-xs text-[#aaa9ad]">
                  {isId
                    ? "Foto barang bekas, tanaman, atau atap rumah untuk melihat potensi uang dan energi."
                    : "Scan recyclables, plants, or rooftops to see instant cash value and solar/water potential."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="dovv-chip">Meta SAM 3.1</span>
                <span className="dovv-chip">Muse Image</span>
              </div>
            </div>
          </Link>

          {/* DOVV CARD 02: 3D URBAN ROOF RADAR */}
          <Link href="/radar" className="gsap-bento-card dovv-card group">
            <div className="dovv-card-media p-5 flex flex-col justify-between min-h-[280px]">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[#aaa9ad]">
                <span>3D MAP RADAR · SOLAR & RAIN CALCULATOR</span>
                <span className="rounded-full bg-cyan-400/15 px-3 py-0.5 text-cyan-300">
                  {geo.hubs.length} {isId ? "Titik Daur Ulang" : "Local Hubs"}
                </span>
              </div>

              <div className="my-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#111317] p-4 shadow-[inset_0_0_0_1px_#262930]">
                  <span className="font-mono text-[10px] text-[#aaa9ad]">
                    {isId ? "LISTRIK SURYA PER TAHUN" : "YEARLY SOLAR POWER"}
                  </span>
                  <p className="mt-1 font-mono text-2xl font-semibold text-[#c6f432]">
                    {Math.round(housingCalc.solar.kwhYear).toLocaleString()} kWh
                  </p>
                  <p className="mt-1 font-mono text-xs text-[#c9c7c0]">
                    {isId ? "Hemat " : "Saves "}
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
                    {isId ? "PANEN AIR HUJAN PER TAHUN" : "YEARLY RAIN HARVEST"}
                  </span>
                  <p className="mt-1 font-mono text-2xl font-semibold text-cyan-300">
                    {formatVolume(
                      housingCalc.rainwater.litersYear,
                      units,
                      locale
                    )}
                  </p>
                  <p className="mt-1 font-mono text-xs text-[#c9c7c0]">
                    {housingCalc.infiltration.bioporeUnits}{" "}
                    {isId ? "lubang biopori" : "biopore pits"} ·{" "}
                    {geo.koppen.pAnnMm} mm/yr
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-3 font-mono text-xs text-[#c9c7c0]">
                <span className="truncate pr-2">
                  {isId ? "Hub Terdekat: " : "Nearest Hub: "}
                  {geo.hubs[0]?.name}
                </span>
                <span className="shrink-0 text-[#c6f432] group-hover:translate-x-1 transition-transform">
                  {isId ? "Buka Radar 3D →" : "Open 3D Radar →"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-5 pb-2">
              <div>
                <h3 className="text-xl sm:text-2xl font-normal tracking-[-0.03em]">
                  {isId
                    ? "2. Peta Radar Atap 3D & Lokasi Bank Sampah"
                    : "2. 3D Roof Radar & Recycling Map"}
                </h3>
                <p className="mt-1 text-xs text-[#aaa9ad]">
                  {isId
                    ? "Geser ukuran atap rumah Anda dan temukan lokasi pengumpulan daur ulang terdekat di peta 3D."
                    : "Adjust your roof size slider and locate nearby recycling drop-off hubs on an interactive 3D map."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="dovv-chip">3D MapLibre</span>
                <span className="dovv-chip">195+ Countries</span>
              </div>
            </div>
          </Link>

          {/* DOVV CARD 03: THE VERDARA SPECIALIST COUNCIL */}
          <Link href="/council" className="gsap-bento-card dovv-card group">
            <div className="dovv-card-media p-5 flex flex-col justify-between min-h-[280px]">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[#aaa9ad]">
                <span>META MUSE SPARK + OPEN-WEIGHT MODE</span>
                <span className="rounded-full bg-amber-400/15 px-3 py-0.5 text-amber-300">
                  {isId ? "Bebas Halusinasi Angka" : "Fact-Checked AI"}
                </span>
              </div>

              <div className="my-4 space-y-2.5">
                {[
                  {
                    agent: "01 / Dr. Flora",
                    roleEn: "Plants, Cooling Trees & Rain Soak Pits",
                    roleId: "Tanaman Peneduh & Resapan Air Biopori",
                    dot: "bg-[#1e9e5a]",
                  },
                  {
                    agent: "02 / Ir. Arka",
                    roleEn: "Rooftop Solar Panels & Rainwater Tank",
                    roleId: "Panel Surya Atap & Tangki Air Hujan",
                    dot: "bg-[#2a9dbd]",
                  },
                  {
                    agent: "03 / Sirkula",
                    roleEn: "Household Savings & Recycling Cashback",
                    roleId: "Penghematan Tagihan & Uang Daur Ulang",
                    dot: "bg-[#e9a23b]",
                  },
                ].map((ag) => (
                  <div
                    key={ag.agent}
                    className="flex items-center justify-between rounded-xl bg-[#111317] px-3.5 py-2.5 text-xs shadow-[inset_0_0_0_1px_#262930]"
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${ag.dot}`} />
                      <span className="font-mono font-semibold text-white">
                        {ag.agent}
                      </span>
                      <span className="truncate text-[#aaa9ad]">
                        {isId ? ag.roleId : ag.roleEn}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-[#c6f432]">
                      Verified
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-3 font-mono text-xs text-[#c9c7c0]">
                <span>
                  {isId
                    ? "Mendukung Meta Muse Spark & Open-Weight"
                    : "Powered by Meta Muse Spark & Open-Weight"}
                </span>
                <span className="text-[#c6f432] group-hover:translate-x-1 transition-transform">
                  {isId ? "Mulai Diskusi →" : "Ask Council →"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-5 pb-2">
              <div>
                <h3 className="text-xl sm:text-2xl font-normal tracking-[-0.03em]">
                  {isId
                    ? "3. Dewan 3 Pakar AI (Meta Muse Spark)"
                    : "3. Three-Specialist AI Council (Meta Muse Spark)"}
                </h3>
                <p className="mt-1 text-xs text-[#aaa9ad]">
                  {isId
                    ? "Konsultasikan rumah Anda dengan 3 pakar AI yang memberi saran praktis sesuai cuaca kota Anda."
                    : "Get a complete home upgrade plan from 3 AI specialists tailored to your city's weather and prices."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="dovv-chip">Meta Muse Spark</span>
                <span className="dovv-chip">3 AI Experts</span>
              </div>
            </div>
          </Link>

          {/* DOVV CARD 04: VERIFIABLE FIELD-ACTION PROOFS */}
          <Link href="/academy" className="gsap-bento-card dovv-card group">
            <div className="dovv-card-media p-5 flex flex-col justify-between min-h-[280px]">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[#aaa9ad]">
                <span>META SAM 3.1 CAMERA PROOF · ANTI-CHEAT</span>
                <span className="rounded-full bg-[#c6f432]/15 px-3 py-0.5 text-[#c6f432]">
                  +150 to +220 XP
                </span>
              </div>

              <div className="my-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#111317] p-4 shadow-[inset_0_0_0_1px_#262930]">
                  <span className="font-mono text-[10px] text-[#c6f432]">
                    {isId
                      ? "LANGKAH 1-2 / PANDUAN PRAKTIS"
                      : "STEP 1-2 / QUICK GUIDE"}
                  </span>
                  <p className="mt-1 font-sans text-base font-semibold text-white">
                    {isId
                      ? "Panduan Sesuai Cuaca Kota"
                      : "Weather-Matched Missions"}
                  </p>
                  <p className="mt-1 text-xs text-[#aaa9ad]">
                    {isId
                      ? `Panduan singkat memilah sampah, membuat kompos, dan panen air untuk iklim ${geo.koppen.code}.`
                      : `Short, practical guides for sorting waste, composting, and saving water in ${geo.koppen.code} climates.`}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#111317] p-4 shadow-[inset_0_0_0_1px_#262930]">
                  <span className="font-mono text-[10px] text-amber-300">
                    {isId
                      ? "LANGKAH 3 / BUKTI FOTO AI"
                      : "STEP 3 / AI PHOTO PROOF"}
                  </span>
                  <p className="mt-1 font-sans text-base font-semibold text-white">
                    {isId
                      ? "Buka Bangunan Baru di Kota 3D"
                      : "Unlock New 3D Town Buildings"}
                  </p>
                  <p className="mt-1 text-xs text-[#aaa9ad]">
                    {isId
                      ? "Meta SAM 3.1 memeriksa foto aksi nyata Anda dan membuka bangunan baru di Kota 3D."
                      : "Meta SAM 3.1 verifies your real-world photo and unlocks new structures in your 3D Town."}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-3 font-mono text-xs text-[#c9c7c0]">
                <span>
                  {isId
                    ? "4 Misi Lapangan Siap Dicoba"
                    : "4 Hands-On Eco Missions Ready"}
                </span>
                <span className="text-[#c6f432] group-hover:translate-x-1 transition-transform">
                  {isId ? "Mulai Misi →" : "Start Mission →"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-5 pb-2">
              <div>
                <h3 className="text-xl sm:text-2xl font-normal tracking-[-0.03em]">
                  {isId
                    ? "4. Akademi & Verifikasi Bukti Foto Nyata"
                    : "4. Field Missions & Camera Proof Verifier"}
                </h3>
                <p className="mt-1 text-xs text-[#aaa9ad]">
                  {isId
                    ? "Selesaikan misi singkat di rumah, buktikan dengan foto kamera, dan naikkan level Kota 3D Anda."
                    : "Complete simple home eco-missions, verify with a photo, and level up your 3D Living Town."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="dovv-chip">SAM 3.1 Proof</span>
                <span className="dovv-chip">dHash Anti-Cheat</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 7. CHAPTER 06: SCROLL-DRIVEN CURVED DOME DARK SECTION + ERA5 CHART + META HACKATHON JUDGING ALIGNMENT */}
      <section id="chapter-climate" className="scroll-mt-16 relative mt-4 w-full">
        {/* DOVV Studio Scroll-Driven Curved Dome Top Edge (svg.dome) */}
        <svg
          ref={domeRef}
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            transform: "translateY(1px)",
            transformOrigin: "bottom center",
          }}
          className="block h-[36px] w-full fill-[#080808] sm:h-[72px]"
        >
          <path d="M0 100 Q50 -95 100 100 Z" />
        </svg>

        <div className="bg-[#080808] px-4 pt-14 pb-28 text-white sm:px-10 sm:pt-22">
          <div className="mx-auto max-w-[1440px] space-y-20">
            {/* Part A: ERA5 10-Year Monthly Climatology Bar Chart */}
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="gsap-section-heading space-y-4 lg:col-span-5">
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#c6f432]">
                  05 / {isId ? "Data Cuaca 12 Bulan" : "12-Month Weather Data"} ·{" "}
                  {geo.city} ({geo.lat.toFixed(2)}°, {geo.lng.toFixed(2)}°)
                </p>
                <h2 className="text-2xl font-normal leading-[1.1] tracking-[-0.04em] sm:text-5xl">
                  {isId
                    ? `Bagaimana hujan dan panas di ${geo.city} menentukan ukuran tangki air & panel surya Anda?`
                    : `How rainfall and sunshine in ${geo.city} size your water tank & solar roof.`}
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed text-[#aaa9ad]">
                  {isId ? geo.koppen.descriptionId : geo.koppen.descriptionEn}
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                  <div className="rounded-2xl bg-[#141414] p-4 shadow-[inset_0_0_0_1px_#242424]">
                    <span className="text-[#aaa9ad]">
                      {isId ? "TOTAL HUJAN / TAHUN" : "ANNUAL RAINFALL"}
                    </span>
                    <p className="mt-1 text-xl font-bold text-white">
                      {geo.koppen.pAnnMm} mm/yr
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#141414] p-4 shadow-[inset_0_0_0_1px_#242424]">
                    <span className="text-[#aaa9ad]">
                      {isId ? "SINAR MATAHARI HARIAN" : "DAILY SUNSHINE (GHI)"}
                    </span>
                    <p className="mt-1 text-xl font-bold text-[#c6f432]">
                      {geo.ghiKwhM2Day} kWh/m²/d
                    </p>
                  </div>
                </div>
              </div>

              <div className="gsap-era5-chart overflow-x-auto rounded-[28px] bg-[#121212] p-4 sm:p-6 shadow-[inset_0_0_0_1px_#242424] lg:col-span-7">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-6 font-mono text-[11px] sm:text-xs text-[#aaa9ad]">
                  <span>
                    12-MONTH ERA5 WEATHER · {geo.city.toUpperCase()} (
                    {geo.countryCode} · {geo.koppen.code})
                  </span>
                  <span>
                    {isId
                      ? "Batang: Curah Hujan (mm) · Atas: Suhu Rata-Rata"
                      : "Bars: Rainfall (mm) · Top: Avg Temp"}
                  </span>
                </div>

                <div className="grid min-w-[460px] grid-cols-12 items-end gap-1.5 sm:gap-2 h-52 pt-6">
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
                        <span className="font-mono text-[9px] sm:text-[10px] text-[#c9c7c0] tabular-nums">
                          {formatTemp(tempC, units)}
                        </span>
                        <div className="relative flex w-full flex-1 items-end justify-center rounded-lg bg-[#1c1c1c] p-0.5">
                          <div
                            style={{ height: `${barHeightPct}%` }}
                            className="gsap-era5-bar w-full rounded-md bg-[#c6f432]"
                          />
                        </div>
                        <span className="font-mono text-[9px] sm:text-[10px] text-[#aaa9ad] tabular-nums">
                          {precipMm}
                        </span>
                        <span className="font-mono text-[9px] sm:text-[10px] font-bold text-white">
                          {MONTHS_SHORT[idx]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Part B: Meta Hackathon Judging & AI Stack Alignment */}
            <div className="border-t border-[#222222] pt-16">
              <div className="gsap-section-heading flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#c6f432]">
                    06 /{" "}
                    {isId
                      ? "Arsitektur Meta AI & Kriteria Penjurian Hackathon"
                      : "Meta AI Stack & Hackathon Judging Alignment"}
                  </p>
                  <h3 className="mt-2 text-2xl sm:text-4xl font-normal tracking-[-0.03em]">
                    {isId
                      ? "Mengapa Verdara menggabungkan Meta SAM 3.1, Muse Spark, dan Fisika Nyata."
                      : "How Verdara combines Meta SAM 3.1, Muse Spark, and real-world impact."}
                  </h3>
                </div>
                <Link
                  href="/settings"
                  className="zeggo-btn inline-flex min-h-[42px] items-center rounded-full bg-white/10 px-4 font-mono text-xs text-[#c6f432] hover:bg-white/20"
                >
                  <ZeggoRollText
                    text={`$150 Meta API Shield ($${remainingCredit} Ready) →`}
                  />
                </Link>
              </div>

              <div className="gsap-judge-grid mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="gsap-judge-card th-node-card rounded-[24px] bg-[#121212] p-6 pl-7 shadow-[inset_0_0_0_1px_#242424]">
                  <span className="th-map-bar bg-[#1e9e5a]" />
                  <div className="flex items-center gap-2 font-mono text-xs text-[#1e9e5a]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#1e9e5a]" />
                    <span>01 · META SAM 3.1 VISION</span>
                  </div>
                  <h4 className="mt-3 text-lg font-medium">
                    {isId
                      ? "Segmentasi Objek & Bukti Aksi"
                      : "Zero-Shot Spatial Segmentation"}
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#aaa9ad]">
                    {isId
                      ? "Memetakan poligon atap surya, talang air, dan barang daur ulang dari foto kamera serta memverifikasi bukti foto misi lapangan."
                      : "Segments solar roof slabs, rainwater pipes, and recyclable items from user photos and verifies real-world field proofs."}
                  </p>
                </div>

                <div className="gsap-judge-card th-node-card rounded-[24px] bg-[#121212] p-6 pl-7 shadow-[inset_0_0_0_1px_#242424]">
                  <span className="th-map-bar bg-[#2a9dbd]" />
                  <div className="flex items-center gap-2 font-mono text-xs text-[#2a9dbd]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#2a9dbd]" />
                    <span>02 · META MUSE SPARK</span>
                  </div>
                  <h4 className="mt-3 text-lg font-medium">
                    {isId
                      ? "Dewan 3 Pakar AI + Open-Weight"
                      : "3-Agent Council + Open-Weight"}
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#aaa9ad]">
                    {isId
                      ? "Menjalankan 3 agen spesialis (Dr. Flora, Ir. Arka, Sirkula) dengan pengawas fakta ±3% terhadap SITE_BRIEF serta dukungan muse-spark-open."
                      : "Orchestrates 3 specialist agents (Dr. Flora, Ir. Arka, Sirkula) with a ±3% fact validator against SITE_BRIEF and muse-spark-open support."}
                  </p>
                </div>

                <div className="gsap-judge-card th-node-card rounded-[24px] bg-[#121212] p-6 pl-7 shadow-[inset_0_0_0_1px_#242424]">
                  <span className="th-map-bar bg-[#c6f432]" />
                  <div className="flex items-center gap-2 font-mono text-xs text-[#c6f432]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#c6f432]" />
                    <span>03 · META MUSE IMAGE</span>
                  </div>
                  <h4 className="mt-3 text-lg font-medium">
                    {isId
                      ? "Visualisasi Sebelum / Sesudah"
                      : "Before / After Eco-Retrofit"}
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#aaa9ad]">
                    {isId
                      ? "Menampilkan perbandingan interaktif sebelum dan sesudah pemasangan panel surya, tangki air hujan, dan taman resapan."
                      : "Renders interactive Before/After architectural retrofits showing solar arrays, rainwater cisterns, and native rain gardens."}
                  </p>
                </div>

                <div className="gsap-judge-card th-node-card rounded-[24px] bg-[#121212] p-6 pl-7 shadow-[inset_0_0_0_1px_#242424]">
                  <span className="th-map-bar bg-[#e9a23b]" />
                  <div className="flex items-center gap-2 font-mono text-xs text-[#e9a23b]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#e9a23b]" />
                    <span>04 · 7-LAYER CREDIT SHIELD</span>
                  </div>
                  <h4 className="mt-3 text-lg font-medium">
                    {isId
                      ? "Perisai Kredit $150 & Demo Instan"
                      : "$150 API Shield & <50ms Demo"}
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#aaa9ad]">
                    {isId
                      ? `Mengunci cadangan $35 khusus juri dan menyajikan 6 spesimen demo dalam <50ms ($0.00) melalui cache SHA-256 + dHash ($${remainingCredit} tersisa).`
                      : `Locks a $35 Judge Reserve and serves all 6 Golden Demo Specimens in <50ms at $0.00 via SHA-256 + dHash caching ($${remainingCredit} left).`}
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
        <div className="mx-auto max-w-[1440px] px-4 pt-14 pb-6">
          <Link
            href="/dashboard"
            className="block select-none text-center transition-opacity hover:opacity-85"
          >
            <DovvInteractiveWordmark
              lines={["VERDARA TOWN"]}
              className="text-center text-[17.5vw] leading-[0.85]"
            />
          </Link>
        </div>

        <div
          className={`mx-auto grid max-w-[1440px] grid-cols-1 border-t md:grid-cols-2 xl:grid-cols-4 ${
            isLight ? "border-black/15" : "border-white/15"
          }`}
        >
          {/* Cell 1: Brand & Judge Demo Action */}
          <div
            className={`flex flex-col gap-3.5 border-b p-6 sm:p-8 xl:border-b-0 xl:border-r ${
              isLight ? "border-black/15" : "border-white/15"
            }`}
          >
            <div className="flex items-center gap-3">
              <VerdaraLogo size={40} />
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.12em] opacity-55">
                  01 / Judge Quick-Start
                </span>
                <p className="text-lg font-semibold tracking-tight">
                  Verdara Spatial Eco-Town
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm opacity-80">
              {isId
                ? "Klik tombol di bawah untuk langsung masuk ke Kota 3D Level 5 dengan seluruh 6 bangunan ekologis terbuka."
                : "Click below to launch the Level 5 Judge Demo Town with all 6 ecological structures unlocked."}
            </p>
            <button
              type="button"
              onClick={() => {
                loginAsJudgeDemo();
                router.push("/dashboard");
              }}
              className="zeggo-btn mt-1 inline-flex min-h-[46px] cursor-pointer items-center gap-2 self-start rounded-full bg-[#080808] px-5 text-sm font-medium text-white transition hover:bg-[#222]"
            >
              <ZeggoRollText text="Launch Lv.5 Judge Town ↗" />
            </button>
          </div>

          {/* Cell 2: Spatial Workspaces (Archivo Condensed Uppercase Links) */}
          <div
            className={`flex flex-col gap-3.5 border-b p-6 sm:p-8 xl:border-b-0 xl:border-r ${
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
            className={`flex flex-col gap-3.5 border-b p-6 sm:p-8 md:border-b-0 xl:border-r ${
              isLight ? "border-black/15" : "border-white/15"
            }`}
          >
            <span className="font-mono text-xs uppercase tracking-[0.12em] opacity-55">
              03 / Meta AI & Science Stack
            </span>
            <ul className="space-y-1.5 text-sm opacity-80">
              <li>Meta SAM 3.1 Concept Segmentation</li>
              <li>Meta Muse Spark &amp; muse-spark-open</li>
              <li>Meta Muse Image Eco-Retrofit</li>
              <li>NREL PVWatts v8 Rooftop Solar Model</li>
              <li>Open-Meteo ERA5 10-Yr Climatology</li>
              <li>US EPA WARM v16 Material Factors</li>
            </ul>
          </div>

          {/* Cell 4: Live Jurisdiction & Status */}
          <div className="flex flex-col justify-between gap-4 p-6 sm:p-8">
            <div className="space-y-2">
              <span className="font-mono text-xs uppercase tracking-[0.12em] opacity-55">
                04 / Active World City
              </span>
              <p className="dovv-wordmark text-3xl">
                {geo.city} ({geo.countryCode})
              </p>
              <div className="flex items-center gap-2 text-sm opacity-75">
                <span className="h-2 w-2 rounded-full bg-[#16c847]" />
                <span>
                  {geo.lat.toFixed(2)}°, {geo.lng.toFixed(2)}° · Köppen{" "}
                  {geo.koppen.code}
                </span>
              </div>
            </div>

            <p className="font-mono text-xs opacity-55">
              Verdara Spatial Studio · 195+ Countries · 60 FPS WebGL
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
            className={`zeggo-btn flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-3.5 sm:px-4 text-xs sm:text-sm font-medium transition ${
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
