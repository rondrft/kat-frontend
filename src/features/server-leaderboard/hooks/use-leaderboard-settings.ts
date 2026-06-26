"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import { useAuthStore } from "@/store/auth-store";
import { guildService } from "@/services/guild.service";

export const leaderboardSettingsQueryKey = (guildId: string) =>
  ["guilds", guildId, "leaderboard", "settings"] as const;

function useQueryEnabled(guildId: string | null) {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.session?.user?.id);
  const accessToken = useAuthStore((s) => s.session?.accessToken);

  return (
    Boolean(guildId) &&
    status !== "unauthenticated" &&
    Boolean(userId || accessToken || getStoredAccessToken())
  );
}

export function useLeaderboardSettings(guildId: string | null) {
  const queryEnabled = useQueryEnabled(guildId);

  return useQuery({
    queryKey: guildId ? leaderboardSettingsQueryKey(guildId) : ["guilds", "leaderboard", "settings"],
    queryFn: () => guildService.getLeaderboardSettings(guildId!),
    enabled: queryEnabled,
    staleTime: 60_000,
  });
}

export function useUpdateLeaderboardSettings(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (showOnLeaderboard: boolean) =>
      guildService.saveLeaderboardSettings(guildId!, showOnLeaderboard),
    onSuccess: (data) => {
      if (guildId) {
        queryClient.setQueryData(leaderboardSettingsQueryKey(guildId), data);
      }
    },
  });
}
