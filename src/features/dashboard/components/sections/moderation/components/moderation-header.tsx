"use client";

import { Save } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChannelSelect } from "./channel-selector";
import { PremiumBadge } from "./action-rule-card";
import { ScrollText } from "lucide-react";

type ModerationHeaderProps = {
  tab: "free" | "premium" | "security";
  strictness: number;
  onStrictnessChange: (value: number) => void;
  muteMinutes: number;
  onMuteMinutesChange: (value: number) => void;
  logChannelId: string | null;
  onLogChannelChange: (id: string | null) => void;
  premiumLogChannelId: string | null;
  onPremiumLogChannelChange: (id: string | null) => void;
  isPremium: boolean;
  isLoading: boolean;
  isError: boolean;
  saved: boolean;
  isSaving: boolean;
  isSaveError: boolean;
  isLogSaving: boolean;
  logChannelLoading: boolean;
  enabledCount: number;
  premiumCount: number;
  onSave: () => void;
  onRetry: () => void;
  onSaveLogChannels: () => void;
  guildId: string | null | undefined;
};

export function ModerationHeader({
  tab,
  strictness,
  onStrictnessChange,
  muteMinutes,
  onMuteMinutesChange,
  logChannelId,
  onLogChannelChange,
  premiumLogChannelId,
  onPremiumLogChannelChange,
  isPremium,
  isLoading,
  isError,
  saved,
  isSaving,
  isSaveError,
  isLogSaving,
  logChannelLoading,
  enabledCount,
  premiumCount,
  onSave,
  onRetry,
  onSaveLogChannels,
  guildId,
}: ModerationHeaderProps) {
  const t = useTranslation();

  return (
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
                {saved && !isSaving ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 shadow-none dark:text-emerald-400">
                    {t.moderation.header.saved}
                  </Badge>
                ) : null}
                {isError ? (
                  <Button type="button" variant="outline" size="sm" onClick={onRetry}>
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
                    onChange={(event) => onStrictnessChange(Number(event.target.value))}
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
                  onChange={(event) => onMuteMinutesChange(Number(event.target.value))}
                  className="mt-1 h-9"
                />
              </div>
            </div>
            {isSaveError ? (
              <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {t.moderation.header.saveError}
              </p>
            ) : null}
            <Button
              type="button"
              className="mt-4 w-full sm:w-auto"
              disabled={!guildId || isLoading || isSaving}
              onClick={onSave}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? t.moderation.header.saving : t.moderation.header.saveChanges}
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
                  onChange={onLogChannelChange}
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
                  onChange={onPremiumLogChannelChange}
                />
              </div>
              <Button
                type="button"
                size="sm"
                disabled={isLogSaving || logChannelLoading}
                onClick={onSaveLogChannels}
              >
                <Save className="mr-2 h-4 w-4" />
                {isLogSaving ? t.moderation.header.saving : t.moderation.logChannels.save}
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
  );
}
