"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { discordCallbackSchema } from "@/features/auth";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { getErrorMessage } from "@/lib/errors";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth-store";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      const parsed = discordCallbackSchema.safeParse({
        code: searchParams.get("code"),
        state: searchParams.get("state"),
      });

      if (!parsed.success) {
        setError("Parámetros OAuth inválidos");
        return;
      }

      const savedState = sessionStorage.getItem("kat-oauth-state");
      if (savedState !== parsed.data.state) {
        setError("State OAuth no coincide — posible CSRF");
        return;
      }

      try {
        const session = await authService.discordCallback(
          parsed.data.code,
          parsed.data.state,
        );
        setSession(session);
        sessionStorage.removeItem("kat-oauth-state");
        router.replace("/dashboard");
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }

    void handleCallback();
  }, [searchParams, router, setSession]);

  if (error) {
    return (
      <p className="text-center text-destructive" role="alert">
        {error}
      </p>
    );
  }

  return <LoadingSpinner label="Completando inicio de sesión" />;
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<LoadingSpinner />}>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
