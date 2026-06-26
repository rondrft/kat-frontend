"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import { useAuthStore } from "@/store/auth-store";
import { guildService } from "@/services/guild.service";
import type { RecurringMessageRequest } from "@/features/recurring-messages/types/recurring-message";

export const recurringMessagesQueryKey = (guildId: string) =>
  ["guilds", guildId, "recurring-messages"] as const;

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

export function useRecurringMessages(guildId: string | null, enabled = true) {
  const queryEnabled = useQueryEnabled(guildId, enabled);

  return useQuery({
    queryKey: guildId ? recurringMessagesQueryKey(guildId) : ["guilds", "recurring-messages"],
    queryFn: () => guildService.getRecurringMessages(guildId!),
    enabled: queryEnabled,
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });
}

export function useCreateRecurringMessage(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: RecurringMessageRequest) =>
      guildService.createRecurringMessage(guildId!, req),
    onSuccess: () => {
      if (guildId) queryClient.invalidateQueries({ queryKey: recurringMessagesQueryKey(guildId) });
    },
  });
}

export function useUpdateRecurringMessage(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: RecurringMessageRequest }) =>
      guildService.updateRecurringMessage(guildId!, id, req),
    onSuccess: () => {
      if (guildId) queryClient.invalidateQueries({ queryKey: recurringMessagesQueryKey(guildId) });
    },
  });
}

export function useDeleteRecurringMessage(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => guildService.deleteRecurringMessage(guildId!, id),
    onSuccess: () => {
      if (guildId) queryClient.invalidateQueries({ queryKey: recurringMessagesQueryKey(guildId) });
    },
  });
}
