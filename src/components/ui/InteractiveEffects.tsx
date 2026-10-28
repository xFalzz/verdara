"use client";

import React, { useEffect, useRef, useState } from "react";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import {
  WORLD_CITY_CATALOG,
  resolveWorldCityGeoContext,
  type WorldCityEntry,
} from "@/lib/science/presets";
import { calculateHousingFootprint } from "@/lib/science/calculator";
import { formatCurrency, formatTemp, formatVolume } from "@/lib/science/units";

/**
 * 0. VERDARA BESPOKE ARCHITECTURAL BRAND LOGO (<VerdaraLogo />)
 * Combines:
 * - DOVV Lime (#c6f432) pitched solar-grid roofline forming an inverted V-crest
 * - Townhouse Emerald (#1e9e5a) living house gable & twin structural columns
 * - Townhouse Cyan (#2a9dbd) rainwater cistern arch & water droplet core
 */
export function VerdaraLogo({
  size = 38,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`th-logo-mark inline-flex shrink-0 items-center justify-center rounded-2xl bg-[#080808] shadow-[inset_0_0_0_1.5px_#2a2a2a,0_6px_16px_-6px_rgba(0,0,0,0.45)] transition-transform duration-300 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={Math.round(size * 0.72)}
        height={Math.round(size * 0.72)}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        {/* Solar Roofline Crest (DOVV Lime) */}
        <path
          d="M8 28L32 9L56 28L48.5 34.5L32 21.5L15.5 34.5L8 28Z"
          fill="#c6f432"
        />
        {/* Living Townhouse Gable & V-Pillars (Townhouse OK Emerald) */}
        <path
          d="M15 33L32 19.5L49 33V50C49 52.2091 47.2091 54 45 54H37V40H27V54H19C16.7909 54 15 52.2091 15 50V33Z"
          fill="#1e9e5a"
        />
        {/* Rainwater Cistern Arch & Core (Townhouse Water Cyan) */}
        <path
          d="M23.5 45C23.5 40.3056 27.3056 36.5 32 36.5C36.6944 36.5 40.5 40.3056 40.5 45V54H23.5V45Z"
          fill="#2a9dbd"
        />
        <circle cx="32" cy="45" r="3.4" fill="#f5f5f3" />
      </svg>
    </span>
  );
}

/**
 * 1. ZEGGO.COM.SG CHARACTER-STAGGER ROLL BUTTON
 * Replicates Zeggo's exact `.button` character wave (`--stagger: 7ms; --y-offset: 1.25em; cubic-bezier(.625, .05, 0, 1)`)
 */
export function ZeggoRollText({ text }: { text: string }) {
  return (
    <span className="zeggo-roll-line relative inline-flex overflow-clip leading-[1.25em]">
      {Array.from(text).map((ch, idx) => (
        <span
          key={idx}
          style={{ "--char-index": idx } as React.CSSProperties}
          className="zeggo-roll-char inline-block whitespace-pre"
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

/**
 * 2. DOVVSTUDIO.COM CURSOR-PROXIMITY VARIABLE FONT WEIGHT WAVE WORDMARK
 * Responsive across all screen sizes (320px mobile to 4K desktop).
 */
export function DovvInteractiveWordmark({
  lines,
  className = "",
}: {
  lines: string[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    let rafId = 0;
    let mouseX = -9999;
    let mouseY = -9999;
    let isPointerActive = false;

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isPointerActive = true;
      }
    };

    const onPointerLeave = () => {
      isPointerActive = false;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", onPointerLeave);

    const radius = 340;
    const animate = () => {
      if (isPointerActive) {
        for (const el of charRefs.current) {
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dist = Math.hypot(mouseX - cx, mouseY - cy);
          if (dist < radius) {
            const t = 1 - dist / radius;
            const wght = Math.round(900 - t * 580);
            const wdth = Math.round(62 + t * 28);
            el.style.fontVariationSettings = `"wdth" ${wdth}, "wght" ${wght}`;
          } else {
            el.style.fontVariationSettings = `"wdth" 62, "wght" 900`;
          }
        }
      }
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", onPointerLeave);
    };
  }, []);

  let globalCharIdx = 0;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`dovv-wordmark max-w-full select-none text-center ${className}`}
    >
      {lines.map((line, lIdx) => (
        <div
          key={lIdx}
          className="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-1"
        >
          {Array.from(line).map((ch) => {
            const idx = globalCharIdx++;
            return (
              <span
                key={idx}
                ref={(el) => {
                  charRefs.current[idx] = el;
                }}
                className="inline-block whitespace-pre transition-[font-variation-settings] duration-75"
              >
                {ch}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * 3. DOVVSTUDIO.COM HOLOGRAPHIC FOIL + MOVING SHINE DRAGGABLE STICKER
 */
export function DovvHoloSticker({
  label,
  sublabel,
  variant,
  rotationDeg,
  className = "",
}: {
  label: string;
  sublabel?: string;
  variant: "orange" | "lime" | "gold";
  rotationDeg: number;
  className?: string;
}) {
  const stickerRef = useRef<HTMLDivElement>(null);
  const foilRef = useRef<SVGLinearGradientElement>(null);
  const shineRef = useRef<SVGRadialGradientElement>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, origX: 0, origY: 0 });

  const gradId = React.useId().replace(/:/g, "");

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    let rafId = 0;
    let pointerX = -1;
    let pointerY = -1;
    let pointerActive = false;
    let curX = 0.5;
    let curY = 0.5;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        pointerX = e.clientX;
        pointerY = e.clientY;
        pointerActive = true;
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const w = 240;
    const h = 68;

    const loop = (t: number) => {
      const el = stickerRef.current;
      if (el && foilRef.current && shineRef.current) {
        const rect = el.getBoundingClientRect();
        let targetX: number;
        let targetY: number;
        if (pointerActive) {
          targetX = Math.min(
            1.5,
            Math.max(-0.5, (pointerX - rect.left) / Math.max(1, rect.width))
          );
          targetY = Math.min(
            1.5,
            Math.max(-0.5, (pointerY - rect.top) / Math.max(1, rect.height))
          );
        } else {
          targetX = 0.5 + Math.sin(t / 1600 + rect.left / 200) * 0.6;
          targetY = 0.5 + Math.cos(t / 2100 + rect.top / 200) * 0.6;
        }
        curX += (targetX - curX) * 0.08;
        curY += (targetY - curY) * 0.08;

        const sx = (curX - 0.5) * w * 0.9;
        const sy = (curY - 0.5) * h * 0.9;
        foilRef.current.setAttribute("x1", String(-sx));
        foilRef.current.setAttribute("y1", String(-sy));
        foilRef.current.setAttribute("x2", String(w * 0.6 - sx));
        foilRef.current.setAttribute("y2", String(h * 0.6 - sy));
        shineRef.current.setAttribute("cx", String(curX * w));
        shineRef.current.setAttribute("cy", String(curY * h));
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const stops =
    variant === "orange"
      ? [
          "#ed4a1c",
          "#ff6a3d",
          "#ff8f5e",
          "#ff4f7a",
          "#ed4a1c",
          "#ff7a3d",
          "#ed4a1c",
        ]
      : variant === "lime"
      ? [
          "#c6f432",
          "#e5ff78",
          "#9be82b",
          "#c6f432",
          "#f0ffab",
          "#a8eb28",
          "#c6f432",
        ]
      : [
          "#ffd23f",
          "#fff0a0",
          "#ffb347",
          "#ffd23f",
          "#fff6c8",
          "#ffc21a",
          "#ffd23f",
        ];

  const textColor = variant === "orange" ? "#ffffff" : "#111111";

  return (
    <div
      ref={stickerRef}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setIsDragging(true);
        dragStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          origX: dragOffset.x,
          origY: dragOffset.y,
        };
      }}
      onPointerMove={(e) => {
        if (!isDragging) return;
        setDragOffset({
          x: dragStartRef.current.origX + (e.clientX - dragStartRef.current.x),
          y: dragStartRef.current.origY + (e.clientY - dragStartRef.current.y),
        });
      }}
      onPointerUp={() => setIsDragging(false)}
      style={
        {
          "--rot": `${rotationDeg}deg`,
          transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${rotationDeg}deg)`,
        } as React.CSSProperties
      }
      title="Drag sticker around"
      className={`dovv-sticker cursor-grab active:cursor-grabbing ${className}`}
    >
      <svg
        viewBox="0 0 240 68"
        width="236"
        height="66"
        className="block overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            ref={foilRef}
            id={`foil-${gradId}`}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="144"
            y2="42"
            spreadMethod="reflect"
          >
            {stops.map((c, i) => (
              <stop
                key={i}
                offset={i / (stops.length - 1)}
                stopColor={c}
              />
            ))}
          </linearGradient>
          <radialGradient
            ref={shineRef}
            id={`shine-${gradId}`}
            gradientUnits="userSpaceOnUse"
            cx="120"
            cy="34"
            r="110"
          >
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.82" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <rect
            id={`shape-${gradId}`}
            x="6"
            y="6"
            width="228"
            height="56"
            rx="28"
          />
        </defs>

        <use
          href={`#shape-${gradId}`}
          fill="#ffffff"
          stroke="#ffffff"
          strokeWidth="10"
          strokeLinejoin="round"
        />
        <use href={`#shape-${gradId}`} fill={`url(#foil-${gradId})`} />
        <use
          href={`#shape-${gradId}`}
          fill={`url(#shine-${gradId})`}
          style={{ mixBlendMode: "soft-light", opacity: 0.9 }}
        />

        <text
          x="120"
          y={sublabel ? "31" : "39"}
          textAnchor="middle"
          fill={textColor}
          style={{
            fontFamily: "var(--font-sans), sans-serif",
            fontWeight: 800,
            fontSize: "15px",
            letterSpacing: "-0.03em",
          }}
        >
          {label}
        </text>
        {sublabel && (
          <text
            x="120"
            y="48"
            textAnchor="middle"
            fill={textColor}
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontWeight: 600,
              fontSize: "10.5px",
              letterSpacing: "0.04em",
              opacity: 0.85,
            }}
          >
            {sublabel}
          </text>
        )}
      </svg>
    </div>
  );
}

