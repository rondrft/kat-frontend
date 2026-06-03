"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, endpoints } from "@/api";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import { useAuthStore } from "@/store/auth-store";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { AuditLogEntry } from "@/types/activity";

const AUDIT_LOG_LIMIT = 50;

export const auditLogsQueryKey = (guildId: string) =>
  ["guilds", guildId, "audit-logs", AUDIT_LOG_LIMIT] as const;

function useActivityQueryEnabled(guildId: string | null) {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.session?.user?.id);
  const accessToken = useAuthStore((s) => s.session?.accessToken);

  return (
    Boolean(guildId) &&
    status !== "unauthenticated" &&
    Boolean(userId || accessToken || getStoredAccessToken())
  );
}

function unwrapList(data: unknown): unknown[] {
  const row =
    typeof data === "object" && data !== null && "data" in data
      ? (data as ApiResponse<unknown>).data
      : data;

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

function getNestedRecord(row: Record<string, unknown>, key: string) {
  const value = row[key];
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeAuditLogEntry(raw: unknown, index: number): AuditLogEntry {
  const row =
    typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const target = getNestedRecord(row, "targetUser") ?? getNestedRecord(row, "target");
  const executor =
    getNestedRecord(row, "executorUser") ?? getNestedRecord(row, "executor");

  return {
    id: getString(row, ["id", "auditLogId"], `audit-log-${index}`),
    action: getString(row, ["action", "type"], "UNKNOWN").toUpperCase(),
    targetUserId:
      getNullableString(row, ["targetUserId", "targetId", "userId"]) ??
      (target ? getNullableString(target, ["id", "userId", "discordId"]) : null),
    targetUsername:
      getString(row, ["targetUsername", "targetName", "username"]) ||
      (target ? getString(target, ["username", "name", "displayName"]) : "") ||
      "Unknown user",
    targetAvatarUrl:
      getNullableString(row, ["targetAvatarUrl", "targetAvatar", "avatarUrl"]) ??
      (target ? getNullableString(target, ["avatarUrl", "avatar", "imageUrl"]) : null),
    executorUserId:
      getNullableString(row, ["executorUserId", "executorId"]) ??
      (executor ? getNullableString(executor, ["id", "userId", "discordId"]) : null),
    executorUsername:
      getString(row, ["executorUsername", "executorName"]) ||
      (executor ? getString(executor, ["username", "name", "displayName"]) : "") ||
      "Unknown executor",
    reason: getNullableString(row, ["reason", "details", "description"]),
    createdAt: getString(
      row,
      ["createdAt", "timestamp", "date"],
      new Date().toISOString(),
    ),
  };
}

async function fetchAuditLogs(guildId: string): Promise<AuditLogEntry[]> {
  const { data } = await apiClient.get<ApiResponse<AuditLogEntry[]> | unknown>(
    endpoints.guilds.auditLogs(guildId),
    { params: { limit: AUDIT_LOG_LIMIT } },
  );

  return unwrapList(data).map(normalizeAuditLogEntry);
}

export function useAuditLogs(guildId: string | null) {
  const enabled = useActivityQueryEnabled(guildId);

  return useQuery({
    queryKey: guildId ? auditLogsQueryKey(guildId) : ["guilds", "audit-logs"],
    queryFn: () => fetchAuditLogs(guildId!),
    enabled,
    staleTime: 60_000,
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: true,
    retry: false,
  });
}
