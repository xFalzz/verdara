# 3. AFD — App Flow Documentation
**Project Name:** Verdara (*Spatial Intelligence for Sustainable Living & Resilient Homes*)  
**Version:** 3.0 (Final Pre-Build Lock)  
**Date:** October 28, 2026

---

## 1. Peta Navigasi Global & Arsitektur Route (Sitemap)

Seluruh halaman menggunakan prefix bahasa `/{locale}` (`en` default atau `id`) dan dipisahkan menjadi **Public Marketing Routes** dan **Protected Studio Routes (Wajib Sesi Auth / 1-Click Judge Login)**.

```mermaid
flowchart TD
    ROOT["/ (Root Redirect -> /en)"] --> LAND["/{locale} (S01: Biophilic 3D Landing Page)"]
    LAND -->|"Click Sign In / Get Started"| LOGIN["/{locale}/login (S02: Split-Screen Auth & Judge Login)"]
    LAND -->|"Click Create Account"| REG["/{locale}/register (S02B: Sign Up)"]
    LAND -->|"Click 🔑 1-Click Judge Demo"| JUDGE_API["POST /api/auth/judge"]

    LOGIN -->|"🔑 1-Click Judge Demo"| JUDGE_API
    LOGIN -->|"Email + Password"| AUTH_CB["Session Cookie Set"]
    REG -->|"New User"| ONBOARD["/{locale}/onboarding (S03: 1-Step Geo & Biome Setup)"]
    ONBOARD --> DASH

    JUDGE_API -->|"Auto-Seed Menlo Park Lv.5"| DASH["/{locale}/dashboard (S04: Command Center & 3D Eco-Island)"]
    AUTH_CB --> DASH

    subgraph Studio["Protected Studio Shell (Top Telemetry Bar + Left Navigation Dock)"]
        DASH <--> LENS["/{locale}/lens (S05: Omni-Spatial Lens — SAM 3.1 + Muse Image)"]
        DASH <--> RADAR["/{locale}/radar (S06: Global 3D Radar & Housing Calculator)"]
        DASH <--> COUNCIL["/{locale}/council (S07: The Verdara Council Multi-Agent Room)"]
        DASH <--> ACAD["/{locale}/academy (S08: Verifiable Field-Action Academy)"]
        DASH <--> SET["/{locale}/settings (S09: Locale, Units, Theme, Credit Telemetry)"]
    end

    LENS -->|"Click 'Route to Nearest Hub'"| RADAR
    LENS -->|"Click 'Ask Council About Scan'"| COUNCIL
    RADAR -->|"Select Building -> 'Ask the Council'"| COUNCIL
    COUNCIL -->|"Action Blueprint -> 'Turn into Action Track'"| ACAD
    ACAD -->|"SAM 3.1 Proof Verified (+XP & Unlock Item)"| DASH
```

---

## 2. Matriks Route Guard & State Akses

| Route Path | Status Auth | Jika Belum Login | Jika Sudah Login (Belum Onboarding) | Jika Sudah Login & Onboarding (atau Akun Juri) |
| :--- | :---: | :--- | :--- | :--- |
| `/{locale}` | Publik | Render Landing Page (`S01`) | Render Landing Page + tombol *"Go to Dashboard"* | Render Landing Page + tombol *"Open Studio"* |
| `/{locale}/login` & `/register` | Publik | Render Form Auth + **1-Click Judge Login** | Redirect `307` ke `/{locale}/onboarding` | Redirect `307` ke `/{locale}/dashboard` |
| `/{locale}/onboarding` | Wajib Auth | Redirect `307` ke `/{locale}/login` | Render Pemilihan Lokasi & Iklim (`S03`) | Redirect `307` ke `/{locale}/dashboard` |
| `/{locale}/dashboard` | Wajib Auth | Redirect `307` ke `/{locale}/login?next=/dashboard` | Redirect `307` ke `/{locale}/onboarding` | Render Command Center + 3D Eco-Island (`S04`) |
| `/{locale}/lens` | Wajib Auth | Redirect `307` ke `/{locale}/login?next=/lens` | Redirect `307` ke `/{locale}/onboarding` | Render Omni-Spatial Lens (`S05`) |
| `/{locale}/radar` | Wajib Auth | Redirect `307` ke `/{locale}/login?next=/radar` | Redirect `307` ke `/{locale}/onboarding` | Render Global 3D Radar & Calculator (`S06`) |
| `/{locale}/council` | Wajib Auth | Redirect `307` ke `/{locale}/login?next=/council` | Redirect `307` ke `/{locale}/onboarding` | Render Multi-Agent Council (`S07`) |
| `/{locale}/academy` | Wajib Auth | Redirect `307` ke `/{locale}/login?next=/academy` | Redirect `307` ke `/{locale}/onboarding` | Render Field-Action Academy (`S08`) |

