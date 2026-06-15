"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import type { ModerationAutoPunishment } from "@/types/moderation";
import { getAutoPunishments, saveAutoPunishments } from "@/lib/api/moderation";

export const autoPunishmentsQueryKey = (guildId: string) =>
  ["guilds", guildId, "moderation", "auto-punishments"] as const;

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

export function useAutoPunishments(guildId: string | null) {
  const enabled = useQueryEnabled(guildId);

  return useQuery({
    queryKey: guildId ? autoPunishmentsQueryKey(guildId) : ["guilds", "moderation", "auto-punishments"],
    queryFn: () => getAutoPunishments(guildId!),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useSaveAutoPunishments(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (punishments: Omit<ModerationAutoPunishment, "id" | "guildId">[]) =>
      saveAutoPunishments(guildId!, punishments),
    onSuccess: () => {
      if (guildId) {
        void queryClient.invalidateQueries({ queryKey: autoPunishmentsQueryKey(guildId) });
      }
    },
  });
}
