"use client";

import React, { useRef, useState, useMemo, useLayoutEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Float,
  ContactShadows,
  Environment,
  Lightformer,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { IslandBiome } from "@/lib/science/koppen";

export interface EcoIslandProps {
  biome: IslandBiome;
  level: number;
  isNight: boolean;
  unlockedItems: string[];
  solarKwp: number;
  solarKwhYear: number;
  rainLitersYear: number;
  bioporeUnits: number;
  tciScore?: number;
  city?: string;
  koppenCode?: string;
  locale?: "en" | "id";
  compact?: boolean;
  hideHudOverlays?: boolean;
  simMode?: "run" | "break" | "heal";
}

export type CameraViewPreset =
  | "overview"
  | "solar"
  | "hydro"
  | "boulevard"
  | "rear";

interface TownPalette {
  skyDay: string;
  skyStorm: string;
  skyNight: string;
  plazaSlab: string;
  turf: string;
  subsoil: string;
  bedrock: string;
  wallPrimary: string;
  wallSecondary: string;
  wallAccent: string;
  roofPrimary: string;
  roofSecondary: string;
  pipeCopper: string;
  cisternWater: string;
  foliagePrimary: string;
  foliageSecondary: string;
}

const TOWN_PALETTES: Record<IslandBiome, TownPalette> = {
  mediterranean: {
    skyDay: "#EAE8E1",
    skyStorm: "#1B2430",
    skyNight: "#0A0E14",
    plazaSlab: "#DFDDD4",
    turf: "#537E4E",
    subsoil: "#8C6B4F",
    bedrock: "#3A3F47",
    wallPrimary: "#FBF9F5",
    wallSecondary: "#EFECE4",
    wallAccent: "#E6D5BF",
    roofPrimary: "#A8482B",
    roofSecondary: "#2B3544",
    pipeCopper: "#C9753D",
    cisternWater: "#1E9E5A",
    foliagePrimary: "#35633E",
    foliageSecondary: "#5E8C49",
  },
  temperate: {
    skyDay: "#E6EAE8",
    skyStorm: "#19222D",
    skyNight: "#0A0E14",
    plazaSlab: "#DCDFD9",
    turf: "#4B734B",
    subsoil: "#734D33",
    bedrock: "#36404E",
    wallPrimary: "#F8F9FA",
    wallSecondary: "#E9ECEF",
    wallAccent: "#DFE5C0",
    roofPrimary: "#283344",
    roofSecondary: "#742828",
    pipeCopper: "#C9753D",
    cisternWater: "#2A9DBD",
    foliagePrimary: "#2F5336",
    foliageSecondary: "#588863",
  },
  tropical: {
    skyDay: "#E6EFEA",
    skyStorm: "#162329",
    skyNight: "#09100E",
    plazaSlab: "#DCE3DD",
    turf: "#3B7E5B",
    subsoil: "#6B412F",
    bedrock: "#2D3742",
    wallPrimary: "#FAF9F5",
    wallSecondary: "#F1EFE7",
    wallAccent: "#DCEEE0",
    roofPrimary: "#8E3518",
    roofSecondary: "#23523C",
    pipeCopper: "#D87856",
    cisternWater: "#0D9488",
    foliagePrimary: "#24573F",
    foliageSecondary: "#3E996E",
  },
  arid: {
    skyDay: "#EFEAE1",
    skyStorm: "#28221E",
    skyNight: "#100E0C",
    plazaSlab: "#E6DEC8",
    turf: "#8C8456",
    subsoil: "#94653E",
    bedrock: "#46423D",
    wallPrimary: "#FDFBF7",
    wallSecondary: "#F3E9D2",
    wallAccent: "#EADBB0",
    roofPrimary: "#AD4318",
    roofSecondary: "#5E2E12",
    pipeCopper: "#C66B14",
    cisternWater: "#0284C7",
    foliagePrimary: "#537F18",
    foliageSecondary: "#6BA811",
  },
  continental: {
    skyDay: "#E5E9EC",
    skyStorm: "#18202B",
    skyNight: "#0A0D12",
    plazaSlab: "#D8DEE3",
    turf: "#446829",
    subsoil: "#5E4C41",
    bedrock: "#293342",
    wallPrimary: "#F8FAFC",
    wallSecondary: "#E2E8F0",
    wallAccent: "#D3DCE6",
    roofPrimary: "#202B3D",
    roofSecondary: "#7A2020",
    pipeCopper: "#C9753D",
    cisternWater: "#0284C7",
    foliagePrimary: "#265640",
    foliageSecondary: "#377B5B",
  },
  polar: {
    skyDay: "#E6EEF4",
    skyStorm: "#172130",
    skyNight: "#080C14",
    plazaSlab: "#E2E8F0",
    turf: "#9AD1F0",
    subsoil: "#546478",
    bedrock: "#1F2938",
    wallPrimary: "#FFFFFF",
    wallSecondary: "#E2E8F0",
    wallAccent: "#CBD5E1",
    roofPrimary: "#162036",
    roofSecondary: "#243E82",
    pipeCopper: "#E0961A",
    cisternWater: "#38BDF8",
    foliagePrimary: "#166861",
    foliageSecondary: "#1D988B",
  },
};

const CAMERA_PRESET_CONFIG: Record<
  CameraViewPreset,
  {
    pos: [number, number, number];
    target: [number, number, number];
    titleEn: string;
    titleId: string;
    detailEn: string;
    detailId: string;
  }
> = {
  overview: {
    pos: [7.4, 4.9, 7.4],
    target: [0, 0.25, 0.1],
    titleEn: "District Twin Overview",
    titleId: "Tampilan Utuh Distrik 3D",
    detailEn: "Full spatial view of CLT Solar Hub, Hydro Canal, Biopores & EV Street",
    detailId: "Tampilan menyeluruh Hub Surya CLT, Kanal Air, Biopori & Jalan EV",
  },
  solar: {
    pos: [2.5, 3.6, 3.4],
    target: [-0.25, 1.35, -0.45],
    titleEn: "Monocrystalline Solar Roof Array",
    titleId: "Atap Panel Surya Monokristalin",
    detailEn: "Close-up of bifacial PV modules, gutters, mounting rails & busbars",
    detailId: "Inspeksi dekat modul surya bifacial, talang air, rel & busbar",
  },
  hydro: {
    pos: [3.8, 2.55, 5.1],
    target: [0.85, 0.35, 1.65],
    titleEn: "Hydrological Cistern & Stone Canal",
    titleId: "Tangki Air Hujan & Kanal Batu",
    detailEn: "Inspect corrugated rainwater tank, copper pipes & rippling stone canal",
    detailId: "Inspeksi tangki panen hujan, pipa tembaga & kanal air batu",
  },
  boulevard: {
    pos: [-4.1, 2.25, 4.7],
    target: [-0.4, 0.3, 1.4],
    titleEn: "Autonomous EV Street & Geodesic Dome",
    titleId: "Koridor EV Otonom & Kubah Botani",
    detailEn: "Street-level view of autonomous EV shuttle, crosswalk & glass dome",
    detailId: "Tampilan koridor mobil listrik otonom, penyeberangan & kubah kaca",
  },
  rear: {
    pos: [-1.8, 4.1, -7.2],
    target: [0, 0.45, -0.9],
    titleEn: "North Ridge, Wind Turbines & Microgrid",
    titleId: "Sisi Belakang, Turbin Angin & Mikrogrid",
    detailEn: "360° rear view of North garden promenade, wind turbines & LiFePO4 substation",
    detailId: "Tampilan 360° sisi belakang, taman utara, turbin angin & gardu baterai",
  },
};

function CameraRigController({
  preset,
  controlsRef,
}: {
  preset: CameraViewPreset;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const basePos = useMemo(
    () => new THREE.Vector3(...CAMERA_PRESET_CONFIG[preset].pos),
    [preset]
  );
  const baseTarget = useMemo(
    () => new THREE.Vector3(...CAMERA_PRESET_CONFIG[preset].target),
    [preset]
  );
  const scaledPosRef = useRef(new THREE.Vector3());
  const scaledTargetRef = useRef(new THREE.Vector3());
  const lastPresetRef = useRef<CameraViewPreset>(preset);
  const lastAspectBucketRef = useRef<number>(-1);
  const transitionFramesRef = useRef<number>(40);

  if (lastPresetRef.current !== preset) {
    lastPresetRef.current = preset;
    transitionFramesRef.current = 55;
  }

  useFrame((state, delta) => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;

    const aspect = state.size.width / Math.max(1, state.size.height);
    const aspectBucket = Math.round(aspect * 10);
    if (lastAspectBucketRef.current !== aspectBucket) {
      lastAspectBucketRef.current = aspectBucket;
      transitionFramesRef.current = Math.max(transitionFramesRef.current, 35);
    }

    // Responsive camera distance & vertical framing for mobile/tablet portrait and narrow panes
    const distScale =
      aspect < 0.75
        ? 1.38
        : aspect < 1.05
        ? 1.22
        : aspect < 1.35
        ? 1.1
        : 1.0;
    const targetYShift = aspect < 0.9 ? -0.26 : aspect < 1.25 ? -0.12 : 0;

    scaledPosRef.current.copy(basePos).multiplyScalar(distScale);
    scaledTargetRef.current
      .copy(baseTarget)
      .setY(baseTarget.y + targetYShift);

    const step = Math.min(1, delta * 5.5);
    ctrl.target.lerp(scaledTargetRef.current, step);

    if (transitionFramesRef.current > 0) {
      state.camera.position.lerp(scaledPosRef.current, step);
      transitionFramesRef.current -= 1;
    }
    ctrl.update();
  });

  return null;
}

/* ------------------------------------------------------------------
 * PROCEDURAL MATERIAL LIBRARY
 * All surface detail (grass, asphalt, roof tiles, timber, pavers, soil,
 * stone, corrugated steel, PV cells, water ripples) is generated once on
 * the client from a seeded canvas. Zero network requests, zero GLTF.
 * ------------------------------------------------------------------ */

type TexKind =
  | "grass"
  | "asphalt"
  | "stucco"
  | "concrete"
  | "tiles"
  | "wood"
  | "pavers"
  | "stone"
  | "soil"
  | "corrugated"
  | "bark"
  | "pvcells"
  | "waterNormal";

const TEX_CACHE = new Map<TexKind, THREE.Texture>();
const TEX_CLONES = new Map<string, THREE.Texture>();

function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gray(v: number, a = 1) {
  const c = Math.max(0, Math.min(255, Math.round(v)));
  return `rgba(${c},${c},${c},${a})`;
}

function speckle(
  ctx: CanvasRenderingContext2D,
  size: number,
  rand: () => number,
  count: number,
  min: number,
  max: number,
  alpha = 0.8,
  maxDot = 2
) {
  for (let i = 0; i < count; i++) {
    const d = 0.8 + rand() * maxDot;
    ctx.fillStyle = gray(min + rand() * (max - min), alpha);
    ctx.fillRect(rand() * size, rand() * size, d, d);
  }
}

function blotches(
  ctx: CanvasRenderingContext2D,
  size: number,
  rand: () => number,
  count: number,
  tone: number,
  alpha: number
) {
  for (let i = 0; i < count; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 20 + rand() * 80;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, gray(tone, alpha));
    g.addColorStop(1, gray(tone, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

function buildTexture(kind: TexKind): THREE.Texture {
  if (typeof document === "undefined") return new THREE.Texture();
  const size = kind === "waterNormal" ? 256 : 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const rand = seededRandom(kind.length * 9973 + kind.charCodeAt(0) * 131);

  switch (kind) {
    case "grass": {
      ctx.fillStyle = gray(214);
      ctx.fillRect(0, 0, size, size);
      blotches(ctx, size, rand, 26, 175, 0.18);
      for (let i = 0; i < 16000; i++) {
        const x = rand() * size;
        const y = rand() * size;
        const len = 2 + rand() * 6;
        const ang = -Math.PI / 2 + (rand() - 0.5) * 1.1;
        ctx.strokeStyle = gray(145 + rand() * 110, 0.75);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
        ctx.stroke();
      }
      break;
    }
    case "asphalt": {
      ctx.fillStyle = gray(198);
      ctx.fillRect(0, 0, size, size);
      blotches(ctx, size, rand, 20, 160, 0.16);
      speckle(ctx, size, rand, 26000, 105, 255, 0.9, 1.4);
      break;
    }
    case "stucco": {
      ctx.fillStyle = gray(238);
      ctx.fillRect(0, 0, size, size);
      blotches(ctx, size, rand, 30, 212, 0.12);
      speckle(ctx, size, rand, 11000, 200, 255, 0.65, 1.6);
      break;
    }
    case "concrete": {
      ctx.fillStyle = gray(226);
      ctx.fillRect(0, 0, size, size);
      blotches(ctx, size, rand, 18, 180, 0.14);
      speckle(ctx, size, rand, 9000, 175, 255, 0.7, 1.8);
      // formwork joints
      ctx.fillStyle = gray(178, 0.6);
      for (let x = 0; x < size; x += size / 2) ctx.fillRect(x, 0, 1.5, size);
      break;
    }
    case "tiles": {
      const rows = 16;
      const rh = size / rows;
      const tw = size / 12;
      ctx.fillStyle = gray(90);
      ctx.fillRect(0, 0, size, size);
      for (let r = 0; r < rows; r++) {
        const y = r * rh;
        const off = (r % 2) * (tw / 2);
        for (let c = -1; c <= 12; c++) {
          const x = c * tw + off;
          const base = 196 + rand() * 44;
          const g = ctx.createLinearGradient(0, y, 0, y + rh);
          g.addColorStop(0, gray(base + 22));
          g.addColorStop(0.7, gray(base));
          g.addColorStop(1, gray(base - 78));
          ctx.fillStyle = g;
          ctx.fillRect(x + 1.2, y, tw - 2.4, rh);
        }
      }
      speckle(ctx, size, rand, 6000, 120, 255, 0.35, 1.2);
      break;
    }
    case "wood": {
      const planks = 8;
      const ph = size / planks;
      for (let p = 0; p < planks; p++) {
        const base = 178 + rand() * 52;
        ctx.fillStyle = gray(base);
        ctx.fillRect(0, p * ph, size, ph);
        for (let g = 0; g < 28; g++) {
          const y0 = p * ph + rand() * ph;
          ctx.strokeStyle = gray(base - 22 - rand() * 40, 0.5);
          ctx.lineWidth = 0.6 + rand() * 1.2;
          ctx.beginPath();
          ctx.moveTo(0, y0);
          for (let x = 0; x <= size; x += 16) {
            ctx.lineTo(x, y0 + Math.sin(x * 0.018 + g * 1.7) * 2.2);
          }
          ctx.stroke();
        }
        ctx.fillStyle = gray(70);
        ctx.fillRect(0, p * ph, size, 2);
        ctx.fillRect(rand() * size, p * ph, 2, ph);
      }
      break;
    }
    case "pavers": {
      const pw = 64;
      const ph = 32;
      ctx.fillStyle = gray(150);
      ctx.fillRect(0, 0, size, size);
      for (let r = 0; r < size / ph; r++) {
        const off = (r % 2) * (pw / 2);
        for (let c = -1; c <= size / pw; c++) {
          ctx.fillStyle = gray(204 + rand() * 42);
          ctx.fillRect(c * pw + off + 1.5, r * ph + 1.5, pw - 3, ph - 3);
        }
      }
      speckle(ctx, size, rand, 7000, 160, 255, 0.4, 1.4);
      break;
    }
    case "stone": {
      const bw = 128;
      const bh = 64;
      ctx.fillStyle = gray(132);
      ctx.fillRect(0, 0, size, size);
      for (let r = 0; r < size / bh; r++) {
        const off = (r % 2) * (bw / 2);
        for (let c = -1; c <= size / bw; c++) {
          const base = 172 + rand() * 64;
          const x = c * bw + off + 2.5;
          const y = r * bh + 2.5;
          const g = ctx.createLinearGradient(x, y, x, y + bh);
          g.addColorStop(0, gray(base + 14));
          g.addColorStop(1, gray(base - 24));
          ctx.fillStyle = g;
          ctx.fillRect(x, y, bw - 5, bh - 5);
        }
      }
      speckle(ctx, size, rand, 9000, 110, 255, 0.45, 1.6);
      break;
    }
    case "soil": {
      for (let y = 0; y < size; y++) {
        const v =
          178 +
          38 * Math.sin(y * 0.045 + Math.sin(y * 0.011) * 3) +
          (rand() - 0.5) * 26;
        ctx.fillStyle = gray(v);
        ctx.fillRect(0, y, size, 1);
      }
      for (let i = 0; i < 1100; i++) {
        ctx.fillStyle = gray(120 + rand() * 130, 0.8);
        ctx.beginPath();
        ctx.arc(rand() * size, rand() * size, 0.8 + rand() * 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "corrugated": {
      for (let x = 0; x < size; x++) {
        const v = 204 + 44 * Math.sin((x / size) * Math.PI * 2 * 32);
        ctx.fillStyle = gray(v);
        ctx.fillRect(x, 0, 1, size);
      }
      speckle(ctx, size, rand, 3000, 170, 255, 0.3, 1.2);
      break;
    }
    case "bark": {
      ctx.fillStyle = gray(168);
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 700; i++) {
        let x = rand() * size;
        ctx.strokeStyle = gray(100 + rand() * 100, 0.55);
        ctx.lineWidth = 1 + rand() * 2.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        for (let y = 0; y <= size; y += 24) {
          x += (rand() - 0.5) * 6;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      break;
    }
    case "pvcells": {
      ctx.fillStyle = "#c7ccd4";
      ctx.fillRect(0, 0, size, size);
      const cols = 6;
      const rows = 10;
      const gap = 4;
      const cw = (size - gap * (cols + 1)) / cols;
      const ch = (size - gap * (rows + 1)) / rows;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = gap + c * (cw + gap);
          const y = gap + r * (ch + gap);
          const g = ctx.createLinearGradient(x, y, x + cw, y + ch);
          g.addColorStop(0, "#0c1f3f");
          g.addColorStop(1, "#16315e");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          ctx.strokeStyle = "rgba(170,186,210,0.16)";
          ctx.lineWidth = 0.6;
          for (let fy = y + 4; fy < y + ch; fy += 5) {
            ctx.beginPath();
            ctx.moveTo(x, fy);
            ctx.lineTo(x + cw, fy);
            ctx.stroke();
          }
          ctx.fillStyle = "rgba(205,214,228,0.6)";
          ctx.fillRect(x + cw * 0.33, y, 1.4, ch);
          ctx.fillRect(x + cw * 0.66, y, 1.4, ch);
        }
      }
      break;
    }
    case "waterNormal": {
      const img = ctx.createImageData(size, size);
      const waves = [
        { kx: 3, ky: 1, a: 1, p: 0.3 },
        { kx: -2, ky: 4, a: 0.7, p: 1.7 },
        { kx: 7, ky: -3, a: 0.35, p: 2.9 },
        { kx: -9, ky: -8, a: 0.2, p: 0.8 },
        { kx: 13, ky: 5, a: 0.12, p: 4.1 },
        { kx: -17, ky: 11, a: 0.07, p: 2.2 },
      ];
      const strength = 6;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          let dx = 0;
          let dy = 0;
          for (const w of waves) {
            const ph = (Math.PI * 2 * (w.kx * x + w.ky * y)) / size + w.p;
            const c = (Math.cos(ph) * w.a * Math.PI * 2) / size;
            dx += c * w.kx;
            dy += c * w.ky;
          }
          let nx = -dx * strength;
          let ny = -dy * strength;
          let nz = 1;
          const len = Math.hypot(nx, ny, nz);
          nx /= len;
          ny /= len;
          nz /= len;
          const i = (y * size + x) * 4;
          img.data[i] = (nx * 0.5 + 0.5) * 255;
          img.data[i + 1] = (ny * 0.5 + 0.5) * 255;
          img.data[i + 2] = (nz * 0.5 + 0.5) * 255;
          img.data[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      break;
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  tex.colorSpace =
    kind === "waterNormal" ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function getTexture(kind: TexKind) {
  let t = TEX_CACHE.get(kind);
  if (!t) {
    t = buildTexture(kind);
    TEX_CACHE.set(kind, t);
  }
  return t;
}

/** Returns a cached, repeat-configured clone of a procedural texture. */
function useTex(kind: TexKind, rx = 1, ry = 1) {
  return useMemo(() => {
    const key = `${kind}:${rx.toFixed(2)}:${ry.toFixed(2)}`;
    let t = TEX_CLONES.get(key);
    if (!t) {
      t = getTexture(kind).clone();
      t.repeat.set(rx, ry);
      t.needsUpdate = true;
      TEX_CLONES.set(key, t);
    }
    return t;
  }, [kind, rx, ry]);
}

let FOLIAGE_GEO: THREE.BufferGeometry | null = null;
let PUFF_GEO: THREE.BufferGeometry | null = null;

/** Organic, lumpy canopy volume (smooth shaded, deterministic displacement). */
function getFoliageGeometry() {
  if (FOLIAGE_GEO) return FOLIAGE_GEO;
  const g = new THREE.SphereGeometry(1, 24, 18);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n =
      Math.sin(v.x * 4.1 + v.y * 2.3) * Math.sin(v.y * 3.7 + v.z * 2.9) * 0.5 +
      Math.sin(v.z * 6.3 + v.x * 5.1) * 0.25 +
      Math.sin(v.x * 11.0 + v.y * 9.0 + v.z * 7.0) * 0.08;
    v.multiplyScalar(1 + n * 0.16);
    pos.setXYZ(i, v.x, v.y * 0.92, v.z);
  }
  g.computeVertexNormals();
  FOLIAGE_GEO = g;
  return g;
}

function getPuffGeometry() {
  if (PUFF_GEO) return PUFF_GEO;
  PUFF_GEO = new THREE.SphereGeometry(1, 24, 16);
  return PUFF_GEO;
}

const TRIM = "#F2EFE8";
const ALU = "#2B2F35";

type SimMode = "run" | "break" | "heal";

/* ------------------------------------------------------------------
 * ATMOSPHERE: dust motes, fireflies, AI telemetry nodes and storm rain
 * ------------------------------------------------------------------ */

function AtmosphericParticleField({
  simMode = "run",
  isNight,
}: {
  simMode?: SimMode;
  isNight: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 70;

  const positions = useMemo(() => {
    const rand = seededRandom(77);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand() - 0.5) * 8.6;
      arr[i * 3 + 1] = rand() * 3.4 + 0.3;
      arr[i * 3 + 2] = (rand() - 0.5) * 7.2;
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    const pts = pointsRef.current;
    if (!pts || simMode === "break") return;
    const posAttr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
    const t = state.clock.getElapsedTime();
    const rise = simMode === "heal" ? 0.75 : isNight ? 0.08 : 0.14;
    for (let i = 0; i < count; i++) {
      let y = posAttr.getY(i) + delta * rise;
      if (y > 3.8) y = 0.3;
      posAttr.setY(i, y);
      posAttr.setX(i, posAttr.getX(i) + Math.sin(t * 0.6 + i) * delta * 0.05);
    }
    posAttr.needsUpdate = true;
  });

  if (simMode === "break") return null;

  const color = simMode === "heal" ? "#C6F432" : isNight ? "#FFD27A" : "#FFFFFF";
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={simMode === "heal" ? 0.06 : isNight ? 0.055 : 0.03}
        transparent
        opacity={simMode === "heal" ? 0.75 : isNight ? 0.9 : 0.35}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function StormRain({ active }: { active: boolean }) {
  const ref = useRef<THREE.LineSegments>(null);
  const count = 560;
  const positions = useMemo(() => {
    const rand = seededRandom(19);
    const arr = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      const x = (rand() - 0.5) * 9.4;
      const y = rand() * 4.6;
      const z = (rand() - 0.5) * 8;
      arr.set([x, y, z, x + 0.04, y - 0.19, z], i * 6);
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!active || !ref.current) return;
    const attr = ref.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const a = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const o = i * 6;
      let y = a[o + 1] - delta * 7.8;
      let x = a[o] - delta * 1.1;
      if (y < 0.1) {
        y = 4.4 + Math.random() * 0.4;
        x = (Math.random() - 0.5) * 9.4;
      }
      a[o] = x;
      a[o + 1] = y;
      a[o + 3] = x + 0.04;
      a[o + 4] = y - 0.19;
    }
    attr.needsUpdate = true;
  });

  if (!active) return null;
  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#BFD6EE" transparent opacity={0.5} depthWrite={false} />
    </lineSegments>
  );
}

function SoftCloud({
  position,
  scale = 1,
  color,
  opacity,
}: {
  position: [number, number, number];
  scale?: number;
  color: string;
  opacity: number;
}) {
  const geo = getPuffGeometry();
  const puffs: [number, number, number, number][] = [
    [0, 0, 0, 0.34],
    [0.32, -0.06, 0.05, 0.26],
    [-0.31, -0.07, 0, 0.24],
    [0.12, 0.13, -0.05, 0.25],
    [-0.12, 0.06, 0.13, 0.2],
    [0.5, -0.1, -0.04, 0.17],
  ];
  return (
    <group position={position} scale={scale}>
      {puffs.map(([x, y, z, r], i) => (
        <mesh key={i} geometry={geo} position={[x, y, z]} scale={[r, r * 0.82, r]}>
          <meshStandardMaterial
            color={color}
            roughness={1}
            transparent
            opacity={opacity}
            envMapIntensity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------
 * ARCHITECTURAL BUILDING BLOCKS
 * ------------------------------------------------------------------ */

function GlassMaterial({ glow, tint = "#22303D" }: { glow: boolean; tint?: string }) {
  return (
    <meshPhysicalMaterial
      color={glow ? "#FFD8A3" : tint}
      emissive={glow ? "#FFA94A" : "#000000"}
      emissiveIntensity={glow ? 0.95 : 0}
      metalness={0.15}
      roughness={0.05}
      clearcoat={1}
      clearcoatRoughness={0.04}
      envMapIntensity={1.9}
    />
  );
}

function ArchWindow({
  position,
  rotationY = 0,
  w,
  h,
  isNight,
  lit = true,
  frameColor = TRIM,
  mullions = true,
}: {
  position: [number, number, number];
  rotationY?: number;
  w: number;
  h: number;
  isNight: boolean;
  lit?: boolean;
  frameColor?: string;
  mullions?: boolean;
}) {
  const f = 0.022;
  const glow = isNight && lit;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0, 0.003]}>
        <boxGeometry args={[w, h, 0.006]} />
        <GlassMaterial glow={glow} />
      </mesh>
      <mesh position={[0, h / 2, 0.012]} castShadow>
        <boxGeometry args={[w + f, f, 0.024]} />
        <meshStandardMaterial color={frameColor} roughness={0.45} />
      </mesh>
      <mesh position={[0, -h / 2, 0.012]}>
        <boxGeometry args={[w + f, f, 0.024]} />
        <meshStandardMaterial color={frameColor} roughness={0.45} />
      </mesh>
      <mesh position={[-w / 2, 0, 0.012]}>
        <boxGeometry args={[f, h + f, 0.024]} />
        <meshStandardMaterial color={frameColor} roughness={0.45} />
      </mesh>
      <mesh position={[w / 2, 0, 0.012]}>
        <boxGeometry args={[f, h + f, 0.024]} />
        <meshStandardMaterial color={frameColor} roughness={0.45} />
      </mesh>
      {mullions && (
        <>
          <mesh position={[0, 0, 0.011]}>
            <boxGeometry args={[f * 0.6, h, 0.016]} />
            <meshStandardMaterial color={frameColor} roughness={0.45} />
          </mesh>
          <mesh position={[0, h * 0.18, 0.011]}>
            <boxGeometry args={[w, f * 0.6, 0.016]} />
            <meshStandardMaterial color={frameColor} roughness={0.45} />
          </mesh>
        </>
      )}
      <mesh position={[0, -h / 2 - f * 0.9, 0.03]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.07, f, 0.06]} />
        <meshStandardMaterial color="#D8D4CA" roughness={0.75} />
      </mesh>
    </group>
  );
}

function EntryDoor({
  position,
  rotationY = 0,
  w = 0.26,
  h = 0.46,
  isNight,
  color = "#5B3A24",
}: {
  position: [number, number, number];
  rotationY?: number;
  w?: number;
  h?: number;
  isNight: boolean;
  color?: string;
}) {
  const wood = useTex("wood", 0.6, 1.4);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, h / 2, 0.008]} castShadow>
        <boxGeometry args={[w, h, 0.016]} />
        <meshStandardMaterial color={color} map={wood} bumpMap={wood} bumpScale={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, h * 0.74, 0.018]}>
        <boxGeometry args={[w * 0.5, h * 0.2, 0.004]} />
        <GlassMaterial glow={isNight} />
      </mesh>
      <mesh position={[-w / 2 - 0.012, h / 2, 0.015]}>
        <boxGeometry args={[0.024, h + 0.024, 0.03]} />
        <meshStandardMaterial color={TRIM} roughness={0.45} />
      </mesh>
      <mesh position={[w / 2 + 0.012, h / 2, 0.015]}>
        <boxGeometry args={[0.024, h + 0.024, 0.03]} />
        <meshStandardMaterial color={TRIM} roughness={0.45} />
      </mesh>
      <mesh position={[0, h + 0.012, 0.015]}>
        <boxGeometry args={[w + 0.048, 0.024, 0.03]} />
        <meshStandardMaterial color={TRIM} roughness={0.45} />
      </mesh>
      <mesh position={[w * 0.34, h * 0.48, 0.026]}>
        <sphereGeometry args={[0.012, 10, 8]} />
        <meshStandardMaterial color="#C9B37E" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.012, 0.07]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.14, 0.024, 0.13]} />
        <meshStandardMaterial color="#BDB8AD" roughness={0.85} />
      </mesh>
      <mesh position={[0, h + 0.06, 0.075]} castShadow>
        <boxGeometry args={[w + 0.16, 0.02, 0.15]} />
        <meshStandardMaterial color={ALU} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[w / 2 + 0.07, h * 0.8, 0.02]}>
        <boxGeometry args={[0.03, 0.05, 0.03]} />
        <meshStandardMaterial
          color="#FFF4D6"
          emissive="#FFB85C"
          emissiveIntensity={isNight ? 2.4 : 0.1}
        />
      </mesh>
    </group>
  );
}

