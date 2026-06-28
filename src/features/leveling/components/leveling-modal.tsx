"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowUp,
  Bell,
  BookOpen,
  CheckCircle2,
  Hash,
  Loader2,
  MessageSquare,
  Plus,
  Shield,
  Star,
  Timer,
  Trash2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useLevelingConfig,
  useLevelRoleRewards,
  useSaveLevelingConfig,
  useSaveLevelRoleReward,
  useDeleteLevelRoleReward,
} from "@/features/leveling/hooks/use-leveling-config";
import {
  levelingConfigSchema,
  type LevelingConfigFormValues,
} from "@/features/leveling/schemas/leveling-schema";
import {
  DEFAULT_LEVELING_CONFIG,
  type LevelRoleReward,
} from "@/features/leveling/types/leveling-config";
import { useGuildTextChannels } from "@/features/auto-roles/hooks/use-guild-text-channels";
import { useGuildRoles } from "@/features/auto-roles/hooks/use-guild-roles";
import { AppError } from "@/lib/errors";

type Tab = "general" | "xp" | "notifications" | "rewards" | "info";

type LevelingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string | null;
};

const TABS: { id: Tab; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: "general", label: "General", icon: ArrowUp },
  { id: "xp", label: "XP & Cooldown", icon: Zap },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "rewards", label: "Role Rewards", icon: Star },
  { id: "info", label: "How it works", icon: BookOpen },
];

const LEVEL_UP_STEPS = [
  { level: 1, xp: "155" },
  { level: 2, xp: "465" },
  { level: 5, xp: "1,750" },
  { level: 10, xp: "6,125" },
  { level: 20, xp: "22,550" },
  { level: 50, xp: "139,375" },
  { level: 100, xp: "549,500" },
];

