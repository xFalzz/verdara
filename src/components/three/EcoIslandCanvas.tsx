"use client";

import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Float, ContactShadows } from "@react-three/drei";
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
}

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
    skyNight: "#0F1115",
    plazaSlab: "#DFDDD4",
    turf: "#698B57",
    subsoil: "#9C7A5B",
    bedrock: "#4A4E54",
    wallPrimary: "#FAF8F2",
    wallSecondary: "#EFECE4",
    wallAccent: "#E2CCB2",
    roofPrimary: "#B85233",
    roofSecondary: "#374151",
    pipeCopper: "#D97736",
    cisternWater: "#1E9E5A",
    foliagePrimary: "#3D6B47",
    foliageSecondary: "#82A868",
  },
  temperate: {
    skyDay: "#E6EAE8",
    skyNight: "#0F1115",
    plazaSlab: "#DCDFD9",
    turf: "#588157",
    subsoil: "#7F5539",
    bedrock: "#475569",
    wallPrimary: "#F8F9FA",
    wallSecondary: "#E9ECEF",
    wallAccent: "#DDE5B6",
    roofPrimary: "#334155",
    roofSecondary: "#7F1D1D",
    pipeCopper: "#D97736",
    cisternWater: "#2A9DBD",
    foliagePrimary: "#3A5A40",
    foliageSecondary: "#74A57F",
  },
  tropical: {
    skyDay: "#E7EFEA",
    skyNight: "#0D1210",
    plazaSlab: "#DCE3DD",
    turf: "#40916C",
    subsoil: "#774936",
    bedrock: "#374151",
    wallPrimary: "#FAF9F5",
    wallSecondary: "#F1EFE7",
    wallAccent: "#D8F3DC",
    roofPrimary: "#9A3412",
    roofSecondary: "#2D6A4F",
    pipeCopper: "#E07A5F",
    cisternWater: "#0D9488",
    foliagePrimary: "#2D6A4F",
    foliageSecondary: "#52B788",
  },
  arid: {
    skyDay: "#EFEAE1",
    skyNight: "#121110",
    plazaSlab: "#E6DEC8",
    turf: "#A39B68",
    subsoil: "#A47148",
    bedrock: "#57534E",
    wallPrimary: "#FDFBF7",
    wallSecondary: "#F3E9D2",
    wallAccent: "#E9D8A6",
    roofPrimary: "#C2410C",
    roofSecondary: "#78350F",
    pipeCopper: "#CA6702",
    cisternWater: "#0284C7",
    foliagePrimary: "#65A30D",
    foliageSecondary: "#84CC16",
  },
  continental: {
    skyDay: "#E5E9EC",
    skyNight: "#0D1014",
    plazaSlab: "#D8DEE3",
    turf: "#4F772D",
    subsoil: "#6C584C",
    bedrock: "#334155",
    wallPrimary: "#F8FAFC",
    wallSecondary: "#E2E8F0",
    wallAccent: "#CBD5E1",
    roofPrimary: "#1E293B",
    roofSecondary: "#991B1B",
    pipeCopper: "#D97736",
    cisternWater: "#0284C7",
    foliagePrimary: "#2D6A4F",
    foliageSecondary: "#40916C",
  },
  polar: {
    skyDay: "#E6EEF4",
    skyNight: "#0B0F17",
    plazaSlab: "#E2E8F0",
    turf: "#BAE6FD",
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
      {/* Concrete Plinth */}
      <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
        <boxGeometry args={[width + 0.14, 0.12, depth + 0.14]} />
        <meshStandardMaterial color="#8B8C89" roughness={0.85} />
      </mesh>

      {/* Main Townhouse Walls */}
      <mesh position={[0, height / 2 + 0.12, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={wallColor} roughness={0.7} />
      </mesh>

      {/* Architectural Window Grid */}
      {[-width * 0.24, width * 0.24].map((xOff, i) => (
        <mesh
          key={`win-front-${i}`}
          position={[xOff, height * 0.62 + 0.12, depth / 2 + 0.015]}
        >
          <boxGeometry args={[width * 0.22, height * 0.32, 0.02]} />
          <meshStandardMaterial
            color={isNight ? "#FDE68A" : "#334155"}
            emissive={isNight ? "#F59E0B" : "#0F172A"}
            emissiveIntensity={isNight ? 1.5 : 0.15}
          />
        </mesh>
      ))}

      {/* Timber Entrance Door */}
      <mesh position={[0, 0.36, depth / 2 + 0.015]}>
        <boxGeometry args={[0.28, 0.48, 0.025]} />
        <meshStandardMaterial color="#3F2E21" roughness={0.8} />
      </mesh>

      {/* Pitched Gable Roof */}
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

        {/* Monocrystalline Solar PV Array */}
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
                  emissiveIntensity={0.25}
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
  solarKwp,
  rainLitersYear,
  bioporeUnits,
  hideHudOverlays,
}: EcoIslandProps) {
  const palette = TOWN_PALETTES[biome] ?? TOWN_PALETTES.mediterranean;
  const turbineBladesRef = useRef<THREE.Group>(null);
  const pulseRingRef = useRef<THREE.Mesh>(null);

  const hasSolar = level >= 2 || unlockedItems.includes("solar_array");
  const hasCistern = level >= 2 || unlockedItems.includes("rain_cistern");
  const hasCompost =
    level >= 2 ||
    unlockedItems.includes("compost_dome") ||
    unlockedItems.includes("sorting_station");

  const trees = useMemo(
    () =>
      [
        [-2.75, 0.22, -2.1, 1.05],
        [-2.95, 0.22, -0.8, 0.88],
        [2.7, 0.22, -2.2, 1.0],
        [2.9, 0.22, 1.6, 0.95],
        [-2.5, 0.22, 2.1, 0.92],
        [0.4, 0.22, -2.75, 0.85],
        [-1.1, 0.22, -2.7, 0.95],
      ] as [number, number, number, number][],
    []
  );

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (turbineBladesRef.current) {
      turbineBladesRef.current.rotation.z -= delta * 2.2;
    }
    if (pulseRingRef.current) {
      const s = 1 + Math.sin(t * 2.4) * 0.04;
      pulseRingRef.current.scale.set(s, s, 1);
    }
  });

  return (
    <group position={[0, -0.35, 0]}>
      {/* 1. ARCHITECTURAL TOWN BLOCK SLAB (Townhouse.dev Cutaway Base) */}
      <mesh position={[0, -0.48, 0]} receiveShadow castShadow>
        <boxGeometry args={[7.4, 0.55, 6.2]} />
        <meshStandardMaterial color={palette.bedrock} roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[7.5, 0.24, 6.3]} />
        <meshStandardMaterial color={palette.subsoil} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.11, 0]} receiveShadow castShadow>
        <boxGeometry args={[7.6, 0.2, 6.4]} />
        <meshStandardMaterial color={palette.turf} roughness={0.78} />
      </mesh>

      {/* Paved Town Street & Courtyard Crosswalk */}
      <mesh position={[0, 0.22, 1.05]} receiveShadow>
        <boxGeometry args={[7.2, 0.03, 1.1]} />
        <meshStandardMaterial color="#3A3D42" roughness={0.85} />
      </mesh>
      {/* Street Dashed Center Line */}
      {[-2.8, -1.7, -0.6, 0.5, 1.6, 2.7].map((xPos, i) => (
        <mesh key={`dash-${i}`} position={[xPos, 0.24, 1.05]}>
          <boxGeometry args={[0.5, 0.01, 0.06]} />
          <meshStandardMaterial color="#E5E5E0" />
        </mesh>
      ))}

      {/* Limestone Courtyard Plaza */}
      <mesh position={[0, 0.215, -0.45]} receiveShadow>
        <boxGeometry args={[5.8, 0.025, 2.6]} />
        <meshStandardMaterial color={palette.plazaSlab} roughness={0.8} />
      </mesh>

      {/* 2. PRIMARY TOWNHOUSE (Central Solar Residence) */}
      <PitchedTownhouse
        position={[-0.35, 0.22, -0.55]}
        width={2.05}
        height={1.25}
        depth={1.55}
        wallColor={palette.wallPrimary}
        roofColor={palette.roofPrimary}
        isNight={isNight}
        hasSolarPanels={hasSolar}
      />

      {/* 3. NEIGHBORING WEST TOWNHOUSE (Energy & Hydro Annex) */}
      <PitchedTownhouse
        position={[-2.25, 0.22, -0.65]}
        rotationY={0.08}
        width={1.35}
        height={1.05}
        depth={1.35}
        wallColor={palette.wallSecondary}
        roofColor={palette.roofSecondary}
        isNight={isNight}
        hasSolarPanels={level >= 3}
      />

      {/* 4. EAST CIRCULAR RECOVERY DEPOT & GREENHOUSE */}
      <PitchedTownhouse
        position={[2.15, 0.22, -0.8]}
        rotationY={-0.06}
        width={1.45}
        height={0.95}
        depth={1.35}
        wallColor={palette.wallAccent}
        roofColor={palette.roofSecondary}
        isNight={isNight}
        hasSolarPanels={level >= 4}
      />

      {/* 5. TOWNHOUSE.DEV SIGNATURE PIPES, WATER TANK & CISTERN */}
      {hasCistern && (
        <group position={[1.05, 0.22, -0.45]}>
          {/* Primary Rainwater Cistern Tank */}
          <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.38, 0.38, 0.96, 20]} />
            <meshStandardMaterial
              color="#1F4E5B"
              roughness={0.35}
              metalness={0.3}
            />
          </mesh>
          {/* Cistern Conical Cap */}
          <mesh position={[0, 1.04, 0]} castShadow>
            <coneGeometry args={[0.42, 0.22, 20]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </mesh>
          {/* Illuminated Water Gauge Strip */}
          <mesh position={[0, 0.48, 0.37]}>
            <boxGeometry args={[0.08, 0.72, 0.04]} />
            <meshStandardMaterial
              color="#22D3EE"
              emissive="#22D3EE"
              emissiveIntensity={0.75}
            />
          </mesh>

          {/* Copper Roof-to-Cistern Conduit Pipe */}
          <mesh position={[-0.36, 0.88, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.65, 10]} />
            <meshStandardMaterial
              color={palette.pipeCopper}
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
          {/* Ground Distribution Pipe to Biopore Ring */}
          <mesh position={[0, 0.08, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 1.15, 10]} />
            <meshStandardMaterial
              color="#2A9DBD"
              metalness={0.4}
              roughness={0.35}
            />
          </mesh>
        </group>
      )}

      {/* 6. ELEVATED MUNICIPAL WATER TOWER (Back Right) */}
      <group position={[1.45, 0.22, -2.05]}>
        {[-0.2, 0.2].map((lx, i) =>
          [-0.2, 0.2].map((lz, j) => (
            <mesh
              key={`leg-${i}-${j}`}
              position={[lx, 0.55, lz]}
              castShadow
            >
              <cylinderGeometry args={[0.035, 0.045, 1.1, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.5} />
            </mesh>
          ))
        )}
        <mesh position={[0, 1.32, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.68, 18]} />
          <meshStandardMaterial color="#D97736" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.76, 0]} castShadow>
          <coneGeometry args={[0.46, 0.24, 18]} />
          <meshStandardMaterial color="#1E293B" roughness={0.6} />
        </mesh>
      </group>

      {/* 7. GREENHOUSE DOME & 3-STREAM SORTING BAYS (Front Plaza) */}
      {hasCompost && (
        <group position={[-1.75, 0.22, 1.95]}>
          <mesh position={[0, 0.28, 0]} castShadow>
            <icosahedronGeometry args={[0.38, 1]} />
            <meshStandardMaterial
              color="#1E9E5A"
              roughness={0.45}
              flatShading
            />
          </mesh>
          {[
            { x: 0.65, color: "#1E9E5A" },
            { x: 0.95, color: "#E9A23B" },
            { x: 1.25, color: "#2A9DBD" },
          ].map((bin, idx) => (
            <mesh key={`sort-${idx}`} position={[bin.x, 0.18, 0]} castShadow>
              <boxGeometry args={[0.22, 0.34, 0.24]} />
              <meshStandardMaterial color={bin.color} roughness={0.4} />
            </mesh>
          ))}
        </group>
      )}

      {/* 8. BIOPORE INFILTRATION NODES ALONG BOULEVARD */}
      <group position={[0.9, 0.23, 1.95]}>
        {[-0.6, -0.2, 0.2, 0.6, 1.0].map((bx, idx) => (
          <mesh key={`bio-${idx}`} position={[bx, 0, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.04, 14]} />
            <meshStandardMaterial
              color="#1E9E5A"
              emissive="#1E9E5A"
              emissiveIntensity={0.45}
            />
          </mesh>
        ))}
        <mesh
          ref={pulseRingRef}
          position={[0.2, 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.16, 0.22, 20]} />
          <meshBasicMaterial color="#16C847" transparent opacity={0.75} />
        </mesh>
      </group>

      {/* 9. MICRO WIND TURBINE */}
      <group position={[-2.75, 0.22, -2.0]}>
        <mesh position={[0, 1.05, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.065, 2.1, 12]} />
          <meshStandardMaterial color="#F8FAFC" metalness={0.5} roughness={0.3} />
        </mesh>
        <group ref={turbineBladesRef} position={[0, 2.05, 0.07]}>
          {[0, 1, 2].map((bIdx) => (
            <mesh
              key={`blade-${bIdx}`}
              rotation={[0, 0, (bIdx * Math.PI * 2) / 3]}
            >
              <boxGeometry args={[0.06, 0.68, 0.02]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          ))}
        </group>
      </group>

      {/* 10. TREES & URBAN CANOPY */}
      {trees.map(([x, y, z, scale], idx) => (
        <group key={`tree-${idx}`} position={[x, y, z]} scale={scale}>
          <mesh position={[0, 0.24, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.085, 0.48, 7]} />
            <meshStandardMaterial color="#5C4033" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.64, 0]} castShadow>
            <icosahedronGeometry args={[0.38, 1]} />
            <meshStandardMaterial
              color={
                idx % 2 === 0
                  ? palette.foliagePrimary
                  : palette.foliageSecondary
              }
              roughness={0.65}
              flatShading
            />
          </mesh>
        </group>
      ))}

      {/* 11. CLEAN ARCHITECTURAL NODE PINS (Townhouse.dev Grade Dots) */}
      {!hideHudOverlays && (
        <>
          <Html position={[-0.35, 2.25, -0.4]} center distanceFactor={12}>
            <div className="pointer-events-none flex items-center gap-1.5 whitespace-nowrap rounded-full border border-black/15 bg-white/95 px-2.5 py-1 font-mono text-[11px] font-semibold text-[#111] shadow-md">
              <span className="h-2 w-2 rounded-full bg-[#1e9e5a]" />
              <span>Solar Roof · {solarKwp} kWp</span>
            </div>
          </Html>
          <Html position={[1.15, 1.65, -0.35]} center distanceFactor={12}>
            <div className="pointer-events-none flex items-center gap-1.5 whitespace-nowrap rounded-full border border-black/15 bg-white/95 px-2.5 py-1 font-mono text-[11px] font-semibold text-[#111] shadow-md">
              <span className="h-2 w-2 rounded-full bg-[#2a9dbd]" />
              <span>Cistern · {Math.round(rainLitersYear / 1000)}k L/yr</span>
            </div>
          </Html>
          <Html position={[1.1, 0.65, 1.95]} center distanceFactor={12}>
            <div className="pointer-events-none flex items-center gap-1.5 whitespace-nowrap rounded-full border border-black/15 bg-white/95 px-2.5 py-1 font-mono text-[11px] font-semibold text-[#111] shadow-md">
              <span className="h-2 w-2 rounded-full bg-[#e9a23b]" />
              <span>{bioporeUnits} Biopores</span>
            </div>
          </Html>
        </>
      )}

      {/* Subtle Floating Cloud */}
      <Float speed={1.1} rotationIntensity={0.05} floatIntensity={0.25}>
        <group position={[-2.2, 2.85, -1.6]}>
          <mesh position={[0, 0, 0]}>
            <icosahedronGeometry args={[0.3, 1]} />
            <meshStandardMaterial
              color={isNight ? "#334155" : "#FFFFFF"}
              transparent
              opacity={0.85}
              flatShading
            />
          </mesh>
          <mesh position={[0.26, -0.04, 0.06]}>
            <icosahedronGeometry args={[0.22, 1]} />
            <meshStandardMaterial
              color={isNight ? "#334155" : "#FFFFFF"}
              transparent
              opacity={0.85}
              flatShading
            />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

