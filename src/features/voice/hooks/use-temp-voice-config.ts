"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import type {
  TempVoiceConfig,
  TempVoiceSaveRequest,
} from "@/features/voice/types/temp-voice-config";
import { useAuthStore } from "@/store/auth-store";
import { guildService } from "@/services/guild.service";

export const tempVoiceConfigQueryKey = (guildId: string) =>
  ["guilds", guildId, "voice", "temp"] as const;

function useVoiceQueryEnabled(guildId: string | null, extra = true) {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.session?.user?.id);
  const accessToken = useAuthStore((s) => s.session?.accessToken);

  return (
    Boolean(guildId) &&
    extra &&
    status !== "unauthenticated" &&
    Boolean(userId || accessToken || getStoredAccessToken())
  );
}

export function useTempVoiceConfig(guildId: string | null, enabled = true) {
  const queryEnabled = useVoiceQueryEnabled(guildId, enabled);

  return useQuery({
    queryKey: guildId ? tempVoiceConfigQueryKey(guildId) : ["guilds", "voice", "temp"],
    queryFn: () => guildService.getTempVoiceConfig(guildId!),
    enabled: queryEnabled,
    staleTime: 60_000,
  });
}

export function useSaveTempVoiceConfig(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TempVoiceSaveRequest) =>
      guildService.saveTempVoiceConfig(guildId!, payload),
    onSuccess: (data) => {
      if (guildId) {
        queryClient.setQueryData(tempVoiceConfigQueryKey(guildId), data);
      }
    },
  });
}

export type { TempVoiceConfig, TempVoiceSaveRequest };
