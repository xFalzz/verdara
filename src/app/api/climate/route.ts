import { NextRequest, NextResponse } from "next/server";
import {
  resolvePresetGeoContext,
  resolveWorldCityGeoContext,
  type CityPreset,
} from "@/lib/science/presets";
import { calculateHousingFootprint } from "@/lib/science/calculator";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const presetParam = searchParams.get("preset") as CityPreset["id"] | null;
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const cityParam = searchParams.get("city");
  const countryParam = searchParams.get("country");

  const geo =
    latParam && lngParam && cityParam
      ? resolveWorldCityGeoContext({
          lat: Number(latParam),
          lng: Number(lngParam),
          city: cityParam,
          countryCode: countryParam || "XX",
        })
      : resolvePresetGeoContext(
          presetParam &&
            ["menlo_park", "london", "tokyo", "dubai", "yogyakarta"].includes(
              presetParam
            )
            ? presetParam
            : "menlo_park",
          10
        );

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

  return NextResponse.json({
    ok: true,
    source: "Open-Meteo ERA5 10-Year Climatology + NASA POWER GHI",
    geo,
    calc,
  });
}
