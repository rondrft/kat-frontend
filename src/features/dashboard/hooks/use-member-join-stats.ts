"use client";

import { useQuery } from "@tanstack/react-query";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import { useAuthStore } from "@/store/auth-store";
import { buildEmptyMonthDays } from "@/features/dashboard/lib/chart-days";
import { guildService } from "@/services/guild.service";

export const MEMBER_JOIN_STATS_DAYS = 30;

export const memberJoinStatsQueryKey = (
  guildId: string,
  days = MEMBER_JOIN_STATS_DAYS,
) => ["guilds", guildId, "members", "stats", days] as const;

export function useMemberJoinStats(
  guildId: string | null,
  days = MEMBER_JOIN_STATS_DAYS,
) {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.session?.user?.id);
  const accessToken = useAuthStore((s) => s.session?.accessToken);

  const enabled =
    Boolean(guildId) &&
    status !== "unauthenticated" &&
    Boolean(userId || accessToken || getStoredAccessToken());

  return useQuery({
    queryKey: guildId
      ? memberJoinStatsQueryKey(guildId, days)
      : ["guilds", "members", "stats"],
    queryFn: async () => {
      try {
        return await guildService.getMemberJoinStats(guildId!, days);
      } catch {
        try {
          return await guildService.getMonthlyJoinStats(guildId!);
        } catch {
          return { total: 0, days: buildEmptyMonthDays() };
        }
      }
    },
    retry: 1,
    enabled,
    staleTime: 30 * 1000,
    placeholderData: (previous) => previous,
    refetchInterval: 30_000,
  });
}
