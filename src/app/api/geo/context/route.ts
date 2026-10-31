import { NextRequest, NextResponse } from "next/server";
import {
  resolvePresetGeoContext,
  resolveWorldCityGeoContext,
  type CityPreset,
} from "@/lib/science/presets";
import { calculateHousingFootprint } from "@/lib/science/calculator";
import {
  checkRateLimit,
  sanitizeInputText,
  isValidCoordinate,
} from "@/lib/security/guard";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const rl = checkRateLimit(`geo-context:${ip}`, 40, 1);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Rate limit exceeded. Try again shortly." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const presetParam = searchParams.get("preset") as CityPreset["id"] | null;
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const cityParam = sanitizeInputText(searchParams.get("city") || "", 60);
  const countryParam = sanitizeInputText(searchParams.get("country") || "", 8);

  const numLat = latParam ? Number(latParam) : NaN;
  const numLng = lngParam ? Number(lngParam) : NaN;
  const hasValidCoords = isValidCoordinate(numLat, numLng);

  const geo =
    hasValidCoords && cityParam
      ? resolveWorldCityGeoContext({
          lat: numLat,
          lng: numLng,
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
    cache: "hit",
    geo,
    calc,
  });
}
