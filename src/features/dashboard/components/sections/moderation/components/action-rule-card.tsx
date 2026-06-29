"use client";

import { Crown } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { RULE_PREMIUM } from "@/types/moderation";
import type { ModerationRule, RuleId } from "../types";
import { getActionLabel } from "../types";

export function PremiumBadge() {
  const t = useTranslation();
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-500">
      <Crown className="h-3 w-3" />
      {t.moderation.badges.premium}
    </span>
  );
}

export function FreeBadge() {
  const t = useTranslation();
  return (
    <span className="rounded-full bg-kat/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-kat">
      {t.moderation.badges.free}
    </span>
  );
}

export function ActionRuleCard({
  rule,
  onOpen,
  onToggle,
}: {
  rule: ModerationRule;
  onOpen: (rule: ModerationRule) => void;
  onToggle: (id: RuleId, enabled: boolean) => void;
}) {
  const t = useTranslation();
  const Icon = rule.icon;
  const premium = RULE_PREMIUM[rule.apiType];

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
              <h3 className="truncate text-sm font-bold">{t.moderation.rules[rule.id].title}</h3>
              {premium ? <PremiumBadge /> : <FreeBadge />}
            </div>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {t.moderation.rules[rule.id].description}
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
          {getActionLabel(rule.mode, t)}
        </span>
        <span className={rule.enabled ? "text-emerald-500" : "text-muted-foreground"}>
          {rule.enabled ? t.moderation.ruleTile.active : t.moderation.ruleTile.paused}
        </span>
      </div>
    </article>
  );
}
