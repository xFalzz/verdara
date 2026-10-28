"use client";

import React, { useEffect, useRef, useState } from "react";

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
 * Replicates DOVV's `[data-weight-hover]` (`data-weight-rest="900" data-weight-near="250" data-radius="360"`)
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
      className={`dovv-wordmark select-none text-center ${className}`}
    >
      {lines.map((line, lIdx) => (
        <div key={lIdx} className="block whitespace-nowrap">
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
 * Replicates DOVV's `[data-holo]` SVG foil reflection & draggable peel physics
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

        {/* Die-cut white sticker border */}
        <use
          href={`#shape-${gradId}`}
          fill="#ffffff"
          stroke="#ffffff"
          strokeWidth="10"
          strokeLinejoin="round"
        />
        {/* Animated Holographic Foil */}
        <use href={`#shape-${gradId}`} fill={`url(#foil-${gradId})`} />
        {/* Moving Specular Shine */}
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
