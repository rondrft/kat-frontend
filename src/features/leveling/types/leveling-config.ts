export type LevelingConfig = {
  enabled: boolean;
  levelUpChannelId: string | null;
  minXpPerMessage: number;
  maxXpPerMessage: number;
  minXpPerAction: number;
  maxXpPerAction: number;
  cooldownSeconds: number;
  excludedChannelIds: string | null;
  noXpRoleIds: string | null;
  announcementsEnabled: boolean;
  mentionOnLevelUp: boolean;
  customLevelUpMessage: string | null;
  roleStacking: boolean;
};

export type LevelingSaveRequest = LevelingConfig;

export type LevelRoleReward = {
  id: { guildId: string; level: number };
  roleId: string;
};

export type LevelRoleRewardRequest = {
  level: number;
  roleId: string;
};

export const DEFAULT_LEVELING_CONFIG: LevelingConfig = {
  enabled: false,
  levelUpChannelId: null,
  minXpPerMessage: 15,
  maxXpPerMessage: 25,
  minXpPerAction: 30,
  maxXpPerAction: 50,
  cooldownSeconds: 60,
  excludedChannelIds: null,
  noXpRoleIds: null,
  announcementsEnabled: true,
  mentionOnLevelUp: true,
  customLevelUpMessage: null,
  roleStacking: true,
};
