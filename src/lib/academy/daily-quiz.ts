/**
 * Verdara Daily Climate Academy Quiz Engine
 * Generates a unique, deterministically seeded 5-question quiz every single calendar day.
 * Questions and answer order rotate automatically each day at 00:00 local time.
 */

export interface QuizQuestion {
  id: string;
  category: "solar" | "hydrology" | "biopore" | "meta_ai" | "circular" | "climate";
  categoryLabelEn: string;
  categoryLabelId: string;
  difficulty: "Fundamental" | "Intermediate" | "Advanced";
  questionEn: string;
  questionId: string;
  optionsEn: string[];
  optionsId: string[];
  correctIndex: number; // 0 to 3 index in the original array before daily shuffle
  explanationEn: string;
  explanationId: string;
}

export interface DailyQuizPack {
  dateStr: string; // "YYYY-MM-DD"
  displayDateEn: string;
  displayDateId: string;
  questions: QuizQuestion[];
  totalQuestions: number;
  totalXpPossible: number;
}

// Comprehensive Bank of 24 Deep Eco-Engineering & Climate Questions
export const QUESTION_BANK: QuizQuestion[] = [
  {
    id: "q-solar-1",
    category: "solar",
    categoryLabelEn: "Solar PV Engineering",
    categoryLabelId: "Teknik Panel Surya",
    difficulty: "Fundamental",
    questionEn: "According to NREL PVWatts standards, what is the typical system loss percentage (soiling, shading, wiring, inverter efficiency) factored into residential solar photovoltaic yields?",
    questionId: "Berdasarkan standar NREL PVWatts, berapa persentase rata-rata kehilangan daya sistem (debu, bayangan, kabel, efisiensi inverter) pada instalasi surya fotovoltaik atap rumah?",
    optionsEn: [
      "Approximately 14% (derate factor of ~0.86)",
      "Exactly 0% under modern microinverters",
      "Over 45% due to atmospheric refraction",
      "Around 5% regardless of temperature"
    ],
    optionsId: [
      "Sekitar 14% (faktor derate sekitar ~0.86)",
      "Tepat 0% jika menggunakan microinverter modern",
      "Lebih dari 45% akibat refraksi atmosfer",
      "Sekitar 5% tanpa terpengaruh suhu cuaca"
    ],
    correctIndex: 0,
    explanationEn: "NREL PVWatts defaults to an overall system loss of ~14.08% covering wiring, mismatch, nameplate rating, soiling, and inverter conversion.",
    explanationId: "NREL PVWatts menetapkan nilai default kehilangan daya sistem sebesar ~14.08% yang mencakup debu permukaan, rugi kabel, ketidakcocokan modul, dan konversi inverter."
  },
  {
    id: "q-solar-2",
    category: "solar",
    categoryLabelEn: "Solar PV Engineering",
    categoryLabelId: "Teknik Panel Surya",
    difficulty: "Intermediate",
    questionEn: "Why does extreme rooftop heat (above 25°C) actually reduce the power output of silicon solar panels?",
    questionId: "Mengapa suhu atap yang sangat panas (di atas 25°C) justru menurunkan daya listrik yang dihasilkan panel surya silikon?",
    optionsEn: [
      "Semiconductor temperature coefficient causes voltage drop as temperature rises",
      "Sunlight cannot penetrate heated solar glass",
      "Inverters automatically shut down at 26°C",
      "Electrons become completely immobilized in heat"
    ],
    optionsId: [
      "Koefisien suhu semikonduktor menyebabkan penurunan voltase saat suhu sel naik",
      "Sinar matahari terhalang dan memantul pada kaca yang panas",
      "Inverter otomatis mati total tepat di suhu 26°C",
      "Elektron membeku dan berhenti bergerak di temperatur tinggi"
    ],
    correctIndex: 0,
    explanationEn: "Monocrystalline silicon panels lose roughly 0.35% to 0.40% efficiency for every degree Celsius above the standard testing condition of 25°C (Pmax temperature coefficient).",
    explanationId: "Panel silikon monokristalin mengalami penurunan efisiensi sekitar 0.35% hingga 0.40% per kenaikan 1°C di atas suhu standar uji 25°C akibat penurunan tegangan sirkuit terbuka (Voc)."
  },
  {
    id: "q-hydro-1",
    category: "hydrology",
    categoryLabelEn: "Rainwater Harvesting",
    categoryLabelId: "Pemanenan Air Hujan",
    difficulty: "Fundamental",
    questionEn: "Under the international DIN 1989-1 standard, what is the purpose of the first-flush runoff coefficient (e.g., 0.80 - 0.85 for glazed tiles)?",
    questionId: "Berdasarkan standar internasional DIN 1989-1, apa tujuan dari koefisien limpasan (runoff coefficient 0.80 - 0.85 untuk genteng glazed)?",
    optionsEn: [
      "Accounts for water lost to surface wetting, evaporation, and initial diversion of roof contaminants",
      "Measures the chemical acidity of the incoming rainwater",
      "Calculates the maximum pump electrical draw during a storm",
      "Guarantees that 100% of rain entering the gutter fills the tank"
    ],
    optionsId: [
      "Memperhitungkan air yang hilang akibat pembasahan atap, penguapan, dan pembuangan awal kotoran atap (first flush)",
      "Mengukur tingkat keasaman kimiawi dari air hujan yang masuk",
      "Menghitung konsumsi daya listrik pompa saat hujan deras",
      "Menjamin bahwa 100% air hujan di talang langsung masuk ke dalam tangki"
    ],
    correctIndex: 0,
    explanationEn: "DIN 1989-1 applies a runoff coefficient (C_r) to represent real-world losses from roof absorption, wind splashing, and first-flush contaminant diversion.",
    explanationId: "DIN 1989-1 menerapkan koefisien limpasan (C_r) untuk merefleksikan air yang hilang karena membasahi pori genteng, cipratan angin, dan pengalihan air bilasan pertama pembersih debu."
  },
  {
    id: "q-hydro-2",
    category: "hydrology",
    categoryLabelEn: "Rainwater Harvesting",
    categoryLabelId: "Pemanenan Air Hujan",
    difficulty: "Intermediate",
    questionEn: "If a 120 m² roof receives 150 mm of monthly precipitation with a runoff coefficient of 0.85, approximately how many liters can be harvested that month?",
    questionId: "Jika atap 120 m² menerima curah hujan bulanan 150 mm dengan koefisien limpasan 0.85, kira-kira berapa liter air bersih yang dapat ditampung bulan tersebut?",
    optionsEn: [
      "15,300 Liters (120 × 150 × 0.85)",
      "1,800 Liters",
      "150,000 Liters",
      "55,000 Liters"
    ],
    optionsId: [
      "15.300 Liter (120 × 150 × 0.85)",
      "1.800 Liter",
      "150.000 Liter",
      "55.000 Liter"
    ],
    correctIndex: 0,
    explanationEn: "Volume (L) = Area (m²) × Rainfall (mm) × Runoff Coefficient = 120 × 150 × 0.85 = 15,300 liters (1 mm on 1 m² = exactly 1 liter).",
    explanationId: "Volume (Liter) = Luas (m²) × Curah Hujan (mm) × Koefisien = 120 × 150 × 0.85 = 15.300 liter (karena 1 mm hujan pada 1 m² atap menghasilkan tepat 1 liter air)."
  },
  {
    id: "q-bio-1",
    category: "biopore",
    categoryLabelEn: "Biopore & Soil Mechanics",
    categoryLabelId: "Biopori & Resapan Tanah",
    difficulty: "Fundamental",
    questionEn: "What is the recommended depth and diameter for a standard urban infiltration biopore hole (Lubang Resapan Biopori)?",
    questionId: "Berapa ukuran kedalaman dan diameter standar yang direkomendasikan untuk satu lubang resapan biopori perkotaan?",
    optionsEn: [
      "Diameter 10 cm, Depth 80 - 100 cm (above the groundwater table)",
      "Diameter 100 cm, Depth 10 meters",
      "Diameter 2 cm, Depth 15 cm",
      "Diameter 50 cm, Depth 50 cm into the permanent water table"
    ],
    optionsId: [
      "Diameter 10 cm, Kedalaman 80 - 100 cm (di atas muka air tanah dangkal)",
      "Diameter 100 cm, Kedalaman 10 meter",
      "Diameter 2 cm, Kedalaman 15 cm",
      "Diameter 50 cm, Kedalaman 50 cm menembus air tanah permanen"
    ],
    correctIndex: 0,
    explanationEn: "A 10 cm diameter cylindrical hole at 80-100 cm depth creates ~3,140 cm² of additional underground percolation surface without penetrating the saturated water table.",
    explanationId: "Lubang silinder diameter 10 cm dengan kedalaman 80-100 cm menciptakan ~3.140 cm² bidang resapan bawah tanah tambahan di dinding lubang tanpa mencemari air tanah dalam."
  },
  {
    id: "q-bio-2",
    category: "biopore",
    categoryLabelEn: "Biopore & Soil Mechanics",
    categoryLabelId: "Biopori & Resapan Tanah",
    difficulty: "Intermediate",
    questionEn: "Why must biopore holes be periodically filled with organic waste (leaf litter, kitchen scraps) rather than left empty?",
    questionId: "Mengapa lubang biopori harus diisi sampah organik dedaunan/sisa dapur dan tidak boleh dibiarkan kosong?",
    optionsEn: [
      "Decomposition feeds earthworms and soil fauna that excavate micro-canals for natural water percolation",
      "To produce toxic gases that kill urban weeds",
      "To prevent soil from absorbing any water",
      "Empty biopores cause spontaneous structural landslides"
    ],
    optionsId: [
      "Pembusukan bahan organik memicu cacing dan fauna tanah membuat lorong-lorong mikro (pori) peresap air",
      "Untuk memproduksi gas beracun yang membasmi gulma",
      "Untuk mencegah tanah menyerap air hujan",
      "Lubang biopori yang kosong dapat memicu tanah longsor spontan"
    ],
    correctIndex: 0,
    explanationEn: "Organic waste serves as food for soil fauna (especially earthworms and micro-organisms), which tunnel outward into the surrounding soil, creating extensive capillary pathways that amplify soil infiltration capacity by 300-400%.",
    explanationId: "Bahan organik menjadi sumber makanan cacing tanah dan mikroba. Aktivitas fauna tanah menggali lubang pori kapiler ke sekeliling tanah, melipatgandakan kecepatan peresapan air hingga 300-400%."
  },
  {
    id: "q-meta-1",
    category: "meta_ai",
    categoryLabelEn: "Meta AI & Vision",
    categoryLabelId: "Model AI Meta & Visi",
    difficulty: "Fundamental",
    questionEn: "In Verdara's architecture, what role does Meta Segment Anything Model (SAM 3.1) play?",
    questionId: "Dalam arsitektur Verdara, peran utama apa yang dijalankan oleh model Meta Segment Anything (SAM 3.1)?",
    optionsEn: [
      "Performs zero-shot spatial computer vision to segment roofs, drainage lines, and permeable soil polygons from photos",
      "Writes creative marketing essays about global warming",
      "Acts as an electrical inverter converting DC to AC power",
      "Replaces the PostgreSQL database schema"
    ],
    optionsId: [
      "Melakukan segmentasi visi spasial zero-shot untuk mendeteksi atap, jalur talang, dan poligon tanah resapan dari foto",
      "Menulis artikel fiksi pemasaran tentang perubahan iklim",
      "Berfungsi sebagai inverter listrik yang mengubah arus DC ke AC",
      "Menggantikan skema penyimpanan tabel basis data PostgreSQL"
    ],
    correctIndex: 0,
    explanationEn: "Meta SAM 3.1 is an open-foundation vision model specialized in zero-shot mask prediction, allowing Verdara to accurately isolate physical building surfaces from user photos without manual annotation.",
    explanationId: "Meta SAM 3.1 adalah model visi fondasi terbuka yang sangat andal dalam memprediksi poligon dan mask tanpa pelatihan ulang, memungkinkan Verdara mendeteksi batas atap dan ruang hijau dari foto pengguna secara instan."
  },
  {
    id: "q-meta-2",
    category: "meta_ai",
    categoryLabelEn: "Meta AI & Deliberation",
    categoryLabelId: "Model AI Meta & Deliberasi",
    difficulty: "Advanced",
    questionEn: "How does Verdara's Numeric Fact Firewall prevent Meta Muse Spark from hallucinating engineering figures?",
    questionId: "Bagaimana sistem Numeric Fact Firewall Verdara mencegah Meta Muse Spark berhalusinasi saat menyebutkan angka teknik?",
    optionsEn: [
      "By freezing calculated physics metrics into an immutable SITE_BRIEF and auditing emitted numbers within a strict ±3% tolerance",
      "By preventing the AI model from outputting any numbers whatsoever",
      "By training a custom 1-trillion parameter neural network every time a user types",
      "By using random coin flips to accept or reject AI sentences"
    ],
    optionsId: [
      "Dengan mengunci hasil rumus fisika ke dalam payload SITE_BRIEF dan mengaudit setiap angka AI dalam batas toleransi ketat ±3%",
      "Dengan melarang model AI menulis angka sama sekali dalam percakapan",
      "Dengan melatih ulang model 1 triliun parameter setiap kali pengguna mengetik pesan",
      "Dengan mengocok dadu secara acak untuk menerima atau menolak kalimat AI"
    ],
    correctIndex: 0,
    explanationEn: "Verdara enforces a strict deterministic pipeline: physics math runs first and freezes into SITE_BRIEF. When Muse Spark agents speak, an automated regex auditor checks every emitted figure against the truth brief.",
    explanationId: "Verdara menerapkan prinsip kepatuhan satu arah: rumus fisika dijalankan terlebih dahulu dan dikunci ke SITE_BRIEF. Ketika agen Muse Spark berdiskusi, validator regex mengaudit angka yang disebut agar tidak menyimpang lebih dari 3%."
  },
  {
    id: "q-circ-1",
    category: "circular",
    categoryLabelEn: "Circular Economy",
    categoryLabelId: "Ekonomi Sirkular",
    difficulty: "Fundamental",
    questionEn: "According to the US EPA WARM (Waste Reduction Model) v16, what is the environmental benefit of recycling aluminum cans compared to virgin bauxite smelting?",
    questionId: "Berdasarkan model US EPA WARM v16, apa keuntungan lingkungan terbesar dari mendaur ulang kaleng aluminium dibandingkan melebur bijih bauksit murni?",
    optionsEn: [
      "Saves up to 95% of the energy required for virgin extraction and dramatically lowers lifecycle CO₂",
      "Produces zero material return because aluminum degrades completely",
      "Consumes more water than coal mining",
      "Requires radioactive isotopes to melt properly"
    ],
    optionsId: [
      "Menghemat hingga 95% energi yang dibutuhkan dari penambangan baru dan memangkas emisi karbon CO₂ secara drastis",
      "Tidak menghasilkan keuntungan materi karena aluminium hancur total",
      "Mengonsumsi lebih banyak air dibandingkan tambang batu bara",
      "Memerlukan isotop radioaktif agar kaleng dapat meleleh kembali"
    ],
    correctIndex: 0,
    explanationEn: "Recycling aluminum requires only ~5% of the electrical energy needed to refine bauxite into primary aluminum, making it one of the highest-yield circular materials.",
    explanationId: "Daur ulang aluminium hanya membutuhkan ~5% energi listrik dibandingkan proses peleburan bauksit mentah, menjadikannya salah satu material sirkular dengan imbal hasil energi tertinggi di dunia."
  },
  {
    id: "q-circ-2",
    category: "circular",
    categoryLabelEn: "Circular Economy",
    categoryLabelId: "Ekonomi Sirkular",
    difficulty: "Intermediate",
    questionEn: "Why is sorting waste at the household source (Source Separation) vastly superior to mixed municipal sorting facilities?",
    questionId: "Mengapa pemilahan sampah langsung di sumber rumah tangga (Source Separation) jauh lebih unggul daripada pemilahan di TPA campuran?",
    optionsEn: [
      "Prevents organic moisture and oils from contaminating paper fibers and polymer recyclability",
      "Because municipal landfills prefer burning unsorted plastics",
      "Household sorting completely eliminates the need for trash trucks",
      "Mixed sorting is illegal in all 195 countries"
    ],
    optionsId: [
      "Mencegah cairan organik dan minyak mengotori serat kardus serta merusak kemurnian rantai polimer plastik",
      "Karena pengelola TPA lebih suka membakar plastik yang bercampur sampah basah",
      "Pemilahan rumah tangga menghapus kebutuhan armada truk pengangkut sampah",
      "Pemilahan campuran sudah dilarang di 195 negara di dunia"
    ],
    correctIndex: 0,
    explanationEn: "When food waste and recyclables mix in one bin, liquid leachate ruins paper and degrades plastic resin purity, reducing scrap economic value by over 60%.",
    explanationId: "Ketika sisa makanan basah bercampur dengan kardus dan plastik di satu tempat sampah, cairan lindi mengotori serat kertas dan merusak kualitas daur ulang plastik hingga nilainya anjlok 60%."
  },
  {
    id: "q-clim-1",
    category: "climate",
    categoryLabelEn: "Köppen Climate Classification",
    categoryLabelId: "Klasifikasi Iklim Köppen",
    difficulty: "Fundamental",
    questionEn: "Under the Köppen-Geiger climate classification, what major characteristic defines Climate Group 'A' (e.g., Jakarta, Singapore, Nairobi)?",
    questionId: "Dalam klasifikasi iklim Köppen-Geiger, apa ciri khas utama dari Grup Iklim 'A' (contoh: Jakarta, Singapura, Nairobi)?",
    optionsEn: [
      "Tropical climates where average temperature of all 12 months remains at or above 18°C (64.4°F)",
      "Polar permafrost climates where summer temperatures never exceed 0°C",
      "Arid desert climates with zero annual precipitation",
      "High-latitude tundra climates dominated by ice sheets"
    ],
    optionsId: [
      "Iklim tropis di mana suhu rata-rata seluruh 12 bulan dalam setahun berada di atas atau sama dengan 18°C",
      "Iklim kutub beku abadi di mana suhu musim panas tidak pernah melebihi 0°C",
      "Iklim gurun tandus dengan curah hujan nol sepanjang tahun",
      "Iklim tundra lintang tinggi yang diselimuti lapisan es abadi"
    ],
    correctIndex: 0,
    explanationEn: "Group A represents tropical megathermal climates where the mean temperature of the coldest month is 18°C or higher, characterized by strong solar irradiance and substantial rainfall.",
    explanationId: "Grup A mewakili iklim tropis megatermal di mana suhu bulan terdingin tidak pernah di bawah 18°C, ditandai dengan potensi radiasi surya melimpah dan curah hujan musiman yang signifikan."
  },
  {
    id: "q-clim-2",
    category: "climate",
    categoryLabelEn: "Urban Heat Island",
    categoryLabelId: "Efek Pulau Panas Perkotaan",
    difficulty: "Intermediate",
    questionEn: "What primary mechanism causes Urban Heat Islands (UHI) where city residential areas stay 3°C to 7°C hotter than surrounding rural fields at night?",
    questionId: "Apa mekanisme utama yang memicu fenomena Urban Heat Island (UHI) di mana pemukiman kota 3°C hingga 7°C lebih panas dibanding pedesaan saat malam?",
    optionsEn: [
      "Thermal mass of dark asphalt and dense concrete storing daytime solar heat and releasing it slowly overnight with low vegetated evapotranspiration",
      "Excessive oxygen production by urban plants",
      "Underground magma chambers unique to major metropolitan centers",
      "Friction between rubber car tires and street pavement"
    ],
    optionsId: [
      "Massa termal aspal gelap dan beton padat menyerap panas matahari siang hari lalu melepasnya lambat di malam hari minim evapotranspirasi pohon",
      "Produksi gas oksigen berlebih dari tanaman hias di taman kota",
      "Kantung magma bawah tanah yang hanya aktif di bawah kota-kota besar",
      "Gesekan antara ban karet mobil dan permukaan jalan raya"
    ],
    correctIndex: 0,
    explanationEn: "Impervious dark surfaces (asphalt albedo ~0.10) absorb high solar radiation and lack vegetative moisture evapotranspiration, slowly radiating heat long after sunset.",
    explanationId: "Permukaan kedap air yang gelap (albedo aspal ~0.10) menyerap radiasi matahari dalam jumlah masif dan minim pohon untuk pendinginan evapotranspirasi, memancarkan panas kembali berjam-jam setelah matahari terbenam."
  }
];

