"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import {
  VerdaraLogo,
  ZeggoRollText,
  CompactWorldCityPicker,
  VerdaraBottomDock,
} from "@/components/ui/InteractiveEffects";

interface FaqItem {
  id: string;
  category:
    | "general"
    | "ai"
    | "physics"
    | "webgl"
    | "security"
    | "database";
  badge: string;
  qEn: string;
  qId: string;
  aEn: string;
  aId: string;
  techSpec?: string;
  relatedRoute?: { href: string; labelEn: string; labelId: string };
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-01",
    category: "general",
    badge: "PLATFORM OVERVIEW",
    qEn: "What is Verdara and what problem does it solve from the ground up?",
    qId: "Apa itu Verdara dan masalah apa yang diselesaikannya dari dasar?",
    aEn: "Verdara is an end-to-end Spatial Climate & Autonomous Eco-District Twin platform. Most homeowners, architects, and municipal planners want to adopt rooftop solar, rainwater harvesting, flood-mitigating biopores, and circular recycling, but struggle with fragmented calculators or AI chatbots that hallucinate numbers. Verdara unites computer vision (Meta SAM 3.1), peer-reviewed physics engines (NREL PVWatts v8 & DIN 1989-1), multi-agent engineering deliberation (Meta Muse Spark), and a 60-FPS 3D WebGL Digital Twin into one unified workspace supporting 195+ countries.",
    aId: "Verdara adalah platform Spatial Climate & Autonomous Eco-District Twin menyeluruh. Banyak pemilik rumah, arsitek, dan perencana kota ingin memasang panel surya atap, panen air hujan, sumur resapan biopori penangkal banjir, dan daur ulang sirkular, namun terkendala kalkulator yang terpisah-pisah atau chatbot AI yang mengarang angka. Verdara menyatukan visi komputer (Meta SAM 3.1), mesin fisika standar internasional (NREL PVWatts v8 & DIN 1989-1), diskusi multi-agen pakar (Meta Muse Spark), dan Digital Twin 3D WebGL 60-FPS ke dalam satu ruang kerja untuk 195+ negara.",
    techSpec:
      "Stack: Next.js 16 App Router · TypeScript 5 · Three.js / React Three Fiber · MapLibre GL · Zustand · Meta AI Stack",
    relatedRoute: {
      href: "/dashboard",
      labelEn: "Open 3D Living Town →",
      labelId: "Buka Kota 3D Hidup →",
    },
  },
  {
    id: "faq-02",
    category: "security",
    badge: "MANDATORY AUTH GATE",
    qEn: "Why is login required before entering the Studio Dashboard (/dashboard) and how does 1-Click Demo work?",
    qId: "Mengapa harus login terlebih dahulu sebelum masuk ke Studio Dashboard (/dashboard) dan bagaimana cara kerja 1-Click Demo?",
    aEn: "To protect per-session telemetry, SAM 3.1 spatial scan audit logs, and API credit quotas, all studio routes (/dashboard, /lens, /radar, /council, /academy, /settings) are guarded by AuthGate.tsx. When visiting the site for the first time, users can explore the interactive landing page, 3D preview, Docs, and FAQ freely. Clicking any studio workspace routes to /login, where evaluators can either click '1-Click Judge Demo (Lv.5)' to immediately unlock all 6 3D eco-structures (4,200 Eco-XP) or sign in with a custom resident email.",
    aId: "Untuk melindungi telemetri sesi pengguna, riwayat pemindaian spasial SAM 3.1, dan kuota kredit API, seluruh rute ruang kerja (/dashboard, /lens, /radar, /council, /academy, /settings) dilindungi oleh AuthGate.tsx. Saat pertama kali membuka website, pengguna dapat menjelajahi halaman utama, pratinjau 3D, Dokumen, dan FAQ secara bebas. Saat masuk ke Studio, halaman /login menyediakan tombol '1-Click Judge Demo (Lv.5)' untuk langsung membuka seluruh 6 bangunan ekologis 3D (4.200 Eco-XP) atau masuk dengan email warga.",
    techSpec:
      "Guard: src/components/ui/AuthGate.tsx + Persisted Session State + Redirect Query (?next=)",
    relatedRoute: {
      href: "/login",
      labelEn: "Go to Sign-In / 1-Click Demo →",
      labelId: "Ke Halaman Login / Demo →",
    },
  },
  {
    id: "faq-03",
    category: "webgl",
    badge: "3D RUN / BREAK / HEAL",
    qEn: "What are the exact visual and physical differences between Normal Day (Run), Storm Surge (Break), and AI Solution (Heal) in the 3D Town?",
    qId: "Apa perbedaan visual dan fisik antara mode Normal Day (Run), Storm Surge (Break), dan AI Solution (Heal) pada Kota 3D?",
    aEn: "The 3D Eco-District simulates three distinct physical regimes in real time: (1) 01 Normal Day (Run) displays clear daylight, steady canal water levels, green updraft particles, EV shuttle transit, and standard south-facing monocrystalline solar output. (2) 02 Storm Surge (Break) simulates a peak monsoon storm: dark overcast sky, high-velocity rain particles, rising canal water that overflows onto the asphalt street, red thermal roof stress (+4.2 degC), and solar output dropping to 29%. (3) 03 AI Solution (Heal) activates a sweeping green Meta SAM 3.1 laser scan plane, deploys dual north+south solar arrays (+35% kWp), illuminates 12 biopore wells, and drains the street floodwater into the rainwater cistern.",
    aId: "Distrik 3D mensimulasikan tiga kondisi fisik secara real-time: (1) 01 Normal Day (Run) menampilkan langit cerah, permukaan air kanal stabil, partikel udara hijau, lalu lintas EV, dan produksi surya standar. (2) 02 Storm Surge (Break) mensimulasikan puncak badai: langit mendung gelap, hujan deras berkecepatan tinggi, air kanal meluap membanjiri jalan aspal, indikator panas atap merah (+4.2 derajat C), dan produksi surya turun ke 29%. (3) 03 AI Solution (Heal) mengaktifkan sapuan sinar laser hijau Meta SAM 3.1, membuka panel surya ganda di sisi utara & selatan (+35% kWp), menyalakan 12 sumur biopori, serta menguras banjir jalanan ke dalam tangki air hujan.",
    techSpec:
      "Engine: src/components/three/EcoIslandCanvas.tsx · CameraRigController smooth fly-to presets (Overview, Solar Hub, Hydro Canal, EV Street)",
    relatedRoute: {
      href: "/dashboard",
      labelEn: "Test 3D Modes in Studio →",
      labelId: "Uji Mode 3D di Studio →",
    },
  },
  {
    id: "faq-04",
    category: "webgl",
    badge: "60 FPS PBR PERFORMANCE",
    qEn: "How does the 3D Eco-District achieve realistic architectural materials while staying fast and lightweight on mobile and laptops?",
    qId: "Bagaimana Distrik 3D menghasilkan material arsitektur yang realistis namun tetap ringan dan cepat di ponsel maupun laptop?",
    aEn: "Instead of downloading 50+ MB external .glb/.gltf files and heavy bitmap textures, Verdara constructs every building procedurally in TypeScript using React Three Fiber and physically based materials (meshPhysicalMaterial with clearcoat glass curtain walls, anodized aluminum solar frames with silver busbars, stepped travertine plinths, and timber soffits). Atmospheric particles use a single GPU buffer (THREE.Points) updated in-place inside useFrame, with adaptive device pixel ratio (dpr=[1, 1.75]).",
    aId: "Alih-alih mengunduh file .glb/.gltf eksternal berukuran puluhan MB yang memberatkan browser, Verdara membangun seluruh arsitektur secara prosedural menggunakan TypeScript, React Three Fiber, dan material fisik (meshPhysicalMaterial untuk kaca curtain wall dengan clearcoat, bingkai aluminium panel surya dengan garis busbar perak, fondasi travertine bertingkat, dan kayu CLT). Partikel atmosfer menggunakan satu buffer GPU (THREE.Points) dengan rasio piksel adaptif (dpr=[1, 1.75]).",
    techSpec:
      "Zero external .glb assets · <150ms WebGL mount time · Single-draw-call THREE.Points buffer",
  },
  {
    id: "faq-05",
    category: "ai",
    badge: "META SAM 3.1 VISION",
    qEn: "How does the Omni-Spatial Lens (/lens) use Meta SAM 3.1 and Meta Muse Image?",
    qId: "Bagaimana Lensa Kamera Spasial (/lens) menggunakan Meta SAM 3.1 dan Meta Muse Image?",
    aEn: "When you upload a photo or select one of the 6 ready-to-test specimens in /lens, Meta SAM 3.1 performs zero-shot concept segmentation to extract normalized [0..1000] polygon masks around rooftop solar zones, rainwater downspouts, permeable soil/flora, and recyclable items (PET, HDPE, Aluminum, Copper, E-Waste PCB). You can inspect the polygons using the X-Ray Wireframe Slider, drag the Before/After Eco-Retrofit Curtain powered by Meta Muse Image, and export a 1200x630 PNG Impact Card.",
    aId: "Saat Anda mengunggah foto atau memilih salah satu dari 6 spesimen siap pakai di /lens, Meta SAM 3.1 melakukan segmentasi konsep zero-shot untuk mengekstrak poligon ternormalisasi [0..1000] pada area atap surya, pipa talang hujan, tanah resapan/tanaman, serta barang daur ulang (PET, HDPE, Aluminium, Tembaga, PCB). Anda dapat memeriksa poligon dengan penggeser X-Ray, menarik tirai Sebelum/Sesudah dari Meta Muse Image, dan mengunduh Kartu Dampak PNG 1200x630.",
    techSpec:
      "Endpoints: POST /api/meta/sam & POST /api/meta/image · Viewer: src/components/lens/SpatialMaskViewer.tsx",
    relatedRoute: {
      href: "/lens",
      labelEn: "Launch SAM 3.1 Lens →",
      labelId: "Buka Lensa SAM 3.1 →",
    },
  },
  {
    id: "faq-06",
    category: "ai",
    badge: "MUSE SPARK COUNCIL",
    qEn: "How does the 3-Specialist AI Council (/council) prevent AI hallucinations?",
    qId: "Bagaimana Dewan 3 Pakar AI (/council) mencegah halusinasi angka pada AI?",
    aEn: "Before the AI Council speaks, Verdara's deterministic physics engine computes an immutable SITE_BRIEF JSON containing the exact solar kWp, annual kWh, rainwater liters, cistern size, biopore count, and local currency savings. Three specialist personas powered by Meta Muse Spark (Dr. Flora - Urban Botanist, Ir. Arka - Solar & Hydrological Engineer, and Sirkula - Circular Economist) deliberate using only those locked figures. Finally, validateNumbersAgainstSiteBrief() audits every number in the AI output against SITE_BRIEF with a strict +/-3.0% tolerance firewall.",
    aId: "Sebelum Dewan AI memberikan rekomendasi, mesin fisika deterministik Verdara menghitung data terkunci SITE_BRIEF JSON yang berisi angka eksak kWp surya, kWh tahunan, liter air hujan, ukuran tangki, jumlah biopori, dan penghematan mata uang lokal. Tiga pakar AI berbasis Meta Muse Spark (Dr. Flora - Ahli Botani, Ir. Arka - Insinyur Surya & Hidrologi, dan Sirkula - Ekonom Sirkular) berdiskusi berdasarkan data terkunci tersebut. Selanjutnya, fungsi validateNumbersAgainstSiteBrief() memverifikasi setiap angka dengan batas toleransi ketat +/-3.0%.",
    techSpec:
      "Models: muse-spark & muse-spark-open · Validator: validateNumbersAgainstSiteBrief(text, brief, 0.03)",
    relatedRoute: {
      href: "/council",
      labelEn: "Open 3-Specialist Council →",
      labelId: "Buka Dewan 3 Pakar AI →",
    },
  },
  {
    id: "faq-07",
    category: "physics",
    badge: "SOLAR & WATER MATH",
    qEn: "What exact scientific formulas are used to calculate solar power, rainwater harvesting, and biopore wells?",
    qId: "Rumus ilmiah apa yang digunakan untuk menghitung listrik panel surya, panen air hujan, dan sumur biopori?",
    aEn: "1. Solar Power (NREL PVWatts v8): Usable roof area is 60% of footprint, panel density is 0.205 kWp/m2, system performance ratio PR = 0.80, and cell temperature derating is -0.38%/degC above 25 degC (using warmest-month max temperature + 18 degC cell rise). 2. Rainwater Harvesting (DIN 1989-1): V_rain = A_roof * P_annual_mm * 0.85 (runoff coefficient) * 0.90 (first-flush filter efficiency). 3. Biopore Wells (Kamir R. Brata & Darcy's Law): Cylindrical 10x100 cm organic-composted shafts absorbing 180 L/hr during peak storm months.",
    aId: "1. Panel Surya (NREL PVWatts v8): Area atap efektif adalah 60% dari luas bangunan, kepadatan modul 0.205 kWp/m2, rasio performa sistem PR = 0.80, dan koreksi suhu sel -0.38%/derajat C di atas 25 derajat C. 2. Panen Air Hujan (DIN 1989-1): V_hujan = Luas_atap * Curah_hujan_mm * 0.85 (koefisien limpasan) * 0.90 (efisiensi filter). 3. Sumur Biopori (Kamir R. Brata & Hukum Darcy): Lubang silinder 10x100 cm berkompos organik yang menyerap 180 L/jam saat puncak hujan.",
    techSpec:
      "Implementation: src/lib/science/housing.ts & src/lib/science/climate.ts · Verified by unit test suite",
    relatedRoute: {
      href: "/docs",
      labelEn: "View Full Equations in Docs →",
      labelId: "Lihat Rumus Lengkap di Dokumen →",
    },
  },
  {
    id: "faq-08",
    category: "general",
    badge: "195+ COUNTRIES & DECK",
    qEn: "How do the 195+ Country Picker and the Draggable 10-Country Climate Deck work?",
    qId: "Bagaimana cara kerja Pemilih 195+ Negara dan Kartu Geser 10 Negara (Draggable Climate Deck)?",
    aEn: "In the top header, the compact World City Picker lets you search and select any of 195+ countries and major cities or enter custom GPS coordinates. On the landing page (#chapter-slides), you can also drag/swipe left or right across the 10-Country Climate Deck (Indonesia, United States, United Kingdom, Japan, United Arab Emirates, Singapore, Germany, Brazil, Australia, Switzerland) to compare how different Köppen-Geiger climate zones (Af, Am, BWh, Csb, Cfb, Cfa, Dfb) shape solar yield, rainwater capture, and thermal comfort.",
    aId: "Di bagian header atas, pemilih Negara/Kota memungkinkan Anda mencari lebih dari 195 negara dan kota besar atau memasukkan koordinat GPS khusus. Pada halaman utama (#chapter-slides), Anda juga dapat menarik/menggeser kartu ke kiri atau kanan pada 10-Country Climate Deck (Indonesia, Amerika Serikat, Inggris, Jepang, Uni Emirat Arab, Singapura, Jerman, Brasil, Australia, Swiss) untuk membandingkan pengaruh zona iklim Köppen-Geiger terhadap produksi surya, air hujan, dan kenyamanan suhu.",
    techSpec:
      "Dataset: src/lib/science/world-cities.ts · Pointer & Touch Drag Slider + Köppen-Geiger Synthesizer",
  },
  {
    id: "faq-09",
    category: "database",
    badge: "DATABASE v3.2",
    qEn: "How is data stored and synchronized in Enterprise Database v3.2?",
    qId: "Bagaimana data disimpan dan disinkronkan pada Enterprise Database v3.2?",
    aEn: "Verdara Database v3.2 combines an Edge-compatible persistent JSON/Prisma spatial ledger (/api/db) with client-side Zustand state synchronization. It stores authenticated user accounts, SAM 3.1 verified scan records (including perceptual dHash signatures and polygon counts), the 195+ country policy registry (currencies, electricity tariffs, grid carbon factors, and recycling hubs), and security audit events.",
    aId: "Database Verdara v3.2 menggabungkan penyimpanan spasial JSON/Prisma yang kompatibel dengan Edge (/api/db) serta sinkronisasi state Zustand di sisi klien. Basis data ini menyimpan akun pengguna terotentikasi, riwayat pemindaian terverifikasi SAM 3.1 (termasuk tanda tangan dHash dan jumlah poligon), registri kebijakan 195+ negara (mata uang, tarif listrik, faktor emisi grid, dan titik daur ulang), serta log audit keamanan.",
    techSpec:
      "API: GET / POST /api/db · Schema: 3.2.0-enterprise · Prisma + Edge Store fallback",
    relatedRoute: {
      href: "/docs",
      labelEn: "Inspect Database Schema in Docs →",
      labelId: "Lihat Skema Database di Dokumen →",
    },
  },
  {
    id: "faq-10",
    category: "security",
    badge: "DHASH ANTI-SPOOFING",
    qEn: "How does Field-Proof Verification (/academy) prevent users from uploading fake or duplicate photos?",
    qId: "Bagaimana Verifikasi Bukti Lapangan (/academy) mencegah pengguna mengunggah foto palsu atau duplikat?",
    aEn: "When a user submits a photo proof of sorting recyclables, planting native flora, or installing a biopore well in /academy, Verdara runs a two-stage verification: (1) Meta SAM 3.1 verifies that the target ecological object is physically present in the image with sufficient confidence and pixel area. (2) A 64-bit perceptual difference hash (dHash) computes horizontal luminance gradients across a 9x8 grid and compares the Hamming distance against all previously submitted proofs. Any image with Hamming distance <= 8 is rejected as a duplicate or cropped replay.",
    aId: "Saat pengguna mengunggah foto bukti pemilahan sampah, penanaman pohon, atau pembuatan lubang biopori di /academy, Verdara menjalankan verifikasi 2 tahap: (1) Meta SAM 3.1 memastikan objek ekologis benar-benar ada di dalam foto dengan skor akurasi yang memadai. (2) Algoritma 64-bit perceptual difference hash (dHash) menghitung gradien luminans 9x8 piksel dan membandingkan jarak Hamming dengan seluruh foto sebelumnya. Foto dengan jarak Hamming <= 8 otomatis ditolak sebagai duplikat.",
    techSpec:
      "Anti-Spoofing: src/lib/security/dhash.ts · 64-bit luminance gradient · Hamming distance threshold <= 8",
    relatedRoute: {
      href: "/academy",
      labelEn: "Open Field-Proof Academy →",
      labelId: "Buka Akademi Bukti Lapangan →",
    },
  },
  {
    id: "faq-11",
    category: "security",
    badge: "OWASP & RATE LIMIT",
    qEn: "What cybersecurity protections are active on Verdara's API routes and middleware?",
    qId: "Perlindungan keamanan siber apa saja yang aktif pada rute API dan middleware Verdara?",
    aEn: "Verdara implements OWASP ASVS Level 2 controls across src/middleware.ts and src/lib/security/guard.ts: (1) Strict HTTP headers (X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy), (2) CSRF Origin/Host validation on all POST requests, (3) sliding-window token-bucket rate limiting (30 req/min per IP with Retry-After headers), and (4) recursive payload sanitization that strips XSS script vectors and prototype pollution keys (__proto__, constructor).",
    aId: "Verdara menerapkan kontrol keamanan OWASP ASVS Level 2 pada src/middleware.ts dan src/lib/security/guard.ts: (1) Header HTTP ketat (X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy, Permissions-Policy), (2) Validasi Origin/Host CSRF pada seluruh permintaan POST, (3) Pembatasan laju request token-bucket (30 req/menit per IP dengan header Retry-After), serta (4) Sanitasi payload rekursif terhadap serangan XSS dan polusi prototipe.",
    techSpec:
      "Files: src/middleware.ts & src/lib/security/guard.ts · Rate Limit: 30 req/min/IP",
  },
  {
    id: "faq-12",
    category: "ai",
    badge: "7-LAYER CREDIT SHIELD",
    qEn: "What happens if the live Meta API key is not configured or the API budget reaches its threshold?",
    qId: "Apa yang terjadi jika kunci API Meta belum dikonfigurasi atau kuota anggaran API mencapai batas?",
    aEn: "Verdara's 7-Layer Credit Shield (/settings & src/lib/meta/shield.ts) ensures 100% zero-downtime operation. Curated benchmark specimens are served in <50ms via SHA-256 deterministic cache at $0.00 cost. Furthermore, if an environment runs without a live API key or hits a rate/budget cap, the engine seamlessly falls back to deterministic physics-driven polygon synthesis and structured specialist blueprints so every feature remains fully testable offline and online.",
    aId: "Perisai Kredit 7-Lapis Verdara (/settings & src/lib/meta/shield.ts) menjamin aplikasi berjalan 100% tanpa henti (zero-downtime). Enam spesimen foto patokan disajikan dalam <50ms melalui cache deterministik SHA-256 dengan biaya $0.00. Selain itu, jika lingkungan dijalankan tanpa kunci API eksternal atau mencapai batas kuota, sistem otomatis beralih ke sintesis poligon deterministik dan cetak biru berbasis fisika sehingga seluruh fitur tetap berfungsi penuh.",
    techSpec:
      "Shield Controller: src/lib/meta/shield.ts · UI Ledger: /settings",
    relatedRoute: {
      href: "/settings",
      labelEn: "Inspect Credit Shield (/settings) →",
      labelId: "Periksa Perisai Kredit (/settings) →",
    },
  },
];

