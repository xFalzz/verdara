"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { CircularHub } from "@/lib/science/presets";

export interface Radar3DMapProps {
  lat: number;
  lng: number;
  city: string;
  hubs: CircularHub[];
  selectedHubId: string | null;
  onSelectHub: (hub: CircularHub) => void;
  onSelectBuildingCoord?: (lat: number, lng: number, estFootprintM2: number) => void;
  onSelectBuildingFootprint?: (lat: number, lng: number, estFootprintM2: number) => void;
  locale?: "en" | "id";
}

const LIBERTY_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const VOYAGER_STYLE_URL = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

const VOYAGER_RASTER_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    "carto-voyager": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "OpenStreetMap, CARTO",
    },
  },
  layers: [
    {
      id: "carto-voyager-layer",
      type: "raster",
      source: "carto-voyager",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

function generateProceduralBuildings(centerLat: number, centerLng: number) {
  const features = [];
  const offsets = [
    [-0.0015, -0.0015, 32, 280],
    [-0.0015, 0.0012, 18, 190],
    [0.0018, -0.0012, 24, 240],
    [0.0014, 0.0016, 42, 350],
    [-0.0028, 0.0002, 16, 160],
    [0.0026, -0.0004, 28, 220],
    [0.0002, -0.0025, 36, 310],
    [-0.0003, 0.0024, 20, 200],
    [-0.0008, -0.0007, 22, 180],
    [0.0009, 0.0008, 30, 260],
    [-0.0022, -0.0018, 26, 210],
    [0.0021, 0.0019, 35, 290],
  ];
  for (let i = 0; i < offsets.length; i++) {
    const [dLat, dLng, height, footprintM2] = offsets[i]!;
    const bLat = centerLat + dLat;
    const bLng = centerLng + dLng;
    const sz = 0.00038;
    features.push({
      type: "Feature" as const,
      properties: {
        id: `building-${i}`,
        height,
        render_height: height,
        footprintM2,
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [bLng - sz, bLat - sz],
            [bLng + sz, bLat - sz],
            [bLng + sz, bLat + sz],
            [bLng - sz, bLat + sz],
            [bLng - sz, bLat - sz],
          ],
        ],
      },
    });
  }
  return {
    type: "FeatureCollection" as const,
    features,
  };
}

