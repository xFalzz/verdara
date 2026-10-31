import { WORLD_CITY_CATALOG, resolveWorldCityGeoContext } from "../science/presets";
import { calculateHousingFootprint } from "../science/calculator";
import { maskEmail } from "../security/guard";

export interface DbUserRecord {
  id: string;
  email: string;
  displayName: string;
  role: "resident" | "judge" | "researcher";
  level: number;
  xp: number;
  countryCode: string;
  city: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface DbScanAuditRecord {
  id: string;
  userId: string;
  sampleId: string;
  mode: "waste" | "plant" | "retrofit";
  city: string;
  countryCode: string;
  objectCount: number;
  co2eAvoidedG: number;
  dhash: string;
  verifiedByModel: string;
  createdAt: string;
}

export interface DbSecurityEvent {
  id: string;
  timestamp: string;
  type: "AUTH_LOGIN" | "RATE_LIMIT_CHECK" | "CSRF_ORIGIN_CHECK" | "AI_SHIELD_GUARD" | "DHASH_DEDUP";
  status: "ALLOW" | "BLOCK";
  actor: string;
  detail: string;
}

export interface GlobalBenchmarkRecord {
  slug: string;
  city: string;
  countryCode: string;
  countryNameEn: string;
  countryNameId: string;
  continent: string;
  lat: number;
  lng: number;
  koppenCode: string;
  biome: string;
  ghiKwhM2Day: number;
  annualPrecipMm: number;
  solarKwpDefault: number;
  solarSavingsYr: number;
  currency: string;
  rainLitersYr: number;
  tciScore: number;
}

/**
 * Upgraded Verdara Enterprise Spatial Database (v3.2)
 * Provides deterministic global climate/solar benchmarks, user session records,
 * scan audit trails, and cybersecurity event logs.
 */
class VerdaraDatabaseEngine {
  public readonly schemaVersion = "3.2.0-enterprise";
  public readonly updatedAt = "2026-10-31T00:00:00Z";

  private users: Map<string, DbUserRecord> = new Map();
  private scans: DbScanAuditRecord[] = [];
  private securityEvents: DbSecurityEvent[] = [];

  constructor() {
    this.seedDatabase();
  }

  private seedDatabase() {
    const seedUsers: DbUserRecord[] = [
      {
        id: "usr-judge-01",
        email: "judge+menlopark@verdara.app",
        displayName: "Meta Hackathon Judge (Lv.5)",
        role: "judge",
        level: 5,
        xp: 1120,
        countryCode: "US",
        city: "Menlo Park",
        createdAt: "2026-10-20T08:00:00Z",
        lastLoginAt: new Date().toISOString(),
      },
      {
        id: "usr-res-02",
        email: "arkana.putra@verdara.id",
        displayName: "Arkana Putra (Yogyakarta Node)",
        role: "resident",
        level: 4,
        xp: 640,
        countryCode: "ID",
        city: "Yogyakarta",
        createdAt: "2026-10-22T10:15:00Z",
        lastLoginAt: "2026-10-30T14:20:00Z",
      },
      {
        id: "usr-res-03",
        email: "elena.rostova@verdara.eu",
        displayName: "Dr. Elena Rostova (Zurich Urban Lab)",
        role: "researcher",
        level: 5,
        xp: 1340,
        countryCode: "CH",
        city: "Zurich",
        createdAt: "2026-10-23T09:30:00Z",
        lastLoginAt: "2026-10-30T18:05:00Z",
      },
    ];

    for (const u of seedUsers) {
      this.users.set(u.email.toLowerCase(), u);
    }

    this.scans = [
      {
        id: "scn-9001",
        userId: "usr-judge-01",
        sampleId: "sample-solar-roof",
        mode: "retrofit",
        city: "Menlo Park",
        countryCode: "US",
        objectCount: 5,
        co2eAvoidedG: 42500,
        dhash: "e4a9b2c190817263",
        verifiedByModel: "meta-sam-3.1 + muse-spark",
        createdAt: "2026-10-30T12:00:00Z",
      },
      {
        id: "scn-9002",
        userId: "usr-res-02",
        sampleId: "sample-recyclables",
        mode: "waste",
        city: "Yogyakarta",
        countryCode: "ID",
        objectCount: 8,
        co2eAvoidedG: 3120,
        dhash: "a1c3f5907812e4b0",
        verifiedByModel: "meta-sam-3.1",
        createdAt: "2026-10-30T15:30:00Z",
      },
    ];

    this.securityEvents = [
      {
        id: "sec-101",
        timestamp: new Date().toISOString(),
        type: "AI_SHIELD_GUARD",
        status: "ALLOW",
        actor: "system-boot",
        detail: "7-Layer Credit Shield initialized ($135.00 hard cap, $35.00 judge reserve locked).",
      },
      {
        id: "sec-102",
        timestamp: new Date().toISOString(),
        type: "DHASH_DEDUP",
        status: "ALLOW",
        actor: "sam-3.1-verifier",
        detail: "64-bit perceptual dHash anti-replay index armed with Hamming distance <= 8 threshold.",
      },
    ];
  }

