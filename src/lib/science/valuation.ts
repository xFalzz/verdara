/**
 * Deterministic Circular Economy Material Valuation & EPA WARM CO₂e Engine
 * Zero-LLM-Hallucination Policy: Every currency value and emission factor is
 * resolved strictly from sourced jurisdiction rules and US EPA WARM v16 tables.
 */

export type MaterialCode =
  | "PET"
  | "HDPE"
  | "PP"
  | "FILM"
  | "ALU"
  | "STEEL"
  | "GLASS"
  | "PAPER"
  | "CARDBOARD"
  | "ORGANIC"
  | "EWASTE"
  | "BATTERY"
  | "OTHER";

export type MaterialCategory =
  | "recyclable"
  | "organic"
  | "hazardous"
  | "residual";

export type SizeClassHint = "small" | "large" | "unknown";

export interface MaterialFactor {
  code: MaterialCode;
  nameEn: string;
  nameId: string;
  category: MaterialCategory;
  typicalMassGSmall: number;
  typicalMassGLarge: number;
  co2eAvoidedKgPerKg: number; // US EPA WARM v16
  source: string;
}

export interface CountryPolicy {
  code: string; // 'US-CA', 'US', 'DE', 'GB', 'FR', 'JP', 'KR', 'SG', 'AE', 'AU', 'ID', 'BR', 'XX'
  nameEn: string;
  nameId: string;
  currency: string;
  defaultUnits: "metric" | "imperial";
  electricityTariff: number; // Local currency / kWh
  gridEfKgKwh: number;       // kg CO2e / kWh
  depositType:
    | "container_deposit"
    | "weight_buyback"
    | "municipal_separation";
  policySummaryEn: string;
  policySummaryId: string;
  containerRates?: Partial<
    Record<MaterialCode, { small: number; large: number }>
  >;
  weightRatesPerKg?: Partial<
    Record<MaterialCode, { min: number; max: number }>
  >;
  sourceCitation: string;
}

