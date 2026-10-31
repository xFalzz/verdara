'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useVerdaraStore } from '@/store/useVerdaraStore';
import {
  VerdaraLogo,
  ZeggoRollText,
  CompactWorldCityPicker,
  VerdaraBottomDock,
} from '@/components/ui/InteractiveEffects';

interface FaqItem {
  id: string;
  category: 'overview' | 'ai' | 'physics' | 'three-d' | 'database' | 'security';
  badgeEn: string;
  badgeId: string;
  questionEn: string;
  questionId: string;
  answerEn: string;
  answerId: string;
  highlightsEn: string[];
  highlightsId: string[];
  specCode: string;
  relatedLink?: {
    href: string;
    labelEn: string;
    labelId: string;
  };
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'what-is-verdara',
    category: 'overview',
    badgeEn: '01 · PLATFORM OVERVIEW',
    badgeId: '01 · GAMBARAN PLATFORM',
    questionEn: 'What exactly is Verdara and what problem does it solve?',
    questionId: 'Apa sebenarnya Verdara dan masalah apa yang diselesaikannya?',
    answerEn:
      'Verdara is a Global Spatial AI & Sustainable Architecture Digital Twin platform. It bridges the gap between complex environmental engineering (solar photovoltaics, urban hydrology, circular material auditing) and everyday homeowners, architects, and city planners. By selecting any country or city worldwide, or uploading a real building photo, Verdara builds an interactive 3D eco-district and computes exact rooftop solar yield, rainwater harvesting capacity, biopore flood infiltration, and circular waste recovery value in real time.',
    answerId:
      'Verdara adalah platform Global Spatial AI & Digital Twin Arsitektur Berkelanjutan. Platform ini menjembatani kesenjangan antara rekayasa lingkungan tingkat lanjut (fotovoltaik surya, hidrologi perkotaan, audit material sirkular) dengan pemilik rumah, arsitek, dan perencana kota. Dengan memilih negara atau kota mana pun di dunia, atau mengunggah foto bangunan asli, Verdara membangun distrik ekologi 3D interaktif serta menghitung kapasitas surya atap, volume panen air hujan, infiltrasi banjir biopori, dan nilai daur ulang secara real-time.',
    highlightsEn: [
      'Translates raw satellite climatology (NASA POWER GHI & ERA5 precipitation) into actionable residential and commercial retrofit blueprints.',
      'Combines deterministic civil and electrical engineering physics with Meta AI vision segmentation and multi-agent architectural reasoning.',
      'Supports 195+ countries with localized electricity tariffs, carbon grid intensities, currency formatting, and bilingual EN/ID interfaces.',
    ],
    highlightsId: [
      'Menerjemahkan klimatologi satelit mentah (NASA POWER GHI & presipitasi ERA5) menjadi cetak biru retrofit hunian dan komersial yang siap dieksekusi.',
      'Menggabungkan fisika teknik sipil dan elektro deterministik dengan segmentasi visi Meta AI serta penalaran arsitektur multi-agen.',
      'Mendukung 195+ negara dengan tarif listrik lokal, intensitas karbon jaringan, format mata uang lokal, dan antarmuka dwibahasa EN/ID.',
    ],
    specCode: 'STACK :: Next.js 16 (App Router) + Three.js r183 WebGL + Meta SAM 3.1 + Muse Spark + Physics Engine v3.2',
    relatedLink: {
      href: '/dashboard',
      labelEn: 'Explore 3D Living Town Studio',
      labelId: 'Buka Studio 3D Living Town',
    },
  },
  {
    id: 'global-cities-coverage',
    category: 'overview',
    badgeEn: '02 · 195+ COUNTRIES & CLIMATES',
    badgeId: '02 · 195+ NEGARA & ZONA IKLIM',
    questionEn: 'How does Verdara calculate accurate numbers for 195+ countries and different climate zones?',
    questionId: 'Bagaimana Verdara menghitung angka yang akurat untuk 195+ negara dan zona iklim yang berbeda?',
    answerEn:
      'Every city and country in Verdara is mapped to a Köppen-Geiger climate classification (such as Aw Tropical Monsoon, Cfb Oceanic, Csb Mediterranean, BWh Hot Desert, or Dfb Continental) and paired with 12-month ERA5 hourly weather normals and NASA POWER Global Horizontal Irradiance (GHI). When you switch countries in the navbar or slide through the 10-country comparator deck, all solar, water, thermal comfort, and currency calculations recalibrate instantaneously.',
    answerId:
      'Setiap kota dan negara di Verdara dipetakan ke klasifikasi iklim Köppen-Geiger (seperti Aw Monsun Tropis, Cfb Oseanik, Csb Mediterania, BWh Gurun Panas, atau Dfb Kontinental) dan dipasangkan dengan normal cuaca 12-bulan ERA5 serta Global Horizontal Irradiance (GHI) NASA POWER. Saat Anda mengganti negara di navbar atau menggeser dek komparator 10 negara, seluruh kalkulasi surya, air, kenyamanan termal, dan mata uang dikalibrasi ulang secara instan.',
    highlightsEn: [
      '5 Deep-Calibration Benchmark Profiles: Menlo Park (Csb), London (Cfb), Tokyo (Cfa), Dubai (BWh), and Yogyakarta/Jakarta (Am/Aw).',
      '10-Country Interactive Drag Deck on the landing page for side-by-side comparison of solar kWp, rainwater liters, and thermal comfort scores.',
      'Automatic unit conversion between Metric (m², Liters, °C) and Imperial (sq ft, US Gallons, °F) across every chart and 3D badge.',
    ],
    highlightsId: [
      '5 Profil Benchmark Kalibrasi Mendalam: Menlo Park (Csb), London (Cfb), Tokyo (Cfa), Dubai (BWh), dan Yogyakarta/Jakarta (Am/Aw).',
      'Dek Geser Interaktif 10 Negara di halaman utama untuk perbandingan berdampingan kapasitas kWp surya, liter air hujan, dan skor kenyamanan termal.',
      'Konversi satuan otomatis antara Metrik (m², Liter, °C) dan Imperial (sq ft, Galon AS, °F) di seluruh grafik dan lencana 3D.',
    ],
    specCode: 'CLIMATE_DB :: 195+ ISO-3166 Countries · 12-Month ERA5 Normals · Local Grid Tariffs & CO2e Factors',
    relatedLink: {
      href: '/radar',
      labelEn: 'Inspect Global 3D Radar Map',
      labelId: 'Periksa Peta 3D Radar Global',
    },
  },
  {
    id: 'why-login-required',
    category: 'security',
    badgeEn: '03 · AUTHENTICATION GATE',
    badgeId: '03 · GERBANG OTENTIKASI',
    questionEn: 'Why do I need to sign in before entering the Dashboard or AI workspaces?',
    questionId: 'Mengapa saya harus login terlebih dahulu sebelum masuk ke Dashboard atau ruang kerja AI?',
    answerEn:
      'First-time visitors land on our public architectural showcase (/), Documentation (/docs), and FAQ (/faq) so they can explore the 3D Eco-District and benchmark climate decks freely. Signing in unlocks your dedicated personal spatial workspace (/dashboard, /lens, /radar, /council, /academy, /settings) where custom roof area sliders, Meta SAM 3.1 polygon scans, multi-agent blueprints, and field proof ledger receipts are isolated and persisted to your authenticated profile.',
    answerId:
      'Pengunjung pertama kali diarahkan ke halaman showcase publik (/), Dokumentasi (/docs), dan FAQ (/faq) agar dapat menjelajahi Distrik Ekologi 3D serta dek iklim secara bebas. Login membuka ruang kerja spasial pribadi Anda (/dashboard, /lens, /radar, /council, /academy, /settings) tempat slider luas atap kustom, pindaian poligon Meta SAM 3.1, cetak biru multi-agen, dan bukti lapangan disimpan secara terisolasi ke profil Anda.',
    highlightsEn: [
      'Instant 1-Click Judge / Demo Access on the /login page provisions a Level 5 Eco-Architect session without requiring external credentials.',
      'Full support for custom email/password registration and login with cryptographic session token persistence.',
      'Route-level AuthGate protection ensures unauthenticated users are cleanly redirected to /login with a return-path memory.',
    ],
    highlightsId: [
      'Akses Juri / Demo 1-Klik instan di halaman /login langsung mengaktifkan sesi Eco-Architect Level 5 tanpa memerlukan kredensial eksternal.',
      'Dukungan penuh pendaftaran dan login email/kata sandi kustom dengan penyimpanan token sesi kriptografis.',
      'Proteksi AuthGate tingkat rute memastikan pengguna yang belum login diarahkan dengan rapi ke /login dan dikembalikan ke halaman tujuan setelah masuk.',
    ],
    specCode: 'AUTH_FLOW :: Public (/, /docs, /faq, /login) -> AuthGate -> Protected Studio Routes (Session v3.2)',
    relatedLink: {
      href: '/login',
      labelEn: 'Open Login & 1-Click Judge Access',
      labelId: 'Buka Halaman Login & Akses Juri 1-Klik',
    },
  },
  {
    id: 'three-d-district-modes',
    category: 'three-d',
    badgeEn: '04 · 3D LIVING ECO-DISTRICT',
    badgeId: '04 · DISTRIK EKOLOGI 3D',
    questionEn: 'What happens when I switch between "01 Normal Day", "02 Storm Surge", and "03 AI Solution" in the 3D Stage?',
    questionId: 'Apa perbedaan nyata saat saya mengganti mode "01 Normal Day", "02 Storm Surge", dan "03 AI Solution" di kotak 3D?',
    answerEn:
      'The 3D Living Eco-District is a real-time Three.js WebGL procedural simulation of a Mass-Timber (CLT) Solar Atrium, twin residential villas, a hydro retention canal, active biopore wells, and an EV transit corridor. Switching between the 3 simulation modes dynamically alters the 3D geometry, water physics, weather particles, and structural telemetry cards so you can observe how green infrastructure responds to extreme climate stress.',
    answerId:
      'Distrik Ekologi 3D adalah simulasi prosedural WebGL Three.js real-time yang mencakup Atrium Surya Mass-Timber (CLT), dua vila hunian, kanal retensi hidro, sumur biopori aktif, dan koridor transit EV. Mengganti 3 mode simulasi akan mengubah geometri 3D, fisika air, partikel cuaca, dan kartu telemetri secara dinamis sehingga Anda dapat melihat langsung bagaimana infrastruktur hijau merespons tekanan iklim ekstrem.',
    highlightsEn: [
      '01 Normal Day (Run): Clear atmospheric sky, baseline canal water level, active rooftop PV generation, steady wind turbine rotation, and EV street transit.',
      '02 Storm Surge (Break): Dark cumulonimbus storm atmosphere, 420 heavy rain droplets, surging canal water level (+0.26m flood stress), and amber overflow warning rings.',
      '03 AI Solution (Heal): Deploys an elevated green-roof pergola canopy, expands the rainwater retention tank (1.28x capacity), activates cyan biopore infiltration plumes, and restores thermal comfort (+6 pts).',
    ],
    highlightsId: [
      '01 Normal Day (Run): Langit cerah normal, tinggi air kanal stabil, pembangkitan PV atap aktif, rotasi turbin angin stabil, dan mobilitas jalan EV.',
      '02 Storm Surge (Break): Atmosfer badai gelap, 420 partikel hujan deras, permukaan air kanal meluap (+0.26m tekanan banjir), dan cincin peringatan luapan kuning-merah.',
      '03 AI Solution (Heal): Mengaktifkan kanopi pergola atap hijau, memperbesar tangki retensi air hujan (kapasitas 1.28x), menyalakan cincin infiltrasi biopori sian, dan memulihkan kenyamanan termal (+6 poin).',
    ],
    specCode: 'WEBGL_STAGE :: Three.js r183 · ACESFilmicToneMapping · 4 Camera Focus Presets · Day/Night PBR Materials',
    relatedLink: {
      href: '/dashboard',
      labelEn: 'Test 3D Simulation Modes Live',
      labelId: 'Uji Mode Simulasi 3D Secara Langsung',
    },
  },
  {
    id: 'three-d-camera-and-scroll',
    category: 'three-d',
    badgeEn: '05 · CAMERA PRESETS & SMOOTH SCROLL',
    badgeId: '05 · PRESET KAMERA & SMOOTH SCROLL',
    questionEn: 'How do I inspect specific parts of the 3D town without getting stuck while scrolling the page?',
    questionId: 'Bagaimana cara memeriksa bagian tertentu di kota 3D tanpa membuat scroll halaman tersangkut?',
    answerEn:
      'We engineered the 3D canvas and the global inertial Smooth Scroll engine to work in harmony. Wheel-zoom capture inside the 3D canvas is intentionally disabled so scrolling your mouse wheel or trackpad anywhere on the screen smoothly glides down the page. To inspect the 3D architecture up close, click-and-drag to orbit 360 degrees or use the bottom-right Camera Focus pills (Overview, Solar Hub, Hydro Canal, EV Street, and Orbit ON/OFF).',
    answerId:
      'Kami merancang kanvas 3D dan mesin Smooth Scroll inersia global agar bekerja selaras. Tangkap wheel-zoom di dalam kanvas 3D sengaja dinonaktifkan sehingga saat Anda menggulir roda mouse atau trackpad di bagian mana pun, halaman tetap bergerak mulus ke atas atau bawah. Untuk memeriksa arsitektur 3D dari dekat, klik-dan-geser untuk memutar 360 derajat atau gunakan tombol Fokus Kamera di kanan bawah (Overview, Solar Hub, Hydro Canal, EV Street, dan Orbit ON/OFF).',
    highlightsEn: [
      '4 Targeted Camera Presets smoothly interpolate the camera position and look-at target toward the CLT Solar Hub, Hydro Canal, or EV Street.',
      'Universal Inertial Smooth Scroll (60fps critically damped lerp) works both on main pages and inside nested workspace panels.',
      'Interactive 3D Callout Pills allow direct clicking on the Solar Array, Cistern, or Biopores to synchronize the telemetry inspector.',
    ],
    highlightsId: [
      '4 Preset Kamera Terfokus menggerakkan posisi dan titik pandang kamera secara halus menuju Solar Hub CLT, Kanal Hidro, atau Jalan EV.',
      'Universal Inertial Smooth Scroll (interpolasi lerp 60fps) bekerja baik di halaman utama maupun di dalam panel ruang kerja bersarang.',
      'Lencana 3D Interaktif memungkinkan klik langsung pada Panel Surya, Tangki Air, atau Biopori untuk menyinkronkan inspektur telemetri.',
    ],
    specCode: 'SCROLL_ENGINE :: Universal RAF Lerp (0.135 Damping) + OrbitControls (enableZoom: false, enableDamping: true)',
  },
  {
    id: 'meta-sam-vision-lens',
    category: 'ai',
    badgeEn: '06 · META SAM 3.1 SPATIAL LENS',
    badgeId: '06 · LENSA SPASIAL META SAM 3.1',
    questionEn: 'How does the Meta SAM 3.1 Vision Lens extract usable roof area and materials from a photo?',
    questionId: 'Bagaimana Lensa Visi Meta SAM 3.1 mengekstrak luas atap dan material dari sebuah foto?',
    answerEn:
      'When you upload a photo of a rooftop, yard, or recyclable material in the SAM 3.1 Spatial Lens (/lens), the image is processed through our server-side vision pipeline (/api/vision/segment). Meta SAM 3.1 performs zero-shot spatial polygon segmentation to isolate unobstructed roof pitches, gutter catchment edges, impervious concrete surfaces, and circular waste items (PET, HDPE, aluminum, cardboard), returning normalized SVG vector contours and confidence scores.',
    answerId:
      'Saat Anda mengunggah foto atap, halaman rumah, atau material daur ulang di Lensa Spasial SAM 3.1 (/lens), gambar diproses melalui pipeline visi sisi-server kami (/api/vision/segment). Meta SAM 3.1 melakukan segmentasi poligon spasial zero-shot untuk mengisolasi bidang atap tanpa bayangan, tepi talang air, permukaan beton kedap air, serta material daur ulang (PET, HDPE, aluminium, kardus), lalu mengembalikan kontur vektor SVG ternormalisasi beserta skor akurasinya.',
    highlightsEn: [
      'Computes net usable solar area by subtracting chimneys, skylights, HVAC units, and tree-shading masks from the gross roof footprint.',
      'Includes 6 pre-calibrated Golden Specimen benchmarks (Rooftop Solar Slab, Tropical Monsoon Courtyard, Urban Biopore Drain, Circular PET/Alu Batch, etc.) for instant <50ms evaluation.',
      'Features an interactive Before / After Architectural Retrofit slider powered by Meta Muse Image synthesis.',
    ],
    highlightsId: [
      'Menghitung luas surya bersih yang dapat digunakan dengan mengurangi cerobong, skylight, unit HVAC, dan area bayangan pohon dari total luas atap.',
      'Menyediakan 6 spesimen benchmark terkalibrasi (Atap Surya, Halaman Monsun Tropis, Drainase Biopori, Batch Daur Ulang PET/Alu, dll.) untuk pengujian instan <50mdtk.',
      'Dilengkapi slider perbandingan Before / After Retrofit Arsitektur interaktif yang didukung sintesis Meta Muse Image.',
    ],
    specCode: 'VISION_API :: POST /api/vision/segment · Meta SAM 3.1 Polygon Contours + Muse Image Retrofit',
    relatedLink: {
      href: '/lens',
      labelEn: 'Launch Meta SAM 3.1 Spatial Lens',
      labelId: 'Buka Lensa Spasial Meta SAM 3.1',
    },
  },
  {
    id: 'muse-spark-ai-council',
    category: 'ai',
    badgeEn: '07 · 3-AGENT AI COUNCIL & FACT VALIDATOR',
    badgeId: '07 · DEWAN AI 3-AGEN & VALIDATOR FAKTA',
    questionEn: 'Who are the 3 AI specialists in the Eco-Architect Council and how do you prevent AI hallucinations?',
    questionId: 'Siapa saja 3 spesialis AI di Dewan Eco-Architect dan bagaimana Verdara mencegah halusinasi angka AI?',
    answerEn:
      'In the AI Council workspace (/council), Meta Muse Spark orchestrates three domain-specific engineering personas in parallel: (1) Dr. Flora (Urban Botanist & Microclimate Specialist), (2) Ir. Arka (Solar PV & Hydrological Civil Engineer), and (3) Sirkula (Circular Economy & Material Auditor). Crucially, the AI models are never allowed to invent physics numbers: our deterministic Physics Engine computes all kWh, Liters, and currency values first, injects them into the prompt, and runs a post-generation +/-3% Fact Validator.',
    answerId:
      'Di ruang kerja Dewan AI (/council), Meta Muse Spark mengoordinasikan tiga persona insinyur spesialis secara paralel: (1) Dr. Flora (Ahli Botani Perkotaan & Iklim Mikro), (2) Ir. Arka (Insinyur Sipil Hidrologi & Surya PV), serta (3) Sirkula (Auditor Ekonomi Sirkular & Material). Yang paling penting, model AI tidak pernah diizinkan mengarang angka fisika: Mesin Fisika deterministik kami menghitung seluruh nilai kWh, Liter, dan mata uang terlebih dahulu, menyuntikkannya ke prompt, lalu menjalankan Validator Fakta +/-3% pasca-generasi.',
    highlightsEn: [
      'Dr. Flora specifies native drought- or monsoon-resilient vegetation, green roof substrates, and Urban Heat Island (UHI) cooling strategies.',
      'Ir. Arka designs the monocrystalline PV string layout, LiFePO4 battery sizing, first-flush rainwater diverters, and biopore trench spacing.',
      'Deterministic Fact Validator parses every numeric claim in the LLM output and flags or corrects any deviation exceeding +/-3% from the physics ground truth.',
    ],
    highlightsId: [
      'Dr. Flora merumuskan vegetasi lokal tahan kekeringan/monsun, substrat atap hijau, dan strategi pendinginan Urban Heat Island (UHI).',
      'Ir. Arka merancang tata letak string PV monokristalin, kapasitas baterai LiFePO4, pengalih air hujan pertama (first-flush), dan jarak sumur biopori.',
      'Validator Fakta Deterministik memeriksa setiap klaim numerik pada respons LLM dan mengoreksi deviasi apa pun yang melebihi +/-3% dari hasil mesin fisika.',
    ],
    specCode: 'COUNCIL_ENGINE :: POST /api/ai/council · Meta Muse Spark + Llama 4 Scout Open-Weight + +/-3% Validator',
    relatedLink: {
      href: '/council',
      labelEn: 'Consult the 3-Agent AI Council',
      labelId: 'Konsultasi dengan Dewan AI 3-Agen',
    },
  },
  {
    id: 'solar-physics-math',
    category: 'physics',
    badgeEn: '08 · NREL PVWATTS V8 SOLAR PHYSICS',
    badgeId: '08 · FISIKA SURYA NREL PVWATTS V8',
    questionEn: 'What exact mathematical formula is used to calculate rooftop solar power and financial savings?',
    questionId: 'Rumus matematika apa yang digunakan untuk menghitung energi surya atap dan penghematan biaya?',
    answerEn:
      'Verdara implements the industry-standard NREL PVWatts v8 equation in src/lib/science/solar.ts. Using your selected roof area, usable roof ratio (default 72% after setbacks), panel efficiency (20.8% N-type monocrystalline silicon), local daily Global Horizontal Irradiance (GHI), and ambient temperature derating, the engine computes peak capacity (kWp), annual generation (kWh/yr), local utility bill savings, and avoided grid carbon emissions (kg CO2e/yr).',
    answerId:
      'Verdara mengimplementasikan persamaan standar industri NREL PVWatts v8 di dalam src/lib/science/solar.ts. Menggunakan luas atap pilihan Anda, rasio atap bersih (default 72% setelah batas tepi), efisiensi panel (20,8% silikon monokristalin tipe-N), radiasi harian lokal (GHI), serta faktor koreksi suhu udara, mesin menghitung kapasitas puncak (kWp), produksi tahunan (kWh/thn), penghematan tagihan listrik lokal, dan reduksi emisi karbon (kg CO2e/thn).',
    highlightsEn: [
      'Thermal Cell Derating: Accounts for cell temperature rise above 25°C STC using gamma = -0.0038 / °C so hot desert cities (like Dubai) reflect realistic thermal losses.',
      'System Performance Ratio (PR): Incorporates inverter efficiency (96%), DC/AC wiring losses (2%), and seasonal soiling factors (0.82 to 0.86 net PR).',
      'Localized Financial ROI: Multiplies annual kWh yield by the exact local electricity tariff and grid carbon intensity factor of the active city.',
    ],
    highlightsId: [
      'Derating Termal Sel: Memperhitungkan kenaikan suhu sel di atas 25°C STC menggunakan koefisien gamma = -0.0038 / °C sehingga kota bersuhu tinggi tercermin secara realistis.',
      'Performance Ratio Sistem (PR): Mencakup efisiensi inverter (96%), rugi kabel DC/AC (2%), dan faktor debu musiman (net PR 0,82 hingga 0,86).',
      'ROI Finansial Lokal: Mengalikan produksi kWh tahunan dengan tarif listrik lokal dan faktor intensitas karbon jaringan di kota aktif.',
    ],
    specCode: 'SOLAR_EQ :: E_annual = A_net * eta_pv(0.208) * GHI_daily * 365 * PR(0.84) * [1 + gamma*(T_cell - 25)]',
    relatedLink: {
      href: '/docs',
      labelEn: 'Review Full Physics Formulas in Docs',
      labelId: 'Lihat Rumus Fisika Lengkap di Dokumen',
    },
  },
  {
    id: 'rainwater-and-biopore-math',
    category: 'physics',
    badgeEn: '09 · DIN 1989-1 HYDROLOGY & BIOPORES',
    badgeId: '09 · HIDROLOGI DIN 1989-1 & BIOPORI',
    questionEn: 'How are rainwater harvesting volume, cistern tank size, and biopore wells calculated?',
    questionId: 'Bagaimana cara perhitungan volume panen air hujan, ukuran tangki tandon, dan jumlah sumur biopori?',
    answerEn:
      'Rainwater harvesting follows the German DIN 1989-1 standard, multiplying your effective roof catchment area by local annual precipitation (mm/yr), material runoff coefficient (psi = 0.85 for pitched tile/metal roofs), and first-flush filter efficiency (eta_filter = 0.90). For ground-level flood mitigation, Verdara applies Darcy’s Law of soil infiltration to calculate how many 10cm x 100cm organic-compost biopore shafts are needed to absorb peak monsoon runoff.',
    answerId:
      'Panen air hujan mengikuti standar Jerman DIN 1989-1, dengan mengalikan luas tangkapan atap efektif dengan curah hujan tahunan lokal (mm/thn), koefisien limpasan material (psi = 0,85 untuk atap genteng/logam), dan efisiensi filter first-flush (eta_filter = 0,90). Untuk mitigasi banjir permukaan tanah, Verdara menerapkan Hukum Infiltrasi Tanah Darcy guna menghitung jumlah lubang resapan biopori (diameter 10cm x kedalaman 100cm) yang dibutuhkan untuk menyerap limpasan hujan puncak.',
    highlightsEn: [
      'Optimal Cistern Sizing: Calculates retention tank volume (Liters or US Gallons) to buffer 21 days of peak wet-season collection without overflow.',
      'Biopore Absorption Rate: Each standard 100cm vertical biopore shaft filled with organic leaf compost infiltrates ~180 to 360 Liters/hour depending on soil permeability.',
      'Household Water Autonomy: Estimates how many days of non-potable household demand (toilet flushing, landscape irrigation, cooling) the harvested rainwater covers.',
    ],
    highlightsId: [
      'Ukuran Tangki Optimal: Menghitung volume tandon retensi (Liter atau Galon AS) untuk menampung cadangan 21 hari musim hujan puncak tanpa luapan.',
      'Laju Serapan Biopori: Setiap lubang biopori vertikal sedalam 100cm berisi kompos organik menyerap ~180 hingga 360 Liter/jam tergantung permeabilitas tanah.',
      'Kemandirian Air Rumah Tangga: Mengestimasi berapa hari kebutuhan air non-minum (penyiraman taman, pembilasan sanitasi, pendinginan) yang dapat dipenuhi.',
    ],
    specCode: 'HYDRO_EQ :: V_rain = A_catchment * P_annual_mm * psi(0.85) * eta_filter(0.90) · N_biopore = ceil(A_roof / 10)',
  },
  {
    id: 'thermal-comfort-index',
    category: 'physics',
    badgeEn: '10 · URBAN HEAT & COMFORT INDEX',
    badgeId: '10 · PULAU PANAS & INDEKS KENYAMANAN',
    questionEn: 'What does the Thermal Comfort Score (0-100) mean and how do green retrofits improve it?',
    questionId: 'Apa arti Skor Kenyamanan Termal (0-100) dan bagaimana retrofit hijau meningkatkannya?',
    answerEn:
      'The Thermal Comfort Score (0 to 100) evaluates outdoor and indoor microclimate stress based on ASHRAE 55 and ISO 7730 principles, factoring in local ambient temperature, relative humidity, solar radiation load, and urban surface albedo. When you activate rooftop solar panels (which shade the roof slab), cool-roof high-albedo coatings, and vegetated pergolas, Verdara calculates the surface temperature drop (-1.8°C to -3.2°C) and resulting HVAC cooling energy savings.',
    answerId:
      'Skor Kenyamanan Termal (0 hingga 100) mengevaluasi tingkat kenyamanan iklim mikro berdasarkan prinsip ASHRAE 55 dan ISO 7730, dengan memperhitungkan suhu udara lokal, kelembapan relatif, beban radiasi matahari, dan albedo permukaan kota. Saat Anda mengaktifkan panel surya atap (yang menaungi pelat atap), pelapis cool-roof ber-albedo tinggi, dan pergola vegetasi, Verdara menghitung penurunan suhu permukaan (-1,8°C hingga -3,2°C) beserta penghematan energi pendingin ruangan (AC).',
    highlightsEn: [
      'Photovoltaic Roof Shading: Rooftop solar arrays intercept direct solar irradiance before it heats the structural concrete or timber roof deck.',
      'Evapotranspirative Cooling: Biopore soil moisture and native canopy trees increase latent heat dissipation around the building envelope.',
      'Dynamic 3D Verification: Switching to Mode 03 (AI Solution) in the 3D stage immediately demonstrates the +6 point comfort recovery after storm and heat stress.',
    ],
    highlightsId: [
      'Penajana Surya Atap: Rangkaian panel surya menahan radiasi matahari langsung sebelum memanaskan pelat atap beton atau kayu struktural.',
      'Pendinginan Evapotranspirasi: Kelembapan tanah biopori dan kanopi pohon lokal meningkatkan pelepasan panas laten di sekitar selubung bangunan.',
      'Verifikasi 3D Dinamis: Beralih ke Mode 03 (AI Solution) di panggung 3D langsung memperlihatkan pemulihan skor kenyamanan +6 poin.',
    ],
    specCode: 'THERMAL_MODEL :: ASHRAE-55 Microclimate Index · Cool-Roof Albedo Delta (-1.8°C to -3.2°C Surface Temp)',
  },
  {
    id: 'radar-3d-map',
    category: 'three-d',
    badgeEn: '11 · 3D GEOSPATIAL RADAR & ISOCHRONES',
    badgeId: '11 · RADAR GEOSPASIAL 3D & ISOKRON',
    questionEn: 'How does the 3D Geospatial Radar locate recycling hubs, solar microgrids, and flood sensors?',
    questionId: 'Bagaimana Radar Geospasial 3D menemukan titik bank sampah, mikrogrid surya, dan sensor banjir?',
    answerEn:
      'The 3D Radar workspace (/radar) pairs a hardware-accelerated MapLibre GL 3D terrain and building extrusion map with our Haversine spatial query engine. It plots verified circular waste drop-off hubs (Bank Sampah / Municipal Material Recovery Facilities), communal solar microgrids, and flood telemetry stations around your selected city, computing exact geodesic distance (km/mi) and walking/driving travel time isochrones.',
    answerId:
      'Ruang kerja Radar 3D (/radar) memadukan peta ekstrusi bangunan 3D berbasis MapLibre GL dengan mesin kueri spasial Haversine kami. Fitur ini memetakan titik pengumpulan daur ulang terverifikasi (Bank Sampah / Fasilitas Pemulihan Material), mikrogrid surya komunal, dan stasiun telemetri banjir di sekitar kota pilihan Anda, lengkap dengan jarak geodesik presisi (km/mil) dan estimasi waktu tempuh.',
    highlightsEn: [
      'Interactive 12-Month ERA5 Rainfall & Solar GHI Bar Charts synchronized with the active radar viewport.',
      'Category filtering across Circular Waste Hubs, Solar Microgrids, Hydro Retention Basins, and Urban Cooling Corridors.',
      'Scroll-safe 3D viewport (scrollZoom disabled by default) so you can pan/rotate the 3D map without hijacking page scroll.',
    ],
    highlightsId: [
      'Grafik Batang Curah Hujan ERA5 & Radiasi Surya GHI 12-Bulan interaktif yang tersinkronisasi dengan area pandang radar aktif.',
      'Filter kategori mencakup Titik Daur Ulang Sirkular, Mikrogrid Surya, Kolam Retensi Hidro, dan Koridor Pendingin Kota.',
      'Viewport 3D ramah-scroll (scrollZoom dinonaktifkan secara default) sehingga Anda dapat menggeser peta 3D tanpa mengganggu scroll halaman.',
    ],
    specCode: 'RADAR_GIS :: MapLibre GL 3D Extrusions + Haversine Geodesic Distance + 12-Month ERA5 Telemetry',
    relatedLink: {
      href: '/radar',
      labelEn: 'Open 3D Geospatial Radar',
      labelId: 'Buka Radar Geospasial 3D',
    },
  },
  {
    id: 'field-proofs-ledger',
    category: 'database',
    badgeEn: '12 · CRYPTOGRAPHIC FIELD PROOFS',
    badgeId: '12 · BUKTI LAPANGAN KRIPTOGRAFIS',
    questionEn: 'How does the Field Proof Ledger (/academy) verify real-world environmental actions?',
    questionId: 'Bagaimana Buku Besar Bukti Lapangan (/academy) memverifikasi aksi lingkungan nyata?',
    answerEn:
      'Verdara goes beyond theoretical simulation by allowing citizens and engineers to log real-world sustainability actions in the Field Proofs workspace (/academy), such as installing a biopore well, sorting recyclable PET/aluminum, or mounting a rooftop solar module. When you submit photographic evidence, Meta SAM 3.1 verifies the physical object, calculates the exact CO2e and water impact, and records an immutable SHA-256 + 64-bit dHash perceptual receipt in the ledger.',
    answerId:
      'Verdara melampaui simulasi teoretis dengan memungkinkan warga dan insinyur mencatat aksi keberlanjutan nyata di ruang kerja Bukti Lapangan (/academy), seperti memasang sumur biopori, memilah sampah PET/aluminium, atau memasang modul surya atap. Saat Anda mengunggah bukti foto, Meta SAM 3.1 memverifikasi objek fisik tersebut, menghitung dampak CO2e dan air secara presisi, lalu mencatat tanda terima kriptografis SHA-256 + dHash 64-bit ke dalam buku besar.',
    highlightsEn: [
      '5 Structured Mission Tiers progressing from Novice Eco-Scout (Lv.1) to Principal Spatial Architect (Lv.5).',
      'Every verified action generates a tamper-evident SHA-256 verification hash and 64-bit dHash anti-replay fingerprint.',
      'Aggregates community-wide impact metrics (total kg CO2e avoided, Liters infiltrated, and circular material weight recovered).',
    ],
    highlightsId: [
      '5 Tingkatan Misi Terstruktur mulai dari Novice Eco-Scout (Lv.1) hingga Principal Spatial Architect (Lv.5).',
      'Setiap aksi terverifikasi menghasilkan hash verifikasi SHA-256 anti-manipulasi dan sidik jari anti-duplikasi dHash 64-bit.',
      'Mengagregasi metrik dampak komunitas secara menyeluruh (total kg CO2e yang dicegah, Liter air yang diresapkan, dan berat material daur ulang).',
    ],
    specCode: 'PROOF_LEDGER :: SAM 3.1 Visual Audit -> 64-Bit dHash + SHA-256 Receipt -> Relational Proof Table',
    relatedLink: {
      href: '/academy',
      labelEn: 'View Verified Field Proofs & Missions',
      labelId: 'Lihat Bukti Lapangan & Misi Terverifikasi',
    },
  },
  {
    id: 'database-architecture-v32',
    category: 'database',
    badgeEn: '13 · ENTERPRISE DATABASE SCHEMA V3.2',
    badgeId: '13 · SKEMA DATABASE ENTERPRISE V3.2',
    questionEn: 'How is Verdara’s database architected and can I inspect or export the live relational tables?',
    questionId: 'Bagaimana arsitektur database Verdara dirancang dan bisakah saya memeriksa atau mengekspor tabel relasionalnya?',
    answerEn:
      'Verdara runs on our Enterprise Relational Database Engine v3.2 (src/lib/db/verdaraDatabase.ts & /api/db), engineered with normalized relational tables, strict foreign-key integrity, and dual-layer persistence (IndexedDB / LocalStorage client state synchronized with server-side JSON-WAL snapshots). You can inspect live rows, run audit queries, and export full JSON database snapshots directly from the Documentation (/docs) or Shield (/settings) pages.',
    answerId:
      'Verdara berjalan di atas Mesin Database Relasional Enterprise v3.2 (src/lib/db/verdaraDatabase.ts & /api/db) yang dirancang dengan tabel relasional ternormalisasi, integritas kunci asing (foreign-key) ketat, dan persistensi lapis ganda (cache klien IndexedDB / LocalStorage yang disinkronkan dengan snapshot JSON-WAL sisi-server). Anda dapat memeriksa baris tabel secara langsung, menjalankan kueri audit, serta mengekspor snapshot JSON langsung dari halaman Dokumentasi (/docs) atau Shield (/settings).',
    highlightsEn: [
      'Normalized Relational Schema covering Users, Spatial Plots, SAM 3.1 Segmentation Runs, AI Council Sessions, Field Proof Ledger, and Security Audit Logs.',
      'REST API Endpoint (/api/db): Supports GET health/table inspection and POST mutations with strict schema validation.',
      '1-Click Snapshot Export: Download complete relational state as a portable JSON bundle for compliance or backup.',
    ],
    highlightsId: [
      'Skema Relasional Ternormalisasi mencakup Users, Spatial Plots, SAM 3.1 Segmentation Runs, AI Council Sessions, Field Proof Ledger, dan Security Audit Logs.',
      'Endpoint REST API (/api/db): Mendukung inspeksi kesehatan/tabel (GET) dan mutasi transaksi (POST) dengan validasi skema ketat.',
      'Ekspor Snapshot 1-Klik: Unduh seluruh state relasional sebagai bundel JSON portabel untuk audit atau pencadangan.',
    ],
    specCode: 'DB_SCHEMA_V3.2 :: Normalized Relational Tables · Foreign-Key Constraints · /api/db REST Inspector · JSON Export',
    relatedLink: {
      href: '/docs',
      labelEn: 'Inspect Live Database Schema in Docs',
      labelId: 'Periksa Skema Database Langsung di Dokumen',
    },
  },
  {
    id: 'api-credit-shield',
    category: 'security',
    badgeEn: '14 · 7-LAYER API CREDIT SHIELD',
    badgeId: '14 · PERISAI KREDIT API 7-LAPIS',
    questionEn: 'How does the 7-Layer API Credit Shield protect cloud AI budgets while keeping demos fast?',
    questionId: 'Bagaimana Perisai Kredit API 7-Lapis melindungi anggaran cloud AI sekaligus menjaga kecepatan demo?',
    answerEn:
      'Live multimodal AI calls (Meta SAM 3.1 segmentation, Muse Spark 3-agent orchestration, and Muse Image synthesis) can rapidly consume API quotas under heavy traffic or automated bot attacks. Our 7-Layer Credit Shield enforces SHA-256 request deduplication, pre-computed Golden Specimen zero-cost caching (<50ms latency at $0.00 cost), sliding-window IP rate limiting, and a hard Reserve Floor lock so evaluation judges always have guaranteed live API capacity.',
    answerId:
      'Panggilan AI multimodal langsung (segmentasi Meta SAM 3.1, orkestrasi 3-agen Muse Spark, dan sintesis Muse Image) dapat menghabiskan kuota API dengan cepat saat trafik tinggi atau terjadi serangan bot. Perisai Kredit 7-Lapis kami menerapkan deduplikasi permintaan SHA-256, cache Golden Specimen pra-komputasi (<50mdtk dengan biaya $0,00), pembatasan laju IP (rate limiting), serta penguncian Cadangan Juri agar pengujian langsung selalu terjamin.',
    highlightsEn: [
      'Layer 1 & 2 (Golden Specimen Cache & SHA-256 Deduplication): Identical photos or city prompts return verified cached tensors in under 50ms without billing the upstream API.',
      'Layer 3 & 4 (Client Compression & Token Caps): Automatically downscales oversized uploads to 1024px max dimension and caps LLM output tokens.',
      'Layer 5, 6 & 7 (Rate Limiter, Budget Reserve Lock & Deterministic Fallback): Guarantees 100% platform uptime even if external cloud endpoints are unreachable.',
    ],
    highlightsId: [
      'Lapis 1 & 2 (Cache Golden Specimen & Deduplikasi SHA-256): Foto atau prompt kota yang identik mengembalikan tensor terverifikasi dalam <50mdtk tanpa memotong kuota API.',
      'Lapis 3 & 4 (Kompresi Klien & Batas Token): Mengecilkan resolusi unggahan berlebih ke maksimal 1024px dan membatasi token keluaran LLM.',
      'Lapis 5, 6 & 7 (Rate Limiter, Kunci Cadangan Anggaran & Fallback Deterministik): Menjamin uptime platform 100% meskipun jaringan cloud eksternal sedang gangguan.',
    ],
    specCode: 'CREDIT_SHIELD :: 7 Defense Layers · SHA-256 Payload Cache · <50ms Golden Path · Zero-Downtime Fallback',
    relatedLink: {
      href: '/settings',
      labelEn: 'Inspect Live 7-Layer Shield Telemetry',
      labelId: 'Periksa Telemetri Perisai 7-Lapis',
    },
  },
  {
    id: 'cybersecurity-posture',
    category: 'security',
    badgeEn: '15 · OWASP CYBERSECURITY POSTURE',
    badgeId: '15 · KEAMANAN SIBER STANDAR OWASP',
    questionEn: 'What cybersecurity protections are built into Verdara’s frontend, API routes, and headers?',
    questionId: 'Apa saja perlindungan keamanan siber yang ditanamkan pada frontend, rute API, dan header Verdara?',
    answerEn:
      'Verdara is hardened against OWASP Top 10 web and LLM vulnerabilities. Every HTTP response is protected by strict security headers configured in next.config.ts (Content-Security-Policy, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, and Permissions-Policy). On the backend, all API routes (/api/vision/segment, /api/ai/council, /api/weather, /api/db) enforce strict payload size limits, MIME-type magic-byte checks, prompt-injection sanitization, and server-only environment variable isolation.',
    answerId:
      'Verdara diperkuat terhadap kerentanan web dan LLM OWASP Top 10. Setiap respons HTTP dilindungi oleh header keamanan ketat di next.config.ts (Content-Security-Policy, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, dan Permissions-Policy). Di sisi backend, seluruh rute API (/api/vision/segment, /api/ai/council, /api/weather, /api/db) menerapkan batas ukuran payload, pemeriksaan tipe MIME, sanitasi prompt-injection, dan isolasi kunci API di sisi server.',
    highlightsEn: [
      'Zero Client Secret Leakage: Meta AI and Open-Weight API keys are strictly accessed inside server-side route handlers and never bundled into browser JavaScript.',
      'Prompt Injection Firewall: User inputs to the AI Council are stripped of system-override tokens and bounded by strict JSON schema output contracts.',
      'Audit Trail Logging: Every authentication event, AI invocation, and rate-limit trigger is recorded in the security audit relational table.',
    ],
    highlightsId: [
      'Nol Kebocoran Kunci Klien: Kunci API Meta AI hanya diakses di dalam handler rute sisi-server dan tidak pernah dikirim ke JavaScript browser.',
      'Firewall Injeksi Prompt: Masukan pengguna ke Dewan AI dibersihkan dari instruksi pembajak sistem dan dibatasi oleh kontrak skema JSON ketat.',
      'Pencatatan Jejak Audit: Setiap aktivitas login, pemanggilan AI, dan pemicu batas laju dicatat di tabel relasional audit keamanan.',
    ],
    specCode: 'SEC_HEADERS :: CSP + X-Frame-Options: DENY + Nosniff + Prompt-Firewall + Server-Only Secret Isolation',
  },
  {
    id: 'device-responsiveness-performance',
    category: 'overview',
    badgeEn: '16 · RESPONSIVE DESIGN & 60FPS PERFORMANCE',
    badgeId: '16 · DESAIN RESPONSIF & PERFORMA 60FPS',
    questionEn: 'How does Verdara stay lightweight and responsive across mobile phones, tablets, and desktops despite heavy 3D graphics?',
    questionId: 'Bagaimana Verdara tetap ringan dan responsif di ponsel, tablet, hingga desktop meskipun memiliki banyak grafik 3D?',
    answerEn:
      'We engineered a multi-tier performance architecture so Verdara loads instantaneously and runs at a locked 60fps across all devices. The 3D Eco-District uses procedural low-poly instanced meshes with adaptive devicePixelRatio (capped at [1, 2]) rather than bloated 50MB external GLTF downloads. Furthermore, initial page rendering is completely synchronous with zero hidden opacity traps, and the layout dynamically adapts from a 4-column desktop studio to a touch-friendly mobile dock with >=44px tap targets.',
    answerId:
      'Kami merancang arsitektur performa multi-lapis agar Verdara dimuat secara instan dan berjalan mulus 60fps di semua perangkat. Distrik Ekologi 3D menggunakan mesh prosedural ringan dengan devicePixelRatio adaptif (dibatasi pada [1, 2]) tanpa unduhan file 3D eksternal berukuran puluhan megabita. Selain itu, render awal halaman berlangsung sinkron tanpa penundaan animasi tersembunyi, dan tata letak menyesuaikan secara dinamis dari studio desktop ke dok mobile yang ramah sentuhan (target sentuh >=44px).',
    highlightsEn: [
      'Zero External 3D Asset Bottlenecks: 100% procedural Three.js geometry compiles in milliseconds and uses <18MB of GPU VRAM.',
      'Synchronous Theme & Layout Initialization: Eliminates white/dark flash on refresh and renders all hero typography and 3D canvases immediately.',
      'Full Touch & Mobile Ergonomics: Drag-slide country cards, horizontal scrollable filter bars, and compact top/bottom navigation bars fit 320px to 4K screens.',
    ],
    highlightsId: [
      'Tanpa Bottleneck Aset 3D Eksternal: Geometri Three.js 100% prosedural dikompilasi dalam milidetik dan menggunakan <18MB VRAM GPU.',
      'Inisialisasi Tema & Tata Letak Sinkron: Menghilangkan kedipan layar saat refresh dan menampilkan tipografi serta kanvas 3D secara langsung.',
      'Ergonomi Sentuh & Mobile Penuh: Kartu negara yang dapat digeser (drag-slide), bilah filter responsif, dan navigasi ringkas mendukung layar 320px hingga 4K.',
    ],
    specCode: 'PERF_BUDGET :: <18MB WebGL VRAM · Adaptive DPR [1, 2] · Zero Opacity Delay · 320px-4K Responsive Grid',
  },
];

