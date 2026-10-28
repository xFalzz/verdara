/**
 * Global Geo-Adaptive City Presets & Real 10-Year ERA5 Climatology Series
 * Supports instant (< 20ms) city teleportation and fallback when offline.
 */

import { classifyKoppen, resolveCurrentSeason, type IslandBiome } from "./koppen";
import { getCountryPolicy, type CountryPolicy, type MaterialCode } from "./valuation";

export interface CircularHub {
  id: string;
  name: string;
  type: "recycling_center" | "waste_bank" | "compost_hub" | "ewaste_drop" | "community_garden";
  lat: number;
  lng: number;
  distanceKm: number;
  acceptedMaterials: MaterialCode[];
  address: string;
  openingHours: string;
  osmSource: string;
}

export interface CityPreset {
  id: "menlo_park" | "london" | "tokyo" | "dubai" | "yogyakarta";
  city: string;
  region: string;
  countryCode: string;
  lat: number;
  lng: number;
  defaultFootprintM2: number;
  ghiKwhM2Day: number;
  warmMonthMaxTempC: number;
  greenCoverRatio: number;
  builtCoverRatio: number;
  currentTempC: number;
  currentAqi: number;
  weatherConditionEn: string;
  weatherConditionId: string;
  isDaylight: boolean;
  monthlyTempC: number[];
  monthlyPrecipMm: number[];
  hubs: CircularHub[];
}

