"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type GraphVariant =
  | "quadratic" | "linear" | "absolute" | "squareRoot"
  | "composite" | "inverse" | "growth" | "unitCircle"
  | "trigValues" | "identity" | "tangentLine"
  | "derivRules" | "polyDeriv" | "extremum"
  | "antideriv" | "riemann" | "areaBetween"
  | "log" | "logProperty" | "naturalLog" | "hyperbola"
  | "expDeriv" | "lnDeriv" | "trigDeriv" | "tanDeriv"
  | "expIntegral" | "trigIntegral" | "rationalIntegral";

interface Props {
  variant: GraphVariant;
  a?: number; b?: number; h?: number; k?: number;
  n?: number; angle?: number;
}

// ─── Shared canvas utilities ──────────────────────────────────────────────────
const BG    = "#13131f";
const GRID  = "rgba(255,255,255,0.05)";
const AXIS  = "rgba(255,255,255,0.20)";
const LABEL = "rgba(255,255,255,0.35)";
const P1    = "#7F77DD"; // purple
const P2    = "#1D9E75"; // teal
const P3    = "#D85A30"; // coral
const P4    = "#BA7517"; // amber
const GRAY  = "rgba(255,255,255,0.25)";

function makeCoords(W: number, H: number, PAD: number,
    xMin: number, xMax: number, yMin: number, yMax: number) {
  const iW = W - PAD * 2, iH = H - PAD * 2;
  const toX = (x: number) => PAD + ((x - xMin) / (xMax - xMin)) * iW;
  const toY = (y: number) => PAD + ((yMax - y) / (yMax - yMin)) * iH;
  return { iW, iH, toX, toY };
}

function drawAxes(ctx: CanvasRenderingContext2D, W: number, H: number, PAD: number,
    toX: (x: number) => number, toY: (y: number) => number,
    xMin: number, xMax: number, yMin: number, yMax: number) {
  ctx.strokeStyle = GRID; ctx.lineWidth = 1;
  for (let x = Math.ceil(xMin); x <= xMax; x++) {
    ctx.beginPath(); ctx.moveTo(toX(x), PAD); ctx.lineTo(toX(x), H - PAD); ctx.stroke();
  }
  for (let y = Math.ceil(yMin); y <= yMax; y++) {
    ctx.beginPath(); ctx.moveTo(PAD, toY(y)); ctx.lineTo(W - PAD, toY(y)); ctx.stroke();
  }
  ctx.strokeStyle = AXIS; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(PAD, toY(0)); ctx.lineTo(W - PAD, toY(0)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(toX(0), PAD); ctx.lineTo(toX(0), H - PAD); ctx.stroke();
}

function plotFn(ctx: CanvasRenderingContext2D,
    f: (x: number) => number | null, toX: (x: number) => number, toY: (y: number) => number,
    xMin: number, xMax: number, iW: number,
    color: string, lineWidth = 2.5, glow = true) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.lineJoin = "round";
  if (glow) { ctx.shadowBlur = 14; ctx.shadowColor = color; }
  ctx.beginPath();
  let penDown = false;
  const steps = Math.ceil(iW * 2);
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (i / steps) * (xMax - xMin);
    const y = f(x);
    if (y === null || !isFinite(y) || Math.abs(y) > 30) { penDown = false; continue; }
    const cx = toX(x), cy = toY(y);
    if (!penDown) { ctx.moveTo(cx, cy); penDown = true; } else ctx.lineTo(cx, cy);
  }
  ctx.stroke(); ctx.restore();
}

function dot(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.shadowBlur = 10; ctx.shadowColor = color;
  ctx.fill(); ctx.restore();
}

// ─── Variant draw functions ──────────────────────────────────────────────────

function drawLinear(ctx: CanvasRenderingContext2D, W: number, H: number, a: number, b: number) {
  const PAD = 32; const { iW, toX, toY } = makeCoords(W, H, PAD, -8, 8, -6, 6);
  drawAxes(ctx, W, H, PAD, toX, toY, -8, 8, -6, 6);
  plotFn(ctx, (x) => a * x + b, toX, toY, -8, 8, iW, P1);
  ctx.fillStyle = LABEL; ctx.font = "bold 12px monospace";
  ctx.fillText(`f(x) = ${a}x ${b >= 0 ? "+" : "−"} ${Math.abs(b)}`, PAD + 4, PAD + 16);
}

