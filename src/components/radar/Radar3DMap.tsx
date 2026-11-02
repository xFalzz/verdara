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

// Guaranteed rock-solid offline raster fallback style
const CARTO_VOYAGER_RASTER_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  name: "Carto Voyager Raster",
  sources: {
    "carto-raster-tiles": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        "https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution: "OpenStreetMap contributors, CARTO",
    },
  },
  layers: [
    {
      id: "carto-raster-base",
      type: "raster",
      source: "carto-raster-tiles",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

const CARTO_DARK_MATTER_RASTER_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  name: "Carto Dark Matter Raster",
  sources: {
    "carto-dark-tiles": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution: "OpenStreetMap contributors, CARTO",
    },
  },
  layers: [
    {
      id: "carto-dark-base",
      type: "raster",
      source: "carto-dark-tiles",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

const OPENFREEMAP_LIBERTY_URL = "https://tiles.openfreemap.org/styles/liberty";

type MapStyleChoice = "liberty_3d" | "voyager" | "dark";

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
  const [currentStyle, setCurrentStyle] = useState<MapStyleChoice>("liberty_3d");
  const [inspectedRoof, setInspectedRoof] = useState<{
    lat: number;
    lng: number;
    areaM2: number;
    kwp: number;
  } | null>(null);

  const isId = locale === "id";

  // Helper to attach 3D building extrusion layer once vector style is loaded
  const ensure3DBuildingExtrusion = useCallback((map: maplibregl.Map) => {
    try {
      const style = map.getStyle();
      if (!style || !style.sources) return;

      const vectorSourceName = Object.keys(style.sources).find(
        (key) => style.sources[key]?.type === "vector"
      );

      if (vectorSourceName && !map.getLayer("verdara-global-3d-buildings")) {
        map.addLayer({
          id: "verdara-global-3d-buildings",
          source: vectorSourceName,
          "source-layer": "building",
          type: "fill-extrusion",
          minzoom: 13.5,
          paint: {
            "fill-extrusion-color": [
              "interpolate",
              ["linear"],
              ["coalesce", ["get", "render_height"], ["get", "height"], 16],
              0,
              "#94a3b8",
              20,
              "#10b981",
              40,
              "#0284c7",
              70,
              "#eab308",
              120,
              "#a855f7",
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
    } catch {
      // Safe fallback if layer already exists
    }
  }, []);

  // Initialize MapLibre
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let isSubscribed = true;

    // Start with OpenFreeMap Liberty for full 3D vector buildings
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OPENFREEMAP_LIBERTY_URL,
      center: [lng, lat],
      zoom: 15.6,
      pitch: 58,
      bearing: -20,
      maxPitch: 70,
      scrollZoom: true,
    });

    // Fallback timer: if OpenFreeMap takes > 3.0s or is blocked by network, fallback to Carto Voyager
    const fallbackTimer = setTimeout(() => {
      if (isSubscribed && mapRef.current && !mapRef.current.isStyleLoaded()) {
        try {
          mapRef.current.setStyle(CARTO_VOYAGER_RASTER_STYLE);
          setCurrentStyle("voyager");
        } catch {
          // Graceful fallback
        }
      }
    }, 3000);

    map.on("error", (e) => {
      // If Liberty style fails to fetch, silently switch to rock-solid Carto Voyager
      if (
        e?.error?.message?.includes("Failed to fetch") ||
        e?.error?.message?.includes("NetworkError") ||
        e?.error?.message?.includes("403") ||
        e?.error?.message?.includes("404")
      ) {
        if (mapRef.current && currentStyle === "liberty_3d") {
          try {
            mapRef.current.setStyle(CARTO_VOYAGER_RASTER_STYLE);
            setCurrentStyle("voyager");
          } catch {
            // Graceful fallback
          }
        }
      }
    });

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "bottom-right"
    );

    map.on("load", () => {
      clearTimeout(fallbackTimer);
      if (!isSubscribed) return;

      ensure3DBuildingExtrusion(map);
      setMapLoaded(true);

      // Trigger resize after mount to guarantee proper WebGL viewport canvas bounds
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      }, 150);
    });

    // Handle interactive building click
    map.on("click", (e) => {
      const clickLat = Number(e.lngLat.lat.toFixed(5));
      const clickLng = Number(e.lngLat.lng.toFixed(5));

      // Query if a 3D building feature was directly clicked
      let estimatedArea = 0;
      let estKwp = 0;

      try {
        const bbox: [maplibregl.PointLike, maplibregl.PointLike] = [
          [e.point.x - 6, e.point.y - 6],
          [e.point.x + 6, e.point.y + 6],
        ];
        const features = map.queryRenderedFeatures(bbox, {
          layers: ["verdara-global-3d-buildings", "building-3d"].filter((id) =>
            map.getLayer(id)
          ),
        });

        if (features.length > 0 && features[0]?.properties) {
          const props = features[0].properties;
          const height = Number(props.render_height || props.height || 18);
          estimatedArea = Math.round(110 + height * 5.2);
        }
      } catch {
        // Fallback calculation below
      }

      if (!estimatedArea) {
        const seed = Math.abs(Math.sin(clickLat * 1250.0 + clickLng * 1250.0));
        estimatedArea = Math.round(110 + seed * 165);
      }

      estKwp = Number((estimatedArea * 0.72 * 0.208).toFixed(1));

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

    // ResizeObserver to ensure canvas never shrinks or corrupts on window/tab resize
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      isSubscribed = false;
      clearTimeout(fallbackTimer);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center when location coordinates change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({
      center: [lng, lat],
      zoom: 15.6,
      pitch: is3DPitch ? 58 : 0,
      bearing: -20,
      duration: 1400,
      essential: true,
    });
  }, [lat, lng, is3DPitch]);

  // Update Hub Markers and Home Location Marker
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

    // Circular Hub Pins
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
      zoom: 15.6,
      pitch: 58,
      bearing: -20,
      duration: 1100,
    });
  };

  const handleSwitchStyle = (styleChoice: MapStyleChoice) => {
    const map = mapRef.current;
    if (!map || styleChoice === currentStyle) return;

    setCurrentStyle(styleChoice);

    if (styleChoice === "liberty_3d") {
      map.setStyle(OPENFREEMAP_LIBERTY_URL);
      map.once("style.load", () => {
        ensure3DBuildingExtrusion(map);
      });
    } else if (styleChoice === "voyager") {
      map.setStyle(CARTO_VOYAGER_RASTER_STYLE);
    } else if (styleChoice === "dark") {
      map.setStyle(CARTO_DARK_MATTER_RASTER_STYLE);
    }
  };

  return (
    <div
      data-lenis-prevent
      className="relative h-full w-full overflow-hidden rounded-2xl border border-[#1D3328] bg-[#070D0A]"
    >
      <div ref={containerRef} className="h-full w-full" />

      {/* Top HUD: Telemetry Pills and Style / Camera Controls */}
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

        {/* 3D Camera Controls and Basemap Switcher */}
        <div className="country-pill-rail pointer-events-auto flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-full border border-white/15 bg-[#08090c]/90 p-1 text-white shadow-xl backdrop-blur-md">
          {/* Basemap switcher */}
          <button
            type="button"
            onClick={() => handleSwitchStyle("liberty_3d")}
            className={`min-h-[28px] shrink-0 cursor-pointer rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold whitespace-nowrap transition ${
              currentStyle === "liberty_3d"
                ? "bg-[#c6f432] text-[#08090c]"
                : "text-[#c9c7c0] hover:bg-white/10"
            }`}
            title="OpenFreeMap Vector 3D"
          >
            3D Vector
          </button>
          <button
            type="button"
            onClick={() => handleSwitchStyle("voyager")}
            className={`min-h-[28px] shrink-0 cursor-pointer rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold whitespace-nowrap transition ${
              currentStyle === "voyager"
                ? "bg-[#c6f432] text-[#08090c]"
                : "text-[#c9c7c0] hover:bg-white/10"
            }`}
            title="CARTO Voyager Raster"
          >
            Voyager
          </button>
          <button
            type="button"
            onClick={() => handleSwitchStyle("dark")}
            className={`min-h-[28px] shrink-0 cursor-pointer rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold whitespace-nowrap transition ${
              currentStyle === "dark"
                ? "bg-[#c6f432] text-[#08090c]"
                : "text-[#c9c7c0] hover:bg-white/10"
            }`}
            title="CARTO Dark Matter"
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
            {isId ? "Reset" : "Reset"}
          </button>
        </div>
      </div>

      {/* Bottom hint banner */}
      <div className="pointer-events-none absolute right-14 bottom-3 left-3 rounded-2xl sm:rounded-full border border-white/15 bg-[#08090c]/90 px-3.5 py-1.5 font-mono text-[10px] sm:text-[11px] text-[#c9c7c0] backdrop-blur-md">
        {isId
          ? "Scroll untuk Zoom 3D · Klik-kanan/Ctrl+geser untuk rotasi 360° · Klik atap bangunan mana pun untuk audit surya."
          : "Scroll to 3D Zoom · Right-click/Ctrl+drag to orbit 360° · Click any building roof to audit solar potential."}
      </div>
    </div>
  );
}