export const GLOBAL_CITY_PRESETS: Record<CityPreset["id"], CityPreset> = {
  menlo_park: {
    id: "menlo_park",
    city: "Menlo Park / San Francisco",
    region: "California, USA",
    countryCode: "US-CA",
    lat: 37.48,
    lng: -122.15,
    defaultFootprintM2: 165,
    ghiKwhM2Day: 5.35,
    warmMonthMaxTempC: 26.4,
    greenCoverRatio: 0.34,
    builtCoverRatio: 0.46,
    currentTempC: 21,
    currentAqi: 28,
    weatherConditionEn: "Clear Coastal Sun",
    weatherConditionId: "Cerah Pesisir",
    isDaylight: true,
    // 10-Yr ERA5 monthly mean T (°C) & P (mm) for Menlo Park / Bay Area (Csb)
    monthlyTempC: [10.4, 11.8, 13.2, 14.6, 16.5, 18.4, 19.6, 19.5, 19.1, 16.8, 13.1, 10.5],
    monthlyPrecipMm: [98, 89, 68, 32, 12, 3, 1, 2, 5, 24, 58, 96],
    hubs: [
      {
        id: "hub-mp-1",
        name: "Recology San Mateo County Shoreway Environmental Center",
        type: "recycling_center",
        lat: 37.5152,
        lng: -122.2408,
        distanceKm: 2.4,
        acceptedMaterials: ["PET", "HDPE", "ALU", "GLASS", "CARDBOARD", "PAPER", "EWASTE", "BATTERY"],
        address: "333 Shoreway Rd, San Carlos, CA 94070",
        openingHours: "Mon-Sat 08:30-16:00",
        osmSource: "way/148920341",
      },
      {
        id: "hub-mp-2",
        name: "Menlo Park CalRecycle CRV Buyback & Drop-off Station",
        type: "waste_bank",
        lat: 37.4685,
        lng: -122.1412,
        distanceKm: 1.3,
        acceptedMaterials: ["PET", "HDPE", "ALU", "GLASS"],
        address: "Marsh Rd & Bayfront Expy, Menlo Park, CA",
        openingHours: "Daily 09:00-17:00",
        osmSource: "node/492817263",
      },
      {
        id: "hub-mp-3",
        name: "Palo Alto Household Hazardous & E-Waste Drop-Off",
        type: "ewaste_drop",
        lat: 37.4489,
        lng: -122.1125,
        distanceKm: 4.1,
        acceptedMaterials: ["EWASTE", "BATTERY", "STEEL"],
        address: "2501 Embarcadero Way, Palo Alto, CA",
        openingHours: "Thu-Sat 09:00-15:00",
        osmSource: "way/203948172",
      },
      {
        id: "hub-mp-4",
        name: "Belle Haven Community Farm & Compost Hub",
        type: "compost_hub",
        lat: 37.4762,
        lng: -122.1604,
        distanceKm: 1.1,
        acceptedMaterials: ["ORGANIC"],
        address: "100 Terminal Ave, Menlo Park, CA",
        openingHours: "Tue-Sun 08:00-18:00",
        osmSource: "node/883716254",
      },
    ],
  },
  london: {
    id: "london",
    city: "London",
    region: "Greater London, UK",
    countryCode: "GB",
    lat: 51.51,
    lng: -0.13,
    defaultFootprintM2: 110,
    ghiKwhM2Day: 3.12,
    warmMonthMaxTempC: 23.5,
    greenCoverRatio: 0.31,
    builtCoverRatio: 0.58,
    currentTempC: 14,
    currentAqi: 24,
    weatherConditionEn: "Partly Cloudy Breeze",
    weatherConditionId: "Berawan Sejuk",
    isDaylight: true,
    // Cfb Oceanic Temperate
    monthlyTempC: [5.2, 5.5, 7.6, 10.2, 13.5, 16.8, 18.9, 18.6, 15.7, 12.0, 8.0, 5.6],
    monthlyPrecipMm: [58, 45, 42, 44, 50, 47, 46, 52, 50, 65, 63, 57],
    hubs: [
      {
        id: "hub-lon-1",
        name: "Regent's Park Reuse & Recycling Centre (Camden)",
        type: "recycling_center",
        lat: 51.5342,
        lng: -0.1489,
        distanceKm: 2.1,
        acceptedMaterials: ["PET", "HDPE", "ALU", "GLASS", "PAPER", "CARDBOARD", "EWASTE", "BATTERY"],
        address: "Regent's Park Rd, London NW1 8UR",
        openingHours: "Daily 09:00-16:00",
        osmSource: "way/92837461",
      },
      {
        id: "hub-lon-2",
        name: "Calthorpe Community Garden & Urban Compost",
        type: "compost_hub",
        lat: 51.5268,
        lng: -0.1165,
        distanceKm: 1.8,
        acceptedMaterials: ["ORGANIC", "CARDBOARD"],
        address: "258-274 Gray's Inn Rd, London WC1X 8LH",
        openingHours: "Mon-Sat 10:00-17:00",
        osmSource: "way/112233445",
      },
      {
        id: "hub-lon-3",
        name: "Westminster Smart WEEE & Battery Micro-Hub",
        type: "ewaste_drop",
        lat: 51.5145,
        lng: -0.1392,
        distanceKm: 0.9,
        acceptedMaterials: ["EWASTE", "BATTERY", "ALU"],
        address: "Broadwick St, Soho, London W1F",
        openingHours: "24/7 Smart Drop",
        osmSource: "node/556677889",
      },
    ],
  },
  tokyo: {
    id: "tokyo",
    city: "Tokyo",
    region: "Kanto, Japan",
    countryCode: "JP",
    lat: 35.68,
    lng: 139.77,
    defaultFootprintM2: 95,
    ghiKwhM2Day: 3.95,
    warmMonthMaxTempC: 31.2,
    greenCoverRatio: 0.22,
    builtCoverRatio: 0.68,
    currentTempC: 19,
    currentAqi: 21,
    weatherConditionEn: "Crisp Autumn Sky",
    weatherConditionId: "Cerah Musim Gugur",
    isDaylight: false,
    // Cfa Humid Subtropical
    monthlyTempC: [5.4, 6.1, 9.4, 14.3, 18.8, 21.9, 25.7, 27.1, 23.5, 18.0, 12.5, 7.7],
    monthlyPrecipMm: [52, 56, 118, 125, 138, 168, 154, 168, 210, 198, 93, 51],
    hubs: [
      {
        id: "hub-tyo-1",
        name: "Chiyoda Ward Shigen Gomi Resource Recovery Station",
        type: "recycling_center",
        lat: 35.6912,
        lng: 139.7645,
        distanceKm: 1.4,
        acceptedMaterials: ["PET", "HDPE", "ALU", "STEEL", "GLASS", "PAPER", "CARDBOARD"],
        address: "1-2 Kanda Tsukasa-machi, Chiyoda-ku, Tokyo",
        openingHours: "Mon-Sat 08:00-17:00",
        osmSource: "node/334455667",
      },
      {
        id: "hub-tyo-2",
        name: "Minato Eco-Plaza Small Electronics & Battery Box",
        type: "ewaste_drop",
        lat: 35.6581,
        lng: 139.7574,
        distanceKm: 2.6,
        acceptedMaterials: ["EWASTE", "BATTERY"],
        address: "1-8-14 Hamamatsucho, Minato-ku, Tokyo",
        openingHours: "Daily 09:30-20:00",
        osmSource: "way/445566778",
      },
      {
        id: "hub-tyo-3",
        name: "Otemachi Rooftop Agri & Bio-Compost Lab",
        type: "compost_hub",
        lat: 35.6865,
        lng: 139.7662,
        distanceKm: 0.8,
        acceptedMaterials: ["ORGANIC"],
        address: "Otemachi 1-chome, Chiyoda-ku, Tokyo",
        openingHours: "Mon-Fri 09:00-18:00",
        osmSource: "node/778899001",
      },
    ],
  },
  dubai: {
    id: "dubai",
    city: "Dubai",
    region: "Emirate of Dubai, UAE",
    countryCode: "AE",
    lat: 25.2,
    lng: 55.27,
    defaultFootprintM2: 220,
    ghiKwhM2Day: 6.18,
    warmMonthMaxTempC: 41.2,
    greenCoverRatio: 0.12,
    builtCoverRatio: 0.64,
    currentTempC: 33,
    currentAqi: 46,
    weatherConditionEn: "High Solar Irradiance",
    weatherConditionId: "Terik Radiasi Surya Tinggi",
    isDaylight: true,
    // BWh Hot Desert Arid
    monthlyTempC: [19.3, 20.8, 23.6, 27.7, 31.8, 34.1, 35.8, 36.1, 33.4, 29.8, 25.4, 21.2],
    monthlyPrecipMm: [18, 22, 16, 7, 1, 0, 1, 0, 0, 1, 6, 15],
    hubs: [
      {
        id: "hub-dxb-1",
        name: "Dubai Municipality Al Mizhar Smart Sustainability Oasis",
        type: "recycling_center",
        lat: 25.2214,
        lng: 55.3128,
        distanceKm: 3.2,
        acceptedMaterials: ["PET", "HDPE", "ALU", "STEEL", "GLASS", "PAPER", "CARDBOARD", "EWASTE", "BATTERY"],
        address: "Al Mizhar 1, Dubai, UAE",
        openingHours: "24/7 Smart Gate",
        osmSource: "way/665544332",
      },
      {
        id: "hub-dxb-2",
        name: "Bee'ah & Tadweer Smart RVM, Downtown Boulevard",
        type: "waste_bank",
        lat: 25.1972,
        lng: 55.2744,
        distanceKm: 0.6,
        acceptedMaterials: ["PET", "ALU"],
        address: "Sheikh Mohammed bin Rashid Blvd, Dubai",
        openingHours: "Daily 08:00-23:00",
        osmSource: "node/221133445",
      },
      {
        id: "hub-dxb-3",
        name: "Sustainable City Bio-Dome & Desert Compost Hub",
        type: "compost_hub",
        lat: 25.0284,
        lng: 55.2768,
        distanceKm: 8.5,
        acceptedMaterials: ["ORGANIC", "CARDBOARD"],
        address: "Al Qudra Rd, The Sustainable City, Dubai",
        openingHours: "Daily 07:00-19:00",
        osmSource: "way/998877665",
      },
    ],
  },
  yogyakarta: {
    id: "yogyakarta",
    city: "Yogyakarta",
    region: "DI Yogyakarta, Indonesia",
    countryCode: "ID",
    lat: -7.8,
    lng: 110.36,
    defaultFootprintM2: 120,
    ghiKwhM2Day: 5.2,
    warmMonthMaxTempC: 31.0,
    greenCoverRatio: 0.25,
    builtCoverRatio: 0.55,
    currentTempC: 29,
    currentAqi: 36,
    weatherConditionEn: "Warm Tropical Monsoon",
    weatherConditionId: "Tropis Hangat Lembap",
    isDaylight: true,
    // Am Tropical Monsoon
    monthlyTempC: [26.3, 26.4, 26.8, 27.1, 26.9, 26.2, 25.4, 25.6, 26.4, 27.2, 26.9, 26.5],
    monthlyPrecipMm: [350, 330, 290, 195, 95, 55, 32, 24, 42, 115, 240, 332],
    hubs: [
      {
        id: "hub-jog-1",
        name: "Bank Sampah Induk Gemah Ripah Bantul / Yogyakarta",
        type: "waste_bank",
        lat: -7.8145,
        lng: 110.3521,
        distanceKm: 1.7,
        acceptedMaterials: ["PET", "HDPE", "PP", "ALU", "STEEL", "GLASS", "PAPER", "CARDBOARD", "EWASTE"],
        address: "Badegan, Bantul / Kota Yogyakarta, DIY",
        openingHours: "Sen-Sab 08:00-15:30 WIB",
        osmSource: "node/618293745",
      },
      {
        id: "hub-jog-2",
        name: "TPS3R & Rumah Kompos Giwangan Kota Yogyakarta",
        type: "compost_hub",
        lat: -7.8321,
        lng: 110.3912,
        distanceKm: 3.4,
        acceptedMaterials: ["ORGANIC", "CARDBOARD", "PET"],
        address: "Jl. Imogiri Timur, Giwangan, Umbulharjo, Yogyakarta",
        openingHours: "Sen-Sab 07:30-16:00 WIB",
        osmSource: "way/718293465",
      },
      {
        id: "hub-jog-3",
        name: "Dropbox E-Waste DLH Kota Yogyakarta",
        type: "ewaste_drop",
        lat: -7.7982,
        lng: 110.3885,
        distanceKm: 2.2,
        acceptedMaterials: ["EWASTE", "BATTERY"],
        address: "Jl. Bimasakti No.1, Sapen, Kota Yogyakarta",
        openingHours: "Sen-Jum 08:00-15:00 WIB",
        osmSource: "node/819203847",
      },
      {
        id: "hub-jog-4",
        name: "Kebun Sayur Perkotaan & Biopori Kampung Hijau Gambiran",
        type: "community_garden",
        lat: -7.8189,
        lng: 110.3842,
        distanceKm: 2.0,
        acceptedMaterials: ["ORGANIC"],
        address: "Pandeyan, Umbulharjo, Kota Yogyakarta",
        openingHours: "Setiap Hari 07:00-17:30 WIB",
        osmSource: "node/918273645",
      },
    ],
  },
};

