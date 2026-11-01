"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

export interface DeviceCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string, category?: "auto" | "waste" | "plant") => void;
  locale?: "en" | "id";
  theme?: "light" | "dark";
}

export default function DeviceCameraModal({
  isOpen,
  onClose,
  onCapture,
  locale = "id",
  theme = "dark",
}: DeviceCameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [captureCategory, setCaptureCategory] = useState<"auto" | "waste" | "plant">("auto");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const isId = locale === "id";
  const isLight = theme === "light";

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startStream = useCallback(async (mode: "environment" | "user") => {
    stopStream();
    setCameraError(null);
    setIsInitializing(true);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError(
        isId
          ? "Perangkat atau peramban Anda tidak mendukung akses kamera langsung."
          : "Your device or browser does not support live camera access."
      );
      setIsInitializing(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch {
      try {
        // Fallback to basic video constraint without ideal facingMode
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        setCameraError(
          isId
            ? "Izin kamera ditolak atau kamera sedang digunakan oleh aplikasi lain."
            : "Camera permission denied or camera is in use by another app."
        );
      }
    } finally {
      setIsInitializing(false);
    }
  }, [isId, stopStream]);

  useEffect(() => {
    if (isOpen) {
      startStream(facingMode);
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, startStream, stopStream]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSnap = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    stopStream();
    onCapture(dataUrl, captureCategory);
    onClose();
  };

  const toggleCamera = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startStream(nextMode);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className={`relative w-full max-w-2xl overflow-hidden rounded-3xl border shadow-2xl transition-all ${
          isLight
            ? "border-[#C7C0B0] bg-[#FFFFFF] text-[#101D16]"
            : "border-[#1D3328] bg-[#070D0A] text-[#F2F7F4]"
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold text-[#c6f432]">
              {isId ? "KAMERA LAPANGAN SAM 3.1" : "SAM 3.1 FIELD SCANNER"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:text-white"
            aria-label={isId ? "Tutup kamera" : "Close camera"}
          >
            ✕
          </button>
        </div>

        {/* Verdara Lens Mode Pill Bar */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 border-b border-white/10 bg-[#080E0A] px-4 py-2 font-mono text-[11px]">
          <span className="text-neutral-400 mr-1 text-[10px] uppercase tracking-wider">
            {isId ? "Mode Fokus:" : "Focus Mode:"}
          </span>
          <button
            type="button"
            onClick={() => setCaptureCategory("auto")}
            className={`min-h-[30px] cursor-pointer rounded-full px-3 py-0.5 text-xs font-semibold transition ${
              captureCategory === "auto"
                ? "bg-[#c6f432] text-[#08090c]"
                : "bg-white/5 text-neutral-300 hover:bg-white/10"
            }`}
          >
            🌿 {isId ? "Deteksi Otomatis" : "Auto-Detect"}
          </button>
          <button
            type="button"
            onClick={() => setCaptureCategory("waste")}
            className={`min-h-[30px] cursor-pointer rounded-full px-3 py-0.5 text-xs font-semibold transition ${
              captureCategory === "waste"
                ? "bg-[#c6f432] text-[#08090c]"
                : "bg-white/5 text-neutral-300 hover:bg-white/10"
            }`}
          >
            🗑️ {isId ? "Sampah & Bank Sampah" : "Waste & Circular"}
          </button>
          <button
            type="button"
            onClick={() => setCaptureCategory("plant")}
            className={`min-h-[30px] cursor-pointer rounded-full px-3 py-0.5 text-xs font-semibold transition ${
              captureCategory === "plant"
                ? "bg-[#c6f432] text-[#08090c]"
                : "bg-white/5 text-neutral-300 hover:bg-white/10"
            }`}
          >
            🌱 {isId ? "Diagnosa Tanaman" : "Plant Doctor"}
          </button>
        </div>

        {/* Viewfinder Stage */}
        <div className="relative aspect-[4/3] w-full bg-black overflow-hidden flex items-center justify-center">
          {cameraError ? (
            <div className="p-6 text-center max-w-md space-y-3 font-mono text-xs">
              <div className="text-3xl">📷</div>
              <p className="text-red-400 font-semibold">{cameraError}</p>
              <p className="text-neutral-400 text-[11px]">
                {isId
                  ? "Pastikan Anda memberikan izin akses kamera di pengaturan browser."
                  : "Please ensure camera permissions are allowed in browser settings."}
              </p>
              <button
                type="button"
                onClick={() => startStream(facingMode)}
                className="mt-2 min-h-[36px] rounded-lg bg-neutral-800 px-4 py-1.5 text-xs text-white hover:bg-neutral-700"
              >
                {isId ? "Coba Lagi" : "Retry"}
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${
                  facingMode === "user" ? "scale-x-[-1]" : ""
                }`}
              />

              {/* Viewfinder Target Reticle */}
              <div className="pointer-events-none absolute inset-6 sm:inset-10 border border-white/20 rounded-2xl flex flex-col justify-between p-3 select-none">
                <div className="flex justify-between font-mono text-[10px] text-[#c6f432]/80">
                  <span>[00:00:LIVE]</span>
                  <span>{facingMode.toUpperCase()}</span>
                </div>

                <div className="self-center flex items-center justify-center">
                  <div className="h-10 w-10 border-2 border-[#c6f432]/60 rounded-full" />
                </div>

                <div className="flex justify-between font-mono text-[9px] text-white/50">
                  <span>META SAM 3.1 ZERO-SHOT</span>
                  <span>1080P PRO</span>
                </div>
              </div>

              {isInitializing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-mono text-xs text-[#c6f432]">
                  {isId ? "Menginisialisasi Kamera..." : "Initializing Camera..."}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Shutter Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#0A120E]">
          <button
            type="button"
            onClick={toggleCamera}
            disabled={Boolean(cameraError)}
            className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 font-mono text-xs text-neutral-300 transition hover:bg-white/10 disabled:opacity-40"
          >
            <span>🔄</span>
            <span>{isId ? "Balik Kamera" : "Flip Camera"}</span>
          </button>

          <button
            type="button"
            onClick={handleSnap}
            disabled={Boolean(cameraError) || isInitializing}
            className="flex min-h-[52px] min-w-[52px] cursor-pointer items-center justify-center rounded-full border-4 border-white/30 bg-[#c6f432] p-1.5 shadow-xl transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
            aria-label={isId ? "Ambil foto spesimen" : "Snap specimen photo"}
          >
            <div className="h-9 w-9 rounded-full bg-[#080808]" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] cursor-pointer rounded-xl border border-white/15 bg-transparent px-4 py-2 font-mono text-xs text-neutral-400 hover:text-white hover:bg-white/5"
          >
            {isId ? "Batal" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
