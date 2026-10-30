"use client";

import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
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

type CameraViewPreset = "overview" | "solar" | "hydro" | "boulevard";

interface TownPalette {
  skyDay: string;
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
    skyNight: "#0D1016",
    plazaSlab: "#DFDDD4",
    turf: "#5F844E",
    subsoil: "#9C7A5B",
    bedrock: "#3E434C",
    wallPrimary: "#FAF8F2",
    wallSecondary: "#EFECE4",
    wallAccent: "#E2CCB2",
    roofPrimary: "#B85233",
    roofSecondary: "#2B3544",
    pipeCopper: "#D97736",
    cisternWater: "#1E9E5A",
    foliagePrimary: "#366340",
    foliageSecondary: "#78A15E",
  },
  temperate: {
    skyDay: "#E6EAE8",
    skyNight: "#0D1016",
    plazaSlab: "#DCDFD9",
    turf: "#527951",
    subsoil: "#7F5539",
    bedrock: "#3B4758",
    wallPrimary: "#F8F9FA",
    wallSecondary: "#E9ECEF",
    wallAccent: "#DDE5B6",
    roofPrimary: "#2B3748",
    roofSecondary: "#7F1D1D",
    pipeCopper: "#D97736",
    cisternWater: "#2A9DBD",
    foliagePrimary: "#34543A",
    foliageSecondary: "#6C9D77",
  },
  tropical: {
    skyDay: "#E7EFEA",
    skyNight: "#0B110F",
    plazaSlab: "#DCE3DD",
    turf: "#3B8764",
    subsoil: "#774936",
    bedrock: "#2F3946",
    wallPrimary: "#FAF9F5",
    wallSecondary: "#F1EFE7",
    wallAccent: "#D8F3DC",
    roofPrimary: "#9A3412",
    roofSecondary: "#245942",
    pipeCopper: "#E07A5F",
    cisternWater: "#0D9488",
    foliagePrimary: "#245942",
    foliageSecondary: "#4CAE80",
  },
  arid: {
    skyDay: "#EFEAE1",
    skyNight: "#11100F",
    plazaSlab: "#E6DEC8",
    turf: "#9A9260",
    subsoil: "#A47148",
    bedrock: "#4D4944",
    wallPrimary: "#FDFBF7",
    wallSecondary: "#F3E9D2",
    wallAccent: "#E9D8A6",
    roofPrimary: "#C2410C",
    roofSecondary: "#6B2F0E",
    pipeCopper: "#CA6702",
    cisternWater: "#0284C7",
    foliagePrimary: "#5C940D",
    foliageSecondary: "#7CBF14",
  },
  continental: {
    skyDay: "#E5E9EC",
    skyNight: "#0C0F14",
    plazaSlab: "#D8DEE3",
    turf: "#496E29",
    subsoil: "#6C584C",
    bedrock: "#2B3748",
    wallPrimary: "#F8FAFC",
    wallSecondary: "#E2E8F0",
    wallAccent: "#CBD5E1",
    roofPrimary: "#1E293B",
    roofSecondary: "#881818",
    pipeCopper: "#D97736",
    cisternWater: "#0284C7",
    foliagePrimary: "#275E46",
    foliageSecondary: "#3B8764",
  },
  polar: {
    skyDay: "#E6EEF4",
    skyNight: "#0A0E16",
    plazaSlab: "#E2E8F0",
    turf: "#B2DFF7",
    subsoil: "#64748B",
    bedrock: "#1E293B",
    wallPrimary: "#FFFFFF",
    wallSecondary: "#E2E8F0",
    wallAccent: "#CBD5E1",
    roofPrimary: "#0F172A",
    roofSecondary: "#1E3A8A",
    pipeCopper: "#F59E0B",
    cisternWater: "#38BDF8",
    foliagePrimary: "#0F766E",
    foliageSecondary: "#14B8A6",
  },
};

/**
 * Lightweight GPU-friendly particle field (48 points in a single draw call)
 */
