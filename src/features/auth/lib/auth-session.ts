import type { AuthSession } from "@/types/auth";
import { useAuthStore } from "@/store/auth-store";

const PERSIST_KEY = "kat-auth";

export function getStoredAccessToken(): string | null {
  return null;
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

    if (session.expiresAt && Date.now() > session.expiresAt) {
      localStorage.removeItem(PERSIST_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function syncAuthFromStorage(): boolean {
  if (typeof window === "undefined") return false;

  const { session, status, setSession, setStatus } = useAuthStore.getState();
  const persisted = readPersistedAuthSession();

  if (persisted?.user?.id) {
    const needsSessionUpdate =
      !session?.user?.id || session.user.id !== persisted.user.id;

    if (needsSessionUpdate) {
      setSession(persisted);
    } else if (status !== "authenticated") {
      setStatus("authenticated");
    }

    return true;
  }

  if (session?.user?.id) {
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
