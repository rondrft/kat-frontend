"use client";

import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  Info,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RoleCheckboxList } from "@/features/auto-roles/components/role-checkbox-list";
import {
  useAutoRolesConfig,
  useSaveAutoRolesConfig,
} from "@/features/auto-roles/hooks/use-auto-roles-config";
import { useGuildRoles } from "@/features/auto-roles/hooks/use-guild-roles";
import { useGuildTextChannels } from "@/features/auto-roles/hooks/use-guild-text-channels";
import {
  autoRolesFormSchema,
  type AutoRolesFormValues,
  type TabId,
  validateAutoRolesTab,
} from "@/features/auto-roles/schemas/auto-roles-schema";
import {
  DEFAULT_AUTO_ROLES_CONFIG,
  MAX_REACTION_MAPPINGS,
  toPutRequest,
  type AutoRolesConfig,
} from "@/features/auto-roles/types/auto-roles-config";
import { AppError } from "@/lib/errors";
import { cn } from "@/lib/utils";

type AutoRolesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string | null;
};

const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: "join", label: "On Join", icon: UserPlus },
  { id: "boost", label: "On Boost", icon: Sparkles },
  { id: "reaction", label: "Reaction Roles", icon: Users },
];

function configToFormValues(
  config: AutoRolesConfig | null | undefined,
): AutoRolesFormValues {
  const base = config ?? DEFAULT_AUTO_ROLES_CONFIG;
  return {
    joinEnabled: base.joinEnabled,
    joinRoleIds: [...base.joinRoleIds],
    boostEnabled: base.boostEnabled,
    boostRoleIds: [...base.boostRoleIds],
    reactionEnabled: base.reactionEnabled,
    reactionChannelId: base.reactionChannelId,
    reactionUseEmbed: base.reactionUseEmbed,
    reactionEmbedTitle: base.reactionEmbedTitle,
    reactionEmbedColor: base.reactionEmbedColor,
    reactionMessageContent: base.reactionMessageContent,
    reactionMappings: base.reactionMappings.map((m) => ({ ...m })),
  };
}

function formValuesToConfig(values: AutoRolesFormValues): AutoRolesConfig {
  return {
    joinEnabled: values.joinEnabled,
    joinRoleIds: values.joinRoleIds,
    boostEnabled: values.boostEnabled,
    boostRoleIds: values.boostRoleIds,
    reactionEnabled: values.reactionEnabled,
    reactionChannelId: values.reactionChannelId,
    reactionUseEmbed: values.reactionUseEmbed,
    reactionEmbedTitle: values.reactionEmbedTitle.trim(),
    reactionEmbedColor:
      values.reactionEmbedColor.trim() || DEFAULT_AUTO_ROLES_CONFIG.reactionEmbedColor,
    reactionMessageContent: values.reactionMessageContent.trim(),
    reactionMappings: values.reactionMappings.map((m) => ({
      emoji: m.emoji.trim(),
      roleId: m.roleId,
    })),
  };
}

type TabFooterProps = {
  saving: boolean;
  disabled: boolean;
  onCancel: () => void;
  onSave: () => void;
};

function TabFooter({ saving, disabled, onCancel, onSave }: TabFooterProps) {
  return (
    <div className="flex justify-end gap-2 border-t border-black/[0.06] pt-4 dark:border-white/10">
      <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
        Cancel
      </Button>
      <Button type="button" onClick={onSave} disabled={disabled || saving}>
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Save"
        )}
      </Button>
    </div>
  );
}

