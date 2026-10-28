"use client";

import React from "react";
import StudioShell from "@/components/ui/StudioShell";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import { USER_DAILY_QUOTAS } from "@/lib/meta/shield";

export default function SettingsPage() {
  const {
    locale,
    units,
    theme,
    isJudgeDemo,
    displayName,
    email,
    geo,
    aiShield,
    setLocale,
    setUnits,
    setTheme,
    toggleOpenWeightModel,
    loginAsJudgeDemo,
    resetToStarterPlot,
  } = useVerdaraStore();

  const isId = locale === "id";
  const isLight = theme === "light";

  const surfaceCard = isLight
    ? "border-[#C7C0B0] bg-[#EAE5D9] text-[#101D16]"
    : "border-[#1D3328] bg-[#0E1914] text-[#F2F7F4]";

  const elevatedCard = isLight
    ? "border-[#C7C0B0] bg-[#FFFFFF] text-[#101D16]"
    : "border-[#1D3328] bg-[#13221B] text-[#F2F7F4]";

  const textSecondary = isLight ? "text-[#2C4438]" : "text-[#A3BEB0]";
  const textMuted = isLight ? "text-[#3D594B]" : "text-[#88AC9B]";

  const remainingCap = Number(
    (aiShield.lifetimeCapUsd - aiShield.totalSpendUsd).toFixed(2)
  );
  const totalCalls = aiShield.cacheHitsCount + aiShield.liveApiCallsCount;
  const cacheRate =
    totalCalls > 0
      ? Math.round((aiShield.cacheHitsCount / totalCalls) * 100)
      : 0;

  return (
    <StudioShell>
      <div className="space-y-6">
        <section className={`rounded-2xl border p-6 ${surfaceCard}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`font-mono text-xs font-bold tracking-wider ${textMuted}`}>
                {"// 01 7-LAYER AI CREDIT SHIELD / ZERO OVERRUN ARCHITECTURE"}
              </p>
              <h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">
                {isId
                  ? "Telemetri Kredit Meta Model API ($150 Pool)"
                  : "Meta Model API ($150 Pool) Credit Shield & Quota Ledger"}
              </h1>
            </div>

            <span className={`rounded-xl border px-3.5 py-2 font-mono text-xs font-bold ${elevatedCard}`}>
              STATUS: ALL 7 SHIELD LAYERS ACTIVE
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className={`rounded-xl border p-4 ${elevatedCard}`}>
              <p className={`font-mono text-[11px] ${textMuted}`}>
                META MODEL API CREDIT GRANT
              </p>
              <p className="mt-1 font-mono text-2xl font-black tabular-nums">
                ${aiShield.lifetimeBudgetUsd.toFixed(2)}
              </p>
              <p className={`mt-1 font-mono text-xs ${textSecondary}`}>
                Hard Circuit Breaker Cap: ${aiShield.lifetimeCapUsd.toFixed(2)}
              </p>
            </div>

            <div className={`rounded-xl border p-4 ${elevatedCard}`}>
              <p className={`font-mono text-[11px] ${textMuted}`}>
                DEDICATED JUDGE RESERVE POOL
              </p>
              <p className="mt-1 font-mono text-2xl font-black tabular-nums">
                ${aiShield.judgeReserveUsd.toFixed(2)}
              </p>
              <p className={`mt-1 font-mono text-xs ${textSecondary}`}>
                Reserved for judge verification sessions
              </p>
            </div>

            <div className={`rounded-xl border p-4 ${elevatedCard}`}>
              <p className={`font-mono text-[11px] ${textMuted}`}>
                REMAINING CAMPAIGN CAP
              </p>
              <p className="mt-1 font-mono text-2xl font-black tabular-nums">
                ${remainingCap.toFixed(2)}
              </p>
              <p className={`mt-1 font-mono text-xs ${textSecondary}`}>
                Session spend: ${aiShield.todaySpendUsd.toFixed(3)} / $12.00 daily cap
              </p>
            </div>

            <div className={`rounded-xl border p-4 ${elevatedCard}`}>
              <p className={`font-mono text-[11px] ${textMuted}`}>
                SESSION CACHE HIT RATIO
              </p>
              <p className="mt-1 font-mono text-2xl font-black tabular-nums">
                {totalCalls === 0 ? "0 calls" : `${cacheRate}%`}
              </p>
              <p className={`mt-1 font-mono text-xs ${textSecondary}`}>
                {aiShield.cacheHitsCount} cache hits ($0.00) / {aiShield.liveApiCallsCount} live calls
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              {
                layer: "Layer 01 / Provider Billing Hard Limit",
                desc: "Hard Spend Limit ($140.00) configured below the $150.00 Meta Model API credit grant.",
              },
              {
                layer: "Layer 02 / Dual-Pool Circuit Breaker & $35 Judge Reserve",
                desc: "Public traffic switches to deterministic cache at $100.00; $35.00 reserved for Hackathon Judges.",
              },
              {
                layer: "Layer 03 / SHA-256 + 64-Bit Perceptual dHash Cache",
                desc: "All 6 Reference Specimens, 5 City Presets, and duplicate uploads resolve in <50ms at $0.00 cost.",
              },
              {
                layer: "Layer 04 / Atomic Per-User Daily Quotas & IP Burst Guard",
                desc: "Capped at 6 AI requests/min per IP and strict daily operation quotas per account.",
              },
              {
                layer: "Layer 05 / Vision Resolution Clamping (1280px) & 5-Concept Cap",
                desc: "Downscales uploads to <=1280px and caps SAM 3.1 prompt fan-out at 5 concepts.",
              },
              {
                layer: "Layer 06 / Active Stream Concurrency Mutex & Anti-Bot Guard",
                desc: "Blocks automated scrapers and restricts concurrent streams to 1 per user.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-3.5 text-xs ${elevatedCard}`}
              >
                <p className="font-mono font-bold">{item.layer}</p>
                <p className={`mt-1 leading-relaxed ${textSecondary}`}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className={`mt-5 overflow-x-auto rounded-xl border p-4 ${elevatedCard}`}>
            <p className="mb-3 font-mono text-xs font-bold">
              {"// 02 PER-OPERATION DAILY QUOTA MATRIX"}
            </p>
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr
                  className={`border-b ${
                    isLight ? "border-[#C7C0B0]" : "border-[#1D3328]"
                  } ${textMuted}`}
                >
                  <th className="py-2 pr-3">AI Operation</th>
                  <th className="py-2 pr-3">Meta Model Pipeline</th>
                  <th className="py-2 pr-3">Public Visitor / Day</th>
                  <th className="py-2">Judge Session / Day</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isLight ? "divide-[#C7C0B0]" : "divide-[#1D3328]"
                }`}
              >
                <tr>
                  <td className="py-2.5 pr-3 font-semibold">Omni-Spatial Lens Scan</td>
                  <td className="py-2.5 pr-3">muse-spark + sam-3-1</td>
                  <td className="py-2.5 pr-3">{USER_DAILY_QUOTAS.lens_scan.public} / day</td>
                  <td className="py-2.5 font-bold">{USER_DAILY_QUOTAS.lens_scan.judge} / day</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-3 font-semibold">Generative Eco-Retrofit</td>
                  <td className="py-2.5 pr-3">sam-3-1 + muse-image / wonder</td>
                  <td className="py-2.5 pr-3">{USER_DAILY_QUOTAS.eco_retrofit.public} / day</td>
                  <td className="py-2.5 font-bold">{USER_DAILY_QUOTAS.eco_retrofit.judge} / day</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-3 font-semibold">The Verdara Council</td>
                  <td className="py-2.5 pr-3">muse-spark / muse-spark-open</td>
                  <td className="py-2.5 pr-3">{USER_DAILY_QUOTAS.council.public} / day</td>
                  <td className="py-2.5 font-bold">{USER_DAILY_QUOTAS.council.judge} / day</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-3 font-semibold">Field Proof Verification</td>
                  <td className="py-2.5 pr-3">sam-3-1 + 64-bit dHash</td>
                  <td className="py-2.5 pr-3">{USER_DAILY_QUOTAS.proof_verify.public} / day</td>
                  <td className="py-2.5 font-bold">{USER_DAILY_QUOTAS.proof_verify.judge} / day</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-3 font-semibold">Field Voice Command</td>
                  <td className="py-2.5 pr-3">muse-voice-transcribe (&lt;=15s)</td>
                  <td className="py-2.5 pr-3">{USER_DAILY_QUOTAS.voice_transcribe.public} / day</td>
                  <td className="py-2.5 font-bold">{USER_DAILY_QUOTAS.voice_transcribe.judge} / day</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className={`rounded-2xl border p-5 ${surfaceCard}`}>
            <p className={`font-mono text-xs font-bold tracking-wider ${textMuted}`}>
              {"// 03 LOCALIZATION, UNITS & SURFACE PALETTE"}
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3.5 ${elevatedCard}`}>
                <span className="font-semibold">Interface & AI Output Language</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLocale("en")}
                    className={`min-h-[40px] cursor-pointer rounded-lg px-3 py-1.5 font-mono font-bold ${
                      locale === "en"
                        ? isLight
                          ? "bg-[#14532D] text-[#FFFFFF]"
                          : "bg-[#A3E635] text-[#070D0A]"
                        : surfaceCard
                    }`}
                  >
                    English (EN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocale("id")}
                    className={`min-h-[40px] cursor-pointer rounded-lg px-3 py-1.5 font-mono font-bold ${
                      locale === "id"
                        ? isLight
                          ? "bg-[#14532D] text-[#FFFFFF]"
                          : "bg-[#A3E635] text-[#070D0A]"
                        : surfaceCard
                    }`}
                  >
                    Indonesia (ID)
                  </button>
                </div>
              </div>

              <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3.5 ${elevatedCard}`}>
                <span className="font-semibold">Measurement Unit System</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setUnits("metric")}
                    className={`min-h-[40px] cursor-pointer rounded-lg px-3 py-1.5 font-mono font-bold ${
                      units === "metric"
                        ? isLight
                          ? "bg-[#14532D] text-[#FFFFFF]"
                          : "bg-[#A3E635] text-[#070D0A]"
                        : surfaceCard
                    }`}
                  >
                    Metric (m², L, °C)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnits("imperial")}
                    className={`min-h-[40px] cursor-pointer rounded-lg px-3 py-1.5 font-mono font-bold ${
                      units === "imperial"
                        ? isLight
                          ? "bg-[#14532D] text-[#FFFFFF]"
                          : "bg-[#A3E635] text-[#070D0A]"
                        : surfaceCard
                    }`}
                  >
                    Imperial (sq ft, gal, °F)
                  </button>
                </div>
              </div>

              <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3.5 ${elevatedCard}`}>
                <span className="font-semibold">Architectural Surface Theme</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`min-h-[40px] cursor-pointer rounded-lg px-3 py-1.5 font-mono font-bold ${
                      theme === "dark"
                        ? "bg-[#A3E635] text-[#070D0A]"
                        : surfaceCard
                    }`}
                  >
                    Forest Obsidian (Dark)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`min-h-[40px] cursor-pointer rounded-lg px-3 py-1.5 font-mono font-bold ${
                      theme === "light"
                        ? "bg-[#14532D] text-[#FFFFFF]"
                        : surfaceCard
                    }`}
                  >
                    Warm Limestone (Light)
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className={`rounded-2xl border p-5 ${surfaceCard}`}>
            <p className={`font-mono text-xs font-bold tracking-wider ${textMuted}`}>
              {"// 04 SESSION PROFILE & ENGINE CONTROLS"}
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div className={`rounded-xl border p-3.5 ${elevatedCard}`}>
                <div className="flex items-center justify-between font-mono">
                  <span className={textMuted}>Active Session Profile</span>
                  <span className="font-bold">
                    {isJudgeDemo ? "DEMO SPECIMEN (JUDGE)" : "STANDARD SESSION"}
                  </span>
                </div>
                <p className="mt-1 font-mono font-bold">
                  {displayName} ({email})
                </p>
                <p className={`mt-0.5 font-mono text-[11px] ${textMuted}`}>
                  Jurisdiction: {geo.city} ({geo.countryCode} / Koppen {geo.koppen.code})
                </p>
              </div>

              <div className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 ${elevatedCard}`}>
                <div>
                  <p className="font-semibold">
                    Meta Open-Weight Council Engine (muse-spark-open)
                  </p>
                  <p className={`text-[11px] ${textMuted}`}>
                    Routes specialist council synthesis through open-weight model configuration
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleOpenWeightModel}
                  className={`min-h-[40px] cursor-pointer rounded-lg px-3.5 py-1.5 font-mono font-bold ${
                    aiShield.useOpenWeightModel
                      ? isLight
                        ? "bg-[#14532D] text-[#FFFFFF]"
                        : "bg-[#A3E635] text-[#070D0A]"
                      : surfaceCard
                  }`}
                >
                  {aiShield.useOpenWeightModel ? "ENABLED" : "DISABLED"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={loginAsJudgeDemo}
                  className={`min-h-[44px] cursor-pointer rounded-xl px-3.5 py-2.5 font-mono text-xs font-black transition ${
                    isLight
                      ? "bg-[#14532D] text-[#FFFFFF] hover:bg-[#166534]"
                      : "bg-[#A3E635] text-[#070D0A] hover:bg-[#BEF264]"
                  }`}
                >
                  Load Menlo Park Specimen (Lv.5)
                </button>
                <button
                  type="button"
                  onClick={resetToStarterPlot}
                  className={`min-h-[44px] cursor-pointer rounded-xl border px-3.5 py-2.5 font-mono text-xs font-bold transition ${elevatedCard}`}
                >
                  Reset to Starter Plot (Lv.1)
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </StudioShell>
  );
}