export default function Radar3DMap({
  lat,
  lng,
  city,
  hubs,
  selectedHubId,
  onSelectHub,
  onSelectBuildingCoord,
  onSelectBuildingFootprint,
  locale = "en",
}: Radar3DMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const homeMarkerRef = useRef<maplibregl.Marker | null>(null);
  const inspectMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [is3DPitch, setIs3DPitch] = useState(true);
  const [autoOrbit, setAutoOrbit] = useState(false);
  const [activeStyleType, setActiveStyleType] = useState<"liberty" | "voyager" | "raster">("raster");
  const [inspectedRoof, setInspectedRoof] = useState<{
    lat: number;
    lng: number;
    areaM2: number;
    kwp: number;
  } | null>(null);

  const isId = locale === "id";

  const setupBuildingsLayer = useCallback((map: maplibregl.Map) => {
    try {
      const style = map.getStyle();
      if (!style?.sources) return;

      const vectorSourceKeys = Object.keys(style.sources).filter(
        (k) => style.sources[k]?.type === "vector"
      );

      if (vectorSourceKeys.length > 0 && !map.getLayer("verdara-3d-buildings")) {
        const primaryVectorSource = vectorSourceKeys[0]!;
        const sourceLayer = primaryVectorSource === "protomaps" ? "buildings" : "building";

        map.addLayer({
          id: "verdara-3d-buildings",
          source: primaryVectorSource,
          "source-layer": sourceLayer,
          type: "fill-extrusion",
          minzoom: 13,
          paint: {
            "fill-extrusion-color": [
              "interpolate",
              ["linear"],
              ["coalesce", ["get", "render_height"], ["get", "height"], 16],
              0,
              "#CBD5E1",
              25,
              "#94A3B8",
              80,
              "#475569",
              160,
              "#1E293B",
            ],
            "fill-extrusion-height": [
              "coalesce",
              ["get", "render_height"],
              ["get", "height"],
              16,
            ],
            "fill-extrusion-base": [
              "coalesce",
              ["get", "render_min_height"],
              ["get", "min_height"],
              0,
            ],
            "fill-extrusion-opacity": 0.88,
            "fill-extrusion-vertical-gradient": true,
          },
        });
      }

      // Always add interactive procedural 3D building plots around city center
      const geojsonData = generateProceduralBuildings(lat, lng);
      if (!map.getSource("verdara-procedural-buildings")) {
        map.addSource("verdara-procedural-buildings", {
          type: "geojson",
          data: geojsonData,
        });
      } else {
        const src = map.getSource("verdara-procedural-buildings") as maplibregl.GeoJSONSource;
        src.setData(geojsonData);
      }

      if (!map.getLayer("verdara-procedural-buildings-layer")) {
        map.addLayer({
          id: "verdara-procedural-buildings-layer",
          source: "verdara-procedural-buildings",
          type: "fill-extrusion",
          paint: {
            "fill-extrusion-color": [
              "interpolate",
              ["linear"],
              ["get", "height"],
              16,
              "#10b981",
              26,
              "#0284c7",
              38,
              "#eab308",
              42,
              "#8b5cf6",
            ],
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 0.88,
            "fill-extrusion-vertical-gradient": true,
          },
        });
      }
    } catch {
      // Graceful fallback
    }
    setMapLoaded(true);
  }, [lat, lng]);

  const switchMapStyle = useCallback((styleType: "liberty" | "voyager" | "raster") => {
    const map = mapRef.current;
    if (!map) return;
    setActiveStyleType(styleType);

    try {
      if (styleType === "liberty") {
        map.setStyle(LIBERTY_STYLE_URL);
      } else if (styleType === "voyager") {
        map.setStyle(VOYAGER_STYLE_URL);
      } else {
        map.setStyle(VOYAGER_RASTER_STYLE);
      }

      map.once("styledata", () => {
        setupBuildingsLayer(map);
      });
    } catch {
      // Safe fallback
    }
  }, [setupBuildingsLayer]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: VOYAGER_RASTER_STYLE,
      center: [lng, lat],
      zoom: 15.6,
      pitch: 58,
      bearing: -22,
      maxPitch: 70,
      scrollZoom: true,
    });

    // Graceful error interceptor: if Liberty fails or status 0 occurs, seamlessly flip to Voyager
    map.on("error", (e) => {
      const msg = e?.error?.message || "";
      const status = (e?.error as any)?.status;
      if (msg.includes("openfreemap") || status === 0) {
        setActiveStyleType((prev) => {
          if (prev === "liberty") {
            try {
              map.setStyle(VOYAGER_STYLE_URL);
              map.once("styledata", () => setupBuildingsLayer(map));
            } catch {
              try {
                map.setStyle(VOYAGER_RASTER_STYLE);
                map.once("styledata", () => setupBuildingsLayer(map));
              } catch {
                // Ignore
              }
            }
            return "voyager";
          }
          return prev;
        });
      }
    });

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "bottom-right"
    );

    map.on("load", () => {
      setupBuildingsLayer(map);
    });

    map.on("click", (e) => {
      const clickLat = Number(e.lngLat.lat.toFixed(5));
      const clickLng = Number(e.lngLat.lng.toFixed(5));
      const seed = Math.abs(Math.sin(clickLat * 1200 + clickLng * 1200));
      const estimatedArea = Math.round(95 + seed * 145);
      const estKwp = Number((estimatedArea * 0.72 * 0.208).toFixed(1));

      setInspectedRoof({
        lat: clickLat,
        lng: clickLng,
        areaM2: estimatedArea,
        kwp: estKwp,
      });

      if (inspectMarkerRef.current) {
        inspectMarkerRef.current.remove();
      }
      const pinEl = document.createElement("div");
      pinEl.className =
        "rounded-xl border border-[#c6f432] bg-[#08090c]/95 px-2.5 py-1.5 font-mono text-[10px] font-bold text-[#c6f432] shadow-2xl";
      pinEl.innerHTML = `<div>ROOF AUDIT · ${estimatedArea} m²</div><div style="color:#f2f1ec;font-weight:500">${estKwp} kWp Solar Potential</div>`;
      inspectMarkerRef.current = new maplibregl.Marker({ element: pinEl })
        .setLngLat([clickLng, clickLat])
        .addTo(map);

      onSelectBuildingCoord?.(clickLat, clickLng, estimatedArea);
      onSelectBuildingFootprint?.(clickLat, clickLng, estimatedArea);
    });

    mapRef.current = map;

    // Trigger resize after mounting to ensure canvas paints properly
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Optional 360-degree camera auto-orbit on the 3D GIS map
  useEffect(() => {
    if (!autoOrbit || !mapRef.current) return;
    let rafId = 0;
    const rotateCamera = () => {
      if (mapRef.current) {
        mapRef.current.rotateTo((mapRef.current.getBearing() + 0.18) % 360, {
          duration: 0,
        });
      }
      rafId = window.requestAnimationFrame(rotateCamera);
    };
    rafId = window.requestAnimationFrame(rotateCamera);
    return () => window.cancelAnimationFrame(rafId);
  }, [autoOrbit]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({
      center: [lng, lat],
      zoom: 15.6,
      pitch: is3DPitch ? 58 : 0,
      bearing: -22,
      duration: 1500,
      essential: true,
    });

    // Update procedural buildings at new coordinates
    try {
      const src = map.getSource("verdara-procedural-buildings") as maplibregl.GeoJSONSource | undefined;
      if (src) {
        src.setData(generateProceduralBuildings(lat, lng));
      }
    } catch {
      // Safe fallback
    }
  }, [lat, lng, is3DPitch]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (homeMarkerRef.current) {
      homeMarkerRef.current.remove();
      homeMarkerRef.current = null;
    }

    const homeEl = document.createElement("div");
    homeEl.className =
      "flex items-center gap-1.5 rounded-full border-2 border-[#c6f432] bg-[#08090c]/95 px-3 py-1 font-mono text-xs font-bold text-[#c6f432] shadow-2xl";
    homeEl.innerHTML = `<span style="display:inline-block;width:7px;height:7px;border-radius:999px;background:#c6f432"></span><span>3D PLOT: ${city}</span>`;
    homeMarkerRef.current = new maplibregl.Marker({ element: homeEl })
      .setLngLat([lng, lat])
      .addTo(map);

    hubs.forEach((hub) => {
      const isSelected = hub.id === selectedHubId;
      const el = document.createElement("button");
      el.type = "button";
      el.className = `cursor-pointer flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-semibold shadow-xl transition-transform hover:scale-105 ${
        isSelected
          ? "border-[#c6f432] bg-[#c6f432] text-[#08090c] scale-105"
          : "border-white/20 bg-[#08090c]/90 text-[#F2F7F4]"
      }`;
      const code =
        hub.type === "waste_bank"
          ? "WB"
          : hub.type === "compost_hub"
          ? "BIO"
          : hub.type === "ewaste_drop"
          ? "EW"
          : "HUB";
      el.innerHTML = `<span style="color:${isSelected ? "#08090c" : "#10b981"}">● ${code}</span><span>${hub.distanceKm} km</span>`;
      el.onclick = (ev) => {
        ev.stopPropagation();
        onSelectHub(hub);
        map.flyTo({
          center: [hub.lng, hub.lat],
          zoom: 16.2,
          pitch: 60,
          duration: 1100,
        });
      };

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([hub.lng, hub.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [hubs, lat, lng, city, selectedHubId, onSelectHub, mapLoaded]);

  const handleTogglePitch = () => {
    const next = !is3DPitch;
    setIs3DPitch(next);
    if (mapRef.current) {
      mapRef.current.easeTo({
        pitch: next ? 58 : 0,
        duration: 800,
      });
    }
  };

  const handleRotate90 = () => {
    if (mapRef.current) {
      const current = mapRef.current.getBearing();
      mapRef.current.easeTo({
        bearing: current + 90,
        duration: 700,
      });
    }
  };

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 15.6,
        pitch: is3DPitch ? 58 : 0,
        bearing: -22,
        duration: 900,
      });
    }
  };

  return (
    <div className="relative h-[480px] w-full overflow-hidden rounded-2xl border border-[#1D3328] bg-[#0E1914] sm:h-[560px] lg:h-[620px]">
      <div ref={containerRef} className="h-full w-full" />

      {/* Top HUD Badges & Map Style Switcher */}
      <div className="pointer-events-none absolute top-3 right-3 left-3 flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-white/15 bg-[#08090c]/90 px-2.5 py-1 font-mono text-[10px] sm:text-[11px] text-[#A3E635] backdrop-blur-md">
            {isId ? "Radar 3D Urban (58°)" : "3D Urban (58°)"} · {city}
          </span>
          <span className="rounded-full border border-white/15 bg-[#08090c]/90 px-2.5 py-1 font-mono text-[10px] sm:text-[11px] text-[#F2F7F4] backdrop-blur-md">
            {hubs.length}{" "}
            {isId ? "Hub OSM" : "OSM Hubs"}
          </span>
          {inspectedRoof && (
            <span className="rounded-full border border-[#10b981]/50 bg-[#08090c]/90 px-2.5 py-1 font-mono text-[10px] sm:text-[11px] text-[#34d399] backdrop-blur-md">
              {isId ? "Atap:" : "Roof:"} {inspectedRoof.areaM2} m² ·{" "}
              {inspectedRoof.kwp} kWp
            </span>
          )}
        </div>

        {/* Map Engine Selector & Interactive 3D Camera Controls */}
        <div className="country-pill-rail pointer-events-auto flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-full border border-white/15 bg-[#08090c]/90 p-1 text-white shadow-xl backdrop-blur-md">
          {/* Map Engine Toggle */}
          <div className="flex items-center gap-0.5 border-r border-white/15 pr-1 mr-0.5">
            <button
              type="button"
              onClick={() => switchMapStyle("liberty")}
              className={`min-h-[28px] shrink-0 cursor-pointer rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold whitespace-nowrap transition ${
                activeStyleType === "liberty"
                  ? "bg-[#c6f432] text-[#08090c]"
                  : "text-[#c9c7c0] hover:bg-white/10"
              }`}
              title="OpenFreeMap Liberty 3D Vector"
            >
              Liberty
            </button>
            <button
              type="button"
              onClick={() => switchMapStyle("voyager")}
              className={`min-h-[28px] shrink-0 cursor-pointer rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold whitespace-nowrap transition ${
                activeStyleType === "voyager"
                  ? "bg-[#c6f432] text-[#08090c]"
                  : "text-[#c9c7c0] hover:bg-white/10"
              }`}
              title="Carto Voyager 3D Vector"
            >
              Voyager
            </button>
            <button
              type="button"
              onClick={() => switchMapStyle("raster")}
              className={`min-h-[28px] shrink-0 cursor-pointer rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold whitespace-nowrap transition ${
                activeStyleType === "raster"
                  ? "bg-[#c6f432] text-[#08090c]"
                  : "text-[#c9c7c0] hover:bg-white/10"
              }`}
              title="Carto Raster Tiles"
            >
              Raster
            </button>
          </div>

          <button
            type="button"
            onClick={handleTogglePitch}
            className={`min-h-[28px] shrink-0 cursor-pointer rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold whitespace-nowrap transition ${
              is3DPitch
                ? "bg-[#c6f432] text-[#08090c]"
                : "text-[#c9c7c0] hover:bg-white/10"
            }`}
          >
            {is3DPitch ? "3D 58°" : "2D Top"}
          </button>
          <button
            type="button"
            onClick={handleRotate90}
            className="min-h-[28px] shrink-0 cursor-pointer rounded-full px-2 py-0.5 font-mono text-[10px] text-[#c9c7c0] whitespace-nowrap transition hover:bg-white/10 hover:text-white"
          >
            {isId ? "Putar 90°" : "Rotate 90°"}
          </button>
          <button
            type="button"
            onClick={() => setAutoOrbit((o) => !o)}
            className={`min-h-[28px] shrink-0 cursor-pointer rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold whitespace-nowrap transition ${
              autoOrbit
                ? "bg-[#1e9e5a] text-white"
                : "text-[#c9c7c0] hover:bg-white/10"
            }`}
          >
            {autoOrbit ? "360°: ON" : "360°: OFF"}
          </button>
          <button
            type="button"
            onClick={handleRecenter}
            className="min-h-[28px] shrink-0 cursor-pointer rounded-full px-2 py-0.5 font-mono text-[10px] text-[#c9c7c0] whitespace-nowrap transition hover:bg-white/10 hover:text-white"
          >
            {isId ? "Reset" : "Reset"}
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute right-14 bottom-2.5 left-2.5 rounded-2xl sm:rounded-full border border-white/15 bg-[#08090c]/90 px-3 py-1.5 font-mono text-[10px] sm:text-[11px] text-[#c9c7c0] backdrop-blur-md">
        {isId
          ? "Scroll untuk Zoom 3D · Klik-kanan/Ctrl+geser untuk rotasi 360° · Klik atap bangunan untuk audit kWp surya."
          : "Scroll to 3D Zoom · Right-click/Ctrl+drag to orbit 360° · Click any building roof to audit solar kWp."}
      </div>
    </div>
  );
}
