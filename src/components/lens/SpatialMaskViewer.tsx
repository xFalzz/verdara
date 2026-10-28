"use client";

import React, { useState } from "react";
import type { GoldenLensSample, GoldenSampleObject } from "@/lib/meta/golden-cache";
import { formatCurrency } from "@/lib/science/units";

export interface SpatialMaskViewerProps {
  sample: GoldenLensSample;
  customImageUrl: string | null;
  selectedObjectId: string | null;
  onSelectObject: (obj: GoldenSampleObject) => void;
  xrayLevel: number;
  retrofitCurtainPct: number;
  onRetrofitCurtainChange?: (pct: number) => void;
  showRetrofitComparison: boolean;
  objectValuations?: Record<
    string,
    { valueMin: number; valueMax: number; currency: string; co2eAvoidedG: number }
  >;
  locale: "en" | "id";
}

function getPolygonColor(materialCode: string): {
  stroke: string;
  fill: string;
  badgeBg: string;
} {
  switch (materialCode) {
    case "EWASTE":
    case "BATTERY":
      return {
        stroke: "#F97316",
        fill: "rgba(249, 115, 22, 0.28)",
        badgeBg: "bg-orange-500 text-slate-950",
      };
    case "ORGANIC":
      return {
        stroke: "#84CC16",
        fill: "rgba(132, 204, 22, 0.26)",
        badgeBg: "bg-lime-400 text-slate-950",
      };
    case "OTHER":
      return {
        stroke: "#F43F5E",
        fill: "rgba(244, 63, 94, 0.28)",
        badgeBg: "bg-rose-500 text-white",
      };
    default:
      return {
        stroke: "#10B981",
        fill: "rgba(16, 185, 129, 0.26)",
        badgeBg: "bg-emerald-400 text-slate-950",
      };
  }
}

