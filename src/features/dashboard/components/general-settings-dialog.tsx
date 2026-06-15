"use client";

import { useState } from "react";
import { Settings, Globe, Clock, Download, Trash2 } from "lucide-react";
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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [cleanOnKick, setCleanOnKick] = useState(false);
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/[0.06] dark:bg-white/[0.08]">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <DialogTitle>General Settings</DialogTitle>
              <DialogDescription>
                Configure global bot behaviour and preferences.
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
                  <p className="text-sm font-semibold">Clean up on kick</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    Automatically delete all server data (config, warnings, logs)
                    when the bot is removed from the server.
                  </p>
                </div>
              </div>
              <Switch checked={cleanOnKick} onCheckedChange={setCleanOnKick} />
            </div>
          </div>

          {/* Language */}
          <div className="rounded-2xl bg-black/[0.025] p-4 dark:bg-white/[0.03]">
            <div className="flex items-start gap-3">
              <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">Language</p>
                  <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-500">
                    Soon
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  Set the language for both the dashboard and Discord responses.
                </p>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled
                  className="mt-2 flex h-9 w-full cursor-not-allowed items-center rounded-xl border border-black/[0.08] bg-black/[0.03] px-3 text-sm opacity-60 dark:border-white/10 dark:bg-white/[0.03]"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Timezone */}
          <div className="rounded-2xl bg-black/[0.025] p-4 dark:bg-white/[0.03]">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Timezone</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  Used for log timestamps and scheduled actions.
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
                  <p className="text-sm font-semibold">Export configuration</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    Download all server settings as a JSON file.
                  </p>
                </div>
              </div>
              <Button type="button" size="sm" variant="outline" className="shrink-0">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export
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

  return (
    <>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="General settings"
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
          Settings
        </TooltipContent>
      </Tooltip>

      <GeneralSettingsDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
