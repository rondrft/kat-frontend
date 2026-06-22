export type Guild = {
  id: string;
  name: string;
  icon: string | null;
  memberCount: number;
  botJoined: boolean;
  canManage?: boolean;
  inviteUrl?: string | null;
  premiumTier?: number;
};

export type GuildSettings = {
  guildId: string;
  prefix: string;
  locale: string;
  moderationEnabled: boolean;
};

export type DashboardAccess = {
  allowedUserIds: string[];
  allowedRoleIds: string[];
};
