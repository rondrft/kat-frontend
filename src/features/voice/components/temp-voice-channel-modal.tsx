"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CheckCircle2,
  Crown,
  Hash,
  Loader2,
  Lock,
  Mic2,
  Shield,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useGuildCategories } from "@/features/voice/hooks/use-guild-categories";
import {
  useDeleteAllTempVoiceChannels,
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
import { useTranslation } from "@/lib/i18n/useTranslation";

type Tab = "config" | "features" | "danger";

type TempVoiceChannelModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string | null;
  isPremium?: boolean;
};

const CONTROL_FEATURES = [
  {
    icon: Hash,
    label: "Rename",
    description: "Set a custom name for the channel",
  },
  {
    icon: Users,
    label: "User limit",
    description: "Cap how many people can join",
  },
  {
    icon: Lock,
    label: "Privacy",
    description: "Make the channel private or public",
  },
  {
    icon: Shield,
    label: "Waiting room",
    description: "Let users wait before connecting",
  },
  {
    icon: UserCheck,
    label: "Trust & block",
    description: "Allow or deny specific members",
  },
  {
    icon: Crown,
    label: "Transfer",
    description: "Hand ownership to another member",
  },
] as const;

function SliderField({
  label,
  hint,
  value,
  min,
  max,
  formatValue,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
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
  isPremium = false,
}: TempVoiceChannelModalProps) {
  const t = useTranslation();
  const [tab, setTab] = useState<Tab>("config");
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

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
  const deleteMutation = useDeleteAllTempVoiceChannels(guildId);

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
      setDeleteConfirm(false);
      setTab("config");
      return;
    }
    if (configLoading) return;
    reset(configToFormValues(savedConfig ?? null));
  }, [open, configLoading, savedConfig, reset]);

  const onSubmit = async (values: TempVoiceConfigFormValues) => {
    if (!guildId) return;
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const saved = await saveMutation.mutateAsync({
        enabled: values.enabled,
        categoryId: values.categoryId || DEFAULT_VOICE_CATEGORY,
        channelNameTemplate: values.channelNameTemplate,
        userLimit: values.userLimit,
        deleteDelaySeconds: values.deleteDelaySeconds,
        lockedToOwner: values.lockedToOwner,
      });

      if (saved.enabled && saved.hubChannelId) {
        setSaveSuccess("Join lobby is ready. Members can join it to create their own room.");
      } else if (saved.enabled) {
        setSaveSuccess("Settings saved.");
      } else {
        setSaveSuccess("Temporary voice channels disabled for this server.");
      }
    } catch (error) {
      setSaveError(
        error instanceof AppError
          ? error.message
          : "Could not save settings. Check that the bot is online and has Manage Channels.",
      );
    }
  };

  const handleDeleteAll = async () => {
    if (!guildId) return;
    try {
      await deleteMutation.mutateAsync();
      setDeleteConfirm(false);
      setSaveSuccess("All temporary voice channels are being deleted.");
      setTab("config");
    } catch (error) {
      setSaveError(
        error instanceof AppError
          ? error.message
          : "Could not delete temporary voice channels.",
      );
    }
  };

  const noGuild = !guildId;
  const formDisabled = configLoading || saveMutation.isPending;

  const TABS: { id: Tab; label: string }[] = [
    { id: "config", label: "Configuration" },
    { id: "features", label: "How it works" },
    { id: "danger", label: "Danger zone" },
  ];

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
          <DialogTitle>{t.modals.tempVoice.title}</DialogTitle>
          <DialogDescription>{t.modals.tempVoice.description}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 rounded-xl border border-black/[0.08] bg-black/[0.02] p-1 dark:border-white/10 dark:bg-white/[0.03]">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                tab === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
                id === "danger" && tab !== "danger" && "hover:text-destructive",
                id === "danger" && tab === "danger" && "text-destructive",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {noGuild ? (
          <p className="text-sm text-muted-foreground">{t.modals.tempVoice.noGuild}</p>
        ) : tab === "config" ? (
          configLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              {t.modals.tempVoice.loading}
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
                  Kat will create a <strong>Join to create</strong> voice channel in this category.
                </p>
                {savedConfig?.hubChannelId ? (
                  <p className="text-xs text-muted-foreground">
                    Lobby channel ID:{" "}
                    <code className="rounded bg-muted px-1">{savedConfig.hubChannelId}</code>
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
                  {", "}<code className="rounded bg-muted px-1">{"{displayName}"}</code>
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
                onChange={(v) => setValue("deleteDelaySeconds", v, { shouldValidate: true })}
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

              <div className="flex justify-end gap-2">
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
              </div>
            </form>
          )
        ) : tab === "features" ? (
          <div className="space-y-5">
            <div className="space-y-2 rounded-xl border border-black/[0.08] bg-black/[0.02] px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]">
              <p className="text-sm font-medium">What are temporary voice channels?</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Members join a special <strong>lobby</strong> channel and Kat instantly creates a
                private voice room just for them. When the room is empty it gets deleted
                automatically — no manual cleanup needed.
              </p>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Control panel actions
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CONTROL_FEATURES.map(({ icon: Icon, label, description }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 rounded-xl border border-black/[0.08] px-3 py-3 dark:border-white/10"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-kat/10">
                      <Icon className="h-4 w-4 text-kat" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{label}</p>
                      <p className="text-[10px] leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-black/[0.08] px-4 py-4 dark:border-white/10">
                <p className="text-sm font-semibold">Free</p>
                <p className="mt-1 text-2xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">active channels max per server</p>
              </div>
              <div
                className={cn(
                  "rounded-xl border px-4 py-4",
                  isPremium
                    ? "border-yellow-500/40 bg-yellow-500/5"
                    : "border-black/[0.08] dark:border-white/10",
                )}
              >
                <p className="flex items-center gap-1 text-sm font-semibold">
                  <Crown className="h-3.5 w-3.5 text-yellow-500" />
                  Premium
                </p>
                <p className="mt-1 text-2xl font-bold">&#8734;</p>
                <p className="text-xs text-muted-foreground">unlimited active channels</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">Delete all voice channels</p>
                <p className="text-xs text-muted-foreground">
                  Immediately deletes every active temporary voice channel in this server. Members
                  currently in those rooms will be disconnected. This cannot be undone.
                </p>
              </div>
            </div>

            {saveSuccess ? (
              <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                {saveSuccess}
              </p>
            ) : null}

            {saveError ? <p className="text-xs text-destructive">{saveError}</p> : null}

            {!deleteConfirm ? (
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                disabled={deleteMutation.isPending}
                onClick={() => setDeleteConfirm(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete all temp voice channels
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-center text-xs font-medium text-destructive">
                  Are you sure? This will disconnect all members in active rooms.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDeleteConfirm(false)}
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDeleteAll}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Yes, delete all
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
