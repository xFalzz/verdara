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
  const [mapLoaded, setMapLoaded] = useState(false);

  const isId = locale === "id";

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [lng, lat],
      zoom: 15.2,
      pitch: 55,
      bearing: -18,
      maxPitch: 65,
      scrollZoom: true,
    });

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "bottom-right"
    );

    map.on("load", () => {
      setMapLoaded(true);
    });

    map.on("click", (e) => {
      const clickLat = Number(e.lngLat.lat.toFixed(5));
      const clickLng = Number(e.lngLat.lng.toFixed(5));
      const seed = Math.abs(Math.sin(clickLat * 1200 + clickLng * 1200));
      const estimatedArea = Math.round(95 + seed * 145);
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

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({
      center: [lng, lat],
      zoom: 15.2,
      pitch: 55,
      bearing: -18,
      duration: 1600,
      essential: true,
    });
  }, [lat, lng]);

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
      "flex items-center gap-1.5 rounded-lg border-2 border-[#A3E635] bg-[#070D0A]/95 px-3 py-1 font-mono text-xs font-bold text-[#A3E635] shadow-xl";
    homeEl.innerHTML = `<span>PLOT:</span><span>${city}</span>`;
    homeMarkerRef.current = new maplibregl.Marker({ element: homeEl })
      .setLngLat([lng, lat])
      .addTo(map);

    hubs.forEach((hub) => {
      const isSelected = hub.id === selectedHubId;
      const el = document.createElement("button");
      el.type = "button";
      el.className = `cursor-pointer flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11px] font-semibold shadow-lg transition-transform hover:scale-105 ${
        isSelected
          ? "border-[#A3E635] bg-[#A3E635] text-[#070D0A] scale-105"
          : "border-[#1D3328] bg-[#070D0A]/90 text-[#F2F7F4]"
      }`;
      const code =
        hub.type === "waste_bank"
          ? "WB"
          : hub.type === "compost_hub"
          ? "BIO"
          : hub.type === "ewaste_drop"
          ? "EW"
          : "HUB";
      el.innerHTML = `<span>${code}</span><span>${hub.distanceKm} km</span>`;
      el.onclick = (ev) => {
        ev.stopPropagation();
        onSelectHub(hub);
      };

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([hub.lng, hub.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [hubs, lat, lng, city, selectedHubId, onSelectHub, mapLoaded]);

  return (
    <div
      data-lenis-prevent
      className="relative h-full w-full overflow-hidden rounded-2xl border border-[#1D3328] bg-[#070D0A]"
    >
      <div ref={containerRef} className="h-full w-full" />

      <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap items-center gap-2">
        <span className="rounded-lg border border-[#1D3328] bg-[#070D0A]/85 px-2.5 py-1 font-mono text-xs font-semibold text-[#A3E635] backdrop-blur-md">
          3D Urban Extrusion (Pitch 55 deg) / {city}
        </span>
        <span className="rounded-lg border border-[#1D3328] bg-[#070D0A]/85 px-2.5 py-1 font-mono text-xs text-[#F2F7F4] backdrop-blur-md">
          {hubs.length} {isId ? "Hub Sirkular OSM Aktif" : "Verified OSM Circular Hubs"}
        </span>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl border border-[#1D3328] bg-[#070D0A]/85 px-3 py-1.5 font-mono text-xs text-[#A3BEB0] backdrop-blur-md">
        {isId
          ? "Klik atap bangunan di peta 3D untuk mengaudit kWp surya & liter air hujan, atau klik pin hub untuk detail rute."
          : "Click any building roof on the 3D map to audit solar kWp & rainwater liters, or click a hub pin for routing."}
      </div>
    </div>
  );
}
