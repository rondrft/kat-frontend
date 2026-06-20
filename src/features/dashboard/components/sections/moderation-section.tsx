"use client";

import Image from "next/image";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  Crown,
  Eye,
  FileWarning,
  Link2,
  LockKeyhole,
  MessageSquareWarning,
  Plus,
  Save,
  TimerReset,
  Trash2,
  ChevronDown,
  ToggleLeft,
  Users,
  Shield,
  X,
  UserCheck,
  ListFilter,
  Repeat,
  TextQuote,
  TextSelect,
  EyeOff,
  AtSign,
  Bold,
  Smile,
  Search,
  VolumeX,
  AlertCircle,
  ScrollText,
  Megaphone,
  UserPlus,
  Image as ImageIcon,
  Copy,
  CalendarClock,
  DoorOpen,
  Layout,
  ShieldAlert,
  UserMinus,
  Scan,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";

const SecurityScanner = dynamic(
  () => import("@/features/moderation/components/security-scanner").then((m) => ({ default: m.SecurityScanner })),
  { ssr: false },
);
import { useTranslation } from "@/lib/i18n/useTranslation";
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
import { cn } from "@/lib/utils";
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
import {
  useWhitelist,
  useAddWhitelist,
  useRemoveWhitelist,
} from "@/features/moderation/hooks/use-whitelist";
import {
  useFilters,
  useAddFilter,
  useDeleteFilter,
} from "@/features/moderation/hooks/use-filters";
import {
  useAutoPunishments,
  useSaveAutoPunishments,
} from "@/features/moderation/hooks/use-auto-punishments";
import {
  useLogChannel,
  useSaveLogChannel,
} from "@/features/moderation/hooks/use-log-channel";
import type {
  ModerationAction,
  ModerationConfig,
  ModerationRuleConfig,
  ModerationRuleType,
  ModPermissions,
  PurgeConfig,
  NukeConfig,
  ModerationAutoPunishment,
} from "@/types/moderation";
import { RULE_PREMIUM } from "@/types/moderation";
import { getDiscordAvatarUrl } from "@/utils/discord";

type ModerationMode =
  | "monitor"
  | "delete"
  | "timeout"
  | "deleteAndTimeout"
  | "lockdown"
  | "kick"
  | "ban";

type RuleId =
  | "spam" | "links" | "invites" | "mentions" | "caps"
  | "repetition" | "wallOfText" | "newlines" | "spoilers"
  | "everyoneHere" | "formatting" | "emojis" | "badWords" | "phishing"
  | "massMention" | "imageSpam" | "copyPasta" | "accountAge"
  | "joinRaid" | "channelRaid" | "roleRaid";

const RULE_DEFINITIONS: {
  id: RuleId;
  title: string;
  description: string;
  icon: typeof Shield;
  apiType: ModerationRuleType;
}[] = [
  { id: "spam", title: "Spam", description: "Repeated messages, emoji flooding, and fast sends.", icon: MessageSquareWarning, apiType: "SPAM" },
  { id: "links", title: "Links", description: "Suspicious URLs, phishing domains, and link flooding.", icon: Link2, apiType: "LINKS" },
  { id: "invites", title: "Invites", description: "Discord invite links outside allowed channels.", icon: Ban, apiType: "INVITES" },
  { id: "mentions", title: "Mentions", description: "Role/@everyone abuse and large mention bursts.", icon: AtSign, apiType: "MENTIONS" },
  { id: "caps", title: "Caps", description: "All-caps messages and visual noise.", icon: FileWarning, apiType: "CAPS" },
  { id: "repetition", title: "Repetition", description: "Repeated characters, words, or spammy patterns.", icon: Repeat, apiType: "REPETITION" },
  { id: "wallOfText", title: "Wall of Text", description: "Massive unbroken text blocks with no line breaks.", icon: TextQuote, apiType: "WALL_OF_TEXT" },
  { id: "newlines", title: "Newlines", description: "Excessive line breaks that disrupt chat.", icon: TextSelect, apiType: "NEWLINES" },
  { id: "spoilers", title: "Spoilers", description: "Excessive spoiler-tagged content.", icon: EyeOff, apiType: "SPOILERS" },
  { id: "everyoneHere", title: "@everyone/@here", description: "Mass-ping abuse and mention spam.", icon: Megaphone, apiType: "EVERYONE_HERE" },
  { id: "formatting", title: "Formatting", description: "Excessive markdown, bold, italic, code blocks.", icon: Bold, apiType: "FORMATTING" },
  { id: "emojis", title: "Emojis", description: "Emoji spam and reaction baiting.", icon: Smile, apiType: "EMOJIS" },
  { id: "badWords", title: "Bad Words", description: "Custom profanity and blacklisted terms.", icon: VolumeX, apiType: "BAD_WORDS" },
  { id: "phishing", title: "Phishing", description: "Known phishing domains and scam links.", icon: Search, apiType: "PHISHING" },
  { id: "massMention", title: "Mass Mention", description: "Messages that ping many distinct users at once.", icon: UserPlus, apiType: "MASS_MENTION" },
  { id: "imageSpam", title: "Image Spam", description: "Excessive image and file attachments in messages.", icon: ImageIcon, apiType: "IMAGE_SPAM" },
  { id: "copyPasta", title: "Copy-Pasta", description: "Same message pasted across multiple channels.", icon: Copy, apiType: "COPY_PASTA" },
  { id: "accountAge", title: "Account Age", description: "Blocks messages from accounts younger than X days.", icon: CalendarClock, apiType: "ACCOUNT_AGE" },
  { id: "joinRaid", title: "Join Raid", description: "Detects rapid member joins and auto-actions raiders.", icon: DoorOpen, apiType: "JOIN_RAID" },
  { id: "channelRaid", title: "Channel Raid", description: "Detects mass channel creation or deletion.", icon: Layout, apiType: "CHANNEL_RAID" },
  { id: "roleRaid", title: "Role Raid", description: "Detects mass role creation or deletion.", icon: ShieldAlert, apiType: "ROLE_RAID" },
];

