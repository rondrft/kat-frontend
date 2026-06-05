"use client";

import Image from "next/image";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Ban,
  Bot,
  Crown,
  Eye,
  FileWarning,
  Gauge,
  Link2,
  LockKeyhole,
  MessageSquareWarning,
  Plus,
  Save,
  ShieldAlert,
  ShieldCheck,
  TimerReset,
  Trash2,
  ChevronDown,
  ToggleLeft,
  Users,
  Shield,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import {
  useModerationConfig,
  useSaveModerationConfig,
} from "@/features/moderation/hooks/use-moderation-config";
import { apiClient } from "@/api";
import { cn } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";
import { useGuildStore } from "@/store/guild-store";
import type { GuildRole } from "@/features/auto-roles/types/auto-roles-config";
import { guildService } from "@/services/guild.service";
import {
  useModPermissions,
  useSaveModPermissions,
} from "@/features/moderation/hooks/use-mod-permissions";
import { usePremiumStatus } from "@/features/guilds/hooks/use-premium-status";
import {
  usePurgeConfig,
  useSavePurgeConfig,
} from "@/features/moderation/hooks/use-purge-config";
import {
  useNukeConfig,
  useSaveNukeConfig,
} from "@/features/moderation/hooks/use-nuke-config";
import type {
  ModerationAction,
  ModerationConfig,
  ModerationRuleConfig,
  ModerationRuleType,
  ModPermissions,
  PurgeConfig,
  NukeConfig,
} from "@/types/moderation";
import { getDiscordAvatarUrl } from "@/utils/discord";

type ModerationMode =
  | "monitor"
  | "delete"
  | "timeout"
  | "deleteAndTimeout"
  | "lockdown";

type RuleId =
  | "spam"
  | "links"
  | "invites"
  | "mentions"
  | "caps"
  | "newAccounts"
  | "raid"
  | "aiToxicity";

type ModerationRule = {
  id: RuleId;
  title: string;
  description: string;
  icon: typeof ShieldAlert;
  premium?: boolean;
  enabled: boolean;
  mode: ModerationMode;
  threshold: number;
  timeoutMinutes: number | null;
};

const ACTIONS: {
  id: ModerationMode;
  label: string;
  description: string;
  icon: typeof Eye;
}[] = [
  { id: "monitor", label: "Monitor", description: "Log only", icon: Eye },
  { id: "delete", label: "Delete", description: "Remove message", icon: Trash2 },
  { id: "timeout", label: "Timeout", description: "Mute user", icon: TimerReset },
  {
    id: "deleteAndTimeout",
    label: "Delete & Timeout",
    description: "Remove + mute",
    icon: TimerReset,
  },
  {
    id: "lockdown",
    label: "Lockdown",
    description: "Freeze channels",
    icon: LockKeyhole,
  },
];

const INITIAL_RULES: ModerationRule[] = [
  {
    id: "spam",
    title: "Spam",
    description: "Repeated messages, emoji flooding, and fast sends.",
    icon: MessageSquareWarning,
    enabled: false,
    mode: "delete",
    threshold: 6,
    timeoutMinutes: null,
  },
  {
    id: "links",
    title: "Links",
    description: "Suspicious URLs, phishing domains, and link flooding.",
    icon: Link2,
    enabled: false,
    mode: "delete",
    threshold: 2,
    timeoutMinutes: null,
  },
  {
    id: "invites",
    title: "Invites",
    description: "Discord invite links outside allowed channels.",
    icon: Ban,
    enabled: false,
    mode: "delete",
    threshold: 1,
    timeoutMinutes: null,
  },
  {
    id: "mentions",
    title: "Mentions",
    description: "@everyone abuse and large mention bursts.",
    icon: AlertTriangle,
    enabled: false,
    mode: "timeout",
    threshold: 5,
    timeoutMinutes: null,
  },
  {
    id: "caps",
    title: "Caps",
    description: "All-caps messages, repeated symbols, and visual noise.",
    icon: FileWarning,
    enabled: false,
    mode: "monitor",
    threshold: 80,
    timeoutMinutes: null,
  },
  {
    id: "newAccounts",
    title: "New accounts",
    description: "Stricter moderation for fresh or untrusted accounts.",
    icon: ShieldCheck,
    premium: true,
    enabled: false,
    mode: "timeout",
    threshold: 7,
    timeoutMinutes: null,
  },
  {
    id: "raid",
    title: "Raid shield",
    description: "Join spikes, channel lockdowns, and staff alerts.",
    icon: Gauge,
    premium: true,
    enabled: false,
    mode: "lockdown",
    threshold: 10,
    timeoutMinutes: null,
  },
  {
    id: "aiToxicity",
    title: "AI scan",
    description: "Harassment, hate, threats, and evasion patterns.",
    icon: Bot,
    premium: true,
    enabled: false,
    mode: "monitor",
    threshold: 70,
    timeoutMinutes: null,
  },
];