/** Monocrystalline PV module: anodised frame, mounting rails and textured cell matrix. */
function SolarModule({
  position,
  width,
  depth,
  simMode = "run",
}: {
  position: [number, number, number];
  width: number;
  depth: number;
  simMode?: SimMode;
}) {
  const cells = useTex("pvcells", 1, 1);
  const isHeal = simMode === "heal";
  return (
    <group position={position}>
      {[-depth * 0.3, depth * 0.3].map((rz, i) => (
        <mesh key={i} position={[0, -0.02, rz]}>
          <boxGeometry args={[width + 0.02, 0.012, 0.02]} />
          <meshStandardMaterial color="#9AA3AD" metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, 0.022, depth]} />
        <meshStandardMaterial color="#C4CBD3" metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.0115, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width - 0.022, depth - 0.022]} />
        <meshPhysicalMaterial
          map={cells}
          metalness={0.5}
          roughness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.04}
          envMapIntensity={1.7}
          emissive={isHeal ? "#0F5132" : "#000000"}
          emissiveIntensity={isHeal ? 0.35 : 0}
        />
      </mesh>
    </group>
  );
}

/**
 * True gable roof: solid triangular gable walls, tiled slabs with overhang,
 * ridge cap, fascia, half-round gutters, downspouts, chimney and PV arrays.
 */
