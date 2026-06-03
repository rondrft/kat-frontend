"use client";

import { memo } from "react";
import {
  AlertCircle,
  MessageCircle,
  RefreshCw,
  ScrollText,
  Trophy,
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

const PODIUM_TONES: Record<
  PodiumTone,
  {
    accent: string;
    ring: string;
    text: string;
  }
> = {
  gold: {
    accent: "bg-amber-400/15",
    ring: "ring-amber-400/40",
    text: "text-amber-600 dark:text-amber-300",
  },
  silver: {
    accent: "bg-slate-300/20",
    ring: "ring-slate-300/50",
    text: "text-slate-600 dark:text-slate-200",
  },
  bronze: {
    accent: "bg-orange-500/15",
    ring: "ring-orange-500/40",
    text: "text-orange-700 dark:text-orange-300",
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

function formatRelativeTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "just now";

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

  return "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300";
}

function UserAvatar({
  username,
  avatarUrl,
  className,
}: {
  username: string;
  avatarUrl: string | null;
  className?: string;
}) {
  return (
    <Avatar className={cn("h-8 w-8", className)}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
      <AvatarFallback delayMs={0} className="text-xs font-semibold">
        {getInitials(username) || "?"}
      </AvatarFallback>
    </Avatar>
  );
}

function ActivityHeader({
  title,
  icon: Icon,
  isFetching,
  onRefresh,
}: {
  title: string;
  icon: typeof ScrollText;
  isFetching: boolean;
  onRefresh: () => void;
}) {
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
        title={`Refresh ${title}`}
        aria-label={`Refresh ${title}`}
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

function AuditLogEntryRow({ entry }: { entry: AuditLogEntry }) {
  return (
    <li className="rounded-xl bg-black/[0.025] p-3 dark:bg-white/[0.03]">
      <div className="flex gap-3">
        <UserAvatar username={entry.targetUsername} avatarUrl={entry.targetAvatarUrl} />
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
              {entry.action}
            </Badge>
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            by {entry.executorUsername}
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
          {formatRelativeTimestamp(entry.createdAt)}
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
}: {
  logs: AuditLogEntry[];
  isLoading: boolean;
  isFetching: boolean;
  onRefresh: () => void;
}) {
  return (
    <section className="dashboard-glass-card min-w-0 p-5 sm:p-6">
      <ActivityHeader
        title="Audit Log"
        icon={ScrollText}
        isFetching={isFetching}
        onRefresh={onRefresh}
      />

      {isLoading ? (
        <AuditLogSkeleton />
      ) : logs.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-xl bg-black/[0.025] p-6 text-center dark:bg-white/[0.03]">
          <div>
            <AlertCircle className="mx-auto h-7 w-7 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No audit logs yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Moderation events will appear here.
            </p>
          </div>
        </div>
      ) : (
        <ul className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
          {logs.map((entry) => (
            <AuditLogEntryRow key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </section>
  );
}

function RankingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-xl" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12 rounded-xl" />
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
}: {
  entry: RankingEntry;
  rank: number;
  tone: PodiumTone;
  primary?: boolean;
}) {
  const toneConfig = PODIUM_TONES[tone];

  return (
    <div
      className={cn(
        "flex min-h-[150px] flex-col items-center justify-center rounded-xl border border-black/[0.06] p-4 text-center dark:border-white/10",
        toneConfig.accent,
        primary ? "sm:min-h-[178px] sm:-translate-y-2" : "sm:mt-6",
      )}
    >
      <span className={cn("text-xs font-bold uppercase", toneConfig.text)}>
        #{rank}
      </span>
      <UserAvatar
        username={entry.username}
        avatarUrl={entry.avatarUrl}
        className={cn(
          "mt-3 h-14 w-14 ring-4",
          toneConfig.ring,
          primary ? "sm:h-16 sm:w-16" : null,
        )}
      />
      <p className="mt-3 max-w-full truncate text-sm font-bold">{entry.username}</p>
      <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
        <MessageCircle className="h-3.5 w-3.5" />
        {formatCompactNumber(entry.messageCount)}
      </p>
    </div>
  );
}

function RankingRow({ entry, rank }: { entry: RankingEntry; rank: number }) {
  return (
    <li className="flex items-center gap-3 rounded-xl bg-black/[0.025] p-3 dark:bg-white/[0.03]">
      <span className="w-8 shrink-0 text-sm font-bold text-muted-foreground">
        #{rank}
      </span>
      <UserAvatar username={entry.username} avatarUrl={entry.avatarUrl} />
      <span className="min-w-0 flex-1 truncate text-sm font-semibold">
        {entry.username}
      </span>
      <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-muted-foreground">
        <MessageCircle className="h-4 w-4" />
        {formatCompactNumber(entry.messageCount)}
      </span>
    </li>
  );
}

function RankingCard({
  ranking,
  isLoading,
  isFetching,
  onRefresh,
}: {
  ranking: RankingEntry[];
  isLoading: boolean;
  isFetching: boolean;
  onRefresh: () => void;
}) {
  const first = ranking[0];
  const second = ranking[1];
  const third = ranking[2];
  const rest = ranking.slice(3);

  return (
    <section className="dashboard-glass-card min-w-0 p-5 sm:p-6">
      <ActivityHeader
        title="Message Ranking"
        icon={Trophy}
        isFetching={isFetching}
        onRefresh={onRefresh}
      />

      {isLoading ? (
        <RankingSkeleton />
      ) : ranking.length === 0 ? (
        <div className="flex min-h-[260px] items-center justify-center rounded-xl bg-black/[0.025] p-6 text-center dark:bg-white/[0.03]">
          <div>
            <MessageCircle className="mx-auto h-7 w-7 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No ranking data yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Member message counts will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid items-end gap-3 sm:grid-cols-3">
            {second ? <PodiumCard entry={second} rank={2} tone="silver" /> : <div />}
            {first ? <PodiumCard entry={first} rank={1} tone="gold" primary /> : null}
            {third ? <PodiumCard entry={third} rank={3} tone="bronze" /> : <div />}
          </div>

          {rest.length > 0 ? (
            <ul className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
              {rest.map((entry, index) => (
                <RankingRow
                  key={entry.userId || `${entry.username}-${index}`}
                  entry={entry}
                  rank={index + 4}
                />
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </section>
  );
}

function ActivitySectionComponent({ guildId: guildIdProp }: ActivitySectionProps) {
  const selectedGuildId = useGuildStore((s) => s.selectedGuildId);
  const guildId = guildIdProp ?? selectedGuildId ?? null;
  const auditLogsQuery = useAuditLogs(guildId);
  const rankingQuery = useRanking(guildId);

  return (
    <div className="min-h-0 space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-kat">
          Activity
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Server activity</h1>
      </div>

      <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)]">
        <AuditLogCard
          logs={auditLogsQuery.data ?? []}
          isLoading={auditLogsQuery.isLoading}
          isFetching={auditLogsQuery.isFetching}
          onRefresh={() => void auditLogsQuery.refetch()}
        />
        <RankingCard
          ranking={rankingQuery.data ?? []}
          isLoading={rankingQuery.isLoading}
          isFetching={rankingQuery.isFetching}
          onRefresh={() => void rankingQuery.refetch()}
        />
      </div>
    </div>
  );
}

export const ActivitySection = memo(ActivitySectionComponent);
