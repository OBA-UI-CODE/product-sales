"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-canvas)] px-4">
      <div className="flex w-full max-w-[420px] flex-col gap-5">
        <span className="font-heading text-2xl font-bold text-[var(--color-primary)]">
          Reko
        </span>

        {state.success ? (
          <div className="flex flex-col gap-3">
            <h1 className="font-heading text-2xl font-bold">Check your email</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              If an account exists for that email, we&apos;ve sent a link to reset
              your password.
            </p>
            <Link href="/login" className="text-sm font-semibold text-[var(--color-primary)]">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h1 className="font-heading text-2xl font-bold">Reset your password</h1>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form action={formAction} className="flex flex-col gap-5">
              {state.error && (
                <p className="rounded-xl bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]">
                  {state.error}
                </p>
              )}
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <button
                type="submit"
                disabled={pending}
                className="rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
              >
                {pending ? "Sending..." : "Send reset link"}
              </button>
              <Link
                href="/login"
                className="text-center text-sm font-semibold text-[var(--color-primary)]"
              >
                Back to Sign In
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
