"use client";

import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, ContactShadows } from "@react-three/drei";
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

export type CameraViewPreset = "overview" | "solar" | "hydro" | "boulevard";

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
    turf: "#4D7C4D",
    subsoil: "#8C6B4F",
    bedrock: "#333942",
    wallPrimary: "#FBF9F5",
    wallSecondary: "#EFECE4",
    wallAccent: "#E2CCB2",
    roofPrimary: "#A84428",
    roofSecondary: "#252F3E",
    pipeCopper: "#D97736",
    cisternWater: "#1E9E5A",
    foliagePrimary: "#2D5A38",
    foliageSecondary: "#5E8C49",
  },
  temperate: {
    skyDay: "#E6EAE8",
    skyStorm: "#19222D",
    skyNight: "#0A0E14",
    plazaSlab: "#DCDFD9",
    turf: "#466E47",
    subsoil: "#734D33",
    bedrock: "#323D4D",
    wallPrimary: "#F8F9FA",
    wallSecondary: "#E9ECEF",
    wallAccent: "#DDE5B6",
    roofPrimary: "#232E3E",
    roofSecondary: "#6E1A1A",
    pipeCopper: "#D97736",
    cisternWater: "#2A9DBD",
    foliagePrimary: "#2B4A31",
    foliageSecondary: "#588863",
  },
  tropical: {
    skyDay: "#E6EFEA",
    skyStorm: "#162329",
    skyNight: "#09100E",
    plazaSlab: "#DCE3DD",
    turf: "#327A58",
    subsoil: "#6B412F",
    bedrock: "#28323E",
    wallPrimary: "#FAF9F5",
    wallSecondary: "#F1EFE7",
    wallAccent: "#D8F3DC",
    roofPrimary: "#8C2F12",
    roofSecondary: "#1E4D38",
    pipeCopper: "#E07A5F",
    cisternWater: "#0D9488",
    foliagePrimary: "#1D4D38",
    foliageSecondary: "#3E996E",
  },
  arid: {
    skyDay: "#EFEAE1",
    skyStorm: "#28221E",
    skyNight: "#100E0C",
    plazaSlab: "#E6DEC8",
    turf: "#8A8252",
    subsoil: "#94653E",
    bedrock: "#423E39",
    wallPrimary: "#FDFBF7",
    wallSecondary: "#F3E9D2",
    wallAccent: "#E9D8A6",
    roofPrimary: "#B03A0B",
    roofSecondary: "#5E280B",
    pipeCopper: "#CA6702",
    cisternWater: "#0284C7",
    foliagePrimary: "#4E7F0B",
    foliageSecondary: "#6BA811",
  },
  continental: {
    skyDay: "#E5E9EC",
    skyStorm: "#18202B",
    skyNight: "#0A0D12",
    plazaSlab: "#D8DEE3",
    turf: "#3E6122",
    subsoil: "#5E4C41",
    bedrock: "#242E3D",
    wallPrimary: "#F8FAFC",
    wallSecondary: "#E2E8F0",
    wallAccent: "#CBD5E1",
    roofPrimary: "#1A2436",
    roofSecondary: "#781515",
    pipeCopper: "#D97736",
    cisternWater: "#0284C7",
    foliagePrimary: "#214F3B",
    foliageSecondary: "#327556",
  },
  polar: {
    skyDay: "#E6EEF4",
    skyStorm: "#172130",
    skyNight: "#080C14",
    plazaSlab: "#E2E8F0",
    turf: "#9AD1F0",
    subsoil: "#546478",
    bedrock: "#1A2434",
    wallPrimary: "#FFFFFF",
    wallSecondary: "#E2E8F0",
    wallAccent: "#CBD5E1",
    roofPrimary: "#0F172A",
    roofSecondary: "#1E3A8A",
    pipeCopper: "#F59E0B",
    cisternWater: "#38BDF8",
    foliagePrimary: "#0F665F",
    foliageSecondary: "#129E90",
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
    pos: [7.5, 5.1, 7.5],
    target: [0, 0.2, 0],
    titleEn: "District Twin Overview",
    titleId: "Tampilan Utuh Distrik 3D",
    detailEn: "Full spatial view of CLT Solar Hub, Hydro Canal, Biopores & EV Street",
    detailId: "Tampilan menyeluruh Hub Surya CLT, Kanal Air, Biopori & Jalan EV",
  },
  solar: {
    pos: [2.6, 3.8, 3.6],
    target: [-0.25, 1.35, -0.55],
    titleEn: "Monocrystalline Solar Roof Array",
    titleId: "Atap Panel Surya Monokristalin",
    detailEn: "Close-up of bifacial PV modules, sun-tracking tilt & inverter busbars",
    detailId: "Inspeksi dekat modul surya bifacial, kemiringan panel & inverter",
  },
  hydro: {
    pos: [3.9, 2.7, 5.2],
    target: [0.85, 0.45, 1.55],
    titleEn: "Hydrological Cistern & Retention Canal",
    titleId: "Tangki Air Hujan & Kanal Retensi",
    detailEn: "Inspect rainwater harvesting tank, copper pipes & biopore drainage wells",
    detailId: "Inspeksi tangki panen hujan, pipa tembaga & sumur resapan biopori",
  },
  boulevard: {
    pos: [-4.2, 2.35, 4.8],
    target: [-0.4, 0.35, 1.35],
    titleEn: "Autonomous EV Corridor & Geodesic Dome",
    titleId: "Koridor EV Otonom & Kubah Botani",
    detailEn: "Street-level view of clean micro-transit shuttle & circular sorting hub",
    detailId: "Tampilan koridor shuttle listrik otonom & stasiun daur ulang sirkular",
  },
};

