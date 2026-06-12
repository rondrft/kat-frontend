import { apiClient, endpoints } from "@/api";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { Guild, GuildSettings } from "@/types/guild";
import type { LoggingConfig } from "@/types/logging";
import type { MonthlyJoinStats } from "@/features/dashboard/types/monthly-joins";
import type { NewMember } from "@/features/dashboard/types/new-member";
import type {
  GuildActivityDay,
  GuildStats,
} from "@/features/dashboard/types/guild-stats";
import {
  DEFAULT_AUTO_ROLES_CONFIG,
  type AutoRolesConfig,
  type AutoRolesPutRequest,
  type GuildRole,
  type GuildTextChannel,
  type ReactionRoleMapping,
} from "@/features/auto-roles/types/auto-roles-config";
import type {
  ActionsConfig,
  ActionsSaveRequest,
} from "@/features/actions/types/actions-config";
import type {
  LevelingConfig,
  LevelingSaveRequest,
} from "@/features/leveling/types/leveling-config";
import type {
  GuildCategory,
  TempVoiceConfig,
  TempVoiceSaveRequest,
} from "@/features/voice/types/temp-voice-config";
import { AppError } from "@/lib/errors";
import {
  normalizeMemberJoinStatsList,
  normalizeMonthlyJoinStats,
} from "@/utils/joins-normalize";
import { normalizeGuild, normalizeGuildList } from "@/utils/guild-normalize";
import { normalizeNewMemberList } from "@/utils/member-normalize";

