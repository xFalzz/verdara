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
import { formatCurrency, formatVolume } from "@/lib/science/units";

type DocTab = "architecture" | "meta_ai" | "physics" | "database" | "security";

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

  const tabs: { id: DocTab; code: string; labelEn: string; labelId: string }[] =
    [
      {
        id: "architecture",
        code: "01",
        labelEn: "System Architecture",
        labelId: "Arsitektur Sistem",
      },
      {
        id: "meta_ai",
        code: "02",
        labelEn: "Meta AI Stack",
        labelId: "Model AI Meta",
      },
      {
        id: "physics",
        code: "03",
        labelEn: "Solar & Rain Physics",
        labelId: "Rumus Fisika & Iklim",
      },
      {
        id: "database",
        code: "04",
        labelEn: "Enterprise Database v3.2",
        labelId: "Basis Data Global v3.2",
      },
      {
        id: "security",
        code: "05",
        labelEn: "Cybersecurity & Credit Shield",
        labelId: "Keamanan Siber & Perisai Kredit",
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
      <header className="sticky top-0 z-40 border-b border-current/8 bg-inherit/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] flex-nowrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div className="flex min-w-0 shrink-0 items-center gap-3">
            <Link href="/" className="flex min-h-[40px] items-center gap-2.5">
              <VerdaraLogo size={36} />
              <div className="flex flex-col text-left">
                <span className="dovv-wordmark text-xl sm:text-2xl tracking-tight">
                  VERDARA
                </span>
                <span className="hidden font-mono text-[9px] uppercase tracking-[0.14em] opacity-60 sm:block">
                  Technical Documentation
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
              {isId ? "Dokumen" : "Documentation"}
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
              {isId ? "Kota 3D" : "3D Studio"}
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setLocale(isId ? "en" : "id")}
              className="min-h-[36px] cursor-pointer rounded-full border border-current/15 px-3 font-mono text-xs font-semibold"
            >
              {locale.toUpperCase()}
            </button>
            <button
              type="button"
              onClick={() =>
                setUnits(units === "metric" ? "imperial" : "metric")
              }
              className="hidden min-h-[36px] cursor-pointer rounded-full border border-current/15 px-3 font-mono text-xs sm:inline-flex items-center"
            >
              {units === "metric" ? "m² / L" : "ft² / gal"}
            </button>
            <button
              type="button"
              onClick={() => setTheme(isLight ? "dark" : "light")}
              className="min-h-[36px] cursor-pointer rounded-full border border-current/15 px-3 font-mono text-xs"
            >
              {isLight ? "Day" : "Night"}
            </button>
            <Link
              href={isAuthenticated ? "/dashboard" : "/login?next=/dashboard"}
              className="zeggo-btn flex min-h-[38px] items-center gap-1.5 rounded-full bg-[#08090c] px-4 text-xs font-semibold text-[#c6f432]"
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
        {/* Hero Banner */}
        <div className="rounded-[28px] bg-[#08090c] p-6 sm:p-10 text-white shadow-[inset_0_0_0_1.5px_#232730]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="rounded-full bg-[#c6f432]/15 px-3.5 py-1 font-mono text-xs font-semibold text-[#c6f432]">
              VERDARA ARCHITECTURE &amp; SCIENCE DOCUMENTATION · v3.2
            </span>
            <Link
              href="/faq"
              className="font-mono text-xs text-[#c6f432] underline hover:opacity-80"
            >
              {isId ? "Lihat Halaman Tanya Jawab (FAQ) →" : "Jump to FAQ Page →"}
            </Link>
          </div>

          <h1 className="dovv-wordmark mt-4 text-4xl sm:text-7xl text-white">
            {isId
              ? "DOKUMENTASI TEKNIS & ARSITEKTUR VERDARA"
              : "TECHNICAL & SCIENTIFIC DOCUMENTATION"}
          </h1>
          <p className="mt-3 max-w-3xl text-sm sm:text-base leading-relaxed text-[#c9c7c0]">
            {isId
              ? "Panduan lengkap mengenai arsitektur sistem Verdara, integrasi model visi komputer Meta SAM 3.1, penalaran multi-agen Meta Muse Spark, rumus fisika NREL PVWatts v8 & hidrologi ERA5, basis data 195+ negara, serta standar keamanan siber."
              : "Complete reference covering Verdara's spatial computing architecture, Meta SAM 3.1 zero-shot vision segmentation, Meta Muse Spark 3-specialist orchestration, NREL PVWatts v8 & ERA5 hydrological equations, 195+ country database schema, and cybersecurity defense-in-depth."}
          </p>

          {/* Section Selector Tabs */}
          <div className="mt-7 flex flex-wrap gap-2 border-t border-white/10 pt-5">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-[40px] cursor-pointer rounded-full px-4 py-1.5 font-mono text-xs font-medium transition ${
                    active
                      ? "bg-[#c6f432] font-bold text-[#080808]"
                      : "bg-[#151821] text-[#c9c7c0] hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {tab.code} · {isId ? tab.labelId : tab.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 01: SYSTEM ARCHITECTURE */}
        {activeTab === "architecture" && (
          <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <div
                className={`th-node-card border p-6 pl-7 ${
                  isLight
                    ? "border-black/10 bg-white shadow-sm"
                    : "border-white/10 bg-[#14161b]"
                }`}
              >
                <span className="th-map-bar bg-[#1e9e5a]" />
                <span className="font-mono text-xs font-bold text-[#1e9e5a]">
                  01 / CORE PIPELINE ARCHITECTURE
                </span>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  {isId
                    ? "Alur 4 Tahap: Dari Piksel Kamera ke Kota 3D Hidup"
                    : "4-Stage Pipeline: From Camera Pixels to a Living 3D District"}
                </h2>
                <p className="mt-2 text-sm leading-relaxed opacity-85">
                  {isId
                    ? "Verdara dirancang agar AI tidak pernah mengarang angka. Setiap perhitungan energi surya, panen air hujan, dan nilai ekonomi barang daur ulang dihitung oleh mesin fisika deterministik terlebih dahulu, kemudian disuntikkan ke dalam konteks terkunci (SITE_BRIEF) untuk dijelaskan oleh 3 agen pakar Meta Muse Spark."
                    : "Verdara is engineered so the LLM never guesses or hallucinates numbers. All rooftop solar output, rainwater capture, and material recovery values are computed first by deterministic physics engines, then injected as an immutable SITE_BRIEF into the Meta Muse Spark 3-specialist council."}
                </p>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    {
                      step: "STAGE 01 · GEOSPATIAL & CLIMATE ENGINE",
                      descEn:
                        "Resolves any of 195+ countries and 100,000+ cities via Open-Meteo ERA5 10-year monthly precipitation, temperature, GHI solar irradiance, and Köppen-Geiger climate classification.",
                      descId:
                        "Memetakan 195+ negara dan 100.000+ kota melalui data curah hujan bulanan ERA5 10 tahun, suhu, radiasi matahari (GHI), dan klasifikasi iklim Köppen-Geiger.",
                    },
                    {
                      step: "STAGE 02 · META SAM 3.1 SPATIAL VISION",
                      descEn:
                        "Extracts pixel-accurate polygon masks for roof slabs, rainwater downspouts, native flora, and recyclable items (PET, HDPE, Aluminum, Copper, E-Waste PCB).",
                      descId:
                        "Mengekstrak poligon presisi untuk bidang atap, pipa talang hujan, vegetasi lokal, serta barang daur ulang (PET, Aluminium, Tembaga, PCB Elektronik).",
                    },
                    {
                      step: "STAGE 03 · DETERMINISTIC PHYSICS & VALUATION",
                      descEn:
                        "Computes kWp solar capacity, kWh/yr generation (NREL PVWatts v8), rainwater harvest liters/yr, biopore count, and local currency cashback.",
                      descId:
                        "Menghitung kapasitas surya kWp, listrik kWh/tahun (NREL PVWatts v8), liter panen air hujan/tahun, jumlah biopori, dan nilai uang lokal.",
                    },
                    {
                      step: "STAGE 04 · META MUSE SPARK COUNCIL & 3D WEBGL",
                      descEn:
                        "Dr. Flora, Ir. Arka, and Sirkula synthesize a verified retrofit blueprint (+/-3% fact guard) and update the 60-FPS 3D Living Eco-District.",
                      descId:
                        "Dr. Flora, Ir. Arka, dan Sirkula menyusun cetak biru aksi (terverifikasi +/-3%) dan memperbarui Kota Ekologis 3D 60-FPS secara langsung.",
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="rounded-2xl bg-[#08090c] p-4 text-white"
                    >
                      <span className="font-mono text-[11px] font-bold text-[#c6f432]">
                        {item.step}
                      </span>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#c9c7c0]">
                        {isId ? item.descId : item.descEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-4">
              <div className="rounded-[24px] bg-[#08090c] p-6 text-white shadow-[inset_0_0_0_1px_#232730]">
                <span className="font-mono text-xs text-[#c6f432]">
                  LIVE TELEMETRY SNAPSHOT · {geo.city.toUpperCase()}
                </span>
                <h3 className="mt-2 text-xl font-semibold">
                  {geo.city} ({geo.countryCode} · {geo.koppen.code})
                </h3>
                <dl className="mt-4 space-y-2.5 border-t border-white/10 pt-4 font-mono text-xs">
                  <div className="flex justify-between">
                    <dt className="text-[#aaa9ad]">Solar Array Output:</dt>
                    <dd className="font-bold text-[#c6f432]">
                      {housingCalc.solar.kwp} kWp ({Math.round(housingCalc.solar.kwhYear)} kWh/yr)
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#aaa9ad]">Annual Savings:</dt>
                    <dd className="font-bold text-[#1e9e5a]">
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
                    <dt className="text-[#aaa9ad]">Biopore Wells:</dt>
                    <dd className="font-bold text-amber-300">
                      {housingCalc.infiltration.bioporeUnits} units
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#aaa9ad]">API Pool Remaining:</dt>
                    <dd className="font-bold text-white">
                      ${remainingCredit} / $150.00
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>
        )}

        {/* TAB 02: META AI STACK */}
        {activeTab === "meta_ai" && (
          <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            {[
              {
                badge: "MODEL 01 · COMPUTER VISION",
                title: "Meta SAM 3.1 (Segment Anything Model 3.1)",
                color: "bg-[#1e9e5a]",
                descEn:
                  "Powers zero-shot concept segmentation in the Omni-Spatial Lens (/lens) and Field Proof Verifier (/academy). Identifies solar roof polygons, gutter conduits, native flora, and recyclable commodities with bounding boxes, polygon masks, and confidence scores.",
                descId:
                  "Menggerakkan segmentasi objek di Lensa Spasial (/lens) dan Verifikasi Bukti Lapangan (/academy). Mengenali poligon atap surya, talang air, tanaman peneduh, serta komoditas daur ulang beserta kotak batas dan skor akurasi.",
              },
              {
                badge: "MODEL 02 · MULTI-AGENT REASONING",
                title: "Meta Muse Spark (Flagship Reasoning Model)",
                color: "bg-[#2a9dbd]",
                descEn:
                  "Orchestrates the 3-Specialist Council (/council): Dr. Flora (Urban Botanist), Ir. Arka (Solar & Hydrological Engineer), and Sirkula (Circular Economist). Grounded strictly in the deterministic SITE_BRIEF with a +/-3% numerical fact-check guard.",
                descId:
                  "Mengorkestrasi Dewan 3 Pakar AI (/council): Dr. Flora (Ahli Botani Kota), Ir. Arka (Insinyur Surya & Hidrologi), dan Sirkula (Ekonom Sirkular). Terkunci pada data SITE_BRIEF dengan pengawas fakta numerik +/-3%.",
              },
              {
                badge: "MODEL 03 · ARCHITECTURAL SYNTHESIS",
                title: "Meta Muse Image (Generative Eco-Retrofit)",
                color: "bg-[#c6f432]",
                descEn:
                  "Generates interactive Before/After architectural visual comparisons showing how a user's scanned plot looks once retrofitted with monocrystalline solar panels, rainwater cisterns, and bioswale rain gardens.",
                descId:
                  "Menghasilkan perbandingan visual Sebelum/Sesudah interaktif yang menampilkan bagaimana atap dan halaman rumah terlihat setelah dipasang panel surya, tangki air hujan, dan taman resapan biopori.",
              },
              {
                badge: "MODEL 04 · OPEN-WEIGHT TRANSPARENCY",
                title: "Meta muse-spark-open (Open-Weight Mode)",
                color: "bg-[#e9a23b]",
                descEn:
                  "Allows judges and researchers to toggle between hosted Meta Muse Spark and open-weight muse-spark-open inference for reproducible municipal auditing and sovereign self-hosted deployments.",
                descId:
                  "Memungkinkan juri dan peneliti beralih antara Meta Muse Spark terkelola dan mode open-weight muse-spark-open untuk transparansi audit publik dan penerapan mandiri.",
              },
            ].map((m) => (
              <div
                key={m.title}
                className={`th-node-card border p-6 pl-7 ${
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
                <p className="mt-2 text-sm leading-relaxed opacity-85">
                  {isId ? m.descId : m.descEn}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* TAB 03: PHYSICS & EQUATIONS */}
        {activeTab === "physics" && (
          <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div
              className={`th-node-card border p-6 pl-7 ${
                isLight
                  ? "border-black/10 bg-white shadow-sm"
                  : "border-white/10 bg-[#14161b]"
              }`}
            >
              <span className="th-map-bar bg-[#1e9e5a]" />
              <span className="font-mono text-xs font-bold text-[#1e9e5a]">
                EQUATION 01 · NREL PVWATTS V8 SOLAR MODEL
              </span>
              <h2 className="mt-2 text-xl font-semibold">
                {isId
                  ? "Perhitungan Kapasitas & Produksi Listrik Panel Surya"
                  : "Rooftop Solar Capacity & Annual Energy Yield"}
              </h2>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-[#08090c] p-4 font-mono text-xs text-[#c6f432]">
{`A_solar = A_roof_m2 * f_usable (0.60)
P_kwp   = A_solar * eta_module (0.205 kWp/m2)
E_kwh   = P_kwp * GHI_day * 365 * PR (0.80) * f_temp`}
              </pre>
              <p className="mt-3 text-xs leading-relaxed opacity-80">
                {isId
                  ? "Memperhitungkan penurunan efisiensi suhu sel surya (-0.38%/°C di atas 25°C) berdasarkan suhu maksimum bulan terpanas di kota Anda."
                  : "Includes cell temperature derating (-0.38%/degC above 25 degC) derived from the warmest-month maximum temperature of the active city."}
              </p>
            </div>

            <div
              className={`th-node-card border p-6 pl-7 ${
                isLight
                  ? "border-black/10 bg-white shadow-sm"
                  : "border-white/10 bg-[#14161b]"
              }`}
            >
              <span className="th-map-bar bg-[#2a9dbd]" />
              <span className="font-mono text-xs font-bold text-[#2a9dbd]">
                EQUATION 02 · ERA5 HYDROLOGICAL MASS-BALANCE
              </span>
              <h2 className="mt-2 text-xl font-semibold">
                {isId
                  ? "Panen Air Hujan & Kapasitas Sumur Resapan Biopori"
                  : "Rainwater Harvesting & Biopore Infiltration Sizing"}
              </h2>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-[#08090c] p-4 font-mono text-xs text-cyan-300">
{`V_rain_L = A_roof_m2 * P_annual_mm * C_runoff (0.85) * eta_filter (0.90)
N_biopore = ceil((A_roof_m2 * P_peak_month_mm * 0.001) / 0.36)`}
              </pre>
              <p className="mt-3 text-xs leading-relaxed opacity-80">
                {isId
                  ? "Menentukan ukuran tangki air hujan optimal (L) dan jumlah lubang resapan biopori untuk mencegah genangan saat puncak musim hujan."
                  : "Sizes the recommended cistern storage volume (L) and biopore soak pits needed to prevent street runoff during peak storm months."}
              </p>
            </div>
          </section>
        )}

        {/* TAB 04: ENTERPRISE DATABASE v3.2 */}
        {activeTab === "database" && (
          <section className="mt-8 space-y-6">
            <div
              className={`th-node-card border p-6 pl-7 ${
                isLight
                  ? "border-black/10 bg-white shadow-sm"
                  : "border-white/10 bg-[#14161b]"
              }`}
            >
              <span className="th-map-bar bg-[#c6f432]" />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[#1e9e5a]">
                  DATABASE ENGINE · {dbStats?.engine ?? "Verdara Spatial Store v3.2"}
                </span>
                <span className="rounded-full bg-[#08090c] px-3 py-1 font-mono text-xs text-[#c6f432]">
                  Schema {dbStats?.schemaVersion ?? "3.2.0-enterprise"}
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-semibold">
                {isId
                  ? "Arsitektur Basis Data Spasial & Kebijakan 195+ Negara"
                  : "Global Spatial Database & 195+ Country Policy Registry"}
              </h2>
              <p className="mt-2 text-sm opacity-85">
                {isId
                  ? "Basis data Verdara telah ditingkatkan ke v3.2, mencakup tabel pengguna terotentikasi, log audit pemindaian SAM 3.1 dengan deduplikasi dHash, katalog 28 kota patokan dunia, serta resolusi otomatis 195+ negara (mata uang, tarif listrik, faktor emisi grid, dan titik daur ulang)."
                  : "Verdara's database has been upgraded to v3.2, uniting authenticated user records, SAM 3.1 scan audit logs with dHash deduplication, 28 curated global benchmark cities, and an automatic 195+ country policy resolver (local currency, electricity tariff, grid carbon intensity, and recycling hubs)."}
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
            </div>
          </section>
        )}

        {/* TAB 05: CYBERSECURITY & CREDIT SHIELD */}
        {activeTab === "security" && (
          <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div
              className={`th-node-card border p-6 pl-7 ${
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
                  ? "Keamanan Siber Berlapis & Otentikasi Sesi"
                  : "Cybersecurity Hardening & Authenticated Session Gate"}
              </h2>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm leading-relaxed opacity-85">
                <li>
                  • <strong>Mandatory Login Gate:</strong> Seluruh rute studio (`/dashboard`, `/lens`, `/radar`, `/council`, `/academy`, `/settings`) dikunci hingga pengguna melakukan otentikasi di `/login`.
                </li>
                <li>
                  • <strong>HTTP Security Headers (`src/middleware.ts`):</strong> Menerapkan `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, dan `Permissions-Policy`.
                </li>
                <li>
                  • <strong>CSRF Origin Verification &amp; Input Sanitization:</strong> Memblokir permintaan lintas-domain ilegal dan membersihkan seluruh input dari potensi injeksi XSS.
                </li>
                <li>
                  • <strong>Sliding-Window Token-Bucket Rate Limiter:</strong> Melindungi API dari penyalahgunaan otomatis atau serangan banjir permintaan (*DoS*).
                </li>
              </ul>
            </div>

            <div
              className={`th-node-card border p-6 pl-7 ${
                isLight
                  ? "border-black/10 bg-white shadow-sm"
                  : "border-white/10 bg-[#14161b]"
              }`}
            >
              <span className="th-map-bar bg-[#e9a23b]" />
              <span className="font-mono text-xs font-bold text-[#e9a23b]">
                DEFENSE LAYER 02 · 7-LAYER $150 CREDIT SHIELD
              </span>
              <h2 className="mt-2 text-xl font-semibold">
                {isId
                  ? "Perlindungan Anggaran $150 Meta API & Anti-Cheat dHash"
                  : "7-Layer $150 Meta API Budget Shield & dHash Anti-Cheat"}
              </h2>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm leading-relaxed opacity-85">
                <li>
                  • <strong>$35.00 Locked Judge Reserve:</strong> Menjamin juri Meta Hackathon selalu memiliki kuota API aktif kapan pun mereka menguji aplikasi.
                </li>
                <li>
                  • <strong>SHA-256 + 64-Bit Perceptual dHash Cache:</strong> Menyajikan 6 spesimen demo utama dalam waktu `&lt;50ms` dengan biaya `$0.00`.
                </li>
                <li>
                  • <strong>Perceptual dHash Anti-Replay:</strong> Mencegah pengiriman ulang foto bukti lapangan yang sama (jarak Hamming `&lt;= 8` ditolak otomatis).
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