function GableRoof({
  width,
  depth,
  rise,
  roofColor,
  wallColor,
  isBreak,
  frontPanels,
  backPanels,
  panelCols = 3,
  simMode = "run",
  chimney = false,
  wallHeight = 1,
  downspouts = true,
}: {
  width: number;
  depth: number;
  rise: number;
  roofColor: string;
  wallColor: string;
  isBreak: boolean;
  frontPanels: boolean;
  backPanels: boolean;
  panelCols?: number;
  simMode?: SimMode;
  chimney?: boolean;
  wallHeight?: number;
  downspouts?: boolean;
}) {
  const tiles = useTex("tiles", Math.max(1, Math.round(width * 1.3)), Math.max(1, Math.round(depth)));
  const stucco = useTex("stucco", 1.5, 0.8);
  const brick = useTex("stone", 0.5, 1.2);

  const overhang = 0.1;
  const sideOverhang = 0.08;
  const t = 0.05;
  const half = depth / 2;
  const a = Math.atan2(rise, half);
  const sinA = Math.sin(a);
  const cosA = Math.cos(a);
  const slabLen = Math.hypot(half, rise) + overhang;
  const slabW = width + sideOverhang * 2;
  const midY = rise - (sinA * slabLen) / 2;
  const midZ = (cosA * slabLen) / 2;
  const eaveY = rise - sinA * slabLen;
  const eaveZ = cosA * slabLen;

  const gableGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-half, 0);
    s.lineTo(half, 0);
    s.lineTo(0, rise);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: width, bevelEnabled: false });
    g.translate(0, 0, -width / 2);
    g.rotateY(Math.PI / 2);
    return g;
  }, [half, rise, width]);

  const roofTint = isBreak ? "#7A2A22" : roofColor;
  const pw = Math.min(0.46, (width - 0.16) / panelCols - 0.03);
  const pd = slabLen * 0.62;
  const panelXs = Array.from({ length: panelCols }, (_, i) => (i - (panelCols - 1) / 2) * (pw + 0.03));
  const lift = t + 0.032;

  return (
    <group>
      <mesh geometry={gableGeo} castShadow receiveShadow>
        <meshStandardMaterial color={wallColor} map={stucco} bumpMap={stucco} bumpScale={0.3} roughness={0.92} />
      </mesh>
      {[1, -1].map((side) => (
        <mesh key={`vent-${side}`} position={[side * (width / 2 + 0.004), rise * 0.38, 0]}>
          <boxGeometry args={[0.008, 0.08, 0.13]} />
          <meshStandardMaterial color="#3A3D42" roughness={0.6} />
        </mesh>
      ))}

      {[1, -1].map((dir) => (
        <group key={`slope-${dir}`}>
          <mesh
            position={[0, midY + (cosA * t) / 2, dir * (midZ + (sinA * t) / 2)]}
            rotation={[dir * a, 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[slabW, t, slabLen]} />
            <meshStandardMaterial color={roofTint} map={tiles} bumpMap={tiles} bumpScale={0.9} roughness={0.78} />
          </mesh>
          <mesh position={[0, eaveY - 0.012, dir * (eaveZ + 0.006)]}>
            <boxGeometry args={[slabW, 0.055, 0.018]} />
            <meshStandardMaterial color={TRIM} roughness={0.5} />
          </mesh>
          <mesh position={[0, eaveY - 0.035, dir * (eaveZ + 0.03)]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.022, 0.022, slabW, 10]} />
            <meshStandardMaterial color="#C9CCD0" metalness={0.75} roughness={0.3} />
          </mesh>
          {downspouts &&
            [1, -1].map((sx) => (
              <group key={`ds-${sx}`}>
                <mesh position={[sx * (width / 2 - 0.04), eaveY - 0.045, dir * ((eaveZ + half) / 2 + 0.02)]}>
                  <boxGeometry args={[0.024, 0.024, Math.max(0.02, eaveZ - half)]} />
                  <meshStandardMaterial color="#C9CCD0" metalness={0.75} roughness={0.3} />
                </mesh>
                <mesh position={[sx * (width / 2 - 0.04), (eaveY - 0.045 - wallHeight) / 2, dir * (half + 0.022)]}>
                  <cylinderGeometry args={[0.013, 0.013, Math.max(0.05, eaveY - 0.045 + wallHeight), 8]} />
                  <meshStandardMaterial color="#C9CCD0" metalness={0.75} roughness={0.3} />
                </mesh>
              </group>
            ))}
        </group>
      ))}

      <mesh position={[0, rise + t * 0.7, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.036, 0.036, slabW, 12]} />
        <meshStandardMaterial color={roofTint} roughness={0.7} />
      </mesh>

      {chimney && (
        <group position={[width * 0.27, 0, -half * 0.45]}>
          <mesh position={[0, rise * 0.66, 0]} castShadow>
            <boxGeometry args={[0.15, rise * 0.95, 0.15]} />
            <meshStandardMaterial color="#8B5A45" map={brick} bumpMap={brick} bumpScale={0.6} roughness={0.9} />
          </mesh>
          <mesh position={[0, rise * 1.14 + 0.015, 0]} castShadow>
            <boxGeometry args={[0.19, 0.03, 0.19]} />
            <meshStandardMaterial color="#6E6A64" roughness={0.8} />
          </mesh>
        </group>
      )}

      {frontPanels && (
        <group position={[0, midY + cosA * lift, midZ + sinA * lift]} rotation={[a, 0, 0]}>
          {panelXs.map((x, i) => (
            <SolarModule key={`pf-${i}`} position={[x, 0, -0.02]} width={pw} depth={pd} simMode={simMode} />
          ))}
        </group>
      )}
      {backPanels && (
        <group position={[0, midY + cosA * lift, -(midZ + sinA * lift)]} rotation={[-a, 0, 0]}>
          {panelXs.map((x, i) => (
            <SolarModule key={`pb-${i}`} position={[x, 0, 0.02]} width={pw} depth={pd} simMode="heal" />
          ))}
        </group>
      )}
    </group>
  );
}

