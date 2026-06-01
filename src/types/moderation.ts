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
