"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useGuildTextChannels } from "@/features/auto-roles/hooks/use-guild-text-channels";
import { useSendMessage } from "@/features/message-sender/hooks/use-send-message";
import type { EmbedContent, MessageFormat, MessageType } from "@/features/message-sender/types/message-sender-types";
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
};

export function MessageSenderModal({ open, onOpenChange, guildId }: MessageSenderModalProps) {
  const [mode, setMode] = useState<MessageType>("message");
  const [channelId, setChannelId] = useState("");
  const [formats, setFormats] = useState<MessageFormat[]>(DEFAULT_FORMATS);
  const [embed, setEmbed] = useState<EmbedContent>(DEFAULT_EMBED);
  const [sendStatus, setSendStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const sendMessage = useSendMessage(guildId);
  const { data: channels = [], isLoading: channelsLoading } = useGuildTextChannels(guildId, open);

  useEffect(() => {
    if (!open) return;
    setSendStatus(null);
  }, [open, mode]);

  useEffect(() => {
    setEmbed((prev) => ({ ...prev, channelId }));
  }, [channelId]);

  const channelOptions = useMemo(() => {
    const list = channels.map((c) => ({ id: c.id, name: c.name }));
    if (channelId && !list.some((c) => c.id === channelId)) {
      list.unshift({ id: channelId, name: "current-channel" });
    }
    return list;
  }, [channels, channelId]);

  const resetForm = () => {
    setMode("message");
    setChannelId("");
    setFormats(DEFAULT_FORMATS);
    setEmbed(DEFAULT_EMBED);
    setSendStatus(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const isValid = Boolean(channelId) && (mode === "message" ? formats.some((f) => f.content.trim()) : embed.title?.trim() || embed.description?.trim() || embed.imageUrl?.trim());

  const handleSend = async () => {
    if (!guildId || !channelId || !isValid) return;

    setSendStatus(null);

    try {
      await sendMessage.mutateAsync({
        type: mode,
        guildId,
        channelId,
        messageContent: mode === "message" ? { channelId, formats } : undefined,
        embedContent: mode === "embed" ? { ...embed, channelId } : undefined,
      });
      setSendStatus({ type: "success", text: "Message sent successfully." });
      if (mode === "message") setFormats(DEFAULT_FORMATS);
      else setEmbed(DEFAULT_EMBED);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Could not send the message. Check that the bot is online and has permissions.";
      setSendStatus({ type: "error", text });
    }
  };

  const noGuild = !guildId;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-indigo-500/10 dark:border-white/10">
            <MessageSquare className="h-5 w-5 text-indigo-500" />
          </div>
          <DialogTitle>Message Sender</DialogTitle>
          <DialogDescription>
            Send a plain message or a rich embed to any text channel on this server.
          </DialogDescription>
        </DialogHeader>

        {noGuild ? (
          <p className="text-sm text-muted-foreground">Select a server in the header first.</p>
        ) : (
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="min-w-0 flex-1 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="message-channel">Text channel</Label>
                <div className="relative">
                  <select
                    id="message-channel"
                    disabled={channelsLoading || sendMessage.isPending}
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      (channelsLoading || sendMessage.isPending) && "opacity-60",
                    )}
                  >
                    <option value="">Select a channel…</option>
                    {channelOptions.map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        #{channel.name}
                      </option>
                    ))}
                  </select>
                  {channelsLoading ? <Loader2 className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" /> : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex gap-2">
                  {TAB_OPTIONS.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setMode(tab.value)}
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

              {mode === "message" ? <MessageTab formats={formats} onChange={setFormats} /> : <EmbedTab embed={embed} onChange={setEmbed} />}

              {sendStatus ? (
                <p
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs",
                    sendStatus.type === "success"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-destructive/30 bg-destructive/10 text-destructive",
                  )}
                >
                  {sendStatus.text}
                </p>
              ) : null}
            </div>

            <div className="min-w-0 space-y-2 lg:w-80 lg:shrink-0">
              <Label>Discord preview</Label>
              <DiscordPreview mode={mode} formats={formats} embed={embed} />
              <p className="text-xs text-muted-foreground">
                This is how your {mode} will look in the Discord chat.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={sendMessage.isPending}>
            Close
          </Button>
          <Button type="button" onClick={handleSend} disabled={!guildId || !isValid || sendMessage.isPending}>
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
      </DialogContent>
    </Dialog>
  );
}