const ACTIONS: {
  id: ModerationMode;
  label: string;
  description: string;
  icon: typeof Eye;
}[] = [
  { id: "monitor", label: "Monitor", description: "Log only", icon: Eye },
  { id: "delete", label: "Delete", description: "Remove message", icon: Trash2 },
  { id: "timeout", label: "Timeout", description: "Mute user", icon: TimerReset },
  { id: "deleteAndTimeout", label: "Delete & Timeout", description: "Remove + mute", icon: TimerReset },
  { id: "lockdown", label: "Lockdown", description: "Freeze channels", icon: LockKeyhole },
  { id: "kick", label: "Kick", description: "Remove member", icon: UserMinus },
  { id: "ban", label: "Ban", description: "Ban member", icon: Ban },
];

function defaultMode(apiType: ModerationRuleType): ModerationMode {
  if (apiType === "CAPS") return "monitor";
  if (apiType === "MENTIONS" || apiType === "EVERYONE_HERE") return "timeout";
  if (apiType === "ACCOUNT_AGE") return "timeout";
  if (apiType === "MASS_MENTION") return "timeout";
  if (apiType === "JOIN_RAID") return "kick";
  if (apiType === "CHANNEL_RAID" || apiType === "ROLE_RAID") return "monitor";
  return "delete";
}

function defaultThreshold(apiType: ModerationRuleType): number {
  if (apiType === "SPAM") return 6;
  if (apiType === "CAPS") return 80;
  if (apiType === "WALL_OF_TEXT") return 500;
  if (apiType === "ACCOUNT_AGE") return 7;
  if (apiType === "MASS_MENTION") return 5;
  if (apiType === "IMAGE_SPAM") return 3;
  if (apiType === "JOIN_RAID") return 10;
  if (apiType === "CHANNEL_RAID" || apiType === "ROLE_RAID") return 5;
  return 3;
}

const INITIAL_RULES: ModerationRule[] = RULE_DEFINITIONS.map((def) => ({
  ...def,
  enabled: false,
  mode: defaultMode(def.apiType),
  threshold: defaultThreshold(def.apiType),
  timeoutMinutes: null,
}));

const BACKEND_RULE_IDS: Partial<Record<RuleId, ModerationRuleType>> = {
  spam: "SPAM", links: "LINKS", invites: "INVITES", mentions: "MENTIONS", caps: "CAPS",
  repetition: "REPETITION", wallOfText: "WALL_OF_TEXT", newlines: "NEWLINES", spoilers: "SPOILERS",
  everyoneHere: "EVERYONE_HERE", formatting: "FORMATTING", emojis: "EMOJIS", badWords: "BAD_WORDS", phishing: "PHISHING",
  massMention: "MASS_MENTION", imageSpam: "IMAGE_SPAM", copyPasta: "COPY_PASTA", accountAge: "ACCOUNT_AGE",
  joinRaid: "JOIN_RAID", channelRaid: "CHANNEL_RAID", roleRaid: "ROLE_RAID",
};

type ModerationRule = {
  id: RuleId;
  title: string;
  description: string;
  icon: typeof Shield;
  apiType: ModerationRuleType;
  enabled: boolean;
  mode: ModerationMode;
  threshold: number;
  timeoutMinutes: number | null;
};

function toUiAction(action: ModerationAction): ModerationMode {
  if (action === "DELETE_AND_TIMEOUT") return "deleteAndTimeout";
  const lower = action.toLowerCase();
  if (lower === "warn") return "delete";
  return lower as ModerationMode;
}

function toApiAction(mode: ModerationMode): ModerationAction {
  if (mode === "deleteAndTimeout") return "DELETE_AND_TIMEOUT";
  if (mode === "lockdown") return "TIMEOUT";
  if (mode === "delete") return "DELETE";
  if (mode === "kick") return "KICK";
  if (mode === "ban") return "BAN";
  return mode.toUpperCase() as ModerationAction;
}

function usesTimeout(mode: ModerationMode) {
  return mode === "timeout" || mode === "deleteAndTimeout";
}

function getActionLabel(mode: ModerationMode, t: ReturnType<typeof useTranslation>) {
  return t.moderation.actions[mode]?.label ?? mode;
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
  const t = useTranslation();
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-500">
      <Crown className="h-3 w-3" />
      {t.moderation.badges.premium}
    </span>
  );
}

