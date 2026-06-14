import { apiClient, endpoints } from "@/api";
import type { ApiResponse } from "@/types/api";
import type {
  CreateGiveawayRequest,
  CreateGiveawayResponse,
  Giveaway,
  GiveawayParticipant,
  RollGiveawayResponse,
} from "@/features/giveaways/types/giveaway";

function unwrapApiData<T>(data: ApiResponse<T> | T): T {
  if (typeof data === "object" && data !== null && "data" in data) {
    return (data as ApiResponse<T>).data;
  }
  return data as T;
}

export const giveawayService = {
  async createGiveaway(
    guildId: string,
    payload: CreateGiveawayRequest,
  ): Promise<CreateGiveawayResponse> {
    const { data } = await apiClient.post<ApiResponse<CreateGiveawayResponse> | CreateGiveawayResponse>(
      endpoints.guilds.giveaways(guildId),
      payload,
    );
    return unwrapApiData(data);
  },

  async getGiveaway(guildId: string, giveawayId: string): Promise<Giveaway> {
    const { data } = await apiClient.get<ApiResponse<Giveaway> | Giveaway>(
      endpoints.guilds.giveawayById(guildId, giveawayId),
    );
    return unwrapApiData(data);
  },

  async getParticipants(
    guildId: string,
    giveawayId: string,
  ): Promise<GiveawayParticipant[]> {
    const { data } = await apiClient.get<ApiResponse<GiveawayParticipant[]> | GiveawayParticipant[]>(
      endpoints.guilds.giveawayParticipants(guildId, giveawayId),
    );
    const raw = unwrapApiData(data);
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => normalizeParticipant(item as Record<string, unknown>));
  },

  async rollGiveaway(
    guildId: string,
    giveawayId: string,
  ): Promise<RollGiveawayResponse> {
    const { data } = await apiClient.post<ApiResponse<RollGiveawayResponse> | RollGiveawayResponse>(
      endpoints.guilds.giveawayRoll(guildId, giveawayId),
    );
    const raw = unwrapApiData(data);
    return normalizeRollResponse(raw as Record<string, unknown>);
  },
};

function normalizeParticipant(row: Record<string, unknown>): GiveawayParticipant {
  return {
    userId: String(row.userId ?? ""),
    username: String(row.username ?? ""),
    globalName: row.globalName != null ? String(row.globalName) : null,
    avatarUrl: String(row.avatarUrl ?? ""),
    effectiveName: String(row.effectiveName ?? row.username ?? ""),
    booster: Boolean(row.booster),
  };
}

function normalizeRollResponse(row: Record<string, unknown>): RollGiveawayResponse {
  const winnersRaw = row.winners;
  const winners = Array.isArray(winnersRaw)
    ? winnersRaw.map((item) => normalizeParticipant(item as Record<string, unknown>))
    : [];

  return {
    giveawayId: String(row.giveawayId ?? ""),
    winners,
    totalParticipants: Number(row.totalParticipants ?? 0),
    ended: Boolean(row.ended),
  };
}
