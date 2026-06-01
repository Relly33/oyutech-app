"use client";
import { ReactNode } from "react";
import { LangProvider } from "@/lib/LangContext";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <LangProvider>{children}</LangProvider>;
}
