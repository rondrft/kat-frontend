export const defaultLocale = "es" as const;
export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  es: "Español",
  en: "English",
};
