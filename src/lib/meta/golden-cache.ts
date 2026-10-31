/**
 * Pre-Computed Golden Demo Cache ($0.00 API Cost for Sample Scans, Retrofits, & Academy Tracks)
 * Ensures instantaneous (< 150ms) response for residents and protects the $150 Meta credit pool.
 */

import type { MaterialCode, SizeClassHint } from "../science/valuation";
import type { NormalizedMask, ProofRequirementSpec } from "../lens/masks";

export interface GoldenSampleObject {
  id: string;
  concept: string;
  materialCode: MaterialCode;
  sizeClassHint: SizeClassHint;
  score: number;
  mask: NormalizedMask;
  disposalEn: string;
  disposalId: string;
  upcyclingRecipe: {
    titleEn: string;
    titleId: string;
    stepsEn: string[];
    stepsId: string[];
    tools: string[];
    safetyNoteEn: string | null;
    safetyNoteId: string | null;
  };
}

export interface GoldenLensSample {
  id: string;
  titleEn: string;
  titleId: string;
  subtitleEn: string;
  subtitleId: string;
  mode: "waste" | "plant" | "retrofit";
  svgSceneType: "recyclables_bench" | "ewaste_desk" | "patio_retrofit" | "plant_canopy";
  sha256: string;
  objects: GoldenSampleObject[];
  plantDiagnostics?: {
    plantNameEn: string;
    plantNameId: string;
    leafAreaRatio: number;
    lesionAreaRatio: number;
    carePlanEn: string[];
    carePlanId: string[];
  };
  retrofitSpec?: {
    beforeSummaryEn: string;
    beforeSummaryId: string;
    afterSummaryEn: string;
    afterSummaryId: string;
    promptUsed: string;
    projectedSolarKwp: number;
    projectedRainLitersYr: number;
    coolingDeltaC: number;
  };
}

