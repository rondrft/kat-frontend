"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, endpoints } from "@/api";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import { useAuthStore } from "@/store/auth-store";

export type PremiumStatus = {
  isPremium: boolean;
};

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

export function usePremiumStatus(guildId: string | null) {
  const enabled = useQueryEnabled(guildId);

  return useQuery({
    queryKey: ["guilds", guildId, "premium"],
    queryFn: async () => {
      const { data } = await apiClient.get(endpoints.guilds.premium(guildId!));
      const raw =
        typeof data === "object" && data !== null && "data" in data
          ? (data as { data: unknown }).data
          : data;
      return { isPremium: Boolean((raw as Record<string, unknown>)?.isPremium ?? false) };
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previous) => previous,
    retry: false,
  });
}
