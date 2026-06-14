"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  CalendarDays,
  Crown,
  Hash,
  Loader2,
  Mic2,
  PackageCheck,
  ShieldCheck,
  Tags,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGuildStats } from "@/features/dashboard/hooks/use-guild-stats";
import { useMemberJoinStats } from "@/features/dashboard/hooks/use-member-join-stats";
import { useGuildStore } from "@/store/guild-store";
import { cn } from "@/lib/utils";
import type { GuildStats } from "@/features/dashboard/types/guild-stats";
import type { DailyJoin } from "@/features/dashboard/types/monthly-joins";

const BOOST_GOAL = 33;
const ACTIVITY_DAYS = 365;

const numberFormatter = new Intl.NumberFormat("en-US");

function formatNumber(value: number) {
  return numberFormatter.format(Math.max(0, value));
}

function formatCreatedAt(value: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getBoostTierLabel(level: number) {
  if (level <= 0) return "No boost level";
  return `Level ${level}`;
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

type ActivityDay = {
  date: string;
  joins: number;
  voiceJoins: number;
  tempChannels: number;
  commands: number;
  total: number;
};

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildEmptyActivityDays() {
  const today = new Date();

  return Array.from({ length: ACTIVITY_DAYS }, (_, index): ActivityDay => {
    const date = new Date(today);
    date.setDate(today.getDate() - (ACTIVITY_DAYS - 1 - index));

    return {
      date: toDateKey(date),
      joins: 0,
      voiceJoins: 0,
      tempChannels: 0,
      commands: 0,
      total: 0,
    };
  });
}

function buildActivityDays(stats: GuildStats, joinDays: DailyJoin[]): ActivityDay[] {
  const daysByDate = new Map<string, ActivityDay>();

  for (const day of buildEmptyActivityDays()) {
    daysByDate.set(day.date, day);
  }

  for (const day of joinDays) {
    const date = day.date.slice(0, 10);
    const current = daysByDate.get(date);
    if (!current) continue;
    current.joins = day.count;
    current.total = day.count;
  }

  for (const day of stats.activityDays) {
    const date = day.date.slice(0, 10);
    const current = daysByDate.get(date);
    if (!current) continue;
    current.joins = day.joins || current.joins;
    current.voiceJoins = day.voiceJoins;
    current.tempChannels = day.tempChannels;
    current.commands = day.commands;
    current.total =
      day.total ||
      current.joins + current.voiceJoins + current.tempChannels + current.commands;
  }

  return Array.from(daysByDate.values());
}

type StatCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: typeof Users;
  tone?: "blue" | "violet" | "cyan" | "slate";
  className?: string;
};

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "blue",
  className,
}: StatCardProps) {
  const tones = {
    blue: "bg-kat/10 text-kat",
    violet: "bg-violet-500/10 text-violet-500",
    cyan: "bg-cyan-500/10 text-cyan-500",
    slate: "bg-slate-500/10 text-slate-500",
  };

  return (
    <div
      className={cn(
        "dashboard-glass-card flex min-w-0 flex-col justify-between p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 truncate text-2xl font-black tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            tones[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function BoostStatCard({
  stats,
  className,
}: {
  stats: GuildStats;
  className?: string;
}) {
  const progress = Math.min(stats.boosterCount, BOOST_GOAL);
  const percent = Math.min(100, (progress / BOOST_GOAL) * 100);
  const remaining = Math.max(0, BOOST_GOAL - stats.boosterCount);

  return (
    <div
      className={cn(
        "dashboard-glass-card flex min-w-0 flex-col justify-between p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">
            Server boost
          </p>
          <p className="mt-2 truncate text-2xl font-black tracking-tight">
            {getBoostTierLabel(stats.boostLevel)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatNumber(stats.boosterCount)} boosters
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
          <Crown className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="relative h-2.5 overflow-hidden rounded-full bg-violet-500/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 shadow-[0_0_24px_rgba(139,92,246,0.45)]"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{remaining > 0 ? `${remaining} until 33` : "Goal reached"}</span>
          <span>33+</span>
        </div>
      </div>
    </div>
  );
}

function ModulesPanel({ modules }: { modules: string[] }) {
  return (
    <section className="dashboard-glass-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-kat">
            Active modules
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight">Enabled features</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Modules currently active for this server.
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kat/10 text-kat">
          <PackageCheck className="h-5 w-5" />
        </div>
      </div>

      {modules.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {modules.map((module) => (
            <span
              key={module}
              className="rounded-full bg-kat/10 px-3 py-1 text-xs font-semibold text-kat"
            >
              {module}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl bg-black/[0.025] p-4 text-sm text-muted-foreground dark:bg-white/[0.03]">
          No active modules reported yet.
        </div>
      )}
    </section>
  );
}

const WEEKS_TO_SHOW = 26;

function groupIntoWeeks(days: ActivityDay[]) {
  const weeks: (ActivityDay | null)[][] = [];
  let w: (ActivityDay | null)[] = [];

  for (const day of days) {
    const date = new Date(day.date + "T00:00:00");
    const dow = date.getDay();

    if (dow === 0 && w.length > 0) {
      weeks.push(w);
      w = [];
    }

    if (w.length === 0 && dow > 0 && resultEmpty(weeks, w)) {
      for (let i = 0; i < dow; i++) w.push(null);
    }

    w.push(day);

    if (dow === 6) {
      weeks.push(w);
      w = [];
    }
  }

  if (w.length > 0) weeks.push(w);
  return weeks;
}

function resultEmpty(weeks: unknown[][], w: unknown[]) {
  return weeks.length === 0 && w.length === 0;
}

function getMonthLabel(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleString("en-US", { month: "short" });
}

const DAY_LABELS: (string | null)[] = [null, "Mon", null, "Wed", null, "Fri", null];
const CELL = "h-3 w-3 rounded-[3px] ring-1 ring-black/[0.04] transition-transform hover:scale-110 dark:ring-white/10 sm:h-3.5 sm:w-3.5";

function ActivityYearPanel({ days }: { days: ActivityDay[] }) {
  const total = days.reduce((sum, d) => sum + d.total, 0);
  const joinsTotal = days.reduce((sum, d) => sum + d.joins, 0);
  const voiceTotal = days.reduce((sum, d) => sum + d.voiceJoins, 0);
  const max = Math.max(1, ...days.map((d) => d.total));

  const getTone = (count: number) => {
    if (count <= 0) return "bg-slate-200/70 dark:bg-slate-800";
    const i = count / max;
    if (i < 0.25) return "bg-sky-200 dark:bg-sky-900";
    if (i < 0.5) return "bg-sky-300 dark:bg-sky-700";
    if (i < 0.75) return "bg-sky-500 dark:bg-sky-500";
    return "bg-blue-600 dark:bg-blue-400";
  };

  const allWeeks = useMemo(() => groupIntoWeeks(days), [days]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleWeeks, setVisibleWeeks] = useState(WEEKS_TO_SHOW);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const calc = () => {
      const cellW = 14 + 4;
      const pad = 36 + 8;
      const n = Math.max(8, Math.floor((el.clientWidth - pad) / cellW));
      setVisibleWeeks(n);
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const visible = useMemo(() => {
    if (allWeeks.length <= visibleWeeks) return allWeeks;
    return allWeeks.slice(-visibleWeeks);
  }, [allWeeks, visibleWeeks]);

  const monthLabels = useMemo(() => {
    const labels: { label: string; span: number }[] = [];
    let cur = "";
    for (const week of visible) {
      const first = week.find((d): d is ActivityDay => d !== null);
      const m = first ? getMonthLabel(first.date) : "";
      if (m !== cur) {
        cur = m;
        labels.push({ label: m, span: 1 });
      } else {
        labels[labels.length - 1]!.span++;
      }
    }
    return labels;
  }, [visible]);

  const gapPx = 4;
  const cellPx = 14;
  const colW = cellPx + gapPx;
  const dayLabelW = 36;

  return (
    <section className="dashboard-glass-card min-w-0 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-kat">
            Year activity
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight">
            {formatNumber(total)} tracked actions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Joins now, plus voice and bot events when the backend reports them.
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kat/10 text-kat">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5" ref={containerRef}>
        <div className="flex" style={{ marginLeft: dayLabelW, marginBottom: 2 }}>
          {monthLabels.map((ml, i) => (
            <div
              key={i}
              style={{ width: ml.span * colW - gapPx }}
              className="shrink-0 text-[10px] font-medium text-muted-foreground"
            >
              {ml.label}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          <div className="flex shrink-0 flex-col gap-1" style={{ width: dayLabelW - 4 }}>
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                className="flex h-3 items-start justify-end pr-1 text-[10px] leading-none text-muted-foreground sm:h-3.5"
              >
                {label ?? ""}
              </div>
            ))}
          </div>

          {visible.map((week, wi) => (
            <div key={wi} className="grid shrink-0 grid-rows-7 gap-1">
              {week.map((day, di) =>
                day ? (
                  <span
                    key={day.date}
                    title={`${formatShortDate(day.date)}: ${day.total} total, ${day.joins} joins, ${day.voiceJoins} voice joins`}
                    className={cn(CELL, getTone(day.total))}
                  />
                ) : (
                  <span key={di} className={cn(CELL, "opacity-0")} />
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <span>{formatNumber(joinsTotal)} joins</span>
          <span>{formatNumber(voiceTotal)} voice joins</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <span
                key={level}
                className={cn(
                  "h-3 w-3 rounded-[3px] ring-1 ring-black/[0.04] dark:ring-white/10",
                  level === 0 && "bg-slate-200/70 dark:bg-slate-800",
                  level === 1 && "bg-sky-200 dark:bg-sky-900",
                  level === 2 && "bg-sky-300 dark:bg-sky-700",
                  level === 3 && "bg-sky-500 dark:bg-sky-500",
                  level === 4 && "bg-blue-600 dark:bg-blue-400",
                )}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </section>
  );
}

function StatisticsContent({
  stats,
  joinDays,
}: {
  stats: GuildStats;
  joinDays: DailyJoin[];
}) {
  const activityDays = buildActivityDays(stats, joinDays);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Members"
          value={formatNumber(stats.totalMembers)}
          detail="Total community size"
          icon={Users}
          tone="blue"
        />
        <StatCard
          title="Roles"
          value={formatNumber(stats.totalRoles)}
          detail="Discord roles in server"
          icon={Tags}
          tone="cyan"
        />
        <StatCard
          title="Custom roles"
          value={formatNumber(stats.activeCustomRoles)}
          detail="Active booster roles"
          icon={ShieldCheck}
          tone="violet"
        />
        <StatCard
          title="Voice joins"
          value={formatNumber(stats.voiceJoinsThisMonth)}
          detail="Tracked this month"
          icon={Mic2}
          tone="cyan"
        />
        <StatCard
          title="Created"
          value={formatCreatedAt(stats.createdAt)}
          detail="Server creation date"
          icon={CalendarDays}
          tone="slate"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[3.15fr_repeat(4,minmax(0,1fr))]">
        <BoostStatCard stats={stats} className="h-[13rem]" />
        <StatCard
          title="Text channels"
          value={formatNumber(stats.totalTextChannels)}
          detail="Channels for chat and panels"
          icon={Hash}
          tone="blue"
          className="h-[13rem]"
        />
        <StatCard
          title="Voice channels"
          value={formatNumber(stats.totalVoiceChannels)}
          detail="Voice and temporary spaces"
          icon={Mic2}
          tone="cyan"
          className="h-[13rem]"
        />
        <StatCard
          title="Temp channels"
          value={formatNumber(stats.tempChannelsCreatedThisMonth)}
          detail="Created this month"
          icon={Activity}
          tone="blue"
          className="h-[13rem]"
        />
        <StatCard
          title="Commands"
          value={formatNumber(stats.commandsUsedThisMonth)}
          detail="Used this month"
          icon={TrendingUp}
          tone="slate"
          className="h-[13rem]"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ActivityYearPanel days={activityDays} />
        <ModulesPanel modules={stats.activeModules} />
      </div>
    </div>
  );
}

function StatisticsSectionComponent() {
  const selectedGuildId = useGuildStore((s) => s.selectedGuildId);
  const { data: stats, isLoading, isError, refetch } = useGuildStats(selectedGuildId);
  const { data: joinStats } = useMemberJoinStats(selectedGuildId, ACTIVITY_DAYS);

  if (!selectedGuildId) {
    return (
      <div className="dashboard-glass-card flex min-h-[280px] items-center justify-center p-6 text-center">
        <div>
          <Activity className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">Select a server first</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Statistics need a guild context.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading && !stats) {
    return (
      <div className="dashboard-glass-card flex min-h-[280px] items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading server statistics...
      </div>
    );
  }

  if (isError && !stats) {
    return (
      <div className="dashboard-glass-card flex min-h-[280px] items-center justify-center p-6 text-center">
        <div>
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <p className="mt-3 text-sm font-medium">Could not load statistics</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Check the backend endpoint and try again.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => void refetch()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return <StatisticsContent stats={stats} joinDays={joinStats?.days ?? []} />;
}

export const StatisticsSection = memo(StatisticsSectionComponent);
