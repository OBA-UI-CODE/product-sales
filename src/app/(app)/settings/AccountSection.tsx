"use client";

import { useActionState, useState, useTransition } from "react";
import { Download, PauseCircle, Trash2 } from "lucide-react";
import {
  deactivateShop,
  deleteOwnStaffAccount,
  requestAccountDeletion,
} from "./account-actions";
import type { AccountState } from "@/lib/account";

const initialState: AccountState = {};

/*
  Pausing and deleting the account.

  NOT IN FIGMA — there is no Settings screen in the design file, so this
  follows the styling the rest of Settings already uses.

  Three deliberate choices about how destructive things are presented:

  · Nothing dangerous is one click away. Both options open a confirmation
    first, and deletion additionally requires typing the shop's own name.
  · The export is offered inside the delete flow, not buried elsewhere. The
    moment someone is about to destroy their sales records is the moment to
    put a copy of them within reach.
  · The consequences are spelled out in full — staff losing access, the
    subscription stopping, the 30 days — rather than left to be discovered.

  Red is used sparingly, and only on the button that actually destroys
  something. A panel that is entirely red stops meaning anything.
*/

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-md bg-[var(--color-bg-surface)] p-5 tab:p-6">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
      {children}
    </p>
  );
}

export default function AccountSection({
  isOwner,
  shopName,
  graceDays,
}: {
  isOwner: boolean;
  shopName: string;
  graceDays: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold">Your account</h2>

      <div className="flex flex-col gap-4">
        {isOwner ? (
          <>
            <PausePanel />
            <DeleteShopPanel shopName={shopName} graceDays={graceDays} />
          </>
        ) : (
          <LeaveShopPanel />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ pause */

function PausePanel() {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const [result, setResult] = useState<AccountState>({});

  return (
    <Panel title="Pause this shop">
      <Note>
        Stops your subscription and closes the shop, but keeps everything.
        Every sale, product and debt stays exactly as it is. You and your staff
        will be signed out, and you can reopen it whenever you like.
      </Note>

      {result.error && <ErrorNote>{result.error}</ErrorNote>}

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[var(--color-border)] px-4 text-sm font-semibold tab:w-auto tab:self-start"
        >
          <PauseCircle size={16} />
          Pause my shop
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <Note>
            <strong className="text-[var(--color-text-primary)]">
              Sure? Your staff will not be able to sign in until you reopen it.
            </strong>{" "}
            If you are on a paid plan, it will be cancelled now, so you will not
            be charged again.
          </Note>
          <div className="flex flex-col gap-3 tab:flex-row">
            <button
              disabled={pending}
              onClick={() =>
                start(async () => setResult(await deactivateShop()))
              }
              className="h-11 shrink-0 rounded-md bg-[var(--color-primary)] px-6 text-sm font-semibold text-white disabled:opacity-50"
            >
              {pending ? "Pausing..." : "Yes, pause my shop"}
            </button>
            <button
              disabled={pending}
              onClick={() => setConfirming(false)}
              className="h-11 shrink-0 rounded-md border border-[var(--color-border)] px-6 text-sm font-semibold"
            >
              Keep it open
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}

/* --------------------------------------------------------------- deletion */

function DeleteShopPanel({
  shopName,
  graceDays,
}: {
  shopName: string;
  graceDays: number;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    requestAccountDeletion,
    initialState
  );

  return (
    <Panel title="Delete this shop">
      <Note>
        Closes the shop and removes it for good, along with your staff&rsquo;s
        logins. You have {graceDays} days to change your mind. Sign back in
        within that time and everything comes back. After that it cannot be
        recovered by anyone, including us.
      </Note>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[var(--color-danger)] px-4 text-sm font-semibold text-[var(--color-danger)] tab:w-auto tab:self-start"
        >
          <Trash2 size={16} />
          Delete my shop
        </button>
      ) : (
        <div className="flex flex-col gap-4">
          {/*
            The export sits above the confirmation, not below it. Sales
            records are business records — someone may need them for tax
            years after they stop using JOHTA — so a copy is put within reach
            before the thing that destroys them.
          */}
          <div className="flex flex-col gap-3 rounded-md bg-[var(--color-bg-canvas)] p-4">
            <Note>
              <strong className="text-[var(--color-text-primary)]">
                Take your records with you first.
              </strong>{" "}
              A spreadsheet of every sale, debt and product. You may need it
              for your accounts later.
            </Note>
            <a
              href="/api/account/export"
              className="flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--color-border)] px-4 text-sm font-semibold tab:self-start tab:px-6"
            >
              <Download size={16} />
              Download my records
            </a>
          </div>

          <div className="flex flex-col gap-1">
            <Note>This will:</Note>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-[var(--color-text-secondary)]">
              <li>cancel your subscription, so you are not charged again</li>
              <li>sign out you and everyone on your staff</li>
              <li>
                delete your sales, products, debts and staff logins after{" "}
                {graceDays} days
              </li>
            </ul>
          </div>

          {state.error && <ErrorNote>{state.error}</ErrorNote>}

          <form action={formAction} className="flex flex-col gap-3">
            <label
              htmlFor="confirm-shop-name"
              className="text-sm text-[var(--color-text-secondary)]"
            >
              Type <strong className="text-[var(--color-text-primary)]">{shopName}</strong>{" "}
              to confirm
            </label>
            <input
              id="confirm-shop-name"
              name="confirm"
              required
              autoComplete="off"
              placeholder={shopName}
              className="h-11 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-4 text-sm"
            />
            <div className="flex flex-col gap-3 tab:flex-row">
              <button
                type="submit"
                disabled={pending}
                className="h-11 shrink-0 rounded-md bg-[var(--color-danger)] px-6 text-sm font-semibold text-white disabled:opacity-50"
              >
                {pending ? "Deleting..." : "Delete my shop"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="h-11 shrink-0 rounded-md border border-[var(--color-border)] px-6 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ staff */

function LeaveShopPanel() {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const [result, setResult] = useState<AccountState>({});

  return (
    <Panel title="Delete my account">
      <Note>
        Removes your login from this shop. The sales you have already logged
        stay in the shop&rsquo;s records, so your boss&rsquo;s books are not
        changed, but you will not be able to sign in again unless they add
        you back.
      </Note>

      {result.error && <ErrorNote>{result.error}</ErrorNote>}

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[var(--color-danger)] px-4 text-sm font-semibold text-[var(--color-danger)] tab:w-auto tab:self-start"
        >
          <Trash2 size={16} />
          Delete my account
        </button>
      ) : (
        <div className="flex flex-col gap-3 tab:flex-row">
          <button
            disabled={pending}
            onClick={() =>
              start(async () => setResult(await deleteOwnStaffAccount()))
            }
            className="h-11 shrink-0 rounded-md bg-[var(--color-danger)] px-6 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Deleting..." : "Yes, delete my account"}
          </button>
          <button
            disabled={pending}
            onClick={() => setConfirming(false)}
            className="h-11 shrink-0 rounded-md border border-[var(--color-border)] px-6 text-sm font-semibold"
          >
            Cancel
          </button>
        </div>
      )}
    </Panel>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-md bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]"
    >
      {children}
    </p>
  );
}
