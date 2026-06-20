"use client";

import { useState, useEffect } from "react";
import { Settings, Globe, Clock, Download, Trash2, Terminal } from "lucide-react";
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

export function GeneralSettingsDialog({
  open,
  onOpenChange,
  guildId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string | null;
}) {
  const [cleanOnKick, setCleanOnKick] = useState(false);
  const [prefix, setPrefix] = useState("x");
  const [language, setLanguage] = useState<Locale>("en");
  const [timezone, setTimezone] = useState("UTC");
  const [saving, setSaving] = useState(false);
  const [prefixError, setPrefixError] = useState<string | null>(null);
  const [langError, setLangError] = useState<string | null>(null);
  const setLocale = useUiStore((s) => s.setLocale);
  const t = useTranslation();

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
              <DialogDescription>
                {t.settings.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
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
