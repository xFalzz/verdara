"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import StudioShell from "@/components/ui/StudioShell";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import {
  formatArea,
  formatCurrency,
  formatVolume,
} from "@/lib/science/units";
import type { CircularHub } from "@/lib/science/presets";
import type { MaterialCode } from "@/lib/science/valuation";

const Radar3DMap = dynamic(() => import("@/components/radar/Radar3DMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center border border-[#1D3328] bg-[#0E1914] p-6 font-mono text-xs text-[#A3BEB0]">
      Loading MapLibre GL 3D Urban Terrain (55° Pitch)...
    </div>
  ),
});

const MATERIAL_FILTERS: (MaterialCode | "ALL")[] = [
  "ALL",
  "PET",
  "ALU",
  "GLASS",
  "CARDBOARD",
  "ORGANIC",
  "EWASTE",
  "BATTERY",
];

export default function RadarPage() {
  const router = useRouter();
  const {
    locale,
    units,
    theme,
    geo,
    housingCalc,
    customFootprintM2,
    usableRoofRatio,
    runoffCoefficient,
    selectedMaterialFilter,
    setSelectedMaterialFilter,
    updateCalculatorAssumptions,
    awardXp,
  } = useVerdaraStore();

  const [selectedHub, setSelectedHub] = useState<CircularHub | null>(
    geo.hubs[0] ?? null
  );
  const [savedToast, setSavedToast] = useState<boolean>(false);

  const isId = locale === "id";
  const isLight = theme === "light";

  const filteredHubs = useMemo(() => {
    if (!selectedMaterialFilter || selectedMaterialFilter === "ALL") {
      return geo.hubs;
    }
    return geo.hubs.filter((h) =>
      h.acceptedMaterials.includes(selectedMaterialFilter as MaterialCode)
    );
  }, [geo.hubs, selectedMaterialFilter]);

  const activeHub = selectedHub ?? filteredHubs[0] ?? null;

  const handleBuildingClickOnMap = (
    _lat: number,
    _lng: number,
    estFootprintM2: number
  ) => {
    updateCalculatorAssumptions({ footprintM2: estFootprintM2 });
  };

  const handleSaveToEcoIsland = () => {
    awardXp(25, "solar_array");
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <StudioShell>
      <div className="space-y-6">
        {/* Top Filter & Material Routing Header */}
        <div
          className={`flex flex-wrap items-center justify-between gap-4 border p-5 ${
            isLight
              ? "border-[#C7C0B0] bg-white"
              : "border-[#1D3328] bg-[#0E1914]"
          }`}
        >
          <div>
            <p
              className={`font-mono text-xs font-bold ${
                isLight ? "text-[#14532D]" : "text-[#A3E635]"
              }`}
            >
              // 03 · 3D URBAN RADAR & ROOF PHYSICS ({geo.lat.toFixed(2)}°,{" "}
              {geo.lng.toFixed(2)}°)
            </p>
            <h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">
              {isId
                ? `Peta Bangunan 3D & Kalkulator Fisika Atap: ${geo.city}`
                : `3D Extruded Urban Map & Roof Physics Calculator: ${geo.city}`}
            </h1>
          </div>

          <div
            role="group"
            aria-label={isId ? "Filter Material" : "Material Filter"}
            className="flex flex-wrap items-center gap-1.5"
          >
            {MATERIAL_FILTERS.map((code) => {
              const active =
                (code === "ALL" && !selectedMaterialFilter) ||
                selectedMaterialFilter === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() =>
                    setSelectedMaterialFilter(code === "ALL" ? null : code)
                  }
                  className={`min-h-[44px] cursor-pointer px-3 py-1.5 font-mono text-xs font-semibold transition ${
                    active
                      ? isLight
                        ? "bg-[#14532D] font-bold text-white"
                        : "bg-[#A3E635] font-bold text-[#070D0A]"
                      : isLight
                        ? "border border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16] hover:bg-[#EAE5D9]"
                        : "border border-[#1D3328] bg-[#070D0A] text-[#F2F7F4] hover:border-[#88AC9B]"
                  }`}
                >
                  {code}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main 7/5 Split: 3D MapLibre Viewport + Deterministic Roof Physics Drawer */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left 7 Columns: 3D Map + Verified OpenStreetMap Circular Hubs */}
          <div className="space-y-6 lg:col-span-7">
            <div
              className={`rounded-2xl border p-3 ${
                isLight
                  ? "border-[#C7C0B0] bg-white"
                  : "border-[#1D3328] bg-[#0E1914]"
              }`}
            >
              <div className="mb-2.5 flex items-center justify-between px-1 font-mono text-xs">
                <span>
                  // MAPLIBRE GL 3D TERRAIN · PITCH 55° · CLICK ANY BUILDING
                </span>
                <span>{filteredHubs.length} OSM hubs</span>
              </div>

              <div className="h-[420px] w-full overflow-hidden rounded-xl">
                <Radar3DMap
                  lat={geo.lat}
                  lng={geo.lng}
                  city={geo.city}
                  hubs={filteredHubs}
                  selectedHubId={activeHub?.id ?? null}
                  onSelectHub={(hub) => setSelectedHub(hub)}
                  onSelectBuildingFootprint={handleBuildingClickOnMap}
                />
              </div>
            </div>

            {/* Verified OpenStreetMap Circular Economy Hubs Table */}
            <div
              className={`border p-5 ${
                isLight
                  ? "border-[#C7C0B0] bg-white"
                  : "border-[#1D3328] bg-[#0E1914]"
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 border-current/15">
                <div>
                  <p
                    className={`font-mono text-xs font-bold ${
                      isLight ? "text-[#14532D]" : "text-[#A3E635]"
                    }`}
                  >
                    // VERIFIED OPENSTREETMAP CIRCULAR HUBS
                  </p>
                  <h2 className="mt-0.5 font-serif text-lg font-bold">
                    {isId
                      ? `Titik Drop-Off & Daur Ulang di ${geo.city}`
                      : `Drop-Off & Recycling Facilities in ${geo.city}`}
                  </h2>
                </div>
                <span className="font-mono text-xs">
                  Filter: {selectedMaterialFilter ?? "ALL"}
                </span>
              </div>

              {filteredHubs.length === 0 ? (
                <div
                  className={`mt-4 border p-4 ${
                    isLight
                      ? "border-[#C7C0B0] bg-[#F4F1EA]"
                      : "border-[#1D3328] bg-[#070D0A]"
                  }`}
                >
                  <p className="font-mono text-xs font-bold">
                    {isId
                      ? `TIDAK ADA FASILITAS UNTUK FILTER "${selectedMaterialFilter}"`
                      : `NO HUBS MATCH MATERIAL FILTER "${selectedMaterialFilter}"`}
                  </p>
                  <p
                    className={`mt-1 text-xs ${
                      isLight ? "text-[#2C4438]" : "text-[#A3BEB0]"
                    }`}
                  >
                    {isId
                      ? "Reset filter material untuk menampilkan seluruh titik daur ulang di kota ini."
                      : "Reset the material filter to view all verified circular facilities in this city."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedMaterialFilter(null)}
                    className={`mt-3 min-h-[44px] cursor-pointer px-4 py-2 font-mono text-xs font-bold ${
                      isLight
                        ? "bg-[#14532D] text-white"
                        : "bg-[#A3E635] text-[#070D0A]"
                    }`}
                  >
                    {isId ? "Tampilkan Semua Material (ALL)" : "Reset Filter to ALL"}
                  </button>
                </div>
              ) : (
                <div className="mt-3 divide-y divide-current/10">
                  {filteredHubs.map((hub) => {
                    const isSel = activeHub?.id === hub.id;
                    return (
                      <div
                        key={hub.id}
                        className={`flex flex-wrap items-center justify-between gap-3 py-3 ${
                          isSel ? "font-semibold" : ""
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedHub(hub)}
                              className="min-h-[44px] cursor-pointer text-left text-sm font-bold underline decoration-current/40 underline-offset-4"
                            >
                              {hub.name}
                            </button>
                            <span className="font-mono text-xs tabular-nums opacity-75">
                              ({hub.distanceKm} km)
                            </span>
                          </div>
                          <p
                            className={`font-mono text-[11px] ${
                              isLight ? "text-[#2C4438]" : "text-[#A3BEB0]"
                            }`}
                          >
                            {hub.address} · {hub.openingHours} · OSM {hub.osmSource}
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {hub.acceptedMaterials.map((mat) => (
                              <span
                                key={mat}
                                className={`border px-1.5 py-0.5 font-mono text-[10px] ${
                                  isLight
                                    ? "border-[#C7C0B0] bg-[#F4F1EA]"
                                    : "border-[#1D3328] bg-[#070D0A]"
                                }`}
                              >
                                {mat}
                              </span>
                            ))}
                          </div>
                        </div>

                        <a
                          href={`https://www.openstreetmap.org/?mlat=${hub.lat}&mlon=${hub.lng}#map=16/${hub.lat}/${hub.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex min-h-[44px] items-center border px-3 py-1.5 font-mono text-xs font-semibold ${
                            isLight
                              ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16]"
                              : "border-[#1D3328] bg-[#070D0A] text-[#F2F7F4]"
                          }`}
                        >
                          OSM Map
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right 5 Columns: Interactive Roof Physics Sliders & Equations */}
          <div className="space-y-6 lg:col-span-5">
            <div
              className={`border p-5 ${
                isLight
                  ? "border-[#C7C0B0] bg-white"
                  : "border-[#1D3328] bg-[#0E1914]"
              }`}
            >
              <div className="border-b pb-3 border-current/15">
                <p
                  className={`font-mono text-xs font-bold ${
                    isLight ? "text-[#14532D]" : "text-[#A3E635]"
                  }`}
                >
                  // NREL PVWATTS v8 + HYDROLOGY ENGINE
                </p>
                <h2 className="mt-0.5 font-serif text-xl font-bold">
                  {isId
                    ? "Parameter Fisika Atap Rumah"
                    : "Adjustable Roof Physics Parameters"}
                </h2>
              </div>

              {/* 3 Interactive Physics Sliders */}
              <div className="mt-4 space-y-4 font-mono text-xs">
                <div>
                  <div className="flex justify-between">
                    <label htmlFor="roof-area-slider">
                      {isId ? "Luas Tapak Atap" : "Roof Footprint Area"}
                    </label>
                    <span className="font-bold tabular-nums">
                      {formatArea(customFootprintM2, units)} ({customFootprintM2} m²)
                    </span>
                  </div>
                  <input
                    id="roof-area-slider"
                    type="range"
                    min={30}
                    max={450}
                    step={5}
                    value={customFootprintM2}
                    onChange={(e) =>
                      updateCalculatorAssumptions({
                        footprintM2: Number(e.target.value),
                      })
                    }
                    className="mt-2 h-2 w-full cursor-pointer accent-[#A3E635]"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <label htmlFor="solar-ratio-slider">
                      {isId
                        ? "Rasio Atap Layak Panel Surya"
                        : "Usable Solar Roof Fraction"}
                    </label>
                    <span className="font-bold tabular-nums">
                      {Math.round(usableRoofRatio * 100)}%
                    </span>
                  </div>
                  <input
                    id="solar-ratio-slider"
                    type="range"
                    min={25}
                    max={90}
                    step={5}
                    value={Math.round(usableRoofRatio * 100)}
                    onChange={(e) =>
                      updateCalculatorAssumptions({
                        usableRoofRatio: Number(e.target.value) / 100,
                      })
                    }
                    className="mt-2 h-2 w-full cursor-pointer accent-[#A3E635]"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <label htmlFor="runoff-slider">
                      {isId
                        ? "Koefisien Limpasan Atap (Cr)"
                        : "Roof Runoff Coefficient (Cr)"}
                    </label>
                    <span className="font-bold tabular-nums">
                      {runoffCoefficient.toFixed(2)}
                    </span>
                  </div>
                  <input
                    id="runoff-slider"
                    type="range"
                    min={50}
                    max={95}
                    step={5}
                    value={Math.round(runoffCoefficient * 100)}
                    onChange={(e) =>
                      updateCalculatorAssumptions({
                        runoffCoefficient: Number(e.target.value) / 100,
                      })
                    }
                    className="mt-2 h-2 w-full cursor-pointer accent-[#A3E635]"
                  />
                </div>
              </div>

              {/* Computed Output Table */}
              <div
                className={`mt-5 space-y-2.5 border p-4 font-mono text-xs ${
                  isLight
                    ? "border-[#C7C0B0] bg-[#F4F1EA]"
                    : "border-[#1D3328] bg-[#070D0A]"
                }`}
              >
                <div className="flex justify-between">
                  <span>Solar Capacity (kWp):</span>
                  <strong className="tabular-nums">
                    {housingCalc.solar.kwp} kWp ({housingCalc.solar.panelCountEst} panels)
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Annual Solar Output:</span>
                  <strong className="tabular-nums">
                    {housingCalc.solar.kwhYear.toLocaleString()} kWh/yr
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Annual Bill Savings:</span>
                  <strong
                    className={`tabular-nums ${
                      isLight ? "text-[#14532D]" : "text-[#A3E635]"
                    }`}
                  >
                    {formatCurrency(
                      housingCalc.solar.savingsYear,
                      housingCalc.solar.currency,
                      locale
                    )}
                    /yr
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Grid CO2e Avoided:</span>
                  <strong className="tabular-nums">
                    {housingCalc.solar.co2eKgYear} kg/yr
                  </strong>
                </div>
                <div className="flex justify-between border-t pt-2 border-current/15">
                  <span>Rainwater Capture:</span>
                  <strong className="tabular-nums">
                    {formatVolume(housingCalc.rainwater.litersYear, units)}/yr
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Cistern & Biopores:</span>
                  <strong className="tabular-nums">
                    {formatVolume(
                      housingCalc.rainwater.recommendedCisternLiters,
                      units
                    )}{" "}
                    · {housingCalc.infiltration.bioporeUnits} shafts
                  </strong>
                </div>
              </div>

              {savedToast && (
                <div
                  role="status"
                  className="mt-3 border border-[#A3E635] bg-[#070D0A] p-2.5 font-mono text-xs text-[#A3E635]"
                >
                  {isId
                    ? "Parameter atap disinkronkan ke Plot 3D (+25 XP)."
                    : "Roof parameters synced to 3D Plot (+25 XP)."}
                </div>
              )}

              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleSaveToEcoIsland}
                  className={`min-h-[44px] w-full cursor-pointer px-4 py-2.5 font-mono text-xs font-bold transition ${
                    isLight
                      ? "bg-[#14532D] text-white hover:bg-[#0F3F22]"
                      : "bg-[#A3E635] text-[#070D0A] hover:bg-[#bef264]"
                  }`}
                >
                  {isId
                    ? "Sinkronkan ke Plot 3D & Klaim +25 XP"
                    : "Sync Roof Specs to 3D Plot (+25 XP)"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/council")}
                  className={`min-h-[44px] w-full cursor-pointer border px-4 py-2.5 font-mono text-xs font-semibold transition ${
                    isLight
                      ? "border-[#C7C0B0] bg-[#F4F1EA] text-[#101D16]"
                      : "border-[#1D3328] bg-[#070D0A] text-[#F2F7F4]"
                  }`}
                >
                  {isId
                    ? "Kirim Spesifikasi Ini ke Dewan Spesialis (/council)"
                    : "Send SiteBrief to Specialist Council (/council)"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
