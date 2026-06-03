"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, endpoints } from "@/api";
import { getStoredAccessToken } from "@/features/auth/lib/auth-session";
import { useAuthStore } from "@/store/auth-store";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { RankingEntry } from "@/types/activity";

const RANKING_LIMIT = 50;

export const rankingQueryKey = (guildId: string) =>
  ["guilds", guildId, "ranking", RANKING_LIMIT] as const;

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

function getNumber(row: Record<string, unknown>, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = row[key];
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }

  return fallback;
}

function getNestedRecord(row: Record<string, unknown>, key: string) {
  const value = row[key];
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeRankingEntry(raw: unknown): RankingEntry {
  const row =
    typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const user = getNestedRecord(row, "user") ?? getNestedRecord(row, "member");

  return {
    userId:
      getString(row, ["userId", "memberId", "discordId", "id"]) ||
      (user ? getString(user, ["id", "userId", "discordId"]) : ""),
    username:
      getString(row, ["username", "displayName", "name"]) ||
      (user ? getString(user, ["username", "displayName", "name"]) : "") ||
      "Unknown user",
    avatarUrl:
      getString(row, ["avatarUrl", "avatar", "imageUrl"]) ||
      (user ? getString(user, ["avatarUrl", "avatar", "imageUrl"]) : "") ||
      null,
    messageCount: getNumber(row, [
      "messageCount",
      "messages",
      "count",
      "totalMessages",
    ]),
  };
}

async function fetchRanking(guildId: string): Promise<RankingEntry[]> {
  const { data } = await apiClient.get<ApiResponse<RankingEntry[]> | unknown>(
    endpoints.guilds.ranking(guildId),
    { params: { limit: RANKING_LIMIT } },
  );

  return unwrapList(data).map(normalizeRankingEntry);
}

export function useRanking(guildId: string | null) {
  const enabled = useActivityQueryEnabled(guildId);

  return useQuery({
    queryKey: guildId ? rankingQueryKey(guildId) : ["guilds", "ranking"],
    queryFn: () => fetchRanking(guildId!),
    enabled,
    staleTime: 60_000,
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: true,
    retry: false,
  });
}
