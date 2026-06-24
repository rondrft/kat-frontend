"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { useAuthStore } from "@/store/auth-store";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import type { BotStatus } from "@/features/bot-status/types";
import type { ApiResponse } from "@/types/api";

export const botStatusQueryKey = ["bot", "status"] as const;

export function useBotStatus(enabled: boolean) {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.session?.user?.id);
  const accessToken = useAuthStore((s) => s.session?.accessToken);
  const token = accessToken ?? (hasHydrated ? getStoredAccessToken() : null);
  const canFetch = hasHydrated && status !== "unauthenticated" && Boolean(userId || token) && enabled;

  return useQuery({
    queryKey: botStatusQueryKey,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<BotStatus>>(endpoints.bot.status);
      return data.data;
    },
    enabled: canFetch,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}
