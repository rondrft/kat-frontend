export type OutputType = "MESSAGE" | "EMBED" | "IMAGE";

export type BackgroundMode = "COLOR" | "IMAGE";

export type WelcomeConfig = {
  guildId: string;
  welcomeEnabled: boolean;
  boostEnabled: boolean;
  welcomeChannelId: string | null;
  boostChannelId: string | null;
  welcomeOutputType: OutputType;
  boostOutputType: OutputType;
  messageTemplate: string;
  embedTitleTemplate: string | null;
  embedColor: string | null;
  imageTitleTemplate: string;
  imageUsernameTemplate: string;
  imageFooterTemplate: string;
  imageBackgroundMode: BackgroundMode;
  imageBackgroundColor: string;
  imageBackgroundUrl: string | null;
  imageShowAvatar: boolean;
  imageTextColor: string;
  imageMentionUser: boolean;
  imageCardEnabled: boolean;
  imageCardColor: string;
  imageCardOpacity: number;
  imageAvatarSize: number;
};

export type SaveWelcomeConfigPayload = Omit<WelcomeConfig, "guildId">;

export type UploadedBackground = {
  url: string;
};
