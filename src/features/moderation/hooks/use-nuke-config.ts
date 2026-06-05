"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, endpoints } from "@/api";
import type { ApiResponse } from "@/types/api";
import { useAuthStore } from "@/store/auth-store";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import type { NukeConfig } from "@/types/moderation";

export const nukeConfigQueryKey = (guildId: string) =>
  ["guilds", guildId, "moderation", "nuke"] as const;

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

function normalizeNukeConfig(raw: unknown): NukeConfig {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    allowedRoleId: typeof row.allowedRoleId === "string" ? row.allowedRoleId : null,
    allowedUserIds: Array.isArray(row.allowedUserIds)
      ? row.allowedUserIds.filter((id): id is string => typeof id === "string")
      : [],
  };
}

export function useNukeConfig(guildId: string | null) {
  const enabled = useQueryEnabled(guildId);

  return useQuery({
    queryKey: guildId ? nukeConfigQueryKey(guildId) : ["guilds", "moderation", "nuke"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<NukeConfig> | unknown>(
        endpoints.guilds.moderationNuke(guildId!),
      );
      const raw =
        typeof data === "object" && data !== null && "data" in data
          ? (data as ApiResponse<NukeConfig>).data
          : data;
      return normalizeNukeConfig(raw);
    },
    enabled,
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useSaveNukeConfig(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: NukeConfig) => {
      const { data } = await apiClient.put<ApiResponse<NukeConfig> | unknown>(
        endpoints.guilds.moderationNuke(guildId!),
        payload,
      );
      const raw =
        typeof data === "object" && data !== null && "data" in data
          ? (data as ApiResponse<NukeConfig>).data
          : data;
      return normalizeNukeConfig(raw);
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: guildId ? nukeConfigQueryKey(guildId) : ["guilds", "moderation", "nuke"] });
      const previous = queryClient.getQueryData<NukeConfig>(
        guildId ? nukeConfigQueryKey(guildId) : ["guilds", "moderation", "nuke"],
      );
      queryClient.setQueryData(
        guildId ? nukeConfigQueryKey(guildId) : ["guilds", "moderation", "nuke"],
        payload,
      );
      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous && guildId) {
        queryClient.setQueryData(nukeConfigQueryKey(guildId), context.previous);
      }
    },
    onSettled: () => {
      if (guildId) {
        void queryClient.invalidateQueries({ queryKey: nukeConfigQueryKey(guildId) });
      }
    },
  });
}
