"use client";

import { create } from "zustand";
import {
  resolvePresetGeoContext,
  resolveWorldCityGeoContext,
  type CityPreset,
  type ResolvedGeoContext,
} from "../lib/science/presets";
import {
  calculateHousingFootprint,
  type HousingCalcResult,
} from "../lib/science/calculator";
import { levelForXp, type AppLocale, type UnitSystem } from "../lib/science/units";

export interface UserScanRecord {
  id: string;
  sampleId: string;
  titleEn: string;
  titleId: string;
  mode: "waste" | "plant" | "retrofit";
  objectCount: number;
  valueTotal: number;
  currency: string;
  co2eAvoidedG: number;
  createdAt: string;
}

export type AuthProviderType =
  | "email"
  | "google"
  | "facebook"
  | "judge"
  | "starter";

export interface VerdaraState {
  isAuthenticated: boolean;
  isJudgeDemo: boolean;
  authProvider: AuthProviderType;
  displayName: string;
  email: string;

  locale: AppLocale;
  units: UnitSystem;
  theme: "light" | "dark";

  activePresetId: CityPreset["id"];
  geo: ResolvedGeoContext;
  housingCalc: HousingCalcResult;
  customFootprintM2: number;
  usableRoofRatio: number;
  runoffCoefficient: number;
  selectedMaterialFilter: string | null;

  xp: number;
  level: number;
  progressPct: number;
  streakDays: number;
  totalCo2eAvoidedKg: number;
  totalObjectsScanned: number;
  unlockedItems: string[];
  passedQuizLessonIds: string[];
  verifiedProofLessonIds: string[];
  submittedDHashes: string[];
  scanHistory: UserScanRecord[];

  aiShield: {
    lifetimeBudgetUsd: number;
    lifetimeCapUsd: number;
    judgeReserveUsd: number;
    todaySpendUsd: number;
    totalSpendUsd: number;
    cacheHitsCount: number;
    liveApiCallsCount: number;
    useOpenWeightModel: boolean;
  };

  loginAsJudgeDemo: () => void;
  resetToStarterPlot: () => void;
  loginWithEmail: (email: string, name?: string) => void;
  loginWithOAuth: (
    provider: "google" | "facebook",
    profile?: { email?: string; displayName?: string }
  ) => void;
  logout: () => void;
  setLocale: (locale: AppLocale) => void;
  setUnits: (units: UnitSystem) => void;
  setTheme: (theme: "light" | "dark") => void;
  teleportToCity: (presetId: CityPreset["id"]) => void;
  setCustomCoordinates: (
    lat: number,
    lng: number,
    cityLabel: string,
    countryCode: string
  ) => void;
  updateCalculatorAssumptions: (opts: {
    footprintM2?: number;
    usableRoofRatio?: number;
    runoffCoefficient?: number;
  }) => void;
  setSelectedMaterialFilter: (material: string | null) => void;
  awardXp: (amount: number, unlockItemCode?: string) => void;
  markQuizPassed: (lessonId: string) => void;
  markProofVerified: (
    lessonId: string,
    dhash: string,
    xpReward: number,
    unlockItemCode: string
  ) => void;
  recordScanCompleted: (scan: UserScanRecord, isCacheHit: boolean) => void;
  toggleOpenWeightModel: () => void;
}

const initialGeo = resolvePresetGeoContext("menlo_park", 10);
const initialCalc = calculateHousingFootprint({
  footprintM2: initialGeo.defaultFootprintM2,
  ghiKwhM2Day: initialGeo.ghiKwhM2Day,
  annualPrecipMm: initialGeo.koppen.pAnnMm,
  electricityTariff: initialGeo.policy.electricityTariff,
  gridEfKgPerKwh: initialGeo.policy.gridEfKgKwh,
  currency: initialGeo.policy.currency,
  warmMonthMaxTempC: initialGeo.warmMonthMaxTempC,
  greenCoverRatio: initialGeo.greenCoverRatio,
  builtCoverRatio: initialGeo.builtCoverRatio,
});

