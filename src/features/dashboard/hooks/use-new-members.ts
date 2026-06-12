"use client";

import { useQuery } from "@tanstack/react-query";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import { useAuthStore } from "@/store/auth-store";
import { guildService } from "@/services/guild.service";

export const newMembersQueryKey = (guildId: string) =>
  ["guilds", guildId, "members", "recent"] as const;

export const RECENT_MEMBERS_WIDGET_LIMIT = 10;
export const MEMBER_ALERTS_LIMIT = 20;

export function useNewMembers(guildId: string | null) {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.session?.user?.id);
  const accessToken = useAuthStore((s) => s.session?.accessToken);

  const enabled =
    Boolean(guildId) &&
    status !== "unauthenticated" &&
    Boolean(userId || accessToken || getStoredAccessToken());

  return useQuery({
    queryKey: guildId
      ? [...newMembersQueryKey(guildId), RECENT_MEMBERS_WIDGET_LIMIT]
      : ["guilds", "members", "recent"],
    queryFn: () => guildService.getRecentMembers(guildId!, RECENT_MEMBERS_WIDGET_LIMIT),
    enabled,
    staleTime: 30 * 1000,
    placeholderData: (previous) => previous,
    refetchInterval: 30_000,
  });
}

export const memberAlertsQueryKey = (guildId: string) =>
  ["guilds", guildId, "members", "alerts"] as const;

export function useMemberAlerts(guildId: string | null) {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.session?.user?.id);
  const accessToken = useAuthStore((s) => s.session?.accessToken);

  const enabled =
    Boolean(guildId) &&
    status !== "unauthenticated" &&
    Boolean(userId || accessToken || getStoredAccessToken());

  return useQuery({
    queryKey: guildId
      ? [...memberAlertsQueryKey(guildId), MEMBER_ALERTS_LIMIT]
      : ["guilds", "members", "alerts"],
    queryFn: () => guildService.getRecentMembers(guildId!, MEMBER_ALERTS_LIMIT),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
    refetchInterval: 30_000,
  });
}
