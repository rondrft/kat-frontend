"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import {
  getAllBoosterRoles,
  getBoosterSettings,
  getMyBoosterRole,
  syncBoosters,
  updateBoosterSettings,
} from "@/features/boosters/services/booster-role.service";
import { useAuthStore } from "@/store/auth-store";
import type { BoosterSettings, BoosterSettingsUpdate } from "@/types/booster";

export const boosterRoleQueryKey = (guildId: string) =>
  ["guilds", guildId, "boosters", "me"] as const;

export const allBoosterRolesQueryKey = (guildId: string) =>
  ["guilds", guildId, "boosters", "all"] as const;

export const boosterSettingsQueryKey = (guildId: string) =>
  ["guilds", guildId, "boosters", "settings"] as const;

export const boosterSyncMutationKey = (guildId: string) =>
  ["guilds", guildId, "boosters", "sync"] as const;

function useBoosterQueryEnabled(guildId: string | null) {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.session?.user?.id);
  const accessToken = useAuthStore((s) => s.session?.accessToken);

  return (
    Boolean(guildId) &&
    status !== "unauthenticated" &&
    Boolean(userId || accessToken || getStoredAccessToken())
  );
}

export function useBoosterRole(guildId: string | null) {
  const enabled = useBoosterQueryEnabled(guildId);

  const query = useQuery({
    queryKey: guildId ? boosterRoleQueryKey(guildId) : ["guilds", "boosters", "me"],
    queryFn: () => getMyBoosterRole(guildId!),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
  });

  return {
    role: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

export function useAllBoosterRoles(guildId: string | null) {
  const enabled = useBoosterQueryEnabled(guildId);

  return useQuery({
    queryKey: guildId
      ? allBoosterRolesQueryKey(guildId)
      : ["guilds", "boosters", "all"],
    queryFn: () => getAllBoosterRoles(guildId!),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function useBoosterSettings(guildId: string | null) {
  const enabled = useBoosterQueryEnabled(guildId);

  return useQuery({
    queryKey: guildId
      ? boosterSettingsQueryKey(guildId)
      : ["guilds", "boosters", "settings"],
    queryFn: () => getBoosterSettings(guildId!),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useUpdateBoosterSettings(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BoosterSettingsUpdate) =>
      updateBoosterSettings(guildId!, payload),
    onMutate: async (payload) => {
      if (!guildId) return undefined;

      const queryKey = boosterSettingsQueryKey(guildId);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<BoosterSettings>(queryKey);
      queryClient.setQueryData<BoosterSettings>(queryKey, {
        guildId,
        ...payload,
      });

      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (!guildId || !context?.previous) return;
      queryClient.setQueryData(boosterSettingsQueryKey(guildId), context.previous);
    },
    onSuccess: (saved) => {
      if (!guildId) return;
      queryClient.setQueryData(boosterSettingsQueryKey(guildId), saved);
    },
    onSettled: () => {
      if (!guildId) return;
      void queryClient.invalidateQueries({
        queryKey: boosterSettingsQueryKey(guildId),
      });
    },
  });
}

export function useSyncBoosters(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: guildId
      ? boosterSyncMutationKey(guildId)
      : ["guilds", "boosters", "sync"],
    mutationFn: () => syncBoosters(guildId!),
    onSuccess: () => {
      if (!guildId) return;
      void queryClient.invalidateQueries({
        queryKey: allBoosterRolesQueryKey(guildId),
      });
      void queryClient.invalidateQueries({ queryKey: boosterRoleQueryKey(guildId) });
    },
  });
}
