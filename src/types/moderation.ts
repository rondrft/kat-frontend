export type ModerationRuleType =
  | "SPAM"
  | "LINKS"
  | "INVITES"
  | "MENTIONS"
  | "CAPS"
  | "REPETITION"
  | "WALL_OF_TEXT"
  | "NEWLINES"
  | "SPOILERS"
  | "EVERYONE_HERE"
  | "FORMATTING"
  | "EMOJIS"
  | "BAD_WORDS"
  | "PHISHING"
  | "MASS_MENTION"
  | "IMAGE_SPAM"
  | "COPY_PASTA"
  | "ACCOUNT_AGE"
  | "JOIN_RAID"
  | "CHANNEL_RAID"
  | "ROLE_RAID";

export const RULE_PREMIUM: Record<ModerationRuleType, boolean> = {
  SPAM: false,
  LINKS: false,
  INVITES: false,
  MENTIONS: false,
  CAPS: false,
  REPETITION: true,
  WALL_OF_TEXT: true,
  NEWLINES: true,
  SPOILERS: true,
  EVERYONE_HERE: true,
  FORMATTING: true,
  EMOJIS: true,
  BAD_WORDS: true,
  PHISHING: false,
  MASS_MENTION: true,
  IMAGE_SPAM: true,
  COPY_PASTA: false,
  ACCOUNT_AGE: true,
  JOIN_RAID: true,
  CHANNEL_RAID: true,
  ROLE_RAID: true,
};

export type ModerationAction = "MONITOR" | "DELETE" | "TIMEOUT" | "DELETE_AND_TIMEOUT" | "WARN" | "KICK" | "BAN";

export type ModerationRuleConfig = {
  id: ModerationRuleType;
  enabled: boolean;
  action: ModerationAction;
  threshold: number;
  timeoutMinutes: number | null;
  premium?: boolean;
};

export type ModerationConfig = {
  guildId: string;
  enabled: boolean;
  strictness: number;
  defaultTimeoutMinutes: number;
  rules: ModerationRuleConfig[];
  logChannelId?: string | null;
  premiumLogChannelId?: string | null;
  muteRoleId?: string | null;
  ignoredRoleIds?: string[];
  ignoredChannelIds?: string[];
  ignoredUserIds?: string[];
  autoPunishEnabled?: boolean;
};

export type SaveModerationConfigPayload = Omit<ModerationConfig, "guildId">;

export type ModPermissions = {
  xkick: string[];
  xban: string[];
  xsoftban: string[];
  xtempban: string[];
  xunban: string[];
  xmute: string[];
  xunmute: string[];
  xwarn: string[];
  xhistory: string[];
  xwarnings: string[];
  xclearwarns: string[];
  xnuke: string[];
  xslowmode: string[];
  xlock: string[];
  xunlock: string[];
  xfilter: string[];
  xwhitelist: string[];
  xmodconfig: string[];
};

export type PurgeConfig = {
  enabled: boolean;
  allowedRoleId: string | null;
  maxMessages: number;
  maxAgeSeconds: number;
  prefix?: string;
};

export type NukeConfig = {
  allowedRoleId: string | null;
  allowedUserIds: string[];
};

export type ModerationWhitelist = {
  id?: string;
  guildId: string;
  channelId?: string | null;
  userId?: string | null;
  categoryId?: string | null;
  ruleType?: ModerationRuleType | null;
  reason?: string;
  createdAt?: string;
};

export type ModerationFilter = {
  id?: string;
  guildId: string;
  pattern: string;
  enabled: boolean;
  action?: ModerationAction;
  replacement?: string;
  reason?: string;
  createdAt?: string;
};

export type ModerationAutoPunishment = {
  id?: string;
  guildId: string;
  ruleType: ModerationRuleType;
  threshold: number;
  action: ModerationAction;
  timeoutMinutes?: number | null;
  enabled: boolean;
};

export type ModerationLogEntry = {
  id: string;
  guildId: string;
  ruleType: ModerationRuleType;
  action: ModerationAction;
  userId: string;
  moderatorId?: string | null;
  channelId?: string | null;
  reason: string;
  messageContent?: string;
  evidence?: string;
  createdAt: string;
};

export type ModerationLogPage = {
  content: ModerationLogEntry[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export type WarningEntry = {
  id: string;
  guildId: string;
  userId: string;
  moderatorId: string;
  reason: string;
  createdAt: string;
  active: boolean;
};
