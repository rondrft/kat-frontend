"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useBoosterSettings,
  useSyncBoosters,
  useUpdateBoosterSettings,
} from "@/features/boosters/hooks/use-booster-role";
import { AppError } from "@/lib/errors";
import type { BoosterSettingsUpdate } from "@/types/booster";

type BoosterSettingsPanelProps = {
  guildId: string | null;
};

export function BoosterSettingsPanel({ guildId }: BoosterSettingsPanelProps) {
  const { data: settings, isLoading, isError, error } = useBoosterSettings(guildId);
  const updateMutation = useUpdateBoosterSettings(guildId);
  const syncMutation = useSyncBoosters(guildId);
  const [form, setForm] = useState<BoosterSettingsUpdate>({
    enabled: false,
    requiredBoosts: 2,
    allowInvites: false,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);

  useEffect(() => {
    if (!settings) return;
    setForm({
      enabled: settings.enabled,
      requiredBoosts: settings.requiredBoosts,
      allowInvites: settings.allowInvites,
    });
  }, [settings]);

  if (isLoading) {
    return (
      <section className="flex items-center justify-center gap-2 rounded-xl border border-black/[0.08] py-8 text-sm text-muted-foreground dark:border-white/10">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading booster settings...
      </section>
    );
  }

  if (isError) {
    if (error instanceof AppError && (error.status === 401 || error.status === 403)) {
      return null;
    }

    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
        Could not load booster settings.
      </p>
    );
  }

  const onSave = async () => {
    setSaveSuccess(false);
    setSyncedCount(null);
    const payload = {
      enabled: form.enabled,
      requiredBoosts: Math.max(1, Math.min(14, Math.round(form.requiredBoosts || 1))),
      allowInvites: form.allowInvites,
    };

    const saved = await updateMutation.mutateAsync(payload);
    setForm({
      enabled: saved.enabled,
      requiredBoosts: saved.requiredBoosts,
      allowInvites: saved.allowInvites,
    });
    setSaveSuccess(true);
  };

  const onSync = async () => {
    setSaveSuccess(false);
    setSyncedCount(null);
    const result = await syncMutation.mutateAsync();
    setSyncedCount(result.synced);
  };

  return (
    <section className="space-y-4 rounded-xl border border-black/[0.08] bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
          <Settings2 className="h-4 w-4 text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-semibold">Admin settings</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Controls whether boosters can create custom roles in this server.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-black/[0.06] bg-background/70 px-3 py-2 dark:border-white/10">
          <div>
            <p className="text-sm font-medium">Enabled</p>
            <p className="text-xs text-muted-foreground">
              Allows eligible boosters to use the custom role commands.
            </p>
          </div>
          <Switch
            checked={form.enabled}
            disabled={updateMutation.isPending}
            onCheckedChange={(enabled) =>
              setForm((current) => ({ ...current, enabled }))
            }
          />
        </div>

        <div className="space-y-1.5 rounded-lg border border-black/[0.06] bg-background/70 px-3 py-2 dark:border-white/10">
          <Label htmlFor="requiredBoosts">Required boosts</Label>
          <input
            id="requiredBoosts"
            type="number"
            min={1}
            max={14}
            disabled={updateMutation.isPending}
            value={form.requiredBoosts}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                requiredBoosts: Number(event.target.value),
              }))
            }
            className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Members need this many boosts before Kat lets them create a role.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-black/[0.06] bg-background/70 px-3 py-2 dark:border-white/10">
          <div>
            <p className="text-sm font-medium">Allow invites</p>
            <p className="text-xs text-muted-foreground">
              Enables /inviterol so owners can grant their role to another user.
            </p>
          </div>
          <Switch
            checked={form.allowInvites}
            disabled={updateMutation.isPending}
            onCheckedChange={(allowInvites) =>
              setForm((current) => ({ ...current, allowInvites }))
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-5">
          {saveSuccess ? (
            <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Booster settings saved.
            </p>
          ) : null}
          {syncedCount !== null ? (
            <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Synced {syncedCount} booster{syncedCount === 1 ? "" : "s"}.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => void onSync()}
            disabled={syncMutation.isPending || updateMutation.isPending}
          >
            {syncMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              "Sync boosters"
            )}
          </Button>
          <Button
            type="button"
            onClick={() => void onSave()}
            disabled={updateMutation.isPending || syncMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save settings"
            )}
          </Button>
        </div>
      </div>

      {updateMutation.isError ? (
        <p className="text-xs text-destructive">Could not save booster settings.</p>
      ) : null}
      {syncMutation.isError ? (
        <p className="text-xs text-destructive">Could not sync boosters.</p>
      ) : null}
    </section>
  );
}
