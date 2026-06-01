export function getDiscordAvatarUrl(
  id: string,
  avatarHash: string | null | undefined,
  size = 128,
): string {
  if (avatarHash?.startsWith("http://") || avatarHash?.startsWith("https://")) {
    return avatarHash;
  }

  const safeId = id?.trim();
  if (!safeId) {
    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }

  if (!avatarHash) {
    try {
      const defaultIndex = Number(BigInt(safeId) % BigInt(6));
      return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
    } catch {
      return "https://cdn.discordapp.com/embed/avatars/0.png";
    }
  }

  const ext = avatarHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${safeId}/${avatarHash}.${ext}?size=${size}`;
}

export function getDiscordGuildIconUrl(
  guildId: string,
  iconHash: string | null,
  size = 64,
): string | null {
  if (!iconHash) return null;
  const ext = iconHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.${ext}?size=${size}`;
}
