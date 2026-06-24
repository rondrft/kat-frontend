"use client";

import { useCallback, useEffect, useLayoutEffect } from "react";
import {
  hasRecoverableAuthSession,
  syncAuthFromStorage,
} from "@/features/auth/lib/auth-session";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { buildDiscordAuthorizeUrl, isDiscordOAuthConfigured } from "@/config/discord";
import { guildsQueryKey } from "@/features/guilds/hooks/use-guilds";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth-store";
import { useGuildStore } from "@/store/guild-store";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session, status, logout: clearAuth, setStatus, hasHydrated } = useAuthStore();

  useLayoutEffect(() => {
    if (!session?.user?.id && hasRecoverableAuthSession()) {
      syncAuthFromStorage();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    const handleUnauthorized = () => {
      const { logout: storeLogout } = useAuthStore.getState();
      storeLogout();
      useGuildStore.getState().clearSelectedGuild();
      queryClient.removeQueries({ queryKey: guildsQueryKey });
      router.replace("/dashboard");
    };

    window.addEventListener("kat:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("kat:unauthorized", handleUnauthorized);
  }, [queryClient, router]);

  const loginWithDiscord = useCallback(async () => {
    if (!isDiscordOAuthConfigured()) {
      window.alert(
        "Falta configurar Discord OAuth.\n\n1. Crea una app en https://discord.com/developers/applications\n2. Copia el Client ID\n3. Añade en .env.local:\n   NEXT_PUBLIC_DISCORD_CLIENT_ID=tu_client_id\n4. En OAuth2 → Redirects, agrega:\n   http://localhost:3000/auth/callback\n5. Reinicia npm run dev",
      );
      return;
    }

    setStatus("loading");
    const state = await authService.getOAuthState();
    sessionStorage.setItem("kat-oauth-state", state);
    window.location.href = buildDiscordAuthorizeUrl(state);
  }, [setStatus]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {}
    clearAuth();
    useGuildStore.getState().clearSelectedGuild();
    queryClient.removeQueries({ queryKey: guildsQueryKey });
    router.replace("/dashboard");
  }, [clearAuth, queryClient, router]);

  const isAuthenticated =
    status !== "unauthenticated" &&
    Boolean(session?.user?.id || (hasHydrated && hasRecoverableAuthSession()));

  return {
    user: session?.user ?? null,
    session,
    status,
    hasHydrated,
    isAuthenticated,
    loginWithDiscord,
    logout,
  };
}