---

## 3. Alur Detail 6 Perjalanan Utama (End-to-End Sequence Flows)

### 3.1 Flow 1 — `🔑 1-Click Judge Demo Login` (Zero-Friction Judge Entry `< 3 Detik`)

Dirancang khusus agar Juri Hackathon dapat masuk ke dalam Studio yang sudah terisi data kaya (*Menlo Park, California — Level 5*) dalam satu klik.

```mermaid
sequenceDiagram
    actor J as Hackathon Judge
    participant UI as Landing / Login UI
    participant API as POST /api/auth/judge
    participant DB as Supabase Postgres + Auth

    J->>UI: Klik tombol "🔑 1-Click Judge Demo Login"
    UI->>UI: Tampilkan state loading "Provisioning Menlo Park Spatial Twin..."
    UI->>API: POST /api/auth/judge (Origin verified)
    API->>DB: Cek rate limit IP (maks. 5 akun juri / jam / IP)
    API->>DB: auth.admin.createUser(judge+{nanoid}@demo.verdara.app, is_judge_demo=true)
    API->>DB: RPC seed_demo_user(uid, preset='menlo_park')
    Note over DB: Seed otomatis:<br/>1. Profile: Menlo Park (37.48, -122.15, Csb, USD, Imperial)<br/>2. Eco-Island: Level 5 (1.000 XP, Solar + Rain Tank + Compost unlocked)<br/>3. 3 Riwayat Scan Lens (dari Golden Cache = $0 API)<br/>4. 1 Sesi Council & 2 Modul Academy Verified
    API->>DB: signInWithPassword() -> Set HTTP-Only Session Cookie
    API-->>UI: 200 OK { redirectTo: "/en/dashboard" }
    UI->>J: Masuk ke Command Center dengan 3D Eco-Island Level 5 aktif
```

---

### 3.2 Flow 2 — `Omni-Spatial Lens`: Waste Valuation + Generative Eco-Retrofit (`Muse Spark` + `SAM 3.1` + `Muse Image`)

```mermaid
sequenceDiagram
    actor U as User / Judge
    participant FE as Lens UI (S05)
    participant API as POST /api/lens/scan (SSE)
    participant SHIELD as 7-Layer Credit Shield
    participant META as Meta Model API (dev.meta.ai)
    participant DB as Postgres + Storage

    U->>FE: Pilih Foto Sampel Golden Demo ATAU Upload Foto Baru
    FE->>FE: Client resize maks. 1280px & tampilkan Scanning Reticle HUD
    FE->>API: POST multipart/form-data (image, mode="waste" | "retrofit")
    API->>SHIELD: Strip EXIF (sharp), hitung SHA-256 & 64-bit dHash
    SHIELD->>DB: Cek ai_cache (Apakah foto sampel / pernah di-scan?)
    alt Cache HIT (Termasuk 6 Foto Sampel = $0.00)
        DB-->>SHIELD: Kembalikan poligon & konsep dari ai_cache
    else Cache MISS (Foto Baru)
        SHIELD->>SHIELD: Cek Kuota User, Concurrency Lock, & Judge Reserve Pool ($35)
        API-->>FE: SSE event: stage="detecting_concepts"
        API->>META: Muse Spark Vision (DETECT_WASTE — maks. 5 konsep)
        META-->>API: concepts[{ nounPhrase, materialCode, sizeClassHint }]
        API-->>FE: SSE event: stage="segmenting_sam_3_1"
        par Fan-Out Paralel per Konsep (Maks. 5 Konsep)
            API->>META: SAM 3.1 (prompt = nounPhrase)
            META-->>API: Polygon Masks + Confidence Scores
        and Panduan Daur Ulang & Upcycling Lokal
            API->>META: Muse Spark Text (ENRICH_MATERIALS sesuai country_code)
            META-->>API: disposal_instruction + upcycling_recipe (<= 5 langkah)
        end
        API->>API: Normalisasi poligon [0..1], filter noise, deduplikasi IoU >= 0.85
    end
    API->>API: Kalkulasi Deterministik: Nilai Uang Lokal (country_policies) + CO2e (material_factors)
    API->>DB: Simpan scans, scan_objects, ai_usage & tambah XP (award_xp)
    API-->>FE: SSE event: result (objects[], masks[], totals, telemetry, xp)
    FE-->>U: Render Poligon SVG Interaktif + X-Ray Slider + Drawer Valuasi Lokal

    opt User Klik Tab "Generative Eco-Retrofit" (Before/After)
        U->>FE: Klik "Generate Biophilic Retrofit Preview"
        FE->>API: POST /api/lens/retrofit (scanId, koppenBiome)
        API->>META: Muse Image / Muse Wonder (Prompt arsitektur sesuai biome + mask SAM 3.1)
        META-->>API: Citra After Eco-Retrofit
        API-->>FE: Render Interactive Split-Screen Before/After Slider + Tombol Share X
    end
```

