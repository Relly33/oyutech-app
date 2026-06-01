"use client";

import { useEffect, useRef, useCallback } from "react";

export type FunctionType = "quadratic" | "absolute" | "squareRoot";

interface Props {
  a: number;
  h: number;
  k: number;
  fnType: FunctionType;
  dark?: boolean;
}

const PADDING = 40;
const TICK_SIZE = 5;
const X_MIN = -10, X_MAX = 10, Y_MIN = -10, Y_MAX = 10;

function drawGraph(canvas: HTMLCanvasElement, a: number, h: number, k: number, fnType: FunctionType, dark = false) {
  const dpr = window.devicePixelRatio || 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.width / dpr;
  const H = canvas.height / dpr;
  if (W <= 0 || H <= 0) return;

  const innerW = W - PADDING * 2;
  const innerH = H - PADDING * 2;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const toX = (x: number) => PADDING + ((x - X_MIN) / (X_MAX - X_MIN)) * innerW;
  const toY = (y: number) => PADDING + ((Y_MAX - y) / (Y_MAX - Y_MIN)) * innerH;

  // Theme colours
  const bgColor    = dark ? "#13131f" : "#f8fafc";
  const gridColor  = dark ? "rgba(255,255,255,0.05)" : "#e2e8f0";
  const axisColor  = dark ? "rgba(255,255,255,0.20)" : "#64748b";
  const labelColor = dark ? "rgba(255,255,255,0.45)" : "#64748b";
  const curveColor = dark ? "#7F77DD" : "#6366f1";
  const dotColor   = "#f43f5e";

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (let gx = X_MIN; gx <= X_MAX; gx++) {
    ctx.beginPath(); ctx.moveTo(toX(gx), PADDING); ctx.lineTo(toX(gx), H - PADDING); ctx.stroke();
  }
  for (let gy = Y_MIN; gy <= Y_MAX; gy++) {
    ctx.beginPath(); ctx.moveTo(PADDING, toY(gy)); ctx.lineTo(W - PADDING, toY(gy)); ctx.stroke();
  }

  // Axes
  const axisY = toY(0), axisX = toX(0);
  ctx.strokeStyle = axisColor;
  ctx.lineWidth = dark ? 1 : 1.5;
  ctx.beginPath(); ctx.moveTo(PADDING, axisY); ctx.lineTo(W - PADDING, axisY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(axisX, PADDING); ctx.lineTo(axisX, H - PADDING); ctx.stroke();

  // Tick marks & labels
  ctx.fillStyle = labelColor;
  ctx.font = `${Math.max(9, Math.round(W / 44))}px Arial`;
  ctx.textAlign = "center";
  for (let gx = X_MIN; gx <= X_MAX; gx += 2) {
    if (gx === 0) continue;
    const cx = toX(gx);
    ctx.fillText(String(gx), cx, axisY + 14);
    ctx.strokeStyle = labelColor; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, axisY - TICK_SIZE); ctx.lineTo(cx, axisY + TICK_SIZE); ctx.stroke();
  }
  ctx.textAlign = "right";
  for (let gy = Y_MIN; gy <= Y_MAX; gy += 2) {
    if (gy === 0) continue;
    const cy = toY(gy);
    ctx.fillText(String(gy), axisX - 6, cy + 4);
    ctx.strokeStyle = labelColor; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(axisX - TICK_SIZE, cy); ctx.lineTo(axisX + TICK_SIZE, cy); ctx.stroke();
  }

  // Arrow heads
  ctx.fillStyle = axisColor;
  const arr = 7;
  ctx.beginPath(); ctx.moveTo(W - PADDING, axisY); ctx.lineTo(W - PADDING - arr, axisY - arr / 2); ctx.lineTo(W - PADDING - arr, axisY + arr / 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(axisX, PADDING); ctx.lineTo(axisX - arr / 2, PADDING + arr); ctx.lineTo(axisX + arr / 2, PADDING + arr); ctx.fill();

  // Axis labels
  ctx.fillStyle = labelColor;
  ctx.font = `bold ${Math.max(10, Math.round(W / 40))}px Arial`;
  ctx.textAlign = "left";
  ctx.fillText("x", W - PADDING + 4, axisY + 4);
  ctx.textAlign = "center";
  ctx.fillText("y", axisX, PADDING - 6);

  const evaluate = (x: number): number | null => {
    const inner = x - h;
    if (fnType === "quadratic") return a * inner * inner + k;
    if (fnType === "absolute") return a * Math.abs(inner) + k;
    if (fnType === "squareRoot") return inner < 0 ? null : a * Math.sqrt(inner) + k;
    return null;
  };

  // Curve
  if (dark) { ctx.shadowBlur = 16; ctx.shadowColor = "#7F77DD"; }
  ctx.strokeStyle = curveColor;
  ctx.lineWidth = dark ? 3 : 2.5;
  ctx.lineJoin = "round";
  ctx.beginPath();
  const steps = Math.ceil(innerW * 2);
  let penDown = false;
  for (let i = 0; i <= steps; i++) {
    const x = X_MIN + (i / steps) * (X_MAX - X_MIN);
    const y = evaluate(x);
    if (y === null || !isFinite(y)) { penDown = false; continue; }
    const cx = toX(x), cy = toY(y);
    if (cy < PADDING - 2 || cy > H - PADDING + 2) { penDown = false; continue; }
    if (!penDown) { ctx.moveTo(cx, cy); penDown = true; } else { ctx.lineTo(cx, cy); }
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Vertex dot
  const vy = evaluate(h);
  if (vy !== null && isFinite(vy)) {
    const cvx = toX(h), cvy = toY(vy);
    if (cvy >= PADDING && cvy <= H - PADDING) {
      ctx.beginPath(); ctx.arc(cvx, cvy, 5, 0, Math.PI * 2);
      ctx.fillStyle = dotColor; ctx.fill();
      ctx.strokeStyle = dark ? "#0f0f1a" : "#fff"; ctx.lineWidth = 2; ctx.stroke();
    }
  }
}

export default function FunctionGraph({ a, h, k, fnType, dark = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paramsRef = useRef({ a, h, k, fnType, dark });
  paramsRef.current = { a, h, k, fnType, dark };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { a, h, k, fnType, dark } = paramsRef.current;
    drawGraph(canvas, a, h, k, fnType, dark);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width === 0) continue;
        const height = Math.round(width * (400 / 480));
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        redraw();
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [redraw]);

  useEffect(() => { redraw(); }, [a, h, k, fnType, dark, redraw]);

  return (
    <div ref={containerRef} className="w-full max-w-lg">
      <canvas ref={canvasRef} className={`block rounded-xl border ${dark ? "border-white/10" : "border-gray-200"}`} />
    </div>
  );
}
