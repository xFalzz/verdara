"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import {
  WORLD_CITY_CATALOG,
  resolveWorldCityGeoContext,
  type WorldCityEntry,
} from "@/lib/science/presets";
import { calculateHousingFootprint } from "@/lib/science/calculator";
import { formatCurrency, formatTemp } from "@/lib/science/units";
import { smoothScrollTo } from "@/components/ui/SmoothScroll";

/**
 * 0. VERDARA BESPOKE ARCHITECTURAL BRAND LOGO (<VerdaraLogo />)
 * Modernist architectural "V" spatial prism:
 * - Left Cantilever: Living architectural timber & micro-climate wing (Forest Emerald #1e9e5a -> #0e562e)
 * - Right Cantilever: Solar photovoltaic glass wing with precision louvers (Electric Lime #e8ff66 -> #b6eb1a)
 * - Chamfer Bevels: Dual 3D isometric facets catching ambient light
 * - Central Spatial Aperture: Diamond light well with living water node (#2a9dbd)
 * - Zero generic clip-art: High-precision Swiss/Bauhaus architectural vector craftsmanship
 */
export function VerdaraLogo({
  size = 38,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const uid = React.useId().replace(/:/g, "");
  return (
    <span
      className={`th-logo-mark inline-flex shrink-0 items-center justify-center rounded-2xl bg-[#08090c] shadow-[inset_0_0_0_1.5px_#232730,0_8px_20px_-6px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={Math.round(size * 0.72)}
        height={Math.round(size * 0.72)}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={`vd-emerald-${uid}`}
            x1="15"
            y1="17"
            x2="32"
            y2="49"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#1e9e5a" />
            <stop offset="100%" stopColor="#0e562e" />
          </linearGradient>
          <linearGradient
            id={`vd-lime-${uid}`}
            x1="49"
            y1="17"
            x2="32"
            y2="49"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#e8ff66" />
            <stop offset="100%" stopColor="#b6eb1a" />
          </linearGradient>
          <linearGradient
            id={`vd-bevel-l-${uid}`}
            x1="15"
            y1="13"
            x2="30"
            y2="17"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#2ee07e" />
            <stop offset="100%" stopColor="#1a8b4e" />
          </linearGradient>
          <linearGradient
            id={`vd-bevel-r-${uid}`}
            x1="49"
            y1="13"
            x2="34"
            y2="17"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#c6f432" />
          </linearGradient>
        </defs>

        {/* Left Cantilever Wing: Living Architecture (Emerald) */}
        <path
          d="M15 17 L26 17 L32 35.5 L32 49 L15 17 Z"
          fill={`url(#vd-emerald-${uid})`}
        />
        {/* Left Chamfer Bevel */}
        <path
          d="M15 17 L19 13 L30 13 L26 17 Z"
          fill={`url(#vd-bevel-l-${uid})`}
        />

        {/* Right Cantilever Wing: Solar Kinetic (Lime) */}
        <path
          d="M49 17 L38 17 L32 35.5 L32 49 L49 17 Z"
          fill={`url(#vd-lime-${uid})`}
        />
        {/* Right Chamfer Bevel */}
        <path
          d="M49 17 L45 13 L34 13 L38 17 Z"
          fill={`url(#vd-bevel-r-${uid})`}
        />

        {/* Central Spatial Aperture (Diamond Light Well) */}
        <path
          d="M32 21 L37.5 29 L32 37 L26.5 29 Z"
          fill="#08090c"
          stroke="#c6f432"
          strokeWidth="1.2"
        />

        {/* Photovoltaic Precision Louver Cuts on Right Solar Wing */}
        <line
          x1="39"
          y1="22.5"
          x2="45.5"
          y2="22.5"
          stroke="#08090c"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="36.5"
          y1="28"
          x2="43"
          y2="28"
          stroke="#08090c"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="34"
          y1="33.5"
          x2="39.5"
          y2="33.5"
          stroke="#08090c"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Living Water Node */}
        <circle cx="32" cy="29" r="2.8" fill="#2a9dbd" />
        <circle cx="31.2" cy="28.2" r="1.1" fill="#ffffff" />
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
 * 2. CURSOR-PROXIMITY VARIABLE FONT INTERACTIVE WORDMARK
 * High-performance, zero-lag character width/weight modulation on mousemove.
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
    let isPending = false;
    let isPointerActive = false;

    // Cache character bounding centers to avoid layout thrashing
    let cachedCenters: { x: number; y: number }[] = [];
    let lastCachedTime = 0;

    const updateTypography = () => {
      isPending = false;
      if (!isPointerActive) return;

      const now = performance.now();
      if (cachedCenters.length === 0 || now - lastCachedTime > 800) {
        cachedCenters = charRefs.current.map((el) => {
          if (!el) return { x: -9999, y: -9999 };
          const rect = el.getBoundingClientRect();
          return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        });
        lastCachedTime = now;
      }

      const radius = 300;
      for (let i = 0; i < charRefs.current.length; i++) {
        const el = charRefs.current[i];
        const center = cachedCenters[i];
        if (!el || !center) continue;

        const dist = Math.hypot(mouseX - center.x, mouseY - center.y);
        if (dist < radius) {
          const t = 1 - dist / radius;
          const wght = Math.round(900 - t * 560);
          const wdth = Math.round(62 + t * 26);
          el.style.fontVariationSettings = `"wdth" ${wdth}, "wght" ${wght}`;
        } else {
          el.style.fontVariationSettings = `"wdth" 62, "wght" 900`;
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || e.pointerType === "touch") {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isPointerActive = true;
        if (!isPending) {
          isPending = true;
          rafId = requestAnimationFrame(updateTypography);
        }
      }
    };

    const onPointerLeave = () => {
      isPointerActive = false;
      for (const el of charRefs.current) {
        if (el) {
          el.style.fontVariationSettings = `"wdth" 62, "wght" 900`;
        }
      }
    };

    const node = containerRef.current;
    if (node) {
      node.addEventListener("pointermove", onPointerMove, { passive: true });
      node.addEventListener("pointerleave", onPointerLeave, { passive: true });
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (node) {
        node.removeEventListener("pointermove", onPointerMove);
        node.removeEventListener("pointerleave", onPointerLeave);
      }
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
 * 3. VERDARA MINIMALIST DRAGGABLE PILL BADGE
 * Clean, modern architectural badge with beautiful radiant colors, zero dots, and zero idle CPU overhead.
 */
export interface DovvHoloStickerProps {
  label: string;
  sublabel?: string;
  categoryTag?: string;
  variant?: "orange" | "lime" | "gold";
  rotationDeg?: number;
  className?: string;
}

export function DovvHoloSticker({
  label,
  sublabel,
  variant = "lime",
  rotationDeg = 0,
  className = "",
}: DovvHoloStickerProps) {
  const chipRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, origX: 0, origY: 0 });

  const variantStyles = {
    orange: {
      card: "border-orange-500/40 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent shadow-[0_8px_24px_-4px_rgba(249,115,22,0.25)] dark:border-orange-400/50 dark:from-orange-500/25 dark:via-amber-500/15 dark:shadow-[0_10px_30px_-6px_rgba(249,115,22,0.35)] hover:border-orange-400/80",
      label: "text-neutral-900 dark:text-neutral-100",
      sublabel: "text-orange-700 dark:text-orange-300 font-semibold",
    },
    lime: {
      card: "border-[#c6f432]/60 bg-gradient-to-br from-[#c6f432]/20 via-[#10b981]/12 to-transparent shadow-[0_8px_24px_-4px_rgba(198,244,50,0.28)] dark:border-[#c6f432]/60 dark:from-[#c6f432]/25 dark:via-emerald-500/15 dark:shadow-[0_10px_30px_-6px_rgba(198,244,50,0.4)] hover:border-[#c6f432]",
      label: "text-neutral-900 dark:text-neutral-100",
      sublabel: "text-emerald-700 dark:text-[#c6f432] font-semibold",
    },
    gold: {
      card: "border-sky-400/50 bg-gradient-to-br from-sky-400/18 via-indigo-500/12 to-transparent shadow-[0_8px_24px_-4px_rgba(14,165,233,0.25)] dark:border-sky-400/50 dark:from-sky-500/25 dark:via-cyan-500/15 dark:shadow-[0_10px_30px_-6px_rgba(14,165,233,0.35)] hover:border-sky-400/80",
      label: "text-neutral-900 dark:text-neutral-100",
      sublabel: "text-sky-700 dark:text-cyan-300 font-semibold",
    },
  }[variant];

  return (
    <div
      ref={chipRef}
      onPointerDown={(e) => {
        if (e.button !== 0 && e.pointerType === "mouse") return;
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // Pointer capture fallback
        }
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
      onPointerUp={(e) => {
        setIsDragging(false);
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {}
      }}
      onPointerCancel={(e) => {
        setIsDragging(false);
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {}
      }}
      style={{
        transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${rotationDeg}deg)`,
        willChange: "transform",
      }}
      className={`group select-none cursor-grab active:cursor-grabbing transition-[box-shadow,transform] duration-150 ${
        isDragging ? "scale-[1.04] shadow-2xl z-50 !cursor-grabbing" : ""
      } ${className}`}
    >
      <div
        className={`flex flex-col rounded-2xl border px-4 py-2.5 text-left backdrop-blur-xl transition-all duration-200 bg-white/92 dark:bg-[#0c0d12]/92 ${variantStyles.card}`}
      >
        <span className={`font-sans text-xs sm:text-[13px] font-bold tracking-tight whitespace-nowrap ${variantStyles.label}`}>
          {label}
        </span>
        {sublabel && (
          <span className={`mt-0.5 font-mono text-[10px] sm:text-[11px] whitespace-nowrap ${variantStyles.sublabel}`}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

export const SpatialHudChip = DovvHoloSticker;

/**
 * 4. TOWNHOUSE.DEV ANIMATED CHAPTER SCROLL RAIL (`data-testid="scene-rail"`)
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

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      setScrollPct(
        Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100)))
      );

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
      smoothScrollTo(el);
    }
  };

  const isHero = activeIndex === 0;
  const movingDown = activeIndex >= prevIndex;
  const pillTop = bounds?.top ?? 0;
  const pillHeight = Math.max(32, (bounds?.bottom ?? 32) - pillTop);
  const dotTop = pillTop + pillHeight / 2 - 4;

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent"
      >
        <div
          style={{ width: `${scrollPct}%` }}
          className="h-full bg-gradient-to-r from-[#1e9e5a] via-[#c6f432] to-[#2a9dbd] transition-[width] duration-150 ease-out"
        />
      </div>

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
                  isLight ? "bg-[#111111]" : "bg-[#c6f432]"
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
 * 5. COMPACT WORLD COUNTRY & CITY POPOVER PICKER (<CompactWorldCityPicker />)
 * Small, clean pill trigger that opens a compact floating dropdown popover (`w-[340px] sm:w-[390px]`).
 * Supports instant live search across 195+ countries (Open-Meteo Geocoding API) + 28 curated cities
 * without taking up vertical page space.
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

export function CompactWorldCityPicker({
  isLight,
  isId,
  variant = "header",
  align = "left",
}: {
  isLight: boolean;
  isId: boolean;
  variant?: "header" | "hero";
  align?: "left" | "center" | "right";
}) {
  const {
    geo,
    housingCalc,
    teleportToCity,
    setCustomCoordinates,
  } = useVerdaraStore();

  const [open, setOpen] = useState(false);
  const [regionFilter, setRegionFilter] = useState<
    "all" | WorldCityEntry["continent"]
  >("all");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodingHit[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleLiveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query.trim()
        )}&count=6&language=${isId ? "id" : "en"}&format=json`
      );
      const data = await res.json();
      if (data?.results && data.results.length > 0) {
        setSearchResults(data.results);
      } else {
        setSearchResults([]);
        setSearchError(
          isId ? "Kota tidak ditemukan." : "No matching city found."
        );
      }
    } catch {
      setSearchError(
        isId ? "Gagal mencari kota." : "Search unavailable right now."
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
    setOpen(false);
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
    setOpen(false);
  };

  const filteredCatalog =
    regionFilter === "all"
      ? WORLD_CITY_CATALOG
      : WORLD_CITY_CATALOG.filter((c) => c.continent === regionFilter);

  const alignClass =
    align === "center"
      ? "sm:left-1/2 sm:-translate-x-1/2"
      : align === "right"
      ? "sm:right-0"
      : "sm:left-0";

  return (
    <div ref={wrapperRef} className="relative inline-block text-left">
      {variant === "hero" ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={`zeggo-btn group inline-flex min-h-[38px] sm:min-h-[42px] max-w-[92vw] cursor-pointer items-center gap-2 rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition hover:-translate-y-0.5 ${
            isLight
              ? "bg-white text-[#111] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_6px_20px_-8px_rgba(0,0,0,0.22)]"
              : "bg-[#15171b] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_6px_20px_-8px_rgba(0,0,0,0.6)]"
          }`}
        >
          <span className="dovv-pill-dot">
            <span />
          </span>
          <span className="truncate font-semibold">
            {geo.city} ({geo.countryCode} · {geo.koppen.code})
          </span>
          <span className="shrink-0 font-mono text-[11px] sm:text-xs text-[#1e9e5a]">
            {housingCalc.solar.kwp} kWp
          </span>
          <span className="hidden h-3.5 w-[1px] bg-current opacity-20 sm:inline-block" />
          <span className="text-[11px] sm:text-xs opacity-75 font-mono">
            v
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={`inline-flex min-h-[34px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-semibold transition ${
            isLight
              ? "border-black/[0.08] bg-black/[0.03] text-[#15803d] hover:bg-black/[0.06] hover:border-black/15"
              : "border-white/[0.08] bg-white/[0.04] text-[#c6f432] hover:bg-white/[0.08] hover:border-white/15"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isLight ? "bg-[#15803d]" : "bg-[#c6f432]"
            }`}
          />
          <span>{isId ? "195+ Negara" : "195+ Countries"}</span>
          <span aria-hidden="true" className="opacity-60 font-mono text-[10px]">
            {open ? "^" : "v"}
          </span>
        </button>
      )}

      {open && (
        <div
          className={`fixed inset-x-3 top-16 z-50 rounded-2xl border p-3.5 shadow-2xl sm:absolute sm:inset-x-auto sm:top-full sm:mt-2 sm:w-[380px] ${alignClass} ${
            isLight
              ? "border-black/10 bg-[#fbfbf9] text-[#0a0a0c] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.14)]"
              : "border-white/10 bg-[#101217] text-[#f4f3ee] shadow-[0_24px_50px_-15px_rgba(0,0,0,0.65)]"
          }`}
        >
          {/* Compact Header */}
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="h-2 w-2 rounded-full bg-[#1e9e5a]" />
              <span className="font-semibold">
                {geo.city} ({geo.countryCode} · {geo.koppen.code})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-current/10 font-mono text-xs opacity-75 hover:opacity-100"
              aria-label="Close city picker"
            >
              x
            </button>
          </div>

          {/* Compact Search Input */}
          <form onSubmit={handleLiveSearch} className="flex gap-1.5">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                isId
                  ? "Ketik kota/negara (mis. Surabaya, Paris)..."
                  : "Search any city or country..."
              }
              className={`h-9 flex-1 rounded-xl border px-3 text-xs focus:outline-none ${
                isLight
                  ? "border-black/15 bg-[#f5f5f3] text-[#111] placeholder-[#666]"
                  : "border-white/15 bg-[#08090b] text-white placeholder-[#888]"
              }`}
            />
            <button
              type="submit"
              disabled={isSearching}
              className="h-9 shrink-0 cursor-pointer rounded-xl bg-[#080808] px-3 font-mono text-[11px] font-semibold text-[#c6f432] transition hover:bg-[#1e1e1e] disabled:opacity-50"
            >
              {isSearching ? "..." : isId ? "Cari" : "Go"}
            </button>
          </form>

          {searchError && (
            <p className="mt-1.5 text-[11px] text-[#e5484d]">{searchError}</p>
          )}

          {/* Live Geocoding Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-[140px] space-y-1 overflow-y-auto rounded-xl bg-[#080808] p-2 text-white">
              {searchResults.map((hit) => (
                <button
                  key={hit.id}
                  type="button"
                  onClick={() => selectGeocodedCity(hit)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition hover:bg-white/10"
                >
                  <span className="truncate font-medium">
                    {hit.name}
                    {hit.admin1 ? `, ${hit.admin1}` : ""}
                  </span>
                  <span className="ml-2 shrink-0 rounded bg-[#c6f432]/20 px-1.5 py-0.5 font-mono text-[10px] text-[#c6f432]">
                    {hit.country_code}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Mini Region Filter Pills (Drag-Slidable Horizontally) */}
          <div className="country-pill-rail mt-2.5 flex flex-nowrap items-center gap-1 overflow-x-auto pb-1">
            {(
              [
                { id: "all", labelEn: "All", labelId: "Semua" },
                { id: "indonesia", labelEn: "ID", labelId: "ID" },
                { id: "asia_pacific", labelEn: "Asia", labelId: "Asia" },
                { id: "europe", labelEn: "EU", labelId: "Eropa" },
                { id: "americas", labelEn: "Americas", labelId: "Amerika" },
                { id: "mena_africa", labelEn: "MENA/AF", labelId: "MENA/AF" },
              ] as const
            ).map((tab) => {
              const active = regionFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRegionFilter(tab.id)}
                  className={`shrink-0 whitespace-nowrap cursor-pointer rounded-lg px-2.5 py-1 font-mono text-[10px] font-medium transition ${
                    active
                      ? "bg-[#080808] font-bold text-[#c6f432]"
                      : isLight
                      ? "bg-[#f2f2ef] text-[#4b4b48] hover:bg-[#e5e5e0]"
                      : "bg-white/8 text-[#aaa9ad] hover:bg-white/15"
                  }`}
                >
                  {isId ? tab.labelId : tab.labelEn}
                </button>
              );
            })}
          </div>

          {/* Compact Scrollable 2-Column City List */}
          <div className="mt-2 grid max-h-[188px] grid-cols-2 gap-1.5 overflow-y-auto pr-0.5">
            {filteredCatalog.map((entry) => {
              const isCurrent =
                Math.abs(geo.lat - entry.lat) < 0.25 &&
                Math.abs(geo.lng - entry.lng) < 0.25;
              return (
                <button
                  key={entry.slug}
                  type="button"
                  onClick={() => selectCatalogCity(entry)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-2.5 py-1.5 text-left text-xs transition ${
                    isCurrent
                      ? "border-[#1e9e5a] bg-[#080808] font-semibold text-white"
                      : isLight
                      ? "border-black/8 bg-[#f8f8f6] text-[#111] hover:border-black/25 hover:bg-white"
                      : "border-white/8 bg-[#181b20] text-[#e2e1dc] hover:border-[#c6f432]/40"
                  }`}
                >
                  <span className="truncate">{entry.city}</span>
                  <span
                    className={`ml-1.5 shrink-0 font-mono text-[10px] ${
                      isCurrent ? "text-[#c6f432]" : "opacity-60"
                    }`}
                  >
                    {entry.countryCode}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 6. COMPACT INLINE WORLD CITY BAR (<WorldCityExplorer />)
 * Used inside `/radar` modal or inline strip. Keeps a low profile (`max-h-[180px]` chip list)
 * so it never dominates the page.
 */
export function WorldCityExplorer({
  isLight,
  isId,
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

  const handleLiveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query.trim()
        )}&count=6&language=${isId ? "id" : "en"}&format=json`
      );
      const data = await res.json();
      setSearchResults(data?.results ?? []);
    } catch {
      setSearchResults([]);
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

  return (
    <div
      className={`rounded-2xl border p-4 ${
        isLight
          ? "border-black/10 bg-white shadow-sm"
          : "border-white/10 bg-[#121418]"
      }`}
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="country-pill-rail flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: "all", labelEn: "All (28)", labelId: "Semua (28)" },
              { id: "indonesia", labelEn: "Indonesia", labelId: "Indonesia" },
              { id: "asia_pacific", labelEn: "Asia-Pac", labelId: "Asia-Pasifik" },
              { id: "europe", labelEn: "Europe", labelId: "Eropa" },
              { id: "americas", labelEn: "Americas", labelId: "Amerika" },
              { id: "mena_africa", labelEn: "MENA & Africa", labelId: "Timteng & Afrika" },
            ] as const
          ).map((tab) => {
            const active = regionFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRegionFilter(tab.id)}
                className={`min-h-[32px] shrink-0 whitespace-nowrap cursor-pointer rounded-full px-3 py-1 font-mono text-[11px] font-medium transition ${
                  active
                    ? "bg-[#080808] font-semibold text-[#c6f432]"
                    : isLight
                    ? "bg-[#f3f3f0] text-[#4b4b48] hover:bg-[#e5e5e0]"
                    : "bg-[#1a1d22] text-[#c9c7c0] hover:bg-[#242830]"
                }`}
              >
                {isId ? tab.labelId : tab.labelEn}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleLiveSearch} className="flex gap-1.5 sm:w-72">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isId ? "Cari kota/negara..." : "Search city or country..."
            }
            className={`h-9 flex-1 rounded-full border px-3.5 text-xs focus:outline-none ${
              isLight
                ? "border-black/15 bg-[#f5f5f3] text-[#111]"
                : "border-white/15 bg-[#0b0c0e] text-white"
            }`}
          />
          <button
            type="submit"
            disabled={isSearching}
            className="h-9 shrink-0 cursor-pointer rounded-full bg-[#080808] px-3.5 font-mono text-xs font-semibold text-[#c6f432]"
          >
            {isSearching ? "..." : isId ? "Cari" : "Find"}
          </button>
        </form>
      </div>

      {searchResults.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5 rounded-xl bg-[#080808] p-2.5">
          {searchResults.map((hit) => (
            <button
              key={hit.id}
              type="button"
              onClick={() => selectGeocodedCity(hit)}
              className="cursor-pointer rounded-full bg-[#181a20] px-3 py-1 text-xs text-white hover:bg-[#c6f432] hover:text-[#080808]"
            >
              {hit.name} ({hit.country_code})
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 grid max-h-[168px] grid-cols-2 gap-1.5 overflow-y-auto sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {filteredCatalog.map((entry) => {
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
              className={`flex cursor-pointer flex-col justify-between rounded-xl border p-2.5 text-left transition ${
                isCurrent
                  ? "border-[#1e9e5a] bg-[#080808] text-white"
                  : isLight
                  ? "border-black/10 bg-[#f8f8f6] text-[#111] hover:bg-white"
                  : "border-white/10 bg-[#17191e] text-white hover:border-[#c6f432]/40"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-xs font-semibold">
                  {entry.city}
                </span>
                <span className="shrink-0 font-mono text-[10px] opacity-70">
                  {entry.countryCode}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between font-mono text-[10px] opacity-80">
                <span className="text-[#1e9e5a]">{cityCalc.solar.kwp}kWp</span>
                <span>{formatTemp(cityGeo.currentTempC, units)}</span>
                <span>
                  {formatCurrency(
                    cityCalc.solar.savingsYear,
                    cityCalc.solar.currency,
                    locale
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 7. VERDARA ARCHITECTURAL COMMAND DOCK (<VerdaraBottomDock />)
 * Clean, well-structured floating bottom navigation dock with:
 * - Numbered structural index badges (01..09)
 * - Direct links to Docs (/docs) and FAQ (/faq)
 * - Automatic Auth Gate routing: if unauthenticated and clicking a protected studio route,
 *   routes cleanly to `/login?next=<route>`
 * - Collapsible minimize toggle so it never blocks page reading
 */
export function VerdaraBottomDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, isAuthenticated, displayName, level } = useVerdaraStore();
  const [minimized, setMinimized] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const isId = locale === "id";

  useEffect(() => {
    if (minimized || !navRef.current) return;
    const activeEl = navRef.current.querySelector<HTMLElement>(
      '[data-dock-active="true"]'
    );
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [pathname, minimized]);

  // Authenticated workspace suite for verified residents
  const authenticatedItems = [
    {
      code: "01",
      href: "/",
      labelEn: "Home",
      labelId: "Home",
    },
    {
      code: "02",
      href: "/dashboard",
      labelEn: "Living Town",
      labelId: "Kota 3D",
    },
    {
      code: "03",
      href: "/lens",
      labelEn: "SAM 3.1 Lens",
      labelId: "Lensa SAM",
    },
    {
      code: "04",
      href: "/radar",
      labelEn: "3D Radar",
      labelId: "Radar 3D",
    },
    {
      code: "05",
      href: "/council",
      labelEn: "AI Council",
      labelId: "Dewan AI",
    },
    {
      code: "06",
      href: "/academy",
      labelEn: "Field Proofs",
      labelId: "Bukti Aksi",
    },
    {
      code: "07",
      href: "/docs",
      labelEn: "Docs",
      labelId: "Dokumen",
    },
    {
      code: "08",
      href: "/faq",
      labelEn: "FAQ",
      labelId: "Tanya Jawab",
    },
    {
      code: "09",
      href: "/settings",
      labelEn: "Shield",
      labelId: "Perisai",
    },
  ];

  // Public items for unauthenticated guests (only accessible pages, no locked noise)
  const unauthenticatedItems = [
    {
      code: "01",
      href: "/",
      labelEn: "Home",
      labelId: "Home",
    },
    {
      code: "02",
      href: "/docs",
      labelEn: "Docs",
      labelId: "Dokumen",
    },
    {
      code: "03",
      href: "/faq",
      labelEn: "FAQ",
      labelId: "Tanya Jawab",
    },
  ];

  const dockItems = isAuthenticated ? authenticatedItems : unauthenticatedItems;

  if (minimized) {
    return (
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className={`flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs font-semibold shadow-xl backdrop-blur-xl transition ${
            isAuthenticated
              ? "border border-[#c6f432]/40 bg-[#08090c]/94 text-[#c6f432] hover:border-[#c6f432]"
              : "border border-white/15 bg-[#08090c]/92 text-white hover:border-[#c6f432]/60"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isAuthenticated ? "bg-[#10b981] animate-pulse" : "bg-[#c6f432]"
            }`}
          />
          <span>
            {isAuthenticated
              ? (isId
                  ? `Buka Command Deck (Lv.${level}) ^`
                  : `Expand Command Deck (Lv.${level}) ^`)
              : (isId ? "Buka Menu Navigasi ^" : "Expand Menu ^")}
          </span>
        </button>
      </div>
    );
  }

  return (
    <nav
      ref={navRef}
      data-lenis-prevent
      aria-label={
        isId
          ? "Navigasi Utama (Geser Kiri/Kanan)"
          : "Primary Navigation (Drag to Slide)"
      }
      className={`dovv-bottom-dock country-pill-rail max-w-[96vw] overflow-x-auto transition-all duration-300 ${
        isAuthenticated
          ? "border border-[#c6f432]/30 bg-[#07080b]/94 shadow-[inset_0_0_0_1px_rgba(198,244,50,0.18),0_14px_42px_-6px_rgba(0,0,0,0.85),0_0_24px_rgba(198,244,50,0.12)]"
          : "border border-white/12 bg-[#08090c]/92 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),0_12px_36px_-8px_rgba(0,0,0,0.7)]"
      }`}
    >
      {/* Authenticated Resident Status Pill (Dashboard HUD Vibe) */}
      {isAuthenticated && (
        <>
          <Link
            href="/dashboard"
            draggable={false}
            title={
              isId
                ? `Status Penduduk Aktif: Lv.${level} · Buka Kota 3D`
                : `Active Resident Status: Lv.${level} · Open 3D Town`
            }
            className="group flex min-h-[34px] shrink-0 items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1 font-mono text-xs transition hover:border-[#c6f432]/50 hover:bg-[#c6f432]/10"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10b981]" />
            </span>
            <span className="font-bold text-[#c6f432]">Lv.{level}</span>
            <span className="hidden sm:inline max-w-[90px] truncate text-[#d4d4d8] group-hover:text-white">
              {displayName?.split(" ")[0] || "Resident"}
            </span>
          </Link>
          <span className="mx-0.5 h-4 w-[1px] shrink-0 bg-white/15" />
        </>
      )}

      {/* Dock Navigation Items */}
      {dockItems.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            draggable={false}
            data-dock-active={active ? "true" : undefined}
            className={`zeggo-btn flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition ${
              active
                ? "bg-[#c6f432] font-semibold text-[#080808] shadow-sm"
                : "text-[#e5e5e0] hover:bg-white/10 hover:text-white"
            }`}
          >
            <span
              className={`font-mono text-[10px] ${
                active ? "text-[#080808]/75 font-bold" : "text-[#c6f432]/75"
              }`}
            >
              {item.code}
            </span>
            <ZeggoRollText text={isId ? item.labelId : item.labelEn} />
          </Link>
        );
      })}

      {/* Unauthenticated Sign In CTA Button */}
      {!isAuthenticated && (
        <>
          <span className="mx-0.5 h-4 w-[1px] shrink-0 bg-white/15" />
          <Link
            href="/login"
            draggable={false}
            className="zeggo-btn flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full bg-[#c6f432] px-3.5 py-1 text-xs font-bold text-[#080808] shadow-sm transition hover:bg-[#d8ff43] hover:scale-[1.02]"
          >
            <span className="font-mono text-[10px] font-extrabold opacity-75">
              *
            </span>
            <span>{isId ? "Masuk →" : "Sign In →"}</span>
          </Link>
        </>
      )}

      <span className="mx-0.5 h-4 w-[1px] shrink-0 bg-white/15" />

      <button
        type="button"
        onClick={() => setMinimized(true)}
        title={isId ? "Sembunyikan dock" : "Minimize dock"}
        aria-label={isId ? "Sembunyikan dock" : "Minimize dock"}
        className="flex h-[34px] w-[34px] shrink-0 cursor-pointer items-center justify-center rounded-full text-white/65 transition hover:bg-white/10 hover:text-white font-mono text-xs"
      >
        v
      </button>
    </nav>
  );
}