function SliderField({
  label,
  hint,
  value,
  min,
  max,
  formatValue,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  formatValue: (v: number) => string;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <span className="text-xs font-semibold text-orange-500">{formatValue(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-black/[0.08] accent-orange-500 dark:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function channelIdsToArray(raw: string | null): string[] {
  if (!raw || raw.trim() === "") return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function arrayToChannelIds(ids: string[]): string | null {
  if (ids.length === 0) return null;
  return ids.join(",");
}

function configToFormValues(
  config: typeof DEFAULT_LEVELING_CONFIG | null | undefined,
): LevelingConfigFormValues {
  const base = config ?? DEFAULT_LEVELING_CONFIG;
  return {
    enabled: base.enabled,
    levelUpChannelId: base.levelUpChannelId ?? null,
    minXpPerMessage: base.minXpPerMessage || DEFAULT_LEVELING_CONFIG.minXpPerMessage,
    maxXpPerMessage: base.maxXpPerMessage || DEFAULT_LEVELING_CONFIG.maxXpPerMessage,
    minXpPerAction: base.minXpPerAction || DEFAULT_LEVELING_CONFIG.minXpPerAction,
    maxXpPerAction: base.maxXpPerAction || DEFAULT_LEVELING_CONFIG.maxXpPerAction,
    cooldownSeconds: base.cooldownSeconds || DEFAULT_LEVELING_CONFIG.cooldownSeconds,
    excludedChannelIds: base.excludedChannelIds ?? null,
    noXpRoleIds: base.noXpRoleIds ?? null,
    announcementsEnabled: base.announcementsEnabled ?? true,
    mentionOnLevelUp: base.mentionOnLevelUp ?? true,
    customLevelUpMessage: base.customLevelUpMessage ?? null,
    roleStacking: base.roleStacking ?? true,
  };
}

export function LevelingModal({ open, onOpenChange, guildId }: LevelingModalProps) {
  const [tab, setTab] = useState<Tab>("general");
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newRewardLevel, setNewRewardLevel] = useState("");
  const [newRewardRoleId, setNewRewardRoleId] = useState("");
  const [rewardError, setRewardError] = useState<string | null>(null);

  const {
    data: savedConfig,
    isLoading: configLoading,
    isError: configError,
    error: configLoadError,
  } = useLevelingConfig(guildId, open);

  const { data: channels = [], isLoading: channelsLoading } =
    useGuildTextChannels(guildId, open);

  const { data: roles = [], isLoading: rolesLoading } = useGuildRoles(guildId, open);

  const { data: roleRewards = [], isLoading: rewardsLoading } =
    useLevelRoleRewards(guildId, open);

  const saveMutation = useSaveLevelingConfig(guildId);
  const saveRewardMutation = useSaveLevelRoleReward(guildId);
  const deleteRewardMutation = useDeleteLevelRoleReward(guildId);

  const form = useForm<LevelingConfigFormValues>({
    resolver: zodResolver(levelingConfigSchema),
    defaultValues: configToFormValues(null),
  });

  const { handleSubmit, reset, watch, setValue, formState: { errors } } = form;
  const enabled = watch("enabled");
  const announcementsEnabled = watch("announcementsEnabled");
  const mentionOnLevelUp = watch("mentionOnLevelUp");
  const levelUpChannelId = watch("levelUpChannelId");
  const roleStacking = watch("roleStacking");
  const excludedChannelIds = watch("excludedChannelIds");
  const noXpRoleIds = watch("noXpRoleIds");
  const minXpPerMessage = watch("minXpPerMessage");
  const maxXpPerMessage = watch("maxXpPerMessage");
  const minXpPerAction = watch("minXpPerAction");
  const maxXpPerAction = watch("maxXpPerAction");
  const cooldownSeconds = watch("cooldownSeconds");

  const excludedChannelList = channelIdsToArray(excludedChannelIds);
  const noXpRoleList = channelIdsToArray(noXpRoleIds);

  const noGuild = !guildId;
  const formDisabled = configLoading || saveMutation.isPending;

  useEffect(() => {
    if (!open) {
      setSaveSuccess(null);
      setSaveError(null);
      setTab("general");
      setNewRewardLevel("");
      setNewRewardRoleId("");
      setRewardError(null);
      return;
    }
    if (configLoading) return;
    reset(configToFormValues(savedConfig ?? null));
  }, [open, configLoading, savedConfig, reset]);

  const onSubmit = async (values: LevelingConfigFormValues) => {
    if (!guildId) return;
    setSaveSuccess(null);
    setSaveError(null);
    try {
      await saveMutation.mutateAsync(values);
      reset(values);
      setSaveSuccess("Settings saved.");
    } catch (error) {
      setSaveError(
        error instanceof AppError
          ? error.message
          : "Could not save settings. Check that the bot is online.",
      );
    }
  };

  const toggleExcludedChannel = (channelId: string) => {
    const current = channelIdsToArray(excludedChannelIds);
    const next = current.includes(channelId)
      ? current.filter((id) => id !== channelId)
      : [...current, channelId];
    setValue("excludedChannelIds", arrayToChannelIds(next));
  };

  const toggleNoXpRole = (roleId: string) => {
    const current = channelIdsToArray(noXpRoleIds);
    const next = current.includes(roleId)
      ? current.filter((id) => id !== roleId)
      : [...current, roleId];
    setValue("noXpRoleIds", arrayToChannelIds(next));
  };

  const handleAddReward = async () => {
    setRewardError(null);
    const level = parseInt(newRewardLevel, 10);
    if (!newRewardRoleId || isNaN(level) || level < 1 || level > 500) {
      setRewardError("Enter a valid level (1–500) and select a role.");
      return;
    }
    if (roleRewards.some((r) => r.id.level === level)) {
      setRewardError(`Level ${level} already has a reward. Remove it first.`);
      return;
    }
    try {
      await saveRewardMutation.mutateAsync({ level, roleId: newRewardRoleId });
      setNewRewardLevel("");
      setNewRewardRoleId("");
    } catch {
      setRewardError("Could not save role reward.");
    }
  };

  const handleDeleteReward = async (level: number) => {
    try {
      await deleteRewardMutation.mutateAsync(level);
    } catch {
      setRewardError("Could not remove role reward.");
    }
  };

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
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-orange-500/10 dark:border-white/10">
            <ArrowUp className="h-5 w-5 text-orange-500" />
          </div>
          <DialogTitle>Leveling</DialogTitle>
          <DialogDescription>
            Configure XP rates, notifications, role rewards, and exclusions
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 overflow-x-auto rounded-xl border border-black/[0.08] bg-black/[0.02] p-1 dark:border-white/10 dark:bg-white/[0.03]">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                tab === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {noGuild ? (
          <p className="text-sm text-muted-foreground">Select a server in the header first.</p>
        ) : tab === "info" ? (
          <InfoTab />
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

            {tab === "general" && (
              <GeneralTab
                enabled={enabled}
                formDisabled={formDisabled}
                setValue={setValue}
                channels={channels}
                channelsLoading={channelsLoading}
                excludedChannelList={excludedChannelList}
                toggleExcludedChannel={toggleExcludedChannel}
                roles={roles}
                rolesLoading={rolesLoading}
                noXpRoleList={noXpRoleList}
                toggleNoXpRole={toggleNoXpRole}
              />
            )}

            {tab === "xp" && (
              <XpTab
                formDisabled={formDisabled}
                minXpPerMessage={minXpPerMessage}
                maxXpPerMessage={maxXpPerMessage}
                minXpPerAction={minXpPerAction}
                maxXpPerAction={maxXpPerAction}
                cooldownSeconds={cooldownSeconds}
                setValue={setValue}
                errors={errors}
              />
            )}

            {tab === "notifications" && (
              <NotificationsTab
                formDisabled={formDisabled}
                announcementsEnabled={announcementsEnabled}
                mentionOnLevelUp={mentionOnLevelUp}
                levelUpChannelId={levelUpChannelId}
                channels={channels}
                channelsLoading={channelsLoading}
                customLevelUpMessage={watch("customLevelUpMessage")}
                setValue={setValue}
              />
            )}

            {tab === "rewards" && (
              <RewardsTab
                guildId={guildId}
                roleStacking={roleStacking}
                formDisabled={formDisabled}
                setValue={setValue}
                roleRewards={roleRewards}
                rewardsLoading={rewardsLoading}
                roles={roles}
                rolesLoading={rolesLoading}
                newRewardLevel={newRewardLevel}
                newRewardRoleId={newRewardRoleId}
                rewardError={rewardError}
                isSavingReward={saveRewardMutation.isPending}
                isDeletingReward={deleteRewardMutation.isPending}
                setNewRewardLevel={setNewRewardLevel}
                setNewRewardRoleId={setNewRewardRoleId}
                onAddReward={handleAddReward}
                onDeleteReward={handleDeleteReward}
              />
            )}

            {saveSuccess ? (
              <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                {saveSuccess}
              </p>
            ) : null}

            {saveError ? <p className="text-xs text-destructive">{saveError}</p> : null}

            {tab !== "rewards" && (
              <div className="flex justify-end gap-2">
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
              </div>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function GeneralTab({
  enabled,
  formDisabled,
  setValue,
  channels,
  channelsLoading,
  excludedChannelList,
  toggleExcludedChannel,
  roles,
  rolesLoading,
  noXpRoleList,
  toggleNoXpRole,
}: {
  enabled: boolean;
  formDisabled: boolean;
  setValue: ReturnType<typeof useForm<LevelingConfigFormValues>>["setValue"];
  channels: { id: string; name: string }[];
  channelsLoading: boolean;
  excludedChannelList: string[];
  toggleExcludedChannel: (id: string) => void;
  roles: { id: string; name: string }[];
  rolesLoading: boolean;
  noXpRoleList: string[];
  toggleNoXpRole: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.08] bg-black/[0.02] px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
        <div>
          <p className="text-sm font-medium">Leveling system</p>
          <p className="text-xs text-muted-foreground">
            Turn off to disable XP gain and level-ups on this server
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
          <p className="text-sm font-medium">Excluded channels</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Messages from these channels will not earn XP.
        </p>
        {channelsLoading ? (
          <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading channels...
          </div>
        ) : (
          <div className="max-h-36 space-y-0.5 overflow-y-auto rounded-xl border border-black/[0.08] p-2 dark:border-white/10">
            {channels.length === 0 ? (
              <p className="px-2 py-2 text-xs text-muted-foreground">No text channels found.</p>
            ) : (
              channels.map((ch) => {
                const checked = excludedChannelList.includes(ch.id);
                return (
                  <label
                    key={ch.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-muted/50",
                      checked && "bg-orange-500/10",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="accent-orange-500"
                      checked={checked}
                      disabled={formDisabled}
                      onChange={() => toggleExcludedChannel(ch.id)}
                    />
                    <Hash className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{ch.name}</span>
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">No-XP roles</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Members with any of these roles will not earn XP.
        </p>
        {rolesLoading ? (
          <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading roles...
          </div>
        ) : (
          <div className="max-h-36 space-y-0.5 overflow-y-auto rounded-xl border border-black/[0.08] p-2 dark:border-white/10">
            {roles.length === 0 ? (
              <p className="px-2 py-2 text-xs text-muted-foreground">No roles found.</p>
            ) : (
              roles.map((role) => {
                const checked = noXpRoleList.includes(role.id);
                return (
                  <label
                    key={role.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-muted/50",
                      checked && "bg-orange-500/10",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="accent-orange-500"
                      checked={checked}
                      disabled={formDisabled}
                      onChange={() => toggleNoXpRole(role.id)}
                    />
                    <span className="truncate">{role.name}</span>
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function XpTab({
  formDisabled,
  minXpPerMessage,
  maxXpPerMessage,
  minXpPerAction,
  maxXpPerAction,
  cooldownSeconds,
  setValue,
  errors,
}: {
  formDisabled: boolean;
  minXpPerMessage: number;
  maxXpPerMessage: number;
  minXpPerAction: number;
  maxXpPerAction: number;
  cooldownSeconds: number;
  setValue: ReturnType<typeof useForm<LevelingConfigFormValues>>["setValue"];
  errors: ReturnType<typeof useForm<LevelingConfigFormValues>>["formState"]["errors"];
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-xl border border-black/[0.08] p-4 dark:border-white/10">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-orange-500" />
          <p className="text-sm font-medium">Message XP</p>
          <span className="ml-auto text-xs text-muted-foreground">Recommended: 15–25</span>
        </div>
        <SliderField
          label="Minimum"
          hint="Lowest XP a message can earn"
          value={minXpPerMessage}
          min={1}
          max={Math.min(maxXpPerMessage, 500)}
          formatValue={(v) => `${v} XP`}
          onChange={(v) => setValue("minXpPerMessage", v)}
          disabled={formDisabled}
        />
        <SliderField
          label="Maximum"
          hint="Highest XP a message can earn"
          value={maxXpPerMessage}
          min={minXpPerMessage}
          max={500}
          formatValue={(v) => `${v} XP`}
          onChange={(v) => setValue("maxXpPerMessage", v)}
          disabled={formDisabled}
        />
        {errors.minXpPerMessage && (
          <p className="text-xs text-destructive">{errors.minXpPerMessage.message}</p>
        )}
      </div>

      <div className="space-y-4 rounded-xl border border-black/[0.08] p-4 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-orange-500" />
          <p className="text-sm font-medium">Action command XP</p>
          <span className="ml-auto text-xs text-muted-foreground">Recommended: 30–50</span>
        </div>
        <SliderField
          label="Minimum"
          hint="Lowest XP for kiss, hug, pat, etc."
          value={minXpPerAction}
          min={1}
          max={Math.min(maxXpPerAction, 500)}
          formatValue={(v) => `${v} XP`}
          onChange={(v) => setValue("minXpPerAction", v)}
          disabled={formDisabled}
        />
        <SliderField
          label="Maximum"
          hint="Highest XP for kiss, hug, pat, etc."
          value={maxXpPerAction}
          min={minXpPerAction}
          max={500}
          formatValue={(v) => `${v} XP`}
          onChange={(v) => setValue("maxXpPerAction", v)}
          disabled={formDisabled}
        />
        {errors.minXpPerAction && (
          <p className="text-xs text-destructive">{errors.minXpPerAction.message}</p>
        )}
      </div>

      <div className="space-y-4 rounded-xl border border-black/[0.08] p-4 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-orange-500" />
          <p className="text-sm font-medium">XP cooldown</p>
          <span className="ml-auto text-xs text-muted-foreground">Recommended: 60s</span>
        </div>
        <SliderField
          label="Cooldown duration"
          hint="Prevents spam farming — users cannot earn XP again until this window passes."
          value={cooldownSeconds}
          min={5}
          max={3600}
          formatValue={(v) => {
            if (v < 60) return `${v}s`;
            const m = Math.floor(v / 60);
            const s = v % 60;
            return s > 0 ? `${m}m ${s}s` : `${m}m`;
          }}
          onChange={(v) => setValue("cooldownSeconds", v)}
          disabled={formDisabled}
        />
      </div>
    </div>
  );
}

function NotificationsTab({
  formDisabled,
  announcementsEnabled,
  mentionOnLevelUp,
  levelUpChannelId,
  channels,
  channelsLoading,
  customLevelUpMessage,
  setValue,
}: {
  formDisabled: boolean;
  announcementsEnabled: boolean;
  mentionOnLevelUp: boolean;
  levelUpChannelId: string | null;
  channels: { id: string; name: string }[];
  channelsLoading: boolean;
  customLevelUpMessage: string | null;
  setValue: ReturnType<typeof useForm<LevelingConfigFormValues>>["setValue"];
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.08] bg-black/[0.02] px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
        <div>
          <p className="text-sm font-medium">Level-up announcements</p>
          <p className="text-xs text-muted-foreground">
            Post a card image when a member levels up
          </p>
        </div>
        <Switch
          checked={announcementsEnabled}
          disabled={formDisabled}
          onCheckedChange={(v) => setValue("announcementsEnabled", v)}
        />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.08] px-4 py-3 dark:border-white/10">
        <div>
          <p className="text-sm font-medium">Mention user</p>
          <p className="text-xs text-muted-foreground">
            Ping the member in the level-up message
          </p>
        </div>
        <Switch
          checked={mentionOnLevelUp}
          disabled={formDisabled || !announcementsEnabled}
          onCheckedChange={(v) => setValue("mentionOnLevelUp", v)}
        />
      </div>

      <div className="space-y-2">
        <Label>Custom level-up message</Label>
        <Input
          placeholder="Leave empty for default. Use {user} to mention."
          disabled={formDisabled || !announcementsEnabled}
          value={customLevelUpMessage ?? ""}
          maxLength={500}
          onChange={(e) =>
            setValue("customLevelUpMessage", e.target.value || null)
          }
        />
        <p className="text-xs text-muted-foreground">
          Use <code className="rounded bg-muted px-1">{"{user}"}</code> to mention the member. Max 500 characters.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">Announcement channel</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Where the bot posts level-up cards. Defaults to the same channel as the message.
        </p>
        {channelsLoading ? (
          <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading channels...
          </div>
        ) : (
          <div className="max-h-44 space-y-0.5 overflow-y-auto rounded-xl border border-black/[0.08] p-2 dark:border-white/10">
            <label
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-muted/50",
                levelUpChannelId === null && "bg-orange-500/10",
              )}
            >
              <input
                type="radio"
                className="accent-orange-500"
                checked={levelUpChannelId === null}
                disabled={formDisabled || !announcementsEnabled}
                onChange={() => setValue("levelUpChannelId", null)}
              />
              <span className="truncate italic text-muted-foreground">
                Same channel as message
              </span>
            </label>
            {channels.map((ch) => {
              const checked = levelUpChannelId === ch.id;
              return (
                <label
                  key={ch.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-muted/50",
                    checked && "bg-orange-500/10",
                  )}
                >
                  <input
                    type="radio"
                    className="accent-orange-500"
                    checked={checked}
                    disabled={formDisabled || !announcementsEnabled}
                    onChange={() => setValue("levelUpChannelId", ch.id)}
                  />
                  <Hash className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{ch.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function RewardsTab({
  roleStacking,
  formDisabled,
  setValue,
  roleRewards,
  rewardsLoading,
  roles,
  rolesLoading,
  newRewardLevel,
  newRewardRoleId,
  rewardError,
  isSavingReward,
  isDeletingReward,
  setNewRewardLevel,
  setNewRewardRoleId,
  onAddReward,
  onDeleteReward,
}: {
  guildId: string | null;
  roleStacking: boolean;
  formDisabled: boolean;
  setValue: ReturnType<typeof useForm<LevelingConfigFormValues>>["setValue"];
  roleRewards: LevelRoleReward[];
  rewardsLoading: boolean;
  roles: { id: string; name: string }[];
  rolesLoading: boolean;
  newRewardLevel: string;
  newRewardRoleId: string;
  rewardError: string | null;
  isSavingReward: boolean;
  isDeletingReward: boolean;
  setNewRewardLevel: (v: string) => void;
  setNewRewardRoleId: (v: string) => void;
  onAddReward: () => void;
  onDeleteReward: (level: number) => void;
}) {
  const roleMap = Object.fromEntries(roles.map((r) => [r.id, r.name]));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.08] bg-black/[0.02] px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
        <div>
          <p className="text-sm font-medium">Role stacking</p>
          <p className="text-xs text-muted-foreground">
            ON: members keep all previous reward roles. OFF: only the latest role is kept.
          </p>
        </div>
        <Switch
          checked={roleStacking}
          disabled={formDisabled}
          onCheckedChange={(v) => setValue("roleStacking", v)}
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Add role reward</p>
        <div className="flex gap-2">
          <Input
            type="number"
            min={1}
            max={500}
            placeholder="Level"
            className="w-24 shrink-0"
            value={newRewardLevel}
            onChange={(e) => setNewRewardLevel(e.target.value)}
          />
          {rolesLoading ? (
            <div className="flex flex-1 items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <select
              className={cn(
                "flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm",
                "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
              value={newRewardRoleId}
              onChange={(e) => setNewRewardRoleId(e.target.value)}
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          )}
          <Button
            type="button"
            size="sm"
            onClick={onAddReward}
            disabled={isSavingReward || !newRewardLevel || !newRewardRoleId}
          >
            {isSavingReward ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
        {rewardError ? (
          <p className="text-xs text-destructive">{rewardError}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Configured rewards</p>
        {rewardsLoading ? (
          <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading rewards...
          </div>
        ) : roleRewards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-black/[0.12] px-4 py-6 text-center dark:border-white/[0.12]">
            <Star className="mx-auto mb-2 h-6 w-6 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">
              No role rewards configured. Add one above.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-black/[0.08] dark:border-white/10">
            {roleRewards.map((reward, i) => (
              <div
                key={reward.id.level}
                className={cn(
                  "flex items-center justify-between gap-3 px-4 py-2.5",
                  i < roleRewards.length - 1 && "border-b border-black/[0.08] dark:border-white/10",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="w-20 rounded-lg bg-orange-500/10 px-2 py-0.5 text-center text-xs font-semibold text-orange-500">
                    Level {reward.id.level}
                  </span>
                  <span className="text-sm">{roleMap[reward.roleId] ?? reward.roleId}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  disabled={isDeletingReward}
                  onClick={() => onDeleteReward(reward.id.level)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={formDisabled}
        >
          {formDisabled ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </div>
  );
}

function InfoTab() {
  return (
    <div className="space-y-5">
      <div className="space-y-2 rounded-xl border border-black/[0.08] bg-black/[0.02] px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]">
        <p className="text-sm font-medium">How leveling works</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Members earn XP by sending messages and using action commands (kiss, hug, pat, etc.).
          A cooldown prevents XP gain from rapid messages. When enough XP is accumulated,
          the member levels up and the bot posts a card image. XP is global across all servers.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Level progression (cumulative XP)
        </p>
        <div className="rounded-xl border border-black/[0.08] dark:border-white/10">
          {LEVEL_UP_STEPS.map(({ level, xp }, i) => (
            <div
              key={level}
              className={cn(
                "flex items-center justify-between px-4 py-2 text-sm",
                i < LEVEL_UP_STEPS.length - 1 &&
                  "border-b border-black/[0.08] dark:border-white/10",
              )}
            >
              <span className="font-medium">Level {level}</span>
              <span className="text-xs text-muted-foreground">{xp} XP</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-black/[0.08] px-4 py-4 dark:border-white/10">
          <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
            <MessageSquare className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-xs font-semibold">Message XP</p>
          <p className="text-xs text-muted-foreground">Default: 15–25 XP</p>
        </div>
        <div className="rounded-xl border border-black/[0.08] px-4 py-4 dark:border-white/10">
          <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
            <Zap className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-xs font-semibold">Action XP</p>
          <p className="text-xs text-muted-foreground">Default: 30–50 XP</p>
        </div>
        <div className="rounded-xl border border-black/[0.08] px-4 py-4 dark:border-white/10">
          <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
            <Timer className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-xs font-semibold">Cooldown</p>
          <p className="text-xs text-muted-foreground">Default: 60 seconds</p>
        </div>
        <div className="rounded-xl border border-black/[0.08] px-4 py-4 dark:border-white/10">
          <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
            <Star className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-xs font-semibold">Day bonus</p>
          <p className="text-xs text-muted-foreground">1.5× XP from 06:00–20:00</p>
        </div>
      </div>
    </div>
  );
}
