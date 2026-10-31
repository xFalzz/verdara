/**
 * Dual Unit System (Metric / Imperial) & International Currency Formatter
 */

export type UnitSystem = "metric" | "imperial";
export type AppLocale = "en" | "id";

export function formatCurrency(
  amount: number,
  currency: string,
  locale: AppLocale = "en"
): string {
  const zeroDecimalCurrencies = ["JPY", "KRW", "IDR"];
  const isZeroDec = zeroDecimalCurrencies.includes(currency.toUpperCase());

  try {
    return new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: isZeroDec ? 0 : 2,
      maximumFractionDigits: isZeroDec ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(isZeroDec ? 0 : 2)}`;
  }
}

export function formatArea(
  m2: number,
  units: UnitSystem,
  locale: AppLocale = "en"
): string {
  const fmt = new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", {
    maximumFractionDigits: 1,
  });
  if (units === "imperial") {
    return `${fmt.format(m2 * 10.7639)} sq ft`;
  }
  return `${fmt.format(m2)} m²`;
}

export function formatVolume(
  liters: number,
  units: UnitSystem,
  locale: AppLocale = "en"
): string {
  const fmt = new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", {
    maximumFractionDigits: 0,
  });
  if (units === "imperial") {
    return `${fmt.format(liters * 0.264172)} gal`;
  }
  return `${fmt.format(liters)} L`;
}

export function formatMass(
  grams: number,
  units: UnitSystem,
  locale: AppLocale = "en"
): string {
  const fmt = new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", {
    maximumFractionDigits: 1,
  });
  if (units === "imperial") {
    if (grams >= 453.6) {
      return `${fmt.format(grams / 453.592)} lb`;
    }
    return `${fmt.format(grams * 0.035274)} oz`;
  }
  if (grams >= 1000) {
    return `${fmt.format(grams / 1000)} kg`;
  }
  return `${Math.round(grams)} g`;
}

export function formatTemp(c: number, units: UnitSystem): string {
  if (units === "imperial") {
    return `${Math.round((c * 9) / 5 + 32)}°F`;
  }
  return `${Math.round(c)}°C`;
}

/**
 * Deterministic number formatter across SSR and client to eliminate hydration mismatches.
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale: AppLocale = "en"
): string {
  const safe = Number.isFinite(value) ? value : 0;
  try {
    return new Intl.NumberFormat(
      locale === "id" ? "id-ID" : "en-US",
      options
    ).format(safe);
  } catch {
    return String(safe);
  }
}

/**
 * Deterministic XP to Level Formula (PRD FR-GAME-02):
 * threshold(n) = 50 * n * (n - 1), max level = 10
 */
export function levelForXp(xp: number): {
  level: number;
  currentLevelFloorXp: number;
  nextLevelXp: number;
  progressPct: number;
} {
  const safeXp = Math.max(0, xp);
  const rawLevel = Math.floor((1 + Math.sqrt(1 + 0.08 * safeXp)) / 2);
  const level = Math.min(10, Math.max(1, rawLevel));
  const currentLevelFloorXp = 50 * level * (level - 1);
  const nextLevelXp = level >= 10 ? 4500 : 50 * (level + 1) * level;
  const span = Math.max(1, nextLevelXp - currentLevelFloorXp);
  const progressPct =
    level >= 10
      ? 100
      : Math.min(100, Math.round(((safeXp - currentLevelFloorXp) / span) * 100));

  return { level, currentLevelFloorXp, nextLevelXp, progressPct };
}
