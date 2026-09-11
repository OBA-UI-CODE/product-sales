"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

/*
  The owner's notice about their free month, at the top of the dashboard.
  Part of telling shops about the Free and Paid plans before trials end
  (with the emails from /api/cron/notices).

    trial  "Your free month ends on 8 October (26 days left)..."
    final  the same, in the last three days
    ended  for a week after it ends: "you are on the Free plan now"

  Each can be closed, and stays closed on that device. "final" is its own
  notice, so someone who closed the early one still sees the last three
  days. Owners only; the dashboard does not render it for staff, or for a
  shop that is paying.

  Not in Figma: styled like the install card that sits in the same spot.
*/
export default function TrialNotice({
  phase,
  endsOn,
  daysLeft,
  shopName,
  storageKey,
}: {
  phase: "trial" | "final" | "ended";
  endsOn: string;
  daysLeft: number;
  shopName: string;
  storageKey: string;
}) {
  /* Hidden until the stored choice is read, so a closed notice does not
     flash on screen for a moment before disappearing. */
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    let closed = false;
    try {
      closed = window.localStorage.getItem(storageKey) === "1";
    } catch {
      /* No storage: show it. */
    }
    setHidden(closed);
  }, [storageKey]);

  if (hidden) return null;

  const close = () => {
    setHidden(true);
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {
      /* Returns next visit. Harmless. */
    }
  };

  const title =
    phase === "ended"
      ? "Your free month has ended"
      : `Your free month ends on ${endsOn}`;
  const body =
    phase === "ended"
      ? `${shopName} is on the Free plan now, and nothing was deleted. Subscribe any time for receipts, unlimited staff and your full sales history.`
      : `${daysLeft === 1 ? "1 day" : `${daysLeft} days`} left. After that ${shopName} moves to the Free plan and keeps working. Subscribe to keep receipts, unlimited staff and your full sales history.`;

  return (
    <div
      className={`flex flex-col gap-3 rounded-md border p-4 ${
        phase === "final"
          ? "border-primary-border bg-primary-subtle"
          : "border-border-strong bg-bg-surface"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="font-heading text-[16px] font-semibold leading-[20px] text-text-primary">
            {title}
          </p>
          <p className="font-body text-[14px] leading-[20px] text-text-secondary">
            {body}
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="press -mr-1 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-full text-text-secondary"
        >
          <X size={18} />
        </button>
      </div>
      <Link
        href="/settings#billing"
        className="press flex h-11 items-center justify-center rounded-md bg-primary-default px-4 font-heading text-[16px] font-semibold text-text-on-primary tab:self-start tab:px-6"
      >
        See plans
      </Link>
    </div>
  );
}
