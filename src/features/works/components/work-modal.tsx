"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  Coins,
  Flame,
  Gift,
  Loader2,
  ShoppingBag,
  Shield,
  Sword,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import {
  useWorkConfig,
  useSaveWorkConfig,
} from "@/features/works/hooks/use-work-config";
import { DEFAULT_WORK_CONFIG } from "@/features/works/types/work-config";
import { AppError } from "@/lib/errors";

const workConfigSchema = z.object({
  enabled: z.boolean(),
});

type WorkConfigFormValues = z.infer<typeof workConfigSchema>;

type WorkModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string | null;
};

function configToFormValues(
  config: typeof DEFAULT_WORK_CONFIG | null | undefined,
): WorkConfigFormValues {
  return { enabled: config?.enabled ?? DEFAULT_WORK_CONFIG.enabled };
}

const CONTRACT_PREVIEW = [
  { label: "Tech", desc: "debug, webdev, pentest, cloud", icon: Wrench },
  { label: "Labor", desc: "carpentry, electrical, welding", icon: Shield },
  { label: "Creative", desc: "illustrate, compose, animatic", icon: Sword },
  { label: "Service", desc: "chef, concierge, logistics", icon: Coins },
  { label: "Exploration", desc: "scout, dive, ruins", icon: Shield },
];

const DIFFICULTY_STEPS = [
  { label: "Easy", cooldown: "15 min", reward: "50–150" },
  { label: "Medium", cooldown: "30 min", reward: "100–350" },
  { label: "Hard", cooldown: "60 min", reward: "200–600" },
  { label: "Expert", cooldown: "2 hr", reward: "400–1,000" },
  { label: "Legendary", cooldown: "4 hr", reward: "800–1,500" },
];

export function WorkModal({ open, onOpenChange, guildId }: WorkModalProps) {
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    data: savedConfig,
    isLoading: configLoading,
    isError: configError,
    error: configLoadError,
  } = useWorkConfig(guildId, open);

  const saveMutation = useSaveWorkConfig(guildId);

  const form = useForm<WorkConfigFormValues>({
    resolver: zodResolver(workConfigSchema),
    defaultValues: configToFormValues(null),
  });

  const { handleSubmit, reset, watch, setValue } = form;
  const enabled = watch("enabled");

  const noGuild = !guildId;

  useEffect(() => {
    if (!open) {
      setSaveSuccess(null);
      setSaveError(null);
      return;
    }
    if (configLoading) return;
    reset(configToFormValues(savedConfig ?? null));
  }, [open, configLoading, savedConfig, reset]);

  const onSubmit = async (values: WorkConfigFormValues) => {
    if (!guildId) return;

    setSaveSuccess(null);
    setSaveError(null);

    try {
      await saveMutation.mutateAsync(values);
      reset(values);
      setSaveSuccess(
        values.enabled
          ? "KatWorks enabled for this server."
          : "KatWorks disabled for this server.",
      );
    } catch (error) {
      const message =
        error instanceof AppError
          ? error.message
          : "Could not save settings. Check that the bot is online.";
      setSaveError(message);
    }
  };

  const formDisabled = configLoading || saveMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSaveSuccess(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-amber-500/10 dark:border-white/10">
            <Coins className="h-5 w-5 text-amber-500" />
          </div>
          <DialogTitle>KatWorks</DialogTitle>
          <DialogDescription>
            Earn coins by completing contracts. Level up to unlock harder jobs
            with bigger payouts.
          </DialogDescription>
        </DialogHeader>

        {noGuild ? (
          <p className="text-sm text-muted-foreground">
            Select a server in the header first.
          </p>
        ) : configLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading settings...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {configError ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {configLoadError instanceof AppError
                  ? configLoadError.message
                  : "Could not load saved settings."}
              </p>
            ) : null}

            <div className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.08] bg-black/[0.02] px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
              <div>
                <p className="text-sm font-medium">Work system</p>
                <p className="text-xs text-muted-foreground">
                  Turn off to disable contract work and coin rewards
                </p>
              </div>
              <Switch
                checked={enabled}
                disabled={formDisabled}
                onCheckedChange={(v) => setValue("enabled", v)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">How it works</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Use <code className="rounded bg-muted px-1">xworks</code> to list
                contracts, <code className="rounded bg-muted px-1">xwork &lt;name&gt;</code>{" "}
                to complete one, and <code className="rounded bg-muted px-1">xworkprofile</code>{" "}
                to see your stats. Each contract has a cooldown — time passes in
                real minutes. Level up to access harder contracts with bigger rewards.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Features</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="flex items-start gap-2 rounded-lg border border-black/[0.06] bg-black/[0.02] p-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
                  <Flame className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">Streak</p>
                    <p className="text-xs text-muted-foreground">Work daily to build a streak worth up to 3x rewards</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-black/[0.06] bg-black/[0.02] p-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
                  <ShoppingBag className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">Shop</p>
                    <p className="text-xs text-muted-foreground"><code className="rounded bg-muted px-0.5">xworkshop</code> — buy upgrades like Coffee (-cooldown) or category boosters</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-black/[0.06] bg-black/[0.02] p-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
                  <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">Skills</p>
                    <p className="text-xs text-muted-foreground"><code className="rounded bg-muted px-0.5">xworkskills</code> — spend skill points every 5 levels for +10% per category</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-black/[0.06] bg-black/[0.02] p-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
                  <Gift className="mt-0.5 h-4 w-4 shrink-0 text-pink-500" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">Daily Missions</p>
                    <p className="text-xs text-muted-foreground"><code className="rounded bg-muted px-0.5">xworkmissions</code> — complete random daily goals for bonus coins &amp; XP</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-black/[0.06] bg-black/[0.02] p-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
                  <Coins className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">Gamble</p>
                    <p className="text-xs text-muted-foreground">Add <code className="rounded bg-muted px-0.5">!</code> to gamble — 50% double or 50% half (60% win on streak 3+)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5 lg:flex-row">
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Contract categories
                </p>
                <div className="rounded-xl border border-black/[0.08] dark:border-white/10">
                  {CONTRACT_PREVIEW.map((cat, i) => (
                    <div
                      key={cat.label}
                      className="flex items-start gap-3 px-4 py-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-black/[0.08] dark:[&:not(:last-child)]:border-white/10"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                        <cat.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{cat.label}</p>
                        <p className="text-xs text-muted-foreground">{cat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-px shrink-0 bg-border max-lg:hidden" />

              <div className="min-w-0 space-y-2 lg:w-72 lg:shrink-0">
                <p className="text-sm font-medium text-foreground">
                  Difficulty tiers
                </p>
                <div className="rounded-xl border border-black/[0.08] dark:border-white/10">
                  {DIFFICULTY_STEPS.map((step, i) => (
                    <div
                      key={step.label}
                      className="flex items-center justify-between px-4 py-2 text-sm [&:not(:last-child)]:border-b [&:not(:last-child)]:border-black/[0.08] dark:[&:not(:last-child)]:border-white/10"
                    >
                      <span className="font-medium">{step.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {step.reward} coins · {step.cooldown}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {saveSuccess ? (
              <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                {saveSuccess}
              </p>
            ) : null}

            {saveError ? (
              <p className="text-xs text-destructive">{saveError}</p>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saveMutation.isPending}
              >
                {saveSuccess ? "Close" : "Cancel"}
              </Button>
              <Button type="submit" disabled={formDisabled}>
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
