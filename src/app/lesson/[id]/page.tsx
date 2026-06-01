"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { LESSONS, type Slide, type LessonQuizQ } from "@/lib/lessons";
import { addXp, updateProgress } from "@/lib/progress";

const FunctionGraph = dynamic(() => import("@/components/FunctionGraph"), { ssr: false });
const GraphCanvas   = dynamic(() => import("@/components/GraphCanvas"),   { ssr: false });

// ── Slide: Intro ──────────────────────────────────────────────────────────────
function IntroSlide({ slide }: { slide: Extract<Slide, { type:"intro" }> }) {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-6">
      <div className="text-7xl">{slide.emoji}</div>
      <div>
        <p className="text-sm font-medium mb-1" style={{ color:"#7F77DD" }}>{slide.subtitle}</p>
        <h1 className="text-3xl font-bold text-white mb-3">{slide.title}</h1>
        <p className="text-base leading-relaxed max-w-md" style={{ color:"#aaaaaa" }}>{slide.body}</p>
      </div>
      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        {[{ icon:"⭐", label:`${slide.xp} XP` },{ icon:"⏱", label:slide.duration },{ icon:"❓", label:`${slide.questions} асуулт` }].map(({ icon, label }) => (
          <div key={label} className="rounded-xl p-3 text-center" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-sm font-bold text-white">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slide: Concept ────────────────────────────────────────────────────────────
function ConceptSlide({ slide, onReady }: { slide: Extract<Slide, { type:"concept" }>; onReady: () => void }) {
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (revealed >= slide.bullets.length) { onReady(); return; }
    const t = setTimeout(() => setRevealed((r) => r + 1), 350);
    return () => clearTimeout(t);
  }, [revealed, slide.bullets.length, onReady]);
  return (
    <div className="space-y-5 py-4">
      <h2 className="text-2xl font-bold text-white">{slide.title}</h2>
      <p className="leading-relaxed" style={{ color:"#aaaaaa" }}>{slide.body}</p>
      {slide.formula && (
        <div className="rounded-xl px-5 py-4" style={{ background:"rgba(127,119,221,0.12)", border:"1px solid rgba(127,119,221,0.25)" }}>
          <p className="font-mono text-lg font-bold" style={{ color:"#7F77DD" }}>{slide.formula}</p>
        </div>
      )}
      <div className="space-y-2.5">
        {slide.bullets.slice(0, revealed).map((b, i) => (
          <div key={i} className="flex items-start gap-3 fade-up rounded-xl p-3"
               style={{ background:"rgba(255,255,255,0.04)", animationDelay:`${i*0.04}s` }}>
            <span className="text-lg flex-none">{b.icon}</span>
            <p className="text-sm leading-relaxed text-white">{b.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slide: Interactive ────────────────────────────────────────────────────────
const SLIDER_DEFS = {
  a: { label:"a — өргөтгөл / нарийсалт", min:-3, max:3, step:0.1, color:"#7F77DD" },
  b: { label:"b — y-огтлол",             min:-4, max:4, step:0.5, color:"#1D9E75" },
  h: { label:"h — хэвтээ шилжилт",       min:-8, max:8, step:0.5, color:"#1D9E75" },
  k: { label:"k — босоо шилжилт",        min:-8, max:8, step:0.5, color:"#BA7517" },
  angle: { label:"θ — өнцөг (°)",        min:0,  max:360, step:5, color:"#D85A30" },
  n: { label:"n — тэгш өнцөгтийн тоо",  min:2,  max:20,  step:1, color:"#7F77DD" },
} as const;

function buildFormula(graphType: string | undefined, a: number, b: number, h: number, k: number, angle: number, n: number) {
  switch (graphType) {
    case "linear":    return `f(x) = ${a}x ${b >= 0 ? "+" : "−"} ${Math.abs(b)}`;
    case "absolute":  return `f(x) = ${a}|x − ${h}| + ${k}`;
    case "hyperbola": return `y = ${k}/x`;
    case "riemann":   return `n = ${Math.round(n)} тэгш өнцөгт`;
    case "unitCircle":return `θ = ${angle}°`;
    case "tangentLine":return `f'(x) = 2x, x = ${h}`;
    case "derivRules":return `f(x) = ${a}x², f'(x) = ${2*a}x`;
    case "polyDeriv": return `f(x) = ${a}x³−3x, f'(x) = ${3*a}x²−3`;
    default:          {
      const fmtA = a === 1 ? "" : a === -1 ? "−" : `${a}`;
      const fmtH = h === 0 ? "x" : h > 0 ? `(x − ${h})` : `(x + ${Math.abs(h)})`;
      const fmtK = k === 0 ? "" : k > 0 ? ` + ${k}` : ` − ${Math.abs(k)}`;
      return `f(x) = ${fmtA}${fmtH}²${fmtK}`;
    }
  }
}

function InteractiveSlide({ slide, onGraphUsed }: { slide: Extract<Slide, { type:"interactive" }>; onGraphUsed: () => void }) {
  const [a, setA] = useState(slide.initA ?? 1);
  const [b, setB] = useState(slide.initB ?? 0);
  const [h, setH] = useState(slide.initH ?? 0);
  const [k, setK] = useState(slide.initK ?? 1);
  const [angle, setAngle] = useState(slide.initAngle ?? 45);
  const [n, setN] = useState(slide.initN ?? 6);
  const notified = useRef(false);
  const notify = useCallback(() => { if (!notified.current) { notified.current = true; onGraphUsed(); } }, [onGraphUsed]);

  const vals: Record<string, number> = { a, b, h, k, angle, n };
  const setters: Record<string, (v: number) => void> = { a:setA, b:setB, h:setH, k:setK, angle:setAngle, n:setN };

  const gt = slide.graphType;
  const useOldGraph = !gt || gt === "quadratic";

  const formula = buildFormula(gt, a, b, h, k, angle, n);

  return (
    <div className="space-y-5 py-4">
      <h2 className="text-2xl font-bold text-white">{slide.title}</h2>
      <p className="leading-relaxed" style={{ color:"#aaaaaa" }}>{slide.body}</p>

      {useOldGraph
        ? <FunctionGraph a={a} h={h} k={k} fnType="quadratic" dark />
        : <GraphCanvas variant={gt!} a={a} b={b} h={h} k={k} angle={angle} n={n} />
      }

      {slide.sliders.length > 0 && (
        <div className="space-y-4">
          {slide.sliders.map((key) => {
            const def = SLIDER_DEFS[key as keyof typeof SLIDER_DEFS];
            if (!def) return null;
            const val = vals[key] ?? 0;
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium" style={{ color:"#aaaaaa" }}>{def.label}</label>
                  <span className="text-sm font-bold font-mono w-14 text-right" style={{ color:def.color }}>{val}</span>
                </div>
                <input type="range" min={def.min} max={def.max} step={def.step} value={val}
                  onChange={(e) => { setters[key](parseFloat(e.target.value)); notify(); }}
                  className="w-full" style={{ accentColor:def.color }} />
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-xl px-4 py-3" style={{ background:"rgba(127,119,221,0.12)", border:"1px solid rgba(127,119,221,0.25)" }}>
        <p className="text-xs font-semibold mb-1" style={{ color:"#7F77DD" }}>Томъёо</p>
        <p className="font-mono text-base font-bold" style={{ color:"#7F77DD" }}>{formula}</p>
      </div>
    </div>
  );
}

// ── Slide: Quiz ───────────────────────────────────────────────────────────────
const OPT_LABELS = ["A","B","C","D"] as const;

function QuizSlide({ q, onAnswered }: { q: LessonQuizQ; onAnswered: (correct: boolean, xp: number) => void }) {
  const { t } = useLang();
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === q.correct;
  const pick = (i: number) => { if (answered) return; setSelected(i); onAnswered(i === q.correct, i === q.correct ? q.xp : 0); };
  return (
    <div className="space-y-5 py-4">
      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background:"rgba(127,119,221,0.2)", color:"#7F77DD" }}>
        {t.questionLabel as string} · +{q.xp} XP
      </span>
      <p className="text-lg font-semibold text-white leading-relaxed">{q.text}</p>
      <div className="space-y-2.5">
        {q.options.map((opt, i) => {
          let bg = "rgba(255,255,255,0.05)", border = "rgba(255,255,255,0.1)", textCol = "#ffffff";
          if (answered) {
            if (i === q.correct)     { bg="rgba(29,158,117,0.18)"; border="#1D9E75"; textCol="#4ade80"; }
            else if (i === selected) { bg="rgba(216,90,48,0.18)";  border="#D85A30"; textCol="#f87171"; }
            else                     { bg="rgba(255,255,255,0.03)"; border="rgba(255,255,255,0.05)"; textCol="#555555"; }
          }
          return (
            <button key={i} onClick={() => pick(i)} disabled={answered}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left"
              style={{ background:bg, border:`1.5px solid ${border}` }}>
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-none"
                style={{ background: answered&&i===q.correct?"#1D9E75":answered&&i===selected?"#D85A30":"rgba(255,255,255,0.1)", color:"#fff" }}>
                {OPT_LABELS[i]}
              </span>
              <span className="text-sm font-medium" style={{ color:textCol }}>{opt}</span>
              {answered && i===q.correct && <span className="ml-auto text-green-400">✓</span>}
              {answered && i===selected && i!==q.correct && <span className="ml-auto text-red-400">✗</span>}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="rounded-xl p-4 space-y-2 fade-up"
          style={{ background:isCorrect?"rgba(29,158,117,0.12)":"rgba(216,90,48,0.12)", border:`1px solid ${isCorrect?"#1D9E75":"#D85A30"}44` }}>
          <p className="font-bold text-sm" style={{ color:isCorrect?"#4ade80":"#f87171" }}>
            {isCorrect?`✓ ${t.correctLabel as string} +${q.xp} XP`:`✗ ${t.wrongLabel as string}`}
          </p>
          <p className="text-xs" style={{ color:"#aaaaaa" }}>
            <span className="font-semibold" style={{ color:"#7F77DD" }}>{t.explanationLabel as string}: </span>{q.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Slide: Worked ─────────────────────────────────────────────────────────────
function WorkedSlide({ slide, onDone }: { slide: Extract<Slide, { type:"worked" }>; onDone: () => void }) {
  const { t } = useLang();
  const [rev, setRev] = useState(0);
  const allDone = rev >= slide.steps.length;
  useEffect(() => { if (allDone) onDone(); }, [allDone, onDone]);
  return (
    <div className="space-y-5 py-4">
      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background:"rgba(186,117,23,0.2)", color:"#BA7517" }}>
        {t.workedExLabel as string}
      </span>
      <div className="rounded-xl p-4" style={{ background:"rgba(186,117,23,0.1)", border:"1px solid rgba(186,117,23,0.25)" }}>
        <p className="font-semibold text-white">{slide.problem}</p>
      </div>
      <div className="space-y-3">
        {slide.steps.slice(0, rev).map((step, i) => (
          <div key={i} className="rounded-xl p-4 space-y-2 fade-up"
               style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs font-bold" style={{ color:"#7F77DD" }}>{step.label}</p>
            <p className="text-sm leading-relaxed" style={{ color:"#aaaaaa" }}>{step.body}</p>
            {step.formula && (
              <p className="font-mono text-sm font-bold rounded-lg px-3 py-2"
                 style={{ background:"rgba(127,119,221,0.12)", color:"#7F77DD" }}>{step.formula}</p>
            )}
          </div>
        ))}
      </div>
      {!allDone && (
        <button onClick={() => setRev((s) => s + 1)}
          className="text-sm font-bold px-5 py-2.5 rounded-xl"
          style={{ background:"rgba(127,119,221,0.15)", color:"#7F77DD", border:"1px solid rgba(127,119,221,0.3)" }}>
          {t.nextStep as string}
        </button>
      )}
    </div>
  );
}

// ── Slide: Complete ───────────────────────────────────────────────────────────
function CompleteSlide({ slide, lessonXp, correctCount, totalQuestions }: {
  slide: Extract<Slide, { type:"complete" }>; lessonXp: number; correctCount: number; totalQuestions: number;
}) {
  const { t } = useLang();
  const pct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
  const medal = pct === 100 ? "🏆" : pct >= 50 ? "🥈" : "🎯";
  return (
    <div className="flex flex-col items-center text-center gap-6 py-6">
      <div className="text-7xl">{medal}</div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Хичээл дууслаа!</h2>
        <p style={{ color:"#aaaaaa" }}>Маш сайн! Та амжилттай дуусгалаа.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        <div className="rounded-2xl p-4" style={{ background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.2)" }}>
          <div className="text-2xl mb-1">⭐</div>
          <div className="text-2xl font-bold" style={{ color:"#fbbf24" }}>{lessonXp}</div>
          <div className="text-xs" style={{ color:"#aaaaaa" }}>XP цуглуулав</div>
        </div>
        <div className="rounded-2xl p-4" style={{ background:"rgba(127,119,221,0.1)", border:"1px solid rgba(127,119,221,0.2)" }}>
          <div className="text-2xl mb-1">❓</div>
          <div className="text-2xl font-bold" style={{ color:"#7F77DD" }}>{pct}%</div>
          <div className="text-xs" style={{ color:"#aaaaaa" }}>{correctCount}/{totalQuestions} зөв</div>
        </div>
      </div>
      {slide.nextId && (
        <Link href={`/lesson/${slide.nextId}`}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white"
          style={{ background:"linear-gradient(135deg,#534AB7,#7F77DD)", boxShadow:"0 0 24px rgba(127,119,221,0.4)" }}>
          {t.nextLessonBtn as string}
        </Link>
      )}
      <Link href="/courses" className="text-sm font-medium" style={{ color:"#aaaaaa" }}>
        {t.backCourses as string}
      </Link>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { t }  = useLang();
  const id     = (params?.id as string) ?? "";
  const lesson = LESSONS[id];

  const [slideIdx, setSlideIdx]    = useState(0);
  const [animKey, setAnimKey]      = useState(0);
  const [lessonXp, setLessonXp]    = useState(0);
  const [correct, setCorrect]      = useState(0);
  const [totalQ, setTotalQ]        = useState(0);
  const [quizAns, setQuizAns]      = useState(false);
  const [workedDone, setWorkedDone]= useState(false);
  const [conReady, setConReady]    = useState(false);

  useEffect(() => { if (!lesson) router.replace("/courses"); }, [lesson, router]);
  if (!lesson) return null;

  const slide  = lesson.slides[slideIdx];
  const isLast = slideIdx === lesson.slides.length - 1;

  const advance = () => {
    if (isLast) return;
    setSlideIdx((i) => i + 1); setAnimKey((k) => k + 1);
    setQuizAns(false); setWorkedDone(false); setConReady(false);
  };

  const canContinue = () => {
    if (slide.type === "quiz")     return quizAns;
    if (slide.type === "worked")   return workedDone;
    if (slide.type === "concept")  return conReady;
    if (slide.type === "complete") return false;
    return true;
  };

  const handleQuizAnswer = (cor: boolean, xp: number) => {
    setQuizAns(true);
    if (cor) { setLessonXp((x) => x + xp); setCorrect((c) => c + 1); addXp(id, xp); }
    setTotalQ((q) => q + 1);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (slide.type === "complete") updateProgress(id, { quizDone: totalQ > 0, exampleRead: true }); }, [slideIdx]);

  const totalSlides = lesson.slides.length;
  const pct = Math.round((slideIdx / Math.max(totalSlides - 1, 1)) * 100);

  const headerGrad = lesson.levelColor
    ? `linear-gradient(90deg,${lesson.levelColor}88,${lesson.levelColor}44)`
    : "linear-gradient(90deg,#534AB7,#7F77DD)";

  return (
    <div className="min-h-screen flex flex-col" style={{ background:"#0f0f1a" }}>
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 h-14"
        style={{ background:"#13131f", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <Link href="/courses" className="text-sm font-medium mr-1" style={{ color:"#aaaaaa" }}>←</Link>
        <div className="flex-1">
          <p className="text-xs font-semibold text-white truncate">{lesson.title}</p>
          <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width:`${pct}%`, background:headerGrad }} />
          </div>
        </div>
        <span className="text-xs font-medium flex-none" style={{ color:"#aaaaaa" }}>{slideIdx+1}/{totalSlides}</span>
        <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg"
          style={{ background:"rgba(251,191,36,0.1)", color:"#fbbf24" }}>⭐ {lessonXp}</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 pb-32 pt-4" key={animKey}>
          <div className="fade-up">
            {slide.type === "intro"       && <IntroSlide    slide={slide} />}
            {slide.type === "concept"     && <ConceptSlide  slide={slide} onReady={() => setConReady(true)} />}
            {slide.type === "interactive" && <InteractiveSlide slide={slide} onGraphUsed={() => updateProgress(id, { graphUsed:true })} />}
            {slide.type === "quiz"        && <QuizSlide     q={slide.q} onAnswered={handleQuizAnswer} />}
            {slide.type === "worked"      && <WorkedSlide   slide={slide} onDone={() => setWorkedDone(true)} />}
            {slide.type === "complete"    && <CompleteSlide slide={slide} lessonXp={lessonXp} correctCount={correct} totalQuestions={totalQ} />}
          </div>
        </div>
      </div>

      {slide.type !== "complete" && (
        <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background:"linear-gradient(to top,#0f0f1a 60%,transparent)" }}>
          <div className="max-w-xl mx-auto">
            <button onClick={advance} disabled={!canContinue()}
              className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all"
              style={canContinue()
                ? { background:"linear-gradient(135deg,#534AB7,#7F77DD)", boxShadow:"0 0 24px rgba(127,119,221,0.45)" }
                : { background:"rgba(255,255,255,0.06)", color:"#555555", cursor:"not-allowed" }}>
              {t.continueSlide as string}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
