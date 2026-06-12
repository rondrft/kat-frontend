export type AuditLogAction =
  | "BAN"
  | "UNBAN"
  | "KICK"
  | "TIMEOUT"
  | "UNTIMEOUT"
  | "MUTE"
  | "UNMUTE"
  | "WARN"
  | "MESSAGE_DELETE"
  | "MESSAGE_BULK_DELETE"
  | "ROLE_ADD"
  | "ROLE_REMOVE"
  | "AUTO_MOD"
  | "VOICE_MOVE"
  | "VOICE_KICK"
  | "VOICE_MUTE"
  | "VOICE_DEAFEN";

export type AuditLogEntry = {
  id: string;
  guildId: string;
  targetDiscordId: string;
  targetUsername: string;
  targetAvatar: string | null;
  executorDiscordId: string | null;
  executorUsername: string | null;
  action: AuditLogAction;
  reason: string | null;
  durationMinutes: number | null;
  createdAt: string;
};

export type RankingEntry = {
  userId: string;
  username: string;
  avatarUrl: string | null;
  messageCount: number;
};