// Simple deterministic PRNG based on Mulberry32
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns a deterministic 5-question daily quiz pack based on calendar date.
 * Every day at 00:00, the questions and shuffled answer order rotate automatically!
 */
export function getDailyQuizPack(targetDate: Date = new Date()): DailyQuizPack {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();

  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // Form a numeric seed from date (e.g., 20261103)
  const seed = year * 10000 + month * 100 + day;
  const rng = mulberry32(seed);

  // Shuffle a copy of the question bank indices deterministically
  const indices = QUESTION_BANK.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // Pick top 5 questions for today
  const selectedQuestions: QuizQuestion[] = indices.slice(0, 5).map((qIdx) => {
    const orig = QUESTION_BANK[qIdx]!;
    // Also deterministically shuffle answer options so correctIndex isn't predictable
    const optIndices = [0, 1, 2, 3];
    for (let i = optIndices.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [optIndices[i], optIndices[j]] = [optIndices[j], optIndices[i]];
    }

    const shuffledOptionsEn = optIndices.map((idx) => orig.optionsEn[idx]!);
    const shuffledOptionsId = optIndices.map((idx) => orig.optionsId[idx]!);
    const newCorrectIndex = optIndices.indexOf(orig.correctIndex);

    return {
      ...orig,
      optionsEn: shuffledOptionsEn,
      optionsId: shuffledOptionsId,
      correctIndex: newCorrectIndex,
    };
  });

  const monthNamesEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthNamesId = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return {
    dateStr,
    displayDateEn: `${monthNamesEn[month - 1]} ${day}, ${year}`,
    displayDateId: `${day} ${monthNamesId[month - 1]} ${year}`,
    questions: selectedQuestions,
    totalQuestions: selectedQuestions.length,
    totalXpPossible: selectedQuestions.length * 20, // 100 XP max
  };
}