export const GOLDEN_LENS_SAMPLES: GoldenLensSample[] = [
  {
    id: "sample-waste-01",
    titleEn: "Household Recyclables Table",
    titleId: "Meja Daur Ulang Rumah Tangga",
    subtitleEn: "PET Bottles, Aluminum Cans, Corrugated Box & Glass Jar",
    subtitleId: "Botol PET, Kaleng Aluminium, Kardus & Toples Kaca",
    mode: "waste",
    svgSceneType: "recyclables_bench",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    objects: [
      {
        id: "obj-pet-1",
        concept: "clear plastic bottle",
        materialCode: "PET",
        sizeClassHint: "small",
        score: 0.97,
        mask: {
          bbox: [0.09, 0.22, 0.15, 0.56],
          polygon: [
            [0.14, 0.22],
            [0.19, 0.22],
            [0.23, 0.34],
            [0.23, 0.76],
            [0.1, 0.76],
            [0.1, 0.34],
          ],
          areaRatio: 0.078,
        },
        disposalEn: "Empty liquid, keep cap attached (CA/EU rule), crush lightly, and redeem at RVM or curbside bin.",
        disposalId: "Kosongkan cairan, lepas label, bilas bersih, dan setorkan ke Bank Sampah atau RVM.",
        upcyclingRecipe: {
          titleEn: "Sub-Irrigated Capillary Herb Planter",
          titleId: "Pot Tanaman Herbal Kapiler Otomatis",
          stepsEn: [
            "Cut the PET bottle horizontally 12 cm from the bottom base.",
            "Thread a 15 cm braided cotton wick through a 6 mm hole in the bottle cap.",
            "Fill the lower reservoir half with clean water and invert the top funnel into it.",
            "Add 2 cm of expanded clay pebbles followed by potting mix and basil/mint cuttings.",
          ],
          stepsId: [
            "Potong botol PET secara horizontal 12 cm dari bagian dasar.",
            "Masukkan sumbu kain katun 15 cm melalui lubang kecil pada tutup botol.",
            "Isi bagian bawah dengan air bersih lalu balikkan corong bagian atas botol ke dalamnya.",
            "Tambahkan media tanam kompos dan bibit kemangi atau mint.",
          ],
          tools: ["Precision craft knife", "Cotton wick", "Compost soil"],
          safetyNoteEn: "Sand cut plastic edges with fine sandpaper to prevent sharp rims.",
          safetyNoteId: "Haluskan tepi potongan plastik agar tidak tajam saat dipegang.",
        },
      },
      {
        id: "obj-alu-1",
        concept: "aluminum beverage can",
        materialCode: "ALU",
        sizeClassHint: "small",
        score: 0.96,
        mask: {
          bbox: [0.28, 0.38, 0.14, 0.4],
          polygon: [
            [0.3, 0.38],
            [0.41, 0.38],
            [0.42, 0.77],
            [0.28, 0.77],
          ],
          areaRatio: 0.054,
        },
        disposalEn: "Rinse residue. Do not crush if redeeming at optical barcode RVM (CalRecycle / Pfand).",
        disposalId: "Bilas sisa minuman. Simpan utuh untuk RVM atau pipihkan untuk timbangan Bank Sampah.",
        upcyclingRecipe: {
          titleEn: "Solar Passive Air Heater Collector Tube",
          titleId: "Tabung Kolektor Pemanas Udara Surya Pasif",
          stepsEn: [
            "Rinse and dry 6 aluminum cans thoroughly.",
            "Perforate the top and bottom domes in a star pattern to create airflow baffles.",
            "Stack and seal cans with high-temp silicone inside an insulated window box frame.",
            "Coat exterior in matte black bio-paint to absorb solar thermal radiation.",
          ],
          stepsId: [
            "Bilas dan keringkan kaleng aluminium hingga bersih.",
            "Lubangi bagian atas dan bawah kaleng membentuk sirip sirkulasi udara.",
            "Susun kaleng memanjang di dalam bingkai kotak kayu berpenutup kaca.",
            "Lapisi bagian luar kaleng dengan warna hitam doff penyerap panas matahari.",
          ],
          tools: ["Can opener", "High-temp sealant", "Matte black coating"],
          safetyNoteEn: "Wear cut-resistant gloves when perforating thin aluminum sheet.",
          safetyNoteId: "Gunakan sarung tangan pelindung saat melubangi lembaran aluminium tipis.",
        },
      },
      {
        id: "obj-card-1",
        concept: "corrugated cardboard box",
        materialCode: "CARDBOARD",
        sizeClassHint: "large",
        score: 0.94,
        mask: {
          bbox: [0.46, 0.25, 0.28, 0.52],
          polygon: [
            [0.46, 0.28],
            [0.72, 0.25],
            [0.74, 0.75],
            [0.47, 0.77],
          ],
          areaRatio: 0.142,
        },
        disposalEn: "Remove plastic packing tape, flatten box completely, and keep dry for paper/cardboard recovery.",
        disposalId: "Lepaskan lakban plastik, lipat kardus hingga rata, dan jaga tetap kering untuk disetor ke Bank Sampah.",
        upcyclingRecipe: {
          titleEn: "Sheet-Mulch Weed Barrier & Carbon Compost Brown Layer",
          titleId: "Mulsa Lembaran Penahan Gulma & Karbon Kompos",
          stepsEn: [
            "Strip all synthetic tape, glossy labels, and metal staples from the box.",
            "Lay overlapping flat cardboard sheets directly over garden bed weeds.",
            "Soak thoroughly with harvested rainwater to kickstart mycorrhizal breakdown.",
            "Top with 6 cm of finished compost and woodchips for a no-dig planting bed.",
          ],
          stepsId: [
            "Lepaskan seluruh lakban plastik, stiker mengkilap, dan staples logam.",
            "Hamparkan lembaran kardus di atas tanah kebun untuk menekan gulma tanpa herbisida.",
            "Siram dengan air hujan agar kardus lembap dan mengundang cacing tanah.",
            "Tutup bagian atasnya dengan 6 cm kompos matang siap tanam.",
          ],
          tools: ["Watering can", "Compost", "Utility blade"],
          safetyNoteEn: null,
          safetyNoteId: null,
        },
      },
      {
        id: "obj-glass-1",
        concept: "clear glass jar",
        materialCode: "GLASS",
        sizeClassHint: "small",
        score: 0.93,
        mask: {
          bbox: [0.77, 0.34, 0.15, 0.43],
          polygon: [
            [0.79, 0.34],
            [0.9, 0.34],
            [0.92, 0.76],
            [0.77, 0.76],
          ],
          areaRatio: 0.061,
        },
        disposalEn: "Separate metal lid from glass body; rinse and place in color-sorted glass container.",
        disposalId: "Pisahkan tutup logam dari badan kaca, cuci bersih, dan gunakan ulang atau setor ke dropbox kaca.",
        upcyclingRecipe: {
          titleEn: "Countertop Microgreens & Sprouting Vessel",
          titleId: "Toples Semai Microgreens Dapur",
          stepsEn: [
            "Sterilize the glass jar in warm water and remove the solid metal inner disc.",
            "Cut a circle of stainless steel mesh to fit inside the screw-top ring.",
            "Soak 2 tablespoons of broccoli or mung bean seeds overnight, then drain via the mesh.",
            "Rinse twice daily at a 45° angle until nutrient-dense sprouts fill the jar in 4 days.",
          ],
          stepsId: [
            "Cuci bersih toples kaca dengan air hangat dan lepas piringan tengah tutupnya.",
            "Pasang kawat kasa nirkarat (mesh) pada cincin ulir tutup toples.",
            "Rendam 2 sendok makan biji kacang hijau atau brokoli semalaman lalu tiriskan.",
            "Bilas dua kali sehari pada sudut miring hingga panen kecambah segar dalam 4 hari.",
          ],
          tools: ["Stainless mesh screen", "Seeds", "Water"],
          safetyNoteEn: null,
          safetyNoteId: null,
        },
      },
    ],
  },
  {
    id: "sample-retrofit-01",
    titleEn: "Backyard Patio & Roof → Biophilic Eco-Retrofit",
    titleId: "Teras & Atap Rumah → Renovasi Arsitektur Hijau",
    subtitleEn: "SAM 3.1 Zone Segmentation + Meta Muse Image Before/After",
    subtitleId: "Segmentasi Zona SAM 3.1 + Transformasi Before/After Muse Image",
    mode: "retrofit",
    svgSceneType: "patio_retrofit",
    sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    objects: [
      {
        id: "obj-zone-roof",
        concept: "south-facing pitched roof surface",
        materialCode: "STEEL",
        sizeClassHint: "large",
        score: 0.98,
        mask: {
          bbox: [0.08, 0.08, 0.84, 0.34],
          polygon: [
            [0.18, 0.08],
            [0.82, 0.08],
            [0.92, 0.4],
            [0.08, 0.4],
          ],
          areaRatio: 0.26,
        },
        disposalEn: "Prime structural zone for 16-panel monocrystalline PV array + gutter first-flush diverter.",
        disposalId: "Zona atap utama untuk instalasi 16 panel surya monokristalin + talang pemanen air hujan.",
        upcyclingRecipe: {
          titleEn: "High-Albedo Cool Roof + 6.4 kWp Solar Array",
          titleId: "Atap Sejuk Reflektif + Array Surya 6,4 kWp",
          stepsEn: [
            "Install anodized aluminum rail mounts anchored to roof rafters.",
            "Mount 16 high-efficiency 400W monocrystalline panels at optimal latitude tilt.",
            "Route gutter downspouts through a 200-micron leaf screen into a 3,000L modular cistern.",
          ],
          stepsId: [
            "Pasang rel dudukan aluminium anodisa pada rangka kuda-kuda atap.",
            "Pasang 16 panel surya 400W dengan sudut kemiringan sesuai lintang kota.",
            "Hubungkan pipa talang atap melalui saringan daun menuju tandon air hujan 3.000L.",
          ],
          tools: ["Solar rail kit", "First-flush diverter", "Cistern"],
          safetyNoteEn: "Certified electrical & roof harness installation required.",
          safetyNoteId: "Gunakan teknisi listrik bersertifikat dan sabuk pengaman ketinggian.",
        },
      },
      {
        id: "obj-zone-yard",
        concept: "impervious concrete patio slab",
        materialCode: "ORGANIC",
        sizeClassHint: "large",
        score: 0.95,
        mask: {
          bbox: [0.1, 0.52, 0.8, 0.42],
          polygon: [
            [0.14, 0.54],
            [0.86, 0.54],
            [0.9, 0.92],
            [0.1, 0.92],
          ],
          areaRatio: 0.31,
        },
        disposalEn: "Convert 45% of heat-trapping concrete into permeable bioswale, biopore shafts, and native shade pergola.",
        disposalId: "Ubah permukaan perkerasan panas menjadi taman resapan hujan, biopori, dan pergola tanaman rambat.",
        upcyclingRecipe: {
          titleEn: "Permeable Rain Garden & Native Pollinator Pergola",
          titleId: "Taman Hujan Permeabel & Pergola Peneduh Alami",
          stepsEn: [
            "Core-drill 8 biopore infiltration shafts (10 cm diameter, 100 cm depth) along patio perimeter.",
            "Fill biopore shafts with organic kitchen/leaf compost and cap with perforated grates.",
            "Plant climate-matched native shade trees and raised modular cedar vegetable beds.",
          ],
          stepsId: [
            "Bor 8 lubang resapan biopori (diameter 10 cm, kedalaman 100 cm) di tepi halaman.",
            "Isi lubang biopori dengan sampah organik dedaunan dan tutup dengan saringan berlubang.",
            "Tanam pohon peneduh lokal sesuai zona iklim Köppen dan bedengan sayur modular.",
          ],
          tools: ["Soil auger", "Perforated PVC pipe", "Native saplings"],
          safetyNoteEn: null,
          safetyNoteId: null,
        },
      },
    ],
    retrofitSpec: {
      beforeSummaryEn: "Exposed dark roof + heat-absorbing concrete patio (High runoff, 0 kWh solar, +4.2°C heat island).",
      beforeSummaryId: "Atap gelap terbuka + halaman beton penyerap panas (Limpasan air tinggi, 0 kWh surya, +4,2°C panas).",
      afterSummaryEn: "6.4 kWp Solar Array + 3,000L Rain Cistern + Permeable Native Bioswale & Timber Shade Pergola.",
      afterSummaryId: "Panel Surya 6,4 kWp + Tandon Hujan 3.000L + Taman Resapan Biopori & Pergola Peneduh Hijau.",
      promptUsed:
        "Architectural biophilic eco-retrofit aligned to SAM 3.1 roof and patio masks: monocrystalline solar array on roof, modular rainwater harvesting cistern on side wall, permeable stone patio with lush native rain garden bioswale and timber pergola.",
      projectedSolarKwp: 6.4,
      projectedRainLitersYr: 142500,
      coolingDeltaC: -3.4,
    },
  },
  {
    id: "sample-ewaste-01",
    titleEn: "Urban E-Waste & Battery Workbench",
    titleId: "Meja Kerja Limbah Elektronik (E-Waste) & Baterai",
    subtitleEn: "Lithium Cells, Circuit Board & Copper/Aluminum Heatsink",
    subtitleId: "Baterai Lithium, Papan Sirkuit PCB & Heatsink Aluminium",
    mode: "waste",
    svgSceneType: "ewaste_desk",
    sha256: "4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
    objects: [
      {
        id: "obj-ewaste-1",
        concept: "discarded circuit board laptop module",
        materialCode: "EWASTE",
        sizeClassHint: "large",
        score: 0.96,
        mask: {
          bbox: [0.12, 0.24, 0.44, 0.52],
          polygon: [
            [0.12, 0.26],
            [0.54, 0.24],
            [0.56, 0.74],
            [0.14, 0.76],
          ],
          areaRatio: 0.21,
        },
        disposalEn: "NEVER place in household trash. Deliver to certified WEEE / E-Waste drop-off for gold, copper, and rare-earth recovery.",
        disposalId: "JANGAN dibuang ke tempat sampah biasa. Serahkan ke Dropbox E-Waste resmi untuk pemulihan tembaga & logam mulia.",
        upcyclingRecipe: {
          titleEn: "Safe Data Wipe & Modular Component Harvesting",
          titleId: "Penghapusan Data Aman & Panen Komponen Modular",
          stepsEn: [
            "Remove any removable SSD/NVMe storage and perform a cryptographic secure erase.",
            "Detach standardized cooling fans, heatsinks, and 5V USB power modules for maker projects.",
            "Log item weight and route main PCB to the nearest certified e-waste hub on 3D Radar.",
          ],
          stepsId: [
            "Lepaskan media penyimpanan dan lakukan penghapusan data aman.",
            "Simpan kipas pendingin, heatsink aluminium, dan modul daya yang masih berfungsi.",
            "Antarkan papan PCB utama ke titik Dropbox E-Waste terdekat di Peta Radar 3D.",
          ],
          tools: ["Precision screwdriver set", "ESD strap"],
          safetyNoteEn: "Do not incinerate or crush capacitors on circuit boards.",
          safetyNoteId: "Jangan membakar atau merusak kapasitor pada papan sirkuit.",
        },
      },
      {
        id: "obj-bat-1",
        concept: "lithium ion battery pack",
        materialCode: "BATTERY",
        sizeClassHint: "small",
        score: 0.95,
        mask: {
          bbox: [0.62, 0.36, 0.24, 0.36],
          polygon: [
            [0.62, 0.36],
            [0.86, 0.36],
            [0.86, 0.72],
            [0.62, 0.72],
          ],
          areaRatio: 0.086,
        },
        disposalEn: "Tape battery terminals with non-conductive electrical tape and drop off at hazardous battery collection bin.",
        disposalId: "Tutup kutub baterai dengan isolasi listrik dan masukkan ke kotak khusus limbah B3/baterai.",
        upcyclingRecipe: {
          titleEn: "Terminal Insulation & Safe Fireproof Staging Protocol",
          titleId: "Protokol Isolasi Kutub & Penyimpanan Aman Baterai",
          stepsEn: [
            "Inspect battery casing for any swelling; if swollen, isolate in sand or glass container.",
            "Cover both positive and negative terminals firmly with electrical or kapton tape.",
            "Store in a cool dry jar away from direct sunlight until drop-off at the hazardous waste hub.",
          ],
          stepsId: [
            "Periksa fisik baterai; jika menggembung, pisahkan di dalam wadah kaca berisi pasir kering.",
            "Tutup kutub positif dan negatif dengan lakban listrik agar tidak korsleting.",
            "Bawa ke titik pengumpulan limbah B3/E-Waste yang tertera pada Radar 3D.",
          ],
          tools: ["Electrical tape", "Glass storage jar"],
          safetyNoteEn: "Never puncture or short-circuit lithium cells (thermal runaway hazard).",
          safetyNoteId: "Jangan pernah menusuk atau menghubung-singkatkan kutub baterai lithium.",
        },
      },
    ],
  },
  {
    id: "sample-plant-01",
    titleEn: "Urban Garden Leaf Canopy Diagnostics",
    titleId: "Diagnostik Kanopi Daun Kebun Perkotaan",
    subtitleEn: "SAM 3.1 Leaf vs. Chlorosis/Lesion Pixel Area Ratio",
    subtitleId: "Rasio Luas Piksel Daun vs Bercak Klorosis SAM 3.1",
    mode: "plant",
    svgSceneType: "plant_canopy",
    sha256: "d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
    objects: [
      {
        id: "obj-leaf-1",
        concept: "healthy green plant leaf lamina",
        materialCode: "ORGANIC",
        sizeClassHint: "large",
        score: 0.97,
        mask: {
          bbox: [0.14, 0.14, 0.72, 0.72],
          polygon: [
            [0.5, 0.14],
            [0.82, 0.34],
            [0.78, 0.76],
            [0.5, 0.86],
            [0.22, 0.76],
            [0.18, 0.34],
          ],
          areaRatio: 0.42,
        },
        disposalEn: "Primary photosynthetic leaf canopy area segmented by SAM 3.1 (42.0% of frame).",
        disposalId: "Area kanopi daun fotosintesis utama yang disegmentasi oleh SAM 3.1 (42,0% bingkai).",
        upcyclingRecipe: {
          titleEn: "7-Day Microclimate & Compost Tea Foliar Protocol",
          titleId: "Protokol Perawatan Iklim Mikro & Kompos Cair 7 Hari",
          stepsEn: [
            "Day 1-2: Prune necrotic leaf margins with sterilized shears and improve airflow.",
            "Day 3-4: Apply aerated compost tea drench at root zone during early morning hours.",
            "Day 5-7: Add 3 cm organic leaf mulch to stabilize soil moisture and re-scan canopy.",
          ],
          stepsId: [
            "Hari 1-2: Pangkas bagian tepi daun yang rusak dengan gunting bersih untuk sirkulasi udara.",
            "Hari 3-4: Siram zona akar dengan teh kompos organik cair pada pagi hari.",
            "Hari 5-7: Tambahkan mulsa daun kering 3 cm untuk menjaga kelembapan tanah.",
          ],
          tools: ["Pruning shears", "Organic compost tea", "Mulch"],
          safetyNoteEn: "Geometric pixel ratio estimate only, not a clinical agronomic diagnosis.",
          safetyNoteId: "Estimasi rasio geometri piksel, bukan diagnosis agronomi profesional.",
        },
      },
      {
        id: "obj-lesion-1",
        concept: "yellow necrotic leaf spot lesion",
        materialCode: "OTHER",
        sizeClassHint: "small",
        score: 0.91,
        mask: {
          bbox: [0.54, 0.36, 0.16, 0.18],
          polygon: [
            [0.56, 0.38],
            [0.68, 0.36],
            [0.7, 0.52],
            [0.54, 0.54],
          ],
          areaRatio: 0.048,
        },
        disposalEn: "Localized chlorosis/lesion region: 11.4% of total leaf surface (Moderate band).",
        disposalId: "Area bercak/klorosis terlokalisasi: 11,4% dari luas total permukaan daun (Kategori Sedang).",
        upcyclingRecipe: {
          titleEn: "Targeted Leaf Hygiene & Shade Cloth Adjustment",
          titleId: "Sanitasi Daun Terfokus & Penyesuaian Peneduh",
          stepsEn: [
            "Avoid overhead watering in late evening to keep leaf surfaces dry overnight.",
            "Check soil drainage and ensure pot or bed has unobstructed percolation.",
          ],
          stepsId: [
            "Hindari penyiraman dari atas daun pada malam hari agar permukaan daun tidak lembap.",
            "Pastikan drainase media tanam lancar dan tidak menggenang.",
          ],
          tools: ["Moisture meter", "Breathable mulch"],
          safetyNoteEn: "Dispose of pruned diseased leaves away from cold compost piles.",
          safetyNoteId: "Pisahkan pangkasan daun yang berbercak dari tumpukan kompos dingin.",
        },
      },
    ],
    plantDiagnostics: {
      plantNameEn: "Urban Culinary Herb / Broadleaf Crop",
      plantNameId: "Tanaman Pangan / Herbal Kebun Perkotaan",
      leafAreaRatio: 0.42,
      lesionAreaRatio: 0.048,
      carePlanEn: [
        "Day 1: Prune the 11.4% affected leaf sector with alcohol-wiped shears.",
        "Day 2: Check top 5 cm soil moisture; water only at root base at 07:00 AM.",
        "Day 3: Top-dress root zone with 2 cm mature vermicompost.",
        "Day 4: Inspect underside of leaves for aphids/mites; mist with diluted neem if present.",
        "Day 5: Ensure 30% afternoon shade if ambient temperature exceeds 32°C.",
        "Day 6: Aerate compacted topsoil gently to improve oxygen flow to roots.",
        "Day 7: Re-capture leaf photo in Verdara Lens to verify lesion ratio stays < 5%.",
      ],
      carePlanId: [
        "Hari 1: Pangkas bagian daun yang terdampak (11,4%) dengan gunting bersih.",
        "Hari 2: Cek kelembapan tanah 5 cm teratas; siram hanya di pangkal akar pukul 07.00.",
        "Hari 3: Tambahkan 2 cm kompos kascing matang di sekitar zona perakaran.",
        "Hari 4: Periksa bagian bawah daun; semprot larutan nimba organik jika ada hama.",
        "Hari 5: Berikan naungan paranet 30% jika suhu siang melampaui 32°C.",
        "Hari 6: Gemburkan permukaan tanah secara perlahan untuk aerasi akar.",
        "Hari 7: Pindai ulang daun di Verdara Lens untuk memastikan rasio bercak turun < 5%.",
      ],
    },
  },
];

