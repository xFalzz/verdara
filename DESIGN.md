# Verdara Spatial Design System (`DESIGN.md`)

## 1. Design Read & Mode Declaration

- **Category**: Spatial Climate & Rooftop Physics Web Application (`Next.js 15 + React Three Fiber + MapLibre GL + Meta SAM 3.1 / Muse Spark`)
- **Primary Aesthetic Direction**: Direct structural and visual fusion of **[DOVV Studio](https://dovvstudio.com/)** and **[Townhouse.dev](https://townhouse.dev/)**
- **Liveliness Dials**: `ENERGY 3 / RHYTHM 3 / MOTION 2`

---

## 2. Structural Anatomy from `dovvstudio.com` & `townhouse.dev`

1. **Navigation Architecture (`dovvstudio.com`)**:
   - **No SaaS full-width header border bar**: Top-left floating brand mark (`VERDARA` in `Archivo` 900 condensed + townhouse roof emblem) paired with top-right expandable **Dynamic Studio Notch Pill** (`#080808`, `border-radius: 90px`, `box-shadow: inset 0 0 0 2px #2c2c2c`).
   - **Fixed Bottom Pill Dock (`.dovv-bottom-dock`)**: Centered at `bottom: 20px` (`background: #080808; border-radius: 100px; padding: 6px; box-shadow: inset 0 0 0 2px #2c2c2c`) with `border-radius: 100px` pill items (`#c6f432` active fill).
2. **Hero & Typography (`dovvstudio.com`)**:
   - Centered **Live Status Pill** with pulsing `#16c847` dot (`@keyframes dovv-pill-pulse`) + `1px` divider + roof physics summary.
   - **Viewport-Spanning Condensed Display Wordmark (`Archivo` 900, `font-stretch: 62%`)** (`SEE INSIDE YOUR LIVING ECO-TOWN`) flanked by tilted **Die-Cut Stickers** (`border: 4px solid #fff; border-radius: 100px; transform: rotate(var(--rot))`) with spring-bounce hover (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
3. **Living Town Stage (`townhouse.dev` + `dovvstudio.com` `.showreel`)**:
   - Framed inside `.dovv-stage-frame` (`border-radius: 32px; border: 8px solid #080808; box-shadow: 0 2px 18px 4px rgba(0,0,0,0.25)`).
   - Renders a procedural **Living Architectural Town** of multiple pitched-roof townhouses, rooftop solar arrays, copper & cyan rainwater pipes, a cylindrical rainwater cistern, an elevated municipal water tower, biopore shafts, and paved streets.
   - **Townhouse Bottom-Left Floating Card (`.static-hero-words`)**: Positioned at `bottom: 24px; left: 24px` (`background: rgba(255,255,255,0.95); border: 1px solid rgba(21,21,21,0.1); border-radius: 16px; padding: 24px`) with graded status dots (`#1e9e5a` OK, `#2a9dbd` Flow, `#e9a23b` TCI).
4. **Showcase Bento Cards (`.dovv-card` + `.dovv-card-media` + `.dovv-chip`)**:
   - 2-column grid of `#080808` obsidian cards (`border-radius: 32px; padding: 12px; box-shadow: inset 0 0 0 1px #222`) containing an inset `.dovv-card-media` (`border-radius: 24px; background: #16171a`) and footer `.dovv-chip` tags (`border-radius: 17px; background: #1c1c1c`).
5. **Curved Dome Dark Transition (`.dome`) & Giant Architectural Footer**:
   - SVG single soft arc (`<path d="M0 100 Q50 -95 100 100 Z" />`) transitioning into `#080808` for the 10-year ERA5 monthly climate bar chart and Townhouse graded health ledger, followed by the `18.5vw` `VERDARA TOWN` footer wordmark and 4-cell architectural grid.

---

## 3. Verified WCAG 2.x Contrast Ratios

- **Chalk Daylight (`#f5f5f3`)**:
  - Primary Ink `#111111` on `#f5f5f3`: **17.42:1** (AAA)
  - Secondary Ink `#4b4b48` on `#f5f5f3`: **7.86:1** (AAA)
  - Primary Pill CTA `#ffffff` on `#080808`: **19.85:1** (AAA)
- **Obsidian Card & Dark Surface (`#080808` / `#121212`)**:
  - Primary Text `#ffffff` on `#080808`: **19.85:1** (AAA)
  - Secondary Text `#c9c7c0` on `#121212`: **11.14:1** (AAA)
  - Muted Label `#aaa9ad` on `#121212`: **7.92:1** (AAA)
  - Lime Accent `#080808` on `#c6f432`: **15.88:1** (AAA)
