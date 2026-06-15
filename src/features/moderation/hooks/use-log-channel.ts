"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import { getLogChannel, saveLogChannel } from "@/lib/api/moderation";

export const logChannelQueryKey = (guildId: string) =>
  ["guilds", guildId, "moderation", "log-channel"] as const;

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

export function useLogChannel(guildId: string | null) {
  const enabled = useQueryEnabled(guildId);

  return useQuery({
    queryKey: guildId ? logChannelQueryKey(guildId) : ["guilds", "moderation", "log-channel"],
    queryFn: () => getLogChannel(guildId!),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useSaveLogChannel(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: { logChannelId?: string | null; premiumLogChannelId?: string | null }) =>
      saveLogChannel(guildId!, config),
    onSuccess: () => {
      if (guildId) {
        void queryClient.invalidateQueries({ queryKey: logChannelQueryKey(guildId) });
      }
    },
  });
}
