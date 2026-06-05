import { apiClient, endpoints } from "@/api";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { AuditLogAction, AuditLogEntry } from "@/types/activity";

export const AUDIT_LOG_LIMIT = 50;

function unwrapApiData<T>(data: ApiResponse<T> | T): T {
  if (typeof data === "object" && data !== null && "data" in data) {
    return (data as ApiResponse<T>).data;
  }
  return data as T;
}

function unwrapList(data: unknown): unknown[] {
  const row = unwrapApiData(data);

  if (Array.isArray(row)) return row;
  if (typeof row === "object" && row !== null && "content" in row) {
    const content = (row as PageResponse<unknown>).content;
    return Array.isArray(content) ? content : [];
  }

  return [];
}

function getString(row: Record<string, unknown>, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return fallback;
}

function getNullableString(row: Record<string, unknown>, keys: string[]) {
  const value = getString(row, keys);
  return value || null;
}

function normalizeAuditLogEntry(raw: unknown, index: number): AuditLogEntry {
  const row =
    typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};

  return {
    id: getString(row, ["id"], `audit-log-${index}`),
    guildId: getString(row, ["guildId"], ""),
    targetDiscordId: getString(row, ["targetDiscordId"], ""),
    targetUsername: getString(row, ["targetUsername"], "Unknown user"),
    targetAvatar: getNullableString(row, ["targetAvatar"]),
    executorDiscordId: getString(row, ["executorDiscordId"], ""),
    executorUsername: getString(row, ["executorUsername"], "Unknown executor"),
    action: getString(row, ["action"], "UNKNOWN").toUpperCase() as AuditLogAction,
    reason: getNullableString(row, ["reason"]),
    durationMinutes:
      row["durationMinutes"] != null ? Number(row["durationMinutes"]) : null,
    createdAt: getString(row, ["createdAt"], new Date().toISOString()),
  };
}

export async function fetchAuditLogs(guildId: string): Promise<AuditLogEntry[]> {
  const { data } = await apiClient.get<ApiResponse<AuditLogEntry[]> | unknown>(
    endpoints.guilds.auditLogs(guildId),
    { params: { limit: AUDIT_LOG_LIMIT } },
  );

  return unwrapList(data).map(normalizeAuditLogEntry);
}
