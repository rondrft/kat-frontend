"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import { getModerationConfig, saveModerationConfig } from "@/lib/api/moderation";
import { useAuthStore } from "@/store/auth-store";
import type { ModerationConfig, SaveModerationConfigPayload } from "@/types/moderation";

export const moderationConfigQueryKey = (guildId: string) =>
  ["guilds", guildId, "moderation"] as const;

function useModerationQueryEnabled(guildId: string | null) {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.session?.user?.id);
  const accessToken = useAuthStore((s) => s.session?.accessToken);

  return (
    Boolean(guildId) &&
    status !== "unauthenticated" &&
    Boolean(userId || accessToken || getStoredAccessToken())
  );
}

export function useModerationConfig(guildId: string | null) {
  const enabled = useModerationQueryEnabled(guildId);

  return useQuery({
    queryKey: guildId ? moderationConfigQueryKey(guildId) : ["guilds", "moderation"],
    queryFn: () => getModerationConfig(guildId!),
    enabled,
    staleTime: 30 * 1000,
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: true,
    retry: false,
  });
}

export function useSaveModerationConfig(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveModerationConfigPayload) =>
      saveModerationConfig(guildId!, payload),
    onMutate: async (payload) => {
      if (!guildId) return undefined;

      const queryKey = moderationConfigQueryKey(guildId);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<ModerationConfig>(queryKey);
      queryClient.setQueryData<ModerationConfig>(queryKey, {
        guildId,
        ...payload,
      });

      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (!guildId || !context?.previous) return;
      queryClient.setQueryData(moderationConfigQueryKey(guildId), context.previous);
    },
    onSuccess: (saved) => {
      if (!guildId) return;
      queryClient.setQueryData(moderationConfigQueryKey(guildId), saved);
    },
    onSettled: () => {
      if (!guildId) return;
      void queryClient.invalidateQueries({
        queryKey: moderationConfigQueryKey(guildId),
      });
    },
  });
}