export default function SpatialMaskViewer({
  sample,
  customImageUrl,
  selectedObjectId,
  onSelectObject,
  xrayLevel,
  retrofitCurtainPct,
  showRetrofitComparison,
  objectValuations,
  locale,
}: SpatialMaskViewerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isId = locale === "id";

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[#1D3328] bg-[#070D0A] select-none">
      {customImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={customImageUrl}
          alt="Uploaded specimen"
          className="h-full w-full object-cover"
        />
      ) : (
        <SpecimenBackdropSvg
          sceneType={sample.svgSceneType}
          isAfterRetrofit={false}
        />
      )}

      {showRetrofitComparison && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{
            clipPath: `inset(0 0 0 ${retrofitCurtainPct}%)`,
          }}
        >
          <SpecimenBackdropSvg
            sceneType={sample.svgSceneType}
            isAfterRetrofit={true}
          />
          <div className="absolute top-3 right-3 rounded-lg border border-[#A3E635]/60 bg-[#070D0A]/90 px-3 py-1 font-mono text-xs font-bold text-[#A3E635] shadow-lg">
            AFTER: Meta Muse Image / Wonder Eco-Retrofit
          </div>
        </div>
      )}

      {showRetrofitComparison && (
        <div
          className="pointer-events-none absolute inset-y-0 z-20 w-0.5 bg-[#A3E635] shadow-[0_0_16px_#A3E635]"
          style={{ left: `${retrofitCurtainPct}%` }}
        >
          <div className="absolute top-1/2 -left-4 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#A3E635] bg-[#070D0A] font-mono text-xs font-bold text-[#A3E635] shadow-lg">
            &lt;&gt;
          </div>
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-150"
        style={{
          opacity: xrayLevel / 100,
          backgroundImage:
            "radial-gradient(circle at center, rgba(16, 185, 129, 0.14) 0%, rgba(4, 12, 8, 0.92) 100%), linear-gradient(to right, rgba(163, 230, 53, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(163, 230, 53, 0.14) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 32px 32px, 32px 32px",
        }}
      />

      <svg
        viewBox="0 0 1000 625"
        preserveAspectRatio="none"
        className="absolute inset-0 z-10 h-full w-full"
      >
        {sample.objects.map((obj, idx) => {
          const isSelected = obj.id === selectedObjectId;
          const isHovered = obj.id === hoveredId;
          const colors = getPolygonColor(obj.materialCode);
          const pts = obj.mask.polygon
            .map(([x, y]) => `${Math.round(x * 1000)},${Math.round(y * 625)}`)
            .join(" ");
          const [bx, by, bw, bh] = obj.mask.bbox;

          return (
            <g
              key={obj.id}
              className="cursor-pointer transition-all"
              onClick={() => onSelectObject(obj)}
              onMouseEnter={() => setHoveredId(obj.id)}
              onMouseLeave={() => setHoveredId(null)}
              tabIndex={0}
              role="button"
              aria-label={`${obj.concept} (${obj.materialCode})`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectObject(obj);
                }
              }}
            >
              <polygon
                points={pts}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={isSelected || isHovered ? 4 : 2.5}
                strokeDasharray={isSelected ? "none" : "10 5"}
                fillOpacity={
                  isSelected
                    ? 0.48
                    : isHovered
                    ? 0.38
                    : 0.22 + (xrayLevel / 100) * 0.35
                }
              />

              {(isSelected || isHovered || xrayLevel > 30) && (
                <rect
                  x={bx * 1000}
                  y={by * 625}
                  width={bw * 1000}
                  height={bh * 625}
                  fill="none"
                  stroke={colors.stroke}
                  strokeWidth={1.2}
                  strokeDasharray="4 4"
                  opacity={0.75}
                />
              )}

              <circle
                cx={(bx + bw / 2) * 1000}
                cy={(by + bh / 2) * 625}
                r={14}
                fill="#070D0A"
                stroke={colors.stroke}
                strokeWidth={2.5}
              />
              <text
                x={(bx + bw / 2) * 1000}
                y={(by + bh / 2) * 625 + 4}
                textAnchor="middle"
                fill="#F2F7F4"
                fontSize="12"
                fontFamily="monospace"
                fontWeight="bold"
              >
                #{idx + 1}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-0 z-20">
        {sample.objects.map((obj, idx) => {
          const [bx, by] = obj.mask.bbox;
          const val = objectValuations?.[obj.id];
          const isSelected = obj.id === selectedObjectId;
          const colors = getPolygonColor(obj.materialCode);

          return (
            <button
              key={`badge-${obj.id}`}
              type="button"
              onClick={() => onSelectObject(obj)}
              style={{
                left: `${Math.min(82, Math.max(4, bx * 100))}%`,
                top: `${Math.min(88, Math.max(6, by * 100))}%`,
              }}
              className={`pointer-events-auto absolute flex items-center gap-1.5 rounded-lg border px-2 py-1 font-mono text-[11px] font-semibold shadow-lg backdrop-blur-md transition-transform ${
                isSelected
                  ? "scale-105 border-[#A3E635] bg-[#070D0A]/95 text-[#A3E635] ring-2 ring-[#A3E635]/50"
                  : "border-white/20 bg-[#070D0A]/85 text-[#F2F7F4] hover:scale-105"
              }`}
            >
              <span className={`rounded px-1 py-0.2 text-[10px] font-bold ${colors.badgeBg}`}>
                #{idx + 1} {obj.materialCode}
              </span>
              <span className="max-w-[130px] truncate">{obj.concept}</span>
              {val && val.valueMax > 0 && (
                <span className="text-amber-300">
                  +{formatCurrency(val.valueMax, val.currency, locale)}
                </span>
              )}
              <span className="text-[10px] text-[#A3BEB0]">
                {(obj.score * 100).toFixed(0)}%
              </span>
            </button>
          );
        })}
      </div>

      <div className="pointer-events-none absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
        <span className="rounded-lg border border-[#1D3328] bg-[#070D0A]/85 px-2.5 py-1 font-mono text-xs font-semibold text-[#A3E635] backdrop-blur-md">
          Meta SAM 3.1 Concept Masks ({sample.objects.length} {isId ? "Poligon" : "Polygons"})
        </span>
        {xrayLevel > 0 && (
          <span className="rounded-lg border border-[#1D3328] bg-[#070D0A]/85 px-2.5 py-1 font-mono text-xs text-cyan-300 backdrop-blur-md">
            X-RAY MESH: {xrayLevel}%
          </span>
        )}
      </div>
    </div>
  );
}

function SpecimenBackdropSvg({
  sceneType,
  isAfterRetrofit,
}: {
  sceneType: GoldenLensSample["svgSceneType"];
  isAfterRetrofit: boolean;
}) {
  if (sceneType === "patio_retrofit") {
    return (
      <svg
        viewBox="0 0 1000 625"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isAfterRetrofit ? "#064E3B" : "#1E293B"} />
            <stop offset="100%" stopColor={isAfterRetrofit ? "#0F766E" : "#334155"} />
          </linearGradient>
        </defs>
        <rect width="1000" height="625" fill="url(#skyGrad)" />

        <polygon
          points="180,50 820,50 920,250 80,250"
          fill={isAfterRetrofit ? "#0F172A" : "#475569"}
          stroke="#94A3B8"
          strokeWidth="3"
        />

        {isAfterRetrofit && (
          <g>
            {[200, 340, 480, 620, 740].map((x, i) => (
              <rect
                key={`pv-after-${i}`}
                x={x}
                y={85}
                width={110}
                height={135}
                rx={6}
                fill="#1E3A8A"
                stroke="#38BDF8"
                strokeWidth="2.5"
              />
            ))}
          </g>
        )}

        <rect x="140" y="250" width="720" height="100" fill="#E2E8F0" />
        <rect x="240" y="268" width="140" height="65" fill="#0284C7" rx="4" />
        <rect x="620" y="268" width="140" height="65" fill="#0284C7" rx="4" />

        {isAfterRetrofit && (
          <g>
            <rect
              x="790"
              y="255"
              width="65"
              height="95"
              rx="12"
              fill="#0E7490"
              stroke="#22D3EE"
              strokeWidth="3"
            />
          </g>
        )}

        <polygon
          points="140,338 860,338 900,575 100,575"
          fill={isAfterRetrofit ? "#14532D" : "#64748B"}
        />

        {isAfterRetrofit && (
          <g>
            <ellipse cx="340" cy="465" rx="145" ry="68" fill="#15803D" />
            <circle cx="290" cy="445" r="45" fill="#4ADE80" />
            <circle cx="385" cy="455" r="52" fill="#22C55E" />
            <rect
              x="560"
              y="415"
              width="240"
              height="105"
              rx="12"
              fill="#78350F"
              stroke="#A3E635"
              strokeWidth="2.5"
            />
            <circle cx="620" cy="465" r="28" fill="#84CC16" />
            <circle cx="715" cy="465" r="28" fill="#4ADE80" />
          </g>
        )}
      </svg>
    );
  }

  if (sceneType === "ewaste_desk") {
    return (
      <svg viewBox="0 0 1000 625" preserveAspectRatio="none" className="h-full w-full">
        <rect width="1000" height="625" fill="#0C1713" />
        <rect x="60" y="80" width="880" height="480" rx="20" fill="#13251E" stroke="#1E3A2F" strokeWidth="4" />
        <rect x="125" y="155" width="430" height="315" rx="12" fill="#065F46" stroke="#10B981" strokeWidth="3" />
        <rect x="180" y="210" width="120" height="110" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
        <rect x="350" y="220" width="140" height="90" fill="#334155" stroke="#94A3B8" strokeWidth="2" />
        <rect x="620" y="225" width="240" height="225" rx="16" fill="#334155" stroke="#F97316" strokeWidth="4" />
        <rect x="650" y="265" width="180" height="60" rx="6" fill="#EA580C" />
      </svg>
    );
  }

  if (sceneType === "plant_canopy") {
    return (
      <svg viewBox="0 0 1000 625" preserveAspectRatio="none" className="h-full w-full">
        <rect width="1000" height="625" fill="#091912" />
        <polygon
          points="500,88 820,212 780,475 500,538 220,475 180,212"
          fill="#15803D"
          stroke="#4ADE80"
          strokeWidth="4"
        />
        <line x1="500" y1="88" x2="500" y2="538" stroke="#86EFAC" strokeWidth="5" />
        <polygon
          points="560,238 680,225 700,325 540,338"
          fill="#CA8A04"
          stroke="#F43F5E"
          strokeWidth="3"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 1000 625" preserveAspectRatio="none" className="h-full w-full">
      <rect width="1000" height="625" fill="#0B1913" />
      <rect x="40" y="420" width="920" height="165" rx="14" fill="#271C15" />
      <polygon
        points="140,138 190,138 230,212 230,475 100,475 100,212"
        fill="#0284C7"
        fillOpacity="0.55"
        stroke="#38BDF8"
        strokeWidth="3"
      />
      <rect
        x="285"
        y="238"
        width="135"
        height="242"
        rx="18"
        fill="#475569"
        stroke="#94A3B8"
        strokeWidth="3"
      />
      <polygon
        points="460,175 720,156 740,468 470,481"
        fill="#92400E"
        stroke="#F59E0B"
        strokeWidth="3"
      />
      <rect
        x="775"
        y="212"
        width="145"
        height="262"
        rx="20"
        fill="#0F766E"
        fillOpacity="0.6"
        stroke="#2DD4BF"
        strokeWidth="3"
      />
    </svg>
  );
}
