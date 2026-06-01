export type BoosterCustomRole = {
  id: string;
  guildId: string;
  ownerDiscordId: string;
  discordRoleId: string | null;
  roleName: string | null;
  roleColor: string | null;
  roleEmoji: string | null;
  createdAt: string;
};

export type BoosterConfig = {
  guildId: string;
  enabled: boolean;
  requiredBoosts: number;
  allowInvites: boolean;
};

export type SyncResult = {
  synced: number;
};

export type BoosterRole = BoosterCustomRole;
export type BoosterSettings = BoosterConfig;
export type BoosterSettingsUpdate = Omit<BoosterSettings, "guildId">;
