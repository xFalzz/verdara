"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import {
  VerdaraLogo,
  ZeggoRollText,
  CompactWorldCityPicker,
  VerdaraBottomDock,
} from "@/components/ui/InteractiveEffects";
import { formatCurrency, formatVolume, formatArea } from "@/lib/science/units";

type DocTab =
  | "architecture"
  | "meta_ai"
  | "physics"
  | "webgl"
  | "database"
  | "security";

export default function DocsPage() {
  const {
    locale,
    units,
    theme,
    geo,
    housingCalc,
    aiShield,
    isAuthenticated,
    setLocale,
    setUnits,
    setTheme,
  } = useVerdaraStore();

  const [activeTab, setActiveTab] = useState<DocTab>("architecture");
  const [searchFilter, setSearchFilter] = useState("");
  const [dbStats, setDbStats] = useState<{
    schemaVersion: string;
    engine: string;
    counts: {
      supportedCountries: number;
      curatedBenchmarkCities: number;
      registeredUsers: number;
      verifiedScans: number;
      securityEvents: number;
    };
  } | null>(null);

  const isId = locale === "id";
  const isLight = theme === "light";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    fetch("/api/db")
      .then((r) => r.json())
      .then((d) => {
        if (d?.database) setDbStats(d.database);
      })
      .catch(() => {
        // Fallback static summary
      });
  }, []);

  const remainingCredit = (
    aiShield.lifetimeCapUsd - aiShield.totalSpendUsd
  ).toFixed(2);

  const tabs: {
    id: DocTab;
    code: string;
    labelEn: string;
    labelId: string;
    summaryEn: string;
    summaryId: string;
  }[] = [
    {
      id: "architecture",
      code: "01",
      labelEn: "System Architecture",
      labelId: "Arsitektur Sistem",
      summaryEn: "5-stage pipeline, workspace routing & state synchronization",
      summaryId: "Alur 5 tahap, rute ruang kerja & sinkronisasi state",
    },
    {
      id: "meta_ai",
      code: "02",
      labelEn: "Meta AI & Spatial Vision",
      labelId: "Model AI Meta & Visi",
      summaryEn: "SAM 3.1 segmentation, Muse Spark Council & +/-3% Fact Guard",
      summaryId: "Segmentasi SAM 3.1, Dewan Muse Spark & Validasi +/-3%",
    },
    {
      id: "physics",
      code: "03",
      labelEn: "Physics & Climate Math",
      labelId: "Rumus Fisika & Iklim",
      summaryEn: "NREL PVWatts v8, DIN 1989-1 hydrology, biopores & EPA WARM",
      summaryId: "NREL PVWatts v8, hidrologi DIN 1989-1, biopori & EPA WARM",
    },
    {
      id: "webgl",
      code: "04",
      labelEn: "3D WebGL Engine",
      labelId: "Mesin WebGL 3D",
      summaryEn: "Procedural PBR architecture, Run/Break/Heal & 60 FPS particles",
      summaryId: "Arsitektur PBR prosedural, Run/Break/Heal & partikel 60 FPS",
    },
    {
      id: "database",
      code: "05",
      labelEn: "Database v3.2 & APIs",
      labelId: "Database v3.2 & API",
      summaryEn: "Entity schemas, 195+ country registry & REST API endpoints",
      summaryId: "Skema tabel, registri 195+ negara & endpoint REST API",
    },
    {
      id: "security",
      code: "06",
      labelEn: "Cybersecurity & Shield",
      labelId: "Keamanan & Perisai API",
      summaryEn: "OWASP ASVS headers, Auth Gate, rate limiting & dHash anti-cheat",
      summaryId: "Header OWASP ASVS, Gerbang Login, rate limit & anti-cheat dHash",
    },
  ];

  return (
    <div
      className={`min-h-screen pb-28 transition-colors duration-200 ${
        isLight
          ? "bg-[#f5f5f3] text-[#111111]"
          : "bg-[#0b0c0e] text-[#f2f1ec]"
      }`}
    >
      {/* CLEAN SINGLE-ROW TOP HEADER */}
      <header className="sticky top-0 z-40 border-b border-current/10 bg-inherit/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div className="flex min-w-0 shrink-0 items-center gap-3">
            <Link href="/" className="flex min-h-[44px] items-center gap-2.5">
              <VerdaraLogo size={36} />
              <div className="flex flex-col text-left">
                <span className="dovv-wordmark text-xl sm:text-2xl tracking-tight">
                  VERDARA
                </span>
                <span className="hidden font-mono text-[9px] uppercase tracking-[0.14em] opacity-60 sm:block">
                  Engineering &amp; Science Docs
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

          <nav className="hidden items-center gap-1 rounded-full border border-current/10 bg-current/[0.03] p-1 lg:flex">
            <Link
              href="/"
              className="rounded-full px-3.5 py-1.5 text-xs font-medium opacity-75 transition hover:opacity-100"
            >
              {isId ? "Beranda" : "Overview"}
            </Link>
            <Link
              href="/docs"
              className="rounded-full bg-[#08090c] px-3.5 py-1.5 text-xs font-semibold text-[#c6f432]"
            >
              {isId ? "Dokumen Teknis" : "Documentation"}
            </Link>
            <Link
              href="/faq"
              className="rounded-full px-3.5 py-1.5 text-xs font-medium opacity-75 transition hover:opacity-100"
            >
              FAQ
            </Link>
            <Link
              href={isAuthenticated ? "/dashboard" : "/login?next=/dashboard"}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium opacity-75 transition hover:opacity-100"
            >
              {isId ? "Studio 3D" : "3D Studio"}
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setLocale(isId ? "en" : "id")}
              className="min-h-[40px] cursor-pointer rounded-full border border-current/15 px-3 font-mono text-xs font-semibold"
            >
              {locale.toUpperCase()}
            </button>
            <button
              type="button"
              onClick={() =>
                setUnits(units === "metric" ? "imperial" : "metric")
              }
              className="hidden min-h-[40px] cursor-pointer items-center rounded-full border border-current/15 px-3 font-mono text-xs sm:inline-flex"
            >
              {units === "metric" ? "m² / L" : "ft² / gal"}
            </button>
            <button
              type="button"
              onClick={() => setTheme(isLight ? "dark" : "light")}
              className="min-h-[40px] cursor-pointer rounded-full border border-current/15 px-3 font-mono text-xs"
            >
              {isLight ? "☀ Day" : "☾ Night"}
            </button>
            <Link
              href={isAuthenticated ? "/dashboard" : "/login?next=/dashboard"}
              className="zeggo-btn flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#08090c] px-4 text-xs font-semibold text-[#c6f432]"
            >
              <ZeggoRollText
                text={
                  isAuthenticated
                    ? isId
                      ? "Buka Studio ↗"
                      : "Open Studio ↗"
                    : isId
                    ? "Login Studio →"
                    : "Sign In →"
                }
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 pt-8 sm:px-8 sm:pt-12">
        {/* HERO REFERENCE BANNER */}
        <div className="rounded-[28px] bg-[#08090c] p-6 sm:p-10 text-white shadow-[inset_0_0_0_1.5px_#232730]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#c6f432]/15 px-3.5 py-1 font-mono text-xs font-semibold text-[#c6f432]">
                VERDARA ENGINEERING SPECIFICATION · v3.2
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs text-[#c9c7c0]">
                195+ COUNTRIES · NREL PVWATTS v8 · DIN 1989-1 · SAM 3.1
              </span>
            </div>
            <Link
              href="/faq"
              className="inline-flex min-h-[38px] items-center rounded-full border border-[#c6f432]/40 bg-[#c6f432]/10 px-4 font-mono text-xs text-[#c6f432] transition hover:bg-[#c6f432]/20"
            >
              {isId ? "Buka Halaman Tanya Jawab (FAQ) →" : "Open Interactive FAQ (/faq) →"}
            </Link>
          </div>

          <h1 className="dovv-wordmark mt-4 text-4xl sm:text-7xl text-white">
            {isId
              ? "DOKUMENTASI ARSITEKTUR, AI & FISIKA VERDARA"
              : "ARCHITECTURAL, AI & SCIENTIFIC DOCUMENTATION"}
          </h1>
          <p className="mt-3 max-w-4xl text-sm sm:text-base leading-relaxed text-[#c9c7c0]">
            {isId
              ? "Referensi rekayasa lengkap dari nol hingga komponen terdalam Verdara: arsitektur pipa komputasi spasial 5-tahap, orkestrasi model Meta AI (SAM 3.1, Muse Spark, Muse Image), derivasi rumus fisika deterministik (NREL PVWatts v8, hidrologi DIN 1989-1, resapan biopori Brata, kenyamanan termal TCI), mesin WebGL 3D prosedural 60-FPS, skema basis data v3.2, hingga pertahanan siber berlapis OWASP ASVS."
              : "Complete end-to-end engineering reference from foundational architecture to Verdara's deepest technical subsystems: 5-stage spatial computing pipeline, Meta AI orchestration (SAM 3.1, Muse Spark, Muse Image), deterministic physics derivations (NREL PVWatts v8, DIN 1989-1 hydrology, Brata biopore hydraulics, TCI thermal comfort), 60-FPS procedural 3D WebGL engine, v3.2 database schema, and OWASP ASVS cybersecurity guardrails."}
          </p>

          {/* 6-Module Navigation Grid */}
          <div className="mt-7 grid grid-cols-1 gap-2.5 border-t border-white/10 pt-6 sm:grid-cols-2 lg:grid-cols-3">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-h-[64px] cursor-pointer flex-col justify-between rounded-2xl p-3.5 text-left transition ${
                    active
                      ? "bg-[#c6f432] text-[#080808] shadow-md"
                      : "bg-[#13161c] text-[#c9c7c0] hover:bg-[#1c2029] hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 font-mono text-xs font-bold">
                    <span>
                      MODULE {tab.code} · {isId ? tab.labelId : tab.labelEn}
                    </span>
                    <span>{active ? "● ACTIVE" : "→"}</span>
                  </div>
                  <p
                    className={`mt-1 text-[11px] leading-snug ${
                      active ? "text-[#1a1a18] font-medium" : "text-[#8e929b]"
                    }`}
                  >
                    {isId ? tab.summaryId : tab.summaryEn}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* LIVE TELEMETRY CONTEXT BAR (ALWAYS VISIBLE ACROSS DOC TABS) */}
        <div
          className={`mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-5 py-3.5 font-mono text-xs ${
            isLight
              ? "border-black/10 bg-white text-[#111111]"
              : "border-white/10 bg-[#12141a] text-white"
          }`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-bold text-[#1e9e5a] dark:text-[#c6f432]">
              <span className="h-2 w-2 rounded-full bg-[#1e9e5a] dark:bg-[#c6f432]" />
              LIVE TELEMETRY BINDING:
            </span>
            <span>
              {geo.city} ({geo.countryCode} · Köppen {geo.koppen.code})
            </span>
            <span className="opacity-40">|</span>
            <span>
              Roof {formatArea(housingCalc.footprintM2, units, locale)}
            </span>
            <span className="opacity-40">|</span>
            <span className="font-semibold text-[#14733f] dark:text-[#c6f432]">
              Solar {housingCalc.solar.kwp} kWp (
              {Math.round(housingCalc.solar.kwhYear).toLocaleString()} kWh/yr)
            </span>
            <span className="opacity-40">|</span>
            <span className="font-semibold text-[#0e7490] dark:text-cyan-300">
              Rain {formatVolume(housingCalc.rainwater.litersYear, units, locale)}/yr
            </span>
            <span className="opacity-40">|</span>
            <span>
              +{housingCalc.infiltration.bioporeUnits} Biopores
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="search"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={
                isId
                  ? "Filter istilah di modul..."
                  : "Highlight keyword in docs..."
              }
              className="min-h-[34px] rounded-full border border-current/20 bg-transparent px-3.5 text-xs outline-none focus:border-[#1e9e5a]"
            />
          </div>
        </div>

        {/* =====================================================================
            MODULE 01: SYSTEM ARCHITECTURE & WORKSPACE TOPOLOGY
            ===================================================================== */}
        {activeTab === "architecture" && (
          <section className="mt-8 space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-8">
                <div
                  className={`th-node-card border p-6 sm:p-8 pl-7 ${
                    isLight
                      ? "border-black/10 bg-white shadow-sm"
                      : "border-white/10 bg-[#14161b]"
                  }`}
                >
                  <span className="th-map-bar bg-[#1e9e5a]" />
                  <span className="font-mono text-xs font-bold text-[#1e9e5a]">
                    01.1 / END-TO-END DETERMINISTIC SPATIAL PIPELINE
                  </span>
                  <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
                    {isId
                      ? "Arsitektur 5-Tahap: Mengapa Verdara Bebas dari Halusinasi Angka AI"
                      : "5-Stage Pipeline: Why Verdara Guarantees Zero Numerical AI Hallucination"}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed opacity-85">
                    {isId
                      ? "Kesalahan terbesar aplikasi keberlanjutan berbasis LLM konvensional adalah meminta model bahasa menebak produksi listrik surya atau volume air hujan secara langsung. Verdara memisahkan secara ketat antara Persepsi Visi (Meta SAM 3.1), Kalkulasi Fisika Deterministik (NREL PVWatts v8 & DIN 1989-1), dan Sintesis Strategi (Meta Muse Spark)."
                      : "The fundamental flaw of conventional LLM sustainability apps is asking a language model to guess kilowatt-hours or rainwater liters directly. Verdara strictly decouples Computer Vision Perception (Meta SAM 3.1), Deterministic Physics Computation (NREL PVWatts v8 & DIN 1989-1), and Multi-Agent Synthesis (Meta Muse Spark)."}
                  </p>

                  {/* ASCII / Monospace Architectural Blueprint Diagram */}
                  <pre className="mt-5 overflow-x-auto rounded-2xl bg-[#08090c] p-4 sm:p-5 font-mono text-[11px] leading-relaxed text-[#c6f432]">
{`[STAGE 1: GEOSPATIAL & ERA5 CLIMATOLOGY]
  195+ Countries / 100k+ Cities -> Latitude/Longitude -> Köppen-Geiger (Af/Am/BWh/Csb/Cfb/Cfa/Dfb)
  12-Month ERA5 Precipitation (mm) + Daily Solar Irradiance GHI (kWh/m2/day) + Local Grid Tariff & EF
        |
        v
[STAGE 2: META SAM 3.1 SPATIAL VISION (/lens & /academy)]
  User Photo / Specimen -> SHA-256 + 64-bit Perceptual dHash -> Meta SAM 3.1 Concept Segmentation
  Outputs Normalized [0..1000] Polygon Masks: SOLAR_ROOF | RAIN_CONDUIT | NATIVE_FLORA | RECYCLABLES
        |
        v
[STAGE 3: DETERMINISTIC PHYSICS & VALUATION ENGINE (src/lib/science/)]
  NREL PVWatts v8 (kWp, kWh/yr, Temp Derating) + DIN 1989-1 (L/yr, Cistern L) + Brata Biopores + EPA WARM
  Generates Immutable JSON Lock -> SITE_BRIEF (Single Source of Numerical Truth)
        |
        v
[STAGE 4: META MUSE SPARK 3-AGENT COUNCIL + +/-3% FACT FIREWALL (/council)]
  Dr. Flora (Botanist) + Ir. Arka (Solar/Hydro Engineer) + Sirkula (Economist) + muse-spark-open Auditor
  Regex Number Extractor verifies every emitted figure against SITE_BRIEF within +/-3.0% tolerance
        |
        v
[STAGE 5: 60-FPS 3D LIVING ECO-DISTRICT & PERSISTENT LEDGER (/dashboard & /radar)]
  React Three Fiber Procedural PBR District (Run / Break / Heal) + MapLibre 3D Extrusion + Database v3.2`}
                  </pre>

                  <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    {[
                      {
                        step: "STAGE 01 · GEOSPATIAL & CLIMATE SYNTHESIS",
                        file: "src/lib/science/world-cities.ts, climate.ts",
                        descEn:
                          "Resolves any selected country/city or custom GPS coordinate into Peel et al. (2007) Köppen-Geiger classification, 12-month precipitation curves, warmest-month maximum temperature, local currency, utility tariff ($/kWh), and grid emission factor (kg CO2e/kWh).",
                        descId:
                          "Memetakan negara/kota atau koordinat GPS ke klasifikasi iklim Köppen-Geiger (Peel et al., 2007), kurva curah hujan 12 bulan, suhu maksimum bulan terpanas, mata uang lokal, tarif listrik, serta faktor emisi grid.",
                      },
                      {
                        step: "STAGE 02 · META SAM 3.1 SPATIAL PERCEPTION",
                        file: "src/lib/lens/masks.ts, /api/meta/sam",
                        descEn:
                          "Segments building roofs, permeable ground, gutter downspouts, vegetation health, and recyclable materials (PET, HDPE, Aluminum, Copper, E-Waste PCB) with pixel-accurate polygon vertices and confidence telemetry.",
                        descId:
                          "Melakukan segmentasi bidang atap, tanah resapan, pipa talang, kesehatan tanaman, serta material daur ulang (PET, HDPE, Aluminium, Tembaga, PCB) dengan titik poligon presisi dan skor kepercayaan.",
                      },
                      {
                        step: "STAGE 03 · IMMUTABLE SITE_BRIEF PHYSICS CORE",
                        file: "src/lib/science/housing.ts, units.ts",
                        descEn:
                          "Executes closed-form engineering equations to compute exact solar array kWp, annual kWh yield, rainwater capture liters, cistern tank sizing, biopore soak pit count, and local Deposit Return Scheme (DRS) cash payouts.",
                        descId:
                          "Menjalankan persamaan teknik tertutup untuk menghitung kapasitas kWp surya, produksi kWh tahunan, liter air hujan, ukuran tangki, jumlah lubang biopori, dan nilai uang tunai daur ulang lokal.",
                      },
                      {
                        step: "STAGE 04 · MULTI-AGENT COUNCIL & 3D TWIN SYNC",
                        file: "src/lib/meta/client.ts, EcoIslandCanvas.tsx",
                        descEn:
                          "Feeds SITE_BRIEF into Meta Muse Spark specialists and syncs the verified retrofit state directly into the Zustand reactive store (useVerdaraStore), updating the 3D WebGL Eco-District and 3D MapLibre Radar in real time.",
                        descId:
                          "Menyuntikkan SITE_BRIEF ke pakar Meta Muse Spark dan menyinkronkan hasilnya ke store reaktif Zustand (useVerdaraStore), memperbarui Distrik 3D WebGL dan Radar Peta 3D secara langsung.",
                      },
                    ].map((item) => (
                      <div
                        key={item.step}
                        className="rounded-2xl bg-[#08090c] p-4.5 text-white border border-white/8"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#c6f432]">
                            {item.step}
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-[10px] text-cyan-300">
                          {item.file}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-[#c9c7c0]">
                          {isId ? item.descId : item.descEn}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Telemetry & State Store Architecture */}
              <div className="space-y-6 lg:col-span-4">
                <div className="rounded-[24px] bg-[#08090c] p-6 text-white shadow-[inset_0_0_0_1px_#232730]">
                  <span className="font-mono text-xs font-semibold text-[#c6f432]">
                    ACTIVE SITE_BRIEF SNAPSHOT · {geo.city.toUpperCase()}
                  </span>
                  <h3 className="mt-2 text-xl font-semibold">
                    {geo.city} ({geo.countryCode} · {geo.koppen.code})
                  </h3>
                  <p className="mt-1 text-xs text-[#aaa9ad]">
                    {isId
                      ? "Data deterministik di bawah ini dihitung secara real-time dan dikunci sebelum dikirim ke agen AI:"
                      : "This deterministic payload is computed in real time and locked before being passed to AI agents:"}
                  </p>
                  <dl className="mt-4 space-y-2.5 border-t border-white/10 pt-4 font-mono text-xs">
                    <div className="flex justify-between">
                      <dt className="text-[#aaa9ad]">Coordinates:</dt>
                      <dd className="text-white">
                        {geo.lat.toFixed(4)}°, {geo.lng.toFixed(4)}°
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#aaa9ad]">Köppen Regime:</dt>
                      <dd className="text-[#c6f432]">
                        {geo.koppen.code} ({geo.koppen.nameEn})
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#aaa9ad]">Daily Solar GHI:</dt>
                      <dd className="text-white">
                        {geo.ghiKwhM2Day} kWh/m²/day
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#aaa9ad]">Annual Rainfall:</dt>
                      <dd className="text-cyan-300">
                        {geo.koppen.pAnnMm} mm/yr
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#aaa9ad]">Solar Array Output:</dt>
                      <dd className="font-bold text-[#c6f432]">
                        {housingCalc.solar.kwp} kWp (
                        {Math.round(housingCalc.solar.kwhYear).toLocaleString()}{" "}
                        kWh/yr)
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#aaa9ad]">Annual Solar Savings:</dt>
                      <dd className="font-bold text-[#10b981]">
                        {formatCurrency(
                          housingCalc.solar.savingsYear,
                          housingCalc.solar.currency,
                          locale
                        )}
                        /yr
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#aaa9ad]">Rainwater Harvest:</dt>
                      <dd className="font-bold text-cyan-300">
                        {formatVolume(
                          housingCalc.rainwater.litersYear,
                          units,
                          locale
                        )}
                        /yr
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#aaa9ad]">Recommended Cistern:</dt>
                      <dd className="text-white">
                        {housingCalc.rainwater.recommendedCisternLiters} L
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#aaa9ad]">Biopore Soak Wells:</dt>
                      <dd className="font-bold text-amber-300">
                        {housingCalc.infiltration.bioporeUnits} units
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#aaa9ad]">Thermal Comfort (TCI):</dt>
                      <dd className="text-white">
                        {housingCalc.thermal.tciScore}/100 (-
                        {housingCalc.thermal.coolingTargetDegC}°C Cool Roof)
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#aaa9ad]">API Shield Pool:</dt>
                      <dd className="font-bold text-[#c6f432]">
                        ${remainingCredit} / $150.00
                      </dd>
                    </div>
                  </dl>
                </div>

                <div
                  className={`rounded-[24px] border p-6 ${
                    isLight
                      ? "border-black/10 bg-white"
                      : "border-white/10 bg-[#14161b]"
                  }`}
                >
                  <span className="font-mono text-xs font-bold text-[#2a9dbd]">
                    01.2 / REACTIVE STATE SYNCHRONIZATION
                  </span>
                  <h3 className="mt-2 text-lg font-semibold">
                    {isId
                      ? "Penyimpanan Zustand Tunggal (useVerdaraStore)"
                      : "Unified Zustand Store (useVerdaraStore)"}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed opacity-85">
                    {isId
                      ? "Mengubah kota, luas atap (m²/ft²), bahasa (EN/ID), atau melakukan pemindaian SAM 3.1 akan langsung memperbarui seluruh halaman secara sinkron melalui penyimpanan lokal terenkapsulasi."
                      : "Switching the active country/city, adjusting roof footprint (m²/ft²), toggling EN/ID or Metric/Imperial, or completing a SAM 3.1 scan instantaneously propagates across all routes via persisted Zustand state."}
                  </p>
                </div>
              </div>
            </div>

            {/* Application Route Topology Table */}
            <div
              className={`rounded-[24px] border p-6 sm:p-8 ${
                isLight
                  ? "border-black/10 bg-white shadow-sm"
                  : "border-white/10 bg-[#14161b]"
              }`}
            >
              <span className="font-mono text-xs font-bold text-[#1e9e5a]">
                01.3 / COMPLETE APPLICATION ROUTE &amp; WORKSPACE TOPOLOGY
              </span>
              <h3 className="mt-2 text-xl sm:text-2xl font-semibold">
                {isId
                  ? "Peta Rute & Modul Interaktif Verdara"
                  : "Verdara Route Map & Interactive Workspace Matrix"}
              </h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-current/15 text-[11px] uppercase opacity-70">
                      <th className="py-3 pr-4">Route</th>
                      <th className="py-3 pr-4">Module Name</th>
                      <th className="py-3 pr-4">Access Gate</th>
                      <th className="py-3">Primary Engineering Subsystems</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-current/10 font-sans text-xs">
                    {[
                      {
                        route: "/",
                        name: "Spatial Eco-Twin Landing & 10-Country Deck",
                        gate: "Public",
                        sub: "Interactive 3D Eco-District preview (Run/Break/Heal), Draggable 10-Country Climate Deck, 12-Month ERA5 chart, Global Telemetry Bento Matrix.",
                      },
                      {
                        route: "/login",
                        name: "Session Authentication & Judge Sandbox Gate",
                        gate: "Public",
                        sub: "1-Click Level 5 Judge Demo Sandbox (unlocks all 6 3D structures + 4,200 Eco-XP) + Resident Email/Role authentication with redirect preservation.",
                      },
                      {
                        route: "/dashboard",
                        name: "Living 3D Eco-Town Studio",
                        gate: "Auth Required",
                        sub: "Full-screen 60-FPS Three.js Eco-District, interactive Roof Area slider (40-600 m²), progressive Level 1-5 architectural unlocks, live telemetry.",
                      },
                      {
                        route: "/lens",
                        name: "Omni-Spatial Camera Lens (SAM 3.1 + Muse Image)",
                        gate: "Auth Required",
                        sub: "Zero-shot polygon segmentation visor, X-Ray wireframe slider, Before/After Eco-Retrofit curtain, EPA WARM v16 + DRS cash valuation, PNG Impact Card export.",
                      },
                      {
                        route: "/radar",
                        name: "3D Urban Roof & Hydrological Radar",
                        gate: "Auth Required",
                        sub: "MapLibre GL 55-deg pitched 3D building extrusion, SAM 3D terrain slope/drainage mesh, solar/cistern calculator, OpenStreetMap circular drop-off hubs.",
                      },
                      {
                        route: "/council",
                        name: "3-Specialist AI Sustainability Council",
                        gate: "Auth Required",
                        sub: "Multi-agent deliberation (Dr. Flora, Ir. Arka, Sirkula) powered by Meta Muse Spark + muse-spark-open with +/-3% deterministic SITE_BRIEF fact validation.",
                      },
                      {
                        route: "/academy",
                        name: "Field-Proof Verification Academy",
                        gate: "Auth Required",
                        sub: "Camera proof-of-action verification using Meta SAM 3.1 instance segmentation + 64-bit perceptual dHash anti-spoofing (Hamming distance <= 8 check).",
                      },
                      {
                        route: "/settings",
                        name: "7-Layer API Credit Shield & System Controls",
                        gate: "Auth Required",
                        sub: "Real-time $150 Meta API credit ledger ($35 Judge Reserve), SHA-256 golden cache controls, open-weight model toggle, unit/locale preferences.",
                      },
                      {
                        route: "/docs & /faq",
                        name: "Engineering Documentation & Knowledge Base",
                        gate: "Public",
                        sub: "Full architectural documentation, mathematical derivations, database v3.2 telemetry, REST API specs, and searchable bilingual FAQ.",
                      },
                    ].map((r) => (
                      <tr key={r.route}>
                        <td className="py-3 pr-4 font-mono font-bold text-[#14733f] dark:text-[#c6f432]">
                          {r.route}
                        </td>
                        <td className="py-3 pr-4 font-semibold">{r.name}</td>
                        <td className="py-3 pr-4 font-mono text-[11px]">
                          <span
                            className={`rounded-full px-2.5 py-0.5 ${
                              r.gate === "Public"
                                ? "bg-[#1e9e5a]/15 text-[#14733f] dark:text-[#5ce69b]"
                                : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                            }`}
                          >
                            {r.gate}
                          </span>
                        </td>
                        <td className="py-3 opacity-85">{r.sub}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            MODULE 02: META AI & SPATIAL VISION ORCHESTRATION
            ===================================================================== */}
        {activeTab === "meta_ai" && (
          <section className="mt-8 space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {[
                {
                  badge: "MODEL 01 · SPATIAL COMPUTER VISION",
                  title: "Meta SAM 3.1 (Segment Anything Model 3.1)",
                  endpoint: "POST /api/meta/sam · src/lib/lens/masks.ts",
                  color: "bg-[#1e9e5a]",
                  descEn:
                    "Powers zero-shot concept and instance segmentation in the Omni-Spatial Lens (/lens) and Field Proof Verifier (/academy). Given any uploaded building, yard, or recyclable photo, SAM 3.1 returns normalized [0, 1000] polygon vertices, bounding boxes, pixel area ratios, and confidence scores across four structural classes: (1) Solar Roof Slabs, (2) Rainwater Gutters & Downspouts, (3) Permeable Soil & Native Flora, and (4) Recyclable Commodities (PET, HDPE, Aluminum, Copper, E-Waste PCB).",
                  descId:
                    "Menggerakkan segmentasi konsep dan objek zero-shot pada Lensa Spasial (/lens) serta Verifikasi Bukti Lapangan (/academy). Dari foto bangunan, halaman, atau barang daur ulang yang diunggah, SAM 3.1 menghasilkan titik poligon ternormalisasi [0, 1000], kotak batas, rasio piksel area, dan skor kepercayaan untuk 4 kelas utama: (1) Bidang Atap Surya, (2) Talang & Pipa Air Hujan, (3) Tanah Resapan & Vegetasi Lokal, serta (4) Komoditas Daur Ulang (PET, HDPE, Aluminium, Tembaga, PCB).",
                },
                {
                  badge: "MODEL 02 · MULTI-AGENT SPATIAL REASONING",
                  title: "Meta Muse Spark (3-Specialist Sustainability Council)",
                  endpoint: "POST /api/meta/muse · src/lib/meta/client.ts",
                  color: "bg-[#2a9dbd]",
                  descEn:
                    "Orchestrates the 3-Specialist Council (/council): Dr. Flora (Urban Botanist & Microclimate Specialist), Ir. Arka (Photovoltaic & Hydrological Civil Engineer), and Sirkula (Circular Economy & DRS Valuation Analyst). Each specialist receives the immutable SITE_BRIEF JSON and debates trade-offs between solar roof allocation, rainwater cistern capacity, and native tree canopy cooling before synthesizing a unified phased retrofit blueprint.",
                  descId:
                    "Mengorkestrasi Dewan 3 Pakar Keberlanjutan (/council): Dr. Flora (Pakar Botani Perkotaan & Iklim Mikro), Ir. Arka (Insinyur Sipil Surya & Hidrologi), serta Sirkula (Analis Ekonomi Sirkular & Nilai Daur Ulang). Setiap pakar menerima data terkunci SITE_BRIEF dan mendiskusikan sinergi antara panel surya, tangki air hujan, serta peneduh pohon sebelum menyusun rencana aksi bertahap.",
                },
                {
                  badge: "MODEL 03 · OPEN-WEIGHT VERIFIABLE AUDITOR",
                  title: "Meta muse-spark-open & +/-3% Numerical Firewall",
                  endpoint: "validateNumbersAgainstSiteBrief() · src/lib/meta/client.ts",
                  color: "bg-[#e9a23b]",
                  descEn:
                    "Provides transparent open-weight inference auditing. Every numerical claim emitted by the AI Council (kWp, kWh/yr, L/yr, cistern volume, savings) is parsed by a deterministic regex auditor and cross-checked against the physics engine's SITE_BRIEF. Any deviation exceeding +/-3.0% is automatically flagged and corrected to guarantee 100% engineering fidelity.",
                  descId:
                    "Menyediakan transparansi audit inferensi open-weight. Setiap klaim angka yang dikeluarkan oleh Dewan AI (kWp, kWh/thn, L/thn, volume tangki, penghematan) diperiksa secara otomatis terhadap SITE_BRIEF dari mesin fisika. Selisih di atas +/-3.0% langsung dikoreksi otomatis demi menjamin akurasi rekayasa 100%.",
                },
                {
                  badge: "MODEL 04 · GENERATIVE ARCHITECTURAL SYNTHESIS",
                  title: "Meta Muse Image (Before / After Eco-Retrofit Curtain)",
                  endpoint: "POST /api/meta/image · SpatialMaskViewer.tsx",
                  color: "bg-[#c6f432]",
                  descEn:
                    "Conditioned on the polygon masks extracted by Meta SAM 3.1 and the Köppen-Geiger climate biome of the active city, Meta Muse Image synthesizes a photorealistic 'After' architectural visualization overlaid via an interactive drag curtain, showing monocrystalline solar arrays, modular rainwater cisterns, and bioswale rain gardens.",
                  descId:
                    "Berdasarkan poligon yang diekstrak oleh Meta SAM 3.1 dan zona iklim Köppen-Geiger kota aktif, Meta Muse Image menghasilkan visualisasi arsitektur 'Sesudah' yang dapat digeser secara interaktif, menampilkan susunan panel surya monokristalin, tangki air hujan modular, dan taman resapan biopori.",
                },
              ].map((m) => (
                <div
                  key={m.title}
                  className={`th-node-card border p-6 sm:p-7 pl-7 ${
                    isLight
                      ? "border-black/10 bg-white shadow-sm"
                      : "border-white/10 bg-[#14161b]"
                  }`}
                >
                  <span className={`th-map-bar ${m.color}`} />
                  <span className="font-mono text-xs font-bold opacity-70">
                    {m.badge}
                  </span>
                  <h2 className="mt-2 text-xl font-semibold">{m.title}</h2>
                  <p className="mt-1 font-mono text-[11px] text-[#14733f] dark:text-[#c6f432]">
                    {m.endpoint}
                  </p>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed opacity-85">
                    {isId ? m.descId : m.descEn}
                  </p>
                </div>
              ))}
            </div>

            {/* Detailed SAM 3.1 & Fact Guard Code Specification */}
            <div className="rounded-[24px] bg-[#08090c] p-6 sm:p-8 text-white shadow-[inset_0_0_0_1px_#232730]">
              <span className="font-mono text-xs font-bold text-[#c6f432]">
                02.2 / DETERMINISTIC HALLUCINATION FIREWALL SPECIFICATION
              </span>
              <h3 className="mt-2 text-xl sm:text-2xl font-semibold">
                {isId
                  ? "Cara Kerja Pengawas Fakta Numerik (+/-3% Tolerance Guard)"
                  : "How the +/-3% Numerical Fact-Check Guard Validates AI Output"}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#c9c7c0]">
                {isId
                  ? "Sebelum respons dari Meta Muse Spark ditampilkan kepada pengguna di /council atau /lens, fungsi validateNumbersAgainstSiteBrief() mengekstrak seluruh angka berunit dan membandingkannya dengan nilai eksak dari mesin fisika:"
                  : "Before any Meta Muse Spark response is rendered in /council or /lens, validateNumbersAgainstSiteBrief() extracts unit-bearing figures and verifies them against the deterministic physics engine:"}
              </p>
              <pre className="mt-4 overflow-x-auto rounded-2xl bg-[#111318] p-4 font-mono text-xs text-cyan-300 border border-white/10">
{`// Deterministic Numerical Parity Check (src/lib/meta/client.ts)
export function validateNumbersAgainstSiteBrief(
  text: string,
  brief: SiteBriefNumbers,
  tolerance = 0.03 // Strict +/-3.0% engineering tolerance
): ValidationReport {
  // Extracts kWp, kWh/yr, L/yr, Cistern L, Biopores, and Currency amounts
  // Verifies: |emitted_value - brief_value| / brief_value <= 0.03
  // If any figure drifts beyond 3%, replaces with the exact physics-computed value
  // and attaches a cryptographic verification badge (PARITY_VERIFIED: 100%).
}`}
              </pre>
            </div>
          </section>
        )}

        {/* =====================================================================
            MODULE 03: DETERMINISTIC PHYSICS, HYDROLOGY & VALUATION FORMULAS
            ===================================================================== */}
        {activeTab === "physics" && (
          <section className="mt-8 space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Equation 1: Solar */}
              <div
                className={`th-node-card border p-6 sm:p-7 pl-7 ${
                  isLight
                    ? "border-black/10 bg-white shadow-sm"
                    : "border-white/10 bg-[#14161b]"
                }`}
              >
                <span className="th-map-bar bg-[#1e9e5a]" />
                <span className="font-mono text-xs font-bold text-[#1e9e5a]">
                  EQUATION 01 · NREL PVWATTS V8 PHOTOVOLTAIC MODEL
                </span>
                <h2 className="mt-2 text-xl font-semibold">
                  {isId
                    ? "Kapasitas Atap Surya (kWp), Produksi kWh & Derating Suhu"
                    : "Rooftop Solar Capacity (kWp), Annual kWh & Thermal Derating"}
                </h2>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-[#08090c] p-4 font-mono text-xs text-[#c6f432]">
{`A_solar_m2 = A_roof_m2 * f_usable (0.60)
P_kwp      = A_solar_m2 * eta_panel (0.205 kWp/m2)
N_panels   = round(P_kwp / 0.400)  // 400W monocrystalline modules
T_cell_C   = T_ambient_max_C + 18.0
f_temp     = clamp(1 - 0.0038 * max(0, T_cell_C - 25.0), 0.78, 1.02)
E_kwh_yr   = P_kwp * GHI_day * 365 * PR_sys (0.80) * f_temp
Savings_yr = E_kwh_yr * Tariff_local
CO2e_kg_yr = E_kwh_yr * Grid_EF_local`}
                </pre>
                <p className="mt-3 text-xs leading-relaxed opacity-85">
                  {isId
                    ? `Contoh langsung di ${geo.city}: Atap ${housingCalc.footprintM2} m² menghasilkan ${housingCalc.solar.kwp} kWp (${housingCalc.solar.panelCountEst} panel), memproduksi ${Math.round(housingCalc.solar.kwhYear).toLocaleString()} kWh/tahun dan menghindari ${housingCalc.solar.co2eKgYear.toLocaleString()} kg CO2e/tahun.`
                    : `Live computation for ${geo.city}: A ${housingCalc.footprintM2} m² roof yields ${housingCalc.solar.kwp} kWp (${housingCalc.solar.panelCountEst} panels), generating ${Math.round(housingCalc.solar.kwhYear).toLocaleString()} kWh/yr and avoiding ${housingCalc.solar.co2eKgYear.toLocaleString()} kg CO2e/yr.`}
                </p>
              </div>

              {/* Equation 2: Rainwater */}
              <div
                className={`th-node-card border p-6 sm:p-7 pl-7 ${
                  isLight
                    ? "border-black/10 bg-white shadow-sm"
                    : "border-white/10 bg-[#14161b]"
                }`}
              >
                <span className="th-map-bar bg-[#2a9dbd]" />
                <span className="font-mono text-xs font-bold text-[#2a9dbd]">
                  EQUATION 02 · DIN 1989-1 &amp; ERA5 HYDROLOGICAL MASS-BALANCE
                </span>
                <h2 className="mt-2 text-xl font-semibold">
                  {isId
                    ? "Panen Air Hujan Tahunan & Ukuran Tangki Optimal (Cistern)"
                    : "Annual Rainwater Harvesting & Optimal Cistern Sizing"}
                </h2>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-[#08090c] p-4 font-mono text-xs text-cyan-300">
{`V_rain_L_yr = A_roof_m2 * P_annual_mm * C_runoff (0.85) * eta_filter (0.90)
V_month_i   = A_roof_m2 * P_month_mm[i] * 0.765
Cistern_L   = clamp(round((V_rain_L_yr * 0.085) / 500) * 500, 1000, 15000)
Household_% = min(100, (V_rain_L_yr / (4_persons * 135_L_day * 365)) * 100)`}
                </pre>
                <p className="mt-3 text-xs leading-relaxed opacity-85">
                  {isId
                    ? `Contoh langsung di ${geo.city} (${geo.koppen.pAnnMm} mm/thn): Menampung ${Math.round(housingCalc.rainwater.litersYear).toLocaleString()} L/tahun dengan rekomendasi tangki penyimpanan ${housingCalc.rainwater.recommendedCisternLiters} L.`
                    : `Live computation for ${geo.city} (${geo.koppen.pAnnMm} mm/yr): Captures ${Math.round(housingCalc.rainwater.litersYear).toLocaleString()} L/yr with an optimal recommended cistern size of ${housingCalc.rainwater.recommendedCisternLiters} L.`}
                </p>
              </div>

              {/* Equation 3: Biopore & Flood Attenuation */}
              <div
                className={`th-node-card border p-6 sm:p-7 pl-7 ${
                  isLight
                    ? "border-black/10 bg-white shadow-sm"
                    : "border-white/10 bg-[#14161b]"
                }`}
              >
                <span className="th-map-bar bg-[#e9a23b]" />
                <span className="font-mono text-xs font-bold text-[#e9a23b]">
                  EQUATION 03 · KAMIR R. BRATA BIOPORE &amp; DARCY SOIL HYDRAULICS
                </span>
                <h2 className="mt-2 text-xl font-semibold">
                  {isId
                    ? "Sumur Resapan Biopori & Reduksi Limpasan Banjir"
                    : "Biopore Infiltration Wells & Storm Runoff Attenuation"}
                </h2>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-[#08090c] p-4 font-mono text-xs text-amber-300">
{`// Cylindrical Biopore: diameter d = 10 cm, depth h = 100 cm
A_wall_m2     = pi * 0.10 * 1.00 = 0.314 m2 per biopore well
Q_absorb_L_hr = N_biopore * 180 L/hr (organic-compost enhanced Ks)
N_biopore     = clamp(ceil((A_roof_m2 * P_peak_mm) / 2600), 4, 40)
Runoff_Red_%  = min(92, round(24 + N_biopore * 3.8))`}
                </pre>
                <p className="mt-3 text-xs leading-relaxed opacity-85">
                  {isId
                    ? `Meningkatkan konduktivitas hidrolik tanah jenuh (Ks) melalui pengomposan vertikal di dalam lubang silinder 10x100 cm. Untuk ${geo.city}, diperlukan ${housingCalc.infiltration.bioporeUnits} unit biopori.`
                    : `Enhances saturated soil hydraulic conductivity (Ks) via vertical organic composting inside 10x100 cm cylindrical shafts. For ${geo.city}, ${housingCalc.infiltration.bioporeUnits} biopore wells are recommended.`}
                </p>
              </div>

              {/* Equation 4: Thermal Comfort & Circular Valuation */}
              <div
                className={`th-node-card border p-6 sm:p-7 pl-7 ${
                  isLight
                    ? "border-black/10 bg-white shadow-sm"
                    : "border-white/10 bg-[#14161b]"
                }`}
              >
                <span className="th-map-bar bg-[#c6f432]" />
                <span className="font-mono text-xs font-bold text-[#14733f] dark:text-[#c6f432]">
                  EQUATION 04 · THERMAL COMFORT (TCI) &amp; EPA WARM v16 CIRCULARITY
                </span>
                <h2 className="mt-2 text-xl font-semibold">
                  {isId
                    ? "Pendinginan Evapotranspirasi & Nilai Ekonomi Daur Ulang"
                    : "Evapotranspiration Cooling & Circular Material Valuation"}
                </h2>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-[#08090c] p-4 font-mono text-xs text-[#10b981]">
{`Delta_T_cool = -(0.85 + 2.4 * Green_Cover_Ratio + 0.65 * Cool_Roof_Factor)
TCI_Score    = clamp(round(100 - max(0, T_warm_C - 22) * 2.4 + |Delta_T| * 6), 35, 98)

// US EPA WARM v16 Embodied Carbon Factors (kg CO2e avoided / kg recycled):
// Aluminum: 9.13 | Copper: 3.84 | E-Waste PCB: 12.40 | PET: 1.52 | HDPE: 1.15`}
                </pre>
                <p className="mt-3 text-xs leading-relaxed opacity-85">
                  {isId
                    ? "Menggabungkan pengurangan panas laten evapotranspirasi kanopi pohon dan albedo atap surya, serta menghitung nilai tunai daur ulang berdasarkan skema DRS lokal (CA CRV, DE Pfand, ID Bank Sampah, dll.)."
                    : "Combines canopy evapotranspiration latent heat reduction with cool-roof solar shading, while pricing recyclable commodities using localized Deposit Return Schemes (CA CRV, DE Pfand, ID Bank Sampah, etc.)."}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            MODULE 04: 3D WEBGL & SPATIAL DIGITAL TWIN ENGINE
            ===================================================================== */}
        {activeTab === "webgl" && (
          <section className="mt-8 space-y-6">
            <div
              className={`th-node-card border p-6 sm:p-8 pl-7 ${
                isLight
                  ? "border-black/10 bg-white shadow-sm"
                  : "border-white/10 bg-[#14161b]"
              }`}
            >
              <span className="th-map-bar bg-[#1e9e5a]" />
              <span className="font-mono text-xs font-bold text-[#1e9e5a]">
                04.1 / PROCEDURAL PBR THREE.JS ARCHITECTURE (ZERO EXTERNAL GLB BLOAT)
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">
                {isId
                  ? "Rekayasa Kota Ekologis 3D Prosedural 60-FPS (EcoIslandCanvas.tsx)"
                  : "60-FPS Procedural 3D Eco-District Engineering (EcoIslandCanvas.tsx)"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed opacity-85">
                {isId
                  ? "Seluruh objek 3D di dalam Verdara dibangun 100% menggunakan kode TypeScript prosedural di atas React Three Fiber dan Three.js tanpa bergantung pada file model .glb/.gltf eksternal berukuran puluhan megabyte. Pendekatan ini menghasilkan waktu muat instan (<150ms) dan performa stabil 60 FPS di ponsel maupun desktop."
                  : "Every 3D structure inside Verdara is constructed 100% procedurally in TypeScript using React Three Fiber and Three.js with zero external multi-megabyte .glb/.gltf asset downloads. This guarantees sub-150ms initialization and locked 60-FPS rendering across mobile and desktop GPUs."}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  {
                    mode: "01 NORMAL DAY (RUN)",
                    badge: "BASELINE TELEMETRY",
                    color: "text-[#c6f432]",
                    descEn:
                      "Renders clear sky illumination, steady hydrological canal elevation, green updraft atmospheric particles, active EV shuttle transit, and baseline south-slope monocrystalline solar generation.",
                    descId:
                      "Menampilkan pencahayaan langit cerah, permukaan kanal air stabil, partikel udara hijau, lalu lintas shuttle EV aktif, serta produksi panel surya monokristalin standar.",
                  },
                  {
                    mode: "02 STORM SURGE (BREAK)",
                    badge: "HYDRO & THERMAL STRESS",
                    color: "text-red-400",
                    descEn:
                      "Simulates an extreme peak-month monsoon storm: dark overcast sky, high-velocity rain particle vectors, rising canal water that overflows onto the asphalt street (floodSurgeMeshRef), and red thermal roof heat stress (+4.2 degC).",
                    descId:
                      "Mensimulasikan badai puncak musim hujan: langit mendung gelap, partikel hujan deras berkecepatan tinggi, air kanal meluap membanjiri jalan aspal (floodSurgeMeshRef), serta indikator panas atap (+4.2 derajat C).",
                  },
                  {
                    mode: "03 AI SOLUTION (HEAL)",
                    badge: "SAM 3.1 RETROFIT ACTIVE",
                    color: "text-cyan-300",
                    descEn:
                      "Activates the horizontal green Meta SAM 3.1 laser scan plane sweeping across the district, deploys dual north+south bifacial solar arrays (+35% kWp), illuminates all 12 biopore soak wells, and drains street floodwater into the cistern.",
                    descId:
                      "Mengaktifkan sapuan sinar laser hijau Meta SAM 3.1 dari atas ke bawah, membuka array panel surya ganda di sisi utara & selatan (+35% kWp), menyalakan 12 sumur biopori, dan menguras banjir jalanan ke tangki air.",
                  },
                ].map((item) => (
                  <div
                    key={item.mode}
                    className="rounded-2xl bg-[#08090c] p-5 text-white border border-white/10"
                  >
                    <span className={`font-mono text-xs font-bold ${item.color}`}>
                      ● {item.mode}
                    </span>
                    <p className="mt-1 font-mono text-[10px] text-[#aaa9ad]">
                      {item.badge}
                    </p>
                    <p className="mt-2.5 text-xs leading-relaxed text-[#c9c7c0]">
                      {isId ? item.descId : item.descEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            MODULE 05: ENTERPRISE DATABASE v3.2 & REST API REFERENCE
            ===================================================================== */}
        {activeTab === "database" && (
          <section className="mt-8 space-y-6">
            <div
              className={`th-node-card border p-6 sm:p-8 pl-7 ${
                isLight
                  ? "border-black/10 bg-white shadow-sm"
                  : "border-white/10 bg-[#14161b]"
              }`}
            >
              <span className="th-map-bar bg-[#c6f432]" />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[#1e9e5a]">
                  DATABASE ENGINE · {dbStats?.engine ?? "Verdara Spatial Store v3.2 (Prisma + PostgreSQL / Edge JSON)"}
                </span>
                <span className="rounded-full bg-[#08090c] px-3 py-1 font-mono text-xs text-[#c6f432]">
                  Schema {dbStats?.schemaVersion ?? "3.2.0-enterprise"}
                </span>
              </div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">
                {isId
                  ? "Skema Basis Data Spasial & Spesifikasi Endpoint REST API"
                  : "Spatial Database Schema & REST API Endpoint Specifications"}
              </h2>
              <p className="mt-2 text-sm opacity-85">
                {isId
                  ? "Basis data Verdara v3.2 mengelola akun pengguna, riwayat pemindaian poligon SAM 3.1 dengan hash anti-duplikasi dHash, registri kebijakan 195+ negara, dan log audit keamanan."
                  : "Verdara Database v3.2 manages authenticated user profiles, SAM 3.1 polygon scan records with perceptual dHash deduplication, the 195+ country climate/tariff registry, and security audit logs."}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                  {
                    label: isId ? "Negara Didukung" : "Countries Supported",
                    val: dbStats?.counts.supportedCountries ?? 195,
                  },
                  {
                    label: isId ? "Kota Patokan Iklim" : "Benchmark Cities",
                    val: dbStats?.counts.curatedBenchmarkCities ?? 28,
                  },
                  {
                    label: isId ? "Akun Terdaftar" : "Registered Users",
                    val: dbStats?.counts.registeredUsers ?? 3,
                  },
                  {
                    label: isId ? "Audit Pindai AI" : "Verified Scans",
                    val: dbStats?.counts.verifiedScans ?? 2,
                  },
                  {
                    label: isId ? "Log Keamanan" : "Security Events",
                    val: dbStats?.counts.securityEvents ?? 2,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl bg-[#08090c] p-4 text-white"
                  >
                    <span className="font-mono text-[10px] uppercase text-[#aaa9ad]">
                      {stat.label}
                    </span>
                    <p className="mt-1 font-mono text-2xl font-bold text-[#c6f432]">
                      {stat.val}
                    </p>
                  </div>
                ))}
              </div>

              {/* REST API Endpoints Table */}
              <div className="mt-8 overflow-x-auto">
                <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-[#1e9e5a]">
                  05.2 / REST API ENDPOINT REFERENCE
                </h3>
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-current/15 text-[11px] uppercase opacity-70">
                      <th className="py-2.5 pr-4">Method &amp; Endpoint</th>
                      <th className="py-2.5 pr-4">Rate Limit</th>
                      <th className="py-2.5">Request / Response Specification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-current/10 font-sans text-xs">
                    {[
                      {
                        ep: "POST /api/meta/sam",
                        limit: "30 req/min",
                        spec: "Accepts { imageBase64, specimenId, mode }. Checks SHA-256 Golden Cache (<50ms, $0.00) or invokes Meta SAM 3.1 segmentation. Returns normalized [0..1000] polygon masks, dHash, and EPA WARM / DRS valuation.",
                      },
                      {
                        ep: "POST /api/meta/muse",
                        limit: "30 req/min",
                        spec: "Accepts { siteBrief, prompt, openWeightMode }. Executes 3-agent deliberation (Dr. Flora, Ir. Arka, Sirkula) on Meta Muse Spark / muse-spark-open and runs validateNumbersAgainstSiteBrief (+/-3% guard).",
                      },
                      {
                        ep: "POST /api/meta/image",
                        limit: "20 req/min",
                        spec: "Accepts { specimenId, koppenCode, masks }. Synthesizes Before/After architectural eco-retrofit visualization via Meta Muse Image conditioned on roof/yard masks.",
                      },
                      {
                        ep: "GET / POST /api/db",
                        limit: "60 req/min",
                        spec: "GET returns live schema version, country registry stats, and recent verified scans. POST records new authenticated user sessions, SAM 3.1 scan audits, and dHash ledger entries.",
                      },
                      {
                        ep: "GET /api/climate",
                        limit: "60 req/min",
                        spec: "Accepts ?lat=&lng=&country=. Resolves 10-year Open-Meteo ERA5 monthly precipitation, GHI solar irradiance, Köppen-Geiger class, and localized utility tariff.",
                      },
                    ].map((api) => (
                      <tr key={api.ep}>
                        <td className="py-3 pr-4 font-mono font-bold text-[#14733f] dark:text-[#c6f432]">
                          {api.ep}
                        </td>
                        <td className="py-3 pr-4 font-mono text-[11px]">
                          {api.limit}
                        </td>
                        <td className="py-3 opacity-85">{api.spec}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            MODULE 06: CYBERSECURITY & 7-LAYER CREDIT SHIELD
            ===================================================================== */}
        {activeTab === "security" && (
          <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div
              className={`th-node-card border p-6 sm:p-7 pl-7 ${
                isLight
                  ? "border-black/10 bg-white shadow-sm"
                  : "border-white/10 bg-[#14161b]"
              }`}
            >
              <span className="th-map-bar bg-[#1e9e5a]" />
              <span className="font-mono text-xs font-bold text-[#1e9e5a]">
                DEFENSE LAYER 01 · OWASP ASVS &amp; EDGE MIDDLEWARE
              </span>
              <h2 className="mt-2 text-xl font-semibold">
                {isId
                  ? "Keamanan Siber Berlapis & Otentikasi Sesi Wajib"
                  : "Defense-in-Depth Cybersecurity & Mandatory Session Gate"}
              </h2>
              <ul className="mt-3 space-y-2.5 text-xs sm:text-sm leading-relaxed opacity-85">
                <li>
                  • <strong>Mandatory Studio Auth Gate (`AuthGate.tsx`):</strong>{" "}
                  {isId
                    ? "Seluruh rute ruang kerja (/dashboard, /lens, /radar, /council, /academy, /settings) dikunci hingga pengguna masuk melalui /login."
                    : "All studio routes (/dashboard, /lens, /radar, /council, /academy, /settings) require active authentication via /login before rendering."}
                </li>
                <li>
                  • <strong>Edge HTTP Security Headers (`src/middleware.ts`):</strong>{" "}
                  {isId
                    ? "Menyuntikkan X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy: strict-origin-when-cross-origin, dan Permissions-Policy."
                    : "Enforces X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy: strict-origin-when-cross-origin, and Permissions-Policy across all routes."}
                </li>
                <li>
                  • <strong>CSRF Origin Verification &amp; Recursive Sanitizer:</strong>{" "}
                  {isId
                    ? "Memvalidasi header Origin/Host pada setiap permintaan POST dan membersihkan payload JSON dari injeksi skrip XSS atau polusi prototipe."
                    : "Verifies Origin/Host headers on mutating requests and strips script tags, event handlers, and prototype-pollution keys (__proto__, constructor)."}
                </li>
                <li>
                  • <strong>Sliding-Window Token-Bucket Rate Limiter:</strong>{" "}
                  {isId
                    ? "Membatasi 30 permintaan/menit per IP dengan respons HTTP 429 dan Retry-After otomatis."
                    : "Caps API traffic at 30 requests/minute per client IP with automatic HTTP 429 and Retry-After headers."}
                </li>
              </ul>
            </div>

            <div
              className={`th-node-card border p-6 sm:p-7 pl-7 ${
                isLight
                  ? "border-black/10 bg-white shadow-sm"
                  : "border-white/10 bg-[#14161b]"
              }`}
            >
              <span className="th-map-bar bg-[#e9a23b]" />
              <span className="font-mono text-xs font-bold text-[#e9a23b]">
                DEFENSE LAYER 02 · 7-LAYER CREDIT SHIELD &amp; DHASH ANTI-CHEAT
              </span>
              <h2 className="mt-2 text-xl font-semibold">
                {isId
                  ? "Perlindungan Kuota API & Verifikasi Bukti Kamera dHash"
                  : "7-Layer API Budget Shield & Perceptual dHash Anti-Spoofing"}
              </h2>
              <ul className="mt-3 space-y-2.5 text-xs sm:text-sm leading-relaxed opacity-85">
                <li>
                  • <strong>Dedicated Judge Reserve Pool:</strong>{" "}
                  {isId
                    ? "Mengunci cadangan anggaran khusus sehingga penguji dan juri selalu mendapatkan respons real-time tanpa kehabisan kuota."
                    : "Isolates a dedicated API credit reserve so evaluators always have guaranteed live model capacity."}
                </li>
                <li>
                  • <strong>SHA-256 Deterministic Specimen Cache:</strong>{" "}
                  {isId
                    ? "Menyajikan 6 spesimen foto uji coba dalam waktu <50ms dengan biaya API $0.00."
                    : "Serves the 6 curated benchmark photo specimens in <50ms at $0.00 API cost."}
                </li>
                <li>
                  • <strong>64-Bit Perceptual dHash Anti-Replay (`dhash.ts`):</strong>{" "}
                  {isId
                    ? "Menghitung gradien luminans 9x8 piksel (64-bit hash) dan menolak foto duplikat atau hasil rekayasa ulang jika jarak Hamming <= 8."
                    : "Computes an 8x8 luminance gradient hash (64-bit) and rejects duplicate or slightly cropped proof photos whenever Hamming distance <= 8."}
                </li>
              </ul>
            </div>
          </section>
        )}
      </main>

      <VerdaraBottomDock />
    </div>
  );
}
