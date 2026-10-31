import { describe, it, expect } from 'vitest';
import { classifyKoppen } from '../src/lib/science/koppen';
import { calculateHousingFootprint } from '../src/lib/science/calculator';
import { evaluateMaterialInstance, getCountryPolicy } from '../src/lib/science/valuation';
import { evaluateProofOfAction, computeMaskIoU } from '../src/lib/lens/masks';
import { validateNumbersAgainstSiteBrief } from '../src/lib/meta/client';
import { computeDHashHammingDistance, checkAiCreditShield } from '../src/lib/meta/shield';
import { GLOBAL_CITY_PRESETS } from '../src/lib/science/presets';

describe('Verdara Deterministic Science & Valuation Engine', () => {
  it('classifies Menlo Park (Csb), Yogyakarta (Am), and Dubai (BWh) Köppen-Geiger biomes accurately', () => {
    const menlo = GLOBAL_CITY_PRESETS.menlo_park;
    const menloKoppen = classifyKoppen(menlo.monthlyTempC, menlo.monthlyPrecipMm, menlo.lat);
    expect(menloKoppen.code).toBe('Csb');
    expect(menloKoppen.biome).toBe('mediterranean');

    const yogya = GLOBAL_CITY_PRESETS.yogyakarta;
    const yogyaKoppen = classifyKoppen(yogya.monthlyTempC, yogya.monthlyPrecipMm, yogya.lat);
    expect(yogyaKoppen.code.startsWith('A')).toBe(true);
    expect(yogyaKoppen.biome).toBe('tropical');

    const dubai = GLOBAL_CITY_PRESETS.dubai;
    const dubaiKoppen = classifyKoppen(dubai.monthlyTempC, dubai.monthlyPrecipMm, dubai.lat);
    expect(dubaiKoppen.code).toBe('BWh');
    expect(dubaiKoppen.biome).toBe('arid');
  });

  it('calculates NREL PVWatts v8 solar yield and rainwater harvesting deterministically', () => {
    const result = calculateHousingFootprint({
      footprintM2: 140,
      usableRoofRatio: 0.65,
      panelPowerDensity: 0.2,
      performanceRatio: 0.78,
      runoffCoefficient: 0.85,
      firstFlushEfficiency: 0.9,
      ghiKwhM2Day: 5.2,
      annualPrecipMm: 508,
      electricityTariff: 0.38,
      gridEfKgPerKwh: 0.21,
      currency: 'USD',
      warmMonthMaxTempC: 26.4,
    });

    // 140 * 0.65 * 0.2 = 18.2 kWp
    expect(result.solar.kwp).toBe(18.2);
    // 18.2 * 5.2 * 365 * 0.78 = 26944.01 kWh/yr
    expect(result.solar.kwhYear).toBe(26944.01);
    expect(result.solar.savingsYear).toBe(10239);
    expect(result.rainwater.litersYear).toBe(54407);
  });

  it('calculates localized DRS deposits (DE Einwegpfand) and US EPA WARM v16 CO2e savings', () => {
    const dePolicy = getCountryPolicy('DE');
    expect(dePolicy.policySummaryEn.toLowerCase()).toContain('pfand');

    const valuation = evaluateMaterialInstance('PET', 'large', 'DE', 0.12);
    expect(valuation.currency).toBe('EUR');
    expect(valuation.valueMin).toBe(0.25); // 0.25 EUR Pfand
    expect(valuation.co2eAvoidedG).toBeGreaterThan(30);
  });

  it('computes SAM 3.1 bounding box IoU and verifies Field-Action Proofs with dHash anti-spoofing', () => {
    const iou = computeMaskIoU(
      { bbox: [0.1, 0.1, 0.5, 0.5], polygon: [], areaRatio: 0.25 },
      { bbox: [0.1, 0.1, 0.5, 0.5], polygon: [], areaRatio: 0.25 }
    );
    expect(iou).toBe(1);

    const requirements = [
      { concept: 'recycling bin', minCount: 2, weight: 0.6, required: true },
      { concept: 'sorted bottle', minCount: 2, weight: 0.4, required: true },
    ];

    const failed = evaluateProofOfAction(requirements, {
      'recycling bin': [0.92],
      'sorted bottle': [0.88, 0.85],
    });
    expect(failed.verified).toBe(false);

    const passed = evaluateProofOfAction(requirements, {
      'recycling bin': [0.95, 0.91],
      'sorted bottle': [0.93, 0.89, 0.86],
    });
    expect(passed.verified).toBe(true);
    expect(passed.score).toBeGreaterThanOrEqual(85);
  });

  it('enforces Deterministic SiteBrief Number Validator and 7-Layer AI Credit Shield', () => {
    const audit = validateNumbersAgainstSiteBrief(
      'Install an 18.2 kWp solar array generating 26,944 kWh/yr and harvesting 54,407 L/yr of rainwater.',
      {
        city: 'Menlo Park, CA',
        countryCode: 'US-CA',
        koppenCode: 'Csb',
        koppenName: 'Warm-Summer Mediterranean',
        season: 'Autumn',
        footprintM2: 140,
        solarKwp: 18.2,
        solarKwhYear: 26944,
        solarSavingsYear: 10239,
        currency: 'USD',
        co2eKgYear: 5658,
        rainLitersYear: 54407,
        bioporeUnits: 7,
        tciScore: 84,
        electricityTariff: 0.38,
        nearestHubName: 'Recology San Mateo',
        nearestHubDistanceKm: 2.4,
        outputLanguage: 'en',
      }
    );
    expect(audit.unverifiedNumbers.length).toBe(0);
    expect(audit.verifiedNumbers.length).toBeGreaterThanOrEqual(3);

    expect(computeDHashHammingDistance('ffffffffffffffff', '0000000000000000')).toBe(16);

    const shield = checkAiCreditShield({
      userId: 'judge-demo-user',
      ipHash: '127.0.0.1',
      isJudge: true,
      op: 'lens_scan',
    });
    expect(shield.allowed).toBe(true);
    expect(shield.judgeReserveUsd).toBe(35);
  });
});
