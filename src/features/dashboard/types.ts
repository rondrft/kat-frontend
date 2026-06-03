export const dashboardSectionIds = [
  "dashboard",
  "servers",
  "moderation",
  "activity",
  "settings",
  "analytics",
] as const;

export type DashboardSectionId = (typeof dashboardSectionIds)[number];
