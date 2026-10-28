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
