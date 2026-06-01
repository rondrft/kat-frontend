"use client";

import { memo, useEffect, useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";
import { useGuildStore } from "@/store/guild-store";
import type {
  ModerationAction,
  ModerationConfig,
  ModerationRuleConfig,
  ModerationRuleType,
} from "@/types/moderation";

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

  useEffect(() => {
    if (!moderationConfig) return;
    setStrictness(moderationConfig.strictness);
    setMuteMinutes(moderationConfig.defaultTimeoutMinutes);
    setRules((current) => applyModerationConfigToRules(current, moderationConfig));
    setSaved(true);
  }, [moderationConfig]);

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
        {rules.map((rule) => (
          <RuleTile
            key={rule.id}
            rule={rule}
            onOpen={(nextRule) => setSelectedRuleId(nextRule.id)}
            onToggle={(id, enabled) => updateRule(id, { enabled })}
          />
        ))}
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
