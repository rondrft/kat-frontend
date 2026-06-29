"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { guildService } from "@/services/guild.service";

export function ChannelSelect({
  guildId,
  value,
  onChange,
}: {
  guildId: string;
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const t = useTranslation();
  const { data: channels = [], isLoading } = useQuery({
    queryKey: ["guilds", guildId, "channels", "text"],
    queryFn: () => guildService.getGuildTextChannels(guildId),
    enabled: Boolean(guildId),
    staleTime: 60 * 1000,
  });

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="flex h-10 w-full rounded-xl border border-black/[0.08] bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
    >
      <option value="">{t.moderation.selects.notConfigured}</option>
      {isLoading ? (
        <option disabled>{t.moderation.selects.loadingChannels}</option>
      ) : (
        channels.map((ch: { id: string; name: string }) => (
          <option key={ch.id} value={ch.id}>
            #{ch.name}
          </option>
        ))
      )}
    </select>
  );
}
