"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { FunctionType } from "./FunctionGraph";
import { useLang } from "@/lib/LangContext";

// Skip SSR entirely — canvas APIs are browser-only and cause hydration
// mismatches when the page is accessed from a non-localhost IP address.
const FunctionGraph = dynamic(() => import("./FunctionGraph"), { ssr: false });

const DEFAULTS = { a: 1, h: 0, k: 0 };

function formatFormula(fnType: FunctionType, a: number, h: number, k: number): string {
  const fmtA = a === 1 ? "" : a === -1 ? "-" : `${a}`;
  const fmtH = h === 0 ? "x" : h > 0 ? `(x − ${h})` : `(x + ${Math.abs(h)})`;
  const fmtK = k === 0 ? "" : k > 0 ? ` + ${k}` : ` − ${Math.abs(k)}`;

  if (fnType === "quadratic") return `f(x) = ${fmtA}${fmtH}²${fmtK}`;
  if (fnType === "absolute") return `f(x) = ${fmtA}|${h === 0 ? "x" : h > 0 ? `x − ${h}` : `x + ${Math.abs(h)}`}|${fmtK}`;
  if (fnType === "squareRoot") return `f(x) = ${fmtA}√${fmtH}${fmtK}`;
  return "";
}

interface SliderRowProps {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  color: string;
}

function SliderRow({ label, hint, value, min, max, step, onChange, color }: SliderRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className={`text-sm font-bold font-mono w-10 text-right ${color}`}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full cursor-pointer"
        style={{ accentColor: color.includes("indigo") ? "#6366f1" : color.includes("emerald") ? "#10b981" : "#f59e0b" }}
      />
      <p className="text-xs text-gray-400">{hint}</p>
    </div>
  );
}

export default function GraphModule() {
  const { t } = useLang();
  const [a, setA] = useState(DEFAULTS.a);
  const [h, setH] = useState(DEFAULTS.h);
  const [k, setK] = useState(DEFAULTS.k);
  const [fnType, setFnType] = useState<FunctionType>("quadratic");

  const reset = () => { setA(1); setH(0); setK(0); };

  const fnTypes: { value: FunctionType; label: string }[] = [
    { value: "quadratic", label: t.quadratic },
    { value: "absolute", label: t.absolute },
    { value: "squareRoot", label: t.squareRoot },
  ];

  const vertexY = fnType === "quadratic" ? k : fnType === "absolute" ? k : k;
  const rangeStr =
    fnType === "quadratic"
      ? a > 0 ? `y ≥ ${k}` : `y ≤ ${k}`
      : fnType === "absolute"
      ? a > 0 ? `y ≥ ${k}` : `y ≤ ${k}`
      : a > 0 ? `y ≥ ${k}` : `y ≤ ${k}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-600 px-6 py-4">
        <h2 className="text-white font-bold text-lg">{t.moduleTitle}</h2>
        <p className="text-indigo-200 text-sm mt-0.5">{t.moduleDesc}</p>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — controls */}
        <div className="space-y-5">
          {/* Function type selector */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t.functionType}
            </p>
            <div className="flex gap-2 flex-wrap">
              {fnTypes.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFnType(value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    fnType === value
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {t.coefficients}
            </p>
            <div className="space-y-4">
              <SliderRow
                label={t.aLabel}
                hint={t.aExplain}
                value={a}
                min={-3}
                max={3}
                step={0.1}
                onChange={setA}
                color="text-indigo-600"
              />
              <SliderRow
                label={t.hLabel}
                hint={t.hExplain}
                value={h}
                min={-8}
                max={8}
                step={0.5}
                onChange={setH}
                color="text-emerald-600"
              />
              <SliderRow
                label={t.kLabel}
                hint={t.kExplain}
                value={k}
                min={-8}
                max={8}
                step={0.5}
                onChange={setK}
                color="text-amber-600"
              />
            </div>
          </div>

          {/* Formula display */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
            <p className="text-xs text-indigo-400 font-medium mb-1">{t.formulaLabel}</p>
            <p className="font-mono text-lg text-indigo-700 font-semibold">
              {formatFormula(fnType, a, h, k)}
            </p>
          </div>

          {/* Info panel */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-gray-400 text-xs">{t.vertex}</p>
              <p className="font-mono font-medium text-gray-700">({h}, {vertexY})</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-gray-400 text-xs">{t.axisOfSymmetry}</p>
              <p className="font-mono font-medium text-gray-700">x = {h}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-gray-400 text-xs">{t.domain}</p>
              <p className="font-mono font-medium text-gray-700">
                {fnType === "squareRoot" ? `x ≥ ${h}` : t.allReals}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-gray-400 text-xs">{t.range}</p>
              <p className="font-mono font-medium text-gray-700">{rangeStr}</p>
            </div>
          </div>

          <button
            onClick={reset}
            className="text-sm text-gray-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 rounded-lg px-4 py-2 transition-colors w-full"
          >
            {t.resetBtn}
          </button>
        </div>

        {/* Right — graph */}
        <div className="flex items-start justify-center">
          <FunctionGraph a={a} h={h} k={k} fnType={fnType} />
        </div>
      </div>
    </div>
  );
}
