/**
 * Deterministic Koppen-Geiger Climate Classification Engine
 * Reference: Peel, M. C., Finlayson, B. L., & McMahon, T. A. (2007).
 * "Updated world map of the Köppen-Geiger climate classification."
 * Hydrology and Earth System Sciences, 11(5), 1633-1644.
 */

export type KoppenGroup = "A" | "B" | "C" | "D" | "E";

export type IslandBiome =
  | "tropical"
  | "arid"
  | "temperate"
  | "mediterranean"
  | "continental"
  | "polar";

export type SeasonName =
  | "Wet Season"
  | "Dry Season"
  | "Spring"
  | "Summer"
  | "Autumn"
  | "Winter";

export interface KoppenClassification {
  code: string;
  group: KoppenGroup;
  biome: IslandBiome;
  nameEn: string;
  nameId: string;
  descriptionEn: string;
  descriptionId: string;
  tAnnC: number;
  pAnnMm: number;
  tHotC: number;
  tColdC: number;
}

const KOPPEN_LABELS: Record<
  string,
  { en: string; id: string; descEn: string; descId: string }
> = {
  Af: {
    en: "Tropical Rainforest",
    id: "Hutan Hujan Tropis",
    descEn: "Warm and humid year-round with abundant rainfall in every month.",
    descId: "Hangat dan lembap sepanjang tahun dengan curah hujan tinggi setiap bulan.",
  },
  Am: {
    en: "Tropical Monsoon",
    id: "Monsun Tropis",
    descEn: "High annual rainfall driven by strong seasonal monsoon winds.",
    descId: "Curah hujan tahunan tinggi yang dipengaruhi angin monsun musiman.",
  },
  Aw: {
    en: "Tropical Savanna",
    id: "Sabana Tropis",
    descEn: "Distinct tropical wet and dry seasons with high solar irradiance.",
    descId: "Musim hujan dan kemarau tropis yang tegas dengan radiasi surya tinggi.",
  },
  BWh: {
    en: "Hot Desert (Arid)",
    id: "Gurun Panas (Arid)",
    descEn: "Extreme solar potential with very low annual precipitation.",
    descId: "Potensi surya sangat tinggi dengan curah hujan tahunan sangat rendah.",
  },
  BWk: {
    en: "Cold Desert (Arid)",
    id: "Gurun Dingin (Arid)",
    descEn: "Arid continental climate with cool winters and dry sunny days.",
    descId: "Iklim kering kontinental dengan musim dingin sejuk dan hari cerah.",
  },
  BSh: {
    en: "Hot Semi-Arid Steppe",
    id: "Stepa Semi-Kering Panas",
    descEn: "Warm semi-arid zone requiring high water retention and shade.",
    descId: "Zona semi-kering hangat yang membutuhkan retensi air dan peneduh.",
  },
  BSk: {
    en: "Cold Semi-Arid Steppe",
    id: "Stepa Semi-Kering Dingin",
    descEn: "Cool semi-arid climate suited for drought-tolerant flora.",
    descId: "Iklim semi-kering sejuk yang cocok untuk vegetasi tahan kering.",
  },
  Csa: {
    en: "Hot-Summer Mediterranean",
    id: "Mediterania Musim Panas Terik",
    descEn: "Dry sunny summers and mild wet winters; ideal for solar + cisterns.",
    descId: "Musim panas kering cerah dan musim dingin lembap; ideal untuk surya + tandon.",
  },
  Csb: {
    en: "Warm-Summer Mediterranean",
    id: "Mediterania Musim Panas Hangat",
    descEn: "Coastal Mediterranean climate with mild temperatures and dry summers.",
    descId: "Iklim Mediterania pesisir dengan suhu sejuk dan musim panas kering.",
  },
  Cfa: {
    en: "Humid Subtropical",
    id: "Subtropis Lembap",
    descEn: "Warm humid summers and mild winters with year-round precipitation.",
    descId: "Musim panas hangat lembap dan musim dingin sejuk dengan hujan merata.",
  },
  Cfb: {
    en: "Oceanic Temperate",
    id: "Temperate Oseanik",
    descEn: "Mild temperatures year-round with steady rainfall and moderate sun.",
    descId: "Suhu sejuk sepanjang tahun dengan curah hujan stabil.",
  },
  Cwa: {
    en: "Monsoon-Influenced Subtropical",
    id: "Subtropis Monsun",
    descEn: "Dry winters and warm rainy summers.",
    descId: "Musim dingin kering dan musim panas hangat berhujan.",
  },
  Cwb: {
    en: "Subtropical Highland",
    id: "Dataran Tinggi Subtropis",
    descEn: "Cool highland climate with dry winters and rainy summers.",
    descId: "Iklim dataran tinggi sejuk dengan musim dingin kering.",
  },
  Dfa: {
    en: "Hot-Summer Humid Continental",
    id: "Kontinental Lembap Musim Panas Hangat",
    descEn: "Large seasonal temperature swings with freezing winters.",
    descId: "Rentang suhu musiman lebar dengan musim dingin membeku.",
  },
  Dfb: {
    en: "Warm-Summer Humid Continental",
    id: "Kontinental Lembap Musim Panas Sejuk",
    descEn: "Snowy winters and mild summers requiring thermal insulation.",
    descId: "Musim dingin bersalju dan musim panas sejuk yang butuh insulasi termal.",
  },
  ET: {
    en: "Alpine / Tundra Polar",
    id: "Tundra / Alpin Polar",
    descEn: "Cold environment where warmest month remains below 10°C.",
    descId: "Lingkungan dingin di mana bulan terhangat berada di bawah 10°C.",
  },
  EF: {
    en: "Ice Cap Polar",
    id: "Es Abadi Polar",
    descEn: "Perpetual sub-zero temperatures year-round.",
    descId: "Suhu di bawah titik beku sepanjang tahun.",
  },
};