function Townhouse({
  position,
  rotationY = 0,
  width,
  height,
  depth,
  wallColor,
  roofColor,
  isNight,
  hasSolarPanels = false,
  simMode = "run",
  seed = 1,
  foliageColor,
}: {
  position: [number, number, number];
  rotationY?: number;
  width: number;
  height: number;
  depth: number;
  wallColor: string;
  roofColor: string;
  isNight: boolean;
  hasSolarPanels?: boolean;
  simMode?: SimMode;
  seed?: number;
  foliageColor: string;
}) {
  const stucco = useTex("stucco", 2, 2);
  const stone = useTex("stone", 3, 0.4);
  const foliage = getFoliageGeometry();
  const isBreak = simMode === "break";
  const isHeal = simMode === "heal";
  const baseY = 0.12;
  const floorH = height / 2;
  const fz = depth / 2 + 0.001;
  const lit = (i: number) => (seed * 7 + i * 3) % 5 !== 0;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
        <boxGeometry args={[width + 0.14, 0.12, depth + 0.14]} />
        <meshStandardMaterial color="#8F8D86" map={stone} bumpMap={stone} bumpScale={0.6} roughness={0.9} />
      </mesh>
      <mesh position={[0, baseY + height / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={wallColor} map={stucco} bumpMap={stucco} bumpScale={0.35} roughness={0.92} />
      </mesh>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`trim-${sx}-${sz}`} position={[sx * (width / 2), baseY + height / 2, sz * (depth / 2)]} castShadow>
            <boxGeometry args={[0.045, height, 0.045]} />
            <meshStandardMaterial color={TRIM} roughness={0.5} />
          </mesh>
        ))
      )}
      <mesh position={[0, baseY + floorH, 0]}>
        <boxGeometry args={[width + 0.025, 0.03, depth + 0.025]} />
        <meshStandardMaterial color={TRIM} roughness={0.5} />
      </mesh>

      {/* Front facade */}
      {[-1, 1].map((sx, i) => (
        <ArchWindow
          key={`fl-${sx}`}
          position={[sx * width * 0.3, baseY + floorH * 0.55, fz]}
          w={width * 0.2}
          h={floorH * 0.5}
          isNight={isNight}
          lit={lit(i)}
        />
      ))}
      {[-1, 0, 1].map((sx, i) => (
        <ArchWindow
          key={`fu-${sx}`}
          position={[sx * width * 0.3, baseY + floorH * 1.5, fz]}
          w={width * 0.17}
          h={floorH * 0.5}
          isNight={isNight}
          lit={lit(i + 3)}
        />
      ))}
      <EntryDoor position={[0, baseY, fz]} w={width * 0.18} h={floorH * 0.8} isNight={isNight} />
      {[-1, 1].map((sx) => (
        <group key={`planter-${sx}`} position={[sx * width * 0.3, baseY + floorH * 0.2, fz + 0.04]}>
          <mesh castShadow>
            <boxGeometry args={[width * 0.22, 0.05, 0.06]} />
            <meshStandardMaterial color="#6B4A33" roughness={0.8} />
          </mesh>
          {[-0.06, 0, 0.06].map((px, j) => (
            <mesh key={j} geometry={foliage} position={[px * width, 0.045, 0]} scale={0.04}>
              <meshStandardMaterial color={isHeal ? "#3FAE6A" : foliageColor} roughness={0.85} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Rear facade */}
      {[-1, 1].map((sx, i) =>
        [0.55, 1.5].map((fy, j) => (
          <ArchWindow
            key={`b-${sx}-${fy}`}
            position={[sx * width * 0.25, baseY + floorH * fy, -fz]}
            rotationY={Math.PI}
            w={width * 0.2}
            h={floorH * 0.5}
            isNight={isNight}
            lit={lit(i + j + 5)}
          />
        ))
      )}

      {/* Side facades */}
      {[1, -1].map((sx, i) =>
        [0.55, 1.5].map((fy, j) => (
          <ArchWindow
            key={`s-${sx}-${fy}`}
            position={[sx * (width / 2 + 0.001), baseY + floorH * fy, 0]}
            rotationY={sx * (Math.PI / 2)}
            w={depth * 0.22}
            h={floorH * 0.48}
            isNight={isNight}
            lit={lit(i + j + 8)}
          />
        ))
      )}

      {/* Condenser unit */}
      <group position={[width / 2 + 0.1, 0.12, -depth * 0.22]}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.12, 0.16, 0.22]} />
          <meshStandardMaterial color="#D9DBD8" metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh position={[0.061, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.055, 0.055, 0.004, 18]} />
          <meshStandardMaterial color="#2B2E33" roughness={0.6} />
        </mesh>
      </group>

      <group position={[0, baseY + height, 0]}>
        <GableRoof
          width={width}
          depth={depth}
          rise={depth * 0.36}
          roofColor={roofColor}
          wallColor={wallColor}
          isBreak={isBreak}
          frontPanels={hasSolarPanels || isHeal}
          backPanels={false}
          panelCols={3}
          simMode={simMode}
          chimney
          wallHeight={height}
        />
      </group>
    </group>
  );
}

/** Central mass-timber solar pavilion with curtain wall, timber cladding and roof garden. */
function SolarPavilion({
  position,
  wallColor,
  roofColor,
  isNight,
  hasSolarPanels,
  simMode = "run",
  focusHighlight = false,
  foliageColor,
}: {
  position: [number, number, number];
  wallColor: string;
  roofColor: string;
  isNight: boolean;
  hasSolarPanels: boolean;
  simMode?: SimMode;
  focusHighlight?: boolean;
  foliageColor: string;
}) {
  const isBreak = simMode === "break";
  const isHeal = simMode === "heal";
  const concrete = useTex("concrete", 2, 1.5);
  const stucco = useTex("stucco", 2.5, 1);
  const wood = useTex("wood", 2, 1);
  const batten = useTex("wood", 0.2, 1);
  const foliage = getFoliageGeometry();

  const mullionXs = Array.from({ length: 9 }, (_, i) => -0.89 + i * 0.2225);
  const battenXs = Array.from({ length: 7 }, (_, i) => 0.93 + i * 0.048);

  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
        <boxGeometry args={[2.82, 0.12, 2.08]} />
        <meshStandardMaterial color="#9C9A94" map={concrete} bumpMap={concrete} bumpScale={0.4} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.14, 0]} receiveShadow castShadow>
        <boxGeometry args={[2.66, 0.06, 1.94]} />
        <meshStandardMaterial color="#BDBAB2" map={concrete} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.04, 1.1]} receiveShadow castShadow>
        <boxGeometry args={[0.9, 0.08, 0.12]} />
        <meshStandardMaterial color="#BDBAB2" map={concrete} roughness={0.8} />
      </mesh>

      {/* Ground floor core */}
      <mesh position={[0, 0.6, 0]} receiveShadow castShadow>
        <boxGeometry args={[2.52, 0.88, 1.78]} />
        <meshStandardMaterial color={wallColor} map={stucco} bumpMap={stucco} bumpScale={0.3} roughness={0.9} />
      </mesh>

      {/* Curtain wall with aluminium mullions and transoms */}
      <mesh position={[0, 0.58, 0.892]}>
        <boxGeometry args={[1.78, 0.72, 0.012]} />
        <GlassMaterial glow={isNight} tint="#1F2C38" />
      </mesh>
      {mullionXs.map((x, i) => (
        <mesh key={`mul-${i}`} position={[x, 0.58, 0.902]}>
          <boxGeometry args={[0.016, 0.74, 0.022]} />
          <meshStandardMaterial color={ALU} metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      {[0.225, 0.62, 0.935].map((y, i) => (
        <mesh key={`tr-${i}`} position={[0, y, 0.902]}>
          <boxGeometry args={[1.8, 0.016, 0.022]} />
          <meshStandardMaterial color={ALU} metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      {[-0.05, 0.05].map((x) => (
        <mesh key={`hd-${x}`} position={[x, 0.42, 0.915]}>
          <boxGeometry args={[0.008, 0.14, 0.012]} />
          <meshStandardMaterial color="#D7DADF" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Vertical timber cladding battens flanking the curtain wall */}
      {[1, -1].map((side) =>
        battenXs.map((bx, i) => (
          <mesh key={`bat-${side}-${i}`} position={[side * bx, 0.6, 0.9]} castShadow>
            <boxGeometry args={[0.02, 0.84, 0.026]} />
            <meshStandardMaterial color="#9A6038" map={batten} roughness={0.65} />
          </mesh>
        ))
      )}

      {/* Timber soffit with recessed downlights */}
      <mesh position={[0, 1.03, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[2.64, 0.05, 1.92]} />
        <meshStandardMaterial color="#8F5733" map={wood} roughness={0.62} />
      </mesh>
      {[-0.75, -0.25, 0.25, 0.75].map((x) => (
        <mesh key={`dl-${x}`} position={[x, 1.003, 0.9]}>
          <cylinderGeometry args={[0.018, 0.018, 0.006, 12]} />
          <meshStandardMaterial color="#FFF5DD" emissive="#FFC46B" emissiveIntensity={isNight ? 2.6 : 0.2} />
        </mesh>
      ))}

      {/* Side and rear windows */}
      {[-0.62, -0.14].map((z, i) => (
        <ArchWindow key={`e-${z}`} position={[1.261, 0.62, z]} rotationY={Math.PI / 2} w={0.34} h={0.42} isNight={isNight} lit={i === 0} />
      ))}
      {[-0.4, 0.3].map((z, i) => (
        <ArchWindow key={`w-${z}`} position={[-1.261, 0.62, z]} rotationY={-Math.PI / 2} w={0.4} h={0.42} isNight={isNight} lit={i === 1} />
      ))}
      {[-0.68, 0.68].map((x) => (
        <ArchWindow key={`r-${x}`} position={[x, 0.62, -0.891]} rotationY={Math.PI} w={0.46} h={0.42} isNight={isNight} />
      ))}
      <EntryDoor position={[0, 0.16, -0.892]} rotationY={Math.PI} w={0.34} h={0.52} isNight={isNight} />
      <ArchWindow position={[-0.24, 1.31, -0.801]} rotationY={Math.PI} w={0.68} h={0.26} isNight={isNight} />

      {/* Penthouse level */}
      <mesh position={[-0.24, 1.3, -0.06]} receiveShadow castShadow>
        <boxGeometry args={[1.92, 0.54, 1.48]} />
        <meshStandardMaterial color={wallColor} map={stucco} bumpMap={stucco} bumpScale={0.3} roughness={0.9} />
      </mesh>
      {[-0.85, -0.24, 0.37].map((x, i) => (
        <ArchWindow key={`pf-${x}`} position={[x, 1.31, 0.681]} w={0.5} h={0.28} isNight={isNight} lit={i !== 1} />
      ))}
      <ArchWindow position={[-1.201, 1.31, -0.06]} rotationY={-Math.PI / 2} w={0.5} h={0.26} isNight={isNight} />
      <ArchWindow position={[0.721, 1.31, -0.06]} rotationY={Math.PI / 2} w={0.5} h={0.26} isNight={isNight} lit={false} />

      {/* East roof garden terrace with glass balustrade */}
      <group position={[0.97, 1.1, 0.04]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.4, 0.1, 1.3]} />
          <meshStandardMaterial color="#7A5034" map={wood} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.051, 0]}>
          <boxGeometry args={[0.36, 0.004, 1.26]} />
          <meshStandardMaterial color="#3E2C21" roughness={1} />
        </mesh>
        {[-0.45, -0.15, 0.15, 0.45].map((z, i) => (
          <mesh key={`rg-${z}`} geometry={foliage} position={[(i % 2 ? 0.05 : -0.05), 0.13, z]} scale={0.12 + (i % 2) * 0.03} castShadow>
            <meshStandardMaterial color={isHeal ? "#3FAE6A" : foliageColor} roughness={0.88} />
          </mesh>
        ))}
        <mesh position={[0, 0.13, 0.85]}>
          <boxGeometry args={[0.44, 0.16, 0.01]} />
          <meshPhysicalMaterial color="#DDEFF5" transparent opacity={0.3} roughness={0.05} envMapIntensity={2} />
        </mesh>
      </group>

      {/* Home battery wallpack */}
      <group position={[1.275, 0.52, 0.25]}>
        <mesh castShadow>
          <boxGeometry args={[0.05, 0.42, 0.26]} />
          <meshStandardMaterial color="#F4F6F8" metalness={0.3} roughness={0.3} />
        </mesh>
        <mesh position={[0.027, 0.12, 0]}>
          <boxGeometry args={[0.004, 0.012, 0.12]} />
          <meshStandardMaterial
            color={isBreak ? "#EF4444" : "#C6F432"}
            emissive={isBreak ? "#EF4444" : "#C6F432"}
            emissiveIntensity={1.4}
          />
        </mesh>
      </group>

      {/* Entrance planters and bench */}
      {[-0.62, 0.62].map((x) => (
        <group key={`pl-${x}`} position={[x, 0, 1.15]}>
          <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.08, 0.07, 0.12, 20]} />
            <meshStandardMaterial color="#A9A59C" map={concrete} roughness={0.85} />
          </mesh>
          <mesh geometry={foliage} position={[0, 0.18, 0]} scale={0.1} castShadow>
            <meshStandardMaterial color={foliageColor} roughness={0.88} />
          </mesh>
        </group>
      ))}
      <group position={[-1.02, 0, 1.18]}>
        <mesh position={[0, 0.11, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.025, 0.11]} />
          <meshStandardMaterial color="#9A6038" map={wood} roughness={0.6} />
        </mesh>
        {[-0.17, 0.17].map((x) => (
          <mesh key={x} position={[x, 0.055, 0]} castShadow>
            <boxGeometry args={[0.025, 0.1, 0.09]} />
            <meshStandardMaterial color={ALU} metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>

      <group position={[-0.24, 1.57, -0.06]}>
        <GableRoof
          width={1.92}
          depth={1.48}
          rise={0.4}
          roofColor={roofColor}
          wallColor={wallColor}
          isBreak={isBreak}
          frontPanels={hasSolarPanels || isHeal}
          backPanels={isHeal || focusHighlight}
          panelCols={4}
          simMode={simMode}
          wallHeight={0.54}
        />
      </group>
    </group>
  );
}

function RainCistern({
  position,
  simMode = "run",
  pipeColor,
}: {
  position: [number, number, number];
  simMode?: SimMode;
  pipeColor: string;
}) {
  const corr = useTex("corrugated", 3, 1);
  const concrete = useTex("concrete", 1, 1);
  const isBreak = simMode === "break";
  const isHeal = simMode === "heal";
  const level = isBreak ? 0.96 : isHeal ? 0.8 : 0.56;
  const gaugeH = 0.74;
  const fillColor = isBreak ? "#EF4444" : isHeal ? "#C6F432" : "#22D3EE";

  return (
    <group position={position}>
      <mesh position={[0, 0.025, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.05, 28]} />
        <meshStandardMaterial color="#A9A59C" map={concrete} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.21, 0.21, 0.86, 36]} />
        <meshStandardMaterial color="#5F7D86" map={corr} bumpMap={corr} bumpScale={1.2} metalness={0.55} roughness={0.38} />
      </mesh>
      {[0.18, 0.48, 0.78].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.212, 0.007, 6, 36]} />
          <meshStandardMaterial color="#8A979C" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0.91, 0]} scale={[1, 0.32, 1]} castShadow>
        <sphereGeometry args={[0.215, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4D666E" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Sight gauge */}
      <mesh position={[0, 0.48, 0.213]}>
        <boxGeometry args={[0.032, gaugeH, 0.01]} />
        <meshPhysicalMaterial color="#0E1418" roughness={0.1} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0.48 - gaugeH / 2 + (gaugeH * level) / 2, 0.219]}>
        <boxGeometry args={[0.02, gaugeH * level, 0.004]} />
        <meshStandardMaterial color={fillColor} emissive={fillColor} emissiveIntensity={1.1} />
      </mesh>
      {/* Copper inlet from pavilion gutter */}
      <mesh position={[-0.13, 0.96, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.14, 10]} />
        <meshStandardMaterial color={pipeColor} metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[-0.27, 1.03, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 10]} />
        <meshStandardMaterial color={pipeColor} metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0.12, 0.1, 0.17]} castShadow>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshStandardMaterial color="#B8332E" metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

