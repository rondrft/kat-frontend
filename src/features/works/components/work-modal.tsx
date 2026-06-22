"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CheckCircle2,
  Coins,
  Flame,
  Gift,
  Hash,
  Loader2,
  Mic,
  ShoppingBag,
  Shield,
  Sword,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import {
  useWorkConfig,
  useSaveWorkConfig,
} from "@/features/works/hooks/use-work-config";
import { DEFAULT_WORK_CONFIG } from "@/features/works/types/work-config";
import { useGuildTextChannels } from "@/features/auto-roles/hooks/use-guild-text-channels";
import { AppError } from "@/lib/errors";
import { cn } from "@/lib/utils";

const workConfigSchema = z.object({
  enabled: z.boolean(),
  allowedChannelIds: z.array(z.string()),
});

type WorkConfigFormValues = z.infer<typeof workConfigSchema>;

type WorkModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string | null;
};

function configToFormValues(
  config: typeof DEFAULT_WORK_CONFIG | null | undefined,
): WorkConfigFormValues {
  return {
    enabled: config?.enabled ?? DEFAULT_WORK_CONFIG.enabled,
    allowedChannelIds: config?.allowedChannelIds ?? [],
  };
}

const CONTRACT_PREVIEW = [
  { label: "Tech", desc: "debug, webdev, pentest, aioptimize", icon: Wrench },
  { label: "Labor", desc: "carpentry, electrical, welding, machinery", icon: Shield },
  { label: "Creative", desc: "illustrate, compose, storywrite, worldbuild", icon: Sword },
  { label: "Service", desc: "chef, concierge, logistics, events", icon: Coins },
  { label: "Exploration", desc: "scout, dive, ruins, expedition", icon: Zap },
  { label: "Entertainment", desc: "streamer, podcaster, comedian, esports_pro", icon: Mic },
  { label: "Criminal", desc: "pickpocket, grifter, carjacker, heist, kingpin", icon: AlertTriangle },
];

const DIFFICULTY_STEPS = [
  { label: "Entry", cooldown: "15 min", reward: "35–210" },
  { label: "Medium", cooldown: "30 min", reward: "60–510" },
  { label: "Hard", cooldown: "60 min", reward: "150–1,125" },
  { label: "Expert", cooldown: "2 hr", reward: "260–1,800" },
  { label: "Legendary", cooldown: "4 hr", reward: "450–9,000" },
];

const FEATURES = [
  {
    icon: Flame,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    title: "Streak",
    desc: "Work daily to build a streak worth up to 3x rewards",
  },
  {
    icon: ShoppingBag,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    title: "Shop",
    desc: "xworkshop — category boosters (+15% rewards), Coffee (+10% XP), Charm (streak)",
  },
  {
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    title: "Criminal",
    desc: "90% challenge rate, high rewards, escalating arrest bans (24h → 3d → 7d). CRIMINAL skill reduces catch chance.",
  },
  {
    icon: TrendingUp,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    title: "Skills",
    desc: "xworkskills — spend skill points every 5 levels for +10% per category",
  },
  {
    icon: Gift,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    title: "Daily Missions",
    desc: "xworkmissions — complete random daily goals for bonus coins & XP",
  },
  {
    icon: Coins,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    title: "Gamble",
    desc: "Add ! to gamble — 50% double or 50% half (60% win on streak 3+)",
  },
];

type Tab = "config" | "howto" | "contracts";

const TABS: { id: Tab; label: string }[] = [
  { id: "config", label: "Configuration" },
  { id: "howto", label: "How it works" },
  { id: "contracts", label: "Contracts" },
];

