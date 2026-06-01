import { apiClient, endpoints } from "@/api";
import { AppError } from "@/lib/errors";
import type { ApiResponse } from "@/types/api";
import type {
  BoosterRole,
  BoosterSettings,
  BoosterSettingsUpdate,
  SyncResult,
} from "@/types/booster";

function unwrapApiData<T>(data: ApiResponse<T> | T): T {
  if (typeof data === "object" && data !== null && "data" in data) {
    return (data as ApiResponse<T>).data;
  }
  return data as T;
}

function normalizeBoosterRole(raw: unknown): BoosterRole | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = String(row.id ?? "");
  const guildId = String(row.guildId ?? "");
  const ownerDiscordId = String(row.ownerDiscordId ?? "");
  if (!id || !guildId || !ownerDiscordId) return null;

  return {
    id,
    guildId,
    ownerDiscordId,
    discordRoleId: row.discordRoleId ? String(row.discordRoleId) : null,
    roleName: row.roleName ? String(row.roleName) : null,
    roleColor: row.roleColor ? String(row.roleColor) : null,
    roleEmoji: row.roleEmoji ? String(row.roleEmoji) : null,
    createdAt: String(row.createdAt ?? ""),
  };
}

function normalizeBoosterSettings(raw: unknown): BoosterSettings {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  return {
    guildId: String(row.guildId ?? ""),
    enabled: Boolean(row.enabled),
    requiredBoosts: Number(row.requiredBoosts ?? 2),
    allowInvites: Boolean(row.allowInvites),
  };
}

function normalizeSyncResult(raw: unknown): SyncResult {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    synced: Number(row.synced ?? 0),
  };
}

export async function getMyBoosterRole(guildId: string): Promise<BoosterRole | null> {
  try {
    const { data } = await apiClient.get<ApiResponse<BoosterRole | null> | unknown>(
      endpoints.guilds.boosterRoleMe(guildId),
    );
    return normalizeBoosterRole(unwrapApiData(data));
  } catch (error) {
    if (error instanceof AppError && error.status === 404) return null;
    throw error;
  }
}

export async function getAllBoosterRoles(guildId: string): Promise<BoosterRole[]> {
  const { data } = await apiClient.get<ApiResponse<BoosterRole[]> | unknown>(
    endpoints.guilds.boosterRoles(guildId),
  );
  const raw = unwrapApiData(data);
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeBoosterRole)
    .filter((role): role is BoosterRole => role !== null);
}

export async function getBoosterSettings(guildId: string): Promise<BoosterSettings> {
  const { data } = await apiClient.get<ApiResponse<BoosterSettings> | unknown>(
    endpoints.guilds.boosterSettings(guildId),
  );
  return normalizeBoosterSettings(unwrapApiData(data));
}

export async function updateBoosterSettings(
  guildId: string,
  payload: BoosterSettingsUpdate,
): Promise<BoosterSettings> {
  const { data } = await apiClient.put<ApiResponse<BoosterSettings> | unknown>(
    endpoints.guilds.boosterSettings(guildId),
    payload,
  );
  return normalizeBoosterSettings(unwrapApiData(data));
}

export async function syncBoosters(guildId: string): Promise<SyncResult> {
  const { data } = await apiClient.post<ApiResponse<SyncResult> | unknown>(
    endpoints.guilds.boosterSync(guildId),
  );
  return normalizeSyncResult(unwrapApiData(data));
}
