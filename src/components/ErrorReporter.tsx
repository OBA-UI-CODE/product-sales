"use client";

import { useEffect } from "react";

/*
  Sends crashes that happen in someone's browser to /api/errors. Mounted once
  in the root layout, so it covers the website, sign-in and the app alike.

  Noise is dropped before it leaves the phone: errors from browser extensions,
  "Script error." (a cross-origin script that will not say what went wrong),
  and ResizeObserver warnings, which are harmless and extremely common. Each
  distinct message is sent once per page load, and at most five in total, so
  a crash inside a loop cannot flood anything.
*/

const IGNORE = [
  /^Script error\.?$/i,
  /ResizeObserver loop/i,
  /chrome-extension:|moz-extension:|safari-extension:/i,
  /Load failed|Failed to fetch|NetworkError/i, // a dropped connection, not a bug
];

const sent = new Set<string>();

export function reportClientError(message: string, stack?: string | null, digest?: string | null) {
  if (!message || sent.size >= 5 || sent.has(message)) return;
  if (IGNORE.some((re) => re.test(message) || (stack && re.test(stack)))) return;
  sent.add(message);

  const body = JSON.stringify({
    message: message.slice(0, 1000),
    stack: stack?.slice(0, 4000) ?? null,
    digest: digest ?? null,
    path: window.location.pathname,
  });
  /* keepalive: still delivered if the crash is followed by the page closing. */
  fetch("/api/errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

export default function ErrorReporter() {
  useEffect(() => {
    const onError = (e: ErrorEvent) =>
      reportClientError(e.message, (e.error as Error | undefined)?.stack);
    const onRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason as Error | string | undefined;
      if (typeof reason === "string") reportClientError(reason);
      else if (reason?.message) reportClientError(reason.message, reason.stack);
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
