export const DEFAULT_VOICE_CATEGORY = "DEFAULT" as const;

export type GuildCategory = {
  id: string;
  name: string;
};

export type TempVoiceSaveRequest = {
  enabled: boolean;
  categoryId: string;
  channelNameTemplate: string;
  userLimit: number;
  deleteDelaySeconds: number;
  lockedToOwner: boolean;
};

export type TempVoiceConfig = TempVoiceSaveRequest & {
  guildId?: string;
  hubChannelId?: string;
};

export const DEFAULT_TEMP_VOICE_SAVE: TempVoiceSaveRequest = {
  enabled: true,
  categoryId: DEFAULT_VOICE_CATEGORY,
  channelNameTemplate: "{username}'s Channel",
  userLimit: 0,
  deleteDelaySeconds: 5,
  lockedToOwner: true,
};
