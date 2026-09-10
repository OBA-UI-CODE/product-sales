"use client";

import { useEffect } from "react";
import Link from "next/link";
import { reportClientError } from "@/components/ErrorReporter";
import { HomeLink } from "@/components/Brand";

/*
  What people see when a page crashes, instead of Next's bare default.

  Errors that started on the server carry a digest and have already been
  recorded there (instrumentation.ts), so only browser-side crashes are
  reported from here, to avoid counting one problem twice.

  "Try again" re-renders the page, which fixes anything that was a passing
  hiccup (a dropped connection, a slow database). The way out goes to the
  dashboard inside the app and to the home page everywhere else.
*/
export default function ErrorScreen({
  error,
  reset,
  inApp,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  inApp: boolean;
}) {
  useEffect(() => {
    if (!error.digest) reportClientError(error.message, error.stack);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[520px] flex-col justify-center gap-6 px-6 py-16">
      {!inApp && (
        <span className="font-brand text-[32px] text-primary-text">
          <HomeLink>JOHTA</HomeLink>
        </span>
      )}
      <div className="flex flex-col gap-3">
        <h1 className="font-heading text-[28px] font-semibold leading-tight text-text-primary">
          Something went wrong
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          This page ran into a problem. We have been told about it. Your sales
          and records are safe; nothing was lost.
        </p>
        {error.digest && (
          <p className="text-sm text-[var(--color-text-muted)]">
            Reference: {error.digest}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3 tab:flex-row">
        <button
          type="button"
          onClick={reset}
          className="press h-12 rounded-md bg-[var(--color-primary)] px-6 font-semibold text-white"
        >
          Try again
        </button>
        <Link
          href={inApp ? "/dashboard" : "/"}
          className="press flex h-12 items-center justify-center rounded-md border border-[var(--color-border)] px-6 font-semibold"
        >
          {inApp ? "Back to dashboard" : "Go to the home page"}
        </Link>
      </div>
    </div>
  );
}