/**
 * 4. TOWNHOUSE.DEV ANIMATED CHAPTER SCROLL RAIL (`data-testid="scene-rail"`)
 * Replicates Townhouse.dev's exact `Tt` scene-rail component from `LandingPlaceholder.BWkykNAw.js`:
 * - Fixed vertical chapter rail on the right edge (`right-3 lg:right-5 top-1/2 -translate-y-1/2`)
 * - Lead-Trail elastic morphing pill indicator (`rail-indicator`) + active dot (`w-1.5 rounded-full`)
 * - Compact dot mode on Hero (`index === 0`) that expands on hover/focus or as soon as you scroll down
 * - Live scroll percentage meter + `Next ↓` chapter button at the bottom
 */
export interface ScrollRailChapter {
  id: string;
  labelEn: string;
  labelId: string;
}

export function TownhouseScrollRail({
  chapters,
  isLight,
  isId,
}: {
  chapters: ScrollRailChapter[];
  isLight: boolean;
  isId: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [scrollPct, setScrollPct] = useState(0);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [bounds, setBounds] = useState<{ top: number; bottom: number } | null>(
    null
  );

  // Track scroll position and active section
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      setScrollPct(Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100))));

      const triggerY = window.innerHeight * 0.38;
      let foundIdx = 0;
      chapters.forEach((ch, idx) => {
        const el = document.getElementById(ch.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerY) {
            foundIdx = idx;
          }
        }
      });

      setActiveIndex((cur) => {
        if (cur !== foundIdx) {
          setPrevIndex(cur);
        }
        return foundIdx;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [chapters]);

  // Measure active item's top & bottom for Townhouse lead-trail indicator
  useEffect(() => {
    const updateBounds = () => {
      const el = itemRefs.current[activeIndex];
      if (el) {
        setBounds({
          top: el.offsetTop,
          bottom: el.offsetTop + el.offsetHeight,
        });
      }
    };
    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, [activeIndex, isId]);

  const scrollToChapter = (idx: number) => {
    const target = chapters[idx];
    if (!target) return;
    const el = document.getElementById(target.id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const isHero = activeIndex === 0;
  const movingDown = activeIndex >= prevIndex;
  const pillTop = bounds?.top ?? 0;
  const pillHeight = Math.max(32, (bounds?.bottom ?? 32) - pillTop);
  const dotTop = pillTop + pillHeight / 2 - 4;

  return (
    <>
      {/* Top Thin Townhouse Scroll Progress Line */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent"
      >
        <div
          style={{ width: `${scrollPct}%` }}
          className="h-full bg-gradient-to-r from-[#1e9e5a] via-[#c6f432] to-[#2a9dbd] transition-[width] duration-150 ease-out"
        />
      </div>

      {/* Townhouse.dev Fixed Right Scene Rail (`data-testid="scene-rail"`) */}
      <nav
        aria-label={isId ? "Bab Halaman" : "Page Chapters"}
        data-testid="scene-rail"
        className={`group/rail pointer-events-auto fixed top-1/2 right-3 z-40 hidden -translate-y-1/2 flex-col items-stretch rounded-2xl border p-1.5 transition-all duration-300 md:flex lg:right-5 ${
          isHero
            ? isLight
              ? "border-black/10 bg-[#f5f5f3]/80 shadow-sm backdrop-blur-md hover:bg-white/95 hover:shadow-xl"
              : "border-white/10 bg-[#0b0c0e]/80 shadow-sm backdrop-blur-md hover:bg-[#141619]/95 hover:shadow-xl"
            : isLight
            ? "border-black/12 bg-white/90 shadow-[0_8px_30px_rgba(0,0,0,0.09)] backdrop-blur-md"
            : "border-white/12 bg-[#141619]/90 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-md"
        }`}
      >
        {/* Scroll Percentage Mini Header */}
        <div className="mb-1 flex items-center justify-between gap-2 px-2.5 pt-1 font-mono text-[10px] opacity-60">
          <span
            className={
              isHero
                ? "hidden group-focus-within/rail:inline group-hover/rail:inline"
                : "inline"
            }
          >
            {isId ? "BAB" : "CHAPTER"}
          </span>
          <span className="tabular-nums font-semibold text-[#1e9e5a]">
            {scrollPct}%
          </span>
        </div>

        <ol className="relative flex flex-col">
          {/* Townhouse Lead-Trail Elastic Background Pill (`rail-indicator`) */}
          {bounds && (
            <>
              <span
                aria-hidden="true"
                data-testid="rail-indicator"
                style={{
                  top: pillTop,
                  height: pillHeight,
                  transition: movingDown
                    ? "top 0.42s cubic-bezier(0.32, 1.1, 0.5, 1), height 0.24s cubic-bezier(0.22, 1, 0.36, 1)"
                    : "top 0.24s cubic-bezier(0.22, 1, 0.36, 1), height 0.42s cubic-bezier(0.32, 1.1, 0.5, 1)",
                }}
                className={`pointer-events-none absolute inset-x-0 rounded-[10px] shadow-sm ${
                  isLight
                    ? "bg-[#111111]"
                    : "bg-[#c6f432]"
                }`}
              />
              <span
                aria-hidden="true"
                style={{
                  top: dotTop,
                  height: 8,
                  transition:
                    "top 0.36s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.25s ease",
                }}
                className={`pointer-events-none absolute left-2.5 w-1.5 rounded-full ${
                  isLight ? "bg-[#c6f432]" : "bg-[#080808]"
                }`}
              />
            </>
          )}

          {chapters.map((ch, idx) => {
            const active = idx === activeIndex;
            return (
              <li
                key={ch.id}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() => scrollToChapter(idx)}
                  aria-label={isId ? ch.labelId : ch.labelEn}
                  aria-current={active ? "step" : undefined}
                  className={`flex min-h-[34px] w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[12.5px] transition-colors ${
                    active
                      ? isLight
                        ? "font-semibold text-white"
                        : "font-semibold text-[#080808]"
                      : isLight
                      ? "text-[#4b4b48] hover:text-[#111111]"
                      : "text-[#aaa9ad] hover:text-white"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                      active
                        ? "bg-transparent"
                        : idx < activeIndex
                        ? "bg-[#1e9e5a]"
                        : "bg-current opacity-35"
                    }`}
                  />
                  <span
                    className={`whitespace-nowrap ${
                      isHero
                        ? "hidden group-focus-within/rail:inline group-hover/rail:inline"
                        : "inline"
                    }`}
                  >
                    {isId ? ch.labelId : ch.labelEn}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Townhouse `scene-next` Bottom Button */}
        <button
          type="button"
          onClick={() =>
            scrollToChapter(Math.min(chapters.length - 1, activeIndex + 1))
          }
          disabled={activeIndex === chapters.length - 1}
          data-testid="scene-next"
          className={`mt-1.5 flex min-h-[34px] cursor-pointer items-center justify-center gap-1.5 border-t pt-1.5 text-[12px] font-medium transition-opacity ${
            isLight
              ? "border-black/10 text-[#4b4b48] hover:text-[#111]"
              : "border-white/10 text-[#aaa9ad] hover:text-white"
          } ${
            activeIndex === chapters.length - 1
              ? "pointer-events-none opacity-25"
              : ""
          }`}
        >
          <span
            className={
              isHero
                ? "hidden group-focus-within/rail:inline group-hover/rail:inline"
                : "inline"
            }
          >
            {isId ? "Lanjut" : "Next"}
          </span>
          <span aria-hidden="true" className="font-mono text-xs">
            ↓
          </span>
        </button>
      </nav>
    </>
  );
}

/**
 * 5. GLOBAL WORLD COUNTRIES & CITIES EXPLORER (<WorldCityExplorer />)
 * Lets users inspect ANY country and city in the world:
 * - Instant filter across 6 Global Regions (All World, Indonesia, Asia-Pacific, Europe, Americas, Middle East & Africa)
 * - Live Open-Meteo Geocoding API search for 100,000+ cities & towns in every country on Earth
 * - Displays plain-language solar, rainwater, temperature, and local currency savings for each city
 */
interface GeocodingHit {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
}

export function WorldCityExplorer({
  isLight,
  isId,
  compact = false,
}: {
  isLight: boolean;
  isId: boolean;
  compact?: boolean;
}) {
  const {
    geo,
    housingCalc,
    units,
    locale,
    teleportToCity,
    setCustomCoordinates,
  } = useVerdaraStore();

  const [regionFilter, setRegionFilter] = useState<
    "all" | WorldCityEntry["continent"]
  >("all");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodingHit[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleLiveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query.trim()
        )}&count=8&language=${isId ? "id" : "en"}&format=json`
      );
      const data = await res.json();
      if (data?.results && data.results.length > 0) {
        setSearchResults(data.results);
      } else {
        setSearchResults([]);
        setSearchError(
          isId
            ? "Kota tidak ditemukan. Coba ketik nama kota atau negara lain."
            : "No matching city found. Try another city or country name."
        );
      }
    } catch {
      setSearchError(
        isId
          ? "Gagal menghubungi server geokode. Gunakan daftar kota dunia di bawah."
          : "Could not reach geocoding server. Pick any world city below."
      );
    } finally {
      setIsSearching(false);
    }
  };

  const selectCatalogCity = (entry: WorldCityEntry) => {
    if (entry.presetId) {
      teleportToCity(entry.presetId);
    } else {
      setCustomCoordinates(
        entry.lat,
        entry.lng,
        entry.city,
        entry.countryCode
      );
    }
  };

  const selectGeocodedCity = (hit: GeocodingHit) => {
    const label = `${hit.name}${hit.admin1 ? `, ${hit.admin1}` : ""}`;
    setCustomCoordinates(
      hit.latitude,
      hit.longitude,
      label,
      (hit.country_code || "XX").toUpperCase()
    );
    setSearchResults([]);
    setQuery("");
  };

  const filteredCatalog =
    regionFilter === "all"
      ? WORLD_CITY_CATALOG
      : WORLD_CITY_CATALOG.filter((c) => c.continent === regionFilter);

  const visibleCities = compact
    ? filteredCatalog.slice(0, 12)
    : filteredCatalog;

  return (
    <div
      className={`rounded-[32px] border p-5 sm:p-8 ${
        isLight
          ? "border-black/10 bg-white shadow-sm"
          : "border-white/10 bg-[#121418]"
      }`}
    >
      {/* Top Search & Active City Banner */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="rounded-full bg-[#1e9e5a]/15 px-3 py-1 font-semibold text-[#1e9e5a]">
              {isId ? "CAKUPAN 195+ NEGARA" : "195+ COUNTRIES SUPPORTED"}
            </span>
            <span className="opacity-70">
              {isId
                ? `Kota Aktif: ${geo.city} (${geo.countryCode} · Iklim ${geo.koppen.code})`
                : `Active City: ${geo.city} (${geo.countryCode} · Climate ${geo.koppen.code})`}
            </span>
          </div>
          <h3 className="mt-2 text-2xl sm:text-3xl font-medium tracking-[-0.03em]">
            {isId
              ? "Pilih atau cari kota mana pun di seluruh dunia"
              : "Pick or search any city and country on Earth"}
          </h3>
          <p
            className={`mt-1 text-xs sm:text-sm ${
              isLight ? "text-[#4b4b48]" : "text-[#c9c7c0]"
            }`}
          >
            {isId
              ? "Otomatis menyesuaikan sinar matahari, curah hujan bulanan, mata uang lokal, tarif listrik, dan lokasi bank sampah untuk negara yang Anda pilih."
              : "Automatically adapts sunshine, monthly rainfall, local currency, electricity tariff, and recycling drop-off hubs to your chosen country."}
          </p>
        </div>

        {/* Live Global Search Input */}
        <form
          onSubmit={handleLiveSearch}
          className="flex w-full flex-col gap-2 sm:flex-row lg:w-[440px]"
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isId
                ? "Ketik kota/negara (mis. Surabaya, Seoul, Paris, Cairo)..."
                : "Type any city or country (e.g. Jakarta, Paris, Seoul, Cairo)..."
            }
            className={`min-h-[46px] flex-1 rounded-full border px-4 text-xs sm:text-sm focus:outline-none ${
              isLight
                ? "border-black/15 bg-[#f5f5f3] text-[#111] placeholder-[#666]"
                : "border-white/15 bg-[#0b0c0e] text-white placeholder-[#888]"
            }`}
          />
          <button
            type="submit"
            disabled={isSearching}
            className="zeggo-btn min-h-[46px] shrink-0 cursor-pointer rounded-full bg-[#080808] px-6 text-xs sm:text-sm font-semibold text-[#c6f432] transition hover:bg-[#1c1c1c] disabled:opacity-50"
          >
            {isSearching
              ? isId
                ? "Mencari..."
                : "Searching..."
              : isId
              ? "Cari Kota Dunia"
              : "Search World"}
          </button>
        </form>
      </div>

      {/* Live Search Results Dropdown Grid */}
      {searchError && (
        <p className="mt-3 rounded-2xl bg-[#e5484d]/10 px-4 py-2.5 text-xs font-medium text-[#e5484d]">
          {searchError}
        </p>
      )}

      {searchResults.length > 0 && (
        <div className="mt-5 rounded-2xl bg-[#080808] p-4 text-white">
          <div className="mb-3 flex items-center justify-between font-mono text-xs text-[#aaa9ad]">
            <span>
              {isId
                ? `Hasil Pencarian Global (${searchResults.length} kota ditemukan)`
                : `Global Geocoding Results (${searchResults.length} cities found)`}
            </span>
            <button
              type="button"
              onClick={() => setSearchResults([])}
              className="cursor-pointer text-[#c6f432] hover:underline"
            >
              {isId ? "Tutup Hasil ×" : "Clear Results ×"}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {searchResults.map((hit) => (
              <button
                key={hit.id}
                type="button"
                onClick={() => selectGeocodedCity(hit)}
                className="flex min-h-[56px] cursor-pointer flex-col justify-between rounded-xl bg-[#16181d] p-3.5 text-left transition hover:bg-[#22252c] hover:ring-1 hover:ring-[#c6f432]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-sans text-sm font-semibold text-white">
                    {hit.name}
                  </span>
                  <span className="rounded-full bg-[#c6f432]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#c6f432]">
                    {hit.country_code}
                  </span>
                </div>
                <span className="mt-1 truncate font-mono text-[11px] text-[#aaa9ad]">
                  {hit.admin1 ? `${hit.admin1}, ` : ""}
                  {hit.country} ({hit.latitude.toFixed(1)}°,{" "}
                  {hit.longitude.toFixed(1)}°)
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Region Tabs */}
      <div
        role="tablist"
        aria-label={isId ? "Filter Wilayah Dunia" : "World Region Filter"}
        className="mt-5 flex flex-wrap gap-1.5 border-t border-current/10 pt-5"
      >
        {(
          [
            {
              id: "all",
              labelEn: "All Regions (28 Cities)",
              labelId: "Semua Wilayah (28 Kota)",
            },
            {
              id: "indonesia",
              labelEn: "Indonesia (8 Cities)",
              labelId: "Indonesia (8 Kota)",
            },
            {
              id: "asia_pacific",
              labelEn: "Asia-Pacific",
              labelId: "Asia-Pasifik",
            },
            { id: "europe", labelEn: "Europe", labelId: "Eropa" },
            { id: "americas", labelEn: "Americas", labelId: "Amerika" },
            {
              id: "mena_africa",
              labelEn: "Middle East & Africa",
              labelId: "Timur Tengah & Afrika",
            },
          ] as const
        ).map((tab) => {
          const active = regionFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setRegionFilter(tab.id)}
              className={`min-h-[38px] cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium transition ${
                active
                  ? "bg-[#080808] font-semibold text-[#c6f432]"
                  : isLight
                  ? "bg-[#f5f5f3] text-[#4b4b48] hover:bg-[#e5e5e0] hover:text-[#111]"
                  : "bg-[#1a1d22] text-[#c9c7c0] hover:bg-[#242830] hover:text-white"
              }`}
            >
              {isId ? tab.labelId : tab.labelEn}
            </button>
          );
        })}
      </div>

      {/* World Cities Interactive Cards Grid */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visibleCities.map((entry) => {
          const cityGeo = resolveWorldCityGeoContext({
            lat: entry.lat,
            lng: entry.lng,
            city: entry.city,
            countryCode: entry.countryCode,
          });
          const cityCalc = calculateHousingFootprint({
            footprintM2: housingCalc.footprintM2,
            ghiKwhM2Day: cityGeo.ghiKwhM2Day,
            annualPrecipMm: cityGeo.koppen.pAnnMm,
            electricityTariff: cityGeo.policy.electricityTariff,
            gridEfKgPerKwh: cityGeo.policy.gridEfKgKwh,
            currency: cityGeo.policy.currency,
            warmMonthMaxTempC: cityGeo.warmMonthMaxTempC,
            greenCoverRatio: cityGeo.greenCoverRatio,
            builtCoverRatio: cityGeo.builtCoverRatio,
          });
          const isCurrent =
            Math.abs(geo.lat - entry.lat) < 0.25 &&
            Math.abs(geo.lng - entry.lng) < 0.25;

          return (
            <button
              key={entry.slug}
              type="button"
              onClick={() => selectCatalogCity(entry)}
              className={`th-node-card group flex cursor-pointer flex-col justify-between overflow-hidden border p-4 pl-5 text-left transition ${
                isCurrent
                  ? "border-[#1e9e5a] bg-[#080808] text-white shadow-md"
                  : isLight
                  ? "border-black/10 bg-[#f8f8f6] text-[#111] hover:border-black/30 hover:bg-white"
                  : "border-white/10 bg-[#17191e] text-white hover:border-[#c6f432]/50"
              }`}
            >
              <span
                aria-hidden="true"
                className={`th-map-bar ${
                  isCurrent
                    ? "bg-[#c6f432] opacity-100"
                    : "bg-[#1e9e5a] opacity-55"
                }`}
              />
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider opacity-70">
                    {entry.countryCode} ·{" "}
                    {isId ? entry.countryNameId : entry.countryNameEn}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
                      isCurrent
                        ? "bg-[#c6f432] text-[#080808]"
                        : "bg-[#1e9e5a]/15 text-[#1e9e5a]"
                    }`}
                  >
                    {cityGeo.koppen.code} · {formatTemp(cityGeo.currentTempC, units)}
                  </span>
                </div>
                <p className="mt-1.5 text-base font-semibold tracking-tight">
                  {entry.city}
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-current/10 pt-2.5 font-mono text-[11px]">
                <div>
                  <span className="block text-[9px] uppercase opacity-60">
                    {isId ? "Tenaga Surya" : "Solar Roof"}
                  </span>
                  <span className="font-semibold text-[#1e9e5a]">
                    {cityCalc.solar.kwp} kWp (
                    {formatCurrency(
                      cityCalc.solar.savingsYear,
                      cityCalc.solar.currency,
                      locale
                    )}
                    /yr)
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase opacity-60">
                    {isId ? "Panen Hujan" : "Rain Harvest"}
                  </span>
                  <span className="font-semibold text-[#2a9dbd]">
                    {formatVolume(
                      cityCalc.rainwater.litersYear,
                      units,
                      locale
                    )}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
