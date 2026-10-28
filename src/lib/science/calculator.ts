/**
 * Deterministic Building Energy, Hydrology & Microclimate Calculator
 * Implements NREL PVWatts v8 simplified equations, roof rainwater harvesting,
 * biopore infiltration sizing, and heuristic Thermal Comfort Index (TCI).
 */

export interface HousingCalcInput {
  footprintM2: number;
  ghiKwhM2Day: number;          // ERA5 daily mean solar irradiance (kWh/m²/day)
  annualPrecipMm: number;       // ERA5 annual precipitation (mm/year)
  electricityTariff: number;    // Local currency per kWh
  gridEfKgPerKwh: number;       // Grid carbon intensity (kg CO₂e/kWh)
  currency: string;             // ISO 4217 currency code
  warmMonthMaxTempC: number;    // Mean max temperature of warmest months (°C)
  greenCoverRatio?: number;     // 0..1 within 300m radius (default 0.25)
  builtCoverRatio?: number;     // 0..1 within 300m radius (default 0.55)
  // Editable user assumptions:
  usableRoofRatio?: number;     // Default 0.60 (60% of roof footprint suitable for solar)
  panelPowerDensity?: number;   // Default 0.20 kWp/m² (200 W/m² monocrystalline)
  performanceRatio?: number;    // Default 0.78 (inverter, thermal & wiring losses)
  runoffCoefficient?: number;   // Default 0.85 (pitched tile/metal roof)
  firstFlushEfficiency?: number;// Default 0.90 (filter efficiency)
}

export interface HousingCalcResult {
  footprintM2: number;
  solar: {
    kwp: number;
    kwhYear: number;
    savingsYear: number;
    currency: string;
    co2eKgYear: number;
    panelCountEst: number;
  };
  rainwater: {
    litersYear: number;
    usGallonsYear: number;
    recommendedCisternLiters: number;
  };
  infiltration: {
    bioporeUnits: number;
    infiltrationRateLitersHr: number;
  };
  thermal: {
    tciScore: number;
    band: "optimal" | "moderate" | "heat_stress";
    coolingTargetDegC: number;
  };
  assumptions: {
    usableRoofRatio: number;
    panelPowerDensity: number;
    performanceRatio: number;
    runoffCoefficient: number;
    firstFlushEfficiency: number;
    electricityTariff: number;
  };
  citation: string;
}

export function calculateHousingFootprint(input: HousingCalcInput): HousingCalcResult {
  const usableRoofRatio = clamp(input.usableRoofRatio ?? 0.6, 0.1, 0.95);
  const panelPowerDensity = clamp(input.panelPowerDensity ?? 0.2, 0.12, 0.26);
  const performanceRatio = clamp(input.performanceRatio ?? 0.78, 0.55, 0.9);
  const runoffCoefficient = clamp(input.runoffCoefficient ?? 0.85, 0.4, 0.98);
  const firstFlushEfficiency = clamp(input.firstFlushEfficiency ?? 0.9, 0.6, 0.98);
  const rGreen = clamp(input.greenCoverRatio ?? 0.25, 0, 1);
  const rBuilt = clamp(input.builtCoverRatio ?? 0.55, 0, 1);

  const area = Math.max(10, input.footprintM2);

  // 1. Solar PV Calculation (NREL PVWatts Simplified)
  const kwpRaw = area * usableRoofRatio * panelPowerDensity;
  const kwp = Number(kwpRaw.toFixed(2));
  const kwhYearRaw = kwpRaw * input.ghiKwhM2Day * 365 * performanceRatio;
  const kwhYear = Number(kwhYearRaw.toFixed(2));
  const savingsYear = Math.round(kwhYearRaw * input.electricityTariff);
  const co2eKgYear = Number((kwhYearRaw * input.gridEfKgPerKwh).toFixed(1));
  const panelCountEst = Math.max(1, Math.round((area * usableRoofRatio) / 1.85));

  // 2. Rainwater Harvesting (1 mm * 1 m² = 1 Liter)
  const litersYear = Math.round(
    area * input.annualPrecipMm * runoffCoefficient * firstFlushEfficiency
  );
  const usGallonsYear = Math.round(litersYear * 0.264172);
  // Recommended cistern stores ~25 days of average harvest, clamped between 1,000L and 15,000L
  const recommendedCisternLiters =
    Math.round(clamp(litersYear * (25 / 365), 1000, 15000) / 500) * 500;

  // 3. Biopore / Soakaway Infiltration Units (1 unit per 12 m² effective runoff area)
  const bioporeUnits = Math.ceil((area * runoffCoefficient) / 12);
  const infiltrationRateLitersHr = bioporeUnits * 180;

  // 4. Thermal Comfort Index (TCI 0-100 heuristic)
  const rawTci =
    85 -
    2.2 * Math.max(0, input.warmMonthMaxTempC - 24) +
    25 * rGreen -
    18 * rBuilt;
  const tciScore = clamp(Math.round(rawTci), 0, 100);
  const band: "optimal" | "moderate" | "heat_stress" =
    tciScore >= 72 ? "optimal" : tciScore >= 50 ? "moderate" : "heat_stress";
  const coolingTargetDegC = Number(
    Math.max(0.8, (100 - tciScore) * 0.065).toFixed(1)
  );

  return {
    footprintM2: Number(area.toFixed(1)),
    solar: {
      kwp,
      kwhYear,
      savingsYear,
      currency: input.currency,
      co2eKgYear,
      panelCountEst,
    },
    rainwater: {
      litersYear,
      usGallonsYear,
      recommendedCisternLiters,
    },
    infiltration: {
      bioporeUnits,
      infiltrationRateLitersHr,
    },
    thermal: {
      tciScore,
      band,
      coolingTargetDegC,
    },
    assumptions: {
      usableRoofRatio,
      panelPowerDensity,
      performanceRatio,
      runoffCoefficient,
      firstFlushEfficiency,
      electricityTariff: input.electricityTariff,
    },
    citation:
      "Open-Meteo ERA5 Reanalysis (10-Yr Climatology) · NREL PVWatts v8 · Ember Grid Intensity",
  };
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}
