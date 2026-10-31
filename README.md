<div align="center">

# Verdara: Spatial Climate Intelligence & Autonomous 3D Eco-District Twin

[![Meta AI Track](https://img.shields.io/badge/Meta%20AI-SAM%203.1%20%7C%20Muse%20Spark-0668E1?style=for-the-badge&logo=meta&logoColor=white)](https://github.com/xFalzz/verdara)
[![GitHub Stars](https://img.shields.io/github/stars/xFalzz/verdara?style=for-the-badge&logo=github&color=c6f432&labelColor=0b0c0e)](https://github.com/xFalzz/verdara)
[![Test Suite](https://img.shields.io/badge/Vitest-12%2F12%20Passed-10b981?style=for-the-badge&logo=vitest&logoColor=white)](https://github.com/xFalzz/verdara)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%200%20Errors-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://github.com/xFalzz/verdara)
[![Coverage](https://img.shields.io/badge/Global%20Coverage-195%2B%20Countries-f59e0b?style=for-the-badge&logo=globe&logoColor=white)](https://github.com/xFalzz/verdara)
[![License](https://img.shields.io/badge/License-MIT-gray?style=for-the-badge)](https://github.com/xFalzz/verdara/blob/main/LICENSE)

<p align="center">
  <strong>Transforming any residential property or neighborhood across 195+ countries into a scientifically grounded, living 3D Eco-District.</strong><br />
  Powered by zero-shot spatial perception (<strong>Meta SAM 3.1</strong>), multi-agent deliberation (<strong>Meta Muse Spark</strong>), deterministic physical equations (<strong>NREL PVWatts v8</strong>, <strong>DIN 1989-1</strong>, <strong>Open-Meteo ERA5</strong>), and a <strong>60-FPS procedural PBR spatial digital twin</strong>.
</p>

[Live Application](https://verdara.space) · [Explore Documentation](#3-complete-application-route--workspace-guide) · [Scientific Formulations](#5-deterministic-physics-hydrology--valuation-engine) · [GitHub Repository](https://github.com/xFalzz/verdara)

</div>

---

## Executive Summary

**Verdara** addresses the core challenge of modern climate adaptation software: bridging the gap between high-level generative AI and rigorous civil engineering physics.

Traditional environmental tools either trap users in fragmented engineering spreadsheets or rely on ungrounded AI models that hallucinate energy yields, water capacities, and financial returns. Verdara enforces a strict **Perception -> Physics -> Deliberation -> Spatial Visualization** paradigm:

1. **Perception**: Zero-shot computer vision (**Meta SAM 3.1**) extracts rooftop polygons, rainwater downspouts, permeable soil boundaries, and recyclable commodities directly from user photos.
2. **Physics**: Every single metric is computed deterministically using peer-reviewed engineering equations (**NREL PVWatts v8**, **DIN 1989-1**, **Darcy-Brata biopore hydraulics**, **US EPA WARM v16**) before any language model is invoked, producing an immutable `SITE_BRIEF`.
3. **Deliberation**: Three domain-specialist AI agents (**Meta Muse Spark**) debate multi-criteria trade-offs, guarded by an automated **+/-3.0% numerical fact firewall** that prevents token drift.
4. **Spatial Visualization**: The verified retrofit is rendered in an interactive, procedural **60-FPS 3D Eco-District** supporting baseline operation (`Run`), storm stress testing (`Break`), and autonomous remediation (`Heal`).

---

## Table of Contents

1. [System Architecture & 5-Stage Computing Pipeline](#1-system-architecture--5-stage-computing-pipeline)
2. [Complete Application Route & Workspace Guide](#2-complete-application-route--workspace-guide)
3. [Meta AI & Spatial Perception Orchestration](#3-meta-ai--spatial-perception-orchestration)
4. [Deterministic Physics, Hydrology & Climatology Engine](#4-deterministic-physics-hydrology--climatology-engine)
   * [4.1 Rooftop Solar Photovoltaics (NREL PVWatts v8 Formulation)](#41-rooftop-solar-photovoltaics-nrel-pvwatts-v8-formulation)
   * [4.2 Rainwater Harvesting & Cistern Mass Balance (DIN 1989-1)](#42-rainwater-harvesting--cistern-mass-balance-din-1989-1)
   * [4.3 Cylindrical Biopore Infiltration Wells & Flood Attenuation (Darcy's Law)](#43-cylindrical-biopore-infiltration-wells--flood-attenuation-darcys-law)
   * [4.4 Microclimate Evapotranspiration & Thermal Comfort Index (TCI)](#44-microclimate-evapotranspiration--thermal-comfort-index-tci)
   * [4.5 Circular Economy Commodity Valuation (US EPA WARM v16 & Local DRS)](#45-circular-economy-commodity-valuation-us-epa-warm-v16--local-drs)
5. [Procedural 3D Spatial Digital Twin Architecture](#5-procedural-3d-spatial-digital-twin-architecture)
6. [Global 195+ Country & Koppen-Geiger Climate Synthesis](#6-global-195-country--koppen-geiger-climate-synthesis)
7. [Enterprise Database v3.2 & REST API Reference](#7-enterprise-database-v32--rest-api-reference)
8. [Cybersecurity Defense-in-Depth & 64-Bit dHash Verification](#8-cybersecurity-defense-in-depth--64-bit-dhash-verification)
9. [Repository Structure & Local Development Setup](#9-repository-structure--local-development-setup)
10. [Authors, Acknowledgments & License](#10-authors-acknowledgments--license)

---

## 1. System Architecture & 5-Stage Computing Pipeline

The Verdara computing pipeline guarantees zero numerical hallucination through a unidirectional state flow:

```text
+-------------------------------------------------------------------------------------------------+
| STAGE 1: GEOSPATIAL & CLIMATE REANALYSIS SYNTHESIS (src/lib/science/world-cities.ts)            |
|  * Resolves 195+ sovereign countries, 28 curated benchmark cities, or arbitrary GPS coordinates |
|  * Determines Peel et al. (2007) Koppen-Geiger climate classification (Af, Am, BWh, Csb, Cfb)   |
|  * Loads 12-month ERA5 precipitation normals (mm), NASA POWER solar irradiance GHI (kWh/m2/day) |
|  * Maps local currency, residential utility tariffs ($/kWh), and grid carbon intensity (kg/kWh)|
+------------------------------------------------+------------------------------------------------+
                                                 |
                                                 v
+-------------------------------------------------------------------------------------------------+
| STAGE 2: META SAM 3.1 SPATIAL PERCEPTION (src/lib/lens/masks.ts & /api/meta/sam)                |
|  * Computes SHA-256 specimen hash + 64-bit perceptual dHash (8x8 luminance gradient)            |
|  * Executes zero-shot concept segmentation via Meta SAM 3.1                                     |
|  * Emits normalized [0..1000] x [0..1000] polygon contours with confidence telemetry           |
|  * Classifies: SOLAR_ROOF | RAIN_CONDUIT | NATIVE_FLORA | RECYCLABLE_COMMODITY                  |
+------------------------------------------------+------------------------------------------------+
                                                 |
                                                 v
+-------------------------------------------------------------------------------------------------+
| STAGE 3: DETERMINISTIC PHYSICS & HYDRAULIC CORE (src/lib/science/housing.ts)                    |
|  * Solves NREL PVWatts v8 equations (effective roof area, cell heating, annual kWh yield)       |
|  * Computes DIN 1989-1 mass balance (runoff coefficient 0.85, vortex filter 0.90, cistern sizing)|
|  * Solves Darcy-Brata cylindrical biopore hydraulic flux & Steward evapotranspiration TCI       |
|  * Evaluates US EPA WARM v16 embodied carbon savings & local Deposit Return Scheme cash values  |
|  * Locks all computed figures into an immutable, audit-ready SITE_BRIEF JSON payload            |
+------------------------------------------------+------------------------------------------------+
                                                 |
                                                 v
+-------------------------------------------------------------------------------------------------+
| STAGE 4: MULTI-AGENT COUNCIL & +/-3% FACT FIREWALL (src/lib/meta/client.ts)                     |
|  * Orchestrates Dr. Flora (Botanist), Ir. Arka (Civil Engineer), and Sirkula (Economist)        |
|  * Dual engine: Hosted Meta Muse Spark API with local muse-spark-open open-weight fallback      |
|  * validateNumbersAgainstSiteBrief() parses every emitted number with physical units            |
|  * Strictly bounds AI numerical drift within <= 3.0%; auto-substitutes exact physics if drifted |
+------------------------------------------------+------------------------------------------------+
                                                 |
                                                 v
+-------------------------------------------------------------------------------------------------+
| STAGE 5: 60-FPS PROCEDURAL 3D TWIN & PERSISTENT LEDGER (EcoIslandCanvas.tsx)                    |
|  * Renders procedural PBR geometry (travertine plinth, CLT timber, PV arrays, water canals)    |
|  * Simulates dynamic 3-phase environmental state machine: 01 Run | 02 Break | 03 Heal           |
|  * Synchronizes Zustand reactive state store (useVerdaraStore) with Enterprise Database v3.2    |
+-------------------------------------------------------------------------------------------------+
```

---

## 2. Complete Application Route & Workspace Guide

Verdara provides 9 dedicated routes organized into public exploration interfaces and authenticated engineering workspaces protected by `src/components/ui/AuthGate.tsx`:

| Route | Workspace / Interface | Access Level | Architectural & Functional Highlights |
| :--- | :--- | :--- | :--- |
| `/` | **Living Spatial Eco-Town** | Public | Dynamic transparent sticky header, interactive DOVV condensed wordmark with cursor-proximity variable font wave, live 3D Eco-District preview (`Run`, `Break`, `Heal`), Draggable 10-Country Climate Deck, 12-Month ERA5 weather matrix, and live GitHub stars repository badge. |
| `/login` | **Authentication & Sandbox Gate** | Public | Enforces resident session security. Enforces resident session security with Supabase OAuth (Google and Facebook) and verified email magic links with automatic `?next=` return redirection. |
| `/dashboard` | **Living 3D Eco-Town Studio** | Auth Required | Full-viewport procedural 3D Eco-District studio. Features an interactive **Roof Area Slider (`40 m²` to `600 m²`)**, real-time solar panel and cistern recalculation, progressive Level 1 to 5 architectural milestones, and smooth camera presets (`Overview`, `Solar Hub`, `Hydro Canal`, `EV Street`). |
| `/lens` | **Omni-Spatial Camera Lens** | Auth Required | Interactive **Meta SAM 3.1 Polygon Visor**, X-Ray wireframe overlay, and **Meta Muse Image Before/After Eco-Retrofit Curtain**. Analyzes rooftop solar potential, rainwater downspouts, and recyclable commodities (PET, HDPE, Aluminum, Copper, E-Waste PCB) with downloadable 1200x630 PNG Impact Cards. |
| `/radar` | **3D Urban Roof & Hydrological Radar** | Auth Required | High-resolution 3D building extrusion (`pitch: 55 deg`) paired with a SAM 3D Terrain & Drainage Slope Mesh. Computes neighborhood solar irradiance, stormwater runoff catchment, and nearby circular waste-bank recovery points. |
| `/council` | **3-Specialist AI Council** | Auth Required | Multi-agent deliberation studio where **Dr. Flora** (Botanist), **Ir. Arka** (Civil Engineer), and **Sirkula** (Economist) analyze the immutable `SITE_BRIEF`. All emitted figures are audited by the deterministic `validateNumbersAgainstSiteBrief` firewall. |
| `/academy` | **Field-Proof Verification Academy** | Auth Required | Hands-on civic sustainability academy. Replaces multiple-choice quizzes with **Camera Proof-of-Action Verification**. Leverages Meta SAM 3.1 object segmentation and **64-bit perceptual `dHash` anti-spoofing** to verify real-world citizen actions. |
| `/settings` | **7-Layer Shield & Preferences** | Auth Required | Administrative control panel displaying live telemetry for the **7-Layer API Credit Shield**, SHA-256 golden specimen cache, `muse-spark-open` model toggle, unit system (`Metric` / `Imperial`), and language preference (`EN` / `ID`). |
| `/faq` | **Platform Knowledge Base** | Public | 12 comprehensive bilingual engineering Q&A entries with instant keyword search, category filtering, technical callouts, and direct links to active workspaces. |

---

## 3. Meta AI & Spatial Perception Orchestration

Verdara integrates four specialized AI capabilities from the Meta AI ecosystem (`src/lib/meta/` and `src/app/api/meta/`):

### 3.1 Meta SAM 3.1 (`sam-3-1`): Zero-Shot Spatial Segmentation
* **Source Modules**: `src/app/api/meta/sam/route.ts`, `src/lib/lens/masks.ts`, `src/components/lens/SpatialMaskViewer.tsx`
* **Mechanism**: Processes RGB photographs and extracts pixel-accurate polygon boundary contours normalized to a coordinate space of $[0, 1000] \times [0, 1000]$.
* **Semantic Class Hierarchy**:
  1. `SOLAR_ROOF`: Unshaded pitched or flat roof planes suitable for photovoltaic mounting.
  2. `RAIN_CONDUIT`: Roof gutters, downspout collector pipes, and impervious catchment planes for DIN 1989-1 cistern routing.
  3. `NATIVE_FLORA`: Permeable soil zones, bioswales, and tree canopies for urban heat island mitigation.
  4. `RECYCLABLE_COMMODITY`: Circular resources (`PET`, `HDPE`, `Aluminum`, `Copper`, `Steel`, `Cardboard`, `Glass`, `E-Waste PCB`).

### 3.2 Meta Muse Spark (`muse-spark`): 3-Specialist Civic Council
* **Source Modules**: `src/app/api/meta/muse/route.ts`, `src/lib/meta/client.ts`, `src/app/council/page.tsx`
* **Autonomous Personas**:
  * **Dr. Flora (Urban Botanist & Microclimate Architect)**: Analyzes soil permeability, native species selection, and Urban Heat Island (UHI) latent heat flux cooling.
  * **Ir. Arka (Photovoltaic & Hydrological Civil Engineer)**: Sizes solar string capacity, tilt optimization, first-flush rainwater diverters, cistern volume, and cylindrical biopore soak pits.
  * **Sirkula (Circular Economist & Policy Analyst)**: Evaluates CapEx payback horizons, utility bill savings, and Deposit Return Scheme (DRS) cash recovery.

### 3.3 The +/-3.0% Numerical Fact Firewall Algorithm
* **Source Module**: `validateNumbersAgainstSiteBrief()` in `src/lib/meta/client.ts`
* **Theoretical Foundation**: Even state-of-the-art autoregressive language models can hallucinate or round digits when emitting structured engineering text. To maintain complete scientific integrity, Verdara subjects every AI response to a post-processing verification pass:
  1. A regex-based unit extractor parses all numerical tokens associated with physical units (`kWp`, `kWh`, `L`, `gal`, `m²`, `ft²`, `biopores`, and currency amounts).
  2. Each extracted token $x_{\text{AI}}$ is compared against the corresponding physics engine value $x_{\text{brief}}$ stored in `SITE_BRIEF`:

$$
\text{Relative Drift} = \frac{|x_{\text{AI}} - x_{\text{brief}}|}{x_{\text{brief}}} \le 0.03 \quad (3.0\%)
$$

  3. If $\text{Relative Drift} > 0.03$, the firewall automatically replaces the drafted number with the exact deterministic value from `SITE_BRIEF` and logs an audit notice.

### 3.4 Meta Muse Image (`muse-image`): Generative Eco-Retrofit Synthesis
* **Source Modules**: `src/app/api/meta/image/route.ts`, `src/components/lens/SpatialMaskViewer.tsx`
* **Mechanism**: Combines SAM 3.1 polygon masks with local Koppen-Geiger climate parameters to generate high-fidelity before-and-after architectural retrofits, rendered via an interactive sliding curtain.

---

## 4. Deterministic Physics, Hydrology & Climatology Engine

All physical, hydrological, and financial computations are executed in pure, deterministic TypeScript modules located in `src/lib/science/` and validated by 12 comprehensive unit tests in `tests/science.test.ts`.

### 4.1 Rooftop Solar Photovoltaics (NREL PVWatts v8 Formulation)
Implemented in `src/lib/science/housing.ts`:

#### Usable Solar Array Area
The net usable roof area available for photovoltaic installation after reserving mandatory perimeter setbacks, maintenance pathways, and edge clearances is given by:

$$
A_{\text{solar}} = A_{\text{roof}} \times f_{\text{usable}}
$$

where $A_{\text{roof}}$ is the gross projected horizontal roof area in $\text{m}^2$, and $f_{\text{usable}} = 0.60$ (60% net usable area fraction).

#### Installed DC Peak Capacity & Module Count
Using high-efficiency monocrystalline silicon modules rated at $400\text{ Wp}$ with a nominal power density $\rho_{\text{pv}} = 0.205\text{ kWp/m}^2$ ($205\text{ Wp/m}^2$):

$$
P_{\text{kWp}} = A_{\text{solar}} \times 0.205
$$

$$
N_{\text{panels}} = \left\lfloor \frac{P_{\text{kWp}}}{0.400} + 0.5 \right\rfloor
$$

#### Cell Operating Temperature & Temperature Derating
Photovoltaic efficiency decreases at elevated cell temperatures. Using the Nominal Operating Cell Temperature (NOCT) model calibrated with local maximum warm-month ambient temperature $T_{\text{warm\_max}}$ and a standard temperature derating coefficient $\gamma = 0.0038\text{ /}^\circ\text{C}$ ($-0.38\%/^\circ\text{C}$ relative to Standard Test Conditions $T_{\text{stc}} = 25^\circ\text{C}$):

$$
T_{\text{cell}} = T_{\text{warm\_max}} + 18.0^\circ\text{C}
$$

$$
f_{\text{temp}} = \min\left(1.02,\ \max\left(0.78,\ 1.0 - 0.0038 \times \max(0,\ T_{\text{cell}} - 25.0)\right)\right)
$$

The factor is bounded between $0.78$ (extreme desert thermal derating) and $1.02$ (cold climate efficiency bonus).

#### Total Annual Solar Energy Yield
Accounting for the 10-year mean Global Horizontal Irradiance ($\text{GHI}_{\text{day}}$ in $\text{kWh/m}^2/\text{day}$) from NASA POWER / Open-Meteo ERA5, and a total system Performance Ratio $\text{PR}_{\text{system}} = 0.80$ (incorporating inverter efficiency $\eta_{\text{inv}} = 0.96$, AC/DC cable losses, and dust soiling):

$$
E_{\text{annual}} = P_{\text{kWp}} \times \text{GHI}_{\text{day}} \times 365 \times \text{PR}_{\text{system}} \times f_{\text{temp}}
$$

#### Avoided Grid Greenhouse Gas Emissions
Using the country-specific electricity grid emission factor $EF_{\text{grid}}$ in $\text{kg CO}_2e/\text{kWh}$:

$$
\text{CO}_2e_{\text{avoided}} = E_{\text{annual}} \times EF_{\text{grid}}
$$

| Parameter | Symbol | Value / Range | Scientific Unit | Description |
| :--- | :--- | :--- | :--- | :--- |
| Usable Area Fraction | $f_{\text{usable}}$ | `0.60` | dimensionless | Net usable roof factor |
| Module Power Density | $\rho_{\text{pv}}$ | `0.205` | $\text{kWp/m}^2$ | Monocrystalline wafer density |
| Temperature Coefficient | $\gamma$ | `0.0038` | $1/^\circ\text{C}$ | $-0.38\%/^\circ\text{C}$ above $25^\circ\text{C}$ |
| System Performance Ratio | $\text{PR}_{\text{system}}$ | `0.80` | dimensionless | Combined inverter & cable loss |

---

### 4.2 Rainwater Harvesting & Cistern Mass Balance (DIN 1989-1)
Implemented in `src/lib/science/housing.ts` and `src/lib/science/climate.ts`:

#### Annual Harvestable Precipitation Volume
Following the German standard DIN 1989-1 (*Rainwater Harvesting Systems*), annual catchment volume is determined by:

$$
V_{\text{harvest}} = A_{\text{roof}} \times P_{\text{annual\_mm}} \times C_{\text{runoff}} \times \eta_{\text{filter}}
$$

where:
* $P_{\text{annual\_mm}}$: 10-year mean annual precipitation in $\text{mm}$ ($\text{L/m}^2$).
* $C_{\text{runoff}} = 0.85$: Standard runoff coefficient for pitched metal or glazed tile roofs ($15\%$ splash and evaporation loss).
* $\eta_{\text{filter}} = 0.90$: Hydraulic efficiency of first-flush vortex sediment diverter ($90\%$ yield into storage).

#### Recommended Cistern Storage Tank Sizing
DIN 1989-1 specifies sizing storage to buffer approximately 21 to 31 consecutive dry days during seasonal fluctuations, calibrated as $8.5\%$ of the annual harvestable volume:

$$
V_{\text{cistern}} = \min\left(15000,\ \max\left(1000,\ 500 \times \left\lfloor \frac{V_{\text{harvest}} \times 0.085}{500} + 0.5 \right\rfloor \right)\right)
$$

The result is clamped between $1,000\text{ L}$ and $15,000\text{ L}$ and rounded to standard commercial $500\text{ L}$ tank increments.

---

### 4.3 Cylindrical Biopore Infiltration Wells & Flood Attenuation (Darcy's Law)
Implemented in `src/lib/science/housing.ts`:

#### Soil Infiltration Mechanics (Kamir R. Brata & Darcy's Law)
A biopore well is a cylindrical vertical shaft drilled into the subsoil ($d = 0.10\text{ m}$ diameter, $h = 1.0\text{ m}$ depth). The active cylindrical percolation wall area is:

$$
A_{\text{wall}} = \pi \times d \times h = 3.1416 \times 0.10 \times 1.0 \approx 0.314\text{ m}^2
$$

Packed with organic composting leaf litter, soil fauna (earthworms and roots) create micro-cavities that sustain a percolation flux $q_{\text{infilt}} \approx 180\text{ L/hr}$ per shaft even in dense urban clay soils.

#### Required Biopore Well Count
The number of biopore wells needed to absorb storm runoff during the region's peak rainfall month ($P_{\text{peak\_month\_mm}}$) is calculated as:

$$
N_{\text{biopori}} = \min\left(40,\ \max\left(4,\ \left\lceil \frac{A_{\text{roof}} \times P_{\text{peak\_month\_mm}}}{2600} \right\rceil \right)\right)
$$

bounded between a minimum of 4 perimeter aeration shafts and a maximum of 40 residential shafts.

#### Peak Storm Runoff Attenuation Percentage
The reduction in surface stormwater flooding achieved by the biopore network is evaluated as:

$$
\text{Runoff Attenuation (\%)} = \min\left(92\%,\ 24 + \left\lfloor N_{\text{biopori}} \times 3.8 + 0.5 \right\rfloor \right)
$$

---

### 4.4 Microclimate Evapotranspiration & Thermal Comfort Index (TCI)
Implemented in `src/lib/science/housing.ts`:

#### Microclimate Surface Cooling ($\Delta T_{\text{cool}}$)
Cooling is driven by solar panel shading (albedo interception) and vegetative latent heat flux ($L_v \approx 2.45\text{ MJ/kg}$ of water evaporated):

$$
\Delta T_{\text{cool}} = -\left(0.85 + 2.40 \times R_{\text{green}} + 0.65 \times f_{\text{cool\_roof}}\right)
$$

where $R_{\text{green}} \in [0, 1]$ is the permeable vegetative surface ratio, and $f_{\text{cool\_roof}} \in [0, 1]$ is the roof solar coverage fraction.

#### Composite Thermal Comfort Index (TCI Score, scale 35 to 98)

$$
\text{TCI} = \min\left(98,\ \max\left(35,\ 100 - \max(0,\ T_{\text{warm\_max}} - 22.0) \times 2.4 + |\Delta T_{\text{cool}}| \times 6.0 \right)\right)
$$

---

### 4.5 Circular Economy Commodity Valuation (US EPA WARM v16 & Local DRS)
Implemented in `src/lib/science/circular.ts`:

#### Embodied Carbon Avoidance
Using the US EPA Waste Reduction Model (WARM v16), net lifecycle greenhouse gas emissions avoided by diverting post-consumer commodities from landfills into closed-loop recycling are calculated as:

$$
\text{CO}_2e_{\text{salvaged}} = \sum_{i=1}^{k} m_i \times EF_{\text{warm},i}
$$

| Commodity Material | EPA WARM Factor ($EF_{\text{warm}}$) | Unit | Primary Circular Output |
| :--- | :--- | :--- | :--- |
| **Aluminum (Cans / Foil)** | `9.13` | $\text{kg CO}_2e/\text{kg}$ | Secondary ingot remelting (95% energy saved) |
| **E-Waste (Printed Circuit Boards)** | `12.40` | $\text{kg CO}_2e/\text{kg}$ | Precious metal smelting (Au, Ag, Cu recovery) |
| **Copper (Pipes / Wiring)** | `3.84` | $\text{kg CO}_2e/\text{kg}$ | Electrical busbar and pipe refabrication |
| **PET Plastic (Beverage Bottles)** | `1.52` | $\text{kg CO}_2e/\text{kg}$ | Bottle-to-bottle food-grade rPET pellets |
| **HDPE Plastic (Jugs / Containers)** | `1.15` | $\text{kg CO}_2e/\text{kg}$ | Conduit pipe and drainage infrastructure |
| **Steel (Structural / Food Cans)** | `1.84` | $\text{kg CO}_2e/\text{kg}$ | Electric Arc Furnace (EAF) reinforcement bar |
| **Corrugated Cardboard** | `0.94` | $\text{kg CO}_2e/\text{kg}$ | Recycled pulp packaging boxes |
| **Container Glass (Bottles / Jars)** | `0.28` | $\text{kg CO}_2e/\text{kg}$ | Cullet feedstock for new container glass |

#### Localized Financial Cash Recovery
Using municipal Deposit Return Scheme (DRS) bottle bills or localized waste-bank unit rates ($P_{\text{drs},i}$):

$$
V_{\text{cash}} = \sum_{i=1}^{k} m_i \times P_{\text{drs},i}
$$

---

## 5. Procedural 3D Spatial Digital Twin Architecture

The 3D Eco-District (`src/components/three/EcoIslandCanvas.tsx`) is constructed entirely from mathematical primitives without requiring multi-megabyte external `.glb` downloads:

* **Zero-Asset-Bloat Procedural PBR Geometry**:
  * `GrandSolarPavilion`: Travertine stone foundation plinth, cross-laminated timber (CLT) cantilever overhang, high-transmittance glass curtain wall, integrated monocrystalline rooftop PV arrays with metallic busbar grids, and a home energy storage battery unit with live LED telemetry.
  * `RealisticEcoHouse`: Residential villas with parametric pitched roof angles, timber entrance portals, and gutter downspout routing.
  * District Infrastructure: Hydrological water canal with animated wave shader, timber footbridge, elevated cistern tower, 12 illuminated biopore wells, circular recycling station, botanical dome, dual-axis wind turbines, and an autonomous EV shuttle.
* **3-Phase Environmental Simulation State Machine**:
  * `01 Normal Day (Run)`: Nominal solar generation, steady canal water table ($y = -0.14$), gentle atmospheric updraft particles, and EV transit.
  * `02 Storm Surge (Break)`: Peak monsoon deluge, high-velocity rain particles, canal water swelling to $y = 0.05$, a dynamic street flood surge sheet submerging roadways, and thermal roof heat stress alerts ($+4.2^\circ\text{C}$).
  * `03 AI Solution (Heal)`: Meta SAM 3.1 green laser scan beam, deployment of secondary solar arrays ($+35\%\text{ kWp}$), biopore drainage activation, and floodwater evacuation into the cistern.
* **Smooth Camera Rig**: Frame-rate-independent vector interpolation (`THREE.Vector3.lerp`) allows seamless transitions between `Overview`, `Solar Hub`, `Hydro Canal`, and `EV Street` presets while preserving user orbit controls.

---

## 6. Global 195+ Country & Koppen-Geiger Climate Synthesis

Implemented in `src/lib/science/world-cities.ts` and `src/lib/science/climate.ts`:

* **195+ Sovereign Nations Indexed**: Automatic resolution of ISO-3166 country codes, national currency formatting (`IDR`, `USD`, `GBP`, `JPY`, `AED`, `SGD`, `EUR`, `BRL`, `AUD`, `CHF`, etc.), localized residential utility tariffs ($/kWh), and national grid carbon emission factors ($kg\ CO_2e/kWh$).
* **Peel et al. (2007) Global Koppen-Geiger Synthesizer**: Given any latitude and longitude coordinate on Earth, Verdara computes 12-month precipitation and temperature distributions, categorizes the biome (`Af`, `Am`, `BWh`, `Csb`, `Cfb`, `Cfa`, `Dfb`), and calibrates solar irradiance and cistern sizing automatically.

---

## 7. Enterprise Database v3.2 & REST API Reference

### 7.1 Database Architecture (`prisma/schema.prisma` & `src/lib/db/store.ts`)
Verdara employs a dual-persistence strategy combining Prisma ORM with an Edge-ready JSON Spatial Ledger:
* `UserSession`: Tracks resident identifiers, display names, emails, roles (`resident`, `architect`, `admin`), Eco-XP, and unlocked 3D district level (`1..5`).
* `SpatialScanAudit`: Records timestamp, ISO jurisdiction, specimen identifier, 64-bit perceptual `dHash`, extracted SAM 3.1 polygon counts, solar kWp, rainwater volume, and audit status.
* `SecurityAuditLog`: Immutable log of edge rate-limit triggers, CSRF origin checks, and anti-replay rejections.

### 7.2 REST API Specification

| Endpoint | Method | Rate Limit | Request Payload | Response Schema | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/meta/sam` | `POST` | `30 req/min` | `{ imageBase64?: string, specimenId?: string }` | `{ polygons: PolygonMask[], dHash: string, materials: MaterialSummary }` | Performs zero-shot concept segmentation via Meta SAM 3.1 or returns `<50ms` SHA-256 golden cache hits. |
| `/api/meta/muse` | `POST` | `30 req/min` | `{ siteBrief: SiteBrief, focusArea?: string }` | `{ council: SpecialistOpinion[], audited: boolean, drift: number }` | Executes 3-agent deliberation with automatic `+/-3.0%` numerical drift auditing against `SITE_BRIEF`. |
| `/api/meta/image` | `POST` | `20 req/min` | `{ imageBase64: string, koppenCode: string }` | `{ originalUrl: string, retrofitUrl: string }` | Generates Before/After eco-retrofit visualization conditioned on SAM 3.1 polygon boundaries and climate biome. |
| `/api/climate` | `GET` | `60 req/min` | `?lat=-7.80&lng=110.36&city=Yogyakarta` | `{ koppen: KoppenData, rainMm: number[], solarGhi: number[], tariff: number }` | Queries Open-Meteo ERA5 or synthesizes 12-month precipitation and solar irradiance normals for any coordinate. |
| `/api/github-stars` | `GET` | `60 req/min` | *None* | `{ stars: number, repo: string, url: string, status: string }` | Returns real-time GitHub repository star count with 60-second Next.js ISR cache and direct fallback. |
| `/api/db` | `GET / POST` | `60 req/min` | Query filters or new record JSON | `{ users: UserSession[], audits: SpatialScanAudit[], stats: DBStats }` | Reads live database counters or persists new user sessions and SAM 3.1 scan verification logs. |

---

## 8. Cybersecurity Defense-in-Depth & 64-Bit dHash Verification

Verdara incorporates multi-layered cybersecurity controls across `src/middleware.ts`, `src/lib/security/guard.ts`, and `src/lib/security/dhash.ts`:

1. **Edge HTTP Security Headers (`src/middleware.ts`)**:
   * Enforces `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and strict `Permissions-Policy` across all routes.
2. **Mandatory Studio Authentication Gate (`src/components/ui/AuthGate.tsx`)**:
   * Protects engineering workspaces (`/dashboard`, `/lens`, `/radar`, `/council`, `/academy`, `/settings`), redirecting unauthenticated visitors to `/login?next=<path>`.
3. **Sliding-Window Token-Bucket Rate Limiter (`src/lib/security/guard.ts`)**:
   * Enforces strict per-IP request quotas (`30 req/min` for AI endpoints) with standard `HTTP 429 Too Many Requests` responses.
4. **Recursive Payload Sanitizer & CSRF Origin Verification**:
   * Verifies `Origin` and `Host` headers on mutating HTTP requests and recursively sanitizes XSS vectors (`<script>`, `javascript:`, inline event handlers) and prototype-pollution keys (`__proto__`, `constructor`, `prototype`).
5. **64-Bit Perceptual `dHash` Anti-Spoofing (`src/lib/security/dhash.ts`)**:
   * Resizes uploaded proof photographs to an $8 \times 8$ grayscale matrix and computes horizontal luminance gradients to generate a 64-bit integer hash $H$.
   * Computes the bitwise **Hamming Distance** against historical submissions:

$$
D_H(H_1, H_2) = \text{popcount}(H_1 \oplus H_2) = \sum_{j=0}^{63} (H_1 \oplus H_2)_j
$$

   * Submissions with $D_H \le 8$ bits are automatically rejected as duplicate replay attacks.

---

## 9. Repository Structure & Local Development Setup

### 9.1 Directory Layout
```text
verdara/
├── prisma/
│   └── schema.prisma                # Relational database schema (Users, Audits, Telemetry)
├── public/
│   └── specimens/                   # Benchmark architectural & recyclable test imagery
├── src/
│   ├── app/
│   │   ├── academy/page.tsx         # Field-Proof Camera Verification Academy
│   │   ├── api/                     # Next.js API route handlers (sam, muse, image, climate, db, github-stars)
│   │   ├── council/page.tsx         # 3-Specialist AI Sustainability Council
│   │   ├── dashboard/page.tsx       # Living 3D Eco-Town Studio
│   │   ├── docs/page.tsx            # 6-Module Interactive Documentation
│   │   ├── faq/page.tsx             # Searchable Platform Knowledge Base & FAQ
│   │   ├── lens/page.tsx            # Omni-Spatial Camera Lens & Retrofit Curtain
│   │   ├── login/page.tsx           # Authentication & 1-Click Level 5 Demo Sandbox
│   │   ├── radar/page.tsx           # 3D Urban Roof & Hydrological Radar
│   │   ├── settings/page.tsx        # 7-Layer Credit Shield & Preferences
│   │   ├── globals.css              # Design tokens, typography & layout styling
│   │   ├── layout.tsx               # Root layout, fonts & smooth scroll
│   │   └── page.tsx                 # Spatial Eco-Twin Landing Page & Footer
│   ├── components/
│   │   ├── lens/                    # SpatialMaskViewer (SAM 3.1 polygons, X-Ray, Before/After)
│   │   ├── three/                   # EcoIslandCanvas (60-FPS procedural 3D PBR engine)
│   │   └── ui/                      # InteractiveEffects, SmoothScroll, AuthGate, Navbar, Dock
│   ├── lib/
│   │   ├── db/                      # Database v3.2 store & seed data
│   │   ├── lens/                    # Curated specimen masks & polygon normalizers
│   │   ├── meta/                    # Meta AI client, +/-3% fact validator & Credit Shield
│   │   ├── science/                 # NREL PVWatts v8, DIN 1989-1, biopores, ERA5, units
│   │   └── security/                # Rate limiter, XSS sanitizer & 64-bit dHash engine
│   ├── store/
│   │   └── useVerdaraStore.ts       # Persisted Zustand state store
│   └── middleware.ts                # Edge HTTP security headers
└── tests/
    ├── science.test.ts              # Deterministic physics & hydrology unit tests
    └── security.test.ts             # OWASP rate limiter, XSS & dHash unit tests
```

### 9.2 Quickstart Installation Guide

```bash
# 1. Clone the repository
git clone https://github.com/xFalzz/verdara.git
cd verdara

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Configure environment variables (runs out-of-the-box with deterministic specimen cache)
cp .env.example .env.local

# 4. Verify TypeScript compilation and unit tests
npx tsc --noEmit
npm test

# 5. Launch the local development server at http://localhost:3000
npm run dev
```

---

## 10. Authors, Acknowledgments & License

* **Lead Architect & Developer**: **Nawfal Irfan** ([@xFalzz](https://github.com/xFalzz))
* **Hackathon Track**: Meta Global AI Hackathon 2026 (Spatial Perception, Sustainability & Autonomous Multi-Agent Systems)
* **Open Science References**:
  * NREL PVWatts v8 Rooftop Photovoltaic Derating Model (National Renewable Energy Laboratory, US DOE)
  * DIN 1989-1: *Rainwater Harvesting Systems - Selection, Installation, and Operation* (Deutsches Institut für Normung)
  * Kamir R. Brata: *Biopore Infiltration Holes for Sustainable Stormwater Management* (IPB University)
  * Peel, M. C., Finlayson, B. L., & McMahon, T. A. (2007): *Updated world map of the Köppen-Geiger climate classification* (Hydrol. Earth Syst. Sci.)
  * US EPA WARM v16: *Waste Reduction Model for Greenhouse Gas Life-Cycle Assessment* (US Environmental Protection Agency)
* **License**: This project is licensed under the **MIT License** - see the [LICENSE](https://github.com/xFalzz/verdara/blob/main/LICENSE) file for details.
