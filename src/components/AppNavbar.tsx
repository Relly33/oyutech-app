"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { getTotalXP, getStreak } from "@/lib/progress";

interface Props {
  backHref?: string;
  backLabel?: string;
}

export default function AppNavbar({ backHref, backLabel }: Props) {
  const { t, lang, toggleLang } = useLang();
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setXp(getTotalXP());
    setStreak(getStreak());
  }, []);

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 h-14"
      style={{ background: "#13131f", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {backHref ? (
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: "#aaaaaa" }}
          >
            {backLabel ?? t.backHome as string}
          </Link>
        ) : (
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ background: "linear-gradient(135deg,#534AB7,#7F77DD)" }}
            >
              О
            </div>
            <span className="font-bold text-white hidden sm:block">{t.siteName}</span>
          </Link>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <span
          className="flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-lg"
          style={{ background: "rgba(255,255,255,0.06)", color: "#f97316" }}
        >
          🔥 {streak}
        </span>
        <span
          className="flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-lg"
          style={{ background: "rgba(255,255,255,0.06)", color: "#fbbf24" }}
        >
          ⭐ {xp}
        </span>
        <Link
          href="/progress"
          className="text-sm font-medium px-2.5 py-1 rounded-lg transition-colors"
          style={{ background: "rgba(255,255,255,0.06)", color: "#aaaaaa" }}
        >
          📊 {t.progressNav}
        </Link>
        <button
          onClick={toggleLang}
          className="text-xs font-medium px-2 py-1 rounded-lg"
          style={{ background: "rgba(127,119,221,0.15)", color: "#7F77DD" }}
        >
          {lang === "mn" ? "EN" : "МН"}
        </button>
      </div>
    </header>
  );
}
