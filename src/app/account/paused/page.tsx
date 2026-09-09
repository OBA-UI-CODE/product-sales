import { redirect } from "next/navigation";
import { getCurrentShopContext, shopOf } from "@/lib/shop-context";
import { signOut } from "@/app/(app)/actions";
import {
  cancelAccountDeletion,
  reactivateShop,
} from "@/app/(app)/settings/account-actions";
import { GRACE_DAYS } from "@/lib/account";
import { Wordmark } from "@/components/Brand";

/*
  Where somebody lands when their shop is paused or waiting to be deleted.

  Deliberately OUTSIDE the (app) route group. The signed-in layout redirects
  suspended shops here, so putting this page inside it would bounce forever —
  and a closed shop should not be shown a sidebar full of links that no longer
  work.

  For an owner this is the way back in. For staff it is an explanation and a
  dead end, because reopening the shop is not theirs to decide.

  Reads still work here — RLS allows them, and only writes are refused — which
  is what lets someone see what they still have before deciding.
*/

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function daysUntil(value: string) {
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000));
}

export default async function PausedPage() {
  const { profile } = await getCurrentShopContext();
  const shop = shopOf(profile);

  // Nothing wrong with this shop — don't strand them on a dead end.
  if (!shop?.deactivated_at && !shop?.deletion_requested_at) {
    redirect("/dashboard");
  }

  const isOwner = profile.role === "owner";
  const pendingDeletion = !!shop?.deletion_requested_at;
  const purgeOn = shop?.purge_after;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col justify-center gap-8 px-6 py-16">
      <Wordmark className="text-[32px] text-primary-text" />

      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-[28px] font-semibold leading-tight tab:text-[32px]">
          {pendingDeletion
            ? "This shop is scheduled for deletion"
            : "This shop is paused"}
        </h1>

        {pendingDeletion ? (
          <p className="text-[var(--color-text-secondary)]">
            {purgeOn ? (
              <>
                Everything in <strong>{shop?.name}</strong> will be permanently
                deleted on <strong>{formatDate(purgeOn)}</strong>. That is{" "}
                {daysUntil(purgeOn)} days away. Until then nothing has been
                lost, and it can all be brought back.
              </>
            ) : (
              <>
                Everything in <strong>{shop?.name}</strong> is due to be deleted
                within {GRACE_DAYS} days.
              </>
            )}
          </p>
        ) : (
          <p className="text-[var(--color-text-secondary)]">
            <strong>{shop?.name}</strong> is closed and your subscription has
            stopped. Every sale, product and debt is exactly where you left it.
          </p>
        )}
      </div>

      {isOwner ? (
        <div className="flex flex-col gap-4">
          {/* Wrapped rather than passed straight in: both actions return an
              AccountState, which a form action's signature does not allow.
              Neither returns normally on success — they redirect. */}
          <form
            action={async () => {
              "use server";
              if (pendingDeletion) {
                await cancelAccountDeletion();
              } else {
                await reactivateShop();
              }
            }}
          >
            <button
              type="submit"
              className="h-12 w-full rounded-[10px] bg-[var(--color-primary)] px-6 font-semibold text-white"
            >
              {pendingDeletion ? "Keep my shop" : "Reopen my shop"}
            </button>
          </form>

          <p className="text-sm text-[var(--color-text-secondary)]">
            {pendingDeletion
              ? "Reopening cancels the deletion. You will need to subscribe again to log new sales, but your records come back untouched."
              : "You will need to subscribe again to log new sales, unless you still have free trial left."}
          </p>

          {/* Their records are still here, and they should be able to take a
              copy whether or not they choose to come back. */}
          <a
            href="/api/account/export"
            className="flex h-12 items-center justify-center rounded-[10px] border border-[var(--color-border)] px-6 text-sm font-semibold"
          >
            Download my records
          </a>
        </div>
      ) : (
        <p className="rounded-[10px] bg-[var(--color-bg-surface)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
          Only the shop owner can open it again. Please speak to them.
        </p>
      )}

      <form action={signOut}>
        <button
          type="submit"
          className="text-sm text-[var(--color-text-secondary)] underline"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
