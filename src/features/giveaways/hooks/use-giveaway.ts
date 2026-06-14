import { useMutation, useQuery } from "@tanstack/react-query";
import { giveawayService } from "@/features/giveaways/services/giveaway.service";
import type {
  CreateGiveawayRequest,
  Giveaway,
  GiveawayParticipant,
  RollGiveawayResponse,
} from "@/features/giveaways/types/giveaway";

export const giveawayQueryKey = (guildId: string, giveawayId: string) =>
  ["guilds", guildId, "giveaways", giveawayId] as const;

export const giveawayParticipantsQueryKey = (guildId: string, giveawayId: string) =>
  ["guilds", guildId, "giveaways", giveawayId, "participants"] as const;

export function useCreateGiveaway(guildId: string | null) {
  return useMutation<Giveaway, Error, CreateGiveawayRequest>({
    mutationFn: (payload) => giveawayService.createGiveaway(guildId!, payload),
  });
}

export function useGiveaway(guildId: string | null, giveawayId: string | null) {
  return useQuery<Giveaway, Error>({
    queryKey: giveawayQueryKey(guildId ?? "", giveawayId ?? ""),
    queryFn: () => giveawayService.getGiveaway(guildId!, giveawayId!),
    enabled: Boolean(guildId) && Boolean(giveawayId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || data.ended) return false;
      return 3000;
    },
  });
}

export function useGiveawayParticipants(guildId: string | null, giveawayId: string | null) {
  return useQuery<GiveawayParticipant[], Error>({
    queryKey: giveawayParticipantsQueryKey(guildId ?? "", giveawayId ?? ""),
    queryFn: () => giveawayService.getParticipants(guildId!, giveawayId!),
    enabled: Boolean(guildId) && Boolean(giveawayId),
    refetchInterval: 3000,
  });
}

export function useRollGiveaway(guildId: string | null) {
  return useMutation<RollGiveawayResponse, Error, string>({
    mutationFn: (giveawayId) => giveawayService.rollGiveaway(guildId!, giveawayId),
  });
}
