"use client";

import { useEffect } from "react";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useGuildTextChannels } from "@/features/auto-roles/hooks/use-guild-text-channels";
import { useSendMessage } from "@/features/message-sender/hooks/use-send-message";
import type {
  EmbedContent,
  MessageFormat,
  MessageType,
} from "@/features/message-sender/types/message-sender-types";
import {
  messageSenderSchema,
  type MessageSenderFormData,
} from "@/features/message-sender/schemas/message-sender-schema";
import { DiscordPreview } from "./discord-preview";
import { EmbedTab } from "./embed-tab";
import { MessageTab } from "./message-tab";

type MessageSenderModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string | null;
};

const TAB_OPTIONS: { value: MessageType; label: string }[] = [
  { value: "message", label: "Message" },
  { value: "embed", label: "Embed" },
];

const DEFAULT_FORMATS: MessageFormat[] = [{ type: "normal", content: "" }];

const DEFAULT_EMBED: EmbedContent = {
  channelId: "",
  color: "#5865F2",
  timestamp: false,
};

export function MessageSenderModal({
  open,
  onOpenChange,
  guildId,
}: MessageSenderModalProps) {
  const sendMessage = useSendMessage(guildId);
  const { data: channels = [], isLoading: channelsLoading } =
    useGuildTextChannels(guildId, open);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<MessageSenderFormData>({
    resolver: zodResolver(messageSenderSchema),
    mode: "onChange",
    defaultValues: {
      type: "message",
      channelId: "",
      messageContent: { channelId: "", formats: DEFAULT_FORMATS },
      embedContent: DEFAULT_EMBED,
    },
  });

  const mode = watch("type");
  const channelId = watch("channelId");
  const formats = watch("messageContent.formats") ?? DEFAULT_FORMATS;
  const embed = watch("embedContent") ?? DEFAULT_EMBED;

  useEffect(() => {
    if (!open) return;
    setValue("messageContent.channelId", channelId);
    setValue("embedContent.channelId", channelId);
  }, [channelId, setValue, open]);

  useEffect(() => {
    if (!open) {
      reset({
        type: "message",
        channelId: "",
        messageContent: { channelId: "", formats: DEFAULT_FORMATS },
        embedContent: DEFAULT_EMBED,
      });
    }
  }, [open, reset]);

  const onSubmit = async (values: MessageSenderFormData) => {
    if (!guildId) return;

    try {
      await sendMessage.mutateAsync({
        type: values.type,
        guildId,
        channelId: values.channelId,
        messageContent:
          values.type === "message" ? values.messageContent : undefined,
        embedContent:
          values.type === "embed" ? values.embedContent : undefined,
      });

      if (values.type === "message") {
        setValue("messageContent.formats", DEFAULT_FORMATS);
      } else {
        setValue("embedContent", DEFAULT_EMBED);
      }
    } catch {
      // Mutation error is handled by the caller; toast can be added later.
    }
  };

  const noGuild = !guildId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-violet-500/10 dark:border-white/10">
            <MessageSquare className="h-5 w-5 text-violet-500" />
          </div>
          <DialogTitle>Message Sender</DialogTitle>
          <DialogDescription>
            Send a plain message or a rich embed to any text channel on this
            server.
          </DialogDescription>
        </DialogHeader>

        {noGuild ? (
          <p className="text-sm text-muted-foreground">
            Select a server in the header first.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-5 lg:flex-row">
              <div className="min-w-0 flex-1 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="message-channel">Text channel</Label>
                  <div className="relative">
                    <Controller
                      name="channelId"
                      control={control}
                      render={({ field }) => (
                        <select
                          id="message-channel"
                          disabled={channelsLoading || sendMessage.isPending}
                          {...field}
                          className={cn(
                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                            "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            (channelsLoading || sendMessage.isPending) &&
                              "opacity-60",
                          )}
                        >
                          <option value="">Select a channel…</option>
                          {channels.map((channel) => (
                            <option key={channel.id} value={channel.id}>
                              #{channel.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {channelsLoading ? (
                      <Loader2 className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                    ) : null}
                  </div>
                  {errors.channelId && (
                    <p className="text-xs text-destructive">
                      {errors.channelId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="flex gap-2">
                    {TAB_OPTIONS.map((tab) => (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => setValue("type", tab.value)}
                        disabled={sendMessage.isPending}
                        className={cn(
                          "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                          "border-black/[0.08] dark:border-white/10",
                          mode === tab.value
                            ? "bg-kat text-white"
                            : "bg-transparent text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
                          sendMessage.isPending && "opacity-60",
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {mode === "message" ? (
                  <Controller
                    name="messageContent.formats"
                    control={control}
                    render={({ field }) => (
                      <MessageTab
                        formats={field.value ?? []}
                        onChange={field.onChange}
                      />
                    )}
                  />
                ) : (
                  <Controller
                    name="embedContent"
                    control={control}
                    render={({ field }) => (
                      <EmbedTab
                        embed={field.value ?? DEFAULT_EMBED}
                        onChange={field.onChange}
                      />
                    )}
                  />
                )}

                {(errors.messageContent || errors.embedContent) && (
                  <p className="text-xs text-destructive">
                    {errors.messageContent?.message ||
                      errors.embedContent?.message}
                  </p>
                )}
              </div>

              <div className="min-w-0 space-y-2 lg:w-80 lg:shrink-0">
                <Label>Discord preview</Label>
                <DiscordPreview mode={mode} formats={formats} embed={embed} />
                <p className="text-xs text-muted-foreground">
                  This is how your {mode} will look in the Discord chat.
                </p>
              </div>
            </div>

            <DialogFooter className="mt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={sendMessage.isPending}
              >
                Close
              </Button>
              <Button
                type="submit"
                disabled={!isValid || sendMessage.isPending}
              >
                {sendMessage.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
