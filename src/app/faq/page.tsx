'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useVerdaraStore } from '@/store/useVerdaraStore';
import { VerdaraLogo, VerdaraBottomDock } from '@/components/ui/InteractiveEffects';

interface FaqItem {
  id: string;
  category: 'general' | 'ai' | 'physics' | 'security' | 'hackathon';
  qEn: string;
  qId: string;
  aEn: string;
  aId: string;
  badge: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-01',
    category: 'general',
    badge: 'OVERVIEW',
    qEn: 'What is Verdara and how does it help homeowners or city planners?',
    qId: 'Apa itu Verdara dan bagaimana ia membantu pemilik rumah atau perencana kota?',
    aEn: 'Verdara is a Spatial Climate & Autonomous Eco-District Twin. By selecting any country and city worldwide or uploading a photo of a building/yard, Verdara calculates exact rooftop solar potential (kWp & annual kWh), rainwater harvesting capacity (L/yr), biopore drainage resilience, and material circularity savings in local currency, rendered inside an interactive 3D eco-district.',
    aId: 'Verdara adalah Spatial Climate & Autonomous Eco-District Twin. Dengan memilih negara dan kota mana pun di dunia atau mengunggah foto bangunan/halaman, Verdara menghitung potensi panel surya atap (kWp & kWh tahunan), kapasitas panen air hujan (L/thn), ketahanan drainase biopori, dan penghematan daur ulang material dalam mata uang lokal, serta memvisualisasikannya di dalam distrik 3D interaktif.',
  },
  {
    id: 'faq-02',
    category: 'security',
    badge: 'AUTH GATE',
    qEn: 'Why do I need to sign in before opening the Studio Dashboard (/dashboard)?',
    qId: 'Mengapa saya harus login terlebih dahulu sebelum membuka Studio Dashboard (/dashboard)?',
    aEn: 'To protect user telemetry, SAM 3.1 spatial scan records, and API credit quotas, all studio routes (/dashboard, /lens, /radar, /council, /academy, /settings) are protected by an authentication gate. Hackathon judges can use the 1-Click Judge Demo button on /login to unlock Level 5 Architect credentials immediately, or sign in with any resident email.',
    aId: 'Untuk melindungi telemetri pengguna, riwayat pemindaian spasial SAM 3.1, dan kuota kredit API, seluruh rute studio (/dashboard, /lens, /radar, /council, /academy, /settings) dilindungi oleh gerbang autentikasi. Juri Hackathon dapat menggunakan tombol 1-Click Judge Demo di /login untuk langsung membuka kredensial Level 5 Architect, atau masuk dengan email warga.',
  },
  {
    id: 'faq-03',
    category: 'ai',
    badge: 'META AI',
    qEn: 'How are Meta SAM 3.1, SAM 3D, and Muse Spark used in Verdara?',
    qId: 'Bagaimana Meta SAM 3.1, SAM 3D, dan Muse Spark digunakan di dalam Verdara?',
    aEn: 'Meta SAM 3.1 segments rooftops, permeable soil, trees, and recyclable materials from uploaded photos. SAM 3D reconstructs spatial depth meshes and drainage slopes in the 3D Radar (/radar). Muse Spark powers the Multi-Agent Sustainability Council (/council), where three specialized AI agents (Solar Architect, Hydrologist, Circular Economist) debate and produce a verified step-by-step retrofit blueprint.',
    aId: 'Meta SAM 3.1 melakukan segmentasi atap, tanah resapan, pepohonan, dan material daur ulang dari foto yang diunggah. SAM 3D merekonstruksi jaring kedalaman spasial dan kemiringan drainase pada 3D Radar (/radar). Muse Spark menggerakkan Dewan Keberlanjutan Multi-Agen (/council), tempat tiga agen AI spesialis berdiskusi menghasilkan cetak biru renovasi langkah demi langkah.',
  },
  {
    id: 'faq-04',
    category: 'physics',
    badge: 'SOLAR & WATER',
    qEn: 'Are the solar kWh and rainwater harvesting numbers real or placeholder?',
    qId: 'Apakah angka kWh surya dan panen air hujan dihitung secara nyata atau sekadar angka contoh?',
    aEn: 'Every number is computed deterministically from physics formulas! Solar output uses NREL PVWatts v8 (E_annual = A_roof * 0.68 * eta_panel * H_POA * 365.25 * PR_temp) with latitude-adjusted Global Horizontal Irradiance (GHI) and temperature derating (-0.38%/degC above 25 degC). Rainwater harvesting uses DIN 1989-1 (V_rain = A_catchment * P_annual_mm * 0.85 * 0.92).',
    aId: 'Setiap angka dihitung secara deterministik dari rumus fisika nyata! Output surya menggunakan NREL PVWatts v8 dengan penyesuaian iradiasi lintang (GHI) dan penurunan efisiensi suhu (-0.38%/derajat C di atas 25 derajat C). Panen air hujan menggunakan standar DIN 1989-1 berdasarkan curah hujan tahunan kota tersebut.',
  },
  {
    id: 'faq-05',
    category: 'general',
    badge: '195+ COUNTRIES',
    qEn: 'Can I inspect any country and city in the world, and switch between Metric and Imperial?',
    qId: 'Bisakah saya melihat negara dan kota mana saja di dunia, serta mengganti satuan Metrik dan Imperial?',
    aEn: 'Yes! Use the compact World City Picker in the top header to search or filter across 195+ countries and major cities, or enter custom GPS coordinates. You can also toggle between Metric (m², L, °C) and Imperial (sq ft, gal, °F) and switch between English (EN) and Bahasa Indonesia (ID) at any time.',
    aId: 'Ya! Gunakan pemilih Negara/Kota yang ringkas di header atas untuk mencari lebih dari 195 negara dan kota besar, atau masukkan koordinat GPS khusus. Anda juga dapat beralih antara satuan Metrik (m², L, °C) dan Imperial (sq ft, gal, °F) serta bahasa Inggris (EN) dan Indonesia (ID) kapan saja.',
  },
  {
    id: 'faq-06',
    category: 'security',
    badge: 'CYBERSECURITY',
    qEn: 'How does Verdara protect API keys, user inputs, and prevent runway cost spikes?',
    qId: 'Bagaimana Verdara melindungi kunci API, input pengguna, dan mencegah lonjakan biaya API?',
    aEn: 'Verdara enforces a multi-layered defense: (1) Edge HTTP security headers (CSP-ready nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy), (2) CSRF origin verification on POST endpoints, (3) sliding-window token-bucket rate limiting (30 req/min per IP), (4) strict payload sanitization against XSS/prototype pollution, and (5) a 3-Tier API Credit Shield ($1.50/day cap with automatic deterministic fallback).',
    aId: 'Verdara menerapkan pertahanan berlapis: (1) Header keamanan HTTP Edge (nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy), (2) Verifikasi origin CSRF pada endpoint POST, (3) Pembatasan laju request token-bucket (30 req/menit per IP), (4) Sanitasi input dari XSS, dan (5) Perisai Kredit API 3-Tingkat (batas $1.50/hari dengan fallback deterministik otomatis).',
  },
  {
    id: 'faq-07',
    category: 'hackathon',
    badge: '3D PERFORMANCE',
    qEn: 'How does the 3D Eco-District stay smooth and lightweight across all devices?',
    qId: 'Bagaimana Distrik 3D tetap ringan dan mulus di semua perangkat?',
    aEn: 'Instead of loading heavy 50MB GLTF textures, the 3D Eco-District uses procedural architectural geometry (CLT Solar Pavilion, hydrological retention canal, EV shuttle, kinetic turbines, and geodesic conservatory) paired with a single GPU-instanced THREE.Points atmospheric particle buffer and adaptive device pixel ratio (dpr=[1, 1.75]).',
    aId: 'Alih-alih memuat tekstur GLTF 50MB yang berat, Distrik 3D menggunakan geometri arsitektur prosedural (Paviliun Surya CLT, kanal retensi hidrologi, shuttle EV, turbin angin kinetik, dan kubah botani geodesik) yang dipadukan dengan buffer partikel atmosfer THREE.Points tunggal ramah-GPU serta rasio piksel adaptif (dpr=[1, 1.75]).',
  },
  {
    id: 'faq-08',
    category: 'hackathon',
    badge: 'META HACKATHON',
    qEn: 'What is the fastest route for Meta Hackathon judges to evaluate all features?',
    qId: 'Bagaimana alur tercepat bagi juri Meta Hackathon untuk menilai seluruh fitur?',
    aEn: '1. Explore the Landing Page (/) to test the 5 Climate Decks and the interactive 3D Eco-District (Normal, Storm Surge, AI Heal modes + camera presets). 2. Click Sign In / Studio and select 1-Click Judge Demo (Lv.5). 3. Inside /dashboard, test the Roof Size slider, open /lens for SAM 3.1 segmentation, /radar for 3D point clouds, and /council for Muse Spark multi-agent synthesis.',
    aId: '1. Jelajahi Halaman Utama (/) untuk menguji 5 Dek Iklim dan Distrik 3D interaktif (mode Normal, Badai, Solusi AI + preset kamera). 2. Klik Masuk / Studio dan pilih 1-Click Judge Demo (Lv.5). 3. Di dalam /dashboard, uji penggeser ukuran atap, buka /lens untuk segmentasi SAM 3.1, /radar untuk 3D point cloud, dan /council untuk diskusi multi-agen Muse Spark.',
  },
];

