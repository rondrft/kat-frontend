export type AuditLogEntry = {
  id: string;
  action: string;
  targetUserId: string | null;
  targetUsername: string;
  targetAvatarUrl: string | null;
  executorUserId: string | null;
  executorUsername: string;
  reason: string | null;
  createdAt: string;
};

export type RankingEntry = {
  userId: string;
  username: string;
  avatarUrl: string | null;
  messageCount: number;
};