function FreeBadge() {
  const t = useTranslation();
  return (
    <span className="rounded-full bg-kat/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-kat">
      {t.moderation.badges.free}
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
  const t = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {ACTIONS.map(({ id, icon: Icon }) => (
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
            {t.moderation.actions[id].label}
          </span>
          <span className="text-[11px]">{t.moderation.actions[id].description}</span>
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
  const t = useTranslation();
  const Icon = rule.icon;
  const premium = RULE_PREMIUM[rule.apiType];

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
              <h3 className="truncate text-sm font-bold">{t.moderation.rules[rule.id].title}</h3>
              {premium ? <PremiumBadge /> : <FreeBadge />}
            </div>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {t.moderation.rules[rule.id].description}
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
          {getActionLabel(rule.mode, t)}
        </span>
        <span className={rule.enabled ? "text-emerald-500" : "text-muted-foreground"}>
          {rule.enabled ? t.moderation.ruleTile.active : t.moderation.ruleTile.paused}
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
  const t = useTranslation();
  if (!rule) return null;
  const Icon = rule.icon;
  const premium = RULE_PREMIUM[rule.apiType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-kat/10 text-kat">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{t.moderation.rules[rule.id].title}</DialogTitle>
              <DialogDescription>{t.moderation.rules[rule.id].description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-2xl bg-black/[0.025] p-3 dark:bg-white/[0.03]">
            <div>
              <p className="text-sm font-semibold">{t.moderation.ruleDialog.enabled}</p>
              <p className="text-xs text-muted-foreground">
                {t.moderation.ruleDialog.enabledDescription}
              </p>
            </div>
            <Switch
              checked={rule.enabled}
              onCheckedChange={(enabled) => onUpdate(rule.id, { enabled })}
            />
          </div>
          <div className="space-y-2">
            <Label>{t.moderation.ruleDialog.action}</Label>
            <ActionSelector
              value={rule.mode}
              onChange={(mode) => onUpdate(rule.id, { mode })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_128px]">
            <div className="space-y-2">
              <Label htmlFor={`${rule.id}-threshold`}>{t.moderation.ruleDialog.threshold}</Label>
              <input
                id={`${rule.id}-threshold`}
                type="range"
                min={1}
                max={rule.apiType === "CAPS" || rule.apiType === "WALL_OF_TEXT" ? 1000 : 100}
                value={rule.threshold}
                onChange={(event) =>
                  onUpdate(rule.id, { threshold: Number(event.target.value) })
                }
                className="w-full accent-[hsl(var(--kat))]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${rule.id}-threshold-number`}>{t.moderation.ruleDialog.value}</Label>
              <Input
                id={`${rule.id}-threshold-number`}
                type="number"
                min={1}
                max={rule.apiType === "CAPS" || rule.apiType === "WALL_OF_TEXT" ? 1000 : 100}
                value={rule.threshold}
                onChange={(event) =>
                  onUpdate(rule.id, { threshold: Number(event.target.value) })
                }
              />
            </div>
          </div>
          {usesTimeout(rule.mode) ? (
            <div className="space-y-2">
              <Label htmlFor={`${rule.id}-timeout`}>{t.moderation.ruleDialog.timeoutMinutes}</Label>
              <Input
                id={`${rule.id}-timeout`}
                type="number"
                min={1}
                max={1440}
                placeholder={t.moderation.ruleDialog.timeoutPlaceholder}
                value={rule.timeoutMinutes ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  onUpdate(rule.id, {
                    timeoutMinutes: value === "" ? null : Number(value),
                  });
                }}
              />
              <p className="text-xs text-muted-foreground">
                {t.moderation.ruleDialog.timeoutDescription}
              </p>
            </div>
          ) : null}
          {premium ? (
            <div className="rounded-2xl border border-violet-500/15 bg-violet-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-violet-500">
                <Crown className="h-4 w-4" />
                {t.moderation.ruleDialog.premiumRule}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {t.moderation.ruleDialog.premiumDescription}
              </p>
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            {t.moderation.ruleDialog.done}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const emptyPermissions: ModPermissions = {
  xkick: [], xban: [], xsoftban: [], xtempban: [], xunban: [],
  xmute: [], xunmute: [], xwarn: [], xhistory: [], xwarnings: [],
  xclearwarns: [], xnuke: [], xslowmode: [], xlock: [], xunlock: [],
  xfilter: [], xwhitelist: [], xmodconfig: [],
};

const defaultPurgeConfig: PurgeConfig = {
  enabled: false,
  allowedRoleId: null,
  maxMessages: 20,
  maxAgeSeconds: 300,
  purgeUserEnabled: false,
  purgeUserAllowedRoleId: null,
  purgeUserAllowedUserId: null,
  purgeUserMaxMessages: 20,
  purgeUserMaxAgeSeconds: 300,
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
          <span className="text-xs text-muted-foreground">{t.moderation.selects.loadingRoles}</span>
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
          <span className="text-xs text-muted-foreground">{t.moderation.selects.selectRoles}</span>
        )}
        <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 max-h-60 w-72 overflow-y-auto rounded-xl border border-black/[0.08] bg-background p-1 shadow-lg dark:border-white/10">
          {roles.length === 0 ? (
            <p className="px-2 py-3 text-xs text-muted-foreground">
              {isLoading ? t.moderation.selects.loadingRoles : t.moderation.selects.noRolesAvailable}
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

  const selectedRole = roles.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-10 w-full items-center gap-1.5 rounded-xl border border-black/[0.08] bg-background px-3 py-1.5 text-left text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat focus-visible:ring-offset-2 dark:border-white/10"
      >
        {isLoading ? (
          <span className="text-xs text-muted-foreground">{t.moderation.selects.loadingRoles}</span>
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
          <span className="text-xs text-muted-foreground">{t.moderation.selects.selectRole}</span>
        )}
        <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 max-h-60 w-72 overflow-y-auto rounded-xl border border-black/[0.08] bg-background p-1 shadow-lg dark:border-white/10">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
            <input
              type="radio"
              name="single-role"
              className="accent-[hsl(var(--kat-brand))]"
              checked={selectedId === null}
              onChange={() => onChange(null)}
            />
            <span className="text-muted-foreground">{t.moderation.purgeCommand.noRole}</span>
          </label>
          {roles.length === 0 ? (
            <p className="px-2 py-3 text-xs text-muted-foreground">
              {isLoading ? t.moderation.selects.loadingRoles : t.moderation.selects.noRolesAvailable}
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
                    name="single-role"
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
  const t = useTranslation();
  const queryClient = useQueryClient();
  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState<MemberTag[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  const addUser = (userId: string) => {
    const trimmed = userId.trim();
    if (!trimmed) return;
    if (userIds.includes(trimmed)) {
      setError(t.moderation.selects.userAlreadyAdded);
      return;
    }
    setError(null);

    const member = queryClient
      .getQueriesData({ queryKey: ["guilds", guildId, "members"] })
      .flatMap(([, data]) => (Array.isArray(data) ? data : []))
      .find(
        (m: { id?: string; discordId?: string }) =>
          m?.id === trimmed || m?.discordId === trimmed,
      );

    if (member) {
      const tag: MemberTag = {
        id: member.id,
        username: member.username ?? t.moderation.whitelist.unknown,
        avatar: typeof member.avatar === "string" ? member.avatar : null,
      };
      setTags((prev) => [...prev, tag]);
      onChange([...userIds, member.id]);
    } else {
      const tag: MemberTag = {
        id: trimmed,
        username: trimmed,
        avatar: null,
      };
      setTags((prev) => [...prev, tag]);
      onChange([...userIds, trimmed]);
    }
    setInputValue("");
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
          placeholder={t.moderation.selects.enterUserId}
          className="flex h-10 w-full rounded-xl border border-black/[0.08] bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
        />
      </div>
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

function ChannelSelect({
  guildId,
  value,
  onChange,
}: {
  guildId: string;
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const t = useTranslation();
  const { data: channels = [], isLoading } = useQuery({
    queryKey: ["guilds", guildId, "channels", "text"],
    queryFn: () => guildService.getGuildTextChannels(guildId),
    enabled: Boolean(guildId),
    staleTime: 60 * 1000,
  });

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="flex h-10 w-full rounded-xl border border-black/[0.08] bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
    >
      <option value="">{t.moderation.selects.notConfigured}</option>
      {isLoading ? (
        <option disabled>{t.moderation.selects.loadingChannels}</option>
      ) : (
        channels.map((ch: { id: string; name: string }) => (
          <option key={ch.id} value={ch.id}>
            #{ch.name}
          </option>
        ))
      )}
    </select>
  );
}

function AddWhitelistDialog({
  open,
  onOpenChange,
  guildId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string;
}) {
  const t = useTranslation();
  const addMutation = useAddWhitelist(guildId);
  const [channelId, setChannelId] = useState("");
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");

  const handleSave = useCallback(() => {
    if (!channelId && !userId) return;
    addMutation.mutate(
      { channelId: channelId || null, userId: userId || null, reason: reason || undefined, ruleType: null },
      { onSuccess: () => { onOpenChange(false); setChannelId(""); setUserId(""); setReason(""); } },
    );
  }, [channelId, userId, reason, addMutation, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.moderation.addWhitelistDialog.title}</DialogTitle>
          <DialogDescription>{t.moderation.addWhitelistDialog.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t.moderation.addWhitelistDialog.channel}</Label>
            <select
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-black/[0.08] bg-background px-3 py-2 text-sm dark:border-white/10"
            >
              <option value="">{t.moderation.addWhitelistDialog.anyChannel}</option>
              {/* channels are resolved server-side */}
            </select>
          </div>
          <div className="space-y-2">
            <Label>{t.moderation.addWhitelistDialog.userId}</Label>
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={t.moderation.addWhitelistDialog.userIdPlaceholder}
            />
          </div>
          <div className="space-y-2">
            <Label>{t.moderation.addWhitelistDialog.reason}</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t.moderation.addWhitelistDialog.reasonPlaceholder}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave} disabled={addMutation.isPending}>
            {addMutation.isPending ? t.moderation.addWhitelistDialog.adding : t.moderation.addWhitelistDialog.add}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ModerationSectionProps = {
  guildId?: string;
};

function ModerationSectionComponent({ guildId: guildIdProp }: ModerationSectionProps) {
  const t = useTranslation();
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
  const [strictness, setStrictness] = useState(50);
  const [muteMinutes, setMuteMinutes] = useState(10);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"free" | "premium" | "security">("free");
  const [rulePage, setRulePage] = useState(0);
  const RULES_PER_PAGE = 9;

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
  } = useNukeConfig(guildId);
  const saveNuke = useSaveNukeConfig(guildId);
  const [nukeConfig, setNukeConfig] = useState<NukeConfig | null>(null);

  const {
    data: whitelistData,
    isLoading: whitelistLoading,
  } = useWhitelist(guildId);
  const removeWhitelistEntry = useRemoveWhitelist(guildId);
  const [whitelistOpen, setWhitelistOpen] = useState(false);

  const {
    data: filtersData,
    isLoading: filtersLoading,
  } = useFilters(guildId);
  const addFilterMut = useAddFilter(guildId);
  const deleteFilterMut = useDeleteFilter(guildId);
  const [newFilterPattern, setNewFilterPattern] = useState("");

  const {
    data: autoPunishData,
    isLoading: autoPunishLoading,
  } = useAutoPunishments(guildId);
  const _saveAutoPunish = useSaveAutoPunishments(guildId);
  const [autoPunishments, setAutoPunishments] = useState<ModerationAutoPunishment[] | null>(null);

  const {
    data: logChannelData,
    isLoading: logChannelLoading,
  } = useLogChannel(guildId);
  const saveLogChannelMut = useSaveLogChannel(guildId);
  const [logChannelId, setLogChannelId] = useState<string | null>(null);
  const [premiumLogChannelId, setPremiumLogChannelId] = useState<string | null>(null);

  const premiumQuery = usePremiumStatus(guildId);
  const isPremium = premiumQuery.data?.isPremium ?? false;

  const { data: guildRoles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["guilds", guildId, "roles"],
    queryFn: () => guildService.getGuildRoles(guildId!),
    enabled: Boolean(guildId),
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (!moderationConfig) return;
    setStrictness(moderationConfig.strictness);
    setMuteMinutes(moderationConfig.defaultTimeoutMinutes);
    setRules((current) => applyModerationConfigToRules(current, moderationConfig));
    setSaved(true);
  }, [moderationConfig]);

  useEffect(() => {
    if (permissionsData) setPermissions(permissionsData);
  }, [permissionsData]);

  useEffect(() => {
    if (purgeData) setPurgeConfig(purgeData);
  }, [purgeData]);

  useEffect(() => {
    if (nukeData) setNukeConfig(nukeData);
  }, [nukeData]);

  useEffect(() => {
    if (autoPunishData) setAutoPunishments(autoPunishData);
  }, [autoPunishData]);

  useEffect(() => {
    if (logChannelData) {
      setLogChannelId(logChannelData.logChannelId ?? null);
      setPremiumLogChannelId(logChannelData.premiumLogChannelId ?? null);
    }
  }, [logChannelData]);

  const selectedRule = rules.find((rule) => rule.id === selectedRuleId) ?? null;

  const enabledCount = useMemo(
    () => rules.filter((rule) => rule.enabled).length,
    [rules],
  );
  const premiumCount = useMemo(
    () => rules.filter((rule) => RULE_PREMIUM[rule.apiType]).length,
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
      enabled: rules.some((rule) => rule.enabled),
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
      onError: () => setSaved(false),
    });
  };

  const freeRules = rules.filter((r) => !RULE_PREMIUM[r.apiType]);
  const premiumRules = rules.filter((r) => RULE_PREMIUM[r.apiType]);
  const currentRules = tab === "free" ? freeRules : premiumRules;
  const totalPages = Math.max(1, Math.ceil(currentRules.length / RULES_PER_PAGE));
  const safePage = Math.min(rulePage, totalPages - 1);
  const paginatedRules = currentRules.slice(safePage * RULES_PER_PAGE, (safePage + 1) * RULES_PER_PAGE);

  const addFilter = useCallback(() => {
    if (!guildId || !newFilterPattern.trim()) return;
    addFilterMut.mutate(
      { pattern: newFilterPattern.trim(), enabled: true },
      { onSuccess: () => setNewFilterPattern("") },
    );
  }, [guildId, newFilterPattern, addFilterMut]);

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {tab !== "security" ? (
          <motion.section
            key="header-cards"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="grid gap-4 overflow-hidden xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.85fr)_minmax(260px,0.65fr)]"
          >
            <div className="dashboard-glass-card p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-kat">
                    {t.moderation.header.sectionLabel}
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight">
                    {t.moderation.header.heading}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {t.moderation.header.description}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-kat/10 text-kat shadow-none">
                    {t.moderation.header.enabledCount.replace("{enabledCount}", String(enabledCount))}
                  </Badge>
                  <Badge className="bg-violet-500/10 text-violet-500 shadow-none">
                    {t.moderation.header.premiumCount.replace("{premiumCount}", String(premiumCount))}
                  </Badge>
                  {isLoading ? (
                    <Badge className="bg-slate-500/10 text-slate-500 shadow-none">{t.moderation.header.loading}</Badge>
                  ) : null}
                  {saved && !saveMutation.isPending ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 shadow-none dark:text-emerald-400">
                      {t.moderation.header.saved}
                    </Badge>
                  ) : null}
                  {isError ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                      {t.moderation.header.retry}
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-black/[0.025] p-3 dark:bg-white/[0.03]">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t.moderation.header.strictness}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      aria-label={t.moderation.header.strictness}
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
                  <Label htmlFor="muteMinutes" className="text-xs">{t.moderation.header.defaultTimeout}</Label>
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
              {saveMutation.isError ? (
                <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {t.moderation.header.saveError}
                </p>
              ) : null}
              <Button
                type="button"
                className="mt-4 w-full sm:w-auto"
                disabled={!guildId || isLoading || saveMutation.isPending}
                onClick={saveDraft}
              >
                <Save className="mr-2 h-4 w-4" />
                {saveMutation.isPending ? t.moderation.header.saving : t.moderation.header.saveChanges}
              </Button>
            </div>

            <div className="dashboard-glass-card p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <ScrollText className="mt-0.5 h-5 w-5 shrink-0 text-kat" />
                <div>
                  <h2 className="text-lg font-bold tracking-tight">{t.moderation.logChannels.heading}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.moderation.logChannels.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">{t.moderation.logChannels.standard}</Label>
                  <ChannelSelect
                    guildId={guildId ?? ""}
                    value={logChannelId}
                    onChange={(id) => setLogChannelId(id)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">{t.moderation.logChannels.premium}</Label>
                    {!isPremium ? <PremiumBadge /> : null}
                  </div>
                  <ChannelSelect
                    guildId={guildId ?? ""}
                    value={premiumLogChannelId}
                    onChange={(id) => setPremiumLogChannelId(id)}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={saveLogChannelMut.isPending || logChannelLoading}
                  onClick={() => {
                    saveLogChannelMut.mutate({
                      logChannelId,
                      premiumLogChannelId,
                    });
                  }}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saveLogChannelMut.isPending ? t.moderation.header.saving : t.moderation.logChannels.save}
                </Button>
              </div>
            </div>

            <div className="dashboard-glass-card p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-kat">
                {t.moderation.escalation.sectionLabel}
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight">{t.moderation.escalation.heading}</h2>
              <div className="mt-4 grid gap-2">
                {[
                  { step: t.moderation.escalation.first.label, action: t.moderation.escalation.first.action },
                  { step: t.moderation.escalation.second.label, action: t.moderation.escalation.second.action.replace("{muteMinutes}", String(muteMinutes)) },
                  { step: t.moderation.escalation.third.label, action: t.moderation.escalation.third.action },
                  { step: t.moderation.escalation.fourthPlus.label, action: t.moderation.escalation.fourthPlus.action },
                ].map(({ step, action }) => (
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
          </motion.section>
        ) : null}
      </AnimatePresence>

      {/* Tab Bar: Free / Premium / Security */}
      <div className="flex gap-1 rounded-2xl bg-black/[0.03] p-1 dark:bg-white/[0.05]">
        <button
          type="button"
          onClick={() => setTab("free")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
            tab === "free"
              ? "bg-background text-kat shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Shield className="h-4 w-4" />
          {t.moderation.tabs.free}
          <span className="ml-1 rounded-full bg-kat/10 px-1.5 py-0.5 text-[10px] font-bold text-kat">
            {freeRules.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab("premium")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
            tab === "premium"
              ? "bg-background text-violet-500 shadow-sm"
              : "text-muted-foreground hover:text-violet-400",
          )}
        >
          <Crown className="h-4 w-4" />
          {t.moderation.tabs.premium}
          {!isPremium && tab !== "premium" ? (
            <Crown className="h-3.5 w-3.5 text-amber-500" />
          ) : null}
          <span className="ml-1 rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-bold text-violet-500">
            {premiumRules.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab("security")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
            tab === "security"
              ? "bg-background text-rose-500 shadow-sm"
              : "text-muted-foreground hover:text-rose-400",
          )}
        >
          <Scan className="h-4 w-4" />
          {t.moderation.tabs.securityScan}
        </button>
      </div>

      {tab !== "security" ? (
        <section className="grid gap-4 lg:grid-cols-[1fr_minmax(340px,420px)]">
          <div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedRules.map((rule) => (
                <RuleTile
                  key={rule.id}
                  rule={rule}
                  onOpen={(nextRule) => setSelectedRuleId(nextRule.id)}
                  onToggle={(id, enabled) => updateRule(id, { enabled })}
                />
              ))}
            </div>
            {totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={safePage === 0}
                  onClick={() => setRulePage((prev) => Math.max(0, prev - 1))}
                >
                  {t.moderation.pagination.previous}
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    type="button"
                    variant={safePage === i ? "default" : "outline"}
                    size="sm"
                    className="min-w-[36px]"
                    onClick={() => setRulePage(i)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setRulePage((prev) => Math.min(totalPages - 1, prev + 1))}
                >
                  {t.moderation.pagination.next}
                </Button>
              </div>
            ) : null}
          </div>
          <div className="space-y-4">
            <div className="dashboard-glass-card p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 shrink-0 text-kat" />
                  <h3 className="text-sm font-bold">{t.moderation.whitelist.heading}</h3>
                </div>
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => setWhitelistOpen(true)}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="mt-3 max-h-40 overflow-y-auto space-y-1.5">
                {whitelistLoading ? (
                  <p className="text-xs text-muted-foreground animate-pulse">{t.moderation.header.loading}</p>
                ) : !whitelistData || whitelistData.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t.moderation.whitelist.empty}</p>
                ) : (
                  whitelistData.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-lg bg-black/[0.025] px-2.5 py-1.5 dark:bg-white/[0.03]"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">
                          {entry.channelId ? `#${entry.channelId}` : entry.userId ? `User ${entry.userId.slice(0, 8)}…` : t.moderation.whitelist.unknown}
                        </p>
                        {entry.reason ? (
                          <p className="text-[10px] text-muted-foreground truncate">{entry.reason}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => { if (entry.id) removeWhitelistEntry.mutate(entry.id); }}
                        className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <AddWhitelistDialog
                open={whitelistOpen}
                onOpenChange={setWhitelistOpen}
                guildId={guildId ?? ""}
              />
            </div>

            <div className="dashboard-glass-card p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <ListFilter className="h-4 w-4 shrink-0 text-kat" />
                <h3 className="text-sm font-bold">{t.moderation.filters.heading}</h3>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex gap-1.5">
                  <Input
                    value={newFilterPattern}
                    onChange={(e) => setNewFilterPattern(e.target.value)}
                    placeholder={t.moderation.filters.placeholder}
                    className="h-8 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addFilter(); }
                    }}
                  />
                  <Button type="button" size="icon" className="h-8 w-8 shrink-0" onClick={addFilter} disabled={addFilterMut.isPending || !newFilterPattern.trim()}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {filtersLoading ? (
                    <p className="text-xs text-muted-foreground animate-pulse">{t.moderation.header.loading}</p>
                  ) : !filtersData || filtersData.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{t.moderation.filters.empty}</p>
                  ) : (
                    filtersData.map((filter) => (
                      <div
                        key={filter.id}
                        className="flex items-center justify-between rounded-lg bg-black/[0.025] px-2.5 py-1.5 dark:bg-white/[0.03]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <code className="truncate text-[11px] font-semibold">{filter.pattern}</code>
                          <span className={cn("text-[10px]", filter.enabled ? "text-emerald-500" : "text-muted-foreground")}>
                            {filter.enabled ? t.moderation.filters.on : t.moderation.filters.off}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { if (filter.id) deleteFilterMut.mutate(filter.id); }}
                          className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="dashboard-glass-card p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-kat" />
                <h3 className="text-sm font-bold">{t.moderation.autoPunishment.heading}</h3>
              </div>
              <div className="mt-3 max-h-40 overflow-y-auto space-y-1.5">
                {autoPunishLoading ? (
                  <p className="text-xs text-muted-foreground animate-pulse">{t.moderation.header.loading}</p>
                ) : !autoPunishments || autoPunishments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t.moderation.autoPunishment.empty}</p>
                ) : (
                  autoPunishments.map((ap, idx) => (
                    <div
                      key={ap.id ?? idx}
                      className="flex items-center gap-2 rounded-lg bg-black/[0.025] px-2.5 py-1.5 dark:bg-white/[0.03]"
                    >
                      <span className="text-[11px] font-bold text-kat shrink-0">{ap.ruleType}</span>
                      <span className="text-[11px] text-muted-foreground truncate">
                        {ap.threshold}x → {ap.action}
                        {ap.timeoutMinutes ? ` ${ap.timeoutMinutes}m` : ""}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      ) : guildId ? (
        <SecurityScanner guildId={guildId} />
      ) : null}

      {tab !== "security" ? (
        <section className="grid gap-4 md:grid-cols-2">
          <div className={cn("dashboard-glass-card p-5 sm:p-6", !isPremium && "relative")}>
            {!isPremium ? (
              <span className="pointer-events-none absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-300">
                <Crown className="h-3 w-3" />
                {t.moderation.badges.premium}
              </span>
            ) : null}
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-kat" />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold tracking-tight">{t.moderation.commandPermissions.heading}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t.moderation.commandPermissions.description}
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
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(emptyPermissions) as (keyof ModPermissions)[]).map((cmd) => (
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
                  ))}
                </div>
                <div className="rounded-xl bg-black/[0.025] p-2 dark:bg-white/[0.03]">
                  <p className="mb-1.5 text-xs font-semibold text-kat">{t.moderation.commandPermissions.xnukeAllowedUsers}</p>
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
                <div className="space-y-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={savePermissions.isPending || saveNuke.isPending || !permissions || !isPremium}
                    onClick={() => {
                      if (!permissions) return;
                      savePermissions.mutate(permissions, {
                        onSuccess: () => {
                          if (nukeConfig) saveNuke.mutate(nukeConfig);
                        },
                      });
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {savePermissions.isPending || saveNuke.isPending ? t.moderation.header.saving : t.moderation.logChannels.save}
                  </Button>
                  {savePermissions.isError || saveNuke.isError ? (
                    <p className="text-sm text-destructive">{t.moderation.commandPermissions.saveError}</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          <div className="dashboard-glass-card p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <ToggleLeft className="mt-0.5 h-5 w-5 shrink-0 text-kat" />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold tracking-tight">{t.moderation.purgeCommand.heading}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t.moderation.purgeCommand.description}
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
                    <p className="text-sm font-semibold">{t.moderation.purgeCommand.enable}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.moderation.purgeCommand.enableDescription}
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
                  <Label htmlFor="allowed-role">{t.moderation.purgeCommand.allowedRole}</Label>
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
                    <option value="">{t.moderation.purgeCommand.noRole}</option>
                    {guildRoles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="max-messages">{t.moderation.purgeCommand.maxMessages}</Label>
                    <Input
                      id="max-messages"
                      type="number"
                      min={1}
                      max={40}
                      value={(purgeConfig ?? defaultPurgeConfig).maxMessages}
                      onChange={(e) =>
                        setPurgeConfig((prev) =>
                          prev
                            ? { ...prev, maxMessages: Math.min(40, Math.max(1, Number(e.target.value))) }
                            : { ...defaultPurgeConfig, maxMessages: Math.min(40, Math.max(1, Number(e.target.value))) },
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">{t.moderation.purgeCommand.maxMessagesHint}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-age">{t.moderation.purgeCommand.maxAgeSeconds}</Label>
                    <Input
                      id="max-age"
                      type="number"
                      min={10}
                      max={86400}
                      value={(purgeConfig ?? defaultPurgeConfig).maxAgeSeconds}
                      onChange={(e) =>
                        setPurgeConfig((prev) =>
                          prev
                            ? { ...prev, maxAgeSeconds: Math.min(86400, Math.max(10, Number(e.target.value))) }
                            : { ...defaultPurgeConfig, maxAgeSeconds: Math.min(86400, Math.max(10, Number(e.target.value))) },
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">{t.moderation.purgeCommand.maxAgeSecondsHint}</p>
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
                  {savePurge.isPending ? t.moderation.header.saving : t.moderation.logChannels.save}
                </Button>
                {savePurge.isError ? (
                  <p className="mt-2 text-sm text-destructive">{t.moderation.purgeCommand.saveError}</p>
                ) : null}
              </div>
            )}

            <hr className="my-6 border-black/[0.08] dark:border-white/10" />

            <div>
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 shrink-0 text-kat" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold tracking-tight">{t.moderation.purgeCommand.xpurgeHeading}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.moderation.purgeCommand.xpurgeDescription}
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
                      <p className="text-sm font-semibold">{t.moderation.purgeCommand.xpurgeEnable}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.moderation.purgeCommand.xpurgeEnableDescription}
                      </p>
                    </div>
                    <Switch
                      checked={(purgeConfig ?? defaultPurgeConfig).purgeUserEnabled}
                      onCheckedChange={(enabled) =>
                        setPurgeConfig((prev) =>
                          prev ? { ...prev, purgeUserEnabled: enabled } : { ...defaultPurgeConfig, purgeUserEnabled: enabled },
                        )
                      }
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="xpurge-allowed-role">{t.moderation.purgeCommand.xpurgeAllowedRole}</Label>
                      <select
                        id="xpurge-allowed-role"
                        value={(purgeConfig ?? defaultPurgeConfig).purgeUserAllowedRoleId ?? ""}
                        onChange={(e) =>
                          setPurgeConfig((prev) =>
                            prev
                              ? { ...prev, purgeUserAllowedRoleId: e.target.value || null }
                              : { ...defaultPurgeConfig, purgeUserAllowedRoleId: e.target.value || null },
                          )
                        }
                        className="flex h-10 w-full rounded-xl border border-black/[0.08] bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
                      >
                        <option value="">{t.moderation.purgeCommand.xpurgeNoRole}</option>
                        {guildRoles.map((role) => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="xpurge-allowed-user">{t.moderation.purgeCommand.xpurgeAllowedUser}</Label>
                      <Input
                        id="xpurge-allowed-user"
                        type="text"
                        placeholder={t.moderation.purgeCommand.xpurgeAllowedUserPlaceholder}
                        value={(purgeConfig ?? defaultPurgeConfig).purgeUserAllowedUserId ?? ""}
                        onChange={(e) =>
                          setPurgeConfig((prev) =>
                            prev
                              ? { ...prev, purgeUserAllowedUserId: e.target.value || null }
                              : { ...defaultPurgeConfig, purgeUserAllowedUserId: e.target.value || null },
                          )
                        }
                      />
                      <p className="text-xs text-muted-foreground">{t.moderation.purgeCommand.xpurgeAllowedUserHint}</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="xpurge-max-messages">{t.moderation.purgeCommand.xpurgeMaxMessages}</Label>
                      <Input
                        id="xpurge-max-messages"
                        type="number"
                        min={1}
                        max={40}
                        value={(purgeConfig ?? defaultPurgeConfig).purgeUserMaxMessages}
                        onChange={(e) =>
                          setPurgeConfig((prev) =>
                            prev
                              ? { ...prev, purgeUserMaxMessages: Math.min(40, Math.max(1, Number(e.target.value))) }
                              : { ...defaultPurgeConfig, purgeUserMaxMessages: Math.min(40, Math.max(1, Number(e.target.value))) },
                          )
                        }
                      />
                      <p className="text-xs text-muted-foreground">{t.moderation.purgeCommand.xpurgeMaxMessagesHint}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="xpurge-max-age">{t.moderation.purgeCommand.xpurgeMaxAgeSeconds}</Label>
                      <Input
                        id="xpurge-max-age"
                        type="number"
                        min={10}
                        max={86400}
                        value={(purgeConfig ?? defaultPurgeConfig).purgeUserMaxAgeSeconds}
                        onChange={(e) =>
                          setPurgeConfig((prev) =>
                            prev
                              ? { ...prev, purgeUserMaxAgeSeconds: Math.min(86400, Math.max(10, Number(e.target.value))) }
                              : { ...defaultPurgeConfig, purgeUserMaxAgeSeconds: Math.min(86400, Math.max(10, Number(e.target.value))) },
                          )
                        }
                      />
                      <p className="text-xs text-muted-foreground">{t.moderation.purgeCommand.xpurgeMaxAgeSecondsHint}</p>
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
                    {savePurge.isPending ? t.moderation.header.saving : t.moderation.logChannels.save}
                  </Button>
                  {savePurge.isError ? (
                    <p className="mt-2 text-sm text-destructive">{t.moderation.purgeCommand.xpurgeSaveError}</p>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

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