export interface AcademyLessonSpec {
  id: string;
  trackId: "zero_waste" | "urban_farming" | "passive_cooling" | "rainwater";
  orderIndex: number;
  titleEn: string;
  titleId: string;
  summaryEn: string;
  summaryId: string;
  climateNoteByGroup: Record<string, { en: string; id: string }>;
  protocolStepsEn: string[];
  protocolStepsId: string[];
  quiz: {
    questionEn: string;
    questionId: string;
    optionsEn: string[];
    optionsId: string[];
    correctIndex: number;
  }[];
  proofRequirements: ProofRequirementSpec[];
  unlocksItemCode: string;
  unlocksItemLabelEn: string;
  unlocksItemLabelId: string;
  xpReward: number;
}

export const ACADEMY_LESSONS: AcademyLessonSpec[] = [
  {
    id: "lesson-zw-1",
    trackId: "zero_waste",
    orderIndex: 1,
    titleEn: "3-Stream Source Separation & Deposit Recovery Station",
    titleId: "Stasiun Pemilahan 3-Arus & Pemulihan Deposit Rumah",
    summaryEn:
      "Set up a dedicated home sorting station separating high-value recyclables (PET/ALU/Cardboard), aerobic organics, and hazardous e-waste.",
    summaryId:
      "Bangun stasiun pemilahan rumah tangga yang memisahkan daur ulang bernilai ekonomi (PET/ALU/Kardus), organik kompos, dan limbah B3/elektronik.",
    climateNoteByGroup: {
      A: {
        en: "Tropical (Group A): Rinse containers immediately and use lidded organic caddies to prevent fruit flies in warm humid air.",
        id: "Tropis (Grup A): Bilas kemasan segera dan gunakan wadah organik bertutup rapat agar bebas lalat buah di udara lembap.",
      },
      B: {
        en: "Arid (Group B): Store sorted PET and cardboard in shaded indoor bins to prevent UV embrittlement before RVM drop-off.",
        id: "Arid (Grup B): Simpan botol PET dan kardus di tempat teduh agar tidak rapuh terkena sinar UV sebelum disetor ke RVM.",
      },
      C: {
        en: "Temperate (Group C): Keep flattened cardboard dry during rainy autumn/winter collection cycles.",
        id: "Temperate (Grup C): Jaga kardus lipat tetap kering selama siklus pengumpulan musim gugur/dingin.",
      },
    },
    protocolStepsEn: [
      "Prepare at least 2 clearly separated containers or bins for Recyclables (PET/Cans/Paper) and Organics.",
      "Rinse and drain at least 2 beverage containers (plastic bottles or aluminum cans) so they are free of liquid residue.",
      "Flatten any cardboard boxes and stage them alongside your sorting bin for your Proof-of-Action photo.",
    ],
    protocolStepsId: [
      "Siapkan minimal 2 wadah/tempat sampah terpisah untuk Daur Ulang (Botol/Kaleng/Kardus) dan Organik.",
      "Bilas dan keringkan minimal 2 botol plastik PET atau kaleng minuman hingga bersih dari sisa cairan.",
      "Lipat rata kardus kemasan dan letakkan di dekat stasiun pemilahan untuk difoto sebagai bukti aksi.",
    ],
    quiz: [
      {
        questionEn: "Why must PET bottles and aluminum cans be emptied and rinsed before entering a recycling stream?",
        questionId: "Mengapa botol PET dan kaleng aluminium harus dikosongkan dan dibilas sebelum masuk ke jalur daur ulang?",
        optionsEn: [
          "Liquid residue contaminates paper/cardboard bales and increases rejection rates",
          "It changes the chemical polymer from PET to PVC",
          "Rinsing makes the plastic dissolve in water",
        ],
        optionsId: [
          "Sisa cairan mencemari tumpukan kertas/kardus dan meningkatkan penolakan di fasilitas daur ulang",
          "Air mengubah jenis polimer PET menjadi PVC",
          "Membilas botol membuat plastik larut di air",
        ],
        correctIndex: 0,
      },
      {
        questionEn: "According to US EPA WARM v16 factors in Verdara, which household material avoids the highest CO₂e per kg when recycled?",
        questionId: "Berdasarkan tabel US EPA WARM v16 di Verdara, material mana yang menghindari emisi CO₂e terbesar per kg saat didaur ulang?",
        optionsEn: [
          "Aluminum cans (~9.13 kg CO₂e avoided per kg)",
          "Mixed residual waste (0.00 kg CO₂e)",
          "Broken ceramic tiles",
        ],
        optionsId: [
          "Kaleng aluminium (~9,13 kg CO₂e dihindari per kg)",
          "Sampah residu campuran (0,00 kg CO₂e)",
          "Pecahan keramik lantai",
        ],
        correctIndex: 0,
      },
      {
        questionEn: "How does Verdara verify your Proof-of-Action photo in this module?",
        questionId: "Bagaimana Verdara memverifikasi foto Proof-of-Action kamu pada modul ini?",
        optionsEn: [
          "Meta SAM 3.1 segments required physical concepts and checks 64-bit dHash uniqueness",
          "It blindly accepts any uploaded image without inspection",
          "It asks a generic chatbot to guess if you are honest",
        ],
        optionsId: [
          "Meta SAM 3.1 melakukan segmentasi poligon objek wajib & memeriksa keunikan dHash 64-bit",
          "Menerima foto apa saja tanpa pemeriksaan piksel",
          "Meminta chatbot biasa menebak kejujuran pengguna",
        ],
        correctIndex: 0,
      },
    ],
    proofRequirements: [
      { concept: "recycling bin or sorting container", minCount: 1, weight: 2, required: true },
      { concept: "clean plastic bottle or aluminum can", minCount: 2, weight: 2, required: true },
      { concept: "flattened cardboard or paper", minCount: 1, weight: 1, required: false },
    ],
    unlocksItemCode: "sorting_station",
    unlocksItemLabelEn: "3-Stream Circular Sorting Station (3D Island Module)",
    unlocksItemLabelId: "Stasiun Pemilahan Sirkular 3-Arus (Modul Pulau 3D)",
    xpReward: 150,
  },
  {
    id: "lesson-uf-1",
    trackId: "urban_farming",
    orderIndex: 1,
    titleEn: "Aerobic Hot-Compost & Sub-Irrigated Micro-Planter",
    titleId: "Komposter Aerobik & Kebun Mikro Sub-Irigasi",
    summaryEn:
      "Convert kitchen organic scraps and dry carbon leaves into nutrient-rich humus while growing edible herbs in upcycled containers.",
    summaryId:
      "Ubah sisa organik dapur dan daun kering menjadi kompos subur sekaligus menanam herbal pangan di wadah daur ulang.",
    climateNoteByGroup: {
      A: {
        en: "Tropical (Group A): Balance high-moisture fruit scraps with 2x dry leaves or shredded cardboard to maintain aerobic airflow.",
        id: "Tropis (Grup A): Imbangi sisa buah basah dengan 2x lipat daun kering atau cacahan kardus agar kompos tetap aerobik.",
      },
      B: {
        en: "Arid (Group B): Use sub-irrigated wicking planters and mulch heavily to cut evaporative water loss by up to 60%.",
        id: "Arid (Grup B): Gunakan pot kapiler sub-irigasi dan mulsa tebal untuk menekan penguapan air hingga 60%.",
      },
      C: {
        en: "Temperate (Group C): Position micro-planters on south-facing windowsills or balconies to maximize solar gain.",
        id: "Temperate (Grup C): Tempatkan pot mikro di balkon atau ambang jendela yang menghadap matahari.",
      },
    },
    protocolStepsEn: [
      "Prepare a compost bin/bucket or a sub-irrigated planter container.",
      "Layer dry carbon browns (dry leaves / shredded cardboard) with green organic matter or soil.",
      "Plant or stage a living green herb/seedling and capture a clear photo showing the container and plant.",
    ],
    protocolStepsId: [
      "Siapkan wadah komposter atau pot tanam sub-irigasi hasil upcycling.",
      "Susun lapisan karbon coklat (daun kering / cacahan kardus) dengan media tanah/kompos.",
      "Tanam bibit tanaman hijau dan ambil foto bukti yang memperlihatkan pot beserta tanamannya.",
    ],
    quiz: [
      {
        questionEn: "What is the ideal Carbon-to-Nitrogen (Brown-to-Green) volume ratio in an odor-free home aerobic compost bin?",
        questionId: "Berapa rasio volume Karbon-terhadap-Nitrogen (Coklat-ke-Hijau) yang ideal agar komposter rumah bebas bau?",
        optionsEn: [
          "Roughly 2 to 3 parts dry Carbon browns to 1 part wet Nitrogen greens",
          "100% wet kitchen food scraps with zero airflow",
          "Plastic bags mixed with motor oil",
        ],
        optionsId: [
          "Sekitar 2 hingga 3 bagian Karbon kering (daun/kardus) berbanding 1 bagian Nitrogen basah (sisa sayur/buah)",
          "100% sisa makanan basah tertutup rapat tanpa udara",
          "Kantong plastik dicampur oli bekas",
        ],
        correctIndex: 0,
      },
      {
        questionEn: "Why does aerobic composting reduce greenhouse gas impact compared to sending food scraps to a landfill?",
        questionId: "Mengapa pengomposan aerobik menurunkan dampak gas rumah kaca dibanding membuang sisa makanan ke TPA?",
        optionsEn: [
          "It prevents anaerobic methane (CH₄) generation and sequesters carbon in soil humus",
          "It teleports organic matter into outer space",
          "It increases landfill leachate volume",
        ],
        optionsId: [
          "Mencegah pembentukan gas metana (CH₄) anaerobik di TPA dan mengikat karbon menjadi humus tanah",
          "Menghilangkan materi organik ke luar angkasa",
          "Meningkatkan air lindi di TPA",
        ],
        correctIndex: 0,
      },
      {
        questionEn: "What is the main water-saving advantage of a capillary sub-irrigated planter?",
        questionId: "Apa keunggulan penghematan air utama dari pot tanam kapiler sub-irigasi?",
        optionsEn: [
          "Water wicks upward directly to roots on demand, minimizing surface evaporation and runoff",
          "It requires watering 10 times every hour",
          "It boils the water before reaching the roots",
        ],
        optionsId: [
          "Air merambat naik langsung ke zona akar sesuai kebutuhan tanaman sehingga meminimalkan penguapan permukaan",
          "Harus disiram 10 kali setiap jam",
          "Mendidihkan air sebelum diserap akar",
        ],
        correctIndex: 0,
      },
    ],
    proofRequirements: [
      { concept: "plant pot or compost container", minCount: 1, weight: 2, required: true },
      { concept: "green plant leaves or seedling", minCount: 1, weight: 2, required: true },
      { concept: "soil or dry leaves mulch", minCount: 1, weight: 1, required: false },
    ],
    unlocksItemCode: "vertical_garden",
    unlocksItemLabelEn: "Biophilic Raised Bed & Compost Dome (3D Island Module)",
    unlocksItemLabelId: "Bedengan Kebun Vertikal & Kubah Kompos (Modul Pulau 3D)",
    xpReward: 150,
  },
  {
    id: "lesson-pc-1",
    trackId: "passive_cooling",
    orderIndex: 1,
    titleEn: "Solar Envelope Audit, Daylight Shading & Standby Load Cut",
    titleId: "Audit Selubung Surya, Peneduh Pasif & Pemangkasan Beban Listrik",
    summaryEn:
      "Reduce indoor thermal gain through exterior window shading/vegetation and eliminate phantom standby power loads.",
    summaryId:
      "Turunkan beban panas ruangan melalui peneduh jendela/vegetasi serta pangkas konsumsi listrik semu (phantom load).",
    climateNoteByGroup: {
      A: {
        en: "Tropical (Group A): Prioritize cross-ventilation and exterior west-facing shade to cut AC compressor runtime.",
        id: "Tropis (Grup A): Prioritaskan ventilasi silang dan peneduh sisi barat untuk memangkas jam kerja kompresor AC.",
      },
      B: {
        en: "Arid (Group B): Combine high-albedo window shading with daytime thermal mass closure.",
        id: "Arid (Grup B): Kombinasikan tirai peneduh reflektif di siang hari dengan pembukaan ventilasi malam.",
      },
      C: {
        en: "Temperate (Group C): Use deciduous shade or adjustable blinds that block summer highs while admitting winter sun.",
        id: "Temperate (Grup C): Gunakan peneduh yang menghalau terik musim panas namun tetap meneruskan cahaya hangat musim dingin.",
      },
    },
    protocolStepsEn: [
      "Run the Deterministic Housing Calculator on your roof in Verdara 3D Radar to inspect your kWp and TCI score.",
      "Set up a smart power strip or exterior/window shading element (blinds, overhang, or shade foliage).",
      "Capture a photo showing your window shading setup or smart power strip switches.",
    ],
    protocolStepsId: [
      "Jalankan Kalkulator Atap di Radar 3D Verdara untuk mengetahui potensi kWp surya dan skor TCI rumahmu.",
      "Pasang stopkontak ber-sakelar (pemutus beban standby) atau peneduh jendela/tanaman rambat.",
      "Ambil foto bukti yang menampilkan peneduh jendela atau sakelar stopkontak hemat energi tersebut.",
    ],
    quiz: [
      {
        questionEn: "Which shading strategy is more effective at stopping solar heat gain before it enters a room?",
        questionId: "Strategi peneduh mana yang paling efektif menahan panas radiasi matahari sebelum masuk ke dalam ruangan?",
        optionsEn: [
          "Exterior shading (overhangs, pergola foliage, awnings) that blocks radiation outside the glass",
          "Painting the inside walls pitch black",
          "Leaving west-facing glass unshaded at 3:00 PM",
        ],
        optionsId: [
          "Peneduh eksterior (tritisan atap, kanopi tanaman, kisi luar) yang menahan radiasi sebelum menembus kaca",
          "Mengecat dinding dalam dengan warna hitam pekat",
          "Membiarkan kaca menghadap barat tanpa pelindung pada pukul 15.00",
        ],
        correctIndex: 0,
      },
      {
        questionEn: "In the NREL PVWatts simplified formula used by Verdara, what does Performance Ratio (PR = 0.78) account for?",
        questionId: "Dalam rumus NREL PVWatts di Verdara, apa fungsi dari faktor Performance Ratio (PR = 0,78)?",
        optionsEn: [
          "Real-world inverter efficiency, panel temperature derating, wiring, and soiling losses",
          "The price of groceries at the local market",
          "The height of nearby ocean waves",
        ],
        optionsId: [
          "Efisiensi inverter nyata, penurunan daya akibat suhu panas panel, kabel, dan debu permukaan",
          "Harga bahan pokok di pasar lokal",
          "Tinggi gelombang laut",
        ],
        correctIndex: 0,
      },
      {
        questionEn: "How much household electricity can phantom standby loads (chargers, idle TVs, appliances) typically consume?",
        questionId: "Berapa rata-rata porsi tagihan listrik rumah tangga yang sering terbuang akibat beban standby (phantom load)?",
        optionsEn: [
          "5% to 10% of residential electricity use",
          "0%, plugged-in idle transformers never draw current",
          "250% of grid capacity",
        ],
        optionsId: [
          "5% hingga 10% dari konsumsi listrik rumah tangga",
          "0%, adaptor yang menancap tidak pernah menarik arus",
          "250% dari kapasitas gardu",
        ],
        correctIndex: 0,
      },
    ],
    proofRequirements: [
      { concept: "window blind curtain or shade overhang", minCount: 1, weight: 2, required: true },
      { concept: "power strip switch or solar panel", minCount: 1, weight: 1, required: false },
    ],
    unlocksItemCode: "solar_array",
    unlocksItemLabelEn: "Rooftop Monocrystalline Solar Array (3D Island Module)",
    unlocksItemLabelId: "Array Panel Surya Atap Monokristalin (Modul Pulau 3D)",
    xpReward: 200,
  },
  {
    id: "lesson-rw-1",
    trackId: "rainwater",
    orderIndex: 1,
    titleEn: "Rainwater Downspout Diverter & Biopore Infiltration Shaft",
    titleId: "Pemanen Air Hujan Talang & Lubang Resapan Biopori",
    summaryEn:
      "Capture roof rainwater runoff for non-potable irrigation and recharge groundwater aquifers using biopore shafts.",
    summaryId:
      "Tangkap limpasan air hujan atap untuk penyiraman tanaman serta isi ulang air tanah menggunakan lubang resapan biopori.",
    climateNoteByGroup: {
      A: {
        en: "Tropical (Group A): High monsoon downpours (>2,000 mm/yr) make biopore shafts critical to prevent localized street flooding.",
        id: "Tropis (Grup A): Curah hujan monsun tinggi (>2.000 mm/thn) menjadikan lubang biopori sangat krusial untuk mencegah genangan banjir.",
      },
      B: {
        en: "Arid (Group B): Every millimeter of rare winter rain is precious; route roof gutters into sealed dark cisterns to prevent evaporation.",
        id: "Arid (Grup B): Setiap tetes hujan sangat berharga; arahkan talang ke tandon tertutup gelap agar air tidak menguap.",
      },
      C: {
        en: "Temperate (Group C): Install a 200-micron leaf screen above your rain barrel to keep autumn leaves out of stored water.",
        id: "Temperate (Grup C): Pasang saringan daun 200 mikron di atas tong hujan agar guguran daun musim gugur tidak masuk ke tandon.",
      },
    },
    protocolStepsEn: [
      "Calculate your roof's annual rainwater harvest (L/year) and required biopore count in Verdara 3D Radar.",
      "Position a rainwater collection barrel/bucket under a roof downspout OR prepare a perforated biopore pipe in soil.",
      "Upload a photo showing the rainwater collector or biopore infiltration cap in place.",
    ],
    protocolStepsId: [
      "Hitung potensi panen air hujan tahunan (Liter/tahun) dan jumlah biopori rumahmu di Radar 3D Verdara.",
      "Tempatkan tong/ember penampung di bawah pipa talang hujan ATAU pasang pipa berlubang biopori di tanah halaman.",
      "Unggah foto bukti yang memperlihatkan penampung air hujan atau tutup lubang resapan biopori tersebut.",
    ],
    quiz: [
      {
        questionEn: "How many liters of water fall on 1 m² of roof footprint for every 1 mm of rainfall?",
        questionId: "Berapa liter air yang jatuh pada setiap 1 m² luasan datar atap untuk setiap 1 mm curah hujan?",
        optionsEn: [
          "Exactly 1 Liter (1 mm × 1 m² = 1 L before runoff/filter coefficients)",
          "0.001 Liters",
          "1,000 Liters",
        ],
        optionsId: [
          "Tepat 1 Liter (1 mm × 1 m² = 1 L sebelum dikalikan koefisien limpasan & filter)",
          "0,001 Liter",
          "1.000 Liter",
        ],
        correctIndex: 0,
      },
      {
        questionEn: "Why should a biopore infiltration hole (10 cm diameter, 80-100 cm deep) be filled with organic leaf litter?",
        questionId: "Mengapa lubang resapan biopori (diameter 10 cm, kedalaman 80-100 cm) perlu diisi sampah organik dedaunan?",
        optionsEn: [
          "Soil fauna (earthworms) feed on the organics and create natural macropores that keep infiltration rates high",
          "To seal the hole with concrete so water cannot enter",
          "To attract mosquitoes by leaving stagnant uncovered water",
        ],
        optionsId: [
          "Biota tanah (cacing) memakan organik tersebut dan membentuk pori-pori makro alami yang mempercepat resapan air",
          "Untuk menyumbat lubang agar air menggenang di permukaan",
          "Agar lubang berubah menjadi beton",
        ],
        correctIndex: 0,
      },
      {
        questionEn: "What is the purpose of a first-flush diverter on a roof rainwater harvesting system?",
        questionId: "Apa fungsi dari pipa pengalih tetesan pertama (first-flush diverter) pada sistem pemanen air hujan atap?",
        optionsEn: [
          "It diverts the first few liters of roof dust and bird droppings away from the clean storage cistern",
          "It pumps water back onto the roof",
          "It heats the rainwater to 100°C",
        ],
        optionsId: [
          "Mengalihkan bilasan air pertama yang membawa debu atap agar tidak masuk ke dalam tandon air bersih",
          "Memompa air kembali ke atas genteng",
          "Memanaskan air hujan hingga mendidih",
        ],
        correctIndex: 0,
      },
    ],
    proofRequirements: [
      { concept: "rainwater barrel bucket or downspout pipe", minCount: 1, weight: 2, required: true },
      { concept: "soil ground grate or garden bed", minCount: 1, weight: 1, required: false },
    ],
    unlocksItemCode: "rain_cistern",
    unlocksItemLabelEn: "3,000L Rainwater Cistern & Biopore Ring (3D Island Module)",
    unlocksItemLabelId: "Tandon Air Hujan 3.000L & Cincin Biopori (Modul Pulau 3D)",
    xpReward: 200,
  },
];
