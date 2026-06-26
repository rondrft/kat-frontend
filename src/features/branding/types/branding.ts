export type GuildBranding = {
  guildId: string;
  avatarUrl: string | null;
  botName: string | null;
};

export type GuildBrandingRequest = {
  avatarUrl: string | null;
  botName: string | null;
};
