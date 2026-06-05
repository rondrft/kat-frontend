"use client";

import { useQuery } from "@tanstack/react-query";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import { AppError } from "@/lib/errors";
import { guildService } from "@/services/guild.service";
import { useAuthStore } from "@/store/auth-store";

export const guildStatsQueryKey = (guildId: string) =>
  ["guilds", guildId, "stats"] as const;

export function useGuildStats(guildId: string | null) {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.session?.user?.id);
  const accessToken = useAuthStore((s) => s.session?.accessToken);

  const enabled =
    Boolean(guildId) &&
    status !== "unauthenticated" &&
    Boolean(userId || accessToken || getStoredAccessToken());

  return useQuery({
    queryKey: guildId ? guildStatsQueryKey(guildId) : ["guilds", "stats"],
    queryFn: () => guildService.getGuildStats(guildId!),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
    retry: (failureCount, error) => {
      if (error instanceof AppError && error.status >= 400 && error.status < 500) {
        return false;
      }
      if (
        error instanceof AppError &&
        error.status === 500 &&
        error.message.toLowerCase().includes("no endpoint")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
