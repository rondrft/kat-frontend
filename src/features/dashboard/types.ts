export const dashboardSectionIds = [
  "dashboard",
  "servers",
  "moderation",
  "music",
  "settings",
  "analytics",
] as const;

export type DashboardSectionId = (typeof dashboardSectionIds)[number];
