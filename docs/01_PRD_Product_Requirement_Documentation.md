# 1. PRD — Product Requirement Documentation
**Project Name:** Verdara (*Spatial Intelligence for Sustainable Living & Resilient Homes*)  
**Event:** Meta Global AI Developer Hackathon (Cerebral Valley)  
**Track:** Indie Developer Track (\$400,000 Pool) + All 5 Bonus Categories (\$50,000 Pool)  
**Version:** 3.0 (Final Pre-Build Lock — Single Meta API Key + 100% Procedural 3D)  
**Date:** October 28, 2026  
**Author:** Nawfal Irfan (`xFalzz` / `@xFalzs`)

---

## 1. Executive Summary & Product Vision

**Verdara** adalah platform web intelijen spasial dan keberlanjutan rumah tangga berskala global (*Global Spatial Sustainability & Home Resilience Intelligence Platform*). Verdara menggabungkan keluarga model multimodal **Meta AI (`Muse Spark`, `SAM 3.1`, `Muse Image / Muse Wonder`, `Muse Voice Transcribe`, `Muse Glimmer / Muse Spark Open`)** melalui satu pintu resmi **Meta Model API (`dev.meta.ai`)** dengan mesin kalkulasi fisika/iklim deterministik (**ERA5 Climate Archive**, **Köppen–Geiger Classification**, **PostGIS**, dan **OpenStreetMap Overpass**) serta antarmuka **Pure-Code 3D WebGL (`@react-three/fiber` & `MapLibre GL 3D`)**.

Verdara menjawab tiga masalah nyata yang dihadapi penghuni rumah di seluruh dunia:
1. **Ketidakpastian Nilai & Aturan Daur Ulang Lokal**: Pengguna memotret tumpukan barang/sampah rumah tangga di **Omni-Spatial Lens**, di mana **Muse Spark** mendeteksi konsep material dan **SAM 3.1** memotong poligon piksel presisi setiap objek, lalu mesin deterministik menghitung nilai deposit/jual lokal (`CRV` di AS, `Pfand` di Jerman, `Bank Sampah` di Indonesia, dll.) serta estimasi $\text{CO}_2\text{e}$ yang dihindari (berdasarkan tabel resmi **US EPA WARM**).
2. **Kesulitan Menghitung Potensi Energi, Air & Renovasi Hijau Hunian**: Pengguna mengklik atap bangunan mana pun di dunia pada **Global 3D Radar**, menghitung potensi panel surya (`kWp`, `kWh/tahun`), panen air hujan (`L/tahun`), lubang resapan biopori, dan melihat transformasi visual *Before/After* halaman/atap menggunakan **Muse Image / Muse Wonder** serta rekomendasi **Action Blueprint** dari 3 agen spesialis **The Verdara Council**.
3. **Kurangnya Bukti Aksi Nyata (Greenwashing)**: Melalui **Verifiable Field-Action Academy**, pengguna mengeksekusi aksi fisik di rumah dan mengunggah foto buktinya. **SAM 3.1** memverifikasi keberadaan objek wajib secara spasial (dikombinasikan dengan anti-duplikat `dHash` 64-bit) untuk membuka level dan menumbuhkan struktur 3D baru pada **Procedural 3D Eco-Island** milik pengguna.

---

## 2. Kepatuhan Aturan Hackathon & Pemetaan Hadiah

### 2.1 Keselarasan Problem Statement Resmi
* **Primary Track — Build for Your World**: Membawa model-model terbaru Meta ke ranah pengelolaan rumah tangga, penghematan biaya energi/sampah, dan ketahanan iklim lokal yang relevan bagi miliaran rumah tangga di seluruh dunia.
* **Secondary Depth — Push the Frontier**: Menggabungkan segmentasi piksel **SAM 3.1** dan penalaran **Muse Spark** dengan perhitungan fisika surya, hidrologi air hujan, dan verifikasi agen fisik (*Verifiable Agents*).

### 2.2 Perlindungan Mutlak dari Daftar *"Sample Anti-Projects"*
Panduan resmi mendiskualifikasi proyek generik seperti *Simple Image Analyzers*, *Basic RAG*, *Simple "AI for Education" Chatbots*, dan *Medical Advice*. Verdara dirancang secara spesifik untuk menghindari seluruh jebakan tersebut:

