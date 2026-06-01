"use client";

import { memo, useEffect } from "react";
import Image from "next/image";
import { Check, ChevronDown, Loader2, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { selectGuild } from "@/features/guilds/lib/select-guild";
import { useGuilds } from "@/features/guilds/hooks/use-guilds";
import { useAuthStore } from "@/store/auth-store";
import { useGuildStore } from "@/store/guild-store";
import type { Guild } from "@/types/guild";
import { getDiscordGuildIconUrl } from "@/utils/discord";
import { cn } from "@/lib/utils";

function GuildRow({ guild, isSelected }: { guild: Guild; isSelected: boolean }) {
  const iconUrl = getDiscordGuildIconUrl(guild.id, guild.icon, 64);

  return (
    <>
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-black/[0.08] bg-black/[0.04] dark:border-white/10 dark:bg-white/5">
        {iconUrl ? (
          <Image src={iconUrl} alt="" fill className="object-cover" sizes="32px" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
            {guild.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-medium">{guild.name}</p>
        <p className="text-xs text-muted-foreground">
          {guild.botJoined ? "Bot activo" : "Invitar bot"}
        </p>
      </div>
      {guild.botJoined ? (
        <Badge variant="secondary" className="shrink-0 text-[10px]">
          Activo
        </Badge>
      ) : null}
      {isSelected ? <Check className="h-4 w-4 shrink-0 text-kat" /> : null}
    </>
  );
}

function GuildSelectorComponent() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const authStatus = useAuthStore((s) => s.status);
  const { data: guilds = [], isLoading, isError, isFetched } = useGuilds();
  const selectedGuildId = useGuildStore((s) => s.selectedGuildId);
  const setSelectedGuildId = useGuildStore((s) => s.setSelectedGuildId);

  const selected = guilds.find((g) => g.id === selectedGuildId) ?? null;

  useEffect(() => {
    if (!guilds.length || selectedGuildId) return;
    const firstWithBot = guilds.find((g) => g.botJoined);
    if (firstWithBot) {
      setSelectedGuildId(firstWithBot.id);
    }
  }, [guilds, selectedGuildId, setSelectedGuildId]);

  const handleSelect = (guild: Guild) => {
    selectGuild(guild, setSelectedGuildId);
  };

  const waitingForGuilds =
    !hasHydrated ||
    authStatus === "loading" ||
    (authStatus !== "unauthenticated" && !isFetched && !isError);

  if (waitingForGuilds || isLoading) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="hidden gap-2 rounded-full sm:inline-flex"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando…
      </Button>
    );
  }

  if (isError || guilds.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="hidden max-w-[200px] truncate rounded-full sm:inline-flex"
        title={
          isError
            ? "No se pudieron cargar los servidores"
            : "Sin servidores disponibles"
        }
      >
        <Server className="h-4 w-4 shrink-0" />
        {isError ? "Error servidores" : "Sin servidores"}
      </Button>
    );
  }

  const selectedIcon = selected
    ? getDiscordGuildIconUrl(selected.id, selected.icon, 32)
    : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "hidden max-w-[220px] gap-2 rounded-full border-black/[0.08] bg-black/[0.02] sm:inline-flex",
            "dark:border-white/10 dark:bg-white/5",
          )}
        >
          {selectedIcon ? (
            <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full">
              <Image
                src={selectedIcon}
                alt=""
                fill
                className="object-cover"
                sizes="20px"
              />
            </span>
          ) : (
            <Server className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate">{selected?.name ?? "Seleccionar server"}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[min(360px,70vh)] w-72 overflow-y-auto border-black/[0.08] bg-background/95 backdrop-blur-xl dark:border-white/10"
      >
        <DropdownMenuLabel>Tus servidores</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {guilds.map((guild) => (
          <DropdownMenuItem
            key={guild.id}
            className="flex cursor-pointer items-center gap-3 py-2.5"
            onClick={() => handleSelect(guild)}
          >
            <GuildRow guild={guild} isSelected={guild.id === selectedGuildId} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const GuildSelector = memo(GuildSelectorComponent);