export function mapKoppenToBiome(code: string): IslandBiome {
  if (code.startsWith("Cs")) return "mediterranean";
  const group = code.charAt(0).toUpperCase();
  switch (group) {
    case "A":
      return "tropical";
    case "B":
      return "arid";
    case "C":
      return "temperate";
    case "D":
      return "continental";
    case "E":
      return "polar";
    default:
      return "temperate";
  }
}

/**
 * Classifies 12 monthly mean temperatures (°C) and 12 monthly precipitation totals (mm)
 * into an exact Köppen-Geiger climate code using Peel et al. (2007).
 */
export function classifyKoppen(
  monthlyTempC: number[],
  monthlyPrecipMm: number[],
  lat: number
): KoppenClassification {
  if (monthlyTempC.length !== 12 || monthlyPrecipMm.length !== 12) {
    throw new Error("classifyKoppen requires exactly 12 monthly values for T and P.");
  }

  const tHot = Math.max(...monthlyTempC);
  const tCold = Math.min(...monthlyTempC);
  const tAnn = monthlyTempC.reduce((a, b) => a + b, 0) / 12;
  const pAnn = monthlyPrecipMm.reduce((a, b) => a + b, 0);
  const pMin = Math.min(...monthlyPrecipMm);
  const tMon10 = monthlyTempC.filter((t) => t > 10).length;

  // Northern hemisphere summer = Apr..Sep (indices 3..8); Southern = Oct..Mar (indices 9..11, 0..2)
  const isNorth = lat >= 0;
  const summerIndices = isNorth ? [3, 4, 5, 6, 7, 8] : [9, 10, 11, 0, 1, 2];
  const winterIndices = isNorth ? [9, 10, 11, 0, 1, 2] : [3, 4, 5, 6, 7, 8];

  const pSummerMonths = summerIndices.map((i) => monthlyPrecipMm[i]!);
  const pWinterMonths = winterIndices.map((i) => monthlyPrecipMm[i]!);

  const pSummerTotal = pSummerMonths.reduce((a, b) => a + b, 0);
  const pWinterTotal = pWinterMonths.reduce((a, b) => a + b, 0);

  const psdry = Math.min(...pSummerMonths);
  const pswwet = Math.max(...pSummerMonths);
  const pwdry = Math.min(...pWinterMonths);
  const pwwet = Math.max(...pWinterMonths);

  let pThresh: number;
  if (pAnn > 0 && pWinterTotal / pAnn >= 0.7) {
    pThresh = 2 * tAnn;
  } else if (pAnn > 0 && pSummerTotal / pAnn >= 0.7) {
    pThresh = 2 * tAnn + 28;
  } else {
    pThresh = 2 * tAnn + 14;
  }

  let code = "Cfb";

  // 1. Group E (Polar)
  if (tHot < 10) {
    code = tHot < 0 ? "EF" : "ET";
  }
  // 2. Group B (Arid)
  else if (pAnn < 10 * pThresh) {
    const second = pAnn < 5 * pThresh ? "W" : "S";
    const third = tAnn >= 18 ? "h" : "k";
    code = `B${second}${third}`;
  }
  // 3. Group A (Tropical)
  else if (tCold >= 18) {
    if (pMin >= 60) {
      code = "Af";
    } else if (pMin >= 100 - pAnn / 25) {
      code = "Am";
    } else {
      code = "Aw";
    }
  }
  // 4. Group C (Temperate) or D (Continental)
  else {
    const first = tCold > 0 ? "C" : "D";
    let second = "f";
    if (psdry < 40 && psdry < pwwet / 3) {
      second = "s";
    } else if (pwdry < pswwet / 10) {
      second = "w";
    }

    let third = "c";
    if (tHot >= 22) {
      third = "a";
    } else if (tMon10 >= 4) {
      third = "b";
    } else if (first === "D" && tCold < -38) {
      third = "d";
    }
    code = `${first}${second}${third}`;
  }

  const group = code.charAt(0) as KoppenGroup;
  const biome = mapKoppenToBiome(code);
  const meta = KOPPEN_LABELS[code] ?? {
    en: `${group}-Class Climate (${code})`,
    id: `Iklim Kelas ${group} (${code})`,
    descEn: "Regional climate profile calculated from 10-year ERA5 meteorological series.",
    descId: "Profil iklim regional dihitung dari seri meteorologi ERA5 10 tahun.",
  };

  return {
    code,
    group,
    biome,
    nameEn: meta.en,
    nameId: meta.id,
    descriptionEn: meta.descEn,
    descriptionId: meta.descId,
    tAnnC: Number(tAnn.toFixed(1)),
    pAnnMm: Math.round(pAnn),
    tHotC: Number(tHot.toFixed(1)),
    tColdC: Number(tCold.toFixed(1)),
  };
}

