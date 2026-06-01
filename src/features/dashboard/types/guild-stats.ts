export type GuildActivityDay = {
  date: string;
  joins: number;
  voiceJoins: number;
  tempChannels: number;
  commands: number;
  total: number;
};

export type GuildStats = {
  totalMembers: number;
  boostLevel: number;
  boosterCount: number;
  totalRoles: number;
  totalTextChannels: number;
  totalVoiceChannels: number;
  createdAt: string | null;
  activeCustomRoles: number;
  activeModules: string[];
  voiceJoinsThisMonth: number;
  tempChannelsCreatedThisMonth: number;
  commandsUsedThisMonth: number;
  activityDays: GuildActivityDay[];
};
