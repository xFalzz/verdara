"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // If the error is a ChunkLoadError (outdated bundles or webpack dev mismatch),
    // automatically reload once to fetch the fresh bundle from server.
    const isChunkError =
      error.name === "ChunkLoadError" ||
      error.message?.includes("Loading chunk") ||
      error.message?.includes("ChunkLoadError");

    if (isChunkError && typeof window !== "undefined") {
      const hasReloaded = sessionStorage.getItem("chunk_reload_lock");
      if (!hasReloaded) {
        sessionStorage.setItem("chunk_reload_lock", "true");
        window.location.reload();
      }
    }
  }, [error]);

  const handleManualReload = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("chunk_reload_lock");
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#070D0A] px-4 text-center text-[#F2F7F4]">
      <div className="max-w-md rounded-3xl border border-[#1D3328] bg-[#0E1914] p-8 shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A3E635]/10 text-2xl font-bold text-[#A3E635]">
          ⟳
        </div>
        <p className="font-mono text-xs uppercase tracking-wider text-[#A3E635]">
          Pembaruan Aplikasi Tersedia
        </p>
        <h1 className="mt-2 text-xl font-bold">
          Versi Halaman Telah Diperbarui
        </h1>
        <p className="mt-3 text-xs leading-relaxed text-[#A3BEB0]">
          Halaman memerlukan sinkronisasi berkas terbaru dari server. Silakan klik tombol di bawah untuk memuat ulang versi terbaru secara instan.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleManualReload}
            className="flex min-h-[44px] cursor-pointer items-center justify-center rounded-xl bg-[#A3E635] px-5 text-xs font-bold text-[#070D0A] transition hover:bg-[#bef264]"
          >
            Muat Ulang Halaman (Reload) →
          </button>
          <Link
            href="/"
            className="flex min-h-[44px] items-center justify-center rounded-xl border border-[#1D3328] bg-[#070D0A] px-4 text-xs font-semibold text-[#F2F7F4] hover:bg-[#13221B]"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
