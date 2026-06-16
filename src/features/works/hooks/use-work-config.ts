"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import type {
  WorkConfig,
  WorkSaveRequest,
} from "@/features/works/types/work-config";
import { useAuthStore } from "@/store/auth-store";
import { guildService } from "@/services/guild.service";

export const workConfigQueryKey = (guildId: string) =>
  ["guilds", guildId, "works"] as const;

function useQueryEnabled(guildId: string | null, active = true) {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.session?.user?.id);
  const accessToken = useAuthStore((s) => s.session?.accessToken);

  return (
    Boolean(guildId) &&
    active &&
    status !== "unauthenticated" &&
    Boolean(userId || accessToken || getStoredAccessToken())
  );
}

export function useWorkConfig(guildId: string | null, enabled = true) {
  const queryEnabled = useQueryEnabled(guildId, enabled);

  return useQuery({
    queryKey: guildId ? workConfigQueryKey(guildId) : ["guilds", "works"],
    queryFn: () => guildService.getWorkConfig(guildId!),
    enabled: queryEnabled,
    staleTime: 60_000,
  });
}

export function useSaveWorkConfig(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WorkSaveRequest) =>
      guildService.saveWorkConfig(guildId!, payload),
    onSuccess: (data) => {
      if (guildId) {
        queryClient.setQueryData(workConfigQueryKey(guildId), data);
      }
    },
  });
}

export type { WorkConfig, WorkSaveRequest };
