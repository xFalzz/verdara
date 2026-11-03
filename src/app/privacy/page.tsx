"use client";

import React, { useState } from "react";
import Link from "next/link";
import StudioShell from "@/components/ui/StudioShell";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import { VerdaraLogo } from "@/components/ui/InteractiveEffects";

export default function PrivacyPage() {
  const { locale, theme } = useVerdaraStore();
  const isId = locale === "id";
  const isLight = theme === "light";
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", labelEn: "1. Overview & Scope", labelId: "1. Ikhtisar & Ruang Lingkup" },
    { id: "data-collected", labelEn: "2. Information We Collect", labelId: "2. Informasi yang Kami Kumpulkan" },
    { id: "ai-processing", labelEn: "3. Meta AI & Multimodal Processing", labelId: "3. Pemrosesan Meta AI & Multimodal" },
    { id: "geospatial", labelEn: "4. Geospatial & Satellite Data", labelId: "4. Data Geospasial & Satelit" },
    { id: "storage-security", labelEn: "5. Security & Data Retention", labelId: "5. Keamanan & Retensi Data" },
    { id: "user-rights", labelEn: "6. Your Rights (GDPR & UU PDP)", labelId: "6. Hak Anda (GDPR & UU PDP)" },
    { id: "contact", labelEn: "7. Contact & Data Officer", labelId: "7. Kontak & Pejabat Data" },
  ];

  return (
    <StudioShell>
      <div className="mx-auto max-w-[1100px] pb-24 pt-4">
        {/* Header Hero Banner */}
        <div
          className={`relative overflow-hidden rounded-[24px] sm:rounded-[28px] border p-6 sm:p-10 mb-8 transition-colors ${
            isLight
              ? "border-black/10 bg-[#FAF9F5] text-[#142A1E] shadow-sm"
              : "border-white/10 bg-[#0B0F0D] text-[#E0E7E3] shadow-xl"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#1e9e5a] dark:text-[#a3e635]">
                <VerdaraLogo size={24} />
                <span>{isId ? "KEBIJAKAN PRIVASI RESMI" : "OFFICIAL PRIVACY POLICY"}</span>
              </div>
              <h1 className="font-sans text-2xl sm:text-4xl font-extrabold tracking-tight">
                {isId ? "Kebijakan Privasi Verdara" : "Verdara Privacy Policy"}
              </h1>
              <p className="max-w-2xl text-xs sm:text-sm text-current/75">
                {isId
                  ? "Komitmen kami untuk melindungi data spasial, analisis atap, dan interaksi Meta AI Anda sesuai standar OWASP ASVS Level 2, GDPR, dan UU Perlindungan Data Pribadi (UU PDP No. 27/2022)."
                  : "Our commitment to safeguarding your spatial data, rooftop calculations, and Meta AI interactions under OWASP ASVS Level 2, GDPR, and Indonesian Personal Data Protection (UU PDP No. 27/2022)."}
              </p>
            </div>
            <div className="shrink-0 font-mono text-[11px] rounded-xl border border-current/15 px-3 py-2 text-current/70">
              <p>{isId ? "Berlaku Efektif:" : "Effective Date:"}</p>
              <p className="font-bold text-current">03 November 2026</p>
            </div>
          </div>
        </div>

        {/* Content Layout: Sidebar Nav + Main Body */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Sticky Table of Contents (Desktop) */}
          <aside className="lg:col-span-4">
            <div
              className={`sticky top-20 rounded-2xl border p-4 transition-colors ${
                isLight ? "border-black/10 bg-white" : "border-white/10 bg-[#0D1210]"
              }`}
            >
              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-wider text-current/60">
                {isId ? "Daftar Isi Kebijakan" : "Policy Table of Contents"}
              </p>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={() => setActiveSection(sec.id)}
                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition ${
                      activeSection === sec.id
                        ? "bg-[#14532D] text-white font-bold dark:bg-[#A3E635] dark:text-[#08090C]"
                        : "text-current/75 hover:bg-current/5 hover:text-current"
                    }`}
                  >
                    {isId ? sec.labelId : sec.labelEn}
                  </a>
                ))}
              </nav>

              <div className="mt-6 border-t border-current/10 pt-4 text-[11px] text-current/65 space-y-2 font-mono">
                <p>Version: 3.2-LTS</p>
                <p>Governing: Meta AI Studio / Verdara Spatial Labs</p>
                <Link
                  href="/terms"
                  className="inline-block text-[#1e9e5a] dark:text-[#a3e635] font-bold hover:underline"
                >
                  {isId ? "Baca Syarat Ketentuan →" : "Read Terms of Service →"}
                </Link>
              </div>
            </div>
          </aside>

          {/* Detailed Policy Text */}
          <div className="space-y-8 lg:col-span-8 text-xs sm:text-sm leading-relaxed">
            {/* 1. Overview */}
            <section
              id="overview"
              className={`rounded-2xl border p-6 transition-colors ${
                isLight ? "border-black/10 bg-white" : "border-white/10 bg-[#0D1210]"
              }`}
            >
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
                <span className="font-mono text-[#1e9e5a] dark:text-[#a3e635]">01.</span>
                <span>{isId ? "Ikhtisar & Ruang Lingkup" : "Overview & Scope"}</span>
              </h2>
              <p className="mb-3">
                {isId
                  ? "Verdara ('kami', 'platform') adalah platform spatial intelligence dan audit ketahanan iklim perkotaan yang memanfaatkan teknologi Meta AI (SAM 3.1 & Muse Spark). Kebijakan ini menjelaskan bagaimana data Anda dikumpulkan, diproses, dan dilindungi saat mengakses situs web kami di https://verdaraa.vercel.app dan layanannya."
                  : "Verdara ('we', 'platform') is an urban spatial intelligence and climate resilience audit platform powered by Meta AI technologies (SAM 3.1 & Muse Spark). This policy outlines how your data is collected, processed, and safeguarded when using https://verdaraa.vercel.app and related spatial services."}
              </p>
              <p>
                {isId
                  ? "Kami memegang teguh prinsip minimalisasi data: kami hanya meminta data yang esensial untuk mengkalkulasi potensi energi surya fotovoltaik, limpasan hidrologi tapak, dan rekomendasi sirkular bank sampah."
                  : "We adhere strictly to the principle of data minimization: we only process data strictly necessary to compute photovoltaic potential, urban site hydrology runoff, and circular salvage economics."}
              </p>
            </section>

            {/* 2. Information We Collect */}
            <section
              id="data-collected"
              className={`rounded-2xl border p-6 transition-colors ${
                isLight ? "border-black/10 bg-white" : "border-white/10 bg-[#0D1210]"
              }`}
            >
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
                <span className="font-mono text-[#1e9e5a] dark:text-[#a3e635]">02.</span>
                <span>{isId ? "Informasi yang Kami Kumpulkan" : "Information We Collect"}</span>
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wide text-current/80">
                    {isId ? "A. Data Akun & Autentikasi" : "A. Account & Authentication Data"}
                  </h3>
                  <p className="text-current/85 mt-1">
                    {isId
                      ? "Ketika Anda masuk menggunakan Google OAuth atau Email melalui Supabase, kami menerima pengenal akun dasar seperti alamat email terverifikasi, nama tampilan publik, dan foto profil. Kata sandi Anda tidak pernah disimpan di server kami karena dikelola secara terenkripsi oleh Supabase Auth."
                      : "When you sign in via Google OAuth or Email through Supabase, we receive fundamental account identifiers including your verified email address, display name, and avatar URL. Your passwords are never stored on our servers; they are encrypted by Supabase Auth."}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wide text-current/80">
                    {isId ? "B. Data Parameter Bangunan & Spasial" : "B. Building & Spatial Parameters"}
                  </h3>
                  <p className="text-current/85 mt-1">
                    {isId
                      ? "Luas tapak atap (m²), koefisien limpasan air hujan, rasio area aktif surya, serta koordinat lintang/bujur yang Anda pilih untuk audit iklim mikro."
                      : "Roof footprint area (m²), stormwater runoff coefficients, usable solar roof fraction, and latitude/longitude coordinates selected for microclimate simulation."}
                  </p>
                </div>
              </div>
            </section>

            {/* 3. Meta AI & Multimodal Processing */}
            <section
              id="ai-processing"
              className={`rounded-2xl border p-6 transition-colors ${
                isLight ? "border-black/10 bg-white" : "border-white/10 bg-[#0D1210]"
              }`}
            >
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
                <span className="font-mono text-[#1e9e5a] dark:text-[#a3e635]">03.</span>
                <span>{isId ? "Pemrosesan Meta AI & Multimodal" : "Meta AI & Multimodal Processing"}</span>
              </h2>
              <p className="mb-3">
                {isId
                  ? "Platform kami mengintegrasikan model resmi Meta AI (Meta SAM 3.1 untuk segmentasi atap/material dan Meta Muse Spark 1.3 untuk sidang dewan pakar ekologis)."
                  : "Our platform integrates official Meta AI models (Meta SAM 3.1 for zero-shot roof segmentation and Meta Muse Spark 1.3 for multidisciplinary council reasoning)."}
              </p>
              <div
                className={`rounded-xl border p-4 ${
                  isLight ? "border-emerald-200 bg-emerald-50/70" : "border-emerald-900/50 bg-emerald-950/20"
                }`}
              >
                <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-300 mb-1">
                  {isId ? "Jaminan Tanpa Pelatihan Model (Zero Training Guarantee)" : "Zero Training Guarantee"}
                </h4>
                <p className="text-xs text-emerald-800/90 dark:text-emerald-200/90">
                  {isId
                    ? "Foto atap yang Anda unggah ke Lensa SAM 3.1 dan pertanyaan yang diajukan ke AI Council diproses secara ephemeral melalui API resmi Meta. Data Anda TIDAK digunakan untuk melatih model dasar Meta tanpa persetujuan eksplisit Anda."
                    : "Rooftop imagery uploaded to SAM 3.1 Lens and consultation queries submitted to AI Council are processed ephemerally via official Meta Model APIs. Your data is NOT used to train Meta foundation models without your explicit consent."}
                </p>
              </div>
            </section>

            {/* 4. Geospatial & Satellite Data */}
            <section
              id="geospatial"
              className={`rounded-2xl border p-6 transition-colors ${
                isLight ? "border-black/10 bg-white" : "border-white/10 bg-[#0D1210]"
              }`}
            >
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
                <span className="font-mono text-[#1e9e5a] dark:text-[#a3e635]">04.</span>
                <span>{isId ? "Data Geospasial & Satelit" : "Geospatial & Satellite Data"}</span>
              </h2>
              <p className="mb-3">
                {isId
                  ? "Peta 3D Verdara menggunakan MapTiler Cloud dan OpenStreetMap (OSM) di bawah lisensi Open Database License (ODbL). Data radiasi matahari diperoleh secara publik dari NASA POWER GHI dan Open-Meteo ERA5 10-Year Climatology Reanalysis."
                  : "Verdara 3D maps utilize MapTiler Cloud and OpenStreetMap (OSM) under the Open Database License (ODbL). Solar irradiance values are derived publicly from NASA POWER GHI and Open-Meteo ERA5 10-Year Climatology Reanalysis."}
              </p>
              <p>
                {isId
                  ? "Kami tidak melacak riwayat GPS perangkat Anda secara pasif; geolokasi hanya dibaca sekali saat Anda menekan tombol 'Deteksi Lokasi Saya' dengan izin peramban eksplisit."
                  : "We never passively track your hardware GPS location; coordinates are accessed only upon explicitly clicking 'Detect My Location' with direct browser permissions."}
              </p>
            </section>

            {/* 5. Security & Data Retention */}
            <section
              id="storage-security"
              className={`rounded-2xl border p-6 transition-colors ${
                isLight ? "border-black/10 bg-white" : "border-white/10 bg-[#0D1210]"
              }`}
            >
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
                <span className="font-mono text-[#1e9e5a] dark:text-[#a3e635]">05.</span>
                <span>{isId ? "Keamanan & Retensi Data" : "Security & Data Retention"}</span>
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>OWASP ASVS Level 2 Security Headers:</strong>{" "}
                  {isId
                    ? "Dilengkapi Content-Security-Policy (CSP) ketat, HSTS preload (63.072.000 detik), X-Frame-Options DENY, dan perlindungan anti-CSRF."
                    : "Enforced with strict Content-Security-Policy (CSP), HSTS preload (63,072,000s), X-Frame-Options DENY, and anti-CSRF shields."}
                </li>
                <li>
                  <strong>Enkripsi In-Transit & At-Rest:</strong>{" "}
                  {isId
                    ? "Seluruh transmisi data dienkripsi dengan protokol TLS 1.3 (HTTPS) dan basis data PostgreSQL Supabase diamankan dengan enkripsi AES-256."
                    : "All data in transit is encrypted via TLS 1.3 (HTTPS), with Supabase PostgreSQL databases protected by AES-256 storage encryption."}
                </li>
                <li>
                  <strong>Rate Limiting & Abuse Prevention:</strong>{" "}
                  {isId
                    ? "Algoritma sliding-window token bucket memitigasi serangan brute-force dan eksploitasi kuota API Meta."
                    : "Sliding-window token bucket algorithms prevent brute-force abuse and API quota exploitation."}
                </li>
              </ul>
            </section>

            {/* 6. User Rights */}
            <section
              id="user-rights"
              className={`rounded-2xl border p-6 transition-colors ${
                isLight ? "border-black/10 bg-white" : "border-white/10 bg-[#0D1210]"
              }`}
            >
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
                <span className="font-mono text-[#1e9e5a] dark:text-[#a3e635]">06.</span>
                <span>{isId ? "Hak Anda (GDPR & UU PDP No. 27/2022)" : "Your Rights (GDPR & UU PDP)"}</span>
              </h2>
              <p className="mb-3">
                {isId
                  ? "Sesuai regulasi privasi global dan Undang-Undang Perlindungan Data Pribadi Indonesia, Anda memiliki hak penuh terhadap data Anda:"
                  : "In accordance with global privacy frameworks and Indonesian Data Protection laws, you possess comprehensive rights over your personal data:"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="rounded-xl border border-current/10 p-3 bg-current/[0.02]">
                  <p className="font-bold text-current">{isId ? "Hak Akses & Portabilitas" : "Right to Access & Portability"}</p>
                  <p className="text-current/70 mt-1">{isId ? "Ekspor seluruh catatan audit spasial Anda dalam format JSON di menu /settings." : "Export all your spatial audit records in JSON format via /settings."}</p>
                </div>
                <div className="rounded-xl border border-current/10 p-3 bg-current/[0.02]">
                  <p className="font-bold text-current">{isId ? "Hak Penghapusan (Dilupakan)" : "Right to Erasure (Be Forgotten)"}</p>
                  <p className="text-current/70 mt-1">{isId ? "Hapus seluruh riwayat dan akun Anda secara permanen kapan saja di menu /settings." : "Permanently erase your account history and credentials at any time in /settings."}</p>
                </div>
              </div>
            </section>

            {/* 7. Contact */}
            <section
              id="contact"
              className={`rounded-2xl border p-6 transition-colors ${
                isLight ? "border-black/10 bg-white" : "border-white/10 bg-[#0D1210]"
              }`}
            >
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
                <span className="font-mono text-[#1e9e5a] dark:text-[#a3e635]">07.</span>
                <span>{isId ? "Kontak & Petugas Perlindungan Data" : "Contact & Data Protection Officer"}</span>
              </h2>
              <p className="mb-2">
                {isId
                  ? "Jika Anda memiliki pertanyaan tentang kebijakan privasi ini atau ingin mengajukan permohonan hak subjek data, hubungi tim keamanan kami di:"
                  : "If you have any questions regarding this Privacy Policy or wish to exercise data subject rights, please contact our data team at:"}
              </p>
              <div className="rounded-xl bg-current/[0.04] p-4 font-mono text-xs space-y-1">
                <p>Verdara Spatial Labs · Data Governance Team</p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:nawfalirfan005@gmail.com"
                    className="underline text-[#1e9e5a] dark:text-[#a3e635] hover:opacity-80"
                  >
                    nawfalirfan005@gmail.com
                  </a>
                </p>
                <p>Jakarta, Indonesia · San Francisco, CA, USA</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
