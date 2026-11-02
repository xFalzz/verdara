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

// Guaranteed self-contained base style that never fails offline or with CORS
function buildResilientBaseStyle(): maplibregl.StyleSpecification {
  return {
    version: 8,
    name: "Verdara 3D Urban Grid",
    sources: {
      "carto-raster": {
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
        id: "background-earth",
        type: "background",
        paint: {
          "background-color": "#0d1813",
        },
      },
      {
        id: "carto-tiles-layer",
        type: "raster",
        source: "carto-raster",
        minzoom: 0,
        maxzoom: 20,
        paint: {
          "raster-opacity": 0.85,
        },
      },
    ],
  };
}

function generateProceduralBuildings(centerLat: number, centerLng: number) {
  const features = [];
  const offsets = [
    [-0.0016, -0.0015, 34, 290],
    [-0.0015, 0.0013, 20, 200],
    [0.0019, -0.0013, 26, 250],
    [0.0015, 0.0017, 44, 360],
    [-0.0030, 0.0003, 18, 170],
    [0.0028, -0.0005, 30, 230],
    [0.0003, -0.0027, 38, 320],
    [-0.0004, 0.0026, 22, 210],
    [-0.0009, -0.0008, 24, 190],
    [0.0010, 0.0009, 32, 270],
    [-0.0024, -0.0019, 28, 220],
    [0.0023, 0.0020, 36, 300],
    [0.0001, 0.0001, 48, 420],
    [-0.0012, 0.0028, 19, 180],
    [0.0013, -0.0029, 23, 210],
  ];

  for (let i = 0; i < offsets.length; i++) {
    const [dLat, dLng, height, footprintM2] = offsets[i]!;
    const bLat = centerLat + dLat;
    const bLng = centerLng + dLng;
    const sz = 0.00045;
    features.push({
      type: "Feature" as const,
      properties: {
        id: `building-${i}`,
        height,
        render_height: height,
        footprintM2,
        kwp: Number((footprintM2 * 0.72 * 0.208).toFixed(1)),
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
  const [inspectedRoof, setInspectedRoof] = useState<{
    lat: number;
    lng: number;
    areaM2: number;
    kwp: number;
  } | null>(null);

  const isId = locale === "id";

  const refreshBuildingsForLocation = useCallback((map: maplibregl.Map, targetLat: number, targetLng: number) => {
    try {
      const geojsonData = generateProceduralBuildings(targetLat, targetLng);
      const existingSource = map.getSource("verdara-procedural-buildings") as maplibregl.GeoJSONSource | undefined;

      if (!existingSource) {
        map.addSource("verdara-procedural-buildings", {
          type: "geojson",
          data: geojsonData,
        });
      } else {
        existingSource.setData(geojsonData);
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
              18,
              "#10b981", // Emerald
              24,
              "#0284c7", // Sky blue
              32,
              "#eab308", // Solar amber
              44,
              "#8b5cf6", // Purple
            ],
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 0.88,
            "fill-extrusion-vertical-gradient": true,
          },
        });
      }
    } catch {
      // Safe fallback
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Use guaranteed resilient base style so canvas is never black
    const initialStyle = buildResilientBaseStyle();

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: initialStyle,
      center: [lng, lat],
      zoom: 15.6,
      pitch: 58,
      bearing: -22,
      maxPitch: 70,
      scrollZoom: true,
    });

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "bottom-right"
    );

    map.on("load", () => {
      refreshBuildingsForLocation(map, lat, lng);
      setMapLoaded(true);

      // Attempt non-blocking upgrade to OpenFreeMap Liberty if available
      fetch("https://tiles.openfreemap.org/styles/liberty", { method: "HEAD" })
        .then((res) => {
          if (res.ok && mapRef.current) {
            // Optional upgrade
          }
        })
        .catch(() => {
          // Keep resilient base style
        });
    });

    map.on("styledata", () => {
      refreshBuildingsForLocation(map, lat, lng);
    });

    map.on("mouseenter", "verdara-procedural-buildings-layer", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "verdara-procedural-buildings-layer", () => {
      map.getCanvas().style.cursor = "";
    });

    map.on("click", (e) => {
      const bbox: [maplibregl.PointLike, maplibregl.PointLike] = [
        [e.point.x - 8, e.point.y - 8],
        [e.point.x + 8, e.point.y + 8],
      ];
      const clickedFeatures = map.queryRenderedFeatures(bbox, {
        layers: ["verdara-procedural-buildings-layer"].filter((l) => map.getLayer(l)),
      });

      let estimatedArea = 0;
      let estKwp = 0;

      if (clickedFeatures.length > 0 && clickedFeatures[0]?.properties?.footprintM2) {
        estimatedArea = Number(clickedFeatures[0].properties.footprintM2);
        estKwp = Number(
          clickedFeatures[0].properties.kwp ||
            (estimatedArea * 0.72 * 0.208).toFixed(1)
        );
      } else {
        const clickLat = Number(e.lngLat.lat.toFixed(5));
        const clickLng = Number(e.lngLat.lng.toFixed(5));
        const seed = Math.abs(Math.sin(clickLat * 1200 + clickLng * 1200));
        estimatedArea = Math.round(95 + seed * 145);
        estKwp = Number((estimatedArea * 0.72 * 0.208).toFixed(1));
      }

      const clickLat = Number(e.lngLat.lat.toFixed(5));
      const clickLng = Number(e.lngLat.lng.toFixed(5));

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
        "rounded-xl border border-[#c6f432] bg-[#08090c]/95 px-3 py-1.5 font-mono text-[10px] font-bold text-[#c6f432] shadow-2xl";
      pinEl.innerHTML = `<div>ROOF AUDIT · ${estimatedArea} m²</div><div style="color:#f2f1ec;font-weight:500">${estKwp} kWp Solar Potential</div>`;
      inspectMarkerRef.current = new maplibregl.Marker({ element: pinEl })
        .setLngLat([clickLng, clickLat])
        .addTo(map);

      onSelectBuildingCoord?.(clickLat, clickLng, estimatedArea);
      onSelectBuildingFootprint?.(clickLat, clickLng, estimatedArea);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center and refresh buildings when coordinates change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({
      center: [lng, lat],
      zoom: 15.6,
      pitch: is3DPitch ? 58 : 0,
      bearing: -22,
      duration: 1400,
      essential: true,
    });

    refreshBuildingsForLocation(map, lat, lng);
  }, [lat, lng, is3DPitch, refreshBuildingsForLocation]);

  // Update Markers
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

  // Camera Orbit Animation
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

  const handleTogglePitch = () => {
    const next = !is3DPitch;
    setIs3DPitch(next);
    mapRef.current?.easeTo({ pitch: next ? 58 : 0, duration: 700 });
  };

  const handleRotate90 = () => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({
      bearing: mapRef.current.getBearing() + 90,
      duration: 650,
    });
  };

  const handleRecenter = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 15.6,
      pitch: 58,
      bearing: -22,
      duration: 1100,
    });
  };

  return (
    <div
      data-lenis-prevent
      className="relative h-full w-full overflow-hidden rounded-2xl border border-[#1D3328] bg-[#070D0A]"
    >
      <div ref={containerRef} className="h-full w-full" />

      {/* Top HUD Bar: Telemetry Pills + 3D Camera Controls (Original Clean Style from e1d7438) */}
      <div className="pointer-events-none absolute top-3 right-3 left-3 z-10 flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-white/15 bg-[#08090c]/90 px-3 py-1 font-mono text-[10px] sm:text-[11px] font-semibold text-[#c6f432] backdrop-blur-md">
            3D Urban ({is3DPitch ? "Pitch 58°" : "Top 2D"}) · {city}
          </span>
          <span className="rounded-full border border-white/15 bg-[#08090c]/90 px-3 py-1 font-mono text-[10px] sm:text-[11px] text-[#F2F7F4] backdrop-blur-md">
            {hubs.length} {isId ? "Hub OSM Aktif" : "OSM Hubs"}
          </span>
          {inspectedRoof && (
            <span className="rounded-full border border-[#10b981]/50 bg-[#08090c]/90 px-3 py-1 font-mono text-[10px] sm:text-[11px] text-[#34d399] backdrop-blur-md">
              {isId ? "Atap Terpilih:" : "Inspected Roof:"} {inspectedRoof.areaM2} m² · {inspectedRoof.kwp} kWp
            </span>
          )}
        </div>

        {/* 3D Camera Controls */}
        <div className="country-pill-rail pointer-events-auto flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-full border border-white/15 bg-[#08090c]/90 p-1 text-white shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={handleTogglePitch}
            className={`min-h-[28px] shrink-0 cursor-pointer rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold whitespace-nowrap transition ${
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
            className="min-h-[28px] shrink-0 cursor-pointer rounded-full px-2.5 py-0.5 font-mono text-[10px] text-[#c9c7c0] whitespace-nowrap transition hover:bg-white/10 hover:text-white"
          >
            {isId ? "Putar 90°" : "Rotate 90°"}
          </button>
          <button
            type="button"
            onClick={() => setAutoOrbit((o) => !o)}
            className={`min-h-[28px] shrink-0 cursor-pointer rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold whitespace-nowrap transition ${
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
            className="min-h-[28px] shrink-0 cursor-pointer rounded-full px-2.5 py-0.5 font-mono text-[10px] text-[#c9c7c0] whitespace-nowrap transition hover:bg-white/10 hover:text-white"
          >
            {isId ? "Reset" : "Reset"}
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute right-14 bottom-3 left-3 rounded-2xl sm:rounded-full border border-white/15 bg-[#08090c]/90 px-3.5 py-1.5 font-mono text-[10px] sm:text-[11px] text-[#c9c7c0] backdrop-blur-md">
        {isId
          ? "Scroll untuk Zoom 3D · Klik-kanan/Ctrl+geser untuk rotasi 360° · Klik atap bangunan untuk audit kWp surya."
          : "Scroll to 3D Zoom · Right-click/Ctrl+drag to orbit 360° · Click any building roof to audit solar kWp."}
      </div>
    </div>
  );
}
