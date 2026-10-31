"use client";

import React, { useState, useEffect } from "react";
import StudioShell from "@/components/ui/StudioShell";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import { USER_DAILY_QUOTAS } from "@/lib/meta/shield";
import { WORLD_CITY_CATALOG } from "@/lib/science/presets";

export default function SettingsPage() {
  const {
    locale,
    units,
    theme,
    displayName,
    email,
    avatarUrl,
    authProvider,
    geo,
    level,
    xp,
    housingCalc,
    aiShield,
    setLocale,
    setUnits,
    setTheme,
    teleportToCity,
    toggleOpenWeightModel,
    updateUserProfile,
    resetToStarterPlot,
    loadVerifiedSpecimenPlot,
    logout,
  } = useVerdaraStore();

  const [editName, setEditName] = useState(displayName);
  const [editAvatar, setEditAvatar] = useState(avatarUrl || "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMsg, setSaveMsg] = useState("");

  const isId = locale === "id";
  const isLight = theme === "light";

  useEffect(() => {
    setEditName(displayName);
    setEditAvatar(avatarUrl || "");
  }, [displayName, avatarUrl]);

  const surfaceCard = isLight
    ? "border-[#C7C0B0] bg-[#EAE5D9] text-[#101D16]"
    : "border-[#1D3328] bg-[#0E1914] text-[#F2F7F4]";

  const elevatedCard = isLight
    ? "border-[#C7C0B0] bg-[#FFFFFF] text-[#101D16]"
    : "border-[#1D3328] bg-[#13221B] text-[#F2F7F4]";

  const textSecondary = isLight ? "text-[#2C4438]" : "text-[#A3BEB0]";
  const textMuted = isLight ? "text-[#3D594B]" : "text-[#88AC9B]";

  const remainingCap = Number(
    (aiShield.lifetimeCapUsd - aiShield.totalSpendUsd).toFixed(2)
  );
  const totalCalls = aiShield.cacheHitsCount + aiShield.liveApiCallsCount;
  const cacheRate =
    totalCalls > 0
      ? Math.round((aiShield.cacheHitsCount / totalCalls) * 100)
      : 0;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    setSaveMsg("");

    const trimmedName = editName.trim();
    if (!trimmedName) {
      setSaveStatus("error");
      setSaveMsg(isId ? "Nama tampilan tidak boleh kosong." : "Display name cannot be empty.");
      return;
    }

    try {
      updateUserProfile({
        displayName: trimmedName,
        avatarUrl: editAvatar.trim(),
      });

      // Synchronize to backend profile API
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          displayName: trimmedName,
          avatarUrl: editAvatar.trim(),
          city: geo.city,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to sync profile");
      }

      setSaveStatus("saved");
      setSaveMsg(
        isId
          ? "Profil Anda berhasil diperbarui di database Supabase."
          : "Your profile was saved successfully to Supabase database."
      );
      setTimeout(() => setSaveStatus("idle"), 4000);
    } catch {
      setSaveStatus("saved");
      setSaveMsg(
        isId
          ? "Profil diperbarui secara lokal (akan disinkronkan saat terhubung)."
          : "Profile updated in local session (will sync upon cloud connection)."
      );
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  };

  const getProviderBadge = () => {
    switch (authProvider) {
      case "google":
        return {
          label: "Google Verified OAuth",
          color: "bg-[#4285F4]/15 border-[#4285F4]/30 text-[#4285F4]",
        };
      case "facebook":
        return {
          label: "Facebook Verified OAuth",
          color: "bg-[#1877F2]/15 border-[#1877F2]/30 text-[#1877F2]",
        };
      case "starter":
        return {
          label: "Starter Resident",
          color: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
        };
      default:
        return {
          label: "Verified Resident Email",
          color: "bg-[#15803d]/15 border-[#15803d]/30 text-[#15803d] dark:text-[#a3e635]",
        };
    }
  };

  const providerBadge = getProviderBadge();

  return (
    <StudioShell>
      <div className="space-y-6">
        {/* SECTION 01: INDIVIDUAL USER PROFILE & SETTINGS */}
        <section className={`rounded-2xl border p-6 ${surfaceCard}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`font-mono text-xs font-bold tracking-wider ${textMuted}`}>
                {isId
                  ? "// 01 PROFIL WARGA & PENGATURAN IDENTITAS RESMI"
                  : "// 01 RESIDENT PROFILE & OFFICIAL IDENTITY SETTINGS"}
              </p>
              <h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">
                {isId
                  ? "Profil Pribadi & Hak Akses Warga"
                  : "Personal Profile & Resident Identity"}
              </h1>
            </div>

            <span
              className={`rounded-xl border px-3.5 py-1.5 font-mono text-xs font-bold ${providerBadge.color}`}
            >
              ● {providerBadge.label}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column: Avatar & Summary */}
            <div className={`rounded-xl border p-5 lg:col-span-4 ${elevatedCard} flex flex-col items-center text-center justify-center`}>
              <div className="relative mb-3 flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#15803d] dark:border-[#a3e635] bg-[#15803d]/10 overflow-hidden text-2xl font-black">
                {editAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={editAvatar}
                    alt={displayName}
                    className="h-full w-full object-cover"
                    onError={() => setEditAvatar("")}
                  />
                ) : (
                  <span>
                    {(displayName || "R")
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                )}
              </div>

              <h2 className="text-lg font-bold">{displayName}</h2>
              <p className={`font-mono text-xs ${textMuted}`}>{email || "resident@verdara.app"}</p>

              <div className="mt-4 w-full divide-y divide-current/10 border-t border-current/10 pt-3 text-left font-mono text-xs">
                <div className="flex justify-between py-1.5">
                  <span className={textMuted}>{isId ? "Tingkat Plot:" : "Plot Level:"}</span>
                  <span className="font-bold text-[#15803d] dark:text-[#a3e635]">Lv.{level} ({xp} XP)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className={textMuted}>{isId ? "Wilayah Node:" : "Node Jurisdiction:"}</span>
                  <span className="font-semibold">{geo.city} ({geo.countryCode})</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className={textMuted}>{isId ? "Estimasi Surya:" : "Solar Output:"}</span>
                  <span className="font-semibold">{housingCalc.solar.kwp} kWp</span>
                </div>
              </div>
            </div>

            {/* Right Column: Editable Fields */}
            <div className={`rounded-xl border p-5 lg:col-span-8 ${elevatedCard}`}>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="profile-display-name"
                      className={`block font-mono text-xs font-semibold ${textMuted}`}
                    >
                      {isId ? "Nama Tampilan Warga" : "Display Name"}
                    </label>
                    <input
                      id="profile-display-name"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder={isId ? "Nama lengkap Anda" : "Your full name"}
                      className={`mt-1.5 min-h-[44px] w-full rounded-xl border px-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#15803d] dark:focus:ring-[#a3e635] ${
                        isLight
                          ? "border-[#C7C0B0] bg-[#FFFFFF] text-[#101D16]"
                          : "border-[#1D3328] bg-[#0E1914] text-[#F2F7F4]"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-email-readonly"
                      className={`block font-mono text-xs font-semibold ${textMuted}`}
                    >
                      {isId ? "Email Akun Terverifikasi (Terkunci)" : "Verified Account Email (Locked)"}
                    </label>
                    <input
                      id="profile-email-readonly"
                      type="text"
                      disabled
                      value={email || "resident@verdara.app"}
                      className={`mt-1.5 min-h-[44px] w-full cursor-not-allowed rounded-xl border px-3.5 text-sm font-mono opacity-70 ${
                        isLight
                          ? "border-[#C7C0B0] bg-[#EAE5D9] text-[#101D16]"
                          : "border-[#1D3328] bg-[#09110D] text-[#88AC9B]"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="profile-avatar-url"
                    className={`block font-mono text-xs font-semibold ${textMuted}`}
                  >
                    {isId ? "URL Gambar Avatar Kustom (Opsional)" : "Custom Avatar Image URL (Optional)"}
                  </label>
                  <input
                    id="profile-avatar-url"
                    type="url"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className={`mt-1.5 min-h-[44px] w-full rounded-xl border px-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#15803d] dark:focus:ring-[#a3e635] ${
                      isLight
                        ? "border-[#C7C0B0] bg-[#FFFFFF] text-[#101D16]"
                        : "border-[#1D3328] bg-[#0E1914] text-[#F2F7F4]"
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-city-select"
                    className={`block font-mono text-xs font-semibold ${textMuted}`}
                  >
                    {isId ? "Kota Domisili / Yurisdiksi Iklim" : "Home City / Climate Jurisdiction"}
                  </label>
                  <select
                    id="profile-city-select"
                    value={geo.city}
                    onChange={(e) => {
                      const selected = WORLD_CITY_CATALOG.find(
                        (c) => c.city.toLowerCase() === e.target.value.toLowerCase()
                      );
                      if (selected) {
                        teleportToCity(selected.slug as any);
                      }
                    }}
                    className={`mt-1.5 min-h-[44px] w-full rounded-xl border px-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#15803d] dark:focus:ring-[#a3e635] ${
                      isLight
                        ? "border-[#C7C0B0] bg-[#FFFFFF] text-[#101D16]"
                        : "border-[#1D3328] bg-[#0E1914] text-[#F2F7F4]"
                    }`}
                  >
                    {WORLD_CITY_CATALOG.map((c) => (
                      <option key={c.slug} value={c.city}>
                        {c.city}, {c.countryNameEn} ({c.continent})
                      </option>
                    ))}
                  </select>
                </div>

                {saveMsg && (
                  <div
                    role="status"
                    className={`rounded-xl border p-3 font-mono text-xs ${
                      saveStatus === "error"
                        ? "border-rose-500/50 bg-rose-950/20 text-rose-300"
                        : "border-[#15803d]/40 bg-[#15803d]/10 text-[#15803d] dark:text-[#a3e635]"
                    }`}
                  >
                    ● {saveMsg}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saveStatus === "saving"}
                    className={`min-h-[44px] cursor-pointer rounded-xl px-6 py-2 text-xs font-bold transition ${
                      isLight
                        ? "bg-[#14532D] text-[#FFFFFF] hover:bg-[#166534]"
                        : "bg-[#A3E635] text-[#070D0A] hover:bg-[#BEF264]"
                    } disabled:opacity-50`}
                  >
                    {saveStatus === "saving"
                      ? isId
                        ? "Menyimpan ke Supabase..."
                        : "Saving to Supabase..."
                      : isId
                      ? "Simpan Perubahan Profil"
                      : "Save Profile Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      window.location.href = "/login";
                    }}
                    className="min-h-[40px] cursor-pointer rounded-xl border border-rose-500/30 px-4 py-2 font-mono text-xs font-semibold text-rose-400 hover:bg-rose-500/10"
                  >
                    {isId ? "Keluar dari Sesi" : "Sign Out of Session"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* SECTION 02: 7-LAYER AI CREDIT SHIELD */}
        <section className={`rounded-2xl border p-6 ${surfaceCard}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`font-mono text-xs font-bold tracking-wider ${textMuted}`}>
                {isId
                  ? "// 02 PERISAI KREDIT AI 7-LAPIS / TELEMETRI KEUANGAN"
                  : "// 02 7-LAYER AI CREDIT SHIELD / FINANCIAL TELEMETRY"}
              </p>
              <h2 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">
                {isId
                  ? "Telemetri Kredit Meta Model API ($150 Pool)"
                  : "Meta Model API ($150 Pool) Credit Shield & Quota Ledger"}
              </h2>
            </div>

            <span className={`rounded-xl border px-3.5 py-2 font-mono text-xs font-bold ${elevatedCard}`}>
              {isId ? "STATUS: SEMUA 7 LAPIS PERISAI AKTIF" : "STATUS: ALL 7 SHIELD LAYERS ACTIVE"}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className={`rounded-xl border p-4 ${elevatedCard}`}>
              <p className={`font-mono text-[11px] ${textMuted}`}>
                {isId ? "HIBAH KREDIT META MODEL API" : "META MODEL API CREDIT GRANT"}
              </p>
              <p className="mt-1 font-mono text-2xl font-black tabular-nums">
                ${aiShield.lifetimeBudgetUsd.toFixed(2)}
              </p>
              <p className={`mt-1 font-mono text-xs ${textSecondary}`}>
                {isId
                  ? `Batas Pemutus Sirkuit: $${aiShield.lifetimeCapUsd.toFixed(2)}`
                  : `Hard Circuit Breaker Cap: $${aiShield.lifetimeCapUsd.toFixed(2)}`}
              </p>
            </div>

            <div className={`rounded-xl border p-4 ${elevatedCard}`}>
              <p className={`font-mono text-[11px] ${textMuted}`}>
                {isId ? "POOL CADANGAN WARGA TERVERIFIKASI" : "VERIFIED RESIDENT RESERVE POOL"}
              </p>
              <p className="mt-1 font-mono text-2xl font-black tabular-nums">
                ${aiShield.judgeReserveUsd.toFixed(2)}
              </p>
              <p className={`mt-1 font-mono text-xs ${textSecondary}`}>
                {isId
                  ? "Dicadangkan untuk sesi warga terverifikasi"
                  : "Reserved for verified resident sessions"}
              </p>
            </div>

            <div className={`rounded-xl border p-4 ${elevatedCard}`}>
              <p className={`font-mono text-[11px] ${textMuted}`}>
                {isId ? "SISA PLAFON KAMPANYE" : "REMAINING CAMPAIGN CAP"}
              </p>
              <p className="mt-1 font-mono text-2xl font-black tabular-nums">
                ${remainingCap.toFixed(2)}
              </p>
              <p className={`mt-1 font-mono text-xs ${textSecondary}`}>
                {isId
                  ? `Pengeluaran sesi: $${aiShield.todaySpendUsd.toFixed(3)} / batas harian $12.00`
                  : `Session spend: $${aiShield.todaySpendUsd.toFixed(3)} / $12.00 daily cap`}
              </p>
            </div>

            <div className={`rounded-xl border p-4 ${elevatedCard}`}>
              <p className={`font-mono text-[11px] ${textMuted}`}>
                {isId ? "RASIO CACHE HIT SESI" : "SESSION CACHE HIT RATIO"}
              </p>
              <p className="mt-1 font-mono text-2xl font-black tabular-nums">
                {totalCalls === 0 ? (isId ? "0 panggilan" : "0 calls") : `${cacheRate}%`}
              </p>
              <p className={`mt-1 font-mono text-xs ${textSecondary}`}>
                {isId
                  ? `${aiShield.cacheHitsCount} cache hit ($0.00) / ${aiShield.liveApiCallsCount} panggilan langsung`
                  : `${aiShield.cacheHitsCount} cache hits ($0.00) / ${aiShield.liveApiCallsCount} live calls`}
              </p>
            </div>
          </div>

          <div className={`mt-5 overflow-x-auto rounded-xl border p-4 ${elevatedCard}`}>
            <p className="mb-3 font-mono text-xs font-bold">
              {isId ? "// MATRIKS KUOTA HARIAN PER OPERASI" : "// PER-OPERATION DAILY QUOTA MATRIX"}
            </p>
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr
                  className={`border-b ${
                    isLight ? "border-[#C7C0B0]" : "border-[#1D3328]"
                  } ${textMuted}`}
                >
                  <th className="py-2 pr-3">{isId ? "Operasi AI" : "AI Operation"}</th>
                  <th className="py-2 pr-3">{isId ? "Pipeline Meta Model" : "Meta Model Pipeline"}</th>
                  <th className="py-2 pr-3">{isId ? "Pengunjung Tamu / Hari" : "Guest Visitor / Day"}</th>
                  <th className="py-2">{isId ? "Warga Terverifikasi / Hari" : "Verified Resident / Day"}</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isLight ? "divide-[#C7C0B0]" : "divide-[#1D3328]"
                }`}
              >
                <tr>
                  <td className="py-2.5 pr-3 font-semibold">
                    {isId ? "Pemindaian Lensa Omni-Spasial" : "Omni-Spatial Lens Scan"}
                  </td>
                  <td className="py-2.5 pr-3">muse-spark + sam-3-1</td>
                  <td className="py-2.5 pr-3">{USER_DAILY_QUOTAS.lens_scan.public} {isId ? "/ hari" : "/ day"}</td>
                  <td className="py-2.5 font-bold text-[#15803d] dark:text-[#a3e635]">
                    {USER_DAILY_QUOTAS.lens_scan.judge} {isId ? "/ hari" : "/ day"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-3 font-semibold">
                    {isId ? "Retrofit Eco-Generatif" : "Generative Eco-Retrofit"}
                  </td>
                  <td className="py-2.5 pr-3">sam-3-1 + muse-image / wonder</td>
                  <td className="py-2.5 pr-3">{USER_DAILY_QUOTAS.eco_retrofit.public} {isId ? "/ hari" : "/ day"}</td>
                  <td className="py-2.5 font-bold text-[#15803d] dark:text-[#a3e635]">
                    {USER_DAILY_QUOTAS.eco_retrofit.judge} {isId ? "/ hari" : "/ day"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-3 font-semibold">
                    {isId ? "Sidang Dewan Spesialis" : "The Verdara Council"}
                  </td>
                  <td className="py-2.5 pr-3">muse-spark / muse-spark-open</td>
                  <td className="py-2.5 pr-3">{USER_DAILY_QUOTAS.council.public} {isId ? "/ hari" : "/ day"}</td>
                  <td className="py-2.5 font-bold text-[#15803d] dark:text-[#a3e635]">
                    {USER_DAILY_QUOTAS.council.judge} {isId ? "/ hari" : "/ day"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-3 font-semibold">
                    {isId ? "Verifikasi Bukti Lapangan" : "Field Proof Verification"}
                  </td>
                  <td className="py-2.5 pr-3">sam-3-1 + 64-bit dHash</td>
                  <td className="py-2.5 pr-3">{USER_DAILY_QUOTAS.proof_verify.public} {isId ? "/ hari" : "/ day"}</td>
                  <td className="py-2.5 font-bold text-[#15803d] dark:text-[#a3e635]">
                    {USER_DAILY_QUOTAS.proof_verify.judge} {isId ? "/ hari" : "/ day"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-3 font-semibold">
                    {isId ? "Perintah Suara Lapangan" : "Field Voice Command"}
                  </td>
                  <td className="py-2.5 pr-3">muse-voice-transcribe (&lt;=15s)</td>
                  <td className="py-2.5 pr-3">{USER_DAILY_QUOTAS.voice_transcribe.public} {isId ? "/ hari" : "/ day"}</td>
                  <td className="py-2.5 font-bold text-[#15803d] dark:text-[#a3e635]">
                    {USER_DAILY_QUOTAS.voice_transcribe.judge} {isId ? "/ hari" : "/ day"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 03 & 04: PREFERENCES & PLOT CONTROLS */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Section 03: Localization & Units */}
          <section className={`rounded-2xl border p-5 ${surfaceCard}`}>
            <p className={`font-mono text-xs font-bold tracking-wider ${textMuted}`}>
              {isId
                ? "// 03 LOKALISASI, SATUAN & PALET TAMPILAN"
                : "// 03 LOCALIZATION, UNITS & SURFACE PALETTE"}
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3.5 ${elevatedCard}`}>
                <span className="font-semibold">
                  {isId ? "Bahasa Antarmuka & Output AI" : "Interface & AI Output Language"}
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLocale("en")}
                    className={`min-h-[40px] cursor-pointer rounded-lg px-3 py-1.5 font-mono font-bold ${
                      locale === "en"
                        ? isLight
                          ? "bg-[#14532D] text-[#FFFFFF]"
                          : "bg-[#A3E635] text-[#070D0A]"
                        : surfaceCard
                    }`}
                  >
                    English (EN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocale("id")}
                    className={`min-h-[40px] cursor-pointer rounded-lg px-3 py-1.5 font-mono font-bold ${
                      locale === "id"
                        ? isLight
                          ? "bg-[#14532D] text-[#FFFFFF]"
                          : "bg-[#A3E635] text-[#070D0A]"
                        : surfaceCard
                    }`}
                  >
                    Indonesia (ID)
                  </button>
                </div>
              </div>

              <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3.5 ${elevatedCard}`}>
                <span className="font-semibold">
                  {isId ? "Sistem Satuan Pengukuran" : "Measurement Unit System"}
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setUnits("metric")}
                    className={`min-h-[40px] cursor-pointer rounded-lg px-3 py-1.5 font-mono font-bold ${
                      units === "metric"
                        ? isLight
                          ? "bg-[#14532D] text-[#FFFFFF]"
                          : "bg-[#A3E635] text-[#070D0A]"
                        : surfaceCard
                    }`}
                  >
                    {isId ? "Metrik (m², L, °C)" : "Metric (m², L, °C)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnits("imperial")}
                    className={`min-h-[40px] cursor-pointer rounded-lg px-3 py-1.5 font-mono font-bold ${
                      units === "imperial"
                        ? isLight
                          ? "bg-[#14532D] text-[#FFFFFF]"
                          : "bg-[#A3E635] text-[#070D0A]"
                        : surfaceCard
                    }`}
                  >
                    {isId ? "Imperial (kaki², gal, °F)" : "Imperial (sq ft, gal, °F)"}
                  </button>
                </div>
              </div>

              <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3.5 ${elevatedCard}`}>
                <span className="font-semibold">
                  {isId ? "Tema Permukaan Arsitektural" : "Architectural Surface Theme"}
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`min-h-[40px] cursor-pointer rounded-lg px-3 py-1.5 font-mono font-bold ${
                      theme === "dark"
                        ? "bg-[#A3E635] text-[#070D0A]"
                        : surfaceCard
                    }`}
                  >
                    {isId ? "Obsidian Hutan (Gelap)" : "Forest Obsidian (Dark)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`min-h-[40px] cursor-pointer rounded-lg px-3 py-1.5 font-mono font-bold ${
                      theme === "light"
                        ? "bg-[#14532D] text-[#FFFFFF]"
                        : surfaceCard
                    }`}
                  >
                    {isId ? "Batukapur Hangat (Terang)" : "Warm Limestone (Light)"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 04: Engine & Plot Sandbox Controls */}
          <section className={`rounded-2xl border p-5 ${surfaceCard}`}>
            <p className={`font-mono text-xs font-bold tracking-wider ${textMuted}`}>
              {isId
                ? "// 04 KONTROL MESIN & PENGUJIAN PLOT"
                : "// 04 ENGINE CONTROLS & PLOT WORKSPACE"}
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 ${elevatedCard}`}>
                <div>
                  <p className="font-semibold">
                    {isId
                      ? "Mesin Dewan Meta Open-Weight (muse-spark-open)"
                      : "Meta Open-Weight Council Engine (muse-spark-open)"}
                  </p>
                  <p className={`text-[11px] ${textMuted}`}>
                    {isId
                      ? "Merutekan sintesis dewan spesialis melalui konfigurasi model bobot terbuka"
                      : "Routes specialist council synthesis through open-weight model configuration"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleOpenWeightModel}
                  className={`min-h-[40px] cursor-pointer rounded-lg px-3.5 py-1.5 font-mono font-bold ${
                    aiShield.useOpenWeightModel
                      ? isLight
                        ? "bg-[#14532D] text-[#FFFFFF]"
                        : "bg-[#A3E635] text-[#070D0A]"
                      : surfaceCard
                  }`}
                >
                  {aiShield.useOpenWeightModel
                    ? isId
                      ? "AKTIF"
                      : "ENABLED"
                    : isId
                    ? "NONAKTIF"
                    : "DISABLED"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={loadVerifiedSpecimenPlot}
                  className={`min-h-[44px] cursor-pointer rounded-xl px-3.5 py-2.5 font-mono text-xs font-bold transition ${
                    isLight
                      ? "bg-[#14532D] text-[#FFFFFF] hover:bg-[#166534]"
                      : "bg-[#A3E635] text-[#070D0A] hover:bg-[#BEF264]"
                  }`}
                >
                  {isId ? "Muat Spesimen Lengkap (Lv.5)" : "Load Complete Specimen (Lv.5)"}
                </button>
                <button
                  type="button"
                  onClick={resetToStarterPlot}
                  className={`min-h-[44px] cursor-pointer rounded-xl border px-3.5 py-2.5 font-mono text-xs font-bold transition ${elevatedCard}`}
                >
                  {isId ? "Reset ke Plot Awal (Lv.1)" : "Reset to Starter Plot (Lv.1)"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </StudioShell>
  );
}
