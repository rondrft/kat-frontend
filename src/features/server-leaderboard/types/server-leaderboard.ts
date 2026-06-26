export type ServerLeaderboardEntry = {
  id: string;
  guildId: string;
  name: string;
  iconUrl: string | null;
  memberCount: number;
  isPublic: boolean;
  showOnLeaderboard: boolean;
};

export type LeaderboardSettings = {
  guildId: string;
  showOnLeaderboard: boolean;
};