export default function FaqPage() {
  const { locale, setLocale, theme, setTheme, isAuthenticated, displayName, logout } = useVerdaraStore();
  const isId = locale === 'id';
  const [activeCategory, setActiveCategory] = useState<'all' | FaqItem['category']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<string[]>(['faq-01', 'faq-02', 'faq-03']);

  const toggleItem = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    if (!matchesCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.qEn.toLowerCase().includes(q) ||
      item.qId.toLowerCase().includes(q) ||
      item.aEn.toLowerCase().includes(q) ||
      item.aId.toLowerCase().includes(q) ||
      item.badge.toLowerCase().includes(q)
    );
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        paddingBottom: '120px',
      }}
    >
      {/* CLEAN SINGLE-ROW TOP HEADER */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 90,
          background: 'color-mix(in srgb, var(--bg-canvas) 88%, transparent)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-hairline)',
          padding: '10px clamp(16px, 3vw, 40px)',
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                minHeight: '44px',
              }}
            >
              <VerdaraLogo size={32} />
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '15px',
                    letterSpacing: '0.06em',
                    display: 'block',
                    lineHeight: 1.1,
                  }}
                >
                  VERDARA
                </span>
                <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {isId ? 'PUSat BANTUAN & FAQ' : 'KNOWLEDGE BASE & FAQ'}
                </span>
              </div>
            </Link>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <Link href="/" className="dovv-pill" style={{ minHeight: '38px', padding: '6px 12px' }}>
                {isId ? '← Beranda' : '← Home'}
              </Link>
              <Link href="/docs" className="dovv-pill" style={{ minHeight: '38px', padding: '6px 12px' }}>
                {isId ? 'Dokumentasi Teknis' : 'Technical Docs'}
              </Link>
              <Link href="/faq" className="dovv-pill active" style={{ minHeight: '38px', padding: '6px 12px' }}>
                FAQ
              </Link>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setLocale(isId ? 'en' : 'id')}
              className="dovv-pill"
              style={{ minHeight: '38px', padding: '6px 12px' }}
            >
              {isId ? 'ID / EN' : 'EN / ID'}
            </button>
            <button
              type="button"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="dovv-pill"
              style={{ minHeight: '38px', padding: '6px 12px' }}
            >
              {theme === 'light' ? '☀ Day' : '☾ Night'}
            </button>
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="pill-btn pill-btn-primary"
                  style={{ minHeight: '38px', padding: '6px 14px', fontSize: '12px', textDecoration: 'none' }}
                >
                  {isId ? `Buka Studio (${displayName.split(' ')[0]}) →` : `Open Studio (${displayName.split(' ')[0]}) →`}
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="dovv-pill"
                  style={{ minHeight: '38px', padding: '6px 12px' }}
                >
                  {isId ? 'Keluar' : 'Logout'}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="pill-btn pill-btn-primary"
                style={{ minHeight: '38px', padding: '6px 14px', fontSize: '12px', textDecoration: 'none' }}
              >
                {isId ? 'Login ke Studio →' : 'Sign In to Studio →'}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main
        style={{
          maxWidth: '1180px',
          margin: '0 auto',
          padding: 'clamp(28px, 4vw, 56px) clamp(16px, 3vw, 40px)',
        }}
      >
        {/* HERO BANNER */}
        <section
          className="architectural-card"
          style={{
            padding: 'clamp(24px, 4vw, 44px)',
            borderRadius: '28px',
            marginBottom: '28px',
            background:
              'linear-gradient(135deg, color-mix(in srgb, var(--accent-blue) 8%, var(--bg-surface)), var(--bg-surface))',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '20px', alignItems: 'flex-end' }}>
            <div style={{ maxWidth: '720px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <span className="telemetry-chip">VERDARA FAQ</span>
                <span className="telemetry-chip" style={{ color: 'var(--accent-emerald)' }}>
                  {isId ? 'PENJELASAN LENGKAP WEBSITE' : 'PLAIN-LANGUAGE PLATFORM GUIDE'}
                </span>
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.85rem, 3.8vw, 3rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.08,
                  marginBottom: '12px',
                }}
              >
                {isId
                  ? 'Pertanyaan Umum & Panduan Lengkap Verdara.'
                  : 'Frequently Asked Questions & Platform Guide.'}
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                {isId
                  ? 'Temukan jawaban langsung mengenai cara kerja simulasi 3D Eco-District, model Meta AI (SAM 3.1 & Muse Spark), rumus fisika panel surya & air hujan, serta sistem keamanan login.'
                  : 'Clear answers on how the 3D Eco-District simulation, Meta AI stack (SAM 3.1 & Muse Spark), NREL/DIN physics formulas, and login security gate work together.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setOpenIds(FAQ_ITEMS.map((i) => i.id))}
                className="dovv-pill"
                style={{ minHeight: '44px', padding: '10px 16px' }}
              >
                {isId ? 'Buka Semua Jawaban' : 'Expand All'}
              </button>
              <button
                type="button"
                onClick={() => setOpenIds([])}
                className="dovv-pill"
                style={{ minHeight: '44px', padding: '10px 16px' }}
              >
                {isId ? 'Tutup Semua' : 'Collapse All'}
              </button>
            </div>
          </div>

          {/* SEARCH & CATEGORY FILTER BAR */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-hairline)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', labelEn: 'All Questions (8)', labelId: 'Semua (8)' },
                { id: 'general', labelEn: 'Overview & Usage', labelId: 'Umum & Penggunaan' },
                { id: 'ai', labelEn: 'Meta AI Stack', labelId: 'Meta AI Stack' },
                { id: 'physics', labelEn: 'Solar & Water Math', labelId: 'Fisika Surya & Air' },
                { id: 'security', labelEn: 'Login & Security', labelId: 'Login & Keamanan' },
                { id: 'hackathon', labelEn: '3D & Judging', labelId: '3D & Penjurian' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as typeof activeCategory)}
                  className={`dovv-pill ${activeCategory === cat.id ? 'active' : ''}`}
                  style={{ minHeight: '44px', padding: '8px 14px', fontSize: '12px' }}
                >
                  {isId ? cat.labelId : cat.labelEn}
                </button>
              ))}
            </div>

            <div style={{ flex: '1 1 240px', maxWidth: '340px' }}>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isId ? 'Cari topik (mis. SAM 3.1, login, surya)...' : 'Search FAQ (e.g. SAM 3.1, login, solar)...'}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  padding: '10px 14px',
                  borderRadius: '999px',
                  border: '1px solid var(--border-strong)',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>
        </section>

        {/* ACCORDION LIST */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredFaqs.map((item, idx) => {
            const isOpen = openIds.includes(item.id);
            return (
              <div
                key={item.id}
                className="architectural-card"
                style={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: isOpen ? '1px solid var(--accent-emerald)' : '1px solid var(--border-hairline)',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  style={{
                    width: '100%',
                    minHeight: '64px',
                    padding: '18px 22px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '999px',
                        background: isOpen ? 'var(--accent-emerald)' : 'var(--bg-elevated)',
                        color: isOpen ? '#04120a' : 'var(--text-muted)',
                      }}
                    >
                      0{idx + 1} · {item.badge}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(1rem, 1.8vw, 1.18rem)',
                        fontWeight: 700,
                      }}
                    >
                      {isId ? item.qId : item.qEn}
                    </span>
                  </div>

                  <span
                    className="font-mono"
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      width: '36px',
                      height: '36px',
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      flexShrink: 0,
                    }}
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: '0 22px 22px 22px',
                      borderTop: '1px solid var(--border-hairline)',
                      paddingTop: '16px',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '14.5px',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.72,
                        margin: 0,
                      }}
                    >
                      {isId ? item.aId : item.aEn}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* BOTTOM CTA CARD */}
        <section
          className="architectural-card"
          style={{
            marginTop: '28px',
            padding: '28px',
            borderRadius: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            <div className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 700 }}>
              {isId ? 'BUTUH SPESIFIKASI TEKNIS LEBIH DALAM?' : 'NEED DEEPER ENGINEERING SPECIFICATIONS?'}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>
              {isId
                ? 'Baca Dokumentasi Arsitektur, Rumus Fisika, & Database v3.2'
                : 'Read the System Architecture, Physics Equations & Database v3.2 Docs'}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              href="/docs"
              className="pill-btn pill-btn-secondary"
              style={{ minHeight: '44px', padding: '10px 18px', textDecoration: 'none' }}
            >
              {isId ? 'Buka Halaman DOCUMENTS (/docs)' : 'Open DOCUMENTS (/docs)'}
            </Link>
            <Link
              href={isAuthenticated ? '/dashboard' : '/login'}
              className="pill-btn pill-btn-primary"
              style={{ minHeight: '44px', padding: '10px 18px', textDecoration: 'none' }}
            >
              {isAuthenticated
                ? isId
                  ? 'Masuk ke Studio Dashboard →'
                  : 'Enter Studio Dashboard →'
                : isId
                ? 'Login terlebih dahulu →'
                : 'Sign In First →'}
            </Link>
          </div>
        </section>
      </main>

      <VerdaraBottomDock />
    </div>
  );
}