export const guildService = {
  async listAvailable(): Promise<Guild[]> {
    const { data } = await apiClient.get<unknown>(endpoints.guilds.list);
    return normalizeGuildList(data);
  },

  async list(page = 0, size = 20): Promise<PageResponse<Guild>> {
    const { data } = await apiClient.get<PageResponse<Guild>>(endpoints.guilds.list, {
      params: { page, size },
    });
    return data;
  },

  async getById(guildId: string): Promise<Guild> {
    const { data } = await apiClient.get<ApiResponse<Guild> | Guild>(
      endpoints.guilds.byId(guildId),
    );
    const raw =
      typeof data === "object" && data !== null && "data" in data
        ? (data as ApiResponse<Guild>).data
        : data;
    return normalizeGuild(raw);
  },

  async updateSettings(
    guildId: string,
    settings: Partial<GuildSettings>,
  ): Promise<GuildSettings> {
    const { data } = await apiClient.patch<ApiResponse<GuildSettings>>(
      endpoints.guilds.settings(guildId),
      settings,
    );
    return data.data;
  },

  async getGuildStats(guildId: string): Promise<GuildStats> {
    const { data } = await apiClient.get<ApiResponse<GuildStats> | unknown>(
      endpoints.guilds.stats(guildId),
    );
    return normalizeGuildStats(unwrapApiData(data));
  },

  async getMemberJoinStats(guildId: string, days = 30): Promise<MonthlyJoinStats> {
    const { data } = await apiClient.get<ApiResponse<unknown> | unknown>(
      endpoints.guilds.memberStats(guildId),
      { params: { days } },
    );
    const raw =
      typeof data === "object" && data !== null && "data" in data
        ? (data as ApiResponse<unknown>).data
        : data;
    return normalizeMemberJoinStatsList(raw);
  },

  async getMonthlyJoinStats(guildId: string): Promise<MonthlyJoinStats> {
    const { data } = await apiClient.get<ApiResponse<MonthlyJoinStats> | unknown>(
      endpoints.guilds.monthlyJoins(guildId),
    );
    const raw =
      typeof data === "object" && data !== null && "data" in data
        ? (data as ApiResponse<unknown>).data
        : data;
    return normalizeMonthlyJoinStats(raw);
  },

  async getGuildCategories(guildId: string): Promise<GuildCategory[]> {
    const { data } = await apiClient.get<ApiResponse<GuildCategory[]> | unknown>(
      endpoints.guilds.categories(guildId),
    );
    const raw =
      typeof data === "object" && data !== null && "data" in data
        ? (data as ApiResponse<unknown>).data
        : data;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => {
        const row = item as Record<string, unknown>;
        const id = String(row.id ?? "");
        const name = String(row.name ?? "Category");
        return id ? { id, name } : null;
      })
      .filter((c): c is GuildCategory => c !== null);
  },

  async getGuildRoles(guildId: string): Promise<GuildRole[]> {
    const { data } = await apiClient.get<ApiResponse<GuildRole[]> | unknown>(
      endpoints.guilds.roles(guildId),
    );
    const raw = unwrapApiData(data);
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item): GuildRole | null => {
        const row = item as Record<string, unknown>;
        const id = String(row.id ?? "");
        const name = String(row.name ?? "Role");
        if (!id) return null;
        const role: GuildRole = { id, name };
        if (typeof row.color === "number") role.color = row.color;
        return role;
      })
      .filter((r): r is GuildRole => r !== null);
  },

  async getGuildTextChannels(guildId: string): Promise<GuildTextChannel[]> {
    const { data } = await apiClient.get<ApiResponse<GuildTextChannel[]> | unknown>(
      endpoints.guilds.textChannels(guildId),
    );
    const raw = unwrapApiData(data);
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item): GuildTextChannel | null => {
        const row = item as Record<string, unknown>;
        const id = String(row.id ?? "");
        const name = String(row.name ?? "channel");
        if (!id) return null;
        return { id, name };
      })
      .filter((c): c is GuildTextChannel => c !== null);
  },

  async getAutoRolesConfig(guildId: string): Promise<AutoRolesConfig | null> {
    try {
      const { data } = await apiClient.get<
        ApiResponse<AutoRolesConfig> | AutoRolesConfig
      >(endpoints.guilds.autoRoles(guildId));
      return normalizeAutoRolesConfig(unwrapApiData(data));
    } catch (error) {
      if (error instanceof AppError && error.status === 404) return null;
      throw error;
    }
  },

  async saveAutoRolesConfig(
    guildId: string,
    payload: AutoRolesPutRequest,
  ): Promise<AutoRolesConfig> {
    const { data } = await apiClient.put<
      ApiResponse<AutoRolesConfig> | AutoRolesConfig
    >(endpoints.guilds.autoRoles(guildId), payload);
    return normalizeAutoRolesConfig(unwrapApiData(data))!;
  },

  async getTempVoiceConfig(guildId: string): Promise<TempVoiceConfig | null> {
    try {
      const { data } = await apiClient.get<
        ApiResponse<TempVoiceConfig> | TempVoiceConfig
      >(endpoints.guilds.tempVoice(guildId));
      return unwrapApiData(data) as TempVoiceConfig;
    } catch (error) {
      if (error instanceof AppError && error.status === 404) return null;
      throw error;
    }
  },

  async saveTempVoiceConfig(
    guildId: string,
    payload: TempVoiceSaveRequest,
  ): Promise<TempVoiceConfig> {
    const { data } = await apiClient.put<
      ApiResponse<TempVoiceConfig> | TempVoiceConfig
    >(endpoints.guilds.tempVoice(guildId), payload);
    return unwrapApiData(data) as TempVoiceConfig;
  },

  async getActionsConfig(guildId: string): Promise<ActionsConfig | null> {
    try {
      const { data } = await apiClient.get<
        ApiResponse<ActionsConfig> | ActionsConfig
      >(endpoints.guilds.actions(guildId));
      const config = unwrapApiData(data) as ActionsConfig;
      if (!config || typeof config.enabled !== "boolean") return null;
      return config;
    } catch (error) {
      if (error instanceof AppError && error.status === 404) return null;
      throw error;
    }
  },

  async saveActionsConfig(
    guildId: string,
    payload: ActionsSaveRequest,
  ): Promise<ActionsConfig> {
    const { data } = await apiClient.put<
      ApiResponse<ActionsConfig> | ActionsConfig
    >(endpoints.guilds.actions(guildId), payload);
    return unwrapApiData(data) as ActionsConfig;
  },

  async getLevelingConfig(guildId: string): Promise<LevelingConfig | null> {
    try {
      const { data } = await apiClient.get<
        ApiResponse<LevelingConfig> | LevelingConfig
      >(endpoints.guilds.leveling(guildId));
      const config = unwrapApiData(data) as LevelingConfig;
      if (!config || typeof config.enabled !== "boolean") return null;
      return config;
    } catch (error) {
      if (error instanceof AppError && error.status === 404) return null;
      throw error;
    }
  },

  async saveLevelingConfig(
    guildId: string,
    payload: LevelingSaveRequest,
  ): Promise<LevelingConfig> {
    const { data } = await apiClient.put<
      ApiResponse<LevelingConfig> | LevelingConfig
    >(endpoints.guilds.leveling(guildId), payload);
    return unwrapApiData(data) as LevelingConfig;
  },

  async getLoggingConfig(guildId: string): Promise<LoggingConfig | null> {
    try {
      const { data } = await apiClient.get<ApiResponse<LoggingConfig> | LoggingConfig>(
        endpoints.guilds.logging(guildId),
      );
      const config = unwrapApiData(data) as LoggingConfig;
      if (!config || !Array.isArray(config.entries)) return null;
      return config;
    } catch (error) {
      if (error instanceof AppError && error.status === 404) return null;
      throw error;
    }
  },

  async saveLoggingConfig(guildId: string, config: LoggingConfig): Promise<LoggingConfig> {
    const { data } = await apiClient.put<ApiResponse<LoggingConfig> | LoggingConfig>(
      endpoints.guilds.logging(guildId),
      config,
    );
    return unwrapApiData(data) as LoggingConfig;
  },

  async getRecentMembers(guildId: string, limit = 8): Promise<NewMember[]> {
    const { data } = await apiClient.get<ApiResponse<NewMember[]> | unknown>(
      endpoints.guilds.recentMembers(guildId),
      { params: { limit } },
    );
    const raw =
      typeof data === "object" && data !== null && "data" in data
        ? (data as ApiResponse<unknown>).data
        : data;
    return normalizeNewMemberList(raw);
  },
};

function unwrapApiData<T>(data: ApiResponse<T> | T): T {
  if (typeof data === "object" && data !== null && "data" in data) {
    return (data as ApiResponse<T>).data;
  }
  return data as T;
}