export default function EcoIslandCanvas(props: EcoIslandProps) {
  const palette = TOWN_PALETTES[props.biome] ?? TOWN_PALETTES.mediterranean;
  const bgHex = props.isNight ? palette.skyNight : palette.skyDay;

  return (
    <div
      className="relative h-full w-full overflow-hidden select-none"
      style={{ backgroundColor: bgHex }}
    >
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [6.8, 5.1, 6.8], fov: 35 }}
      >
        <color attach="background" args={[bgHex]} />
        <ambientLight intensity={props.isNight ? 0.55 : 0.95} />
        <directionalLight
          castShadow
          position={props.isNight ? [-6, 7, -4] : [8, 12, 6]}
          intensity={props.isNight ? 0.7 : 1.65}
          color={props.isNight ? "#93C5FD" : "#FFFDF7"}
          shadow-mapSize={[1024, 1024]}
        />
        {props.isNight && (
          <pointLight
            position={[0, 1.8, 1.0]}
            intensity={2.0}
            color="#FDE68A"
            distance={8}
          />
        )}

        <LivingTownScene {...props} />

        <ContactShadows
          position={[0, -1.15, 0]}
          opacity={0.32}
          scale={12}
          blur={2.4}
          far={4}
        />

        <OrbitControls
          enablePan={false}
          minDistance={5.2}
          maxDistance={11.5}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.3}
          autoRotate
          autoRotateSpeed={0.45}
        />
      </Canvas>
    </div>
  );
}
