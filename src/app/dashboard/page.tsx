"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StudioShell from "@/components/ui/StudioShell";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import {
  formatArea,
  formatCurrency,
  formatVolume,
} from "@/lib/science/units";
import EcoIslandCanvas from "@/components/three/EcoIslandCanvas";

export default function DashboardPage() {
  const {
    locale,
    units,
    theme,
    isJudgeDemo,
    displayName,
    geo,
    housingCalc,
    xp,
    level,
    progressPct,
    unlockedItems,
    scanHistory,
    loginAsJudgeDemo,
    resetToStarterPlot,
  } = useVerdaraStore();

  const [isNight, setIsNight] = useState(false);

  const isId = locale === "id";
  const isLight = theme === "light";

  useEffect(() => {
    setIsNight(theme === "dark");
  }, [theme]);

  const townModules = [
    {
      code: "solar_array",
      titleEn: "Monocrystalline Rooftop Solar Array",
      titleId: "Array Surya Atap Monokristalin",
      metric: `${housingCalc.solar.kwp} kWp · ${Math.round(
        housingCalc.solar.kwhYear
      ).toLocaleString()} kWh/yr`,
      sub: `${formatCurrency(
        housingCalc.solar.savingsYear,
        housingCalc.solar.currency,
        locale
      )}/yr savings`,
      gradeColor: "#1e9e5a",
    },
    {
      code: "rain_cistern",
      titleEn: "Rainwater Cistern & Copper Conduit",
      titleId: "Tangki Sisterna & Pipa Tembaga Air Hujan",
      metric: `${formatVolume(
        housingCalc.rainwater.litersYear,
        units,
        locale
      )}/yr`,
      sub: `${housingCalc.rainwater.recommendedCisternLiters.toLocaleString()} L buffer tank`,
      gradeColor: "#2a9dbd",
    },
    {
      code: "compost_dome",
      titleEn: "Aerobic Bio-Compost Dome & Biopores",
      titleId: "Kubah Bio-Kompos Aerobik & Biopori",
      metric: `${housingCalc.infiltration.bioporeUnits} Biopore Shafts`,
      sub: `Infiltrates ${housingCalc.infiltration.infiltrationRateLitersHr.toLocaleString()} L/hr`,
      gradeColor: "#1e9e5a",
    },
    {
      code: "sorting_station",
      titleEn: "3-Stream Circular Recovery Depot",
      titleId: "Depot Pemilahan Sirkular 3-Aliran",
      metric: `${geo.hubs.length} Verified OSM Hubs`,
      sub: `Nearest: ${geo.hubs[0]?.distanceKm ?? 1.3} km away`,
      gradeColor: "#e9a23b",
    },
  ];

  return (
    <StudioShell>
      <div className="space-y-8">
        {/* 1. TOP TITLE & TOWNHOUSE SPECIMEN CONTROLS */}
        <div className="flex flex-wrap items-end justify-between gap-4 pt-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] opacity-60">
              {isId
                ? `01 / Kembaran Spasial 3D · ${displayName}`
                : `01 / Living Town Map · ${displayName}`}
            </p>
            <h1 className="dovv-wordmark mt-1 text-5xl sm:text-7xl">
              {geo.city} ({geo.koppen.code})
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsNight(!isNight)}
              className="min-h-[44px] cursor-pointer rounded-full bg-[#080808] px-4 text-xs font-medium text-white shadow-[inset_0_0_0_1px_#2c2c2c] transition hover:bg-[#1c1c1c]"
            >
              {isNight ? "Lighting: Night Glow" : "Lighting: Daylight"}
            </button>
            <button
              type="button"
              onClick={
                isJudgeDemo ? resetToStarterPlot : loginAsJudgeDemo
              }
              className="min-h-[44px] cursor-pointer rounded-full bg-[#c6f432] px-4 text-xs font-semibold text-[#080808] transition hover:bg-[#d4f759]"
            >
              {isJudgeDemo
                ? isId
                  ? "Reset ke Plot Awal (Lv.1)"
                  : "Switch to Starter Plot (Lv.1)"
                : isId
                ? "Muat Kota Demo Juri (Lv.5)"
                : "Load Lv.5 Judge Demo Town"}
            </button>
          </div>
        </div>

        {/* 2. DOVV STAGE FRAME + TOWNHOUSE.DEV LIVING TOWN CANVAS */}
        <div className="dovv-stage-frame h-[500px] w-full sm:h-[600px]">
          <EcoIslandCanvas
            biome={geo.biome}
            level={level}
            isNight={isNight}
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

          {/* Townhouse Bottom-Left Floating Summary Card */}
          <div
            className={`absolute bottom-4 left-4 right-4 z-10 rounded-[16px] border p-5 shadow-2xl backdrop-blur-md sm:right-auto sm:bottom-6 sm:left-6 sm:w-[440px] ${
              isLight
                ? "border-[#151515]/10 bg-white/95 text-[#151515]"
                : "border-white/10 bg-[#16171a]/95 text-[#f2f1ec]"
            }`}
          >
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#1e9e5a]">
                <span className="h-2 w-2 rounded-full bg-[#1e9e5a]" />
                TOWN LEVEL {level} ({xp} XP · {progressPct}%)
              </span>
              <span className="opacity-65">
                {unlockedItems.length} Modules Active
              </span>
            </div>

            <p className="townhouse-title mt-2 text-2xl">
              {formatArea(housingCalc.footprintM2, units, locale)} roof ·{" "}
              {housingCalc.solar.kwp} kWp solar
            </p>
            <p className="mt-1 text-xs opacity-75">
              {isId
                ? "Putar 360 derajat untuk memeriksa panel surya atap, pipa air hujan, tangki sisterna, dan sumur resapan biopori."
                : "Drag 360 degrees to inspect rooftop solar panels, copper rainwater conduits, cistern tank, and biopore shafts."}
            </p>

            <div className="mt-3.5 flex flex-wrap gap-2">
              <Link
                href="/lens"
                className="inline-flex min-h-[40px] items-center rounded-[8px] bg-[#080808] px-3.5 text-xs font-medium text-white"
              >
                {isId ? "Pindai dengan SAM 3.1" : "Scan with SAM 3.1"}
              </Link>
              <Link
                href="/council"
                className="inline-flex min-h-[40px] items-center rounded-[8px] border border-current/20 px-3.5 text-xs font-medium"
              >
                {isId ? "Sidang Dewan AI" : "Convene Council"}
              </Link>
            </div>
          </div>
        </div>

        {/* 3. DOVV STUDIO 2-COLUMN BENTO CARDS FOR MODULES & TELEMETRY */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Card A: Townhouse Graded Systems */}
          <div className="dovv-card">
            <div className="dovv-card-media p-6 space-y-3">
              <div className="flex items-center justify-between font-mono text-xs text-[#aaa9ad]">
                <span>02 / GRADED TOWN INFRASTRUCTURE</span>
                <span className="text-[#c6f432]">
                  {unlockedItems.length} / 6 UNLOCKED
                </span>
              </div>

              <div className="space-y-2.5 pt-2">
                {townModules.map((mod) => {
                  const mounted =
                    unlockedItems.includes(mod.code) || level >= 3;
                  return (
                    <div
                      key={mod.code}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-[#111317] p-4 shadow-[inset_0_0_0_1px_#252830]"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: mounted
                                ? mod.gradeColor
                                : "#6b6b66",
                            }}
                          />
                          <h2 className="text-sm font-semibold text-white">
                            {isId ? mod.titleId : mod.titleEn}
                          </h2>
                        </div>
                        <p className="mt-1 font-mono text-xs text-[#aaa9ad]">
                          {mod.metric} · {mod.sub}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 font-mono text-[11px] font-semibold ${
                          mounted
                            ? "bg-[#c6f432]/15 text-[#c6f432]"
                            : "bg-white/10 text-[#aaa9ad]"
                        }`}
                      >
                        {mounted ? "MOUNTED" : "LOCKED"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-2">
              <span className="text-xl font-normal tracking-[-0.03em]">
                {isId
                  ? "Status Infrastruktur Kapling"
                  : "Plot Infrastructure Status"}
              </span>
              <Link href="/academy" className="dovv-chip hover:text-white">
                {isId ? "Buka Modul via Bukti SAM 3.1 →" : "Unlock via SAM 3.1 Proof →"}
              </Link>
            </div>
          </div>

          {/* Card B: Deterministic Physics & Session Scan Ledger */}
          <div className="dovv-card">
            <div className="dovv-card-media p-6 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-[#aaa9ad]">
                  <span>03 / NREL PVWATTS V8 & HYDROLOGY LEDGER</span>
                  <span>{geo.policy.currency} TARIFF</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#111317] p-4 shadow-[inset_0_0_0_1px_#252830]">
                    <span className="font-mono text-[10px] text-[#aaa9ad]">
                      ANNUAL SOLAR SAVINGS
                    </span>
                    <p className="mt-1 font-mono text-2xl font-bold text-[#c6f432]">
                      {formatCurrency(
                        housingCalc.solar.savingsYear,
                        housingCalc.solar.currency,
                        locale
                      )}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-[#c9c7c0]">
                      {housingCalc.solar.co2eKgYear} kg CO2e avoided/yr
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#111317] p-4 shadow-[inset_0_0_0_1px_#252830]">
                    <span className="font-mono text-[10px] text-[#aaa9ad]">
                      COOL ROOF RETROFIT DROP
                    </span>
                    <p className="mt-1 font-mono text-2xl font-bold text-cyan-300">
                      -{housingCalc.thermal.coolingTargetDegC}°C
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-[#c9c7c0]">
                      TCI {housingCalc.thermal.tciScore} →{" "}
                      {Math.min(99, housingCalc.thermal.tciScore + 18)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Session SAM 3.1 Scan Ledger (Genuine Empty State when 0 scans) */}
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between font-mono text-xs text-[#aaa9ad]">
                  <span>04 / SESSION SAM 3.1 SCAN LOG</span>
                  <span>{scanHistory.length} scans recorded</span>
                </div>

                {scanHistory.length === 0 ? (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#111317] p-4 shadow-[inset_0_0_0_1px_#252830]">
                    <p className="text-xs text-[#c9c7c0]">
                      {isId
                        ? "Belum ada pemindaian objek pada sesi ini. Jalankan pemindaian di Lensa SAM 3.1."
                        : "No object scans recorded in this session yet. Run a scan in SAM 3.1 Lens."}
                    </p>
                    <Link
                      href="/lens"
                      className="rounded-full bg-[#c6f432] px-4 py-2 font-mono text-xs font-bold text-[#080808]"
                    >
                      {isId ? "Buka Lensa SAM 3.1" : "Launch SAM 3.1 Lens"}
                    </Link>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {scanHistory.slice(0, 3).map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center justify-between rounded-xl bg-[#111317] px-3.5 py-2.5 font-mono text-xs"
                      >
                        <span className="text-white">
                          {isId ? rec.titleId : rec.titleEn} ({rec.objectCount}{" "}
                          polygons)
                        </span>
                        <span className="text-[#c6f432]">
                          +{formatCurrency(rec.valueTotal, rec.currency, locale)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-2">
              <span className="text-xl font-normal tracking-[-0.03em]">
                {isId
                  ? "Buku Besar Fisika & Pemindaian"
                  : "Site Physics & Session Ledger"}
              </span>
              <Link href="/radar" className="dovv-chip hover:text-white">
                {isId ? "Ubah Asumsi Atap di Radar 3D →" : "Edit Roof Footprint in 3D Radar →"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
