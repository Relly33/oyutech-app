"use client";

import { useState } from "react";
import Link from "next/link";
import AppNavbar from "@/components/AppNavbar";
import { useLang } from "@/lib/LangContext";
import { GRADE11_MODULES, GRADE12_MODULES, getLessonState, type Lesson } from "@/lib/lessons";

type NodeState = "completed" | "unlocked";
const NODE_OFFSETS = [0, 80, -60, 40, 60, -40];

// ── Bottom sheet ──────────────────────────────────────────────────────────────
function BottomSheet({ lesson, color, state, onClose }: {
  lesson: Partial<Lesson>; color: string; state: NodeState; onClose: () => void;
}) {
  const { t } = useLang();
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 fade-in" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 slide-up max-w-2xl mx-auto"
           style={{ background:"#13131f", border:"1px solid rgba(255,255,255,0.1)" }}>
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background:"rgba(255,255,255,0.2)" }} />
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-none"
               style={{ background:`${color}22`, color }}>
            {state === "completed" ? "✓" : "▶"}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{lesson.title}</h3>
            <p className="text-sm" style={{ color:"#aaaaaa" }}>{lesson.desc ?? ""}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[{ icon:"⭐", val:`${lesson.totalXp ?? 0} XP` },{ icon:"⏱", val:lesson.duration ?? "—" },{ icon:"❓", val:"2 асуулт" }].map(({ icon, val }) => (
            <div key={val} className="rounded-xl p-3 text-center" style={{ background:"rgba(255,255,255,0.05)" }}>
              <div className="text-xl">{icon}</div>
              <div className="text-sm font-semibold text-white">{val}</div>
            </div>
          ))}
        </div>
        {lesson.id && (
          <Link href={`/lesson/${lesson.id}`}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-bold text-base"
            style={{ background:`linear-gradient(135deg,${color}cc,${color})`, boxShadow:`0 0 24px ${color}44` }}>
            {state === "completed" ? "Давтах →" : (t.startLesson as string)}
          </Link>
        )}
      </div>
    </>
  );
}

