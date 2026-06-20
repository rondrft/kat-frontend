import type { LucideIcon } from "lucide-react";
import { Mic2, Users } from "lucide-react";

export type OverviewExtraFeature = {
  id: "tempVoice" | "autoRoles";
  icon: LucideIcon;
  bgImage?: string;
};

export const overviewExtraFeatures: OverviewExtraFeature[] = [
  {
    id: "tempVoice",
    icon: Mic2,
    bgImage: "/bunnybg.jpeg",
  },
  {
    id: "autoRoles",
    icon: Users,
  },
];
