"use client";

import { useQuery } from "@tanstack/react-query";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import type { GuildRole } from "@/features/auto-roles/types/auto-roles-config";
import { useAuthStore } from "@/store/auth-store";
import { guildService } from "@/services/guild.service";

export const guildRolesQueryKey = (guildId: string) =>
  ["guilds", guildId, "roles"] as const;

export function useGuildRoles(guildId: string | null, active = true) {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.session?.user?.id);
  const accessToken = useAuthStore((s) => s.session?.accessToken);

  const enabled =
    Boolean(guildId) &&
    active &&
    status !== "unauthenticated" &&
    Boolean(userId || accessToken || getStoredAccessToken());

  return useQuery({
    queryKey: guildId ? guildRolesQueryKey(guildId) : ["guilds", "roles"],
    queryFn: () => guildService.getGuildRoles(guildId!),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
  });
}

export type { GuildRole };
