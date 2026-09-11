"use client";

import { useActionState } from "react";
import { updateShopDetails } from "./shop-actions";
import type { StaffState } from "./actions";

/*
  The shop's name and phone number.

  The phone exists because of receipts: a slip with no way to contact the shop
  is close to useless to the customer holding it. It is optional, since plenty
  of owners will not want their number on a piece of paper, and a receipt
  without it still beats none.

  The receipt design in Figma (444:6548) has no phone line; it is added under
  the shop name, and only when one is set.

  Owner only. Both fields are among the handful of columns an owner is allowed
  to write directly; everything about billing is refused at the database.
*/
export default function ShopDetailsSection({
  name,
  phone,
}: {
  name: string;
  phone: string | null;
}) {
  const [state, formAction, pending] = useActionState<StaffState, FormData>(
    updateShopDetails,
    {}
  );

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold">Shop details</h2>

      <form
        action={formAction}
        className="flex flex-col gap-4 rounded-md bg-[var(--color-bg-surface)] p-5 tab:p-6"
      >
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Your shop name and phone number appear on the receipts you give
          customers, so they can reach you.
        </p>

        {state.error && (
          <p
            role="alert"
            className="rounded-md bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]"
          >
            {state.error}
          </p>
        )}
        {state.success && (
          <p
            role="status"
            className="rounded-md bg-primary-subtle px-4 py-3 text-sm text-primary-text"
          >
            {state.success}
          </p>
        )}

        <label className="flex flex-col gap-2 text-sm text-[var(--color-text-secondary)]">
          Shop name
          <input
            name="name"
            required
            defaultValue={name}
            maxLength={80}
            className="h-11 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-4 text-sm text-[var(--color-text-primary)]"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-[var(--color-text-secondary)]">
          Phone number, optional
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            defaultValue={phone ?? ""}
            maxLength={30}
            placeholder="0803 123 4567"
            className="h-11 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-4 text-sm text-[var(--color-text-primary)]"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="press h-11 rounded-md bg-[var(--color-primary)] px-6 font-semibold text-white disabled:opacity-50 tab:self-start"
        >
          {pending ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
