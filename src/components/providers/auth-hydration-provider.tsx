"use client";

import { useAuthRecovery } from "@/features/auth/hooks/use-auth-recovery";
import { useHydrateAuth } from "@/features/auth/hooks/use-hydrate-auth";

export function AuthHydrationProvider({ children }: { children: React.ReactNode }) {
  useHydrateAuth();
  useAuthRecovery();
  return <>{children}</>;
}
