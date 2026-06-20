"use client";

import { memo } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  AlertCircle,
  Crown,
  MessageCircle,
  RefreshCw,
  ScrollText,
  Trophy,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditLogs } from "@/features/activity/hooks/use-audit-logs";
import { useRanking } from "@/features/activity/hooks/use-ranking";
import { cn } from "@/lib/utils";
import { useGuildStore } from "@/store/guild-store";
import type { AuditLogEntry, RankingEntry } from "@/types/activity";
import { formatCompactNumber } from "@/utils/format";

type ActivitySectionProps = {
  guildId?: string;
};

type PodiumTone = "gold" | "silver" | "bronze";

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

const styles = `
  @keyframes podium-shimmer {
    0% { transform: translateX(-100%) skewX(-15deg); }
    60% { transform: translateX(100%) skewX(-15deg); }
    100% { transform: translateX(100%) skewX(-15deg); }
  }
  @keyframes gold-pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.25); }
    50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.55); }
  }
  .podium-shimmer::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%);
    animation: podium-shimmer 4s ease-in-out infinite;
    pointer-events: none;
  }
  .podium-gold-pulse {
    animation: gold-pulse 3s ease-in-out infinite;
  }
`;

const PODIUM_GRADIENTS: Record<PodiumTone, { bg: string; glow: string; ring: string }> = {
  gold: {
    bg: "linear-gradient(135deg, rgba(255,215,0,0.22), rgba(255,140,0,0.10))",
    glow: "0 0 30px rgba(255,215,0,0.3)",
    ring: "#FFD700",
  },
  silver: {
    bg: "linear-gradient(135deg, rgba(192,192,192,0.20), rgba(128,128,128,0.10))",
    glow: "0 0 25px rgba(192,192,192,0.25)",
    ring: "#C0C0C0",
  },
  bronze: {
    bg: "linear-gradient(135deg, rgba(205,127,50,0.20), rgba(139,69,19,0.10))",
    glow: "0 0 25px rgba(205,127,50,0.25)",
    ring: "#CD7F32",
  },
};

function getInitials(username: string) {
  return username
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.at(0)?.toUpperCase())
    .join("");
}

function formatRelativeTimestamp(timestamp: string, justNowLabel = "just now") {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return justNowLabel;

  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];

  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(diffSeconds) >= secondsInUnit || unit === "second") {
      return relativeTimeFormatter.format(
        Math.round(diffSeconds / secondsInUnit),
        unit,
      );
    }
  }

  return relativeTimeFormatter.format(0, "second");
}

function formatFullTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return dateTimeFormatter.format(date);
}

function getActionLabel(action: string, labels: Record<string, string>): string {
  return labels[action.toLowerCase()] ?? action;
}

function getActionBadgeClassName(action: string) {
  const normalizedAction = action.toUpperCase();

  if (["UNBAN", "UNTIMEOUT"].some((value) => normalizedAction.includes(value))) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
  }

  if (["BAN", "KICK"].some((value) => normalizedAction.includes(value))) {
    return "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300";
  }

  if (
    ["TIMEOUT", "MUTE"].some((value) => normalizedAction.includes(value)) &&
    !normalizedAction.includes("UN")
  ) {
    return "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300";
  }

  if (normalizedAction.includes("AUTO_MOD")) {
    return "border-muted-foreground/20 bg-muted text-muted-foreground";
  }

  if (normalizedAction.startsWith("VOICE_")) {
    return "border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-300";
  }

  return "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300";
}

function UserAvatar({
  username,
  avatarUrl,
  className,
  style,
  fallbackInitial = "?",
}: {
  username: string;
  avatarUrl: string | null;
  className?: string;
  style?: React.CSSProperties;
  fallbackInitial?: string;
}) {
  return (
    <Avatar className={cn("h-8 w-8", className)} style={style}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
      <AvatarFallback delayMs={0} className="text-xs font-semibold">
        {getInitials(username) || fallbackInitial}
      </AvatarFallback>
    </Avatar>
  );
}

