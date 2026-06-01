"use client";

import { useParams } from "next/navigation";
import { Crown, Loader2 } from "lucide-react";
import { BoosterRoleCard } from "@/features/boosters/components/booster-role-card";
import { BoosterSettingsPanel } from "@/features/boosters/components/booster-settings-panel";
import { useBoosterRole } from "@/features/boosters/hooks/use-booster-role";

export default function BoosterRolePage() {
  const params = useParams<{ guildId: string }>();
  const guildId = params.guildId;
  const { role, isLoading, isError } = useBoosterRole(guildId);

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <header className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
            <Crown className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Premium booster roles</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create and manage your personal role if you boosted this server twice.
            </p>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-black/[0.08] py-12 text-sm text-muted-foreground dark:border-white/10">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading booster role...
          </div>
        ) : (
          <BoosterRoleCard role={role} isError={isError} />
        )}

        <BoosterSettingsPanel guildId={guildId} />
      </div>
    </main>
  );
}
