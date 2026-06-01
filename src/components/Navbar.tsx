"use client";

import { useLang } from "@/lib/LangContext";

export default function Navbar() {
  const { t, toggleLang, lang } = useLang();
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">O</span>
          </div>
          <div>
            <span className="font-bold text-gray-900">{t.siteName}</span>
            <span className="hidden sm:inline text-gray-400 text-xs ml-2">{t.siteTagline}</span>
          </div>
        </div>
        <button
          onClick={toggleLang}
          className="text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition-colors"
          aria-label="Toggle language"
        >
          {lang === "mn" ? "🇬🇧 English" : "🇲🇳 Монгол"}
        </button>
      </div>
    </header>
  );
}
