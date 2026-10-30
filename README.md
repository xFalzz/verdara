# Verdara: Spatial Climate Intelligence & Autonomous 3D Eco-District Twin

**Verdara** is a full-stack spatial computing, environmental engineering, and multi-agent AI platform that transforms any residential plot, building footprint, or neighborhood across **195+ countries** into an interactive, scientifically calibrated **3D Living Eco-District**.

By combining zero-shot computer vision (**Meta SAM 3.1**), peer-reviewed physical equations (**NREL PVWatts v8**, **DIN 1989-1**, **Open-Meteo ERA5**, **US EPA WARM v16**), multi-agent specialist reasoning (**Meta Muse Spark** & **muse-spark-open**), and a **100% procedural 60-FPS WebGL Digital Twin**, Verdara enables homeowners, architects, and urban planners to simulate rooftop solar generation, rainwater harvesting, flood-mitigating biopore drainage, and circular material recovery with zero numerical hallucination.

---

## Table of Contents

1. [Foundational Concept: From Zero to Spatial Twin](#1-foundational-concept-from-zero-to-spatial-twin)
2. [5-Stage Deterministic System Architecture](#2-5-stage-deterministic-system-architecture)
3. [Complete Application Route & Workspace Guide](#3-complete-application-route--workspace-guide)
4. [Meta AI & Spatial Vision Orchestration](#4-meta-ai--spatial-vision-orchestration)
5. [Deterministic Physics, Hydrology & Valuation Engine](#5-deterministic-physics-hydrology--valuation-engine)
6. [60-FPS Procedural 3D WebGL Digital Twin Engine](#6-60-fps-procedural-3d-webgl-digital-twin-engine)
7. [Global 195+ Country & Koppen-Geiger Climate Synthesis](#7-global-195-country--koppen-geiger-climate-synthesis)
8. [Enterprise Database v3.2 & REST API Reference](#8-enterprise-database-v32--rest-api-reference)
9. [Cybersecurity Defense-in-Depth & Perceptual dHash Verification](#9-cybersecurity-defense-in-depth--perceptual-dhash-verification)
10. [Repository Structure & Local Development Setup](#10-repository-structure--local-development-setup)

---

## 1. Foundational Concept: From Zero to Spatial Twin

### 1.1 The Problem with Conventional Sustainability Tools
Traditional environmental software suffers from two extremes:
1. **Fragmented Engineering Calculators**: Separate, complex spreadsheets for solar photovoltaics, rainwater cistern sizing, stormwater runoff, and recycling that require manual civil engineering inputs.
2. **Hallucinating AI Wrappers**: Generic LLM chatbots that guess kilowatt-hours, water volumes, or financial savings without grounding in local solar irradiance, seasonal precipitation, cell temperature derating, or utility tariffs.

### 1.2 The Verdara Engineering Paradigm
Verdara solves both problems through a strict **Perception -> Physics -> Deliberation -> Spatial Visualization** architecture:
* **Computer Vision Perception (`Meta SAM 3.1`)**: Extracts physical geometry (rooftop polygons, rainwater gutters, permeable soil, flora, and recyclable commodities) directly from user photographs.
* **Deterministic Physics Engine (`SITE_BRIEF`)**: Computes every single engineering metric (kWp, annual kWh, rainwater liters, cistern capacity, biopore count, thermal comfort index, and local currency savings) using closed-form scientific equations before any language model is invoked.
* **Grounded Multi-Agent Deliberation (`Meta Muse Spark`)**: Three domain-specialist AI agents debate trade-offs using the immutable `SITE_BRIEF` payload, guarded by a deterministic **+/-3.0% numerical parity firewall**.
* **Real-Time 3D WebGL Twin (`React Three Fiber` + `MapLibre GL`)**: Renders the resulting architectural upgrades inside a responsive 60-FPS 3D Eco-District that simulates normal operation (`Run`), extreme storm stress (`Break`), and AI-verified retrofits (`Heal`).

---

## 2. 5-Stage Deterministic System Architecture

```text
+-----------------------------------------------------------------------------------+
| STAGE 1: GEOSPATIAL & CLIMATOLOGY SYNTHESIS (src/lib/science/world-cities.ts)     |
|  * Resolves 195+ Countries, 28 Curated Benchmark Cities, or Custom GPS Coords     |
|  * Computes Peel et al. (2007) Koppen-Geiger Regime (Af, Am, BWh, Csb, Cfb, etc.) |
|  * Loads 12-Month ERA5 Precipitation (mm), Solar GHI (kWh/m2/d), Tariff & Grid EF |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| STAGE 2: META SAM 3.1 SPATIAL VISION PERCEPTION (src/lib/lens/masks.ts)           |
|  * Computes SHA-256 Specimen Hash + 64-Bit Perceptual dHash (9x8 Luminance Grid)  |
|  * Executes Zero-Shot Concept Segmentation via Meta SAM 3.1 (/api/meta/sam)       |
|  * Emits Normalized [0..1000] Polygon Masks: SOLAR_ROOF | RAIN_PIPE | RECYCLABLES |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| STAGE 3: DETERMINISTIC PHYSICS & VALUATION CORE (src/lib/science/housing.ts)      |
|  * NREL PVWatts v8 Solar Model (Usable Roof Area, Cell Temp Derating, Annual kWh) |
|  * DIN 1989-1 Hydrological Mass-Balance (Runoff Coeff 0.85, Filter 0.90, Cistern) |
|  * Kamir R. Brata Cylindrical Biopore Hydraulics & Steward Evapotranspiration TCI |
|  * Locks Output into Immutable SITE_BRIEF JSON (Single Source of Numerical Truth) |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| STAGE 4: MULTI-AGENT COUNCIL & +/-3% FIREWALL (src/lib/meta/client.ts)            |
|  * Orchestrates Dr. Flora (Botanist), Ir. Arka (Engineer), & Sirkula (Economist)  |
|  * Supports Hosted Meta Muse Spark and Open-Weight muse-spark-open Auditing       |
|  * validateNumbersAgainstSiteBrief() verifies all emitted numbers within +/-3.0%  |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| STAGE 5: 60-FPS 3D DIGITAL TWIN & PERSISTENT LEDGER (EcoIslandCanvas.tsx)         |
|  * Procedural PBR 3D Eco-District (Run / Break / Heal + Smooth Camera Fly-To)     |
|  * MapLibre GL 55-Deg 3D Urban Extrusion & SAM 3D Terrain Slope Mesh (/radar)     |
|  * Synchronizes Zustand Store (useVerdaraStore) & Enterprise Database v3.2        |
+-----------------------------------------------------------------------------------+
```

---

## 3. Complete Application Route & Workspace Guide

Verdara is organized into public exploration routes and authenticated engineering studio workspaces guarded by `src/components/ui/AuthGate.tsx`:

| Route | Workspace / Page | Access Level | Detailed Capability Breakdown |
| :--- | :--- | :--- | :--- |
| `/` | **Spatial Eco-Twin Landing & Global Overview** | Public | Features the interactive wordmark hero with draggable holographic telemetry stickers, compact 195+ Country/City selector, live **3D Eco-District Stage** (`Run`, `Break`, `Heal` modes + 4 camera presets), **Draggable 10-Country Climate Deck**, 4-Step Architecture Subgrid, 12-Month ERA5 Weather Chart, and the Global Telemetry Bento Matrix. |
| `/login` | **Authentication & 1-Click Sandbox Gate** | Public | Protects all studio workspaces. Offers **1-Click Level 5 Demo Sandbox** (instantly unlocking all 6 3D ecological structures and 4,200 Eco-XP) alongside custom resident email/role authentication with automatic `?next=` route redirection. |
| `/dashboard` | **Living 3D Eco-Town Studio** | Auth Required | Full-viewport 60-FPS 3D Eco-District studio with interactive **Roof Area Slider (`40 m²` to `600 m²`)**, real-time solar/rainwater/biopore recalculation, progressive Level 1 to Level 5 architectural unlocks, and live climate switching. |
| `/lens` | **Omni-Spatial Camera Lens** | Auth Required | Interactive **Meta SAM 3.1 Polygon Visor**, **X-Ray Wireframe Slider**, and **Meta Muse Image Before/After Eco-Retrofit Curtain**. Computes US EPA WARM v16 embodied carbon savings, local Deposit Return Scheme (DRS) cash payouts, and exports 1200x630 PNG Impact Cards. |
| `/radar` | **3D Urban Roof & Hydrological Radar** | Auth Required | Combines **MapLibre GL JS** 3D extruded urban buildings (`pitch: 55 deg`) with a **SAM 3D Terrain & Drainage Slope Mesh**, interactive rooftop footprint sizing, monthly solar/rainwater ledger, and nearby circular economy drop-off hubs. |
| `/council` | **3-Specialist AI Sustainability Council** | Auth Required | Multi-agent engineering room where **Dr. Flora**, **Ir. Arka**, and **Sirkula** (powered by `Meta Muse Spark` and `muse-spark-open`) generate phased retrofit blueprints verified by the deterministic `+/-3%` numerical fact firewall. |
| `/academy` | **Field-Proof Verification Academy** | Auth Required | Replaces multiple-choice quizzes with **Camera Proof-of-Action Verification**. Uses Meta SAM 3.1 instance segmentation plus **64-bit perceptual `dHash` anti-spoofing** to verify real-world recycling, composting, and biopore installations. |
| `/settings` | **7-Layer API Shield & System Preferences** | Auth Required | Live telemetry and control center for the **7-Layer API Credit Shield**, SHA-256 deterministic specimen cache, `muse-spark-open` open-weight model toggle, unit system (`Metric` / `Imperial`), and language (`EN` / `ID`). |
| `/docs` | **Technical & Scientific Documentation** | Public | 6-module interactive engineering specification covering system architecture, Meta AI endpoints, physics derivations, 3D WebGL architecture, Database v3.2 schemas, and OWASP security controls. |
| `/faq` | **Searchable Platform Knowledge Base** | Public | 12 deep-dive bilingual Q&A entries with instant keyword search, category filtering, technical callouts, and direct workspace navigation. |

---

## 4. Meta AI & Spatial Vision Orchestration

Verdara integrates four specialized capabilities across the Meta AI stack (`src/lib/meta/` and `src/app/api/meta/`):

### 4.1 Meta SAM 3.1 (`sam-3-1`) - Zero-Shot Spatial Segmentation
* **Implementation**: `src/app/api/meta/sam/route.ts`, `src/lib/lens/masks.ts`, `src/components/lens/SpatialMaskViewer.tsx`
* **Mechanism**: Accepts uploaded RGB imagery or curated benchmark specimens and extracts pixel-accurate polygon contours normalized to a `[0, 1000] x [0, 1000]` coordinate space.
* **Segmented Classes**:
  1. `SOLAR_ROOF`: Unshaded pitched or flat roof planes suitable for monocrystalline photovoltaic arrays.
  2. `RAIN_CONDUIT`: Roof gutters, downspouts, and impervious catchment surfaces for DIN 1989-1 cistern routing.
  3. `NATIVE_FLORA`: Permeable soil zones, bioswale trenches, and urban tree canopies for evapotranspiration cooling.
  4. `RECYCLABLE_COMMODITY`: High-value circular materials (`PET`, `HDPE`, `Aluminum`, `Copper`, `Steel`, `Cardboard`, `Glass`, `E-Waste PCB`).

### 4.2 Meta Muse Spark (`muse-spark`) - 3-Specialist Sustainability Council
* **Implementation**: `src/app/api/meta/muse/route.ts`, `src/lib/meta/client.ts`, `src/app/council/page.tsx`
* **Specialist Personas**:
  * **Dr. Flora (Urban Botanist & Microclimate Architect)**: Focuses on native species selection, bioswale soil permeability, and Urban Heat Island (UHI) latent heat reduction.
  * **Ir. Arka (Photovoltaic & Hydrological Civil Engineer)**: Sizes solar string arrays, tilt angles, first-flush rainwater diverters, cistern storage, and cylindrical biopore wells.
  * **Sirkula (Circular Economist & Policy Analyst)**: Calculates capital expenditure (CapEx) payback periods, utility tariff offsets, and localized Deposit Return Scheme (DRS) cash recovery.

### 4.3 Meta Muse Spark Open (`muse-spark-open`) & The +/-3.0% Numerical Firewall
* **Implementation**: `validateNumbersAgainstSiteBrief()` in `src/lib/meta/client.ts`
* **Why It Matters**: Even when an LLM is provided exact numbers in its system prompt, autoregressive token sampling can occasionally round or drift numerical values. Verdara passes every AI response through a deterministic post-processing auditor:
  1. Extracts all numerical tokens paired with physical units (`kWp`, `kWh`, `L`, `gal`, `m²`, `ft²`, `biopores`, currency symbols).
  2. Compares each extracted number $x_{\text{AI}}$ against the corresponding physics engine truth $x_{\text{brief}}$ in `SITE_BRIEF`:
     $$\text{Relative Drift} = \frac{|x_{\text{AI}} - x_{\text{brief}}|}{x_{\text{brief}}} \le 0.03$$
  3. If any value exceeds the $3.0\%$ tolerance threshold, the firewall automatically substitutes the exact deterministic value from `SITE_BRIEF` and logs the audit status.

### 4.4 Meta Muse Image (`muse-image`) - Generative Eco-Retrofit Synthesis
* **Implementation**: `src/app/api/meta/image/route.ts`, `src/components/lens/SpatialMaskViewer.tsx`
* **Mechanism**: Uses the polygon masks from Meta SAM 3.1 and the active city's Koppen-Geiger climate classification to render an interactive **Before / After Reality Curtain**, allowing users to drag a slider across their scanned property to inspect the completed solar, cistern, and biophilic retrofit.

---

## 5. Deterministic Physics, Hydrology & Valuation Engine

All scientific computations reside in pure, side-effect-free TypeScript modules under `src/lib/science/` and are verified by automated tests in `tests/science.test.ts`.

### 5.1 Rooftop Solar Photovoltaics (NREL PVWatts v8 Formulation)
Implemented in `src/lib/science/housing.ts`:
* **Usable Solar Array Area**:
  $$A_{\text{solar}} = A_{\text{roof}} \times f_{\text{usable}} \quad \text{where } f_{\text{usable}} = 0.60$$
* **Installed Peak Capacity ($\text{kWp}$)** (using $205\text{ Wp/m}^2$ monocrystalline silicon density):
  $$P_{\text{kWp}} = A_{\text{solar}} \times 0.205, \quad N_{\text{panels}} = \text{round}\left(\frac{P_{\text{kWp}}}{0.400}\right)$$
* **Cell Temperature Derating Factor ($f_{\text{temp}}$)** (accounting for NOCT cell heating above $25^\circ\text{C}$ during warm months with temperature coefficient $\gamma = -0.38\%/^\circ\text{C}$):
  $$T_{\text{cell}} = T_{\text{warm\_max}} + 18.0^\circ\text{C}$$
  $$f_{\text{temp}} = \text{clamp}\left(1 - 0.0038 \times \max(0, T_{\text{cell}} - 25.0),\ 0.78,\ 1.02\right)$$
* **Annual Energy Generation ($\text{kWh/yr}$)**:
  $$E_{\text{annual}} = P_{\text{kWp}} \times \text{GHI}_{\text{day}} \times 365 \times \text{PR}_{\text{system}} \times f_{\text{temp}} \quad \text{where } \text{PR}_{\text{system}} = 0.80$$

### 5.2 Rainwater Harvesting & Cistern Sizing (DIN 1989-1 & ERA5)
Implemented in `src/lib/science/housing.ts` and `src/lib/science/climate.ts`:
* **Annual Harvested Rainwater Volume ($\text{L/yr}$)**:
  $$V_{\text{rain}} = A_{\text{roof}} \times P_{\text{annual\_mm}} \times C_{\text{runoff}} \times \eta_{\text{filter}}$$
  where $C_{\text{runoff}} = 0.85$ (pitched tile/metal roof runoff coefficient) and $\eta_{\text{filter}} = 0.90$ (first-flush vortex diverter efficiency).
* **Recommended Cistern Storage Capacity ($\text{L}$)**:
  $$V_{\text{cistern}} = \text{clamp}\left(\text{round}_{500}\left(V_{\text{rain}} \times 0.085\right),\ 1000,\ 15000\right)$$

### 5.3 Cylindrical Biopore Infiltration & Flood Attenuation (Kamir R. Brata & Darcy's Law)
* Each cylindrical biopore shaft ($d = 10\text{ cm}$, depth $h = 100\text{ cm}$, lateral wall area $A_{\text{wall}} = \pi d h = 0.314\text{ m}^2$) is packed with organic leaf litter to stimulate soil fauna and maintain saturated hydraulic conductivity ($K_s$) at $\approx 180\text{ L/hr}$ during peak storm events:
  $$N_{\text{biopore}} = \text{clamp}\left(\left\lceil \frac{A_{\text{roof}} \times P_{\text{peak\_month\_mm}}}{2600} \right\rceil,\ 4,\ 40\right)$$
  $$\text{Runoff Attenuation (\%)} = \min\left(92\%,\ \text{round}(24 + N_{\text{biopore}} \times 3.8)\right)$$

### 5.4 Evapotranspiration Thermal Comfort Index (TCI)
* Models microclimate cooling ($\Delta T_{\text{cool}}$) from solar roof shading (high effective albedo / heat interception) and vegetation latent heat flux ($L_v \approx 2.45\text{ MJ/kg}$):
  $$\Delta T_{\text{cool}} = -\left(0.85 + 2.40 \times R_{\text{green}} + 0.65 \times f_{\text{cool\_roof}}\right)$$
  $$\text{TCI} = \text{clamp}\left(\text{round}\left(100 - \max(0, T_{\text{warm\_max}} - 22) \times 2.4 + |\Delta T_{\text{cool}}| \times 6\right),\ 35,\ 98\right)$$

### 5.5 Circular Economy & Embodied Carbon Valuation (US EPA WARM v16 + Local DRS)
Implemented in `src/lib/science/circular.ts`:
* Combines **US EPA WARM v16** net lifecycle greenhouse gas avoidance factors ($\text{kg CO}_2\text{e}$ saved per kg diverted from landfill: Aluminum $9.13$, E-Waste PCB $12.40$, Copper $3.84$, PET $1.52$, HDPE $1.15$, Steel $1.84$, Cardboard $0.94$) with country-specific **Deposit Return Scheme (DRS)** and waste-bank pricing (`US-CA CRV`, `DE Pfand`, `GB DRS`, `JP PET`, `ID Bank Sampah`, etc.).

---

## 6. 60-FPS Procedural 3D WebGL Digital Twin Engine

The interactive 3D Eco-District (`src/components/three/EcoIslandCanvas.tsx`) is engineered from scratch using **Three.js**, **`@react-three/fiber`**, and **`@react-three/drei`**:

### 6.1 Zero-Asset-Bloat Procedural PBR Architecture
* Rather than forcing users to download 50+ MB `.glb` mesh files, every structure is generated mathematically in TypeScript using Physically Based Rendering (`meshPhysicalMaterial` and `meshStandardMaterial`):
  * **`RealisticSolarPanel`**: Anodized dark aluminum perimeter frame, deep-navy monocrystalline silicon wafer with `clearcoat: 1.0`, `clearcoatRoughness: 0.08`, and metallic silver busbar grid lines.
  * **`GrandSolarPavilion`**: Stepped travertine plinth foundation, cross-laminated timber (CLT) soffit overhang, double-height clearcoat glass curtain wall with mullions, rooftop planter boxes, wall-mounted home battery pack with live LED status indicator, and dual-slope PV arrays.
  * **`RealisticEcoHouse`**: Neighboring residential villas with pitched roofs, framed windows, timber doors, and integrated solar arrays.
  * **District Infrastructure**: Hydrological retention canal with animated water surface, timber pedestrian bridge with safety railings, rainwater harvesting cistern tower with feed pipes, 12 illuminated cylindrical biopore rings, 3-stream circular recycling station, geodesic botanical conservatory dome, rotating vertical/horizontal wind turbines, solar streetlights, and an animated autonomous EV shuttle.

### 6.2 Real-Time Physical Mode State Machine (`Run` / `Break` / `Heal`)
1. **`01 Normal Day (Run)`**: Clear daylight illumination, steady canal water table (`y = -0.14`), gentle green updraft atmospheric particles, steady EV shuttle transit, and baseline south-slope solar generation.
2. **`02 Storm Surge (Break)`**: Simulates an unmitigated peak-month monsoon storm: dark overcast sky, high-velocity falling rain particles, canal water rising to `y = 0.05`, a translucent **street flood surge sheet (`floodSurgeMeshRef`)** submerging the asphalt roadway, and red thermal roof heat stress (`+4.2 degC`).
3. **`03 AI Solution (Heal)`**: Activates a sweeping horizontal **Meta SAM 3.1 green laser scan plane (`scanBeamRef`)**, deploys the north-slope secondary solar array (`+35% kWp`), illuminates all 12 biopore wells in emerald green, and drains the street floodwater into the 4,000L+ cistern.

### 6.3 Smooth Vector Camera Rig (`CameraRigController`)
* Switching between `Overview`, `Solar Hub`, `Hydro Canal`, and `EV Street` smoothly interpolates both `camera.position` and `OrbitControls.target` via frame-rate-independent damping (`THREE.Vector3.lerp`) without snapping or breaking user orbit controls.

---

## 7. Global 195+ Country & Koppen-Geiger Climate Synthesis

Implemented in `src/lib/science/world-cities.ts` and `src/lib/science/climate.ts`:
* **Complete Global Coverage**: Supports all **195+ sovereign countries** with automatic resolution of ISO-3166 country codes, local currency symbols (`IDR`, `USD`, `GBP`, `JPY`, `AED`, `SGD`, `EUR`, `BRL`, `AUD`, `CHF`, etc.), residential electricity tariffs, grid carbon emission factors ($\text{kg CO}_2\text{e/kWh}$), and municipal recycling drop-off hubs.
* **Peel et al. (2007) Koppen-Geiger Synthesizer**: Given any latitude and longitude on Earth, Verdara synthesizes 12-month precipitation and temperature curves, classifies the exact climate regime (`Af` Tropical Rainforest, `Am` Tropical Monsoon, `BWh` Hot Desert, `Csb` Mediterranean, `Cfb` Oceanic, `Cfa` Humid Subtropical, `Dfb` Continental), and calibrates solar GHI and hydrological sizing automatically.

---

## 8. Enterprise Database v3.2 & REST API Reference

### 8.1 Database Architecture (`prisma/schema.prisma` & `src/lib/db/store.ts`)
Verdara Database v3.2 provides a dual-layer persistence engine combining **Prisma ORM (PostgreSQL / SQLite)** with an **Edge-compatible JSON Spatial Ledger** (`src/lib/db/store.ts`) so the platform works out-of-the-box in serverless, edge, and local environments:
* **`UserSession`**: Stores user ID, display name, email, role (`resident` | `architect` | `judge`), Eco-XP, and unlocked 3D district level (`1..5`).
* **`SpatialScanAudit`**: Stores timestamp, city/country ISO, specimen ID, 64-bit perceptual `dHash`, extracted SAM 3.1 polygon count, solar kWp, rainwater liters, and verification status.
* **`SecurityAuditLog`**: Immutable log of rate-limit triggers, CSRF checks, and `dHash` duplicate rejections.

### 8.2 REST API Endpoints

| Endpoint | Method | Rate Limit | Description |
| :--- | :--- | :--- | :--- |
| `/api/meta/sam` | `POST` | `30 req/min` | Runs Meta SAM 3.1 concept segmentation or serves `<50ms` SHA-256 golden cache hits. Returns normalized `[0..1000]` polygon masks, `dHash`, and circular material valuation. |
| `/api/meta/muse` | `POST` | `30 req/min` | Runs 3-specialist deliberation (`Dr. Flora`, `Ir. Arka`, `Sirkula`) on `muse-spark` or `muse-spark-open` and enforces the `+/-3%` `validateNumbersAgainstSiteBrief` firewall. |
| `/api/meta/image` | `POST` | `20 req/min` | Synthesizes Before/After architectural eco-retrofit imagery via `muse-image` conditioned on SAM 3.1 masks and Koppen climate biome. |
| `/api/climate` | `GET` | `60 req/min` | Queries Open-Meteo ERA5 10-year monthly precipitation/temperature or synthesizes latitude-calibrated climate and tariff telemetry for any global coordinate. |
| `/api/db` | `GET / POST` | `60 req/min` | Returns live database v3.2 telemetry counters, registered users, and verified scan logs, or persists new user sessions and SAM 3.1 scan audits. |

---

## 9. Cybersecurity Defense-in-Depth & Perceptual dHash Verification

Verdara is hardened against web, API, and proof-spoofing vulnerabilities across `src/middleware.ts`, `src/lib/security/guard.ts`, and `src/lib/security/dhash.ts`:

1. **Edge HTTP Security Headers (`src/middleware.ts`)**:
   * Injects `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and strict `Permissions-Policy` headers on every response.
2. **Mandatory Studio Authentication Gate (`src/components/ui/AuthGate.tsx`)**:
   * Prevents unauthenticated direct access to `/dashboard`, `/lens`, `/radar`, `/council`, `/academy`, and `/settings`, redirecting cleanly to `/login?next=<target>`.
3. **Sliding-Window Token-Bucket Rate Limiter (`src/lib/security/guard.ts`)**:
   * Enforces per-IP request quotas (`30 req/min` on AI endpoints) with standard `HTTP 429 Too Many Requests` and `Retry-After` headers.
4. **CSRF Origin Validation & Recursive Payload Sanitizer**:
   * Validates `Origin` and `Host` headers on mutating `POST` requests and recursively strips XSS script vectors (`<script>`, `javascript:`, inline `on*=` handlers) and prototype-pollution keys (`__proto__`, `constructor`, `prototype`).
5. **64-Bit Perceptual `dHash` Anti-Spoofing (`src/lib/security/dhash.ts`)**:
   * Computes an $8 \times 8$ horizontal luminance gradient hash ($64\text{-bit}$) for every uploaded field-proof photo and calculates the bitwise **Hamming distance** against historical submissions. Any image with $\text{Hamming Distance} \le 8$ is rejected as a duplicate or manipulated replay.

---

## 10. Repository Structure & Local Development Setup

### 10.1 Directory Architecture
```text
verdara/
├── prisma/
│   └── schema.prisma                # Relational schema for Users, Scans, Jurisdictions & Audits
├── public/
│   └── specimens/                   # Benchmark architectural & recyclable test imagery
├── src/
│   ├── app/
│   │   ├── academy/page.tsx         # Field-Proof Camera Verification Academy (SAM 3.1 + dHash)
│   │   ├── api/                     # Next.js Edge/Node API routes (sam, muse, image, climate, db)
│   │   ├── council/page.tsx         # 3-Specialist AI Sustainability Council (Muse Spark)
│   │   ├── dashboard/page.tsx       # Full-Screen 3D Living Eco-Town Studio
│   │   ├── docs/page.tsx            # 6-Module Interactive Engineering Documentation
│   │   ├── faq/page.tsx             # Searchable Bilingual Knowledge Base & FAQ
│   │   ├── lens/page.tsx            # Omni-Spatial Camera Lens & Before/After Curtain
│   │   ├── login/page.tsx           # Authentication & 1-Click Level 5 Sandbox Gate
│   │   ├── radar/page.tsx           # 3D MapLibre Urban Roof & Hydrological Radar
│   │   ├── settings/page.tsx        # 7-Layer API Credit Shield & System Controls
│   │   ├── globals.css              # Design tokens, typography, and responsive layout utilities
│   │   ├── layout.tsx               # Root layout, fonts, and Lenis SmoothScroll integration
│   │   └── page.tsx                 # Spatial Eco-Twin Landing Page & 10-Country Climate Deck
│   ├── components/
│   │   ├── lens/                    # SpatialMaskViewer (SAM 3.1 polygons + X-Ray + Curtain)
│   │   ├── three/                   # EcoIslandCanvas (60-FPS procedural PBR Three.js engine)
│   │   └── ui/                      # InteractiveEffects, SmoothScroll, AuthGate, Navbar, Dock
│   ├── lib/
│   │   ├── db/                      # Enterprise Database v3.2 store & seed ledger
│   │   ├── lens/                    # Curated specimen masks & polygon normalizers
│   │   ├── meta/                    # Meta AI client, +/-3% fact validator & 7-Layer Credit Shield
│   │   ├── science/                 # NREL PVWatts v8, DIN 1989-1, ERA5, 195+ countries & units
│   │   └── security/                # OWASP rate limiter, XSS sanitizer & 64-bit dHash engine
│   ├── store/
│   │   └── useVerdaraStore.ts       # Persisted Zustand global state store
│   └── middleware.ts                # Edge security headers & request hardening
└── tests/
    └── science.test.ts              # Deterministic physics, hydrology & firewall unit tests
```

### 10.2 Quickstart Instructions

```bash
# 1. Clone the repository
git clone https://github.com/xFalzz/verdara.git
cd verdara

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Configure environment variables (optional: runs out-of-the-box with deterministic cache)
cp .env.example .env.local

# 4. Run TypeScript verification and deterministic physics unit tests
npx tsc --noEmit
npm test

# 5. Start the development server at http://localhost:3000
npm run dev
```

---

## Author & License

* **Author**: **Nawfal Irfan** (`@xFalzz`) - Universitas Bina Sarana Informatika, Yogyakarta, Indonesia
* **License**: MIT License
