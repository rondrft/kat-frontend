import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthSession, AuthState, AuthUser } from "@/types/auth";

type AuthStore = {
  session: AuthSession | null;
  status: AuthState;
  hasHydrated: boolean;
  setSession: (session: AuthSession | null) => void;
  setUser: (user: AuthUser) => void;
  setStatus: (status: AuthState) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      session: null,
      status: "idle",
      hasHydrated: false,
      setSession: (session) => {
        set({
          session,
          status: session?.user ? "authenticated" : "unauthenticated",
        });
      },
      setUser: (user) =>
        set((state) => ({
          session: state.session ? { ...state.session, user } : null,
          status: "authenticated",
        })),
      setStatus: (status) => set({ status }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      logout: () => {
        set({ session: null, status: "unauthenticated", hasHydrated: true });
      },
    }),
    {
      name: "kat-auth",
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state, error) => {
        if (!error && state?.session?.user) {
          useAuthStore.setState({ status: "authenticated" });
        }
      },
    },
  ),
);
