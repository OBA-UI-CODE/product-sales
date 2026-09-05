"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpWithEmail, signInWithGoogle, type SignupFormState } from "./actions";

const initialState: SignupFormState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUpWithEmail, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-canvas)] px-6 py-12">
      <div className="flex w-full max-w-[1352px] gap-16">
        {/* Left column — form */}
        <div className="flex w-full max-w-[546px] flex-col gap-16">
          <span
            className="font-heading text-[56px] font-bold leading-none tracking-[-1.5px]"
            style={{ color: "var(--color-accent-light)" }}
          >
            Reko
          </span>

          <form action={formAction} className="flex flex-col gap-6">
            <h1 className="font-heading text-[40px] font-semibold leading-[48px] tracking-[-1px]">
              Create your account
            </h1>
            <p className="-mt-3 text-[18px] font-semibold leading-[22px] tracking-[-1px] text-[var(--color-text-secondary)]">
              Start your 14 days free trial. No card required.
            </p>

            {state.error && (
              <p className="rounded-[10px] bg-[var(--color-danger-bg)] px-4 py-3 text-base text-[var(--color-danger)]">
                {state.error}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-base leading-6">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                placeholder="e.g adaobi doe"
                className="h-[52px] rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 text-base outline-none focus:border-[var(--color-primary-hover)]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-base leading-6">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="h-[52px] rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 text-base outline-none focus:border-[var(--color-primary-hover)]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-base leading-6">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                className="h-[52px] rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 text-base outline-none focus:border-[var(--color-primary-hover)]"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[var(--color-primary)] font-heading text-xl font-semibold tracking-[-1px] text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
            >
              {pending ? "Creating account..." : "Create Account"}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--color-border)]" />
              <span className="text-sm text-[var(--color-text-secondary)]">or</span>
              <div className="h-px flex-1 bg-[var(--color-border)]" />
            </div>

            <button
              type="button"
              formAction={signInWithGoogle}
              className="flex h-[50px] items-center justify-center rounded-[10px] bg-[var(--color-bg-surface)] text-base font-semibold"
            >
              Continue with Google
            </button>

            <p className="text-center text-base leading-6 text-[var(--color-text-secondary)]">
              Don&apos;t have an account?{" "}
              <Link
                href="/login"
                className="font-heading text-lg font-semibold tracking-[-1px]"
                style={{ color: "var(--color-accent-light)" }}
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>

        {/* Right column — marketing panel */}
        <div className="hidden w-[742px] shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-success-bg)] lg:flex">
          <div className="flex w-[467px] flex-col justify-between" style={{ height: 756, gap: 408 }}>
            <h2 className="font-heading text-[64px] font-semibold leading-[77px] tracking-[-1px] text-white">
              Open to everyday trades, easy on the budget.
            </h2>
            <p className="font-heading text-[32px] font-semibold leading-[39px] tracking-[-1px] text-white">
              <span style={{ color: "var(--color-accent-light)" }}>Reko</span>.
              <br />
              Simple &amp;
              <br />
              Transparent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
