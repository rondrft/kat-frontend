import type { Guild } from "@/types/guild";

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord {
  return value !== null && typeof value === "object" ? (value as RawRecord) : {};
}

export function normalizeGuild(raw: unknown): Guild {
  const g = asRecord(raw);

  return {
    id: String(g.id ?? ""),
    name: String(g.name ?? "Unknown server"),
    icon: (g.icon ?? g.iconHash ?? g.icon_hash ?? null) as string | null,
    memberCount: Number(g.memberCount ?? g.member_count ?? 0),
    botJoined: Boolean(g.botJoined ?? g.bot_joined ?? false),
    canManage: Boolean(g.canManage ?? g.can_manage ?? g.hasManageGuild ?? false),
    inviteUrl: (g.inviteUrl ?? g.invite_url ?? null) as string | null | undefined,
    premiumTier: g.premiumTier != null ? Number(g.premiumTier) : undefined,
  };
}

export function normalizeGuildList(raw: unknown): Guild[] {
  if (Array.isArray(raw)) {
    return raw.map(normalizeGuild).filter((g) => g.id);
  }

  const root = asRecord(raw);

  if (Array.isArray(root.content)) {
    return root.content.map(normalizeGuild).filter((g) => g.id);
  }

  if (Array.isArray(root.data)) {
    return root.data.map(normalizeGuild).filter((g) => g.id);
  }

  return [];
}