function drawAbsolute(ctx: CanvasRenderingContext2D, W: number, H: number, a: number, h: number, k: number) {
  const PAD = 32; const { iW, toX, toY } = makeCoords(W, H, PAD, -8, 8, -6, 6);
  drawAxes(ctx, W, H, PAD, toX, toY, -8, 8, -6, 6);
  plotFn(ctx, (x) => a * Math.abs(x - h) + k, toX, toY, -8, 8, iW, P1);
  dot(ctx, toX(h), toY(k), 5, "#f43f5e");
  ctx.fillStyle = LABEL; ctx.font = "bold 12px monospace";
  ctx.fillText(`f(x) = ${a}|x − ${h}| + ${k}`, PAD + 4, PAD + 16);
}

function drawComposite(ctx: CanvasRenderingContext2D, W: number, H: number, _a: number) {
  const PAD = 32; const { iW, toX, toY } = makeCoords(W, H, PAD, -4, 4, -2, 10);
  drawAxes(ctx, W, H, PAD, toX, toY, -4, 4, -2, 10);
  // g(x) = x²+1
  plotFn(ctx, (x) => x * x + 1, toX, toY, -4, 4, iW, P2, 2);
  // f(x) = 2x-1
  plotFn(ctx, (x) => 2 * x - 1, toX, toY, -4, 4, iW, P3, 2);
  // f(g(x)) = 2(x²+1)-1 = 2x²+1
  plotFn(ctx, (x) => 2 * x * x + 1, toX, toY, -4, 4, iW, P1, 2.5);
  ctx.fillStyle = P2; ctx.font = "11px monospace"; ctx.fillText("g(x)=x²+1", PAD + 4, H - PAD - 28);
  ctx.fillStyle = P3; ctx.fillText("f(x)=2x−1", PAD + 4, H - PAD - 14);
  ctx.fillStyle = P1; ctx.fillText("f(g(x))=2x²+1", PAD + 4, H - PAD);
}

function drawInverse(ctx: CanvasRenderingContext2D, W: number, H: number, a: number) {
  const PAD = 32; const { iW, toX, toY } = makeCoords(W, H, PAD, -6, 6, -6, 6);
  drawAxes(ctx, W, H, PAD, toX, toY, -6, 6, -6, 6);
  // y=x symmetry line
  ctx.save(); ctx.strokeStyle = GRAY; ctx.lineWidth = 1; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(toX(-6), toY(-6)); ctx.lineTo(toX(6), toY(6)); ctx.stroke();
  ctx.setLineDash([]); ctx.restore();
  // f(x) = ax + 2
  const sa = a === 0 ? 1 : a;
  plotFn(ctx, (x) => sa * x + 2, toX, toY, -6, 6, iW, P1);
  // f⁻¹(x) = (x-2)/a
  plotFn(ctx, (x) => (x - 2) / sa, toX, toY, -6, 6, iW, P2);
  ctx.fillStyle = P1; ctx.font = "11px monospace"; ctx.fillText(`f(x)=${sa}x+2`, PAD + 4, H - PAD - 14);
  ctx.fillStyle = P2; ctx.fillText(`f⁻¹(x)=(x−2)/${sa}`, PAD + 4, H - PAD);
}

