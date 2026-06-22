"use client";

import { useState, useEffect, useRef } from "react";
import { Settings, Globe, Clock, Download, Trash2, Terminal, ShieldCheck, X, Plus, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { guildService } from "@/services/guild.service";
import { useGuildStore } from "@/store/guild-store";
import { useUiStore } from "@/store/ui-store";
import { useTranslation } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { GuildRole } from "@/features/auto-roles/types/auto-roles-config";

type Tab = "general" | "access";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "pt-BR", label: "Português (Brasil)" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ja", label: "日本語" },
];

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Madrid",
  "Europe/Berlin",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
];

const SNOWFLAKE_RE = /^\d{17,20}$/;

export function GeneralSettingsDialog({
  open,
  onOpenChange,
  guildId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string | null;
}) {
  const [tab, setTab] = useState<Tab>("general");

  // General tab state
  const [cleanOnKick, setCleanOnKick] = useState(false);
  const [prefix, setPrefix] = useState("x");
  const [language, setLanguage] = useState<Locale>("en");
  const [timezone, setTimezone] = useState("UTC");
  const [saving, setSaving] = useState(false);
  const [prefixError, setPrefixError] = useState<string | null>(null);
  const [langError, setLangError] = useState<string | null>(null);

  // Access tab state
  const [roles, setRoles] = useState<GuildRole[]>([]);
  const [allowedRoleIds, setAllowedRoleIds] = useState<string[]>([]);
  const [allowedUserIds, setAllowedUserIds] = useState<string[]>([]);
  const [userIdInput, setUserIdInput] = useState("");
  const [userIdError, setUserIdError] = useState<string | null>(null);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessSaving, setAccessSaving] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const accessLoaded = useRef(false);

  const setLocale = useUiStore((s) => s.setLocale);
  const t = useTranslation();

  useEffect(() => {
    if (!open) {
      setTab("general");
      accessLoaded.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (open && guildId) {
      const currentLocale = useUiStore.getState().locale;
      setLanguage(currentLocale);
      guildService.getSettings(guildId).then((s) => {
        setPrefix(s.prefix ?? "x");
        if (s.locale) setLanguage(s.locale as Locale);
      }).catch(() => {});
    }
  }, [open, guildId]);

  useEffect(() => {
    if (tab === "access" && guildId && !accessLoaded.current) {
      accessLoaded.current = true;
      setAccessLoading(true);
      Promise.all([
        guildService.getGuildRoles(guildId),
        guildService.getDashboardAccess(guildId),
      ]).then(([guildRoles, access]) => {
        setRoles(guildRoles.filter((r) => r.name !== "@everyone"));
        setAllowedRoleIds(access.allowedRoleIds);
        setAllowedUserIds(access.allowedUserIds);
      }).catch(() => {}).finally(() => setAccessLoading(false));
    }
  }, [tab, guildId]);

  const handleSavePrefix = async () => {
    if (!guildId) return;
    setSaving(true);
    setPrefixError(null);
    try {
      await guildService.updateSettings(guildId, { prefix });
    } catch {
      setPrefixError(t.common.error);
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = async (newLocale: Locale) => {
    const previous = language;
    setLanguage(newLocale);
    setLocale(newLocale);
    setLangError(null);
    if (!guildId) return;
    try {
      await guildService.updateSettings(guildId, { locale: newLocale });
    } catch {
      setLanguage(previous);
      setLocale(previous);
      setLangError(t.common.error);
    }
  };

  const toggleRole = (roleId: string) => {
    setAllowedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    );
  };

  const addUserId = () => {
    const id = userIdInput.trim();
    if (!SNOWFLAKE_RE.test(id)) {
      setUserIdError(t.settings.invalidUserId);
      return;
    }
    if (allowedUserIds.includes(id)) {
      setUserIdInput("");
      return;
    }
    setAllowedUserIds((prev) => [...prev, id]);
    setUserIdInput("");
    setUserIdError(null);
  };

  const removeUserId = (id: string) => {
    setAllowedUserIds((prev) => prev.filter((u) => u !== id));
  };

  const handleSaveAccess = async () => {
    if (!guildId) return;
    setAccessSaving(true);
    setAccessError(null);
    try {
      await guildService.saveDashboardAccess(guildId, { allowedRoleIds, allowedUserIds });
    } catch {
      setAccessError(t.common.error);
    } finally {
      setAccessSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/[0.06] dark:bg-white/[0.08]">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <DialogTitle>{t.settings.title}</DialogTitle>
              <DialogDescription>{t.settings.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex gap-1 rounded-xl bg-black/[0.04] p-1 dark:bg-white/[0.04]">
          <button
            type="button"
            onClick={() => setTab("general")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              tab === "general"
                ? "bg-white text-foreground shadow-sm dark:bg-white/[0.1]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Settings className="h-3.5 w-3.5" />
            {t.settings.tabGeneral}
          </button>
          <button
            type="button"
            onClick={() => setTab("access")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              tab === "access"
                ? "bg-white text-foreground shadow-sm dark:bg-white/[0.1]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {t.settings.tabAccess}
          </button>
        </div>

        <div className="max-h-[58vh] overflow-y-auto pr-0.5">
          {tab === "general" ? (
            <div className="space-y-4">
              {/* Clean on Kick */}
              <div className="rounded-2xl bg-black/[0.025] p-4 dark:bg-white/[0.03]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{t.settings.cleanOnKick}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {t.settings.cleanOnKickDesc}
                      </p>
                    </div>
                  </div>
                  <Switch checked={cleanOnKick} onCheckedChange={setCleanOnKick} />
                </div>
              </div>

              {/* Command Prefix */}
              <div className="rounded-2xl bg-black/[0.025] p-4 dark:bg-white/[0.03]">
                <div className="flex items-start gap-3">
                  <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{t.settings.prefix}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {t.settings.prefixDesc}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={prefix}
                        onChange={(e) => { setPrefix(e.target.value); setPrefixError(null); }}
                        maxLength={5}
                        className="flex h-9 w-24 items-center rounded-xl border border-black/[0.08] bg-black/[0.03] px-3 text-sm font-mono outline-none focus:border-kat/50 dark:border-white/10 dark:bg-white/[0.03] dark:focus:border-kat/50"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSavePrefix}
                        disabled={saving || !guildId}
                      >
                        {saving ? t.common.saving : t.common.save}
                      </Button>
                    </div>
                    {prefixError && (
                      <p className="mt-1.5 text-xs text-red-500">{prefixError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Language */}
              <div className="rounded-2xl bg-black/[0.025] p-4 dark:bg-white/[0.03]">
                <div className="flex items-start gap-3">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{t.settings.language}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {t.settings.languageDesc}
                    </p>
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value as Locale)}
                      className="mt-2 flex h-9 w-full items-center rounded-xl border border-black/[0.08] bg-black/[0.03] px-3 text-sm dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                    {langError && (
                      <p className="mt-1.5 text-xs text-red-500">{langError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Timezone */}
              <div className="rounded-2xl bg-black/[0.025] p-4 dark:bg-white/[0.03]">
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{t.settings.timezone}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {t.settings.timezoneDesc}
                    </p>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      disabled
                      className="mt-2 flex h-9 w-full cursor-not-allowed items-center rounded-xl border border-black/[0.08] bg-black/[0.03] px-3 text-sm opacity-60 dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Export */}
              <div className="rounded-2xl bg-black/[0.025] p-4 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{t.settings.export}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {t.settings.exportDesc}
                      </p>
                    </div>
                  </div>
                  <Button type="button" size="sm" variant="outline" className="shrink-0">
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    {t.settings.exportBtn}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Info */}
              <div className="flex gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/[0.06] p-4">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t.settings.accessInfo}
                </p>
              </div>

              {/* Roles */}
              <div className="rounded-2xl bg-black/[0.025] p-4 dark:bg-white/[0.03]">
                <p className="text-sm font-semibold">{t.settings.allowedRoles}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {t.settings.allowedRolesDesc}
                </p>
                <div className="mt-3">
                  {accessLoading ? (
                    <div className="flex flex-wrap gap-1.5">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-7 w-20 animate-pulse rounded-full bg-black/[0.06] dark:bg-white/[0.06]" />
                      ))}
                    </div>
                  ) : roles.length === 0 ? (
                    <p className="text-xs text-muted-foreground">—</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {roles.map((role) => {
                        const selected = allowedRoleIds.includes(role.id);
                        const color = role.color && role.color !== 0
                          ? `#${role.color.toString(16).padStart(6, "0")}`
                          : undefined;
                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => toggleRole(role.id)}
                            className={cn(
                              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                              selected
                                ? "border-transparent bg-kat/15 text-kat dark:bg-kat/20"
                                : "border-black/[0.08] bg-black/[0.03] text-muted-foreground hover:border-black/[0.15] hover:text-foreground dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20",
                            )}
                          >
                            {color && (
                              <span
                                className="h-2 w-2 rounded-full shrink-0"
                                style={{ backgroundColor: color }}
                              />
                            )}
                            {role.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* User IDs */}
              <div className="rounded-2xl bg-black/[0.025] p-4 dark:bg-white/[0.03]">
                <p className="text-sm font-semibold">{t.settings.allowedUsers}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {t.settings.allowedUsersDesc}
                </p>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={userIdInput}
                    onChange={(e) => { setUserIdInput(e.target.value); setUserIdError(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUserId(); } }}
                    placeholder={t.settings.userIdPlaceholder}
                    className="flex h-9 min-w-0 flex-1 rounded-xl border border-black/[0.08] bg-black/[0.03] px-3 text-xs font-mono outline-none focus:border-kat/50 dark:border-white/10 dark:bg-white/[0.03] dark:focus:border-kat/50"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={addUserId}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {userIdError && (
                  <p className="mt-1.5 text-xs text-red-500">{userIdError}</p>
                )}
                {allowedUserIds.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {allowedUserIds.map((id) => (
                      <span
                        key={id}
                        className="flex items-center gap-1 rounded-full border border-black/[0.08] bg-black/[0.03] px-2.5 py-1 text-xs font-mono dark:border-white/10 dark:bg-white/[0.03]"
                      >
                        {id}
                        <button
                          type="button"
                          onClick={() => removeUserId(id)}
                          className="ml-0.5 rounded-full text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Save */}
              <div className="flex items-center justify-between">
                {accessError && <p className="text-xs text-red-500">{accessError}</p>}
                <div className="ml-auto">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveAccess}
                    disabled={accessSaving || !guildId}
                  >
                    {accessSaving ? t.common.saving : t.common.save}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SidebarSettingsButton() {
  const [open, setOpen] = useState(false);
  const selectedGuildId = useGuildStore((s) => s.selectedGuildId);
  const t = useTranslation();

  return (
    <>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t.sidebar.settings}
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kat/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
              "border-black/[0.08] bg-black/[0.03] text-muted-foreground",
              "hover:border-black/[0.12] hover:bg-black/[0.05] hover:text-foreground",
              "dark:border-white/10 dark:bg-white/5",
              "dark:hover:border-white/20 dark:hover:bg-white/10",
            )}
          >
            <Settings className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="border-black/[0.08] bg-background/95 shadow-md backdrop-blur-md dark:border-white/10 dark:shadow-none"
        >
          {t.sidebar.settings}
        </TooltipContent>
      </Tooltip>

      <GeneralSettingsDialog open={open} onOpenChange={setOpen} guildId={selectedGuildId} />
    </>
  );
}