/**
 * Resolves the current meteorological season based on latitude, month (1-12), and monthly rainfall.
 */
export function resolveCurrentSeason(
  lat: number,
  month1To12: number,
  monthlyPrecipMm?: number[]
): { en: SeasonName; id: string } {
  const absLat = Math.abs(lat);
  const idx = Math.max(0, Math.min(11, month1To12 - 1));

  if (absLat < 23.5) {
    if (monthlyPrecipMm && monthlyPrecipMm.length === 12) {
      const sorted = [...monthlyPrecipMm].sort((a, b) => a - b);
      const median = (sorted[5]! + sorted[6]!) / 2;
      const isWet = monthlyPrecipMm[idx]! >= median;
      return isWet
        ? { en: "Wet Season", id: "Musim Hujan" }
        : { en: "Dry Season", id: "Musim Kemarau" };
    }
    // Tropical default by month & hemisphere
    const isWet = lat >= 0 ? month1To12 >= 5 && month1To12 <= 10 : month1To12 >= 10 || month1To12 <= 4;
    return isWet
      ? { en: "Wet Season", id: "Musim Hujan" }
      : { en: "Dry Season", id: "Musim Kemarau" };
  }

  const isNorth = lat >= 0;
  if (month1To12 >= 3 && month1To12 <= 5) {
    return isNorth ? { en: "Spring", id: "Musim Semi" } : { en: "Autumn", id: "Musim Gugur" };
  }
  if (month1To12 >= 6 && month1To12 <= 8) {
    return isNorth ? { en: "Summer", id: "Musim Panas" } : { en: "Winter", id: "Musim Dingin" };
  }
  if (month1To12 >= 9 && month1To12 <= 11) {
    return isNorth ? { en: "Autumn", id: "Musim Gugur" } : { en: "Spring", id: "Musim Semi" };
  }
  return isNorth ? { en: "Winter", id: "Musim Dingin" } : { en: "Summer", id: "Musim Panas" };
}
