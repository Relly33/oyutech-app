"use client";

import { useState, useCallback } from "react";
import { useLang } from "@/lib/LangContext";

export interface Question {
  id: string;
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation: string;
  hard?: boolean;
}

interface Props {
  questions: Question[];
  onComplete?: (xpEarned: number) => void;
}

type Phase = "answering" | "feedback" | "results";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

function calcXp(hard: boolean, newStreak: number): { base: number; bonus: number } {
  const base = hard ? 30 : 20;
  const bonus = newStreak >= 2 ? 10 : 0;
  return { base, bonus };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label: string;
}) {
  const pct = total === 0 ? 100 : Math.round((current / total) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-indigo-200">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-indigo-500 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function XpBadge({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
      ⭐ +{value} {label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function QuizBlock({ questions, onComplete }: Props) {
  const { t } = useLang();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("answering");
  const [selected, setSelected] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  // XP breakdown for the current question's feedback display
  const [roundXp, setRoundXp] = useState<{ base: number; bonus: number } | null>(null);
  const [newStreakAfter, setNewStreakAfter] = useState(0);

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const handleSelect = useCallback(
    (idx: number) => {
      if (phase !== "answering") return;

      const isCorrect = idx === question.correct;
      const newStreak = isCorrect ? streak + 1 : 0;
      const xp = isCorrect ? calcXp(!!question.hard, newStreak) : { base: 0, bonus: 0 };
      const earned = xp.base + xp.bonus;

      setSelected(idx);
      setPhase("feedback");
      setStreak(newStreak);
      setTotalXp((prev) => prev + earned);
      setCorrectCount((prev) => prev + (isCorrect ? 1 : 0));
      setRoundXp(isCorrect ? xp : null);
      setNewStreakAfter(newStreak);
    },
    [phase, question, streak],
  );

  const handleNext = useCallback(() => {
    if (isLast) {
      setPhase("results");
      onComplete?.(totalXp);
    } else {
      setCurrentIndex((i) => i + 1);
      setPhase("answering");
      setSelected(null);
      setRoundXp(null);
    }
  }, [isLast, totalXp, onComplete]);

  const handleRetry = useCallback(() => {
    setCurrentIndex(0);
    setPhase("answering");
    setSelected(null);
    setStreak(0);
    setTotalXp(0);
    setCorrectCount(0);
    setRoundXp(null);
    setNewStreakAfter(0);
  }, []);

  // ── Results screen ──────────────────────────────────────────────────────────
  if (phase === "results") {
    const scorePct = Math.round((correctCount / questions.length) * 100);
    const medal = scorePct === 100 ? "🏆" : scorePct >= 70 ? "🥈" : "🎯";

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4">
          <h2 className="text-white font-bold text-lg">{t.resultsTitle}</h2>
          <ProgressBar
            current={questions.length}
            total={questions.length}
            label={`${questions.length} / ${questions.length} ${t.questionOf}`}
          />
        </div>

        <div className="p-8 flex flex-col items-center gap-6 text-center">
          <div className="text-6xl">{medal}</div>

          <div className="space-y-1">
            <p className="text-4xl font-bold text-gray-900">{scorePct}%</p>
            <p className="text-gray-500 text-sm">
              {t.scoreLabel}: {correctCount} / {questions.length}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-6 py-4">
            <span className="text-3xl">⭐</span>
            <div className="text-left">
              <p className="text-xs text-amber-500 font-medium">{t.totalXpLabel}</p>
              <p className="text-2xl font-bold text-amber-600">{totalXp} XP</p>
            </div>
          </div>

          {/* Per-question breakdown hint */}
          <div className="w-full grid grid-cols-3 gap-2 text-sm">
            {[
              { label: "Standard", val: "20 XP" },
              { label: "Hard", val: "30 XP" },
              { label: "🔥 Streak", val: "+10 XP" },
            ].map(({ label, val }) => (
              <div key={label} className="bg-gray-50 rounded-xl py-2 px-3">
                <p className="text-gray-400 text-xs">{label}</p>
                <p className="font-bold text-gray-700">{val}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleRetry}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            {t.retryBtn}
          </button>
        </div>
      </div>
    );
  }

  // ── Question + feedback screen ──────────────────────────────────────────────
  const isAnswered = phase === "feedback";
  const isCorrect = selected === question.correct;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-lg">{t.quizTitle}</h2>
          <div className="flex items-center gap-2">
            {streak >= 2 && (
              <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                🔥 {streak}
              </span>
            )}
            <span className="text-indigo-200 text-sm font-medium">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>
        <ProgressBar
          current={currentIndex}
          total={questions.length}
          label={`${currentIndex + 1} / ${questions.length} ${t.questionOf}`}
        />
      </div>

      <div className="p-5 space-y-5">
        {/* Question text */}
        <div className="space-y-2">
          {question.hard && (
            <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
              ⚡ {t.hardBadge} · +30 XP
            </span>
          )}
          <p className="text-gray-900 font-medium text-base leading-relaxed">
            {question.text}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {question.options.map((option, idx) => {
            let style =
              "border border-gray-200 bg-white text-gray-700 hover:border-indigo-400 hover:bg-indigo-50";

            if (isAnswered) {
              if (idx === question.correct) {
                style =
                  "border-2 border-emerald-500 bg-emerald-50 text-emerald-800";
              } else if (idx === selected) {
                style = "border-2 border-red-400 bg-red-50 text-red-700";
              } else {
                style =
                  "border border-gray-100 bg-gray-50 text-gray-400 opacity-60";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={isAnswered}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${style} ${
                  !isAnswered ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span
                  className={`flex-none w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isAnswered && idx === question.correct
                      ? "bg-emerald-500 text-white"
                      : isAnswered && idx === selected
                      ? "bg-red-400 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {OPTION_LABELS[idx]}
                </span>
                <span className="text-sm font-medium">{option}</span>
                {isAnswered && idx === question.correct && (
                  <span className="ml-auto text-emerald-500 text-lg">✓</span>
                )}
                {isAnswered && idx === selected && idx !== question.correct && (
                  <span className="ml-auto text-red-400 text-lg">✗</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback panel */}
        {isAnswered && (
          <div
            className={`rounded-xl p-4 space-y-3 border ${
              isCorrect
                ? "bg-emerald-50 border-emerald-100"
                : "bg-red-50 border-red-100"
            }`}
          >
            {/* Result line */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span
                className={`font-bold text-sm ${
                  isCorrect ? "text-emerald-700" : "text-red-600"
                }`}
              >
                {isCorrect ? `✓ ${t.correctLabel}` : `✗ ${t.wrongLabel}`}
              </span>
              {isCorrect && roundXp && (
                <div className="flex items-center gap-2 flex-wrap">
                  <XpBadge value={roundXp.base} label="XP" />
                  {roundXp.bonus > 0 && (
                    <XpBadge value={roundXp.bonus} label={t.streakBonus} />
                  )}
                </div>
              )}
            </div>

            {/* Streak indicator */}
            {isCorrect && newStreakAfter >= 2 && (
              <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                <span className="text-lg">🔥</span>
                <span>
                  {newStreakAfter} {t.streakMsg}
                </span>
              </div>
            )}

            {/* Explanation */}
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t.explanationLabel}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {question.explanation}
              </p>
            </div>
          </div>
        )}

        {/* Next button */}
        {isAnswered && (
          <button
            onClick={handleNext}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {isLast ? t.resultsTitle + " →" : t.nextBtn + " →"}
          </button>
        )}
      </div>
    </div>
  );
}
