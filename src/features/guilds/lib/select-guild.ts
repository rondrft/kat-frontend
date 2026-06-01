import {
  buildBotInviteUrl,
  isDiscordOAuthConfigured,
  setPendingGuildInvite,
} from "@/config/discord";
import type { Guild } from "@/types/guild";

export function resolveBotInviteUrl(guild: Guild): string | null {
  if (guild.inviteUrl?.startsWith("http")) {
    return guild.inviteUrl;
  }
  if (!isDiscordOAuthConfigured()) {
    return null;
  }
  return buildBotInviteUrl(guild.id);
}

export function selectGuild(
  guild: Guild,
  setSelectedGuildId: (guildId: string) => void,
): void {
  if (guild.botJoined) {
    setSelectedGuildId(guild.id);
    return;
  }

  const inviteUrl = resolveBotInviteUrl(guild);
  if (!inviteUrl) {
    window.alert(
      "No se pudo generar el enlace de invitación. Revisá NEXT_PUBLIC_DISCORD_CLIENT_ID.",
    );
    return;
  }

  setPendingGuildInvite(guild.id);

  if (process.env.NODE_ENV === "development") {
    console.info("[Kat] Bot invite URL:", inviteUrl);
  }

  window.location.assign(inviteUrl);
}
