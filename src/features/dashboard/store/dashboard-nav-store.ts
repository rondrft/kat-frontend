import { create } from "zustand";
import type { DashboardSectionId } from "@/features/dashboard/types";

type DashboardNavStore = {
  activeSection: DashboardSectionId;
  setActiveSection: (section: DashboardSectionId) => void;
};

export const useDashboardNavStore = create<DashboardNavStore>((set) => ({
  activeSection: "dashboard",
  setActiveSection: (activeSection) => set({ activeSection }),
}));
