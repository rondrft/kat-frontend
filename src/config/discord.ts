import { env } from "@/lib/env";

export const discordOAuthConfig = {
  clientId: env.NEXT_PUBLIC_DISCORD_CLIENT_ID ?? "",
  redirectUri:
    env.NEXT_PUBLIC_DISCORD_REDIRECT_URI ?? `${env.NEXT_PUBLIC_APP_URL}/auth/callback`,
  scopes: ["identify", "guilds"] as const,
  authorizeUrl: "https://discord.com/api/oauth2/authorize",
  apiBaseUrl: "https://discord.com/api/v10",
} as const;

export function isDiscordOAuthConfigured(): boolean {
  return /^\d{17,20}$/.test(discordOAuthConfig.clientId);
}

export function buildDiscordAuthorizeUrl(state: string): string {
  if (!isDiscordOAuthConfigured()) {
    throw new Error(
      "NEXT_PUBLIC_DISCORD_CLIENT_ID no está configurado. Añádelo en .env.local (Discord Developer Portal → OAuth2).",
    );
  }

  const params = new URLSearchParams({
    client_id: discordOAuthConfig.clientId,
    redirect_uri: discordOAuthConfig.redirectUri,
    response_type: "code",
    scope: discordOAuthConfig.scopes.join(" "),
    state,
  });

  return `${discordOAuthConfig.authorizeUrl}?${params.toString()}`;
}

const PENDING_GUILD_STORAGE_KEY = "kat-pending-guild-id";

export function getBotInviteRedirectUri(): string {
  const uri =
    env.NEXT_PUBLIC_DISCORD_BOT_REDIRECT_URI ??
    `${env.NEXT_PUBLIC_APP_URL}/auth/bot-callback`;
  return uri.replace(/\/$/, "");
}

export function buildBotInviteUrl(guildId: string): string {
  if (!isDiscordOAuthConfigured()) {
    throw new Error("NEXT_PUBLIC_DISCORD_CLIENT_ID no está configurado.");
  }

  const permissions = env.NEXT_PUBLIC_DISCORD_BOT_PERMISSIONS ?? "268435518";

  const params = new URLSearchParams({
    client_id: discordOAuthConfig.clientId,
    permissions,
    scope: "bot applications.commands",
    guild_id: guildId,
    redirect_uri: getBotInviteRedirectUri(),
  });

  return `${discordOAuthConfig.authorizeUrl}?${params.toString()}`;
}

export function setPendingGuildInvite(guildId: string): void {
  sessionStorage.setItem(PENDING_GUILD_STORAGE_KEY, guildId);
}

export function consumePendingGuildInvite(): string | null {
  const id = sessionStorage.getItem(PENDING_GUILD_STORAGE_KEY);
  if (id) sessionStorage.removeItem(PENDING_GUILD_STORAGE_KEY);
  return id;
}

export { PENDING_GUILD_STORAGE_KEY };
