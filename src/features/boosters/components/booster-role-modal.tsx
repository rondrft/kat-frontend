"use client";

import { Crown, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PremiumLock } from "@/features/dashboard/components/premium-lock";
import { usePremiumStatus } from "@/features/guilds/hooks/use-premium-status";
import { BoosterRoleCard } from "@/features/boosters/components/booster-role-card";
import { BoosterSettingsPanel } from "@/features/boosters/components/booster-settings-panel";
import { useBoosterRole } from "@/features/boosters/hooks/use-booster-role";

type BoosterRoleModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string | null;
};

export function BoosterRoleModal({
  open,
  onOpenChange,
  guildId,
}: BoosterRoleModalProps) {
  const { role, isLoading, isError } = useBoosterRole(open ? guildId : null);
  const { data: premiumData } = usePremiumStatus(open ? guildId : null);
  const isPremium = premiumData?.isPremium ?? false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
            <Crown className="h-5 w-5 text-amber-500" />
          </div>
          <DialogTitle>Premium booster roles</DialogTitle>
          <DialogDescription>
            Custom Discord roles for members who boosted this server twice.
          </DialogDescription>
        </DialogHeader>

        {!guildId ? (
          <p className="text-sm text-muted-foreground">Select a server first.</p>
        ) : (
          <PremiumLock isPremium={isPremium}>
            <div className="space-y-4">
              <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                Users need the Discord Server Booster role and two boosts. They configure
                the role with slash commands, then run /createrol so Kat creates it in
                Discord.
              </p>

              <BoosterSettingsPanel guildId={guildId} />

              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading booster role...
                </div>
              ) : (
                <BoosterRoleCard role={role} isError={isError} />
              )}
            </div>
          </PremiumLock>
        )}

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
