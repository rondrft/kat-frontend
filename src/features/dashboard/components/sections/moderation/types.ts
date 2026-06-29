import {
  Ban,
  Eye,
  FileWarning,
  Link2,
  LockKeyhole,
  MessageSquareWarning,
  TimerReset,
  Trash2,
  Shield,
  Repeat,
  TextQuote,
  TextSelect,
  EyeOff,
  AtSign,
  Bold,
  Smile,
  Search,
  VolumeX,
  Megaphone,
  UserPlus,
  Image as ImageIcon,
  Copy,
  CalendarClock,
  DoorOpen,
  Layout,
  ShieldAlert,
  UserMinus,
} from "lucide-react";
import type {
  ModerationAction,
  ModerationConfig,
  ModerationRuleType,
  ModPermissions,
  PurgeConfig,
  NukeConfig,
} from "@/types/moderation";
import type { useTranslation } from "@/lib/i18n/useTranslation";

export type ModerationMode =
  | "monitor"
  | "delete"
  | "timeout"
  | "deleteAndTimeout"
  | "lockdown"
  | "kick"
  | "ban";

export type ModerationTab = "free" | "premium" | "security";

export type RuleId =
  | "spam"
  | "links"
  | "invites"
  | "mentions"
  | "caps"
  | "repetition"
  | "wallOfText"
  | "newlines"
  | "spoilers"
  | "everyoneHere"
  | "formatting"
  | "emojis"
  | "badWords"
  | "phishing"
  | "massMention"
  | "imageSpam"
  | "copyPasta"
  | "accountAge"
  | "joinRaid"
  | "channelRaid"
  | "roleRaid";

export type ModerationRule = {
  id: RuleId;
  title: string;
  description: string;
  icon: typeof Shield;
  apiType: ModerationRuleType;
  enabled: boolean;
  mode: ModerationMode;
  threshold: number;
  timeoutMinutes: number | null;
};

export const RULE_DEFINITIONS: {
  id: RuleId;
  title: string;
  description: string;
  icon: typeof Shield;
  apiType: ModerationRuleType;
}[] = [
  { id: "spam", title: "Spam", description: "Repeated messages, emoji flooding, and fast sends.", icon: MessageSquareWarning, apiType: "SPAM" },
  { id: "links", title: "Links", description: "Suspicious URLs, phishing domains, and link flooding.", icon: Link2, apiType: "LINKS" },
  { id: "invites", title: "Invites", description: "Discord invite links outside allowed channels.", icon: Ban, apiType: "INVITES" },
  { id: "mentions", title: "Mentions", description: "Role/@everyone abuse and large mention bursts.", icon: AtSign, apiType: "MENTIONS" },
  { id: "caps", title: "Caps", description: "All-caps messages and visual noise.", icon: FileWarning, apiType: "CAPS" },
  { id: "repetition", title: "Repetition", description: "Repeated characters, words, or spammy patterns.", icon: Repeat, apiType: "REPETITION" },
  { id: "wallOfText", title: "Wall of Text", description: "Massive unbroken text blocks with no line breaks.", icon: TextQuote, apiType: "WALL_OF_TEXT" },
  { id: "newlines", title: "Newlines", description: "Excessive line breaks that disrupt chat.", icon: TextSelect, apiType: "NEWLINES" },
  { id: "spoilers", title: "Spoilers", description: "Excessive spoiler-tagged content.", icon: EyeOff, apiType: "SPOILERS" },
  { id: "everyoneHere", title: "@everyone/@here", description: "Mass-ping abuse and mention spam.", icon: Megaphone, apiType: "EVERYONE_HERE" },
  { id: "formatting", title: "Formatting", description: "Excessive markdown, bold, italic, code blocks.", icon: Bold, apiType: "FORMATTING" },
  { id: "emojis", title: "Emojis", description: "Emoji spam and reaction baiting.", icon: Smile, apiType: "EMOJIS" },
  { id: "badWords", title: "Bad Words", description: "Custom profanity and blacklisted terms.", icon: VolumeX, apiType: "BAD_WORDS" },
  { id: "phishing", title: "Phishing", description: "Known phishing domains and scam links.", icon: Search, apiType: "PHISHING" },
  { id: "massMention", title: "Mass Mention", description: "Messages that ping many distinct users at once.", icon: UserPlus, apiType: "MASS_MENTION" },
  { id: "imageSpam", title: "Image Spam", description: "Excessive image and file attachments in messages.", icon: ImageIcon, apiType: "IMAGE_SPAM" },
  { id: "copyPasta", title: "Copy-Pasta", description: "Same message pasted across multiple channels.", icon: Copy, apiType: "COPY_PASTA" },
  { id: "accountAge", title: "Account Age", description: "Blocks messages from accounts younger than X days.", icon: CalendarClock, apiType: "ACCOUNT_AGE" },
  { id: "joinRaid", title: "Join Raid", description: "Detects rapid member joins and auto-actions raiders.", icon: DoorOpen, apiType: "JOIN_RAID" },
  { id: "channelRaid", title: "Channel Raid", description: "Detects mass channel creation or deletion.", icon: Layout, apiType: "CHANNEL_RAID" },
  { id: "roleRaid", title: "Role Raid", description: "Detects mass role creation or deletion.", icon: ShieldAlert, apiType: "ROLE_RAID" },
];

