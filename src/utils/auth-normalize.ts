import type { AuthSession, AuthUser } from "@/types/auth";

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord {
  return value !== null && typeof value === "object" ? (value as RawRecord) : {};
}

function pickAvatar(raw: RawRecord): string | null {
  const value = raw.avatar ?? raw.avatarHash ?? raw.avatar_hash ?? raw.avatarUrl;
  if (value == null || value === "") return null;
  return String(value);
}

export function normalizeAuthUser(raw: unknown): AuthUser {
  const u = asRecord(raw);

  return {
    id: String(u.id ?? u.discordId ?? u.discord_id ?? ""),
    username: String(u.username ?? ""),
    discriminator: u.discriminator != null ? String(u.discriminator) : undefined,
    globalName: (u.globalName ?? u.global_name ?? u.displayName ?? null) as
      | string
      | null,
    avatar: pickAvatar(u),
    email: (u.email as string | null | undefined) ?? null,
  };
}

export function normalizeAuthSession(raw: unknown): AuthSession {
  const root = asRecord(raw);
  const payload =
    root.data !== undefined && root.data !== null ? asRecord(root.data) : root;

  const userRaw = payload.user ?? payload;
  const user = normalizeAuthUser(userRaw);

  const accessToken = String(
    payload.accessToken ?? payload.access_token ?? payload.token ?? "",
  );

  const expiresAt = Number(payload.expiresAt ?? payload.expires_at ?? 0);

  return { user, accessToken, expiresAt };
}
