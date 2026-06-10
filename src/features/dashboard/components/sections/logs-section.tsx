"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Hash,
  MessageSquare,
  Users,
  Shield,
  Link2,
  Volume2,
  Bot,
  Gavel,
  Trash2,
  Edit3,
  UserMinus,
  UserCheck,
  Ban,
  Unlock,
  Footprints,
  Clock,
  AlertOctagon,
  Speaker,
  MicOff,
  Move,
  LogIn,
  LogOut,
  Plus,
  Minus,
  RefreshCw,
  Flag,
  Save,
  Settings2,
  TreePine,
  BadgePlus,
  BadgeMinus,
  BadgeCheck,
  MessageCircleOff,
  MessageCircle,
  VolumeX,
  ChevronDown,
  FileCog,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useGuildStore } from "@/store/guild-store";
import { guildService } from "@/services/guild.service";
import type { GuildTextChannel } from "@/features/auto-roles/types/auto-roles-config";

// ─── Types ───────────────────────────────────────────────────────────────────

type LogEntryId = string;

type LogEntry = {
  id: LogEntryId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

type LogCategory = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  logs: LogEntry[];
};

type LogsSectionProps = {
  guildId?: string;
};

// ─── Category definitions ────────────────────────────────────────────────────

const CATEGORIES: LogCategory[] = [
  {
    id: "channel",
    label: "Channel",
    icon: Hash,
    color: "border-l-sky-500",
    borderColor: "border-sky-500/30",
    bgColor: "bg-sky-500/8",
    textColor: "text-sky-600 dark:text-sky-400",
    logs: [
      { id: "channel_create", label: "Channel Created", description: "A new text or voice channel was created", icon: Plus },
      { id: "channel_delete", label: "Channel Deleted", description: "A channel was removed", icon: Minus },
      { id: "channel_update", label: "Channel Updated", description: "Channel name, topic, or NSFW changed", icon: Settings2 },
      { id: "channel_permission_update", label: "Permission Updated", description: "Channel-specific permissions changed", icon: Shield },
      { id: "channel_limit_update", label: "Limit Updated", description: "Slowmode or user limit changed", icon: TreePine },
    ],
  },
  {
    id: "message",
    label: "Message",
    icon: MessageSquare,
    color: "border-l-amber-500",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/8",
    textColor: "text-amber-600 dark:text-amber-400",
    logs: [
      { id: "message_delete", label: "Message Deleted", description: "A message was removed from a channel", icon: Trash2 },
      { id: "message_bulk_delete", label: "Bulk Delete", description: "Multiple messages were purged at once", icon: MessageCircleOff },
      { id: "message_edit", label: "Message Edited", description: "A message content was modified", icon: Edit3 },
    ],
  },
  {
    id: "member",
    label: "Member",
    icon: Users,
    color: "border-l-violet-500",
    borderColor: "border-violet-500/30",
    bgColor: "bg-violet-500/8",
    textColor: "text-violet-600 dark:text-violet-400",
    logs: [
      { id: "member_join", label: "Member Joined", description: "Includes invite tracker showing who invited them", icon: LogIn },
      { id: "member_leave", label: "Member Left", description: "A member left or was removed from the server", icon: LogOut },
      { id: "member_update", label: "Member Updated", description: "Nickname or avatar changed", icon: UserCheck },
      { id: "member_ban", label: "Member Banned", description: "A user was banned from the server", icon: Ban },
      { id: "member_unban", label: "Member Unbanned", description: "A user ban was lifted", icon: Unlock },
      { id: "member_kick", label: "Member Kicked", description: "A member was kicked from the server", icon: Footprints },
      { id: "member_timeout", label: "Member Timed Out", description: "A member was placed in timeout", icon: Clock },
      { id: "member_untimeout", label: "Member Untimed Out", description: "A member timeout was removed", icon: RefreshCw },
    ],
  },
  {
    id: "role",
    label: "Role",
    icon: Shield,
    color: "border-l-indigo-500",
    borderColor: "border-indigo-500/30",
    bgColor: "bg-indigo-500/8",
    textColor: "text-indigo-600 dark:text-indigo-400",
    logs: [
      { id: "role_create", label: "Role Created", description: "A new role was created", icon: BadgePlus },
      { id: "role_delete", label: "Role Deleted", description: "A role was removed", icon: BadgeMinus },
      { id: "role_update", label: "Role Updated", description: "Role name, color, or permissions changed", icon: Settings2 },
      { id: "role_assign", label: "Role Assigned", description: "A role was given to a member", icon: BadgeCheck },
      { id: "role_remove", label: "Role Removed", description: "A role was taken from a member", icon: UserMinus },
    ],
  },
  {
    id: "invite",
    label: "Invite",
    icon: Link2,
    color: "border-l-emerald-500",
    borderColor: "border-emerald-500/30",
    bgColor: "bg-emerald-500/8",
    textColor: "text-emerald-600 dark:text-emerald-400",
    logs: [
      { id: "invite_create", label: "Invite Created", description: "A new server invite was generated", icon: Plus },
      { id: "invite_delete", label: "Invite Deleted", description: "An invite link was revoked", icon: Minus },
      { id: "invite_used", label: "Invite Used", description: "Someone joined through an invite link", icon: LogIn },
    ],
  },
  {
    id: "voice",
    label: "Voice",
    icon: Volume2,
    color: "border-l-cyan-500",
    borderColor: "border-cyan-500/30",
    bgColor: "bg-cyan-500/8",
    textColor: "text-cyan-600 dark:text-cyan-400",
    logs: [
      { id: "voice_join", label: "Voice Joined", description: "A member joined a voice channel", icon: Speaker },
      { id: "voice_leave", label: "Voice Left", description: "A member left a voice channel", icon: VolumeX },
      { id: "voice_move", label: "Voice Moved", description: "A member switched between voice channels", icon: Move },
      { id: "voice_mute", label: "Voice Muted", description: "A member was server-muted in voice", icon: MicOff },
    ],
  },
  {
    id: "automod",
    label: "AutoMod",
    icon: Bot,
    color: "border-l-pink-500",
    borderColor: "border-pink-500/30",
    bgColor: "bg-pink-500/8",
    textColor: "text-pink-600 dark:text-pink-400",
    logs: [
      { id: "automod_rule_create", label: "Rule Created", description: "A new AutoMod rule was added", icon: FileCog },
      { id: "automod_rule_update", label: "Rule Updated", description: "An AutoMod rule configuration changed", icon: Settings2 },
      { id: "automod_rule_delete", label: "Rule Deleted", description: "An AutoMod rule was removed", icon: Trash2 },
      { id: "automod_action", label: "AutoMod Action", description: "An automated moderation action was triggered", icon: AlertOctagon },
    ],
  },
  {
    id: "moderation",
    label: "Moderation",
    icon: Gavel,
    color: "border-l-red-500",
    borderColor: "border-red-500/30",
    bgColor: "bg-red-500/8",
    textColor: "text-red-600 dark:text-red-400",
    logs: [
      { id: "mod_mute", label: "Member Muted", description: "A member was muted in text channels", icon: MessageCircleOff },
      { id: "mod_unmute", label: "Member Unmuted", description: "A member text mute was lifted", icon: MessageCircle },
      { id: "mod_warn", label: "Member Warned", description: "A formal warning was issued to a member", icon: Flag },
      { id: "mod_lockdown", label: "Channel Lockdown", description: "A channel was locked down from messages", icon: LockIcon },
      { id: "mod_purge", label: "Channel Purged", description: "Messages were bulk-deleted from a channel", icon: Trash2 },
    ],
  },
];

