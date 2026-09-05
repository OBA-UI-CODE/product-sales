"use client";

import { useActionState } from "react";
import { updatePassword, type ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = {};

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-canvas)] px-4">
      <div className="flex w-full max-w-[420px] flex-col gap-5">
        <span className="font-heading text-2xl font-bold text-[var(--color-primary)]">
          Reko
        </span>
        <div>
          <h1 className="font-heading text-2xl font-bold">Set a new password</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Choose a new password for your account.
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          {state.error && (
            <p className="rounded-xl bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]">
              {state.error}
            </p>
          )}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              placeholder="Re-enter your new password"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
          >
            {pending ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
