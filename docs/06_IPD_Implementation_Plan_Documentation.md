# 6. IPD — Implementation Plan Documentation
**Project Name:** Verdara (*Spatial Intelligence for Sustainable Living & Resilient Homes*)  
**Workspace Directory:** `d:\Meta-Hackathon`  
**Build Window:** October 28 – November 4, 2026 (7 Days to Final Submission)  
**Version:** 3.0 (Final Pre-Build Lock — Zero Blender, Single `META_API_KEY`)

---

## 1. Struktur Direktori Repositori Lengkap (`d:\Meta-Hackathon`)

Seluruh kode aplikasi akan diorganisasikan secara modular di dalam repositori tunggal Next.js 15 App Router:

```text
d:\Meta-Hackathon/
├── public/
│   ├── samples/                          # 6 Foto Sampel Lens & 4 Foto Sampel Proof (Milik Sendiri/CC0)
│   └── og-verdara.png                    # OpenGraph Preview Image untuk X (Twitter) & Cerebral Valley
├── supabase/
│   ├── migrations/
│   │   └── 0001_verdara_schema.sql       # DDL 18 Tabel, PostGIS, RLS, & Fungsi Atomik Credit Shield
│   └── seed.sql                          # Data 12 Negara, 13 Material EPA WARM, 12 Lesson, & Golden Cache
├── messages/
│   ├── en.json                           # Kamus Bahasa Inggris (Default)
│   └── id.json                           # Kamus Bahasa Indonesia
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx                # Root Provider (Theme, NextIntl, GeoContext Store)
│   │   │   ├── page.tsx                  # S01: Biophilic 3D Landing Page
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx        # S02: Split-Screen Login + 1-Click Judge Demo Button
│   │   │   │   ├── register/page.tsx     # S02B: Sign Up
│   │   │   │   └── onboarding/page.tsx   # S03: 1-Step Geo & Köppen Biome Setup
│   │   │   └── (studio)/
│   │   │       ├── layout.tsx            # Protected Studio Shell (Top Telemetry Bar + Left HUD Dock)
│   │   │       ├── dashboard/page.tsx    # S04: Command Center & Pure-Code 3D Eco-Island
│   │   │       ├── lens/page.tsx         # S05: Omni-Spatial Lens (SAM 3.1 + Muse Spark + Muse Image)
│   │   │       ├── radar/page.tsx        # S06: Global 3D Radar & Housing Footprint Calculator
│   │   │       ├── council/page.tsx      # S07: The Verdara Council Multi-Agent Room
│   │   │       ├── academy/page.tsx      # S08: Verifiable Field-Action Academy (SAM 3.1 Proof)
│   │   │       └── settings/page.tsx     # S09: Locale, Units, Theme & AI Credit Shield Monitor
│   │   └── api/
│   │       ├── auth/judge/route.ts       # POST: Provisioning Akun Ephemeral Juri (< 3 dtk)
│   │       ├── geo/
│   │       │   ├── context/route.ts      # GET: ERA5 Köppen + Musim + Country Policy
│   │       │   ├── search/route.ts       # GET: Photon Autocomplete Proxy
│   │       │   ├── hubs/route.ts         # GET: Overpass OSM Recycling Hubs + Radius Adaptif
│   │       │   ├── building/route.ts     # GET: Footprint Atap OSM + Luas @turf/area
│   │       │   └── weather/route.ts      # GET: Cuaca Real-Time + AQI + Sunrise/Sunset
│   │       ├── lens/
│   │       │   ├── scan/route.ts         # POST (SSE): Muse Spark Detect -> SAM 3.1 Masks -> Valuation
│   │       │   └── retrofit/route.ts     # POST: Muse Image / Wonder Before/After Eco-Retrofit
│   │       ├── council/route.ts          # POST (SSE): 3 Agen Spesialis + Number Validator + Blueprint
│   │       ├── academy/
│   │       │   ├── quiz/route.ts         # POST: Validasi Kuis Prasyarat
│   │       │   ├── proof/route.ts        # POST: 64-bit dHash Anti-Cheat + SAM 3.1 Proof Verification
│   │       │   └── generate/route.ts     # POST: Konversi Action Blueprint menjadi Track Kustom
│   │       ├── cron/cleanup-judges/route.ts # POST: Pembersih otomatis akun juri > 7 hari
│   │       └── health/route.ts           # GET: Health Check Status DB & Credit Shield
│   ├── components/
│   │   ├── three/
│   │   │   ├── EcoIslandCanvas.tsx       # Kanvas Utama @react-three/fiber (100% Pure Code, 0 Blender)
│   │   │   ├── ProceduralIslandBase.tsx  # Geometri Heksagonal Berlapis + Air Beriak
│   │   │   ├── ProceduralEcoHome.tsx     # Rumah + Panel Surya + Tangki Air Hujan + Biopori
│   │   │   └── ProceduralBiomeFlora.tsx  # Pohon & Vegetasi Dinamis sesuai 6 Biome Köppen
│   │   ├── radar/
│   │   │   ├── Radar3DMap.tsx            # MapLibre GL JS (pitch 55) + Deck.gl ArcLayer
│   │   │   └── HousingCalcDrawer.tsx     # Panel Kalkulator Surya, Air Hujan, Biopori & TCI
│   │   ├── lens/
│   │   │   ├── SpatialMaskViewer.tsx     # Overlay Poligon SVG SAM 3.1 + X-Ray Wireframe Slider
│   │   │   ├── BeforeAfterCurtain.tsx    # Slider Perbandingan Foto Asli vs Eco-Retrofit Muse Image
│   │   │   └── ShareableCardModal.tsx    # Generator Kartu PNG Viral untuk X (@xFalzs)
│   │   └── ui/                           # Komponen Biophilic HUD (TopTelemetryBar, LeftDock, GlassCard)
│   └── lib/
│       ├── science/
│       │   ├── koppen.ts                 # Algoritma Köppen–Geiger (Peel et al., 2007)
│       │   ├── calculator.ts             # Rumus Surya PVWatts, Air Hujan, Biopori & TCI
│       │   ├── valuation.ts              # Kalkulator Deposit Negara (CRV/Pfand/Bank Sampah) & EPA WARM
│       │   └── units.ts                  # Konversi Metric/Imperial & Intl.NumberFormat
│       ├── meta/
│       │   ├── client.ts                 # Unified Meta Model API Adapter (Spark, SAM 3.1, Image, Voice)
│       │   ├── shield.ts                 # 7-Layer AI Credit Shield & Judge Reserve Pool ($35)
│       │   ├── prompts.ts                # Kontrak System Prompt Terkunci
│       │   ├── schemas.ts                # Skema Zod untuk Output AI
│       │   └── golden-cache.ts           # Pre-Computed Golden Demo Fixtures ($0 API Cost)
│       ├── lens/
│       │   ├── masks.ts                  # Normalisasi Poligon SAM 3.1, RDP Simplification & IoU Dedupe
│       │   └── dhash.ts                  # 64-bit Perceptual Difference Hash via sharp
│       └── supabase/
│           ├── client.ts                 # Browser Supabase Client
│           ├── server.ts                 # Server Cookie Supabase Client
│           ├── admin.ts                  # Service Role Client (server-only)
│           └── local-fallback.ts         # Local In-Memory/Storage Adapter (Agar jalan sebelum DB siap)
└── tests/
    ├── unit/                             # Vitest: koppen.test.ts, calculator.test.ts, valuation.test.ts, masks.test.ts
    └── e2e/                              # Playwright: judge-journey.spec.ts + axe-core a11y
```

