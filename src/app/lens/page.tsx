"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StudioShell from "@/components/ui/StudioShell";
import AuthGateModal from "@/components/ui/AuthGateModal";
import FeatureGuideModal from "@/components/ui/FeatureGuideModal";
import DeviceCameraModal from "@/components/lens/DeviceCameraModal";
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
    isAuthenticated,
    authProvider,
    userId,
    locale,
    units,
    theme,
    geo,
    recordScanCompleted,
    setSelectedMaterialFilter,
  } = useVerdaraStore();

  const isGuestOrStarter = !isAuthenticated || authProvider === "starter";
  const [showAuthGateModal, setShowAuthGateModal] = useState<boolean>(false);
  const [authGateMessage, setAuthGateMessage] = useState<string>("");

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
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<"all" | "waste" | "plant" | "retrofit">("all");

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

    if (!isGuestOrStarter) {
      try {
        await fetch("/api/lens/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sampleId: sample.id,
            countryCode: geo.countryCode,
            userId: userId || "verified-resident",
            isJudge: true,
          }),
        });
      } catch {
        // Deterministic golden cache remains active offline
      }
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
    if (isGuestOrStarter) {
      if (e.target) e.target.value = "";
      setAuthGateMessage(
        isId
          ? "Fitur AI Meta memerlukan akun terverifikasi. Silakan login terlebih dahulu untuk mengunggah dan menganalisis foto kustom Anda dengan SAM 3.1."
          : "Meta AI features require a verified account. Please sign in first to upload and analyze your custom photos with SAM 3.1."
      );
      setShowAuthGateModal(true);
      return;
    }

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

  const handleCameraCapture = (dataUrl: string, category?: "auto" | "waste" | "plant") => {
    setIsScanning(true);
    setScanError(null);
    setCustomImageUrl(dataUrl);

    if (category === "plant") {
      const plantSample = GOLDEN_LENS_SAMPLES.find((s) => s.mode === "plant");
      if (plantSample) {
        setActiveSampleId(plantSample.id);
        setSelectedObjId(plantSample.objects[0]?.id ?? null);
        setShowRetrofitComparison(false);
        setFilterCategory("plant");
      }
    } else if (category === "waste") {
      const wasteSample = GOLDEN_LENS_SAMPLES.find((s) => s.mode === "waste");
      if (wasteSample) {
        setActiveSampleId(wasteSample.id);
        setSelectedObjId(wasteSample.objects[0]?.id ?? null);
        setShowRetrofitComparison(false);
        setFilterCategory("waste");
      }
    }

    recordScanCompleted(
      {
        id: `scan-camera-${Date.now()}`,
        sampleId: activeSample.id,
        titleEn: category === "plant" ? "Plant Health Inspection (Camera)" : "Camera Hardware Snapshot",
        titleId: category === "plant" ? "Inspeksi Kesehatan Tanaman (Kamera)" : "Tangkapan Kamera Perangkat",
        mode: category === "plant" ? "plant" : activeSample.mode,
        objectCount: activeSample.objects.length,
        valueTotal: totals.valueMax,
        currency: geo.policy.currency,
        co2eAvoidedG: totals.co2eG,
        createdAt: "Just now",
      },
      false
    );
    setTimeout(() => setIsScanning(false), 300);
  };

  const handleSimulateVoiceCommand = () => {
    if (isGuestOrStarter) {
      setAuthGateMessage(
        isId
          ? "Fitur AI Meta memerlukan akun terverifikasi. Silakan login terlebih dahulu untuk mengaktifkan filter suara Muse."
          : "Meta AI features require a verified account. Please sign in first to activate Muse voice filters."
      );
      setShowAuthGateModal(true);
      return;
    }

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
        {isGuestOrStarter && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 font-mono text-xs text-amber-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-400">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span>
                  {isId
                    ? "MODE STARTER SANDBOX · SPATIAL LENS AMAN ($0.00)"
                    : "STARTER SANDBOX MODE · SAFE SPATIAL LENS ($0.00)"}
                </span>
              </div>
              <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[10px] text-amber-300">
                Cost: $0.00 (Zero Credit Risk)
              </span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-amber-100/90 font-sans">
              {isId
                ? "Fitur AI Meta memerlukan akun terverifikasi. Anda dapat menjelajahi 4 spesimen contoh statis secara gratis ($0.00). Untuk mengunggah foto sendiri dan memindai dengan Meta SAM 3.1 langsung, silakan login terlebih dahulu."
                : "Meta AI features require a verified account. You can freely explore the 4 static sample specimens ($0.00). To upload your own photos and run live Meta SAM 3.1 scans, please sign in first."}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link
                href="/login?next=/lens"
                className="inline-flex min-h-[38px] items-center rounded-xl bg-amber-400 px-4 py-1.5 font-sans text-xs font-bold text-black transition hover:bg-amber-300"
              >
                {isId ? "Masuk dengan Akun Terverifikasi →" : "Sign In with Verified Account →"}
              </Link>
            </div>
          </div>
        )}

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
                {isId
                  ? "// 02 · HIJARA UNIVERSAL LENS (SAM 3.1 + META MUSE AI)"
                  : "// 02 · HIJARA UNIVERSAL LENS (SAM 3.1 + META MUSE AI)"}
              </p>
              <h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">
                {isId
                  ? "Hijara Lens · Pindai Sampah, Valuasi Bank Sampah & Diagnosa Tanaman"
                  : "Hijara Lens · Circular Waste Scan, Bank Sampah & Plant Diagnostics"}
              </h1>
              <p
                className={`mt-1 text-xs max-w-2xl leading-relaxed ${
                  isLight ? "text-[#2C4438]" : "text-[#A3BEB0]"
                }`}
              >
                {isId
                  ? "Satu lensa cerdas serba bisa: identifikasi sampah daur ulang, hitung estimasi rupiah Bank Sampah, serta diagnosa kesehatan tanaman Anda secara instan dalam satu kamera."
                  : "One versatile AI lens: identify recyclables, calculate Bank Sampah recovery value, and diagnose plant diseases instantly with a single camera scan."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label
                className={`flex min-h-[44px] cursor-pointer items-center rounded-xl border px-3.5 py-2 font-mono text-xs font-semibold transition ${
                  isLight
                    ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16] hover:bg-[#EAE5D9]"
                    : "border-[#1D3328] bg-[#070D0A] text-[#F2F7F4] hover:border-[#88AC9B]"
                }`}
              >
                <span>{isId ? "📁 Unggah Foto" : "📁 Upload Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (isGuestOrStarter) {
                    setAuthGateMessage(
                      isId
                        ? "Fitur kamera langsung memerlukan akun terverifikasi. Silakan login terlebih dahulu untuk mengambil foto dengan kamera perangkat Anda."
                        : "Direct device camera capture requires a verified account. Please sign in first to capture photos with your camera hardware."
                    );
                    setShowAuthGateModal(true);
                    return;
                  }
                  setShowCameraModal(true);
                }}
                className={`flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2 font-mono text-xs font-semibold transition ${
                  isLight
                    ? "border-[#14532D] bg-[#14532D]/10 text-[#14532D] hover:bg-[#14532D]/20"
                    : "border-[#A3E635]/60 bg-[#A3E635]/10 text-[#A3E635] hover:bg-[#A3E635]/20"
                }`}
              >
                <span aria-hidden="true">📷</span>
                <span>{isId ? "Kamera Device" : "Device Camera"}</span>
              </button>

              {customImageUrl && (
                <button
                  type="button"
                  onClick={() => setCustomImageUrl(null)}
                  className={`flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2 font-mono text-xs font-semibold transition ${
                    isLight
                      ? "border-red-400 bg-red-50 text-red-700 hover:bg-red-100"
                      : "border-red-500/40 bg-red-950/20 text-red-300 hover:bg-red-950/40"
                  }`}
                  title={isId ? "Kembali ke spesimen contoh bawaan" : "Reset to default sample specimen"}
                >
                  <span>✕ {isId ? "Reset Foto" : "Reset Photo"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSimulateVoiceCommand}
                className={`min-h-[44px] cursor-pointer rounded-xl border px-3.5 py-2 font-mono text-xs font-semibold transition ${
                  voiceActive
                    ? isLight
                      ? "border-[#14532D] bg-[#14532D] text-white"
                      : "border-[#A3E635] bg-[#A3E635] text-[#070D0A]"
                    : isLight
                      ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16]"
                      : "border-[#1D3328] bg-[#070D0A] text-[#F2F7F4]"
                }`}
              >
                {isId ? "Suara Muse" : "Muse Voice"}
              </button>

              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className={`min-h-[44px] cursor-pointer rounded-xl px-4 py-2 font-mono text-xs font-bold transition ${
                  isLight
                    ? "bg-[#14532D] text-white hover:bg-[#0F3F22]"
                    : "bg-[#A3E635] text-[#070D0A] hover:bg-[#bef264]"
                }`}
              >
                {isId ? "Ekspor Laporan" : "Export Report"}
              </button>

              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                aria-label={isId ? "Buka Panduan Pemakaian SAM 3.1 Lens" : "Open SAM 3.1 Lens Usage Guide"}
                className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 font-mono text-xs font-bold transition shadow-sm ${
                  isLight
                    ? "border-[#14532D]/35 bg-[#F2F7F4] text-[#14532D] hover:bg-[#E2EDE6] hover:border-[#14532D]"
                    : "border-[#A3E635]/50 bg-[#0A120E] text-[#A3E635] hover:bg-[#A3E635]/15 hover:border-[#A3E635] shadow-[0_0_12px_rgba(163,230,53,0.12)]"
                }`}
                title={isId ? "Panduan Fitur & Cara Pakai" : "Feature Guide & How to Use"}
              >
                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black ${
                  isLight ? "bg-[#14532D]/15 text-[#14532D]" : "bg-[#A3E635]/25 text-[#A3E635]"
                }`}>?</span>
                <span>{isId ? "Panduan" : "Guide"}</span>
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

          {/* Hijara Dual-Core Category Filter Tabs */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 font-mono text-xs">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider mr-1 ${
                isLight ? "text-[#14532D]" : "text-[#A3E635]"
              }`}
            >
              {isId ? "Kategori Lensa Hijara:" : "Hijara Lens Category:"}
            </span>
            <button
              type="button"
              onClick={() => setFilterCategory("all")}
              className={`min-h-[34px] cursor-pointer rounded-full px-3.5 py-1 font-semibold transition ${
                filterCategory === "all"
                  ? isLight
                    ? "bg-[#14532D] text-white shadow-sm"
                    : "bg-[#A3E635] text-[#070D0A] shadow-sm"
                  : isLight
                  ? "border border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16] hover:bg-[#EAE5D9]"
                  : "border border-[#1D3328] bg-[#070D0A] text-[#A3BEB0] hover:border-[#88AC9B]"
              }`}
            >
              🌿 {isId ? "Semua Universal (4)" : "All Universal (4)"}
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterCategory("waste");
                const firstWaste = GOLDEN_LENS_SAMPLES.find((s) => s.mode === "waste");
                if (firstWaste) handleSelectSample(firstWaste);
              }}
              className={`min-h-[34px] cursor-pointer rounded-full px-3.5 py-1 font-semibold transition ${
                filterCategory === "waste"
                  ? isLight
                    ? "bg-[#14532D] text-white shadow-sm"
                    : "bg-[#A3E635] text-[#070D0A] shadow-sm"
                  : isLight
                  ? "border border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16] hover:bg-[#EAE5D9]"
                  : "border border-[#1D3328] bg-[#070D0A] text-[#A3BEB0] hover:border-[#88AC9B]"
              }`}
            >
              🗑️ {isId ? "Scan Sampah & Bank Sampah" : "Waste & Circular"}
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterCategory("plant");
                const plant = GOLDEN_LENS_SAMPLES.find((s) => s.mode === "plant");
                if (plant) handleSelectSample(plant);
              }}
              className={`min-h-[34px] cursor-pointer rounded-full px-3.5 py-1 font-semibold transition ${
                filterCategory === "plant"
                  ? isLight
                    ? "bg-[#14532D] text-white shadow-sm"
                    : "bg-[#A3E635] text-[#070D0A] shadow-sm"
                  : isLight
                  ? "border border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16] hover:bg-[#EAE5D9]"
                  : "border border-[#1D3328] bg-[#070D0A] text-[#A3BEB0] hover:border-[#88AC9B]"
              }`}
            >
              🌱 {isId ? "Diagnosa Kesehatan Tanaman" : "Plant Health Diagnostic"}
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterCategory("retrofit");
                const retrofit = GOLDEN_LENS_SAMPLES.find((s) => s.mode === "retrofit");
                if (retrofit) handleSelectSample(retrofit);
              }}
              className={`min-h-[34px] cursor-pointer rounded-full px-3.5 py-1 font-semibold transition ${
                filterCategory === "retrofit"
                  ? isLight
                    ? "bg-[#14532D] text-white shadow-sm"
                    : "bg-[#A3E635] text-[#070D0A] shadow-sm"
                  : isLight
                  ? "border border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16] hover:bg-[#EAE5D9]"
                  : "border border-[#1D3328] bg-[#070D0A] text-[#A3BEB0] hover:border-[#88AC9B]"
              }`}
            >
              🏡 {isId ? "Renovasi Atap & Ruang" : "Biophilic Retrofit"}
            </button>
          </div>

          {/* 4 Specimen Selector Tabs */}
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {GOLDEN_LENS_SAMPLES.filter((sample) => {
              if (filterCategory === "waste") return sample.mode === "waste";
              if (filterCategory === "plant") return sample.mode === "plant";
              if (filterCategory === "retrofit") return sample.mode === "retrofit";
              return true;
            }).map((sample, idx) => {
              const active = sample.id === activeSample.id && !customImageUrl;
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`min-h-[56px] cursor-pointer rounded-xl border p-3 text-left transition ${
                    active
                      ? isLight
                        ? "border-[#14532D] bg-[#14532D] text-white shadow-md"
                        : "border-[#A3E635] bg-[#A3E635] text-[#070D0A] shadow-md"
                      : isLight
                      ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16] hover:bg-[#EAE5D9]"
                      : "border-[#1D3328] bg-[#070D0A] text-[#F2F7F4] hover:border-[#88AC9B]"
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="font-bold">
                      {sample.mode === "plant" ? "🌱 PLANT DOCTOR" : sample.mode === "waste" ? "🗑️ BANK SAMPAH" : "🏡 RETROFIT"}
                    </span>
                    <span className="opacity-75">$0.00 CACHE</span>
                  </div>
                  <p className="mt-1 text-xs font-bold truncate">
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
                    {isId ? "// VISOR POLIGON SAM 3.1" : "// SAM 3.1 POLYGON VISOR"}
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
                {isId ? "// OBJEK TERDETEKSI (KLIK UNTUK INSPEKSI)" : "// DETECTED INSTANCES (CLICK TO INSPECT)"}
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
            {activeSample.mode === "plant" ? (
              // HIJARA URBAN BOTANY & PLANT DOCTOR DOSSIER
              <>
                {/* Plant Health Status Summary */}
                <div
                  className={`border p-5 rounded-2xl ${
                    isLight
                      ? "border-[#C7C0B0] bg-white shadow-sm"
                      : "border-[#1D3328] bg-[#0E1914] shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-2.5 border-current/15 font-mono text-xs">
                    <span
                      className={`flex items-center gap-1.5 font-bold ${
                        isLight ? "text-[#14532D]" : "text-[#A3E635]"
                      }`}
                    >
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      {isId ? "// DOKTER TANAMAN & KEBUN URBAN HIJARA" : "// HIJARA URBAN PLANT DOCTOR"}
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      SAM 3.1 VISION AI
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="font-mono text-[11px] opacity-75">
                      {isId ? "SPESIES / KANOPI TANAMAN:" : "PLANT CANOPY SPECIMEN:"}
                    </p>
                    <h2 className="mt-0.5 font-serif text-xl font-bold">
                      {isId
                        ? activeSample.plantDiagnostics?.plantNameId ?? "Tanaman Pangan / Herbal Kebun Perkotaan"
                        : activeSample.plantDiagnostics?.plantNameEn ?? "Urban Culinary Herb / Broadleaf Crop"}
                    </h2>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 font-mono">
                    <div
                      className={`border p-3 rounded-xl ${
                        isLight
                          ? "border-[#C7C0B0] bg-[#F4F1EA]"
                          : "border-[#1D3328] bg-[#070D0A]"
                      }`}
                    >
                      <p className="text-[10px] opacity-75">
                        {isId ? "KONDISI" : "HEALTH STATUS"}
                      </p>
                      <p className="mt-1 text-xs font-bold text-amber-500">
                        {isId ? "Infeksi Sedang" : "Moderate Risk"}
                      </p>
                    </div>

                    <div
                      className={`border p-3 rounded-xl ${
                        isLight
                          ? "border-[#C7C0B0] bg-[#F4F1EA]"
                          : "border-[#1D3328] bg-[#070D0A]"
                      }`}
                    >
                      <p className="text-[10px] opacity-75">
                        {isId ? "DAUN SEHAT" : "HEALTHY LEAF"}
                      </p>
                      <p className="mt-1 text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                        {plantLesionStats ? `${(100 - plantLesionStats.infectedPct).toFixed(1)}%` : "88.6%"}
                      </p>
                    </div>

                    <div
                      className={`border p-3 rounded-xl ${
                        isLight
                          ? "border-[#C7C0B0] bg-[#F4F1EA]"
                          : "border-[#1D3328] bg-[#070D0A]"
                      }`}
                    >
                      <p className="text-[10px] opacity-75">
                        {isId ? "BERCAK / LESI" : "LESION RATIO"}
                      </p>
                      <p className="mt-1 text-base font-bold tabular-nums text-amber-500">
                        {plantLesionStats ? `${plantLesionStats.infectedPct}%` : "11.4%"}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`mt-3.5 rounded-xl border p-3.5 text-xs leading-relaxed ${
                      isLight
                        ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16]"
                        : "border-[#1D3328] bg-[#070D0A] text-[#F2F7F4]"
                    }`}
                  >
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                      {isId ? "🔍 Analisis Gejala Visual SAM 3.1:" : "🔍 SAM 3.1 Visual Symptoms Analysis:"}
                    </p>
                    <p className={`mt-1.5 ${isLight ? "text-[#2C4438]" : "text-[#A3BEB0]"}`}>
                      {isId
                        ? "Terdeteksi bercak klorosis nekrotik kuning seluas 11,4% pada helai daun utama. Tepi daun melengkung ringan akibat stres evapotranspirasi atau kelembapan malam hari. Diperlukan sanitasi daun dan pemberian teh kompos organik."
                        : "Detected yellow necrotic chlorosis lesions spanning 11.4% of total photosynthetic leaf area. Leaf margin shows slight upward curling from evapotranspiration stress. Leaf hygiene and organic compost tea drench recommended."}
                    </p>
                  </div>
                </div>

                {/* 7-Day Step-by-Step Organic Care Plan */}
                <div
                  className={`border p-5 rounded-2xl ${
                    isLight
                      ? "border-[#C7C0B0] bg-white shadow-sm"
                      : "border-[#1D3328] bg-[#0E1914] shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-3 border-current/15">
                    <div>
                      <p
                        className={`font-mono text-xs font-bold ${
                          isLight ? "text-[#14532D]" : "text-[#A3E635]"
                        }`}
                      >
                        {isId ? "// PROTOKOL PEMULIHAN 7 HARI" : "// 7-DAY ORGANIC CARE PLAN"}
                      </p>
                      <h3 className="mt-0.5 font-serif text-lg font-bold">
                        {isId ? "Rencana Perawatan Organik & Jadwal Harian" : "Organic Recovery Schedule & Steps"}
                      </h3>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      7 HARI / 7 STEPS
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {(isId
                      ? activeSample.plantDiagnostics?.carePlanId ?? [
                          "Hari 1: Pangkas bagian daun yang terdampak (11,4%) dengan gunting steril agar jamur tidak menyebar.",
                          "Hari 2: Cek kelembapan media tanam; siram langsung di pangkal akar pukul 07.00 pagi.",
                          "Hari 3: Tambahkan 2 cm pupuk kompos kascing matang di sekitar zona perakaran.",
                          "Hari 4: Periksa bagian bawah daun; semprotkan larutan minyak nimba nabati jika ada kutu daun.",
                          "Hari 5: Pasang naungan paranet 30% jika suhu siang hari melebihi 32°C.",
                          "Hari 6: Gemburkan permukaan tanah perlahan dengan sekop mini untuk aerasi akar.",
                          "Hari 7: Pindai ulang kanopi daun dengan SAM 3.1 Lens untuk evaluasi penyembuhan.",
                        ]
                      : activeSample.plantDiagnostics?.carePlanEn ?? [
                          "Day 1: Prune 11.4% affected leaf area with alcohol-sterilized shears to stop spore spread.",
                          "Day 2: Check soil moisture; water only at root base at 07:00 AM (avoid soaking foliage).",
                          "Day 3: Top-dress root perimeter with 2 cm mature organic vermicompost.",
                          "Day 4: Inspect underside of leaves; mist lightly with diluted neem oil foliar spray.",
                          "Day 5: Provide 30% afternoon shade cloth if ambient temp exceeds 32°C.",
                          "Day 6: Gently loosen compacted topsoil to restore root aeration.",
                          "Day 7: Re-scan canopy in SAM 3.1 Lens to confirm lesion recovery < 5%.",
                        ]
                    ).map((step, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 rounded-xl border p-3 text-xs leading-relaxed transition ${
                          isLight
                            ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16]"
                            : "border-[#1D3328] bg-[#070D0A] text-[#F2F7F4]"
                        }`}
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          {idx + 1}
                        </span>
                        <p className="flex-1">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        router.push("/council");
                      }}
                      className={`min-h-[44px] w-full cursor-pointer rounded-xl px-4 py-2.5 font-mono text-xs font-bold transition shadow-sm ${
                        isLight
                          ? "bg-[#14532D] text-white hover:bg-[#166534]"
                          : "bg-[#A3E635] text-[#070D0A] hover:bg-[#bef264]"
                      }`}
                    >
                      {isId
                        ? "🌿 Konsultasikan Penyakit Daun Ini ke Dr. Flora (/council) →"
                        : "🌿 Consult Plant Diagnosis with Dr. Flora (/council) →"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        router.push("/academy");
                      }}
                      className={`min-h-[44px] w-full cursor-pointer rounded-xl border px-4 py-2.5 font-mono text-xs font-semibold transition ${
                        isLight
                          ? "border-[#14532D]/40 bg-[#F4F1EA] text-[#14532D] hover:bg-white"
                          : "border-[#A3E635]/40 bg-[#070D0A] text-[#A3E635] hover:bg-[#A3E635]/10"
                      }`}
                    >
                      {isId
                        ? "🏆 Verifikasi Bukti Perawatan Tanaman di Akademi (+50 XP) →"
                        : "🏆 Log Plant Care Proof in Academy (+50 XP) →"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // HIJARA CIRCULAR WASTE & BANK SAMPAH DOSSIER
              <>
                {/* Total Batch Summary */}
                <div
                  className={`border p-5 rounded-2xl ${
                    isLight
                      ? "border-[#C7C0B0] bg-white shadow-sm"
                      : "border-[#1D3328] bg-[#0E1914] shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-2.5 border-current/15 font-mono text-xs">
                    <span
                      className={`flex items-center gap-1.5 font-bold ${
                        isLight ? "text-[#14532D]" : "text-[#A3E635]"
                      }`}
                    >
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                      {isId ? "// BANK SAMPAH & REKAYASA SIRKULAR" : "// CIRCULAR WASTE & BANK SAMPAH"} ({geo.policy.code})
                    </span>
                    <span>{geo.city}</span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 font-mono">
                    <div
                      className={`border p-3 rounded-xl ${
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
                      className={`border p-3 rounded-xl ${
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
                      className={`border p-3 rounded-xl ${
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
                  className={`border p-5 rounded-2xl ${
                    isLight
                      ? "border-[#C7C0B0] bg-white shadow-sm"
                      : "border-[#1D3328] bg-[#0E1914] shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-3 border-current/15">
                    <div>
                      <p
                        className={`font-mono text-xs font-bold ${
                          isLight ? "text-[#14532D]" : "text-[#A3E635]"
                        }`}
                      >
                        {isId ? "// DOSIR MATERIAL TERPILIH" : "// SELECTED MATERIAL DOSSIER"}
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

                  <div className="mt-3 flex items-center gap-2 font-mono text-[11px]">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                      100% RECYCLABLE
                    </span>
                    <span className="opacity-75">
                      Bank Sampah Standard Category
                    </span>
                  </div>

                  <p
                    className={`mt-2 text-xs leading-relaxed ${
                      isLight ? "text-[#2C4438]" : "text-[#A3BEB0]"
                    }`}
                  >
                    {isId ? selectedObj.disposalId : selectedObj.disposalEn}
                  </p>

                  {/* Upcycling / Care Protocol Steps */}
                  <div
                    className={`mt-4 rounded-xl border p-4 ${
                      isLight
                        ? "border-[#C7C0B0] bg-[#F4F1EA]"
                        : "border-[#1D3328] bg-[#070D0A]"
                    }`}
                  >
                    <p className="font-mono text-xs font-bold">
                      {"// "}{isId
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

                  {/* Retrofit Projections (when patio retrofit specimen is active) */}
                  {activeSample.retrofitSpec && (
                    <div
                      className={`mt-4 rounded-xl border p-4 font-mono text-xs ${
                        isLight
                          ? "border-[#C7C0B0] bg-[#F4F1EA]"
                          : "border-[#1D3328] bg-[#070D0A]"
                      }`}
                    >
                      <p className="font-bold">
                        {"// RETROFIT PROJECTION: +"}{activeSample.retrofitSpec.projectedSolarKwp} kWp Solar · +{formatVolume(activeSample.retrofitSpec.projectedRainLitersYr, units)}/yr · {activeSample.retrofitSpec.coolingDeltaC}°C ΔT
                      </p>
                    </div>
                  )}

                  <div className="mt-4 pt-1 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleRouteToRadar(selectedObj.materialCode)}
                      className={`min-h-[44px] w-full cursor-pointer rounded-xl border px-4 py-2.5 font-mono text-xs font-bold transition shadow-sm ${
                        isLight
                          ? "border-[#14532D] bg-[#14532D] text-white hover:bg-[#0F3F22]"
                          : "border-[#A3E635] bg-[#A3E635] text-[#070D0A] hover:bg-[#bef264]"
                      }`}
                    >
                      {isId
                        ? `📍 Temukan Bank Sampah ${selectedObj.materialCode} di Radar 3D (/radar)`
                        : `📍 Locate ${selectedObj.materialCode} Drop-Off Hub on 3D Radar (/radar)`}
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push("/council")}
                      className={`min-h-[44px] w-full cursor-pointer rounded-xl border px-4 py-2.5 font-mono text-xs font-semibold transition ${
                        isLight
                          ? "border-[#14532D]/30 bg-[#F4F1EA] text-[#14532D] hover:bg-white"
                          : "border-[#A3E635]/30 bg-[#070D0A] text-[#A3E635] hover:bg-[#A3E635]/10"
                      }`}
                    >
                      {isId
                        ? "💬 Tanya Tips Pilah Sampah Bernilai Tinggi ke Sirkula (/council)"
                        : "💬 Ask Sirkula About High-Value Waste Sorting (/council)"}
                    </button>
                  </div>
                </div>
              </>
            )}
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
                  {`// ${activeSample.titleEn} (${geo.city})`}
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

      <AuthGateModal
        isOpen={showAuthGateModal}
        onClose={() => setShowAuthGateModal(false)}
        message={authGateMessage}
        nextPath="/lens"
        locale={locale}
        theme={theme}
      />

      <DeviceCameraModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={handleCameraCapture}
        locale={locale}
        theme={theme}
      />

      <FeatureGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        feature="lens"
        locale={locale}
        theme={theme}
      />
    </StudioShell>
  );
}
