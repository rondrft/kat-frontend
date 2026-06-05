"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { useAuthStore } from "@/store/auth-store";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import type { OwnerMetrics } from "@/types/owner";
import type { ApiResponse } from "@/types/api";

export const ownerMetricsQueryKey = ["owner", "metrics"] as const;

export function useOwnerMetrics() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const status = useAuthStore((s) => s.status);
  const accessToken = useAuthStore((s) => s.session?.accessToken);
  const token = accessToken ?? (hasHydrated ? getStoredAccessToken() : null);
  const enabled = hasHydrated && status !== "unauthenticated" && Boolean(token);

  return useQuery({
    queryKey: ownerMetricsQueryKey,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<OwnerMetrics>>(endpoints.owner.metrics);
      return data.data;
    },
    enabled,
    staleTime: 60_000,
  });
}