export default function FaqPage() {
  const { locale, setLocale, units, setUnits, theme, setTheme, isAuthenticated } = useVerdaraStore();
  const isId = locale === 'id';
  const isLight = theme === 'light';

  const [activeCategory, setActiveCategory] = useState<'all' | FaqItem['category']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<string[]>([
    'what-is-verdara',
    'three-d-district-modes',
    'meta-sam-vision-lens',
    'solar-physics-math',
  ]);

  const toggleFaq = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const expandAll = () => {
    setOpenIds(FAQ_ITEMS.map((item) => item.id));
  };

  const collapseAll = () => {
    setOpenIds([]);
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCat = activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.questionEn.toLowerCase().includes(q) ||
        item.questionId.toLowerCase().includes(q) ||
        item.answerEn.toLowerCase().includes(q) ||
        item.answerId.toLowerCase().includes(q) ||
        item.badgeEn.toLowerCase().includes(q) ||
        item.specCode.toLowerCase().includes(q) ||
        item.highlightsEn.some((h) => h.toLowerCase().includes(q)) ||
        item.highlightsId.some((h) => h.toLowerCase().includes(q))
      );
    });
  }, [activeCategory, searchQuery]);

  const categories: { id: 'all' | FaqItem['category']; labelEn: string; labelId: string; count: number }[] = [
    { id: 'all', labelEn: 'All Questions', labelId: 'Semua Pertanyaan', count: FAQ_ITEMS.length },
    {
      id: 'overview',
      labelEn: 'Overview & Global Cities',
      labelId: 'Gambaran & Kota Global',
      count: FAQ_ITEMS.filter((i) => i.category === 'overview').length,
    },
    {
      id: 'three-d',
      labelEn: '3D District & Radar',
      labelId: 'Distrik 3D & Radar',
      count: FAQ_ITEMS.filter((i) => i.category === 'three-d').length,
    },
    {
      id: 'ai',
      labelEn: 'Meta AI Stack',
      labelId: 'Teknologi Meta AI',
      count: FAQ_ITEMS.filter((i) => i.category === 'ai').length,
    },
    {
      id: 'physics',
      labelEn: 'Solar & Water Math',
      labelId: 'Fisika Surya & Air',
      count: FAQ_ITEMS.filter((i) => i.category === 'physics').length,
    },
    {
      id: 'database',
      labelEn: 'Database v3.2 & Proofs',
      labelId: 'Database v3.2 & Bukti',
      count: FAQ_ITEMS.filter((i) => i.category === 'database').length,
    },
    {
      id: 'security',
      labelEn: 'Login & Cybersecurity',
      labelId: 'Login & Keamanan Siber',
      count: FAQ_ITEMS.filter((i) => i.category === 'security').length,
    },
  ];

  // Crisp editorial surface tokens matching the previous clean layout style across Day & Night modes
  const heroBg = isLight
    ? 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(244,247,244,0.92))'
    : 'linear-gradient(135deg, rgba(20,24,22,0.96), rgba(14,17,16,0.94))';
  const cardSurface = isLight ? '#ffffff' : '#141816';
  const cardSubtleBg = isLight ? '#f6f8f6' : '#0f1210';
  const borderHairline = isLight ? 'rgba(17,19,21,0.1)' : 'rgba(255,255,255,0.1)';
  const borderEmerald = isLight ? '#16804a' : '#10b981';
  const textPrimary = isLight ? '#111315' : '#f3f5f4';
  const textSecondary = isLight ? '#374151' : '#cbd5e1';
  const textMuted = isLight ? '#64748b' : '#94a3b8';
  const emeraldBgSoft = isLight ? 'rgba(22,128,74,0.1)' : 'rgba(16,185,129,0.14)';
  const emeraldBorderSoft = isLight ? 'rgba(22,128,74,0.28)' : 'rgba(16,185,129,0.32)';
  const emeraldText = isLight ? '#136f40' : '#34d399';

  return (
    <div
      className={`min-h-screen pb-32 transition-colors duration-200 ${
        isLight ? 'bg-[#f5f5f3] text-[#111111]' : 'bg-[#0b0c0e] text-[#f2f1ec]'
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
                  FAQ &amp; Platform Guide
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
              {isId ? 'Beranda' : 'Overview'}
            </Link>
            <Link
              href="/docs"
              className="rounded-full px-3.5 py-1.5 text-xs font-medium opacity-75 transition hover:opacity-100"
            >
              {isId ? 'Dokumen Teknis' : 'Documentation'}
            </Link>
            <Link
              href="/faq"
              className="rounded-full bg-[#08090c] px-3.5 py-1.5 text-xs font-semibold text-[#c6f432]"
            >
              FAQ
            </Link>
            <Link
              href={isAuthenticated ? '/dashboard' : '/login?next=/dashboard'}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium opacity-75 transition hover:opacity-100"
            >
              {isId ? 'Studio 3D' : '3D Studio'}
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setLocale(isId ? 'en' : 'id')}
              className="min-h-[40px] cursor-pointer rounded-full border border-current/15 px-3 font-mono text-xs font-semibold"
            >
              {locale.toUpperCase()}
            </button>
            <button
              type="button"
              onClick={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
              className="hidden min-h-[40px] cursor-pointer items-center rounded-full border border-current/15 px-3 font-mono text-xs sm:inline-flex"
            >
              {units === 'metric' ? 'm² / L' : 'ft² / gal'}
            </button>
            <button
              type="button"
              onClick={() => setTheme(isLight ? 'dark' : 'light')}
              className="min-h-[40px] cursor-pointer rounded-full border border-current/15 px-3 font-mono text-xs"
            >
              {isLight ? '☀ Day' : '☾ Night'}
            </button>
            <Link
              href={isAuthenticated ? '/dashboard' : '/login?next=/dashboard'}
              className="zeggo-btn flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#08090c] px-4 text-xs font-semibold text-[#c6f432]"
            >
              <ZeggoRollText
                text={
                  isAuthenticated
                    ? isId
                      ? 'Buka Studio ↗'
                      : 'Open Studio ↗'
                    : isId
                      ? 'Login Studio →'
                      : 'Sign In →'
                }
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-4 sm:px-6 pt-6 sm:pt-8">
        {/* Clean Editorial Hero Card (Restored Previous Design Style + Upgraded Detail) */}
        <section
          className="rounded-[24px] p-6 sm:p-10 mb-8 relative overflow-hidden"
          style={{
            background: heroBg,
            border: `1px solid ${borderHairline}`,
            boxShadow: isLight
              ? '0 20px 50px -24px rgba(17, 19, 21, 0.08)'
              : '0 24px 60px -28px rgba(0, 0, 0, 0.65)',
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider"
                  style={{
                    background: emeraldBgSoft,
                    color: emeraldText,
                    border: `1px solid ${emeraldBorderSoft}`,
                  }}
                >
                  VERDARA FAQ · V3.2
                </span>
                <span
                  className="px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider"
                  style={{
                    background: cardSubtleBg,
                    color: textSecondary,
                    border: `1px solid ${borderHairline}`,
                  }}
                >
                  {isId
                    ? 'PANDUAN LENGKAP & SPESIFIKASI TEKNIS WEBSITE'
                    : 'COMPREHENSIVE PLATFORM & ENGINEERING GUIDE'}
                </span>
              </div>

              <h1
                className="font-bold tracking-[-0.03em] leading-[1.08] mb-3"
                style={{
                  fontSize: 'clamp(1.85rem, 3.8vw, 3rem)',
                  fontFamily: 'var(--font-display)',
                  color: textPrimary,
                }}
              >
                {isId
                  ? 'Pertanyaan Umum & Panduan Lengkap Verdara.'
                  : 'Frequently Asked Questions & Platform Guide.'}
              </h1>

              <p
                className="text-sm sm:text-base leading-relaxed"
                style={{ color: textSecondary }}
              >
                {isId
                  ? 'Penjelasan menyeluruh, terstruktur, dan mendalam tentang cara kerja Verdara: mulai dari simulasi Distrik Ekologi 3D, visi spasial Meta SAM 3.1, orkestrasi 3-Agen Muse Spark, rumus fisika surya NREL PVWatts v8 & hidrologi DIN 1989-1, skema Database Relasional v3.2, hingga standar keamanan siber OWASP.'
                  : 'Clear, structured, and authoritative answers explaining every subsystem of Verdara: from the interactive 3D Living Eco-District and Meta SAM 3.1 vision pipeline to Muse Spark 3-agent reasoning, NREL PVWatts v8 solar physics, DIN 1989-1 hydrology, Enterprise Database v3.2, and OWASP cybersecurity.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={expandAll}
                className="px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer min-h-[44px]"
                style={{
                  background: cardSurface,
                  color: textPrimary,
                  border: `1px solid ${borderHairline}`,
                }}
              >
                {isId ? 'Buka Semua Jawaban' : 'Expand All Answers'}
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer min-h-[44px]"
                style={{
                  background: cardSubtleBg,
                  color: textSecondary,
                  border: `1px solid ${borderHairline}`,
                }}
              >
                {isId ? 'Tutup Semua' : 'Collapse All'}
              </button>
            </div>
          </div>

          {/* Quick Architecture Telemetry Strip */}
          <div
            className="mt-6 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-3"
            style={{ borderTop: `1px solid ${borderHairline}` }}
          >
            {[
              {
                labelEn: 'DOCUMENTED TOPICS',
                labelId: 'TOPIK TERDOKUMENTASI',
                valueEn: '16 Deep Q&As',
                valueId: '16 Q&A Mendalam',
                subEn: '6 Engineering Domains',
                subId: '6 Domain Rekayasa',
              },
              {
                labelEn: 'GLOBAL COVERAGE',
                labelId: 'CAKUPAN GLOBAL',
                valueEn: '195+ Countries',
                valueId: '195+ Negara',
                subEn: 'ERA5 + NASA POWER GHI',
                subId: 'ERA5 + NASA POWER GHI',
              },
              {
                labelEn: 'AI & PHYSICS ENGINE',
                labelId: 'MESIN AI & FISIKA',
                valueEn: 'SAM 3.1 + Muse Spark',
                valueId: 'SAM 3.1 + Muse Spark',
                subEn: 'NREL PVWatts v8 + DIN 1989-1',
                subId: 'NREL PVWatts v8 + DIN 1989-1',
              },
              {
                labelEn: 'SECURITY & DB STATE',
                labelId: 'KEAMANAN & DATABASE',
                valueEn: '7-Layer Shield',
                valueId: 'Perisai 7-Lapis',
                subEn: 'Relational Schema v3.2',
                subId: 'Skema Relasional v3.2',
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="rounded-2xl px-4 py-3"
                style={{
                  background: cardSurface,
                  border: `1px solid ${borderHairline}`,
                }}
              >
                <div
                  className="text-[10px] font-mono uppercase tracking-wider mb-0.5"
                  style={{ color: textMuted }}
                >
                  {isId ? stat.labelId : stat.labelEn}
                </div>
                <div className="text-sm sm:text-base font-bold" style={{ color: textPrimary }}>
                  {isId ? stat.valueId : stat.valueEn}
                </div>
                <div className="text-[11px] font-mono" style={{ color: emeraldText }}>
                  {isId ? stat.subId : stat.subEn}
                </div>
              </div>
            ))}
          </div>

          {/* Search & Category Filter Bar */}
          <div
            className="mt-5 pt-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
            style={{ borderTop: `1px solid ${borderHairline}` }}
          >
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              {categories.map((cat) => {
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className="px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[40px] flex items-center gap-1.5"
                    style={{
                      background: active ? borderEmerald : cardSurface,
                      color: active ? '#ffffff' : textSecondary,
                      border: `1px solid ${active ? borderEmerald : borderHairline}`,
                    }}
                  >
                    <span>{isId ? cat.labelId : cat.labelEn}</span>
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
                      style={{
                        background: active
                          ? 'rgba(255,255,255,0.22)'
                          : isLight
                            ? 'rgba(17,19,21,0.06)'
                            : 'rgba(255,255,255,0.08)',
                        color: active ? '#ffffff' : textMuted,
                      }}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative min-w-[260px] sm:min-w-[300px]">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isId
                    ? 'Cari topik, rumus, SAM 3.1, 3D, biopori...'
                    : 'Search topics, formulas, SAM 3.1, 3D, biopores...'
                }
                aria-label={isId ? 'Cari pertanyaan FAQ' : 'Search FAQ questions'}
                className="w-full px-4 py-2.5 rounded-full text-xs outline-none transition-all min-h-[42px]"
                style={{
                  background: cardSurface,
                  color: textPrimary,
                  border: `1px solid ${borderHairline}`,
                }}
              />
            </div>
          </div>
        </section>

        {/* Accordion List (Clean Editorial Rounded Cards with Detailed Breakdown) */}
        <section className="space-y-3.5">
          {filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            const highlights = isId ? faq.highlightsId : faq.highlightsEn;

            return (
              <article
                key={faq.id}
                className="rounded-[20px] transition-all overflow-hidden"
                style={{
                  background: cardSurface,
                  border: `1px solid ${isOpen ? borderEmerald : borderHairline}`,
                  boxShadow: isOpen
                    ? isLight
                      ? '0 14px 34px -18px rgba(22, 128, 74, 0.18)'
                      : '0 16px 38px -18px rgba(16, 185, 129, 0.22)'
                    : 'none',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-1.5 pr-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider"
                        style={{
                          background: isOpen ? emeraldBgSoft : cardSubtleBg,
                          color: isOpen ? emeraldText : textMuted,
                          border: `1px solid ${isOpen ? emeraldBorderSoft : borderHairline}`,
                        }}
                      >
                        {isId ? faq.badgeId : faq.badgeEn}
                      </span>
                    </div>
                    <h2
                      className="text-base sm:text-lg font-bold leading-snug"
                      style={{
                        fontFamily: 'var(--font-display)',
                        color: textPrimary,
                      }}
                    >
                      {isId ? faq.questionId : faq.questionEn}
                    </h2>
                  </div>

                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-mono font-bold transition-transform mt-0.5"
                    style={{
                      background: isOpen ? borderEmerald : cardSubtleBg,
                      color: isOpen ? '#ffffff' : textPrimary,
                      border: `1px solid ${isOpen ? borderEmerald : borderHairline}`,
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div
                    className="px-5 sm:px-6 pb-6 pt-3 text-sm leading-relaxed space-y-4"
                    style={{
                      color: textSecondary,
                      borderTop: `1px solid ${borderHairline}`,
                    }}
                  >
                    {/* Main Executive Explanation */}
                    <p className="text-sm sm:text-[15px] leading-relaxed" style={{ color: textSecondary }}>
                      {isId ? faq.answerId : faq.answerEn}
                    </p>

                    {/* Structured Key Technical Points */}
                    <div
                      className="rounded-2xl p-4 sm:p-5 space-y-2.5"
                      style={{
                        background: cardSubtleBg,
                        border: `1px solid ${borderHairline}`,
                      }}
                    >
                      <div
                        className="text-[11px] font-mono font-bold uppercase tracking-wider"
                        style={{ color: emeraldText }}
                      >
                        {isId
                          ? 'POIN TEKNIS & MEKANISME UTAMA:'
                          : 'KEY TECHNICAL MECHANISMS & SPECIFICATIONS:'}
                      </div>
                      <ul className="space-y-2">
                        {highlights.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                            <span
                              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-mono font-bold mt-0.5"
                              style={{
                                background: emeraldBgSoft,
                                color: emeraldText,
                                border: `1px solid ${emeraldBorderSoft}`,
                              }}
                            >
                              {idx + 1}
                            </span>
                            <span style={{ color: textPrimary }}>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Specification / Formula Bar + Action Link */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div
                        className="px-3.5 py-2 rounded-xl text-[11px] font-mono overflow-x-auto"
                        style={{
                          background: isLight ? 'rgba(17,19,21,0.04)' : 'rgba(255,255,255,0.04)',
                          color: textMuted,
                          border: `1px solid ${borderHairline}`,
                        }}
                      >
                        {faq.specCode}
                      </div>

                      {faq.relatedLink && (
                        <Link
                          href={faq.relatedLink.href}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all self-start sm:self-auto"
                          style={{
                            background: emeraldBgSoft,
                            color: emeraldText,
                            border: `1px solid ${emeraldBorderSoft}`,
                          }}
                        >
                          <span>{isId ? faq.relatedLink.labelId : faq.relatedLink.labelEn}</span>
                          <span aria-hidden="true">→</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div
              className="rounded-[20px] p-10 text-center"
              style={{
                background: cardSurface,
                border: `1px solid ${borderHairline}`,
              }}
            >
              <p className="text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                {isId
                  ? 'Tidak ada pertanyaan yang cocok dengan pencarian Anda.'
                  : 'No questions matched your search query.'}
              </p>
              <p className="text-xs mb-4" style={{ color: textMuted }}>
                {isId
                  ? 'Coba kata kunci lain seperti "SAM 3.1", "PVWatts", "Biopori", "3D", atau reset filter kategori.'
                  : 'Try another keyword like "SAM 3.1", "PVWatts", "Biopore", "3D", or reset the category filter.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-full text-xs font-semibold cursor-pointer"
                style={{
                  background: borderEmerald,
                  color: '#ffffff',
                }}
              >
                {isId ? 'Tampilkan Semua Pertanyaan' : 'Show All Questions'}
              </button>
            </div>
          )}
        </section>

        {/* Bottom CTA Card (Restored Clean Editorial Style) */}
        <section
          className="mt-10 rounded-[24px] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{
            background: cardSurface,
            border: `1px solid ${borderHairline}`,
          }}
        >
          <div>
            <h3
              className="text-lg font-bold mb-1"
              style={{ fontFamily: 'var(--font-display)', color: textPrimary }}
            >
              {isId
                ? 'Butuh Spesifikasi Teknis & Inspeksi Database?'
                : 'Need Deeper Engineering Specifications & Live DB Inspection?'}
            </h3>
            <p className="text-xs sm:text-sm" style={{ color: textSecondary }}>
              {isId
                ? 'Buka halaman Dokumentasi Teknis (/docs) untuk melihat diagram arsitektur, rumus fisika lengkap, kontrak endpoint REST API, dan tabel database relasional v3.2 secara langsung.'
                : 'Open the Technical Documentation (/docs) to inspect system architecture blueprints, full mathematical equations, REST API contracts, and live Database v3.2 relational tables.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/docs"
              className="px-5 py-2.5 rounded-full text-xs font-semibold transition-all min-h-[44px] inline-flex items-center"
              style={{
                background: borderEmerald,
                color: '#ffffff',
              }}
            >
              {isId ? 'Buka Dokumen Teknis (/docs) →' : 'Open Technical Docs (/docs) →'}
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-full text-xs font-semibold transition-all min-h-[44px] inline-flex items-center"
              style={{
                background: cardSubtleBg,
                color: textPrimary,
                border: `1px solid ${borderHairline}`,
              }}
            >
              {isId ? 'Masuk ke Studio 3D' : 'Enter 3D Studio'}
            </Link>
          </div>
        </section>
      </main>

      <VerdaraBottomDock />
    </div>
  );
}
