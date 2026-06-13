"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { LESSONS, type Slide, type LessonQuizQ, type HoverHintToken } from "@/lib/lessons";
import { renderWithTokens } from "@/components/HoverToken";
import { addXp, updateProgress } from "@/lib/progress";

const FunctionGraph = dynamic(() => import("@/components/FunctionGraph"), { ssr: false });
const GraphCanvas   = dynamic(() => import("@/components/GraphCanvas"),   { ssr: false });

// ── Expression evaluator ──────────────────────────────────────────────────────
function evalExpr(expr: string): (x: number) => number {
  const js = expr.replace(/\^/g, "**");
  try {
    return new Function("x", `"use strict"; return ${js};`) as (x: number) => number;
  } catch {
    return () => 0;
  }
}

// ── Shuffle helper (Fisher-Yates) ─────────────────────────────────────────────
function shuffleOptions<T>(opts: readonly T[], correctIndex: number): { shuffled: T[]; newCorrect: number } {
  const indexed = Array.from(opts).map((item, i) => ({ item, isCorrect: i === correctIndex }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  return {
    shuffled: indexed.map(x => x.item),
    newCorrect: indexed.findIndex(x => x.isCorrect),
  };
}

// ── Slide: Intro ──────────────────────────────────────────────────────────────
function IntroSlide({ slide }: { slide: Extract<Slide, { type:"intro" }> }) {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-6">
      <div className="text-7xl float-anim">{slide.emoji}</div>

      <div className="w-full">
        <span className="text-xs font-bold px-3 py-1 rounded-full inline-block mb-3"
          style={{ background:"rgba(127,119,221,0.15)", color:"#7F77DD" }}>
          {slide.subtitle}
        </span>
        <h1 className="text-[28px] font-bold text-white mb-3 leading-tight">{slide.title}</h1>
        <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color:"#aaaaaa" }}>
          {slide.whyMatters ?? slide.body}
        </p>
      </div>

      {slide.willLearn && slide.willLearn.length > 0 && (
        <div className="w-full max-w-md text-left rounded-xl p-4 space-y-2.5"
          style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-xs font-bold mb-1" style={{ color:"#7F77DD" }}>Энэ хичээлд та сурах зүйлс:</p>
          {slide.willLearn.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex-none text-sm" style={{ color:"#1D9E75" }}>✓</span>
              <p className="text-sm leading-snug" style={{ color:"#cccccc" }}>{item}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        {[
          { icon:"⭐", label:`${slide.xp} XP` },
          { icon:"⏱", label:slide.duration },
          { icon:"❓", label:`${slide.questions} асуулт` },
        ].map(({ icon, label }) => (
          <div key={label} className="rounded-xl p-3 text-center"
            style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-sm font-bold text-white">{label}</div>
          </div>
        ))}
      </div>

      {slide.tip && (
        <div className="w-full max-w-md rounded-xl p-4 text-left"
          style={{ background:"rgba(251,191,36,0.07)", border:"1px solid rgba(251,191,36,0.18)" }}>
          <p className="text-xs leading-relaxed" style={{ color:"#d4a843" }}>{slide.tip}</p>
        </div>
      )}
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
    case "linear":     return `f(x) = ${a}x ${b >= 0 ? "+" : "−"} ${Math.abs(b)}`;
    case "absolute":   return `f(x) = ${a}|x − ${h}| + ${k}`;
    case "hyperbola":  return `y = ${k}/x`;
    case "riemann":    return `n = ${Math.round(n)} тэгш өнцөгт`;
    case "unitCircle": return `θ = ${angle}°`;
    case "tangentLine":return `f'(x) = 2x, x = ${h}`;
    case "derivRules": return `f(x) = ${a}x², f'(x) = ${2*a}x`;
    case "polyDeriv":  return `f(x) = ${a}x³−3x, f'(x) = ${3*a}x²−3`;
    default: {
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

// ── Slide: Predict ────────────────────────────────────────────────────────────
function PredictSlide({ slide, onAnswered, onAdvance }: {
  slide: Extract<Slide, { type:"predict" }>;
  onAnswered: () => void;
  onAdvance: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [{ shuffled: opts, newCorrect: correctIdx }] = useState(() =>
    shuffleOptions(slide.options, slide.correct)
  );

  const answered = selected !== null;
  const isCorrect = selected === correctIdx;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!slide.base) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0a0a14";
    ctx.fillRect(0, 0, W, H);

    const range = 5;
    const tx = (x: number) => ((x + range) / (2 * range)) * W;
    const ty = (y: number) => H - ((y + range) / (2 * range)) * H;

    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2);
    ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
    ctx.stroke();

    function drawCurve(expr: string, color: string, dashed: boolean, glow: boolean) {
      const fn = evalExpr(expr);
      ctx!.beginPath();
      ctx!.strokeStyle = color;
      ctx!.lineWidth = glow ? 2.5 : 1.5;
      ctx!.setLineDash(dashed ? [6, 4] : []);
      if (glow) { ctx!.shadowBlur = 10; ctx!.shadowColor = color; }
      else ctx!.shadowBlur = 0;
      let first = true;
      for (let px = 0; px <= W; px++) {
        const x = (px / W) * 2 * range - range;
        let y: number;
        try { y = fn(x); } catch { first = true; continue; }
        if (!isFinite(y) || Math.abs(y) > range * 2.5) { first = true; continue; }
        if (first) { ctx!.moveTo(tx(x), ty(y)); first = false; }
        else ctx!.lineTo(tx(x), ty(y));
      }
      ctx!.stroke();
      ctx!.shadowBlur = 0;
      ctx!.setLineDash([]);
    }

    drawCurve(slide.base, "rgba(255,255,255,0.28)", false, false);
    if (answered && slide.answer) drawCurve(slide.answer, "#4ade80", false, true);
    if (answered && !isCorrect) drawCurve(slide.base, "#fbbf24", true, false);
  }, [selected, slide, answered, isCorrect]);

  const pick = (i: number) => {
    if (answered) return;
    setSelected(i);
    if (i === correctIdx) onAnswered();
  };

  return (
    <div className="space-y-5 py-4">
      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background:"rgba(251,191,36,0.15)", color:"#fbbf24" }}>
        🔮 Урьдчилан тааварла
      </span>
      <p className="text-lg font-semibold text-white leading-relaxed">{renderWithTokens(slide.question, slide.tokens)}</p>

      {slide.base && (
        <canvas ref={canvasRef} width={320} height={180}
          className="w-full rounded-xl" style={{ border:"1px solid rgba(255,255,255,0.08)" }} />
      )}

      <div className="space-y-2.5">
        {opts.map((opt, i) => {
          let bg = "rgba(255,255,255,0.05)", border = "rgba(255,255,255,0.1)", textCol = "#ffffff";
          if (answered) {
            if (i === correctIdx)  { bg="rgba(29,158,117,0.18)"; border="#1D9E75"; textCol="#4ade80"; }
            else if (i === selected) { bg="rgba(216,90,48,0.18)"; border="#D85A30"; textCol="#f87171"; }
            else                   { bg="rgba(255,255,255,0.03)"; border="rgba(255,255,255,0.05)"; textCol="#555555"; }
          }
          return (
            <button key={i} onClick={() => pick(i)} disabled={answered}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
              style={{ background:bg, border:`1.5px solid ${border}` }}>
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-none"
                style={{ background: answered&&i===correctIdx?"#1D9E75":answered&&i===selected?"#D85A30":"rgba(255,255,255,0.1)", color:"#fff" }}>
                {["A","B","C","D"][i]}
              </span>
              <span className="text-sm font-medium" style={{ color:textCol }}>{opt as string}</span>
              {answered && i===correctIdx && <span className="ml-auto text-green-400">✓</span>}
              {answered && i===selected && i!==correctIdx && <span className="ml-auto text-red-400">✗</span>}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="rounded-xl p-4 space-y-2 fade-up"
          style={{ background:isCorrect?"rgba(29,158,117,0.12)":"rgba(216,90,48,0.12)",
                   border:`1px solid ${isCorrect?"#1D9E75":"#D85A30"}55` }}>
          <p className="font-bold text-sm" style={{ color:isCorrect?"#4ade80":"#f87171" }}>
            {isCorrect ? "✓ Зөв тааварлалаа!" : "✗ Үгүй..."}
          </p>
          <p className="text-xs leading-relaxed" style={{ color:"#aaaaaa" }}>
            <span className="font-semibold" style={{ color:"#7F77DD" }}>Тайлбар: </span>
            {slide.explanation}
          </p>
          {!isCorrect && (
            <button onClick={() => { onAnswered(); onAdvance(); }}
              className="mt-1 w-full py-2.5 rounded-xl font-bold text-sm fade-up"
              style={{ background:"linear-gradient(135deg,#534AB7,#7F77DD)", color:"#fff" }}>
              Ойлголоо, үргэлжлүүлэх →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Slide: Build ──────────────────────────────────────────────────────────────
function BuildSlide({ slide, onDone }: {
  slide: Extract<Slide, { type:"build" }>;
  onDone: () => void;
}) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [result, setResult] = useState<"success"|"fail"|null>(null);

  const remaining = slide.pieces.filter((p) => !placed.includes(p.id));

  const place = (id: string) => {
    if (result) return;
    const next = [...placed, id];
    setPlaced(next);
    if (next.length === slide.pieces.length) {
      const ok = slide.correctOrder.every((cid, i) => next[i] === cid);
      setResult(ok ? "success" : "fail");
      if (ok) onDone();
    }
  };

  const reset = () => { setPlaced([]); setResult(null); };

  return (
    <div className="space-y-5 py-4">
      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background:"rgba(127,119,221,0.2)", color:"#7F77DD" }}>
        🧩 Томьёо угсарах
      </span>
      <div className="rounded-xl px-5 py-3" style={{ background:"rgba(127,119,221,0.08)", border:"1px solid rgba(127,119,221,0.2)" }}>
        <p className="text-xs font-bold mb-1" style={{ color:"#7F77DD" }}>Зорилго</p>
        <p className="font-mono text-base font-bold text-white">{slide.target}</p>
      </div>

      <div className="min-h-14 rounded-xl p-3 flex flex-wrap gap-2 items-center"
        style={{ background:"rgba(255,255,255,0.03)", border:"1.5px dashed rgba(255,255,255,0.15)" }}>
        {placed.length === 0 && (
          <p className="text-sm" style={{ color:"rgba(255,255,255,0.2)" }}>Доорх хэсгүүдийг дарааллаар нэм...</p>
        )}
        {placed.map((id) => {
          const piece = slide.pieces.find((p) => p.id === id)!;
          return (
            <span key={id} className="px-3 py-1.5 rounded-lg font-mono font-bold text-sm"
              style={{ background: piece.color ? `${piece.color}22` : "rgba(127,119,221,0.2)",
                       color: piece.color || "#7F77DD",
                       border: `1px solid ${piece.color || "#7F77DD"}44` }}>
              {piece.label}
            </span>
          );
        })}
      </div>

      {!result && (
        <div className="flex flex-wrap gap-2">
          {remaining.map((piece) => (
            <button key={piece.id} onClick={() => place(piece.id)}
              className="px-3 py-2 rounded-xl text-sm font-mono font-bold transition-all active:scale-95"
              style={{ background: piece.color ? `${piece.color}18` : "rgba(127,119,221,0.1)",
                       color: piece.color || "#7F77DD",
                       border: `1.5px solid ${piece.color || "#7F77DD"}55` }}>
              {piece.label}
              {piece.desc && <span className="ml-1.5 text-xs opacity-60 font-normal">{piece.desc}</span>}
            </button>
          ))}
        </div>
      )}

      {result && (
        <div className="rounded-xl p-4 fade-up"
          style={{ background: result==="success"?"rgba(29,158,117,0.12)":"rgba(216,90,48,0.12)",
                   border:`1px solid ${result==="success"?"#1D9E75":"#D85A30"}44` }}>
          <p className="font-bold text-sm" style={{ color: result==="success"?"#4ade80":"#f87171" }}>
            {result==="success" ? "✓ Гайхалтай! Зөв угсарлаа!" : "✗ Дараалал буруу — дахин оролдоорой"}
          </p>
          {result==="fail" && (
            <button onClick={reset} className="mt-2.5 text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ background:"rgba(127,119,221,0.15)", color:"#7F77DD", border:"1px solid rgba(127,119,221,0.3)" }}>
              Дахин оролдох
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Slide: Scaffold ───────────────────────────────────────────────────────────
function ScaffoldSlide({ slide, onDone }: {
  slide: Extract<Slide, { type:"scaffold" }>;
  onDone: () => void;
}) {
  const [shuffledSteps] = useState(() =>
    slide.steps.map(st => {
      const { shuffled, newCorrect } = shuffleOptions(st.options, st.correct);
      return { ...st, options: shuffled as [string, string, string], correct: newCorrect as 0 | 1 | 2 };
    })
  );

  const [stepIdx, setStepIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const step = shuffledSteps[stepIdx];
  const answered = selected !== null;
  const isCorrect = answered && selected === step.correct;

  const pick = (i: number) => {
    if (answered) return;
    setSelected(i);
  };

  const handleRetry = () => setSelected(null);

  const nextStep = () => {
    if (!isCorrect) return;
    const next = stepIdx + 1;
    if (next >= shuffledSteps.length) { onDone(); return; }
    setStepIdx(next);
    setSelected(null);
  };

  return (
    <div className="space-y-5 py-4">
      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background:"rgba(186,117,23,0.2)", color:"#BA7517" }}>
        🪜 Алхам алхмаар
      </span>

      <div className="rounded-xl p-4" style={{ background:"rgba(186,117,23,0.1)", border:"1px solid rgba(186,117,23,0.3)" }}>
        <p className="text-xs font-bold mb-1" style={{ color:"#BA7517" }}>Бодлого</p>
        <p className="font-mono font-bold text-white text-base">{renderWithTokens(slide.problem, slide.tokens)}</p>
      </div>

      <div className="space-y-1.5">
        <div className="flex gap-2">
          {shuffledSteps.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
              style={{ background: i < stepIdx ? "#1D9E75" : i === stepIdx ? "#7F77DD" : "rgba(255,255,255,0.1)" }} />
          ))}
        </div>
        <p className="text-xs" style={{ color:"#666" }}>Алхам {stepIdx + 1} / {shuffledSteps.length}</p>
      </div>

      <p className="text-base font-semibold text-white">{step.question}</p>

      <div className="space-y-2">
        {step.options.map((opt, i) => {
          let bg = "rgba(255,255,255,0.05)", border = "rgba(255,255,255,0.1)", textCol = "#ffffff";
          if (answered) {
            if (isCorrect && i === step.correct)    { bg="rgba(29,158,117,0.18)"; border="#1D9E75"; textCol="#4ade80"; }
            else if (!isCorrect && i === selected)  { bg="rgba(216,90,48,0.18)"; border="#D85A30"; textCol="#f87171"; }
            else                                    { bg="rgba(255,255,255,0.03)"; border="rgba(255,255,255,0.05)"; textCol="#555555"; }
          }
          return (
            <button key={i} onClick={() => pick(i)} disabled={answered}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
              style={{ background:bg, border:`1.5px solid ${border}` }}>
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-none"
                style={{ background: answered&&isCorrect&&i===step.correct?"#1D9E75":answered&&!isCorrect&&i===selected?"#D85A30":"rgba(255,255,255,0.1)", color:"#fff" }}>
                {["A","B","C"][i]}
              </span>
              <span className="text-sm font-medium" style={{ color:textCol }}>{opt}</span>
            </button>
          );
        })}
      </div>

      {answered && !isCorrect && (
        <div className="space-y-3 fade-up">
          <div className="rounded-xl p-3" style={{ background:"rgba(186,117,23,0.1)", border:"1px solid rgba(186,117,23,0.3)" }}>
            <p className="text-xs" style={{ color:"#BA7517" }}>💡 {step.hint}</p>
          </div>
          <button onClick={handleRetry}
            className="w-full py-3 rounded-xl font-bold text-sm"
            style={{ background:"rgba(216,90,48,0.12)", color:"#f87171", border:"1.5px solid rgba(216,90,48,0.35)" }}>
            Дахин оролдох ↺
          </button>
        </div>
      )}

      {isCorrect && (
        <button onClick={nextStep}
          className="w-full py-3.5 rounded-xl font-bold text-white fade-up"
          style={{ background:"linear-gradient(135deg,#1a7a5a,#1D9E75)", boxShadow:"0 0 20px rgba(29,158,117,0.35)" }}>
          {stepIdx + 1 < shuffledSteps.length ? "Дараагийн алхам →" : "Дуусгах ✓"}
        </button>
      )}
    </div>
  );
}

// ── Slide: Quiz ───────────────────────────────────────────────────────────────
const OPT_LABELS = ["A","B","C","D"] as const;

function QuizSlide({ q, tokens, onAnswered }: { q: LessonQuizQ; tokens?: HoverHintToken[]; onAnswered: (correct: boolean, xp: number) => void }) {
  const { t } = useLang();
  const [{ shuffled: opts, newCorrect: correctIdx }] = useState(() =>
    shuffleOptions(q.options, q.correct)
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);

  const answered = selected !== null;
  const isCorrect = answered && selected === correctIdx;

  const pick = (i: number) => {
    if (solved) return;
    setSelected(i);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (i === correctIdx) {
      setSolved(true);
      onAnswered(true, newAttempts === 1 ? q.xp : 0);
    }
  };

  const handleRetry = () => setSelected(null);

  return (
    <div className="space-y-5 py-4">
      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background:"rgba(127,119,221,0.2)", color:"#7F77DD" }}>
        {t.questionLabel as string} · +{q.xp} XP
      </span>
      <p className="text-lg font-semibold text-white leading-relaxed">{renderWithTokens(q.text, tokens)}</p>
      <div className="space-y-2.5">
        {opts.map((opt, i) => {
          let bg = "rgba(255,255,255,0.05)", border = "rgba(255,255,255,0.1)", textCol = "#ffffff";
          if (answered) {
            if (solved && i === correctIdx)      { bg="rgba(29,158,117,0.18)"; border="#1D9E75"; textCol="#4ade80"; }
            else if (!solved && i === selected)  { bg="rgba(216,90,48,0.18)"; border="#D85A30"; textCol="#f87171"; }
            else                                 { bg="rgba(255,255,255,0.03)"; border="rgba(255,255,255,0.05)"; textCol="#555555"; }
          }
          return (
            <button key={i} onClick={() => pick(i)} disabled={answered}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left"
              style={{ background:bg, border:`1.5px solid ${border}` }}>
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-none"
                style={{ background: answered&&solved&&i===correctIdx?"#1D9E75":answered&&!solved&&i===selected?"#D85A30":"rgba(255,255,255,0.1)", color:"#fff" }}>
                {OPT_LABELS[i]}
              </span>
              <span className="text-sm font-medium" style={{ color:textCol }}>{opt as string}</span>
              {solved && i===correctIdx && <span className="ml-auto text-green-400">✓</span>}
              {!solved && answered && i===selected && <span className="ml-auto text-red-400">✗</span>}
            </button>
          );
        })}
      </div>

      {answered && !solved && (
        <div className="space-y-3 fade-up">
          <div className="rounded-xl p-4"
            style={{ background:"rgba(216,90,48,0.12)", border:"1px solid rgba(216,90,48,0.35)" }}>
            <p className="font-bold text-sm mb-1" style={{ color:"#f87171" }}>✗ Буруу хариулт</p>
            <p className="text-xs leading-relaxed" style={{ color:"#aaaaaa" }}>
              <span className="font-semibold" style={{ color:"#7F77DD" }}>Зөвлөмж: </span>{q.explanation}
            </p>
          </div>
          <button onClick={handleRetry}
            className="w-full py-3 rounded-xl font-bold text-sm"
            style={{ background:"rgba(127,119,221,0.12)", color:"#7F77DD", border:"1.5px solid rgba(127,119,221,0.3)" }}>
            Дахин оролдох ↺
          </button>
        </div>
      )}

      {solved && (
        <div className="rounded-xl p-4 space-y-2 fade-up"
          style={{ background:"rgba(29,158,117,0.12)", border:"1px solid #1D9E7544" }}>
          <p className="font-bold text-sm" style={{ color:"#4ade80" }}>
            {attempts === 1 ? `✓ ${t.correctLabel as string} +${q.xp} XP` : "✓ Зөв! (XP олгогдсонгүй — дахин оролдсон)"}
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
        {slide.steps.slice(0, rev).map((s, i) => (
          <div key={i} className="rounded-xl p-4 space-y-2 fade-up"
               style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs font-bold" style={{ color:"#7F77DD" }}>{s.label}</p>
            <p className="text-sm leading-relaxed" style={{ color:"#aaaaaa" }}>{s.body}</p>
            {s.formula && (
              <p className="font-mono text-sm font-bold rounded-lg px-3 py-2"
                 style={{ background:"rgba(127,119,221,0.12)", color:"#7F77DD" }}>{s.formula}</p>
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

// ── Slide: StoryAnimation ─────────────────────────────────────────────────────
function StoryAnimationSlide({ slide }: { slide: Extract<Slide, { type:"story_animation" }> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;   // 400
    const H = canvas.height;  // 200
    const PAD = { left: 54, right: 16, top: 24, bottom: 36 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;

    const xMax = 8;
    const baseFare = 1000;
    const rate = 1500;
    const yMax = 14000;

    const tx = (km: number) => PAD.left + (km / xMax) * plotW;
    const ty = (fare: number) => PAD.top + plotH - (fare / yMax) * plotH;

    let rafId = 0;
    let t = 0;

    const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    const draw = () => {
      t = (t + 0.004) % 1;
      const km = t * xMax;
      const fare = baseFare + rate * km;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0d0d1a";
      ctx.fillRect(0, 0, W, H);

      // Subtle vertical grid
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      for (let g = 0; g <= xMax; g += 2) {
        const gx = tx(g);
        ctx.beginPath(); ctx.moveTo(gx, PAD.top); ctx.lineTo(gx, PAD.top + plotH); ctx.stroke();
      }

      // Axes
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + plotH);
      ctx.moveTo(PAD.left, PAD.top + plotH); ctx.lineTo(PAD.left + plotW, PAD.top + plotH);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = "#888";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("төлбөр ₮", PAD.left - 4, PAD.top + 10);
      ctx.textAlign = "center";
      ctx.fillText("км", W - PAD.right + 8, PAD.top + plotH + 18);

      // X-axis tick labels
      ctx.fillStyle = "#555";
      ctx.font = "9px sans-serif";
      for (let g = 0; g <= xMax; g += 2) {
        ctx.fillText(String(g), tx(g), PAD.top + plotH + 18);
      }

      // Dashed coral base-fare line
      const baseY = ty(baseFare);
      ctx.strokeStyle = "#D85A30";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(PAD.left, baseY); ctx.lineTo(PAD.left + plotW, baseY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#D85A30";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("суух төлбөр (b)", PAD.left + 3, baseY - 4);

      // Teal fare line
      ctx.strokeStyle = "#1D9E75";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx(0), ty(baseFare));
      ctx.lineTo(tx(xMax), ty(baseFare + rate * xMax));
      ctx.stroke();

      // Amber dot on line
      const dotX = tx(km);
      const dotY = ty(fare);
      ctx.fillStyle = "#BA7517";
      ctx.beginPath();
      ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Taxi emoji above dot
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🚕", dotX, dotY - 10);

      // Live readout box (top-right of plot)
      const bx = W - PAD.right - 94;
      const by = PAD.top + 2;
      const bw = 88;
      const bh = 38;
      ctx.fillStyle = "rgba(13,13,26,0.88)";
      drawRoundRect(bx, by, bw, bh, 6);
      ctx.fill();
      ctx.strokeStyle = "rgba(127,119,221,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#999";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${km.toFixed(1)} км явлаа`, bx + 6, by + 14);
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText(`${Math.round(fare).toLocaleString()}₮ төлнө`, bx + 6, by + 28);

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="space-y-5 py-4">
      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background:"rgba(216,90,48,0.15)", color:"#D85A30" }}>
        {slide.badge}
      </span>
      <h2 className="text-2xl font-bold text-white leading-tight">{slide.title}</h2>
      <p className="leading-relaxed" style={{ color:"#aaaaaa" }}>{slide.body}</p>

      <canvas ref={canvasRef} width={400} height={200}
        className="w-full rounded-xl" style={{ border:"1px solid rgba(255,255,255,0.08)" }} />

      <div className="rounded-xl px-5 py-4"
        style={{ background:"rgba(127,119,221,0.08)", border:"1px solid rgba(127,119,221,0.2)" }}>
        <p className="text-xs font-bold mb-2" style={{ color:"#7F77DD" }}>Томьёо</p>
        <p className="font-mono text-base font-bold">
          <span style={{ color:"#aaaaaa" }}>төлбөр = </span>
          <span style={{ color:"#1D9E75" }}>1500</span>
          <span style={{ color:"#aaaaaa" }}> × км + </span>
          <span style={{ color:"#D85A30" }}>1000</span>
        </p>
      </div>

      <div className="rounded-xl p-4"
        style={{ background:"rgba(251,191,36,0.07)", border:"1px solid rgba(251,191,36,0.18)" }}>
        <p className="text-xs leading-relaxed" style={{ color:"#d4a843" }}>{slide.tip}</p>
      </div>
    </div>
  );
}

// ── Slide: SlopeExplorer ──────────────────────────────────────────────────────
const SLOPE_LINES = [
  { label:"Эгц өсөх",   m: 2,   color:"#D85A30", info:"m = 2 — хурдан өсч байна. 1 алхам баруун = 2 алхам дээш." },
  { label:"Налуу өсөх", m: 0.5, color:"#1D9E75", info:"m = 0.5 — аажуу өсч байна. 1 алхам баруун = хагас алхам дээш." },
  { label:"Буурах",     m:-1,   color:"#BA7517", info:"m = −1 — буурч байна. 1 алхам баруун = 1 алхам доош." },
] as const;

function SlopeExplorerSlide({ slide }: { slide: Extract<Slide, { type:"slope_explorer" }> }) {
  const [active, setActive] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;   // 360
    const H = canvas.height;  // 240
    const cx = W / 2;
    const cy = H / 2;
    const sc = 35;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0d0d1a";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (let i = -5; i <= 5; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * sc, 0); ctx.lineTo(cx + i * sc, H);
      ctx.moveTo(0, cy + i * sc); ctx.lineTo(W, cy + i * sc);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(W, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, H);
    ctx.stroke();

    // Draw each line
    SLOPE_LINES.forEach((line, i) => {
      ctx.globalAlpha = i === active ? 1 : 0.18;
      ctx.strokeStyle = line.color;
      ctx.lineWidth = i === active ? 2.5 : 1.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(cx + -6 * sc, cy - line.m * -6 * sc);
      ctx.lineTo(cx +  6 * sc, cy - line.m *  6 * sc);
      ctx.stroke();

      if (i === active) {
        ctx.fillStyle = line.color;
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "left";
        const lx = cx + 2.5 * sc;
        const ly = cy - line.m * 2.5 * sc - 8;
        ctx.fillText(`m = ${line.m}`, lx, ly);
      }
    });
    ctx.globalAlpha = 1;

    // Rise/run staircase on active line (sx=0, ex=1 in data coords)
    const m = SLOPE_LINES[active].m;
    const stX = cx;
    const stY = cy;
    const endX = cx + sc;
    const endY = cy - m * sc;

    ctx.strokeStyle = "rgba(255,255,255,0.65)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    // Horizontal leg
    ctx.beginPath(); ctx.moveTo(stX, stY); ctx.lineTo(endX, stY); ctx.stroke();
    // Vertical leg
    ctx.beginPath(); ctx.moveTo(endX, stY); ctx.lineTo(endX, endY); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("1 баруун", (stX + endX) / 2, stY + 15);
    ctx.textAlign = "left";
    const riseLabel = m > 0 ? `${m} дээш` : m < 0 ? `${Math.abs(m)} доош` : "0";
    ctx.fillText(riseLabel, endX + 4, (stY + endY) / 2 + 4);
  }, [active]);

  return (
    <div className="space-y-5 py-4">
      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background:"rgba(29,158,117,0.15)", color:"#1D9E75" }}>
        {slide.badge}
      </span>
      <h2 className="text-2xl font-bold text-white leading-tight">{slide.title}</h2>
      <p className="leading-relaxed" style={{ color:"#aaaaaa" }}>{slide.body}</p>

      <canvas ref={canvasRef} width={360} height={240}
        className="w-full rounded-xl" style={{ border:"1px solid rgba(255,255,255,0.08)" }} />

      <div className="flex gap-2">
        {SLOPE_LINES.map((line, i) => (
          <button key={i} onClick={() => setActive(i)}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={{
              background: i === active ? `${line.color}22` : "rgba(255,255,255,0.04)",
              border:`1.5px solid ${i === active ? line.color : "rgba(255,255,255,0.1)"}`,
              color: i === active ? line.color : "#666",
            }}>
            {line.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl p-4"
        style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
        <p className="text-sm leading-relaxed" style={{ color:"#cccccc" }}>
          {SLOPE_LINES[active].info}
        </p>
      </div>
    </div>
  );
}

// ── Slide: Playground ─────────────────────────────────────────────────────────
function PlaygroundSlide({ slide }: { slide: Extract<Slide, { type:"playground" }> }) {
  const [m, setM] = useState(1);
  const [b, setB] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;   // 360
    const H = canvas.height;  // 220
    const cx = W / 2;
    const cy = H / 2;
    const sc = 32;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0d0d1a";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (let i = -6; i <= 6; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * sc, 0); ctx.lineTo(cx + i * sc, H);
      ctx.moveTo(0, cy + i * sc); ctx.lineTo(W, cy + i * sc);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(W, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, H);
    ctx.stroke();

    // Line y = mx + b from x=-7 to x=7
    const x1 = -7, x2 = 7;
    ctx.strokeStyle = "#7F77DD";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(cx + x1 * sc, cy - (m * x1 + b) * sc);
    ctx.lineTo(cx + x2 * sc, cy - (m * x2 + b) * sc);
    ctx.stroke();

    // Y-intercept coral dot
    const bScreenY = cy - b * sc;
    const bInCanvas = bScreenY >= 0 && bScreenY <= H;
    if (bInCanvas) {
      ctx.fillStyle = "#D85A30";
      ctx.beginPath();
      ctx.arc(cx, bScreenY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#D85A30";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`b = ${b}`, cx + 10, bScreenY - 6);
    }
  }, [m, b]);

  const statusText = m > 0 ? "📈 Өсөх функц" : m < 0 ? "📉 Буурах функц" : "➖ Тогтмол функц";
  const statusColor = m > 0 ? "#1D9E75" : m < 0 ? "#D85A30" : "#BA7517";

  return (
    <div className="space-y-5 py-4">
      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background:"rgba(127,119,221,0.15)", color:"#7F77DD" }}>
        {slide.badge}
      </span>
      <h2 className="text-2xl font-bold text-white leading-tight">{slide.title}</h2>
      <p className="leading-relaxed" style={{ color:"#aaaaaa" }}>{slide.body}</p>

      <div className="rounded-xl px-5 py-3"
        style={{ background:"rgba(127,119,221,0.08)", border:"1px solid rgba(127,119,221,0.2)" }}>
        <p className="font-mono text-xl font-bold text-center">
          <span style={{ color:"#aaaaaa" }}>y = </span>
          <span style={{ color:"#1D9E75" }}>{m}</span>
          <span style={{ color:"#aaaaaa" }}>x {b >= 0 ? "+" : "−"} </span>
          <span style={{ color:"#D85A30" }}>{Math.abs(b)}</span>
        </p>
      </div>

      <canvas ref={canvasRef} width={360} height={220}
        className="w-full rounded-xl" style={{ border:"1px solid rgba(255,255,255,0.08)" }} />

      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color:"#aaaaaa" }}>m — налуу</span>
            <span className="text-sm font-bold font-mono" style={{ color:"#1D9E75" }}>{m}</span>
          </div>
          <input type="range" min={-3} max={3} step={0.5} value={m}
            onChange={(e) => setM(parseFloat(e.target.value))}
            className="w-full" style={{ accentColor:"#1D9E75" }} />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color:"#aaaaaa" }}>b — y-огтлол</span>
            <span className="text-sm font-bold font-mono" style={{ color:"#D85A30" }}>{b}</span>
          </div>
          <input type="range" min={-3} max={3} step={0.5} value={b}
            onChange={(e) => setB(parseFloat(e.target.value))}
            className="w-full" style={{ accentColor:"#D85A30" }} />
        </div>
      </div>

      <div className="rounded-xl p-3 text-center"
        style={{ background:`${statusColor}18`, border:`1.5px solid ${statusColor}44` }}>
        <span className="text-sm font-bold" style={{ color:statusColor }}>{statusText}</span>
      </div>
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

  const [slideIdx, setSlideIdx]         = useState(0);
  const [animKey, setAnimKey]           = useState(0);
  const [lessonXp, setLessonXp]         = useState(0);
  const [correct, setCorrect]           = useState(0);
  const [totalQ, setTotalQ]             = useState(0);
  const [quizAns, setQuizAns]           = useState(false);
  const [workedDone, setWorkedDone]     = useState(false);
  const [conReady, setConReady]         = useState(false);
  const [predictAns, setPredictAns]     = useState(false);
  const [buildDone, setBuildDone]       = useState(false);
  const [scaffoldDone, setScaffoldDone] = useState(false);

  useEffect(() => { if (!lesson) router.replace("/courses"); }, [lesson, router]);
  if (!lesson) return null;

  const slide  = lesson.slides[slideIdx];
  const isLast = slideIdx === lesson.slides.length - 1;

  const advance = () => {
    if (isLast) return;
    setSlideIdx((i) => i + 1); setAnimKey((k) => k + 1);
    setQuizAns(false); setWorkedDone(false); setConReady(false);
    setPredictAns(false); setBuildDone(false); setScaffoldDone(false);
  };

  const canContinue = () => {
    if (slide.type === "quiz")     return quizAns;
    if (slide.type === "worked")   return workedDone;
    if (slide.type === "concept")  return conReady;
    if (slide.type === "predict")  return predictAns;
    if (slide.type === "build")    return buildDone;
    if (slide.type === "scaffold") return scaffoldDone;
    if (slide.type === "complete") return false;
    return true;
  };

  const handleQuizAnswer = (_cor: boolean, xp: number) => {
    setQuizAns(true);
    setLessonXp((x) => x + xp);
    if (xp > 0) { setCorrect((c) => c + 1); addXp(id, xp); }
    setTotalQ((q) => q + 1);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (slide.type === "complete") updateProgress(id, { quizDone: totalQ > 0, exampleRead: true }); }, [slideIdx]);

  const totalSlides = lesson.slides.length;
  const pct = Math.round((slideIdx / Math.max(totalSlides - 1, 1)) * 100);

  const durationMins = parseInt(lesson.duration) || 8;
  const remainingSlides = totalSlides - slideIdx;
  const remainingMins = Math.max(1, Math.ceil((durationMins / totalSlides) * remainingSlides));

  const headerGrad = lesson.levelColor
    ? `linear-gradient(90deg,${lesson.levelColor}88,${lesson.levelColor}44)`
    : "linear-gradient(90deg,#534AB7,#7F77DD)";

  return (
    <div className="min-h-screen flex flex-col" style={{ background:"#0f0f1a" }}>
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 h-14"
        style={{ background:"#13131f", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <Link href="/courses" className="text-sm font-medium mr-1" style={{ color:"#aaaaaa" }}>←</Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-xs font-semibold text-white truncate">{lesson.title}</p>
            <p className="text-xs flex-none ml-2" style={{ color:"#555" }}>~{remainingMins} мин үлдсэн</p>
          </div>
          <div className="mt-0.5 h-1 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width:`${pct}%`, background:headerGrad }} />
          </div>
        </div>
        <span className="text-xs font-medium flex-none ml-1" style={{ color:"#aaaaaa" }}>{slideIdx+1}/{totalSlides}</span>
        <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg"
          style={{ background:"rgba(251,191,36,0.1)", color:"#fbbf24" }}>⭐ {lessonXp}</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 pb-32 pt-4" key={animKey}>
          <div className="fade-up">
            {slide.type === "intro"            && <IntroSlide          slide={slide} />}
            {slide.type === "concept"          && <ConceptSlide        slide={slide} onReady={() => setConReady(true)} />}
            {slide.type === "interactive"      && <InteractiveSlide    slide={slide} onGraphUsed={() => updateProgress(id, { graphUsed:true })} />}
            {slide.type === "predict"          && <PredictSlide        slide={slide} onAnswered={() => setPredictAns(true)} onAdvance={advance} />}
            {slide.type === "build"            && <BuildSlide          slide={slide} onDone={() => setBuildDone(true)} />}
            {slide.type === "scaffold"         && <ScaffoldSlide       slide={slide} onDone={() => setScaffoldDone(true)} />}
            {slide.type === "quiz"             && <QuizSlide           q={slide.q} tokens={slide.tokens} onAnswered={handleQuizAnswer} />}
            {slide.type === "worked"           && <WorkedSlide         slide={slide} onDone={() => setWorkedDone(true)} />}
            {slide.type === "story_animation"  && <StoryAnimationSlide slide={slide} />}
            {slide.type === "slope_explorer"   && <SlopeExplorerSlide  slide={slide} />}
            {slide.type === "playground"       && <PlaygroundSlide     slide={slide} />}
            {slide.type === "complete"         && <CompleteSlide       slide={slide} lessonXp={lessonXp} correctCount={correct} totalQuestions={totalQ} />}
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
