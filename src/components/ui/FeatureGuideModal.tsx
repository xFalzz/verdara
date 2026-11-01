"use client";

import React, { useEffect } from "react";

export type FeatureGuideType =
  | "lens"
  | "council"
  | "radar"
  | "dashboard"
  | "academy"
  | "settings";

export interface FeatureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: FeatureGuideType;
  locale?: "en" | "id";
  theme?: "light" | "dark";
}

interface GuideContent {
  titleEn: string;
  titleId: string;
  badge: string;
  subtitleEn: string;
  subtitleId: string;
  steps: {
    num: string;
    headingEn: string;
    headingId: string;
    descEn: string;
    descId: string;
  }[];
  tipsEn: string[];
  tipsId: string[];
  specsEn: string;
  specsId: string;
}

const GUIDE_REGISTRY: Record<FeatureGuideType, GuideContent> = {
  lens: {
    titleEn: "Omni-Spatial Lens & SAM 3.1 Guide",
    titleId: "Panduan Lensa Omni-Spasial & SAM 3.1",
    badge: "META SAM 3.1 + MUSE SPARK",
    subtitleEn: "Real-time zero-shot polygon instance segmentation and circular valuation.",
    subtitleId: "Segmentasi poligon instance zero-shot langsung dan valuasi sirkular.",
    steps: [
      {
        num: "01",
        headingEn: "Select Specimen or Capture Photo",
        headingId: "Pilih Spesimen atau Ambil Foto",
        descEn: "Explore the 4 benchmark specimens, click 'Device Camera' to capture directly from your phone/laptop, or upload your own image.",
        descId: "Jelajahi 4 spesimen benchmark, klik 'Kamera Device' untuk memotret langsung dari ponsel/laptop, atau unggah foto Anda sendiri.",
      },
      {
        num: "02",
        headingEn: "Inspect Segmented Polygons",
        headingId: "Periksa Poligon Tersegmentasi",
        descEn: "Hover or tap on detected polygons in the visor to inspect individual material classification, IoU confidence score, and surface area ratio.",
        descId: "Arahkan kursor atau ketuk poligon yang terdeteksi di visor untuk memeriksa klasifikasi material, skor keyakinan IoU, dan rasio luas bidang.",
      },
      {
        num: "03",
        headingEn: "Audit Circular Value & Carbon Footprint",
        headingId: "Audit Nilai Sirkular & Jejak Karbon",
        descEn: "View verified California CRV / EU deposit refund values, EPA WARM v16 avoided CO2e metrics, and step-by-step upcycling recipes.",
        descId: "Lihat nilai deposit pengembalian terverifikasi California CRV / Uni Eropa, metrik CO2e terhindar EPA WARM v16, dan resep upcycling langkah demi langkah.",
      },
      {
        num: "04",
        headingEn: "Explore Biophilic Retrofit Curtain",
        headingId: "Jelajahi Tirai Retrofit Biophilic",
        descEn: "On Patio Retrofit specimens, slide the interactive before/after curtain to visualize Meta Muse Image generative green roof retrofits.",
        descId: "Pada spesimen Patio Retrofit, geser tirai interaktif sebelum/sesudah untuk memvisualisasikan renovasi atap hijau generatif Meta Muse Image.",
      },
    ],
    tipsEn: [
      "Use well-lit photos with clearly separated objects for highest IoU accuracy.",
      "Adjust the X-Ray slider to balance polygon visibility against background texture.",
      "Export your 1200x630 viral report card (PNG) to share circular impact.",
    ],
    tipsId: [
      "Gunakan foto dengan pencahayaan cukup dan objek terpisah untuk akurasi IoU tertinggi.",
      "Atur penggeser X-Ray untuk menyeimbangkan visibilitas poligon terhadap latar belakang foto.",
      "Ekspor kartu laporan dampak 1200x630 (PNG) untuk membagikan capaian pengurangan sampah.",
    ],
    specsEn: "Model: Meta SAM 3.1 (`sam-3-1`) · Valuator: EPA WARM v16 + CalRecycle CRV · Resolution: Up to 1080p",
    specsId: "Model: Meta SAM 3.1 (`sam-3-1`) · Valuasi: EPA WARM v16 + CalRecycle CRV · Resolusi: Hingga 1080p",
  },

  council: {
    titleEn: "The Verdara Council Guide",
    titleId: "Panduan Sidang Dewan Spesialis AI",
    badge: "3-AGENT SPECIALIST DELIBERATION",
    subtitleEn: "Multi-agent synthesis with strict deterministic ±3% number validation.",
    subtitleId: "Sintesis multi-agen dengan audit angka deterministik ketat toleransi ±3%.",
    steps: [
      {
        num: "01",
        headingEn: "Single Source of Truth (SITE_BRIEF)",
        headingId: "Sumber Kebenaran Tunggal (SITE_BRIEF)",
        descEn: "Every deliberation strictly adheres to the locked SITE_BRIEF physics parameters (footprint, solar kWp, rainwater capture, and TCI score).",
        descId: "Setiap pertimbangan sidang berpegang teguh pada parameter fisika SITE_BRIEF yang terkunci (luas tapak, kWp surya, air hujan, dan skor TCI).",
      },
      {
        num: "02",
        headingEn: "3 Distinct Agent Perspectives",
        headingId: "3 Perspektif Spesialis Berbeda",
        descEn: "Dr. Flora synthesizes urban botany, Ir. Arka evaluates building physics and solar engineering, and Sirkula calculates circular household ROI.",
        descId: "Dr. Flora menyintesis botani kota, Ir. Arka mengevaluasi fisika bangunan dan surya, dan Sirkula menghitung efisiensi sirkular rumah tangga.",
      },
      {
        num: "03",
        headingEn: "Ask Interactive Follow-ups",
        headingId: "Ajukan Pertanyaan Konsultasi Lanjutan",
        descEn: "Type custom queries into the consultation bar or click quick-focus chips (solar payback, biopores, shading plants) to get targeted advice.",
        descId: "Ketik pertanyaan kustom di bilah konsultasi atau klik chip topik cepat (balik modal surya, biopori, tanaman peneduh) untuk saran spesifik.",
      },
      {
        num: "04",
        headingEn: "Post-Response Validation",
        headingId: "Audit Angka Pasca-Respons",
        descEn: "Our automated mathematical validator checks every number against ground-truth physics formulas, tagging verified data in green.",
        descId: "Validator matematis otomatis memeriksa setiap angka terhadap rumus fisika baku, menandai data terverifikasi dengan warna hijau.",
      },
    ],
    tipsEn: [
      "Switch to Open-Weight mode (muse-spark-open) to test open-source model inference.",
      "Re-convene the council whenever you teleport to a new world city to get local climate advice.",
      "Check the Action Blueprint items below for direct links to Academy learning tracks.",
    ],
    tipsId: [
      "Beralih ke mode Open-Weight (muse-spark-open) untuk menguji inferensi model bobot terbuka.",
      "Jalankan ulang sidang setiap kali Anda berpindah kota dunia untuk mendapatkan saran iklim lokal.",
      "Periksa butir Cetak Biru Tindakan di bawah untuk tautan langsung ke modul Akademi.",
    ],
    specsEn: "Synthesizer: Muse Spark / Muse Spark Open · Tolerance: ±3% ground truth · Protocol: 3-Turn Consensus",
    specsId: "Sintesis: Muse Spark / Muse Spark Open · Toleransi: ±3% rumus baku · Protokol: Konsensus 3-Putaran",
  },

  radar: {
    titleEn: "3D Urban Radar & Roof Physics Guide",
    titleId: "Panduan Radar Perkotaan 3D & Fisika Atap",
    badge: "MAPLIBRE GL 3D EXTENSION",
    subtitleEn: "Interactive 3D building extrusion, solar irradiance modeling, and OSM circular hubs.",
    subtitleId: "Ekstrusi bangunan 3D interaktif, pemodelan radiasi surya, dan hub sirkular OSM.",
    steps: [
      {
        num: "01",
        headingEn: "Orbit and Tilt in 3D Space",
        headingId: "Orbit dan Kemiringan di Ruang 3D",
        descEn: "Hold right-click or Ctrl+drag to pitch and rotate the 3D map to 58 degrees, or toggle the 360-degree auto-orbit camera.",
        descId: "Tahan klik kanan atau Ctrl+geser untuk memiringkan dan memutar peta 3D ke 58 derajat, atau aktifkan kamera auto-orbit 360 derajat.",
      },
      {
        num: "02",
        headingEn: "Click Any Building for Roof Audit",
        headingId: "Klik Bangunan Mana Pun untuk Audit Atap",
        descEn: "Click on any building roof polygon to inspect estimated usable area (m²), solar kWp capacity, and annual electricity generation.",
        descId: "Klik pada poligon atap bangunan mana pun untuk memeriksa estimasi luas efektif (m²), kapasitas kWp surya, dan produksi listrik tahunan.",
      },
      {
        num: "03",
        headingEn: "Filter Verified Recycling Hubs",
        headingId: "Saring Hub Daur Ulang Terverifikasi",
        descEn: "Use the top material filter buttons (PET, ALU, Glass, E-Waste) to highlight verified OpenStreetMap collection hubs and drop-off depots.",
        descId: "Gunakan tombol filter material di atas (PET, ALU, Kaca, E-Waste) untuk menyorot bank sampah dan depot pengumpulan OpenStreetMap terverifikasi.",
      },
      {
        num: "04",
        headingEn: "Sync Parameters to Living Town",
        headingId: "Sinkronkan Parameter ke Kota 3D",
        descEn: "Adjust the roof footprint, usable solar fraction, or runoff coefficient sliders, then click 'Sync Roof Spec' to update your town.",
        descId: "Sesuaikan penggeser luas atap, fraksi surya layak, atau koefisien limpasan air, lalu klik 'Sinkronkan Spek Atap' untuk memperbarui kota Anda.",
      },
    ],
    tipsEn: [
      "Teleport to any of the 28 benchmark cities worldwide to observe different solar irradiance levels.",
      "Click 'Send SiteBrief to Council' to immediately deliberate on your updated building parameters.",
    ],
    tipsId: [
      "Pindah ke salah satu dari 28 kota benchmark di seluruh dunia untuk mengamati radiasi surya berbeda.",
      "Klik 'Kirim SiteBrief ke Dewan' untuk langsung membahas parameter bangunan yang baru disesuaikan.",
    ],
    specsEn: "GIS Engine: MapLibre GL 3D · Terrain: CartoDB Dark Matter / Positron · Physics: NREL PVWatts v8",
    specsId: "Mesin GIS: MapLibre GL 3D · Peta: CartoDB Dark Matter / Positron · Fisika: NREL PVWatts v8",
  },

  dashboard: {
    titleEn: "Living Town Spatial Twin Guide",
    titleId: "Panduan Kembaran Spasial Kota 3D",
    badge: "THREE.JS WEBGL SIMULATION",
    subtitleEn: "Real-time 3D town rendering, physics telemetry, and eco-infrastructure progression.",
    subtitleId: "Rendering kota 3D waktu nyata, telemetri fisika, dan perkembangan modul ramah lingkungan.",
    steps: [
      {
        num: "01",
        headingEn: "Inspect Your Town in 3D",
        headingId: "Periksa Kota Anda dalam 3D",
        descEn: "Drag to rotate 360 degrees and scroll to zoom in on rooftop solar panels, rainwater cisterns, bio-compost domes, and tree canopies.",
        descId: "Geser untuk memutar 360 derajat dan scroll untuk memperbesar panel surya atap, tangki air hujan, kubah kompos, dan kanopi pohon.",
      },
      {
        num: "02",
        headingEn: "Toggle Lighting Atmosphere",
        headingId: "Ubah Pencahayaan Siang / Malam",
        descEn: "Switch between daylight and night glow mode to see solar glowing arrays and architectural ambient lighting.",
        descId: "Beralih antara mode siang dan malam untuk melihat panel surya berpendar dan pencahayaan arsitektur kota.",
      },
      {
        num: "03",
        headingEn: "Unlock Modular Systems",
        headingId: "Buka Sistem Modul Bertahap",
        descEn: "Level up your plot from Lv.1 to Lv.5 by scanning objects with SAM 3.1 and passing verified proof tracks in the Academy.",
        descId: "Tingkatkan plot dari Lv.1 ke Lv.5 dengan memindai objek menggunakan SAM 3.1 dan menyelesaikan bukti verifikasi di Akademi.",
      },
      {
        num: "04",
        headingEn: "Monitor Real-Time Eco Telemetry",
        headingId: "Pantau Telemetri Lingkungan",
        descEn: "Check your annual solar bill savings, avoided CO2e, rainwater harvesting capacity, and biopore infiltration rates.",
        descId: "Periksa penghematan tagihan listrik surya, emisi CO2e terhindar, panen air hujan, dan laju infiltrasi biopori Anda.",
      },
    ],
    tipsEn: [
      "Use 'Switch to Starter Plot' to explore baseline Level 1 sandbox conditions.",
      "Click 'Load Full Town Specimen' to preview a fully unlocked Level 5 eco-town.",
    ],
    tipsId: [
      "Gunakan 'Reset ke Plot Awal' untuk menjelajahi kondisi sandbox Level 1 dasar.",
      "Klik 'Muat Spesimen Lengkap' untuk melihat pratinjau kota ramah lingkungan Level 5 yang lengkap.",
    ],
    specsEn: "Renderer: Three.js WebGL · Lighting: Physically Based Rendering (PBR) · Physics: Dual-Sink WAL",
    specsId: "Renderer: Three.js WebGL · Pencahayaan: Physically Based Rendering (PBR) · Fisika: Dual-Sink WAL",
  },

  academy: {
    titleEn: "Academy & Field Proof Verification Guide",
    titleId: "Panduan Akademi & Verifikasi Bukti Lapangan",
    badge: "ZERO-WASTE PROTOCOL & 64-BIT DHASH",
    subtitleEn: "Interactive sustainability lessons, mastery quizzes, and perceptual proof validation.",
    subtitleId: "Pembelajaran sirkular interaktif, kuis pemahaman, dan validasi bukti berpenanda perseptual.",
    steps: [
      {
        num: "01",
        headingEn: "Select a Zero-Waste Track",
        headingId: "Pilih Topik Belajar Bebas Sampah",
        descEn: "Choose from household compost, rainwater harvesting, solar maintenance, circular plastics, or battery e-waste recycling.",
        descId: "Pilih materi kompos rumah tangga, pemanenan air hujan, perawatan surya, plastik sirkular, atau daur ulang baterai.",
      },
      {
        num: "02",
        headingEn: "Complete Mastery Quiz",
        headingId: "Selesaikan Kuis Pemahaman",
        descEn: "Answer the multiple-choice technical questions to verify your understanding and unlock the practical action proof step.",
        descId: "Jawab pertanyaan teknis pilihan ganda untuk menguji pemahaman Anda dan membuka tahap pembuktian aksi nyata.",
      },
      {
        num: "03",
        headingEn: "Submit Action Proof",
        headingId: "Kirim Bukti Tindakan Nyata",
        descEn: "Upload a photo of your implemented eco-action. The system computes a 64-bit perceptual dHash to prevent duplicate photo submissions.",
        descId: "Unggah foto tindakan ramah lingkungan yang Anda lakukan. Sistem menghitung dHash perseptual 64-bit untuk mencegah foto duplikat.",
      },
      {
        num: "04",
        headingEn: "Earn XP & Unlock Town Assets",
        headingId: "Raih XP & Buka Aset Kota 3D",
        descEn: "Verified proofs reward up to 250 XP and instantly mount new modular assets (cisterns, solar arrays, biopores) onto your 3D Living Town.",
        descId: "Bukti terverifikasi memberi hingga 250 XP dan langsung memasang aset baru (tangki, panel surya, biopori) di Kota 3D Anda.",
      },
    ],
    tipsEn: [
      "Photos with Hamming distance < 12 from previous submissions are flagged as duplicates to maintain academic rigor.",
      "Each track directly improves your building's Thermal Comfort Index (TCI).",
    ],
    tipsId: [
      "Foto dengan Hamming distance < 12 dari unggahan sebelumnya terdeteksi sebagai duplikat demi keaslian data.",
      "Setiap topik yang selesai langsung meningkatkan skor Indeks Kenyamanan Termal (TCI) bangunan Anda.",
    ],
    specsEn: "Validator: 64-bit Perceptual dHash · Security: Anti-Sybil Hamming Distance · Storage: Supabase RLS",
    specsId: "Validator: dHash Perseptual 64-bit · Keamanan: Anti-Sybil Hamming Distance · Database: Supabase RLS",
  },

  settings: {
    titleEn: "Enterprise Settings & AI Guard Guide",
    titleId: "Panduan Pengaturan Sistem & AI Guard",
    badge: "SECURITY & MULTI-TENANT ARCHITECTURE",
    subtitleEn: "Resident profile customization, multi-tenant quotas, and Supabase WAL persistence.",
    subtitleId: "Kustomisasi profil warga, kuota multi-tenant, dan persistensi WAL database Supabase.",
    steps: [
      {
        num: "01",
        headingEn: "Update Resident Profile",
        headingId: "Perbarui Profil Warga",
        descEn: "Edit your display name, custom avatar image URL, and home city. Changes immediately sync with Supabase PostgreSQL.",
        descId: "Ubah nama tampilan, URL avatar kustom, dan kota domisili Anda. Perubahan langsung tersinkronkan ke PostgreSQL Supabase.",
      },
      {
        num: "02",
        headingEn: "Audit 7-Layer AI Guard",
        headingId: "Audit Proteksi AI Guard 7-Lapis",
        descEn: "Inspect real-time system defense metrics, token-bucket rate limiters, multi-tenant isolation, and perceptual cache efficiency.",
        descId: "Periksa metrik pertahanan sistem waktu nyata, pembatas laju token, isolasi multi-tenant, dan efisiensi cache perseptual.",
      },
      {
        num: "03",
        headingEn: "Verify Supabase Database Integrity",
        headingId: "Verifikasi Integritas Database Supabase",
        descEn: "Click 'Verify Database Integrity' to test live connections to user_profiles, user_scans, user_achievements, and user_ai_usage tables.",
        descId: "Klik 'Uji Integritas Database' untuk menguji koneksi langsung ke tabel user_profiles, user_scans, user_achievements, dan user_ai_usage.",
      },
      {
        num: "04",
        headingEn: "Export JSON Data Backup",
        headingId: "Ekspor Cadangan Data JSON",
        descEn: "Download a standardized normalized JSON snapshot of all your plot metrics, scan logs, and credentials for offline safety.",
        descId: "Unduh snapshot JSON ternormalisasi dari seluruh metrik plot, log pemindaian, dan kredensial Anda untuk keamanan luring.",
      },
    ],
    tipsEn: [
      "Switch interface language and measurement units seamlessly at any time.",
      "Your session is secured with 256-bit encryption, PKCE OAuth 2.0, and Row Level Security.",
    ],
    tipsId: [
      "Beralih bahasa antarmuka dan sistem satuan pengukuran kapan pun secara instan.",
      "Sesi Anda dilindungi dengan enkripsi 256-bit, PKCE OAuth 2.0, dan Row Level Security.",
    ],
    specsEn: "Compliance: OWASP ASVS v4.0 · Database: PostgreSQL 15+ with RLS · Encryption: 256-bit AES-GCM",
    specsId: "Standar: OWASP ASVS v4.0 · Database: PostgreSQL 15+ dengan RLS · Enkripsi: 256-bit AES-GCM",
  },
};

