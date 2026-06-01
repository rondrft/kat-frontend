import { buildEmptyMonthDays } from "@/features/dashboard/lib/chart-days";
import type {
  DailyJoin,
  MonthlyJoinStats,
} from "@/features/dashboard/types/monthly-joins";

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord {
  return value !== null && typeof value === "object" ? (value as RawRecord) : {};
}

function normalizeDateKey(date: string): string {
  return date.slice(0, 10);
}

function normalizeDailyJoin(raw: unknown): DailyJoin | null {
  const d = asRecord(raw);
  const date = String(d.date ?? d.day ?? "");
  if (!date) return null;
  return {
    date: normalizeDateKey(date),
    count: Number(d.count ?? 0),
  };
}

function extractDailyJoins(raw: unknown): DailyJoin[] {
  if (Array.isArray(raw)) {
    return raw.map(normalizeDailyJoin).filter((d): d is DailyJoin => d !== null);
  }

  const root = asRecord(raw);
  const payload = root.data ?? root.stats ?? root.days ?? [];

  if (Array.isArray(payload)) {
    return payload.map(normalizeDailyJoin).filter((d): d is DailyJoin => d !== null);
  }

  return [];
}

function mergeWithMonthScaffold(parsed: DailyJoin[]): MonthlyJoinStats {
  const scaffold = buildEmptyMonthDays();
  const countByDate = new Map<string, number>();

  for (const row of parsed) {
    const key = normalizeDateKey(row.date);
    countByDate.set(key, (countByDate.get(key) ?? 0) + row.count);
  }

  const days = scaffold.map((d) => ({
    date: d.date,
    count: countByDate.get(d.date) ?? 0,
  }));

  return {
    total: days.reduce((sum, d) => sum + d.count, 0),
    days,
  };
}

export function normalizeMemberJoinStatsList(raw: unknown): MonthlyJoinStats {
  const parsed = extractDailyJoins(raw);
  if (!parsed.length) {
    return mergeWithMonthScaffold([]);
  }
  return mergeWithMonthScaffold(parsed);
}

export function normalizeMonthlyJoinStats(raw: unknown): MonthlyJoinStats {
  const root = asRecord(raw);
  const payload = asRecord(root.data ?? root);

  const daysRaw = payload.days ?? payload.daily ?? [];
  const parsed = Array.isArray(daysRaw)
    ? daysRaw.map(normalizeDailyJoin).filter((d): d is DailyJoin => d !== null)
    : [];

  if (parsed.length) {
    return mergeWithMonthScaffold(parsed);
  }

  return {
    total: Number(payload.total ?? 0),
    days: buildEmptyMonthDays(),
  };
}
