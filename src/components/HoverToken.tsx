"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";
import type { HintContent, HoverHintToken } from "@/lib/lessons";

const TOOLTIP_W = 240;
const SPACE_THRESHOLD = 120; // px above token; below this → flip down
const EDGE_PAD = 8;          // min gap from viewport edges

export default function HoverToken({
  hint,
  children,
}: {
  hint: HintContent;
  children: React.ReactNode;
}) {
  const [visible, setVisible]       = useState(false);
  const [direction, setDirection]   = useState<"above" | "below">("above");
  const [marginLeft, setMarginLeft] = useState(-TOOLTIP_W / 2);

  const containerRef    = useRef<HTMLSpanElement>(null);
  const touchActiveRef  = useRef(false);

  // Compute flip direction and horizontal clamp before the browser paints.
  useLayoutEffect(() => {
    if (!visible) return;

    const compute = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vw   = window.innerWidth;
      const tokenCenterX = rect.left + rect.width / 2;

      setDirection(rect.top < SPACE_THRESHOLD ? "below" : "above");

      const rawLeft  = tokenCenterX - TOOLTIP_W / 2;
      const rawRight = tokenCenterX + TOOLTIP_W / 2;
      let adj = 0;
      if (rawLeft < EDGE_PAD)        adj = EDGE_PAD - rawLeft;
      else if (rawRight > vw - EDGE_PAD) adj = (vw - EDGE_PAD) - rawRight;
      setMarginLeft(-TOOLTIP_W / 2 + adj);
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [visible]);

  // Dismiss when clicking/tapping outside.
  useEffect(() => {
    if (!visible) return;
    const dismiss = (e: Event) => {
      if (!containerRef.current?.contains(e.target as Node)) setVisible(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [visible]);

  // Caret offset within the tooltip (tracks token centre even when clamped).
  const caretOffset = `${(-marginLeft / TOOLTIP_W) * 100}%`;

  const posStyle = direction === "above"
    ? { bottom: "calc(100% + 6px)", top: "auto"  }
    : { top:    "calc(100% + 6px)", bottom: "auto" };

  return (
    <span
      ref={containerRef}
      className="relative inline-block"
      tabIndex={0}
      style={{ outline: "none", cursor: "help" }}
      onMouseEnter={() => { if (!touchActiveRef.current) setVisible(true);  }}
      onMouseLeave={() => { if (!touchActiveRef.current) setVisible(false); }}
      onFocus={() => setVisible(true)}
      onBlur={()  => setVisible(false)}
      onTouchStart={(e) => {
        e.stopPropagation();
        touchActiveRef.current = true;
        setVisible((v) => !v);
        setTimeout(() => { touchActiveRef.current = false; }, 400);
      }}
    >
      <span style={{ borderBottom: "1.5px dashed rgba(127,119,221,0.55)", color: "#b3adf0" }}>
        {children}
      </span>

      {visible && (
        <span
          className={`hover-tooltip ${direction === "above" ? "tooltip-caret-above" : "tooltip-caret-below"}`}
          style={{
            position: "absolute",
            zIndex: 50,
            left: "50%",
            marginLeft: `${marginLeft}px`,
            width: `${TOOLTIP_W}px`,
            borderRadius: "12px",
            padding: "12px",
            pointerEvents: "none",
            background: "#1a1a2e",
            border: "1px solid rgba(127,119,221,0.4)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            "--caret-offset": caretOffset,
            ...posStyle,
          } as React.CSSProperties}
        >
          <span style={{ display:"block", fontSize:"11px", fontWeight:700, marginBottom:"4px", color:"#7F77DD" }}>
            {hint.title}
          </span>
          <span style={{ display:"block", fontSize:"11px", lineHeight:1.5, marginBottom:"8px", color:"#cccccc" }}>
            {hint.body}
          </span>
          <span style={{ display:"block", fontSize:"11px", fontFamily:"monospace", borderRadius:"6px", padding:"4px 8px", background:"rgba(127,119,221,0.15)", color:"#a89fea" }}>
            {hint.formula}
          </span>
        </span>
      )}
    </span>
  );
}

export function renderWithTokens(text: string, tokens?: HoverHintToken[]) {
  if (!tokens || tokens.length === 0) return text;

  const result: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let earliest = -1;
    let matched: HoverHintToken | null = null;

    for (const token of tokens) {
      const idx = remaining.indexOf(token.match);
      if (idx !== -1 && (earliest === -1 || idx < earliest)) {
        earliest = idx;
        matched = token;
      }
    }

    if (!matched) {
      result.push(remaining);
      break;
    }

    if (earliest > 0) result.push(remaining.slice(0, earliest));

    result.push(
      <HoverToken key={key++} hint={matched.hint}>
        {matched.match}
      </HoverToken>
    );

    remaining = remaining.slice(earliest + matched.match.length);
  }

  return result;
}
