"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import {
  VerdaraLogo,
  ZeggoRollText,
  CompactWorldCityPicker,
  VerdaraBottomDock,
} from "@/components/ui/InteractiveEffects";

interface FaqPoint {
  titleEn: string;
  titleId: string;
  descEn: string;
  descId: string;
}

interface FaqItem {
  id: string;
  category: "overview" | "three-d" | "ai" | "physics" | "database" | "security";
  badge: string;
  qEn: string;
  qId: string;
  aEn: string;
  aId: string;
  points: FaqPoint[];
  techSpec: string;
  relatedRoute?: {
    href: string;
    labelEn: string;
    labelId: string;
  };
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "what-is-verdara",
    category: "overview",
    badge: "OVERVIEW",
    qEn: "What is Verdara and how does it work from start to finish?",
    qId: "Apa itu Verdara dan bagaimana cara kerjanya dari awal hingga akhir?",
    aEn: "Verdara is a Spatial Eco-Twin & Architectural AI platform that transforms any building plot or home photo in 195+ countries into an interactive 3D ecological simulation. It combines satellite climatology (NASA POWER GHI & ERA5 rainfall), deterministic civil engineering physics, and Meta AI vision/reasoning to compute rooftop solar capacity, rainwater harvesting volume, biopore flood absorption, and circular waste value in real time.",
    aId: "Verdara adalah platform Spatial Eco-Twin & AI Arsitektur yang mengubah kavling bangunan atau foto rumah di 195+ negara menjadi simulasi distrik ekologis 3D interaktif. Platform ini memadukan data satelit (NASA POWER GHI & curah hujan ERA5), fisika teknik sipil deterministik, serta visi dan penalaran Meta AI untuk menghitung kapasitas surya atap, panen air hujan, resapan banjir biopori, dan nilai daur ulang secara real-time.",
    points: [
      {
        titleEn: "01 · Select Plot or Photo",
        titleId: "01 · Pilih Kota atau Foto",
        descEn: "Pick any of 195+ countries or scan a real building photo with Meta SAM 3.1.",
        descId: "Pilih dari 195+ negara atau pindai foto bangunan asli dengan Meta SAM 3.1.",
      },
      {
        titleEn: "02 · Deterministic Physics",
        titleId: "02 · Fisika Deterministik",
        descEn: "Computes exact kWp solar, rainwater Liters, and biopore wells without LLM guesswork.",
        descId: "Menghitung kWp surya, Liter air hujan, dan sumur biopori tanpa tebakan AI.",
      },
      {
        titleEn: "03 · 3D & Multi-Agent Plan",
        titleId: "03 · Simulasi 3D & Rencana AI",
        descEn: "Test storm resilience in 3D and generate a verified 3-specialist retrofit blueprint.",
        descId: "Uji ketahanan badai di 3D dan hasilkan cetak biru retrofit dari 3 spesialis AI.",
      },
    ],
    techSpec: "STACK :: Autonomous Spatial Twin + Meta SAM 3.1 + Muse Spark + Physics v3.2",
    relatedRoute: {
      href: "/dashboard",
      labelEn: "Open 3D Studio →",
      labelId: "Buka Studio 3D →",
    },
  },
  {
    id: "global-climate-calibration",
    category: "overview",
    badge: "195+ COUNTRIES",
    qEn: "How does Verdara calibrate weather, currency, and solar data across 195+ countries?",
    qId: "Bagaimana Verdara mengkalibrasi cuaca, mata uang, dan data surya di 195+ negara?",
    aEn: "Every country and city in Verdara is indexed to a Köppen-Geiger climate zone (such as Aw Tropical Monsoon, Cfb Oceanic, Csb Mediterranean, or BWh Hot Desert) paired with 12-month ERA5 precipitation normals and NASA POWER solar irradiance. Switching locations immediately updates local utility tariffs, currency formatting, grid CO2e intensity, and the 3D biome palette.",
    aId: "Setiap negara dan kota di Verdara dipetakan ke klasifikasi iklim Köppen-Geiger (seperti Aw Monsun Tropis, Cfb Oseanik, Csb Mediterania, atau BWh Gurun Panas) bersama normal presipitasi 12-bulan ERA5 dan radiasi surya NASA POWER. Mengganti lokasi akan langsung memperbarui tarif listrik lokal, format mata uang, intensitas karbon jaringan, dan palet bioma 3D.",
    points: [
      {
        titleEn: "Köppen-Geiger Biomes",
        titleId: "Bioma Köppen-Geiger",
        descEn: "6 procedural 3D biome palettes (Tropical, Arid, Mediterranean, Temperate, Continental, Polar).",
        descId: "6 palet bioma 3D prosedural (Tropis, Arid, Mediterania, Sedang, Kontinental, Polar).",
      },
      {
        titleEn: "10-Country Drag Comparator",
        titleId: "Komparator Geser 10 Negara",
        descEn: "Interactive drag-slide deck comparing solar kWp, rainfall, and comfort scores.",
        descId: "Dek geser interaktif untuk membandingkan kWp surya, curah hujan, dan skor termal.",
      },
      {
        titleEn: "Metric & Imperial Sync",
        titleId: "Sinkronisasi Metrik & Imperial",
        descEn: "1-click toggle between m² / Liters / °C and sq ft / US Gallons / °F.",
        descId: "Tombol 1-klik untuk beralih antara m² / Liter / °C dan ft² / Galon AS / °F.",
      },
    ],
    techSpec: "CLIMATE_ENGINE :: 195+ ISO Countries · ERA5 12-Month Normals · Local Grid Tariffs",
    relatedRoute: {
      href: "/radar",
      labelEn: "Explore 3D Radar →",
      labelId: "Jelajahi Radar 3D →",
    },
  },
  {
    id: "device-performance-60fps",
    category: "overview",
    badge: "PERFORMANCE",
    qEn: "How does the platform stay lightweight and run at 60 FPS across mobile and desktop?",
    qId: "Bagaimana platform ini tetap ringan dan berjalan 60 FPS di ponsel maupun desktop?",
    aEn: "Instead of downloading heavy 50MB external GLTF models, Verdara generates its entire 3D architecture procedurally in GPU memory (<18MB VRAM) with adaptive pixel ratios (DPR capped at [1, 1.6]). Furthermore, synchronous theme initialization and zero-delay CSS rendering ensure instant first paint on refresh without layout shift or hidden opacity lag.",
    aId: "Alih-alih mengunduh model GLTF eksternal berukuran puluhan megabita, Verdara membangun seluruh geometri arsitektur 3D secara prosedural di memori GPU (<18MB VRAM) dengan rasio piksel adaptif (DPR [1, 1.6]). Selain itu, inisialisasi tema sinkron memastikan tampilan langsung muncul saat refresh tanpa jeda animasi atau kedipan warna.",
    points: [
      {
        titleEn: "<18MB GPU Memory",
        titleId: "Memori GPU <18MB",
        descEn: "Procedural instanced meshes compile in milliseconds with zero network asset wait.",
        descId: "Mesh prosedural dikompilasi dalam milidetik tanpa waktu tunggu unduhan aset.",
      },
      {
        titleEn: "Instant First Paint",
        titleId: "Tampilan Awal Instan",
        descEn: "Zero opacity:0 traps on load; hero typography and 3D canvas render immediately.",
        descId: "Tanpa jebakan opacity:0 saat muat; tipografi dan kanvas 3D tampil seketika.",
      },
      {
        titleEn: "320px to 4K Responsive",
        titleId: "Responsif 320px hingga 4K",
        descEn: "Touch-ergonomic >=40px controls, compact navbar, and adaptive studio grids.",
        descId: "Kontrol sentuh ergonomis >=40px, navbar ringkas, dan grid studio adaptif.",
      },
    ],
    techSpec: "PERF_BUDGET :: Procedural 3D GPU · DPR [1, 1.6] · Synchronous Theme Init · 60 FPS",
  },
  {
    id: "three-d-modes-explained",
    category: "three-d",
    badge: "3D SIMULATION",
    qEn: "What is the exact difference between '01 Normal Day', '02 Storm Surge', and '03 AI Solution'?",
    qId: "Apa perbedaan spesifik antara mode '01 Normal Day', '02 Storm Surge', dan '03 AI Solution'?",
    aEn: "The 3D Eco-District simulates how a residential block responds to climate extremes. Switching modes changes the atmospheric lighting, rain particle velocity, canal water height, flood warning overlays, and structural green retrofits in real time so you can visually verify before-and-after environmental resilience.",
    aId: "Distrik Ekologis 3D mensimulasikan bagaimana blok hunian merespons cuaca ekstrem. Mengganti mode akan mengubah pencahayaan atmosfer, partikel hujan, tinggi permukaan air kanal, indikator banjir, serta aktivasi infrastruktur hijau secara real-time sehingga Anda dapat membandingkan ketahanan lingkungan sebelum dan sesudah intervensi AI.",
    points: [
      {
        titleEn: "01 Normal Day (Run)",
        titleId: "01 Normal Day (Run)",
        descEn: "Baseline solar roof generation, steady canal flow, wind turbines, and EV shuttle transit.",
        descId: "Produksi surya normal, aliran kanal stabil, turbin angin, dan mobilitas shuttle EV.",
      },
      {
        titleEn: "02 Storm Surge (Break)",
        titleId: "02 Storm Surge (Break)",
        descEn: "Heavy monsoon rain streaks, +18cm street flood surge, and +4.2°C roof thermal stress.",
        descId: "Hujan badai deras, luapan banjir jalan +18cm, dan tekanan panas atap +4,2°C.",
      },
      {
        titleEn: "03 AI Solution (Heal)",
        titleId: "03 AI Solution (Heal)",
        descEn: "Activates SAM 3.1 laser scan, dual PV arrays (+25% kWp), biopore drains, and 0cm flood.",
        descId: "Mengaktifkan pemindaian laser SAM 3.1, panel surya ganda (+25% kWp), biopori, dan bebas banjir.",
      },
    ],
    techSpec: "3D_MODES :: Run (Baseline) -> Break (+18cm Flood Stress) -> Heal (SAM 3.1 Retrofit)",
    relatedRoute: {
      href: "/dashboard",
      labelEn: "Test 3D Modes Live →",
      labelId: "Uji Mode 3D Langsung →",
    },
  },
  {
    id: "three-d-scroll-zoom-camera",
    category: "three-d",
    badge: "3D SCROLL ZOOM",
    qEn: "How do 3D scroll zoom, orbit drag, and page Smooth Scroll work together?",
    qId: "Bagaimana fitur scroll zoom 3D, rotasi orbit, dan Smooth Scroll halaman bekerja bersamaan?",
    aEn: "When your cursor is positioned inside the 3D Eco-District or 3D Radar viewport, scrolling your mouse wheel or trackpad zooms the 3D camera smoothly in and out (3.2m close-up to 13.5m overview), while dragging orbits 360 degrees. As soon as your cursor moves outside the 3D canvas, our universal Lenis Smooth Scroll glides the page without conflict.",
    aId: "Saat kursor Anda berada di dalam area Distrik 3D atau Peta Radar 3D, menggulir roda mouse atau trackpad akan melakukan zoom in/out pada kamera 3D secara halus (jarak dekat 3,2m hingga tampilan penuh 13,5m), sedangkan klik-geser memutar sudut pandang 360 derajat. Begitu kursor berada di luar kotak 3D, mesin Lenis Smooth Scroll menggulir halaman dengan mulus tanpa bentrok.",
    points: [
      {
        titleEn: "Damped 3D Scroll Zoom",
        titleId: "Scroll Zoom 3D Halus",
        descEn: "OrbitControls zoom (3.2m to 13.5m) with 0.08 damping factor for cinematic inspection.",
        descId: "Zoom OrbitControls (3,2m hingga 13,5m) dengan faktor redaman 0,08 untuk inspeksi presisi.",
      },
      {
        titleEn: "4 Camera Focus Presets",
        titleId: "4 Preset Fokus Kamera",
        descEn: "1-click camera flight to Overview, Solar Hub, Hydro Canal, or Autonomous EV Street.",
        descId: "Transisi kamera 1-klik menuju Utama, Atap Surya, Kanal Air, atau Jalan EV.",
      },
      {
        titleEn: "Smart Scroll Isolation",
        titleId: "Isolasi Scroll Cerdas",
        descEn: "data-lenis-prevent boundary ensures 3D zooming never accidentally scrolls the page.",
        descId: "Batas data-lenis-prevent memastikan zoom 3D tidak menggeser posisi halaman.",
      },
    ],
    techSpec: "CAMERA_RIG :: OrbitControls (enableZoom: true, 3.2m-13.5m) + Lenis Boundary Guard",
  },
  {
    id: "radar-3d-extrusion-map",
    category: "three-d",
    badge: "3D GIS RADAR",
    qEn: "How does the 3D Urban Radar locate nearby recycling hubs and calculate distances?",
    qId: "Bagaimana Radar Urban 3D menemukan hub daur ulang terdekat dan menghitung jaraknya?",
    aEn: "The 3D Geospatial Radar (/radar) renders a 55-degree pitched MapLibre GL 3D building extrusion map synchronized with your active city. It queries verified circular economy drop-off points (Waste Banks, Compost Hubs, E-Waste stations) and computes exact geodesic distance (km/mi) using the spherical Haversine formula.",
    aId: "Radar Geospasial 3D (/radar) menampilkan peta ekstrusi bangunan 3D MapLibre GL dengan kemiringan 55 derajat yang tersinkronisasi dengan kota aktif Anda. Fitur ini memetakan titik ekonomi sirkular terverifikasi (Bank Sampah, Hub Kompos, Stasiun E-Waste) dan menghitung jarak geodesik presisi (km/mil) menggunakan rumus bola Haversine.",
    points: [
      {
        titleEn: "55° 3D Building Pitch",
        titleId: "Ekstrusi Gedung 3D 55°",
        descEn: "Interactive 3D urban terrain with scroll-wheel zoom and click-to-measure roof area.",
        descId: "Peta kota 3D interaktif dengan scroll-zoom dan klik gedung untuk estimasi luas atap.",
      },
      {
        titleEn: "Haversine Geodesic Math",
        titleId: "Geodesik Haversine",
        descEn: "Computes exact spherical distance and estimated travel time to every circular hub.",
        descId: "Menghitung jarak lengkung bumi presisi dan estimasi waktu tempuh ke setiap hub.",
      },
      {
        titleEn: "12-Month ERA5 Charts",
        titleId: "Grafik ERA5 12-Bulan",
        descEn: "Displays monthly rainfall (mm) and solar irradiance (GHI) bars for the selected city.",
        descId: "Menampilkan grafik bulanan curah hujan (mm) dan radiasi surya (GHI) kota terpilih.",
      },
    ],
    techSpec: "GIS_RADAR :: MapLibre GL 3D (Pitch 55°, scrollZoom: true) + Haversine Distance Engine",
    relatedRoute: {
      href: "/radar",
      labelEn: "Launch 3D Radar →",
      labelId: "Buka Radar 3D →",
    },
  },
  {
    id: "meta-sam-vision-segmentation",
    category: "ai",
    badge: "META SAM 3.1",
    qEn: "How does Meta SAM 3.1 segment roof pitches and recyclable materials from a photo?",
    qId: "Bagaimana Meta SAM 3.1 melakukan segmentasi bidang atap dan material daur ulang dari foto?",
    aEn: "In the SAM 3.1 Spatial Lens (/lens), uploaded photos are processed through /api/vision/segment. Meta SAM 3.1 executes zero-shot spatial polygon segmentation to isolate unobstructed roof slabs (subtracting chimneys, HVAC units, and tree shade), gutter catchment perimeters, and circular waste items, returning SVG vector masks and usable m²/ft² area.",
    aId: "Di Lensa Spasial SAM 3.1 (/lens), foto yang diunggah diproses melalui /api/vision/segment. Meta SAM 3.1 menjalankan segmentasi poligon spasial zero-shot untuk mengisolasi bidang atap bersih (mengurangi cerobong, unit AC, dan bayangan pohon), keliling talang air, serta objek daur ulang, lalu menghasilkan mask vektor SVG dan luas efektif m²/ft².",
    points: [
      {
        titleEn: "Zero-Shot Polygon Masks",
        titleId: "Mask Poligon Zero-Shot",
        descEn: "Extracts precise SVG vector boundaries and confidence IoU scores from raw imagery.",
        descId: "Mengekstrak batas vektor SVG presisi dan skor akurasi IoU dari foto mentah.",
      },
      {
        titleEn: "6 Golden Specimens (<50ms)",
        titleId: "6 Spesimen Uji (<50mdtk)",
        descEn: "Pre-verified rooftop, courtyard, and recycling specimens load in <50ms at $0 API cost.",
        descId: "6 spesimen atap, halaman, dan daur ulang terverifikasi dimuat <50mdtk dengan biaya API $0.",
      },
      {
        titleEn: "Muse Image Retrofit Slider",
        titleId: "Slider Retrofit Muse Image",
        descEn: "Interactive Before/After architectural comparison showing installed solar & biopores.",
        descId: "Perbandingan interaktif Before/After yang menampilkan hasil instalasi surya & biopori.",
      },
    ],
    techSpec: "VISION_PIPELINE :: POST /api/vision/segment · Meta SAM 3.1 + Muse Image Synthesis",
    relatedRoute: {
      href: "/lens",
      labelEn: "Try SAM 3.1 Lens →",
      labelId: "Coba Lensa SAM 3.1 →",
    },
  },
  {
    id: "muse-spark-three-agent-council",
    category: "ai",
    badge: "MUSE SPARK COUNCIL",
    qEn: "How does the 3-Agent AI Council deliberate and guarantee zero hallucinated numbers?",
    qId: "Bagaimana Dewan AI 3-Agen berunding dan menjamin tidak ada angka fisika yang mengarang?",
    aEn: "The AI Council (/council) uses Meta Muse Spark to orchestrate 3 specialist personas: Dr. Flora (Botanist & Microclimate), Ir. Arka (Solar & Hydrological Civil Engineer), and Sirkula (Circular Material Economist). To eliminate AI hallucination, our deterministic Physics Engine calculates all kWh, Liters, and CAPEX/ROI figures first, locks them into the system prompt, and validates every output claim within a strict +/-3% tolerance.",
    aId: "Dewan AI (/council) menggunakan Meta Muse Spark untuk mengoordinasikan 3 spesialis: Dr. Flora (Ahli Botani & Iklim Mikro), Ir. Arka (Insinyur Sipil Surya & Hidrologi), serta Sirkula (Ekonom Material Sirkular). Untuk mencegah halusinasi AI, Mesin Fisika deterministik menghitung seluruh angka kWh, Liter, dan ROI terlebih dahulu, menguncinya ke dalam prompt, dan memvalidasi setiap klaim numerik dengan toleransi ketat +/-3%.",
    points: [
      {
        titleEn: "Dr. Flora · Urban Botanist",
        titleId: "Dr. Flora · Botani Kota",
        descEn: "Selects native Köppen-matched flora, green roof substrates, and UHI cooling layouts.",
        descId: "Memilih vegetasi lokal sesuai iklim Köppen, substrat atap hijau, dan pendinginan UHI.",
      },
      {
        titleEn: "Ir. Arka · Civil & Solar",
        titleId: "Ir. Arka · Sipil & Surya",
        descEn: "Specifies PV string sizing, LiFePO4 battery storage, cisterns, and biopore spacing.",
        descId: "Merancang kapasitas string PV, baterai LiFePO4, tangki tandon, dan jarak biopori.",
      },
      {
        titleEn: "Sirkula + +/-3% Validator",
        titleId: "Sirkula + Validator +/-3%",
        descEn: "Audits circular payback and enforces strict +/-3% numeric alignment with physics math.",
        descId: "Mengaudit nilai ekonomi sirkular dan menjaga akurasi angka +/-3% terhadap rumus fisika.",
      },
    ],
    techSpec: "AGENT_COUNCIL :: POST /api/ai/council · Muse Spark + Llama 4 Scout + +/-3% Validator",
    relatedRoute: {
      href: "/council",
      labelEn: "Consult AI Council →",
      labelId: "Konsultasi Dewan AI →",
    },
  },
  {
    id: "solar-pvwatts-formula",
    category: "physics",
    badge: "SOLAR PHYSICS",
    qEn: "How is rooftop solar capacity (kWp) and annual generation (kWh/yr) calculated?",
    qId: "Bagaimana kapasitas surya atap (kWp) dan produksi listrik tahunan (kWh/thn) dihitung?",
    aEn: "Verdara implements the NREL PVWatts v8 physical formulation in src/lib/science/solar.ts. Net usable roof area (72% of gross footprint after perimeter setbacks) is multiplied by monocrystalline module efficiency (20.8%), local daily solar irradiance (GHI), system performance ratio (0.84), and a thermal cell derating coefficient (gamma = -0.0038/°C above 25°C STC).",
    aId: "Verdara menerapkan formulasi fisik NREL PVWatts v8 di src/lib/science/solar.ts. Luas atap efektif (72% dari luas kotor setelah batas tepi) dikalikan dengan efisiensi modul monokristalin (20,8%), radiasi surya harian lokal (GHI), rasio performa sistem (0,84), serta koefisien derating suhu sel (gamma = -0,0038/°C di atas 25°C STC).",
    points: [
      {
        titleEn: "Thermal Cell Derating",
        titleId: "Koreksi Suhu Sel",
        descEn: "Applies gamma = -0.0038/°C so extreme desert heat accurately reduces peak cell output.",
        descId: "Menerapkan gamma = -0,0038/°C agar suhu panas ekstrem terhitung secara realistis.",
      },
      {
        titleEn: "Performance Ratio (0.84)",
        titleId: "Rasio Performa (0,84)",
        descEn: "Accounts for 96% inverter efficiency, DC/AC wiring losses, and surface dust soiling.",
        descId: "Memperhitungkan efisiensi inverter 96%, rugi kabel DC/AC, dan debu permukaan panel.",
      },
      {
        titleEn: "Tariff & Carbon Offset",
        titleId: "Penghematan & Karbon",
        descEn: "Multiplies annual kWh by local utility tariffs and national grid kg CO2e/kWh factors.",
        descId: "Mengalikan kWh tahunan dengan tarif listrik lokal dan faktor emisi kg CO2e/kWh.",
      },
    ],
    techSpec: "PVWATTS_V8 :: E_yr = A_net * 0.208 * GHI_d * 365 * PR(0.84) * [1 - 0.0038*(T_cell - 25)]",
    relatedRoute: {
      href: "/docs",
      labelEn: "View Math Derivations →",
      labelId: "Lihat Derivasi Rumus →",
    },
  },
  {
    id: "rainwater-din-biopore-math",
    category: "physics",
    badge: "HYDROLOGY MATH",
    qEn: "What formulas govern rainwater harvesting volume and biopore flood absorption?",
    qId: "Rumus apa yang digunakan untuk menghitung volume panen air hujan dan resapan biopori?",
    aEn: "Rainwater harvesting follows the German DIN 1989-1 standard, combining effective roof catchment area, annual ERA5 rainfall (mm/yr), surface runoff coefficient (psi = 0.85), and first-flush filter efficiency (eta = 0.90). Ground flood mitigation uses Brata’s Cylindrical Biopore Hydraulics and Darcy’s Law to size 10cm x 100cm compost-filled infiltration shafts.",
    aId: "Panen air hujan mengacu pada standar Jerman DIN 1989-1, menggabungkan luas tangkapan atap efektif, curah hujan tahunan ERA5 (mm/thn), koefisien limpasan permukaan (psi = 0,85), dan efisiensi filter first-flush (eta = 0,90). Mitigasi banjir permukaan menggunakan Hidrolika Biopori Silindris Brata dan Hukum Darcy untuk menentukan jumlah sumur resapan 10cm x 100cm.",
    points: [
      {
        titleEn: "DIN 1989-1 Cistern Sizing",
        titleId: "Ukuran Tangki DIN 1989-1",
        descEn: "Sizes retention tanks to buffer 21 days of peak monsoon rainfall without overflow.",
        descId: "Menentukan kapasitas tandon untuk menampung cadangan 21 hari puncak musim hujan.",
      },
      {
        titleEn: "Darcy Biopore Infiltration",
        titleId: "Infiltrasi Biopori Darcy",
        descEn: "Each 100cm vertical compost shaft absorbs ~180-360 L/hr of storm surface runoff.",
        descId: "Setiap lubang biopori sedalam 100cm menyerap ~180-360 L/jam limpasan air hujan.",
      },
      {
        titleEn: "Non-Potable Autonomy",
        titleId: "Kemandirian Air",
        descEn: "Calculates household days of irrigation, sanitation, and cooling water autonomy.",
        descId: "Menghitung jumlah hari kemandirian air rumah tangga untuk sanitasi dan penyiraman.",
      },
    ],
    techSpec: "DIN_1989_1 :: V_L = A_eff * P_mm * psi(0.85) * eta(0.90) · N_biopore = ceil(A_roof / 10)",
  },
  {
    id: "thermal-comfort-index-tci",
    category: "physics",
    badge: "THERMAL COMFORT",
    qEn: "How is the Thermal Comfort Index (0-100) computed and improved by green retrofits?",
    qId: "Bagaimana Indeks Kenyamanan Termal (0-100) dihitung dan ditingkatkan oleh retrofit hijau?",
    aEn: "The Thermal Comfort Index (TCI, 0 to 100) models microclimate heat stress using ASHRAE-55 principles, combining ambient temperature, relative humidity, solar radiation load, and roof surface albedo. Installing solar shading panels, high-albedo cool-roof coatings, and biopore-fed vegetation reduces roof slab temperature by 1.8°C to 3.2°C.",
    aId: "Indeks Kenyamanan Termal (TCI, 0 hingga 100) memodelkan beban panas iklim mikro berdasarkan prinsip ASHRAE-55, memadukan suhu udara, kelembapan relatif, beban radiasi matahari, dan albedo atap. Pemasangan panel surya peneduh, pelapis cool-roof ber-albedo tinggi, dan vegetasi biopori menurunkan suhu pelat atap sebesar 1,8°C hingga 3,2°C.",
    points: [
      {
        titleEn: "PV Roof Slab Shading",
        titleId: "Peneduh Pelat Atap PV",
        descEn: "Elevated solar modules intercept direct radiation before it heats the roof structure.",
        descId: "Modul surya menahan radiasi matahari langsung sebelum memanaskan struktur atap.",
      },
      {
        titleEn: "High-Albedo Cool Roof",
        titleId: "Cool Roof Albedo Tinggi",
        descEn: "Reflective roof membranes + vegetative pergolas cut indoor cooling HVAC loads.",
        descId: "Membran reflektif dan pergola vegetasi memangkas beban energi pendingin ruangan (AC).",
      },
      {
        titleEn: "+6 Pt Comfort Recovery",
        titleId: "Pemulihan Skor +6 Poin",
        descEn: "Switching to 3D Mode 03 (AI Solution) demonstrates immediate microclimate recovery.",
        descId: "Beralih ke Mode 3D 03 (AI Solution) menampilkan pemulihan kenyamanan iklim mikro.",
      },
    ],
    techSpec: "TCI_ASHRAE :: Score(0-100) = f(T_amb, RH%, GHI, Albedo) · Cool-Roof Delta: -1.8°C to -3.2°C",
  },
  {
    id: "enterprise-database-v32",
    category: "database",
    badge: "DATABASE V3.2",
    qEn: "How is Verdara's Enterprise Database v3.2 structured and can I export live snapshots?",
    qId: "Bagaimana struktur Database Enterprise v3.2 Verdara dan bisakah saya mengekspor datanya?",
    aEn: "Verdara operates an Enterprise Relational Database Engine v3.2 (src/lib/db/verdaraDatabase.ts & /api/db) featuring normalized tables with foreign-key integrity and dual-layer persistence (IndexedDB / LocalStorage client state synced with server-side JSON-WAL snapshots). You can inspect live records and export full JSON snapshots from /docs or /settings.",
    aId: "Verdara menjalankan Mesin Database Relasional Enterprise v3.2 (src/lib/db/verdaraDatabase.ts & /api/db) dengan tabel ternormalisasi, integritas foreign-key, serta persistensi lapis ganda (state klien IndexedDB / LocalStorage yang disinkronkan dengan snapshot JSON-WAL server). Anda dapat memeriksa baris tabel dan mengekspor bundel JSON langsung di /docs atau /settings.",
    points: [
      {
        titleEn: "Normalized Relational Tables",
        titleId: "Tabel Relasional Normal",
        descEn: "Tracks Users, Spatial Plots, SAM 3.1 Scans, AI Council Sessions, Field Proofs & Audit Logs.",
        descId: "Mencatat Users, Spatial Plots, Pindaian SAM 3.1, Sesi Dewan AI, Bukti Lapangan & Log Audit.",
      },
      {
        titleEn: "REST Inspector (/api/db)",
        titleId: "Inspektur REST (/api/db)",
        descEn: "Supports GET table telemetry and validated POST transactions with ACID-like integrity.",
        descId: "Mendukung inspeksi tabel (GET) dan transaksi tervalidasi (POST) secara konsisten.",
      },
      {
        titleEn: "1-Click JSON Snapshot",
        titleId: "Snapshot JSON 1-Klik",
        descEn: "Download the entire database state as a portable JSON archive for audit or backup.",
        descId: "Unduh seluruh state database sebagai arsip JSON portabel untuk audit atau cadangan.",
      },
    ],
    techSpec: "DB_ENGINE_V3.2 :: Normalized Relational Schema · /api/db REST API · Dual Persistence",
    relatedRoute: {
      href: "/docs",
      labelEn: "Inspect Live DB in Docs →",
      labelId: "Periksa Database di Docs →",
    },
  },
  {
    id: "field-proofs-dhash-ledger",
    category: "database",
    badge: "FIELD PROOFS",
    qEn: "How does the Field Proof Ledger verify real-world eco-actions and prevent fake duplicate photos?",
    qId: "Bagaimana Buku Besar Bukti Lapangan memverifikasi aksi nyata dan menolak foto duplikat?",
    aEn: "In the Field Proofs workspace (/academy), users upload photos of real sustainability installations (solar panels, biopore holes, sorted recyclables). Meta SAM 3.1 verifies the object class, while our perceptual 64-bit dHash algorithm (dhash.ts) computes an 8x8 luminance gradient fingerprint and rejects duplicate or slightly cropped photos whenever Hamming distance <= 8.",
    aId: "Di ruang kerja Bukti Lapangan (/academy), pengguna mengunggah foto aksi keberlanjutan nyata (panel surya, lubang biopori, pilahan daur ulang). Meta SAM 3.1 memverifikasi objek fisik tersebut, sementara algoritma perceptual dHash 64-bit (dhash.ts) menghitung sidik jari gradien luminans 8x8 dan menolak foto duplikat jika jarak Hamming <= 8.",
    points: [
      {
        titleEn: "64-Bit Perceptual dHash",
        titleId: "Perceptual dHash 64-Bit",
        descEn: "Detects duplicate or re-cropped submissions via Hamming distance <= 8 anti-replay check.",
        descId: "Mendeteksi foto ulang atau potongan gambar yang sama melalui pemeriksaan jarak Hamming <= 8.",
      },
      {
        titleEn: "SHA-256 Receipt Ledger",
        titleId: "Buku Besar Resi SHA-256",
        descEn: "Generates an immutable cryptographic receipt binding timestamp, GPS, and SAM 3.1 IoU.",
        descId: "Menghasilkan tanda terima kriptografis SHA-256 yang mengikat waktu, lokasi, dan skor SAM 3.1.",
      },
      {
        titleEn: "5 Architect Progression Tiers",
        titleId: "5 Level Progres Arsitek",
        descEn: "Unlocks new 3D district assets as you advance from Level 1 Scout to Level 5 Architect.",
        descId: "Membuka aset distrik 3D baru seiring kenaikan dari Level 1 Scout hingga Level 5 Architect.",
      },
    ],
    techSpec: "ANTI_REPLAY :: 64-Bit Luminance dHash (Hamming <= 8) + SHA-256 Cryptographic Ledger",
    relatedRoute: {
      href: "/academy",
      labelEn: "Open Field Proofs →",
      labelId: "Buka Bukti Lapangan →",
    },
  },
  {
    id: "auth-gate-login-flow",
    category: "security",
    badge: "AUTH GATE",
    qEn: "Why must users sign in before accessing the Dashboard, and how does 1-Click Judge Access work?",
    qId: "Mengapa pengguna harus login sebelum masuk ke Dashboard, dan bagaimana cara kerja Akses Juri 1-Klik?",
    aEn: "To protect API quotas and isolate personal spatial configurations, first-time visitors start on the public showcase (/), Documentation (/docs), and FAQ (/faq). Navigating to any studio workspace (/dashboard, /lens, /radar, /council, /academy, /settings) triggers our AuthGate, which redirects unauthenticated visitors to /login and restores their target destination immediately after sign-in.",
    aId: "Untuk melindungi kuota API dan mengisolasi konfigurasi spasial tiap pengguna, pengunjung pertama kali memulai di halaman publik (/), Dokumentasi (/docs), dan FAQ (/faq). Membuka ruang kerja studio (/dashboard, /lens, /radar, /council, /academy, /settings) akan mengaktifkan AuthGate yang mengarahkan pengguna ke /login dan mengembalikan mereka ke halaman tujuan setelah masuk.",
    points: [
      {
        titleEn: "1-Click Judge / Demo Login",
        titleId: "Login Juri / Demo 1-Klik",
        descEn: "Instant Level 5 Principal Eco-Architect session on /login with all 3D assets unlocked.",
        descId: "Sesi instan Principal Eco-Architect Level 5 di /login dengan seluruh fitur 3D terbuka.",
      },
      {
        titleEn: "Custom Account Registration",
        titleId: "Pendaftaran Akun Kustom",
        descEn: "Create a personal account with email & password synced to the v3.2 Users table.",
        descId: "Buat akun pribadi dengan email & kata sandi yang tersimpan di tabel Users v3.2.",
      },
      {
        titleEn: "Return-Path Memory",
        titleId: "Memori Rute Tujuan",
        descEn: "Preserves ?next=/target query routing so you land directly on the workspace you requested.",
        descId: "Menyimpan parameter ?next=/tujuan agar Anda langsung masuk ke halaman yang diminta.",
      },
    ],
    techSpec: "AUTH_GUARD :: Public (/, /docs, /faq, /login) -> AuthGate -> Protected Studio Workspaces",
    relatedRoute: {
      href: "/login",
      labelEn: "Go to Login Page →",
      labelId: "Ke Halaman Login →",
    },
  },
  {
    id: "seven-layer-credit-shield",
    category: "security",
    badge: "7-LAYER SHIELD",
    qEn: "How does the 7-Layer API Credit Shield prevent quota exhaustion while keeping responses under 50ms?",
    qId: "Bagaimana Perisai Kredit API 7-Lapis mencegah habisnya kuota sekaligus menjaga respons <50mdtk?",
    aEn: "Multimodal AI inference can be expensive under heavy traffic. Our 7-Layer Credit Shield protects cloud budgets via (1) Pre-verified Golden Specimen caching (<50ms at $0 cost), (2) SHA-256 payload deduplication, (3) client-side image compression (1024px max), (4) strict output token caps, (5) IP sliding-window rate limiting, (6) Judge Reserve budget locking, and (7) deterministic physics fallback.",
    aId: "Inferensi AI multimodal membutuhkan perlindungan kuota saat trafik tinggi. Perisai Kredit 7-Lapis kami menjaga anggaran cloud melalui: (1) Cache Golden Specimen (<50mdtk dengan biaya $0), (2) Deduplikasi payload SHA-256, (3) Kompresi gambar klien (maks 1024px), (4) Batas token keluaran LLM, (5) Pembatasan laju IP (rate limit), (6) Penguncian cadangan kuota penguji, dan (7) Fallback fisika deterministik.",
    points: [
      {
        titleEn: "SHA-256 Deduplication",
        titleId: "Deduplikasi SHA-256",
        descEn: "Identical image or city prompts serve verified cached tensors in <50ms at $0.00 cost.",
        descId: "Foto atau prompt kota yang identik menyajikan hasil terverifikasi dalam <50mdtk tanpa biaya.",
      },
      {
        titleEn: "Judge Reserve Floor",
        titleId: "Cadangan Kuota Penguji",
        descEn: "Locks a dedicated credit buffer so evaluators always experience live Meta AI calls.",
        descId: "Mengunci cadangan anggaran khusus agar penguji selalu mendapat respons AI langsung.",
      },
      {
        titleEn: "100% Uptime Fallback",
        titleId: "Fallback Uptime 100%",
        descEn: "Gracefully synthesizes engineering blueprints from local physics math if cloud APIs time out.",
        descId: "Menyusun cetak biru rekayasa secara otomatis dari mesin fisika lokal jika jaringan terputus.",
      },
    ],
    techSpec: "SHIELD_7L :: Golden Cache (<50ms) + SHA-256 Dedup + Rate Limit + Reserve Floor Lock",
    relatedRoute: {
      href: "/settings",
      labelEn: "Inspect Shield Telemetry →",
      labelId: "Periksa Telemetri Shield →",
    },
  },
  {
    id: "owasp-cybersecurity-headers",
    category: "security",
    badge: "CYBERSECURITY",
    qEn: "What OWASP ASVS security headers and backend protections safeguard Verdara?",
    qId: "Apa saja header keamanan OWASP ASVS dan proteksi backend yang melindungi Verdara?",
    aEn: "Verdara is engineered to OWASP ASVS L2 standards. Every HTTP response enforces Content-Security-Policy (CSP), X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, and Permissions-Policy via next.config.ts. All backend routes isolate API keys strictly on the server, validate payload sizes and MIME types, and sanitize user prompts against injection attacks.",
    aId: "Verdara dirancang mengikuti standar keamanan OWASP ASVS L2. Setiap respons HTTP menerapkan Content-Security-Policy (CSP), X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, dan Permissions-Policy melalui next.config.ts. Seluruh rute backend mengisolasi kunci API di sisi server, memvalidasi ukuran serta tipe MIME unggahan, dan membersihkan prompt dari serangan injeksi.",
    points: [
      {
        titleEn: "Strict HTTP Security Headers",
        titleId: "Header Keamanan HTTP",
        descEn: "Blocks clickjacking (X-Frame-Options: DENY), XSS, and unauthorized script origins.",
        descId: "Memblokir clickjacking (X-Frame-Options: DENY), XSS, dan skrip lintas-asal ilegal.",
      },
      {
        titleEn: "Server-Only Secret Isolation",
        titleId: "Isolasi Kunci Sisi-Server",
        descEn: "Meta AI & cloud credentials never touch client bundles or NEXT_PUBLIC_ variables.",
        descId: "Kunci API Meta AI tidak pernah diekspos ke bundle browser atau variabel publik.",
      },
      {
        titleEn: "Prompt Injection Firewall",
        titleId: "Firewall Injeksi Prompt",
        descEn: "Strips system-override instructions and enforces strict JSON output schemas.",
        descId: "Menyaring instruksi pembajak sistem dan menerapkan kontrak skema keluaran JSON ketat.",
      },
    ],
    techSpec: "OWASP_ASVS :: CSP + X-Frame-Options: DENY + Nosniff + Prompt Sanitizer + Audit Logs",
  },
];

