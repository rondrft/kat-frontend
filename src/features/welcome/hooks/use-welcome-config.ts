"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import {
  getWelcomeConfig,
  saveWelcomeConfig,
  uploadBackground,
} from "@/lib/api/welcome";
import { useAuthStore } from "@/store/auth-store";
import type { SaveWelcomeConfigPayload, WelcomeConfig } from "@/types/welcome";

export const welcomeConfigQueryKey = (guildId: string) =>
  ["guilds", guildId, "welcomes"] as const;

export const welcomeBackgroundMutationKey = (guildId: string) =>
  ["guilds", guildId, "welcomes", "background"] as const;

function useWelcomeQueryEnabled(guildId: string | null) {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.session?.user?.id);
  const accessToken = useAuthStore((s) => s.session?.accessToken);

  return (
    Boolean(guildId) &&
    status !== "unauthenticated" &&
    Boolean(userId || accessToken || getStoredAccessToken())
  );
}

export function useWelcomeConfig(guildId: string | null) {
  const enabled = useWelcomeQueryEnabled(guildId);

  return useQuery({
    queryKey: guildId ? welcomeConfigQueryKey(guildId) : ["guilds", "welcomes"],
    queryFn: () => getWelcomeConfig(guildId!),
    enabled,
    staleTime: 30 * 1000,
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: true,
    retry: false,
  });
}

export function useSaveWelcomeConfig(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveWelcomeConfigPayload) =>
      saveWelcomeConfig(guildId!, payload),
    onMutate: async (payload) => {
      if (!guildId) return undefined;

      const queryKey = welcomeConfigQueryKey(guildId);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<WelcomeConfig>(queryKey);
      queryClient.setQueryData<WelcomeConfig>(queryKey, {
        guildId,
        ...payload,
      });

      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (!guildId || !context?.previous) return;
      queryClient.setQueryData(welcomeConfigQueryKey(guildId), context.previous);
    },
    onSuccess: (saved) => {
      if (!guildId) return;
      queryClient.setQueryData(welcomeConfigQueryKey(guildId), saved);
    },
    onSettled: () => {
      if (!guildId) return;
      void queryClient.invalidateQueries({ queryKey: welcomeConfigQueryKey(guildId) });
    },
  });
}

export function useUploadBackground(guildId: string | null) {
  return useMutation({
    mutationKey: guildId
      ? welcomeBackgroundMutationKey(guildId)
      : ["guilds", "welcomes", "background"],
    mutationFn: (file: File) => uploadBackground(guildId!, file),
  });
}
