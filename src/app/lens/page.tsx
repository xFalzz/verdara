"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import StudioShell from "@/components/ui/StudioShell";
import SpatialMaskViewer from "@/components/lens/SpatialMaskViewer";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import {
  GOLDEN_LENS_SAMPLES,
  type GoldenLensSample,
  type GoldenSampleObject,
} from "@/lib/meta/golden-cache";
import { evaluateMaterialInstance } from "@/lib/science/valuation";
import { computePlantLesionSeverity } from "@/lib/lens/masks";
import {
  formatCurrency,
  formatMass,
  formatVolume,
} from "@/lib/science/units";

export default function LensPage() {
  const router = useRouter();
  const {
    locale,
    units,
    theme,
    geo,
    recordScanCompleted,
    setSelectedMaterialFilter,
  } = useVerdaraStore();

  const [activeSampleId, setActiveSampleId] = useState<string>(
    GOLDEN_LENS_SAMPLES[0]!.id
  );
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [selectedObjId, setSelectedObjId] = useState<string | null>(
    GOLDEN_LENS_SAMPLES[0]!.objects[0]!.id
  );
  const [xrayLevel, setXrayLevel] = useState<number>(20);
  const [showRetrofitComparison, setShowRetrofitComparison] =
    useState<boolean>(false);
  const [retrofitCurtainPct, setRetrofitCurtainPct] = useState<number>(50);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [voiceActive, setVoiceActive] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  const isId = locale === "id";
  const isLight = theme === "light";

  // Close share modal on Escape key (R-26, R-32)
  useEffect(() => {
    if (!showShareModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowShareModal(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showShareModal]);

  const activeSample: GoldenLensSample = useMemo(() => {
    return (
      GOLDEN_LENS_SAMPLES.find((s) => s.id === activeSampleId) ??
      GOLDEN_LENS_SAMPLES[0]!
    );
  }, [activeSampleId]);

  const { objectValuations, totals } = useMemo(() => {
    const map: Record<
      string,
      ReturnType<typeof evaluateMaterialInstance>
    > = {};
    let valueMin = 0;
    let valueMax = 0;
    let co2eG = 0;
    let totalMassG = 0;

    for (const obj of activeSample.objects) {
      const val = evaluateMaterialInstance(
        obj.materialCode,
        obj.sizeClassHint,
        geo.countryCode,
        obj.mask.areaRatio
      );
      map[obj.id] = val;
      valueMin += val.valueMin;
      valueMax += val.valueMax;
      co2eG += val.co2eAvoidedG;
      totalMassG += val.estMassG;
    }

    return {
      objectValuations: map,
      totals: {
        valueMin: Number(valueMin.toFixed(2)),
        valueMax: Number(valueMax.toFixed(2)),
        currency: geo.policy.currency,
        co2eG: Number(co2eG.toFixed(1)),
        totalMassG,
      },
    };
  }, [activeSample, geo.countryCode, geo.policy.currency]);

  const selectedObj: GoldenSampleObject = useMemo(() => {
    return (
      activeSample.objects.find((o) => o.id === selectedObjId) ??
      activeSample.objects[0]!
    );
  }, [activeSample, selectedObjId]);

  const selectedValuation = objectValuations[selectedObj.id];

  const handleSelectSample = async (sample: GoldenLensSample) => {
    setIsScanning(true);
    setScanError(null);
    setCustomImageUrl(null);
    setActiveSampleId(sample.id);
    setSelectedObjId(sample.objects[0]?.id ?? null);
    setShowRetrofitComparison(sample.mode === "retrofit");

    try {
      await fetch("/api/lens/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sampleId: sample.id,
          countryCode: geo.countryCode,
          isJudge: true,
        }),
      });
    } catch {
      // Deterministic golden cache remains active offline
    }

    recordScanCompleted(
      {
        id: `scan-${Date.now()}`,
        sampleId: sample.id,
        titleEn: sample.titleEn,
        titleId: sample.titleId,
        mode: sample.mode,
        objectCount: sample.objects.length,
        valueTotal: totals.valueMax,
        currency: geo.policy.currency,
        co2eAvoidedG: totals.co2eG,
        createdAt: "Just now",
      },
      true
    );

    setTimeout(() => setIsScanning(false), 180);
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setScanError(
        isId
          ? "Format berkas tidak didukung. Unggah berkas gambar (PNG, JPG, atau WebP)."
          : "Unsupported file format. Please upload an image file (PNG, JPG, or WebP)."
      );
      return;
    }
    setScanError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setIsScanning(true);
        setCustomImageUrl(reader.result);
        recordScanCompleted(
          {
            id: `scan-upload-${Date.now()}`,
            sampleId: activeSample.id,
            titleEn: `Uploaded Specimen (${file.name})`,
            titleId: `Spesimen Unggahan (${file.name})`,
            mode: activeSample.mode,
            objectCount: activeSample.objects.length,
            valueTotal: totals.valueMax,
            currency: geo.policy.currency,
            co2eAvoidedG: totals.co2eG,
            createdAt: "Just now",
          },
          false
        );
        setTimeout(() => setIsScanning(false), 300);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSimulateVoiceCommand = () => {
    setVoiceActive(true);
    const query = isId
      ? "Muse Voice Transcribe: 'Tampilkan nilai deposit daur ulang tertinggi dan titik drop-off terdekat di peta 3D.'"
      : "Muse Voice Transcribe: 'Isolate highest deposit return item and route to nearest 3D Radar hub.'";
    setVoiceTranscript(query);
    setTimeout(() => setVoiceActive(false), 1200);
  };

  const handleRouteToRadar = (materialCode: string) => {
    setSelectedMaterialFilter(materialCode);
    router.push("/radar");
  };

  const handleDownloadViralCardPng = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#070D0A";
    ctx.fillRect(0, 0, 1200, 630);

    ctx.strokeStyle = "#A3E635";
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 32, 1136, 566);

    ctx.fillStyle = "#A3E635";
    ctx.font = "bold 22px monospace";
    ctx.fillText(
      "// VERDARA SPATIAL REPORT · META SAM 3.1 + MUSE SPARK",
      64,
      92
    );

    ctx.fillStyle = "#F2F7F4";
    ctx.font = "bold 46px Georgia, serif";
    ctx.fillText(activeSample.titleEn, 64, 162);

    ctx.fillStyle = "#A3BEB0";
    ctx.font = "24px sans-serif";
    ctx.fillText(
      `Location: ${geo.city} (${geo.koppen.code}) · Policy: ${geo.policy.nameEn}`,
      64,
      210
    );

    ctx.fillStyle = "#0E1914";
    ctx.fillRect(64, 250, 340, 190);
    ctx.fillRect(430, 250, 340, 190);
    ctx.fillRect(796, 250, 340, 190);

    ctx.fillStyle = "#A3E635";
    ctx.font = "bold 18px monospace";
    ctx.fillText("SAM 3.1 INSTANCES", 90, 295);
    ctx.fillText("CIRCULAR DEPOSIT VALUE", 456, 295);
    ctx.fillText("EPA WARM v16 CO2e SAVED", 822, 295);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 44px monospace";
    ctx.fillText(`${activeSample.objects.length} Polygons`, 90, 365);
    ctx.fillText(
      formatCurrency(totals.valueMax, totals.currency, "en"),
      456,
      365
    );
    ctx.fillText(`${totals.co2eG} g`, 822, 365);

    ctx.fillStyle = "#A3BEB0";
    ctx.font = "20px monospace";
    ctx.fillText(
      "Built for Meta Global AI Developer Hackathon (@metadevs · @cerebral_valley)",
      64,
      535
    );

    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `verdara-sam31-report-${activeSample.id}.png`;
    a.click();
  };

  const plantLesionStats = activeSample.plantDiagnostics
    ? computePlantLesionSeverity(
        activeSample.plantDiagnostics.leafAreaRatio,
        activeSample.plantDiagnostics.lesionAreaRatio
      )
    : null;

  return (
    <StudioShell>
      <div className="space-y-6">
        {/* Top Specimen Bar */}
        <div
          className={`border p-5 ${
            isLight
              ? "border-[#C7C0B0] bg-white"
              : "border-[#1D3328] bg-[#0E1914]"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p
                className={`font-mono text-xs font-bold ${
                  isLight ? "text-[#14532D]" : "text-[#A3E635]"
                }`}
              >
                // 02 · OMNI-SPATIAL LENS (META SAM 3.1 + MUSE SPARK + MUSE IMAGE)
              </p>
              <h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">
                {isId
                  ? "Segmentasi Poligon Material & Tirai Renovasi Biophilic"
                  : "Instance Polygon Segmentation & Biophilic Retrofit Curtain"}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label
                className={`flex min-h-[44px] cursor-pointer items-center border px-3.5 py-2 font-mono text-xs font-semibold transition ${
                  isLight
                    ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16] hover:bg-[#EAE5D9]"
                    : "border-[#1D3328] bg-[#070D0A] text-[#F2F7F4] hover:border-[#88AC9B]"
                }`}
              >
                <span>{isId ? "Unggah Foto Sendiri" : "Upload Custom Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleSimulateVoiceCommand}
                className={`min-h-[44px] cursor-pointer border px-3.5 py-2 font-mono text-xs font-semibold transition ${
                  voiceActive
                    ? isLight
                      ? "border-[#14532D] bg-[#14532D] text-white"
                      : "border-[#A3E635] bg-[#A3E635] text-[#070D0A]"
                    : isLight
                      ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16]"
                      : "border-[#1D3328] bg-[#070D0A] text-[#F2F7F4]"
                }`}
              >
                {isId ? "Transkripsi Suara Muse" : "Muse Voice Filter"}
              </button>

              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className={`min-h-[44px] cursor-pointer px-4 py-2 font-mono text-xs font-bold transition ${
                  isLight
                    ? "bg-[#14532D] text-white hover:bg-[#0F3F22]"
                    : "bg-[#A3E635] text-[#070D0A] hover:bg-[#bef264]"
                }`}
              >
                {isId ? "Ekspor Kartu Laporan (PNG)" : "Export Impact Report (PNG)"}
              </button>
            </div>
          </div>

          {scanError && (
            <div
              role="alert"
              className="mt-4 border border-red-500/60 bg-red-950/30 p-3 font-mono text-xs text-red-200"
            >
              ERROR: {scanError}
            </div>
          )}

          {voiceTranscript && (
            <div
              className={`mt-4 flex items-center justify-between border px-3.5 py-2 font-mono text-xs ${
                isLight
                  ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16]"
                  : "border-[#1D3328] bg-[#070D0A] text-[#A3BEB0]"
              }`}
            >
              <span>{voiceTranscript}</span>
              <button
                type="button"
                onClick={() => setVoiceTranscript(null)}
                className="min-h-[44px] cursor-pointer px-2 underline"
              >
                {isId ? "Tutup" : "Dismiss"}
              </button>
            </div>
          )}

          {/* 4 Specimen Selector Tabs */}
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {GOLDEN_LENS_SAMPLES.map((sample, idx) => {
              const active = sample.id === activeSample.id && !customImageUrl;
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`min-h-[56px] cursor-pointer border p-3 text-left transition ${
                    active
                      ? isLight
                        ? "border-[#14532D] bg-[#14532D] text-white"
                        : "border-[#A3E635] bg-[#A3E635] text-[#070D0A]"
                      : isLight
                        ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16] hover:bg-[#EAE5D9]"
                        : "border-[#1D3328] bg-[#070D0A] text-[#F2F7F4] hover:border-[#88AC9B]"
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span>
                      // SPECIMEN 0{idx + 1} · {sample.mode.toUpperCase()}
                    </span>
                    <span>$0.00 CACHE</span>
                  </div>
                  <p className="mt-1 text-xs font-bold">
                    {isId ? sample.titleId : sample.titleEn}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Split Workspace: Left 7 Cols Visor + Right 5 Cols Dossier */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left 7 Columns: SAM 3.1 Polygon Visor & Scrubber Controls */}
          <div className="space-y-4 lg:col-span-7">
            <div
              className={`border p-4 ${
                isLight
                  ? "border-[#C7C0B0] bg-white"
                  : "border-[#1D3328] bg-[#0E1914]"
              }`}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                <div>
                  <span
                    className={
                      isLight
                        ? "font-bold text-[#14532D]"
                        : "font-bold text-[#A3E635]"
                    }
                  >
                    // {isId ? "VISOR POLIGON SAM 3.1" : "SAM 3.1 POLYGON VISOR"}
                  </span>{" "}
                  <span>
                    ({activeSample.objects.length} {isId ? "objek" : "instances"} · IoU &lt; 0.85)
                  </span>
                </div>

                {isScanning && (
                  <span role="status" className="font-bold">
                    {isId
                      ? "Memindai poligon SAM 3.1..."
                      : "Segmenting SAM 3.1 polygons..."}
                  </span>
                )}
              </div>

              <SpatialMaskViewer
                sample={activeSample}
                selectedObjectId={selectedObj.id}
                onSelectObject={(obj) => setSelectedObjId(obj.id)}
                xrayLevel={xrayLevel}
                showRetrofitComparison={showRetrofitComparison}
                retrofitCurtainPct={retrofitCurtainPct}
                onRetrofitCurtainChange={setRetrofitCurtainPct}
                customImageUrl={customImageUrl}
                locale={locale}
              />

              {/* X-Ray & Muse Image Before/After Scrubber Controls */}
              <div
                className={`mt-4 grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2 ${
                  isLight ? "border-[#C7C0B0]" : "border-[#1D3328]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <label htmlFor="xray-slider">
                      {isId
                        ? "Mode X-Ray Poligon SAM 3.1"
                        : "SAM 3.1 Polygon X-Ray Opacity"}
                    </label>
                    <span className="font-bold tabular-nums">{xrayLevel}%</span>
                  </div>
                  <input
                    id="xray-slider"
                    type="range"
                    min={0}
                    max={100}
                    value={xrayLevel}
                    onChange={(e) => setXrayLevel(Number(e.target.value))}
                    className="mt-2 h-2 w-full cursor-pointer accent-[#A3E635]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span>
                      {isId
                        ? "Tirai Renovasi Meta Muse Image"
                        : "Meta Muse Image Retrofit Curtain"}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setShowRetrofitComparison((prev) => !prev)
                      }
                      className={`min-h-[44px] cursor-pointer border px-3 py-1 font-mono text-xs font-bold transition ${
                        showRetrofitComparison
                          ? isLight
                            ? "border-[#14532D] bg-[#14532D] text-white"
                            : "border-[#A3E635] bg-[#A3E635] text-[#070D0A]"
                          : isLight
                            ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16]"
                            : "border-[#1D3328] bg-[#070D0A] text-[#F2F7F4]"
                      }`}
                    >
                      {showRetrofitComparison
                        ? isId
                          ? "AKTIF (GESER TIRAI)"
                          : "ACTIVE (DRAG CURTAIN)"
                        : isId
                          ? "AKTIFKAN BEFORE/AFTER"
                          : "ENABLE BEFORE/AFTER"}
                    </button>
                  </div>

                  {showRetrofitComparison && (
                    <input
                      type="range"
                      aria-label={
                        isId
                          ? "Persentase Tirai Before After"
                          : "Before After Curtain Percentage"
                      }
                      min={5}
                      max={95}
                      value={retrofitCurtainPct}
                      onChange={(e) =>
                        setRetrofitCurtainPct(Number(e.target.value))
                      }
                      className="mt-2 h-2 w-full cursor-pointer accent-[#A3E635]"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Segmented Object Selector Strip */}
            <div
              className={`border p-4 ${
                isLight
                  ? "border-[#C7C0B0] bg-white"
                  : "border-[#1D3328] bg-[#0E1914]"
              }`}
            >
              <p
                className={`mb-2.5 font-mono text-xs font-bold ${
                  isLight ? "text-[#14532D]" : "text-[#A3E635]"
                }`}
              >
                // {isId ? "OBJEK TERDETEKSI (KLIK UNTUK INSPEKSI)" : "DETECTED INSTANCES (CLICK TO INSPECT)"}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {activeSample.objects.map((obj) => {
                  const val = objectValuations[obj.id];
                  const isSel = obj.id === selectedObj.id;
                  return (
                    <button
                      key={obj.id}
                      type="button"
                      onClick={() => setSelectedObjId(obj.id)}
                      className={`min-h-[52px] cursor-pointer border p-3 text-left transition ${
                        isSel
                          ? isLight
                            ? "border-[#14532D] bg-[#14532D] text-white"
                            : "border-[#A3E635] bg-[#A3E635] text-[#070D0A]"
                          : isLight
                            ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16]"
                            : "border-[#1D3328] bg-[#070D0A] text-[#F2F7F4]"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="font-bold">{obj.materialCode}</span>
                        <span className="tabular-nums">
                          conf {(obj.score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="font-semibold capitalize">
                          {obj.concept}
                        </span>
                        {val && (
                          <span className="font-mono font-bold tabular-nums">
                            {formatCurrency(val.valueMax, val.currency, locale)}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Selected Instance Valuation & Upcycling Protocol */}
          <div className="space-y-4 lg:col-span-5">
            {/* Total Batch Summary */}
            <div
              className={`border p-5 ${
                isLight
                  ? "border-[#C7C0B0] bg-white"
                  : "border-[#1D3328] bg-[#0E1914]"
              }`}
            >
              <div className="flex items-center justify-between border-b pb-2.5 border-current/15 font-mono text-xs">
                <span
                  className={
                    isLight
                      ? "font-bold text-[#14532D]"
                      : "font-bold text-[#A3E635]"
                  }
                >
                  // {isId ? "VALUASI YURISDIKSI" : "JURISDICTION VALUATION"} ({geo.policy.code})
                </span>
                <span>{geo.city}</span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 font-mono">
                <div
                  className={`border p-3 ${
                    isLight
                      ? "border-[#C7C0B0] bg-[#F4F1EA]"
                      : "border-[#1D3328] bg-[#070D0A]"
                  }`}
                >
                  <p className="text-[10px] opacity-75">
                    {isId ? "NILAI DEPOSIT" : "RECOVERY VALUE"}
                  </p>
                  <p className="mt-1 text-base font-bold tabular-nums">
                    {formatCurrency(totals.valueMax, totals.currency, locale)}
                  </p>
                </div>

                <div
                  className={`border p-3 ${
                    isLight
                      ? "border-[#C7C0B0] bg-[#F4F1EA]"
                      : "border-[#1D3328] bg-[#070D0A]"
                  }`}
                >
                  <p className="text-[10px] opacity-75">
                    {isId ? "EMISI DICEGAH" : "AVOIDED CO2e"}
                  </p>
                  <p className="mt-1 text-base font-bold tabular-nums">
                    {totals.co2eG} g
                  </p>
                </div>

                <div
                  className={`border p-3 ${
                    isLight
                      ? "border-[#C7C0B0] bg-[#F4F1EA]"
                      : "border-[#1D3328] bg-[#070D0A]"
                  }`}
                >
                  <p className="text-[10px] opacity-75">
                    {isId ? "MASSA ESTIMASI" : "EST. MASS"}
                  </p>
                  <p className="mt-1 text-base font-bold tabular-nums">
                    {formatMass(totals.totalMassG, units)}
                  </p>
                </div>
              </div>

              <p
                className={`mt-3 text-xs leading-relaxed ${
                  isLight ? "text-[#2C4438]" : "text-[#A3BEB0]"
                }`}
              >
                {isId ? geo.policy.policySummaryId : geo.policy.policySummaryEn}
              </p>
            </div>

            {/* Selected Instance Dossier & Upcycling Blueprint */}
            <div
              className={`border p-5 ${
                isLight
                  ? "border-[#C7C0B0] bg-white"
                  : "border-[#1D3328] bg-[#0E1914]"
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 border-current/15">
                <div>
                  <p
                    className={`font-mono text-xs font-bold ${
                      isLight ? "text-[#14532D]" : "text-[#A3E635]"
                    }`}
                  >
                    // {isId ? "DOSIR OBJEK TERPILIH" : "SELECTED INSTANCE DOSSIER"}
                  </p>
                  <h2 className="mt-0.5 font-serif text-xl font-bold capitalize">
                    {selectedObj.concept} ({selectedObj.materialCode})
                  </h2>
                </div>
                {selectedValuation && (
                  <span className="font-mono text-sm font-bold tabular-nums">
                    {formatCurrency(
                      selectedValuation.valueMax,
                      selectedValuation.currency,
                      locale
                    )}
                  </span>
                )}
              </div>

              <p
                className={`mt-3 text-xs leading-relaxed ${
                  isLight ? "text-[#2C4438]" : "text-[#A3BEB0]"
                }`}
              >
                {isId ? selectedObj.disposalId : selectedObj.disposalEn}
              </p>

              {/* Upcycling / Care Protocol Steps */}
              <div
                className={`mt-4 border p-4 ${
                  isLight
                    ? "border-[#C7C0B0] bg-[#F4F1EA]"
                    : "border-[#1D3328] bg-[#070D0A]"
                }`}
              >
                <p className="font-mono text-xs font-bold">
                  //{" "}
                  {isId
                    ? selectedObj.upcyclingRecipe.titleId
                    : selectedObj.upcyclingRecipe.titleEn}
                </p>
                <ol className="mt-2.5 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed">
                  {(isId
                    ? selectedObj.upcyclingRecipe.stepsId
                    : selectedObj.upcyclingRecipe.stepsEn
                  ).map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>

                {(isId
                  ? selectedObj.upcyclingRecipe.safetyNoteId
                  : selectedObj.upcyclingRecipe.safetyNoteEn) && (
                  <p className="mt-3 border-t pt-2 font-mono text-[11px] text-amber-400 border-current/15">
                    NOTE:{" "}
                    {isId
                      ? selectedObj.upcyclingRecipe.safetyNoteId
                      : selectedObj.upcyclingRecipe.safetyNoteEn}
                  </p>
                )}
              </div>

              {/* Plant Lesion Ratio Diagnostic (when plant mode is selected) */}
              {plantLesionStats && activeSample.plantDiagnostics && (
                <div
                  className={`mt-4 border p-4 font-mono text-xs ${
                    isLight
                      ? "border-[#C7C0B0] bg-[#F4F1EA]"
                      : "border-[#1D3328] bg-[#070D0A]"
                  }`}
                >
                  <p className="font-bold">
                    // SAM 3.1 LEAF VS. LESION AREA RATIO:{" "}
                    {plantLesionStats.infectedPct}% ({plantLesionStats.severity})
                  </p>
                  <p className="mt-1 text-[11px] opacity-80">
                    Leaf mask: {(activeSample.plantDiagnostics.leafAreaRatio * 100).toFixed(1)}% ·
                    Lesion mask: {(activeSample.plantDiagnostics.lesionAreaRatio * 100).toFixed(1)}%
                  </p>
                </div>
              )}

              {/* Retrofit Projections (when patio retrofit specimen is active) */}
              {activeSample.retrofitSpec && (
                <div
                  className={`mt-4 border p-4 font-mono text-xs ${
                    isLight
                      ? "border-[#C7C0B0] bg-[#F4F1EA]"
                      : "border-[#1D3328] bg-[#070D0A]"
                  }`}
                >
                  <p className="font-bold">
                    // RETROFIT PROJECTION: +
                    {activeSample.retrofitSpec.projectedSolarKwp} kWp Solar · +
                    {formatVolume(
                      activeSample.retrofitSpec.projectedRainLitersYr,
                      units
                    )}
                    /yr · {activeSample.retrofitSpec.coolingDeltaC}°C ΔT
                  </p>
                </div>
              )}

              <div className="mt-4 pt-1">
                <button
                  type="button"
                  onClick={() => handleRouteToRadar(selectedObj.materialCode)}
                  className={`min-h-[44px] w-full cursor-pointer border px-4 py-2.5 font-mono text-xs font-bold transition ${
                    isLight
                      ? "border-[#14532D] bg-[#EAE5D9] text-[#14532D] hover:bg-[#14532D] hover:text-white"
                      : "border-[#A3E635] bg-[#070D0A] text-[#A3E635] hover:bg-[#A3E635] hover:text-[#070D0A]"
                  }`}
                >
                  {isId
                    ? `Temukan Titik Drop-Off ${selectedObj.materialCode} di Radar 3D (/radar)`
                    : `Locate ${selectedObj.materialCode} Drop-Off Hub on 3D Radar (/radar)`}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Accessible Share / Export Dialog (Closable with Escape key per R-26, R-32) */}
        {showShareModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          >
            <div
              className={`w-full max-w-lg border p-6 ${
                isLight
                  ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16]"
                  : "border-[#1D3328] bg-[#0E1914] text-[#F2F7F4]"
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 border-current/15">
                <h2
                  id="export-modal-title"
                  className="font-serif text-xl font-bold"
                >
                  {isId
                    ? "Ekspor Laporan Spasial (1200x630 PNG)"
                    : "Export Spatial Impact Report (1200x630 PNG)"}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="min-h-[44px] cursor-pointer border px-3 py-1 font-mono text-xs font-bold"
                >
                  ESC / CLOSE
                </button>
              </div>

              <div
                className={`mt-4 border p-4 font-mono text-xs ${
                  isLight
                    ? "border-[#C7C0B0] bg-white"
                    : "border-[#1D3328] bg-[#070D0A]"
                }`}
              >
                <p className="font-bold">
                  // {activeSample.titleEn} ({geo.city})
                </p>
                <p className="mt-1">
                  SAM 3.1 Polygons: {activeSample.objects.length} · Value:{" "}
                  {formatCurrency(totals.valueMax, totals.currency, locale)} ·
                  Avoided CO2e: {totals.co2eG} g
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleDownloadViralCardPng}
                  className={`min-h-[44px] flex-1 cursor-pointer px-4 py-2.5 font-mono text-xs font-bold ${
                    isLight
                      ? "bg-[#14532D] text-white"
                      : "bg-[#A3E635] text-[#070D0A]"
                  }`}
                >
                  {isId ? "Unduh Berkas PNG" : "Download 1200x630 PNG"}
                </button>
                <a
                  href={`https://x.com/intent/tweet?text=${encodeURIComponent(
                    `Segmented ${activeSample.objects.length} household material instances in ${geo.city} with Verdara (Meta SAM 3.1 + Muse Spark): ${totals.co2eG}g CO2e avoided. Built for @metadevs @cerebral_valley #MetaAIHackathon`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[44px] items-center border px-4 py-2.5 font-mono text-xs font-bold"
                >
                  {isId ? "Bagikan ke X" : "Post to X"}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudioShell>
  );
}
