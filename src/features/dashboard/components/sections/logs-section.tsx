"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  EarOff,
  Hash,
  MicOff,
  Save,
  XCircle,
  Plus,
  Minus,
  Settings2,
  Shield,
  MessageSquare,
  Trash2,
  MessageCircleOff,
  Edit3,
  Users,
  LogIn,
  LogOut,
  UserCheck,
  Ban,
  Unlock,
  BadgePlus,
  BadgeMinus,
  BadgeCheck,
  UserMinus,
  Link2,
  Volume2,
  Speaker,
  VolumeX,
  Move,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useGuildStore } from "@/store/guild-store";
import { guildService } from "@/services/guild.service";
import type { LoggingEntry } from "@/types/logging";
import type { GuildTextChannel } from "@/features/auto-roles/types/auto-roles-config";
import { AppError } from "@/lib/errors";
import { useTranslation } from "@/lib/i18n/useTranslation";

type LogsSectionProps = {
  guildId?: string;
};

type LogEntryMeta = {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

type CategoryConfig = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  logs: LogEntryMeta[];
};

// ─── Channel Selector ────────────────────────────────────────────────────────

function ChannelSelect({
  channels,
  value,
  onChange,
  placeholder,
  invalid,
}: {
  channels: GuildTextChannel[];
  value: string;
  onChange: (channelId: string) => void;
  placeholder?: string;
  invalid?: boolean;
}) {
  const t = useTranslation();
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
          invalid && "border-red-500/50 bg-red-500/5",
        )}
      >
        <Hash className="h-2.5 w-2.5 shrink-0 opacity-60" />
        <span className="min-w-0 flex-1 truncate">
          {selected ? selected.name : placeholder ?? t.logs.channelSelect.placeholder}
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
            <span className="italic">{t.logs.channelSelect.noChannel}</span>
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
  channelInvalid,
}: {
  entry: LogEntryMeta;
  enabled: boolean;
  channelId: string;
  channels: GuildTextChannel[];
  onToggle: (id: string, enabled: boolean) => void;
  onChannelChange: (id: string, channelId: string) => void;
  categoryColor: string;
  channelInvalid?: boolean;
}) {
  const t = useTranslation();
  const Icon = entry.icon;

  return (
    <div
      className={cn(
        "dashboard-glass-card flex flex-col gap-2 p-3 transition-all",
        enabled ? "ring-1 ring-inset" : "opacity-60",
        enabled
          ? categoryColor.replace("text-", "ring-").replace("dark:", "")
          : "ring-transparent",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px]",
              enabled
                ? categoryColor.replace("text-", "bg-").replace("dark:", "/15 ") +
                    " " +
                    categoryColor
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

      <TooltipProvider>
        <Tooltip open={channelInvalid && enabled ? undefined : false}>
          <TooltipTrigger asChild>
            <div>
              <ChannelSelect
                channels={channels}
                value={channelId}
                onChange={(id) => onChannelChange(entry.id, id)}
                placeholder={t.logs.channelSelect.selectChannel}
                invalid={channelInvalid && enabled}
              />
            </div>
          </TooltipTrigger>
          {channelInvalid && enabled && (
            <TooltipContent>
              <p>{t.logs.channelSelect.notFound}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
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
  category: CategoryConfig;
  enabledLogs: Set<string>;
  channelMap: Map<string, string>;
  channels: GuildTextChannel[];
  onToggle: (id: string, enabled: boolean) => void;
  onChannelChange: (id: string, channelId: string) => void;
}) {
  const Icon = category.icon;
  const enabledCount = category.logs.filter((log) => enabledLogs.has(log.id)).length;
  const channelIdSet = new Set(channels.map((c) => c.id));

  return (
    <section className="dashboard-glass-card p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-3">
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
            channelInvalid={
              Boolean(channelMap.get(entry.id)) &&
              !channelIdSet.has(channelMap.get(entry.id) ?? "")
            }
          />
        ))}
      </div>
    </section>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

function LogsSectionComponent({ guildId: guildIdProp }: LogsSectionProps) {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const selectedGuildId = useGuildStore((s) => s.selectedGuildId);
  const guildId = guildIdProp ?? selectedGuildId ?? null;

  const CATEGORIES = useMemo(() => [
    {
      id: "channels",
      label: t.logs.categories.channel.label,
      icon: Hash,
      color: "border-l-sky-500",
      borderColor: "border-sky-500/30",
      bgColor: "bg-sky-500/8",
      textColor: "text-sky-600 dark:text-sky-400",
      logs: [
        { id: "channel_create", label: t.logs.categories.channel.events.channel_create.label, description: t.logs.categories.channel.events.channel_create.description, icon: Plus },
        { id: "channel_delete", label: t.logs.categories.channel.events.channel_delete.label, description: t.logs.categories.channel.events.channel_delete.description, icon: Minus },
        { id: "channel_update", label: t.logs.categories.channel.events.channel_update.label, description: t.logs.categories.channel.events.channel_update.description, icon: Settings2 },
      ],
    },
    {
      id: "messages",
      label: t.logs.categories.message.label,
      icon: MessageSquare,
      color: "border-l-amber-500",
      borderColor: "border-amber-500/30",
      bgColor: "bg-amber-500/8",
      textColor: "text-amber-600 dark:text-amber-400",
      logs: [
        { id: "message_delete", label: t.logs.categories.message.events.message_delete.label, description: t.logs.categories.message.events.message_delete.description, icon: Trash2 },
        { id: "message_bulk_delete", label: t.logs.categories.message.events.message_bulk_delete.label, description: t.logs.categories.message.events.message_bulk_delete.description, icon: MessageCircleOff },
        { id: "message_edit", label: t.logs.categories.message.events.message_edit.label, description: t.logs.categories.message.events.message_edit.description, icon: Edit3 },
      ],
    },
    {
      id: "members",
      label: t.logs.categories.member.label,
      icon: Users,
      color: "border-l-violet-500",
      borderColor: "border-violet-500/30",
      bgColor: "bg-violet-500/8",
      textColor: "text-violet-600 dark:text-violet-400",
      logs: [
        { id: "member_join", label: t.logs.categories.member.events.member_join.label, description: t.logs.categories.member.events.member_join.description, icon: LogIn },
        { id: "member_leave", label: t.logs.categories.member.events.member_leave.label, description: t.logs.categories.member.events.member_leave.description, icon: LogOut },
        { id: "member_update", label: t.logs.categories.member.events.member_update.label, description: t.logs.categories.member.events.member_update.description, icon: UserCheck },
        { id: "member_ban", label: t.logs.categories.member.events.member_ban.label, description: t.logs.categories.member.events.member_ban.description, icon: Ban },
        { id: "member_unban", label: t.logs.categories.member.events.member_unban.label, description: t.logs.categories.member.events.member_unban.description, icon: Unlock },
      ],
    },
    {
      id: "roles",
      label: t.logs.categories.role.label,
      icon: Shield,
      color: "border-l-indigo-500",
      borderColor: "border-indigo-500/30",
      bgColor: "bg-indigo-500/8",
      textColor: "text-indigo-600 dark:text-indigo-400",
      logs: [
        { id: "role_create", label: t.logs.categories.role.events.role_create.label, description: t.logs.categories.role.events.role_create.description, icon: BadgePlus },
        { id: "role_delete", label: t.logs.categories.role.events.role_delete.label, description: t.logs.categories.role.events.role_delete.description, icon: BadgeMinus },
        { id: "role_update", label: t.logs.categories.role.events.role_update.label, description: t.logs.categories.role.events.role_update.description, icon: Settings2 },
        { id: "role_add", label: t.logs.categories.role.events.role_add.label, description: t.logs.categories.role.events.role_add.description, icon: BadgeCheck },
        { id: "role_remove", label: t.logs.categories.role.events.role_remove.label, description: t.logs.categories.role.events.role_remove.description, icon: UserMinus },
      ],
    },
    {
      id: "invites",
      label: t.logs.categories.invite.label,
      icon: Link2,
      color: "border-l-emerald-500",
      borderColor: "border-emerald-500/30",
      bgColor: "bg-emerald-500/8",
      textColor: "text-emerald-600 dark:text-emerald-400",
      logs: [
        { id: "invite_create", label: t.logs.categories.invite.events.invite_create.label, description: t.logs.categories.invite.events.invite_create.description, icon: Plus },
        { id: "invite_delete", label: t.logs.categories.invite.events.invite_delete.label, description: t.logs.categories.invite.events.invite_delete.description, icon: Minus },
        { id: "invite_used", label: t.logs.categories.invite.events.invite_used.label, description: t.logs.categories.invite.events.invite_used.description, icon: LogIn },
      ],
    },
    {
      id: "voice",
      label: t.logs.categories.voice.label,
      icon: Volume2,
      color: "border-l-cyan-500",
      borderColor: "border-cyan-500/30",
      bgColor: "bg-cyan-500/8",
      textColor: "text-cyan-600 dark:text-cyan-400",
      logs: [
        { id: "voice_join", label: t.logs.categories.voice.events.voice_join.label, description: t.logs.categories.voice.events.voice_join.description, icon: Speaker },
        { id: "voice_leave", label: t.logs.categories.voice.events.voice_leave.label, description: t.logs.categories.voice.events.voice_leave.description, icon: VolumeX },
        { id: "voice_move", label: t.logs.categories.voice.events.voice_move.label, description: t.logs.categories.voice.events.voice_move.description, icon: Move },
        { id: "voice_kick", label: t.logs.categories.voice.events.voice_kick.label, description: t.logs.categories.voice.events.voice_kick.description, icon: UserMinus },
        { id: "voice_mute", label: t.logs.categories.voice.events.voice_mute.label, description: t.logs.categories.voice.events.voice_mute.description, icon: MicOff },
        { id: "voice_deafen", label: t.logs.categories.voice.events.voice_deafen.label, description: t.logs.categories.voice.events.voice_deafen.description, icon: EarOff },
      ],
    },
  ] as CategoryConfig[], [t]);

  const ALL_EVENT_IDS = useMemo(() => CATEGORIES.flatMap((cat) => cat.logs.map((log) => log.id)), [CATEGORIES]);

  const [enabledLogs, setEnabledLogs] = useState<Set<string>>(new Set());
  const [channelMap, setChannelMap] = useState<Map<string, string>>(new Map());
  const [defaultChannel, setDefaultChannel] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const savedConfigRef = useRef<{ enabledLogs: Set<string>; channelMap: Map<string, string>; defaultChannel: string }>({
    enabledLogs: new Set(),
    channelMap: new Map(),
    defaultChannel: "",
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef(false);

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ["guilds", guildId, "channels", "text"],
    queryFn: () => guildService.getGuildTextChannels(guildId!),
    enabled: Boolean(guildId),
    staleTime: 60 * 1000,
  });

  const { data: guildInfo } = useQuery({
    queryKey: ["guilds", guildId],
    queryFn: () => guildService.getById(guildId!),
    enabled: Boolean(guildId),
    staleTime: 60 * 1000,
  });

  const {
    data: fetchedConfig,
    isLoading: configLoading,
    isError: configIsError,
    error: configFetchError,
  } = useQuery({
    queryKey: ["guilds", guildId, "logging"],
    queryFn: () => guildService.getLoggingConfig(guildId!),
    enabled: Boolean(guildId),
    staleTime: 60 * 1000,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: { defaultChannel: string; entries: LoggingEntry[] }) =>
      guildService.saveLoggingConfig(guildId!, payload),
    onSuccess: (result) => {
      savedConfigRef.current = {
        enabledLogs: new Set(enabledLogsRef.current),
        channelMap: new Map(channelMapRef.current),
        defaultChannel: defaultChannelRef.current,
      };
      setSaveStatus("success");
      queryClient.setQueryData(["guilds", guildId, "logging"], result);
      pendingRef.current = false;
    },
    onError: (err) => {
      setEnabledLogs(new Set(savedConfigRef.current.enabledLogs));
      setChannelMap(new Map(savedConfigRef.current.channelMap));
      setDefaultChannel(savedConfigRef.current.defaultChannel);
      setSaveStatus("error");
      pendingRef.current = false;
      if (err instanceof AppError) {
        if (err.status === 403) {
          setErrorMessage(t.logs.status.forbidden);
        } else {
          setErrorMessage(err.message || t.logs.status.saveError);
        }
      } else {
        setErrorMessage(t.logs.status.saveError);
      }
    },
  });

  // Refs to track latest values for async operations
  const enabledLogsRef = useRef(enabledLogs);
  const channelMapRef = useRef(channelMap);
  const defaultChannelRef = useRef(defaultChannel);
  useEffect(() => { enabledLogsRef.current = enabledLogs; }, [enabledLogs]);
  useEffect(() => { channelMapRef.current = channelMap; }, [channelMap]);
  useEffect(() => { defaultChannelRef.current = defaultChannel; }, [defaultChannel]);

  // ── Initialize config from API ─────────────────────────────────────────

  useEffect(() => {
    if (!fetchedConfig) {
      if (configLoading || configIsError) return;
      setEnabledLogs(new Set());
      setChannelMap(new Map());
      setDefaultChannel("");
      savedConfigRef.current = {
        enabledLogs: new Set(),
        channelMap: new Map(),
        defaultChannel: "",
      };
      return;
    }
    const enabled = new Set<string>();
    const chanMap = new Map<string, string>();
    for (const e of fetchedConfig.entries) {
      if (e.enabled) enabled.add(e.id);
      if (e.channelId) chanMap.set(e.id, e.channelId);
    }
    setEnabledLogs(enabled);
    setChannelMap(chanMap);
    const dc = fetchedConfig.defaultChannel || "";
    setDefaultChannel(dc);
    savedConfigRef.current = { enabledLogs: enabled, channelMap: chanMap, defaultChannel: dc };
  }, [fetchedConfig, configLoading, configIsError]);

  // ── Debounced save ────────────────────────────────────────────────────

  const doSave = useCallback(() => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    const entries: LoggingEntry[] = ALL_EVENT_IDS.map((id) => ({
      id,
      enabled: enabledLogsRef.current.has(id),
      channelId: channelMapRef.current.get(id) ?? "",
    }));
    saveMutation.mutate({
      defaultChannel: defaultChannelRef.current,
      entries,
    });
  }, [saveMutation]);

  const scheduleSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(doSave, 300);
  }, [doSave]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ── Auto-clear success message ───────────────────────────────────────

  useEffect(() => {
    if (saveStatus !== "success") return;
    const t = setTimeout(() => setSaveStatus("idle"), 3000);
    return () => clearTimeout(t);
  }, [saveStatus]);

  // ── Handlers ───────────────────────────────────────────────────────────

  const handleToggle = useCallback(
    (id: string, enabled: boolean) => {
      setSaveStatus("idle");
      setErrorMessage("");
      setEnabledLogs((prev) => {
        const next = new Set(prev);
        if (enabled) next.add(id);
        else next.delete(id);
        return next;
      });
      scheduleSave();
    },
    [scheduleSave],
  );

  const handleChannelChange = useCallback(
    (id: string, channelId: string) => {
      setSaveStatus("idle");
      setErrorMessage("");
      setChannelMap((prev) => {
        const next = new Map(prev);
        next.set(id, channelId);
        return next;
      });
      scheduleSave();
    },
    [scheduleSave],
  );

  const handleDefaultChannelChange = useCallback(
    (channelId: string) => {
      setDefaultChannel(channelId);
      setSaveStatus("idle");
      setErrorMessage("");
      scheduleSave();
    },
    [scheduleSave],
  );

  const handleToggleAll = useCallback(() => {
    setSaveStatus("idle");
    setErrorMessage("");
    setEnabledLogs((prev) => {
      if (prev.size === ALL_EVENT_IDS.length) return new Set();
      return new Set(ALL_EVENT_IDS);
    });
    scheduleSave();
  }, [scheduleSave]);

  const handleSaveNow = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!defaultChannelRef.current) return;
    doSave();
  }, [doSave]);

  // ── Derived state ──────────────────────────────────────────────────────

  const totalEnabled = enabledLogs.size;
  const allEnabled = totalEnabled === ALL_EVENT_IDS.length;
  const isAdmin = guildInfo?.canManage ?? true;
  const cannotSave = !defaultChannel || saveMutation.isPending || !isAdmin;
  const channelIdSet = useMemo(() => new Set(channels.map((c) => c.id)), [channels]);
  const defaultChannelMissing = Boolean(defaultChannel) && !channelIdSet.has(defaultChannel);

  // ── Loading state ──────────────────────────────────────────────────────

  if (configLoading) {
    return (
      <div className="min-h-0 space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-kat">{t.logs.header.label}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{t.logs.header.heading}</h1>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-[1.75rem]" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-[1.75rem]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-kat">
          {t.logs.header.label}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{t.logs.header.heading}</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t.logs.header.description}
        </p>
      </div>

      {/* Config fetch error */}
      {configIsError && !configLoading && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          <XCircle className="h-4 w-4 shrink-0" />
          {configFetchError instanceof AppError
            ? configFetchError.message
            : t.logs.status.loadError}
        </div>
      )}

      {/* Save status messages */}
      {saveStatus === "success" && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {t.logs.status.saveSuccess}
        </div>
      )}
      {saveStatus === "error" && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          <XCircle className="h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Default Channel + Controls */}
      <div className="dashboard-glass-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.logs.defaultChannel.label}
            </label>
            <div className="max-w-xs">
              {channelsLoading ? (
                <div className="flex h-10 items-center rounded-xl border border-black/[0.08] bg-background px-3 text-xs text-muted-foreground dark:border-white/10">
                  {t.logs.defaultChannel.loading}
                </div>
              ) : (
                <ChannelSelect
                  channels={channels}
                  value={defaultChannel}
                  onChange={handleDefaultChannelChange}
                  placeholder={t.logs.defaultChannel.select}
                  invalid={defaultChannelMissing}
                />
              )}
            </div>

            {!defaultChannel && (
              <p className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3 w-3" />
                {t.logs.defaultChannel.noDefaultWarning}
              </p>
            )}
            {defaultChannelMissing && (
              <p className="flex items-center gap-1.5 text-[11px] text-red-600 dark:text-red-400">
                <AlertTriangle className="h-3 w-3" />
                {t.logs.defaultChannel.notFoundWarning}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-kat/10 text-kat shadow-none">
              {t.logs.toolbar.activeCount.replace("{totalEnabled}", String(totalEnabled))}
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleAll}
              className="text-xs"
            >
              {allEnabled ? t.logs.toolbar.disableAll : t.logs.toolbar.enableAll}
            </Button>

            <TooltipProvider>
              <Tooltip open={!isAdmin ? undefined : false}>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={cannotSave}
                      onClick={handleSaveNow}
                    >
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                      {saveMutation.isPending ? t.logs.toolbar.saving : t.logs.toolbar.saveChanges}
                    </Button>
                  </div>
                </TooltipTrigger>
                {!isAdmin && (
                  <TooltipContent>
                    <p>{t.logs.toolbar.adminOnly}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
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
