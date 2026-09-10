"use client";

import { createContext, useContext } from "react";
import Link from "next/link";
import { X } from "lucide-react";

/*
  Whether the signed-in shop is on a paid plan, for any component in the app
  that needs to know (the receipt button, mainly) without it being passed
  down through every screen in between. Set once by the (app) layout.

  Display only. The receipt and export routes, and the database, check the
  plan themselves; this just decides what to show.

  Defaults to Free, so anything rendered outside the provider errs on the side
  of offering an upgrade rather than a button the server would refuse.
*/
interface Plan {
  paid: boolean;
  isOwner: boolean;
}

const PlanContext = createContext<Plan>({ paid: false, isOwner: false });

export function PlanProvider({
  paid,
  isOwner,
  children,
}: Plan & { children: React.ReactNode }) {
  return (
    <PlanContext.Provider value={{ paid, isOwner }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}

/*
  What a Free shop sees when it reaches for a paid feature. Shown at the
  moment they want it, rather than the button being hidden, so they know it
  exists and what it costs. Owners get a way to subscribe; staff are told who
  can, since billing is not theirs.
*/
export function UpgradeDialog({
  title,
  body,
  onClose,
}: {
  title: string;
  body: string;
  onClose: () => void;
}) {
  const { isOwner } = usePlan();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 tab:items-center"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-[440px] flex-col gap-5 rounded-t-md bg-[var(--color-bg-surface)] p-6 pb-10 tab:rounded-md tab:pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="font-heading text-[20px] font-semibold leading-[24px] text-[var(--color-text-primary)]">
            {title}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="press flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-canvas)] text-[var(--color-text-secondary)]"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-[15px] leading-[22px] text-[var(--color-text-secondary)]">
          {body}
        </p>

        {isOwner ? (
          <Link
            href="/settings#billing"
            onClick={onClose}
            className="press flex h-12 items-center justify-center rounded-md bg-[var(--color-primary)] px-6 font-semibold text-white"
          >
            See plans from ₦1,599 a month
          </Link>
        ) : (
          <p className="rounded-md bg-[var(--color-bg-canvas)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
            Only the shop owner can subscribe. Please speak to them.
          </p>
        )}
      </div>
    </div>
  );
}
