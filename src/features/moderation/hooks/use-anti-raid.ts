"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { guildService } from "@/services/guild.service";
import { useAuthStore } from "@/store/auth-store";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import type { AntiRaidConfig } from "@/features/moderation/types/anti-raid";

export const antiRaidQueryKey = (guildId: string) =>
  ["guilds", guildId, "security"] as const;

export function useAntiRaidConfig(guildId: string | null) {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.session?.user?.id);
  const accessToken = useAuthStore((s) => s.session?.accessToken);
  const enabled =
    Boolean(guildId) &&
    status !== "unauthenticated" &&
    Boolean(userId || accessToken || getStoredAccessToken());

  return useQuery({
    queryKey: guildId ? antiRaidQueryKey(guildId) : ["guilds", "security"],
    queryFn: () => guildService.getAntiRaidConfig(guildId!),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useSaveAntiRaidConfig(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: AntiRaidConfig) =>
      guildService.saveAntiRaidConfig(guildId!, config),
    onSuccess: (saved) => {
      if (guildId) {
        queryClient.setQueryData(antiRaidQueryKey(guildId), saved);
      }
    },
  });
}
