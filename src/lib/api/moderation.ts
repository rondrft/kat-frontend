import { apiClient, endpoints } from "@/api";
import type { ApiResponse } from "@/types/api";
import type {
  ModerationAction,
  ModerationConfig,
  ModerationRuleConfig,
  ModerationRuleType,
  SaveModerationConfigPayload,
  ModerationWhitelist,
  ModerationFilter,
  ModerationAutoPunishment,
  ModerationLogPage,
} from "@/types/moderation";

const RULE_TYPES = new Set<ModerationRuleType>([
  "SPAM", "LINKS", "INVITES", "MENTIONS", "CAPS",
  "REPETITION", "WALL_OF_TEXT", "NEWLINES", "SPOILERS",
  "EVERYONE_HERE", "FORMATTING", "EMOJIS", "BAD_WORDS", "PHISHING",
  "MASS_MENTION", "IMAGE_SPAM", "COPY_PASTA", "ACCOUNT_AGE",
  "JOIN_RAID", "CHANNEL_RAID", "ROLE_RAID",
]);

const ACTIONS = new Set<ModerationAction>([
  "MONITOR", "DELETE", "TIMEOUT", "DELETE_AND_TIMEOUT", "WARN", "KICK", "BAN",
]);

const DEFAULT_RULES: ModerationRuleConfig[] = [
  { id: "SPAM", enabled: false, action: "DELETE", threshold: 6, timeoutMinutes: null },
  { id: "LINKS", enabled: false, action: "DELETE", threshold: 2, timeoutMinutes: null },
  { id: "INVITES", enabled: false, action: "DELETE", threshold: 1, timeoutMinutes: null },
  { id: "MENTIONS", enabled: false, action: "TIMEOUT", threshold: 5, timeoutMinutes: null },
  { id: "CAPS", enabled: false, action: "MONITOR", threshold: 80, timeoutMinutes: null },
  { id: "REPETITION", enabled: false, action: "WARN", threshold: 5, timeoutMinutes: null, premium: true },
  { id: "WALL_OF_TEXT", enabled: false, action: "WARN", threshold: 500, timeoutMinutes: null, premium: true },
  { id: "NEWLINES", enabled: false, action: "DELETE", threshold: 5, timeoutMinutes: null, premium: true },
  { id: "SPOILERS", enabled: false, action: "WARN", threshold: 5, timeoutMinutes: null, premium: true },
  { id: "EVERYONE_HERE", enabled: false, action: "TIMEOUT", threshold: 1, timeoutMinutes: null, premium: true },
  { id: "FORMATTING", enabled: false, action: "WARN", threshold: 5, timeoutMinutes: null, premium: true },
  { id: "EMOJIS", enabled: false, action: "WARN", threshold: 5, timeoutMinutes: null, premium: true },
  { id: "BAD_WORDS", enabled: false, action: "DELETE", threshold: 1, timeoutMinutes: null, premium: true },
  { id: "PHISHING", enabled: false, action: "DELETE", threshold: 1, timeoutMinutes: null },
  { id: "MASS_MENTION", enabled: false, action: "WARN", threshold: 5, timeoutMinutes: null, premium: true },
  { id: "IMAGE_SPAM", enabled: false, action: "DELETE", threshold: 3, timeoutMinutes: null, premium: true },
  { id: "COPY_PASTA", enabled: false, action: "DELETE", threshold: 1, timeoutMinutes: null },
  { id: "ACCOUNT_AGE", enabled: false, action: "TIMEOUT", threshold: 7, timeoutMinutes: null, premium: true },
  { id: "JOIN_RAID", enabled: false, action: "KICK", threshold: 10, timeoutMinutes: null, premium: true },
  { id: "CHANNEL_RAID", enabled: false, action: "MONITOR", threshold: 5, timeoutMinutes: null, premium: true },
  { id: "ROLE_RAID", enabled: false, action: "MONITOR", threshold: 5, timeoutMinutes: null, premium: true },
];

export const DEFAULT_MODERATION_CONFIG: ModerationConfig = {
  guildId: "",
  enabled: false,
  strictness: 50,
  defaultTimeoutMinutes: 10,
  rules: DEFAULT_RULES,
};

function unwrapApiData<T>(data: ApiResponse<T> | T): T {
  if (typeof data === "object" && data !== null && "data" in data) {
    return (data as ApiResponse<T>).data;
  }
  return data as T;
}

function numberInRange(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function normalizeAction(value: unknown, fallback: ModerationAction): ModerationAction {
  const action = String(value ?? fallback).toUpperCase() as ModerationAction;
  return ACTIONS.has(action) ? action : fallback;
}

function normalizeRule(raw: unknown): ModerationRuleConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = String(row.id ?? row.ruleType ?? "").toUpperCase() as ModerationRuleType;
  if (!RULE_TYPES.has(id)) return null;
  const fallback = DEFAULT_RULES.find((rule) => rule.id === id)!;

  return {
    id,
    enabled: Boolean(row.enabled),
    action: normalizeAction(row.action, fallback.action),
    threshold: numberInRange(row.threshold, fallback.threshold, 1, 100),
    timeoutMinutes:
      row.timeoutMinutes === null ||
      row.timeoutMinutes === undefined ||
      row.timeoutMinutes === ""
        ? null
        : numberInRange(row.timeoutMinutes, fallback.timeoutMinutes ?? 10, 1, 1440),
    premium: Boolean(row.premium ?? fallback.premium),
  };
}