| Kategori Terlarang di Panduan | Mengapa Verdara 100% Berbeda & Aman |
| :--- | :--- |
| ❌ *Simple Image Analyzer* | **Verdara Lens** adalah *Multi-Stage Spatial & Economic Engineering Pipeline*: `Muse Spark` (deteksi konsep) $\rightarrow$ paralel `SAM 3.1` (poligon mask + deduplikasi IoU + kalkulasi rasio piksel) $\rightarrow$ valuasi deterministik per yurisdiksi negara & faktor emisi EPA WARM $\rightarrow$ `Muse Image/Wonder` (*Before/After* architectural eco-retrofit) $\rightarrow$ perutean geospasial 3D ke hub daur ulang OSM terdekat. |
| ❌ *Simple "AI for Education" Chatbot* | **Verdara Academy TIDAK memiliki fitur chatbot edukasi sama sekali.** Modul ini adalah **Verifiable Field-Action Protocol (SAM 3.1 Proof-of-Action Engine)** di mana klaim aksi fisik diverifikasi secara matematis melalui deteksi poligon **SAM 3.1** dan *perceptual hash* `dHash` 64-bit. |
| ❌ *Medical / Nutrition Advice* | Tidak ada fitur kesehatan manusia atau nutrisi. Analisis daun tanaman murni menghitung rasio geometri piksel (`lesion area / leaf area`) dengan disclaimer eksplisit non-agronomi. |

### 2.3 Strategi Sapu Bersih 6 Kategori Hadiah

| Kategori Hadiah | Nilai | Fitur Kunci Verdara yang Memenuhi Syarat |
| :--- | :---: | :--- |
| **Indie Developer Track (1st–5th)** | **\$150K – \$25K** | Platform full-stack global dengan 4 rubrik utama: *Impact*, *Use of Meta AI Tooling*, *Technical Depth*, dan *Demo*. |
| **Most Viral Project on X** | **\$20,000** | Fitur **1-Click Shareable Before/After & X-Ray Telemetry Card** siap unggah ke X (`@xFalzs`). |
| **Best Build on Meta Open Weight Models** | **\$10,000** | Dukungan model open-weight ekosistem Meta (**Muse Spark Open / Muse Glimmer**) pada *The Verdara Council* & *Fast Intent Classifier* lengkap dengan bukti di Telemetry Strip. |
| **Community Vote** | **\$10,000** | **1-Click Judge & Community Demo Login** + *City Teleport Chips* (SF, London, Tokyo, Dubai, Yogyakarta) + *Procedural 3D Eco-Island*. |
| **Best Agentic Use-Case** | **\$5,000** | Orkestrasi multi-agen **The Verdara Council** (*Flora, Arka, Sirkula*) + *Deterministic Number Validator* + *Verifiable Proof-of-Action*. |
| **Best Creative Build** | **\$5,000** | **Generative Architectural Eco-Retrofit (`Muse Image / Muse Wonder`)** yang dipandu mask **SAM 3.1** + **Pure-Code 3D Eco-Island**. |

---

## 3. Target Pengguna & Persona

1. **P-01 — The Hackathon Judge (Penilai di Menlo Park / SF / Global)**
   * **Konteks**: Memiliki waktu $\le 3$ menit untuk menilai proyek; enggan mendaftar akun dengan email pribadi atau menunggu loading lama.
   * **Kebutuhan**: Masuk dalam 1 klik (`🔑 1-Click Judge Demo Login`), langsung melihat data nyata di Menlo Park/San Francisco, mencoba foto sampel dengan respons instan (`< 500 ms` via cache), dan memverifikasi keaslian pemanggilan API Meta pada *Telemetry Strip*.
2. **P-02 — Urban Homeowner / Renter Global (San Francisco, Berlin, Tokyo, Yogyakarta)**
   * **Konteks**: Ingin menurunkan tagihan listrik/air, mengetahui aturan pemilahan/nilai deposit sampah di kotanya, dan memanfaatkan ruang atap/balkon/halaman secara optimal.
   * **Kebutuhan**: Kalkulator surya & air hujan yang akurat untuk lokasinya, pemindai objek rumah tangga dengan instruksi lokal, serta rekomendasi tanaman & renovasi sesuai iklim kotanya.

---

## 4. Cakupan Fungsional (MoSCoW Prioritization)