function ActivityHeader({
  title,
  icon: Icon,
  isFetching,
  onRefresh,
  refreshAria,
}: {
  title: string;
  icon: typeof ScrollText;
  isFetching: boolean;
  onRefresh: () => void;
  refreshAria?: string;
}) {
  const aria = refreshAria ? refreshAria.replace("{title}", title) : `Refresh ${title}`;
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-kat/10 text-kat">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="truncate text-lg font-bold tracking-tight">{title}</h2>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRefresh}
        disabled={isFetching}
        title={aria}
        aria-label={aria}
        className="h-9 w-9 shrink-0"
      >
        <RefreshCw className={cn("h-4 w-4", isFetching ? "animate-spin" : null)} />
      </Button>
    </div>
  );
}

function AuditLogSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="flex gap-3 rounded-xl bg-black/[0.025] p-3 dark:bg-white/[0.03]"
        >
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function AuditLogEntryRow({
  entry,
  actionLabels,
  byPrefix,
  unknown,
  justNowLabel,
  fallbackInitial,
}: {
  entry: AuditLogEntry;
  actionLabels: Record<string, string>;
  byPrefix: string;
  unknown: string;
  justNowLabel: string;
  fallbackInitial: string;
}) {
  return (
    <li className="rounded-xl bg-black/[0.025] p-3 dark:bg-white/[0.03]">
      <div className="flex gap-3">
        <UserAvatar
          username={entry.targetUsername}
          avatarUrl={entry.targetAvatar}
          fallbackInitial={fallbackInitial}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="max-w-[11rem] truncate text-sm font-bold">
              {entry.targetUsername}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "h-5 rounded-md px-1.5 text-[10px]",
                getActionBadgeClassName(entry.action),
              )}
            >
              {getActionLabel(entry.action, actionLabels)}
            </Badge>
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {byPrefix}{entry.executorUsername ?? unknown}
          </p>
          {entry.reason ? (
            <p className="mt-1 truncate text-xs text-foreground/75">{entry.reason}</p>
          ) : null}
        </div>
        <time
          dateTime={entry.createdAt}
          title={formatFullTimestamp(entry.createdAt)}
          className="shrink-0 pt-0.5 text-right text-[11px] text-muted-foreground"
        >
          {formatRelativeTimestamp(entry.createdAt, justNowLabel)}
        </time>
      </div>
    </li>
  );
}

