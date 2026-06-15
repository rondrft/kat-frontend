"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, endpoints } from "@/api";
import type { ApiResponse } from "@/types/api";
import { useAuthStore } from "@/store/auth-store";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import type { ModPermissions } from "@/types/moderation";

export const modPermissionsQueryKey = (guildId: string) =>
  ["guilds", guildId, "moderation", "permissions"] as const;

const PERM_FIELDS: (keyof ModPermissions)[] = [
  "xkick", "xban", "xsoftban", "xtempban", "xunban",
  "xmute", "xunmute", "xwarn", "xhistory", "xwarnings",
  "xclearwarns", "xnuke", "xslowmode", "xlock", "xunlock",
  "xfilter", "xwhitelist", "xmodconfig",
];

function normalizePermissions(raw: unknown): ModPermissions {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const result = {} as ModPermissions;
  for (const field of PERM_FIELDS) {
    const val = obj[field];
    result[field] = Array.isArray(val) ? val.filter((v): v is string => typeof v === "string") : [];
  }
  return result;
}

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

export function useModPermissions(guildId: string | null) {
  const enabled = useQueryEnabled(guildId);

  return useQuery({
    queryKey: guildId ? modPermissionsQueryKey(guildId) : ["guilds", "moderation", "permissions"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<ModPermissions> | unknown>(
        endpoints.guilds.moderationPermissions(guildId!),
      );
      const raw =
        typeof data === "object" && data !== null && "data" in data
          ? (data as ApiResponse<ModPermissions>).data
          : (data as ModPermissions);
      return normalizePermissions(raw);
    },
    enabled,
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useSaveModPermissions(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ModPermissions) => {
      const { data } = await apiClient.put<ApiResponse<ModPermissions> | unknown>(
        endpoints.guilds.moderationPermissions(guildId!),
        payload,
      );
      const raw =
        typeof data === "object" && data !== null && "data" in data
          ? (data as ApiResponse<ModPermissions>).data
          : (data as ModPermissions);
      return normalizePermissions(raw);
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: guildId ? modPermissionsQueryKey(guildId) : ["guilds", "moderation", "permissions"] });
      const previous = queryClient.getQueryData<ModPermissions>(
        guildId ? modPermissionsQueryKey(guildId) : ["guilds", "moderation", "permissions"],
      );
      queryClient.setQueryData(
        guildId ? modPermissionsQueryKey(guildId) : ["guilds", "moderation", "permissions"],
        payload,
      );
      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous && guildId) {
        queryClient.setQueryData(modPermissionsQueryKey(guildId), context.previous);
      }
    },
    onSettled: () => {
      if (guildId) {
        void queryClient.invalidateQueries({ queryKey: modPermissionsQueryKey(guildId) });
      }
    },
  });
}