function numberFrom(
  row: Record<string, unknown>,
  keys: string[],
  fallback = 0,
): number {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return fallback;
}

function stringFrom(row: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

function formatModuleName(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeActiveModules(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map(String).filter(Boolean).map(formatModuleName);
  }

  if (raw && typeof raw === "object") {
    return Object.entries(raw as Record<string, unknown>)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([name]) => formatModuleName(name));
  }

  return [];
}

function normalizeActivityDays(raw: unknown): GuildActivityDay[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item): GuildActivityDay | null => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const date = stringFrom(row, ["date", "day", "createdAt"]);
      if (!date) return null;

      const joins = numberFrom(row, ["joins", "joinCount", "membersJoined"]);
      const voiceJoins = numberFrom(row, [
        "voiceJoins",
        "voiceJoinCount",
        "vcJoins",
        "voiceEvents",
      ]);
      const tempChannels = numberFrom(row, [
        "tempChannels",
        "tempChannelsCreated",
        "temporaryChannels",
      ]);
      const commands = numberFrom(row, ["commands", "commandsUsed", "commandCount"]);
      const total = numberFrom(
        row,
        ["total", "count", "activity"],
        joins + voiceJoins + tempChannels + commands,
      );

      return {
        date,
        joins,
        voiceJoins,
        tempChannels,
        commands,
        total,
      };
    })
    .filter((day): day is GuildActivityDay => day !== null);
}

function normalizeGuildStats(raw: unknown): GuildStats {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  return {
    totalMembers: numberFrom(row, ["totalMembers", "memberCount", "members"]),
    boostLevel: numberFrom(row, ["boostLevel", "premiumTier", "boostTier"]),
    boosterCount: numberFrom(row, ["boosterCount", "boosters", "boostCount"]),
    totalRoles: numberFrom(row, ["totalRoles", "roleCount", "rolesCount"]),
    totalTextChannels: numberFrom(row, [
      "totalTextChannels",
      "textChannelCount",
      "textChannels",
    ]),
    totalVoiceChannels: numberFrom(row, [
      "totalVoiceChannels",
      "voiceChannelCount",
      "voiceChannels",
    ]),
    createdAt: stringFrom(row, ["createdAt", "guildCreatedAt", "serverCreatedAt"]),
    activeCustomRoles: numberFrom(row, [
      "activeCustomRoles",
      "customRolesActive",
      "customRoleCount",
    ]),
    activeModules: normalizeActiveModules(
      row.activeModules ?? row.modulesActive ?? row.enabledModules ?? row.modules,
    ),
    voiceJoinsThisMonth: numberFrom(row, [
      "voiceJoinsThisMonth",
      "monthlyVoiceJoins",
      "voiceJoinCount",
      "vcJoinCount",
    ]),
    tempChannelsCreatedThisMonth: numberFrom(row, [
      "tempChannelsCreatedThisMonth",
      "monthlyTempChannels",
      "tempChannelCount",
    ]),
    commandsUsedThisMonth: numberFrom(row, [
      "commandsUsedThisMonth",
      "monthlyCommands",
      "commandCount",
    ]),
    activityDays: normalizeActivityDays(
      row.activityDays ?? row.dailyActivity ?? row.activity ?? row.dailyStats,
    ),
  };
}

function normalizeAutoRolesConfig(raw: unknown): AutoRolesConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;

  const mappingsRaw = row.reactionMappings;
  const reactionMappings: ReactionRoleMapping[] = Array.isArray(mappingsRaw)
    ? mappingsRaw
        .map((item) => {
          const m = item as Record<string, unknown>;
          const emoji = String(m.emoji ?? "").trim();
          const roleId = String(m.roleId ?? "");
          return emoji && roleId ? { emoji, roleId } : null;
        })
        .filter((m): m is ReactionRoleMapping => m !== null)
    : [];

  return {
    joinEnabled: Boolean(row.joinEnabled),
    joinRoleIds: Array.isArray(row.joinRoleIds) ? row.joinRoleIds.map(String) : [],
    boostEnabled: Boolean(row.boostEnabled),
    boostRoleIds: Array.isArray(row.boostRoleIds) ? row.boostRoleIds.map(String) : [],
    reactionEnabled: Boolean(row.reactionEnabled),
    reactionChannelId: String(row.reactionChannelId ?? ""),
    reactionUseEmbed: Boolean(row.reactionUseEmbed),
    reactionEmbedTitle: String(
      row.reactionEmbedTitle ?? DEFAULT_AUTO_ROLES_CONFIG.reactionEmbedTitle,
    ),
    reactionEmbedColor: String(
      row.reactionEmbedColor ?? DEFAULT_AUTO_ROLES_CONFIG.reactionEmbedColor,
    ),
    reactionMessageContent: String(
      row.reactionMessageContent ?? DEFAULT_AUTO_ROLES_CONFIG.reactionMessageContent,
    ),
    reactionMessageId: row.reactionMessageId
      ? String(row.reactionMessageId)
      : undefined,
    reactionMappings,
  };
}
