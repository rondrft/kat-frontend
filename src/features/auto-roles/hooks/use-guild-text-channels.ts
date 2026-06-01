"use client";

import { useQuery } from "@tanstack/react-query";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import type { GuildTextChannel } from "@/features/auto-roles/types/auto-roles-config";
import { useAuthStore } from "@/store/auth-store";
import { guildService } from "@/services/guild.service";

export const guildTextChannelsQueryKey = (guildId: string) =>
  ["guilds", guildId, "channels", "text"] as const;

export function useGuildTextChannels(guildId: string | null, active = true) {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.session?.user?.id);
  const accessToken = useAuthStore((s) => s.session?.accessToken);

  const enabled =
    Boolean(guildId) &&
    active &&
    status !== "unauthenticated" &&
    Boolean(userId || accessToken || getStoredAccessToken());

  return useQuery({
    queryKey: guildId
      ? guildTextChannelsQueryKey(guildId)
      : ["guilds", "channels", "text"],
    queryFn: () => guildService.getGuildTextChannels(guildId!),
    enabled,
    staleTime: 60 * 1000,
  });
}

export type { GuildTextChannel };