export const MATERIAL_FACTORS: Record<MaterialCode, MaterialFactor> = {
  PET: {
    code: "PET",
    nameEn: "PET #1 Plastic Bottle/Container",
    nameId: "Botol/Wadah Plastik PET #1",
    category: "recyclable",
    typicalMassGSmall: 18,
    typicalMassGLarge: 38,
    co2eAvoidedKgPerKg: 1.04,
    source: "US EPA WARM v16 (PET Recycled vs Landfilled)",
  },
  HDPE: {
    code: "HDPE",
    nameEn: "HDPE #2 Rigid Plastic Jug/Bottle",
    nameId: "Jeriken/Botol Plastik Tebal HDPE #2",
    category: "recyclable",
    typicalMassGSmall: 28,
    typicalMassGLarge: 65,
    co2eAvoidedKgPerKg: 0.88,
    source: "US EPA WARM v16 (HDPE Recycled)",
  },
  PP: {
    code: "PP",
    nameEn: "Polypropylene #5 Food Container",
    nameId: "Wadah Makanan Plastik PP #5",
    category: "recyclable",
    typicalMassGSmall: 16,
    typicalMassGLarge: 40,
    co2eAvoidedKgPerKg: 0.79,
    source: "US EPA WARM v16 (PP Plastics)",
  },
  FILM: {
    code: "FILM",
    nameEn: "LDPE #4 Plastic Film/Wrap",
    nameId: "Plastik Lembaran/Kresek LDPE #4",
    category: "recyclable",
    typicalMassGSmall: 6,
    typicalMassGLarge: 18,
    co2eAvoidedKgPerKg: 0.72,
    source: "US EPA WARM v16 (LLDPE Film)",
  },
  ALU: {
    code: "ALU",
    nameEn: "Aluminum Beverage Can / Foil",
    nameId: "Kaleng Minuman / Foil Aluminium",
    category: "recyclable",
    typicalMassGSmall: 14,
    typicalMassGLarge: 22,
    co2eAvoidedKgPerKg: 9.13,
    source: "US EPA WARM v16 (Aluminum Cans, Closed Loop)",
  },
  STEEL: {
    code: "STEEL",
    nameEn: "Steel / Tin Food Can",
    nameId: "Kaleng Baja / Logam Makanan",
    category: "recyclable",
    typicalMassGSmall: 45,
    typicalMassGLarge: 110,
    co2eAvoidedKgPerKg: 1.83,
    source: "US EPA WARM v16 (Steel Cans)",
  },
  GLASS: {
    code: "GLASS",
    nameEn: "Glass Bottle / Jar",
    nameId: "Botol / Toples Kaca",
    category: "recyclable",
    typicalMassGSmall: 190,
    typicalMassGLarge: 380,
    co2eAvoidedKgPerKg: 0.31,
    source: "US EPA WARM v16 (Glass Containers)",
  },
  PAPER: {
    code: "PAPER",
    nameEn: "Mixed Office Paper / Newspaper",
    nameId: "Kertas HVS / Koran Bekas",
    category: "recyclable",
    typicalMassGSmall: 25,
    typicalMassGLarge: 120,
    co2eAvoidedKgPerKg: 3.55,
    source: "US EPA WARM v16 (Mixed Paper)",
  },
  CARDBOARD: {
    code: "CARDBOARD",
    nameEn: "Corrugated Cardboard Box",
    nameId: "Kardus Gelombang / Karton Box",
    category: "recyclable",
    typicalMassGSmall: 140,
    typicalMassGLarge: 420,
    co2eAvoidedKgPerKg: 3.14,
    source: "US EPA WARM v16 (Corrugated Containers)",
  },
  ORGANIC: {
    code: "ORGANIC",
    nameEn: "Compostable Food / Yard Organics",
    nameId: "Sampah Organik Dapur / Daun Kompos",
    category: "organic",
    typicalMassGSmall: 85,
    typicalMassGLarge: 300,
    co2eAvoidedKgPerKg: 0.58,
    source: "US EPA WARM v16 (Aerobic Composting vs Methane Landfill)",
  },
  EWASTE: {
    code: "EWASTE",
    nameEn: "Electronic Waste / Circuit / Cable",
    nameId: "Limbah Elektronik (E-Waste) / Kabel",
    category: "hazardous",
    typicalMassGSmall: 180,
    typicalMassGLarge: 850,
    co2eAvoidedKgPerKg: 2.45,
    source: "US EPA WARM v16 (Personal Electronics Recovery)",
  },
  BATTERY: {
    code: "BATTERY",
    nameEn: "Lithium-Ion / Alkaline Battery",
    nameId: "Baterai Bekas (B3)",
    category: "hazardous",
    typicalMassGSmall: 24,
    typicalMassGLarge: 95,
    co2eAvoidedKgPerKg: 1.9,
    source: "EPA Critical Minerals & Battery Recovery Factor",
  },
  OTHER: {
    code: "OTHER",
    nameEn: "Mixed Residual Item",
    nameId: "Barang Residu Campuran",
    category: "residual",
    typicalMassGSmall: 30,
    typicalMassGLarge: 100,
    co2eAvoidedKgPerKg: 0.0,
    source: "Baseline Residual Stream",
  },
};

