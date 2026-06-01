"use client";

import { useEffect, useState } from "react";
import AppNavbar from "@/components/AppNavbar";
import { useLang } from "@/lib/LangContext";
import { getTotalXP, getStreak, getWeeklyXp, getHeatmapXp, getModuleProgress } from "@/lib/progress";

// ── Radial ring ───────────────────────────────────────────────────────────
function RadialRing({ pct, color, size = 90, label, value }: { pct: number; color: string; size?: number; label: string; value: string }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={5}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ filter: `drop-shadow(0 0 6px ${color}88)`, transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{value}</span>
        </div>
      </div>
      <span className="text-xs text-center" style={{ color: "#aaaaaa" }}>{label}</span>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
  return (
    <div className="flex-1 rounded-2xl p-4" style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs mt-0.5" style={{ color: "#aaaaaa" }}>{label}</div>
    </div>
  );
}

// ── Weekly bar chart ──────────────────────────────────────────────────────
function WeeklyChart({ data, days }: { data: number[]; days: string[] }) {
  const max = Math.max(...data, 1);
  const todayIdx = new Date().getDay(); // 0=Sun…6=Sat, align to Mon-Sun
  const adjustedToday = (todayIdx + 6) % 7; // Mon=0 … Sun=6

  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((val, i) => {
        const height = Math.max((val / max) * 100, val > 0 ? 6 : 3);
        const isToday = i === adjustedToday;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${height}%`,
                background: isToday ? "#7F77DD" : "rgba(127,119,221,0.3)",
                boxShadow: isToday ? "0 0 8px rgba(127,119,221,0.5)" : "none",
                minHeight: 3,
              }}
            />
            <span className="text-[10px]" style={{ color: isToday ? "#7F77DD" : "#555555" }}>
              {days[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Activity heatmap ──────────────────────────────────────────────────────
function ActivityHeatmap({ data, days }: { data: number[]; days: string[] }) {
  const max = Math.max(...data, 1);
  const weeks = 8;

  return (
    <div>
      {/* Day headers */}
      <div className="grid mb-1" style={{ gridTemplateColumns: `repeat(7,1fr)`, gap: 3 }}>
        {days.map((d) => (
          <span key={d} className="text-[9px] text-center" style={{ color: "#555555" }}>{d}</span>
        ))}
      </div>
      {/* 8 rows × 7 cols */}
      {Array.from({ length: weeks }).map((_, wi) => (
        <div key={wi} className="grid mb-1" style={{ gridTemplateColumns: `repeat(7,1fr)`, gap: 3 }}>
          {Array.from({ length: 7 }).map((_, di) => {
            const idx = wi * 7 + di;
            const val = data[idx] ?? 0;
            const opacity = val > 0 ? 0.2 + (val / max) * 0.8 : 0.06;
            return (
              <div
                key={di}
                className="rounded-sm"
                style={{
                  height: 10,
                  background: val > 0 ? `rgba(127,119,221,${opacity})` : "rgba(255,255,255,0.04)",
                  border: `1px solid rgba(255,255,255,${val > 0 ? 0.12 : 0.04})`,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Module progress row ───────────────────────────────────────────────────
function ModuleRow({
  title, color, xp, maxXp, quizDone, graphUsed, exampleRead, t,
}: {
  title: string; color: string; xp: number; maxXp: number;
  quizDone: boolean; graphUsed: boolean; exampleRead: boolean;
  t: Record<string, unknown>;
}) {
  const pct = Math.min(Math.round((xp / Math.max(maxXp, 1)) * 100), 100);
  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-white text-sm">{title}</span>
        <span className="text-xs" style={{ color: "#aaaaaa" }}>{xp}/{maxXp} XP</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="flex gap-2 flex-wrap">
        {graphUsed   && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}22`, color }}>{t.graphActivity as string}</span>}
        {quizDone    && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}22`, color }}>{t.testActivity as string}</span>}
        {exampleRead && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}22`, color }}>{t.exampleActivity as string}</span>}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function ProgressPage() {
  const { t } = useLang();
  const [totalXp, setTotalXp]       = useState(0);
  const [streak, setStreak]         = useState(0);
  const [weeklyData, setWeekly]     = useState<number[]>(Array(7).fill(0));
  const [heatData, setHeat]         = useState<number[]>(Array(56).fill(0));
  const [fnProg, setFnProg]         = useState({ xp: 0, quizDone: false, graphUsed: false, exampleRead: false });

  useEffect(() => {
    setTotalXp(getTotalXP());
    setStreak(getStreak());
    setWeekly(getWeeklyXp());
    setHeat(getHeatmapXp());
    const p = getModuleProgress("fn-3");
    setFnProg({ xp: p.xp, quizDone: p.quizDone, graphUsed: p.graphUsed, exampleRead: p.exampleRead });
  }, []);

  const moduleDone = fnProg.quizDone ? 1 : 0;
  const overallPct = Math.min(Math.round((totalXp / 500) * 100), 100);

  const days = [...t.daysHeader] as string[];

  return (
    <div className="min-h-screen" style={{ background: "#0f0f1a" }}>
      <AppNavbar backHref="/" backLabel={t.backHome as string} />

      <main className="max-w-2xl mx-auto px-4 pb-16 pt-6 space-y-6">
        <h1 className="text-2xl font-bold text-white fade-up">{t.progressTitle as string}</h1>

        {/* Radial rings */}
        <div className="rounded-2xl p-5 fade-up" style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.07)", animationDelay: "0.04s" }}>
          <div className="flex justify-around">
            <RadialRing pct={overallPct} color="#7F77DD" value={`${overallPct}%`} label={t.overallLabel as string} />
            <RadialRing pct={moduleDone * 25} color="#1D9E75" value={`${moduleDone}/4`} label={t.completedModules as string} />
            <RadialRing pct={Math.min(streak * 14, 100)} color="#D85A30" value={`${streak}d`} label={t.streakDays as string} />
          </div>
        </div>

        {/* Stat cards */}
        <div className="flex gap-3 fade-up" style={{ animationDelay: "0.08s" }}>
          <StatCard icon="⭐" value={totalXp} label={t.totalXpLabel as string} color="#fbbf24" />
          <StatCard icon="✅" value={moduleDone} label={t.completedModules as string} color="#1D9E75" />
          <StatCard icon="🔥" value={streak} label={t.streakDays as string} color="#D85A30" />
        </div>

        {/* Weekly chart */}
        <div className="rounded-2xl p-5 fade-up" style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.07)", animationDelay: "0.12s" }}>
          <h2 className="text-sm font-bold text-white mb-4">{t.weeklyActivity as string}</h2>
          <WeeklyChart data={weeklyData} days={days} />
        </div>

        {/* Heatmap */}
        <div className="rounded-2xl p-5 fade-up" style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.07)", animationDelay: "0.16s" }}>
          <h2 className="text-sm font-bold text-white mb-4">{t.activityMap as string}</h2>
          <ActivityHeatmap data={heatData} days={days} />
        </div>

        {/* Module progress */}
        <div className="space-y-3 fade-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-sm font-bold text-white">{t.moduleProgressTitle as string}</h2>
          <ModuleRow
            title="Функц ба График"
            color="#7F77DD"
            xp={fnProg.xp}
            maxXp={470}
            quizDone={fnProg.quizDone}
            graphUsed={fnProg.graphUsed}
            exampleRead={fnProg.exampleRead}
            t={t as unknown as Record<string, unknown>}
          />
          {(["Дифференциал тооцоолол", "Интеграл тооцоолол", "Тригонометр"] as const).map((title, i) => (
            <ModuleRow
              key={title}
              title={title}
              color={["#1D9E75", "#BA7517", "#D85A30"][i]}
              xp={0} maxXp={500}
              quizDone={false} graphUsed={false} exampleRead={false}
              t={t as unknown as Record<string, unknown>}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
