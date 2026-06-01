import type { AuthSession } from "@/types/auth";
import { useAuthStore } from "@/store/auth-store";

const ACCESS_TOKEN_KEY = "kat-access-token";
const PERSIST_KEY = "kat-auth";

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function readPersistedAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      state?: { session?: AuthSession | null };
    };

    const session = parsed.state?.session ?? null;
    if (!session?.user?.id) return null;

    const token = getStoredAccessToken() ?? session.accessToken ?? null;
    if (!token) return null;

    return { ...session, accessToken: token };
  } catch {
    return null;
  }
}

export function syncAuthFromStorage(): boolean {
  if (typeof window === "undefined") return false;

  const { session, status, setSession, setStatus } = useAuthStore.getState();
  const token = getStoredAccessToken() ?? session?.accessToken ?? null;
  const persisted = readPersistedAuthSession();

  if (persisted?.user?.id) {
    const needsSessionUpdate =
      !session?.user?.id ||
      session.user.id !== persisted.user.id ||
      session.accessToken !== persisted.accessToken;

    if (needsSessionUpdate) {
      setSession(persisted);
    } else if (status !== "authenticated") {
      setStatus("authenticated");
    }

    if (token && !getStoredAccessToken()) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }

    return true;
  }

  if (session?.user?.id && token) {
    if (status !== "authenticated") {
      setStatus("authenticated");
    }
    return true;
  }

  return false;
}

export function hasRecoverableAuthSession(): boolean {
  const { session, status } = useAuthStore.getState();
  if (session?.user?.id && status !== "unauthenticated") return true;
  return readPersistedAuthSession() !== null;
}