const CUSTOM_RULES = [
  { pattern: "free nitro", action: "Delete + warn", premium: false },
  { pattern: "discord.gg/*", action: "Delete message", premium: false },
  { pattern: "new account + link", action: "Timeout 10m", premium: true },
];

const BACKEND_RULE_IDS: Partial<Record<RuleId, ModerationRuleType>> = {
  spam: "SPAM",
  links: "LINKS",
  invites: "INVITES",
  mentions: "MENTIONS",
  caps: "CAPS",
};

function toUiAction(action: ModerationAction): ModerationMode {
  if (action === "DELETE_AND_TIMEOUT") return "deleteAndTimeout";
  return action.toLowerCase() as ModerationMode;
}

function toApiAction(mode: ModerationMode): ModerationAction {
  if (mode === "deleteAndTimeout") return "DELETE_AND_TIMEOUT";
  if (mode === "lockdown") return "TIMEOUT";
  return mode.toUpperCase() as ModerationAction;
}

function usesTimeout(mode: ModerationMode) {
  return mode === "timeout" || mode === "deleteAndTimeout";
}

function getActionLabel(mode: ModerationMode) {
  return ACTIONS.find((action) => action.id === mode)?.label ?? mode;
}

function applyModerationConfigToRules(
  currentRules: ModerationRule[],
  config: ModerationConfig,
) {
  return currentRules.map((rule) => {
    const apiId = BACKEND_RULE_IDS[rule.id];
    if (!apiId) return rule;
    const saved = config.rules.find((item) => item.id === apiId);
    if (!saved) return rule;

    return {
      ...rule,
      enabled: saved.enabled,
      mode: toUiAction(saved.action),
      threshold: saved.threshold,
      timeoutMinutes: saved.timeoutMinutes,
    };
  });
}

function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-500">
      <Crown className="h-3 w-3" />
      Premium
    </span>
  );
}

function FreeBadge() {
  return (
    <span className="rounded-full bg-kat/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-kat">
      Free
    </span>
  );
}

function ActionSelector({
  value,
  onChange,
}: {
  value: ModerationMode;
  onChange: (value: ModerationMode) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {ACTIONS.map(({ id, label, description, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "flex min-h-[4.5rem] flex-col justify-between rounded-xl border px-3 py-2 text-left transition-colors",
            value === id
              ? "border-kat/40 bg-kat/10 text-kat"
              : "border-black/[0.08] bg-black/[0.02] text-muted-foreground hover:bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.03]",
          )}
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Icon className="h-4 w-4" />
            {label}
          </span>
          <span className="text-[11px]">{description}</span>
        </button>
      ))}
    </div>
  );
}

function RuleTile({
  rule,
  onOpen,
  onToggle,
}: {
  rule: ModerationRule;
  onOpen: (rule: ModerationRule) => void;
  onToggle: (id: RuleId, enabled: boolean) => void;
}) {
  const Icon = rule.icon;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(rule)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(rule);
        }
      }}
      className="dashboard-glass-card flex min-h-[8.75rem] flex-col justify-between p-4 text-left transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              rule.enabled ? "bg-kat/10 text-kat" : "bg-slate-500/10 text-slate-500",
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-bold">{rule.title}</h3>
              {rule.premium ? <PremiumBadge /> : <FreeBadge />}
            </div>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {rule.description}
            </p>
          </div>
        </div>
        <Switch
          checked={rule.enabled}
          onClick={(event) => event.stopPropagation()}
          onCheckedChange={(enabled) => onToggle(rule.id, enabled)}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="rounded-full bg-black/[0.04] px-2 py-1 font-semibold text-muted-foreground dark:bg-white/[0.05]">
          {getActionLabel(rule.mode)}
        </span>
        <span className={rule.enabled ? "text-emerald-500" : "text-muted-foreground"}>
          {rule.enabled ? "Active" : "Paused"}
        </span>
      </div>
    </article>
  );
}

