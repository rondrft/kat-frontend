"use client";

import { useQuery } from "@tanstack/react-query";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import type { GuildCategory } from "@/features/voice/types/temp-voice-config";
import { useAuthStore } from "@/store/auth-store";
import { guildService } from "@/services/guild.service";

export const guildCategoriesQueryKey = (guildId: string) =>
  ["guilds", guildId, "channels", "categories"] as const;

export function useGuildCategories(guildId: string | null) {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.session?.user?.id);
  const accessToken = useAuthStore((s) => s.session?.accessToken);

  const enabled =
    Boolean(guildId) &&
    status !== "unauthenticated" &&
    Boolean(userId || accessToken || getStoredAccessToken());

  return useQuery({
    queryKey: guildId ? guildCategoriesQueryKey(guildId) : ["guilds", "categories"],
    queryFn: () => guildService.getGuildCategories(guildId!),
    enabled,
    staleTime: 60 * 1000,
  });
}

export type { GuildCategory };
