export type AntiRaidConfig = {
  guildId: string;
  antiRaidEnabled: boolean;
  joinThreshold: number;
  joinWindowSeconds: number;
  joinAction: "ALERT" | "KICK" | "BAN" | "LOCK" | "LOCKDOWN";
  alertChannelId: string | null;
  minAccountAgeDays: number;
  requireAvatar: boolean;
  accountAction: "KICK" | "BAN";
  massBanEnabled: boolean;
  massKickEnabled: boolean;
  massDeleteEnabled: boolean;
  massWebhookEnabled: boolean;
  massActionThreshold: number;
  massActionWindowSeconds: number;
  massAction: "ALERT" | "LOCK" | "LOCKDOWN";
};