export const useVerdaraStore = create<VerdaraState>((set, get) => ({
  isAuthenticated: false,
  isJudgeDemo: false,
  authProvider: "email",
  displayName: "Guest Visitor",
  email: "",

  locale: "en",
  units: "metric",
  theme: "light",

  activePresetId: "menlo_park",
  geo: initialGeo,
  housingCalc: initialCalc,
  customFootprintM2: initialGeo.defaultFootprintM2,
  usableRoofRatio: 0.6,
  runoffCoefficient: 0.85,
  selectedMaterialFilter: null,

  xp: 1120,
  level: 5,
  progressPct: 24,
  streakDays: 1,
  totalCo2eAvoidedKg: 0,
  totalObjectsScanned: 0,
  unlockedItems: [
    "base_island",
    "sorting_station",
    "native_trees",
    "compost_dome",
    "rain_cistern",
    "solar_array",
  ],
  passedQuizLessonIds: ["lesson-zw-1"],
  verifiedProofLessonIds: [],
  submittedDHashes: ["1010110011001010"],
  scanHistory: [],

  aiShield: {
    lifetimeBudgetUsd: 150.0,
    lifetimeCapUsd: 135.0,
    judgeReserveUsd: 35.0,
    todaySpendUsd: 0.0,
    totalSpendUsd: 0.0,
    cacheHitsCount: 0,
    liveApiCallsCount: 0,
    useOpenWeightModel: true,
  },

  loginAsJudgeDemo: () => {
    const mpGeo = resolvePresetGeoContext("menlo_park", 10);
    const mpCalc = calculateHousingFootprint({
      footprintM2: mpGeo.defaultFootprintM2,
      ghiKwhM2Day: mpGeo.ghiKwhM2Day,
      annualPrecipMm: mpGeo.koppen.pAnnMm,
      electricityTariff: mpGeo.policy.electricityTariff,
      gridEfKgPerKwh: mpGeo.policy.gridEfKgKwh,
      currency: mpGeo.policy.currency,
      warmMonthMaxTempC: mpGeo.warmMonthMaxTempC,
      greenCoverRatio: mpGeo.greenCoverRatio,
      builtCoverRatio: mpGeo.builtCoverRatio,
    });

    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(
          "verdara_auth_session_v3",
          JSON.stringify({
            isAuthenticated: true,
            isJudgeDemo: true,
            displayName: "Demo Specimen: Menlo Park (Judge)",
            email: "judge+menlopark@verdara.app",
          })
        );
      } catch {
        // Ignore storage quota errors
      }
    }

    set({
      isAuthenticated: true,
      isJudgeDemo: true,
      authProvider: "judge",
      displayName: "Demo Specimen: Menlo Park (Judge)",
      email: "judge+menlopark@verdara.app",
      activePresetId: "menlo_park",
      geo: mpGeo,
      housingCalc: mpCalc,
      customFootprintM2: mpGeo.defaultFootprintM2,
      units: mpGeo.policy.defaultUnits,
      xp: 1120,
      level: 5,
      progressPct: 24,
      unlockedItems: [
        "base_island",
        "sorting_station",
        "native_trees",
        "compost_dome",
        "rain_cistern",
        "solar_array",
      ],
    });
  },

  resetToStarterPlot: () => {
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(
          "verdara_auth_session_v3",
          JSON.stringify({
            isAuthenticated: true,
            isJudgeDemo: false,
            authProvider: "starter",
            displayName: "Starter Plot (Level 1)",
            email: "starter@verdara.app",
          })
        );
      } catch {
        // Ignore storage quota errors
      }
    }

    set({
      isAuthenticated: true,
      isJudgeDemo: false,
      authProvider: "starter",
      displayName: "Starter Plot (Level 1)",
      email: "starter@verdara.app",
      xp: 0,
      level: 1,
      progressPct: 0,
      totalCo2eAvoidedKg: 0,
      totalObjectsScanned: 0,
      unlockedItems: ["base_island"],
      passedQuizLessonIds: [],
      verifiedProofLessonIds: [],
      scanHistory: [],
    });
  },

  loginWithEmail: (email, name) => {
    const cleanName =
      name?.trim() || email.split("@")[0] || "Verdara Resident";
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(
          "verdara_auth_session_v3",
          JSON.stringify({
            isAuthenticated: true,
            isJudgeDemo: false,
            authProvider: "email",
            displayName: cleanName,
            email,
          })
        );
      } catch {
        // Ignore storage quota errors
      }
    }
    set({
      isAuthenticated: true,
      isJudgeDemo: false,
      authProvider: "email",
      displayName: cleanName,
      email,
    });
  },

  loginWithOAuth: (provider, profile) => {
    const defaultEmail =
      provider === "google"
        ? "resident.google@verdara.app"
        : "resident.facebook@verdara.app";
    const defaultName =
      provider === "google"
        ? "Google Verified Resident"
        : "Facebook Verified Resident";
    const resolvedEmail = profile?.email?.trim() || defaultEmail;
    const resolvedName = profile?.displayName?.trim() || defaultName;

    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(
          "verdara_auth_session_v3",
          JSON.stringify({
            isAuthenticated: true,
            isJudgeDemo: false,
            authProvider: provider,
            displayName: resolvedName,
            email: resolvedEmail,
          })
        );
      } catch {
        // Ignore storage quota errors
      }
    }
    set({
      isAuthenticated: true,
      isJudgeDemo: false,
      authProvider: provider,
      displayName: resolvedName,
      email: resolvedEmail,
    });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem("verdara_auth_session_v3");
      } catch {
        // Ignore storage errors
      }
    }
    set({
      isAuthenticated: false,
      isJudgeDemo: false,
      authProvider: "email",
      displayName: "Guest Visitor",
      email: "",
    });
  },

  setLocale: (locale) => set({ locale }),
  setUnits: (units) => set({ units }),
  setTheme: (theme) => set({ theme }),

  teleportToCity: (presetId) => {
    const newGeo = resolvePresetGeoContext(presetId, 10);
    const { usableRoofRatio, runoffCoefficient } = get();
    const newCalc = calculateHousingFootprint({
      footprintM2: newGeo.defaultFootprintM2,
      ghiKwhM2Day: newGeo.ghiKwhM2Day,
      annualPrecipMm: newGeo.koppen.pAnnMm,
      electricityTariff: newGeo.policy.electricityTariff,
      gridEfKgPerKwh: newGeo.policy.gridEfKgKwh,
      currency: newGeo.policy.currency,
      warmMonthMaxTempC: newGeo.warmMonthMaxTempC,
      greenCoverRatio: newGeo.greenCoverRatio,
      builtCoverRatio: newGeo.builtCoverRatio,
      usableRoofRatio,
      runoffCoefficient,
    });

    set({
      activePresetId: presetId,
      geo: newGeo,
      housingCalc: newCalc,
      customFootprintM2: newGeo.defaultFootprintM2,
      units: newGeo.policy.defaultUnits,
    });
  },

  setCustomCoordinates: (lat, lng, cityLabel, countryCode) => {
    const current = get();
    const updatedGeo = resolveWorldCityGeoContext({
      lat,
      lng,
      city: cityLabel,
      countryCode,
    });
    const newCalc = calculateHousingFootprint({
      footprintM2: current.customFootprintM2 || updatedGeo.defaultFootprintM2,
      ghiKwhM2Day: updatedGeo.ghiKwhM2Day,
      annualPrecipMm: updatedGeo.koppen.pAnnMm,
      electricityTariff: updatedGeo.policy.electricityTariff,
      gridEfKgPerKwh: updatedGeo.policy.gridEfKgKwh,
      currency: updatedGeo.policy.currency,
      warmMonthMaxTempC: updatedGeo.warmMonthMaxTempC,
      greenCoverRatio: updatedGeo.greenCoverRatio,
      builtCoverRatio: updatedGeo.builtCoverRatio,
      usableRoofRatio: current.usableRoofRatio,
      runoffCoefficient: current.runoffCoefficient,
    });
    set({
      activePresetId: updatedGeo.presetId,
      geo: updatedGeo,
      housingCalc: newCalc,
      units: updatedGeo.policy.defaultUnits,
    });
  },

  updateCalculatorAssumptions: (opts) => {
    const state = get();
    const footprintM2 = opts.footprintM2 ?? state.customFootprintM2;
    const usableRoofRatio = opts.usableRoofRatio ?? state.usableRoofRatio;
    const runoffCoefficient = opts.runoffCoefficient ?? state.runoffCoefficient;

    const newCalc = calculateHousingFootprint({
      footprintM2,
      ghiKwhM2Day: state.geo.ghiKwhM2Day,
      annualPrecipMm: state.geo.koppen.pAnnMm,
      electricityTariff: state.geo.policy.electricityTariff,
      gridEfKgPerKwh: state.geo.policy.gridEfKgKwh,
      currency: state.geo.policy.currency,
      warmMonthMaxTempC: state.geo.warmMonthMaxTempC,
      greenCoverRatio: state.geo.greenCoverRatio,
      builtCoverRatio: state.geo.builtCoverRatio,
      usableRoofRatio,
      runoffCoefficient,
    });

    set({
      customFootprintM2: footprintM2,
      usableRoofRatio,
      runoffCoefficient,
      housingCalc: newCalc,
    });
  },

  setSelectedMaterialFilter: (material) =>
    set({ selectedMaterialFilter: material }),

  awardXp: (amount, unlockItemCode) => {
    const state = get();
    const newXp = state.xp + amount;
    const lvl = levelForXp(newXp);
    const updatedItems = unlockItemCode
      ? Array.from(new Set([...state.unlockedItems, unlockItemCode]))
      : state.unlockedItems;

    set({
      xp: newXp,
      level: lvl.level,
      progressPct: lvl.progressPct,
      unlockedItems: updatedItems,
    });
  },

  markQuizPassed: (lessonId) => {
    const state = get();
    if (!state.passedQuizLessonIds.includes(lessonId)) {
      set({ passedQuizLessonIds: [...state.passedQuizLessonIds, lessonId] });
    }
  },

  markProofVerified: (lessonId, dhash, xpReward, unlockItemCode) => {
    const state = get();
    const isAlreadyVerified = state.verifiedProofLessonIds.includes(lessonId);
    const newXp = isAlreadyVerified ? state.xp : state.xp + xpReward;
    const lvl = levelForXp(newXp);

    set({
      xp: newXp,
      level: lvl.level,
      progressPct: lvl.progressPct,
      verifiedProofLessonIds: Array.from(
        new Set([...state.verifiedProofLessonIds, lessonId])
      ),
      submittedDHashes: Array.from(
        new Set([...state.submittedDHashes, dhash])
      ),
      unlockedItems: Array.from(
        new Set([...state.unlockedItems, unlockItemCode])
      ),
      totalCo2eAvoidedKg: Number((state.totalCo2eAvoidedKg + 18.5).toFixed(1)),
    });
  },

  recordScanCompleted: (scan, isCacheHit) => {
    const state = get();
    const newXp = state.xp + Math.min(30, 10 + 2 * scan.objectCount);
    const lvl = levelForXp(newXp);

    set({
      xp: newXp,
      level: lvl.level,
      progressPct: lvl.progressPct,
      totalObjectsScanned: state.totalObjectsScanned + scan.objectCount,
      totalCo2eAvoidedKg: Number(
        (state.totalCo2eAvoidedKg + scan.co2eAvoidedG / 1000).toFixed(2)
      ),
      scanHistory: [scan, ...state.scanHistory.slice(0, 14)],
      aiShield: {
        ...state.aiShield,
        cacheHitsCount: isCacheHit
          ? state.aiShield.cacheHitsCount + 1
          : state.aiShield.cacheHitsCount,
        liveApiCallsCount: isCacheHit
          ? state.aiShield.liveApiCallsCount
          : state.aiShield.liveApiCallsCount + 1,
        todaySpendUsd: isCacheHit
          ? state.aiShield.todaySpendUsd
          : Number((state.aiShield.todaySpendUsd + 0.008).toFixed(4)),
        totalSpendUsd: isCacheHit
          ? state.aiShield.totalSpendUsd
          : Number((state.aiShield.totalSpendUsd + 0.008).toFixed(4)),
      },
    });
  },

  toggleOpenWeightModel: () => {
    const state = get();
    set({
      aiShield: {
        ...state.aiShield,
        useOpenWeightModel: !state.aiShield.useOpenWeightModel,
      },
    });
  },
}));
