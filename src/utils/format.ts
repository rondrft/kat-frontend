const numberFormatter = new Intl.NumberFormat("es-ES", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCompactNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatRelativeTime(date: Date | string): string {
  const target = typeof date === "string" ? new Date(date) : date;
  const diffMs = target.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];

  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(diffSec) >= secondsInUnit || unit === "second") {
      return rtf.format(Math.round(diffSec / secondsInUnit), unit);
    }
  }

  return rtf.format(0, "second");
}
