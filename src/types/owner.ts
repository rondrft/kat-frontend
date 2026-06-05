"use client";

export type OwnerMetrics = {
  totalGuilds: number;
  totalUsers: number;
  totalChannels: number;
  gatewayPingMs: number;
  uptimeSeconds: number;
  jvmUsedMemoryMb: number;
  jvmMaxMemoryMb: number;
  activeThreads: number;
  totalAuditLogs: number;
  totalWarns: number;
  totalMessageCounts: number;
  totalGuildMembers: number;
  todayMessagesProcessed: number;
  todayCommandsExecuted: number;
  todayAutomodActions: number;
  todayMembersJoined: number;
  todayAuditActions: number;
  todayWelcomeSent: number;
  todayWarnsIssued: number;
  todayMutesIssued: number;
  todayBansIssued: number;
  todayKicksIssued: number;
};