// ── Node ──────────────────────────────────────────────────────────────────────
function LessonNode({ lesson, state, color, offset, onClick }: {
  lesson: Partial<Lesson>; state: NodeState; color: string; offset: number; onClick: () => void;
}) {
  const c = state === "completed";
  const nodeStyle: React.CSSProperties = c
    ? { background:color, boxShadow:`0 0 20px ${color}66`, border:`2px solid ${color}` }
    : { background:`${color}22`, border:`2px solid ${color}`, boxShadow:`0 0 16px ${color}44` };
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2" style={{ transform:`translateX(${offset}px)` }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold transition-transform active:scale-95" style={nodeStyle}>
        {c ? "✓" : <div className="w-3 h-3 rounded-full bg-white" />}
      </div>
      <span className="text-xs font-medium text-center max-w-[80px] leading-tight" style={{ color:"#aaaaaa" }}>
        {lesson.title}
      </span>
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CoursesPage() {
  const { t, lang } = useLang();
  const [grade, setGrade]           = useState<"11"|"12">("11");
  const [activeMod, setActiveMod]   = useState(0);
  const [sheet, setSheet]           = useState<{ lesson: Partial<Lesson>; color: string; state: NodeState } | null>(null);

  const modules     = grade === "11" ? GRADE11_MODULES : GRADE12_MODULES;
  const mod         = modules[Math.min(activeMod, modules.length - 1)];
  const completedN  = mod.lessons.filter((l) => getLessonState(l.id) === "completed").length;
  const levelPct    = Math.round((completedN / mod.lessons.length) * 100);

  // Reset module index when switching grades
  const switchGrade = (g: "11"|"12") => { setGrade(g); setActiveMod(0); };

  const totalG11    = GRADE11_MODULES.reduce((s, m) => s + m.lessons.length, 0);
  const totalG12    = GRADE12_MODULES.reduce((s, m) => s + m.lessons.length, 0);
  const completedAll= [...GRADE11_MODULES, ...GRADE12_MODULES]
    .flatMap((m) => m.lessons).filter((l) => getLessonState(l.id) === "completed").length;

  return (
    <div className="min-h-screen" style={{ background:"#0f0f1a" }}>
      <AppNavbar backHref="/" backLabel={t.backHome as string} />

      {/* Grade tabs */}
      <div className="max-w-5xl mx-auto px-4 pt-5 flex gap-2">
        {(["11","12"] as const).map((g) => (
          <button key={g} onClick={() => switchGrade(g)}
            className="px-5 py-2 rounded-xl text-sm font-bold transition-colors"
            style={ grade === g
              ? { background:"#7F77DD", color:"#fff" }
              : { background:"rgba(255,255,255,0.06)", color:"#aaaaaa" } }>
            {lang === "mn" ? `${g}-р анги` : `Grade ${g}`}
          </button>
        ))}
        <div className="ml-auto text-xs flex items-center" style={{ color:"#555555" }}>
          {completedAll}/{totalG11 + totalG12} {lang === "mn" ? "хичээл" : "lessons"}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col gap-3 flex-none"
               style={{ width:240, position:"sticky", top:80, alignSelf:"flex-start" }}>
          {/* Overall progress card */}
          <div className="rounded-2xl p-4" style={{ background:"#13131f", border:"1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                   style={{ background:"linear-gradient(135deg,#534AB7,#7F77DD)" }}>О</div>
              <div>
                <p className="text-xs font-bold text-white">{t.siteName as string}</p>
                <p className="text-xs" style={{ color:"#aaaaaa" }}>{lang === "mn" ? `${grade}-р анги` : `Grade ${grade}`}</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs" style={{ color:"#aaaaaa" }}>
                <span>{t.overallProgress as string}</span>
                <span style={{ color:"#7F77DD" }}>{completedAll}/{totalG11+totalG12}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full" style={{ width:`${Math.round(completedAll/(totalG11+totalG12)*100)}%`, background:"#7F77DD" }} />
              </div>
            </div>
          </div>

          {/* Module list */}
          <div className="rounded-2xl overflow-hidden" style={{ background:"#13131f", border:"1px solid rgba(255,255,255,0.07)" }}>
            {modules.map((m, i) => {
              const done = m.lessons.filter((l) => getLessonState(l.id) === "completed").length;
              const active = i === Math.min(activeMod, modules.length - 1);
              return (
                <button key={m.id} onClick={() => setActiveMod(i)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={{
                    background: active ? `${m.color}18` : "transparent",
                    borderLeft: active ? `3px solid ${m.color}` : "3px solid transparent",
                    borderBottom: i < modules.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-none"
                       style={{ background:`${m.color}22`, color:m.color }}>{m.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{m.name}</p>
                    <p className="text-xs" style={{ color:"#555555" }}>{done}/{m.lessons.length}</p>
                  </div>
                  <span className="text-sm flex-none">
                    {done === m.lessons.length ? "🏆" : done > 0 ? "⚡" : "○"}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main panel */}
        <main className="flex-1 min-w-0">
          {/* Module header */}
          <div className="rounded-2xl p-5 mb-6 fade-up" style={{ background:"#13131f", border:"1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold"
                   style={{ background:`${mod.color}22`, color:mod.color }}>{mod.icon}</div>
              <div>
                <h2 className="text-lg font-bold text-white">{mod.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:`${mod.color}22`, color:mod.color }}>
                  {lang === "mn" ? `${grade}-р анги` : `Grade ${grade}`}
                </span>
              </div>
            </div>
            <div className="flex justify-between text-xs mb-1.5" style={{ color:"#aaaaaa" }}>
              <span>{completedN}/{mod.lessons.length} {lang === "mn" ? "хичээл" : "lessons"}</span>
              <span style={{ color:mod.color }}>{levelPct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full transition-all" style={{ width:`${levelPct}%`, background:mod.color }} />
            </div>
          </div>

          {/* Mobile module picker */}
          <div className="md:hidden flex gap-2 mb-4 overflow-x-auto pb-1">
            {modules.map((m, i) => (
              <button key={m.id} onClick={() => setActiveMod(i)}
                className="flex-none text-xs font-bold px-3 py-1.5 rounded-lg"
                style={Math.min(activeMod, modules.length-1)===i
                  ? { background:m.color, color:"#fff" }
                  : { background:"rgba(255,255,255,0.06)", color:"#aaaaaa" }}>
                {m.icon} {m.name}
              </button>
            ))}
          </div>

          {/* Lesson path */}
          <div className="flex flex-col items-center gap-0 py-4 fade-up" style={{ animationDelay:"0.08s" }}>
            {mod.lessons.map((lesson, i) => {
              const state  = getLessonState(lesson.id);
              const offset = NODE_OFFSETS[i % NODE_OFFSETS.length];
              const prev   = i > 0 ? getLessonState(mod.lessons[i-1].id) : null;
              return (
                <div key={lesson.id} className="flex flex-col items-center">
                  {i > 0 && (
                    <div className="w-0.5 h-14 transition-all"
                         style={{
                           background: prev === "completed"
                             ? `linear-gradient(to bottom,${mod.color},${mod.color}44)`
                             : "rgba(255,255,255,0.08)",
                           boxShadow: prev === "completed" ? `0 0 8px ${mod.color}66` : "none",
                         }} />
                  )}
                  <LessonNode lesson={lesson} state={state} color={mod.color} offset={offset}
                    onClick={() => setSheet({ lesson, color:mod.color, state })} />
                </div>
              );
            })}

            {/* Next module teaser */}
            {Math.min(activeMod, modules.length-1) < modules.length - 1 && (
              <div className="mt-8 flex flex-col items-center gap-2 opacity-50">
                <div className="w-0.5 h-10" style={{ background:"rgba(255,255,255,0.08)" }} />
                <button onClick={() => setActiveMod((a) => Math.min(a+1, modules.length-1))}
                  className="text-sm font-medium px-5 py-2.5 rounded-xl"
                  style={{ background:"rgba(255,255,255,0.06)", color:"#aaaaaa", border:"1px solid rgba(255,255,255,0.08)" }}>
                  {t.nextLevel as string}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {sheet && (
        <BottomSheet lesson={sheet.lesson} color={sheet.color} state={sheet.state} onClose={() => setSheet(null)} />
      )}
    </div>
  );
}
