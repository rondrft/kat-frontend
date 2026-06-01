export type AuthUser = {
  id: string;
  username: string;
  discriminator?: string;
  globalName?: string | null;
  avatar?: string | null;
  email?: string | null;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  expiresAt: number;
};

export type AuthState = "idle" | "loading" | "authenticated" | "unauthenticated";
