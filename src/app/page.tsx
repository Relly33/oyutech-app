"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppNavbar from "@/components/AppNavbar";
import { useLang } from "@/lib/LangContext";
import { getTotalXP, getStreak, getModuleProgress } from "@/lib/progress";

const MODULES = [
  {
    id: "fn",
    lessonId: "fn-3",
    emoji: "📈",
    titleMn: "Функц ба График",
    titleEn: "Functions & Graphs",
    descMn: "Квадрат, шугаман, абсолют функцүүдийн графийн хувирал",
    descEn: "Transformations of quadratic, linear, and absolute value functions",
    tags: ["Функц", "График", "Слайдер"],
    color: "#7F77DD",
    totalLessons: 4,
    doneLessons: 2,
    locked: false,
  },
  {
    id: "calc",
    lessonId: "",
    emoji: "∂",
    titleMn: "Дифференциал",
    titleEn: "Calculus",
    descMn: "Уламжлал, дифференциал, функцийн өөрчлөлтийн хурд",
    descEn: "Derivatives, differentials, rate of change",
    tags: ["Уламжлал", "Дифференциал"],
    color: "#1D9E75",
    totalLessons: 4,
    doneLessons: 0,
    locked: true,
  },
  {
    id: "int",
    lessonId: "",
    emoji: "∫",
    titleMn: "Интеграл",
    titleEn: "Integration",
    descMn: "Тодорхой ба тодорхойгүй интеграл, талбайн тооцоолол",
    descEn: "Definite and indefinite integrals, area calculations",
    tags: ["Интеграл", "Талбай"],
    color: "#BA7517",
    totalLessons: 4,
    doneLessons: 0,
    locked: true,
  },
  {
    id: "trig",
    lessonId: "",
    emoji: "〜",
    titleMn: "Тригонометр",
    titleEn: "Trigonometry",
    descMn: "Синус, косинус, тангенс функцүүд ба тэдгээрийн шинж чанар",
    descEn: "Sine, cosine, tangent functions and their properties",
    tags: ["Sin", "Cos", "Tan"],
    color: "#D85A30",
    totalLessons: 4,
    doneLessons: 0,
    locked: true,
  },
];

function StatCard({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
  return (
    <div className="flex-1 rounded-2xl p-4 flex flex-col gap-1" style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.07)" }}>
      <span className="text-2xl">{icon}</span>
      <span className="text-2xl font-bold" style={{ color }}>{value}</span>
      <span className="text-xs" style={{ color: "#aaaaaa" }}>{label}</span>
    </div>
  );
}

type Filter = "all" | "active" | "done";

export default function HomePage() {
  const { t, lang } = useLang();
  const [filter, setFilter] = useState<Filter>("all");
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    setXp(getTotalXP());
    setStreak(getStreak());
    const fnProg = getModuleProgress("fn-3");
    setDoneCount(fnProg.quizDone ? 1 : 0);
  }, []);

  const filtered = MODULES.filter((m) => {
    if (filter === "active") return !m.locked && m.doneLessons < m.totalLessons;
    if (filter === "done") return m.doneLessons === m.totalLessons;
    return true;
  });

  const filters: { key: Filter; label: string }[] = [
    { key: "all",    label: t.filterAll },
    { key: "active", label: t.filterActive },
    { key: "done",   label: t.filterDone },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0f0f1a" }}>
      <AppNavbar />

      <main className="max-w-2xl mx-auto px-4 pb-16 pt-6">
        {/* Greeting */}
        <div className="mb-6 fade-up">
          <h1 className="text-2xl font-bold text-white">{t.greeting}</h1>
          <p className="mt-1" style={{ color: "#aaaaaa" }}>{t.greetingSub}</p>
        </div>

        {/* Stat cards */}
        <div className="flex gap-3 mb-6 fade-up" style={{ animationDelay: "0.05s" }}>
          <StatCard icon="⭐" value={xp} label={t.totalXpLabel} color="#fbbf24" />
          <StatCard icon="🔥" value={streak} label={t.streakLabel} color="#f97316" />
          <StatCard icon="✅" value={doneCount} label={t.modulesLabel} color="#7F77DD" />
        </div>

        {/* Daily challenge */}
        <div
          className="rounded-2xl p-5 mb-6 flex items-center justify-between gap-4 fade-up"
          style={{
            background: "linear-gradient(135deg, rgba(83,74,183,0.35), rgba(127,119,221,0.15))",
            border: "1px solid rgba(127,119,221,0.3)",
            animationDelay: "0.1s",
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">⚡</span>
              <span className="font-bold text-white text-sm">{t.dailyChallengeTitle}</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(251,191,36,0.2)", color: "#fbbf24" }}
              >
                +50 XP
              </span>
            </div>
            <p className="text-sm" style={{ color: "#aaaaaa" }}>{t.dailyChallengeDesc}</p>
          </div>
          <Link
            href="/courses"
            className="flex-none text-sm font-bold px-4 py-2 rounded-xl text-white"
            style={{ background: "linear-gradient(135deg,#534AB7,#7F77DD)" }}
          >
            {t.startChallenge}
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 fade-up" style={{ animationDelay: "0.12s" }}>
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="px-4 py-1.5 rounded-xl text-sm font-medium transition-colors"
              style={
                filter === key
                  ? { background: "#7F77DD", color: "#fff" }
                  : { background: "rgba(255,255,255,0.06)", color: "#aaaaaa" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Module cards */}
        <div className="space-y-3">
          {filtered.map((mod, i) => {
            const title = lang === "mn" ? mod.titleMn : mod.titleEn;
            const desc  = lang === "mn" ? mod.descMn  : mod.descEn;
            const pct   = Math.round((mod.doneLessons / mod.totalLessons) * 100);

            return (
              <div
                key={mod.id}
                className="rounded-2xl p-5 fade-up"
                style={{
                  background: "#13131f",
                  border: "1px solid rgba(255,255,255,0.07)",
                  animationDelay: `${0.14 + i * 0.06}s`,
                }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold flex-none"
                      style={{ background: `${mod.color}22` }}
                    >
                      {mod.emoji}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">{title}</h3>
                      <p className="text-xs mt-0.5" style={{ color: "#aaaaaa" }}>{mod.doneLessons}/{mod.totalLessons} {t.lessonsLabel}</p>
                    </div>
                  </div>
                  {mod.locked && (
                    <span className="text-xs px-2 py-0.5 rounded-full flex-none" style={{ background: "rgba(255,255,255,0.06)", color: "#555555" }}>
                      🔒
                    </span>
                  )}
                </div>

                <p className="text-sm mb-3 leading-relaxed" style={{ color: "#aaaaaa" }}>{desc}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mod.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${mod.color}22`, color: mod.color }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: mod.locked ? "rgba(255,255,255,0.12)" : mod.color }}
                  />
                </div>

                {/* CTA */}
                {mod.locked ? (
                  <div className="text-sm font-medium" style={{ color: "#555555" }}>{t.lockedLabel}</div>
                ) : (
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-white"
                    style={{ background: `linear-gradient(135deg,${mod.color}cc,${mod.color})` }}
                  >
                    {mod.doneLessons > 0 ? t.continueBtn : t.startBtn}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
