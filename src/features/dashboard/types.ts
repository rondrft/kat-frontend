export const dashboardSectionIds = [
  "dashboard",
  "servers",
  "moderation",
  "activity",
  "analytics",
  "premium",
] as const;

export type DashboardSectionId = (typeof dashboardSectionIds)[number];