---

## 2. Urutan Fase Eksekusi Pembangunan (6 Fase Terukur: 28 Okt – 4 Nov 2026)

Setiap fase dirancang menghasilkan **fitur yang langsung bisa dijalankan dan diklik di browser (`localhost:3000`)**, dilengkapi **Local Fallback Mode** sehingga kita tidak pernah terhambat meskipun API Key belum dimasukkan di awal.

### 🏗️ Fase 1 — Fondasi, Sistem Desain Biophilic HUD & Pure-Code 3D Eco-Island
* **Target Waktu**: Rabu, 28 Oktober 2026
* **Kebutuhan API Key**: **Tidak butuh sama sekali (`0 API Key`)**.
* **Daftar Tugas**:
  1. **`T1.1`**: Inisialisasi Next.js 15 + TypeScript + Tailwind CSS v4 + `next-intl` (`EN`/`ID`) + konfigurasi font (`Fraunces`, `Plus Jakarta Sans`, `JetBrains Mono`) dan token warna Dual-Theme (*Botanical Daylight* `#F6F5F0` & *Bioluminescent Canopy* `#08100C`).
  2. **`T1.2`**: Bangun komponen **Pure-Code 3D Eco-Island (`<EcoIslandCanvas />`)** menggunakan `@react-three/fiber` & `@react-three/drei` (pulau heksagonal 3 lapis, cincin air animasi, rumah modular, panel surya atap, tangki air hujan, turbin angin, vegetasi 6 biome Köppen, pencahayaan siang/malam, dan *Floating 3D Telemetry Pills*).
  3. **`T1.3`**: Bangun **Biophilic 3D Landing Page (`S01`)** dan **Protected Studio Shell** (Top Telemetry Bar + Left Navigation Dock + **Command Center Dashboard `S04`**).
