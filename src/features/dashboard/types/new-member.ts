export type MemberAlertLevel = "red" | "yellow" | "green";

export interface RecentMember {
  id: string;
  username: string;
  avatar: string | null;
  joinedAt: string;
  accountCreatedAt: string | null;
  bot: boolean;
  verifiedBot: boolean;
  alertLevel: MemberAlertLevel;
  alertReasons: string[];
}

export type NewMember = RecentMember & {
  discordId: string;
};
