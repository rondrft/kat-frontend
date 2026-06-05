"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, endpoints } from "@/api";
import type { ApiResponse } from "@/types/api";
import { useAuthStore } from "@/store/auth-store";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import type { PurgeConfig } from "@/types/moderation";

export const purgeConfigQueryKey = (guildId: string) =>
  ["guilds", guildId, "moderation", "purge"] as const;

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

function normalizePurgeConfig(raw: unknown): PurgeConfig {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    enabled: Boolean(row.enabled),
    allowedRoleId: typeof row.allowedRoleId === "string" ? row.allowedRoleId : null,
    maxMessages:
      typeof row.maxMessages === "number"
        ? Math.min(40, Math.max(1, Math.round(row.maxMessages)))
        : 20,
    maxAgeSeconds:
      typeof row.maxAgeSeconds === "number"
        ? Math.min(86400, Math.max(10, row.maxAgeSeconds))
        : 300,
  };
}

export function usePurgeConfig(guildId: string | null) {
  const enabled = useQueryEnabled(guildId);

  return useQuery({
    queryKey: guildId ? purgeConfigQueryKey(guildId) : ["guilds", "moderation", "purge"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<PurgeConfig> | unknown>(
        endpoints.guilds.moderationPurge(guildId!),
      );
      const raw =
        typeof data === "object" && data !== null && "data" in data
          ? (data as ApiResponse<PurgeConfig>).data
          : data;
      return normalizePurgeConfig(raw);
    },
    enabled,
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useSavePurgeConfig(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PurgeConfig) => {
      const { data } = await apiClient.put<ApiResponse<PurgeConfig> | unknown>(
        endpoints.guilds.moderationPurge(guildId!),
        payload,
      );
      const raw =
        typeof data === "object" && data !== null && "data" in data
          ? (data as ApiResponse<PurgeConfig>).data
          : data;
      return normalizePurgeConfig(raw);
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: guildId ? purgeConfigQueryKey(guildId) : ["guilds", "moderation", "purge"] });
      const previous = queryClient.getQueryData<PurgeConfig>(
        guildId ? purgeConfigQueryKey(guildId) : ["guilds", "moderation", "purge"],
      );
      queryClient.setQueryData(
        guildId ? purgeConfigQueryKey(guildId) : ["guilds", "moderation", "purge"],
        payload,
      );
      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous && guildId) {
        queryClient.setQueryData(purgeConfigQueryKey(guildId), context.previous);
      }
    },
    onSettled: () => {
      if (guildId) {
        void queryClient.invalidateQueries({ queryKey: purgeConfigQueryKey(guildId) });
      }
    },
  });
}
