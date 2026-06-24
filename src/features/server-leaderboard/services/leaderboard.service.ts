import { apiClient, endpoints } from "@/api";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { ServerLeaderboardEntry } from "@/features/server-leaderboard/types/server-leaderboard";

function unwrapList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (typeof data === "object" && data !== null) {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.data)) return d.data as unknown[];
    if (typeof d.data === "object" && d.data !== null) {
      const inner = d.data as Record<string, unknown>;
      if (Array.isArray(inner.content)) return inner.content as unknown[];
    }
    if (Array.isArray(d.content)) return d.content as unknown[];
  }
  return [];
}

function str(row: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
}

function num(row: Record<string, unknown>, keys: string[]): number {
  for (const k of keys) {
    const n = Number(row[k]);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function normalizeEntry(raw: unknown): ServerLeaderboardEntry {
  const row =
    typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  return {
    id: str(row, ["id", "guildId"]),
    guildId: str(row, ["guildId", "id"]),
    name: str(row, ["name", "serverName", "guildName"]) || "Unknown Server",
    iconUrl: str(row, ["iconUrl", "icon", "avatarUrl"]) || null,
    memberCount: num(row, ["memberCount", "members", "totalMembers"]),
    isPublic: Boolean(row.isPublic ?? row.is_public ?? true),
    showOnLeaderboard: Boolean(row.showOnLeaderboard ?? row.show_on_leaderboard ?? true),
  };
}

export async function fetchServerLeaderboard(): Promise<ServerLeaderboardEntry[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<ServerLeaderboardEntry[]> | PageResponse<ServerLeaderboardEntry> | ServerLeaderboardEntry[]>(
      endpoints.leaderboard.servers,
      { params: { limit: 10 } },
    );
    return unwrapList(data).map(normalizeEntry);
  } catch {
    return [];
  }
}
