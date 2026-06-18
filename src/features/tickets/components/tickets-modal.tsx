"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Ticket, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useGuildCategories } from "@/features/voice/hooks/use-guild-categories";
import { useGuildTextChannels } from "@/features/auto-roles/hooks/use-guild-text-channels";
import { useGuildRoles } from "@/features/auto-roles/hooks/use-guild-roles";
import {
  useDeleteAllTempVoiceChannels,
  useResetTicketSystem,
  useSaveTicketConfig,
  useTicketConfig,
} from "@/features/tickets/hooks/use-ticket-config";
import {
  ticketConfigSchema,
  type TicketConfigSchemaType,
} from "@/features/tickets/schemas/ticket-config-schema";
import type { TicketConfigFormValues } from "@/features/tickets/types/ticket-config";
import { AppError } from "@/lib/errors";
import { cn } from "@/lib/utils";

type TicketsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string | null;
};

const DEFAULT_VALUES: TicketConfigFormValues = {
  enabled: false,
  panelChannelId: "",
  categoryId: "",
  buttonLabel: "Create Ticket",
  buttonStyle: "PRIMARY",
  embedTitle: "Support Tickets",
  embedDescription: "Click the button below to create a support ticket.",
  embedColor: "#5865F2",
  transcriptEnabled: false,
  allowUserToClose: true,
  maxOpenTicketsPerUser: 1,
  ticketChannelNameTemplate: "ticket-{username}",
  welcomeMessage: "Hello {userMention}, a support agent will be with you shortly.",
  supportRoleIds: [],
};

function configToFormValues(
  config: TicketConfigFormValues | null | undefined,
): TicketConfigFormValues {
  return config ?? DEFAULT_VALUES;
}

function roleColorToHex(color: number | undefined): string {
  if (color == null || color === 0) return "#99AAB5";
  return `#${color.toString(16).padStart(6, "0")}`;
}