---

### 3.3 Flow 3 — `Global 3D Radar & Deterministic Housing Calculator` (`S06`)

```mermaid
sequenceDiagram
    actor U as User / Judge
    participant MAP as 3D Radar UI (MapLibre + Deck.gl)
    participant GEO as /api/geo/* & Science Engine
    participant EXT as Open-Meteo ERA5 & OSM Overpass

    U->>MAP: Buka Radar ATAU Klik Chip Teleport ("San Francisco" / "Tokyo" / "Yogyakarta")
    MAP->>MAP: Kamera 3D flyTo(lat, lng, pitch: 55, zoom: 16) + Ekstrusi Gedung 3D
    par Ambil Konteks Iklim & Kebijakan Lokal
        MAP->>GEO: GET /api/geo/context?lat&lng
        GEO->>EXT: Ambil ERA5 10-Thn (jika belum ada di geo_cache 0.25 deg)
        GEO->>GEO: Hitung Klasifikasi Köppen (Peel 2007) + Musim + Lookup country_policies
        GEO-->>MAP: GeoContext (koppenCode, currency, tariff, gridEF, depositScheme)
    and Ambil Titik Circular Economy Hubs Terdekat
        MAP->>GEO: GET /api/geo/hubs?lat&lng&material
        GEO->>EXT: Query Overpass API (radius adaptif 5km -> 15km -> 30km)
        GEO-->>MAP: Daftar Hubs + Render Busur 3D (Deck.gl ArcLayer)
    end

    U->>MAP: Klik Atap Bangunan di Peta 3D
    MAP->>GEO: GET /api/geo/building?lat&lng
    GEO-->>MAP: Poligon Footprint Atap + Luas m2 (@turf/area)
    MAP->>MAP: Jalankan Deterministic Calculator (Solar kWp/kWh, Air Hujan Liter/thn, Biopori, TCI)
    U->>MAP: Geser Slider Asumsi (Misal: Roof Usable Ratio 60% -> 75%)
    MAP->>MAP: Rekalkulasi instan (< 16ms di browser tanpa panggil server)
```

---

### 3.4 Flow 4 — `The Verdara Council`: Multi-Agent Simulation & Blueprint Synthesis (`S07`)

