/**
 * Self-contained Data URI SVG illustrations for Quick Specimen Testing in Verdara Lens
 * Costs $0.00, requires zero external CDN requests, and works 100% offline.
 */

// 1. Coconut Shells (Tempurung Kelapa)
export const SAMPLE_COCONUT_SHELL_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#2a1f18" />
      <stop offset="100%" stop-color="#120c08" />
    </radialGradient>
    <radialGradient id="shellOuter" cx="40%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#8a532b" />
      <stop offset="60%" stop-color="#542e14" />
      <stop offset="100%" stop-color="#2a1407" />
    </radialGradient>
    <radialGradient id="shellInner" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#d4b595" />
      <stop offset="70%" stop-color="#99704e" />
      <stop offset="100%" stop-color="#4d2f17" />
    </radialGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bg)" />
  
  <!-- Stack of Coconut Shells (Batok Kelapa) -->
  <g transform="translate(100, 40)">
    <!-- Shell 1: Left Background -->
    <ellipse cx="260" cy="380" rx="160" ry="120" fill="url(#shellOuter)" />
    <ellipse cx="260" cy="370" rx="130" ry="90" fill="url(#shellInner)" />

    <!-- Shell 2: Right Background -->
    <ellipse cx="450" cy="360" rx="170" ry="130" fill="url(#shellOuter)" />
    <ellipse cx="445" cy="350" rx="140" ry="100" fill="url(#shellInner)" />

    <!-- Shell 3: Center Front Main -->
    <ellipse cx="320" cy="270" rx="190" ry="150" fill="url(#shellOuter)" />
    <ellipse cx="320" cy="255" rx="155" ry="115" fill="url(#shellInner)" stroke="#3a1e0b" stroke-width="12" />

    <!-- Shell Fibers & Details -->
    <path d="M 180 260 Q 240 220 320 220 Q 400 220 460 260" stroke="#3a1d0b" stroke-width="6" fill="none" opacity="0.6" />
    <circle cx="310" cy="245" r="14" fill="#3a1d0b" opacity="0.7" />
    <circle cx="335" cy="255" r="11" fill="#3a1d0b" opacity="0.7" />
  </g>
  
  <text x="400" y="550" text-anchor="middle" fill="#d4b595" font-family="monospace" font-size="20" font-weight="bold">TEMPURUNG KELAPA (BIOMASSA BATOK ORGANIK)</text>
</svg>
`)}`;

// 2. Clear PET Plastic Bottle
export const SAMPLE_PET_BOTTLE_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#111c18" />
      <stop offset="100%" stop-color="#070c0a" />
    </radialGradient>
    <linearGradient id="petGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#67e8f9" stop-opacity="0.3" />
      <stop offset="35%" stop-color="#ffffff" stop-opacity="0.7" />
      <stop offset="65%" stop-color="#38bdf8" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0.4" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bg)" />

  <g transform="translate(280, 50)">
    <!-- Cap -->
    <rect x="90" y="30" width="60" height="35" rx="5" fill="#0284c7" stroke="#38bdf8" stroke-width="2" />
    <!-- Neck -->
    <path d="M 100 65 L 100 95 L 70 150 L 70 460 Q 70 490 100 490 L 140 490 Q 170 490 170 460 L 170 150 L 140 95 L 140 65 Z" fill="url(#petGrad)" stroke="#38bdf8" stroke-width="4" />
    <!-- Specular Highlight Line -->
    <path d="M 85 160 L 85 450" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.6" />
    <!-- Recyclable PET #1 Logo Stamp -->
    <circle cx="120" cy="300" r="30" fill="none" stroke="#0284c7" stroke-width="3" opacity="0.8" />
    <text x="120" y="308" text-anchor="middle" fill="#0284c7" font-family="monospace" font-size="20" font-weight="bold">PET 1</text>
  </g>
  
  <text x="400" y="560" text-anchor="middle" fill="#67e8f9" font-family="monospace" font-size="20" font-weight="bold">BOTOL MINUMAN PLASTIK (PET #1)</text>
</svg>
`)}`;

// 3. Corrugated Cardboard Box
export const SAMPLE_CARDBOARD_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1f1a14" />
      <stop offset="100%" stop-color="#0a0806" />
    </radialGradient>
    <linearGradient id="kraftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c99763" />
      <stop offset="50%" stop-color="#b07f4d" />
      <stop offset="100%" stop-color="#8c5f32" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bg)" />

  <g transform="translate(180, 80)">
    <!-- Box Front -->
    <polygon points="40,160 380,160 380,420 40,420" fill="url(#kraftGrad)" stroke="#593b1d" stroke-width="4" />
    <!-- Box Top Left Flap -->
    <polygon points="40,160 120,60 260,60 180,160" fill="#d6a978" stroke="#593b1d" stroke-width="3" />
    <!-- Box Top Right Flap -->
    <polygon points="180,160 260,60 420,70 380,160" fill="#b07f4d" stroke="#593b1d" stroke-width="3" />
    <!-- Flute seam -->
    <line x1="210" y1="160" x2="210" y2="420" stroke="#593b1d" stroke-width="4" stroke-dasharray="10 5" />
    <!-- Recycle emblem -->
    <text x="210" y="300" text-anchor="middle" fill="#593b1d" font-family="monospace" font-size="26" font-weight="bold">♻ PAP 20</text>
  </g>
  
  <text x="400" y="550" text-anchor="middle" fill="#d6a978" font-family="monospace" font-size="20" font-weight="bold">KARDUS KRAFT GELOMBANG (DAUR ULANG)</text>
</svg>
`)}`;

// 4. Plant Leaf with Chlorosis Lesions
export const SAMPLE_PLANT_LEAF_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#0f2115" />
      <stop offset="100%" stop-color="#050d08" />
    </radialGradient>
    <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4ade80" />
      <stop offset="60%" stop-color="#16a34a" />
      <stop offset="100%" stop-color="#14532d" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bg)" />

  <g transform="translate(160, 60)">
    <!-- Main Leaf Blade -->
    <path d="M 240 40 Q 420 180 380 440 Q 240 480 120 400 Q 80 200 240 40 Z" fill="url(#leafGrad)" stroke="#14532d" stroke-width="6" />
    <!-- Center Leaf Vein -->
    <path d="M 240 40 Q 260 250 240 480" stroke="#86efac" stroke-width="6" fill="none" />
    <!-- Lateral Veins -->
    <path d="M 245 150 Q 330 180 360 210" stroke="#86efac" stroke-width="3" fill="none" />
    <path d="M 245 250 Q 350 280 375 320" stroke="#86efac" stroke-width="3" fill="none" />
    <path d="M 245 200 Q 170 240 120 270" stroke="#86efac" stroke-width="3" fill="none" />
    <path d="M 245 320 Q 180 360 140 390" stroke="#86efac" stroke-width="3" fill="none" />

    <!-- Chlorosis Yellow Lesion Zone (12% leaf area) -->
    <ellipse cx="310" cy="270" rx="45" ry="35" fill="#facc15" opacity="0.85" />
    <!-- Necrotic Brown Center Spot -->
    <ellipse cx="312" cy="270" rx="22" ry="16" fill="#78350f" opacity="0.9" />
  </g>
  
  <text x="400" y="550" text-anchor="middle" fill="#4ade80" font-family="monospace" font-size="20" font-weight="bold">KANOPY DAUN SAYUR (GEJALA KLOROSIS 12%)</text>
</svg>
`)}`;