/**
 * Smoothly interpolates camera position and OrbitControls target when user switches camera presets
 */
function CameraRigController({
  preset,
  controlsRef,
}: {
  preset: CameraViewPreset;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const desiredPos = useMemo(
    () => new THREE.Vector3(...CAMERA_PRESET_CONFIG[preset].pos),
    [preset]
  );
  const desiredTarget = useMemo(
    () => new THREE.Vector3(...CAMERA_PRESET_CONFIG[preset].target),
    [preset]
  );
  const lastPresetRef = useRef<CameraViewPreset>(preset);
  const transitionFramesRef = useRef<number>(0);

  if (lastPresetRef.current !== preset) {
    lastPresetRef.current = preset;
    transitionFramesRef.current = 55;
  }

  useFrame((state, delta) => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;
    const step = Math.min(1, delta * 5.5);
    ctrl.target.lerp(desiredTarget, step);

    if (transitionFramesRef.current > 0) {
      state.camera.position.lerp(desiredPos, step);
      transitionFramesRef.current -= 1;
    }
    ctrl.update();
  });

  return null;
}

/**
 * GPU-friendly atmospheric particle field:
 * - "run": gentle rising micro-climate pollen/photons
 * - "break": dense high-velocity storm rain streaks
 * - "heal": bright emerald/lime AI telemetry nodes rising upward
 */
