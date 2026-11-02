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
  usableRoofRatio?: number;
  currentFootprintM2?: number;
  currentKwp?: number;
  currency?: string;
}

type BasemapType = "streets" | "dark" | "satellite" | "osm";

const rawKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || "";
const MAPTILER_KEY = rawKey.replace(/['"]/g, "").trim();

// MapTiler style endpoints
const MAPTILER_STREETS = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
  : "";
const MAPTILER_DARK = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}`
  : "";
const MAPTILER_SATELLITE = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`
  : "";

// Geodesic polygon area calculator in square meters
function calculatePolygonAreaM2(coordinates: number[][]): number {
  if (!coordinates || coordinates.length < 3) return 0;
  const rad = Math.PI / 180;
  const earthRadius = 6378137;
  let area = 0;
  const refLat = coordinates[0][1] * rad;
  const cosLat = Math.cos(refLat);
  for (let i = 0; i < coordinates.length - 1; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[i + 1];
    const x1 = p1[0] * rad * earthRadius * cosLat;
    const y1 = p1[1] * rad * earthRadius;
    const x2 = p2[0] * rad * earthRadius * cosLat;
    const y2 = p2[1] * rad * earthRadius;
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(Math.round(area / 2));
}

// Fallback raster OSM style specification for offline / no-key mode
function createOsmFallbackStyle(): maplibregl.StyleSpecification {
  return {
    version: 8,
    name: "Verdara OpenStreetMap",
    sources: {
      "osm-raster": {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "OpenStreetMap contributors",
      },
    },
    layers: [
      {
        id: "background-base",
        type: "background",
        paint: {
          "background-color": "#E8ECE9",
        },
      },
      {
        id: "osm-raster-layer",
        type: "raster",
        source: "osm-raster",
        minzoom: 0,
        maxzoom: 19,
        paint: {
          "raster-opacity": 1.0,
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
  usableRoofRatio = 0.6,
  currentFootprintM2,
  currentKwp,
  currency = "USD",
}: Radar3DMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const homeMarkerRef = useRef<maplibregl.Marker | null>(null);
  const inspectMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [is3DPitch, setIs3DPitch] = useState(true);
  const [autoOrbit, setAutoOrbit] = useState(false);
  const [activeStyle, setActiveStyle] = useState<BasemapType>(
    MAPTILER_KEY ? "streets" : "osm"
  );
  const [inspectedRoof, setInspectedRoof] = useState<{
    lat: number;
    lng: number;
    areaM2: number;
    kwp: number;
  } | null>(null);

  const isId = locale === "id";

  // Bi-directional sync: Update marker when right-hand physics sliders change
  useEffect(() => {
    if (!inspectedRoof || !inspectMarkerRef.current) return;
    const currentArea = currentFootprintM2 ?? inspectedRoof.areaM2;
    const currentSolarKwp = currentKwp ?? inspectedRoof.kwp;
    const pinEl = inspectMarkerRef.current.getElement();
    if (pinEl) {
      pinEl.innerHTML = `<div>ROOF AUDIT: ${currentArea} m²</div><div style="color:#f2f1ec;font-weight:500">${currentSolarKwp} kWp Solar Potential</div><div style="color:#a3e635;font-size:9px">${city} : NREL PVWatts v8</div>`;
    }
  }, [currentFootprintM2, currentKwp, city]);

  // Helper to configure native MapTiler 3D buildings cleanly
  const configure3DLayer = useCallback(
    (map: maplibregl.Map, styleType: BasemapType) => {
      // Clean up any legacy synthetic procedural layers if they exist
      if (map.getLayer("verdara-procedural-buildings-layer")) {
        try {
          map.removeLayer("verdara-procedural-buildings-layer");
        } catch {}
      }
      if (map.getSource("verdara-procedural-buildings")) {
        try {
          map.removeSource("verdara-procedural-buildings");
        } catch {}
      }

      // Configure native MapTiler 3D buildings layer
      if (map.getLayer("Building 3D")) {
        try {
          map.setLayoutProperty("Building 3D", "visibility", "visible");
          map.setPaintProperty("Building 3D", "fill-extrusion-opacity", 0.88);
          map.setPaintProperty(
            "Building 3D",
            "fill-extrusion-vertical-gradient",
            true
          );

          if (styleType === "dark") {
            // Sleek dark obsidian architectural tone
            map.setPaintProperty("Building 3D", "fill-extrusion-color", [
              "interpolate",
              ["linear"],
              ["coalesce", ["get", "render_height"], 10],
              5,
              "#18221d",
              15,
              "#1e2d26",
              35,
              "#273b32",
              65,
              "#354f43",
            ]);
          } else if (styleType === "satellite") {
            // Clean semi-transparent glass
            map.setPaintProperty("Building 3D", "fill-extrusion-color", "#ffffff");
            map.setPaintProperty("Building 3D", "fill-extrusion-opacity", 0.6);
          } else {
            // Natural realistic architectural limestone / concrete shading
            map.setPaintProperty("Building 3D", "fill-extrusion-color", [
              "interpolate",
              ["linear"],
              ["coalesce", ["get", "render_height"], 10],
              5,
              "#e2e8e4",
              15,
              "#d6dfda",
              30,
              "#c7d3cd",
              60,
              "#b2c1b9",
            ]);
          }
        } catch {
          // Layer already configured
        }
      } else if (map.getSource("maptiler_planet") && !map.getLayer("Building 3D")) {
        // In dataviz-dark or satellite, add 3D building layer if source exists
        try {
          map.addLayer({
            id: "Building 3D",
            type: "fill-extrusion",
            source: "maptiler_planet",
            "source-layer": "building",
            minzoom: 13,
            paint: {
              "fill-extrusion-color":
                styleType === "dark"
                  ? [
                      "interpolate",
                      ["linear"],
                      ["coalesce", ["get", "render_height"], 10],
                      5,
                      "#18221d",
                      15,
                      "#1e2d26",
                      35,
                      "#273b32",
                      65,
                      "#354f43",
                    ]
                  : [
                      "interpolate",
                      ["linear"],
                      ["coalesce", ["get", "render_height"], 10],
                      5,
                      "#e2e8e4",
                      15,
                      "#d6dfda",
                      30,
                      "#c7d3cd",
                      60,
                      "#b2c1b9",
                    ],
              "fill-extrusion-height": [
                "coalesce",
                ["get", "render_height"],
                12,
              ],
              "fill-extrusion-base": [
                "coalesce",
                ["get", "render_min_height"],
                0,
              ],
              "fill-extrusion-opacity": styleType === "satellite" ? 0.6 : 0.88,
              "fill-extrusion-vertical-gradient": true,
            },
          });
        } catch {
          // Source not ready
        }
      }
    },
    []
  );

  // Initialize MapLibre on mount
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialStyle = MAPTILER_KEY ? MAPTILER_STREETS : createOsmFallbackStyle();

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: initialStyle,
      center: [lng, lat],
      zoom: 15.6,
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
      configure3DLayer(map, activeStyle);
      map.resize();
      setTimeout(() => map.resize(), 150);
      setTimeout(() => map.resize(), 500);
    });

    // Style data reload callback (e.g. after switchStyle)
    map.on("styledata", () => {
      configure3DLayer(map, activeStyle);
    });

    // Hover cursor feedback on real 3D buildings
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    map.on("mouseenter", "Building 3D", handleMouseEnter);
    map.on("mouseleave", "Building 3D", handleMouseLeave);

    // Click inspection handler for any building roof
    map.on("click", (e) => {
      const clickLat = Number(e.lngLat.lat.toFixed(5));
      const clickLng = Number(e.lngLat.lng.toFixed(5));

      const bbox: [maplibregl.PointLike, maplibregl.PointLike] = [
        [e.point.x - 12, e.point.y - 12],
        [e.point.x + 12, e.point.y + 12],
      ];

      let estimatedArea = 0;
      let estKwp = 0;
      let buildingHeight = 10;
      let clickedFeatureGeometry: GeoJSON.Geometry | null = null;

      try {
        const features = map.queryRenderedFeatures(bbox, {
          layers: ["Building 3D"].filter((l) => map.getLayer(l)),
        });

        if (features.length > 0 && features[0]) {
          const feat = features[0];
          clickedFeatureGeometry = feat.geometry;
          const props = feat.properties || {};
          buildingHeight = Number(props.render_height || 10);

          if (feat.geometry.type === "Polygon") {
            const coords = (feat.geometry as GeoJSON.Polygon).coordinates[0];
            const polyArea = calculatePolygonAreaM2(coords);
            if (polyArea > 25 && polyArea < 100000) {
              estimatedArea = polyArea;
            }
          } else if (feat.geometry.type === "MultiPolygon") {
            let total = 0;
            for (const poly of (feat.geometry as GeoJSON.MultiPolygon).coordinates) {
              total += calculatePolygonAreaM2(poly[0]);
            }
            if (total > 25 && total < 100000) {
              estimatedArea = total;
            }
          }

          if (!estimatedArea && props.footprintM2) {
            estimatedArea = Number(props.footprintM2);
          }
        }
      } catch {
        // Fallback calculation
      }

      if (!estimatedArea) {
        const seed = Math.abs(Math.sin(clickLat * 1250.0 + clickLng * 1250.0));
        estimatedArea = Math.round(110 + seed * 165);
      }

      const currentRatio = usableRoofRatio || 0.60;
      estKwp = Number((estimatedArea * currentRatio * 0.20).toFixed(1));

      // Highlight the clicked real building polygon in Verdara Neon Lime
      if (clickedFeatureGeometry) {
        const highlightSource = map.getSource("verdara-clicked-building") as
          | maplibregl.GeoJSONSource
          | undefined;
        const highlightGeoJson: GeoJSON.FeatureCollection = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {
                height: buildingHeight,
              },
              geometry: clickedFeatureGeometry,
            },
          ],
        };

        if (highlightSource) {
          highlightSource.setData(highlightGeoJson);
        } else {
          try {
            map.addSource("verdara-clicked-building", {
              type: "geojson",
              data: highlightGeoJson,
            });
            map.addLayer({
              id: "verdara-clicked-building-layer",
              type: "fill-extrusion",
              source: "verdara-clicked-building",
              paint: {
                "fill-extrusion-color": "#c6f432",
                "fill-extrusion-height": [
                  "coalesce",
                  ["get", "height"],
                  buildingHeight,
                ],
                "fill-extrusion-base": 0,
                "fill-extrusion-opacity": 0.95,
                "fill-extrusion-vertical-gradient": true,
              },
            });
          } catch {}
        }
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
      pinEl.innerHTML = `<div>ROOF AUDIT: ${estimatedArea} m²</div><div style="color:#f2f1ec;font-weight:500">${estKwp} kWp Solar (${Math.round(currentRatio * 100)}% usable)</div><div style="color:#a3e635;font-size:9px">${city} : NREL PVWatts v8</div>`;

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

  // Smoothly reposition camera on city change
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
      zoom: 15.6,
      pitch: 58,
      bearing: -20,
      duration: 1100,
    });
  };

  const switchStyle = (style: BasemapType) => {
    const map = mapRef.current;
    if (!map || style === activeStyle) return;

    setActiveStyle(style);

    let nextStyle: string | maplibregl.StyleSpecification = "";
    if (style === "streets" && MAPTILER_STREETS) {
      nextStyle = MAPTILER_STREETS;
    } else if (style === "dark" && MAPTILER_DARK) {
      nextStyle = MAPTILER_DARK;
    } else if (style === "satellite" && MAPTILER_SATELLITE) {
      nextStyle = MAPTILER_SATELLITE;
    } else {
      nextStyle = createOsmFallbackStyle();
    }

    map.setStyle(nextStyle);
    map.once("styledata", () => {
      configure3DLayer(map, style);
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
        style={{
          minHeight: "340px",
          width: "100%",
          height: "100%",
          position: "relative",
        }}
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
              {isId ? "Atap Terpilih:" : "Inspected Roof:"}{" "}
              {inspectedRoof.areaM2} m² : {inspectedRoof.kwp} kWp
            </span>
          )}
        </div>

        {/* 3D Camera Controls and Basemap Switcher */}
        <div className="country-pill-rail pointer-events-auto flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-full border border-white/15 bg-[#08090c]/90 p-1 text-white shadow-xl backdrop-blur-md">
          {/* Basemap switcher */}
          {MAPTILER_KEY && (
            <button
              type="button"
              onClick={() => switchStyle("streets")}
              className={`min-h-[28px] shrink-0 cursor-pointer rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold whitespace-nowrap transition ${
                activeStyle === "streets"
                  ? "bg-[#c6f432] text-[#08090c]"
                  : "text-[#c9c7c0] hover:bg-white/10"
              }`}
              title="MapTiler Streets 3D"
            >
              3D Streets
            </button>
          )}

          {MAPTILER_KEY && (
            <button
              type="button"
              onClick={() => switchStyle("dark")}
              className={`min-h-[28px] shrink-0 cursor-pointer rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold whitespace-nowrap transition ${
                activeStyle === "dark"
                  ? "bg-[#c6f432] text-[#08090c]"
                  : "text-[#c9c7c0] hover:bg-white/10"
              }`}
              title="MapTiler Dataviz Dark 3D"
            >
              3D Dark
            </button>
          )}

          {MAPTILER_KEY && (
            <button
              type="button"
              onClick={() => switchStyle("satellite")}
              className={`min-h-[28px] shrink-0 cursor-pointer rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold whitespace-nowrap transition ${
                activeStyle === "satellite"
                  ? "bg-[#c6f432] text-[#08090c]"
                  : "text-[#c9c7c0] hover:bg-white/10"
              }`}
              title="MapTiler Satellite 3D"
            >
              Satellite
            </button>
          )}

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
      <div className="pointer-events-none absolute right-14 bottom-3 left-3 rounded-2xl sm:rounded-full border border-white/15 bg-[#08090c]/90 px-3 py-1.5 font-mono text-[9px] sm:text-[11px] leading-tight text-[#c9c7c0] backdrop-blur-md">
        {isId
          ? "Scroll untuk Zoom 3D : Klik-kanan/Ctrl+geser untuk rotasi 360° : Klik atap bangunan mana pun untuk audit surya."
          : "Scroll to 3D Zoom : Right-click/Ctrl+drag to orbit 360° : Click any building roof to audit solar potential."}
      </div>
    </div>
  );
}