export function WorkModal({ open, onOpenChange, guildId }: WorkModalProps) {
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("config");

  const {
    data: savedConfig,
    isLoading: configLoading,
    isError: configError,
    error: configLoadError,
  } = useWorkConfig(guildId, open);

  const { data: channels = [], isLoading: channelsLoading } =
    useGuildTextChannels(guildId, open);

  const saveMutation = useSaveWorkConfig(guildId);

  const form = useForm<WorkConfigFormValues>({
    resolver: zodResolver(workConfigSchema),
    defaultValues: configToFormValues(null),
  });

  const { handleSubmit, reset, watch, setValue } = form;
  const enabled = watch("enabled");
  const allowedChannelIds = watch("allowedChannelIds");

  const noGuild = !guildId;

  useEffect(() => {
    if (!open) {
      setSaveSuccess(null);
      setSaveError(null);
      setActiveTab("config");
      return;
    }
    if (configLoading) return;
    reset(configToFormValues(savedConfig ?? null));
  }, [open, configLoading, savedConfig, reset]);

  const onSubmit = async (values: WorkConfigFormValues) => {
    if (!guildId) return;

    setSaveSuccess(null);
    setSaveError(null);

    try {
      await saveMutation.mutateAsync(values);
      reset(values);
      setSaveSuccess(
        values.enabled
          ? "KatWorks enabled for this server."
          : "KatWorks disabled for this server.",
      );
    } catch (error) {
      const message =
        error instanceof AppError
          ? error.message
          : "Could not save settings. Check that the bot is online.";
      setSaveError(message);
    }
  };

  const formDisabled = configLoading || saveMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSaveSuccess(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-amber-500/10 dark:border-white/10">
            <Coins className="h-5 w-5 text-amber-500" />
          </div>
          <DialogTitle>KatWorks</DialogTitle>
          <DialogDescription>
            Earn coins by completing contracts. Level up to unlock harder jobs
            with bigger payouts.
          </DialogDescription>
        </DialogHeader>

        {noGuild ? (
          <p className="text-sm text-muted-foreground">
            Select a server in the header first.
          </p>
        ) : configLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading settings...
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

            <div className="flex gap-1 rounded-xl border border-black/[0.08] bg-black/[0.02] p-1 dark:border-white/10 dark:bg-white/[0.03]">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    activeTab === tab.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "config" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.08] bg-black/[0.02] px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <div>
                    <p className="text-sm font-medium">Work system</p>
                    <p className="text-xs text-muted-foreground">
                      Turn off to disable contract work and coin rewards
                    </p>
                  </div>
                  <Switch
                    checked={enabled}
                    disabled={formDisabled}
                    onCheckedChange={(v) => setValue("enabled", v)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">Allowed channels</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select which channels work commands are allowed in. If none are selected, commands won&apos;t respond anywhere.
                  </p>
                  {channelsLoading ? (
                    <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading channels...
                    </div>
                  ) : channels.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No text channels found.</p>
                  ) : (
                    <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-black/[0.08] p-2 dark:border-white/10">
                      {channels.map((ch) => {
                        const checked = allowedChannelIds.includes(ch.id);
                        return (
                          <label
                            key={ch.id}
                            className={cn(
                              "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                              checked && "bg-kat/10",
                            )}
                          >
                            <input
                              type="checkbox"
                              className="accent-[hsl(var(--kat-brand))]"
                              checked={checked}
                              disabled={formDisabled}
                              onChange={() => {
                                const next = checked
                                  ? allowedChannelIds.filter((id) => id !== ch.id)
                                  : [...allowedChannelIds, ch.id];
                                setValue("allowedChannelIds", next);
                              }}
                            />
                            <Hash className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate">{ch.name}</span>
                          </label>
                        );
                      })}
                      <p className="px-2 pt-1 text-[10px] text-muted-foreground">
                        {allowedChannelIds.length} selected
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "howto" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">How it works</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Use <code className="rounded bg-muted px-1">xworks</code> to browse
                    contracts, apply with <code className="rounded bg-muted px-1">xwork apply &lt;job&gt;</code>,
                    then <code className="rounded bg-muted px-1">xwork</code> to complete it.
                    Most work sessions trigger a trivia challenge — answer correctly to earn, wrong
                    answers accumulate towards dismissal. Criminal jobs always have a 90% challenge
                    rate and escalating arrest bans on repeat offences. Max 12 works/hour.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Features</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {FEATURES.map((f) => (
                      <div
                        key={f.title}
                        className="flex items-start gap-2 rounded-lg border border-black/[0.06] bg-black/[0.02] p-3 dark:border-white/[0.06] dark:bg-white/[0.02]"
                      >
                        <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", f.bg)}>
                          <f.icon className={cn("h-4 w-4", f.color)} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold">{f.title}</p>
                          <p className="text-xs text-muted-foreground">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "contracts" && (
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-sm font-medium text-foreground">Contract categories</p>
                  <div className="rounded-xl border border-black/[0.08] dark:border-white/10">
                    {CONTRACT_PREVIEW.map((cat) => (
                      <div
                        key={cat.label}
                        className="flex items-start gap-3 px-4 py-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-black/[0.08] dark:[&:not(:last-child)]:border-white/10"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                          <cat.icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{cat.label}</p>
                          <p className="text-xs text-muted-foreground">{cat.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-px shrink-0 bg-border max-sm:hidden" />

                <div className="min-w-0 space-y-2 sm:w-56 sm:shrink-0">
                  <p className="text-sm font-medium text-foreground">Difficulty tiers</p>
                  <div className="rounded-xl border border-black/[0.08] dark:border-white/10">
                    {DIFFICULTY_STEPS.map((step) => (
                      <div
                        key={step.label}
                        className="flex items-center justify-between px-4 py-2 text-sm [&:not(:last-child)]:border-b [&:not(:last-child)]:border-black/[0.08] dark:[&:not(:last-child)]:border-white/10"
                      >
                        <span className="font-medium">{step.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {step.reward} · {step.cooldown}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {saveSuccess ? (
              <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                {saveSuccess}
              </p>
            ) : null}

            {saveError ? (
              <p className="text-xs text-destructive">{saveError}</p>
            ) : null}

            <DialogFooter>
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
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
