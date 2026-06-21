export type WorkConfig = {
  guildId: string;
  enabled: boolean;
  allowedChannelIds: string[];
};

export type WorkSaveRequest = {
  enabled: boolean;
  allowedChannelIds: string[];
};

export const DEFAULT_WORK_CONFIG: WorkConfig = {
  guildId: "",
  enabled: false,
  allowedChannelIds: [],
};
