"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  nextPath?: string;
  locale?: "en" | "id";
  theme?: "light" | "dark";
}

export default function AuthGateModal({
  isOpen,
  onClose,
  title,
  message,
  nextPath = "/dashboard",
  locale = "id",
  theme = "dark",
}: AuthGateModalProps) {
  const isId = locale === "id";
  const isLight = theme === "light";

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

  if (!isOpen) return null;

  const defaultTitle = isId
    ? "Akses Fitur AI Meta Terkunci"
    : "Meta AI Feature Access Locked";

  const defaultMessage = isId
    ? "Fitur AI Meta memerlukan akun terverifikasi. Silakan login terlebih dahulu."
    : "Meta AI features require a verified account. Please sign in first.";

  const explanation = isId
    ? "Untuk melindungi kuota credit token Meta AI dari penyalahgunaan dan menjaga stabilitas sistem, fitur konsultasi langsung 3 Pakar AI dan pemindaian visual kustom dikhususkan bagi pengguna yang telah masuk."
    : "To safeguard Meta AI credit tokens from depletion and ensure system stability, interactive specialist consultations and custom image scans are reserved for verified accounts.";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all ${
          isLight
            ? "border-[#C7C0B0] bg-[#FFFFFF] text-[#101D16]"
            : "border-[#F59E0B]/40 bg-[#0E1511] text-[#F2F7F4]"
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 font-mono text-xs">
          <div className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-wider">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
            <span>{isId ? "VERIFIKASI AKUN DIPERLUKAN" : "VERIFIED ACCOUNT REQUIRED"}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded"
            aria-label={isId ? "Tutup dialog" : "Close dialog"}
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
            {title || defaultTitle}
          </h2>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 font-mono text-xs text-amber-400">
            {message || defaultMessage}
          </div>
          <p className="font-sans text-xs leading-relaxed text-neutral-400">
            {explanation}
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] cursor-pointer rounded-xl border border-neutral-700 bg-transparent px-4 py-2 font-mono text-xs text-neutral-300 transition hover:bg-neutral-800"
          >
            {isId ? "Tetap Jelajahi Pratinjau Sandbox" : "Continue Sandbox Preview"}
          </button>
          <Link
            href={`/login?next=${encodeURIComponent(nextPath)}`}
            prefetch={false}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center cursor-pointer rounded-xl bg-amber-400 px-5 py-2 font-sans text-xs font-bold text-black transition hover:bg-amber-300"
          >
            {isId ? "Masuk atau Daftar Sekarang →" : "Sign In or Register Now →"}
          </Link>
        </div>
      </div>
    </div>
  );
}
