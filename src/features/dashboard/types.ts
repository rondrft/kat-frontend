export const dashboardSectionIds = [
  "dashboard",
  "servers",
  "moderation",
  "logs",
  "activity",
  "analytics",
  "premium",
] as const;

export type DashboardSectionId = (typeof dashboardSectionIds)[number];
