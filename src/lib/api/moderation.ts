import { apiClient, endpoints } from "@/api";
import type { ApiResponse } from "@/types/api";
import type {
  ModerationAction,
  ModerationConfig,
  ModerationRuleConfig,
  ModerationRuleType,
  SaveModerationConfigPayload,
} from "@/types/moderation";

const RULE_TYPES = new Set<ModerationRuleType>([
  "SPAM",
  "LINKS",
  "INVITES",
  "MENTIONS",
  "CAPS",
]);

const ACTIONS = new Set<ModerationAction>([
  "MONITOR",
  "DELETE",
  "TIMEOUT",
  "DELETE_AND_TIMEOUT",
]);

const DEFAULT_RULES: ModerationRuleConfig[] = [
  { id: "SPAM", enabled: false, action: "DELETE", threshold: 6, timeoutMinutes: null },
  { id: "LINKS", enabled: false, action: "DELETE", threshold: 2, timeoutMinutes: null },
  {
    id: "INVITES",
    enabled: false,
    action: "DELETE",
    threshold: 1,
    timeoutMinutes: null,
  },
  {
    id: "MENTIONS",
    enabled: false,
    action: "TIMEOUT",
    threshold: 5,
    timeoutMinutes: null,
  },
  {
    id: "CAPS",
    enabled: false,
    action: "MONITOR",
    threshold: 80,
    timeoutMinutes: null,
  },
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
  const id = String(row.id ?? "").toUpperCase() as ModerationRuleType;
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
    strictness: numberInRange(
      row.strictness,
      DEFAULT_MODERATION_CONFIG.strictness,
      0,
      100,
    ),
    defaultTimeoutMinutes: numberInRange(
      row.defaultTimeoutMinutes,
      DEFAULT_MODERATION_CONFIG.defaultTimeoutMinutes,
      1,
      1440,
    ),
    rules,
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
