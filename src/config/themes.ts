export const themes = ["light", "dark", "system"] as const;
export type Theme = (typeof themes)[number];

export const themeStorageKey = "kat-theme";

export const brandPresets = {
  default: {
    label: "Kat Blue",
    primary: "214 86% 55%",
    primaryForeground: "0 0% 100%",
  },
  ocean: {
    label: "Ocean",
    primary: "199 89% 48%",
    primaryForeground: "0 0% 100%",
  },
  ember: {
    label: "Ember",
    primary: "24 95% 53%",
    primaryForeground: "0 0% 100%",
  },
} as const;

export type BrandPreset = keyof typeof brandPresets;
