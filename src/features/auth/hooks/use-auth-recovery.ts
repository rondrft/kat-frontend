"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { syncAuthFromStorage } from "@/features/auth/lib/auth-session";
import { guildsQueryKey } from "@/features/guilds/hooks/use-guilds";
import { PENDING_GUILD_STORAGE_KEY } from "@/config/discord";
import { authService } from "@/services/auth.service";
import { AppError } from "@/lib/errors";
import { useAuthStore } from "@/store/auth-store";
import { useGuildStore } from "@/store/guild-store";

function recoverAuthAndGuilds(queryClient: ReturnType<typeof useQueryClient>) {
  const restored = syncAuthFromStorage();
  if (!restored) return;

  void queryClient.invalidateQueries({ queryKey: guildsQueryKey });

  const pendingGuildId = sessionStorage.getItem(PENDING_GUILD_STORAGE_KEY);
  if (pendingGuildId) {
    useGuildStore.getState().setSelectedGuildId(pendingGuildId);
  }

  const { session, status, setSession, setStatus } = useAuthStore.getState();
  if (session?.user?.id || status === "authenticated") return;

  const token = localStorage.getItem("kat-access-token");
  if (!token) return;

  void authService
    .getMe()
    .then((user) => {
      setSession({
        user,
        accessToken: token,
        expiresAt: session?.expiresAt ?? 0,
      });
    })
    .catch((error: unknown) => {
      const isUnauthorized =
        error instanceof AppError && (error.status === 401 || error.status === 403);
      if (!isUnauthorized && session?.user) {
        setStatus("authenticated");
      }
    });
}

export function useAuthRecovery() {
  const queryClient = useQueryClient();

  useEffect(() => {
    recoverAuthAndGuilds(queryClient);

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        recoverAuthAndGuilds(queryClient);
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        recoverAuthAndGuilds(queryClient);
      }
    };

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [queryClient]);
}
