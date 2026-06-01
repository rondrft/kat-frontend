const MEMBER_ACCENT_PALETTE = [
  "#7c3aed",
  "#2563eb",
  "#0891b2",
  "#059669",
  "#d97706",
  "#db2777",
  "#4f46e5",
  "#0d9488",
  "#ea580c",
  "#9333ea",
] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getMemberAccentColor(discordId: string): string {
  const index = hashString(discordId) % MEMBER_ACCENT_PALETTE.length;
  return MEMBER_ACCENT_PALETTE[index] ?? MEMBER_ACCENT_PALETTE[0];
}

export function formatMemberUsername(username: string, maxLength = 10): string {
  const clean = username.trim().replace(/^@/, "");
  if (!clean) return "user";
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength)}...`;
}
