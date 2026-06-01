import { apiClient, endpoints } from "@/api";
import type { ApiResponse } from "@/types/api";

export type BotStatus = {
  online: boolean;
  latencyMs: number;
  uptimeSeconds: number;
  version: string;
};

export type BotStats = {
  guildCount: number;
  userCount: number;
  commandsToday: number;
};

export const botService = {
  async getStatus(): Promise<BotStatus> {
    const { data } = await apiClient.get<ApiResponse<BotStatus>>(endpoints.bot.status);
    return data.data;
  },

  async getStats(): Promise<BotStats> {
    const { data } = await apiClient.get<ApiResponse<BotStats>>(endpoints.bot.stats);
    return data.data;
  },
};
