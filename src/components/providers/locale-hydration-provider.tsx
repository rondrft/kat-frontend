"use client";

import { useEffect } from "react";
import { useUiStore } from "@/store/ui-store";
import type { Locale } from "@/lib/i18n";

const STORAGE_KEY = "kat-locale";

function loadLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "es" || stored === "pt-BR" || stored === "fr" || stored === "de" || stored === "ja") return stored;
  } catch {}
  return "en";
}

export function LocaleHydrationProvider({ children }: { children: React.ReactNode }) {
  const locale = useUiStore((s) => s.locale);
  const setLocale = useUiStore((s) => s.setLocale);

  useEffect(() => {
    setLocale(loadLocale());
  }, [setLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {}
  }, [locale]);

  return <>{children}</>;
}
