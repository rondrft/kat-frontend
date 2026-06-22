export type GuildBranding = {
  guildId: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  botName: string | null;
};

export type GuildBrandingRequest = {
  avatarUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  botName: string | null;
};
