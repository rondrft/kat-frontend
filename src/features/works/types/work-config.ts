export type WorkConfig = {
  guildId: string;
  enabled: boolean;
};

export type WorkSaveRequest = {
  enabled: boolean;
};

export const DEFAULT_WORK_CONFIG: WorkConfig = {
  guildId: "",
  enabled: false,
};
