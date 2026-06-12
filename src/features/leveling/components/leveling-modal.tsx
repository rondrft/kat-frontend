"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowUp,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  useLevelingConfig,
  useSaveLevelingConfig,
} from "@/features/leveling/hooks/use-leveling-config";
import {
  levelingConfigSchema,
  type LevelingConfigFormValues,
} from "@/features/leveling/schemas/leveling-schema";
import { DEFAULT_LEVELING_CONFIG } from "@/features/leveling/types/leveling-config";
import { AppError } from "@/lib/errors";

type LevelingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string | null;
};

function configToFormValues(
  config: typeof DEFAULT_LEVELING_CONFIG | null | undefined,
): LevelingConfigFormValues {
  return { enabled: config?.enabled ?? DEFAULT_LEVELING_CONFIG.enabled };
}

const XP_DETAILS = [
  {
    label: "Message XP",
    value: "15–25 XP",
    description: "Earned per message sent in any text channel",
    icon: MessageSquare,
  },
  {
    label: "Action Command XP",
    value: "30–50 XP",
    description: "Earned when using action commands like xkiss, xhug, xavatar",
    icon: Zap,
  },
];

const LEVEL_UP_STEPS = [
  { label: "1", xp: "0 XP" },
  { label: "2", xp: "100 XP" },
  { label: "3", xp: "250 XP" },
  { label: "4", xp: "500 XP" },
  { label: "5", xp: "800 XP" },
  { label: "6", xp: "1,200 XP" },
  { label: "7", xp: "1,700 XP" },
  { label: "8", xp: "2,300 XP" },
  { label: "9", xp: "3,000 XP" },
  { label: "10", xp: "3,800 XP" },
];

export function LevelingModal({ open, onOpenChange, guildId }: LevelingModalProps) {
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    data: savedConfig,
    isLoading: configLoading,
    isError: configError,
    error: configLoadError,
  } = useLevelingConfig(guildId, open);

  const saveMutation = useSaveLevelingConfig(guildId);

  const form = useForm<LevelingConfigFormValues>({
    resolver: zodResolver(levelingConfigSchema),
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

  const onSubmit = async (values: LevelingConfigFormValues) => {
    if (!guildId) return;

    setSaveSuccess(null);
    setSaveError(null);

    try {
      await saveMutation.mutateAsync(values);
      reset(values);
      setSaveSuccess(
        values.enabled
          ? "Leveling enabled for this server."
          : "Leveling disabled for this server.",
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
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-orange-500/10 dark:border-white/10">
            <ArrowUp className="h-5 w-5 text-orange-500" />
          </div>
          <DialogTitle>Leveling</DialogTitle>
          <DialogDescription>
            Members earn XP by chatting, level up with a celebration image, and climb
            the ranks
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
                <p className="text-sm font-medium">Leveling system</p>
                <p className="text-xs text-muted-foreground">
                  Turn off to disable XP gain and level-ups on this server
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
                Members earn XP by sending messages and using action commands. Each
                level increases the XP requirement for the next one. There is a 60-second
                cooldown between XP gains to prevent spam. When a member levels up, the
                bot posts a level-up card with their avatar, name, and progression.
              </p>
            </div>

            <div className="flex flex-col gap-5 lg:flex-row">
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm font-medium text-foreground">XP rates</p>
                <div className="rounded-xl border border-black/[0.08] dark:border-white/10">
                  {XP_DETAILS.map((detail, i) => (
                    <div
                      key={detail.label}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3",
                        i < XP_DETAILS.length - 1 &&
                          "border-b border-black/[0.08] dark:border-white/10",
                      )}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                        <detail.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-sm font-medium">{detail.label}</p>
                          <span className="shrink-0 text-xs font-semibold text-orange-500">
                            {detail.value}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{detail.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-px shrink-0 bg-border max-lg:hidden" />

              <div className="min-w-0 space-y-2 lg:w-72 lg:shrink-0">
                <p className="text-sm font-medium text-foreground">Level progression</p>
                <div className="rounded-xl border border-black/[0.08] dark:border-white/10">
                  {LEVEL_UP_STEPS.map((step, i) => (
                    <div
                      key={step.label}
                      className={cn(
                        "flex items-center justify-between px-4 py-2 text-sm",
                        i < LEVEL_UP_STEPS.length - 1 &&
                          "border-b border-black/[0.08] dark:border-white/10",
                      )}
                    >
                      <span className="font-medium">Level {step.label}</span>
                      <span className="text-xs text-muted-foreground">{step.xp}</span>
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

            {saveError ? <p className="text-xs text-destructive">{saveError}</p> : null}

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