export function AutoRolesModal({ open, onOpenChange, guildId }: AutoRolesModalProps) {
  const [tab, setTab] = useState<TabId>("join");
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const {
    data: savedConfig,
    isLoading: configLoading,
    isError: configError,
    error: configLoadError,
  } = useAutoRolesConfig(guildId, open);

  const { data: roles = [], isLoading: rolesLoading } = useGuildRoles(guildId, open);
  const { data: textChannels = [], isLoading: channelsLoading } = useGuildTextChannels(
    guildId,
    open,
  );

  const saveMutation = useSaveAutoRolesConfig(guildId);

  const form = useForm<AutoRolesFormValues>({
    resolver: zodResolver(autoRolesFormSchema),
    defaultValues: configToFormValues(null),
  });

  const { control, reset, watch, setValue, getValues, register } = form;

  const joinEnabled = watch("joinEnabled");
  const boostEnabled = watch("boostEnabled");
  const reactionEnabled = watch("reactionEnabled");
  const joinRoleIds = watch("joinRoleIds");
  const boostRoleIds = watch("boostRoleIds");
  const reactionChannelId = watch("reactionChannelId");
  const reactionUseEmbed = watch("reactionUseEmbed");
  const reactionEmbedTitle = watch("reactionEmbedTitle");
  const reactionEmbedColor = watch("reactionEmbedColor");
  const reactionMessage = watch("reactionMessageContent");
  const reactionMappings = watch("reactionMappings");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "reactionMappings",
  });

  const channelOptions = useMemo(() => {
    const list = [...textChannels];
    const selected = savedConfig?.reactionChannelId;
    if (selected && !list.some((c) => c.id === selected)) {
      list.unshift({ id: selected, name: "current-channel" });
    }
    return list;
  }, [textChannels, savedConfig?.reactionChannelId]);

  const reactionPanelChannelName = useMemo(() => {
    const id = savedConfig?.reactionChannelId;
    if (!id) return null;
    return (
      textChannels.find((c) => c.id === id)?.name ??
      channelOptions.find((c) => c.id === id)?.name
    );
  }, [savedConfig?.reactionChannelId, textChannels, channelOptions]);

  useEffect(() => {
    if (!open) {
      setSaveSuccess(null);
      setSaveError(null);
      setFieldErrors({});
      setTab("join");
      return;
    }
    if (configLoading) return;
    reset(configToFormValues(savedConfig ?? null));
  }, [open, configLoading, savedConfig, reset]);

  const handleSaveTab = async (activeTab: TabId) => {
    if (!guildId) return;

    const values = getValues();
    const validation = validateAutoRolesTab(activeTab, values);

    setFieldErrors({});
    setSaveSuccess(null);
    setSaveError(null);

    if (!validation.success) {
      setFieldErrors(validation.errors);
      return;
    }

    const payload = toPutRequest(formValuesToConfig(values));

    try {
      const saved = await saveMutation.mutateAsync(payload);
      reset(configToFormValues(saved));

      if (
        activeTab === "reaction" &&
        saved.reactionEnabled &&
        saved.reactionMessageId
      ) {
        const channelName =
          textChannels.find((c) => c.id === saved.reactionChannelId)?.name ??
          reactionPanelChannelName ??
          "channel";
        setSaveSuccess(`Panel active in #${channelName}`);
      } else if (activeTab === "join") {
        setSaveSuccess(
          saved.joinEnabled ? "Join auto roles saved." : "Join auto roles disabled.",
        );
      } else if (activeTab === "boost") {
        setSaveSuccess(
          saved.boostEnabled ? "Boost auto roles saved." : "Boost auto roles disabled.",
        );
      } else {
        setSaveSuccess("Auto roles saved.");
      }
    } catch (error) {
      const message =
        error instanceof AppError
          ? error.message
          : "Could not save auto roles. Check that the bot is online and has Manage Roles permission.";
      setSaveError(message);
    }
  };

  const noGuild = !guildId;
  const formDisabled = configLoading || saveMutation.isPending;

  const tabHasError = (id: TabId) => {
    if (id === "join") return Boolean(fieldErrors.joinRoleIds);
    if (id === "boost") return Boolean(fieldErrors.boostRoleIds);
    if (id === "reaction") {
      return Boolean(
        fieldErrors.reactionChannelId ||
        fieldErrors.reactionEmbedColor ||
        fieldErrors.reactionMessageContent ||
        fieldErrors.reactionMappings,
      );
    }
    return false;
  };

  const showReactionPanelInfo =
    savedConfig?.reactionMessageId &&
    savedConfig.reactionEnabled &&
    reactionPanelChannelName;

  const reactionPreviewColor = /^#[0-9A-Fa-f]{6}$/.test(reactionEmbedColor)
    ? reactionEmbedColor
    : DEFAULT_AUTO_ROLES_CONFIG.reactionEmbedColor;

  const reactionPreviewLines = reactionMappings
    .map((mapping) => {
      const emoji = mapping.emoji.trim();
      const role = roles.find((item) => item.id === mapping.roleId);
      if (!emoji || !role) return null;
      return { emoji, role };
    })
    .filter(
      (
        item,
      ): item is {
        emoji: string;
        role: { id: string; name: string; color?: number };
      } => item !== null,
    );

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
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-kat/10 dark:border-white/10">
            <Users className="h-5 w-5 text-kat" />
          </div>
          <DialogTitle>Auto roles</DialogTitle>
          <DialogDescription>
            Assign roles when members join, boost the server, or react to a panel
            message in a channel you choose.
          </DialogDescription>
        </DialogHeader>

        {noGuild ? (
          <p className="text-sm text-muted-foreground">
            Select a server in the header first.
          </p>
        ) : configLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading settings…
          </div>
        ) : (
          <div className="space-y-5">
            {configError ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {configLoadError instanceof AppError
                  ? configLoadError.message
                  : "Could not load saved settings."}
              </p>
            ) : null}

            {showReactionPanelInfo ? (
              <p className="flex items-start gap-2 rounded-lg border border-kat/30 bg-kat/10 px-3 py-2 text-xs text-kat">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                Panel active in #{reactionPanelChannelName}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setTab(id);
                    setFieldErrors({});
                    setSaveError(null);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                    tab === id
                      ? "border-kat/40 bg-kat/10 text-kat"
                      : "border-black/[0.08] bg-transparent text-muted-foreground hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]",
                    tabHasError(id) &&
                      tab !== id &&
                      "border-destructive/40 text-destructive",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {tab === "join" ? (
              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.08] bg-black/[0.02] px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <div>
                    <p className="text-sm font-medium">Roles on join</p>
                    <p className="text-xs text-muted-foreground">
                      Kat assigns these roles when someone new enters the server
                    </p>
                  </div>
                  <Switch
                    checked={joinEnabled}
                    disabled={formDisabled}
                    onCheckedChange={(v) => setValue("joinEnabled", v)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Roles to assign</Label>
                  <RoleCheckboxList
                    roles={roles}
                    selectedIds={joinRoleIds}
                    isLoading={rolesLoading}
                    onChange={(ids) => setValue("joinRoleIds", ids)}
                  />
                  {fieldErrors.joinRoleIds ? (
                    <p className="text-xs text-destructive">
                      {fieldErrors.joinRoleIds}
                    </p>
                  ) : null}
                </div>

                <TabFooter
                  saving={saveMutation.isPending}
                  disabled={formDisabled}
                  onCancel={() => onOpenChange(false)}
                  onSave={() => void handleSaveTab("join")}
                />
              </section>
            ) : null}

            {tab === "boost" ? (
              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.08] bg-black/[0.02] px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <div>
                    <p className="text-sm font-medium">Roles on boost</p>
                    <p className="text-xs text-muted-foreground">
                      Kat assigns these roles when a member boosts the server
                    </p>
                  </div>
                  <Switch
                    checked={boostEnabled}
                    disabled={formDisabled}
                    onCheckedChange={(v) => setValue("boostEnabled", v)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Booster roles</Label>
                  <RoleCheckboxList
                    roles={roles}
                    selectedIds={boostRoleIds}
                    isLoading={rolesLoading}
                    onChange={(ids) => setValue("boostRoleIds", ids)}
                  />
                  {fieldErrors.boostRoleIds ? (
                    <p className="text-xs text-destructive">
                      {fieldErrors.boostRoleIds}
                    </p>
                  ) : null}
                </div>

                <TabFooter
                  saving={saveMutation.isPending}
                  disabled={formDisabled}
                  onCancel={() => onOpenChange(false)}
                  onSave={() => void handleSaveTab("boost")}
                />
              </section>
            ) : null}

            {tab === "reaction" ? (
              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.08] bg-black/[0.02] px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <div>
                    <p className="text-sm font-medium">Reaction roles</p>
                    <p className="text-xs text-muted-foreground">
                      Kat posts a message and assigns roles when users react (max{" "}
                      {MAX_REACTION_MAPPINGS} emojis)
                    </p>
                  </div>
                  <Switch
                    checked={reactionEnabled}
                    disabled={formDisabled}
                    onCheckedChange={(v) => setValue("reactionEnabled", v)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reactionChannelId">Text channel</Label>
                  <div className="relative">
                    <select
                      id="reactionChannelId"
                      disabled={formDisabled || channelsLoading}
                      className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                        "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        (formDisabled || channelsLoading) && "opacity-60",
                      )}
                      value={reactionChannelId}
                      onChange={(e) => setValue("reactionChannelId", e.target.value)}
                    >
                      <option value="">Select a channel…</option>
                      {channelOptions.map((channel) => (
                        <option key={channel.id} value={channel.id}>
                          #{channel.name}
                        </option>
                      ))}
                    </select>
                    {channelsLoading ? (
                      <Loader2 className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                    ) : null}
                  </div>
                  {fieldErrors.reactionChannelId ? (
                    <p className="text-xs text-destructive">
                      {fieldErrors.reactionChannelId}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reactionMessage">Panel message</Label>
                  <textarea
                    id="reactionMessage"
                    disabled={formDisabled}
                    rows={4}
                    maxLength={2000}
                    placeholder={
                      reactionUseEmbed
                        ? "Embed description. Kat will add the emoji and role list."
                        : "React below to get your roles!"
                    }
                    className={cn(
                      "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                      "ring-offset-background placeholder:text-muted-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                    value={reactionMessage}
                    onChange={(e) => setValue("reactionMessageContent", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Kat sends or updates this panel in the selected channel when you
                    save.
                  </p>
                  {fieldErrors.reactionMessageContent ? (
                    <p className="text-xs text-destructive">
                      {fieldErrors.reactionMessageContent}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-3 rounded-xl border border-black/[0.08] bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Use embed</p>
                      <p className="text-xs text-muted-foreground">
                        Send the panel as a Discord embed instead of plain text
                      </p>
                    </div>
                    <Switch
                      checked={reactionUseEmbed}
                      disabled={formDisabled}
                      onCheckedChange={(v) => setValue("reactionUseEmbed", v)}
                    />
                  </div>

                  {reactionUseEmbed ? (
                    <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
                      <div className="space-y-1.5">
                        <Label htmlFor="reactionEmbedTitle">Embed title</Label>
                        <input
                          id="reactionEmbedTitle"
                          disabled={formDisabled}
                          maxLength={256}
                          placeholder="Elegí tu rol"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                          {...register("reactionEmbedTitle")}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="reactionEmbedColor">Embed color</Label>
                        <input
                          id="reactionEmbedColor"
                          disabled={formDisabled}
                          placeholder="#FF5733"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                          {...register("reactionEmbedColor")}
                        />
                        {fieldErrors.reactionEmbedColor ? (
                          <p className="text-xs text-destructive">
                            {fieldErrors.reactionEmbedColor}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Label>Emoji → role mappings</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={formDisabled || fields.length >= MAX_REACTION_MAPPINGS}
                      onClick={() => append({ emoji: "", roleId: roles[0]?.id ?? "" })}
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Add reaction
                    </Button>
                  </div>

                  {fields.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-black/[0.1] px-3 py-4 text-center text-xs text-muted-foreground dark:border-white/10">
                      No reactions yet. Add up to {MAX_REACTION_MAPPINGS} emoji → role
                      pairs.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {fields.map((field, index) => (
                        <li
                          key={field.id}
                          className="flex flex-wrap items-end gap-2 rounded-xl border border-black/[0.08] p-3 dark:border-white/10 sm:flex-nowrap"
                        >
                          <div className="min-w-[7rem] flex-1 space-y-1">
                            <Label className="text-xs">Emoji</Label>
                            <input
                              disabled={formDisabled}
                              placeholder="🎮 or name:id"
                              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                              {...register(`reactionMappings.${index}.emoji`)}
                            />
                          </div>
                          <div className="min-w-[10rem] flex-[2] space-y-1">
                            <Label className="text-xs">Role</Label>
                            <select
                              disabled={formDisabled || rolesLoading}
                              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                              {...register(`reactionMappings.${index}.roleId`)}
                            >
                              <option value="">Select role…</option>
                              {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                            disabled={formDisabled}
                            onClick={() => remove(index)}
                            aria-label="Remove reaction mapping"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {fieldErrors.reactionMappings ? (
                    <p className="text-xs text-destructive">
                      {fieldErrors.reactionMappings}
                    </p>
                  ) : null}

                  <p className="text-xs text-muted-foreground">
                    Use Unicode emoji (🎮) or custom emoji as{" "}
                    <code className="rounded bg-muted px-1">name:id</code>.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Panel preview</Label>
                  {reactionUseEmbed ? (
                    <div className="rounded-xl border border-black/[0.08] bg-[#313338] p-3 text-sm text-white shadow-sm dark:border-white/10">
                      <div
                        className="rounded-md bg-[#2b2d31] p-3"
                        style={{ borderLeft: `4px solid ${reactionPreviewColor}` }}
                      >
                        {reactionEmbedTitle.trim() ? (
                          <p className="font-semibold text-white">
                            {reactionEmbedTitle.trim()}
                          </p>
                        ) : null}
                        {reactionMessage.trim() ? (
                          <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-[#dbdee1]">
                            {reactionMessage.trim()}
                          </p>
                        ) : null}
                        {reactionPreviewLines.length > 0 ? (
                          <div className="mt-3 space-y-1.5">
                            {reactionPreviewLines.map(({ emoji, role }) => (
                              <div
                                key={`${emoji}-${role.id}`}
                                className="flex items-center gap-2 text-xs"
                              >
                                <span className="w-6 shrink-0 text-center text-base leading-none">
                                  {emoji}
                                </span>
                                <span className="text-[#dbdee1]">gives</span>
                                <span className="rounded bg-[#5865f2]/20 px-1.5 py-0.5 font-medium text-[#c9cdfb]">
                                  @{role.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-black/[0.08] bg-[#313338] p-3 text-sm text-white shadow-sm dark:border-white/10">
                      {reactionMessage.trim() ? (
                        <p className="whitespace-pre-wrap text-xs leading-relaxed text-[#dbdee1]">
                          {reactionMessage.trim()}
                        </p>
                      ) : null}
                      {reactionPreviewLines.length > 0 ? (
                        <div className="mt-3 space-y-1.5">
                          {reactionPreviewLines.map(({ emoji, role }) => (
                            <div
                              key={`${emoji}-${role.id}`}
                              className="flex items-center gap-2 text-xs"
                            >
                              <span className="w-6 shrink-0 text-center text-base leading-none">
                                {emoji}
                              </span>
                              <span className="text-[#dbdee1]">gives</span>
                              <span className="rounded bg-[#5865f2]/20 px-1.5 py-0.5 font-medium text-[#c9cdfb]">
                                @{role.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <TabFooter
                  saving={saveMutation.isPending}
                  disabled={formDisabled}
                  onCancel={() => onOpenChange(false)}
                  onSave={() => void handleSaveTab("reaction")}
                />
              </section>
            ) : null}

            {saveSuccess ? (
              <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                {saveSuccess}
              </p>
            ) : null}

            {saveError ? <p className="text-xs text-destructive">{saveError}</p> : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