  public getGlobalBenchmarks(): GlobalBenchmarkRecord[] {
    return WORLD_CITY_CATALOG.map((entry) => {
      const geo = resolveWorldCityGeoContext({
        lat: entry.lat,
        lng: entry.lng,
        city: entry.city,
        countryCode: entry.countryCode,
      });
      const calc = calculateHousingFootprint({
        footprintM2: geo.defaultFootprintM2,
        ghiKwhM2Day: geo.ghiKwhM2Day,
        annualPrecipMm: geo.koppen.pAnnMm,
        electricityTariff: geo.policy.electricityTariff,
        gridEfKgPerKwh: geo.policy.gridEfKgKwh,
        currency: geo.policy.currency,
        warmMonthMaxTempC: geo.warmMonthMaxTempC,
        greenCoverRatio: geo.greenCoverRatio,
        builtCoverRatio: geo.builtCoverRatio,
      });

      return {
        slug: entry.slug,
        city: entry.city,
        countryCode: entry.countryCode,
        countryNameEn: entry.countryNameEn,
        countryNameId: entry.countryNameId,
        continent: entry.continent,
        lat: entry.lat,
        lng: entry.lng,
        koppenCode: geo.koppen.code,
        biome: geo.biome,
        ghiKwhM2Day: geo.ghiKwhM2Day,
        annualPrecipMm: geo.koppen.pAnnMm,
        solarKwpDefault: calc.solar.kwp,
        solarSavingsYr: calc.solar.savingsYear,
        currency: calc.solar.currency,
        rainLitersYr: calc.rainwater.litersYear,
        tciScore: calc.thermal.tciScore,
      };
    });
  }

  public upsertUserLogin(opts: {
    email: string;
    displayName: string;
    role?: "resident" | "judge" | "researcher";
    city?: string;
    countryCode?: string;
  }): DbUserRecord {
    const key = opts.email.trim().toLowerCase();
    const existing = this.users.get(key);
    const now = new Date().toISOString();

    const record: DbUserRecord = existing
      ? {
          ...existing,
          displayName: opts.displayName || existing.displayName,
          lastLoginAt: now,
        }
      : {
          id: `usr-${Date.now().toString(36)}`,
          email: key,
          displayName: opts.displayName || key.split("@")[0] || "Verdara Resident",
          role: opts.role ?? "resident",
          level: opts.role === "judge" ? 5 : 1,
          xp: opts.role === "judge" ? 1120 : 0,
          countryCode: opts.countryCode ?? "US",
          city: opts.city ?? "Menlo Park",
          createdAt: now,
          lastLoginAt: now,
        };

    this.users.set(key, record);
    this.logSecurityEvent({
      type: "AUTH_LOGIN",
      status: "ALLOW",
      actor: key,
      detail: `Authenticated session for ${record.displayName} (role: ${record.role})`,
    });
    return record;
  }

  public logSecurityEvent(ev: Omit<DbSecurityEvent, "id" | "timestamp">) {
    this.securityEvents.unshift({
      id: `sec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...ev,
    });
    if (this.securityEvents.length > 50) {
      this.securityEvents.length = 50;
    }
  }

  public getDatabaseSummary() {
    const benchmarks = this.getGlobalBenchmarks();
    return {
      schemaVersion: this.schemaVersion,
      updatedAt: this.updatedAt,
      engine: "Verdara Spatial Cloud Store v3.2",
      counts: {
        supportedCountries: 195,
        curatedBenchmarkCities: benchmarks.length,
        registeredUsers: this.users.size,
        verifiedScans: this.scans.length,
        securityEvents: this.securityEvents.length,
      },
      users: Array.from(this.users.values()).map((u) => ({
        ...u,
        email: maskEmail(u.email),
      })),
      recentScans: this.scans.slice(0, 10),
      securityAudit: this.securityEvents.slice(0, 10),
      benchmarks,
    };
  }
}

export const verdaraDb = new VerdaraDatabaseEngine();
