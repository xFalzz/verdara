const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

async function generateLogos() {
  const publicDir = path.resolve("public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const artifactDir = "C:\\Users\\HP\\.gemini\\antigravity\\brain\\8e25bf67-24c0-461d-815f-02f2e7969e3b";
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  // 1. Core Icon SVG (Transparent, 1024x1024)
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="vd-emerald" x1="15" y1="17" x2="32" y2="49" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#1e9e5a" />
        <stop offset="100%" stop-color="#0e562e" />
      </linearGradient>
      <linearGradient id="vd-lime" x1="49" y1="17" x2="32" y2="49" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#e8ff66" />
        <stop offset="100%" stop-color="#b6eb1a" />
      </linearGradient>
      <linearGradient id="vd-bevel-l" x1="15" y1="13" x2="30" y2="17" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#2ee07e" />
        <stop offset="100%" stop-color="#1a8b4e" />
      </linearGradient>
      <linearGradient id="vd-bevel-r" x1="49" y1="13" x2="34" y2="17" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#c6f432" />
      </linearGradient>
    </defs>
    <path d="M15 17 L26 17 L32 35.5 L32 49 L15 17 Z" fill="url(#vd-emerald)" />
    <path d="M15 17 L19 13 L30 13 L26 17 Z" fill="url(#vd-bevel-l)" />
    <path d="M49 17 L38 17 L32 35.5 L32 49 L49 17 Z" fill="url(#vd-lime)" />
    <path d="M49 17 L45 13 L34 13 L38 17 Z" fill="url(#vd-bevel-r)" />
    <path d="M32 21 L37.5 29 L32 37 L26.5 29 Z" fill="#08090c" stroke="#c6f432" stroke-width="1.2" />
    <line x1="39" y1="22.5" x2="45.5" y2="22.5" stroke="#08090c" stroke-width="1.5" stroke-linecap="round" />
    <line x1="36.5" y1="28" x2="43" y2="28" stroke="#08090c" stroke-width="1.5" stroke-linecap="round" />
    <line x1="34" y1="33.5" x2="39.5" y2="33.5" stroke="#08090c" stroke-width="1.5" stroke-linecap="round" />
    <circle cx="32" cy="29" r="2.8" fill="#2a9dbd" />
    <circle cx="31.2" cy="28.2" r="1.1" fill="#ffffff" />
  </svg>`;

  // 2. Icon with Dark Capsule Backdrop SVG (1024x1024)
  const iconDarkBackdropSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" fill="none">
    <rect width="1024" height="1024" rx="220" fill="#08090c" />
    <rect x="16" y="16" width="992" height="992" rx="204" stroke="#232730" stroke-width="24" />
    <g transform="translate(140, 140) scale(11.6)">
      <defs>
        <linearGradient id="vd-emerald2" x1="15" y1="17" x2="32" y2="49" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#1e9e5a" />
          <stop offset="100%" stop-color="#0e562e" />
        </linearGradient>
        <linearGradient id="vd-lime2" x1="49" y1="17" x2="32" y2="49" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#e8ff66" />
          <stop offset="100%" stop-color="#b6eb1a" />
        </linearGradient>
        <linearGradient id="vd-bevel-l2" x1="15" y1="13" x2="30" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#2ee07e" />
          <stop offset="100%" stop-color="#1a8b4e" />
        </linearGradient>
        <linearGradient id="vd-bevel-r2" x1="49" y1="13" x2="34" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#c6f432" />
        </linearGradient>
      </defs>
      <path d="M15 17 L26 17 L32 35.5 L32 49 L15 17 Z" fill="url(#vd-emerald2)" />
      <path d="M15 17 L19 13 L30 13 L26 17 Z" fill="url(#vd-bevel-l2)" />
      <path d="M49 17 L38 17 L32 35.5 L32 49 L49 17 Z" fill="url(#vd-lime2)" />
      <path d="M49 17 L45 13 L34 13 L38 17 Z" fill="url(#vd-bevel-r2)" />
      <path d="M32 21 L37.5 29 L32 37 L26.5 29 Z" fill="#08090c" stroke="#c6f432" stroke-width="1.2" />
      <line x1="39" y1="22.5" x2="45.5" y2="22.5" stroke="#08090c" stroke-width="1.5" stroke-linecap="round" />
      <line x1="36.5" y1="28" x2="43" y2="28" stroke="#08090c" stroke-width="1.5" stroke-linecap="round" />
      <line x1="34" y1="33.5" x2="39.5" y2="33.5" stroke="#08090c" stroke-width="1.5" stroke-linecap="round" />
      <circle cx="32" cy="29" r="2.8" fill="#2a9dbd" />
      <circle cx="31.2" cy="28.2" r="1.1" fill="#ffffff" />
    </g>
  </svg>`;

  // 3. Full Brand Lockup SVG (2048x640)
  const fullBrandSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="640" viewBox="0 0 2048 640" fill="none">
    <rect width="2048" height="640" rx="40" fill="#08090c" />
    <rect x="8" y="8" width="2032" height="624" rx="32" stroke="#232730" stroke-width="8" />
    <g transform="translate(100, 100) scale(6.875)">
      <defs>
        <linearGradient id="vd-emerald3" x1="15" y1="17" x2="32" y2="49" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#1e9e5a" />
          <stop offset="100%" stop-color="#0e562e" />
        </linearGradient>
        <linearGradient id="vd-lime3" x1="49" y1="17" x2="32" y2="49" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#e8ff66" />
          <stop offset="100%" stop-color="#b6eb1a" />
        </linearGradient>
        <linearGradient id="vd-bevel-l3" x1="15" y1="13" x2="30" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#2ee07e" />
          <stop offset="100%" stop-color="#1a8b4e" />
        </linearGradient>
        <linearGradient id="vd-bevel-r3" x1="49" y1="13" x2="34" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#c6f432" />
        </linearGradient>
      </defs>
      <path d="M15 17 L26 17 L32 35.5 L32 49 L15 17 Z" fill="url(#vd-emerald3)" />
      <path d="M15 17 L19 13 L30 13 L26 17 Z" fill="url(#vd-bevel-l3)" />
      <path d="M49 17 L38 17 L32 35.5 L32 49 L49 17 Z" fill="url(#vd-lime3)" />
      <path d="M49 17 L45 13 L34 13 L38 17 Z" fill="url(#vd-bevel-r3)" />
      <path d="M32 21 L37.5 29 L32 37 L26.5 29 Z" fill="#08090c" stroke="#c6f432" stroke-width="1.2" />
      <line x1="39" y1="22.5" x2="45.5" y2="22.5" stroke="#08090c" stroke-width="1.5" stroke-linecap="round" />
      <line x1="36.5" y1="28" x2="43" y2="28" stroke="#08090c" stroke-width="1.5" stroke-linecap="round" />
      <line x1="34" y1="33.5" x2="39.5" y2="33.5" stroke="#08090c" stroke-width="1.5" stroke-linecap="round" />
      <circle cx="32" cy="29" r="2.8" fill="#2a9dbd" />
      <circle cx="31.2" cy="28.2" r="1.1" fill="#ffffff" />
    </g>
    <text x="620" y="310" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="180" letter-spacing="-4" fill="#ffffff">VERDARA</text>
    <text x="630" y="420" font-family="monospace" font-weight="700" font-size="44" letter-spacing="8" fill="#c6f432">SPATIAL ECO-TOWN STUDIO</text>
    <text x="630" y="480" font-family="system-ui, sans-serif" font-weight="500" font-size="32" fill="#8892a0">Powered by Meta SAM 3.1 &amp; Muse Spark · NREL PVWatts v8</text>
  </svg>`;

  // A. Generate Transparent PNG (1024x1024)
  const p1 = path.join(publicDir, "verdara-logo.png");
  await sharp(Buffer.from(iconSvg)).png().toFile(p1);

  // B. Generate High-Res Dark Capsule PNG (1024x1024)
  const p2 = path.join(publicDir, "verdara-logo-dark.png");
  await sharp(Buffer.from(iconDarkBackdropSvg)).png().toFile(p2);

  // C. Generate High-Res Dark JPG (1024x1024)
  const p3 = path.join(publicDir, "verdara-logo-dark.jpg");
  await sharp(Buffer.from(iconDarkBackdropSvg)).jpeg({ quality: 96 }).toFile(p3);

  // D. Generate Full Horizontal Lockup PNG & JPG (2048x640)
  const p4 = path.join(publicDir, "verdara-brand-banner.png");
  await sharp(Buffer.from(fullBrandSvg)).png().toFile(p4);
  const p5 = path.join(publicDir, "verdara-brand-banner.jpg");
  await sharp(Buffer.from(fullBrandSvg)).jpeg({ quality: 96 }).toFile(p5);

  // Copy to artifacts directory
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(p1, path.join(artifactDir, "verdara-logo.png"));
    fs.copyFileSync(p2, path.join(artifactDir, "verdara-logo-dark.png"));
    fs.copyFileSync(p3, path.join(artifactDir, "verdara-logo-dark.jpg"));
    fs.copyFileSync(p4, path.join(artifactDir, "verdara-brand-banner.png"));
    fs.copyFileSync(p5, path.join(artifactDir, "verdara-brand-banner.jpg"));
  }

  console.log("SUCCESS: All logo assets generated in public/ and artifacts directory!");
}

generateLogos().catch(console.error);
