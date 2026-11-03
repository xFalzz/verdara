"use client";

import React, { useState } from "react";
import Link from "next/link";
import StudioShell from "@/components/ui/StudioShell";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import { VerdaraLogo } from "@/components/ui/InteractiveEffects";

export default function TermsPage() {
  const { locale, theme } = useVerdaraStore();
  const isId = locale === "id";
  const isLight = theme === "light";
  const [activeSection, setActiveSection] = useState("agreement");

  const sections = [
    { id: "agreement", labelEn: "1. Agreement to Terms", labelId: "1. Persetujuan Ketentuan" },
    { id: "services-scope", labelEn: "2. Services & AI Studio Scope", labelId: "2. Layanan & Ruang Lingkup Studio" },
    { id: "scientific-disclaimer", labelEn: "3. Engineering Disclaimers", labelId: "3. Batasan Tanggung Jawab Sains" },
    { id: "acceptable-use", labelEn: "4. Acceptable Use & AI Safety", labelId: "4. Penggunaan Layak & Keamanan AI" },
    { id: "intellectual-property", labelEn: "5. Intellectual Property", labelId: "5. Hak Kekayaan Intelektual" },
    { id: "termination", labelEn: "6. Account & Termination", labelId: "6. Akun & Penghentian" },
    { id: "governing-law", labelEn: "7. Governing Law", labelId: "7. Hukum yang Berlaku" },
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
                <span>{isId ? "SYARAT & KETENTUAN LAYANAN" : "TERMS OF SERVICE AGREEMENT"}</span>
              </div>
              <h1 className="font-sans text-2xl sm:text-4xl font-extrabold tracking-tight">
                {isId ? "Syarat Ketentuan Verdara" : "Verdara Terms of Service"}
              </h1>
              <p className="max-w-2xl text-xs sm:text-sm text-current/75">
                {isId
                  ? "Aturan penggunaan platform spatial twin, simulasi fisika atap surya NREL PVWatts, dan konsultasi kecerdasan buatan Meta Model API."
                  : "Governing terms for the living spatial twin platform, NREL PVWatts rooftop physics simulations, and Meta Model API AI Council deliberations."}
              </p>
            </div>
            <div className="shrink-0 font-mono text-[11px] rounded-xl border border-current/15 px-3 py-2 text-current/70">
              <p>{isId ? "Pembaruan Terakhir:" : "Last Updated:"}</p>
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
                {isId ? "Navigasi Ketentuan" : "Terms Navigation"}
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
                <p>Status: Production Release v3.2</p>
                <p>Compliance: Meta AI Global Guidelines</p>
                <Link
                  href="/privacy"
                  className="inline-block text-[#1e9e5a] dark:text-[#a3e635] font-bold hover:underline"
                >
                  {isId ? "Baca Kebijakan Privasi →" : "Read Privacy Policy →"}
                </Link>
              </div>
            </div>
          </aside>

          {/* Detailed Terms Content */}
          <div className="space-y-8 lg:col-span-8 text-xs sm:text-sm leading-relaxed">
            {/* 1. Agreement */}
            <section
              id="agreement"
              className={`rounded-2xl border p-6 transition-colors ${
                isLight ? "border-black/10 bg-white" : "border-white/10 bg-[#0D1210]"
              }`}
            >
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
                <span className="font-mono text-[#1e9e5a] dark:text-[#a3e635]">01.</span>
                <span>{isId ? "Persetujuan terhadap Ketentuan" : "Agreement to Terms"}</span>
              </h2>
              <p className="mb-3">
                {isId
                  ? "Dengan mengakses atau menggunakan platform Verdara (termasuk https://verdaraa.vercel.app, API terkait, dan antarmuka Studio), Anda menyatakan setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui salah satu bagian ketentuan, Anda dipersilakan menghentikan penggunaan layanan kami."
                  : "By accessing or using the Verdara platform (including https://verdaraa.vercel.app, underlying APIs, and Studio interfaces), you agree to be bound by these Terms of Service. If you disagree with any portion of these terms, you must discontinue using our services."}
              </p>
              <p>
                {isId
                  ? "Layanan ini ditujukan untuk pengguna berusia minimal 18 tahun atau yang telah memiliki persetujuan orang tua/wali hukum yang sah."
                  : "These services are intended for individuals who are at least 18 years of age or possess legal parental or guardian consent."}
              </p>
            </section>

            {/* 2. Services & AI Studio Scope */}
            <section
              id="services-scope"
              className={`rounded-2xl border p-6 transition-colors ${
                isLight ? "border-black/10 bg-white" : "border-white/10 bg-[#0D1210]"
              }`}
            >
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
                <span className="font-mono text-[#1e9e5a] dark:text-[#a3e635]">02.</span>
                <span>{isId ? "Layanan & Ruang Lingkup Studio" : "Services & AI Studio Scope"}</span>
              </h2>
              <p className="mb-3">
                {isId
                  ? "Verdara menyediakan simulator lingkungan perkotaan digital twin yang menghubungkan kalkulasi atap surya, limpasan hidrologi, mitigasi panas mikroklimat, dan logistik sirkular bank sampah."
                  : "Verdara delivers a living digital twin urban simulation environment uniting solar rooftop capacity, stormwater hydrology, microclimate heat mitigation, and circular recycling logistics."}
              </p>
              <p>
                {isId
                  ? "Akses ke fitur penalaran langsung Meta Model API (AI Council) dan segmentasi instan (SAM 3.1) memerlukan akun pengguna terverifikasi untuk menjaga integritas kuota token dan mencegah eksploitasi otomatis."
                  : "Access to live Meta Model API reasoning features (AI Council) and zero-shot segmentation (SAM 3.1) requires an authenticated, verified user account to preserve token quota integrity and prevent automated exploitation."}
              </p>
            </section>

            {/* 3. Engineering & Scientific Disclaimers */}
            <section
              id="scientific-disclaimer"
              className={`rounded-2xl border p-6 transition-colors ${
                isLight ? "border-black/10 bg-white" : "border-white/10 bg-[#0D1210]"
              }`}
            >
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
                <span className="font-mono text-[#1e9e5a] dark:text-[#a3e635]">03.</span>
                <span>{isId ? "Batasan Tanggung Jawab Keteknikan & Sains" : "Engineering & Scientific Disclaimers"}</span>
              </h2>
              <div
                className={`rounded-xl border p-4 mb-3 ${
                  isLight ? "border-amber-200 bg-amber-50/70 text-amber-950" : "border-amber-900/50 bg-amber-950/20 text-amber-200"
                }`}
              >
                <h4 className="font-bold text-xs mb-1 uppercase tracking-wider">
                  {isId ? "PENTING: ESTIMASI REKAYASA BUKAN JAMINAN STRUKTURAL" : "IMPORTANT: ENGINEERING ESTIMATES NOT STRUCTURAL WARRANTIES"}
                </h4>
                <p className="text-xs leading-relaxed">
                  {isId
                    ? "Kalkulasi energi surya (NREL PVWatts v8), volume resapan air hujan, rasio biopori, dan estimasi finansial yang disajikan adalah simulasi matematis deterministik untuk studi perencanaan awal. Hasil nyata di lapangan dipengaruhi oleh degradasi panel, naungan lokal, kondisi struktur atap aktual, dan tarif listrik penyedia setempat."
                    : "Rooftop solar projections (NREL PVWatts v8), stormwater infiltration capacities, biopore sizing, and economic valuations are deterministic mathematical simulations for preliminary planning. Physical field outcomes vary based on actual panel degradation, micro-shading, structural roof integrity, and utility grid tariff revisions."}
                </p>
              </div>
              <p>
                {isId
                  ? "Verdara tidak bertanggung jawab atas keputusan konstruksi sipil atau instalasi kelistrikan yang dilakukan tanpa konsultasi langsung dengan insinyur profesional berlisensi di wilayah Anda."
                  : "Verdara accepts no liability for civil construction decisions or electrical installations undertaken without consulting a locally licensed professional engineer."}
              </p>
            </section>

            {/* 4. Acceptable Use & AI Safety */}
            <section
              id="acceptable-use"
              className={`rounded-2xl border p-6 transition-colors ${
                isLight ? "border-black/10 bg-white" : "border-white/10 bg-[#0D1210]"
              }`}
            >
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
                <span className="font-mono text-[#1e9e5a] dark:text-[#a3e635]">04.</span>
                <span>{isId ? "Penggunaan Layak & Keamanan AI" : "Acceptable Use & AI Safety"}</span>
              </h2>
              <p className="mb-2">
                {isId
                  ? "Pengguna dilarang keras melakukan tindakan berikut pada platform Verdara:"
                  : "Users are strictly prohibited from engaging in the following behaviors on Verdara:"}
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  {isId
                    ? "Mencoba injeksi perintah LLM (Prompt Injection), jailbreak, atau eksploitasi batas token Meta Model API."
                    : "Attempting LLM prompt injection attacks, jailbreaks, or circumventing Meta Model API token quotas."}
                </li>
                <li>
                  {isId
                    ? "Menjalankan skrip scraping otomatis berskala besar terhadap tile peta MapTiler atau data OpenStreetMap."
                    : "Executing automated bulk scraping against MapTiler vector tiles or OpenStreetMap endpoints."}
                </li>
                <li>
                  {isId
                    ? "Mengunggah gambar yang melanggar hak cipta, memuat konten ilegal, materi berbahaya, atau melanggar hak privasi pihak ketiga."
                    : "Uploading copyright-infringing media, unlawful materials, hazardous content, or violating third-party privacy."}
                </li>
                <li>
                  {isId
                    ? "Mencoba mem-bypass pembatasan akun starter, sistem proteksi CSRF, atau mekanisme pembatasan laju (*rate limiting*)."
                    : "Attempting to bypass starter account guardrails, CSRF security shields, or rate-limiting mechanisms."}
                </li>
              </ul>
            </section>

            {/* 5. Intellectual Property */}
            <section
              id="intellectual-property"
              className={`rounded-2xl border p-6 transition-colors ${
                isLight ? "border-black/10 bg-white" : "border-white/10 bg-[#0D1210]"
              }`}
            >
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
                <span className="font-mono text-[#1e9e5a] dark:text-[#a3e635]">05.</span>
                <span>{isId ? "Hak Kekayaan Intelektual" : "Intellectual Property"}</span>
              </h2>
              <p className="mb-2">
                {isId
                  ? "Seluruh kode sumber, desain visual, logo vektor arsitektur Verdara, dan algoritma pemodelan dilindungi hak cipta Verdara Spatial Labs dan para kontributornya."
                  : "All source code, architectural visual assets, Verdara vector trademarks, and algorithmic models are the proprietary intellectual property of Verdara Spatial Labs and contributors."}
              </p>
              <p>
                {isId
                  ? "Data peta dasar dikreditkan kepada OpenStreetMap contributors (ODbL) dan MapTiler. Pustaka model AI dikreditkan kepada Meta Open Source (SAM 3.1 & Llama/Muse architectures)."
                  : "Basemap cartographic data is credited to OpenStreetMap contributors (ODbL) and MapTiler. Model architectures are attributed to Meta Open Source (SAM 3.1 & Llama/Muse architectures)."}
              </p>
            </section>

            {/* 6. Account & Termination */}
            <section
              id="termination"
              className={`rounded-2xl border p-6 transition-colors ${
                isLight ? "border-black/10 bg-white" : "border-white/10 bg-[#0D1210]"
              }`}
            >
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
                <span className="font-mono text-[#1e9e5a] dark:text-[#a3e635]">06.</span>
                <span>{isId ? "Akun & Penghentian Layanan" : "Account & Termination"}</span>
              </h2>
              <p className="mb-2">
                {isId
                  ? "Kami berhak menangguhkan atau mengakhiri akses akun pengguna yang terbukti melanggar kebijakan keamanan AI atau melakukan eksploitasi API tanpa pemberitahuan sebelumnya."
                  : "We reserve the right to suspend or terminate accounts that breach AI safety standards or abuse underlying API infrastructure without prior notice."}
              </p>
              <p>
                {isId
                  ? "Pengguna dapat mengakhiri hubungan layanan kapan saja dengan menghapus sesi dan data lokal mereka melalui menu Pengaturan (/settings)."
                  : "Users may terminate their account relationship at any time by wiping local data sessions via the Settings interface (/settings)."}
              </p>
            </section>

            {/* 7. Governing Law */}
            <section
              id="governing-law"
              className={`rounded-2xl border p-6 transition-colors ${
                isLight ? "border-black/10 bg-white" : "border-white/10 bg-[#0D1210]"
              }`}
            >
              <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
                <span className="font-mono text-[#1e9e5a] dark:text-[#a3e635]">07.</span>
                <span>{isId ? "Hukum yang Berlaku & Penyelesaian Sengketa" : "Governing Law"}</span>
              </h2>
              <p className="mb-3">
                {isId
                  ? "Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum Republik Indonesia, dengan memperhatikan standar kepatuhan siber dan perlindungan konsumen internasional."
                  : "These Terms of Service are governed by and construed in accordance with the laws of the Republic of Indonesia, without regard to conflict of law principles, alongside international cyber compliance standards."}
              </p>
              <div className="rounded-xl bg-current/[0.04] p-4 font-mono text-xs space-y-1">
                <p>Verdara Spatial Labs · Legal & Compliance</p>
                <p>
                  Dispute inquiries &amp; Legal:{" "}
                  <a
                    href="mailto:nawfalirfan005@gmail.com"
                    className="underline text-[#1e9e5a] dark:text-[#a3e635] hover:opacity-80"
                  >
                    nawfalirfan005@gmail.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
