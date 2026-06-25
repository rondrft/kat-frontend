"use client";

import { useEffect, useState } from "react";
import { Loader2, Shield, ShieldAlert, ShieldCheck, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAntiRaidConfig, useSaveAntiRaidConfig } from "@/features/moderation/hooks/use-anti-raid";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { AntiRaidConfig } from "@/features/moderation/types/anti-raid";

type Props = { guildId: string };

const SELECT_CLASS =
  "flex h-10 w-full rounded-xl border border-black/[0.08] bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10";

const DEFAULT_CONFIG: AntiRaidConfig = {
  guildId: "",
  antiRaidEnabled: false,
  joinThreshold: 10,
  joinWindowSeconds: 10,
  joinAction: "LOCK",
  alertChannelId: null,
  minAccountAgeDays: 0,
  requireAvatar: false,
  accountAction: "KICK",
  massBanEnabled: false,
  massKickEnabled: false,
  massDeleteEnabled: false,
  massWebhookEnabled: false,
  massActionThreshold: 5,
  massActionWindowSeconds: 30,
  massAction: "ALERT",
};

export function AntiRaidPanel({ guildId }: Props) {
  const t = useTranslation();
  const ar = (t.moderation as Record<string, unknown>).antiRaid as Record<string, unknown>;
  const { data, isLoading } = useAntiRaidConfig(guildId);
  const save = useSaveAntiRaidConfig(guildId);

  const [form, setForm] = useState<AntiRaidConfig>({ ...DEFAULT_CONFIG, guildId });
  const [savedIndicator, setSavedIndicator] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  function set<K extends keyof AntiRaidConfig>(key: K, value: AntiRaidConfig[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    try {
      await save.mutateAsync(form);
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 2000);
    } catch {
      // save.isError surfaces the error in the UI
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const jp = ar.joinProtection as Record<string, string>;
  const ap = ar.accountProtection as Record<string, string>;
  const mp = ar.massAction as Record<string, string>;
  const actions = ar.actions as Record<string, string>;

  return (
    <div className="flex flex-col gap-6">
      <div className="dashboard-glass-card p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-kat" />
          <div>
            <div className="font-semibold">{ar.title as string}</div>
            <div className="text-sm text-muted-foreground">{ar.description as string}</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Label htmlFor="antiraid-enabled" className="text-sm">
              {ar.enable as string}
            </Label>
            <Switch
              id="antiraid-enabled"
              checked={form.antiRaidEnabled}
              onCheckedChange={(v) => set("antiRaidEnabled", v)}
            />
          </div>
        </div>
      </div>

      <div className={cn("dashboard-glass-card p-5 sm:p-6", !form.antiRaidEnabled && "opacity-50 pointer-events-none")}>
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{jp.title}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="join-threshold">{jp.threshold}</Label>
            <Input
              id="join-threshold"
              type="number"
              min={1}
              max={100}
              value={form.joinThreshold}
              onChange={(e) => set("joinThreshold", Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">{jp.thresholdDesc}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="join-window">{jp.window}</Label>
            <Input
              id="join-window"
              type="number"
              min={5}
              max={300}
              value={form.joinWindowSeconds}
              onChange={(e) => set("joinWindowSeconds", Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">{jp.windowDesc}</p>
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="join-action">{jp.action}</Label>
            <select
              id="join-action"
              className={SELECT_CLASS}
              value={form.joinAction}
              onChange={(e) => set("joinAction", e.target.value as AntiRaidConfig["joinAction"])}
            >
              <option value="ALERT">{actions.alert}</option>
              <option value="KICK">{actions.kick}</option>
              <option value="BAN">{actions.ban}</option>
              <option value="LOCK">{actions.lock}</option>
              <option value="LOCKDOWN">{actions.lockdown}</option>
            </select>
          </div>
        </div>
      </div>

      <div className={cn("dashboard-glass-card p-5 sm:p-6", !form.antiRaidEnabled && "opacity-50 pointer-events-none")}>
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{ap.title}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="min-age">{ap.minAge}</Label>
            <Input
              id="min-age"
              type="number"
              min={0}
              max={365}
              value={form.minAccountAgeDays}
              onChange={(e) => set("minAccountAgeDays", Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">{ap.minAgeDesc}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="account-action">{ap.action}</Label>
            <select
              id="account-action"
              className={SELECT_CLASS}
              value={form.accountAction}
              onChange={(e) => set("accountAction", e.target.value as AntiRaidConfig["accountAction"])}
            >
              <option value="KICK">{actions.kick}</option>
              <option value="BAN">{actions.ban}</option>
            </select>
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Switch
              id="require-avatar"
              checked={form.requireAvatar}
              onCheckedChange={(v) => set("requireAvatar", v)}
            />
            <div>
              <Label htmlFor="require-avatar">{ap.requireAvatar}</Label>
              <p className="text-xs text-muted-foreground">{ap.requireAvatarDesc}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={cn("dashboard-glass-card p-5 sm:p-6", !form.antiRaidEnabled && "opacity-50 pointer-events-none")}>
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{mp.title}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["massBanEnabled", mp.massBan],
              ["massKickEnabled", mp.massKick],
              ["massDeleteEnabled", mp.massDelete],
              ["massWebhookEnabled", mp.massWebhook],
            ] as [keyof AntiRaidConfig, string][]
          ).map(([key, label]) => (
            <div key={key} className="flex items-center gap-3">
              <Switch
                id={key}
                checked={form[key] as boolean}
                onCheckedChange={(v) => set(key, v as never)}
              />
              <Label htmlFor={key}>{label}</Label>
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mass-threshold">{mp.threshold}</Label>
            <Input
              id="mass-threshold"
              type="number"
              min={2}
              max={50}
              value={form.massActionThreshold}
              onChange={(e) => set("massActionThreshold", Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">{mp.thresholdDesc}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mass-window">{mp.window}</Label>
            <Input
              id="mass-window"
              type="number"
              min={10}
              max={300}
              value={form.massActionWindowSeconds}
              onChange={(e) => set("massActionWindowSeconds", Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">{mp.windowDesc}</p>
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="mass-action">{mp.action}</Label>
            <select
              id="mass-action"
              className={SELECT_CLASS}
              value={form.massAction}
              onChange={(e) => set("massAction", e.target.value as AntiRaidConfig["massAction"])}
            >
              <option value="ALERT">{actions.alert}</option>
              <option value="LOCK">{actions.lock}</option>
              <option value="LOCKDOWN">{actions.lockdown}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {savedIndicator && (
          <span className="text-sm text-emerald-500">{ar.saved as string}</span>
        )}
        {save.isError && (
          <span className="text-sm text-destructive">{ar.saveError as string}</span>
        )}
        <Button
          onClick={handleSave}
          disabled={save.isPending}
          className="min-w-[120px]"
        >
          {save.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {ar.saving as string}
            </>
          ) : (
            ar.save as string
          )}
        </Button>
      </div>
    </div>
  );
}