function RuleDialog({
  rule,
  open,
  onOpenChange,
  onUpdate,
}: {
  rule: ModerationRule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: RuleId, patch: Partial<ModerationRule>) => void;
}) {
  if (!rule) return null;
  const Icon = rule.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-kat/10 text-kat">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{rule.title}</DialogTitle>
              <DialogDescription>{rule.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-2xl bg-black/[0.025] p-3 dark:bg-white/[0.03]">
            <div>
              <p className="text-sm font-semibold">Enabled</p>
              <p className="text-xs text-muted-foreground">
                Turn this protection on for the selected server.
              </p>
            </div>
            <Switch
              checked={rule.enabled}
              onCheckedChange={(enabled) => onUpdate(rule.id, { enabled })}
            />
          </div>

          <div className="space-y-2">
            <Label>Action</Label>
            <ActionSelector
              value={rule.mode}
              onChange={(mode) => onUpdate(rule.id, { mode })}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_128px]">
            <div className="space-y-2">
              <Label htmlFor={`${rule.id}-threshold`}>Threshold</Label>
              <input
                id={`${rule.id}-threshold`}
                type="range"
                min={1}
                max={100}
                value={rule.threshold}
                onChange={(event) =>
                  onUpdate(rule.id, { threshold: Number(event.target.value) })
                }
                className="w-full accent-[hsl(var(--kat))]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${rule.id}-threshold-number`}>Value</Label>
              <Input
                id={`${rule.id}-threshold-number`}
                type="number"
                min={1}
                max={100}
                value={rule.threshold}
                onChange={(event) =>
                  onUpdate(rule.id, { threshold: Number(event.target.value) })
                }
              />
            </div>
          </div>

          {usesTimeout(rule.mode) ? (
            <div className="space-y-2">
              <Label htmlFor={`${rule.id}-timeout`}>Timeout (minutes)</Label>
              <Input
                id={`${rule.id}-timeout`}
                type="number"
                min={1}
                max={1440}
                placeholder="Leave empty to use default"
                value={rule.timeoutMinutes ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  onUpdate(rule.id, {
                    timeoutMinutes: value === "" ? null : Number(value),
                  });
                }}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use the global default timeout.
              </p>
            </div>
          ) : null}

          {rule.premium ? (
            <div className="rounded-2xl border border-violet-500/15 bg-violet-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-violet-500">
                <Crown className="h-4 w-4" />
                Premium rule
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                This can be visible in Free mode, but server-side saving should require
                Premium before activation.
              </p>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const emptyPermissions: ModPermissions = {
  xkick: [],
  xban: [],
  xmute: [],
  xwarn: [],
  xhistory: [],
};

const defaultPurgeConfig: PurgeConfig = {
  enabled: false,
  allowedRoleId: null,
  maxMessages: 20,
  maxAgeSeconds: 300,
};

const defaultNukeConfig: NukeConfig = {
  allowedRoleId: null,
  allowedUserIds: [],
};

function roleColorStyle(color?: number): React.CSSProperties | undefined {
  if (!color) return undefined;
  return { backgroundColor: `#${color.toString(16).padStart(6, "0")}` };
}

function CommandRoleSelect({
  roles,
  selectedIds,
  onChange,
  isLoading,
}: {
  roles: GuildRole[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  isLoading?: boolean;
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

  const toggle = (roleId: string) => {
    if (selectedIds.includes(roleId)) {
      onChange(selectedIds.filter((id) => id !== roleId));
    } else {
      onChange([...selectedIds, roleId]);
    }
  };

  const selectedRoles = roles.filter((r) => selectedIds.includes(r.id));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-10 w-full items-center gap-1.5 rounded-xl border border-black/[0.08] bg-background px-3 py-1.5 text-left text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat focus-visible:ring-offset-2 dark:border-white/10"
      >
        {isLoading ? (
          <span className="text-xs text-muted-foreground">Loading roles…</span>
        ) : selectedRoles.length > 0 ? (
          <div className="flex flex-1 flex-wrap gap-1">
            {selectedRoles.map((role) => (
              <span
                key={role.id}
                className="inline-flex items-center gap-1 rounded-md bg-black/[0.06] px-1.5 py-0.5 text-xs font-medium dark:bg-white/[0.08]"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-muted"
                  style={roleColorStyle(role.color)}
                />
                {role.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Select roles…</span>
        )}
        <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 max-h-60 w-72 overflow-y-auto rounded-xl border border-black/[0.08] bg-background p-1 shadow-lg dark:border-white/10">
          {roles.length === 0 ? (
            <p className="px-2 py-3 text-xs text-muted-foreground">
              {isLoading ? "Loading roles…" : "No roles available"}
            </p>
          ) : (
            roles.map((role) => {
              const checked = selectedIds.includes(role.id);
              return (
                <label
                  key={role.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                >
                  <input
                    type="checkbox"
                    className="accent-[hsl(var(--kat-brand))]"
                    checked={checked}
                    onChange={() => toggle(role.id)}
                  />
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full bg-muted"
                    style={roleColorStyle(role.color)}
                  />
                  <span className="truncate">{role.name}</span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function SingleRoleSelect({
  roles,
  selectedId,
  onChange,
  isLoading,
}: {
  roles: GuildRole[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
  isLoading?: boolean;
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

  const selectedRole = roles.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-10 w-full items-center gap-1.5 rounded-xl border border-black/[0.08] bg-background px-3 py-1.5 text-left text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat focus-visible:ring-offset-2 dark:border-white/10"
      >
        {isLoading ? (
          <span className="text-xs text-muted-foreground">Loading roles…</span>
        ) : selectedRole ? (
          <div className="flex flex-1 flex-wrap gap-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-black/[0.06] px-1.5 py-0.5 text-xs font-medium dark:bg-white/[0.08]">
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-muted"
                style={roleColorStyle(selectedRole.color)}
              />
              {selectedRole.name}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Select a role…</span>
        )}
        <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 max-h-60 w-72 overflow-y-auto rounded-xl border border-black/[0.08] bg-background p-1 shadow-lg dark:border-white/10">
          <label
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
          >
            <input
              type="radio"
              name="nuke-role"
              className="accent-[hsl(var(--kat-brand))]"
              checked={selectedId === null}
              onChange={() => onChange(null)}
            />
            <span className="text-muted-foreground">No role</span>
          </label>
          {roles.length === 0 ? (
            <p className="px-2 py-3 text-xs text-muted-foreground">
              {isLoading ? "Loading roles…" : "No roles available"}
            </p>
          ) : (
            roles.map((role) => {
              const checked = role.id === selectedId;
              return (
                <label
                  key={role.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                >
                  <input
                    type="radio"
                    name="nuke-role"
                    className="accent-[hsl(var(--kat-brand))]"
                    checked={checked}
                    onChange={() => onChange(role.id)}
                  />
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full bg-muted"
                    style={roleColorStyle(role.color)}
                  />
                  <span className="truncate">{role.name}</span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

type MemberTag = {
  id: string;
  username: string;
  avatar: string | null;
};

function UserTagInput({
  userIds,
  onChange,
  guildId,
}: {
  userIds: string[];
  onChange: (ids: string[]) => void;
  guildId: string;
}) {
  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState<MemberTag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userIds.length === 0) {
      setTags([]);
      return;
    }
    const idsSet = new Set(userIds);
    setTags((prev) => {
      const next = prev.filter((t) => idsSet.has(t.id));
      const missing = userIds.filter((id) => !next.find((t) => t.id === id));
      if (missing.length === 0) return next;
      return next;
    });
  }, [userIds]);

  const removeTag = (id: string) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
    onChange(userIds.filter((uid) => uid !== id));
  };

  const addUser = async (userId: string) => {
    const trimmed = userId.trim();
    if (!trimmed) return;
    if (userIds.includes(trimmed)) {
      setError("User already added");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<MemberTag> | unknown>(
        `/guilds/${guildId}/members/${trimmed}`,
      );
      const raw =
        typeof data === "object" && data !== null && "data" in data
          ? (data as ApiResponse<MemberTag>).data
          : data;
      if (!raw || typeof raw !== "object") {
        setError("User not found in this server");
        return;
      }
      const member = raw as Record<string, unknown>;
      const id = String(member.id ?? "");
      if (!id) {
        setError("User not found in this server");
        return;
      }
      const tag: MemberTag = {
        id,
        username: String(member.username ?? "Unknown"),
        avatar: typeof member.avatar === "string" ? member.avatar : null,
      };
      setTags((prev) => [...prev, tag]);
      onChange([...userIds, id]);
      setInputValue("");
    } catch {
      setError("User not found in this server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void addUser(inputValue);
            }
          }}
          placeholder="Enter Discord user ID…"
          className="flex h-10 w-full rounded-xl border border-black/[0.08] bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
        />
      </div>
      {loading ? (
        <p className="text-xs text-muted-foreground">Looking up user…</p>
      ) : null}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1.5 rounded-lg bg-black/[0.06] px-2 py-1 text-xs font-medium dark:bg-white/[0.08]"
            >
              <Image
                src={getDiscordAvatarUrl(tag.id, tag.avatar, 32)}
                alt=""
                width={16}
                height={16}
                className="h-4 w-4 shrink-0 rounded-full"
                unoptimized
              />
              <span className="max-w-[120px] truncate">{tag.username}</span>
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-black/[0.1] hover:text-foreground dark:hover:bg-white/[0.1]"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type ModerationSectionProps = {
  guildId?: string;
};

function ModerationSectionComponent({ guildId: guildIdProp }: ModerationSectionProps) {
  const selectedGuildId = useGuildStore((s) => s.selectedGuildId);
  const guildId = guildIdProp ?? selectedGuildId;
  const {
    data: moderationConfig,
    isLoading,
    isError,
    refetch,
  } = useModerationConfig(guildId);
  const saveMutation = useSaveModerationConfig(guildId);
  const [rules, setRules] = useState(INITIAL_RULES);
  const [selectedRuleId, setSelectedRuleId] = useState<RuleId | null>(null);
  const [strictness, setStrictness] = useState(62);
  const [muteMinutes, setMuteMinutes] = useState(10);
  const [saved, setSaved] = useState(false);

  const {
    data: permissionsData,
    isLoading: permissionsLoading,
  } = useModPermissions(guildId);
  const savePermissions = useSaveModPermissions(guildId);
  const [permissions, setPermissions] = useState<ModPermissions | null>(null);

  const {
    data: purgeData,
    isLoading: purgeLoading,
  } = usePurgeConfig(guildId);
  const savePurge = useSavePurgeConfig(guildId);
  const [purgeConfig, setPurgeConfig] = useState<PurgeConfig | null>(null);

  const {
    data: nukeData,
    isLoading: nukeLoading,
  } = useNukeConfig(guildId);
  const saveNuke = useSaveNukeConfig(guildId);
  const [nukeConfig, setNukeConfig] = useState<NukeConfig | null>(null);

  const { data: guildRoles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["guilds", guildId, "roles"],
    queryFn: () => guildService.getGuildRoles(guildId!),
    enabled: Boolean(guildId),
    staleTime: 60 * 1000,
  });

  const { data: premiumData } = usePremiumStatus(guildId);
  const isPremium = premiumData?.isPremium ?? false;

  useEffect(() => {
    if (!moderationConfig) return;
    setStrictness(moderationConfig.strictness);
    setMuteMinutes(moderationConfig.defaultTimeoutMinutes);
    setRules((current) => applyModerationConfigToRules(current, moderationConfig));
    setSaved(true);
  }, [moderationConfig]);

  useEffect(() => {
    if (permissionsData) {
      setPermissions(permissionsData);
    }
  }, [permissionsData]);

  useEffect(() => {
    if (purgeData) {
      setPurgeConfig(purgeData);
    }
  }, [purgeData]);

  useEffect(() => {
    if (nukeData) {
      setNukeConfig(nukeData);
    }
  }, [nukeData]);

  const selectedRule = rules.find((rule) => rule.id === selectedRuleId) ?? null;

  const enabledCount = useMemo(
    () => rules.filter((rule) => rule.enabled).length,
    [rules],
  );
  const premiumCount = useMemo(
    () => rules.filter((rule) => rule.premium).length,
    [rules],
  );

  const updateRule = (id: RuleId, patch: Partial<ModerationRule>) => {
    setSaved(false);
    setRules((current) =>
      current.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)),
    );
  };

  const saveDraft = () => {
    if (!guildId) return;

    const payload = {
      enabled: rules.some((rule) => BACKEND_RULE_IDS[rule.id] && rule.enabled),
      strictness,
      defaultTimeoutMinutes: muteMinutes,
      rules: rules
        .map((rule) => {
          const apiId = BACKEND_RULE_IDS[rule.id];
          if (!apiId) return null;
          return {
            id: apiId,
            enabled: rule.enabled,
            action: toApiAction(rule.mode),
            threshold: rule.threshold,
            timeoutMinutes: usesTimeout(rule.mode) ? rule.timeoutMinutes : null,
          };
        })
        .filter((rule): rule is ModerationRuleConfig => rule !== null),
    };

    saveMutation.mutate(payload, {
      onSuccess: (config) => {
        setStrictness(config.strictness);
        setMuteMinutes(config.defaultTimeoutMinutes);
        setRules((current) => applyModerationConfigToRules(current, config));
        setSaved(true);
      },
      onError: () => {
        setSaved(false);
      },
    });
  };

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.85fr)_minmax(260px,0.65fr)]">
        <div className="dashboard-glass-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-kat">
                Moderation center
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">
                Protections by module
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Open each protection to tune thresholds, actions, and premium behavior.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-kat/10 text-kat shadow-none">
                {enabledCount} active
              </Badge>
              <Badge className="bg-violet-500/10 text-violet-500 shadow-none">
                {premiumCount} premium
              </Badge>
              {isLoading ? (
                <Badge className="bg-slate-500/10 text-slate-500 shadow-none">
                  Loading
                </Badge>
              ) : null}
              {saved && !saveMutation.isPending ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 shadow-none dark:text-emerald-400">
                  Saved
                </Badge>
              ) : null}
              {isError ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void refetch()}
                >
                  Retry
                </Button>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_8.5rem]">
            <div className="rounded-2xl bg-black/[0.025] p-3 dark:bg-white/[0.03]">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Strictness
              </p>
              <div className="mt-2 flex items-center gap-3">
                <input
                  aria-label="Strictness"
                  type="range"
                  min={0}
                  max={100}
                  value={strictness}
                  onChange={(event) => {
                    setSaved(false);
                    setStrictness(Number(event.target.value));
                  }}
                  className="w-full accent-[hsl(var(--kat))]"
                />
                <span className="w-10 text-right text-sm font-bold text-kat">
                  {strictness}%
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-black/[0.025] p-3 dark:bg-white/[0.03]">
              <Label htmlFor="muteMinutes" className="text-xs">
                Default timeout
              </Label>
              <Input
                id="muteMinutes"
                type="number"
                min={1}
                max={1440}
                value={muteMinutes}
                onChange={(event) => {
                  setSaved(false);
                  setMuteMinutes(Number(event.target.value));
                }}
                className="mt-1 h-9"
              />
            </div>
          </div>

          <div className="mt-3 rounded-2xl bg-violet-500/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">
              Premium automation
            </p>
            <p className="mt-1 text-sm font-semibold">Raid mode + AI scan</p>
          </div>

          {saveMutation.isError ? (
            <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Could not save moderation config. Please try again.
            </p>
          ) : null}

          <Button
            type="button"
            className="mt-4 w-full sm:w-auto"
            disabled={!guildId || isLoading || saveMutation.isPending}
            onClick={saveDraft}
          >
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>

        <div className="dashboard-glass-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-kat">
                Custom rules
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight">Pattern rules</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Match words, domains, links, or combined conditions.
              </p>
            </div>
            <Button type="button" size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>

          <div className="mt-4 space-y-2">
            {CUSTOM_RULES.map((rule) => (
              <div
                key={rule.pattern}
                className="rounded-2xl bg-black/[0.025] p-3 dark:bg-white/[0.03]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <code className="rounded-md bg-background px-2 py-1 text-xs font-semibold">
                    {rule.pattern}
                  </code>
                  {rule.premium ? <PremiumBadge /> : <FreeBadge />}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{rule.action}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-glass-card p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-kat">
            Escalation
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight">Repeat offenders</h2>
          <div className="mt-4 grid gap-2">
            {[
              ["1st", "Delete + warn"],
              ["2nd", `Timeout ${muteMinutes}m`],
              ["3rd", "Timeout 1h + log"],
              ["Premium", "Case + staff alert"],
            ].map(([step, action]) => (
              <div
                key={step}
                className="flex items-center gap-3 rounded-xl bg-black/[0.025] p-2 dark:bg-white/[0.03]"
              >
                <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded-lg bg-kat/10 text-xs font-black text-kat">
                  {step}
                </div>
                <p className="text-sm text-muted-foreground">{action}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {rules.filter((rule) => !rule.premium).map((rule) => (
          <RuleTile
            key={rule.id}
            rule={rule}
            onOpen={(nextRule) => setSelectedRuleId(nextRule.id)}
            onToggle={(id, enabled) => updateRule(id, { enabled })}
          />
        ))}
      </section>

      <section className="relative">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-violet-500" />
          <h3 className="text-sm font-bold tracking-tight">Anti-Raid</h3>
          {!isPremium ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-300">
              <Crown className="h-3 w-3" />
              Premium
            </span>
          ) : null}
        </div>
        <div
          className={cn(
            "grid gap-3 md:grid-cols-2 xl:grid-cols-4",
            !isPremium && "pointer-events-none opacity-50",
          )}
        >
          {rules.filter((rule) => rule.premium).map((rule) => (
            <RuleTile
              key={rule.id}
              rule={rule}
              onOpen={(nextRule) => setSelectedRuleId(nextRule.id)}
              onToggle={(id, enabled) => updateRule(id, { enabled })}
            />
          ))}
        </div>
      </section>

      {/* Command Permissions + Purge Command */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className={cn("dashboard-glass-card p-5 sm:p-6", !isPremium && "relative")}>
          <div className="flex items-start gap-3">
            {!isPremium ? (
              <span className="pointer-events-none absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-300">
                <Crown className="h-3 w-3" />
                Premium
              </span>
            ) : null}
            <Users className="mt-0.5 h-5 w-5 shrink-0 text-kat" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold tracking-tight">Command Permissions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Allow specific roles to use moderation commands without Discord permissions
              </p>
            </div>
          </div>

          {permissionsLoading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-white/[0.05]" />
              ))}
            </div>
          ) : (
            <div className={cn("mt-4 space-y-4", !isPremium && "pointer-events-none opacity-50")}>
              <div className="grid grid-cols-2 gap-2">
                {(["xkick", "xban", "xmute", "xwarn", "xhistory"] as const).map(
                  (cmd) => (
                    <div
                      key={cmd}
                      className="rounded-xl bg-black/[0.025] p-2 dark:bg-white/[0.03]"
                    >
                      <p className="mb-1.5 text-xs font-semibold text-kat">{cmd}</p>
                      <CommandRoleSelect
                        roles={guildRoles}
                        selectedIds={(permissions ?? emptyPermissions)[cmd]}
                        isLoading={rolesLoading}
                        onChange={(ids) =>
                          setPermissions((prev) =>
                            prev
                              ? { ...prev, [cmd]: ids }
                              : { ...emptyPermissions, [cmd]: ids },
                          )
                        }
                      />
                    </div>
                  ),
                )}

                <div className="rounded-xl bg-black/[0.025] p-2 dark:bg-white/[0.03]">
                  <p className="mb-1.5 text-xs font-semibold text-kat">xnuke</p>
                  <div className="grid grid-cols-2 gap-3">
                    <SingleRoleSelect
                      roles={guildRoles}
                      selectedId={(nukeConfig ?? defaultNukeConfig).allowedRoleId}
                      isLoading={rolesLoading}
                      onChange={(id) =>
                        setNukeConfig((prev) =>
                          prev
                            ? { ...prev, allowedRoleId: id }
                            : { ...defaultNukeConfig, allowedRoleId: id },
                        )
                      }
                    />
                    <UserTagInput
                      guildId={guildId ?? ""}
                      userIds={(nukeConfig ?? defaultNukeConfig).allowedUserIds}
                      onChange={(ids) =>
                        setNukeConfig((prev) =>
                          prev
                            ? { ...prev, allowedUserIds: ids }
                            : { ...defaultNukeConfig, allowedUserIds: ids },
                        )
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={savePermissions.isPending || saveNuke.isPending || !permissions || !isPremium}
                  onClick={() => {
                    if (!permissions) return;
                    savePermissions.mutate(permissions, {
                      onSuccess: () => {
                        if (nukeConfig) {
                          saveNuke.mutate(nukeConfig);
                        }
                      },
                    });
                  }}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {savePermissions.isPending || saveNuke.isPending ? "Saving..." : "Save"}
                </Button>
                {savePermissions.isError || saveNuke.isError ? (
                  <p className="text-sm text-destructive">
                    Could not save. Please try again.
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-glass-card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <ToggleLeft className="mt-0.5 h-5 w-5 shrink-0 text-kat" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold tracking-tight">Purge Command (purgeenme)</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Let a specific role delete their own recent messages by typing purgeenme
              </p>
            </div>
          </div>

          {purgeLoading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-white/[0.05]" />
              ))}
            </div>
          ) : (
            <div className="mt-4 space-y-5">
              <div className="flex items-center justify-between rounded-2xl bg-black/[0.025] p-3 dark:bg-white/[0.03]">
                <div>
                  <p className="text-sm font-semibold">Enable Purge Command</p>
                  <p className="text-xs text-muted-foreground">
                    Allow members with the selected role to use purgeenme
                  </p>
                </div>
                <Switch
                  checked={(purgeConfig ?? defaultPurgeConfig).enabled}
                  onCheckedChange={(enabled) =>
                    setPurgeConfig((prev) =>
                      prev ? { ...prev, enabled } : { ...defaultPurgeConfig, enabled },
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowed-role">Allowed Role</Label>
                <select
                  id="allowed-role"
                  value={(purgeConfig ?? defaultPurgeConfig).allowedRoleId ?? ""}
                  onChange={(e) =>
                    setPurgeConfig((prev) =>
                      prev
                        ? { ...prev, allowedRoleId: e.target.value || null }
                        : { ...defaultPurgeConfig, allowedRoleId: e.target.value || null },
                    )
                  }
                  className="flex h-10 w-full rounded-xl border border-black/[0.08] bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
                >
                  <option value="">No role</option>
                  {guildRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="max-messages">Max Messages</Label>
                  <input
                    id="max-messages"
                    type="number"
                    min={1}
                    max={40}
                    value={(purgeConfig ?? defaultPurgeConfig).maxMessages}
                    onChange={(e) =>
                      setPurgeConfig((prev) =>
                        prev
                          ? {
                              ...prev,
                              maxMessages: Math.min(40, Math.max(1, Number(e.target.value))),
                            }
                          : {
                              ...defaultPurgeConfig,
                              maxMessages: Math.min(40, Math.max(1, Number(e.target.value))),
                            },
                      )
                    }
                    className="flex h-10 w-full rounded-xl border border-black/[0.08] bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
                  />
                  <p className="text-xs text-muted-foreground">Between 1 and 40</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-age">Max Age (seconds)</Label>
                  <input
                    id="max-age"
                    type="number"
                    min={10}
                    max={86400}
                    value={(purgeConfig ?? defaultPurgeConfig).maxAgeSeconds}
                    onChange={(e) =>
                      setPurgeConfig((prev) =>
                        prev
                          ? {
                              ...prev,
                              maxAgeSeconds: Math.min(
                                86400,
                                Math.max(10, Number(e.target.value)),
                              ),
                            }
                          : {
                              ...defaultPurgeConfig,
                              maxAgeSeconds: Math.min(
                                86400,
                                Math.max(10, Number(e.target.value)),
                              ),
                            },
                      )
                    }
                    className="flex h-10 w-full rounded-xl border border-black/[0.08] bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
                  />
                  <p className="text-xs text-muted-foreground">Between 10 and 86400</p>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                disabled={savePurge.isPending || !purgeConfig}
                onClick={() => {
                  if (!purgeConfig) return;
                  savePurge.mutate(purgeConfig);
                }}
              >
                <Save className="mr-2 h-4 w-4" />
                {savePurge.isPending ? "Saving..." : "Save"}
              </Button>
              {savePurge.isError ? (
                <p className="mt-2 text-sm text-destructive">
                  Could not save purge config. Please try again.
                </p>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <RuleDialog
        rule={selectedRule}
        open={selectedRuleId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedRuleId(null);
        }}
        onUpdate={updateRule}
      />
    </div>
  );
}

export const ModerationSection = memo(ModerationSectionComponent);