function WaterTower({ position }: { position: [number, number, number] }) {
  const corr = useTex("corrugated", 4, 1);
  const braceLen = Math.hypot(0.44, 0.56);
  const braceAng = Math.atan2(0.56, 0.44);
  return (
    <group position={position}>
      {[-0.22, 0.22].map((lx) =>
        [-0.22, 0.22].map((lz) => (
          <mesh key={`leg-${lx}-${lz}`} position={[lx, 0.62, lz]} castShadow>
            <cylinderGeometry args={[0.028, 0.036, 1.24, 10]} />
            <meshStandardMaterial color="#5B6573" metalness={0.7} roughness={0.35} />
          </mesh>
        ))
      )}
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((ry) => (
        <group key={`br-${ry}`} rotation={[0, ry, 0]}>
          {[0.36, 0.92].map((y) =>
            [1, -1].map((s) => (
              <mesh key={`${y}-${s}`} position={[0, y, 0.22]} rotation={[0, 0, s * braceAng]}>
                <boxGeometry args={[0.012, braceLen, 0.012]} />
                <meshStandardMaterial color="#6B7685" metalness={0.7} roughness={0.4} />
              </mesh>
            ))
          )}
        </group>
      ))}
      <mesh position={[0, 1.08, 0]} receiveShadow>
        <cylinderGeometry args={[0.52, 0.52, 0.02, 32]} />
        <meshStandardMaterial color="#4B5563" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.52, 0.008, 6, 40]} />
        <meshStandardMaterial color="#4B5563" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.46, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.46, 0.46, 0.72, 40]} />
        <meshStandardMaterial color="#C46A32" map={corr} bumpMap={corr} bumpScale={1} metalness={0.4} roughness={0.42} />
      </mesh>
      {[1.18, 1.74].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.463, 0.01, 6, 40]} />
          <meshStandardMaterial color="#8E4A22" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 1.95, 0]} castShadow>
        <coneGeometry args={[0.5, 0.26, 40]} />
        <meshStandardMaterial color="#2E3440" metalness={0.5} roughness={0.45} />
      </mesh>
      <mesh position={[0, 2.1, 0]}>
        <sphereGeometry args={[0.03, 12, 10]} />
        <meshStandardMaterial color="#2E3440" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Access ladder */}
      <group position={[0, 0, 0.47]}>
        {[-0.05, 0.05].map((x) => (
          <mesh key={x} position={[x, 1.46, 0]}>
            <boxGeometry args={[0.008, 0.72, 0.008]} />
            <meshStandardMaterial color="#9AA3AD" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} position={[0, 1.15 + i * 0.1, 0]}>
            <boxGeometry args={[0.1, 0.006, 0.006]} />
            <meshStandardMaterial color="#9AA3AD" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function WindTurbine({
  position,
  height,
  bladeLen,
  rotorRef,
}: {
  position: [number, number, number];
  height: number;
  bladeLen: number;
  rotorRef: React.RefObject<THREE.Group | null>;
}) {
  const bladeGeo = useMemo(() => {
    const L = bladeLen;
    const s = new THREE.Shape();
    s.moveTo(-0.028, 0);
    s.quadraticCurveTo(-0.048, L * 0.14, -0.034, L * 0.36);
    s.lineTo(-0.01, L);
    s.quadraticCurveTo(0, L + 0.018, 0.008, L);
    s.lineTo(0.018, L * 0.32);
    s.quadraticCurveTo(0.028, L * 0.1, 0.028, 0);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.01, bevelEnabled: false });
    g.translate(0, 0.025, -0.005);
    return g;
  }, [bladeLen]);

  return (
    <group position={position}>
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.06, 24]} />
        <meshStandardMaterial color="#B5B1A8" roughness={0.85} />
      </mesh>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.026, 0.058, height, 24]} />
        <meshStandardMaterial color="#F4F5F2" roughness={0.4} metalness={0.15} />
      </mesh>
      <RoundedBox args={[0.085, 0.08, 0.24]} radius={0.03} smoothness={3} position={[0, height + 0.02, -0.03]} castShadow>
        <meshStandardMaterial color="#F4F5F2" roughness={0.4} metalness={0.15} />
      </RoundedBox>
      <group ref={rotorRef} position={[0, height + 0.02, 0.1]}>
        <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.036, 0.085, 20]} />
          <meshStandardMaterial color="#F4F5F2" roughness={0.35} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
            <mesh geometry={bladeGeo} rotation={[0, 0.2, 0]} castShadow>
              <meshStandardMaterial color="#F7F7F4" roughness={0.38} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

function EVCar({
  color,
  isNight,
  accent,
}: {
  color: string;
  isNight: boolean;
  accent?: string;
}) {
  const L = 0.62;
  const W = 0.3;
  return (
    <group>
      <RoundedBox args={[L, 0.12, W]} radius={0.045} smoothness={4} position={[0, 0.115, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={color} metalness={0.6} roughness={0.28} clearcoat={1} clearcoatRoughness={0.06} envMapIntensity={1.4} />
      </RoundedBox>
      <RoundedBox args={[L * 0.56, 0.1, W * 0.88]} radius={0.04} smoothness={4} position={[-0.02, 0.215, 0]} castShadow>
        <meshPhysicalMaterial color="#141A22" metalness={0.3} roughness={0.06} clearcoat={1} envMapIntensity={2} />
      </RoundedBox>
      <RoundedBox args={[L * 0.42, 0.02, W * 0.84]} radius={0.009} smoothness={2} position={[-0.03, 0.266, 0]}>
        <meshPhysicalMaterial color={color} metalness={0.6} roughness={0.28} clearcoat={1} />
      </RoundedBox>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <group key={`wh-${sx}-${sz}`} position={[sx * L * 0.32, 0.055, sz * W * 0.47]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.055, 0.055, 0.045, 20]} />
              <meshStandardMaterial color="#141414" roughness={0.9} />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.034, 0.034, 0.049, 16]} />
              <meshStandardMaterial color="#B9BEC4" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))
      )}
      {[-1, 1].map((sz) => (
        <mesh key={`hl-${sz}`} position={[L / 2 - 0.004, 0.13, sz * W * 0.32]}>
          <boxGeometry args={[0.01, 0.022, 0.06]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#F5F8FF" emissiveIntensity={isNight ? 3 : 0.6} />
        </mesh>
      ))}
      {[-1, 1].map((sz) => (
        <mesh key={`tl-${sz}`} position={[-L / 2 + 0.004, 0.13, sz * W * 0.32]}>
          <boxGeometry args={[0.01, 0.022, 0.06]} />
          <meshStandardMaterial color="#B91C1C" emissive="#EF4444" emissiveIntensity={isNight ? 2 : 0.5} />
        </mesh>
      ))}
      {accent && (
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[L * 0.72, 0.008, W + 0.004]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} />
        </mesh>
      )}
    </group>
  );
}

function StreetLamp({
  position,
  isNight,
  isBreak,
}: {
  position: [number, number, number];
  isNight: boolean;
  isBreak: boolean;
}) {
  const on = isNight || isBreak;
  return (
    <group position={position}>
      <mesh position={[0, 0.025, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, 0.05, 14]} />
        <meshStandardMaterial color="#30353C" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.33, 0]} castShadow>
        <cylinderGeometry args={[0.013, 0.019, 0.62, 12]} />
        <meshStandardMaterial color="#3A3F46" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.63, 0.075]} castShadow>
        <boxGeometry args={[0.016, 0.016, 0.17]} />
        <meshStandardMaterial color="#3A3F46" metalness={0.7} roughness={0.35} />
      </mesh>
      <RoundedBox args={[0.07, 0.024, 0.11]} radius={0.008} smoothness={2} position={[0, 0.625, 0.16]} castShadow>
        <meshStandardMaterial color="#2A2E34" metalness={0.6} roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0.611, 0.16]}>
        <boxGeometry args={[0.05, 0.004, 0.08]} />
        <meshStandardMaterial
          color="#FFF6DF"
          emissive={isBreak ? "#FFD0A0" : "#FFE2A8"}
          emissiveIntensity={on ? 3.2 : 0.15}
        />
      </mesh>
      <mesh position={[0, 0.67, 0]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[0.08, 0.006, 0.06]} />
        <meshStandardMaterial color="#13213D" metalness={0.6} roughness={0.15} />
      </mesh>
    </group>
  );
}

const BROADLEAF_CLUSTERS: [number, number, number, number][] = [
  [0, 0.84, 0, 0.36],
  [0.21, 0.71, 0.1, 0.27],
  [-0.2, 0.73, -0.08, 0.28],
  [0.06, 1.04, -0.04, 0.26],
  [-0.08, 0.67, 0.21, 0.24],
  [0.13, 0.75, -0.21, 0.24],
];