function AtmosphericParticleField({
  simMode = "run",
  isNight,
}: {
  simMode?: "run" | "break" | "heal";
  isNight: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 48;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Deterministic pseudo-random distribution across the island volume
      const seed1 = Math.sin(i * 12.9898) * 43758.5453;
      const seed2 = Math.sin(i * 78.233) * 43758.5453;
      const seed3 = Math.sin(i * 39.346) * 43758.5453;
      const rx = (seed1 - Math.floor(seed1) - 0.5) * 8.4;
      const ry = (seed2 - Math.floor(seed2)) * 3.4 + 0.3;
      const rz = (seed3 - Math.floor(seed3) - 0.5) * 7.2;
      arr[i * 3] = rx;
      arr[i * 3 + 1] = ry;
      arr[i * 3 + 2] = rz;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    const pts = pointsRef.current;
    if (!pts) return;
    const posAttr = pts.geometry.getAttribute(
      "position"
    ) as THREE.BufferAttribute;
    const speed = simMode === "break" ? -2.6 : 0.45;

    for (let i = 0; i < count; i++) {
      let y = posAttr.getY(i) + delta * speed;
      if (simMode === "break" && y < 0.2) y = 3.6;
      if (simMode !== "break" && y > 3.6) y = 0.25;
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;
  });

  const particleColor =
    simMode === "break"
      ? "#38BDF8"
      : simMode === "heal"
      ? "#C6F432"
      : isNight
      ? "#FDE68A"
      : "#1E9E5A";

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={particleColor}
        size={simMode === "break" ? 0.08 : 0.1}
        transparent
        opacity={0.78}
        sizeAttenuation
      />
    </points>
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
}: {
  position: [number, number, number];
  wallColor: string;
  roofColor: string;
  isNight: boolean;
  hasSolarPanels: boolean;
}) {
  return (
    <group position={position}>
      {/* Stepped Travertine & Concrete Plinth */}
      <mesh position={[0, 0.07, 0]} receiveShadow castShadow>
        <boxGeometry args={[2.7, 0.14, 1.95]} />
        <meshStandardMaterial color="#8B8D8A" roughness={0.8} />
      </mesh>

      {/* Ground Floor Architectural Volume */}
      <mesh position={[0, 0.56, 0]} receiveShadow castShadow>
        <boxGeometry args={[2.45, 0.86, 1.72]} />
        <meshStandardMaterial color={wallColor} roughness={0.65} />
      </mesh>

      {/* Panoramic Double-Height Curtain Wall Atrium (Front) */}
      <mesh position={[0, 0.56, 0.865]}>
        <boxGeometry args={[1.65, 0.68, 0.03]} />
        <meshStandardMaterial
          color={isNight ? "#FEF08A" : "#1E293B"}
          emissive={isNight ? "#F59E0B" : "#0EA5E9"}
          emissiveIntensity={isNight ? 1.45 : 0.22}
          metalness={0.75}
          roughness={0.2}
        />
      </mesh>

      {/* Vertical Timber Brise-Soleil Fin Louvers */}
      {[-0.72, -0.36, 0, 0.36, 0.72].map((xOff, i) => (
        <mesh key={`louver-${i}`} position={[xOff, 0.56, 0.885]} castShadow>
          <boxGeometry args={[0.04, 0.72, 0.05]} />
          <meshStandardMaterial color="#9A5B32" roughness={0.7} />
        </mesh>
      ))}

      {/* Cantilevered Second-Story Penthouse & Green Terrace */}
      <mesh position={[-0.22, 1.24, -0.06]} receiveShadow castShadow>
        <boxGeometry args={[1.85, 0.56, 1.42]} />
        <meshStandardMaterial color={wallColor} roughness={0.65} />
      </mesh>

      {/* East Roof Garden Terrace Planter */}
      <mesh position={[0.92, 1.03, 0.05]} receiveShadow castShadow>
        <boxGeometry args={[0.42, 0.1, 1.32]} />
        <meshStandardMaterial color="#2D6A4F" roughness={0.75} />
      </mesh>

      {/* Penthouse Clerestory Ribbon Window */}
      <mesh position={[-0.22, 1.28, 0.655]}>
        <boxGeometry args={[1.45, 0.26, 0.025]} />
        <meshStandardMaterial
          color={isNight ? "#FDE68A" : "#334155"}
          emissive={isNight ? "#F59E0B" : "#38BDF8"}
          emissiveIntensity={isNight ? 1.3 : 0.2}
        />
      </mesh>

      {/* Asymmetric Architectural Butterfly / Pitched Solar Roof */}
      <group position={[-0.12, 1.54, 0]}>
        <mesh
          position={[0, 0.22, 0.34]}
          rotation={[Math.PI / 5.6, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.35, 0.09, 0.98]} />
          <meshStandardMaterial color={roofColor} roughness={0.55} />
        </mesh>
        <mesh
          position={[0, 0.22, -0.34]}
          rotation={[-Math.PI / 5.6, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.35, 0.09, 0.98]} />
          <meshStandardMaterial color={roofColor} roughness={0.55} />
        </mesh>

        {/* High-Efficiency Bifacial Monocrystalline Solar PV Array */}
        {hasSolarPanels && (
          <group
            position={[0, 0.28, 0.34]}
            rotation={[Math.PI / 5.6, 0, 0]}
          >
            {[-0.76, -0.25, 0.25, 0.76].map((xPos, idx) => (
              <mesh key={`pv-${idx}`} position={[xPos, 0.02, 0]} castShadow>
                <boxGeometry args={[0.45, 0.035, 0.78]} />
                <meshStandardMaterial
                  color="#0B132B"
                  metalness={0.9}
                  roughness={0.14}
                  emissive="#1D4ED8"
                  emissiveIntensity={0.32}
                />
              </mesh>
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
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
        <boxGeometry args={[width + 0.14, 0.12, depth + 0.14]} />
        <meshStandardMaterial color="#8B8C89" roughness={0.85} />
      </mesh>

      <mesh position={[0, height / 2 + 0.12, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={wallColor} roughness={0.7} />
      </mesh>

      {[-width * 0.24, width * 0.24].map((xOff, i) => (
        <mesh
          key={`win-front-${i}`}
          position={[xOff, height * 0.62 + 0.12, depth / 2 + 0.015]}
        >
          <boxGeometry args={[width * 0.22, height * 0.32, 0.02]} />
          <meshStandardMaterial
            color={isNight ? "#FDE68A" : "#334155"}
            emissive={isNight ? "#F59E0B" : "#0F172A"}
            emissiveIntensity={isNight ? 1.45 : 0.15}
          />
        </mesh>
      ))}

      <mesh position={[0, 0.36, depth / 2 + 0.015]}>
        <boxGeometry args={[0.28, 0.48, 0.025]} />
        <meshStandardMaterial color="#3F2E21" roughness={0.8} />
      </mesh>

      <group position={[0, height + 0.12, 0]}>
        <mesh
          position={[0, 0.25, depth * 0.24]}
          rotation={[Math.PI / 5.2, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[width + 0.18, 0.09, depth * 0.68]} />
          <meshStandardMaterial color={roofColor} roughness={0.6} />
        </mesh>
        <mesh
          position={[0, 0.25, -depth * 0.24]}
          rotation={[-Math.PI / 5.2, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[width + 0.18, 0.09, depth * 0.68]} />
          <meshStandardMaterial color={roofColor} roughness={0.6} />
        </mesh>

        {hasSolarPanels && (
          <group
            position={[0, 0.31, depth * 0.24]}
            rotation={[Math.PI / 5.2, 0, 0]}
          >
            {[-width * 0.3, 0, width * 0.3].map((xPos, idx) => (
              <mesh key={`solar-${idx}`} position={[xPos, 0.02, 0]} castShadow>
                <boxGeometry args={[width * 0.26, 0.035, depth * 0.52]} />
                <meshStandardMaterial
                  color="#0F172A"
                  metalness={0.85}
                  roughness={0.18}
                  emissive="#1E3A8A"
                  emissiveIntensity={0.28}
                />
              </mesh>
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
}: EcoIslandProps) {
  const palette = TOWN_PALETTES[biome] ?? TOWN_PALETTES.mediterranean;
  const turbine1Ref = useRef<THREE.Group>(null);
  const turbine2Ref = useRef<THREE.Group>(null);
  const pulseRingRef = useRef<THREE.Mesh>(null);
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
    const spinSpeed = simMode === "break" ? 4.2 : 2.1;
    if (turbine1Ref.current) {
      turbine1Ref.current.rotation.z -= delta * spinSpeed;
    }
    if (turbine2Ref.current) {
      turbine2Ref.current.rotation.z -= delta * (spinSpeed * 0.88);
    }
    if (pulseRingRef.current) {
      const s = 1 + Math.sin(t * 2.6) * 0.08;
      pulseRingRef.current.scale.set(s, s, 1);
    }
    if (shuttleRef.current) {
      shuttleRef.current.position.x = Math.sin(t * 0.55) * 2.9;
    }
  });

  return (
    <group position={[0, -0.42, 0]}>
      {/* 1. MULTI-TIERED GEOLOGICAL CUTAWAY ISLAND PLINTH */}
      {/* Deep Bedrock Layer */}
      <mesh position={[0, -0.58, 0]} receiveShadow castShadow>
        <boxGeometry args={[8.8, 0.62, 7.4]} />
        <meshStandardMaterial color={palette.bedrock} roughness={0.9} />
      </mesh>
      {/* Aquifer & Subsoil Stratum */}
      <mesh position={[0, -0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[9.0, 0.26, 7.6]} />
        <meshStandardMaterial color={palette.subsoil} roughness={0.85} />
      </mesh>
      {/* Living Topsoil & Turf Terrace */}
      <mesh position={[0, 0.09, 0]} receiveShadow castShadow>
        <boxGeometry args={[9.2, 0.22, 7.8]} />
        <meshStandardMaterial color={palette.turf} roughness={0.76} />
      </mesh>

      {/* Upper Architectural Limestone Courtyard Terrace */}
      <mesh position={[0, 0.22, -0.65]} receiveShadow>
        <boxGeometry args={[7.4, 0.05, 3.6]} />
        <meshStandardMaterial color={palette.plazaSlab} roughness={0.78} />
      </mesh>

      {/* 2. FRONT HYDROLOGICAL RETENTION CANAL & TIMBER BRIDGE */}
      <group position={[0, 0.19, 2.55]}>
        {/* Canal Basin Frame */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[8.4, 0.08, 1.15]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
        </mesh>
        {/* Reflective Water Surface */}
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[8.1, 0.04, 0.92]} />
          <meshStandardMaterial
            color={simMode === "break" ? "#0284C7" : "#0EA5E9"}
            emissive={simMode === "heal" ? "#22D3EE" : "#0369A1"}
            emissiveIntensity={simMode === "heal" ? 0.45 : 0.2}
            metalness={0.65}
            roughness={0.15}
          />
        </mesh>
        {/* Pedestrian Timber Bridge */}
        <mesh position={[-0.35, 0.07, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.15, 0.06, 1.24]} />
          <meshStandardMaterial color="#9A5B32" roughness={0.75} />
        </mesh>
      </group>

      {/* 3. BOULEVARD & AUTONOMOUS EV MICRO-TRANSIT POD */}
      <mesh position={[0, 0.215, 1.25]} receiveShadow>
        <boxGeometry args={[8.6, 0.03, 1.15]} />
        <meshStandardMaterial color="#2B3038" roughness={0.85} />
      </mesh>
      {[-3.3, -2.2, -1.1, 0, 1.1, 2.2, 3.3].map((xPos, i) => (
        <mesh key={`dash-${i}`} position={[xPos, 0.235, 1.25]}>
          <boxGeometry args={[0.52, 0.01, 0.05]} />
          <meshStandardMaterial color="#C6F432" />
        </mesh>
      ))}

      {/* Gliding Clean-Tech EV Pod */}
      <group ref={shuttleRef} position={[0, 0.34, 1.25]}>
        <mesh castShadow>
          <boxGeometry args={[0.64, 0.22, 0.34]} />
          <meshStandardMaterial
            color="#0F172A"
            metalness={0.6}
            roughness={0.25}
          />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.42, 0.14, 0.36]} />
          <meshStandardMaterial
            color="#C6F432"
            emissive="#C6F432"
            emissiveIntensity={0.6}
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
        hasSolarPanels={level >= 3}
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
        hasSolarPanels={level >= 4}
      />

      {/* 7. HYDROLOGICAL RAINWATER CISTERN & COPPER CONDUIT NETWORK */}
      {hasCistern && (
        <group position={[1.25, 0.24, -0.5]}>
          <mesh position={[0, 0.54, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.42, 0.42, 1.08, 22]} />
            <meshStandardMaterial
              color="#164E63"
              roughness={0.3}
              metalness={0.4}
            />
          </mesh>
          <mesh position={[0, 1.18, 0]} castShadow>
            <coneGeometry args={[0.46, 0.24, 22]} />
            <meshStandardMaterial color="#1E293B" roughness={0.5} />
          </mesh>
          {/* Glowing Level Telemetry Bar */}
          <mesh position={[0, 0.54, 0.41]}>
            <boxGeometry args={[0.09, 0.8, 0.04]} />
            <meshStandardMaterial
              color="#22D3EE"
              emissive="#22D3EE"
              emissiveIntensity={0.95}
            />
          </mesh>
          {/* Roof-to-Cistern Copper Pipe */}
          <mesh position={[-0.38, 0.96, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.72, 10]} />
            <meshStandardMaterial
              color={palette.pipeCopper}
              metalness={0.7}
              roughness={0.25}
            />
          </mesh>
          {/* Cistern-to-Canal Overflow Conduit */}
          <mesh position={[0, 0.06, 1.45]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 2.8, 10]} />
            <meshStandardMaterial
              color="#2A9DBD"
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
        </group>
      )}

      {/* 8. ELEVATED MUNICIPAL SOLAR WATER TOWER (Back Right) */}
      <group position={[1.75, 0.24, -2.35]}>
        {[-0.22, 0.22].map((lx, i) =>
          [-0.22, 0.22].map((lz, j) => (
            <mesh
              key={`leg-${i}-${j}`}
              position={[lx, 0.62, lz]}
              castShadow
            >
              <cylinderGeometry args={[0.04, 0.05, 1.24, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.55} />
            </mesh>
          ))
        )}
        <mesh position={[0, 1.45, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.46, 0.46, 0.74, 20]} />
          <meshStandardMaterial color="#D97736" roughness={0.45} />
        </mesh>
        <mesh position={[0, 1.92, 0]} castShadow>
          <coneGeometry args={[0.5, 0.26, 20]} />
          <meshStandardMaterial color="#0F172A" roughness={0.55} />
        </mesh>
      </group>

      {/* 9. GEODESIC BOTANICAL CONSERVATORY DOME & CIRCULAR SORTING HUB */}
      {hasCompost && (
        <group position={[-2.15, 0.22, 1.95]}>
          <mesh position={[0, 0.34, 0]} castShadow>
            <icosahedronGeometry args={[0.46, 1]} />
            <meshStandardMaterial
              color="#1E9E5A"
              emissive="#1E9E5A"
              emissiveIntensity={isNight ? 0.35 : 0.12}
              roughness={0.35}
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
              <meshStandardMaterial color={bin.color} roughness={0.4} />
            </mesh>
          ))}
        </group>
      )}

      {/* 10. BIOPORE INFILTRATION MATRIX ALONG PROMENADE */}
      <group position={[1.15, 0.23, 1.92]}>
        {[-0.8, -0.4, 0, 0.4, 0.8, 1.2].map((bx, idx) => (
          <mesh key={`bio-${idx}`} position={[bx, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.045, 16]} />
            <meshStandardMaterial
              color="#1E9E5A"
              emissive="#C6F432"
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
        <mesh
          ref={pulseRingRef}
          position={[0.2, 0.015, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.18, 0.25, 24]} />
          <meshBasicMaterial color="#C6F432" transparent opacity={0.85} />
        </mesh>
      </group>

      {/* 11. TWIN KINETIC WIND TURBINES ON NORTH RIDGE */}
      <group position={[-3.05, 0.24, -2.25]}>
        <mesh position={[0, 1.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.075, 2.3, 12]} />
          <meshStandardMaterial color="#F8FAFC" metalness={0.5} roughness={0.3} />
        </mesh>
        <group ref={turbine1Ref} position={[0, 2.25, 0.08]}>
          {[0, 1, 2].map((bIdx) => (
            <mesh
              key={`blade1-${bIdx}`}
              rotation={[0, 0, (bIdx * Math.PI * 2) / 3]}
            >
              <boxGeometry args={[0.065, 0.78, 0.02]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          ))}
        </group>
      </group>

      <group position={[-0.95, 0.24, -2.45]}>
        <mesh position={[0, 0.95, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.065, 1.9, 12]} />
          <meshStandardMaterial color="#F8FAFC" metalness={0.5} roughness={0.3} />
        </mesh>
        <group ref={turbine2Ref} position={[0, 1.88, 0.07]}>
          {[0, 1, 2].map((bIdx) => (
            <mesh
              key={`blade2-${bIdx}`}
              rotation={[0, 0, (bIdx * Math.PI * 2) / 3]}
            >
              <boxGeometry args={[0.055, 0.64, 0.02]} />
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
              roughness={0.62}
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
                simMode === "break"
                  ? "#475569"
                  : isNight
                  ? "#334155"
                  : "#FFFFFF"
              }
              transparent
              opacity={0.86}
              flatShading
            />
          </mesh>
          <mesh position={[0.28, -0.04, 0.06]}>
            <icosahedronGeometry args={[0.24, 1]} />
            <meshStandardMaterial
              color={
                simMode === "break"
                  ? "#475569"
                  : isNight
                  ? "#334155"
                  : "#FFFFFF"
              }
              transparent
              opacity={0.86}
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

  const palette = TOWN_PALETTES[props.biome] ?? TOWN_PALETTES.mediterranean;
  const bgHex = props.isNight ? palette.skyNight : palette.skyDay;
  const isId = props.locale === "id";

  const camTarget = useMemo((): [number, number, number] => {
    if (camPreset === "solar") return [-0.25, 0.9, -0.65];
    if (camPreset === "hydro") return [1.1, 0.5, 0.6];
    if (camPreset === "boulevard") return [0, 0.3, 1.6];
    return [0, 0.15, 0];
  }, [camPreset]);

  return (
    <div
      className="relative h-full w-full overflow-hidden select-none"
      style={{ backgroundColor: bgHex }}
    >
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [7.6, 5.4, 7.6], fov: 34 }}
      >
        <color attach="background" args={[bgHex]} />
        <ambientLight intensity={props.isNight ? 0.58 : 0.98} />
        <directionalLight
          castShadow
          position={props.isNight ? [-6, 8, -4] : [9, 13, 7]}
          intensity={props.isNight ? 0.75 : 1.7}
          color={props.isNight ? "#93C5FD" : "#FFFDF7"}
          shadow-mapSize={[1024, 1024]}
        />
        {props.isNight && (
          <pointLight
            position={[0, 2.1, 0.8]}
            intensity={2.2}
            color="#FDE68A"
            distance={9}
          />
        )}

        <LivingTownScene {...props} />

        <ContactShadows
          position={[0, -1.25, 0]}
          opacity={0.3}
          scale={14}
          blur={2.4}
          far={4.5}
        />

        <OrbitControls
          target={camTarget}
          enablePan={false}
          minDistance={4.8}
          maxDistance={12.5}
          minPolarAngle={Math.PI / 6.5}
          maxPolarAngle={Math.PI / 2.25}
          autoRotate={autoOrbit}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Lightweight Zero-Hydration-Issue 2D Architectural Telemetry Badges & Camera Controls */}
      {!props.hideHudOverlays && (
        <>
          {/* Floating Spatial Node Callouts */}
          <div className="pointer-events-none absolute top-16 right-4 z-10 hidden flex-col items-end gap-1.5 sm:flex">
            <div className="flex items-center gap-2 rounded-full border border-black/12 bg-white/92 px-3 py-1 font-mono text-[11px] font-semibold text-[#111] shadow-sm backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#1e9e5a]" />
              <span>
                {isId ? "Atrium Surya CLT" : "CLT Solar Atrium"} ·{" "}
                {props.solarKwp} kWp
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-black/12 bg-white/92 px-3 py-1 font-mono text-[11px] font-semibold text-[#111] shadow-sm backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#2a9dbd]" />
              <span>
                {isId ? "Tangki & Kanal Air" : "Hydro Canal & Tank"} ·{" "}
                {Math.round(props.rainLitersYear / 1000)}k L/yr
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-black/12 bg-white/92 px-3 py-1 font-mono text-[11px] font-semibold text-[#111] shadow-sm backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#e9a23b]" />
              <span>
                {props.bioporeUnits}{" "}
                {isId ? "Sumur Resapan Biopori" : "Active Biopore Wells"}
              </span>
            </div>
          </div>

          {/* Bottom-Right Interactive 3D Camera Focus Bar */}
          {!props.compact && (
            <div className="absolute right-4 bottom-4 z-10 hidden items-center gap-1 rounded-full bg-[#080808]/90 p-1 text-white shadow-lg backdrop-blur-md md:flex">
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
                    className={`min-h-[30px] cursor-pointer rounded-full px-2.5 py-1 font-mono text-[10px] font-medium transition ${
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
                className={`min-h-[30px] cursor-pointer rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold transition ${
                  autoOrbit
                    ? "bg-white/15 text-[#c6f432]"
                    : "bg-white/5 text-[#aaa9ad]"
                }`}
              >
                {autoOrbit ? "Orbit: ON" : "Orbit: OFF"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
