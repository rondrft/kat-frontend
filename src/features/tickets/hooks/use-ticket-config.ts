import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TicketConfigFormValues } from "@/features/tickets/types/ticket-config";
import type { TicketConfigSchemaType } from "@/features/tickets/schemas/ticket-config-schema";
import {
  getTicketConfig,
  resetTicketSystem,
  saveTicketConfig,
} from "@/features/tickets/lib/tickets-api";

export const ticketConfigQueryKey = (guildId: string) =>
  ["guilds", guildId, "tickets"] as const;

export function useTicketConfig(guildId: string | null) {
  return useQuery({
    queryKey: guildId ? ticketConfigQueryKey(guildId) : ["guilds", "tickets"],
    queryFn: () => getTicketConfig(guildId!),
    enabled: Boolean(guildId),
    staleTime: 60_000,
  });
}

export function useSaveTicketConfig(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: TicketConfigFormValues | TicketConfigSchemaType) =>
      saveTicketConfig(guildId!, values),
    onSuccess: (data) => {
      if (guildId) {
        queryClient.setQueryData(ticketConfigQueryKey(guildId), data);
      }
    },
  });
}

export function useResetTicketSystem(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resetTicketSystem(guildId!),
    onSuccess: () => {
      if (guildId) {
        queryClient.setQueryData(ticketConfigQueryKey(guildId), null);
      }
    },
  });
}

