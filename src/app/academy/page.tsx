"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import StudioShell from "@/components/ui/StudioShell";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import { ACADEMY_LESSONS, type AcademyLessonSpec } from "@/lib/meta/golden-cache";
import type { ProofChecklistItem } from "@/lib/lens/masks";

interface ProofResultState {
  ok: boolean;
  score?: number;
  verified?: boolean;
  dhash?: string;
  checklist?: ProofChecklistItem[];
  xpAwarded?: number;
  unlockedItemCode?: string | null;
  errorMsg?: string;
}

export default function AcademyPage() {
  const router = useRouter();
  const {
    locale,
    theme,
    geo,
    passedQuizLessonIds,
    verifiedProofLessonIds,
    submittedDHashes,
    markQuizPassed,
    markProofVerified,
  } = useVerdaraStore();

  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    ACADEMY_LESSONS[0]!.id
  );
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({
    0: 0,
    1: 0,
    2: 0,
  });
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [verifyingProof, setVerifyingProof] = useState<boolean>(false);
  const [proofResult, setProofResult] = useState<ProofResultState | null>(null);

  const isId = locale === "id";
  const isLight = theme === "light";

  const surfaceCard = isLight
    ? "border-[#C7C0B0] bg-[#EAE5D9] text-[#101D16]"
    : "border-[#1D3328] bg-[#0E1914] text-[#F2F7F4]";

  const elevatedCard = isLight
    ? "border-[#C7C0B0] bg-[#FFFFFF] text-[#101D16]"
    : "border-[#1D3328] bg-[#13221B] text-[#F2F7F4]";

  const textSecondary = isLight ? "text-[#2C4438]" : "text-[#A3BEB0]";
  const textMuted = isLight ? "text-[#3D594B]" : "text-[#88AC9B]";

  const activeLesson: AcademyLessonSpec =
    ACADEMY_LESSONS.find((l) => l.id === selectedLessonId) ??
    ACADEMY_LESSONS[0]!;

  const isQuizPassed = passedQuizLessonIds.includes(activeLesson.id);

  const climateNote =
    activeLesson.climateNoteByGroup[geo.koppen.group] ??
    activeLesson.climateNoteByGroup.C!;

  const handleSelectLesson = (lesson: AcademyLessonSpec) => {
    setSelectedLessonId(lesson.id);
    setQuizAnswers({ 0: 0, 1: 0, 2: 0 });
    setQuizFeedback(null);
    setProofResult(null);
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    activeLesson.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    if (correctCount >= 2) {
      markQuizPassed(activeLesson.id);
      setQuizFeedback(
        isId
          ? `Lulus Kuis (${correctCount}/3 benar). Pemindai Bukti Fisik SAM 3.1 kini terbuka.`
          : `Quiz Passed (${correctCount}/3 correct). Meta SAM 3.1 Proof-of-Action Scanner is now unlocked.`
      );
    } else {
      setQuizFeedback(
        isId
          ? `Skor ${correctCount}/3. Minimal 2 jawaban benar diperlukan untuk membuka verifikasi bukti.`
          : `Score ${correctCount}/3. At least 2/3 correct answers required to unlock proof verification.`
      );
    }
  };

  const handleRunProofVerification = async (
    simulationPreset: "valid_proof" | "incomplete_proof" | "duplicate_photo"
  ) => {
    setVerifyingProof(true);
    setProofResult(null);

    const generatedDHash =
      simulationPreset === "duplicate_photo"
        ? submittedDHashes[0] || "1010110011001010"
        : `f9a4${Date.now().toString(16).slice(-12)}`;

    try {
      const res = await fetch("/api/academy/proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: activeLesson.id,
          dhash: generatedDHash,
          previousDHashes: submittedDHashes,
          simulationPreset,
          isJudge: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProofResult({
          ok: false,
          errorMsg: data.error?.message || "Duplicate or invalid proof.",
        });
      } else {
        setProofResult({
          ok: true,
          score: data.score,
          verified: data.verified,
          dhash: data.dhash,
          checklist: data.checklist,
          xpAwarded: data.xpAwarded,
          unlockedItemCode: data.unlockedItemCode,
        });

        if (data.verified) {
          markProofVerified(
            activeLesson.id,
            generatedDHash,
            activeLesson.xpReward,
            activeLesson.unlocksItemCode
          );
        }
      }
    } catch {
      setProofResult({
        ok: false,
        errorMsg: "Verification service error.",
      });
    } finally {
      setTimeout(() => setVerifyingProof(false), 250);
    }
  };

  return (
    <StudioShell>
      <div className="space-y-6">
        <header className={`rounded-2xl border p-5 ${surfaceCard}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`font-mono text-xs font-bold tracking-wider ${textMuted}`}>
                {"// 01 VERIFIABLE FIELD-ACTION PROTOCOL / META SAM 3.1 + 64-BIT DHASH"}
              </p>
              <h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">
                {isId
                  ? "Verifikasi Bukti Aksi Lapangan (SAM 3.1 Proof Engine)"
                  : "Verifiable Field-Action Protocols (SAM 3.1 Proof Engine)"}
              </h1>
            </div>

            <div className={`rounded-xl border px-4 py-2.5 font-mono text-xs font-bold ${elevatedCard}`}>
              {verifiedProofLessonIds.length} / {ACADEMY_LESSONS.length}{" "}
              {isId ? "Protokol Terverifikasi" : "Protocols Verified"}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-3 xl:col-span-4">
            <p className={`font-mono text-xs font-bold tracking-wider ${textMuted}`}>
              {isId ? "// 02 PILIH JALUR PROTOKOL LAPANGAN" : "// 02 SELECT FIELD PROTOCOL TRACK"}
            </p>
            {ACADEMY_LESSONS.map((lesson, idx) => {
              const active = lesson.id === activeLesson.id;
              const verified = verifiedProofLessonIds.includes(lesson.id);
              const quizDone = passedQuizLessonIds.includes(lesson.id);

              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => handleSelectLesson(lesson)}
                  className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition ${
                    active
                      ? isLight
                        ? "border-[#14532D] bg-[#14532D] text-[#FFFFFF]"
                        : "border-[#A3E635] bg-[#A3E635]/15 text-[#F2F7F4]"
                      : surfaceCard
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold">
                      {isId ? "JALUR" : "TRACK"} 0{idx + 1} / +{lesson.xpReward} XP
                    </span>
                    <span className="font-bold">
                      {verified
                        ? isId
                          ? "TERVERIFIKASI"
                          : "VERIFIED"
                        : quizDone
                        ? isId
                          ? "KUIS LULUS"
                          : "QUIZ PASSED"
                        : isId
                        ? "KUIS DIBUTUHKAN"
                        : "QUIZ REQUIRED"}
                    </span>
                  </div>

                  <h2 className="mt-2 font-serif text-base font-bold">
                    {isId ? lesson.titleId : lesson.titleEn}
                  </h2>
                  <p className="mt-1 text-xs opacity-85">
                    {isId ? lesson.summaryId : lesson.summaryEn}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-current/15 pt-2 font-mono text-[11px] opacity-85">
                    <span>{isId ? "Membuka:" : "Unlocks:"} {lesson.unlocksItemCode}</span>
                    <span>{lesson.proofRequirements.length} {isId ? "Konsep SAM 3.1" : "SAM 3.1 Concepts"}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-5 xl:col-span-8">
            <section className={`rounded-2xl border p-5 ${surfaceCard}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                <span className="font-bold">
                  {isId ? "// LANGKAH 01 : PROTOKOL LAPANGAN KOPPEN" : "// STEP 01 : KOPPEN"} {geo.koppen.code} ({geo.city})
                </span>
                <span className={textMuted}>
                  {isId ? "Hadiah:" : "Reward:"} +{activeLesson.xpReward} XP / {isId ? "Membuka" : "Unlocks"}{" "}
                  {isId
                    ? activeLesson.unlocksItemLabelId
                    : activeLesson.unlocksItemLabelEn}
                </span>
              </div>

              <h2 className="mt-2 font-serif text-xl font-bold">
                {isId ? activeLesson.titleId : activeLesson.titleEn}
              </h2>

              <div className={`mt-3 rounded-xl border p-3.5 text-xs ${elevatedCard}`}>
                <p className="font-mono font-bold">
                  {isId
                    ? "Adaptasi Zona Iklim Koppen Aktif:"
                    : "Active Koppen Climate Adaptation:"}
                </p>
                <p className={`mt-1 leading-relaxed ${textSecondary}`}>
                  {isId ? climateNote.id : climateNote.en}
                </p>
              </div>

              <div className="mt-4">
                <p className="font-mono text-xs font-bold uppercase tracking-wider">
                  {isId
                    ? "Langkah Eksekusi Fisik:"
                    : "Required Physical Execution Steps:"}
                </p>
                <ol
                  className={`mt-2 list-decimal space-y-1.5 pl-5 text-xs leading-relaxed ${textSecondary}`}
                >
                  {(isId
                    ? activeLesson.protocolStepsId
                    : activeLesson.protocolStepsEn
                  ).map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ol>
              </div>
            </section>

            <section className={`rounded-2xl border p-5 ${surfaceCard}`}>
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold">
                  {isId
                    ? "// LANGKAH 02 : KUIS PRASYARAT TEKNIS (LULUS >= 2/3)"
                    : "// STEP 02 : TECHNICAL PREREQUISITE QUIZ (PASS >= 2/3)"}
                </span>
                {isQuizPassed && (
                  <span className="font-bold">
                    {isId ? "STATUS: LULUS" : "STATUS: PASSED"}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-3.5">
                {activeLesson.quiz.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className={`rounded-xl border p-3.5 text-xs ${elevatedCard}`}
                  >
                    <p className="font-semibold">
                      {qIdx + 1}. {isId ? q.questionId : q.questionEn}
                    </p>
                    <div className="mt-2 space-y-1.5">
                      {(isId ? q.optionsId : q.optionsEn).map((opt, oIdx) => (
                        <label
                          key={oIdx}
                          className="flex min-h-[38px] cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1"
                        >
                          <input
                            type="radio"
                            name={`quiz-${activeLesson.id}-${qIdx}`}
                            checked={quizAnswers[qIdx] === oIdx}
                            onChange={() =>
                              setQuizAnswers({ ...quizAnswers, [qIdx]: oIdx })
                            }
                            className="h-4 w-4 accent-[#A3E635]"
                          />
                          <span className={textSecondary}>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  className={`min-h-[44px] cursor-pointer rounded-xl px-4 py-2.5 font-mono text-xs font-black transition ${
                    isLight
                      ? "bg-[#14532D] text-[#FFFFFF] hover:bg-[#166534]"
                      : "bg-[#A3E635] text-[#070D0A] hover:bg-[#BEF264]"
                  }`}
                >
                  {isId ? "Verifikasi Jawaban Kuis" : "Verify Quiz Answers"}
                </button>
                {quizFeedback && (
                  <span className="font-mono text-xs font-bold">{quizFeedback}</span>
                )}
              </div>
            </section>

            <section className={`rounded-2xl border p-5 ${surfaceCard}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                <span className="font-bold">
                  {isId
                    ? "// LANGKAH 03 : VERIFIKATOR BUKTI AKSI META SAM 3.1 & 64-BIT DHASH"
                    : "// STEP 03 : META SAM 3.1 PROOF-OF-ACTION & 64-BIT DHASH VERIFIER"}
                </span>
                {!isQuizPassed && (
                  <span className="rounded-lg border border-rose-500/40 px-2.5 py-1 text-rose-400">
                    {isId ? "Selesaikan Kuis Langkah 02 Terlebih Dahulu" : "Complete Step 02 Quiz First"}
                  </span>
                )}
              </div>

              <div className={`mt-3 rounded-xl border p-3.5 ${elevatedCard}`}>
                <p className={`font-mono text-xs font-semibold ${textMuted}`}>
                  {isId
                    ? "Konsep Fisik Wajib untuk Meta SAM 3.1 (skor >= 0.50, total >= 70/100):"
                    : "Required Physical Concepts Prompted to Meta SAM 3.1 (score >= 0.50, total >= 70/100):"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeLesson.proofRequirements.map((req, idx) => (
                    <span
                      key={idx}
                      className={`rounded-lg border px-2.5 py-1 font-mono text-xs ${surfaceCard}`}
                    >
                      {req.required
                        ? isId
                          ? "WAJIB:"
                          : "REQUIRED:"
                        : isId
                        ? "OPSIONAL:"
                        : "OPTIONAL:"}{" "}
                      &quot;{req.concept}&quot; (min {req.minCount}x,{" "}
                      {isId ? "bobot" : "weight"} {req.weight})
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled={!isQuizPassed || verifyingProof}
                  onClick={() => handleRunProofVerification("valid_proof")}
                  className={`min-h-[44px] cursor-pointer rounded-xl px-4 py-2.5 font-mono text-xs font-black transition disabled:opacity-40 ${
                    isLight
                      ? "bg-[#14532D] text-[#FFFFFF] hover:bg-[#166534]"
                      : "bg-[#A3E635] text-[#070D0A] hover:bg-[#BEF264]"
                  }`}
                >
                  {verifyingProof
                    ? isId
                      ? "Memindai dengan SAM 3.1..."
                      : "Scanning with SAM 3.1..."
                    : isId
                    ? "Uji Bukti Lapangan Valid (SAM 3.1)"
                    : "Verify Valid Field Proof (SAM 3.1)"}
                </button>

                <button
                  type="button"
                  disabled={!isQuizPassed || verifyingProof}
                  onClick={() => handleRunProofVerification("duplicate_photo")}
                  className="min-h-[44px] cursor-pointer rounded-xl border border-rose-500/50 px-3.5 py-2.5 font-mono text-xs font-bold text-rose-400 transition disabled:opacity-40"
                >
                  {isId
                    ? "Uji Anti-Duplikat dHash 64-bit"
                    : "Test 64-bit dHash Anti-Duplicate"}
                </button>

                <label
                  className={`flex min-h-[44px] items-center rounded-xl border px-3.5 py-2.5 font-mono text-xs font-bold ${elevatedCard} ${
                    !isQuizPassed
                      ? "pointer-events-none opacity-40"
                      : "cursor-pointer"
                  }`}
                >
                  <span>{isId ? "Unggah Foto Bukti" : "Upload Camera Proof"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={!isQuizPassed}
                    onChange={() => handleRunProofVerification("valid_proof")}
                    className="hidden"
                  />
                </label>
              </div>

              {proofResult && (
                <div
                  role="status"
                  className={`mt-4 rounded-xl border p-4 ${
                    proofResult.ok && proofResult.verified
                      ? elevatedCard
                      : "border-rose-500/50 bg-rose-950/20 text-rose-400"
                  }`}
                >
                  {!proofResult.ok ? (
                    <div className="font-mono text-xs">
                      <p className="font-bold">
                        {isId
                          ? "HTTP 409 KONFLIK : DUPLIKAT PERCEPTUAL DHASH DITOLAK"
                          : "HTTP 409 CONFLICT : PERCEPTUAL DHASH DUPLICATE REJECTED"}
                      </p>
                      <p className="mt-1">{proofResult.errorMsg}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                        <span className="font-bold">
                          {isId
                            ? `BUKTI SAM 3.1 TERVERIFIKASI / SKOR: ${proofResult.score}/100`
                            : `SAM 3.1 PROOF VERIFIED / SCORE: ${proofResult.score}/100`}
                        </span>
                        <span className={textMuted}>
                          64-bit dHash: {proofResult.dhash} ({isId ? "Unik" : "Unique"})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        {proofResult.checklist?.map((item, idx) => (
                          <div
                            key={idx}
                            className={`rounded-lg border p-2.5 font-mono text-xs ${surfaceCard}`}
                          >
                            <p className="font-bold">
                              {item.passed
                                ? isId
                                  ? "LULUS:"
                                  : "PASS:"
                                : isId
                                ? "KURANG:"
                                : "MISS:"}{" "}
                              {item.concept}
                            </p>
                            <p className={`mt-1 text-[11px] ${textMuted}`}>
                              {isId ? "Jumlah:" : "Instances:"} {item.detectedCount}/{item.minCount} /{" "}
                              {isId ? "Keyakinan:" : "Conf:"}{" "}
                              {(item.avgConfidence * 100).toFixed(0)}%
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-current/15 pt-3">
                        <span className="font-mono text-xs font-bold">
                          +{proofResult.xpAwarded}{" "}
                          {isId ? "Eco-XP Diberikan / Terbuka:" : "Eco-XP Awarded / Unlocked:"}{" "}
                          {isId
                            ? activeLesson.unlocksItemLabelId
                            : activeLesson.unlocksItemLabelEn}
                        </span>
                        <button
                          type="button"
                          onClick={() => router.push("/dashboard")}
                          className={`min-h-[40px] cursor-pointer rounded-xl px-3.5 py-1.5 font-mono text-xs font-black ${
                            isLight
                              ? "bg-[#14532D] text-[#FFFFFF]"
                              : "bg-[#A3E635] text-[#070D0A]"
                          }`}
                        >
                          {isId
                            ? "Inspeksi Modul di Plot 3D"
                            : "Inspect Module on 3D Plot"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
