"use client";

import { memo } from "react";
import {
  AlertCircle,
  Crown,
  ListFilter,
  Plus,
  Save,
  Scan,
  Shield,
  ToggleLeft,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useGuildStore } from "@/store/guild-store";
import type { ModPermissions, NukeConfig, PurgeConfig } from "@/types/moderation";
import { useModerationPage } from "./moderation/hooks/use-moderation-page";
import { ModerationHeader } from "./moderation/components/moderation-header";
import { ActionRuleCard } from "./moderation/components/action-rule-card";
import { PunishmentDialog } from "./moderation/components/punishment-dialog";
import { WhitelistDialog } from "./moderation/components/whitelist-dialog";
import { CommandRoleSelect, SingleRoleSelect, UserTagInput } from "./moderation/components/command-role-select";
import { emptyPermissions, defaultPurgeConfig, defaultNukeConfig } from "./moderation/types";

const SecurityScanner = dynamic(
  () => import("@/features/moderation/components/security-scanner").then((m) => ({ default: m.SecurityScanner })),
  { ssr: false },
);
const AntiRaidPanel = dynamic(
  () => import("@/features/moderation/components/anti-raid-panel").then((m) => ({ default: m.AntiRaidPanel })),
  { ssr: false },
);

type ModerationSectionProps = {
  guildId?: string;
};

