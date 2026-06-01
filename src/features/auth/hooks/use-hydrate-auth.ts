"use client";

import { useEffect, useLayoutEffect } from "react";
import { authService } from "@/services/auth.service";
import { AppError } from "@/lib/errors";
import {
  getStoredAccessToken,
  syncAuthFromStorage,
} from "@/features/auth/lib/auth-session";
import { useAuthStore } from "@/store/auth-store";

function completeAuthHydration() {
  syncAuthFromStorage();
  useAuthStore.setState({ hasHydrated: true });
}

export function useHydrateAuth() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const session = useAuthStore((s) => s.session);
  const status = useAuthStore((s) => s.status);
  const setSession = useAuthStore((s) => s.setSession);
  const setStatus = useAuthStore((s) => s.setStatus);

  useLayoutEffect(() => {
    if (useAuthStore.getState().hasHydrated) return;

    if (useAuthStore.persist.hasHydrated()) {
      completeAuthHydration();
      return;
    }

    return useAuthStore.persist.onFinishHydration(() => {
      completeAuthHydration();
    });
  }, []);

  useEffect(() => {
    if (useAuthStore.getState().hasHydrated) return;
    const id = window.setTimeout(completeAuthHydration, 50);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    syncAuthFromStorage();

    const token = getStoredAccessToken() ?? session?.accessToken ?? null;

    if (!token) {
      if (!session?.user) {
        setStatus("unauthenticated");
      }
      return;
    }

    if (session?.user?.id) {
      if (status !== "authenticated") {
        setStatus("authenticated");
      }
      return;
    }

    let cancelled = false;
    setStatus("loading");

    authService
      .getMe()
      .then((user) => {
        if (cancelled) return;
        setSession({
          user,
          accessToken: token,
          expiresAt: session?.expiresAt ?? 0,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const isUnauthorized =
          error instanceof AppError && (error.status === 401 || error.status === 403);
        if (isUnauthorized) {
          setSession(null);
          setStatus("unauthenticated");
        } else if (session?.user) {
          setStatus("authenticated");
        } else {
          const persisted = syncAuthFromStorage();
          if (!persisted) {
            setStatus("unauthenticated");
          }
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    hasHydrated,
    session?.accessToken,
    session?.expiresAt,
    session?.user,
    status,
    setSession,
    setStatus,
  ]);
}
