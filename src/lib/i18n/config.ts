export const defaultLocale = "en" as const;
export const locales = ["en", "es", "pt-BR", "fr", "de", "ja"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
  "pt-BR": "Português (Brasil)",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
};
