"use client";

import { Crown } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
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
import { cn } from "@/lib/utils";
import { RULE_PREMIUM } from "@/types/moderation";
import type { ModerationMode, ModerationRule, RuleId } from "../types";
import { ACTIONS, usesTimeout } from "../types";

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

export function PunishmentDialog({
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