export default function FeatureGuideModal({
  isOpen,
  onClose,
  feature,
  locale = "id",
  theme = "dark",
}: FeatureGuideModalProps) {
  const isId = locale === "id";
  const isLight = theme === "light";
  const guide = GUIDE_REGISTRY[feature] ?? GUIDE_REGISTRY.lens;

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

  const modalBg = isLight
    ? "border-[#C7C0B0] bg-[#FFFFFF] text-[#111827] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)]"
    : "border-[#1D3328] bg-[#0A120E] text-[#F2F7F4] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]";

  const cardBg = isLight
    ? "border-[#D8D2C5] bg-[#F7F5EE] text-[#1F2937]"
    : "border-[#1D3328] bg-[#111C16] text-[#F3F4F6]";

  const sectionHeading = isLight
    ? "text-[#14532D] font-bold"
    : "text-[#A3E635] font-bold";

  const badgeStyle = isLight
    ? "bg-[#14532D]/10 text-[#14532D] border border-[#14532D]/30"
    : "bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30";

  const stepNumStyle = isLight
    ? "bg-[#14532D]/15 text-[#14532D] font-black"
    : "bg-[#A3E635]/20 text-[#A3E635] font-black";

  const stepHeadingStyle = isLight
    ? "text-[#0F172A] font-bold"
    : "text-[#F8FAFC] font-bold";

  const textMutedStyle = isLight
    ? "text-[#4B5563]"
    : "text-[#9CA3AF]";

  const textSecondaryStyle = isLight
    ? "text-[#374151]"
    : "text-[#CBD5E1]";

  const gotItBtnStyle = isLight
    ? "bg-[#14532D] text-white hover:bg-[#0E3D22]"
    : "bg-[#A3E635] text-[#070D0A] hover:bg-[#BEF264]";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 shadow-2xl transition-all ${modalBg}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${badgeStyle}`}>
              {guide.badge}
            </span>
            <span className={`font-mono text-xs ${textMutedStyle}`}>
              {isId ? "PANDUAN FITUR" : "FEATURE GUIDE"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-1.5 transition ${
              isLight ? "text-gray-500 hover:text-black hover:bg-gray-100" : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
            aria-label={isId ? "Tutup panduan" : "Close guide"}
          >
            ✕
          </button>
        </div>

        {/* Content Title */}
        <div className="mt-4 space-y-1">
          <h2 className="font-serif text-2xl font-bold tracking-tight">
            {isId ? guide.titleId : guide.titleEn}
          </h2>
          <p className={`font-sans text-xs leading-relaxed ${textMutedStyle}`}>
            {isId ? guide.subtitleId : guide.subtitleEn}
          </p>
        </div>

        {/* 4 Step Cards */}
        <div className="mt-5 space-y-3">
          <p className={`font-mono text-[11px] uppercase tracking-wider ${sectionHeading}`}>
            {isId ? "// LANGKAH PENGGUNAAN PRAKTIS" : "// STEP-BY-STEP WORKFLOW"}
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {guide.steps.map((st) => (
              <div
                key={st.num}
                className={`rounded-2xl border p-3.5 ${cardBg}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`inline-flex h-5 w-6 items-center justify-center rounded font-mono text-[11px] ${stepNumStyle}`}>
                    {st.num}
                  </span>
                  <span className={`font-sans text-xs ${stepHeadingStyle}`}>
                    {isId ? st.headingId : st.headingEn}
                  </span>
                </div>
                <p className={`mt-2 font-sans text-[11px] leading-relaxed ${textSecondaryStyle}`}>
                  {isId ? st.descId : st.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Best Practices & Tips */}
        <div className="mt-5 space-y-2">
          <p className={`font-mono text-[11px] uppercase tracking-wider ${sectionHeading}`}>
            {isId ? "// TIPS EFISIENSI & AKURASI" : "// TIPS & BEST PRACTICES"}
          </p>
          <ul className={`space-y-1.5 text-xs font-sans list-disc list-inside ${textSecondaryStyle}`}>
            {(isId ? guide.tipsId : guide.tipsEn).map((tip, idx) => (
              <li key={idx} className="leading-relaxed">
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Technical Specs Footer */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-black/10 dark:border-white/10 pt-4 font-mono text-[10px]">
          <span className={textMutedStyle}>{isId ? guide.specsId : guide.specsEn}</span>
          <button
            type="button"
            onClick={onClose}
            className={`w-full sm:w-auto min-h-[38px] cursor-pointer rounded-xl px-5 py-1.5 font-sans text-xs font-bold transition ${gotItBtnStyle}`}
          >
            {isId ? "Saya Mengerti →" : "Got It →"}
          </button>
        </div>
      </div>
    </div>
  );
}
