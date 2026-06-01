export type DailyJoin = {
  date: string;
  count: number;
};

export type MonthlyJoinStats = {
  total: number;
  days: DailyJoin[];
};