* **Definisi Selesai Fase 1**: `npm run dev` berjalan mulus di `localhost:3000`, pulau 3D bisa diputar 60 FPS, bisa berganti biome iklim (`Tropical`, `Arid`, `Temperate`, dll.), berganti tema Siang/Malam, dan berganti bahasa `EN`/`ID`.

---

### 🔐 Fase 2 — Mesin Sains Deterministik, Database Supabase, Auth & `1-Click Judge Login`
* **Target Waktu**: Kamis, 29 Oktober 2026
* **Kebutuhan API Key**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` *(plus Local Fallback Store otomatis jika sedang offline)*.
* **Daftar Tugas**:
  1. **`T2.1`**: Implementasi modul sains murni (`koppen.ts`, `calculator.ts`, `valuation.ts`, `units.ts`) beserta *unit test* **Vitest** untuk membuktikan kecocokan 100% dengan tabel referensi *Golden Values*.
  2. **`T2.2`**: Tulis file migrasi SQL (`0001_verdara_schema.sql`) dan data awal (`seed.sql`: 12 negara, 13 kode material EPA WARM, 4 track Academy, dan Golden Demo Cache).
  3. **`T2.3`**: Bangun halaman **Split-Screen Login/Register (`S02`)**, **Onboarding Lokasi (`S03`)**, dan endpoint **`POST /api/auth/judge`** untuk fitur **`🔑 1-Click Judge Demo Login`** (Menlo Park, Level 5).
* **Definisi Selesai Fase 2**: Klik tombol *1-Click Judge Demo Login* langsung membuat sesi juri Level 5 dan semua unit test Vitest pada rumus fisika/iklim berstatus `PASS`.

---

### 🌍 Fase 3 — Global 3D Radar, Open-Meteo ERA5 & Deterministic Housing Calculator
* **Target Waktu**: Jumat, 30 Oktober 2026
* **Kebutuhan API Key**: **Tidak butuh API Key berbayar** (OpenFreeMap, Open-Meteo ERA5, Photon, Nominatim, & Overpass OSM semuanya 100% gratis).
* **Daftar Tugas**:
  1. **`T3.1`**: Implementasi endpoint geospasial `/api/geo/context`, `/api/geo/search`, `/api/geo/hubs`, `/api/geo/building`, dan `/api/geo/weather` lengkap dengan caching grid $0.25^\circ$.
  2. **`T3.2`**: Bangun halaman **Global 3D Radar (`S06`)** dengan `MapLibre GL JS` (ekstrusi bangunan 3D `pitch: 55°`) + `Deck.gl ArcLayer` (busur rute 3D bercahaya ke pusat daur ulang terdekat) + **5 City Teleport Chips** (`San Francisco`, `London`, `Tokyo`, `Dubai`, `Yogyakarta`).
  3. **`T3.3`**: Bangun drawer **Deterministic Housing Footprint Calculator** dengan fitur klik atap bangunan, slider *Editable Assumptions* real-time (`< 50 ms`), dan tombol simpan ke pulau 3D.
* **Definisi Selesai Fase 3**: Klik chip *Teleport* menerbangkan kamera ke 5 kota dunia, menampilkan gedung 3D, mencari *Recycling Hub* asli di sekitar lokasi, dan menghitung potensi kWh surya serta liter air hujan secara akurat.

---

### 🎯 Fase 4 — 7-Layer AI Credit Shield & Omni-Spatial Lens (`SAM 3.1` + `Muse Spark` + `Muse Image`)
* **Target Waktu**: Sabtu – Minggu, 31 Oktober – 1 November 2026
* **Kebutuhan API Key**: **`META_API_KEY`** (dari kredit \$150 `dev.meta.ai` dengan Spend Limit \$140 dipasang di dashboard Billing Meta).
* **Daftar Tugas**:
  1. **`T4.1`**: Bangun `src/lib/meta/shield.ts` & `client.ts` (**7-Layer AI Credit Shield**: hash `SHA-256` + `dHash` 64-bit, kompresi gambar `1280 px` via `sharp`, batas fan-out 5 konsep SAM 3.1, kuota user, concurrency lock, dan **Judge Reserve Pool \$35**).
  2. **`T4.2`**: Implementasi pipeline `POST /api/lens/scan` (SSE): deteksi konsep via **Muse Spark** $\rightarrow$ segmentasi poligon paralel via **SAM 3.1** $\rightarrow$ deduplikasi IoU $\rightarrow$ valuasi deterministik lokal & resep *upcycling*.
  3. **`T4.3`**: Implementasi `POST /api/lens/retrofit` menggunakan **Muse Image / Muse Wonder** untuk transformasi arsitektur hijau *Before/After* sesuai biome Köppen.
  4. **`T4.4`**: Bangun antarmuka **Omni-Spatial Lens (`S05`)** lengkap dengan overlay poligon SVG interaktif, **X-Ray Wireframe Slider**, **Before/After Curtain Slider**, **6 Foto Sampel Golden Demo (\$0 cost)**, input suara **Muse Voice Transcribe**, dan **Modal Export Kartu Viral untuk X**.
* **Definisi Selesai Fase 4**: Baik menggunakan 6 foto sampel (instan `< 200 ms`, \$0) maupun upload foto baru, poligon SAM 3.1, nilai uang lokal, dan visualisasi *Before/After Eco-Retrofit* tampil tajam beserta *Live Telemetry Strip*.

---

### 🤖 Fase 5 — The Verdara Council Multi-Agent & Verifiable Field-Action Academy
* **Target Waktu**: Senin, 2 November 2026
* **Daftar Tugas**:
  1. **`T5.1`**: Implementasi `POST /api/council` (SSE) yang menjalankan 3 agen spesialis (**Flora**, **Arka**, **Sirkula**) di atas **Muse Spark / Muse Spark Open**, dilengkapi **Deterministic Number Validator** terhadap `site_brief` dan sintesis JSON **Action Blueprint**.
  2. **`T5.2`**: Bangun halaman **The Verdara Council (`S07`)** dengan streaming teks real-time per agen, matriks Action Blueprint, dan tombol konversi menjadi Track Academy.
  3. **`T5.3`**: Implementasi `POST /api/academy/quiz` & `POST /api/academy/proof` (anti-duplikat `dHash` 64-bit + verifikasi poligon konsep wajib via **SAM 3.1**) serta antarmuka **Verifiable Field-Action Academy (`S08`)** yang langsung menumbuhkan struktur baru di **3D Eco-Island**.
* **Definisi Selesai Fase 5**: Alur penuh dari pilih bangunan di Radar $\rightarrow$ panggil Council $\rightarrow$ dapatkan Action Blueprint $\rightarrow$ verifikasi foto bukti aksi dengan SAM 3.1 $\rightarrow$ pulau 3D naik level berjalan tanpa celah.

---

### 🚀 Fase 6 — End-to-End QA, Deploy Vercel Production & Final Submission
* **Target Waktu**: Selasa – Rabu, 3 – 4 November 2026 *(Batas Akhir: Rabu, 4 Nov pukul 21:00 EST / Kamis, 5 Nov pukul 09:00 WIB)*
* **Daftar Tugas**:
  1. **`T6.1`**: Jalankan seluruh pengujian otomatis: Vitest unit tests, pemeriksaan kebocoran secret di bundle `.next/static`, E2E Playwright pada 5 alur juri, dan audit aksesibilitas `axe-core`.
  2. **`T6.2`**: Push kode ke repository GitHub **Public** (`xFalzz/verdara`), deploy ke **Vercel Production**, dan verifikasi sisa kredit Meta API ($\ge \$35$ utuh di *Judge Reserve Pool*).
  3. **`T6.3`**: Tulis `README.md` berstandar pemenang (mencantumkan *100% New Hackathon Work Declaration*, diagram arsitektur, tabel rumus deterministik, dan link live demo).
  4. **`T6.4`**: Rekam video demo $\le 3\text{ menit}$ (1080p 60fps), unggah video + kartu *Before/After* ke X (`@xFalzs`) untuk kategori **\$20K Most Viral Project**, dan kirimkan formulir final di portal **Cerebral Valley**.

---

## 3. Checklist Verifikasi Akhir Sebelum Submit (Definition of Done)

- [ ] **Kepatuhan Aturan**: Repository berstatus **Public**, 100% kode ditulis selama periode Hackathon, dan bebas dari daftar *Sample Anti-Projects*.
- [ ] **Pengalaman Juri `< 3 Detik`**: Tombol **`🔑 1-Click Judge Demo Login`** di halaman utama & halaman login berhasil masuk ke akun Menlo Park (Level 5) tanpa meminta input form apa pun.
- [ ] **Keamanan Kredit \$150**: Hard Spend Limit \$140 aktif di dashboard `dev.meta.ai`, dan *7-Layer AI Credit Shield* + *Judge Reserve Pool (\$35)* aktif di server.
- [ ] **Performa 3D Murni**: Kanvas **Pure-Code 3D Eco-Island** dan **3D Radar Map** berjalan mulus tanpa file Blender eksternal yang gagal dimuat.
- [ ] **Video $\le 3$ Menit & Postingan X**: Terpublikasi dan tertaut di halaman submission Cerebral Valley sebelum **Kamis, 5 November 2026 pukul 09:00 WIB (Rabu, 4 Nov 21:00 EST)**.