function LockIcon(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// ─── Channel Selector ────────────────────────────────────────────────────────

function ChannelSelect({
  channels,
  value,
  onChange,
  placeholder,
}: {
  channels: GuildTextChannel[];
  value: string;
  onChange: (channelId: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selected = channels.find((c) => c.id === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-7 w-full items-center gap-1 rounded-lg border px-1.5 text-[11px] transition-colors",
          value
            ? "border-kat/20 bg-kat/8 text-foreground"
            : "border-black/[0.06] bg-black/[0.02] text-muted-foreground hover:bg-black/[0.04] dark:border-white/[0.07] dark:bg-white/[0.02]",
        )}
      >
        <Hash className="h-2.5 w-2.5 shrink-0 opacity-60" />
        <span className="min-w-0 flex-1 truncate">
          {selected ? selected.name : placeholder ?? "Channel"}
        </span>
        <ChevronDown className="h-2.5 w-2.5 shrink-0 opacity-40" />
      </button>
      {open && (
        <div className="absolute left-0 z-50 mt-1 max-h-48 w-56 overflow-y-auto rounded-lg border border-black/[0.08] bg-background p-1 shadow-lg dark:border-white/10">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
          >
            <Hash className="h-3 w-3 opacity-50" />
            <span className="italic">No channel</span>
          </button>
          {channels.map((channel) => (
            <button
              key={channel.id}
              type="button"
              onClick={() => {
                onChange(channel.id);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.04]",
                channel.id === value && "bg-kat/10 text-kat",
              )}
            >
              <Hash className="h-3 w-3 shrink-0 opacity-50" />
              <span className="truncate">{channel.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Log Tile ────────────────────────────────────────────────────────────────

function LogTile({
  entry,
  enabled,
  channelId,
  channels,
  onToggle,
  onChannelChange,
  categoryColor,
}: {
  entry: LogEntry;
  enabled: boolean;
  channelId: string;
  channels: GuildTextChannel[];
  onToggle: (id: string, enabled: boolean) => void;
  onChannelChange: (id: string, channelId: string) => void;
  categoryColor: string;
}) {
  const Icon = entry.icon;

  return (
    <div
      className={cn(
        "dashboard-glass-card flex flex-col gap-2 p-3 transition-all",
        enabled ? "ring-1 ring-inset" : "opacity-60",
        enabled ? categoryColor.replace("text-", "ring-").replace("dark:", "") : "ring-transparent",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px]",
              enabled
                ? categoryColor.replace("text-", "bg-").replace("dark:", "/15 ") + " " + categoryColor
                : "bg-black/[0.04] text-muted-foreground dark:bg-white/[0.05]",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold leading-tight">{entry.label}</p>
            <p className="truncate text-[10px] leading-tight text-muted-foreground">
              {entry.description}
            </p>
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={(checked) => onToggle(entry.id, checked)}
          className="shrink-0"
        />
      </div>

      <ChannelSelect
        channels={channels}
        value={channelId}
        onChange={(id) => onChannelChange(entry.id, id)}
        placeholder="Select channel"
      />
    </div>
  );
}

// ─── Category Section ────────────────────────────────────────────────────────

function CategorySection({
  category,
  enabledLogs,
  channelMap,
  channels,
  onToggle,
  onChannelChange,
}: {
  category: LogCategory;
  enabledLogs: Set<string>;
  channelMap: Map<string, string>;
  channels: GuildTextChannel[];
  onToggle: (id: string, enabled: boolean) => void;
  onChannelChange: (id: string, channelId: string) => void;
}) {
  const Icon = category.icon;
  const enabledCount = category.logs.filter((log) => enabledLogs.has(log.id)).length;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl",
            category.bgColor,
            category.textColor,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h3 className="text-sm font-bold tracking-tight">{category.label}</h3>
          <Badge
            variant="outline"
            className={cn(
              "h-5 rounded-md border px-1.5 text-[10px] font-semibold",
              category.borderColor,
              category.textColor,
            )}
          >
            {enabledCount}/{category.logs.length}
          </Badge>
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {category.logs.map((entry) => (
          <LogTile
            key={entry.id}
            entry={entry}
            enabled={enabledLogs.has(entry.id)}
            channelId={channelMap.get(entry.id) ?? ""}
            channels={channels}
            onToggle={onToggle}
            onChannelChange={onChannelChange}
            categoryColor={category.textColor}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const ALL_LOG_IDS = CATEGORIES.flatMap((cat) => cat.logs.map((log) => log.id));

function LogsSectionComponent({ guildId: guildIdProp }: LogsSectionProps) {
  const selectedGuildId = useGuildStore((s) => s.selectedGuildId);
  const guildId = guildIdProp ?? selectedGuildId ?? null;

  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ["guilds", guildId, "text-channels"],
    queryFn: () => guildService.getGuildTextChannels(guildId!),
    enabled: Boolean(guildId),
    staleTime: 60 * 1000,
  });

  const [enabledLogs, setEnabledLogs] = useState<Set<string>>(new Set());
  const [channelMap, setChannelMap] = useState<Map<string, string>>(new Map());
  const [defaultChannel, setDefaultChannel] = useState("");
  const [saved, setSaved] = useState(true);

  const allEnabled = enabledLogs.size === ALL_LOG_IDS.length;

  const applyDefaultToAll = useCallback(
    (channelId: string) => {
      setDefaultChannel(channelId);
      if (!channelId) return;
      setChannelMap((prev) => {
        const next = new Map(prev);
        for (const id of ALL_LOG_IDS) {
          next.set(id, channelId);
        }
        return next;
      });
    },
    [],
  );

  const handleToggle = useCallback((id: string, enabled: boolean) => {
    setSaved(false);
    setEnabledLogs((prev) => {
      const next = new Set(prev);
      if (enabled) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleChannelChange = useCallback((id: string, channelId: string) => {
    setSaved(false);
    setChannelMap((prev) => {
      const next = new Map(prev);
      next.set(id, channelId);
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    setSaved(false);
    if (allEnabled) {
      setEnabledLogs(new Set());
    } else {
      setEnabledLogs(new Set(ALL_LOG_IDS));
    }
  }, [allEnabled]);

  const handleSave = useCallback(() => {
    setSaved(true);
  }, []);

  const totalEnabled = enabledLogs.size;

  return (
    <div className="min-h-0 space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-kat">
          Logs
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Log configuration</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Choose which events to log and where to send them. Each log type can go to a different
          channel, or use the default channel for all.
        </p>
      </div>

      {/* Default Channel + Controls */}
      <div className="dashboard-glass-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Default channel for all logs
            </Label>
            <div className="max-w-xs">
              {channelsLoading ? (
                <div className="flex h-10 items-center rounded-xl border border-black/[0.08] bg-background px-3 text-xs text-muted-foreground dark:border-white/10">
                  Loading channels…
                </div>
              ) : (
                <ChannelSelect
                  channels={channels}
                  value={defaultChannel}
                  onChange={applyDefaultToAll}
                  placeholder="Select default channel"
                />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Sets the same channel for every log type below. You can still customize each
              individually.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-kat/10 text-kat shadow-none">
              {totalEnabled} active
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleAll}
              className="text-xs"
            >
              {allEnabled ? "Disable all" : "Enable all"}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={saved}
              onClick={handleSave}
            >
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {saved ? "Saved" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Categories - 2 per row */}
      <div className="grid gap-5 md:grid-cols-2">
        {CATEGORIES.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            enabledLogs={enabledLogs}
            channelMap={channelMap}
            channels={channels}
            onToggle={handleToggle}
            onChannelChange={handleChannelChange}
          />
        ))}
      </div>
    </div>
  );
}

export const LogsSection = memo(LogsSectionComponent);
