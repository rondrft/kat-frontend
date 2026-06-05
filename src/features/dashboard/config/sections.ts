import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Activity,
  LayoutDashboard,
  PartyPopper,
  Crown,
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
    id: "activity",
    label: "Activity",
    title: "Activity",
    description: "Audit logs and message ranking.",
    icon: Activity,
  },
  {
    id: "analytics",
    label: "Statistics",
    title: "Statistics",
    description: "Server numbers, boosts, channels, and active modules.",
    icon: BarChart3,
  },
  {
    id: "premium",
    label: "Premium",
    title: "Premium",
    description: "Unlock advanced tools, unlimited limits, and priority support.",
    icon: Crown,
  },
];

export const dashboardSectionMap = Object.fromEntries(
  dashboardSections.map((s) => [s.id, s]),
) as Record<DashboardSectionId, DashboardSectionConfig>;
