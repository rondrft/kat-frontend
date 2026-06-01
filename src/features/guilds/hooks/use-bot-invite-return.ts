"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { syncAuthFromStorage } from "@/features/auth/lib/auth-session";
import { consumePendingGuildInvite, PENDING_GUILD_STORAGE_KEY } from "@/config/discord";
import { guildsQueryKey } from "@/features/guilds/hooks/use-guilds";
import { useGuildStore } from "@/store/guild-store";

export function useBotInviteReturn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const setSelectedGuildId = useGuildStore((s) => s.setSelectedGuildId);
  const handled = useRef(false);

  useEffect(() => {
    syncAuthFromStorage();

    const pendingOnly = sessionStorage.getItem(PENDING_GUILD_STORAGE_KEY);
    if (pendingOnly && searchParams.get("guild_id") === null) {
      void queryClient.invalidateQueries({ queryKey: guildsQueryKey });
    }

    if (handled.current) return;
    if (searchParams.get("guild_id") === null) return;

    const guildId = searchParams.get("guild_id") ?? consumePendingGuildInvite();
    if (!guildId) return;

    handled.current = true;
    setSelectedGuildId(guildId);
    void queryClient.invalidateQueries({ queryKey: guildsQueryKey });
    router.replace("/dashboard");
  }, [searchParams, router, setSelectedGuildId, queryClient]);
}