function drawGrowth(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const PAD = 32; const { iW, toX, toY } = makeCoords(W, H, PAD, -3, 3, -4, 4);
  drawAxes(ctx, W, H, PAD, toX, toY, -3, 3, -4, 4);
  const f = (x: number) => x * x * x - 3 * x;
  const fp = (x: number) => 3 * x * x - 3;
  const steps = Math.ceil(iW * 2);
  // Color segments
  for (let seg = 0; seg < steps; seg++) {
    const x = -3 + (seg / steps) * 6;
    const color = fp(x) >= 0 ? "rgba(74,222,128,0.7)" : "rgba(248,113,113,0.7)";
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(toX(x), toY(f(x)));
    ctx.lineTo(toX(x + 6 / steps), toY(f(x + 6 / steps)));
    ctx.stroke(); ctx.restore();
  }
  dot(ctx, toX(-1), toY(f(-1)), 5, "#4ade80");
  dot(ctx, toX(1), toY(f(1)), 5, "#f87171");
  ctx.fillStyle = "#4ade80"; ctx.font = "11px monospace"; ctx.fillText("↑ өсөх", PAD + 4, H - PAD - 14);
  ctx.fillStyle = "#f87171"; ctx.fillText("↓ буурах", PAD + 4, H - PAD);
}

function drawUnitCircle(ctx: CanvasRenderingContext2D, W: number, H: number, angleDeg: number) {
  const cx = W / 2, cy = H / 2;
  const r = Math.min(W, H) * 0.37;
  const rad = (angleDeg * Math.PI) / 180;
  const px = cx + r * Math.cos(rad);
  const py = cy - r * Math.sin(rad);

  // Circle
  ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  // Axes
  ctx.strokeStyle = AXIS; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx - r - 12, cy); ctx.lineTo(cx + r + 12, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - r - 12); ctx.lineTo(cx, cy + r + 12); ctx.stroke();
  // Angle arc
  ctx.strokeStyle = P4; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.22, 0, -rad, rad < 0); ctx.stroke();
  // Radius
  ctx.save(); ctx.strokeStyle = P1; ctx.lineWidth = 2.5; ctx.shadowBlur = 12; ctx.shadowColor = P1;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke(); ctx.restore();
  // sin dashed
  ctx.save(); ctx.strokeStyle = P3; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
  ctx.setLineDash([]); ctx.restore();
  // cos dashed
  ctx.save(); ctx.strokeStyle = P2; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(px, py); ctx.stroke();
  ctx.setLineDash([]); ctx.restore();
  // Point
  dot(ctx, px, py, 5, P1);
  // Labels
  ctx.font = "bold 11px monospace";
  ctx.fillStyle = P3; ctx.fillText(`sin = ${Math.sin(rad).toFixed(2)}`, 8, H - 28);
  ctx.fillStyle = P2; ctx.fillText(`cos = ${Math.cos(rad).toFixed(2)}`, 8, H - 12);
  ctx.fillStyle = P4; ctx.fillText(`θ = ${angleDeg}°`, W - 60, 20);
}

function drawTrigValues(ctx: CanvasRenderingContext2D, W: number, H: number, angleDeg: number) {
  const PAD = 32;
  const xRange = Math.PI * 2.5;
  const { iW, toX, toY } = makeCoords(W, H, PAD, -xRange, xRange, -2, 2);
  drawAxes(ctx, W, H, PAD, toX, toY, -xRange, xRange, -2, 2);
  plotFn(ctx, Math.sin, toX, toY, -xRange, xRange, iW, P1);
  plotFn(ctx, Math.cos, toX, toY, -xRange, xRange, iW, P2);
  const xLine = (angleDeg * Math.PI) / 180;
  ctx.save(); ctx.strokeStyle = P4; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.moveTo(toX(xLine), PAD); ctx.lineTo(toX(xLine), H - PAD); ctx.stroke();
  ctx.setLineDash([]); ctx.restore();
  ctx.fillStyle = P1; ctx.font = "11px monospace"; ctx.fillText("sin(x)", PAD + 4, PAD + 16);
  ctx.fillStyle = P2; ctx.fillText("cos(x)", PAD + 4, PAD + 30);
}

function drawIdentity(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const PAD = 32;
  const xRange = Math.PI * 2;
  const { iW, toX, toY } = makeCoords(W, H, PAD, -xRange, xRange, -0.3, 1.3);
  drawAxes(ctx, W, H, PAD, toX, toY, -xRange, xRange, -0.3, 1.3);
  plotFn(ctx, (x) => Math.sin(x) ** 2, toX, toY, -xRange, xRange, iW, P1);
  plotFn(ctx, (x) => Math.cos(x) ** 2, toX, toY, -xRange, xRange, iW, P3);
  plotFn(ctx, () => 1, toX, toY, -xRange, xRange, iW, "rgba(255,255,255,0.5)", 1.5, false);
  ctx.fillStyle = P1; ctx.font = "11px monospace"; ctx.fillText("sin²(x)", PAD + 4, PAD + 16);
  ctx.fillStyle = P3; ctx.fillText("cos²(x)", PAD + 4, PAD + 30);
  ctx.fillStyle = GRAY; ctx.fillText("sin²+cos²=1", PAD + 4, PAD + 44);
}

