"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useGuildCategories } from "@/features/voice/hooks/use-guild-categories";
import {
  useSaveTempVoiceConfig,
  useTempVoiceConfig,
} from "@/features/voice/hooks/use-temp-voice-config";
import {
  tempVoiceConfigSchema,
  type TempVoiceConfigFormValues,
} from "@/features/voice/schemas/temp-voice-schema";
import {
  DEFAULT_TEMP_VOICE_SAVE,
  DEFAULT_VOICE_CATEGORY,
} from "@/features/voice/types/temp-voice-config";
import { AppError } from "@/lib/errors";
import { cn } from "@/lib/utils";

type TempVoiceChannelModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string | null;
};

function SliderField({
  label,
  hint,
  value,
  min,
  max,
  step = 1,
  formatValue,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  formatValue: (value: number) => string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <span className="text-xs font-medium text-kat">{formatValue(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-black/[0.08] accent-[hsl(var(--kat-brand))] dark:bg-white/10"
      />
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function configToFormValues(
  config: typeof DEFAULT_TEMP_VOICE_SAVE | null | undefined,
): TempVoiceConfigFormValues {
  const base = config ?? DEFAULT_TEMP_VOICE_SAVE;
  return {
    enabled: base.enabled,
    categoryId: base.categoryId || DEFAULT_VOICE_CATEGORY,
    channelNameTemplate: base.channelNameTemplate,
    userLimit: base.userLimit,
    deleteDelaySeconds: base.deleteDelaySeconds,
    lockedToOwner: base.lockedToOwner,
  };
}

export function TempVoiceChannelModal({
  open,
  onOpenChange,
  guildId,
}: TempVoiceChannelModalProps) {
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    data: savedConfig,
    isLoading: configLoading,
    isError: configError,
    error: configLoadError,
  } = useTempVoiceConfig(guildId, open);

  const { data: categories = [], isLoading: categoriesLoading } = useGuildCategories(
    open ? guildId : null,
  );

  const saveMutation = useSaveTempVoiceConfig(guildId);

  const form = useForm<TempVoiceConfigFormValues>({
    resolver: zodResolver(tempVoiceConfigSchema),
    defaultValues: configToFormValues(null),
  });

  const { register, handleSubmit, reset, watch, setValue } = form;
  const userLimit = watch("userLimit");
  const deleteDelay = watch("deleteDelaySeconds");
  const enabled = watch("enabled");
  const lockedToOwner = watch("lockedToOwner");
  const categoryId = watch("categoryId");

  const categoryOptions = useMemo(() => {
    const list = [...categories];
    const selected = savedConfig?.categoryId;
    if (
      selected &&
      selected !== DEFAULT_VOICE_CATEGORY &&
      !list.some((c) => c.id === selected)
    ) {
      list.unshift({ id: selected, name: "Current category" });
    }
    return list;
  }, [categories, savedConfig?.categoryId]);

  useEffect(() => {
    if (!open) {
      setSaveSuccess(null);
      setSaveError(null);
      return;
    }
    if (configLoading) return;
    reset(configToFormValues(savedConfig ?? null));
  }, [open, configLoading, savedConfig, reset]);

  const onSubmit = async (values: TempVoiceConfigFormValues) => {
    if (!guildId) return;

    setSaveSuccess(null);
    setSaveError(null);

    const payload = {
      enabled: values.enabled,
      categoryId: values.categoryId || DEFAULT_VOICE_CATEGORY,
      channelNameTemplate: values.channelNameTemplate,
      userLimit: values.userLimit,
      deleteDelaySeconds: values.deleteDelaySeconds,
      lockedToOwner: values.lockedToOwner,
    };

    try {
      const saved = await saveMutation.mutateAsync(payload);

      if (saved.enabled && saved.hubChannelId) {
        setSaveSuccess(
          "Join lobby voice channel is ready. Members can join it to create their own room.",
        );
      } else if (saved.enabled) {
        setSaveSuccess("Settings saved.");
      } else {
        setSaveSuccess("Temporary voice channels disabled for this server.");
      }
    } catch (error) {
      const message =
        error instanceof AppError
          ? error.message
          : "Could not save settings. Check that the bot is online and has Manage Channels.";
      setSaveError(message);
    }
  };

  const noGuild = !guildId;
  const formDisabled = configLoading || saveMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSaveSuccess(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-kat/10 dark:border-white/10">
            <Mic2 className="h-5 w-5 text-kat" />
          </div>
          <DialogTitle>Temporary voice channels</DialogTitle>
          <DialogDescription>
            Pick where Kat should set up voice channels. On save, the bot creates the
            join lobby (and a default category if you don&apos;t choose one). When
            someone joins that lobby, Kat opens their personal voice channel.
          </DialogDescription>
        </DialogHeader>

        {noGuild ? (
          <p className="text-sm text-muted-foreground">
            Select a server in the header first.
          </p>
        ) : configLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading settings…
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
                <p className="text-sm font-medium">Temporary voice channels</p>
                <p className="text-xs text-muted-foreground">
                  Turn off to disable join-to-create on this server
                </p>
              </div>
              <Switch
                checked={enabled}
                disabled={formDisabled}
                onCheckedChange={(v) => setValue("enabled", v)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category on your server</Label>
              <div className="relative">
                <select
                  id="categoryId"
                  disabled={formDisabled || categoriesLoading}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    (formDisabled || categoriesLoading) && "opacity-60",
                  )}
                  value={categoryId || DEFAULT_VOICE_CATEGORY}
                  onChange={(e) =>
                    setValue("categoryId", e.target.value, { shouldValidate: true })
                  }
                >
                  <option value={DEFAULT_VOICE_CATEGORY}>
                    Create default — Kat · Voice (recommended if unsure)
                  </option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {categoriesLoading ? (
                  <Loader2 className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                Kat will create a <strong>Join to create</strong> voice channel in this
                category.
              </p>
              {savedConfig?.hubChannelId ? (
                <p className="text-xs text-muted-foreground">
                  Lobby channel ID:{" "}
                  <code className="rounded bg-muted px-1">
                    {savedConfig.hubChannelId}
                  </code>
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="channelNameTemplate">Personal channel name</Label>
              <Input
                id="channelNameTemplate"
                disabled={formDisabled}
                placeholder="{username}'s Channel"
                {...register("channelNameTemplate")}
              />
              <p className="text-xs text-muted-foreground">
                Variables: <code className="rounded bg-muted px-1">{"{username}"}</code>
                , <code className="rounded bg-muted px-1">{"{displayName}"}</code>
              </p>
            </div>

            <SliderField
              label="User limit (personal channels)"
              hint="0 = no limit. Discord max is 99 per voice channel."
              value={userLimit}
              min={0}
              max={99}
              formatValue={(v) => (v === 0 ? "No limit" : `${v} users`)}
              onChange={(v) => setValue("userLimit", v, { shouldValidate: true })}
            />

            <SliderField
              label="Delete delay"
              hint="How long to wait after the channel is empty before deleting it."
              value={deleteDelay}
              min={0}
              max={60}
              formatValue={(v) => (v === 0 ? "Instant" : `${v}s`)}
              onChange={(v) =>
                setValue("deleteDelaySeconds", v, { shouldValidate: true })
              }
            />

            <div className="flex items-center justify-between rounded-xl border border-black/[0.08] px-4 py-3 dark:border-white/10">
              <div>
                <p className="text-sm font-medium">Lock to creator</p>
                <p className="text-xs text-muted-foreground">
                  Only the creator can manage their room
                </p>
              </div>
              <Switch
                checked={lockedToOwner}
                disabled={formDisabled}
                onCheckedChange={(v) => setValue("lockedToOwner", v)}
              />
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
                    Saving…
                  </>
                ) : (
                  "Save & provision"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