export function normalizeModerationConfig(
  raw: unknown,
  guildId = "",
): ModerationConfig {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const rawRules = Array.isArray(row.rules) ? row.rules : [];
  const normalizedRules = rawRules
    .map(normalizeRule)
    .filter((rule): rule is ModerationRuleConfig => rule !== null);

  const rules = DEFAULT_RULES.map((fallback) => {
    const saved = normalizedRules.find((rule) => rule.id === fallback.id);
    return saved ?? fallback;
  });

  return {
    guildId: String(row.guildId ?? guildId),
    enabled: Boolean(row.enabled),
    strictness: numberInRange(row.strictness, DEFAULT_MODERATION_CONFIG.strictness, 0, 100),
    defaultTimeoutMinutes: numberInRange(row.defaultTimeoutMinutes, DEFAULT_MODERATION_CONFIG.defaultTimeoutMinutes, 1, 1440),
    rules,
    logChannelId: typeof row.logChannelId === "string" ? row.logChannelId : undefined,
    muteRoleId: typeof row.muteRoleId === "string" ? row.muteRoleId : undefined,
  };
}

export async function getModerationConfig(guildId: string): Promise<ModerationConfig> {
  const { data } = await apiClient.get<ApiResponse<ModerationConfig> | unknown>(
    endpoints.guilds.moderation(guildId),
  );
  return normalizeModerationConfig(unwrapApiData(data), guildId);
}

export async function saveModerationConfig(
  guildId: string,
  payload: SaveModerationConfigPayload,
): Promise<ModerationConfig> {
  const { data } = await apiClient.put<ApiResponse<ModerationConfig> | unknown>(
    endpoints.guilds.moderation(guildId),
    payload,
  );
  return normalizeModerationConfig(unwrapApiData(data), guildId);
}

export async function getModerationLogs(
  guildId: string,
  page = 0,
  size = 20,
): Promise<ModerationLogPage> {
  const { data } = await apiClient.get<ApiResponse<ModerationLogPage> | unknown>(
    endpoints.guilds.moderationLogs(guildId),
    { params: { page, size } },
  );
  return unwrapApiData(data) as ModerationLogPage;
}

export async function getWhitelist(guildId: string): Promise<ModerationWhitelist[]> {
  const { data } = await apiClient.get<ApiResponse<ModerationWhitelist[]> | unknown>(
    endpoints.guilds.moderationWhitelist(guildId),
  );
  return Array.isArray(unwrapApiData(data)) ? unwrapApiData(data) as ModerationWhitelist[] : [];
}

export async function addWhitelist(
  guildId: string,
  entry: Omit<ModerationWhitelist, "id" | "guildId" | "createdAt">,
): Promise<ModerationWhitelist> {
  const { data } = await apiClient.post<ApiResponse<ModerationWhitelist> | unknown>(
    endpoints.guilds.moderationWhitelist(guildId),
    entry,
  );
  return unwrapApiData(data) as ModerationWhitelist;
}

export async function removeWhitelist(
  guildId: string,
  entryId: string,
): Promise<void> {
  await apiClient.delete(
    `${endpoints.guilds.moderationWhitelist(guildId)}/${entryId}`,
  );
}

export async function getFilters(guildId: string): Promise<ModerationFilter[]> {
  const { data } = await apiClient.get<ApiResponse<ModerationFilter[]> | unknown>(
    endpoints.guilds.moderationFilters(guildId),
  );
  return Array.isArray(unwrapApiData(data)) ? unwrapApiData(data) as ModerationFilter[] : [];
}

export async function addFilter(
  guildId: string,
  filter: Omit<ModerationFilter, "id" | "guildId" | "createdAt">,
): Promise<ModerationFilter> {
  const { data } = await apiClient.post<ApiResponse<ModerationFilter> | unknown>(
    endpoints.guilds.moderationFilters(guildId),
    filter,
  );
  return unwrapApiData(data) as ModerationFilter;
}

export async function updateFilter(
  guildId: string,
  filterId: string,
  filter: Partial<ModerationFilter>,
): Promise<ModerationFilter> {
  const { data } = await apiClient.put<ApiResponse<ModerationFilter> | unknown>(
    `${endpoints.guilds.moderationFilters(guildId)}/${filterId}`,
    filter,
  );
  return unwrapApiData(data) as ModerationFilter;
}

export async function deleteFilter(
  guildId: string,
  filterId: string,
): Promise<void> {
  await apiClient.delete(
    `${endpoints.guilds.moderationFilters(guildId)}/${filterId}`,
  );
}

export async function getAutoPunishments(
  guildId: string,
): Promise<ModerationAutoPunishment[]> {
  const { data } = await apiClient.get<ApiResponse<ModerationAutoPunishment[]> | unknown>(
    endpoints.guilds.moderationAutoPunishments(guildId),
  );
  return Array.isArray(unwrapApiData(data)) ? unwrapApiData(data) as ModerationAutoPunishment[] : [];
}

export async function saveAutoPunishments(
  guildId: string,
  punishments: Omit<ModerationAutoPunishment, "id" | "guildId">[],
): Promise<ModerationAutoPunishment[]> {
  const { data } = await apiClient.put<ApiResponse<ModerationAutoPunishment[]> | unknown>(
    endpoints.guilds.moderationAutoPunishments(guildId),
    punishments,
  );
  return unwrapApiData(data) as ModerationAutoPunishment[];
}

export async function getLogChannel(guildId: string): Promise<{
  logChannelId: string | null;
  premiumLogChannelId: string | null;
}> {
  const { data } = await apiClient.get<ApiResponse<{ logChannelId: string | null; premiumLogChannelId: string | null }> | unknown>(
    endpoints.guilds.moderationLogChannel(guildId),
  );
  return unwrapApiData(data) as { logChannelId: string | null; premiumLogChannelId: string | null };
}

export async function saveLogChannel(
  guildId: string,
  config: { logChannelId?: string | null; premiumLogChannelId?: string | null },
): Promise<void> {
  await apiClient.put(
    endpoints.guilds.moderationLogChannel(guildId),
    config,
  );
}
