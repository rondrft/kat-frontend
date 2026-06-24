"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import type {
  LevelingConfig,
  LevelRoleReward,
  LevelRoleRewardRequest,
  LevelingSaveRequest,
} from "@/features/leveling/types/leveling-config";
import { useAuthStore } from "@/store/auth-store";
import { guildService } from "@/services/guild.service";

export const levelingConfigQueryKey = (guildId: string) =>
  ["guilds", guildId, "leveling"] as const;

export const levelingRoleRewardsQueryKey = (guildId: string) =>
  ["guilds", guildId, "leveling", "role-rewards"] as const;

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

export function useLevelingConfig(guildId: string | null, enabled = true) {
  const queryEnabled = useQueryEnabled(guildId, enabled);

  return useQuery({
    queryKey: guildId ? levelingConfigQueryKey(guildId) : ["guilds", "leveling"],
    queryFn: () => guildService.getLevelingConfig(guildId!),
    enabled: queryEnabled,
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  });
}

export function useSaveLevelingConfig(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LevelingSaveRequest) =>
      guildService.saveLevelingConfig(guildId!, payload),
    onSuccess: (data) => {
      if (guildId) {
        queryClient.setQueryData(levelingConfigQueryKey(guildId), data);
      }
    },
  });
}

export function useLevelRoleRewards(guildId: string | null, active = true) {
  const queryEnabled = useQueryEnabled(guildId, active);

  return useQuery({
    queryKey: guildId ? levelingRoleRewardsQueryKey(guildId) : ["guilds", "leveling", "role-rewards"],
    queryFn: () => guildService.getLevelRoleRewards(guildId!),
    enabled: queryEnabled,
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  });
}

export function useSaveLevelRoleReward(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LevelRoleRewardRequest) =>
      guildService.saveLevelRoleReward(guildId!, payload),
    onSuccess: () => {
      if (guildId) {
        queryClient.invalidateQueries({ queryKey: levelingRoleRewardsQueryKey(guildId) });
      }
    },
  });
}

export function useDeleteLevelRoleReward(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (level: number) => guildService.deleteLevelRoleReward(guildId!, level),
    onSuccess: () => {
      if (guildId) {
        queryClient.invalidateQueries({ queryKey: levelingRoleRewardsQueryKey(guildId) });
      }
    },
  });
}

export type { LevelingConfig, LevelingSaveRequest, LevelRoleReward };
