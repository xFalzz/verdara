"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
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

type BasemapType = "voyager" | "osm" | "dark";

// Procedural 3D building polygon generator around center coordinates
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
    const sz = 0.00042;
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

// Atomic style specification with inline procedural 3D buildings & raster background
function createStyleSpecification(
  tileType: BasemapType,
  geoJsonData: ReturnType<typeof generateProceduralBuildings>
): maplibregl.StyleSpecification {
  const isDark = tileType === "dark";
  const bgHex = isDark ? "#0D1411" : "#E8ECE9";

  const tiles =
    tileType === "voyager"
      ? [
          "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
          "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
          "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
        ]
      : tileType === "osm"
      ? [
          "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        ]
      : [
          "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
          "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
          "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        ];

  return {
    version: 8,
    name: `Verdara 3D Map (${tileType})`,
    sources: {
      "verdara-raster-base": {
        type: "raster",
        tiles,
        tileSize: 256,
        attribution: "OpenStreetMap, CARTO",
      },
      "verdara-procedural-buildings": {
        type: "geojson",
        data: geoJsonData,
      },
    },
    layers: [
      {
        id: "background-base",
        type: "background",
        paint: {
          "background-color": bgHex,
        },
      },
      {
        id: "verdara-raster-layer",
        type: "raster",
        source: "verdara-raster-base",
        minzoom: 0,
        maxzoom: 20,
        paint: {
          "raster-opacity": 1.0,
        },
      },
      {
        id: "verdara-procedural-buildings-layer",
        type: "fill-extrusion",
        source: "verdara-procedural-buildings",
        paint: {
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["coalesce", ["get", "height"], 20],
            16,
            "#10b981", // Emerald
            22,
            "#0284c7", // Sky blue
            30,
            "#eab308", // Solar amber
            40,
            "#8b5cf6", // Purple
          ],
          "fill-extrusion-height": ["coalesce", ["get", "height"], 20],
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": 0.92,
          "fill-extrusion-vertical-gradient": true,
        },
      },
    ],
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
  const [activeStyle, setActiveStyle] = useState<BasemapType>("voyager");
  const [inspectedRoof, setInspectedRoof] = useState<{
    lat: number;
    lng: number;
    areaM2: number;
    kwp: number;
  } | null>(null);

  const isId = locale === "id";

  // Initialize MapLibre cleanly on mount
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialBuildings = generateProceduralBuildings(lat, lng);
    const initialStyle = createStyleSpecification("voyager", initialBuildings);

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: initialStyle,
      center: [lng, lat],
      zoom: 15.4,
      pitch: 58,
      bearing: -20,
      maxPitch: 70,
      scrollZoom: true,
    });

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "bottom-right"
    );

    map.on("load", () => {
      setMapLoaded(true);
      map.resize();
      setTimeout(() => map.resize(), 150);
      setTimeout(() => map.resize(), 500);
    });

    // Hover cursor feedback on 3D buildings
    map.on("mouseenter", "verdara-procedural-buildings-layer", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "verdara-procedural-buildings-layer", () => {
      map.getCanvas().style.cursor = "";
    });

    // Click inspection handler
    map.on("click", (e) => {
      const clickLat = Number(e.lngLat.lat.toFixed(5));
      const clickLng = Number(e.lngLat.lng.toFixed(5));

      const bbox: [maplibregl.PointLike, maplibregl.PointLike] = [
        [e.point.x - 10, e.point.y - 10],
        [e.point.x + 10, e.point.y + 10],
      ];

      let estimatedArea = 0;
      let estKwp = 0;

      try {
        const features = map.queryRenderedFeatures(bbox, {
          layers: ["verdara-procedural-buildings-layer"],
        });

        if (features.length > 0 && features[0]?.properties) {
          const props = features[0].properties;
          estimatedArea = Number(props.footprintM2 || 220);
          estKwp = Number(props.kwp || (estimatedArea * 0.72 * 0.208).toFixed(1));
        }
      } catch {
        // Fallback
      }

      if (!estimatedArea) {
        const seed = Math.abs(Math.sin(clickLat * 1250.0 + clickLng * 1250.0));
        estimatedArea = Math.round(110 + seed * 165);
        estKwp = Number((estimatedArea * 0.72 * 0.208).toFixed(1));
      }

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
        "rounded-xl border border-[#c6f432] bg-[#08090c]/95 px-3 py-1.5 font-mono text-[10px] font-bold text-[#c6f432] shadow-2xl backdrop-blur-md";
      pinEl.innerHTML = `<div>ROOF AUDIT: ${estimatedArea} m²</div><div style="color:#f2f1ec;font-weight:500">${estKwp} kWp Solar Potential</div>`;

      inspectMarkerRef.current = new maplibregl.Marker({ element: pinEl })
        .setLngLat([clickLng, clickLat])
        .addTo(map);

      onSelectBuildingCoord?.(clickLat, clickLng, estimatedArea);
      onSelectBuildingFootprint?.(clickLat, clickLng, estimatedArea);
    });

    mapRef.current = map;

    const ro = new ResizeObserver(() => {
      map.resize();
    });
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Smoothly reposition camera & 3D buildings on city change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({
      center: [lng, lat],
      zoom: 15.4,
      pitch: is3DPitch ? 58 : 0,
      bearing: -20,
      duration: 1400,
      essential: true,
    });

    const newBuildings = generateProceduralBuildings(lat, lng);
    const src = map.getSource("verdara-procedural-buildings") as maplibregl.GeoJSONSource | undefined;
    if (src && typeof src.setData === "function") {
      src.setData(newBuildings);
    }
  }, [lat, lng, is3DPitch]);

  // Update Home and Hub Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (homeMarkerRef.current) {
      homeMarkerRef.current.remove();
      homeMarkerRef.current = null;
    }

    // Home location pulse pin
    const homeEl = document.createElement("div");
    homeEl.className =
      "flex items-center gap-1.5 rounded-full border-2 border-[#c6f432] bg-[#08090c]/95 px-3 py-1 font-mono text-xs font-bold text-[#c6f432] shadow-2xl backdrop-blur-md";
    homeEl.innerHTML = `<span style="display:inline-block;width:7px;height:7px;border-radius:999px;background:#c6f432"></span><span>3D PLOT: ${city}</span>`;
    homeMarkerRef.current = new maplibregl.Marker({ element: homeEl })
      .setLngLat([lng, lat])
      .addTo(map);

    // Verified Circular Hub Pins
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
          zoom: 16.4,
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

  // 360-degree camera auto-orbit
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
      zoom: 15.4,
      pitch: 58,
      bearing: -20,
      duration: 1100,
    });
  };

  const switchStyle = (style: BasemapType) => {
    const map = mapRef.current;
    if (!map || style === activeStyle) return;

    setActiveStyle(style);
    const buildingsData = generateProceduralBuildings(lat, lng);
    const newStyle = createStyleSpecification(style, buildingsData);
    map.setStyle(newStyle);
    map.once("styledata", () => {
      map.resize();
    });
  };

  return (
    <div
      data-lenis-prevent
      className="relative h-full w-full overflow-hidden rounded-2xl border border-[#1D3328] bg-[#E8ECE9]"
    >
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ minHeight: "440px", width: "100%", height: "100%", position: "relative" }}
      />

      {/* Top HUD: Telemetry Pills and Style / Camera Controls */}
      <div className="pointer-events-none absolute top-3 right-3 left-3 z-10 flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-white/15 bg-[#08090c]/90 px-3 py-1 font-mono text-[10px] sm:text-[11px] font-semibold text-[#c6f432] backdrop-blur-md">
            3D Urban ({is3DPitch ? "Pitch 58°" : "Top 2D"}) : {city}
          </span>
          <span className="rounded-full border border-white/15 bg-[#08090c]/90 px-3 py-1 font-mono text-[10px] sm:text-[11px] text-[#F2F7F4] backdrop-blur-md">
            {hubs.length} {isId ? "Hub OSM Aktif" : "OSM Hubs"}
          </span>
          {inspectedRoof && (
            <span className="rounded-full border border-[#10b981]/50 bg-[#08090c]/90 px-3 py-1 font-mono text-[10px] sm:text-[11px] text-[#34d399] backdrop-blur-md">
              {isId ? "Atap Terpilih:" : "Inspected Roof:"} {inspectedRoof.areaM2} m² : {inspectedRoof.kwp} kWp
            </span>
          )}
        </div>

        {/* 3D Camera Controls and Basemap Switcher */}
        <div className="country-pill-rail pointer-events-auto flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-full border border-white/15 bg-[#08090c]/90 p-1 text-white shadow-xl backdrop-blur-md">
          {/* Basemap switcher */}
          <button
            type="button"
            onClick={() => switchStyle("voyager")}
            className={`min-h-[28px] shrink-0 cursor-pointer rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold whitespace-nowrap transition ${
              activeStyle === "voyager"
                ? "bg-[#c6f432] text-[#08090c]"
                : "text-[#c9c7c0] hover:bg-white/10"
            }`}
            title="CARTO Voyager 3D"
          >
            Voyager
          </button>
          <button
            type="button"
            onClick={() => switchStyle("osm")}
            className={`min-h-[28px] shrink-0 cursor-pointer rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold whitespace-nowrap transition ${
              activeStyle === "osm"
                ? "bg-[#c6f432] text-[#08090c]"
                : "text-[#c9c7c0] hover:bg-white/10"
            }`}
            title="OpenStreetMap Standard"
          >
            OSM
          </button>
          <button
            type="button"
            onClick={() => switchStyle("dark")}
            className={`min-h-[28px] shrink-0 cursor-pointer rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold whitespace-nowrap transition ${
              activeStyle === "dark"
                ? "bg-[#c6f432] text-[#08090c]"
                : "text-[#c9c7c0] hover:bg-white/10"
            }`}
            title="CARTO Dark Matter 3D"
          >
            Dark
          </button>

          <span className="mx-0.5 h-3 w-px bg-white/20 shrink-0" />

          {/* Camera controls */}
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
            Reset
          </button>
        </div>
      </div>

      {/* Bottom hint banner */}
      <div className="pointer-events-none absolute right-14 bottom-3 left-3 rounded-2xl sm:rounded-full border border-white/15 bg-[#08090c]/90 px-3.5 py-1.5 font-mono text-[10px] sm:text-[11px] text-[#c9c7c0] backdrop-blur-md">
        {isId
          ? "Scroll untuk Zoom 3D : Klik-kanan/Ctrl+geser untuk rotasi 360° : Klik atap bangunan mana pun untuk audit surya."
          : "Scroll to 3D Zoom : Right-click/Ctrl+drag to orbit 360° : Click any building roof to audit solar potential."}
      </div>
    </div>
  );
}
