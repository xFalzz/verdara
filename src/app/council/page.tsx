"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import StudioShell from "@/components/ui/StudioShell";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import {
  executeVerdaraCouncil,
  type CouncilSynthesisResult,
  type SiteBrief,
} from "@/lib/meta/client";
import { formatArea, formatCurrency, formatVolume } from "@/lib/science/units";

export default function CouncilPage() {
  const router = useRouter();
  const {
    locale,
    units,
    theme,
    geo,
    housingCalc,
    aiShield,
    toggleOpenWeightModel,
    awardXp,
  } = useVerdaraStore();

  const [sessionResult, setSessionResult] =
    useState<CouncilSynthesisResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeRoundStep, setActiveRoundStep] = useState<number>(3);
  const [userPrompt, setUserPrompt] = useState<string>("");

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

  const buildCurrentSiteBrief = useCallback((): SiteBrief => {
    const nearestHub = geo.hubs[0];
    return {
      city: geo.city,
      countryCode: geo.countryCode,
      koppenCode: geo.koppen.code,
      koppenName: isId ? geo.koppen.nameId : geo.koppen.nameEn,
      season: isId ? geo.seasonId : geo.seasonEn,
      footprintM2: housingCalc.footprintM2,
      solarKwp: housingCalc.solar.kwp,
      solarKwhYear: housingCalc.solar.kwhYear,
      solarSavingsYear: housingCalc.solar.savingsYear,
      currency: housingCalc.solar.currency,
      co2eKgYear: housingCalc.solar.co2eKgYear,
      rainLitersYear: housingCalc.rainwater.litersYear,
      bioporeUnits: housingCalc.infiltration.bioporeUnits,
      tciScore: housingCalc.thermal.tciScore,
      electricityTariff: geo.policy.electricityTariff,
      nearestHubName: nearestHub?.name ?? "Municipal Recycling Center",
      nearestHubDistanceKm: nearestHub?.distanceKm ?? 1.5,
      outputLanguage: locale,
    };
  }, [geo, housingCalc, isId, locale]);

  const handleRunCouncil = useCallback(
    async (overridePrompt?: string) => {
      setIsRunning(true);
      setErrorMessage(null);
      setActiveRoundStep(1);
      const brief = buildCurrentSiteBrief();
      const promptToUse = (overridePrompt ?? userPrompt).trim();

      setTimeout(() => setActiveRoundStep(2), 200);
      setTimeout(() => setActiveRoundStep(3), 400);

      try {
        const res = await fetch("/api/council", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            siteBrief: brief,
            prompt: promptToUse || undefined,
            isJudge: true,
            useOpenWeightModel: aiShield.useOpenWeightModel,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { result: CouncilSynthesisResult };
          setSessionResult(data.result);
        } else {
          const fallback = await executeVerdaraCouncil(brief, {
            userId: "local-judge",
            ipHash: "127.0.0.1",
            isJudge: true,
            useOpenWeightModel: aiShield.useOpenWeightModel,
            userQuery: promptToUse || undefined,
          });
          setSessionResult(fallback);
        }
      } catch {
        try {
          const fallback = await executeVerdaraCouncil(brief, {
            userId: "local-judge",
            ipHash: "127.0.0.1",
            isJudge: true,
            useOpenWeightModel: aiShield.useOpenWeightModel,
            userQuery: promptToUse || undefined,
          });
          setSessionResult(fallback);
        } catch {
          setErrorMessage(
            isId
              ? "Gagal menyintesis sidang dewan. Silakan coba lagi."
              : "Unable to synthesize council deliberation. Please retry."
          );
        }
      } finally {
        setTimeout(() => setIsRunning(false), 450);
      }
    },
    [aiShield.useOpenWeightModel, buildCurrentSiteBrief, isId, userPrompt]
  );

  useEffect(() => {
    handleRunCouncil();
  }, [handleRunCouncil]);

  return (
    <StudioShell>
      <div className="space-y-6">
        <header className={`rounded-2xl border p-5 ${surfaceCard}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`font-mono text-xs font-bold tracking-wider ${textMuted}`}>
                {"// 01 MULTI-AGENT DELIBERATION ROOM / DETERMINISTIC NUMBER VALIDATOR"}
              </p>
              <h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">
                {isId
                  ? `Sidang Dewan Spesialis Verdara (${geo.city} · ${geo.koppen.code})`
                  : `The Verdara Specialist Council (${geo.city} · ${geo.koppen.code})`}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={toggleOpenWeightModel}
                className={`min-h-[44px] cursor-pointer rounded-xl border px-3.5 py-2 font-mono text-xs font-bold transition ${
                  aiShield.useOpenWeightModel
                    ? isLight
                      ? "border-[#14532D] bg-[#14532D] text-[#FFFFFF]"
                      : "border-[#A3E635] bg-[#A3E635]/15 text-[#A3E635]"
                    : isLight
                    ? "border-[#C7C0B0] bg-[#FFFFFF] text-[#101D16]"
                    : "border-[#1D3328] bg-[#13221B] text-[#F2F7F4]"
                }`}
              >
                {aiShield.useOpenWeightModel
                  ? "Meta Open-Weight: ON (muse-spark-open)"
                  : "Switch to Meta Open-Weight Mode"}
              </button>

              <button
                type="button"
                onClick={() => {
                  awardXp(20);
                  handleRunCouncil();
                }}
                disabled={isRunning}
                className={`min-h-[44px] cursor-pointer rounded-xl px-4 py-2 font-mono text-xs font-black transition disabled:opacity-50 ${
                  isLight
                    ? "bg-[#14532D] text-[#FFFFFF] hover:bg-[#166534]"
                    : "bg-[#A3E635] text-[#070D0A] hover:bg-[#BEF264]"
                }`}
              >
                {isRunning
                  ? isId
                    ? "Menyintesis Sidang..."
                    : "Synthesizing Deliberation..."
                  : isId
                  ? "Jalankan Ulang Sidang (+20 XP)"
                  : "Re-Convene Council (+20 XP)"}
              </button>
            </div>
          </div>

          <div className={`mt-4 rounded-xl border p-4 ${elevatedCard}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
              <span className="font-bold">
                LOCKED SITE_BRIEF INPUT (SINGLE SOURCE OF TRUTH FOR AGENTS)
              </span>
              <span className={textMuted}>
                Post-Response Number Validator: ACTIVE (±3% Tolerance)
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2.5 font-mono text-xs sm:grid-cols-3 lg:grid-cols-6">
              <div className={`rounded-lg border p-2.5 ${surfaceCard}`}>
                <span className={`block text-[11px] ${textMuted}`}>FOOTPRINT</span>
                <strong className="mt-0.5 block tabular-nums">
                  {formatArea(housingCalc.footprintM2, units, locale)}
                </strong>
              </div>
              <div className={`rounded-lg border p-2.5 ${surfaceCard}`}>
                <span className={`block text-[11px] ${textMuted}`}>SOLAR PV</span>
                <strong className="mt-0.5 block tabular-nums">
                  {housingCalc.solar.kwp} kWp ({Math.round(housingCalc.solar.kwhYear).toLocaleString()} kWh)
                </strong>
              </div>
              <div className={`rounded-lg border p-2.5 ${surfaceCard}`}>
                <span className={`block text-[11px] ${textMuted}`}>SAVINGS / YR</span>
                <strong className="mt-0.5 block tabular-nums">
                  {formatCurrency(
                    housingCalc.solar.savingsYear,
                    housingCalc.solar.currency,
                    locale
                  )}
                </strong>
              </div>
              <div className={`rounded-lg border p-2.5 ${surfaceCard}`}>
                <span className={`block text-[11px] ${textMuted}`}>RAIN HARVEST</span>
                <strong className="mt-0.5 block tabular-nums">
                  {formatVolume(housingCalc.rainwater.litersYear, units, locale)}/yr
                </strong>
              </div>
              <div className={`rounded-lg border p-2.5 ${surfaceCard}`}>
                <span className={`block text-[11px] ${textMuted}`}>BIOPORES / TCI</span>
                <strong className="mt-0.5 block tabular-nums">
                  {housingCalc.infiltration.bioporeUnits} units / TCI {housingCalc.thermal.tciScore}
                </strong>
              </div>
              <div className={`rounded-lg border p-2.5 ${surfaceCard}`}>
                <span className={`block text-[11px] ${textMuted}`}>NEAREST HUB</span>
                <strong className="mt-0.5 block truncate tabular-nums">
                  {geo.hubs[0]?.distanceKm ?? 1.5} km ({geo.hubs[0]?.name.split(" ")[0]})
                </strong>
              </div>
            </div>
          </div>

          {/* Interactive Consultation Query Bar for Meta AI Specialists */}
          <div className={`mt-4 rounded-xl border p-4 ${elevatedCard}`}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                awardXp(25);
                handleRunCouncil();
              }}
              className="flex flex-col gap-2.5 sm:flex-row sm:items-center"
            >
              <input
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder={
                  isId
                    ? "Tanyakan apa pun ke 3 Pakar AI (mis. Biaya panel surya, sumur biopori, kompos)..."
                    : "Ask the 3 Meta AI Specialists (e.g. Solar payback, biopore design, food waste)..."
                }
                className={`min-h-[44px] flex-1 rounded-xl border px-4 text-xs outline-none transition focus:border-[#1e9e5a] ${
                  isLight
                    ? "border-black/15 bg-[#f8f8f6] text-[#111]"
                    : "border-white/15 bg-[#08090c] text-white"
                }`}
              />
              <button
                type="submit"
                disabled={isRunning}
                className={`min-h-[44px] shrink-0 cursor-pointer rounded-xl px-5 font-mono text-xs font-bold transition disabled:opacity-50 ${
                  isLight
                    ? "bg-[#14532D] text-white hover:bg-[#166534]"
                    : "bg-[#A3E635] text-[#070D0A] hover:bg-[#bef264]"
                }`}
              >
                {isRunning
                  ? isId
                    ? "Memproses AI..."
                    : "Processing..."
                  : isId
                  ? "Konsultasikan (+25 XP) →"
                  : "Ask Council (+25 XP) →"}
              </button>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
              <span className={textMuted}>
                {isId ? "Topik Cepat:" : "Quick Focus:"}
              </span>
              {[
                {
                  id: "Berapa lama estimasi balik modal panel surya?",
                  en: "What is the estimated solar payback period?",
                },
                {
                  id: "Bagaimana cara membuat lubang biopori di halaman?",
                  en: "How to core-drill biopores for rainwater absorption?",
                },
                {
                  id: "Tanaman apa yang cocok untuk menurunkan panas atap?",
                  en: "Which native plants best reduce roof heat?",
                },
                {
                  id: "Berapa nilai ekonomi pemilahan sampah ke bank sampah?",
                  en: "What is the cash value of sorting waste at local hubs?",
                },
              ].map((chip) => {
                const text = isId ? chip.id : chip.en;
                return (
                  <button
                    key={chip.en}
                    type="button"
                    onClick={() => {
                      setUserPrompt(text);
                      awardXp(25);
                      handleRunCouncil(text);
                    }}
                    className={`cursor-pointer rounded-lg border px-2.5 py-1 text-left transition ${
                      isLight
                        ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16] hover:bg-white"
                        : "border-[#1D3328] bg-[#070D0A] text-[#A3BEB0] hover:text-white hover:border-[#88AC9B]"
                    }`}
                  >
                    {text}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl border border-rose-500/50 bg-rose-950/20 p-4 font-mono text-xs text-rose-400"
          >
            {errorMessage}
          </div>
        )}

        {isRunning && !sessionResult && (
          <div className={`rounded-2xl border p-8 text-center font-mono text-sm ${surfaceCard}`}>
            {isId
              ? "Menyintesis argumen Dr. Flora, Ir. Arka, dan Sirkula terhadap SITE_BRIEF..."
              : "Synthesizing Dr. Flora, Ir. Arka, and Sirkula arguments against SITE_BRIEF..."}
          </div>
        )}

        {sessionResult && (
          <>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {sessionResult.messages.map((msg, idx) => {
                const isRevealed = activeRoundStep >= idx + 1;

                return (
                  <article
                    key={msg.agent}
                    className={`flex flex-col justify-between rounded-2xl border p-5 transition-opacity duration-300 ${surfaceCard} ${
                      isRevealed ? "opacity-100" : "opacity-40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 font-mono text-xs">
                        <span className="font-bold">
                          {msg.agent === "flora"
                            ? "// AGENT 01 : DR. FLORA"
                            : msg.agent === "arka"
                            ? "// AGENT 02 : IR. ARKA"
                            : "// AGENT 03 : SIRKULA"}
                        </span>
                        <span className={textMuted}>{msg.modelUsed}</span>
                      </div>

                      <h2 className="mt-2 font-serif text-xl font-bold">
                        {msg.name}
                      </h2>
                      <p className={`font-mono text-xs ${textMuted}`}>
                        {isId ? msg.roleId : msg.roleEn}
                      </p>

                      <p
                        className={`mt-3 rounded-xl border p-3.5 text-xs leading-relaxed ${elevatedCard}`}
                      >
                        {msg.content}
                      </p>

                      <div className="mt-3 space-y-2.5">
                        {msg.recommendations.map((rec, rIdx) => (
                          <div
                            key={rIdx}
                            className={`rounded-xl border p-3 text-xs ${elevatedCard}`}
                          >
                            <div className="flex items-center gap-2 font-mono text-[11px]">
                              <span className="font-bold">
                                IMPACT: {rec.impact.toUpperCase()}
                              </span>
                              <span className={textMuted}>
                                EFFORT: {rec.effort.toUpperCase()}
                              </span>
                            </div>
                            <p className={`mt-1.5 ${textSecondary}`}>{rec.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      className={`mt-4 flex items-center justify-between border-t pt-3 font-mono text-xs ${
                        isLight ? "border-[#C7C0B0]" : "border-[#1D3328]"
                      }`}
                    >
                      <span className="font-bold">
                        {msg.verifiedNumbers.length} numbers verified vs SITE_BRIEF
                      </span>
                      <span className={textMuted}>
                        {msg.unverifiedNumbers.length} unverified
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>

            <section className={`rounded-2xl border p-6 ${surfaceCard}`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className={`font-mono text-xs font-bold tracking-wider ${textMuted}`}>
                    {"// 02 SYNTHESIZED ACTION BLUEPRINT (ZOD SCHEMA VALIDATED)"}
                  </p>
                  <h2 className="mt-1 font-serif text-xl font-bold sm:text-2xl">
                    {sessionResult.blueprint.title}
                  </h2>
                  <p className={`mt-1 max-w-4xl text-xs leading-relaxed ${textSecondary}`}>
                    {sessionResult.blueprint.summary}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/academy")}
                  className={`min-h-[44px] cursor-pointer rounded-xl px-5 py-2.5 font-mono text-xs font-black transition ${
                    isLight
                      ? "bg-[#14532D] text-[#FFFFFF] hover:bg-[#166534]"
                      : "bg-[#A3E635] text-[#070D0A] hover:bg-[#BEF264]"
                  }`}
                >
                  {isId
                    ? "Buka Verifikasi Bukti Fisik SAM 3.1"
                    : "Execute in Field-Action Verifier (SAM 3.1)"}
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {sessionResult.blueprint.actions.map((action, idx) => (
                  <div
                    key={action.id}
                    className={`flex flex-col justify-between rounded-xl border p-4 ${elevatedCard}`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                        <span className="font-bold">
                          ACTION 0{idx + 1} / OWNER: {action.ownerAgent.toUpperCase()}
                        </span>
                        <span className={textMuted}>
                          EFFORT: {action.effort.toUpperCase()} / COST: {action.costBand.toUpperCase()}
                        </span>
                      </div>

                      <h3 className="mt-2 font-serif text-base font-bold">
                        {action.title}
                      </h3>

                      <ol
                        className={`mt-2 list-decimal space-y-1 pl-4 text-xs leading-relaxed ${textSecondary}`}
                      >
                        {action.steps.map((st, sIdx) => (
                          <li key={sIdx}>{st}</li>
                        ))}
                      </ol>
                    </div>

                    <div
                      className={`mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 font-mono text-xs ${
                        isLight ? "border-[#C7C0B0]" : "border-[#1D3328]"
                      }`}
                    >
                      <span className={textMuted}>
                        Refs: {action.metricRefs.join(", ")}
                      </span>
                      <button
                        type="button"
                        onClick={() => router.push("/academy")}
                        className="min-h-[36px] cursor-pointer rounded-lg border border-current px-2.5 py-1 font-bold"
                      >
                        Protocol: {action.courseTrack}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className={`mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-2.5 font-mono text-xs ${elevatedCard}`}
              >
                <span>
                  PROVIDER: <strong>{sessionResult.telemetry.provider}</strong> / MODEL:{" "}
                  <strong>{sessionResult.telemetry.models.join(", ")}</strong>
                </span>
                <span>
                  TOKENS: <strong>{sessionResult.telemetry.tokensIn} in / {sessionResult.telemetry.tokensOut} out</strong>
                </span>
                <span>
                  LATENCY: <strong>{sessionResult.telemetry.latencyMs} ms</strong>
                </span>
                <span>
                  SHIELD: <strong>{sessionResult.telemetry.shieldReason.toUpperCase()}</strong>
                </span>
              </div>
            </section>
          </>
        )}
      </div>
    </StudioShell>
  );
}
