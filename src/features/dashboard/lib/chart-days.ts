import type { NewMember } from "@/features/dashboard/types/new-member";
import type {
  DailyJoin,
  MonthlyJoinStats,
} from "@/features/dashboard/types/monthly-joins";

export function buildEmptyMonthDays(): DailyJoin[] {
  const days: DailyJoin[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 29; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    days.push({
      date: toLocalDateKey(date),
      count: 0,
    });
  }

  return days;
}

function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function joinedAtToLocalDateKey(joinedAt: string): string | null {
  const parsed = new Date(joinedAt);
  if (Number.isNaN(parsed.getTime())) {
    const isoDate = joinedAt.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(isoDate) ? isoDate : null;
  }
  return toLocalDateKey(parsed);
}

export function aggregateMonthlyJoinsFromMembers(
  members: NewMember[],
): MonthlyJoinStats {
  const days = buildEmptyMonthDays();
  const countByDate = new Map(days.map((d) => [d.date, 0]));

  const rangeStart = new Date();
  rangeStart.setHours(0, 0, 0, 0);
  rangeStart.setDate(rangeStart.getDate() - 29);

  let total = 0;

  for (const member of members) {
    const dateKey = joinedAtToLocalDateKey(member.joinedAt);
    if (!dateKey || !countByDate.has(dateKey)) continue;

    countByDate.set(dateKey, (countByDate.get(dateKey) ?? 0) + 1);
    total += 1;
  }

  return {
    total,
    days: days.map((d) => ({
      date: d.date,
      count: countByDate.get(d.date) ?? 0,
    })),
  };
}
