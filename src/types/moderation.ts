export type ModerationRuleType = "SPAM" | "LINKS" | "INVITES" | "MENTIONS" | "CAPS";

export type ModerationAction = "MONITOR" | "DELETE" | "TIMEOUT" | "DELETE_AND_TIMEOUT";

export type ModerationRuleConfig = {
  id: ModerationRuleType;
  enabled: boolean;
  action: ModerationAction;
  threshold: number;
  timeoutMinutes: number | null;
};

export type ModerationConfig = {
  guildId: string;
  enabled: boolean;
  strictness: number;
  defaultTimeoutMinutes: number;
  rules: ModerationRuleConfig[];
};

export type SaveModerationConfigPayload = Omit<ModerationConfig, "guildId">;

export type ModPermissions = {
  xkick: string[];
  xban: string[];
  xmute: string[];
  xwarn: string[];
  xhistory: string[];
};

export type PurgeConfig = {
  enabled: boolean;
  allowedRoleId: string | null;
  maxMessages: number;
  maxAgeSeconds: number;
};

export type NukeConfig = {
  allowedRoleId: string | null;
  allowedUserIds: string[];
};
