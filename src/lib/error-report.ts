import { createHash } from "node:crypto";
import { SUPPORT_EMAIL } from "@/lib/site";

/*
  Recording errors, and telling someone about them.

  Every crash, on the server or in a browser, lands in public.error_events
  (Supabase). The first time a given problem appears, and again if it is
  still happening six hours later, an email goes to ALERT_EMAIL through
  Resend. Without a RESEND_API_KEY errors are still recorded, just not
  emailed.

  Written with plain fetch rather than supabase-js so it works from any
  runtime Next runs the hook in, and so a failure here can never take the
  page down with it: every step is wrapped, and reporting an error must not
  itself throw.

  Kept on the service role, server-side only. Nothing identifying who was
  using the app is stored.
*/

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;
const ALERT_EMAIL = process.env.ALERT_EMAIL ?? SUPPORT_EMAIL;
const ALERT_FROM = process.env.ALERT_FROM ?? "JOHTA Alerts <alerts@johta.click>";

/* A flood (a loop, or someone hammering /api/errors) must not fill the table
   or an inbox. Beyond these, errors are dropped until the hour turns. */
const MAX_EVENTS_PER_HOUR = 300;
const MAX_EMAILS_PER_HOUR = 10;
const REALERT_AFTER_HOURS = 6;

export interface ErrorReport {
  source: "server" | "client";
  message: string;
  stack?: string | null;
  digest?: string | null;
  path?: string | null;
  userAgent?: string | null;
}

const clip = (value: string | null | undefined, max: number) =>
  value ? value.slice(0, max) : null;

/*
  The same bug should count as one problem however many times it fires.
  Numbers and ids inside the message are blanked, so "sale 3f2a… not found"
  and "sale 9c1b… not found" group together, and only the first frame of the
  stack is used, which is where the error was thrown.
*/
function fingerprintOf(report: ErrorReport): string {
  const message = report.message
    .replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, "<id>")
    .replace(/\d+/g, "<n>")
    .slice(0, 200);
  const frame =
    report.stack
      ?.split("\n")
      .map((l) => l.trim())
      .find((l) => l.startsWith("at ")) ?? "";
  return createHash("sha256")
    .update(`${report.source}|${message}|${frame.replace(/:\d+:\d+\)?$/, "")}`)
    .digest("hex")
    .slice(0, 16);
}

async function rest(path: string, init: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY!,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
}

/* How many rows match, using PostgREST's exact count header. */
async function countWhere(filter: string): Promise<number> {
  const res = await rest(`error_events?select=id&${filter}`, {
    method: "HEAD",
    headers: { Prefer: "count=exact" },
  });
  const range = res.headers.get("content-range") ?? "*/0";
  return Number(range.split("/")[1] ?? 0) || 0;
}

export async function recordError(report: ErrorReport): Promise<void> {
  if (!SUPABASE_URL || !SERVICE_KEY || !report.message) return;

  try {
    const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
    if ((await countWhere(`occurred_at=gt.${hourAgo}`)) >= MAX_EVENTS_PER_HOUR) {
      return;
    }

    const fingerprint = fingerprintOf(report);
    const since = new Date(Date.now() - REALERT_AFTER_HOURS * 3_600_000).toISOString();
    /* Asked BEFORE inserting, so the row being added does not count. */
    const seenRecently =
      (await countWhere(`fingerprint=eq.${fingerprint}&occurred_at=gt.${since}`)) > 0;

    await rest("error_events", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        source: report.source,
        message: clip(report.message, 1000),
        stack: clip(report.stack, 4000),
        digest: clip(report.digest, 100),
        path: clip(report.path, 500),
        user_agent: clip(report.userAgent, 300),
        fingerprint,
      }),
    });

    if (!seenRecently && RESEND_KEY) {
      await emailAlert(report, fingerprint);
    }
  } catch {
    /* Reporting must never become a second failure. */
  }
}

let emailsThisHour = 0;
let emailHour = new Date().getUTCHours();

async function emailAlert(report: ErrorReport, fingerprint: string) {
  const hour = new Date().getUTCHours();
  if (hour !== emailHour) {
    emailHour = hour;
    emailsThisHour = 0;
  }
  if (emailsThisHour >= MAX_EMAILS_PER_HOUR) return;
  emailsThisHour++;

  const where = report.source === "server" ? "on the server" : "in a browser";
  const firstLines = (report.stack ?? "").split("\n").slice(0, 8).join("\n");
  const text = [
    `A new error ${where} on johta.click.`,
    "",
    `Message: ${report.message}`,
    `Page: ${report.path ?? "unknown"}`,
    report.digest ? `Digest: ${report.digest}` : "",
    `Time: ${new Date().toISOString()}`,
    "",
    firstLines,
    "",
    `Every occurrence is in the error_events table in Supabase (fingerprint ${fingerprint}),`,
    "and error_summary lists each problem with how often it has happened.",
    `You will not be emailed about this one again for ${REALERT_AFTER_HOURS} hours.`,
  ]
    .filter((line, i, all) => line !== "" || all[i - 1] !== "")
    .join("\n");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: ALERT_FROM,
      to: [ALERT_EMAIL],
      subject: `[JOHTA] ${report.message.slice(0, 90)}`,
      text,
    }),
  });
}