export const COUNTRY_POLICIES: Record<string, CountryPolicy> = {
  "US-CA": {
    code: "US-CA",
    nameEn: "United States (California CRV)",
    nameId: "Amerika Serikat (California CRV)",
    currency: "USD",
    defaultUnits: "imperial",
    electricityTariff: 0.32,
    gridEfKgKwh: 0.21,
    depositType: "container_deposit",
    policySummaryEn:
      "California Redemption Value (CalRecycle CRV): $0.05 for containers < 24 oz (710 ml) and $0.10 for >= 24 oz across PET, HDPE, Aluminum, and Glass.",
    policySummaryId:
      "California Redemption Value (CalRecycle CRV): $0,05 untuk wadah < 24 oz dan $0,10 untuk >= 24 oz (PET, HDPE, Aluminium, Kaca).",
    containerRates: {
      PET: { small: 0.05, large: 0.1 },
      HDPE: { small: 0.05, large: 0.1 },
      ALU: { small: 0.05, large: 0.1 },
      STEEL: { small: 0.05, large: 0.1 },
      GLASS: { small: 0.05, large: 0.1 },
    },
    weightRatesPerKg: {
      CARDBOARD: { min: 0.08, max: 0.14 },
      PAPER: { min: 0.05, max: 0.1 },
      EWASTE: { min: 0.4, max: 1.2 },
    },
    sourceCitation: "CalRecycle CRV Schedule 2025/2026 & CPUC Residential Tariff",
  },
  US: {
    code: "US",
    nameEn: "United States (Federal Average)",
    nameId: "Amerika Serikat (Rata-Rata Nasional)",
    currency: "USD",
    defaultUnits: "imperial",
    electricityTariff: 0.18,
    gridEfKgKwh: 0.37,
    depositType: "weight_buyback",
    policySummaryEn:
      "Single-stream municipal curbside recycling plus scrap metal/cardboard buyback centers.",
    policySummaryId:
      "Daur ulang tepi jalan kota (single-stream) serta pusat pembelian rongsok logam/kardus.",
    weightRatesPerKg: {
      ALU: { min: 1.1, max: 1.65 },
      PET: { min: 0.22, max: 0.38 },
      HDPE: { min: 0.3, max: 0.55 },
      CARDBOARD: { min: 0.07, max: 0.13 },
      STEEL: { min: 0.18, max: 0.3 },
      EWASTE: { min: 0.5, max: 1.4 },
    },
    sourceCitation: "US EIA Electric Power Monthly & EPA Municipal Facts",
  },
  DE: {
    code: "DE",
    nameEn: "Germany (DPG Pfand & Duales System)",
    nameId: "Jerman (Sistem Deposit DPG Pfand)",
    currency: "EUR",
    defaultUnits: "metric",
    electricityTariff: 0.37,
    gridEfKgKwh: 0.33,
    depositType: "container_deposit",
    policySummaryEn:
      "German DPG Einwegpfand returns €0.25 per single-use PET bottle or aluminum can at any supermarket RVM; Gelber Sack for packaging.",
    policySummaryId:
      "DPG Einwegpfand Jerman mengembalikan €0,25 per botol PET atau kaleng aluminium sekali pakai di mesin RVM supermarket.",
    containerRates: {
      PET: { small: 0.25, large: 0.25 },
      ALU: { small: 0.25, large: 0.25 },
      GLASS: { small: 0.08, large: 0.15 },
    },
    weightRatesPerKg: {
      CARDBOARD: { min: 0.06, max: 0.12 },
      EWASTE: { min: 0.45, max: 1.1 },
    },
    sourceCitation: "Deutsche Pfandsystem GmbH (DPG) & BDEW Strompreisanalyse",
  },
  GB: {
    code: "GB",
    nameEn: "United Kingdom (Council Recycling & Simpler Recycling)",
    nameId: "Inggris Raya (Daur Ulang Dewan Kota)",
    currency: "GBP",
    defaultUnits: "metric",
    electricityTariff: 0.28,
    gridEfKgKwh: 0.2,
    depositType: "weight_buyback",
    policySummaryEn:
      "UK Council dry mixed recycling, weekly food organics caddy, and registered scrap metal/WEEE points.",
    policySummaryId:
      "Daur ulang terpilah Dewan Kota Inggris, pengumpulan kompos makanan, dan titik WEEE.",
    weightRatesPerKg: {
      ALU: { min: 0.85, max: 1.3 },
      STEEL: { min: 0.15, max: 0.28 },
      PET: { min: 0.18, max: 0.32 },
      CARDBOARD: { min: 0.05, max: 0.1 },
      EWASTE: { min: 0.4, max: 1.0 },
    },
    sourceCitation: "Ofgem Energy Price Cap & DEFRA Simpler Recycling",
  },
  JP: {
    code: "JP",
    nameEn: "Japan (Strict Municipal Shigen Gomi Separation)",
    nameId: "Jepang (Pemilahan Ketat Shigen Gomi)",
    currency: "JPY",
    defaultUnits: "metric",
    electricityTariff: 31.0,
    gridEfKgKwh: 0.45,
    depositType: "municipal_separation",
    policySummaryEn:
      "Mandatory municipal Resource Waste (Shigen Gomi) sorting: remove cap & label, rinse PET bottles, flatten cardboard, and use supermarket collection boxes.",
    policySummaryId:
      "Pemilahan wajib Shigen Gomi: lepas tutup & label botol PET, bilas bersih, ikat kardus, dan gunakan kotak daur ulang supermarket.",
    weightRatesPerKg: {
      ALU: { min: 160, max: 230 },
      CARDBOARD: { min: 10, max: 18 },
      PAPER: { min: 8, max: 15 },
    },
    sourceCitation: "Ministry of the Environment Japan (MOEJ) Container & Packaging Recycling Act",
  },
  ID: {
    code: "ID",
    nameEn: "Indonesia (Bank Sampah Induk & TPS3R)",
    nameId: "Indonesia (Bank Sampah Induk & TPS3R)",
    currency: "IDR",
    defaultUnits: "metric",
    electricityTariff: 1445.0,
    gridEfKgKwh: 0.78,
    depositType: "weight_buyback",
    policySummaryEn:
      "Indonesian Bank Sampah (Waste Bank) network buys sorted clean PET bottles, aluminum cans, cardboard, and electronics by weight (kg).",
    policySummaryId:
      "Jaringan Bank Sampah Induk membeli botol PET bersih, kaleng aluminium, kardus, kertas, dan e-waste berdasarkan timbangan (kg).",
    weightRatesPerKg: {
      PET: { min: 3500, max: 5500 },
      HDPE: { min: 4000, max: 6000 },
      PP: { min: 2500, max: 4000 },
      ALU: { min: 14000, max: 18500 },
      STEEL: { min: 3000, max: 4800 },
      GLASS: { min: 500, max: 1200 },
      PAPER: { min: 2200, max: 3500 },
      CARDBOARD: { min: 2000, max: 3200 },
      ORGANIC: { min: 400, max: 1000 },
      EWASTE: { min: 8000, max: 25000 },
    },
    sourceCitation: "KLHK SIPSN Bank Sampah Price Index & Tarif Dasar Listrik PLN R-1/TR",
  },
  AE: {
    code: "AE",
    nameEn: "United Arab Emirates (Tadweer & Bee'ah Smart RVM)",
    nameId: "Uni Emirat Arab (Tadweer & Bee'ah RVM)",
    currency: "AED",
    defaultUnits: "metric",
    electricityTariff: 0.3,
    gridEfKgKwh: 0.42,
    depositType: "weight_buyback",
    policySummaryEn:
      "Tadweer (Abu Dhabi) and Bee'ah (Sharjah/Dubai) Smart Reverse Vending Machines reward bottle/can drop-offs and municipal green hubs.",
    policySummaryId:
      "Mesin RVM pintar Tadweer & Bee'ah memberikan insentif pengumpulan botol plastik dan kaleng aluminium.",
    containerRates: {
      PET: { small: 0.1, large: 0.15 },
      ALU: { small: 0.15, large: 0.2 },
    },
    weightRatesPerKg: {
      CARDBOARD: { min: 0.25, max: 0.45 },
      EWASTE: { min: 1.5, max: 4.0 },
    },
    sourceCitation: "DEWA / Tadweer Circular Economy Policy 2026",
  },
  SG: {
    code: "SG",
    nameEn: "Singapore (NEA Beverage Container Return Scheme)",
    nameId: "Singapura (Skema Pengembalian Wadah NEA)",
    currency: "SGD",
    defaultUnits: "metric",
    electricityTariff: 0.3,
    gridEfKgKwh: 0.4,
    depositType: "container_deposit",
    policySummaryEn:
      "Singapore NEA Beverage Container Return Scheme ($0.10 SGD refund for PET and Aluminum containers) plus Cash-for-Trash stations.",
    policySummaryId:
      "Skema Pengembalian Wadah Minuman NEA Singapura ($0,10 SGD per botol PET/kaleng) serta stasiun Cash-for-Trash.",
    containerRates: {
      PET: { small: 0.1, large: 0.1 },
      ALU: { small: 0.1, large: 0.1 },
    },
    weightRatesPerKg: {
      PAPER: { min: 0.1, max: 0.18 },
      CARDBOARD: { min: 0.12, max: 0.2 },
      EWASTE: { min: 0.5, max: 1.5 },
    },
    sourceCitation: "NEA Singapore Beverage Container Return Scheme & SP Group Tariff",
  },
  AU: {
    code: "AU",
    nameEn: "Australia (Container Deposit Scheme, 10c Refund)",
    nameId: "Australia (Skema Deposit Wadah 10 Sen)",
    currency: "AUD",
    defaultUnits: "metric",
    electricityTariff: 0.33,
    gridEfKgKwh: 0.55,
    depositType: "container_deposit",
    policySummaryEn:
      "Australian state Container Deposit Schemes (Return and Earn / Containers for Change) provide a 10c AUD refund per eligible bottle or can.",
    policySummaryId:
      "Skema Container Deposit Australia memberikan pengembalian 10 sen AUD untuk setiap botol atau kaleng yang memenuhi syarat.",
    containerRates: {
      PET: { small: 0.1, large: 0.1 },
      HDPE: { small: 0.1, large: 0.1 },
      ALU: { small: 0.1, large: 0.1 },
      GLASS: { small: 0.1, large: 0.1 },
    },
    sourceCitation: "Australian State CDS Authorities & AER Default Market Offer",
  },
  KR: {
    code: "KR",
    nameEn: "South Korea (Volume-Based Jongnyangje & Resource Deposit)",
    nameId: "Korea Selatan (Pemilahan Ketat Jongnyangje & Deposit Botol)",
    currency: "KRW",
    defaultUnits: "metric",
    electricityTariff: 165.0,
    gridEfKgKwh: 0.43,
    depositType: "container_deposit",
    policySummaryEn:
      "South Korea enforces strict transparent PET separation, glass bottle deposit refunds (100-350 KRW), and AI reverse vending rewards.",
    policySummaryId:
      "Korea Selatan menerapkan pemilahan botol PET transparan wajib, deposit botol kaca (100-350 KRW), dan mesin daur ulang pintar.",
    containerRates: {
      PET: { small: 100, large: 130 },
      ALU: { small: 100, large: 150 },
      GLASS: { small: 100, large: 350 },
    },
    weightRatesPerKg: {
      CARDBOARD: { min: 90, max: 140 },
      PAPER: { min: 100, max: 160 },
      EWASTE: { min: 600, max: 1800 },
    },
    sourceCitation: "Korea Ministry of Environment (ME) & KEPCO Residential Tariff",
  },
  MY: {
    code: "MY",
    nameEn: "Malaysia (Drive-Thru Recycling Centre & Trash4Cash)",
    nameId: "Malaysia (Pusat Daur Ulang Drive-Thru & Trash4Cash)",
    currency: "MYR",
    defaultUnits: "metric",
    electricityTariff: 0.52,
    gridEfKgKwh: 0.58,
    depositType: "weight_buyback",
    policySummaryEn:
      "SWCorp Drive-Thru Recycling Centres (DTRC) and local buyback hubs pay cash per kilogram for sorted plastics, aluminum, paper, and e-waste.",
    policySummaryId:
      "Pusat Daur Ulang Drive-Thru (DTRC) SWCorp membayar tunai per kilogram untuk plastik, aluminium, kertas, dan limbah elektronik terpilah.",
    weightRatesPerKg: {
      PET: { min: 0.8, max: 1.4 },
      HDPE: { min: 1.0, max: 1.6 },
      ALU: { min: 4.5, max: 6.2 },
      CARDBOARD: { min: 0.35, max: 0.55 },
      EWASTE: { min: 1.8, max: 5.0 },
    },
    sourceCitation: "SWCorp Malaysia & Tenaga Nasional Berhad (TNB) Tariff",
  },
  TH: {
    code: "TH",
    nameEn: "Thailand (Wongpanit & Municipal Waste Bank Network)",
    nameId: "Thailand (Jaringan Bank Sampah Wongpanit & Kota)",
    currency: "THB",
    defaultUnits: "metric",
    electricityTariff: 4.4,
    gridEfKgKwh: 0.49,
    depositType: "weight_buyback",
    policySummaryEn:
      "Thailand community waste banks and Wongpanit recycling branches buy sorted PET bottles, cans, glass, and cardboard by weight.",
    policySummaryId:
      "Bank sampah komunitas Thailand dan cabang daur ulang Wongpanit membeli botol PET, kaleng, kaca, dan kardus berdasarkan berat (kg).",
    weightRatesPerKg: {
      PET: { min: 8, max: 14 },
      ALU: { min: 42, max: 58 },
      CARDBOARD: { min: 3.5, max: 6 },
      GLASS: { min: 1.5, max: 3 },
      EWASTE: { min: 18, max: 55 },
    },
    sourceCitation: "PCD Thailand & MEA/PEA Residential Electricity Tariff",
  },
  IN: {
    code: "IN",
    nameEn: "India (Kabadiwala Digital Buyback & EPR Network)",
    nameId: "India (Jaringan Pembelian Daur Ulang & EPR)",
    currency: "INR",
    defaultUnits: "metric",
    electricityTariff: 8.5,
    gridEfKgKwh: 0.71,
    depositType: "weight_buyback",
    policySummaryEn:
      "Doorstep and hub recyclers pay per kg for clean PET, aluminum, newspaper, cardboard, and e-waste under CPCB EPR guidelines.",
    policySummaryId:
      "Mitra daur ulang membeli botol PET, aluminium, koran, kardus, dan e-waste per kilogram sesuai panduan EPR CPCB.",
    weightRatesPerKg: {
      PET: { min: 18, max: 32 },
      ALU: { min: 95, max: 135 },
      CARDBOARD: { min: 10, max: 16 },
      PAPER: { min: 14, max: 22 },
      EWASTE: { min: 40, max: 120 },
    },
    sourceCitation: "CPCB India EPR Portal & State DISCOM Residential Tariff",
  },
  FR: {
    code: "FR",
    nameEn: "France (Citeo Tri & Municipal Déchèterie)",
    nameId: "Prancis (Sistem Pemilahan Citeo & Déchèterie)",
    currency: "EUR",
    defaultUnits: "metric",
    electricityTariff: 0.27,
    gridEfKgKwh: 0.06,
    depositType: "weight_buyback",
    policySummaryEn:
      "Yellow bin unified sorting for all packaging plus municipal Déchèterie & RVM bottle return rewards.",
    policySummaryId:
      "Pemilahan terpadu tempat sampah kuning untuk semua kemasan serta pusat Déchèterie kota dan mesin RVM.",
    weightRatesPerKg: {
      PET: { min: 0.2, max: 0.35 },
      ALU: { min: 0.95, max: 1.45 },
      CARDBOARD: { min: 0.06, max: 0.12 },
      EWASTE: { min: 0.45, max: 1.1 },
    },
    sourceCitation: "ADEME / Citeo France & CRE Tarif Bleu EDF",
  },
  NL: {
    code: "NL",
    nameEn: "Netherlands (Statiegeld Nederland Bottle & Can Deposit)",
    nameId: "Belanda (Deposit Botol & Kaleng Statiegeld)",
    currency: "EUR",
    defaultUnits: "metric",
    electricityTariff: 0.34,
    gridEfKgKwh: 0.29,
    depositType: "container_deposit",
    policySummaryEn:
      "Statiegeld Nederland refunds €0.15 for small plastic bottles and metal cans, and €0.25 for large plastic bottles.",
    policySummaryId:
      "Statiegeld Belanda mengembalikan €0,15 untuk botol plastik kecil dan kaleng minuman, serta €0,25 untuk botol besar.",
    containerRates: {
      PET: { small: 0.15, large: 0.25 },
      ALU: { small: 0.15, large: 0.15 },
    },
    sourceCitation: "Statiegeld Nederland & CBS Energy Statistics",
  },
  CH: {
    code: "CH",
    nameEn: "Switzerland (Swiss Recycling PET/Alu/Glass Network)",
    nameId: "Swiss (Jaringan Swiss Recycling PET/Alu/Kaca)",
    currency: "CHF",
    defaultUnits: "metric",
    electricityTariff: 0.29,
    gridEfKgKwh: 0.04,
    depositType: "weight_buyback",
    policySummaryEn:
      "High-efficiency Swiss Recycling collection points across all supermarkets and communal Ökihof hubs.",
    policySummaryId:
      "Titik pengumpulan Swiss Recycling berstandar tinggi di seluruh supermarket dan pusat komunitas Ökihof.",
    weightRatesPerKg: {
      ALU: { min: 1.1, max: 1.6 },
      PET: { min: 0.25, max: 0.4 },
      EWASTE: { min: 0.5, max: 1.3 },
    },
    sourceCitation: "FOEN / BAFU Switzerland & ElCom Electricity Tariff",
  },
  CA: {
    code: "CA",
    nameEn: "Canada (Provincial Return-It Beverage Deposit)",
    nameId: "Kanada (Deposit Kemasan Minuman Return-It)",
    currency: "CAD",
    defaultUnits: "metric",
    electricityTariff: 0.17,
    gridEfKgKwh: 0.12,
    depositType: "container_deposit",
    policySummaryEn:
      "Canadian provincial Return-It depots refund $0.10 CAD per beverage container across PET, aluminum, and glass.",
    policySummaryId:
      "Depot Return-It provinsi di Kanada mengembalikan $0,10 CAD per wadah minuman untuk PET, aluminium, dan kaca.",
    containerRates: {
      PET: { small: 0.1, large: 0.1 },
      ALU: { small: 0.1, large: 0.1 },
      GLASS: { small: 0.1, large: 0.1 },
    },
    sourceCitation: "Encorp Return-It Canada & NRCan Grid Intensity",
  },
  BR: {
    code: "BR",
    nameEn: "Brazil (Cooperativas de Catadores & Ecopontos)",
    nameId: "Brasil (Koperasi Daur Ulang & Ecopontos)",
    currency: "BRL",
    defaultUnits: "metric",
    electricityTariff: 0.88,
    gridEfKgKwh: 0.09,
    depositType: "weight_buyback",
    policySummaryEn:
      "Brazilian recycling cooperatives and municipal Ecopontos purchase aluminum cans, PET bottles, and cardboard by weight.",
    policySummaryId:
      "Koperasi daur ulang Brasil dan Ecopontos kota membeli kaleng aluminium, botol PET, dan kardus berdasarkan berat (kg).",
    weightRatesPerKg: {
      ALU: { min: 6.5, max: 9.2 },
      PET: { min: 1.8, max: 3.1 },
      CARDBOARD: { min: 0.5, max: 0.95 },
      EWASTE: { min: 2.5, max: 8.0 },
    },
    sourceCitation: "CEMPRE Brasil & ANEEL Residential Tariff",
  },
  SA: {
    code: "SA",
    nameEn: "Saudi Arabia (SIRC & MWAN Smart Recycling Hubs)",
    nameId: "Arab Saudi (Hub Daur Ulang Pintar SIRC & MWAN)",
    currency: "SAR",
    defaultUnits: "metric",
    electricityTariff: 0.24,
    gridEfKgKwh: 0.56,
    depositType: "weight_buyback",
    policySummaryEn:
      "Saudi Investment Recycling Company (SIRC) and MWAN smart bins reward sorted plastics, metals, paper, and electronics.",
    policySummaryId:
      "SIRC dan tempat sampah pintar MWAN memberikan insentif untuk plastik, logam, kertas, dan elektronik terpilah.",
    weightRatesPerKg: {
      PET: { min: 0.9, max: 1.5 },
      ALU: { min: 4.2, max: 6.0 },
      CARDBOARD: { min: 0.35, max: 0.6 },
      EWASTE: { min: 1.8, max: 4.5 },
    },
    sourceCitation: "MWAN / SIRC Saudi Green Initiative & SEC Tariff",
  },
  EG: {
    code: "EG",
    nameEn: "Egypt (Bekia / GreenPan Cash-for-Waste Network)",
    nameId: "Mesir (Jaringan Daur Ulang Tunai Bekia)",
    currency: "EGP",
    defaultUnits: "metric",
    electricityTariff: 2.1,
    gridEfKgKwh: 0.46,
    depositType: "weight_buyback",
    policySummaryEn:
      "Egyptian digital and neighborhood recyclers exchange sorted plastics, cans, paper, and electronics for cash or mobile credits.",
    policySummaryId:
      "Mitra daur ulang Mesir menukar plastik, kaleng, kertas, dan elektronik terpilah dengan uang tunai atau saldo digital.",
    weightRatesPerKg: {
      PET: { min: 12, max: 20 },
      ALU: { min: 65, max: 95 },
      CARDBOARD: { min: 5, max: 9 },
      EWASTE: { min: 25, max: 75 },
    },
    sourceCitation: "WMRA Egypt & EgyptERA Residential Tariff",
  },
  NG: {
    code: "NG",
    nameEn: "Nigeria (Wecyclers & LAWMA Franchise Hubs)",
    nameId: "Nigeria (Hub Daur Ulang Wecyclers & LAWMA)",
    currency: "NGN",
    defaultUnits: "metric",
    electricityTariff: 115.0,
    gridEfKgKwh: 0.43,
    depositType: "weight_buyback",
    policySummaryEn:
      "Wecyclers and municipal recycling hubs pay cash per kg for PET bottles, aluminum cans, sachets, and cardboard.",
    policySummaryId:
      "Wecyclers dan hub daur ulang kota membayar tunai per kg untuk botol PET, kaleng aluminium, dan kardus.",
    weightRatesPerKg: {
      PET: { min: 220, max: 380 },
      ALU: { min: 1100, max: 1650 },
      CARDBOARD: { min: 90, max: 160 },
      EWASTE: { min: 450, max: 1400 },
    },
    sourceCitation: "LAWMA / Wecyclers Nigeria & NERC Tariff",
  },
  KE: {
    code: "KE",
    nameEn: "Kenya (Mr. Green Africa & TakaTaka Solutions)",
    nameId: "Kenya (Mr. Green Africa & TakaTaka Solutions)",
    currency: "KES",
    defaultUnits: "metric",
    electricityTariff: 28.0,
    gridEfKgKwh: 0.11,
    depositType: "weight_buyback",
    policySummaryEn:
      "Kenya's low-carbon geothermal/hydro grid paired with Mr. Green Africa & TakaTaka buyback centers for PET, HDPE, and aluminum.",
    policySummaryId:
      "Jaringan listrik rendah karbon Kenya dipadukan dengan pusat pembelian daur ulang Mr. Green Africa & TakaTaka.",
    weightRatesPerKg: {
      PET: { min: 25, max: 42 },
      HDPE: { min: 30, max: 50 },
      ALU: { min: 140, max: 210 },
      CARDBOARD: { min: 10, max: 18 },
    },
    sourceCitation: "NEMA Kenya EPR Regulations & KPLC Domestic Tariff",
  },
  ZA: {
    code: "ZA",
    nameEn: "South Africa (PETCO, Collect-a-Can & Packa-Ching)",
    nameId: "Afrika Selatan (PETCO, Collect-a-Can & Packa-Ching)",
    currency: "ZAR",
    defaultUnits: "metric",
    electricityTariff: 3.4,
    gridEfKgKwh: 0.86,
    depositType: "weight_buyback",
    policySummaryEn:
      "High solar ROI on coal-heavy Eskom grid, plus Packa-Ching and Collect-a-Can mobile buyback units.",
    policySummaryId:
      "Pengembalian investasi surya tinggi pada jaringan Eskom, ditambah unit pembelian daur ulang Packa-Ching dan Collect-a-Can.",
    weightRatesPerKg: {
      PET: { min: 3.5, max: 6.0 },
      ALU: { min: 18.0, max: 26.0 },
      CARDBOARD: { min: 1.4, max: 2.5 },
      EWASTE: { min: 8.0, max: 24.0 },
    },
    sourceCitation: "PETCO South Africa & Eskom Homepower Tariff",
  },
  XX: {
    code: "XX",
    nameEn: "Global Default Standard",
    nameId: "Standar Rata-Rata Global",
    currency: "USD",
    defaultUnits: "metric",
    electricityTariff: 0.16,
    gridEfKgKwh: 0.44,
    depositType: "weight_buyback",
    policySummaryEn:
      "Global baseline circular recovery valuation based on international secondary commodity benchmarks.",
    policySummaryId:
      "Estimasi nilai pemulihan material sirkular berdasarkan rata-rata komoditas daur ulang global.",
    weightRatesPerKg: {
      ALU: { min: 1.0, max: 1.5 },
      PET: { min: 0.2, max: 0.35 },
      HDPE: { min: 0.25, max: 0.45 },
      CARDBOARD: { min: 0.06, max: 0.12 },
      STEEL: { min: 0.15, max: 0.28 },
      EWASTE: { min: 0.45, max: 1.2 },
    },
    sourceCitation: "Ember Global Electricity Review & US EPA WARM v16",
  },
};

