"use client";

import { useState, useRef, useEffect } from "react";
import type { HintContent, HoverHintToken } from "@/lib/lessons";

export default function HoverToken({
  hint,
  children,
}: {
  hint: HintContent;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const touchActiveRef = useRef(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!visible) return;
    const dismiss = (e: Event) => {
      if (!containerRef.current?.contains(e.target as Node)) setVisible(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [visible]);

  return (
    <span
      ref={containerRef}
      className="relative inline-block"
      tabIndex={0}
      style={{ outline: "none", cursor: "help" }}
      onMouseEnter={() => { if (!touchActiveRef.current) setVisible(true); }}
      onMouseLeave={() => { if (!touchActiveRef.current) setVisible(false); }}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
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
          className="hover-tooltip"
          style={{
            position: "absolute",
            zIndex: 50,
            bottom: "calc(100% + 8px)",
            left: "50%",
            width: "240px",
            borderRadius: "12px",
            padding: "12px",
            pointerEvents: "none",
            background: "#1a1a2e",
            border: "1px solid rgba(127,119,221,0.4)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}
        >
          <span style={{ display: "block", fontSize: "11px", fontWeight: 700, marginBottom: "4px", color: "#7F77DD" }}>
            {hint.title}
          </span>
          <span style={{ display: "block", fontSize: "11px", lineHeight: 1.5, marginBottom: "8px", color: "#cccccc" }}>
            {hint.body}
          </span>
          <span style={{ display: "block", fontSize: "11px", fontFamily: "monospace", borderRadius: "6px", padding: "4px 8px", background: "rgba(127,119,221,0.15)", color: "#a89fea" }}>
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
