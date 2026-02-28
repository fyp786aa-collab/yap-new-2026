/**
 * Pakistan Standard Time (PKT) utility functions
 * All dates/times in the application use Asia/Karachi timezone (UTC+5)
 */

const PKT_TIMEZONE = "Asia/Karachi";

export function toPakistanTime(date?: Date): Date {
  const d = date || new Date();
  const pktString = d.toLocaleString("en-US", { timeZone: PKT_TIMEZONE });
  return new Date(pktString);
}

export function nowPKT(): Date {
  return toPakistanTime(new Date());
}

export function nowPKTISO(): string {
  const d = new Date();
  return (
    d.toLocaleString("sv-SE", { timeZone: PKT_TIMEZONE }).replace(" ", "T") +
    "+05:00"
  );
}

export function formatPKT(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-PK", {
    timeZone: PKT_TIMEZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
}

export function formatDatePKT(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-PK", {
    timeZone: PKT_TIMEZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-PK", {
    timeZone: PKT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function isPast(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getTime() < Date.now();
}
