import { NextRequest, NextResponse } from "next/server";
import {
  findNearestPresetByCoords,
  resolvePresetGeoContext,
  type CityPreset,
} from "@/lib/science/presets";
import { calculateHousingFootprint } from "@/lib/science/calculator";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const presetParam = searchParams.get("preset") as CityPreset["id"] | null;
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");

  let presetId: CityPreset["id"] = "menlo_park";
  if (
    presetParam &&
    ["menlo_park", "london", "tokyo", "dubai", "yogyakarta"].includes(presetParam)
  ) {
    presetId = presetParam;
  } else if (latParam && lngParam) {
    presetId = findNearestPresetByCoords(Number(latParam), Number(lngParam));
  }

  const geo = resolvePresetGeoContext(presetId, 10);
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
    cache: "hit",
    geo,
    calc,
  });
}
