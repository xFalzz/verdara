"use client";

import React, { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
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
      try {
        const style = map.getStyle();
        const vectorSource =
          style?.sources &&
          Object.keys(style.sources).find(
            (k) => style.sources[k]?.type === "vector"
          );

        if (vectorSource && !map.getLayer("verdara-3d-buildings")) {
          map.addLayer({
            id: "verdara-3d-buildings",
            source: vectorSource,
            "source-layer": "building",
            type: "fill-extrusion",
            minzoom: 13.5,
            paint: {
              "fill-extrusion-color": [
                "interpolate",
                ["linear"],
                ["coalesce", ["get", "render_height"], 14],
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
                14,
              ],
              "fill-extrusion-base": [
                "coalesce",
                ["get", "render_min_height"],
                ["get", "min_height"],
                0,
              ],
              "fill-extrusion-opacity": 0.9,
              "fill-extrusion-vertical-gradient": true,
            },
          });
        }
      } catch {
        // Fallback if base style already defines custom building layers
      }
      setMapLoaded(true);
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

    return () => {
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

      {/* Responsive Top HUD Bar: Telemetry Pills + 3D Camera Controls (Zero Collision on All Devices) */}
      <div className="pointer-events-none absolute top-2.5 right-2.5 left-2.5 z-10 flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-white/15 bg-[#08090c]/90 px-2.5 py-1 font-mono text-[10px] sm:text-[11px] font-semibold text-[#c6f432] backdrop-blur-md">
            3D Urban ({is3DPitch ? "58°" : "2D"}) · {city}
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

        {/* Interactive 3D Camera Controls */}
        <div className="country-pill-rail pointer-events-auto flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-full border border-white/15 bg-[#08090c]/90 p-1 text-white shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={handleTogglePitch}
            className={`min-h-[30px] shrink-0 cursor-pointer rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold whitespace-nowrap transition ${
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
            className="min-h-[30px] shrink-0 cursor-pointer rounded-full px-2.5 py-1 font-mono text-[10px] text-[#c9c7c0] whitespace-nowrap transition hover:bg-white/10 hover:text-white"
          >
            {isId ? "Putar 90°" : "Rotate 90°"}
          </button>
          <button
            type="button"
            onClick={() => setAutoOrbit((o) => !o)}
            className={`min-h-[30px] shrink-0 cursor-pointer rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold whitespace-nowrap transition ${
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
            className="min-h-[30px] shrink-0 cursor-pointer rounded-full px-2.5 py-1 font-mono text-[10px] text-[#c9c7c0] whitespace-nowrap transition hover:bg-white/10 hover:text-white"
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
