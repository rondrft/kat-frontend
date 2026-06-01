import type { LucideIcon } from "lucide-react";
import { Mic2, Users } from "lucide-react";

export type OverviewExtraFeature = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  actionable?: boolean;
};

export const overviewExtraFeatures: OverviewExtraFeature[] = [
  {
    id: "temp-voice",
    title: "Temporary Voice Channel",
    description: "Join-to-create personal voice rooms under a category.",
    icon: Mic2,
    actionable: true,
  },
  {
    id: "auto-roles",
    title: "Auto Roles",
    description: "Assign roles on join, boost, or reaction.",
    icon: Users,
    actionable: true,
  },
];
