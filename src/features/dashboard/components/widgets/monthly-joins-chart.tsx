"use client";

import { memo, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { buildEmptyMonthDays } from "@/features/dashboard/lib/chart-days";
import type { MonthlyJoinStats } from "@/features/dashboard/types/monthly-joins";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/utils";

const CHART_GRADIENT_ID = "kat-monthly-joins-gradient";
const CHART_AREA_HEIGHT = "h-[11.5rem]";

type MonthlyJoinsChartProps = {
  stats?: MonthlyJoinStats;
  isPending?: boolean;
  isError?: boolean;
  hasGuild?: boolean;
  className?: string;
};

function MonthlyJoinsChartComponent({
  stats,
  isPending = false,
  isError = false,
  hasGuild = true,
  className,
}: MonthlyJoinsChartProps) {
  const t = useTranslation();
  const showSkeleton = hasGuild && isPending && !stats;

  const { points, maxCount, total, hasActivity } = useMemo(() => {
    const days = stats?.days?.length ? stats.days : buildEmptyMonthDays();
    const max = Math.max(1, ...days.map((d) => d.count));
    const sum = stats?.total ?? days.reduce((acc, d) => acc + d.count, 0);
    return {
      points: days,
      maxCount: max,
      total: sum,
      hasActivity: days.some((d) => d.count > 0),
    };
  }, [stats]);

  const chartWidth = 100;
  const chartHeight = 100;
  const padding = { top: 8, right: 4, bottom: 4, left: 4 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;
  const barWidth = innerW / points.length;
  const gap = Math.min(barWidth * 0.28, 1.2);

  return (
    <article
      className={cn(
        "dashboard-glass-card flex h-[23rem] shrink-0 flex-col p-5 sm:h-[24rem] sm:p-6",
        className,
      )}
      aria-label={t.overview.monthlyJoinsChart.ariaLabel}
    >
      <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t.overview.monthlyJoinsChart.header}
          </p>
          <p className="mt-1 font-hero text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {showSkeleton ? "—" : total}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">{t.overview.monthlyJoinsChart.metric}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/[0.08] bg-kat/10 dark:border-white/10">
          <TrendingUp className="h-5 w-5 text-kat" strokeWidth={1.75} />
        </div>
      </div>

      <div className={cn("relative w-full shrink-0", CHART_AREA_HEIGHT)}>
        {!hasGuild ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
            {t.overview.monthlyJoinsChart.noGuild}
          </div>
        ) : showSkeleton ? (
          <div className="flex h-full items-end gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 animate-pulse rounded-t-md bg-black/[0.06] dark:bg-white/10"
                style={{ height: `${30 + (i % 5) * 12}%` }}
              />
            ))}
          </div>
        ) : (
          <>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              role="img"
              aria-label={t.overview.monthlyJoinsChart.chartAria.replace("{total}", String(total))}
            >
              <defs>
                <linearGradient id={CHART_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--kat-brand) / 0.95)" />
                  <stop offset="100%" stopColor="hsl(var(--kat-brand) / 0.15)" />
                </linearGradient>
              </defs>

              {points.map((day, index) => {
                const barH = (day.count / maxCount) * innerH;
                const x = padding.left + index * barWidth + gap / 2;
                const y = padding.top + innerH - barH;
                const w = Math.max(barWidth - gap, 0.35);

                return (
                  <rect
                    key={day.date}
                    x={x}
                    y={y}
                    width={w}
                    height={Math.max(barH, day.count > 0 ? 1.5 : 0.75)}
                    rx={1}
                    fill={
                      day.count > 0
                        ? `url(#${CHART_GRADIENT_ID})`
                        : "hsl(var(--kat-brand) / 0.12)"
                    }
                  >
                    <title>{`${day.date}: ${day.count}`}</title>
                  </rect>
                );
              })}
            </svg>
            {!hasActivity && stats ? (
              <p className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-xs text-muted-foreground">
                {t.overview.monthlyJoinsChart.noActivity}
              </p>
            ) : null}
          </>
        )}
      </div>
    </article>
  );
}

export const MonthlyJoinsChart = memo(MonthlyJoinsChartComponent);
