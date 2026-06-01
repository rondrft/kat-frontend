import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  LayoutDashboard,
  PartyPopper,
  Music,
  Settings,
  Shield,
} from "lucide-react";
import type { DashboardSectionId } from "@/features/dashboard/types";

export type DashboardSectionConfig = {
  id: DashboardSectionId;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const dashboardSections: DashboardSectionConfig[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    title: "Overview",
    description: "Your command center for Kat.",
    icon: LayoutDashboard,
  },
  {
    id: "servers",
    label: "Welcomes",
    title: "Welcomes",
    description: "Design welcome and boost messages.",
    icon: PartyPopper,
  },
  {
    id: "moderation",
    label: "Moderation",
    title: "Moderation",
    description: "Rules, filters, and safety tools.",
    icon: Shield,
  },
  {
    id: "music",
    label: "Music",
    title: "Music",
    description: "Playback and queue controls.",
    icon: Music,
  },
  {
    id: "settings",
    label: "Settings",
    title: "Settings",
    description: "Bot preferences and integrations.",
    icon: Settings,
  },
  {
    id: "analytics",
    label: "Statistics",
    title: "Statistics",
    description: "Server numbers, boosts, channels, and active modules.",
    icon: BarChart3,
  },
];

export const dashboardSectionMap = Object.fromEntries(
  dashboardSections.map((s) => [s.id, s]),
) as Record<DashboardSectionId, DashboardSectionConfig>;