export const ACTIONS: {
  id: ModerationMode;
  label: string;
  description: string;
  icon: typeof Eye;
}[] = [
  { id: "monitor", label: "Monitor", description: "Log only", icon: Eye },
  { id: "delete", label: "Delete", description: "Remove message", icon: Trash2 },
  { id: "timeout", label: "Timeout", description: "Mute user", icon: TimerReset },
  { id: "deleteAndTimeout", label: "Delete & Timeout", description: "Remove + mute", icon: TimerReset },
  { id: "lockdown", label: "Lockdown", description: "Freeze channels", icon: LockKeyhole },
  { id: "kick", label: "Kick", description: "Remove member", icon: UserMinus },
  { id: "ban", label: "Ban", description: "Ban member", icon: Ban },
];

export function defaultMode(apiType: ModerationRuleType): ModerationMode {
  if (apiType === "CAPS") return "monitor";
  if (apiType === "MENTIONS" || apiType === "EVERYONE_HERE") return "timeout";
  if (apiType === "ACCOUNT_AGE") return "timeout";
  if (apiType === "MASS_MENTION") return "timeout";
  if (apiType === "JOIN_RAID") return "kick";
  if (apiType === "CHANNEL_RAID" || apiType === "ROLE_RAID") return "monitor";
  return "delete";
}

export function defaultThreshold(apiType: ModerationRuleType): number {
  if (apiType === "SPAM") return 6;
  if (apiType === "CAPS") return 80;
  if (apiType === "WALL_OF_TEXT") return 500;
  if (apiType === "ACCOUNT_AGE") return 7;
  if (apiType === "MASS_MENTION") return 5;
  if (apiType === "IMAGE_SPAM") return 3;
  if (apiType === "JOIN_RAID") return 10;
  if (apiType === "CHANNEL_RAID" || apiType === "ROLE_RAID") return 5;
  return 3;
}

export const INITIAL_RULES: ModerationRule[] = RULE_DEFINITIONS.map((def) => ({
  ...def,
  enabled: false,
  mode: defaultMode(def.apiType),
  threshold: defaultThreshold(def.apiType),
  timeoutMinutes: null,
}));

export const BACKEND_RULE_IDS: Partial<Record<RuleId, ModerationRuleType>> = {
  spam: "SPAM", links: "LINKS", invites: "INVITES", mentions: "MENTIONS", caps: "CAPS",
  repetition: "REPETITION", wallOfText: "WALL_OF_TEXT", newlines: "NEWLINES", spoilers: "SPOILERS",
  everyoneHere: "EVERYONE_HERE", formatting: "FORMATTING", emojis: "EMOJIS", badWords: "BAD_WORDS", phishing: "PHISHING",
  massMention: "MASS_MENTION", imageSpam: "IMAGE_SPAM", copyPasta: "COPY_PASTA", accountAge: "ACCOUNT_AGE",
  joinRaid: "JOIN_RAID", channelRaid: "CHANNEL_RAID", roleRaid: "ROLE_RAID",
};

export function toUiAction(action: ModerationAction): ModerationMode {
  if (action === "DELETE_AND_TIMEOUT") return "deleteAndTimeout";
  const lower = action.toLowerCase();
  if (lower === "warn") return "delete";
  return lower as ModerationMode;
}

export function toApiAction(mode: ModerationMode): ModerationAction {
  if (mode === "deleteAndTimeout") return "DELETE_AND_TIMEOUT";
  if (mode === "lockdown") return "TIMEOUT";
  if (mode === "delete") return "DELETE";
  if (mode === "kick") return "KICK";
  if (mode === "ban") return "BAN";
  return mode.toUpperCase() as ModerationAction;
}

export function usesTimeout(mode: ModerationMode) {
  return mode === "timeout" || mode === "deleteAndTimeout";
}

export function getActionLabel(mode: ModerationMode, t: ReturnType<typeof useTranslation>) {
  return t.moderation.actions[mode]?.label ?? mode;
}

export function applyModerationConfigToRules(
  currentRules: ModerationRule[],
  config: ModerationConfig,
) {
  return currentRules.map((rule) => {
    const apiId = BACKEND_RULE_IDS[rule.id];
    if (!apiId) return rule;
    const saved = config.rules.find((item) => item.id === apiId);
    if (!saved) return rule;
    return {
      ...rule,
      enabled: saved.enabled,
      mode: toUiAction(saved.action),
      threshold: saved.threshold,
      timeoutMinutes: saved.timeoutMinutes,
    };
  });
}

export const emptyPermissions: ModPermissions = {
  xkick: [], xban: [], xsoftban: [], xtempban: [], xunban: [],
  xmute: [], xunmute: [], xwarn: [], xhistory: [], xwarnings: [],
  xclearwarns: [], xnuke: [], xslowmode: [], xlock: [], xunlock: [],
  xfilter: [], xwhitelist: [], xmodconfig: [],
};

export const defaultPurgeConfig: PurgeConfig = {
  enabled: false,
  allowedRoleId: null,
  maxMessages: 20,
  maxAgeSeconds: 300,
  purgeUserEnabled: false,
  purgeUserAllowedRoleId: null,
  purgeUserAllowedUserId: null,
  purgeUserMaxMessages: 20,
  purgeUserMaxAgeSeconds: 300,
};

export const defaultNukeConfig: NukeConfig = {
  allowedRoleId: null,
  allowedUserIds: [],
};
