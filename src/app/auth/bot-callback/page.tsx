"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { syncAuthFromStorage } from "@/features/auth/lib/auth-session";
import { consumePendingGuildInvite } from "@/config/discord";
import { memberJoinStatsQueryKey } from "@/features/dashboard/hooks/use-member-join-stats";
import { newMembersQueryKey } from "@/features/dashboard/hooks/use-new-members";
import { guildsQueryKey } from "@/features/guilds/hooks/use-guilds";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { useGuildStore } from "@/store/guild-store";

function BotCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const setSelectedGuildId = useGuildStore((s) => s.setSelectedGuildId);
  const guildId = searchParams.get("guild_id") ?? consumePendingGuildInvite();

  useEffect(() => {
    syncAuthFromStorage();

    if (guildId) {
      setSelectedGuildId(guildId);
      void queryClient.invalidateQueries({ queryKey: guildsQueryKey });
      void queryClient.invalidateQueries({ queryKey: newMembersQueryKey(guildId) });
      void queryClient.invalidateQueries({
        queryKey: memberJoinStatsQueryKey(guildId),
      });
    }

    const timer = setTimeout(() => {
      router.replace("/dashboard");
    }, 1200);

    return () => clearTimeout(timer);
  }, [guildId, router, setSelectedGuildId, queryClient]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <LoadingSpinner label="Bot invitado correctamente" />
      <div className="space-y-2">
        <p className="text-lg font-medium">¡Kat fue agregado a tu servidor!</p>
        <p className="text-sm text-muted-foreground">
          {guildId
            ? "Redirigiendo al dashboard…"
            : "Volvé al dashboard para continuar la configuración."}
        </p>
      </div>
      <Button asChild className="rounded-full">
        <Link href="/dashboard">Ir al dashboard ahora</Link>
      </Button>
      <p className="max-w-sm text-xs text-muted-foreground">
        Si Discord no te redirigió solo, agregá{" "}
        <code className="rounded bg-muted px-1">
          http://localhost:3000/auth/bot-callback
        </code>{" "}
        en Discord Developer Portal → OAuth2 → Redirects.
      </p>
    </div>
  );
}

export default function BotCallbackPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Cargando" />}>
      <BotCallbackContent />
    </Suspense>
  );
}
