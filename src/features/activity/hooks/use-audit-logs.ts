"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs, AUDIT_LOG_LIMIT } from "@/lib/api/activity";
import { useAuthStore } from "@/store/auth-store";

export const auditLogsQueryKey = (guildId: string) =>
  ["guilds", guildId, "audit-logs", AUDIT_LOG_LIMIT] as const;

function useActivityQueryEnabled(guildId: string | null) {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.session?.user?.id);
  const accessToken = useAuthStore((s) => s.session?.accessToken);

  return (
    Boolean(guildId) &&
    hasHydrated &&
    status !== "unauthenticated" &&
    Boolean(userId || accessToken)
  );
}

export function useAuditLogs(guildId: string | null) {
  const enabled = useActivityQueryEnabled(guildId);

  return useQuery({
    queryKey: guildId ? auditLogsQueryKey(guildId) : ["guilds", "audit-logs"],
    queryFn: () => fetchAuditLogs(guildId!),
    enabled,
    staleTime: 60_000,
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: true,
    retry: false,
  });
}
