"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Lang, translations } from "./i18n";

type Translation = typeof translations[Lang];

interface LangContextType {
  lang: Lang;
  t: Translation;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextType | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("mn");
  const toggleLang = () => setLang((l) => (l === "mn" ? "en" : "mn"));
  return (
    <LangContext.Provider value={{ lang, t: translations[lang], toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
