export type LevelingConfig = {
  enabled: boolean;
  levelUpChannelId: string | null;
};

export type LevelingSaveRequest = {
  enabled: boolean;
  levelUpChannelId: string | null;
};

export const DEFAULT_LEVELING_CONFIG: LevelingConfig = {
  enabled: false,
  levelUpChannelId: null,
};