export interface ObjectValuationResult {
  materialCode: MaterialCode;
  category: MaterialCategory;
  estMassG: number;
  valueMin: number;
  valueMax: number;
  currency: string;
  co2eAvoidedG: number;
  valuationBasis: string;
}

export function getCountryPolicy(countryCode: string): CountryPolicy {
  const normalized = countryCode.trim().toUpperCase();
  return COUNTRY_POLICIES[normalized] ?? COUNTRY_POLICIES.XX!;
}

/**
 * Deterministically computes the mass, local monetary recovery value, and CO₂e avoided
 * for a single segmented object instance.
 */
export function evaluateMaterialInstance(
  materialCode: MaterialCode,
  sizeClass: SizeClassHint,
  countryCode: string,
  areaRatio?: number
): ObjectValuationResult {
  const factor = MATERIAL_FACTORS[materialCode] ?? MATERIAL_FACTORS.OTHER;
  const policy = getCountryPolicy(countryCode);

  const isLarge =
    sizeClass === "large" ||
    (sizeClass === "unknown" && (areaRatio ?? 0) > 0.08);
  const estMassG = isLarge
    ? factor.typicalMassGLarge
    : factor.typicalMassGSmall;
  const massKg = estMassG / 1000;

  // CO2e avoided in grams
  const co2eAvoidedG = Number(
    (massKg * factor.co2eAvoidedKgPerKg * 1000).toFixed(1)
  );

  let valueMin = 0;
  let valueMax = 0;
  let valuationBasis = policy.sourceCitation;

  const containerRate = policy.containerRates?.[materialCode];
  const weightRate = policy.weightRatesPerKg?.[materialCode];

  if (containerRate) {
    const rate = isLarge ? containerRate.large : containerRate.small;
    valueMin = rate;
    valueMax = rate;
    valuationBasis = `${policy.nameEn} Container Deposit`;
  } else if (weightRate) {
    valueMin = Number((massKg * weightRate.min).toFixed(4));
    valueMax = Number((massKg * weightRate.max).toFixed(4));
    valuationBasis = `${policy.nameEn} Weight Buyback`;
  }

  return {
    materialCode,
    category: factor.category,
    estMassG,
    valueMin,
    valueMax,
    currency: policy.currency,
    co2eAvoidedG,
    valuationBasis,
  };
}
