"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import type { ModerationFilter } from "@/types/moderation";
import { getFilters, addFilter, updateFilter, deleteFilter } from "@/lib/api/moderation";

export const filtersQueryKey = (guildId: string) =>
  ["guilds", guildId, "moderation", "filters"] as const;

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

export function useFilters(guildId: string | null) {
  const enabled = useQueryEnabled(guildId);

  return useQuery({
    queryKey: guildId ? filtersQueryKey(guildId) : ["guilds", "moderation", "filters"],
    queryFn: () => getFilters(guildId!),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useAddFilter(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filter: Omit<ModerationFilter, "id" | "guildId" | "createdAt">) =>
      addFilter(guildId!, filter),
    onSuccess: () => {
      if (guildId) {
        void queryClient.invalidateQueries({ queryKey: filtersQueryKey(guildId) });
      }
    },
  });
}

export function useUpdateFilter(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ filterId, filter }: { filterId: string; filter: Partial<ModerationFilter> }) =>
      updateFilter(guildId!, filterId, filter),
    onSuccess: () => {
      if (guildId) {
        void queryClient.invalidateQueries({ queryKey: filtersQueryKey(guildId) });
      }
    },
  });
}

export function useDeleteFilter(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filterId: string) => deleteFilter(guildId!, filterId),
    onSuccess: () => {
      if (guildId) {
        void queryClient.invalidateQueries({ queryKey: filtersQueryKey(guildId) });
      }
    },
  });
}