function SliderField({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <span className="text-xs font-medium text-kat">{value}</span>
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

export function TicketsModal({ open, onOpenChange, guildId }: TicketsModalProps) {
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    data: savedConfig,
    isLoading: configLoading,
    isError: configError,
    error: configLoadError,
  } = useTicketConfig(guildId);

  const { data: categories = [], isLoading: categoriesLoading } = useGuildCategories(
    open ? guildId : null,
  );
  const { data: textChannels = [], isLoading: channelsLoading } = useGuildTextChannels(
    open ? guildId : null,
    open,
  );
  const { data: roles = [], isLoading: rolesLoading } = useGuildRoles(
    open ? guildId : null,
    open,
  );

  const saveMutation = useSaveTicketConfig(guildId);
  const resetMutation = useResetTicketSystem(guildId);
  const deleteTempVoiceMutation = useDeleteAllTempVoiceChannels(guildId);

  const form = useForm<TicketConfigSchemaType>({
    resolver: zodResolver(ticketConfigSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { register, handleSubmit, reset, watch, setValue } = form;
  const enabled = watch("enabled");
  const panelChannelId = watch("panelChannelId");
  const categoryId = watch("categoryId");
  const buttonStyle = watch("buttonStyle");
  const maxTickets = watch("maxOpenTicketsPerUser");
  const supportRoleIds = watch("supportRoleIds");
  const transcriptEnabled = watch("transcriptEnabled");
  const allowUserToClose = watch("allowUserToClose");

  const channelOptions = useMemo(() => {
    const list = [...textChannels];
    const selected = savedConfig?.panelChannelId;
    if (selected && !list.some((c) => c.id === selected)) {
      list.unshift({ id: selected, name: "Current panel channel" });
    }
    return list;
  }, [textChannels, savedConfig?.panelChannelId]);

  const categoryOptions = useMemo(() => {
    const list = [...categories];
    const selected = savedConfig?.categoryId;
    if (selected && !list.some((c) => c.id === selected)) {
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

  const onSubmit = async (values: TicketConfigSchemaType) => {
    if (!guildId) return;

    setSaveSuccess(null);
    setSaveError(null);

    try {
      const saved = await saveMutation.mutateAsync(values);

      if (saved.enabled) {
        setSaveSuccess(
          "Ticket panel posted. Members can click the button to open tickets.",
        );
      } else {
        setSaveSuccess("Ticket system disabled for this server.");
      }
    } catch (error) {
      const message =
        error instanceof AppError
          ? error.message
          : "Could not save ticket settings. Check that the bot is online and has Manage Channels.";
      setSaveError(message);
    }
  };

  const handleResetTickets = async () => {
    if (!guildId) return;
    setSaveSuccess(null);
    setSaveError(null);

    try {
      await resetMutation.mutateAsync();
      setSaveSuccess("Ticket system reset. All ticket channels are being deleted.");
      reset(DEFAULT_VALUES);
    } catch (error) {
      const message =
        error instanceof AppError
          ? error.message
          : "Could not reset ticket system.";
      setSaveError(message);
    }
  };

  const handleDeleteTempVoice = async () => {
    if (!guildId) return;
    setSaveSuccess(null);
    setSaveError(null);

    try {
      await deleteTempVoiceMutation.mutateAsync();
      setSaveSuccess("All temporary voice channels are being deleted.");
    } catch (error) {
      const message =
        error instanceof AppError
          ? error.message
          : "Could not delete temporary voice channels.";
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
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-kat/10 dark:border-white/10">
            <Ticket className="h-5 w-5 text-kat" />
          </div>
          <DialogTitle>Tickets</DialogTitle>
          <DialogDescription>
            Configure a support ticket panel for your server. The bot will post an
            embed with a button; members click it to open private ticket channels.
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
                <p className="text-sm font-medium">Ticket system</p>
                <p className="text-xs text-muted-foreground">
                  Turn on to post the ticket panel in the selected channel
                </p>
              </div>
              <Switch
                checked={enabled}
                disabled={formDisabled}
                onCheckedChange={(v) => setValue("enabled", v)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="panelChannelId">Panel channel</Label>
                <div className="relative">
                  <select
                    id="panelChannelId"
                    disabled={formDisabled || channelsLoading}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      (formDisabled || channelsLoading) && "opacity-60",
                    )}
                    value={panelChannelId || ""}
                    onChange={(e) =>
                      setValue("panelChannelId", e.target.value, { shouldValidate: true })
                    }
                  >
                    <option value="">Select a text channel</option>
                    {channelOptions.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.name}
                      </option>
                    ))}
                  </select>
                  {channelsLoading ? (
                    <Loader2 className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Ticket category</Label>
                <div className="relative">
                  <select
                    id="categoryId"
                    disabled={formDisabled || categoriesLoading}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      (formDisabled || categoriesLoading) && "opacity-60",
                    )}
                    value={categoryId || ""}
                    onChange={(e) =>
                      setValue("categoryId", e.target.value, { shouldValidate: true })
                    }
                  >
                    <option value="">Select a category</option>
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
              </div>
            </div>

            <div className="space-y-2">
              <Label>Support roles</Label>
              <div
                className={cn(
                  "max-h-32 overflow-y-auto rounded-md border border-input bg-background p-2",
                  rolesLoading && "opacity-60",
                )}
              >
                {rolesLoading ? (
                  <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading roles…
                  </div>
                ) : roles.length === 0 ? (
                  <p className="py-2 text-xs text-muted-foreground">No roles found.</p>
                ) : (
                  roles.map((role) => {
                    const checked = supportRoleIds.includes(role.id);
                    return (
                      <label
                        key={role.id}
                        className="flex cursor-pointer items-center gap-2 py-1 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={formDisabled}
                          onChange={() => {
                            const next = checked
                              ? supportRoleIds.filter((id) => id !== role.id)
                              : [...supportRoleIds, role.id];
                            setValue("supportRoleIds", next, { shouldValidate: true });
                          }}
                          className="h-4 w-4 rounded border-input text-kat"
                        />
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: roleColorToHex(role.color) }}
                        />
                        {role.name}
                      </label>
                    );
                  })
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                These roles can view and manage tickets.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="buttonLabel">Button label</Label>
                <Input
                  id="buttonLabel"
                  disabled={formDisabled}
                  {...register("buttonLabel")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buttonStyle">Button style</Label>
                <select
                  id="buttonStyle"
                  disabled={formDisabled}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    formDisabled && "opacity-60",
                  )}
                  value={buttonStyle}
                  onChange={(e) =>
                    setValue("buttonStyle", e.target.value as TicketConfigFormValues["buttonStyle"], {
                      shouldValidate: true,
                    })
                  }
                >
                  <option value="PRIMARY">Primary (blurple)</option>
                  <option value="SUCCESS">Success (green)</option>
                  <option value="DANGER">Danger (red)</option>
                  <option value="SECONDARY">Secondary (gray)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="embedTitle">Panel title</Label>
              <Input
                id="embedTitle"
                disabled={formDisabled}
                {...register("embedTitle")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="embedDescription">Panel description</Label>
              <Textarea
                id="embedDescription"
                disabled={formDisabled}
                rows={3}
                {...register("embedDescription")}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="embedColor">Embed color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="embedColor"
                    disabled={formDisabled}
                    {...register("embedColor")}
                  />
                  <input
                    type="color"
                    value={watch("embedColor")}
                    disabled={formDisabled}
                    onChange={(e) => setValue("embedColor", e.target.value, { shouldValidate: true })}
                    className="h-10 w-12 cursor-pointer rounded border border-input bg-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticketChannelNameTemplate">Channel name template</Label>
                <Input
                  id="ticketChannelNameTemplate"
                  disabled={formDisabled}
                  {...register("ticketChannelNameTemplate")}
                />
                <p className="text-xs text-muted-foreground">
                  Variables: {"{username}"}, {"{displayName}"}, {"{userId}"}
                </p>
              </div>
            </div>

            <SliderField
              label="Max open tickets per user"
              hint="How many tickets a single user can have open at once."
              value={maxTickets}
              min={1}
              max={10}
              onChange={(v) => setValue("maxOpenTicketsPerUser", v, { shouldValidate: true })}
            />

            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">Welcome message</Label>
              <Textarea
                id="welcomeMessage"
                disabled={formDisabled}
                rows={3}
                placeholder="Hello {userMention}, a support agent will be with you shortly."
                {...register("welcomeMessage")}
              />
              <p className="text-xs text-muted-foreground">
                Variables: {"{userMention}"}, {"{username}"}, {"{displayName}"}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-black/[0.08] px-4 py-3 dark:border-white/10">
                <div>
                  <p className="text-sm font-medium">User can close</p>
                  <p className="text-xs text-muted-foreground">
                    Let ticket creators close their own tickets
                  </p>
                </div>
                <Switch
                  checked={allowUserToClose}
                  disabled={formDisabled}
                  onCheckedChange={(v) => setValue("allowUserToClose", v)}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-black/[0.08] px-4 py-3 dark:border-white/10">
                <div>
                  <p className="text-sm font-medium">Transcripts</p>
                  <p className="text-xs text-muted-foreground">
                    Save a transcript when a ticket is closed
                  </p>
                </div>
                <Switch
                  checked={transcriptEnabled}
                  disabled={formDisabled}
                  onCheckedChange={(v) => setValue("transcriptEnabled", v)}
                />
              </div>
            </div>

            {saveSuccess ? (
              <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                {saveSuccess}
              </p>
            ) : null}

            {saveError ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {saveError}
              </p>
            ) : null}

            <DialogFooter className="flex-col gap-2 sm:flex-row">
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
                  "Save & post panel"
                )}
              </Button>
            </DialogFooter>

            <div className="space-y-3 border-t border-black/[0.08] pt-5 dark:border-white/10">
              <p className="text-sm font-medium">Danger zone</p>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full"
                  disabled={resetMutation.isPending}
                  onClick={handleResetTickets}
                >
                  {resetMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete ticket system
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  className="w-full"
                  disabled={deleteTempVoiceMutation.isPending}
                  onClick={handleDeleteTempVoice}
                >
                  {deleteTempVoiceMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete all temp voice channels
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