function BroadleafTree({
  position,
  scale,
  color,
  seed,
}: {
  position: [number, number, number];
  scale: number;
  color: string;
  seed: number;
}) {
  const geo = getFoliageGeometry();
  const bark = useTex("bark", 1, 2);
  const shades = useMemo(() => {
    const rand = seededRandom(seed * 31 + 7);
    return BROADLEAF_CLUSTERS.map(() =>
      new THREE.Color(color)
        .offsetHSL((rand() - 0.5) * 0.03, (rand() - 0.5) * 0.08, (rand() - 0.45) * 0.09)
        .getStyle()
    );
  }, [color, seed]);

  return (
    <group position={position} scale={scale} rotation={[0, seed * 1.7, 0]}>
      <mesh position={[0, 0.31, 0]} castShadow>
        <cylinderGeometry args={[0.034, 0.064, 0.62, 10]} />
        <meshStandardMaterial color="#5A4232" map={bark} bumpMap={bark} bumpScale={0.8} roughness={0.95} />
      </mesh>
      <mesh position={[0.08, 0.56, 0]} rotation={[0, 0, -0.7]} castShadow>
        <cylinderGeometry args={[0.012, 0.022, 0.3, 6]} />
        <meshStandardMaterial color="#5A4232" roughness={0.95} />
      </mesh>
      <mesh position={[-0.07, 0.59, 0.04]} rotation={[0.2, 0, 0.8]} castShadow>
        <cylinderGeometry args={[0.012, 0.022, 0.28, 6]} />
        <meshStandardMaterial color="#5A4232" roughness={0.95} />
      </mesh>
      {BROADLEAF_CLUSTERS.map(([x, y, z, r], i) => (
        <mesh
          key={i}
          geometry={geo}
          position={[x, y, z]}
          scale={r}
          rotation={[seed + i, seed * 2 + i, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={shades[i]} roughness={0.88} />
        </mesh>
      ))}
    </group>
  );
}

function ConiferTree({
  position,
  scale,
  color,
}: {
  position: [number, number, number];
  scale: number;
  color: string;
}) {
  const tiers: [number, number, number][] = [
    [0.42, 0.3, 0.5],
    [0.66, 0.25, 0.44],
    [0.88, 0.19, 0.38],
    [1.07, 0.12, 0.3],
  ];
  const dark = useMemo(() => new THREE.Color(color).offsetHSL(0, 0, -0.06).getStyle(), [color]);
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 0.4, 8]} />
        <meshStandardMaterial color="#4E392B" roughness={0.95} />
      </mesh>
      {tiers.map(([y, r, h], i) => (
        <mesh key={i} position={[0, y, 0]} castShadow receiveShadow>
          <coneGeometry args={[r, h, 16]} />
          <meshStandardMaterial color={i % 2 ? dark : color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function GeodesicConservatory({
  position,
  isNight,
  isHeal,
  foliageColor,
}: {
  position: [number, number, number];
  isNight: boolean;
  isHeal: boolean;
  foliageColor: string;
}) {
  const r = 0.34;
  const edges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(r, 2), 1),
    []
  );
  const foliage = getFoliageGeometry();
  return (
    <group position={position}>
      <mesh position={[0, 0.025, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[r + 0.03, r + 0.04, 0.05, 36]} />
        <meshStandardMaterial color="#B5B1A8" roughness={0.85} />
      </mesh>
      {[
        [0, 0.12, 0, 0.12],
        [0.12, 0.1, 0.08, 0.09],
        [-0.1, 0.1, -0.06, 0.1],
      ].map(([x, y, z, s], i) => (
        <mesh key={i} geometry={foliage} position={[x, y, z]} scale={s}>
          <meshStandardMaterial
            color={isHeal ? "#3FAE6A" : foliageColor}
            emissive={isNight || isHeal ? "#10B981" : "#000000"}
            emissiveIntensity={isNight || isHeal ? 0.25 : 0}
            roughness={0.85}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[r, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#DFF5EA"
          transparent
          opacity={0.26}
          roughness={0.05}
          metalness={0.1}
          envMapIntensity={2.2}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments geometry={edges} position={[0, 0.05, 0]}>
        <lineBasicMaterial color="#EDEFEA" />
      </lineSegments>
    </group>
  );
}

function BioporeWell({
  position,
  isBreak,
  isHeal,
}: {
  position: [number, number, number];
  isBreak: boolean;
  isHeal: boolean;
}) {
  const soil = useTex("soil", 0.4, 0.4);
  const led = isBreak ? "#EF4444" : isHeal ? "#C6F432" : "#34D399";
  return (
    <group position={position}>
      <mesh position={[0, 0.006, 0]} receiveShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.012, 24]} />
        <meshStandardMaterial color="#5A3F2C" map={soil} roughness={1} />
      </mesh>
      <mesh position={[0, 0.016, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.075, 0.03, 24]} />
        <meshStandardMaterial color="#B9B5AB" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.018, 0]}>
        <cylinderGeometry args={[0.058, 0.058, 0.032, 20]} />
        <meshStandardMaterial color="#2C2F33" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.034, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.085, 0.005, 6, 28]} />
        <meshStandardMaterial color={led} emissive={led} emissiveIntensity={isBreak || isHeal ? 1.4 : 0.7} />
      </mesh>
    </group>
  );
}

/** Instanced grass tufts and wildflowers across the open lawns (two draw calls total). */
function LawnDetails({ turfColor }: { turfColor: string }) {
  const grassRef = useRef<THREE.InstancedMesh>(null);
  const flowerRef = useRef<THREE.InstancedMesh>(null);
  const GRASS = 460;
  const FLOWERS = 80;

  useLayoutEffect(() => {
    const grass = grassRef.current;
    const flowers = flowerRef.current;
    if (!grass || !flowers) return;
    const zones: [number, number, number, number][] = [
      [-4.45, 4.45, 3.22, 3.9],
      [-4.45, 4.45, -3.88, -2.6],
      [-4.55, -3.85, -2.5, 1.9],
      [3.85, 4.55, -2.5, 1.9],
    ];
    const rand = seededRandom(42);
    const m = new THREE.Object3D();
    const c = new THREE.Color();
    const pick = () => {
      const z = zones[Math.floor(rand() * zones.length)];
      return [z[0] + rand() * (z[1] - z[0]), z[2] + rand() * (z[3] - z[2])];
    };
    for (let i = 0; i < GRASS; i++) {
      const [x, zz] = pick();
      const s = 0.6 + rand() * 0.9;
      m.position.set(x, 0.2 + 0.035 * s, zz);
      m.rotation.set((rand() - 0.5) * 0.35, rand() * Math.PI, (rand() - 0.5) * 0.35);
      m.scale.set(s, s * (0.8 + rand() * 0.8), s);
      m.updateMatrix();
      grass.setMatrixAt(i, m.matrix);
      c.set(turfColor).offsetHSL((rand() - 0.5) * 0.03, 0, (rand() - 0.25) * 0.14);
      grass.setColorAt(i, c);
    }
    const petals = ["#F5F1E6", "#F2C94C", "#E58FA8", "#B39DDB", "#FFFFFF"];
    for (let i = 0; i < FLOWERS; i++) {
      const [x, zz] = pick();
      const s = 0.7 + rand() * 0.6;
      m.position.set(x, 0.218, zz);
      m.rotation.set(0, 0, 0);
      m.scale.set(s, s * 0.7, s);
      m.updateMatrix();
      flowers.setMatrixAt(i, m.matrix);
      c.set(petals[Math.floor(rand() * petals.length)]);
      flowers.setColorAt(i, c);
    }
    grass.instanceMatrix.needsUpdate = true;
    flowers.instanceMatrix.needsUpdate = true;
    if (grass.instanceColor) grass.instanceColor.needsUpdate = true;
    if (flowers.instanceColor) flowers.instanceColor.needsUpdate = true;
  }, [turfColor]);

  return (
    <>
      <instancedMesh ref={grassRef} args={[undefined, undefined, GRASS]} receiveShadow>
        <coneGeometry args={[0.016, 0.075, 4]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={flowerRef} args={[undefined, undefined, FLOWERS]}>
        <sphereGeometry args={[0.014, 8, 6]} />
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
    </>
  );
}

/* ------------------------------------------------------------------
 * LIVING ECO-DISTRICT SCENE
 * ------------------------------------------------------------------ */

type TreeSpec = { p: [number, number, number]; s: number; k: "broad" | "conifer" };

const TREE_LAYOUT: TreeSpec[] = [
  { p: [-3.95, 0.2, -2.95], s: 1.05, k: "broad" },
  { p: [-4.1, 0.2, -0.75], s: 0.9, k: "conifer" },
  { p: [3.4, 0.245, -2.3], s: 1.0, k: "broad" },
  { p: [3.55, 0.245, 0.25], s: 0.82, k: "broad" },
  { p: [-4.1, 0.2, 3.6], s: 0.78, k: "conifer" },
  { p: [0.5, 0.2, -3.0], s: 0.9, k: "broad" },
  { p: [-1.9, 0.2, -3.05], s: 1.0, k: "broad" },
  { p: [2.5, 0.2, -3.1], s: 0.9, k: "conifer" },
  { p: [4.12, 0.2, -1.2], s: 0.95, k: "conifer" },
  { p: [4.1, 0.2, 3.6], s: 0.82, k: "broad" },
];

function LivingTownScene({
  biome,
  level,
  isNight,
  unlockedItems,
  simMode = "run",
  camPreset = "overview",
}: EcoIslandProps & { camPreset?: CameraViewPreset }) {
  const palette = TOWN_PALETTES[biome] ?? TOWN_PALETTES.mediterranean;
  const turbine1Ref = useRef<THREE.Group>(null);
  const turbine2Ref = useRef<THREE.Group>(null);
  const pulseRingRef = useRef<THREE.Mesh>(null);
  const scanBeamRef = useRef<THREE.Group>(null);
  const waterMeshRef = useRef<THREE.Mesh>(null);
  const floodSurgeMeshRef = useRef<THREE.Mesh>(null);
  const shuttleRef = useRef<THREE.Group>(null);

  const waterNormal = useTex("waterNormal", 6, 1);
  const floodNormal = useTex("waterNormal", 6, 1.4);
  const grassBack = useTex("grass", 7, 5);
  const grassFront = useTex("grass", 7, 1);
  const soilTex = useTex("soil", 3, 0.6);
  const bedrockTex = useTex("stone", 5, 1);
  const canalStone = useTex("stone", 9, 0.5);
  const paverTex = useTex("pavers", 10, 4);
  const asphaltTex = useTex("asphalt", 8, 1);
  const concreteTex = useTex("concrete", 8, 0.3);
  const deckTex = useTex("wood", 1, 3);

  const isBreak = simMode === "break";
  const isHeal = simMode === "heal";
  const hasSolar = level >= 2 || unlockedItems.includes("solar_array");
  const hasCistern = level >= 2 || unlockedItems.includes("rain_cistern");
  const hasCompost =
    level >= 2 ||
    unlockedItems.includes("compost_dome") ||
    unlockedItems.includes("sorting_station");
  const showConduit = isHeal || camPreset === "hydro";

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const spin = isBreak ? 5.8 : isHeal ? 3.1 : 2.1;
    if (turbine1Ref.current) turbine1Ref.current.rotation.z -= delta * spin;
    if (turbine2Ref.current) turbine2Ref.current.rotation.z -= delta * spin * 0.88;

    if (pulseRingRef.current) {
      const s = 1 + Math.sin(t * 3.2) * 0.14;
      pulseRingRef.current.scale.set(s, s, 1);
    }
    if (scanBeamRef.current && isHeal) {
      scanBeamRef.current.position.z = Math.sin(t * 1.2) * 3.1;
    }
    if (waterMeshRef.current) {
      const targetY = isBreak ? 0.2 + Math.sin(t * 4.5) * 0.008 : isHeal ? 0.115 : 0.13 + Math.sin(t * 1.6) * 0.003;
      waterMeshRef.current.position.y = THREE.MathUtils.lerp(waterMeshRef.current.position.y, targetY, delta * 3);
    }
    waterNormal.offset.x += delta * (isBreak ? 0.14 : 0.025);
    waterNormal.offset.y += delta * (isBreak ? 0.05 : 0.008);
    if (floodSurgeMeshRef.current) {
      floodSurgeMeshRef.current.visible = isBreak;
      if (isBreak) {
        floodSurgeMeshRef.current.position.y = 0.248 + Math.sin(t * 3.8) * 0.004;
        floodNormal.offset.x += delta * 0.2;
      }
    }
    const car = shuttleRef.current;
    if (car) {
      const speed = isBreak ? 0.22 : 0.5;
      const phase = t * speed;
      car.position.x = Math.sin(phase) * 3.4;
      const forward = Math.cos(phase) >= 0;
      car.rotation.y = forward ? 0 : Math.PI;
      const laneZ = forward ? 1.47 : 1.03;
      car.position.z = THREE.MathUtils.lerp(car.position.z, laneZ, delta * 1.8);
    }
  });

  const waterColor = isBreak ? "#55625C" : isHeal ? "#2296AA" : "#2D6F86";
  const lampXs = [-3.5, -1.2, 1.2, 3.5];
  const dashXs = [-3.9, -3.3, -2.7, -2.1, -1.5, 0.6, 1.2, 1.8, 2.4, 3.0, 3.6];

  return (
    <group position={[0, -0.42, 0]}>
      {/* 1. GEOLOGICAL PLINTH (bedrock, soil strata, turf with recessed canal) */}
      <mesh position={[0, -0.58, 0]} receiveShadow castShadow>
        <boxGeometry args={[8.9, 0.62, 7.5]} />
        <meshStandardMaterial color={palette.bedrock} map={bedrockTex} bumpMap={bedrockTex} bumpScale={0.8} roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[9.1, 0.26, 7.7]} />
        <meshStandardMaterial color={palette.subsoil} map={soilTex} bumpMap={soilTex} bumpScale={0.7} roughness={0.95} />
      </mesh>
      <RoundedBox args={[9.3, 0.22, 5.91]} radius={0.03} smoothness={2} position={[0, 0.09, -0.995]} receiveShadow castShadow>
        <meshStandardMaterial color={palette.turf} map={grassBack} bumpMap={grassBack} bumpScale={0.6} roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[9.3, 0.22, 0.81]} radius={0.03} smoothness={2} position={[0, 0.09, 3.545]} receiveShadow castShadow>
        <meshStandardMaterial color={palette.turf} map={grassFront} bumpMap={grassFront} bumpScale={0.6} roughness={0.95} />
      </RoundedBox>
      {[-1, 1].map((sx) => (
        <mesh key={`cap-${sx}`} position={[sx * 4.4375, 0.09, 2.55]} receiveShadow castShadow>
          <boxGeometry args={[0.425, 0.22, 1.18]} />
          <meshStandardMaterial color={palette.turf} map={grassFront} roughness={0.95} />
        </mesh>
      ))}

      
      {/* 4-Sided Architectural Diorama Plinth Frame & Retaining Trim */}
      <mesh position={[0, -0.88, 0]} receiveShadow>
        <boxGeometry args={[9.16, 0.08, 7.76]} />
        <meshStandardMaterial color="#1E232A" metalness={0.72} roughness={0.32} />
      </mesh>
      <mesh position={[0, -0.28, 0]} receiveShadow>
        <boxGeometry args={[9.14, 0.035, 7.74]} />
        <meshStandardMaterial color="#C8C4BA" map={concreteTex} roughness={0.82} />
      </mesh>

      {/* Rear North Flagstone Garden Promenade & Stepping Stones (360-degree backside detail) */}
      <mesh position={[0, 0.212, -1.92]} receiveShadow>
        <boxGeometry args={[6.8, 0.035, 0.46]} />
        <meshStandardMaterial color={palette.plazaSlab} map={paverTex} bumpMap={paverTex} bumpScale={0.45} roughness={0.85} />
      </mesh>
      {[-2.55, -0.25, 2.45].map((rx) => (
        <mesh key={`rear-link-${rx}`} position={[rx, 0.213, -1.62]} receiveShadow>
          <boxGeometry args={[0.48, 0.035, 0.34]} />
          <meshStandardMaterial color={palette.plazaSlab} map={paverTex} roughness={0.85} />
        </mesh>
      ))}

      {/* Community LiFePO4 Microgrid Substation & Inverter Bank on North Ridge */}
      <group position={[-1.95, 0.2, -2.42]}>
        <mesh position={[0, 0.03, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.74, 0.06, 0.44]} />
          <meshStandardMaterial color="#A9A59C" map={concreteTex} roughness={0.85} />
        </mesh>
        {[-0.2, 0.2].map((cx, idx) => (
          <group key={`cab-${idx}`} position={[cx, 0.26, 0]}>
            <RoundedBox args={[0.3, 0.4, 0.32]} radius={0.02} smoothness={3} castShadow receiveShadow>
              <meshStandardMaterial color="#DCE0E5" metalness={0.45} roughness={0.35} />
            </RoundedBox>
            <mesh position={[0, 0.06, 0.162]}>
              <boxGeometry args={[0.2, 0.018, 0.004]} />
              <meshStandardMaterial
                color={isBreak ? "#EF4444" : "#C6F432"}
                emissive={isBreak ? "#EF4444" : "#C6F432"}
                emissiveIntensity={1.3}
              />
            </mesh>
            <mesh position={[0, -0.06, -0.162]}>
              <boxGeometry args={[0.22, 0.18, 0.006]} />
              <meshStandardMaterial color="#2C323B" metalness={0.6} roughness={0.45} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Rear & Side Architectural Garden Bollard Lights (360-degree night illumination) */}
      {[
        [-3.2, -2.18],
        [-1.1, -2.18],
        [0.95, -2.18],
        [2.95, -2.18],
        [-3.95, 0.15],
        [3.95, -0.45],
      ].map(([bx, bz], idx) => (
        <group key={`bollard-${idx}`} position={[bx, 0.2, bz]}>
          <mesh position={[0, 0.09, 0]} castShadow>
            <cylinderGeometry args={[0.022, 0.026, 0.18, 12]} />
            <meshStandardMaterial color="#2E333B" metalness={0.65} roughness={0.38} />
          </mesh>
          <mesh position={[0, 0.19, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.035, 12]} />
            <meshStandardMaterial
              color="#FFF4D6"
              emissive={isBreak ? "#EF4444" : "#FFB85C"}
              emissiveIntensity={isNight || isBreak ? 2.4 : 0.25}
            />
          </mesh>
        </group>
      ))}

      {/* Paved courtyard terrace */}
      <mesh position={[0, 0.22, -0.94]} receiveShadow>
        <boxGeometry args={[7.5, 0.05, 3.07]} />
        <meshStandardMaterial color={palette.plazaSlab} map={paverTex} bumpMap={paverTex} bumpScale={0.5} roughness={0.85} />
      </mesh>

      {/* Meta SAM 3.1 laser scan sweep (AI Solution mode) */}
      {isHeal && (
        <group ref={scanBeamRef} position={[0, 0.27, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[9, 0.34]} />
            <meshBasicMaterial color="#C6F432" transparent opacity={0.2} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh>
            <boxGeometry args={[9, 0.006, 0.012]} />
            <meshBasicMaterial color="#E6FF8A" />
          </mesh>
        </group>
      )}

      {/* 2. STREET: curbs, asphalt, markings, bike lane and crosswalk */}
      <mesh position={[0, 0.225, 0.65]} receiveShadow castShadow>
        <boxGeometry args={[8.6, 0.05, 0.1]} />
        <meshStandardMaterial color="#C8C4BA" map={concreteTex} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.215, 1.25]} receiveShadow>
        <boxGeometry args={[8.6, 0.03, 1.1]} />
        <meshStandardMaterial
          color={camPreset === "boulevard" ? "#43474E" : "#3A3E44"}
          map={asphaltTex}
          bumpMap={asphaltTex}
          bumpScale={0.5}
          roughness={isBreak ? 0.35 : 0.92}
        />
      </mesh>
      {[0.74, 1.76].map((z) => (
        <mesh key={`edge-${z}`} position={[0, 0.2312, z]}>
          <boxGeometry args={[8.4, 0.003, 0.022]} />
          <meshStandardMaterial color="#ECEBE6" roughness={0.6} />
        </mesh>
      ))}
      {dashXs.map((x) => (
        <mesh key={`dash-${x}`} position={[x, 0.2312, 1.25]}>
          <boxGeometry args={[0.3, 0.003, 0.025]} />
          <meshStandardMaterial
            color={isBreak ? "#F59E0B" : "#ECEBE6"}
            emissive={isHeal || camPreset === "boulevard" ? "#C6F432" : "#000000"}
            emissiveIntensity={isHeal || camPreset === "boulevard" ? 0.35 : 0}
            roughness={0.6}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.2311, 1.63]}>
        <boxGeometry args={[8.4, 0.003, 0.15]} />
        <meshStandardMaterial color="#2F7A4C" roughness={0.8} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={`zebra-${i}`} position={[-0.35, 0.2314, 0.83 + i * 0.13]}>
          <boxGeometry args={[0.5, 0.003, 0.065]} />
          <meshStandardMaterial color="#F2F1EC" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.225, 1.84]} receiveShadow castShadow>
        <boxGeometry args={[8.6, 0.05, 0.08]} />
        <meshStandardMaterial color="#C8C4BA" map={concreteTex} roughness={0.85} />
      </mesh>

      {/* Storm surge street flooding (Storm Surge mode only) */}
      <mesh ref={floodSurgeMeshRef} position={[0, 0.248, 1.25]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <planeGeometry args={[8.5, 1.3]} />
        <meshPhysicalMaterial
          color="#5B6A66"
          normalMap={floodNormal}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          transparent
          opacity={0.82}
          roughness={0.08}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Street lamps */}
      {lampXs.map((x) => (
        <StreetLamp key={`lamp-${x}`} position={[x, 0.245, 0.56]} isNight={isNight} isBreak={isBreak} />
      ))}
      {(isNight || isBreak) &&
        [-1.2, 1.2].map((x) => (
          <pointLight key={`ll-${x}`} position={[x, 0.78, 0.72]} intensity={1.3} distance={2.4} decay={2} color="#FFD9A0" />
        ))}

      {/* Moving autonomous EV and parked EV */}
      <group ref={shuttleRef} position={[0, 0.23, 1.03]}>
        <EVCar color="#1F2A37" isNight={isNight || isBreak} accent="#C6F432" />
      </group>
      <group position={[-2.55, 0.245, 0.3]}>
        <EVCar color="#D9DDE2" isNight={false} />
      </group>

      {/* 3. RECESSED HYDROLOGICAL CANAL */}
      <group position={[0, 0, 2.55]}>
        <mesh position={[0, -0.005, 0]} receiveShadow>
          <boxGeometry args={[8.45, 0.03, 1.18]} />
          <meshStandardMaterial color="#3D4744" map={canalStone} roughness={0.9} />
        </mesh>
        {[-0.565, 0.565].map((z) => (
          <mesh key={`cw-${z}`} position={[0, 0.095, z]} receiveShadow castShadow>
            <boxGeometry args={[8.45, 0.22, 0.05]} />
            <meshStandardMaterial color="#9B978C" map={canalStone} bumpMap={canalStone} bumpScale={0.7} roughness={0.9} />
          </mesh>
        ))}
        {[-4.2, 4.2].map((x) => (
          <mesh key={`ce-${x}`} position={[x, 0.095, 0]} receiveShadow>
            <boxGeometry args={[0.05, 0.22, 1.18]} />
            <meshStandardMaterial color="#9B978C" map={canalStone} roughness={0.9} />
          </mesh>
        ))}
        {[-0.6, 0.6].map((z) => (
          <mesh key={`cp-${z}`} position={[0, 0.215, z]} receiveShadow castShadow>
            <boxGeometry args={[8.55, 0.035, 0.12]} />
            <meshStandardMaterial color="#CFCBC1" map={concreteTex} roughness={0.8} />
          </mesh>
        ))}
        <mesh ref={waterMeshRef} position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[8.35, 1.08]} />
          <meshPhysicalMaterial
            color={waterColor}
            normalMap={waterNormal}
            normalScale={new THREE.Vector2(0.35, 0.35)}
            emissive={camPreset === "hydro" ? "#0E7490" : "#000000"}
            emissiveIntensity={camPreset === "hydro" ? 0.25 : 0}
            transparent
            opacity={0.9}
            roughness={0.05}
            metalness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={1.6}
          />
          {!isBreak &&
            [
              [-3.1, 0.3],
              [-2.85, 0.22],
              [1.9, -0.28],
              [2.2, -0.2],
              [3.4, 0.25],
            ].map(([x, y], i) => (
              <mesh key={`lily-${i}`} position={[x, y, 0.004]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.045, 0.045, 0.004, 14]} />
                <meshStandardMaterial color="#4E7D3A" roughness={0.7} />
              </mesh>
            ))}
        </mesh>
        {[-3.6, -2.2, 1.4, 3.3].map((x, i) => (
          <group key={`reed-${x}`} position={[x, 0.1, i % 2 ? 0.47 : -0.47]}>
            {[0, 1, 2, 3, 4].map((j) => (
              <mesh key={j} position={[(j - 2) * 0.025, 0.08 + (j % 2) * 0.02, (j % 3) * 0.015]} rotation={[0, 0, (j - 2) * 0.12]}>
                <cylinderGeometry args={[0.004, 0.007, 0.18 + (j % 3) * 0.04, 5]} />
                <meshStandardMaterial color="#6F8A3E" roughness={0.85} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Steel and timber footbridge */}
      <group position={[-0.35, 0, 2.55]}>
        {[-0.27, 0.27].map((x) => (
          <mesh key={`st-${x}`} position={[x, 0.225, 0]} castShadow>
            <boxGeometry args={[0.04, 0.05, 1.5]} />
            <meshStandardMaterial color={ALU} metalness={0.7} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 0.262, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.64, 0.03, 1.5]} />
          <meshStandardMaterial color="#9A6038" map={deckTex} bumpMap={deckTex} bumpScale={0.5} roughness={0.7} />
        </mesh>
        {[-0.3, 0.3].map((x) => (
          <group key={`rl-${x}`}>
            {[-0.7, -0.35, 0, 0.35, 0.7].map((z) => (
              <mesh key={z} position={[x, 0.355, z]} castShadow>
                <boxGeometry args={[0.025, 0.16, 0.025]} />
                <meshStandardMaterial color={ALU} metalness={0.7} roughness={0.4} />
              </mesh>
            ))}
            <mesh position={[x, 0.44, 0]} castShadow>
              <boxGeometry args={[0.035, 0.025, 1.46]} />
              <meshStandardMaterial color="#9A6038" map={deckTex} roughness={0.6} />
            </mesh>
            <mesh position={[x, 0.36, 0]}>
              <boxGeometry args={[0.006, 0.006, 1.42]} />
              <meshStandardMaterial color="#C9CCD0" metalness={0.9} roughness={0.25} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 4. BUILDINGS */}
      <SolarPavilion
        position={[-0.25, 0.24, -0.65]}
        wallColor={palette.wallPrimary}
        roofColor={palette.roofPrimary}
        isNight={isNight}
        hasSolarPanels={hasSolar}
        simMode={simMode}
        focusHighlight={camPreset === "solar"}
        foliageColor={palette.foliageSecondary}
      />
      <Townhouse
        position={[-2.55, 0.24, -0.75]}
        rotationY={0.07}
        width={1.45}
        height={1.15}
        depth={1.45}
        wallColor={palette.wallSecondary}
        roofColor={palette.roofSecondary}
        isNight={isNight}
        hasSolarPanels={level >= 3 || camPreset === "solar"}
        simMode={simMode}
        seed={1}
        foliageColor={palette.foliageSecondary}
      />
      <Townhouse
        position={[2.45, 0.24, -0.82]}
        rotationY={-0.06}
        width={1.52}
        height={1.08}
        depth={1.42}
        wallColor={palette.wallAccent}
        roofColor={palette.roofSecondary}
        isNight={isNight}
        hasSolarPanels={level >= 4 || camPreset === "solar"}
        simMode={simMode}
        seed={2}
        foliageColor={palette.foliageSecondary}
      />

      {/* Front garden hedges */}
      {[2.0, 2.9].map((x) => (
        <RoundedBox key={`hedge-${x}`} args={[0.5, 0.13, 0.12]} radius={0.05} smoothness={3} position={[x, 0.31, 0.36]} castShadow receiveShadow>
          <meshStandardMaterial color={palette.foliagePrimary} map={grassFront} bumpMap={grassFront} bumpScale={1} roughness={0.95} />
        </RoundedBox>
      ))}

      {/* 5. RAINWATER CISTERN AND CONDUIT */}
      {(hasCistern || isHeal) && (
        <RainCistern position={[1.42, 0.245, -0.28]} simMode={simMode} pipeColor={palette.pipeCopper} />
      )}
      {showConduit && (
        <group>
          <mesh position={[1.42, 0.252, 0.85]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.05, 2.2]} />
            <meshBasicMaterial color="#22D3EE" transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh position={[1.42, 0.2, 1.98]}>
            <sphereGeometry args={[0.035, 14, 10]} />
            <meshBasicMaterial color="#67E8F9" />
          </mesh>
        </group>
      )}

      {/* 6. MUNICIPAL WATER TOWER */}
      <WaterTower position={[1.75, 0.245, -2.35]} />

      {/* 7. WIND TURBINES */}
      <WindTurbine position={[-3.05, 0.245, -2.25]} height={2.3} bladeLen={0.78} rotorRef={turbine1Ref} />
      <WindTurbine position={[-0.95, 0.245, -2.45]} height={1.9} bladeLen={0.64} rotorRef={turbine2Ref} />

      {/* 8. FRONT LAWN: conservatory, sorting hub and biopore matrix */}
      {(hasCompost || isHeal) && (
        <group>
          <GeodesicConservatory
            position={[-2.6, 0.2, 3.55]}
            isNight={isNight}
            isHeal={isHeal}
            foliageColor={palette.foliageSecondary}
          />
          {[
            { x: -1.95, c: "#1E7A4A" },
            { x: -1.72, c: "#D08C2A" },
            { x: -1.49, c: "#2A7FA0" },
          ].map((bin) => (
            <group key={`bin-${bin.x}`} position={[bin.x, 0.2, 3.55]}>
              <RoundedBox args={[0.17, 0.22, 0.18]} radius={0.02} smoothness={3} position={[0, 0.11, 0]} castShadow receiveShadow>
                <meshStandardMaterial color={bin.c} roughness={0.5} />
              </RoundedBox>
              <RoundedBox args={[0.18, 0.03, 0.19]} radius={0.012} smoothness={2} position={[0, 0.235, -0.005]} castShadow>
                <meshStandardMaterial color="#2C2F33" roughness={0.6} />
              </RoundedBox>
              <mesh position={[0, 0.13, 0.091]}>
                <planeGeometry args={[0.08, 0.06]} />
                <meshStandardMaterial color="#F4F4F2" roughness={0.6} />
              </mesh>
            </group>
          ))}
        </group>
      )}
      {[0.5, 0.9, 1.3, 1.7, 2.1, 2.5].map((x) => (
        <BioporeWell key={`bio-${x}`} position={[x, 0.2, 3.55]} isBreak={isBreak} isHeal={isHeal} />
      ))}
      <mesh ref={pulseRingRef} position={[1.5, 0.215, 3.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.19, 0.24, 36]} />
        <meshBasicMaterial color={isBreak ? "#EF4444" : "#C6F432"} transparent opacity={0.75} depthWrite={false} />
      </mesh>

      {/* 9. URBAN FOREST AND LAWN DETAIL */}
      {TREE_LAYOUT.map((tree, idx) =>
        tree.k === "broad" ? (
          <BroadleafTree
            key={`tree-${idx}`}
            position={tree.p}
            scale={tree.s}
            color={idx % 2 === 0 ? palette.foliagePrimary : palette.foliageSecondary}
            seed={idx + 1}
          />
        ) : (
          <ConiferTree key={`tree-${idx}`} position={tree.p} scale={tree.s} color={palette.foliagePrimary} />
        )
      )}
      <LawnDetails turfColor={palette.turf} />

      {/* 10. ATMOSPHERE */}
      <AtmosphericParticleField simMode={simMode} isNight={isNight} />
      <StormRain active={isBreak} />
      <Float speed={1} rotationIntensity={0.03} floatIntensity={0.2}>
        <SoftCloud
          position={isBreak ? [-2.2, 2.75, -1.6] : [-2.4, 3.1, -1.8]}
          scale={isBreak ? 1.45 : 1}
          color={isBreak ? "#5A646F" : isNight ? "#3B4556" : "#FFFFFF"}
          opacity={isBreak ? 0.96 : 0.92}
        />
        <SoftCloud
          position={isBreak ? [1.8, 2.9, -2.2] : [2.7, 3.45, -2.6]}
          scale={isBreak ? 1.3 : 0.75}
          color={isBreak ? "#4B5560" : isNight ? "#36404F" : "#FAFBFC"}
          opacity={isBreak ? 0.96 : 0.9}
        />
        {isBreak && <SoftCloud position={[0, 3.1, 0.6]} scale={1.2} color="#525C67" opacity={0.92} />}
      </Float>
    </group>
  );
}

/** Random cold-white lightning flashes during Storm Surge mode. */
function StormLightning({ active }: { active: boolean }) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const timing = useRef({ next: 2, end: 0 });
  useFrame(({ clock }) => {
    const l = lightRef.current;
    if (!l) return;
    if (!active) {
      l.intensity = 0;
      return;
    }
    const t = clock.getElapsedTime();
    const s = timing.current;
    if (t > s.next) {
      s.end = t + 0.08 + Math.random() * 0.14;
      s.next = t + 2.5 + Math.random() * 4.5;
    }
    l.intensity = t < s.end ? 4.2 * (0.55 + Math.random() * 0.45) : 0;
  });
  return <directionalLight ref={lightRef} position={[-4, 9, 2]} color="#DCE8FF" intensity={0} />;
}

/** Offline studio environment (Lightformers) for physically based reflections. */
function StudioEnvironment({ simMode, isNight }: { simMode: SimMode; isNight: boolean }) {
  const isBreak = simMode === "break";
  const top = isNight ? "#8FB0FF" : isBreak ? "#A9BBCF" : "#FFF6E8";
  return (
    <Environment key={`${simMode}-${isNight}`} resolution={256} frames={1}>
      <Lightformer form="rect" intensity={isNight ? 0.5 : isBreak ? 0.9 : 2.2} color={top} position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[16, 16, 1]} />
      <Lightformer form="rect" intensity={isNight ? 0.25 : 1.1} color="#DFE9FF" position={[-8, 3, 4]} rotation-y={Math.PI / 2} scale={[10, 4, 1]} />
      <Lightformer form="rect" intensity={isNight ? 0.2 : 0.9} color="#FFF1D6" position={[8, 3, -4]} rotation-y={-Math.PI / 2} scale={[10, 4, 1]} />
      <Lightformer form="ring" intensity={isNight ? 0.4 : 1.3} color={simMode === "heal" ? "#C6F432" : "#FFFFFF"} position={[4, 5, 8]} scale={3} />
      <Lightformer form="rect" intensity={0.35} color="#8A8F84" position={[0, -4, 0]} rotation-x={-Math.PI / 2} scale={[20, 20, 1]} />
      {isNight && <Lightformer form="circle" intensity={1.2} color="#FFB45C" position={[0, 1, 6]} scale={2} />}
    </Environment>
  );
}



export default function EcoIslandCanvas(props: EcoIslandProps) {
  const [camPreset, setCamPreset] = useState<CameraViewPreset>("overview");
  const [autoOrbit, setAutoOrbit] = useState(true);
  const [internalSimMode, setInternalSimMode] = useState<SimMode>("run");
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const palette = TOWN_PALETTES[props.biome] ?? TOWN_PALETTES.mediterranean;
  const simMode: SimMode = props.simMode ?? internalSimMode;
  const isBreak = simMode === "break";
  const isHeal = simMode === "heal";

  const bgHex =
    simMode === "break"
      ? palette.skyStorm
      : props.isNight
      ? palette.skyNight
      : palette.skyDay;
  const isId = props.locale === "id";
  const activePresetMeta = CAMERA_PRESET_CONFIG[camPreset];

  const modeFeedback = useMemo(() => {
    if (simMode === "break") {
      return {
        pillBg: "bg-[#ef4444]/20 border-[#ef4444]/50 text-[#fecaca]",
        dot: "bg-[#ef4444]",
        statusEn: "STORM SURGE STRESS TEST: +18cm Street Flood · Roof +4.2°C",
        statusId: "UJI BADAI EKSTREM: Banjir Jalan +18cm · Suhu Atap +4.2°C",
      };
    }
    if (simMode === "heal") {
      return {
        pillBg: "bg-[#c6f432]/20 border-[#c6f432]/50 text-[#c6f432]",
        dot: "bg-[#c6f432]",
        statusEn: `SAM 3.1 AI RETROFIT: Dual PV (${(props.solarKwp * 1.25).toFixed(1)} kWp) · 0cm Flood · ${props.bioporeUnits} Biopores Active`,
        statusId: `SOLUSI AI SAM 3.1: Panel Ganda (${(props.solarKwp * 1.25).toFixed(1)} kWp) · Bebas Banjir · ${props.bioporeUnits} Biopori Aktif`,
      };
    }
    return {
      pillBg: "bg-white/10 border-white/15 text-white",
      dot: "bg-[#10b981]",
      statusEn: `${activePresetMeta.titleEn}: ${props.solarKwp} kWp Solar · ${Math.round(props.rainLitersYear / 1000)}k L/yr Rainwater`,
      statusId: `${activePresetMeta.titleId}: ${props.solarKwp} kWp Surya · ${Math.round(props.rainLitersYear / 1000)}k L/thn Air Hujan`,
    };
  }, [
    simMode,
    activePresetMeta,
    props.solarKwp,
    props.rainLitersYear,
    props.bioporeUnits,
  ]);

  return (
    <div
      data-lenis-prevent
      className="relative h-full w-full overflow-hidden select-none transition-colors duration-500"
      style={{ backgroundColor: bgHex }}
    >
      <Canvas
        shadows="soft"
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: isBreak ? 0.92 : props.isNight ? 0.96 : 1.06,
        }}
        camera={{ position: [7.4, 4.9, 7.4], fov: 32 }}
      >
        <color attach="background" args={[bgHex]} />
        <fog attach="fog" args={[bgHex, 15, 32]} />

        <StudioEnvironment simMode={simMode} isNight={props.isNight} />

        <hemisphereLight
          args={[
            isBreak ? "#93A8C2" : props.isNight ? "#476288" : "#FFFDF8",
            palette.turf,
            isBreak ? 0.42 : props.isNight ? 0.36 : 0.68,
          ]}
        />

        <directionalLight
          castShadow
          position={props.isNight ? [-6, 8.5, -4] : [8.5, 13.5, 6.8]}
          intensity={isBreak ? 0.72 : props.isNight ? 0.65 : 1.95}
          color={
            isBreak
              ? "#93C5FD"
              : props.isNight
              ? "#93C5FD"
              : "#FFF8EB"
          }
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={1}
          shadow-camera-far={28}
          shadow-camera-left={-6.2}
          shadow-camera-right={6.2}
          shadow-camera-top={6.2}
          shadow-camera-bottom={-6.2}
          shadow-bias={-0.0003}
        />

        <StormLightning active={isBreak} />

        {(props.isNight || isBreak || isHeal) && (
          <pointLight
            position={[0, 2.2, 0.8]}
            intensity={isHeal ? 1.8 : 1.4}
            color={
              isHeal
                ? "#34D399"
                : isBreak
                ? "#F87171"
                : "#FDE68A"
            }
            distance={10}
          />
        )}

        <LivingTownScene {...props} simMode={simMode} camPreset={camPreset} />

        <ContactShadows
          position={[0, -1.32, 0]}
          opacity={0.38}
          scale={14.5}
          blur={2.2}
          far={4.6}
        />

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          zoomSpeed={0.95}
          enableDamping={true}
          dampingFactor={0.08}
          minDistance={2.8}
          maxDistance={13.8}
          minPolarAngle={Math.PI / 7.2}
          maxPolarAngle={Math.PI / 2.18}
          autoRotate={autoOrbit}
          autoRotateSpeed={isBreak ? 0.75 : 0.42}
        />

        <CameraRigController preset={camPreset} controlsRef={controlsRef} />
      </Canvas>

      {/* Built-in Top-Left Mode Switcher when parent page does not supply simMode (e.g. /dashboard & /login) */}
      {props.simMode === undefined && !props.hideHudOverlays && !props.compact && (
        <div className="country-pill-rail pointer-events-auto absolute top-3 left-3 right-3 z-10 flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-full border border-white/12 bg-[#08090c]/88 p-1 shadow-lg backdrop-blur-xl sm:top-4 sm:right-auto sm:left-4">
          {(
            [
              { id: "run", labelEn: "01 Normal Day", labelId: "01 Hari Normal", dot: "bg-[#10b981]" },
              { id: "break", labelEn: "02 Storm Surge", labelId: "02 Uji Badai", dot: "bg-[#ef4444]" },
              { id: "heal", labelEn: "03 AI Solution", labelId: "03 Solusi AI", dot: "bg-[#c6f432]" },
            ] as const
          ).map((tab) => {
            const active = simMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setInternalSimMode(tab.id)}
                className={`flex min-h-[32px] shrink-0 flex-1 sm:flex-initial justify-center cursor-pointer items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 font-mono text-[10px] sm:text-[11px] font-medium whitespace-nowrap transition ${
                  active
                    ? "bg-white font-semibold text-[#08090c] shadow-sm"
                    : "text-[#c9c7c0] hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${tab.dot}`} />
                <span>{isId ? tab.labelId : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Minimalist, Clean HUD Overlays inside 3D Stage */}
      {!props.hideHudOverlays && !props.compact && (
        <div className="pointer-events-none absolute right-3 bottom-3 left-3 z-10 flex items-end justify-end sm:right-4 sm:bottom-4 sm:left-auto">
          {/* Interactive 3D Camera Focus Bar (All 5 Angles including Rear 360°) */}
          <div className="country-pill-rail pointer-events-auto flex w-full sm:w-auto max-w-full flex-nowrap items-center justify-between sm:justify-end gap-1 overflow-x-auto rounded-full border border-white/15 bg-[#08090c]/90 p-1 text-white shadow-xl backdrop-blur-xl">
            {(
              [
                { id: "overview", labelEn: "Overview", labelId: "Utama" },
                { id: "solar", labelEn: "Solar Hub", labelId: "Atap Surya" },
                { id: "hydro", labelEn: "Hydro Canal", labelId: "Kanal Air" },
                { id: "boulevard", labelEn: "EV Street", labelId: "Jalan EV" },
                { id: "rear", labelEn: "North Ridge", labelId: "Sisi Belakang" },
              ] as const
            ).map((preset) => {
              const active = camPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setCamPreset(preset.id)}
                  className={`min-h-[32px] shrink-0 cursor-pointer rounded-full px-2.5 sm:px-3 py-1 font-mono text-[10px] sm:text-[11px] font-medium whitespace-nowrap transition ${
                    active
                      ? "bg-[#c6f432] font-bold text-[#080808]"
                      : "text-[#c9c7c0] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {isId ? preset.labelId : preset.labelEn}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setAutoOrbit((o) => !o)}
              className={`min-h-[32px] shrink-0 cursor-pointer rounded-full px-2.5 py-1 font-mono text-[10px] sm:text-[11px] font-semibold whitespace-nowrap transition ${
                autoOrbit
                  ? "bg-white/15 text-[#c6f432]"
                  : "bg-white/5 text-[#aaa9ad]"
              }`}
            >
              {autoOrbit ? "Orbit: ON" : "Orbit: OFF"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
