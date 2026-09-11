/*
  Calendar days, weeks and months as a Lagos shop owner means them.

  Nigeria is UTC+1 all year (no daylight saving), so a Lagos day runs from
  23:00 UTC the evening before. The server runs in UTC, and the old Sales
  History used the server's own midnight, which put anything sold between
  midnight and 1am on the wrong day.

  Dates travel as "YYYY-MM-DD" strings (the day on the owner's wall), and
  are turned into instants only at the edge, for the database. Weeks run
  Monday to Sunday.
*/

const TZ = "Africa/Lagos";

export function lagosToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function isYmd(value: string | undefined | null): value is string {
  return (
    !!value &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
    new Date(`${value}T00:00:00Z`).toISOString().startsWith(value)
  );
}

/* The instant a Lagos day begins. */
export function lagosMidnight(ymd: string): Date {
  return new Date(`${ymd}T00:00:00+01:00`);
}

export function addDays(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weekStart(ymd: string): string {
  const dow = new Date(`${ymd}T00:00:00Z`).getUTCDay(); // 0 Sunday
  return addDays(ymd, -((dow + 6) % 7));
}

export function monthStart(ymd: string): string {
  return `${ymd.slice(0, 7)}-01`;
}

export function addMonths(ymd: string, months: number): string {
  const d = new Date(`${monthStart(ymd)}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

/* Formats a day for display. The date is read at noon UTC so no timezone
   can tip it into the neighbouring day. */
export function formatYmd(ymd: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...options })
    .format(new Date(`${ymd}T12:00:00Z`))
    /* Node's en-GB short September is "Sept"; everywhere else in JOHTA
       (receipts, emails) it is "Sep". */
    .replace(/\bSept\b/, "Sep");
}
