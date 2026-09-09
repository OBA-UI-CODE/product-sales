"use client";

import { useActionState } from "react";
import { updatePassword, type ResetPasswordState } from "./actions";
import PasswordInput from "@/components/ui/PasswordInput";

/*
  NOT IN FIGMA — there is no reset-password screen in the design file, so this
  keeps the original styling rather than the rebuilt auth tokens. Only the
  show/hide toggle was added, via the shared PasswordInput, which takes the
  field styling from here so nothing else about the page changes.
*/

const initialState: ResetPasswordState = {};

const FIELD =
  "w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] py-3 pl-4 pr-12 text-sm outline-none focus:border-[var(--color-primary)]";

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-canvas)] px-4">
      <div className="flex w-full max-w-[420px] flex-col gap-5">
        <span className="font-brand text-3xl text-[var(--color-accent-light)]">
          JOHTA
        </span>
        <div>
          <h1 className="font-heading text-2xl font-bold">Set a new password</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Choose a new password for your account.
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          {state.error && (
            <p className="rounded-md bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]">
              {state.error}
            </p>
          )}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              New password
            </label>
            <PasswordInput
              id="password"
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className={FIELD}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm new password
            </label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              className={FIELD}
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-[var(--color-primary)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
          >
            {pending ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
