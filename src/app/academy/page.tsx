"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import StudioShell from "@/components/ui/StudioShell";
import { useVerdaraStore } from "@/store/useVerdaraStore";
import { getDailyQuizPack, type DailyQuizPack, type QuizQuestion } from "@/lib/academy/daily-quiz";

export default function AcademyDailyQuizPage() {
  const {
    locale,
    theme,
    geo,
    passedQuizLessonIds,
    markQuizPassed,
  } = useVerdaraStore();

  const isId = locale === "id";
  const isLight = theme === "light";

  // Load today's deterministically seeded quiz pack
  const todayQuizPack = useMemo<DailyQuizPack>(() => {
    return getDailyQuizPack(new Date());
  }, []);

  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [streakCount, setStreakCount] = useState<number>(1);
  const [completedToday, setCompletedToday] = useState<boolean>(false);
  const [savedScore, setSavedScore] = useState<number | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<string>("");

  // Sync daily state and local storage streak
  useEffect(() => {
    try {
      const savedDate = localStorage.getItem("verdara_daily_quiz_date");
      const savedStreak = localStorage.getItem("verdara_daily_quiz_streak");
      const storedScore = localStorage.getItem("verdara_daily_quiz_score");

      if (savedDate === todayQuizPack.dateStr) {
        setCompletedToday(true);
        if (storedScore !== null) {
          setSavedScore(parseInt(storedScore, 10));
          setIsSubmitted(true);
        }
      }

      if (savedStreak) {
        setStreakCount(parseInt(savedStreak, 10));
      }
    } catch {
      // Local storage fallback
    }
  }, [todayQuizPack.dateStr]);

  // Real-time Countdown Timer until midnight (00:00:00 local time)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const diffMs = tomorrow.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeUntilReset("00:00:00");
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeUntilReset(
        `${String(hours).padStart(2, "0")}j ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}d`
      );
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentQ: QuizQuestion = todayQuizPack.questions[activeQuestionIdx]!;

  const handleSelectOption = (optionIdx: number) => {
    if (isSubmitted && completedToday) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [activeQuestionIdx]: optionIdx,
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    todayQuizPack.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });
    return {
      correctCount: correct,
      total: todayQuizPack.totalQuestions,
      xp: correct * 20,
      passed: correct >= 3,
    };
  };

  const handleSubmit = () => {
    const scoreResult = calculateScore();
    setIsSubmitted(true);
    setSavedScore(scoreResult.xp);

    try {
      localStorage.setItem("verdara_daily_quiz_date", todayQuizPack.dateStr);
      localStorage.setItem("verdara_daily_quiz_score", String(scoreResult.xp));

      if (scoreResult.passed) {
        const nextStreak = streakCount + 1;
        setStreakCount(nextStreak);
        localStorage.setItem("verdara_daily_quiz_streak", String(nextStreak));
        markQuizPassed(`daily-${todayQuizPack.dateStr}`);
        setCompletedToday(true);
      }
    } catch {
      // Storage fallback
    }
  };

  const handleRetakePractice = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setActiveQuestionIdx(0);
  };

  const currentScore = calculateScore();

  return (
    <StudioShell>
      <div className="mx-auto max-w-4xl space-y-6 pb-20">
        {/* DAILY QUIZ HEADER BANNER */}
        <header
          className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 transition-colors ${
            isLight
              ? "border-black/10 bg-gradient-to-br from-white via-[#faf9f5] to-[#f4f1ea] text-[#111] shadow-sm"
              : "border-white/10 bg-gradient-to-br from-[#121418] via-[#161a20] to-[#0c0e11] text-white shadow-xl"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] font-semibold tracking-wider text-[#1e9e5a] dark:text-[#c6f432]">
                <span className="h-2 w-2 rounded-full bg-[#1e9e5a] dark:bg-[#c6f432] animate-pulse" />
                <span>
                  {isId ? "TANTANGAN AKADEMI IKLIM HARIAN" : "DAILY CLIMATE ACADEMY CHALLENGE"}
                </span>
                <span className="opacity-40">|</span>
                <span className="opacity-80">
                  {isId ? todayQuizPack.displayDateId : todayQuizPack.displayDateEn}
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                {isId
                  ? "Kuis Harian Sains & Teknik Lingkungan"
                  : "Daily Science & Eco-Engineering Quiz"}
              </h1>
              <p
                className={`mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed ${
                  isLight ? "text-[#555]" : "text-[#aaa]"
                }`}
              >
                {isId
                  ? "Setiap hari pada pukul 00:00, 5 pertanyaan baru dipilih dan diacak secara deterministik seputar tenaga surya NREL, hidrologi air hujan, biopori tanah, model AI Meta, dan ekonomi sirkular."
                  : "Every day at midnight, 5 fresh questions are deterministically selected and shuffled covering NREL solar, rainwater hydrology, biopores, Meta AI models, and circular economy."}
              </p>
            </div>

            {/* STREAK & TIMER PILL */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div
                className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 font-mono text-xs ${
                  isLight
                    ? "border-amber-300 bg-amber-50/80 text-amber-900"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                }`}
              >
                <span className="text-base" role="img" aria-label="streak fire">🔥</span>
                <div>
                  <div className="font-bold text-[13px]">
                    {streakCount} {isId ? "Hari" : "Days"}
                  </div>
                  <div className="text-[10px] opacity-75">
                    {isId ? "Streak Harian" : "Daily Streak"}
                  </div>
                </div>
              </div>

              <div
                className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 font-mono text-xs ${
                  isLight
                    ? "border-black/10 bg-black/[0.03] text-[#444]"
                    : "border-white/10 bg-white/[0.04] text-[#ccc]"
                }`}
              >
                <span className="text-base" role="img" aria-label="clock">⏳</span>
                <div>
                  <div className="font-bold text-[13px] tabular-nums text-[#1e9e5a] dark:text-[#c6f432]">
                    {timeUntilReset || "--:--:--"}
                  </div>
                  <div className="text-[10px] opacity-75">
                    {isId ? "Reset Kuis Baru" : "Next Quiz Reset"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PROGRESS BAR STRIP */}
          <div className="mt-6">
            <div className="flex items-center justify-between font-mono text-[11px] opacity-70 mb-2">
              <span>
                {isId ? "Progres Soal" : "Question Progress"}: {activeQuestionIdx + 1} / {todayQuizPack.totalQuestions}
              </span>
              <span>
                {Object.keys(selectedAnswers).length} / {todayQuizPack.totalQuestions} {isId ? "Terjawab" : "Answered"}
              </span>
            </div>
            <div
              className={`h-2 w-full overflow-hidden rounded-full ${
                isLight ? "bg-black/10" : "bg-white/10"
              }`}
            >
              <div
                className="h-full bg-gradient-to-r from-[#1e9e5a] via-[#c6f432] to-[#2a9dbd] transition-all duration-300"
                style={{
                  width: `${((activeQuestionIdx + 1) / todayQuizPack.totalQuestions) * 100}%`,
                }}
              />
            </div>
          </div>
        </header>

        {/* RESULTS SCREEN (IF SUBMITTED) */}
        {isSubmitted ? (
          <div
            className={`space-y-6 rounded-3xl border p-6 sm:p-8 transition-colors ${
              isLight
                ? "border-black/10 bg-white text-[#111] shadow-sm"
                : "border-white/10 bg-[#14161a] text-white shadow-xl"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-current/10 pb-6">
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-semibold ${
                    currentScore.passed
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {currentScore.passed
                    ? isId
                      ? "LULUS TANTANGAN HARIAN"
                      : "DAILY CHALLENGE PASSED"
                    : isId
                    ? "PERLU EVALUASI ULANG"
                    : "NEEDS REVIEW"}
                </span>
                <h2 className="mt-2 text-2xl sm:text-3xl font-black">
                  {isId ? "Hasil Kuis Harian Anda" : "Your Daily Quiz Results"}
                </h2>
                <p className="mt-1 text-xs sm:text-sm opacity-70">
                  {isId
                    ? `${currentScore.correctCount} dari ${currentScore.total} pertanyaan dijawab dengan benar.`
                    : `${currentScore.correctCount} out of ${currentScore.total} questions answered correctly.`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono">
                  <div className="text-3xl sm:text-4xl font-black text-[#1e9e5a] dark:text-[#c6f432] tabular-nums">
                    +{currentScore.xp} XP
                  </div>
                  <div className="text-[11px] opacity-60">
                    {isId ? "Akumulasi Poin" : "Points Earned"}
                  </div>
                </div>
              </div>
            </div>

            {/* DETAILED EDUCATIONAL QUESTION REVIEW */}
            <div className="space-y-4 pt-2">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider opacity-60">
                {isId ? "// PEMBAHASAN LENGKAP TIAP SOAL" : "// DETAILED QUESTION REVIEW"}
              </h3>

              {todayQuizPack.questions.map((q, idx) => {
                const userAnsIdx = selectedAnswers[idx];
                const isCorrect = userAnsIdx === q.correctIndex;
                const options = isId ? q.optionsId : q.optionsEn;

                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition-colors ${
                      isCorrect
                        ? isLight
                          ? "border-emerald-500/30 bg-emerald-50/40"
                          : "border-emerald-500/30 bg-emerald-950/20"
                        : isLight
                        ? "border-rose-500/30 bg-rose-50/40"
                        : "border-rose-500/30 bg-rose-950/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 font-mono text-[11px] mb-2">
                      <span className="font-semibold opacity-70">
                        {isId ? `Soal ${idx + 1}` : `Question ${idx + 1}`} · {isId ? q.categoryLabelId : q.categoryLabelEn}
                      </span>
                      <span
                        className={`font-bold ${
                          isCorrect
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-rose-700 dark:text-rose-400"
                        }`}
                      >
                        {isCorrect ? (isId ? "✓ Benar (+20 XP)" : "✓ Correct (+20 XP)") : (isId ? "✗ Kurang Tepat" : "✗ Incorrect")}
                      </span>
                    </div>

                    <p className="font-medium text-sm sm:text-base leading-snug">
                      {isId ? q.questionId : q.questionEn}
                    </p>

                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="font-semibold opacity-60 shrink-0">
                          {isId ? "Jawaban Anda:" : "Your Answer:"}
                        </span>
                        <span
                          className={
                            isCorrect
                              ? "text-emerald-700 dark:text-emerald-400 font-medium"
                              : "text-rose-700 dark:text-rose-400 font-medium"
                          }
                        >
                          {userAnsIdx !== undefined ? options[userAnsIdx] : (isId ? "Tidak dijawab" : "Unanswered")}
                        </span>
                      </div>

                      {!isCorrect && (
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                            {isId ? "Kunci Jawaban:" : "Correct Answer:"}
                          </span>
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            {options[q.correctIndex]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* SCIENTIFIC EXPLANATION */}
                    <div
                      className={`mt-3 rounded-xl p-3 text-xs leading-relaxed border ${
                        isLight
                          ? "border-black/[0.08] bg-black/[0.02] text-[#444]"
                          : "border-white/[0.08] bg-white/[0.03] text-[#bbb]"
                      }`}
                    >
                      <strong className="font-mono text-[11px] block text-[#1e9e5a] dark:text-[#c6f432] mb-1">
                        {isId ? "Dasar Sains & Rekayasa:" : "Scientific & Engineering Rationale:"}
                      </strong>
                      {isId ? q.explanationId : q.explanationEn}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-current/10">
              <button
                type="button"
                onClick={handleRetakePractice}
                className={`rounded-full px-5 py-2.5 font-mono text-xs font-semibold transition border cursor-pointer ${
                  isLight
                    ? "border-black/20 hover:bg-black/5 text-[#333]"
                    : "border-white/20 hover:bg-white/5 text-[#ccc]"
                }`}
              >
                {isId ? "Latihan Ulang Hari Ini" : "Practice Questions Again"}
              </button>

              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-[#080808] dark:bg-[#c6f432] text-white dark:text-[#080808] px-6 py-2.5 font-mono text-xs font-bold transition hover:opacity-90"
                >
                  {isId ? "Kembali ke Studio 3D →" : "Back to 3D Studio →"}
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE QUESTION CARD */
          <div
            className={`rounded-3xl border p-6 sm:p-8 transition-colors ${
              isLight
                ? "border-black/10 bg-white text-[#111] shadow-sm"
                : "border-white/10 bg-[#14161a] text-white shadow-xl"
            }`}
          >
            {/* QUESTION HEADER META */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-current/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#1e9e5a]/10 dark:bg-[#c6f432]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#1e9e5a] dark:text-[#c6f432]">
                  {isId ? currentQ.categoryLabelId : currentQ.categoryLabelEn}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium border ${
                    currentQ.difficulty === "Fundamental"
                      ? "border-sky-500/30 text-sky-600 dark:text-sky-400"
                      : currentQ.difficulty === "Intermediate"
                      ? "border-amber-500/30 text-amber-600 dark:text-amber-400"
                      : "border-purple-500/30 text-purple-600 dark:text-purple-400"
                  }`}
                >
                  {currentQ.difficulty}
                </span>
              </div>

              <span className="font-mono text-xs opacity-60">
                {isId ? "Soal" : "Question"} {activeQuestionIdx + 1} {isId ? "dari" : "of"} {todayQuizPack.totalQuestions}
              </span>
            </div>

            {/* QUESTION TEXT */}
            <div className="py-6">
              <h2 className="text-lg sm:text-xl font-bold leading-relaxed">
                {isId ? currentQ.questionId : currentQ.questionEn}
              </h2>
            </div>

            {/* 4 MULTIPLE CHOICE OPTIONS */}
            <div className="space-y-3">
              {(isId ? currentQ.optionsId : currentQ.optionsEn).map((optionText, optIdx) => {
                const isSelected = selectedAnswers[activeQuestionIdx] === optIdx;
                const letter = ["A", "B", "C", "D"][optIdx];

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`flex w-full cursor-pointer items-start gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? isLight
                          ? "border-[#1e9e5a] bg-[#1e9e5a]/10 text-[#111] shadow-xs"
                          : "border-[#c6f432] bg-[#c6f432]/15 text-white shadow-[0_0_15px_rgba(198,244,50,0.1)]"
                        : isLight
                        ? "border-black/10 bg-black/[0.015] hover:bg-black/[0.04] text-[#222]"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-[#eee]"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold transition-colors ${
                        isSelected
                          ? "bg-[#1e9e5a] text-white dark:bg-[#c6f432] dark:text-[#080808]"
                          : isLight
                          ? "bg-black/10 text-[#555]"
                          : "bg-white/10 text-[#aaa]"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-sm sm:text-[15px] leading-relaxed pt-0.5">
                      {optionText}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* BOTTOM STEP CONTROLS */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-current/10 pt-5">
              <button
                type="button"
                disabled={activeQuestionIdx === 0}
                onClick={() => setActiveQuestionIdx((prev) => Math.max(0, prev - 1))}
                className={`rounded-full px-5 py-2.5 font-mono text-xs font-semibold transition border cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                  isLight
                    ? "border-black/15 text-[#333] hover:bg-black/5"
                    : "border-white/15 text-[#ccc] hover:bg-white/5"
                }`}
              >
                ← {isId ? "Sebelumnya" : "Previous"}
              </button>

              <div className="flex items-center gap-2">
                {activeQuestionIdx < todayQuizPack.totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveQuestionIdx((prev) =>
                        Math.min(todayQuizPack.totalQuestions - 1, prev + 1)
                      )
                    }
                    className="rounded-full bg-[#080808] dark:bg-[#c6f432] text-white dark:text-[#080808] px-6 py-2.5 font-mono text-xs font-bold transition hover:opacity-90 cursor-pointer"
                  >
                    {isId ? "Selanjutnya →" : "Next →"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={Object.keys(selectedAnswers).length < todayQuizPack.totalQuestions}
                    className="rounded-full bg-[#1e9e5a] text-white px-7 py-2.5 font-mono text-xs font-bold transition hover:bg-[#168249] cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isId ? "Kirim Jawaban Kuis Harian ✓" : "Submit Daily Answers ✓"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </StudioShell>
  );
}
