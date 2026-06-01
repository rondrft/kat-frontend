import { create } from "zustand";
import type { BrandPreset } from "@/config/themes";

type UiStore = {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  brandPreset: BrandPreset;
  locale: "es" | "en";
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setBrandPreset: (preset: BrandPreset) => void;
  setLocale: (locale: "es" | "en") => void;
};

export const useUiStore = create<UiStore>((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  brandPreset: "default",
  locale: "es",
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setBrandPreset: (brandPreset) => set({ brandPreset }),
  setLocale: (locale) => set({ locale }),
}));