function ModerationSectionComponent({ guildId: guildIdProp }: ModerationSectionProps) {
  const t = useTranslation();
  const selectedGuildId = useGuildStore((s) => s.selectedGuildId);
  const guildId = guildIdProp ?? selectedGuildId;

  const page = useModerationPage(guildId);

  return (
    <div className="space-y-4">
      <ModerationHeader
        tab={page.tab}
        strictness={page.strictness}
        onStrictnessChange={page.handleStrictnessChange}
        muteMinutes={page.muteMinutes}
        onMuteMinutesChange={page.handleMuteMinutesChange}
        logChannelId={page.logChannelId}
        onLogChannelChange={page.setLogChannelId}
        premiumLogChannelId={page.premiumLogChannelId}
        onPremiumLogChannelChange={page.setPremiumLogChannelId}
        isPremium={page.isPremium}
        isLoading={page.isLoading}
        isError={page.isError}
        saved={page.saved}
        isSaving={page.saveMutation.isPending}
        isSaveError={page.saveMutation.isError}
        isLogSaving={page.saveLogChannelMut.isPending}
        logChannelLoading={page.logChannelLoading}
        enabledCount={page.enabledCount}
        premiumCount={page.premiumCount}
        onSave={page.saveDraft}
        onRetry={() => void page.refetch()}
        onSaveLogChannels={page.saveLogChannels}
        guildId={guildId}
      />

      <div className="flex gap-1 rounded-2xl bg-black/[0.03] p-1 dark:bg-white/[0.05]">
        <button
          type="button"
          onClick={() => page.setTab("free")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
            page.tab === "free"
              ? "bg-background text-kat shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Shield className="h-4 w-4" />
          {t.moderation.tabs.free}
          <span className="ml-1 rounded-full bg-kat/10 px-1.5 py-0.5 text-[10px] font-bold text-kat">
            {page.freeRules.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => page.setTab("premium")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
            page.tab === "premium"
              ? "bg-background text-violet-500 shadow-sm"
              : "text-muted-foreground hover:text-violet-400",
          )}
        >
          <Crown className="h-4 w-4" />
          {t.moderation.tabs.premium}
          {!page.isPremium && page.tab !== "premium" ? (
            <Crown className="h-3.5 w-3.5 text-amber-500" />
          ) : null}
          <span className="ml-1 rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-bold text-violet-500">
            {page.premiumRules.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => page.setTab("security")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
            page.tab === "security"
              ? "bg-background text-rose-500 shadow-sm"
              : "text-muted-foreground hover:text-rose-400",
          )}
        >
          <Scan className="h-4 w-4" />
          {t.moderation.tabs.securityScan}
        </button>
      </div>

      {page.tab !== "security" ? (
        <section className="grid gap-4 lg:grid-cols-[1fr_minmax(340px,420px)]">
          <div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {page.paginatedRules.map((rule) => (
                <ActionRuleCard
                  key={rule.id}
                  rule={rule}
                  onOpen={(nextRule) => page.setSelectedRuleId(nextRule.id)}
                  onToggle={(id, enabled) => page.updateRule(id, { enabled })}
                />
              ))}
            </div>
            {page.totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page.safePage === 0}
                  onClick={() => page.setRulePage((prev) => Math.max(0, prev - 1))}
                >
                  {t.moderation.pagination.previous}
                </Button>
                {Array.from({ length: page.totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    type="button"
                    variant={page.safePage === i ? "default" : "outline"}
                    size="sm"
                    className="min-w-[36px]"
                    onClick={() => page.setRulePage(i)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page.safePage >= page.totalPages - 1}
                  onClick={() => page.setRulePage((prev) => Math.min(page.totalPages - 1, prev + 1))}
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
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => page.setWhitelistOpen(true)}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="mt-3 max-h-40 overflow-y-auto space-y-1.5">
                {page.whitelistLoading ? (
                  <p className="text-xs text-muted-foreground animate-pulse">{t.moderation.header.loading}</p>
                ) : !page.whitelistData || page.whitelistData.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t.moderation.whitelist.empty}</p>
                ) : (
                  page.whitelistData.map((entry) => (
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
                        onClick={() => { if (entry.id) page.removeWhitelistEntry.mutate(entry.id); }}
                        className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <WhitelistDialog
                open={page.whitelistOpen}
                onOpenChange={page.setWhitelistOpen}
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
                    value={page.newFilterPattern}
                    onChange={(e) => page.setNewFilterPattern(e.target.value)}
                    placeholder={t.moderation.filters.placeholder}
                    className="h-8 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); page.addFilter(); }
                    }}
                  />
                  <Button type="button" size="icon" className="h-8 w-8 shrink-0" onClick={page.addFilter} disabled={page.addFilterMut.isPending || !page.newFilterPattern.trim()}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {page.filtersLoading ? (
                    <p className="text-xs text-muted-foreground animate-pulse">{t.moderation.header.loading}</p>
                  ) : !page.filtersData || page.filtersData.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{t.moderation.filters.empty}</p>
                  ) : (
                    page.filtersData.map((filter) => (
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
                          onClick={() => { if (filter.id) page.deleteFilterMut.mutate(filter.id); }}
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
                {page.autoPunishLoading ? (
                  <p className="text-xs text-muted-foreground animate-pulse">{t.moderation.header.loading}</p>
                ) : !page.autoPunishData || page.autoPunishData.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t.moderation.autoPunishment.empty}</p>
                ) : (
                  page.autoPunishData.map((ap, idx) => (
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
        <div className="flex flex-col gap-8">
          <AntiRaidPanel guildId={guildId} />
          <SecurityScanner guildId={guildId} />
        </div>
      ) : null}

      {page.tab !== "security" ? (
        <section className="grid gap-4 md:grid-cols-2">
          <div className={cn("dashboard-glass-card p-5 sm:p-6", !page.isPremium && "relative")}>
            {!page.isPremium ? (
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
            {page.permissionsLoading ? (
              <div className="mt-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-xl bg-white/[0.05]" />
                ))}
              </div>
            ) : (
              <div className={cn("mt-4 space-y-4", !page.isPremium && "pointer-events-none opacity-50")}>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(emptyPermissions) as (keyof ModPermissions)[]).map((cmd) => (
                    <div
                      key={cmd}
                      className="rounded-xl bg-black/[0.025] p-2 dark:bg-white/[0.03]"
                    >
                      <p className="mb-1.5 text-xs font-semibold text-kat">{cmd}</p>
                      <CommandRoleSelect
                        roles={page.guildRoles}
                        selectedIds={(page.permissions ?? emptyPermissions)[cmd]}
                        isLoading={page.rolesLoading}
                        onChange={(ids) =>
                          page.setPermissions((prev) =>
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
                      roles={page.guildRoles}
                      selectedId={(page.nukeConfig ?? defaultNukeConfig).allowedRoleId}
                      isLoading={page.rolesLoading}
                      onChange={(id) =>
                        page.setNukeConfig((prev): NukeConfig =>
                          prev
                            ? { ...prev, allowedRoleId: id }
                            : { ...defaultNukeConfig, allowedRoleId: id },
                        )
                      }
                    />
                    <UserTagInput
                      guildId={guildId ?? ""}
                      userIds={(page.nukeConfig ?? defaultNukeConfig).allowedUserIds}
                      onChange={(ids) =>
                        page.setNukeConfig((prev): NukeConfig =>
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
                    disabled={page.savePermissions.isPending || page.saveNuke.isPending || !page.permissions || !page.isPremium}
                    onClick={page.savePermissionsAndNuke}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {page.savePermissions.isPending || page.saveNuke.isPending ? t.moderation.header.saving : t.moderation.logChannels.save}
                  </Button>
                  {page.savePermissions.isError || page.saveNuke.isError ? (
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
            {page.purgeLoading ? (
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
                    checked={(page.purgeConfig ?? defaultPurgeConfig).enabled}
                    onCheckedChange={(enabled) =>
                      page.setPurgeConfig((prev): PurgeConfig =>
                        prev ? { ...prev, enabled } : { ...defaultPurgeConfig, enabled },
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowed-role">{t.moderation.purgeCommand.allowedRole}</Label>
                  <select
                    id="allowed-role"
                    value={(page.purgeConfig ?? defaultPurgeConfig).allowedRoleId ?? ""}
                    onChange={(e) =>
                      page.setPurgeConfig((prev): PurgeConfig =>
                        prev
                          ? { ...prev, allowedRoleId: e.target.value || null }
                          : { ...defaultPurgeConfig, allowedRoleId: e.target.value || null },
                      )
                    }
                    className="flex h-10 w-full rounded-xl border border-black/[0.08] bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
                  >
                    <option value="">{t.moderation.purgeCommand.noRole}</option>
                    {page.guildRoles.map((role) => (
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
                      value={(page.purgeConfig ?? defaultPurgeConfig).maxMessages}
                      onChange={(e) =>
                        page.setPurgeConfig((prev): PurgeConfig =>
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
                      value={(page.purgeConfig ?? defaultPurgeConfig).maxAgeSeconds}
                      onChange={(e) =>
                        page.setPurgeConfig((prev): PurgeConfig =>
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
                  disabled={page.savePurge.isPending || !page.purgeConfig}
                  onClick={() => {
                    if (!page.purgeConfig) return;
                    page.savePurge.mutate(page.purgeConfig);
                  }}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {page.savePurge.isPending ? t.moderation.header.saving : t.moderation.logChannels.save}
                </Button>
                {page.savePurge.isError ? (
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
              {page.purgeLoading ? (
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
                      checked={(page.purgeConfig ?? defaultPurgeConfig).purgeUserEnabled}
                      onCheckedChange={(enabled) =>
                        page.setPurgeConfig((prev): PurgeConfig =>
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
                        value={(page.purgeConfig ?? defaultPurgeConfig).purgeUserAllowedRoleId ?? ""}
                        onChange={(e) =>
                          page.setPurgeConfig((prev): PurgeConfig =>
                            prev
                              ? { ...prev, purgeUserAllowedRoleId: e.target.value || null }
                              : { ...defaultPurgeConfig, purgeUserAllowedRoleId: e.target.value || null },
                          )
                        }
                        className="flex h-10 w-full rounded-xl border border-black/[0.08] bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
                      >
                        <option value="">{t.moderation.purgeCommand.xpurgeNoRole}</option>
                        {page.guildRoles.map((role) => (
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
                        value={(page.purgeConfig ?? defaultPurgeConfig).purgeUserAllowedUserId ?? ""}
                        onChange={(e) =>
                          page.setPurgeConfig((prev): PurgeConfig =>
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
                        value={(page.purgeConfig ?? defaultPurgeConfig).purgeUserMaxMessages}
                        onChange={(e) =>
                          page.setPurgeConfig((prev): PurgeConfig =>
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
                        value={(page.purgeConfig ?? defaultPurgeConfig).purgeUserMaxAgeSeconds}
                        onChange={(e) =>
                          page.setPurgeConfig((prev): PurgeConfig =>
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
                    disabled={page.savePurge.isPending || !page.purgeConfig}
                    onClick={() => {
                      if (!page.purgeConfig) return;
                      page.savePurge.mutate(page.purgeConfig);
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {page.savePurge.isPending ? t.moderation.header.saving : t.moderation.logChannels.save}
                  </Button>
                  {page.savePurge.isError ? (
                    <p className="mt-2 text-sm text-destructive">{t.moderation.purgeCommand.xpurgeSaveError}</p>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <PunishmentDialog
        rule={page.selectedRule}
        open={page.selectedRuleId !== null}
        onOpenChange={(open) => { if (!open) page.setSelectedRuleId(null); }}
        onUpdate={page.updateRule}
      />
    </div>
  );
}

export const ModerationSection = memo(ModerationSectionComponent);
