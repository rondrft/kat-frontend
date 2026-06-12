"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import type {
  ActionsConfig,
  ActionsSaveRequest,
} from "@/features/actions/types/actions-config";
import { useAuthStore } from "@/store/auth-store";
import { guildService } from "@/services/guild.service";

export const actionsConfigQueryKey = (guildId: string) =>
  ["guilds", guildId, "actions"] as const;

function useActionsQueryEnabled(guildId: string | null, active = true) {
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

export function useActionsConfig(guildId: string | null, enabled = true) {
  const queryEnabled = useActionsQueryEnabled(guildId, enabled);

  return useQuery({
    queryKey: guildId ? actionsConfigQueryKey(guildId) : ["guilds", "actions"],
    queryFn: () => guildService.getActionsConfig(guildId!),
    enabled: queryEnabled,
    staleTime: 60_000,
  });
}

export function useSaveActionsConfig(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ActionsSaveRequest) =>
      guildService.saveActionsConfig(guildId!, payload),
    onSuccess: (data) => {
      if (guildId) {
        queryClient.setQueryData(actionsConfigQueryKey(guildId), data);
      }
    },
  });
}

export type { ActionsConfig, ActionsSaveRequest };