function drawTangentLine(ctx: CanvasRenderingContext2D, W: number, H: number, xVal: number) {
  const PAD = 32; const { iW, toX, toY } = makeCoords(W, H, PAD, -4, 4, -1, 8);
  drawAxes(ctx, W, H, PAD, toX, toY, -4, 4, -1, 8);
  plotFn(ctx, (x) => x * x, toX, toY, -4, 4, iW, P1);
  const slope = 2 * xVal;
  const yAt = xVal * xVal;
  plotFn(ctx, (x) => slope * (x - xVal) + yAt, toX, toY, -4, 4, iW, P2, 2);
  dot(ctx, toX(xVal), toY(yAt), 5, "#f43f5e");
  ctx.fillStyle = P2; ctx.font = "11px monospace";
  ctx.fillText(`налуу f'(${xVal.toFixed(1)}) = ${slope.toFixed(1)}`, PAD + 4, H - PAD);
}

function drawDerivRules(ctx: CanvasRenderingContext2D, W: number, H: number, a: number) {
  const PAD = 32; const { iW, toX, toY } = makeCoords(W, H, PAD, -4, 4, -6, 6);
  drawAxes(ctx, W, H, PAD, toX, toY, -4, 4, -6, 6);
  plotFn(ctx, (x) => a * x * x, toX, toY, -4, 4, iW, P1);
  plotFn(ctx, (x) => 2 * a * x, toX, toY, -4, 4, iW, P2);
  ctx.fillStyle = P1; ctx.font = "11px monospace"; ctx.fillText(`f(x)=${a}x²`, PAD + 4, PAD + 16);
  ctx.fillStyle = P2; ctx.fillText(`f'(x)=${2 * a}x`, PAD + 4, PAD + 30);
}

function drawPolyDeriv(ctx: CanvasRenderingContext2D, W: number, H: number, a: number) {
  const PAD = 32; const { iW, toX, toY } = makeCoords(W, H, PAD, -3, 3, -6, 6);
  drawAxes(ctx, W, H, PAD, toX, toY, -3, 3, -6, 6);
  plotFn(ctx, (x) => a * x * x * x - 3 * x, toX, toY, -3, 3, iW, P1);
  plotFn(ctx, (x) => 3 * a * x * x - 3, toX, toY, -3, 3, iW, P2);
  ctx.fillStyle = P1; ctx.font = "11px monospace"; ctx.fillText(`f(x)=${a}x³−3x`, PAD + 4, PAD + 16);
  ctx.fillStyle = P2; ctx.fillText(`f'(x)=${3 * a}x²−3`, PAD + 4, PAD + 30);
}

function drawExtremum(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const PAD = 32; const { iW, toX, toY } = makeCoords(W, H, PAD, -3, 3, -4, 4);
  drawAxes(ctx, W, H, PAD, toX, toY, -3, 3, -4, 4);
  const f = (x: number) => x * x * x - 3 * x;
  plotFn(ctx, f, toX, toY, -3, 3, iW, P1);
  dot(ctx, toX(-1), toY(f(-1)), 6, "#4ade80");
  dot(ctx, toX(1), toY(f(1)), 6, "#f87171");
  ctx.fillStyle = "#4ade80"; ctx.font = "11px monospace";
  ctx.fillText(`max(-1, ${f(-1)})`, toX(-1) + 8, toY(f(-1)) - 6);
  ctx.fillStyle = "#f87171";
  ctx.fillText(`min(1, ${f(1)})`, toX(1) + 8, toY(f(1)) + 14);
}