function AtmosphericParticleField({
  simMode = "run",
  isNight,
}: {
  simMode?: "run" | "break" | "heal";
  isNight: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 96;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const s1 = Math.sin(i * 12.9898) * 43758.5453;
      const s2 = Math.sin(i * 78.233) * 43758.5453;
      const s3 = Math.sin(i * 39.346) * 43758.5453;
      arr[i * 3] = (s1 - Math.floor(s1) - 0.5) * 9.2;
      arr[i * 3 + 1] = (s2 - Math.floor(s2)) * 3.8 + 0.25;
      arr[i * 3 + 2] = (s3 - Math.floor(s3) - 0.5) * 7.8;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    const pts = pointsRef.current;
    if (!pts) return;
    const posAttr = pts.geometry.getAttribute(
      "position"
    ) as THREE.BufferAttribute;
    const speed =
      simMode === "break" ? -4.8 : simMode === "heal" ? 1.15 : 0.42;

    for (let i = 0; i < count; i++) {
      let y = posAttr.getY(i) + delta * speed;
      if (simMode === "break" && y < 0.15) y = 4.0;
      if (simMode !== "break" && y > 4.0) y = 0.2;
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;
  });

  const particleColor =
    simMode === "break"
      ? "#60A5FA"
      : simMode === "heal"
      ? "#C6F432"
      : isNight
      ? "#FDE68A"
      : "#10B981";

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={particleColor}
        size={simMode === "break" ? 0.095 : simMode === "heal" ? 0.11 : 0.08}
        transparent
        opacity={simMode === "break" ? 0.9 : 0.78}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * Realistic Solar PV Module with anodized silver frame, deep silicon cells, and busbars
 */
function RealisticSolarPanel({
  position,
  width = 0.46,
  depth = 0.82,
  simMode = "run",
}: {
  position: [number, number, number];
  width?: number;
  depth?: number;
  simMode?: "run" | "break" | "heal";
}) {
  const isHeal = simMode === "heal";
  const isBreak = simMode === "break";
  return (
    <group position={position}>
      {/* Anodized Aluminum Frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, 0.032, depth]} />
        <meshStandardMaterial
          color="#CBD5E1"
          metalness={0.85}
          roughness={0.22}
        />
      </mesh>
      {/* Silicon Photovoltaic Cell Surface */}
      <mesh position={[0, 0.018, 0]}>
        <boxGeometry args={[width - 0.035, 0.008, depth - 0.035]} />
        <meshPhysicalMaterial
          color={isBreak ? "#1E293B" : "#081226"}
          emissive={isHeal ? "#10B981" : isBreak ? "#EF4444" : "#1D4ED8"}
          emissiveIntensity={isHeal ? 0.55 : isBreak ? 0.18 : 0.28}
          metalness={0.92}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </mesh>
      {/* Fine Silver Busbar Grid Lines */}
      {[-width * 0.18, width * 0.18].map((bx, i) => (
        <mesh key={`bus-${i}`} position={[bx, 0.023, 0]}>
          <boxGeometry args={[0.008, 0.002, depth - 0.05]} />
          <meshStandardMaterial
            color={isHeal ? "#C6F432" : "#94A3B8"}
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Central Verdara Architectural Solar Pavilion & Stepped CLT Hub
 */
function GrandSolarPavilion({
  position,
  wallColor,
  roofColor,
  isNight,
  hasSolarPanels,
  simMode = "run",
  focusHighlight = false,
}: {
  position: [number, number, number];
  wallColor: string;
  roofColor: string;
  isNight: boolean;
  hasSolarPanels: boolean;
  simMode?: "run" | "break" | "heal";
  focusHighlight?: boolean;
}) {
  const isBreak = simMode === "break";
  const isHeal = simMode === "heal";

  return (
    <group position={position}>
      {/* Stepped Travertine & Architectural Concrete Plinth */}
      <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
        <boxGeometry args={[2.82, 0.12, 2.08]} />
        <meshStandardMaterial color="#949692" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.14, 0]} receiveShadow castShadow>
        <boxGeometry args={[2.66, 0.06, 1.94]} />
        <meshStandardMaterial color="#B4B6B0" roughness={0.68} />
      </mesh>

      {/* Ground Floor Architectural CLT & Stucco Core */}
      <mesh position={[0, 0.6, 0]} receiveShadow castShadow>
        <boxGeometry args={[2.52, 0.88, 1.78]} />
        <meshStandardMaterial
          color={wallColor}
          roughness={0.55}
          metalness={0.04}
        />
      </mesh>

      {/* Warm Timber Soffit Overhang */}
      <mesh position={[0, 1.03, 0.05]} castShadow>
        <boxGeometry args={[2.64, 0.05, 1.92]} />
        <meshStandardMaterial color="#8C5230" roughness={0.6} />
      </mesh>

      {/* Panoramic Double-Height Glass Curtain Wall Atrium (Front) */}
      <mesh position={[0, 0.58, 0.895]}>
        <boxGeometry args={[1.78, 0.72, 0.03]} />
        <meshPhysicalMaterial
          color={isNight ? "#FEF08A" : isHeal ? "#CCFBF1" : "#1E293B"}
          emissive={
            isNight
              ? "#F59E0B"
              : isHeal
              ? "#10B981"
              : isBreak
              ? "#EF4444"
              : "#0EA5E9"
          }
          emissiveIntensity={isNight ? 1.35 : isHeal ? 0.45 : 0.22}
          metalness={0.35}
          roughness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.06}
        />
      </mesh>

      {/* Vertical Timber Brise-Soleil Fin Louvers */}
      {[-0.78, -0.52, -0.26, 0, 0.26, 0.52, 0.78].map((xOff, i) => (
        <mesh key={`louver-${i}`} position={[xOff, 0.58, 0.915]} castShadow>
          <boxGeometry args={[0.032, 0.74, 0.055]} />
          <meshStandardMaterial color="#8C5230" roughness={0.62} />
        </mesh>
      ))}

      {/* Cantilevered Second-Story Penthouse & Green Terrace */}
      <mesh position={[-0.24, 1.3, -0.06]} receiveShadow castShadow>
        <boxGeometry args={[1.92, 0.54, 1.48]} />
        <meshStandardMaterial color={wallColor} roughness={0.55} />
      </mesh>

      {/* East Roof Garden Terrace Planter & Shrubs */}
      <group position={[0.94, 1.08, 0.04]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.44, 0.1, 1.38]} />
          <meshStandardMaterial color="#1E4D38" roughness={0.72} />
        </mesh>
        {[-0.42, 0, 0.42].map((zOff, idx) => (
          <mesh key={`shrub-${idx}`} position={[0, 0.11, zOff]} castShadow>
            <sphereGeometry args={[0.13, 12, 10]} />
            <meshStandardMaterial
              color={isHeal ? "#10B981" : "#2D6A4F"}
              roughness={0.65}
            />
          </mesh>
        ))}
      </group>

      {/* Penthouse Clerestory Ribbon Window */}
      <mesh position={[-0.24, 1.32, 0.685]}>
        <boxGeometry args={[1.56, 0.28, 0.025]} />
        <meshPhysicalMaterial
          color={isNight ? "#FDE68A" : "#334155"}
          emissive={isNight ? "#F59E0B" : isHeal ? "#34D399" : "#38BDF8"}
          emissiveIntensity={isNight ? 1.25 : 0.28}
          clearcoat={1}
          roughness={0.1}
        />
      </mesh>

      {/* Home Battery Wallpack (Tesla Powerwall style) on East Facade */}
      <group position={[1.27, 0.52, 0.25]}>
        <mesh castShadow>
          <boxGeometry args={[0.06, 0.42, 0.28]} />
          <meshStandardMaterial
            color="#F8FAFC"
            metalness={0.5}
            roughness={0.25}
          />
        </mesh>
        <mesh position={[0.035, 0, 0]}>
          <boxGeometry args={[0.01, 0.32, 0.04]} />
          <meshStandardMaterial
            color={isBreak ? "#EF4444" : "#C6F432"}
            emissive={isBreak ? "#EF4444" : "#C6F432"}
            emissiveIntensity={1.2}
          />
        </mesh>
      </group>

      {/* Asymmetric Architectural Butterfly / Pitched Solar Roof */}
      <group position={[-0.12, 1.58, 0]}>
        {/* South-Facing Slope */}
        <mesh
          position={[0, 0.22, 0.36]}
          rotation={[Math.PI / 5.6, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.44, 0.08, 1.02]} />
          <meshStandardMaterial
            color={isBreak ? "#991B1B" : roofColor}
            emissive={isBreak ? "#EF4444" : "#000000"}
            emissiveIntensity={isBreak ? 0.35 : 0}
            roughness={0.5}
          />
        </mesh>
        {/* North-Facing Slope */}
        <mesh
          position={[0, 0.22, -0.36]}
          rotation={[-Math.PI / 5.6, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.44, 0.08, 1.02]} />
          <meshStandardMaterial color={roofColor} roughness={0.5} />
        </mesh>

        {/* High-Efficiency Bifacial Monocrystalline Solar PV Array (South Slope) */}
        {(hasSolarPanels || isHeal) && (
          <group
            position={[0, 0.28, 0.36]}
            rotation={[Math.PI / 5.6, 0, 0]}
          >
            {[-0.81, -0.27, 0.27, 0.81].map((xPos, idx) => (
              <RealisticSolarPanel
                key={`pv-south-${idx}`}
                position={[xPos, 0.02, 0]}
                width={0.48}
                depth={0.82}
                simMode={simMode}
              />
            ))}
          </group>
        )}

        {/* In "heal" (AI Solution) or Solar Focus mode, second array on North Slope activates */}
        {(isHeal || focusHighlight) && (
          <group
            position={[0, 0.28, -0.36]}
            rotation={[-Math.PI / 5.6, 0, 0]}
          >
            {[-0.81, -0.27, 0.27, 0.81].map((xPos, idx) => (
              <RealisticSolarPanel
                key={`pv-north-${idx}`}
                position={[xPos, 0.02, 0]}
                width={0.48}
                depth={0.82}
                simMode="heal"
              />
            ))}
          </group>
        )}
      </group>
    </group>
  );
}

function PitchedTownhouse({
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
  simMode?: "run" | "break" | "heal";
}) {
  const isBreak = simMode === "break";
  const isHeal = simMode === "heal";

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
        <boxGeometry args={[width + 0.16, 0.12, depth + 0.16]} />
        <meshStandardMaterial color="#8B8C89" roughness={0.8} />
      </mesh>

      <mesh position={[0, height / 2 + 0.12, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={wallColor} roughness={0.62} />
      </mesh>

      {[-width * 0.24, width * 0.24].map((xOff, i) => (
        <mesh
          key={`win-front-${i}`}
          position={[xOff, height * 0.62 + 0.12, depth / 2 + 0.015]}
        >
          <boxGeometry args={[width * 0.23, height * 0.34, 0.02]} />
          <meshPhysicalMaterial
            color={isNight ? "#FDE68A" : "#334155"}
            emissive={isNight ? "#F59E0B" : isHeal ? "#10B981" : "#0F172A"}
            emissiveIntensity={isNight ? 1.4 : isHeal ? 0.35 : 0.15}
            clearcoat={1}
            roughness={0.12}
          />
        </mesh>
      ))}

      <mesh position={[0, 0.36, depth / 2 + 0.015]}>
        <boxGeometry args={[0.28, 0.48, 0.025]} />
        <meshStandardMaterial color="#4A3525" roughness={0.75} />
      </mesh>

      <group position={[0, height + 0.12, 0]}>
        <mesh
          position={[0, 0.25, depth * 0.24]}
          rotation={[Math.PI / 5.2, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[width + 0.18, 0.08, depth * 0.68]} />
          <meshStandardMaterial
            color={isBreak ? "#7F1D1D" : roofColor}
            emissive={isBreak ? "#EF4444" : "#000000"}
            emissiveIntensity={isBreak ? 0.25 : 0}
            roughness={0.55}
          />
        </mesh>
        <mesh
          position={[0, 0.25, -depth * 0.24]}
          rotation={[-Math.PI / 5.2, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[width + 0.18, 0.08, depth * 0.68]} />
          <meshStandardMaterial color={roofColor} roughness={0.55} />
        </mesh>

        {(hasSolarPanels || isHeal) && (
          <group
            position={[0, 0.31, depth * 0.24]}
            rotation={[Math.PI / 5.2, 0, 0]}
          >
            {[-width * 0.3, 0, width * 0.3].map((xPos, idx) => (
              <RealisticSolarPanel
                key={`solar-${idx}`}
                position={[xPos, 0.02, 0]}
                width={width * 0.28}
                depth={depth * 0.54}
                simMode={simMode}
              />
            ))}
          </group>
        )}
      </group>
    </group>
  );
}

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
  const scanBeamRef = useRef<THREE.Mesh>(null);
  const waterMeshRef = useRef<THREE.Mesh>(null);
  const floodSurgeMeshRef = useRef<THREE.Mesh>(null);
  const shuttleRef = useRef<THREE.Group>(null);

  const hasSolar = level >= 2 || unlockedItems.includes("solar_array");
  const hasCistern = level >= 2 || unlockedItems.includes("rain_cistern");
  const hasCompost =
    level >= 2 ||
    unlockedItems.includes("compost_dome") ||
    unlockedItems.includes("sorting_station");

  const trees = useMemo(
    () =>
      [
        [-3.45, 0.22, -2.3, 1.12],
        [-3.6, 0.22, -0.7, 0.94],
        [3.35, 0.22, -2.25, 1.08],
        [3.55, 0.22, 0.85, 0.98],
        [-3.2, 0.22, 1.85, 0.95],
        [0.5, 0.22, -2.95, 0.9],
        [-1.35, 0.22, -2.9, 1.02],
        [2.35, 0.22, -2.85, 0.88],
      ] as [number, number, number, number][],
    []
  );

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const spinSpeed =
      simMode === "break" ? 5.8 : simMode === "heal" ? 3.1 : 2.1;

    if (turbine1Ref.current) {
      turbine1Ref.current.rotation.z -= delta * spinSpeed;
    }
    if (turbine2Ref.current) {
      turbine2Ref.current.rotation.z -= delta * (spinSpeed * 0.88);
    }
    if (pulseRingRef.current) {
      const s = 1 + Math.sin(t * 3.2) * 0.14;
      pulseRingRef.current.scale.set(s, s, 1);
    }
    if (scanBeamRef.current && simMode === "heal") {
      scanBeamRef.current.position.z = Math.sin(t * 1.4) * 2.6;
    }
    if (waterMeshRef.current) {
      // Canal water level rises in Storm Surge ("break") and stabilizes in "heal"
      const targetY =
        simMode === "break"
          ? 0.085 + Math.sin(t * 4.5) * 0.015
          : 0.032 + Math.sin(t * 2.0) * 0.006;
      waterMeshRef.current.position.y = THREE.MathUtils.lerp(
        waterMeshRef.current.position.y,
        targetY,
        delta * 4
      );
    }
    if (floodSurgeMeshRef.current) {
      floodSurgeMeshRef.current.visible = simMode === "break";
      if (simMode === "break") {
        floodSurgeMeshRef.current.position.y =
          0.235 + Math.sin(t * 3.8) * 0.012;
      }
    }
    if (shuttleRef.current) {
      const shuttleSpeed = simMode === "break" ? 0.22 : 0.62;
      shuttleRef.current.position.x = Math.sin(t * shuttleSpeed) * 2.95;
    }
  });

  const isBreak = simMode === "break";
  const isHeal = simMode === "heal";

  return (
    <group position={[0, -0.42, 0]}>
      {/* 1. MULTI-TIERED GEOLOGICAL CUTAWAY ISLAND PLINTH */}
      <mesh position={[0, -0.58, 0]} receiveShadow castShadow>
        <boxGeometry args={[8.9, 0.62, 7.5]} />
        <meshStandardMaterial color={palette.bedrock} roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[9.1, 0.26, 7.7]} />
        <meshStandardMaterial color={palette.subsoil} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.09, 0]} receiveShadow castShadow>
        <boxGeometry args={[9.3, 0.22, 7.9]} />
        <meshStandardMaterial color={palette.turf} roughness={0.74} />
      </mesh>

      {/* Upper Architectural Limestone Courtyard Terrace */}
      <mesh position={[0, 0.22, -0.65]} receiveShadow>
        <boxGeometry args={[7.5, 0.05, 3.65]} />
        <meshStandardMaterial color={palette.plazaSlab} roughness={0.72} />
      </mesh>

      {/* Storm Surge Street Overflow Sheet (Only visible in "break" mode!) */}
      <mesh
        ref={floodSurgeMeshRef}
        position={[0, 0.235, 1.55]}
        visible={false}
      >
        <boxGeometry args={[8.5, 0.025, 1.85]} />
        <meshPhysicalMaterial
          color="#0284C7"
          emissive="#EF4444"
          emissiveIntensity={0.28}
          transparent
          opacity={0.72}
          roughness={0.12}
          metalness={0.5}
        />
      </mesh>

      {/* Meta SAM 3.1 Laser Scan Sweep Plane (Only visible in "heal" mode!) */}
      {isHeal && (
        <mesh
          ref={scanBeamRef}
          position={[0, 0.26, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[8.8, 0.32]} />
          <meshBasicMaterial
            color="#C6F432"
            transparent
            opacity={0.42}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 2. FRONT HYDROLOGICAL RETENTION CANAL & TIMBER BRIDGE */}
      <group position={[0, 0.19, 2.55]}>
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[8.45, 0.085, 1.18]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.68} />
        </mesh>
        {/* Dynamic Reflective Water Surface */}
        <mesh ref={waterMeshRef} position={[0, 0.032, 0]}>
          <boxGeometry args={[8.15, 0.05, 0.94]} />
          <meshPhysicalMaterial
            color={
              isBreak ? "#0369A1" : isHeal ? "#06B6D4" : "#0EA5E9"
            }
            emissive={
              isHeal
                ? "#22D3EE"
                : isBreak
                ? "#EF4444"
                : camPreset === "hydro"
                ? "#38BDF8"
                : "#0369A1"
            }
            emissiveIntensity={
              isHeal ? 0.55 : isBreak ? 0.35 : camPreset === "hydro" ? 0.45 : 0.2
            }
            metalness={0.45}
            roughness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.05}
          />
        </mesh>
        {/* Pedestrian Timber Bridge with Architectural Railings */}
        <group position={[-0.35, 0.08, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.18, 0.06, 1.26]} />
            <meshStandardMaterial color="#8C5230" roughness={0.68} />
          </mesh>
          {[-0.54, 0.54].map((rx, idx) => (
            <mesh key={`rail-${idx}`} position={[rx, 0.08, 0]} castShadow>
              <boxGeometry args={[0.04, 0.12, 1.24]} />
              <meshStandardMaterial color="#D97736" roughness={0.5} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 3. BOULEVARD, SOLAR STREETLIGHTS & AUTONOMOUS EV MICRO-TRANSIT POD */}
      <mesh position={[0, 0.215, 1.25]} receiveShadow>
        <boxGeometry args={[8.6, 0.03, 1.15]} />
        <meshStandardMaterial
          color={camPreset === "boulevard" ? "#1E293B" : "#2B3038"}
          roughness={0.82}
        />
      </mesh>
      {[-3.3, -2.2, -1.1, 0, 1.1, 2.2, 3.3].map((xPos, i) => (
        <mesh key={`dash-${i}`} position={[xPos, 0.235, 1.25]}>
          <boxGeometry args={[0.52, 0.01, 0.05]} />
          <meshStandardMaterial
            color={isBreak ? "#EF4444" : "#C6F432"}
            emissive={isBreak ? "#EF4444" : "#C6F432"}
            emissiveIntensity={isHeal || camPreset === "boulevard" ? 0.8 : 0.3}
          />
        </mesh>
      ))}

      {/* Architectural Solar Bollard Streetlights */}
      {[-3.5, -1.2, 1.2, 3.5].map((lx, idx) => (
        <group key={`lamp-${idx}`} position={[lx, 0.22, 0.62]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.03, 0.44, 10]} />
            <meshStandardMaterial color="#334155" metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial
              color={isBreak ? "#FCA5A5" : "#FEF08A"}
              emissive={isBreak ? "#EF4444" : "#F59E0B"}
              emissiveIntensity={isNight || isBreak ? 1.8 : 0.45}
            />
          </mesh>
        </group>
      ))}

      {/* Gliding Clean-Tech EV Pod */}
      <group ref={shuttleRef} position={[0, 0.34, 1.25]}>
        <mesh castShadow>
          <boxGeometry args={[0.68, 0.22, 0.36]} />
          <meshPhysicalMaterial
            color="#0F172A"
            metalness={0.7}
            roughness={0.18}
            clearcoat={1}
          />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.44, 0.14, 0.37]} />
          <meshStandardMaterial
            color={isBreak ? "#F97316" : "#C6F432"}
            emissive={isBreak ? "#EF4444" : "#C6F432"}
            emissiveIntensity={0.85}
          />
        </mesh>
      </group>

      {/* 4. CENTRAL GRAND SOLAR PAVILION & CLT HUB */}
      <GrandSolarPavilion
        position={[-0.25, 0.24, -0.65]}
        wallColor={palette.wallPrimary}
        roofColor={palette.roofPrimary}
        isNight={isNight}
        hasSolarPanels={hasSolar}
        simMode={simMode}
        focusHighlight={camPreset === "solar"}
      />

      {/* 5. WEST BIOSOLAR TOWNHOUSE RESIDENCE */}
      <PitchedTownhouse
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
      />

      {/* 6. EAST CIRCULAR RECOVERY & HYDRO ANNEX */}
      <PitchedTownhouse
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
      />

      {/* 7. HYDROLOGICAL RAINWATER CISTERN & COPPER CONDUIT NETWORK */}
      {(hasCistern || isHeal) && (
        <group position={[1.25, 0.24, -0.5]}>
          <mesh position={[0, 0.56, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.43, 0.43, 1.12, 24]} />
            <meshPhysicalMaterial
              color={isBreak ? "#7F1D1D" : "#164E63"}
              roughness={0.22}
              metalness={0.55}
              clearcoat={0.8}
            />
          </mesh>
          <mesh position={[0, 1.22, 0]} castShadow>
            <coneGeometry args={[0.47, 0.24, 24]} />
            <meshStandardMaterial color="#1E293B" roughness={0.45} />
          </mesh>
          {/* Glowing Level Telemetry Bar */}
          <mesh position={[0, 0.56, 0.42]}>
            <boxGeometry args={[0.095, 0.84, 0.04]} />
            <meshStandardMaterial
              color={isBreak ? "#EF4444" : isHeal ? "#C6F432" : "#22D3EE"}
              emissive={isBreak ? "#EF4444" : isHeal ? "#C6F432" : "#22D3EE"}
              emissiveIntensity={1.25}
            />
          </mesh>
          {/* Roof-to-Cistern Copper Pipe */}
          <mesh position={[-0.38, 0.98, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.72, 12]} />
            <meshStandardMaterial
              color={palette.pipeCopper}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          {/* Cistern-to-Canal Overflow Conduit */}
          <mesh position={[0, 0.06, 1.45]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.048, 0.048, 2.8, 12]} />
            <meshStandardMaterial
              color={isHeal ? "#C6F432" : "#2A9DBD"}
              emissive={isHeal || camPreset === "hydro" ? "#22D3EE" : "#000000"}
              emissiveIntensity={isHeal || camPreset === "hydro" ? 0.65 : 0}
              metalness={0.6}
              roughness={0.25}
            />
          </mesh>
        </group>
      )}

      {/* 8. ELEVATED MUNICIPAL SOLAR WATER TOWER (Back Right) */}
      <group position={[1.75, 0.24, -2.35]}>
        {[-0.22, 0.22].map((lx, i) =>
          [-0.22, 0.22].map((lz, j) => (
            <mesh key={`leg-${i}-${j}`} position={[lx, 0.62, lz]} castShadow>
              <cylinderGeometry args={[0.04, 0.05, 1.24, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.65} />
            </mesh>
          ))
        )}
        <mesh position={[0, 1.45, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.46, 0.46, 0.74, 22]} />
          <meshStandardMaterial
            color="#D97736"
            roughness={0.38}
            metalness={0.35}
          />
        </mesh>
        <mesh position={[0, 1.92, 0]} castShadow>
          <coneGeometry args={[0.5, 0.26, 22]} />
          <meshStandardMaterial color="#0F172A" roughness={0.5} />
        </mesh>
      </group>

      {/* 9. GEODESIC BOTANICAL CONSERVATORY DOME & CIRCULAR SORTING HUB */}
      {(hasCompost || isHeal) && (
        <group position={[-2.15, 0.22, 1.95]}>
          <mesh position={[0, 0.36, 0]} castShadow>
            <icosahedronGeometry args={[0.48, 1]} />
            <meshPhysicalMaterial
              color={isHeal ? "#34D399" : "#1E9E5A"}
              emissive="#10B981"
              emissiveIntensity={isNight || isHeal ? 0.42 : 0.15}
              roughness={0.18}
              metalness={0.15}
              clearcoat={1}
              flatShading
            />
          </mesh>
          {[
            { x: 0.72, color: "#1E9E5A" },
            { x: 1.04, color: "#E9A23B" },
            { x: 1.36, color: "#2A9DBD" },
          ].map((bin, idx) => (
            <mesh key={`sort-${idx}`} position={[bin.x, 0.19, 0]} castShadow>
              <boxGeometry args={[0.24, 0.36, 0.26]} />
              <meshStandardMaterial color={bin.color} roughness={0.38} />
            </mesh>
          ))}
        </group>
      )}

      {/* 10. BIOPORE INFILTRATION MATRIX ALONG PROMENADE */}
      <group position={[1.15, 0.23, 1.92]}>
        {[-0.8, -0.4, 0, 0.4, 0.8, 1.2].map((bx, idx) => (
          <mesh key={`bio-${idx}`} position={[bx, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.05, 18]} />
            <meshStandardMaterial
              color={isBreak ? "#EF4444" : "#1E9E5A"}
              emissive={isBreak ? "#EF4444" : "#C6F432"}
              emissiveIntensity={isHeal || isBreak ? 0.95 : 0.5}
            />
          </mesh>
        ))}
        <mesh
          ref={pulseRingRef}
          position={[0.2, 0.018, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.19, 0.28, 28]} />
          <meshBasicMaterial
            color={isBreak ? "#EF4444" : "#C6F432"}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>

      {/* 11. TWIN KINETIC WIND TURBINES ON NORTH RIDGE */}
      <group position={[-3.05, 0.24, -2.25]}>
        <mesh position={[0, 1.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.075, 2.3, 12]} />
          <meshStandardMaterial
            color="#F8FAFC"
            metalness={0.6}
            roughness={0.25}
          />
        </mesh>
        <group ref={turbine1Ref} position={[0, 2.25, 0.08]}>
          {[0, 1, 2].map((bIdx) => (
            <mesh
              key={`blade1-${bIdx}`}
              rotation={[0, 0, (bIdx * Math.PI * 2) / 3]}
            >
              <boxGeometry args={[0.065, 0.8, 0.02]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          ))}
        </group>
      </group>

      <group position={[-0.95, 0.24, -2.45]}>
        <mesh position={[0, 0.95, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.065, 1.9, 12]} />
          <meshStandardMaterial
            color="#F8FAFC"
            metalness={0.6}
            roughness={0.25}
          />
        </mesh>
        <group ref={turbine2Ref} position={[0, 1.88, 0.07]}>
          {[0, 1, 2].map((bIdx) => (
            <mesh
              key={`blade2-${bIdx}`}
              rotation={[0, 0, (bIdx * Math.PI * 2) / 3]}
            >
              <boxGeometry args={[0.055, 0.66, 0.02]} />
              <meshStandardMaterial color="#C6F432" />
            </mesh>
          ))}
        </group>
      </group>

      {/* 12. URBAN FOREST CANOPY */}
      {trees.map(([x, y, z, scale], idx) => (
        <group key={`tree-${idx}`} position={[x, y, z]} scale={scale}>
          <mesh position={[0, 0.26, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.09, 0.52, 7]} />
            <meshStandardMaterial color="#5C4033" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.68, 0]} castShadow>
            <icosahedronGeometry args={[0.4, 1]} />
            <meshStandardMaterial
              color={
                idx % 2 === 0
                  ? palette.foliagePrimary
                  : palette.foliageSecondary
              }
              roughness={0.58}
              flatShading
            />
          </mesh>
        </group>
      ))}

      {/* 13. GPU-FRIENDLY ATMOSPHERIC PARTICLES */}
      <AtmosphericParticleField simMode={simMode} isNight={isNight} />

      {/* 14. FLOATING ARCHITECTURAL CLOUDS */}
      <Float speed={1.1} rotationIntensity={0.04} floatIntensity={0.22}>
        <group position={[-2.4, 3.05, -1.8]}>
          <mesh position={[0, 0, 0]}>
            <icosahedronGeometry args={[0.32, 1]} />
            <meshStandardMaterial
              color={
                isBreak ? "#334155" : isNight ? "#334155" : "#FFFFFF"
              }
              transparent
              opacity={0.88}
              flatShading
            />
          </mesh>
          <mesh position={[0.28, -0.04, 0.06]}>
            <icosahedronGeometry args={[0.24, 1]} />
            <meshStandardMaterial
              color={
                isBreak ? "#334155" : isNight ? "#334155" : "#FFFFFF"
              }
              transparent
              opacity={0.88}
              flatShading
            />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

