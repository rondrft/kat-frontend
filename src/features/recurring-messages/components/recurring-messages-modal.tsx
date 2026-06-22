"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle2,
  Clock,
  Hash,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useRecurringMessages,
  useCreateRecurringMessage,
  useUpdateRecurringMessage,
  useDeleteRecurringMessage,
} from "@/features/recurring-messages/hooks/use-recurring-messages";
import type { RecurringMessage } from "@/features/recurring-messages/types/recurring-message";
import { useGuildTextChannels } from "@/features/auto-roles/hooks/use-guild-text-channels";
import { AppError } from "@/lib/errors";
import { cn } from "@/lib/utils";

const INTERVAL_OPTIONS = [
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
  { label: "4 hours", value: 240 },
  { label: "6 hours", value: 360 },
  { label: "12 hours", value: 720 },
  { label: "24 hours", value: 1440 },
  { label: "48 hours", value: 2880 },
  { label: "1 week", value: 10080 },
];

const formSchema = z.object({
  channelId: z.string().min(1, "Select a channel"),
  name: z.string().min(1, "Name is required").max(100),
  title: z.string().max(200).nullable(),
  content: z.string().min(1, "Content is required"),
  intervalMinutes: z.number().min(60),
  enabled: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

type RecurringMessagesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string | null;
};

function formatNextSend(nextSendAt: string) {
  const diff = new Date(nextSendAt).getTime() - Date.now();
  if (diff <= 0) return "sending soon";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
}

export function RecurringMessagesModal({ open, onOpenChange, guildId }: RecurringMessagesModalProps) {
  const [editing, setEditing] = useState<RecurringMessage | null>(null);
  const [creating, setCreating] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const { data: messages = [], isLoading } = useRecurringMessages(guildId, open);
  const { data: channels = [], isLoading: channelsLoading } = useGuildTextChannels(guildId, open);
  const createMutation = useCreateRecurringMessage(guildId);
  const updateMutation = useUpdateRecurringMessage(guildId);
  const deleteMutation = useDeleteRecurringMessage(guildId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      channelId: "",
      name: "",
      title: "",
      content: "",
      intervalMinutes: 60,
      enabled: true,
    },
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = form;
  const enabled = watch("enabled");
  const intervalMinutes = watch("intervalMinutes");

  const noGuild = !guildId;

  function openCreate() {
    reset({ channelId: "", name: "", title: "", content: "", intervalMinutes: 60, enabled: true });
    setSaveError(null);
    setSaveSuccess(null);
    setEditing(null);
    setCreating(true);
  }

  function openEdit(msg: RecurringMessage) {
    reset({
      channelId: msg.channelId,
      name: msg.name,
      title: msg.title ?? "",
      content: msg.content,
      intervalMinutes: msg.intervalMinutes,
      enabled: msg.enabled,
    });
    setSaveError(null);
    setSaveSuccess(null);
    setEditing(msg);
    setCreating(true);
  }

  function cancelForm() {
    setCreating(false);
    setEditing(null);
    setSaveError(null);
    setSaveSuccess(null);
  }

  const onSubmit = async (values: FormValues) => {
    if (!guildId) return;
    setSaveError(null);
    setSaveSuccess(null);

    const req = { ...values, title: values.title?.trim() || null };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, req });
        setSaveSuccess("Message updated.");
      } else {
        await createMutation.mutateAsync(req);
        setSaveSuccess("Message created.");
      }
      setCreating(false);
      setEditing(null);
    } catch (error) {
      setSaveError(
        error instanceof AppError
          ? error.message
          : "Could not save. Check that the bot is online.",
      );
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // silently fail — list will not refresh
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) { cancelForm(); setSaveSuccess(null); }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-blue-500/10 dark:border-white/10">
            <RefreshCw className="h-5 w-5 text-blue-500" />
          </div>
          <DialogTitle>Recurring Messages</DialogTitle>
          <DialogDescription>
            Schedule messages to be sent automatically to a channel at a fixed interval.
          </DialogDescription>
        </DialogHeader>

        {noGuild ? (
          <p className="text-sm text-muted-foreground">Select a server in the header first.</p>
        ) : isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading...
          </div>
        ) : creating ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-sm font-medium">{editing ? "Edit message" : "New recurring message"}</p>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <input
                {...register("name")}
                placeholder="e.g. Server rules reminder"
                className="w-full rounded-lg border border-black/[0.08] bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring dark:border-white/10"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Channel</label>
              {channelsLoading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading channels...
                </div>
              ) : (
                <div className="max-h-36 space-y-1 overflow-y-auto rounded-xl border border-black/[0.08] p-2 dark:border-white/10">
                  {channels.map((ch) => {
                    const checked = watch("channelId") === ch.id;
                    return (
                      <label
                        key={ch.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                          checked && "bg-kat/10",
                        )}
                      >
                        <input
                          type="radio"
                          className="accent-[hsl(var(--kat-brand))]"
                          checked={checked}
                          onChange={() => setValue("channelId", ch.id)}
                        />
                        <Hash className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{ch.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              {errors.channelId && <p className="text-xs text-destructive">{errors.channelId.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Title (optional)</label>
              <input
                {...register("title")}
                placeholder="Embed title"
                className="w-full rounded-lg border border-black/[0.08] bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring dark:border-white/10"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Content</label>
              <textarea
                {...register("content")}
                rows={4}
                placeholder="Message content..."
                className="w-full resize-none rounded-lg border border-black/[0.08] bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring dark:border-white/10"
              />
              {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Interval</label>
              <div className="flex flex-wrap gap-2">
                {INTERVAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue("intervalMinutes", opt.value)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                      intervalMinutes === opt.value
                        ? "border-kat bg-kat/10 text-foreground"
                        : "border-black/[0.08] text-muted-foreground hover:border-black/20 dark:border-white/10",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.08] bg-black/[0.02] px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
              <div>
                <p className="text-sm font-medium">Enabled</p>
                <p className="text-xs text-muted-foreground">Disable to pause without deleting</p>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={(v) => setValue("enabled", v)}
              />
            </div>

            {saveError && <p className="text-xs text-destructive">{saveError}</p>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={cancelForm} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {saveSuccess && (
              <p className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {saveSuccess}
              </p>
            )}

            {messages.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <RefreshCw className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No recurring messages yet.</p>
                <Button size="sm" onClick={openCreate}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create first message
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {messages.map((msg) => {
                    const channel = channels.find((c) => c.id === msg.channelId);
                    return (
                      <div
                        key={msg.id}
                        className="flex items-start gap-3 rounded-xl border border-black/[0.08] bg-black/[0.01] px-4 py-3 dark:border-white/10 dark:bg-white/[0.01]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium">{msg.name}</p>
                            {!msg.enabled && (
                              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                paused
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            {channel && (
                              <span className="flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                {channel.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              every{" "}
                              {INTERVAL_OPTIONS.find((o) => o.value === msg.intervalMinutes)?.label ??
                                `${msg.intervalMinutes}m`}
                            </span>
                            <span>{formatNextSend(msg.nextSendAt)}</span>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(msg)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(msg.id)}
                            disabled={deleteMutation.isPending}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {messages.length < 10 && (
                  <Button size="sm" variant="outline" onClick={openCreate} className="w-full">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add message
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