function AuditLogCard({
  logs,
  isLoading,
  isFetching,
  onRefresh,
  actionLabels,
  byPrefix,
  unknown,
  justNowLabel,
  auditLogTitle,
  emptyHeading,
  emptyDescription,
  refreshAria,
  fallbackInitial,
}: {
  logs: AuditLogEntry[];
  isLoading: boolean;
  isFetching: boolean;
  onRefresh: () => void;
  actionLabels: Record<string, string>;
  byPrefix: string;
  unknown: string;
  justNowLabel: string;
  auditLogTitle: string;
  emptyHeading: string;
  emptyDescription: string;
  refreshAria: string;
  fallbackInitial: string;
}) {
  return (
    <section className="dashboard-glass-card min-w-0 p-5 sm:p-6">
      <ActivityHeader
        title={auditLogTitle}
        icon={ScrollText}
        isFetching={isFetching}
        onRefresh={onRefresh}
        refreshAria={refreshAria}
      />

      {isLoading ? (
        <AuditLogSkeleton />
      ) : logs.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-xl bg-black/[0.025] p-6 text-center dark:bg-white/[0.03]">
          <div>
            <AlertCircle className="mx-auto h-7 w-7 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">{emptyHeading}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {emptyDescription}
            </p>
          </div>
        </div>
      ) : (
        <ul className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
          {logs.map((entry) => (
            <AuditLogEntryRow
              key={entry.id}
              entry={entry}
              actionLabels={actionLabels}
              byPrefix={byPrefix}
              unknown={unknown}
              justNowLabel={justNowLabel}
              fallbackInitial={fallbackInitial}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function RankingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-48 rounded-xl" />
        ))}
      </div>
      <div className="space-y-1.5">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[44px] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function PodiumCard({
  entry,
  rank,
  tone,
  primary = false,
  fallbackInitial = "?",
}: {
  entry: RankingEntry;
  rank: number;
  tone: PodiumTone;
  primary?: boolean;
  fallbackInitial?: string;
}) {
  const gradient = PODIUM_GRADIENTS[tone];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-xl border px-4 text-center backdrop-blur-md",
        primary ? "sm:min-h-[190px] sm:-translate-y-2 sm:py-5 py-4" : "py-4",
        rank === 1 ? "border-yellow-500/40 podium-gold-pulse" : rank === 2 ? "border-slate-400/30" : "border-orange-700/30",
        "bg-black/50",
      )}
      style={{
        background: gradient.bg,
        boxShadow: gradient.glow,
      }}
    >
      {rank === 1 ? <div className="podium-shimmer" /> : null}

      {rank === 1 ? (
        <Crown className="mb-1.5 h-6 w-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.7)]" />
      ) : (
        <span
          className={cn(
            "mb-1.5 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black",
            rank === 2
              ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white"
              : "bg-gradient-to-br from-amber-600 to-orange-800 text-white",
          )}
        >
          {rank}
        </span>
      )}

      <UserAvatar
        username={entry.username}
        avatarUrl={entry.avatarUrl}
        className="mx-auto h-11 w-11"
        fallbackInitial={fallbackInitial}
        style={{
          boxShadow: `0 0 0 3px ${gradient.ring}, 0 0 15px ${gradient.ring}55`,
        }}
      />

      <p className="mt-1.5 max-w-full truncate text-sm font-bold text-white leading-tight">
        {entry.username}
      </p>

      <p className="mt-0.5 flex items-center justify-center gap-1 text-[11px] font-bold text-white/70">
        <Zap className="h-3 w-3 text-yellow-400" />
        {formatCompactNumber(entry.messageCount)}
      </p>
    </div>
  );
}

function RankingRow({ entry, rank, fallbackInitial = "?" }: { entry: RankingEntry; rank: number; fallbackInitial?: string }) {
  return (
    <li className="group relative flex items-center gap-3 rounded-xl bg-white/70 px-3 py-2.5 transition-colors hover:bg-white/90 dark:bg-black/[0.18] dark:hover:bg-black/[0.3]">
      {/* Left accent bar */}
      <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-gradient-to-b from-purple-500 to-blue-500 opacity-40 transition-opacity group-hover:opacity-80 dark:opacity-60 dark:group-hover:opacity-100" />

      {/* Rank pill */}
      <span className="flex h-6 w-8 items-center justify-center rounded-md bg-purple-100 font-mono text-xs font-bold text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
        #{rank}
      </span>

      <UserAvatar username={entry.username} avatarUrl={entry.avatarUrl} className="h-8 w-8" fallbackInitial={fallbackInitial} />

      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-800 dark:text-white/90">
        {entry.username}
      </span>

      <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-gray-500 dark:text-white/60">
        <MessageCircle className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
        {formatCompactNumber(entry.messageCount)}
      </span>
    </li>
  );
}

