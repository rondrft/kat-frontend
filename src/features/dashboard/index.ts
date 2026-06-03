export { DashboardShell } from "./components/dashboard-shell";
export { ActivitySection } from "./components/sections/activity-section";
export { NewMembersWidget } from "./components/widgets/new-members-widget";
export {
  useNewMembers,
  newMembersQueryKey,
  RECENT_MEMBERS_WIDGET_LIMIT,
} from "./hooks/use-new-members";
export {
  useMemberJoinStats,
  memberJoinStatsQueryKey,
  MEMBER_JOIN_STATS_DAYS,
} from "./hooks/use-member-join-stats";
export { useDashboardNavStore } from "./store/dashboard-nav-store";
export type { DashboardSectionId } from "./types";
export type { NewMember } from "./types/new-member";
export type { NewMembersWidgetProps } from "./components/widgets/new-members-widget";
