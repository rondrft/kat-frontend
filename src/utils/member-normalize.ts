import type {
  MemberAlertLevel,
  NewMember,
} from "@/features/dashboard/types/new-member";

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord {
  return value !== null && typeof value === "object" ? (value as RawRecord) : {};
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asAlertLevel(value: unknown): MemberAlertLevel {
  return value === "red" || value === "yellow" || value === "green" ? value : "green";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string => typeof item === "string" && item.length > 0,
  );
}

export function normalizeNewMember(raw: unknown): NewMember | null {
  const m = asRecord(raw);
  const discordId = String(
    m.discordId ?? m.discord_id ?? m.discordUserId ?? m.discord_user_id ?? m.id ?? "",
  );
  if (!discordId) return null;

  const username = String(
    m.username ?? m.userName ?? m.user_name ?? m.globalName ?? m.global_name ?? "User",
  );

  const joinedAt = String(
    m.joinedAt ??
      m.joined_at ??
      m.createdAt ??
      m.created_at ??
      new Date().toISOString(),
  );

  return {
    id: discordId,
    discordId,
    username,
    avatar: asNullableString(m.avatar ?? m.avatarHash ?? m.avatar_hash),
    joinedAt,
    accountCreatedAt: asNullableString(m.accountCreatedAt ?? m.account_created_at),
    bot: asBoolean(m.bot ?? m.isBot ?? m.is_bot),
    verifiedBot: asBoolean(m.verifiedBot ?? m.verified_bot ?? m.isVerifiedBot),
    alertLevel: asAlertLevel(m.alertLevel ?? m.alert_level),
    alertReasons: asStringArray(m.alertReasons ?? m.alert_reasons),
  };
}

export function normalizeNewMemberList(raw: unknown): NewMember[] {
  if (Array.isArray(raw)) {
    return raw.map(normalizeNewMember).filter((m): m is NewMember => m !== null);
  }

  const root = asRecord(raw);

  if (Array.isArray(root.content)) {
    return root.content
      .map(normalizeNewMember)
      .filter((m): m is NewMember => m !== null);
  }

  if (Array.isArray(root.data)) {
    return root.data.map(normalizeNewMember).filter((m): m is NewMember => m !== null);
  }

  if (Array.isArray(root.members)) {
    return root.members
      .map(normalizeNewMember)
      .filter((m): m is NewMember => m !== null);
  }

  return [];
}