```mermaid
sequenceDiagram
    actor U as User / Judge
    participant UI as Council Room UI (S07)
    participant API as POST /api/council (SSE)
    participant META as Meta Model API (Muse Spark / Muse Spark Open)
    participant VAL as Deterministic Number Validator
    participant DB as Supabase Postgres

    U->>UI: Klik "Convene the Verdara Council" (dari Radar atau Lens)
    UI->>API: POST /api/council { lat, lng, footprintM2, assumptions, scanId? }
    API->>API: Bangun SITE_BRIEF JSON (Iklim Köppen, Hasil Kalkulator Surya/Air, Hub Terdekat, Regulasi)
    API->>DB: Insert council_sessions (status = 'running')

    loop Giliran Sekuensial 3 Agen Spesialis: [1. Flora, 2. Arka, 3. Sirkula]
        API-->>UI: SSE event: agent_start { agent }
        API->>META: Stream prompt agen + SITE_BRIEF + pesan agen sebelumnya (max_tokens: 350)
        META-->>UI: SSE event: token { agent, delta }
        API->>VAL: Periksa semua angka di teks terhadap SITE_BRIEF (toleransi 2%)
        API-->>UI: SSE event: agent_end { agent, verifiedNumbers, unverifiedNumbers }
    end

    API->>META: SYNTHESIZE_BLUEPRINT (Menghasilkan JSON ActionBlueprint terstruktur)
    META-->>API: JSON ActionBlueprint (3-6 aksi prioritas)
    API->>API: Validasi skema Zod + pastikan metricRefs ada di SITE_BRIEF
    API->>DB: Simpan council_messages + blueprint + award_xp('council', 20 XP)
    API-->>UI: SSE event: blueprint + done
```

---

### 3.5 Flow 5 — `Verifiable Field-Action Academy`: SAM 3.1 Proof-of-Action (`S08`)

```mermaid
sequenceDiagram
    actor U as User / Judge
    participant UI as Academy Module UI (S08)
    participant API as POST /api/academy/proof
    participant SHIELD as dHash Anti-Cheat & Shield
    participant SAM as Meta SAM 3.1
    participant DB as Supabase Postgres

    U->>UI: Baca Panduan Modul (Disesuaikan Iklim Köppen) & Jawab 3 Soal Kuis
    UI->>API: POST /api/academy/quiz { lessonId, answers }
    API-->>UI: Passed (Minimal 2/3 Benar) -> Buka Panel Upload Proof-of-Action

    U->>UI: Unggah Foto Bukti Aksi Fisik (atau Pilih Sampel Bukti untuk Demo Juri)
    UI->>API: POST /api/academy/proof (multipart: image, lessonId)
    API->>SHIELD: Hitung 64-bit Perceptual dHash (sharp 9x8 grayscale)
    SHIELD->>DB: Cek apakah jarak Hamming <= 6 terhadap bukti lama user
    alt Terdeteksi Foto Duplikat
        API-->>UI: 409 Conflict (proof.duplicate — "Please upload a new photo")
    else Foto Unik / Valid Demo Sample
        par Fan-Out SAM 3.1 untuk Setiap Konsep di proof_requirements (Maks. 3 Konsep)
            API->>SAM: Segment(image, concept_i)
            SAM-->>API: Instances dengan score >= 0.50
        end
        API->>API: Hitung Skor Verifikasi (0-100) dari Coverage & Confidence
        API->>DB: Simpan action_proofs
        opt Skor >= 70 & Semua Konsep Wajib Terdeteksi (VERIFIED)
            API->>DB: RPC award_xp('proof', xp_reward) + unlock_island_item()
        end
        API-->>UI: Tampilkan Poligon Bukti SAM 3.1 + Checklist + Skor + Animasi Unlock Pulau 3D!
    end
```

---

## 4. Diagram State Machine — Siklus Hidup Kredit AI & Mode Fallback

```mermaid
stateDiagram-v2
    [*] --> NormalLiveMode: Total Spend < $100.00 & Daily < $12.00

    NormalLiveMode --> CacheHitZeroCost: Foto Sampel / SHA-256 / dHash Cocok ($0.00)
    CacheHitZeroCost --> NormalLiveMode: Return Instant Result (< 50ms)

    NormalLiveMode --> JudgePriorityMode: Total Public Spend >= $100.00 ($35 Judge Reserve Active)
    JudgePriorityMode --> LiveInferenceForJudge: User has is_judge_demo = true
    JudgePriorityMode --> EcoSaverFallbackMode: User is Standard Public Visitor

    NormalLiveMode --> EcoSaverFallbackMode: Daily Budget ($12) or Lifetime Cap ($135) Reached
    EcoSaverFallbackMode --> [*]: Serve Pre-Computed Golden Cache + Deterministic Math (Zero Crash)
```
