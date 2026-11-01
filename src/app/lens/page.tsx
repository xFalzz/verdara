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
import {
  analyzeImageLocally,
  speakScanSummary,
  type CustomClassificationResult,
} from "@/lib/lens/classifier";
import {
  SAMPLE_COCONUT_SHELL_IMAGE,
  SAMPLE_PET_BOTTLE_IMAGE,
  SAMPLE_CARDBOARD_IMAGE,
  SAMPLE_PLANT_LEAF_IMAGE,
} from "@/lib/lens/sample-images";

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
    awardXp,
    recordScanCompleted,
    setSelectedMaterialFilter,
  } = useVerdaraStore();

  const isGuestOrStarter = !isAuthenticated || authProvider === "starter";
  const [showAuthGateModal, setShowAuthGateModal] = useState<boolean>(false);
  const [authGateMessage, setAuthGateMessage] = useState<string>("");

  // Scanner workflow states
  const [hasScanned, setHasScanned] = useState<boolean>(false);
  const [inputTab, setInputTab] = useState<"camera" | "upload">("upload");
  const [stagedImageUrl, setStagedImageUrl] = useState<string | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [customClassification, setCustomClassification] = useState<CustomClassificationResult | null>(null);
  const [customSample, setCustomSample] = useState<GoldenLensSample | null>(null);
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  const [selectedObjId, setSelectedObjId] = useState<string | null>(null);
  const [ecoScoreToast, setEcoScoreToast] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const [xrayLevel, setXrayLevel] = useState<number>(20);
  const [showRetrofitComparison, setShowRetrofitComparison] = useState<boolean>(false);
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

  // Close share modal on Escape key
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
    if (customSample) {
      return customSample;
    }
    return (
      GOLDEN_LENS_SAMPLES.find((s) => s.id === activeSampleId) ??
      GOLDEN_LENS_SAMPLES[0]!
    );
  }, [activeSampleId, customSample]);

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

  const handleResetScanner = () => {
    setHasScanned(false);
    setStagedImageUrl(null);
    setCustomImageUrl(null);
    setCustomClassification(null);
    setCustomSample(null);
    setActiveSampleId(null);
    setSelectedObjId(null);
    setIsAnalyzing(false);
    setVoiceTranscript(null);
    setScanError(null);
    setShowRetrofitComparison(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleStageSampleImage = (imgUrl: string, sampleId?: string) => {
    setStagedImageUrl(imgUrl);
    setCustomClassification(null);
    setCustomSample(null);
    setHasScanned(false);
    if (sampleId) {
      setActiveSampleId(sampleId);
    }
  };

  const handleRunAnalysis = async (imgToAnalyze?: string) => {
    const targetUrl = imgToAnalyze || stagedImageUrl;
    if (!targetUrl) return;

    if (isGuestOrStarter) {
      setAuthGateMessage(
        isId
          ? "Fitur AI Meta memerlukan akun terverifikasi. Silakan login terlebih dahulu untuk menganalisis foto kustom Anda dengan SAM 3.1."
          : "Meta AI features require a verified account. Please sign in first to analyze your photos with SAM 3.1."
      );
      setShowAuthGateModal(true);
      return;
    }

    setIsAnalyzing(true);
    setScanError(null);

    try {
      const mode = filterCategory === "plant" ? "plant" : filterCategory === "retrofit" ? "retrofit" : "auto";
      const result = await analyzeImageLocally(targetUrl, mode);
      setCustomClassification(result);
      setCustomSample(result.sample);
      setCustomImageUrl(targetUrl);
      setSelectedObjId(result.sample.objects[0]?.id ?? null);
      setHasScanned(true);

      // Award XP & show Hijara EcoScore toast
      awardXp(25, "sorting_station");
      setEcoScoreToast(
        isId
          ? `+10 EcoScore (+25 XP) · ${result.detectedNameId} Teridentifikasi!`
          : `+10 EcoScore (+25 XP) · ${result.detectedNameEn} Identified!`
      );
      setTimeout(() => setEcoScoreToast(null), 4500);

      recordScanCompleted(
        {
          id: `scan-${Date.now()}`,
          sampleId: result.sample.id,
          titleEn: result.sample.titleEn,
          titleId: result.sample.titleId,
          mode: result.sample.mode,
          objectCount: result.sample.objects.length,
          valueTotal: totals.valueMax,
          currency: geo.policy.currency,
          co2eAvoidedG: totals.co2eG,
          createdAt: "Just now",
        },
        true
      );

      if (voiceActive) {
        const speechText = isId
          ? `Teridentifikasi: ${result.detectedNameId}. Kategori ${result.categoryTagId}. Nilai estimasi ${formatCurrency(totals.valueMax, totals.currency, locale)}. ${result.descriptionId}`
          : `Identified: ${result.detectedNameEn}. Category: ${result.categoryTagEn}. Estimated value: ${formatCurrency(totals.valueMax, totals.currency, locale)}. ${result.descriptionEn}`;
        speakScanSummary(speechText, isId ? "id" : "en");
      }
    } catch {
      setScanError(
        isId
          ? "Gagal menganalisis gambar. Silakan coba lagi."
          : "Failed to analyze image. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleVoiceReading = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const currentTitle = customClassification
      ? (isId ? customClassification.detectedNameId : customClassification.detectedNameEn)
      : (isId ? activeSample.titleId : activeSample.titleEn);

    const desc = customClassification
      ? (isId ? customClassification.descriptionId : customClassification.descriptionEn)
      : (isId ? selectedObj.disposalId : selectedObj.disposalEn);

    const upcycling = customClassification
      ? (isId ? customClassification.upcyclingStepsId[0] : customClassification.upcyclingStepsEn[0])
      : (isId ? selectedObj.upcyclingRecipe.stepsId[0] : selectedObj.upcyclingRecipe.stepsEn[0]);

    const speechText = isId
      ? `Teridentifikasi: ${currentTitle}. ${desc}. Rekomendasi pengolahan: ${upcycling}`
      : `Identified: ${currentTitle}. ${desc}. Recommended handling: ${upcycling}`;

    setIsSpeaking(true);
    speakScanSummary(speechText, isId ? "id" : "en");
    setTimeout(() => setIsSpeaking(false), 9000);
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
        setStagedImageUrl(reader.result);
        setCustomClassification(null);
        setCustomSample(null);
        setHasScanned(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (dataUrl: string, category?: "auto" | "waste" | "plant") => {
    setStagedImageUrl(dataUrl);
    setCustomClassification(null);
    setCustomSample(null);
    setHasScanned(false);

    if (category === "plant") {
      setFilterCategory("plant");
    } else if (category === "waste") {
      setFilterCategory("waste");
    }
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

    setVoiceActive((prev) => !prev);
    const query = isId
      ? "Suara AI Aktif: Analisis dan panduan langkah demi langkah akan dibacakan secara otomatis."
      : "Active AI Voice: Analysis and step-by-step guidance will be read aloud automatically.";
    setVoiceTranscript(query);
    setTimeout(() => setVoiceTranscript(null), 3000);
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

    ctx.fillStyle = isLight ? "#F4F1EA" : "#070D0A";
    ctx.fillRect(0, 0, 1200, 630);

    ctx.fillStyle = isLight ? "#14532D" : "#A3E635";
    ctx.font = "bold 28px monospace";
    ctx.fillText("VERDARA · META SAM 3.1 UNIVERSAL LENS", 60, 80);

    const titleText = customClassification
      ? (isId ? customClassification.detectedNameId : customClassification.detectedNameEn)
      : (isId ? activeSample.titleId : activeSample.titleEn);

    ctx.fillStyle = isLight ? "#101D16" : "#F2F7F4";
    ctx.font = "bold 44px Georgia, serif";
    ctx.fillText(titleText, 60, 150);

    ctx.fillStyle = isLight ? "#2C4438" : "#A3BEB0";
    ctx.font = "24px monospace";
    ctx.fillText(
      `Region: ${geo.city} (${geo.countryCode}) | Material: ${selectedObj.materialCode}`,
      60,
      210
    );

    ctx.fillStyle = isLight ? "#FFFFFF" : "#0E1914";
    ctx.strokeStyle = isLight ? "#C7C0B0" : "#1D3328";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(60, 270, 1080, 260, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isLight ? "#14532D" : "#A3E635";
    ctx.font = "bold 56px monospace";
    ctx.fillText(
      formatCurrency(totals.valueMax, totals.currency, locale),
      100,
      360
    );
    ctx.fillStyle = isLight ? "#2C4438" : "#88AC9B";
    ctx.font = "18px monospace";
    ctx.fillText(isId ? "ESTIMASI NILAI BANK SAMPAH" : "BANK SAMPAH CASH VALUE", 100, 400);

    ctx.fillStyle = isLight ? "#101D16" : "#F2F7F4";
    ctx.font = "bold 56px monospace";
    ctx.fillText(`${totals.co2eG} g`, 480, 360);
    ctx.fillStyle = isLight ? "#2C4438" : "#88AC9B";
    ctx.font = "18px monospace";
    ctx.fillText(isId ? "EMISI CO2e DICEGAH" : "AVOIDED CO2e EMISSIONS", 480, 400);

    ctx.fillStyle = isLight ? "#101D16" : "#F2F7F4";
    ctx.font = "bold 56px monospace";
    ctx.fillText(formatMass(totals.totalMassG, units), 840, 360);
    ctx.fillStyle = isLight ? "#2C4438" : "#88AC9B";
    ctx.font = "18px monospace";
    ctx.fillText(isId ? "ESTIMASI MASSA" : "ESTIMATED MASS", 840, 400);

    ctx.fillStyle = isLight ? "#6B7280" : "#64748B";
    ctx.font = "18px monospace";
    ctx.fillText(
      "Meta Global AI Hackathon · Built with Meta SAM 3.1 & Llama Vision",
      60,
      590
    );

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `verdara-lens-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const plantLesionStats = useMemo(() => {
    if (activeSample.mode !== "plant" || !activeSample.plantDiagnostics) {
      return null;
    }
    return computePlantLesionSeverity(
      activeSample.plantDiagnostics.leafAreaRatio,
      activeSample.plantDiagnostics.lesionAreaRatio
    );
  }, [activeSample]);

  return (
    <StudioShell>
      {/* Hijara EcoScore Toast Alert */}
      {ecoScoreToast && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2.5 rounded-full border border-emerald-500 bg-[#070D0A]/95 px-6 py-2.5 font-mono text-xs font-bold text-emerald-400 shadow-2xl backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{ecoScoreToast}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Top Header Card */}
        <div
          className={`rounded-2xl border p-5 ${
            isLight
              ? "border-[#C7C0B0] bg-white text-[#101D16]"
              : "border-[#1D3328] bg-[#0E1914] text-[#F2F7F4]"
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p
                className={`font-mono text-xs font-bold ${
                  isLight ? "text-[#14532D]" : "text-[#A3E635]"
                }`}
              >
                {"// 02 · HIJARA UNIVERSAL LENS (SAM 3.1 + META MUSE AI)"}
              </p>
              <h1 className="font-serif text-2xl font-bold sm:text-3xl">
                {isId
                  ? "Hijara Lens · Pindai Sampah, Bank Sampah & Diagnosa Tanaman"
                  : "Hijara Lens · Circular Waste Scan, Bank Sampah & Plant Diagnostics"}
              </h1>
              <p
                className={`mt-1 text-xs max-w-2xl leading-relaxed ${
                  isLight ? "text-[#2C4438]" : "text-[#A3BEB0]"
                }`}
              >
                {filterCategory === "plant"
                  ? (isId
                      ? "Arahkan kamera ke daun tanaman untuk mendiagnosa bercak klorosis, nekrosis, serta panduan perawatan 7 hari."
                      : "Aim camera at plant leaves to diagnose chlorosis, necrosis, and generate a 7-day organic care schedule.")
                  : filterCategory === "retrofit"
                  ? (isId
                      ? "Arahkan kamera ke atap rumah atau pekarangan semen untuk simulasi atap surya dan kanopi hijau biophilic."
                      : "Aim camera at rooftops or impervious pavement to simulate cool roofs and biophilic green canopy retrofits.")
                  : (isId
                      ? "Satu lensa cerdas serba bisa: identifikasi sampah daur ulang, hitung estimasi rupiah Bank Sampah, serta diagnosa tanaman Anda."
                      : "One versatile AI lens: identify recyclables, calculate Bank Sampah recovery value, and diagnose plant diseases instantly.")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleToggleVoiceReading}
                className={`flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2 font-mono text-xs font-semibold transition ${
                  isSpeaking
                    ? "border-emerald-500 bg-emerald-500 text-white animate-pulse"
                    : isLight
                    ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16] hover:bg-[#EAE5D9]"
                    : "border-[#1D3328] bg-[#070D0A] text-[#F2F7F4] hover:border-[#88AC9B]"
                }`}
                title={isId ? "Dengarkan hasil analisis via suara AI" : "Listen to analysis via AI voice"}
              >
                <span>🔊</span>
                <span>{isSpeaking ? (isId ? "Membaca..." : "Speaking...") : (isId ? "Suara AI" : "AI Voice")}</span>
              </button>

              {(hasScanned || stagedImageUrl || customImageUrl) && (
                <button
                  type="button"
                  onClick={handleResetScanner}
                  className={`flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2 font-mono text-xs font-bold transition shadow-sm ${
                    isLight
                      ? "border-red-400 bg-red-50 text-red-700 hover:bg-red-100"
                      : "border-red-500/40 bg-red-950/20 text-red-300 hover:bg-red-950/40"
                  }`}
                  title={isId ? "Reset ke mode pemindai awal" : "Reset back to initial camera mode"}
                >
                  <span>✕ {isId ? "Pindai Baru / Reset" : "Scan New / Reset"}</span>
                </button>
              )}

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
              {isId ? "MODE LENSA:" : "LENS MODE:"}
            </span>
            <button
              type="button"
              onClick={() => {
                setFilterCategory("waste");
                handleResetScanner();
              }}
              className={`min-h-[34px] cursor-pointer rounded-full px-3.5 py-1 font-semibold transition ${
                filterCategory === "waste" || filterCategory === "all"
                  ? isLight
                    ? "bg-[#14532D] text-white shadow-sm"
                    : "bg-[#A3E635] text-[#070D0A] shadow-sm"
                  : isLight
                  ? "border border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16] hover:bg-[#EAE5D9]"
                  : "border border-[#1D3328] bg-[#070D0A] text-[#A3BEB0] hover:border-[#88AC9B]"
              }`}
            >
              🗑️ {isId ? "Identifikasi Sampah & Bank Sampah" : "Waste & Bank Sampah"}
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterCategory("plant");
                handleResetScanner();
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
              🌱 {isId ? "Diagnosa Dokter Tanaman" : "Plant Doctor Diagnostic"}
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterCategory("retrofit");
                handleResetScanner();
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
              🏡 {isId ? "Retrofit Atap & Ruang Hijau" : "Biophilic Retrofit"}
            </button>
          </div>
        </div>

        {/* Main Split Workspace: Left 7 Cols Visor + Right 5 Cols Dossier */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left 7 Columns: Viewfinder & SAM 3.1 Visor */}
          <div className="space-y-4 lg:col-span-7">
            {/* When not scanned and no photo staged: Viewfinder & Input Selector */}
            {!hasScanned && !stagedImageUrl ? (
              <div
                className={`rounded-2xl border p-6 text-center transition-all ${
                  isLight
                    ? "border-[#C7C0B0] bg-white shadow-sm"
                    : "border-[#1D3328] bg-[#0E1914] shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between border-b pb-3 font-mono text-xs border-current/15">
                  {/* Camera vs Upload Tabs (Persis Hijara) */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInputTab("camera")}
                      className={`cursor-pointer rounded-lg px-3 py-1 font-bold transition ${
                        inputTab === "camera"
                          ? isLight
                            ? "bg-[#14532D] text-white"
                            : "bg-[#A3E635] text-[#070D0A]"
                          : isLight
                          ? "bg-[#F4F1EA] text-[#101D16]"
                          : "bg-[#070D0A] text-[#A3BEB0]"
                      }`}
                    >
                      📷 {isId ? "Kamera" : "Camera"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputTab("upload")}
                      className={`cursor-pointer rounded-lg px-3 py-1 font-bold transition ${
                        inputTab === "upload"
                          ? isLight
                            ? "bg-[#14532D] text-white"
                            : "bg-[#A3E635] text-[#070D0A]"
                          : isLight
                          ? "bg-[#F4F1EA] text-[#101D16]"
                          : "bg-[#070D0A] text-[#A3BEB0]"
                      }`}
                    >
                      ☁️ {isId ? "Upload" : "Upload"}
                    </button>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    ZERO-SHOT READY
                  </span>
                </div>

                {/* Viewfinder Target Reticle Frame */}
                <div className="relative mt-4 flex aspect-[4/3] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-current/25 bg-current/5 p-6 select-none sm:aspect-[16/10]">
                  {/* Corner Crosshairs */}
                  <div className="pointer-events-none absolute top-3 left-3 h-6 w-6 border-t-2 border-l-2 border-emerald-500" />
                  <div className="pointer-events-none absolute top-3 right-3 h-6 w-6 border-t-2 border-r-2 border-emerald-500" />
                  <div className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-emerald-500" />
                  <div className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-emerald-500" />

                  {inputTab === "camera" ? (
                    <div className="flex flex-col items-center">
                      <div className="text-5xl">📷</div>
                      <h2 className="mt-3 font-serif text-xl font-bold sm:text-2xl">
                        {isId ? "Kamera Perangkat Siap Membidik" : "Device Camera Ready"}
                      </h2>
                      <p
                        className={`mt-2 max-w-md text-xs leading-relaxed ${
                          isLight ? "text-[#2C4438]" : "text-[#A3BEB0]"
                        }`}
                      >
                        {isId
                          ? "Arahkan kamera ke sampah anorganik (botol, kaleng, kardus, batok kelapa) atau daun tanaman untuk segmentasi SAM 3.1."
                          : "Aim your camera at recyclables (bottles, cans, cardboard) or plant leaves for instant SAM 3.1 segmentation."}
                      </p>
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
                        className={`mt-5 flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl px-6 py-2.5 font-mono text-xs font-bold transition shadow-md ${
                          isLight
                            ? "bg-[#14532D] text-white hover:bg-[#166534]"
                            : "bg-[#A3E635] text-[#070D0A] hover:bg-[#bef264]"
                        }`}
                      >
                        <span>📷</span>
                        <span>{isId ? "Buka Kamera Device Sekarang" : "Open Device Camera Now"}</span>
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
                      <div className="text-5xl">☁️</div>
                      <h2 className="mt-3 font-serif text-xl font-bold sm:text-2xl">
                        {isId ? "Klik atau Seret Foto ke Sini" : "Click or Drag Photo Here"}
                      </h2>
                      <p
                        className={`mt-2 max-w-md text-xs leading-relaxed ${
                          isLight ? "text-[#2C4438]" : "text-[#A3BEB0]"
                        }`}
                      >
                        {isId
                          ? "Mendukung format JPG, PNG, atau WebP (Maksimal 5MB). Foto akan diproses instan oleh SAM 3.1."
                          : "Supports JPG, PNG, or WebP formats (Max 5MB). Instant local zero-cost segmentation."}
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCustomUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Quick Test Sample Tags (Persis seperti Video Hijara) */}
                <div className="mt-4 border-t pt-3 border-current/10">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 font-mono text-[11px]">
                    <span className={`font-bold ${isLight ? "text-[#14532D]" : "text-[#A3E635]"}`}>
                      {isId ? "// CONTOH CEPAT (KLIK UNTUK TES):" : "// QUICK TEST SAMPLES:"}
                    </span>
                    <span className="opacity-70 text-[10px]">
                      {isId ? "Simulasi tanpa unggah foto sendiri" : "Test without uploading your own photo"}
                    </span>
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterCategory("waste");
                        handleStageSampleImage(SAMPLE_COCONUT_SHELL_IMAGE, "sample-waste-01");
                      }}
                      className={`cursor-pointer rounded-full border px-3 py-1 font-mono text-xs transition ${
                        isLight
                          ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16] hover:bg-[#EAE5D9]"
                          : "border-[#1D3328] bg-[#070D0A] text-[#F2F7F4] hover:border-[#88AC9B]"
                      }`}
                    >
                      🥥 {isId ? "Tempurung Kelapa (Organik)" : "Coconut Shells (Organic)"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFilterCategory("waste");
                        handleStageSampleImage(SAMPLE_PET_BOTTLE_IMAGE, "sample-waste-01");
                      }}
                      className={`cursor-pointer rounded-full border px-3 py-1 font-mono text-xs transition ${
                        isLight
                          ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16] hover:bg-[#EAE5D9]"
                          : "border-[#1D3328] bg-[#070D0A] text-[#F2F7F4] hover:border-[#88AC9B]"
                      }`}
                    >
                      🧴 {isId ? "Botol Plastik PET" : "PET Plastic Bottle"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFilterCategory("waste");
                        handleStageSampleImage(SAMPLE_CARDBOARD_IMAGE, "sample-waste-01");
                      }}
                      className={`cursor-pointer rounded-full border px-3 py-1 font-mono text-xs transition ${
                        isLight
                          ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16] hover:bg-[#EAE5D9]"
                          : "border-[#1D3328] bg-[#070D0A] text-[#F2F7F4] hover:border-[#88AC9B]"
                      }`}
                    >
                      📦 {isId ? "Kardus Bekas Gelombang" : "Corrugated Cardboard"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFilterCategory("plant");
                        handleStageSampleImage(SAMPLE_PLANT_LEAF_IMAGE, "sample-plant-01");
                      }}
                      className={`cursor-pointer rounded-full border px-3 py-1 font-mono text-xs transition ${
                        isLight
                          ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16] hover:bg-[#EAE5D9]"
                          : "border-[#1D3328] bg-[#070D0A] text-[#F2F7F4] hover:border-[#88AC9B]"
                      }`}
                    >
                      🌿 {isId ? "Daun Klorosis Sakit" : "Plant Leaf (Chlorosis)"}
                    </button>
                  </div>
                </div>
              </div>
            ) : stagedImageUrl && !hasScanned ? (
              // STAGED IMAGE: Preview before analysis with Green Scanning Line
              <div
                className={`rounded-2xl border p-5 transition-all ${
                  isLight
                    ? "border-[#C7C0B0] bg-white shadow-sm"
                    : "border-[#1D3328] bg-[#0E1914] shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between border-b pb-3 font-mono text-xs border-current/15">
                  <span className={`font-bold ${isLight ? "text-[#14532D]" : "text-[#A3E635]"}`}>
                    {isId ? "// PRATINJAU FOTO SPESIMEN" : "// SPECIMEN PHOTO PREVIEW"}
                  </span>
                  <span className="opacity-75 text-[11px]">
                    {isId ? "Siap dianalsis dengan SAM 3.1" : "Ready for SAM 3.1 analysis"}
                  </span>
                </div>

                {/* Staged Image Frame with Laser Scanner Overlay */}
                <div className="relative mt-3 aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden rounded-xl border border-[#1D3328] bg-[#070D0A]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={stagedImageUrl}
                    alt="Staged specimen"
                    className="h-full w-full object-cover"
                  />

                  {/* High-Tech Glowing Laser Scan Beam (Persis Hijara Demo) */}
                  {isAnalyzing && (
                    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/45 backdrop-blur-[2px]">
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#A3E635] to-transparent shadow-[0_0_24px_#A3E635] animate-bounce" />
                      <div className="flex items-center gap-2 rounded-full border border-[#A3E635] bg-[#070D0A]/95 px-5 py-2.5 font-mono text-xs font-bold text-[#A3E635] shadow-2xl">
                        <span className="inline-block h-2 w-2 rounded-full bg-[#A3E635] animate-ping" />
                        <span>{isId ? "Menganalisis dengan SAM 3.1 & Meta AI..." : "Segmenting with Meta SAM 3.1 AI..."}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons: Reset / Analyze */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleResetScanner}
                    disabled={isAnalyzing}
                    className={`min-h-[44px] cursor-pointer rounded-xl border px-4 py-2 font-mono text-xs font-semibold transition ${
                      isLight
                        ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16] hover:bg-[#EAE5D9]"
                        : "border-[#1D3328] bg-[#070D0A] text-[#F2F7F4] hover:border-[#88AC9B]"
                    }`}
                  >
                    🔄 {isId ? "Ulang / Ganti Foto" : "Reset / Change Photo"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRunAnalysis()}
                    disabled={isAnalyzing}
                    className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl px-6 py-2.5 font-mono text-xs font-bold transition shadow-md ${
                      isLight
                        ? "bg-[#14532D] text-white hover:bg-[#166534]"
                        : "bg-[#A3E635] text-[#070D0A] hover:bg-[#bef264]"
                    }`}
                  >
                    <span>✨</span>
                    <span>
                      {isAnalyzing
                        ? (isId ? "Menganalisis..." : "Analyzing...")
                        : (isId ? "Analisis dengan SAM 3.1 AI (+10 XP) →" : "Analyze with SAM 3.1 AI (+10 XP) →")}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              // ACTIVE SCANNED VISOR: Interactive SAM 3.1 Polygons Over Image
              <>
                <div
                  className={`border p-4 rounded-2xl ${
                    isLight
                      ? "border-[#C7C0B0] bg-white shadow-sm"
                      : "border-[#1D3328] bg-[#0E1914] shadow-sm"
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

                    <button
                      type="button"
                      onClick={handleResetScanner}
                      className="cursor-pointer underline text-[11px] opacity-75 hover:opacity-100"
                    >
                      {isId ? "✕ Pindai Objek Lain" : "✕ Scan Another Object"}
                    </button>
                  </div>

                  <SpatialMaskViewer
                    sample={activeSample}
                    selectedObjectId={selectedObj.id}
                    onSelectObject={(obj) => setSelectedObjId(obj.id)}
                    xrayLevel={xrayLevel}
                    retrofitCurtainPct={retrofitCurtainPct}
                    onRetrofitCurtainChange={(pct) => setRetrofitCurtainPct(pct)}
                    showRetrofitComparison={showRetrofitComparison}
                    objectValuations={objectValuations}
                    customImageUrl={customImageUrl}
                    locale={locale}
                  />

                  {/* Scrubber Controls Bar */}
                  <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span>X-RAY:</span>
                      <input
                        type="range"
                        aria-label={
                          isId
                            ? "Tingkat Transparansi X-Ray"
                            : "X-Ray Transparency Level"
                        }
                        min={0}
                        max={100}
                        value={xrayLevel}
                        onChange={(e) => setXrayLevel(Number(e.target.value))}
                        className="h-2 w-28 cursor-pointer accent-[#A3E635]"
                      />
                      <span className="tabular-nums font-bold">{xrayLevel}%</span>
                    </div>

                    {activeSample.mode === "retrofit" && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setShowRetrofitComparison((prev) => !prev)
                          }
                          className={`min-h-[36px] cursor-pointer rounded-lg border px-3 py-1 font-mono text-xs font-bold transition ${
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
                            ? (isId ? "BEFORE/AFTER AKTIF" : "BEFORE/AFTER ON")
                            : (isId ? "AKTIFKAN BEFORE/AFTER" : "ENABLE BEFORE/AFTER")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Segmented Object Selector Strip */}
                <div
                  className={`border p-4 rounded-2xl ${
                    isLight
                      ? "border-[#C7C0B0] bg-white shadow-sm"
                      : "border-[#1D3328] bg-[#0E1914] shadow-sm"
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
                          className={`min-h-[52px] cursor-pointer border p-3 text-left transition rounded-xl ${
                            isSel
                              ? isLight
                                ? "border-[#14532D] bg-[#14532D] text-white shadow-sm"
                                : "border-[#A3E635] bg-[#A3E635] text-[#070D0A] shadow-sm"
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
              </>
            )}
          </div>

          {/* Right 5 Columns: Selected Instance Valuation & Upcycling Protocol */}
          <div className="space-y-4 lg:col-span-5">
            {!hasScanned ? (
              // STANDBY INTELLIGENCE DOSSIER (WAITING FOR SCAN)
              <div
                className={`border p-6 rounded-2xl ${
                  isLight
                    ? "border-[#C7C0B0] bg-white shadow-sm"
                    : "border-[#1D3328] bg-[#0E1914] shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between border-b pb-3 border-current/15 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className={isLight ? "font-bold text-[#14532D]" : "font-bold text-[#A3E635]"}>
                      {isId ? "// INTELIJEN VISI BERSIAGA" : "// VISION INTELLIGENCE STANDBY"}
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    SAM 3.1 + META MUSE
                  </span>
                </div>

                <div className="mt-4">
                  <p className="font-mono text-[11px] opacity-75">
                    {isId ? "STATUS SENSOR KAMERA:" : "CAMERA SENSOR STATUS:"}
                  </p>
                  <h2 className="mt-0.5 font-serif text-xl font-bold">
                    {isId ? "Menunggu Input Pemindaian" : "Waiting for Scan Input"}
                  </h2>
                  <p className={`mt-1.5 text-xs leading-relaxed ${isLight ? "text-[#2C4438]" : "text-[#A3BEB0]"}`}>
                    {isId
                      ? "Arahkan kamera ke sampah anorganik (botol, kaleng, kardus, batok kelapa) atau daun tanaman Anda. SAM 3.1 akan mengekstrak poligon segmentasi dan menghitung nilai deposit atau diagnosa kesehatan daun secara real-time."
                      : "Aim the camera at recyclables (bottles, cans, paper) or plant foliage. SAM 3.1 will segment exact instance masks and calculate local recovery values or plant health metrics in real time."}
                  </p>
                </div>

                {/* 3 Standby Stat Placeholders */}
                <div className="mt-4 grid grid-cols-3 gap-2 font-mono">
                  <div className={`border p-3 rounded-xl ${isLight ? "border-[#C7C0B0] bg-[#F4F1EA]" : "border-[#1D3328] bg-[#070D0A]"}`}>
                    <p className="text-[10px] opacity-75">{isId ? "DEPOSIT" : "VALUATION"}</p>
                    <p className="mt-1 text-base font-bold tabular-nums opacity-40">--</p>
                  </div>
                  <div className={`border p-3 rounded-xl ${isLight ? "border-[#C7C0B0] bg-[#F4F1EA]" : "border-[#1D3328] bg-[#070D0A]"}`}>
                    <p className="text-[10px] opacity-75">{isId ? "EMISI CO2e" : "AVOIDED CO2e"}</p>
                    <p className="mt-1 text-base font-bold tabular-nums opacity-40">--</p>
                  </div>
                  <div className={`border p-3 rounded-xl ${isLight ? "border-[#C7C0B0] bg-[#F4F1EA]" : "border-[#1D3328] bg-[#070D0A]"}`}>
                    <p className="text-[10px] opacity-75">{isId ? "STATUS" : "STATUS"}</p>
                    <p className="mt-1 text-xs font-bold text-emerald-500">READY</p>
                  </div>
                </div>

                {/* Diagnostic Capabilities Feature List */}
                <div className="mt-5 space-y-2.5">
                  <p className="font-mono text-xs font-bold opacity-75">
                    {isId ? "// KAPABILITAS SENSOR SAM 3.1:" : "// SAM 3.1 VISION CAPABILITIES:"}
                  </p>

                  <div className={`flex items-start gap-3 rounded-xl border p-3 text-xs leading-relaxed ${isLight ? "border-[#C7C0B0] bg-[#F4F1EA]" : "border-[#1D3328] bg-[#070D0A]"}`}>
                    <span className="text-base">🗑️</span>
                    <div>
                      <strong className="block font-semibold">{isId ? "Audit Sampah & Bank Sampah" : "Waste & Bank Sampah Audit"}</strong>
                      <span className={isLight ? "text-[#2C4438]" : "text-[#A3BEB0]"}>
                        {isId
                          ? "Segmentasi material plastik PET/HDPE, aluminium, kaca, batok kelapa, dan e-waste dengan estimasi rupiah Bank Sampah lokal."
                          : "Segment PET, HDPE, aluminum, glass, coconut shells, and e-waste with localized cash redemption values."}
                      </span>
                    </div>
                  </div>

                  <div className={`flex items-start gap-3 rounded-xl border p-3 text-xs leading-relaxed ${isLight ? "border-[#C7C0B0] bg-[#F4F1EA]" : "border-[#1D3328] bg-[#070D0A]"}`}>
                    <span className="text-base">🌱</span>
                    <div>
                      <strong className="block font-semibold">{isId ? "Dokter Tanaman & Daun Kebun" : "Plant Doctor & Leaf Health"}</strong>
                      <span className={isLight ? "text-[#2C4438]" : "text-[#A3BEB0]"}>
                        {isId
                          ? "Deteksi klorosis, nekrosis, dan rasio lesi daun berpenyakit lengkap dengan jadwal perawatan organik 7 hari."
                          : "Detect chlorosis, necrosis, and diseased lesion surface area ratios with a 7-day organic recovery schedule."}
                      </span>
                    </div>
                  </div>

                  <div className={`flex items-start gap-3 rounded-xl border p-3 text-xs leading-relaxed ${isLight ? "border-[#C7C0B0] bg-[#F4F1EA]" : "border-[#1D3328] bg-[#070D0A]"}`}>
                    <span className="text-base">🏡</span>
                    <div>
                      <strong className="block font-semibold">{isId ? "Retrofit Biophilic & Atap" : "Biophilic Retrofit & Roof"}</strong>
                      <span className={isLight ? "text-[#2C4438]" : "text-[#A3BEB0]"}>
                        {isId
                          ? "Segmentasi atap surya, halaman beton, dan simulasi penambahan kanopi hijau perkotaan."
                          : "Segment rooftop solar zones, impervious pavement, and biophilic green canopy additions."}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 border-t pt-4 border-current/10">
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
                    className={`min-h-[44px] w-full cursor-pointer rounded-xl px-4 py-2.5 font-mono text-xs font-bold transition shadow-md ${
                      isLight
                        ? "bg-[#14532D] text-white hover:bg-[#166534]"
                        : "bg-[#A3E635] text-[#070D0A] hover:bg-[#bef264]"
                    }`}
                  >
                    📷 {isId ? "Buka Kamera & Mulai Pindai Sekarang" : "Open Camera & Start Scan Now"}
                  </button>
                </div>
              </div>
            ) : activeSample.mode === "plant" ? (
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
                      {customClassification
                        ? (isId ? customClassification.detectedNameId : customClassification.detectedNameEn)
                        : (isId
                            ? activeSample.plantDiagnostics?.plantNameId ?? "Tanaman Pangan / Herbal Kebun Perkotaan"
                            : activeSample.plantDiagnostics?.plantNameEn ?? "Urban Culinary Herb / Broadleaf Crop")}
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
                        {customClassification
                          ? (isId ? customClassification.categoryTagId : customClassification.categoryTagEn)
                          : (isId ? "Infeksi Sedang" : "Moderate Risk")}
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
                        {plantLesionStats ? `${(100 - plantLesionStats.infectedPct).toFixed(1)}%` : "88.0%"}
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
                        {plantLesionStats ? `${plantLesionStats.infectedPct}%` : "12.0%"}
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
                      {customClassification
                        ? (isId ? customClassification.descriptionId : customClassification.descriptionEn)
                        : (isId
                            ? "Terdeteksi bercak klorosis nekrotik kuning seluas 12% pada helai daun utama. Tepi daun melengkung ringan akibat stres kelembapan malam hari. Diperlukan sanitasi daun dan pemberian teh kompos organik."
                            : "Detected yellow necrotic chlorosis lesions spanning 12% of leaf area. Leaf hygiene and organic compost tea drench recommended.")}
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
                    {(customClassification
                      ? (isId ? customClassification.upcyclingStepsId : customClassification.upcyclingStepsEn)
                      : (isId
                          ? activeSample.plantDiagnostics?.carePlanId ?? [
                              "Hari 1: Pangkas bagian daun yang terdampak dengan gunting steril agar jamur tidak menyebar.",
                              "Hari 2: Cek kelembapan media tanam; siram langsung di pangkal akar pukul 07.00 pagi.",
                              "Hari 3: Tambahkan 2 cm pupuk kompos kascing matang di sekitar zona perakaran.",
                              "Hari 4: Periksa bagian bawah daun; semprotkan larutan minyak nimba nabati jika ada kutu daun.",
                              "Hari 5: Pasang naungan paranet 30% jika suhu siang hari melebihi 32°C.",
                              "Hari 6: Gemburkan permukaan tanah perlahan dengan sekop mini untuk aerasi akar.",
                              "Hari 7: Pindai ulang kanopi daun dengan SAM 3.1 Lens untuk evaluasi penyembuhan.",
                            ]
                          : activeSample.plantDiagnostics?.carePlanEn ?? [
                              "Day 1: Prune affected leaf area with alcohol-sterilized shears to stop spore spread.",
                              "Day 2: Check soil moisture; water only at root base at 07:00 AM (avoid soaking foliage).",
                              "Day 3: Top-dress root perimeter with 2 cm mature organic vermicompost.",
                              "Day 4: Inspect underside of leaves; mist lightly with diluted neem oil foliar spray.",
                              "Day 5: Provide 30% afternoon shade cloth if ambient temp exceeds 32°C.",
                              "Day 6: Gently loosen compacted topsoil to restore root aeration.",
                              "Day 7: Re-scan canopy in SAM 3.1 Lens to confirm lesion recovery.",
                            ])
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
                      onClick={() => router.push("/council")}
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
                      onClick={() => router.push("/academy")}
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
                {/* Total Batch Summary Card */}
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

                  {/* Identification Header */}
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[10px] opacity-75">
                        {isId ? "STATUS IDENTIFIKASI:" : "IDENTIFICATION STATUS:"}
                      </p>
                      <h2 className="mt-0.5 font-serif text-lg font-bold flex items-center gap-2">
                        <span className="text-emerald-500">✓</span>
                        <span>
                          {customClassification
                            ? (isId ? customClassification.detectedNameId : customClassification.detectedNameEn)
                            : (isId ? activeSample.titleId : activeSample.titleEn)}
                        </span>
                      </h2>
                    </div>

                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/40 px-3 py-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {customClassification
                        ? (isId ? customClassification.categoryTagId : customClassification.categoryTagEn)
                        : (selectedObj.materialCode === "ORGANIC" ? "ORGANIK" : "DAUR ULANG")}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 font-mono">
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

                  <div className="mt-3.5 space-y-2 text-xs leading-relaxed">
                    <p className={`${isLight ? "text-[#2C4438]" : "text-[#A3BEB0]"}`}>
                      <strong>{isId ? "Deskripsi: " : "Description: "}</strong>
                      {customClassification
                        ? (isId ? customClassification.descriptionId : customClassification.descriptionEn)
                        : (isId ? selectedObj.disposalId : selectedObj.disposalEn)}
                    </p>

                    <p className={`${isLight ? "text-[#2C4438]" : "text-[#A3BEB0]"}`}>
                      <strong>{isId ? "Dampak Lingkungan: " : "Environmental Impact: "}</strong>
                      {customClassification
                        ? (isId ? customClassification.environmentalImpactId : customClassification.environmentalImpactEn)
                        : (isId ? geo.policy.policySummaryId : geo.policy.policySummaryEn)}
                    </p>
                  </div>
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
                        {isId ? "// PANDUAN PENGOLAHAN LANGKAH DEMI LANGKAH" : "// STEP-BY-STEP RECOVERY PROTOCOL"}
                      </p>
                      <h3 className="mt-0.5 font-serif text-lg font-bold">
                        {customClassification
                          ? (isId ? customClassification.sample.objects[0]?.upcyclingRecipe.titleId : customClassification.sample.objects[0]?.upcyclingRecipe.titleEn)
                          : (isId ? selectedObj.upcyclingRecipe.titleId : selectedObj.upcyclingRecipe.titleEn)}
                      </h3>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      UPCYCLING
                    </span>
                  </div>

                  {/* Steps List */}
                  <div className="mt-4 space-y-2">
                    {(customClassification
                      ? (isId ? customClassification.upcyclingStepsId : customClassification.upcyclingStepsEn)
                      : (isId ? selectedObj.upcyclingRecipe.stepsId : selectedObj.upcyclingRecipe.stepsEn)
                    ).map((step, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 rounded-xl border p-3 text-xs leading-relaxed ${
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

                  {/* Navigation and Radar Routing CTA */}
                  <div className="mt-5 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => handleRouteToRadar(selectedObj.materialCode)}
                      className={`min-h-[44px] w-full cursor-pointer rounded-xl px-4 py-2.5 font-mono text-xs font-bold transition shadow-sm ${
                        isLight
                          ? "bg-[#14532D] text-white hover:bg-[#166534]"
                          : "bg-[#A3E635] text-[#070D0A] hover:bg-[#bef264]"
                      }`}
                    >
                      {isId
                        ? `📍 Temukan Bank Sampah Terdekat (${selectedObj.materialCode}) di Peta 3D (/radar) →`
                        : `📍 Find Nearest Bank Sampah Hub (${selectedObj.materialCode}) in 3D Radar (/radar) →`}
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

        {/* Accessible Share / Export Dialog */}
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
                    `Segmented ${activeSample.objects.length} material instances in ${geo.city} with Verdara (Meta SAM 3.1 + Muse): ${totals.co2eG}g CO2e avoided. #MetaAIHackathon`
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
