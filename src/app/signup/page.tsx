"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpWithEmail, signInWithGoogle, type SignupFormState } from "./actions";

const initialState: SignupFormState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUpWithEmail, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-canvas)] px-4">
      <div className="flex w-full max-w-[420px] flex-col gap-5">
        <span className="font-heading text-2xl font-bold text-[var(--color-primary)]">
          Reko
        </span>

        <div>
          <h1 className="font-heading text-3xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Start your 14-day free trial. No card required.
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          {state.error && (
            <p className="rounded-xl bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]">
              {state.error}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              placeholder="e.g. Amaka Obi"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>

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

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
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

          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
          >
            {pending ? "Creating account..." : "Create account"}
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-text-secondary)]">or</span>
            <div className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          <button
            type="button"
            formAction={signInWithGoogle}
            className="rounded-xl border border-[var(--color-border)] py-3 text-sm font-semibold transition hover:bg-[var(--color-bg-surface)]"
          >
            Continue with Google
          </button>

          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--color-primary)]">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