export default function FaqPage() {
  const {
    locale,
    units,
    theme,
    isAuthenticated,
    displayName,
    setLocale,
    setUnits,
    setTheme,
    logout,
  } = useVerdaraStore();

  const isId = locale === "id";
  const isLight = theme === "light";

  const [activeCategory, setActiveCategory] = useState<
    "all" | FaqItem["category"]
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState<string[]>([
    "faq-01",
    "faq-02",
    "faq-03",
    "faq-06",
  ]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    if (!matchesCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.qEn.toLowerCase().includes(q) ||
      item.qId.toLowerCase().includes(q) ||
      item.aEn.toLowerCase().includes(q) ||
      item.aId.toLowerCase().includes(q) ||
      item.badge.toLowerCase().includes(q) ||
      (item.techSpec && item.techSpec.toLowerCase().includes(q))
    );
  });

  const categories: {
    id: "all" | FaqItem["category"];
    labelEn: string;
    labelId: string;
  }[] = [
    {
      id: "all",
      labelEn: `All Topics (${FAQ_ITEMS.length})`,
      labelId: `Semua Topik (${FAQ_ITEMS.length})`,
    },
    { id: "general", labelEn: "Platform & Global Cities", labelId: "Umum & 195+ Negara" },
    { id: "webgl", labelEn: "3D WebGL & Modes", labelId: "Mesin 3D & Mode" },
    { id: "ai", labelEn: "Meta AI & SAM 3.1", labelId: "Meta AI & SAM 3.1" },
    { id: "physics", labelEn: "Solar & Water Physics", labelId: "Fisika Surya & Air" },
    { id: "database", labelEn: "Database v3.2", labelId: "Database v3.2" },
    { id: "security", labelEn: "Auth & Cybersecurity", labelId: "Login & Keamanan" },
  ];

  return (
    <div
      className={`min-h-screen pb-28 transition-colors duration-200 ${
        isLight
          ? "bg-[#f5f5f3] text-[#111111]"
          : "bg-[#0b0c0e] text-[#f2f1ec]"
      }`}
    >
      {/* CLEAN SINGLE-ROW TOP HEADER */}
      <header className="sticky top-0 z-40 border-b border-current/10 bg-inherit/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div className="flex min-w-0 shrink-0 items-center gap-3">
            <Link href="/" className="flex min-h-[44px] items-center gap-2.5">
              <VerdaraLogo size={36} />
              <div className="flex flex-col text-left">
                <span className="dovv-wordmark text-xl sm:text-2xl tracking-tight">
                  VERDARA
                </span>
                <span className="hidden font-mono text-[9px] uppercase tracking-[0.14em] opacity-60 sm:block">
                  Knowledge Base &amp; FAQ
                </span>
              </div>
            </Link>

            <span className="hidden h-5 w-[1px] bg-current/15 sm:inline-block" />

            <CompactWorldCityPicker
              isLight={isLight}
              isId={isId}
              variant="hero"
              align="left"
            />
          </div>

          <nav className="hidden items-center gap-1 rounded-full border border-current/10 bg-current/[0.03] p-1 lg:flex">
            <Link
              href="/"
              className="rounded-full px-3.5 py-1.5 text-xs font-medium opacity-75 transition hover:opacity-100"
            >
              {isId ? "Beranda" : "Overview"}
            </Link>
            <Link
              href="/docs"
              className="rounded-full px-3.5 py-1.5 text-xs font-medium opacity-75 transition hover:opacity-100"
            >
              {isId ? "Dokumen Teknis" : "Documentation"}
            </Link>
            <Link
              href="/faq"
              className="rounded-full bg-[#08090c] px-3.5 py-1.5 text-xs font-semibold text-[#c6f432]"
            >
              FAQ
            </Link>
            <Link
              href={isAuthenticated ? "/dashboard" : "/login?next=/dashboard"}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium opacity-75 transition hover:opacity-100"
            >
              {isId ? "Studio 3D" : "3D Studio"}
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setLocale(isId ? "en" : "id")}
              className="min-h-[40px] cursor-pointer rounded-full border border-current/15 px-3 font-mono text-xs font-semibold"
            >
              {locale.toUpperCase()}
            </button>
            <button
              type="button"
              onClick={() =>
                setUnits(units === "metric" ? "imperial" : "metric")
              }
              className="hidden min-h-[40px] cursor-pointer items-center rounded-full border border-current/15 px-3 font-mono text-xs sm:inline-flex"
            >
              {units === "metric" ? "m² / L" : "ft² / gal"}
            </button>
            <button
              type="button"
              onClick={() => setTheme(isLight ? "dark" : "light")}
              className="min-h-[40px] cursor-pointer rounded-full border border-current/15 px-3 font-mono text-xs"
            >
              {isLight ? "☀ Day" : "☾ Night"}
            </button>
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/dashboard"
                  className="zeggo-btn flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#1e9e5a] px-4 text-xs font-semibold text-white"
                >
                  <ZeggoRollText
                    text={`Studio (${displayName.split(" ")[0]}) ↗`}
                  />
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="min-h-[40px] cursor-pointer rounded-full border border-current/15 px-3 text-xs font-medium"
                >
                  {isId ? "Keluar" : "Logout"}
                </button>
              </div>
            ) : (
              <Link
                href="/login?next=/dashboard"
                className="zeggo-btn flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#08090c] px-4 text-xs font-semibold text-[#c6f432]"
              >
                <ZeggoRollText
                  text={isId ? "Login Studio →" : "Sign In →"}
                />
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 pt-8 sm:px-8 sm:pt-12">
        {/* HERO BANNER */}
        <section className="rounded-[28px] bg-[#08090c] p-6 sm:p-10 text-white shadow-[inset_0_0_0_1.5px_#232730]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#c6f432]/15 px-3.5 py-1 font-mono text-xs font-semibold text-[#c6f432]">
                VERDARA KNOWLEDGE BASE · 12 DEEP-DIVE TOPICS
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs text-[#c9c7c0]">
                BILINGUAL (EN / ID)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setOpenIds(FAQ_ITEMS.map((i) => i.id))}
                className="min-h-[38px] cursor-pointer rounded-full bg-white/10 px-4 font-mono text-xs text-white transition hover:bg-white/20"
              >
                {isId ? "Buka Semua Jawaban" : "Expand All (12)"}
              </button>
              <button
                type="button"
                onClick={() => setOpenIds([])}
                className="min-h-[38px] cursor-pointer rounded-full bg-white/10 px-4 font-mono text-xs text-[#c9c7c0] transition hover:bg-white/20"
              >
                {isId ? "Tutup Semua" : "Collapse All"}
              </button>
              <Link
                href="/docs"
                className="inline-flex min-h-[38px] items-center rounded-full border border-[#c6f432]/40 bg-[#c6f432]/10 px-4 font-mono text-xs text-[#c6f432] transition hover:bg-[#c6f432]/20"
              >
                {isId ? "Buka Dokumen Teknis (/docs) →" : "Technical Docs (/docs) →"}
              </Link>
            </div>
          </div>

          <h1 className="dovv-wordmark mt-4 text-4xl sm:text-7xl text-white">
            {isId
              ? "PUSAT PENGETAHUAN & TANYA JAWAB (FAQ)"
              : "FREQUENTLY ASKED QUESTIONS & SYSTEM GUIDE"}
          </h1>
          <p className="mt-3 max-w-3xl text-sm sm:text-base leading-relaxed text-[#c9c7c0]">
            {isId
              ? "Penjelasan komprehensif mengenai cara kerja Distrik Ekologis 3D (Run, Break, Heal), model visi komputer Meta SAM 3.1, dewan multi-agen Meta Muse Spark, rumus fisika NREL PVWatts v8 & DIN 1989-1, basis data 195+ negara, hingga sistem keamanan login."
              : "Detailed answers covering the 3D Eco-District simulation modes (Run, Break, Heal), Meta SAM 3.1 computer vision, Meta Muse Spark 3-specialist deliberation, NREL PVWatts v8 & DIN 1989-1 physics formulas, 195+ country database, and cybersecurity guardrails."}
          </p>

          {/* SEARCH & CATEGORY PILLS */}
          <div className="mt-7 flex flex-col justify-between gap-4 border-t border-white/10 pt-5 lg:flex-row lg:items-center">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`min-h-[40px] cursor-pointer rounded-full px-4 py-1.5 font-mono text-xs font-medium transition ${
                      active
                        ? "bg-[#c6f432] font-bold text-[#080808]"
                        : "bg-[#151821] text-[#c9c7c0] hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    {isId ? cat.labelId : cat.labelEn}
                  </button>
                );
              })}
            </div>

            <div className="w-full lg:max-w-xs">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isId
                    ? "Cari topik (mis. SAM 3.1, 3D, surya, dHash)..."
                    : "Search FAQ (e.g. SAM 3.1, 3D, solar, dHash)..."
                }
                className="min-h-[42px] w-full rounded-full border border-white/20 bg-[#13161e] px-4 text-xs text-white placeholder-[#8e929b] outline-none focus:border-[#c6f432]"
              />
            </div>
          </div>
        </section>

        {/* ACCORDION LIST */}
        <section className="mt-8 space-y-4">
          {filteredFaqs.map((item, idx) => {
            const isOpen = openIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`rounded-[24px] border transition-colors ${
                  isOpen
                    ? isLight
                      ? "border-[#1e9e5a] bg-white shadow-sm"
                      : "border-[#c6f432]/60 bg-[#14171f]"
                    : isLight
                    ? "border-black/10 bg-white/80 hover:border-black/25"
                    : "border-white/10 bg-[#111319] hover:border-white/25"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  className="flex min-h-[68px] w-full cursor-pointer items-center justify-between gap-4 p-5 sm:p-6 text-left"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 font-mono text-[11px] font-bold ${
                        isOpen
                          ? "bg-[#c6f432] text-[#080808]"
                          : "bg-[#08090c] text-[#c6f432]"
                      }`}
                    >
                      {String(idx + 1).padStart(2, "0")} · {item.badge}
                    </span>
                    <h2 className="text-base sm:text-xl font-semibold tracking-tight">
                      {isId ? item.qId : item.qEn}
                    </h2>
                  </div>

                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-lg font-bold transition ${
                      isOpen
                        ? "bg-[#1e9e5a] text-white"
                        : "bg-current/10 text-current"
                    }`}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-current/10 px-5 pt-4 pb-6 sm:px-6">
                    <p className="text-xs sm:text-sm leading-relaxed opacity-90">
                      {isId ? item.aId : item.aEn}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                      {item.techSpec && (
                        <span className="rounded-xl bg-[#08090c] px-3.5 py-2 font-mono text-[11px] text-[#c6f432]">
                          {item.techSpec}
                        </span>
                      )}
                      {item.relatedRoute && (
                        <Link
                          href={item.relatedRoute.href}
                          className="inline-flex min-h-[38px] items-center rounded-full bg-[#1e9e5a] px-4 text-xs font-semibold text-white transition hover:bg-[#178249]"
                        >
                          {isId
                            ? item.relatedRoute.labelId
                            : item.relatedRoute.labelEn}
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* BOTTOM ARCHITECTURAL CTA */}
        <section
          className={`mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[26px] border p-6 sm:p-8 ${
            isLight
              ? "border-black/10 bg-white"
              : "border-white/10 bg-[#14161b]"
          }`}
        >
          <div>
            <span className="font-mono text-xs font-bold text-[#1e9e5a]">
              {isId
                ? "INGIN MELIHAT RUMUS MATEMATIKA & SKEMA API LENGKAP?"
                : "WANT FULL MATHEMATICAL DERIVATIONS & API SCHEMAS?"}
            </span>
            <h2 className="mt-1 text-xl sm:text-2xl font-semibold">
              {isId
                ? "Jelajahi 6 Modul Dokumentasi Teknis Verdara (/docs)"
                : "Explore All 6 Engineering Modules in Technical Documentation (/docs)"}
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/docs"
              className="inline-flex min-h-[44px] items-center rounded-full bg-[#08090c] px-5 text-xs sm:text-sm font-semibold text-[#c6f432] transition hover:opacity-90"
            >
              {isId ? "Buka Dokumentasi (/docs) →" : "Open Documentation (/docs) →"}
            </Link>
            <Link
              href={isAuthenticated ? "/dashboard" : "/login?next=/dashboard"}
              className="inline-flex min-h-[44px] items-center rounded-full bg-[#1e9e5a] px-5 text-xs sm:text-sm font-semibold text-white transition hover:bg-[#178249]"
            >
              {isAuthenticated
                ? isId
                  ? "Buka Studio 3D →"
                  : "Enter 3D Studio →"
                : isId
                ? "Login ke Studio →"
                : "Sign In to Studio →"}
            </Link>
          </div>
        </section>
      </main>

      <VerdaraBottomDock />
    </div>
  );
}
