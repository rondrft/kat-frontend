"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import type { ModerationWhitelist } from "@/types/moderation";
import { getWhitelist, addWhitelist, removeWhitelist } from "@/lib/api/moderation";

export const whitelistQueryKey = (guildId: string) =>
  ["guilds", guildId, "moderation", "whitelist"] as const;

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

export function useWhitelist(guildId: string | null) {
  const enabled = useQueryEnabled(guildId);

  return useQuery({
    queryKey: guildId ? whitelistQueryKey(guildId) : ["guilds", "moderation", "whitelist"],
    queryFn: () => getWhitelist(guildId!),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useAddWhitelist(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entry: Omit<ModerationWhitelist, "id" | "guildId" | "createdAt">) =>
      addWhitelist(guildId!, entry),
    onSuccess: () => {
      if (guildId) {
        void queryClient.invalidateQueries({ queryKey: whitelistQueryKey(guildId) });
      }
    },
  });
}

export function useRemoveWhitelist(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: string) => removeWhitelist(guildId!, entryId),
    onSuccess: () => {
      if (guildId) {
        void queryClient.invalidateQueries({ queryKey: whitelistQueryKey(guildId) });
      }
    },
  });
}
