"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import { useAuthStore } from "@/store/auth-store";
import { guildService } from "@/services/guild.service";
import type { GuildBrandingRequest } from "@/features/branding/types/branding";

export const brandingQueryKey = (guildId: string) =>
  ["guilds", guildId, "branding"] as const;

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

export function useGuildBranding(guildId: string | null, enabled = true) {
  const queryEnabled = useQueryEnabled(guildId, enabled);

  return useQuery({
    queryKey: guildId ? brandingQueryKey(guildId) : ["guilds", "branding"],
    queryFn: () => guildService.getGuildBranding(guildId!),
    enabled: queryEnabled,
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  });
}

export function useSaveGuildBranding(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: GuildBrandingRequest) =>
      guildService.saveGuildBranding(guildId!, req),
    onSuccess: (data) => {
      if (guildId) queryClient.setQueryData(brandingQueryKey(guildId), data);
    },
  });
}