function drawAntideriv(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const PAD = 32; const { iW, toX, toY } = makeCoords(W, H, PAD, -4, 4, -4, 8);
  drawAxes(ctx, W, H, PAD, toX, toY, -4, 4, -4, 8);
  plotFn(ctx, (x) => 2 * x, toX, toY, -4, 4, iW, P2, 2);
  plotFn(ctx, (x) => x * x, toX, toY, -4, 4, iW, P1);
  ctx.fillStyle = P2; ctx.font = "11px monospace"; ctx.fillText("f(x)=2x", PAD + 4, PAD + 16);
  ctx.fillStyle = P1; ctx.fillText("F(x)=x²+C", PAD + 4, PAD + 30);
}

function drawRiemann(ctx: CanvasRenderingContext2D, W: number, H: number, nRaw: number) {
  const n = Math.max(2, Math.round(nRaw));
  const PAD = 32; const { iW, toX, toY } = makeCoords(W, H, PAD, -1, 3, -0.5, 5);
  drawAxes(ctx, W, H, PAD, toX, toY, -1, 3, -0.5, 5);
  const f = (x: number) => x * x + 0.5;
  const aVal = 0, bVal = 2;
  const dx = (bVal - aVal) / n;
  for (let i = 0; i < n; i++) {
    const xi = aVal + i * dx;
    const height = f(xi);
    ctx.fillStyle = "rgba(127,119,221,0.25)";
    ctx.strokeStyle = P1; ctx.lineWidth = 1;
    const x0 = toX(xi), x1 = toX(xi + dx);
    const y0 = toY(0), y1 = toY(height);
    ctx.fillRect(x0, y1, x1 - x0, y0 - y1);
    ctx.strokeRect(x0, y1, x1 - x0, y0 - y1);
  }
  plotFn(ctx, f, toX, toY, -1, 3, iW, P1);
  ctx.fillStyle = P4; ctx.font = "11px monospace";
  ctx.fillText(`n = ${n} тэгш өнцөгт`, PAD + 4, H - PAD);
}

function drawAreaBetween(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const PAD = 32; const { iW, toX, toY } = makeCoords(W, H, PAD, -0.5, 1.5, -0.5, 1.5);
  drawAxes(ctx, W, H, PAD, toX, toY, -0.5, 1.5, -0.5, 1.5);
  const steps = Math.ceil(iW * 2);
  // Filled area between y=x and y=x²
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(0));
  for (let i = 0; i <= steps; i++) {
    const x = i / steps;
    ctx.lineTo(toX(x), toY(x));
  }
  for (let i = steps; i >= 0; i--) {
    const x = i / steps;
    ctx.lineTo(toX(x), toY(x * x));
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(127,119,221,0.2)"; ctx.fill();
  plotFn(ctx, (x) => x, toX, toY, -0.5, 1.5, iW, P2);
  plotFn(ctx, (x) => x * x, toX, toY, -0.5, 1.5, iW, P1);
  ctx.fillStyle = P2; ctx.font = "11px monospace"; ctx.fillText("y = x", PAD + 4, PAD + 16);
  ctx.fillStyle = P1; ctx.fillText("y = x²", PAD + 4, PAD + 30);
  ctx.fillStyle = GRAY; ctx.fillText("S = 1/6", PAD + 4, PAD + 44);
}

function drawLog(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const PAD = 32; const { iW, toX, toY } = makeCoords(W, H, PAD, -1, 5, -3, 5);
  drawAxes(ctx, W, H, PAD, toX, toY, -1, 5, -3, 5);
  ctx.save(); ctx.strokeStyle = GRAY; ctx.lineWidth = 1; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(toX(-1), toY(-1)); ctx.lineTo(toX(5), toY(5)); ctx.stroke();
  ctx.setLineDash([]); ctx.restore();
  plotFn(ctx, (x) => (x <= 0 ? null : Math.log2(x)), toX, toY, -1, 5, iW, P1);
  plotFn(ctx, (x) => Math.pow(2, x), toX, toY, -1, 5, iW, P2);
  ctx.fillStyle = P1; ctx.font = "11px monospace"; ctx.fillText("y=log₂(x)", PAD + 4, PAD + 16);
  ctx.fillStyle = P2; ctx.fillText("y=2ˣ", PAD + 4, PAD + 30);
}

