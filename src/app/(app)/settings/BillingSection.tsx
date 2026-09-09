"use client";

import { useActionState, useState, useTransition } from "react";
import {
  startSubscription,
  cancelSubscription,
  type BillingState,
} from "./billing-actions";

export interface BillingInfo {
  status: "trialing" | "active" | "past_due" | "canceled";
  trialEndsAt: string;
  currentPeriodEnd: string | null;
  plan: string | null;
  configured: boolean;
}

const initialState: BillingState = {};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function daysLeft(value: string) {
  const ms = new Date(value).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/*
  Billing — Paystack.

  Card details are never entered here and never touch our server: the owner is
  sent to Paystack's own hosted checkout, and what comes back is confirmed by
  the signed webhook, not by the browser returning.

  NOT IN FIGMA. There is no billing screen in the design file, so this follows
  the Settings page's existing styling rather than inventing new visual rules.
*/
export default function BillingSection({ billing }: { billing: BillingInfo }) {
  const [state, formAction, pending] = useActionState(
    startSubscription,
    initialState
  );
  const [cancelling, startCancel] = useTransition();
  const [cancelResult, setCancelResult] = useState<BillingState>({});
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const trialDays = daysLeft(billing.trialEndsAt);
  const trialActive = billing.status === "trialing" && trialDays > 0;
  const paidUntil = billing.currentPeriodEnd
    ? formatDate(billing.currentPeriodEnd)
    : null;

  const statusLine = (() => {
    if (billing.status === "active")
      return paidUntil
        ? `Subscribed, renews ${paidUntil}`
        : "Subscribed";
    if (billing.status === "past_due")
      return "Your last payment failed. Update your card to keep logging sales.";
    if (billing.status === "canceled")
      return paidUntil && new Date(billing.currentPeriodEnd!) > new Date()
        ? `Cancelled. You keep full access until ${paidUntil}`
        : "Cancelled. Your shop is read-only until you subscribe again";
    if (trialActive)
      return `Free trial, ${trialDays} ${trialDays === 1 ? "day" : "days"} left, ends ${formatDate(billing.trialEndsAt)}`;
    return "Your free trial has ended. Subscribe to keep logging sales.";
  })();

  const needsPlan =
    billing.status !== "active" &&
    !(
      billing.status === "canceled" &&
      billing.currentPeriodEnd &&
      new Date(billing.currentPeriodEnd) > new Date()
    );

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold">Billing</h2>

      <div className="flex flex-col gap-4 rounded-[14px] bg-[var(--color-bg-surface)] p-6">
        <p className="text-sm text-[var(--color-text-secondary)]">
          {statusLine}
        </p>

        {!billing.configured && (
          <p className="rounded-[10px] bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]">
            Payments are not connected yet. Add your Paystack secret key and
            plan codes to the server environment to enable this.
          </p>
        )}

        {state.error && (
          <p
            role="alert"
            className="rounded-[10px] bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]"
          >
            {state.error}
          </p>
        )}
        {cancelResult.error && (
          <p
            role="alert"
            className="rounded-[10px] bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]"
          >
            {cancelResult.error}
          </p>
        )}
        {cancelResult.success && (
          <p
            role="status"
            className="rounded-[10px] bg-primary-subtle px-4 py-3 text-sm text-primary-text"
          >
            {cancelResult.success}
          </p>
        )}

        {needsPlan ? (
          <form action={formAction} className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                name="plan"
                value="monthly"
                disabled={pending || !billing.configured}
                className="flex flex-1 flex-col items-start rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-4 py-3 text-left transition hover:border-primary-border disabled:opacity-50"
              >
                <span className="font-heading text-lg font-semibold">
                  ₦ 1,599
                </span>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  per month
                </span>
              </button>

              <button
                type="submit"
                name="plan"
                value="yearly"
                disabled={pending || !billing.configured}
                className="flex flex-1 flex-col items-start rounded-[10px] border border-primary-border bg-[var(--color-bg-canvas)] px-4 py-3 text-left transition hover:opacity-90 disabled:opacity-50"
              >
                <span className="font-heading text-lg font-semibold">
                  ₦ 15,990
                </span>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  per year · 2 months free
                </span>
              </button>
            </div>
            {/*
              Paystack charges as soon as a subscription is created, and its
              start_date option needs a card authorisation that only exists
              after a first transaction — so there is no way to take the card
              now and bill at the end of the trial without charging something
              today. Rather than engineer around it, the screen says plainly
              what paying now costs, so nobody loses free days by surprise.
            */}
            {trialActive && trialDays > 1 && (
              <p className="rounded-[10px] bg-[var(--color-bg-canvas)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                You still have {trialDays} days of free trial left, until{" "}
                {formatDate(billing.trialEndsAt)}. Paying now charges you today
                and starts your subscription immediately. The remaining free
                days are not added on. You can wait and subscribe when the trial
                ends.
              </p>
            )}
            <p className="text-xs text-[var(--color-text-muted)]">
              {pending
                ? "Opening secure checkout…"
                : "You'll be taken to Paystack to pay. Card details never touch JOHTA."}
            </p>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            {billing.plan && (
              <p className="text-sm text-[var(--color-text-secondary)]">
                Plan: {billing.plan === "yearly" ? "Yearly" : "Monthly"}
              </p>
            )}

            {billing.status === "active" &&
              (!confirmingCancel ? (
                <button
                  type="button"
                  onClick={() => setConfirmingCancel(true)}
                  className="self-start rounded-[10px] bg-[var(--color-danger-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--color-danger)]"
                >
                  Cancel subscription
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    You&apos;ll keep full access until the end of the period
                    you&apos;ve paid for. Cancel anyway?
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setConfirmingCancel(false)}
                      className="rounded-[10px] border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)]"
                    >
                      Keep it
                    </button>
                    <button
                      type="button"
                      disabled={cancelling}
                      onClick={() =>
                        startCancel(async () => {
                          setCancelResult(await cancelSubscription());
                          setConfirmingCancel(false);
                        })
                      }
                      className="rounded-[10px] bg-[var(--color-danger-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--color-danger)] disabled:opacity-50"
                    >
                      {cancelling ? "Cancelling…" : "Yes, cancel"}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
