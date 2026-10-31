"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
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
  | "starter";

export interface VerdaraState {
  isAuthenticated: boolean;
  authProvider: AuthProviderType;
  displayName: string;
  email: string;
  avatarUrl: string;
  userId: string;
  memberSince: string;

  locale: AppLocale;
  units: UnitSystem;
  theme: "light" | "dark";

  activePresetId: CityPreset["id"] | "custom";
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

  resetToStarterPlot: () => void;
  loadVerifiedSpecimenPlot: () => void;
  loginWithEmail: (
    email: string,
    name?: string,
    opts?: { avatarUrl?: string; userId?: string }
  ) => void;
  loginWithOAuth: (
    provider: "google" | "facebook" | "email",
    profile?: {
      email?: string;
      displayName?: string;
      avatarUrl?: string;
      userId?: string;
    }
  ) => void;
  updateUserProfile: (updates: {
    displayName?: string;
    avatarUrl?: string;
  }) => void;
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

export const useVerdaraStore = create<VerdaraState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      authProvider: "email",
      displayName: "Guest Resident",
      email: "",
      avatarUrl: "",
      userId: "",
      memberSince: "2026-10-31",

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

      loadVerifiedSpecimenPlot: () => {
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

        set({
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
        const currentEmail = get().email || "starter@verdara.app";
        const currentName = get().displayName || "Starter Resident";
        if (typeof window !== "undefined") {
          try {
            window.sessionStorage.setItem(
              "verdara_auth_session_v3",
              JSON.stringify({
                isAuthenticated: true,
                authProvider: "starter",
                displayName: currentName,
                email: currentEmail,
              })
            );
          } catch {
            // Ignore storage errors
          }
        }

        set({
          isAuthenticated: true,
          authProvider: "starter",
          displayName: currentName,
          email: currentEmail,
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

      loginWithEmail: (email, name, opts) => {
        const cleanName =
          name?.trim() || email.split("@")[0] || "Verdara Resident";
        const avatar = opts?.avatarUrl || "";
        const uid = opts?.userId || `usr-${Date.now().toString(36)}`;

        if (typeof window !== "undefined") {
          try {
            window.sessionStorage.setItem(
              "verdara_auth_session_v3",
              JSON.stringify({
                isAuthenticated: true,
                authProvider: "email",
                displayName: cleanName,
                email,
                avatarUrl: avatar,
                userId: uid,
              })
            );
          } catch {
            // Ignore storage errors
          }
        }
        set({
          isAuthenticated: true,
          authProvider: "email",
          displayName: cleanName,
          email,
          avatarUrl: avatar,
          userId: uid,
        });
      },

      loginWithOAuth: (provider, profile) => {
        const defaultEmail =
          provider === "google"
            ? "resident.google@verdara.app"
            : provider === "facebook"
            ? "resident.facebook@verdara.app"
            : "resident@verdara.app";
        const defaultName =
          provider === "google"
            ? "Google Verified Resident"
            : provider === "facebook"
            ? "Facebook Verified Resident"
            : "Verdara Resident";
        const resolvedEmail = profile?.email?.trim() || defaultEmail;
        const resolvedName = profile?.displayName?.trim() || defaultName;
        const resolvedAvatar = profile?.avatarUrl || "";
        const resolvedUid =
          profile?.userId || `usr-${Date.now().toString(36)}`;
        const actualProvider: AuthProviderType =
          provider === "google" || provider === "facebook"
            ? provider
            : "email";

        if (typeof window !== "undefined") {
          try {
            window.sessionStorage.setItem(
              "verdara_auth_session_v3",
              JSON.stringify({
                isAuthenticated: true,
                authProvider: actualProvider,
                displayName: resolvedName,
                email: resolvedEmail,
                avatarUrl: resolvedAvatar,
                userId: resolvedUid,
              })
            );
          } catch {
            // Ignore storage errors
          }
        }
        set({
          isAuthenticated: true,
          authProvider: actualProvider,
          displayName: resolvedName,
          email: resolvedEmail,
          avatarUrl: resolvedAvatar,
          userId: resolvedUid,
        });
      },

      updateUserProfile: (updates) => {
        const state = get();
        const newName = updates.displayName?.trim() || state.displayName;
        const newAvatar =
          updates.avatarUrl !== undefined ? updates.avatarUrl : state.avatarUrl;

        if (typeof window !== "undefined") {
          try {
            const raw = window.sessionStorage.getItem(
              "verdara_auth_session_v3"
            );
            const current = raw ? JSON.parse(raw) : {};
            window.sessionStorage.setItem(
              "verdara_auth_session_v3",
              JSON.stringify({
                ...current,
                displayName: newName,
                avatarUrl: newAvatar,
              })
            );
          } catch {
            // Ignore storage errors
          }
        }

        set({
          displayName: newName,
          avatarUrl: newAvatar,
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
          authProvider: "email",
          displayName: "Guest Resident",
          email: "",
          avatarUrl: "",
          userId: "",
        });
      },

      setLocale: (locale) => set({ locale }),
      setUnits: (units) => set({ units }),
      setTheme: (theme) => {
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", theme);
        }
        set({ theme });
      },

      teleportToCity: (presetId) => {
        const geo = resolvePresetGeoContext(presetId, 10);
        const state = get();
        const footprint = state.customFootprintM2 || geo.defaultFootprintM2;
        const calc = calculateHousingFootprint({
          footprintM2: footprint,
          usableRoofRatio: state.usableRoofRatio,
          runoffCoefficient: state.runoffCoefficient,
          ghiKwhM2Day: geo.ghiKwhM2Day,
          annualPrecipMm: geo.koppen.pAnnMm,
          electricityTariff: geo.policy.electricityTariff,
          gridEfKgPerKwh: geo.policy.gridEfKgKwh,
          currency: geo.policy.currency,
          warmMonthMaxTempC: geo.warmMonthMaxTempC,
          greenCoverRatio: geo.greenCoverRatio,
          builtCoverRatio: geo.builtCoverRatio,
        });

        set({
          activePresetId: presetId,
          geo,
          housingCalc: calc,
          units: geo.policy.defaultUnits,
        });
      },

      setCustomCoordinates: (lat, lng, cityLabel, countryCode) => {
        const geo = resolveWorldCityGeoContext({
          lat,
          lng,
          city: cityLabel,
          countryCode,
        });
        const state = get();
        const footprint = state.customFootprintM2 || geo.defaultFootprintM2;
        const calc = calculateHousingFootprint({
          footprintM2: footprint,
          usableRoofRatio: state.usableRoofRatio,
          runoffCoefficient: state.runoffCoefficient,
          ghiKwhM2Day: geo.ghiKwhM2Day,
          annualPrecipMm: geo.koppen.pAnnMm,
          electricityTariff: geo.policy.electricityTariff,
          gridEfKgPerKwh: geo.policy.gridEfKgKwh,
          currency: geo.policy.currency,
          warmMonthMaxTempC: geo.warmMonthMaxTempC,
          greenCoverRatio: geo.greenCoverRatio,
          builtCoverRatio: geo.builtCoverRatio,
        });

        set({
          activePresetId: "custom",
          geo,
          housingCalc: calc,
          units: geo.policy.defaultUnits,
        });
      },

      updateCalculatorAssumptions: (opts) => {
        const state = get();
        const footprint = opts.footprintM2 ?? state.customFootprintM2;
        const usableRoof = opts.usableRoofRatio ?? state.usableRoofRatio;
        const runoff = opts.runoffCoefficient ?? state.runoffCoefficient;
        const calc = calculateHousingFootprint({
          footprintM2: footprint,
          usableRoofRatio: usableRoof,
          runoffCoefficient: runoff,
          ghiKwhM2Day: state.geo.ghiKwhM2Day,
          annualPrecipMm: state.geo.koppen.pAnnMm,
          electricityTariff: state.geo.policy.electricityTariff,
          gridEfKgPerKwh: state.geo.policy.gridEfKgKwh,
          currency: state.geo.policy.currency,
          warmMonthMaxTempC: state.geo.warmMonthMaxTempC,
          greenCoverRatio: state.geo.greenCoverRatio,
          builtCoverRatio: state.geo.builtCoverRatio,
        });

        set({
          customFootprintM2: footprint,
          usableRoofRatio: usableRoof,
          runoffCoefficient: runoff,
          housingCalc: calc,
        });
      },

      setSelectedMaterialFilter: (material) =>
        set({ selectedMaterialFilter: material }),

      awardXp: (amount, unlockItemCode) => {
        const state = get();
        const nextXp = Math.max(0, state.xp + amount);
        const lvl = levelForXp(nextXp);
        const items =
          unlockItemCode && !state.unlockedItems.includes(unlockItemCode)
            ? [...state.unlockedItems, unlockItemCode]
            : state.unlockedItems;

        set({
          xp: nextXp,
          level: lvl.level,
          progressPct: lvl.progressPct,
          unlockedItems: items,
        });
      },

      markQuizPassed: (lessonId) => {
        const state = get();
        if (state.passedQuizLessonIds.includes(lessonId)) return;
        const nextPassed = [...state.passedQuizLessonIds, lessonId];
        const nextXp = state.xp + 100;
        const lvl = levelForXp(nextXp);

        set({
          passedQuizLessonIds: nextPassed,
          xp: nextXp,
          level: lvl.level,
          progressPct: lvl.progressPct,
        });
      },

      markProofVerified: (lessonId, dhash, xpReward, unlockItemCode) => {
        const state = get();
        if (state.verifiedProofLessonIds.includes(lessonId)) return;

        const nextVerified = [...state.verifiedProofLessonIds, lessonId];
        const nextDHashes = [...state.submittedDHashes, dhash];
        const nextXp = state.xp + xpReward;
        const lvl = levelForXp(nextXp);
        const items =
          unlockItemCode && !state.unlockedItems.includes(unlockItemCode)
            ? [...state.unlockedItems, unlockItemCode]
            : state.unlockedItems;

        set({
          verifiedProofLessonIds: nextVerified,
          submittedDHashes: nextDHashes,
          xp: nextXp,
          level: lvl.level,
          progressPct: lvl.progressPct,
          unlockedItems: items,
        });
      },

      recordScanCompleted: (scan, isCacheHit) => {
        const state = get();
        const xpEarned = scan.mode === "waste" ? 60 : 120;
        const nextXp = state.xp + xpEarned;
        const lvl = levelForXp(nextXp);

        set({
          xp: nextXp,
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
    }),
    {
      name: "verdara_spatial_store_v3",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        authProvider: state.authProvider,
        displayName: state.displayName,
        email: state.email,
        avatarUrl: state.avatarUrl,
        userId: state.userId,
        memberSince: state.memberSince,
        locale: state.locale,
        units: state.units,
        theme: state.theme,
        activePresetId: state.activePresetId,
        customFootprintM2: state.customFootprintM2,
        usableRoofRatio: state.usableRoofRatio,
        runoffCoefficient: state.runoffCoefficient,
        xp: state.xp,
        level: state.level,
        progressPct: state.progressPct,
        streakDays: state.streakDays,
        totalCo2eAvoidedKg: state.totalCo2eAvoidedKg,
        totalObjectsScanned: state.totalObjectsScanned,
        unlockedItems: state.unlockedItems,
        passedQuizLessonIds: state.passedQuizLessonIds,
        verifiedProofLessonIds: state.verifiedProofLessonIds,
        submittedDHashes: state.submittedDHashes,
        scanHistory: state.scanHistory,
      }),
    }
  )
);
