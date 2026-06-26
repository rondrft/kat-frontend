"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import type {
  AutoRolesConfig,
  AutoRolesPutRequest,
} from "@/features/auto-roles/types/auto-roles-config";
import { useAuthStore } from "@/store/auth-store";
import { guildService } from "@/services/guild.service";

export const autoRolesConfigQueryKey = (guildId: string) =>
  ["guilds", guildId, "autoroles"] as const;

function useAutoRolesQueryEnabled(guildId: string | null, active = true) {
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

export function useAutoRolesConfig(guildId: string | null, active = true) {
  const queryEnabled = useAutoRolesQueryEnabled(guildId, active);

  return useQuery({
    queryKey: guildId ? autoRolesConfigQueryKey(guildId) : ["guilds", "autoroles"],
    queryFn: () => guildService.getAutoRolesConfig(guildId!),
    enabled: queryEnabled,
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  });
}

export function useSaveAutoRolesConfig(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AutoRolesPutRequest) =>
      guildService.saveAutoRolesConfig(guildId!, payload),
    onSuccess: (data) => {
      if (guildId) {
        queryClient.setQueryData(autoRolesConfigQueryKey(guildId), data);
      }
    },
  });
}

export type { AutoRolesConfig, AutoRolesPutRequest };