function drawLogProperty(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const PAD = 32; const { iW, toX, toY } = makeCoords(W, H, PAD, 0.2, 5, -1, 4);
  drawAxes(ctx, W, H, PAD, toX, toY, 0.2, 5, -1, 4);
  plotFn(ctx, (x) => (x <= 0 ? null : Math.log2(x)), toX, toY, 0.2, 5, iW, P1, 2);
  plotFn(ctx, (x) => (x <= 0 ? null : Math.log2(x) + 1), toX, toY, 0.2, 5, iW, P2, 2);
  ctx.fillStyle = P1; ctx.font = "11px monospace"; ctx.fillText("log₂(x)", PAD + 4, PAD + 16);
  ctx.fillStyle = P2; ctx.fillText("log₂(2x)=log₂(x)+1", PAD + 4, PAD + 30);
}

function drawNaturalLog(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const PAD = 32; const { iW, toX, toY } = makeCoords(W, H, PAD, -2, 4, -3, 5);
  drawAxes(ctx, W, H, PAD, toX, toY, -2, 4, -3, 5);
  ctx.save(); ctx.strokeStyle = GRAY; ctx.lineWidth = 1; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(toX(-2), toY(-2)); ctx.lineTo(toX(4), toY(4)); ctx.stroke();
  ctx.setLineDash([]); ctx.restore();
  plotFn(ctx, (x) => Math.exp(x), toX, toY, -2, 4, iW, P1);
  plotFn(ctx, (x) => (x <= 0 ? null : Math.log(x)), toX, toY, -2, 4, iW, P2);
  ctx.fillStyle = P1; ctx.font = "11px monospace"; ctx.fillText("y=eˣ", PAD + 4, PAD + 16);
  ctx.fillStyle = P2; ctx.fillText("y=ln(x)", PAD + 4, PAD + 30);
}

function drawHyperbola(ctx: CanvasRenderingContext2D, W: number, H: number, k: number) {
  const PAD = 32; const { iW, toX, toY } = makeCoords(W, H, PAD, -5, 5, -5, 5);
  drawAxes(ctx, W, H, PAD, toX, toY, -5, 5, -5, 5);
  const kv = k === 0 ? 1 : k;
  plotFn(ctx, (x) => (Math.abs(x) < 0.1 ? null : kv / x), toX, toY, -5, 5, iW, P1);
  ctx.fillStyle = P1; ctx.font = "11px monospace"; ctx.fillText(`y = ${kv}/x`, PAD + 4, PAD + 16);
}

