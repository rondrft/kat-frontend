import { create } from "zustand";
import type { BrandPreset } from "@/config/themes";
import type { Locale } from "@/lib/i18n";

type UiStore = {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  brandPreset: BrandPreset;
  locale: Locale;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setBrandPreset: (preset: BrandPreset) => void;
  setLocale: (locale: Locale) => void;
};

export const useUiStore = create<UiStore>((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  brandPreset: "default",
  locale: "en",
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setBrandPreset: (brandPreset) => set({ brandPreset }),
  setLocale: (locale) => set({ locale }),
}));
