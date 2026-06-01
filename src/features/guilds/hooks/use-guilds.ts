"use client";

import { useQuery } from "@tanstack/react-query";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import { useAuthStore } from "@/store/auth-store";
import { guildService } from "@/services/guild.service";

export const guildsQueryKey = ["guilds", "available"] as const;

export function useGuilds() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.session?.user?.id);
  const accessToken = useAuthStore((s) => s.session?.accessToken);

  const token = accessToken ?? (hasHydrated ? getStoredAccessToken() : null);
  const enabled =
    hasHydrated && status !== "unauthenticated" && Boolean(userId || token);

  return useQuery({
    queryKey: guildsQueryKey,
    queryFn: () => guildService.listAvailable(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