* **M (Must-Have)**: Wajib selesai 100% dan lulus semua kriteria penerimaan sebelum pengiriman.
* **S (Should-Have)**: Nilai tambah tinggi untuk poin juri; dikerjakan setelah semua item **M** stabil.
* **C (Could-Have)**: Fitur ekstra opsional; langsung dipangkas jika waktu tidak mencukupi.
* **W (Won't-Have)**: Dikeluarkan secara tegas dari cakupan (contoh: **tidak menggunakan Blender / file `.glb` eksternal**, tidak ada konversi kurs antar mata uang, tidak ada chatbot tanya-jawab bebas, tidak ada klaim kredit karbon bersertifikat).

---

## 5. Spesifikasi Functional Requirements (FR)

### 5.1 `AUTH` — Autentikasi, Onboarding & Akun Juri

| ID | Requirement | Prio | Acceptance Criteria |
| :--- | :--- | :---: | :--- |
| **FR-AUTH-01** | Semua route Studio (`/[locale]/dashboard`, `/lens`, `/radar`, `/council`, `/academy`, `/settings`) HARUS mewajibkan sesi autentikasi Supabase yang valid. | **M** | Request tanpa sesi ke route Studio di-redirect HTTP 307 ke `/[locale]/login?next=<path>`. |
| **FR-AUTH-02** | Sistem HARUS mendukung registrasi dan login dengan email + password (min. 8 karakter). | **M** | Registrasi membuat baris `profiles` dan `eco_islands` (Level 1) secara otomatis. |
| **FR-AUTH-03** | Pengguna baru HARUS melewati onboarding lokasi 1 layar: tombol *Use my GPS* atau pencarian kota/alamat global. | **M** | Menyimpan `home_lat` & `home_lng` (dibulatkan 2 desimal), `home_city`, `country_code`, dan `koppen_code`. |
| **FR-AUTH-04** | Halaman `/login` dan Landing Page HARUS menyediakan tombol menonjol **`🔑 1-Click Judge Demo Login`**. | **M** | Klik membuat akun ephemeral terisolasi (`is_judge_demo = true`) dan masuk ke `/en/dashboard` dalam $\le 3$ detik tanpa input form. |
| **FR-AUTH-05** | Akun juri HARUS di-seed otomatis dengan: lokasi Menlo Park (`37.48, -122.15`, `US-CA`, `Csb`, `USD`, `imperial`), Eco-Island Level 5 (`1.000 XP`), 3 riwayat scan Lens, 1 sesi Council tersimpan, dan 2 lesson Academy terverifikasi. | **M** | Seluruh halaman Studio langsung menampilkan data kaya pada kunjungan pertama akun juri dengan biaya API \$0 (`ai_cache`). |
| **FR-AUTH-06** | Akun `is_judge_demo = true` yang berumur $> 7$ hari HARUS dibersihkan oleh cron job harian. | **M** | Endpoint `/api/cron/cleanup-judges` menghapus akun demo kedaluwarsa beserta data terhubung (`ON DELETE CASCADE`). |

### 5.2 `GEO` — Global Geo-Adaptive Context Engine

| ID | Requirement | Prio | Acceptance Criteria |
| :--- | :--- | :---: | :--- |
| **FR-GEO-01** | Sistem HARUS menyelesaikan `(lat, lng)` menjadi objek `GeoContext`: kota, kode negara ISO-2 (`US-CA` khusus California), zona iklim Köppen–Geiger, musim saat ini, mata uang, sistem satuan default, dan ringkasan kebijakan lokal. | **M** | Teruji otomatis untuk 5 kota preset: San Francisco (`Csb`, `USD`, `imperial`), London (`Cfb`, `GBP`, `metric`), Tokyo (`Cfa`, `JPY`, `metric`), Dubai (`BWh`, `AED`, `metric`), Yogyakarta (`Am`, `IDR`, `metric`). |
| **FR-GEO-02** | Klasifikasi Köppen–Geiger HARUS dihitung secara deterministik dari data suhu & presipitasi bulanan 10 tahun Open-Meteo ERA5 menggunakan rumus **Peel et al. (2007)**. | **M** | Fungsi `classifyKoppen()` lulus 100% unit test terhadap 6 kota referensi iklim. |
| **FR-GEO-03** | Musim saat ini HARUS ditentukan dari lintang dan bulan kalender (`Tropical Wet/Dry` untuk $|\text{lat}| < 23.5^\circ$; `Spring/Summer/Autumn/Winter` dengan pembalikan belahan bumi utara/selatan untuk $|\text{lat}| \ge 23.5^\circ$). | **M** | Bulan Oktober menghasilkan `Autumn` di London (`51.5°N`), `Spring` di Sydney (`-33.9°S`), dan `Wet Season` di Yogyakarta (`-7.8°S`). |
| **FR-GEO-04** | Kebijakan deposit/harga rongsok, tarif listrik, dan intensitas karbon grid HARUS diambil dari tabel `country_policies` (minimal 12 negara + fallback global `XX`). | **M** | Negara di luar 12 daftar utama tetap berjalan lancar menggunakan baris `XX` dengan label `"Global Default Estimate"`. |
| **FR-GEO-05** | Hasil `GeoContext` dan iklim ERA5 HARUS di-cache per sel grid $0.25^\circ \times 0.25^\circ$ di tabel `geo_cache` (TTL 30 hari). | **M** | Permintaan kedua pada area kota yang sama kembali dalam $\le 150\text{ ms}$ tanpa memanggil Open-Meteo lagi. |

### 5.3 `DASH` & `ISL` — Command Center & Pure-Code 3D Eco-Island

| ID | Requirement | Prio | Acceptance Criteria |
| :--- | :--- | :---: | :--- |
| **FR-DASH-01** | Dashboard HARUS menampilkan kartu metrik utama: Total $\text{CO}_2\text{e}$ Dihindari (`est.`), Total Nilai Ekonomi Daur Ulang (mata uang lokal), Objek Dipindai, Eco-XP, Level (`1–10`), dan Streak Harian. | **M** | Seluruh angka sesuai dengan agregasi tabel database pengguna dan diformat dengan `tabular-nums`. |
| **FR-DASH-02** | Dashboard HARUS menampilkan panel cuaca lokal aktif (suhu, kondisi WMO, AQI, waktu matahari terbit/terbenam) dari Open-Meteo. | **M** | Data di-cache dengan TTL 30 menit. |
| **FR-DASH-03** | Dashboard HARUS menampilkan **Pure-Code 3D Eco-Island (`@react-three/fiber`)** yang dibangun 100% dari geometri prosedural TypeScript (tanpa file `.glb` eksternal). | **M** | Kanvas 3D dapat diputar (`OrbitControls` dengan sudut terbatas), merender $\ge 45\text{ FPS}$ di laptop iGPU, dan memiliki ukuran aset eksternal `0 KB`. |
| **FR-ISL-01** | Warna tanah dan vegetasi prosedural pulau 3D HARUS menyesuaikan biome Köppen lokasi aktif (`Tropical`, `Arid`, `Temperate`, `Mediterranean`, `Continental`, `Polar`). | **M** | Mengganti lokasi ke Dubai mengubah pulau menjadi biome `Arid` (pasir hangat & sukulen); mengganti ke Yogyakarta menampilkan biome `Tropical` (hijau lebat & palem). |
| **FR-ISL-02** | Struktur 3D di atas pulau (rumah, tempat sampah pilah, kebun vertikal, komposter, panel surya atap, tong air hujan, turbin angin mikro, kanopi pohon) HARUS muncul secara dinamis sesuai `level` (`1–10`) dan `island_items` yang terbuka. | **M** | Kenaikan level atau penyelesaian Proof-of-Action langsung menambahkan struktur 3D baru di pulau dengan animasi *spring scale-up*. |
| **FR-ISL-03** | Klik pada struktur 3D di pulau HARUS menampilkan *Floating Telemetry Pill* (`<Html />` Drei) berisi status modul tersebut. | **M** | Klik panel surya di pulau menampilkan pill metrik kapasitas surya pengguna. |
| **FR-ISL-04** | Pencahayaan pulau 3D HARUS mengikuti waktu siang/malam lokal (`sunrise`/`sunset`) atau toggle tema pengguna. | **S** | Mode malam mengaktifkan pencahayaan *Bioluminescent Canopy* dengan lampu taman menyala. |

### 5.4 `LENS` — Omni-Spatial Lens (`Muse Spark` + `SAM 3.1` + `Muse Image/Wonder`)

| ID | Requirement | Prio | Acceptance Criteria |
| :--- | :--- | :---: | :--- |
| **FR-LENS-01** | Lens HARUS menerima unggahan foto (`JPEG`/`PNG`/`WebP` $\le 8\text{ MB}$), tangkapan kamera langsung, atau pemilihan dari **6 Foto Sampel Golden Demo**. | **M** | Format/ukuran tidak valid ditolak dengan pesan jelas. Klik foto sampel mengembalikan hasil dari `ai_cache` dengan biaya API **\$0.00**. |
| **FR-LENS-02** | Gambar unggahan baru HARUS dikompresi/di-resize ke sisi terpanjang **1280 px** (kualitas 82) dan dihapus seluruh metadata EXIF/GPS-nya menggunakan `sharp` sebelum disimpan atau dikirim ke API Meta. | **M** | Menghemat token visi $\sim 60\%$ dan menjamin privasi lokasi foto. |
| **FR-LENS-03** | Pada mode **Waste & Material Scanner**, **Muse Spark** HARUS mendeteksi maksimal **5 konsep objek teratas** (`noun_phrase` tunggal 1–4 kata + `material_code` tertutup + `size_class_hint`), lalu memanggil **SAM 3.1** secara paralel untuk setiap konsep. | **M** | Menghasilkan daftar objek dengan poligon ter-normalisasi (`[0..1]`), skor kepercayaan, dan deduplikasi mask tumpang-tindih ($\text{IoU} \ge 0.85$). |
| **FR-LENS-04** | Nilai ekonomi (`valueMin`, `valueMax`, `currency`) dan emisi $\text{CO}_2\text{e}$ (`co2eG`) setiap objek HARUS dihitung secara deterministik dari tabel `country_policies` dan `material_factors` (EPA WARM), **bukan dari tebakan LLM**. | **M** | Botol PET kecil di California (`US-CA`) selalu menghasilkan `USD 0.05` (CRV); di Jerman (`DE`) menghasilkan `EUR 0.25` (Pfand); di Indonesia (`ID`) menghasilkan rentang harga Bank Sampah dalam `IDR`. |
| **FR-LENS-05** | Poligon hasil **SAM 3.1** HARUS dirender sebagai lapisan SVG interaktif di atas foto (lengkap dengan **X-Ray Wireframe Slider**), dapat di-hover, diklik, dan dinavigasi dengan tombol `Tab` keyboard. | **M** | Klik poligon membuka detail objek berisi: nama konsep, kode material, estimasi massa (`g`/`oz`), nilai lokal, $\text{CO}_2\text{e}$, aturan buang lokal, dan 1 resep *upcycling* ($\le 5$ langkah dari **Muse Spark**). |
| **FR-LENS-06** | Tombol **`Route to Nearest Hub on 3D Radar`** pada objek HARUS membuka halaman Radar 3D dengan filter material tersebut aktif. | **M** | Mengarahkan ke `/[locale]/radar?material=<CODE>` dan menyorot hub penerima material tersebut. |
| **FR-LENS-07** | Pada mode **Generative Eco-Retrofit**, sistem HARUS menggunakan **SAM 3.1** untuk memetakan zona atap/halaman/balkon dan memanggil **Muse Image / Muse Wonder** untuk menghasilkan visualisasi arsitektur hijau *Before/After* sesuai biome iklim Köppen pengguna. | **M** | Menampilkan *Interactive Split-Screen Curtain Slider* (Before vs After), label atribusi *"Generated with Meta Muse Image"*, dan tombol **Export Shareable Card for X**. |
| **FR-LENS-08** | Pada mode **Plant Canopy Diagnostics**, sistem SEBAIKNYA menggunakan **SAM 3.1** untuk membandingkan luas piksel `damaged leaf area` terhadap `plant leaf` dan menampilkan indeks keparahan (`%`) beserta jadwal perawatan 7 hari. | **S** | Menampilkan persentase 1 desimal + disclaimer non-agronomi. |
| **FR-LENS-09** | Lens dan Radar SEBAIKNYA menyediakan tombol mikrofon yang merekam perintah suara ($\le 15$ detik) dan mentranskripsikannya melalui **Muse Voice Transcribe**. | **S** | Audio ditranskripsi menjadi filter/aksi dan tercatat di `ai_usage`. |

### 5.5 `RADAR` & `CALC` — Global 3D Radar & Deterministic Housing Calculator

| ID | Requirement | Prio | Acceptance Criteria |
| :--- | :--- | :---: | :--- |
| **FR-RADAR-01** | Radar HARUS menampilkan peta vektor 3D (`MapLibre GL JS` + `OpenFreeMap` + `Deck.gl`) dengan ekstrusi bangunan 3D (`pitch: 55°`, `bearing: -18°`). | **M** | Berjalan di seluruh kota dunia tanpa membutuhkan API key berbayar Mapbox/Google Maps. |
| **FR-RADAR-02** | Radar HARUS menyediakan pencarian alamat global (*Photon autocomplete*, debounce `300 ms`) serta **5 City Teleport Chips**: `San Francisco`, `London`, `Tokyo`, `Dubai`, `Yogyakarta`. | **M** | Klik chip menerbangkan kamera (`flyTo`) dan memperbarui seluruh `GeoContext` (mata uang, iklim Köppen, tarif listrik, dan hub lokal) dalam $\le 2$ detik. |
| **FR-RADAR-03** | Radar HARUS menampilkan titik *Circular Economy Hubs* (pusat daur ulang, bank sampah, kompos, toko barang bekas, kebun komunitas) dari **OpenStreetMap Overpass API** dengan radius adaptif (`5 km` $\rightarrow$ `15 km` $\rightarrow$ `30 km`) dan busur rute 3D (`Deck.gl ArcLayer`). | **M** | Dapat difilter per kode material (`PET`, `ALU`, `GLASS`, `PAPER`, `EWASTE`, `ORGANIC`). |
| **FR-CALC-01** | Klik pada bangunan di peta 3D HARUS menyorot poligon atap (atau mengizinkan input luas manual) dan menghitung luas atap dalam $\text{m}^2$ / $\text{sq ft}$ menggunakan `@turf/area`. | **M** | Menampilkan luas footprint bangunan secara instan. |
| **FR-CALC-02** | **Deterministic Housing Calculator** HARUS menghitung secara matematis: (1) Kapasitas Surya (`kWp`), (2) Produksi Energi Tahunan (`kWh/yr`), (3) Penghematan Tagihan Listrik Tahunan (mata uang lokal), (4) Pengurangan Emisi ($\text{kg CO}_2\text{e}/\text{yr}$), (5) Potensi Panen Air Hujan (`L/yr` atau `gal/yr`), (6) Jumlah Lubang Resapan Biopori, dan (7) *Thermal Comfort Index* (`0–100`). | **M** | Seluruh angka dihitung murni dengan rumus fisika/hidrologi di Blueprint (bukan LLM), dilengkapi slider **Editable Assumptions** yang memperbarui angka dalam $< 50\text{ ms}$, serta mencantumkan sitasi sumber data (`Open-Meteo ERA5`). |

### 5.6 `CNCL` — The Verdara Council (Multi-Agent System)

| ID | Requirement | Prio | Acceptance Criteria |
| :--- | :--- | :---: | :--- |
| **FR-CNCL-01** | Pengguna HARUS dapat memanggil **The Verdara Council** dari bangunan yang dipilih di Radar atau dari hasil scan di Lens. | **M** | Membuka panel simulasi Council dengan ringkasan fakta `site_brief` terstruktur. |
| **FR-CNCL-02** | Council HARUS mengorkestrasi 3 agen spesialis dengan batasan domain ketat: **Flora** (*Urban Botanist*), **Arka** (*Building Energy & Water Architect*), dan **Sirkula** (*Circular Economy Strategist*). | **M** | Respons di-stream secara *real-time* melalui Server-Sent Events (SSE) dan mendukung eksekusi menggunakan **Muse Spark** maupun model open-weight **Muse Spark Open / Muse Glimmer** via Meta Model API. |
| **FR-CNCL-03** | Setiap angka yang disebutkan oleh agen dalam teks diskusi HARUS diperiksa oleh **Deterministic Number Validator** terhadap `site_brief`. | **M** | Angka yang sesuai dengan `site_brief` diberi badge terverifikasi; angka di luar `site_brief` ditandai `"unverified"`. |
| **FR-CNCL-04** | Sesi Council HARUS ditutup dengan sintesis **Action Blueprint** berformat JSON tervalidasi `zod` (berisi 3–6 aksi konkret, estimasi usaha, rentang biaya, referensi metrik `site_brief`, dan tautan modul Academy). | **M** | Blueprint tersimpan di database dan dapat diubah menjadi modul aksi kustom di Academy dalam 1 klik. |

### 5.7 `ACAD` — Verifiable Field-Action Academy (`SAM 3.1` Proof-of-Action)

| ID | Requirement | Prio | Acceptance Criteria |
| :--- | :--- | :---: | :--- |
| **FR-ACAD-01** | Academy HARUS menyediakan **4 Track Protokol Aksi Inti** (*Zero-Waste Home, Micro-Space Urban Farming, Passive Cooling & Home Energy, Rainwater & Flood-Resilient Housing*), masing-masing berisi 3 modul bilingual (`EN`/`ID`) dengan adaptasi zona iklim Köppen. | **M** | Total 12 modul inti tersedia lengkap dengan panduan teknis, kuis prasyarat 3 soal, dan daftar konsep objek bukti (`proof_requirements`). |
| **FR-ACAD-02** | Pengguna HARUS lulus kuis prasyarat ($\ge 2/3$ benar) sebelum tombol unggah foto **Proof-of-Action** terbuka. | **M** | Percobaan unggah bukti sebelum lulus kuis ditolak dengan HTTP 403 `proof.quiz_required`. |
| **FR-ACAD-03** | Saat foto bukti diunggah, server HARUS: (1) menghitung *perceptual hash* `dHash` 64-bit untuk menolak foto duplikat (`Hamming distance <= 6`), (2) memanggil **SAM 3.1** untuk setiap konsep wajib pada `proof_requirements`, dan (3) menghitung skor verifikasi (`0–100`). | **M** | Skor $\ge 70$ dengan seluruh konsep wajib terdeteksi menandai modul sebagai **`VERIFIED`**, memberikan XP secara idempoten, dan membuka struktur 3D baru di Eco-Island. |

### 5.8 `I18N` & `OPS` — Lokalisasi, Telemetri & 7-Layer AI Credit Shield

| ID | Requirement | Prio | Acceptance Criteria |
| :--- | :--- | :---: | :--- |
| **FR-I18N-01** | Seluruh antarmuka dan output AI HARUS mendukung pergantian instan antara **Bahasa Inggris (`EN` — default)** dan **Bahasa Indonesia (`ID`)**, sistem satuan **`Metric` / `Imperial`**, serta tema **`Botanical Daylight` (Light)** dan **`Bioluminescent Canopy` (Dark)**. | **M** | Pergantian bahasa/satuan/tema langsung memperbarui seluruh label dan konversi angka tanpa kehilangan state halaman. |
| **FR-OPS-01** | Setiap hasil inferensi AI HARUS menampilkan **Live Telemetry Strip** berisi: nama model Meta, jumlah poligon mask, latensi (`ms`), token in/out, estimasi biaya (`USD`), dan status cache (`HIT`/`MISS`). | **M** | Membuktikan kepada juri bahwa pemanggilan model Meta benar-benar nyata dan transparan. |
| **FR-OPS-02** | Sistem HARUS menerapkan **7-Layer AI Credit Shield** untuk menjaga kredit **\$150 Meta Model API**: (1) Cache `SHA-256` & `dHash` (\$0 untuk semua sampel & foto kembar), (2) Kuota harian per pengguna, (3) Rate-limit per IP (`6/menit`), (4) *Active Stream Concurrency Lock* (maks. 1 stream aktif per user), (5) Batas harian `AI_DAILY_BUDGET_USD = $12`, (6) Batas total `AI_LIFETIME_CAP_USD = $135`, dan (7) **Judge Reserve Pool (`$35`)** yang dikunci khusus untuk akun juri (`is_judge_demo = true`). | **M** | Saat anggaran pengguna publik mencapai \$100, pengguna publik otomatis dilayani oleh *Eco-Saver Cache Mode*, sementara akun Juri tetap mendapatkan inferensi AI live penuh dari cadangan \$35. |

---

## 6. Non-Functional Requirements (NFR) & Kriteria Rilis

1. **Performa**: Waktu muat awal (LCP) $\le 2.5\text{ detik}$; kanvas 3D Eco-Island dan 3D Radar berjalan $\ge 45\text{ FPS}$ pada laptop iGPU standar; ukuran aset model 3D eksternal = **`0 KB`** (100% geometri prosedural).
2. **Keamanan & Privasi**: Seluruh kunci rahasia (`META_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) terisolasi di server (`server-only`); *Row-Level Security (RLS)* aktif di semua tabel pengguna; metadata EXIF GPS dihapus dari semua foto; lokasi rumah dibulatkan ke 2 desimal.
3. **Ketersediaan Demo (Zero-Crash Guarantee)**: Jika API eksternal (Meta, Open-Meteo, Overpass) mengalami gangguan atau kuota habis, aplikasi **tidak boleh crash** dan wajib beralih mulus ke data cache/deterministik dengan pemberitahuan status yang jelas di HUD.