function drawTwoFns(ctx: CanvasRenderingContext2D, W: number, H: number,
    f1: (x: number) => number | null, f2: (x: number) => number | null,
    label1: string, label2: string,
    xMin = -Math.PI * 3, xMax = Math.PI * 3, yMin = -4, yMax = 4) {
  const PAD = 32; const { iW, toX, toY } = makeCoords(W, H, PAD, xMin, xMax, yMin, yMax);
  drawAxes(ctx, W, H, PAD, toX, toY, xMin, xMax, yMin, yMax);
  plotFn(ctx, f1, toX, toY, xMin, xMax, iW, P1);
  plotFn(ctx, f2, toX, toY, xMin, xMax, iW, P2);
  ctx.fillStyle = P1; ctx.font = "11px monospace"; ctx.fillText(label1, PAD + 4, PAD + 16);
  ctx.fillStyle = P2; ctx.fillText(label2, PAD + 4, PAD + 30);
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GraphCanvas({ variant, a = 1, b = 0, h = 0, k = 1, n = 6, angle = 45 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const paramsRef    = useRef({ variant, a, b, h, k, n, angle });
  paramsRef.current  = { variant, a, b, h, k, n, angle };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { variant, a, b, h, k, n, angle } = paramsRef.current;
    const dpr = window.devicePixelRatio || 1;
    const ctx  = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width / dpr, H = canvas.height / dpr;
    if (W <= 0 || H <= 0) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

    switch (variant) {
      case "linear":          drawLinear(ctx, W, H, a, b); break;
      case "absolute":        drawAbsolute(ctx, W, H, a, h, k); break;
      case "composite":       drawComposite(ctx, W, H, a); break;
      case "inverse":         drawInverse(ctx, W, H, a); break;
      case "growth":          drawGrowth(ctx, W, H); break;
      case "unitCircle":      drawUnitCircle(ctx, W, H, angle); break;
      case "trigValues":      drawTrigValues(ctx, W, H, angle); break;
      case "identity":        drawIdentity(ctx, W, H); break;
      case "tangentLine":     drawTangentLine(ctx, W, H, h); break;
      case "derivRules":      drawDerivRules(ctx, W, H, a); break;
      case "polyDeriv":       drawPolyDeriv(ctx, W, H, a); break;
      case "extremum":        drawExtremum(ctx, W, H); break;
      case "antideriv":       drawAntideriv(ctx, W, H); break;
      case "riemann":         drawRiemann(ctx, W, H, n); break;
      case "areaBetween":     drawAreaBetween(ctx, W, H); break;
      case "log":             drawLog(ctx, W, H); break;
      case "logProperty":     drawLogProperty(ctx, W, H); break;
      case "naturalLog":      drawNaturalLog(ctx, W, H); break;
      case "hyperbola":       drawHyperbola(ctx, W, H, k); break;
      case "expDeriv":
        drawTwoFns(ctx, W, H, (x) => Math.exp(x), (x) => Math.exp(x), "y=eˣ", "(eˣ)'=eˣ", -2, 3, -1, 8); break;
      case "lnDeriv":
        drawTwoFns(ctx, W, H, (x) => x <= 0 ? null : Math.log(x), (x) => x <= 0 ? null : 1 / x, "y=ln(x)", "(lnx)'=1/x", -0.5, 4, -3, 4); break;
      case "trigDeriv":
        drawTwoFns(ctx, W, H, Math.sin, Math.cos, "(sinx)'=cosx", "y=cosx"); break;
      case "tanDeriv":
        drawTwoFns(ctx, W, H,
          (x) => Math.abs(Math.cos(x)) < 0.05 ? null : Math.tan(x),
          (x) => Math.abs(Math.cos(x)) < 0.05 ? null : 1 / (Math.cos(x) ** 2),
          "y=tan(x)", "(tanx)'=1/cos²x", -Math.PI * 1.4, Math.PI * 1.4, -6, 6); break;
      case "expIntegral":
        drawTwoFns(ctx, W, H, (x) => Math.exp(x), (x) => Math.exp(x), "f(x)=eˣ", "∫eˣdx=eˣ+C", -2, 2, -0.5, 7); break;
      case "trigIntegral":
        drawTwoFns(ctx, W, H, Math.sin, (x) => -Math.cos(x), "f(x)=sinx", "∫sinxdx=−cosx+C"); break;
      case "rationalIntegral":
        drawTwoFns(ctx, W, H,
          (x) => x === 0 ? null : 1 / x,
          (x) => x === 0 ? null : Math.log(Math.abs(x)),
          "y=1/x", "∫(1/x)dx=ln|x|+C", -3, 3, -3, 3); break;
      default: {
        // quadratic / squareRoot fallback — draw quadratic y=a(x-h)²+k
        const PAD = 32; const { iW: iW2, toX, toY } = makeCoords(W, H, PAD, -8, 8, -6, 6);
        drawAxes(ctx, W, H, PAD, toX, toY, -8, 8, -6, 6);
        plotFn(ctx, (x) => a * (x - h) ** 2 + k, toX, toY, -8, 8, iW2, P1);
      }
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width } = e.contentRect;
        if (width === 0) continue;
        const height = Math.round(width * (400 / 480));
        canvas.width  = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width  = `${width}px`;
        canvas.style.height = `${height}px`;
        draw();
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [draw]);

  useEffect(() => { draw(); }, [variant, a, b, h, k, n, angle, draw]);

  return (
    <div ref={containerRef} className="w-full max-w-lg">
      <canvas ref={canvasRef} className="block rounded-xl border border-white/10" />
    </div>
  );
}