export default function EcoIslandCanvas(props: EcoIslandProps) {
  const [camPreset, setCamPreset] = useState<CameraViewPreset>("overview");
  const [autoOrbit, setAutoOrbit] = useState(true);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const palette = TOWN_PALETTES[props.biome] ?? TOWN_PALETTES.mediterranean;
  const simMode = props.simMode ?? "run";
  const bgHex =
    simMode === "break"
      ? palette.skyStorm
      : props.isNight
      ? palette.skyNight
      : palette.skyDay;
  const isId = props.locale === "id";
  const activePresetMeta = CAMERA_PRESET_CONFIG[camPreset];

  // Clear, immediate telemetry comparison based on active 3D mode & camera preset
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
      className="relative h-full w-full overflow-hidden select-none transition-colors duration-500"
      style={{ backgroundColor: bgHex }}
    >
      <Canvas
        shadows
        dpr={[1, 1.6]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [7.5, 5.1, 7.5], fov: 33 }}
      >
        <color attach="background" args={[bgHex]} />
        <ambientLight
          intensity={
            simMode === "break" ? 0.48 : props.isNight ? 0.56 : 1.02
          }
        />
        <directionalLight
          castShadow
          position={props.isNight ? [-6, 8, -4] : [9, 13, 7]}
          intensity={
            simMode === "break" ? 0.85 : props.isNight ? 0.78 : 1.75
          }
          color={
            simMode === "break"
              ? "#93C5FD"
              : props.isNight
              ? "#93C5FD"
              : "#FFFDF7"
          }
          shadow-mapSize={[1024, 1024]}
        />
        {(props.isNight || simMode === "break" || simMode === "heal") && (
          <pointLight
            position={[0, 2.2, 0.8]}
            intensity={simMode === "heal" ? 2.6 : 2.1}
            color={
              simMode === "heal"
                ? "#34D399"
                : simMode === "break"
                ? "#F87171"
                : "#FDE68A"
            }
            distance={10}
          />
        )}

        <LivingTownScene {...props} camPreset={camPreset} />

        <ContactShadows
          position={[0, -1.25, 0]}
          opacity={0.32}
          scale={14}
          blur={2.4}
          far={4.5}
        />

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={3.8}
          maxDistance={12.5}
          minPolarAngle={Math.PI / 6.5}
          maxPolarAngle={Math.PI / 2.22}
          autoRotate={autoOrbit}
          autoRotateSpeed={simMode === "break" ? 0.85 : 0.48}
        />

        <CameraRigController preset={camPreset} controlsRef={controlsRef} />
      </Canvas>

      {/* Minimalist, Clean HUD Overlays inside 3D Stage */}
      {!props.hideHudOverlays && !props.compact && (
        <div className="pointer-events-none absolute right-3 bottom-3 left-3 z-10 flex flex-wrap items-end justify-between gap-2 sm:right-4 sm:bottom-4 sm:left-auto">
          {/* Active Feature / Mode Diff Telemetry Pill */}
          <div
            className={`pointer-events-auto hidden items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] font-medium backdrop-blur-xl transition-all duration-300 xl:flex ${modeFeedback.pillBg} bg-[#08090c]/85`}
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${modeFeedback.dot}`}
            />
            <span>{isId ? modeFeedback.statusId : modeFeedback.statusEn}</span>
          </div>

          {/* Interactive 3D Camera Focus Bar */}
          <div className="pointer-events-auto ml-auto flex flex-wrap items-center gap-1 rounded-full border border-white/15 bg-[#08090c]/90 p-1 text-white shadow-xl backdrop-blur-xl">
            {(
              [
                { id: "overview", labelEn: "Overview", labelId: "Utama" },
                { id: "solar", labelEn: "Solar Hub", labelId: "Atap Surya" },
                { id: "hydro", labelEn: "Hydro Canal", labelId: "Kanal Air" },
                { id: "boulevard", labelEn: "EV Street", labelId: "Jalan EV" },
              ] as const
            ).map((preset) => {
              const active = camPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setCamPreset(preset.id)}
                  className={`min-h-[32px] cursor-pointer rounded-full px-3 py-1 font-mono text-[10px] sm:text-[11px] font-medium transition ${
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
              className={`min-h-[32px] cursor-pointer rounded-full px-2.5 py-1 font-mono text-[10px] sm:text-[11px] font-semibold transition ${
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