function RankingTableCard({
  rest,
  isFetching,
  onRefresh,
  rankingTitle,
  empty,
  emptySub,
  refreshAria,
  fallbackInitial,
}: {
  rest: RankingEntry[];
  isFetching: boolean;
  onRefresh: () => void;
  rankingTitle: string;
  empty: string;
  emptySub: string;
  refreshAria: string;
  fallbackInitial: string;
}) {
  return (
    <section className="dashboard-glass-card flex min-w-0 flex-1 flex-col p-4 sm:p-5">
      <ActivityHeader
        title={rankingTitle}
        icon={Trophy}
        isFetching={isFetching}
        onRefresh={onRefresh}
        refreshAria={refreshAria}
      />

      {rest.length > 0 ? (
        <ul className="max-h-[280px] flex-1 space-y-1 overflow-y-auto pr-1">
          {rest.map((entry, index) => (
            <RankingRow
              key={entry.userId || `${entry.username}-${index}`}
              entry={entry}
              rank={index + 4}
              fallbackInitial={fallbackInitial}
            />
          ))}
        </ul>
      ) : (
        <div className="flex min-h-[120px] items-center justify-center rounded-xl bg-black/[0.015] p-4 text-center dark:bg-white/[0.02]">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {empty}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground/70">
              {emptySub}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function ActivitySectionComponent({ guildId: guildIdProp }: ActivitySectionProps) {
  const t = useTranslation();
  const selectedGuildId = useGuildStore((s) => s.selectedGuildId);
  const guildId = guildIdProp ?? selectedGuildId ?? null;
  const auditLogsQuery = useAuditLogs(guildId);
  const rankingQuery = useRanking(guildId);

  const rankingData = rankingQuery.data ?? [];
  const first = rankingData[0];
  const second = rankingData[1];
  const third = rankingData[2];
  const rest = rankingData.slice(3);

  return (
    <div className="min-h-0 space-y-4">
      <style>{styles}</style>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-kat">
          {t.activity.sectionLabel}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{t.activity.pageHeading}</h1>
      </div>

      <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)]">
        <AuditLogCard
          logs={auditLogsQuery.data ?? []}
          isLoading={auditLogsQuery.isLoading}
          isFetching={auditLogsQuery.isFetching}
          onRefresh={() => void auditLogsQuery.refetch()}
          actionLabels={t.activity.actionLabels}
          byPrefix={t.activity.auditLogCard.byPrefix}
          unknown={t.activity.auditLogCard.unknown}
          justNowLabel={t.activity.timeAgo.justNow}
          auditLogTitle={t.activity.auditLogCard.title}
          emptyHeading={t.activity.auditLogCard.emptyHeading}
          emptyDescription={t.activity.auditLogCard.emptyDescription}
          refreshAria={t.activity.refreshAria}
          fallbackInitial={t.activity.fallbackInitial}
        />
        <div className="flex h-full min-h-0 flex-col gap-4">
          {rankingQuery.isLoading ? (
            <RankingSkeleton />
          ) : !rankingData.length ? (
            <section className="dashboard-glass-card flex min-h-[260px] items-center justify-center p-6 text-center">
              <div>
                <MessageCircle className="mx-auto h-7 w-7 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">{t.activity.rankingCard.emptyHeading}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t.activity.rankingCard.emptyDescription}
                </p>
              </div>
            </section>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-4">
              {/* Podium — mobile: stacked 1→2→3, desktop: side by side with center taller */}
              <div className="flex flex-col gap-3 sm:grid sm:grid-cols-3 sm:items-end">
                <div className="order-2 sm:order-1">
                  {second ? <PodiumCard entry={second} rank={2} tone="silver" fallbackInitial={t.activity.fallbackInitial} /> : null}
                </div>
                <div className="order-1 sm:order-2">
                  {first ? <PodiumCard entry={first} rank={1} tone="gold" primary fallbackInitial={t.activity.fallbackInitial} /> : null}
                </div>
                <div className="order-3">
                  {third ? <PodiumCard entry={third} rank={3} tone="bronze" fallbackInitial={t.activity.fallbackInitial} /> : null}
                </div>
              </div>
              {/* Ranking table — ranks 4+ inside a glass card, fills remaining space */}
              <RankingTableCard
                rest={rest}
                isFetching={rankingQuery.isFetching}
                onRefresh={() => void rankingQuery.refetch()}
                rankingTitle={t.activity.rankingCard.title}
                empty={t.activity.rankingCard.empty}
                emptySub={t.activity.rankingCard.emptySub}
                refreshAria={t.activity.refreshAria}
                fallbackInitial={t.activity.fallbackInitial}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const ActivitySection = memo(ActivitySectionComponent);