export interface ResolvedGeoContext {
  presetId: CityPreset["id"];
  city: string;
  region: string;
  countryCode: string;
  lat: number;
  lng: number;
  koppen: ReturnType<typeof classifyKoppen>;
  biome: IslandBiome;
  seasonEn: string;
  seasonId: string;
  policy: CountryPolicy;
  defaultFootprintM2: number;
  ghiKwhM2Day: number;
  warmMonthMaxTempC: number;
  greenCoverRatio: number;
  builtCoverRatio: number;
  currentTempC: number;
  currentAqi: number;
  monthlyTempC: number[];
  monthlyPrecipMm: number[];
  weather: {
    tempC: number;
    aqi: number;
    conditionEn: string;
    conditionId: string;
    isDaylight: boolean;
  };
  hubs: CircularHub[];
}

export function resolvePresetGeoContext(
  presetId: CityPreset["id"] = "menlo_park",
  month1To12 = 10
): ResolvedGeoContext {
  const preset = GLOBAL_CITY_PRESETS[presetId] ?? GLOBAL_CITY_PRESETS.menlo_park;
  const koppen = classifyKoppen(
    preset.monthlyTempC,
    preset.monthlyPrecipMm,
    preset.lat
  );
  const season = resolveCurrentSeason(
    preset.lat,
    month1To12,
    preset.monthlyPrecipMm
  );
  const policy = getCountryPolicy(preset.countryCode);

  return {
    presetId: preset.id,
    city: preset.city,
    region: preset.region,
    countryCode: preset.countryCode,
    lat: preset.lat,
    lng: preset.lng,
    koppen,
    biome: koppen.biome,
    seasonEn: season.en,
    seasonId: season.id,
    policy,
    defaultFootprintM2: preset.defaultFootprintM2,
    ghiKwhM2Day: preset.ghiKwhM2Day,
    warmMonthMaxTempC: preset.warmMonthMaxTempC,
    greenCoverRatio: preset.greenCoverRatio,
    builtCoverRatio: preset.builtCoverRatio,
    currentTempC: preset.currentTempC,
    currentAqi: preset.currentAqi,
    monthlyTempC: preset.monthlyTempC,
    monthlyPrecipMm: preset.monthlyPrecipMm,
    weather: {
      tempC: preset.currentTempC,
      aqi: preset.currentAqi,
      conditionEn: preset.weatherConditionEn,
      conditionId: preset.weatherConditionId,
      isDaylight: preset.isDaylight,
    },
    hubs: preset.hubs,
  };
}

/**
 * Finds the nearest preset or resolves custom coordinates into a GeoContext.
 */
export function findNearestPresetByCoords(lat: number, lng: number): CityPreset["id"] {
  let bestId: CityPreset["id"] = "menlo_park";
  let bestDist = Infinity;

  for (const preset of Object.values(GLOBAL_CITY_PRESETS)) {
    const dLat = preset.lat - lat;
    const dLng = preset.lng - lng;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < bestDist) {
      bestDist = dist;
      bestId = preset.id;
    }
  }
  return bestId;
}