export default function FaqPage() {
  const {
    locale,
    setLocale,
    units,
    setUnits,
    theme,
    setTheme,
    isAuthenticated,
    displayName,
    logout,
  } = useVerdaraStore();

  const isId = locale === "id";
  const isLight = theme === "light";

  const [activeCategory, setActiveCategory] = useState<"all" | FaqItem["category"]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState<string[]>([
    "what-is-verdara",
    "three-d-modes-explained",
    "three-d-scroll-zoom-camera",
    "meta-sam-vision-segmentation",
  ]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const categories: {
    id: "all" | FaqItem["category"];
    code: string;
    labelEn: string;
    labelId: string;
    count: number;
  }[] = [
    {
      id: "all",
      code: "00",
      labelEn: "All Topics",
      labelId: "Semua Topik",
      count: FAQ_ITEMS.length,
    },
    {
      id: "overview",
      code: "01",
      labelEn: "Platform & Global Cities",
      labelId: "Platform & Kota Global",
      count: FAQ_ITEMS.filter((i) => i.category === "overview").length,
    },
    {
      id: "three-d",
      code: "02",
      labelEn: "3D District, Zoom & Radar",
      labelId: "Distrik 3D, Zoom & Radar",
      count: FAQ_ITEMS.filter((i) => i.category === "three-d").length,
    },
    {
      id: "ai",
      code: "03",
      labelEn: "Meta SAM 3.1 & Muse Spark",
      labelId: "Meta SAM 3.1 & Muse Spark",
      count: FAQ_ITEMS.filter((i) => i.category === "ai").length,
    },
    {
      id: "physics",
      code: "04",
      labelEn: "Solar, Water & Thermal Math",
      labelId: "Fisika Surya, Air & Termal",
      count: FAQ_ITEMS.filter((i) => i.category === "physics").length,
    },
    {
      id: "database",
      code: "05",
      labelEn: "Database v3.2 & Field Proofs",
      labelId: "Database v3.2 & Bukti Nyata",
      count: FAQ_ITEMS.filter((i) => i.category === "database").length,
    },
    {
      id: "security",
      code: "06",
      labelEn: "Login, Shield & Cybersecurity",
      labelId: "Login, Perisai & Keamanan",
      count: FAQ_ITEMS.filter((i) => i.category === "security").length,
    },
  ];

  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const catMatch = activeCategory === "all" || item.category === activeCategory;
      if (!catMatch) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.qEn.toLowerCase().includes(q) ||
        item.qId.toLowerCase().includes(q) ||
        item.aEn.toLowerCase().includes(q) ||
        item.aId.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q) ||
        item.techSpec.toLowerCase().includes(q) ||
        item.points.some(
          (p) =>
            p.titleEn.toLowerCase().includes(q) ||
            p.titleId.toLowerCase().includes(q) ||
            p.descEn.toLowerCase().includes(q) ||
            p.descId.toLowerCase().includes(q)
        )
      );
    });
  }, [activeCategory, searchQuery]);

  const shortName = (displayName || "Eco-Architect").split(" ")[0];

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: isId ? item.qId : item.qEn,
        acceptedAnswer: {
          "@type": "Answer",
          text: isId ? item.aId : item.aEn,
        },
      })),
    }),
    [isId]
  );

  return (
    <div
      className={`min-h-screen pb-28 transition-colors duration-200 ${
        isLight ? "bg-[#f5f5f3] text-[#111111]" : "bg-[#0b0c0e] text-[#f2f1ec]"
      }`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      {/* CLEAN ULTRA-MODERN STICKY TOP HEADER (THEME-ADAPTED TRANSPARENT) */}
      <header className={`sticky top-0 z-40 border-b transition-all duration-200 ${
        isLight
          ? "border-black/[0.06] bg-[#f5f5f3]/95 text-[#111]"
          : "border-white/[0.06] bg-[#0b0c0e]/95 text-[#f2f1ec]"
      }`}>
        <div className="mx-auto flex h-14 sm:h-16 max-w-[1440px] items-center justify-between px-3.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3.5">
            <Link href="/" className="flex min-h-[40px] items-center gap-2.5 select-none">
              <VerdaraLogo size={32} />
              <div className="flex flex-col text-left leading-none">
                <span className="dovv-wordmark text-lg sm:text-xl font-black tracking-tight">
                  VERDARA
                </span>
                <span className="hidden font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.14em] opacity-60 sm:block">
                  Knowledge &amp; FAQ
                </span>
              </div>
            </Link>

            <span className="hidden h-4 w-[1px] bg-current/15 sm:inline-block" />

            <div className="hidden sm:block">
              <CompactWorldCityPicker
                isLight={isLight}
                isId={isId}
                variant="hero"
                align="left"
              />
            </div>
          </div>

          <nav className="hidden items-center gap-1 rounded-full border border-current/10 bg-current/[0.03] p-1 lg:flex shadow-2xs">
            <Link
              href="/"
              className="rounded-full px-3 py-1.5 text-xs font-medium opacity-75 transition hover:opacity-100"
            >
              {isId ? "Beranda" : "Overview"}
            </Link>
            <Link
              href="/docs"
              className="rounded-full px-3 py-1.5 text-xs font-medium opacity-75 transition hover:opacity-100"
            >
              {isId ? "Dokumen Teknis" : "Documentation"}
            </Link>
            <Link
              href="/faq"
              className="rounded-full bg-[#08090c] px-3.5 py-1.5 text-xs font-semibold text-[#c6f432] shadow-xs"
            >
              FAQ
            </Link>
            <Link
              href={isAuthenticated ? "/dashboard" : "/login?next=/dashboard"}
              className="rounded-full px-3 py-1.5 text-xs font-medium opacity-75 transition hover:opacity-100"
            >
              {isId ? "Studio 3D" : "3D Studio"}
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Grouped Preferences Pill */}
            <div
              className={`inline-flex items-center rounded-full border p-0.5 ${
                isLight
                  ? "border-black/10 bg-white shadow-2xs"
                  : "border-white/12 bg-[#14161b]"
              }`}
            >
              <button
                type="button"
                onClick={() => setLocale(isId ? "en" : "id")}
                className="min-h-[32px] cursor-pointer rounded-full px-2 sm:px-2.5 font-mono text-[10px] sm:text-[11px] font-semibold transition hover:bg-current/10"
              >
                {locale.toUpperCase()}
              </button>
              <span className="h-3 w-[1px] bg-current/15" />
              <button
                type="button"
                onClick={() =>
                  setUnits(units === "metric" ? "imperial" : "metric")
                }
                className="hidden min-h-[32px] cursor-pointer items-center rounded-full px-2 sm:px-2.5 font-mono text-[10px] sm:text-[11px] sm:inline-flex transition hover:bg-current/10"
              >
                {units === "metric" ? "m²" : "ft²"}
              </button>
              <span className="hidden sm:inline-block h-3 w-[1px] bg-current/15" />
              <button
                type="button"
                onClick={() => setTheme(isLight ? "dark" : "light")}
                className="min-h-[32px] cursor-pointer rounded-full px-2 sm:px-2.5 font-mono text-[10px] sm:text-[11px] transition hover:bg-current/10"
                title={isLight ? "Mode Terang" : "Mode Gelap"}
              >
                {isLight ? "☀" : "☾"}
              </button>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Link
                  href="/dashboard"
                  className="zeggo-btn flex min-h-[36px] items-center gap-1.5 rounded-full bg-[#1e9e5a] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#178249]"
                >
                  <ZeggoRollText
                    text={`Studio (${shortName}) ->`}
                  />
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="hidden md:inline-flex min-h-[36px] cursor-pointer items-center rounded-full border border-current/12 px-2.5 text-xs font-medium transition hover:bg-rose-500/10 hover:text-rose-500"
                >
                  {isId ? "Keluar" : "Logout"}
                </button>
              </div>
            ) : (
              <Link
                href="/login?next=/dashboard"
                className="zeggo-btn flex min-h-[36px] items-center gap-1.5 rounded-full bg-[#08090c] text-[#c6f432] px-3.5 text-xs font-semibold shadow-sm transition hover:opacity-90"
              >
                <ZeggoRollText
                  text={isId ? "Login Studio →" : "Sign In →"}
                />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* PROPORTIONAL, WELL-CONSTRAINED CONTAINER (MAX-W-1080PX) SO CARDS NEVER STRETCH TOO WIDE */}
      <main className="mx-auto max-w-[1080px] px-4 pt-6 sm:px-6 sm:pt-10">
        {/* MODERN ARCHITECTURAL HERO BANNER (NEWEST DESIGN STYLE, PROPORTIONAL TYPOGRAPHY) */}
        <section className="rounded-[24px] bg-[#08090c] p-6 sm:p-8 text-white shadow-[inset_0_0_0_1.5px_#232730]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#c6f432]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#c6f432]">
                VERDARA KNOWLEDGE BASE · v3.2
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] text-[#c9c7c0]">
                16 ENGINEERING TOPICS · EN / ID
              </span>
            </div>

            <Link
              href="/docs"
              className="inline-flex min-h-[36px] items-center rounded-full border border-[#c6f432]/40 bg-[#c6f432]/10 px-3.5 font-mono text-[11px] font-semibold text-[#c6f432] transition hover:bg-[#c6f432]/20"
            >
              {isId ? "Spesifikasi Teknis (/docs) →" : "Technical Docs (/docs) →"}
            </Link>
          </div>

          <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl leading-[1.15]">
                {isId
                  ? "Pusat Pengetahuan & Tanya Jawab Sistem (FAQ)"
                  : "Frequently Asked Questions & System Guide"}
              </h1>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#c9c7c0]">
                {isId
                  ? "Panduan terstruktur mengenai simulasi Distrik Ekologis 3D (Run, Break, Heal & Scroll-Zoom), visi spasial Meta SAM 3.1, dewan 3-Agen Meta Muse Spark, rumus fisika NREL PVWatts v8 & DIN 1989-1, basis data 195+ negara, hingga keamanan siber."
                  : "Structured engineering guide covering the 3D Eco-District simulation (Run, Break, Heal & Scroll-Zoom), Meta SAM 3.1 computer vision, Meta Muse Spark 3-specialist deliberation, NREL PVWatts v8 & DIN 1989-1 physics formulas, 195+ country database, and cybersecurity."}
              </p>
            </div>

            {/* Search Input Inside Hero */}
            <div className="w-full lg:w-[310px] shrink-0">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isId
                    ? "Cari topik (mis. SAM 3.1, 3D, surya, biopori)..."
                    : "Search topics (e.g. SAM 3.1, 3D, solar, biopore)..."
                }
                aria-label={isId ? "Cari pertanyaan FAQ" : "Search FAQ questions"}
                className="min-h-[42px] w-full rounded-xl border border-white/15 bg-[#13161d] px-3.5 py-2 text-xs text-white placeholder-[#8e929b] focus:border-[#c6f432] focus:outline-none"
              />
            </div>
          </div>

          {/* Compact 4-Metric Telemetry Strip */}
          <div className="mt-6 grid grid-cols-2 gap-2.5 border-t border-white/10 pt-5 sm:grid-cols-4">
            {[
              {
                code: "01 · COVERAGE",
                val: isId ? "195+ Negara" : "195+ Countries",
                sub: "ERA5 + NASA POWER GHI",
              },
              {
                code: "02 · 3D ENGINE",
                val: isId ? "Kembar Digital 3D" : "Real-Time 3D Twin",
                sub: isId ? "Scroll-Zoom + 3 Mode" : "Scroll-Zoom + 3 Modes",
              },
              {
                code: "03 · META AI",
                val: "SAM 3.1 + Muse Spark",
                sub: isId ? "Validator Fakta +/-3%" : "+/-3% Fact Validator",
              },
              {
                code: "04 · SECURITY",
                val: isId ? "Perisai 7-Lapis" : "7-Layer Shield",
                sub: "OWASP ASVS + DB v3.2",
              },
            ].map((m) => (
              <div
                key={m.code}
                className="rounded-xl border border-white/10 bg-[#12151c] px-3.5 py-2.5"
              >
                <div className="font-mono text-[10px] text-[#8e929b]">{m.code}</div>
                <div className="mt-0.5 text-xs sm:text-sm font-semibold text-white">
                  {m.val}
                </div>
                <div className="font-mono text-[10px] text-[#c6f432]">{m.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 2-COLUMN KNOWLEDGE BASE LAYOUT: STICKY SIDEBAR (250PX) + FOCUSED Q&A COLUMN */}
        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)] items-start">
          {/* LEFT STICKY NAVIGATION SIDEBAR */}
          <aside className="lg:sticky lg:top-20 space-y-4">
            <div
              className={`rounded-2xl border p-3.5 ${
                isLight
                  ? "border-black/10 bg-white"
                  : "border-white/10 bg-[#12141b]"
              }`}
            >
              <div className="mb-2.5 flex items-center justify-between px-1">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider opacity-60">
                  {isId ? "KATEGORI TOPIK" : "TOPIC CATEGORIES"}
                </span>
                <span className="font-mono text-[10px] font-semibold text-[#1e9e5a] dark:text-[#c6f432]">
                  {filteredFaqs.length}/{FAQ_ITEMS.length}
                </span>
              </div>

              <div className="flex flex-row gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                {categories.map((cat) => {
                  const active = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex min-h-[38px] shrink-0 cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium transition ${
                        active
                          ? "bg-[#08090c] text-[#c6f432] font-semibold shadow-sm"
                          : isLight
                            ? "text-[#222222] hover:bg-black/5"
                            : "text-[#c9c7c0] hover:bg-white/5"
                      }`}
                    >
                      <span className="truncate">
                        <span className="mr-1.5 font-mono text-[10px] opacity-60">
                          {cat.code}
                        </span>
                        {isId ? cat.labelId : cat.labelEn}
                      </span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
                          active
                            ? "bg-[#c6f432]/20 text-[#c6f432]"
                            : "bg-current/10 opacity-70"
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Expand / Collapse Controls */}
              <div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-current/10 pt-3">
                <button
                  type="button"
                  onClick={() => setOpenIds(filteredFaqs.map((i) => i.id))}
                  className="min-h-[36px] cursor-pointer rounded-xl border border-current/15 px-2.5 font-mono text-[11px] font-medium transition hover:bg-current/5"
                >
                  {isId ? "Buka Semua" : "Expand All"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenIds([])}
                  className="min-h-[36px] cursor-pointer rounded-xl border border-current/15 px-2.5 font-mono text-[11px] font-medium opacity-75 transition hover:bg-current/5 hover:opacity-100"
                >
                  {isId ? "Tutup Semua" : "Collapse All"}
                </button>
              </div>
            </div>

            {/* Compact Sidebar Reference Card */}
            <div className="hidden rounded-2xl bg-[#08090c] p-4 text-white lg:block border border-white/10">
              <span className="font-mono text-[10px] font-bold text-[#c6f432]">
                {isId ? "DOKUMENTASI REKAYASA" : "ENGINEERING BLUEPRINTS"}
              </span>
              <p className="mt-1.5 text-xs leading-relaxed text-[#c9c7c0]">
                {isId
                  ? "Ingin memeriksa skema tabel database v3.2 secara langsung atau melihat derivasi rumus fisika?"
                  : "Want to inspect the live v3.2 relational database tables or review full mathematical derivations?"}
              </p>
              <Link
                href="/docs"
                className="mt-3 inline-flex min-h-[36px] w-full items-center justify-center rounded-xl bg-[#c6f432] px-3 text-xs font-semibold text-[#080808] transition hover:opacity-90"
              >
                {isId ? "Buka Halaman /docs →" : "Open /docs Reference →"}
              </Link>
            </div>
          </aside>

          {/* RIGHT FOCUSED ACCORDION LIST (PROPORTIONAL READING WIDTH) */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div
                className={`rounded-2xl border p-8 text-center ${
                  isLight
                    ? "border-black/10 bg-white"
                    : "border-white/10 bg-[#12141b]"
                }`}
              >
                <p className="text-sm font-semibold">
                  {isId
                    ? "Tidak ada topik FAQ yang cocok dengan kata kunci tersebut."
                    : "No FAQ topics matched your search query."}
                </p>
                <p className="mt-1 text-xs opacity-70">
                  {isId
                    ? "Coba kata kunci seperti 'SAM 3.1', 'PVWatts', '3D', 'Biopori', atau reset filter."
                    : "Try keywords like 'SAM 3.1', 'PVWatts', '3D', 'Biopore', or reset the filter."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory("all");
                    setSearchQuery("");
                  }}
                  className="mt-4 min-h-[38px] cursor-pointer rounded-full bg-[#08090c] px-4 font-mono text-xs font-semibold text-[#c6f432]"
                >
                  {isId ? "Reset Pencarian" : "Reset Search"}
                </button>
              </div>
            ) : (
              filteredFaqs.map((item, idx) => {
                const isOpen = openIds.includes(item.id);
                return (
                  <article
                    key={item.id}
                    className={`rounded-2xl border transition-all ${
                      isOpen
                        ? isLight
                          ? "border-[#1e9e5a]/50 bg-white shadow-sm"
                          : "border-[#c6f432]/45 bg-[#14171f]"
                        : isLight
                          ? "border-black/10 bg-white/85 hover:border-black/25"
                          : "border-white/10 bg-[#111319] hover:border-white/20"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      aria-expanded={isOpen}
                      className="flex w-full cursor-pointer items-start justify-between gap-3.5 p-4 sm:p-5 text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wide ${
                              isOpen
                                ? "bg-[#c6f432] text-[#080808]"
                                : "bg-[#08090c] text-[#c6f432]"
                            }`}
                          >
                            {String(idx + 1).padStart(2, "0")} · {item.badge}
                          </span>
                        </div>
                        <h2 className="text-[15px] sm:text-[17px] font-semibold leading-snug tracking-tight">
                          {isId ? item.qId : item.qEn}
                        </h2>
                      </div>

                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold transition ${
                          isOpen
                            ? "bg-[#1e9e5a] text-white"
                            : "bg-current/10 text-current"
                        }`}
                      >
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-current/10 px-4 pt-3.5 pb-5 sm:px-5 space-y-4">
                        {/* Executive Answer with Comfortable 68ch Reading Width */}
                        <p className="max-w-[68ch] text-xs sm:text-[13.5px] leading-relaxed opacity-90">
                          {isId ? item.aId : item.aEn}
                        </p>

                        {/* Compact 3-Column Technical Breakdown Grid */}
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          {item.points.map((pt, pIdx) => (
                            <div
                              key={pIdx}
                              className={`rounded-xl border p-3 ${
                                isLight
                                  ? "border-black/8 bg-[#f7f8f6]"
                                  : "border-white/8 bg-[#0c0e13]"
                              }`}
                            >
                              <div className="font-mono text-[11px] font-bold text-[#1e9e5a] dark:text-[#c6f432]">
                                {isId ? pt.titleId : pt.titleEn}
                              </div>
                              <p className="mt-1 text-[11.5px] leading-snug opacity-85">
                                {isId ? pt.descId : pt.descEn}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Spec Bar & Direct Action Link */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                          <span className="rounded-lg bg-[#08090c] px-3 py-1.5 font-mono text-[10.5px] text-[#c6f432]">
                            {item.techSpec}
                          </span>

                          {item.relatedRoute && (
                            <Link
                              href={item.relatedRoute.href}
                              className="inline-flex min-h-[34px] items-center rounded-full bg-[#1e9e5a] px-3.5 text-xs font-semibold text-white transition hover:bg-[#178249]"
                            >
                              {isId
                                ? item.relatedRoute.labelId
                                : item.relatedRoute.labelEn}
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* COMPACT BOTTOM ARCHITECTURAL CTA */}
        <section
          className={`mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[22px] border p-5 sm:p-6 ${
            isLight
              ? "border-black/10 bg-white"
              : "border-white/10 bg-[#14161b]"
          }`}
        >
          <div>
            <span className="font-mono text-[11px] font-bold text-[#1e9e5a]">
              {isId
                ? "SPESIFIKASI REKAYASA & BASIS DATA V3.2"
                : "ENGINEERING SPECIFICATIONS & LIVE DB V3.2"}
            </span>
            <h2 className="mt-0.5 text-base sm:text-lg font-semibold">
              {isId
                ? "Jelajahi 6 Modul Dokumentasi Teknis Verdara (/docs)"
                : "Explore All 6 Engineering Modules in Technical Documentation (/docs)"}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/docs"
              className="inline-flex min-h-[40px] items-center rounded-full bg-[#08090c] px-4 text-xs font-semibold text-[#c6f432] transition hover:opacity-90"
            >
              {isId ? "Buka Dokumentasi (/docs) →" : "Open Documentation (/docs) →"}
            </Link>
            <Link
              href={isAuthenticated ? "/dashboard" : "/login?next=/dashboard"}
              className="inline-flex min-h-[40px] items-center rounded-full bg-[#1e9e5a] px-4 text-xs font-semibold text-white transition hover:bg-[#178249]"
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
