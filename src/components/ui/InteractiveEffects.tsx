"use client";

import React, { useEffect, useRef, useState } from "react";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import {
  WORLD_CITY_CATALOG,
  resolveWorldCityGeoContext,
  type WorldCityEntry,
} from "@/lib/science/presets";
import { calculateHousingFootprint } from "@/lib/science/calculator";
import { formatCurrency, formatTemp } from "@/lib/science/units";

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
            id="vd-emerald"
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
            id="vd-lime"
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
            id="vd-bevel-l"
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
            id="vd-bevel-r"
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
          fill="url(#vd-emerald)"
        />
        {/* Left Chamfer Bevel */}
        <path d="M15 17 L19 13 L30 13 L26 17 Z" fill="url(#vd-bevel-l)" />

        {/* Right Cantilever Wing: Solar Kinetic (Lime) */}
        <path
          d="M49 17 L38 17 L32 35.5 L32 49 L49 17 Z"
          fill="url(#vd-lime)"
        />
        {/* Right Chamfer Bevel */}
        <path d="M49 17 L45 13 L34 13 L38 17 Z" fill="url(#vd-bevel-r)" />

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
      ? "left-1/2 -translate-x-1/2"
      : align === "right"
      ? "right-0"
      : "left-0";

  return (
    <div ref={wrapperRef} className="relative inline-block text-left">
      {variant === "hero" ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={`zeggo-btn group inline-flex min-h-[42px] cursor-pointer items-center gap-2.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition hover:-translate-y-0.5 ${
            isLight
              ? "bg-white text-[#111] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_6px_20px_-8px_rgba(0,0,0,0.22)]"
              : "bg-[#15171b] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_6px_20px_-8px_rgba(0,0,0,0.6)]"
          }`}
        >
          <span className="dovv-pill-dot">
            <span />
          </span>
          <span className="font-semibold">
            {geo.city} ({geo.countryCode} · {geo.koppen.code})
          </span>
          <span className="font-mono text-xs text-[#1e9e5a]">
            {housingCalc.solar.kwp} kWp
          </span>
          <span className="hidden h-3.5 w-[1px] bg-current opacity-20 sm:inline-block" />
          <span className="hidden text-xs opacity-75 sm:inline">
            {isId ? "Pilih Negara / Kota ▾" : "Switch Country / City ▾"}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="inline-flex min-h-[34px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] font-semibold text-[#c6f432] transition hover:bg-white/20"
        >
          <span>{isId ? "195+ Negara" : "195+ Countries"}</span>
          <span aria-hidden="true">{open ? "▴" : "▾"}</span>
        </button>
      )}

      {open && (
        <div
          className={`absolute top-full z-50 mt-2 w-[min(92vw,380px)] rounded-2xl border p-3.5 shadow-2xl backdrop-blur-xl ${alignClass} ${
            isLight
              ? "border-black/12 bg-white/98 text-[#111]"
              : "border-white/15 bg-[#111318]/98 text-white"
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
              ×
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

          {/* Mini Region Filter Pills */}
          <div className="mt-2.5 flex flex-wrap gap-1">
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
                  className={`cursor-pointer rounded-lg px-2 py-1 font-mono text-[10px] font-medium transition ${
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
        <div className="flex flex-wrap items-center gap-1.5">
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
                className={`min-h-[32px] cursor-pointer rounded-full px-3 py-1 font-mono text-[11px] font-medium transition ${
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
