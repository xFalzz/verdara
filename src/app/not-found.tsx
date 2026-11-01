import React from "react";
import Link from "next/link";
import { VerdaraLogo } from "@/components/ui/InteractiveEffects";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#070D0A] px-4 text-center text-[#F2F7F4]">
      <div className="max-w-md rounded-3xl border border-[#1D3328] bg-[#0E1914] p-8 shadow-2xl">
        <div className="mx-auto mb-4 flex justify-center">
          <VerdaraLogo size={48} />
        </div>
        <p className="font-mono text-xs uppercase tracking-wider text-[#A3E635]">
          404 / Halaman Tidak Ditemukan
        </p>
        <h1 className="mt-2 text-2xl font-bold">
          Page Not Found
        </h1>
        <p className="mt-3 text-xs leading-relaxed text-[#A3BEB0]">
          Halaman yang Anda tuju tidak ditemukan atau telah dipindahkan ke alamat lain.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/"
            className="flex min-h-[44px] items-center justify-center rounded-xl bg-[#A3E635] px-5 text-xs font-bold text-[#070D0A] transition hover:bg-[#bef264]"
          >
            Kembali ke Beranda →
          </Link>
          <Link
            href="/dashboard"
            className="flex min-h-[44px] items-center justify-center rounded-xl border border-[#1D3328] bg-[#070D0A] px-4 text-xs font-semibold text-[#F2F7F4] hover:bg-[#13221B]"
          >
            Buka Studio Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
