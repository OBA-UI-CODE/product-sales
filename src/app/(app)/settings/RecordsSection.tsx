import { Download } from "lucide-react";

/*
  Downloading the shop's records, in plain sight.

  The pricing page lists "Download your records" as part of the paid plan,
  but the only way to it used to be the delete-my-shop flow (and the paused
  page), which is not where anyone looks for it. This puts it in Settings.

  Owners only (the page does not render it for staff, and the export route
  refuses them). On Free it says what it is and where to get it, rather than
  a button that would only answer "paid plan". Not in Figma; follows the
  other Settings cards.
*/
export default function RecordsSection({ paid }: { paid: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold">Your records</h2>

      <div className="flex flex-col gap-4 rounded-md bg-[var(--color-bg-surface)] p-5 tab:p-6">
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          A spreadsheet of every sale, debt and product in your shop, with who
          sold what and when. Opens in Excel or Google Sheets. Keep a copy for
          your accounts.
        </p>

        {paid ? (
          <a
            href="/api/account/export"
            className="press flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] px-6 font-semibold text-white tab:self-start"
          >
            <Download size={16} aria-hidden />
            Download my records
          </a>
        ) : (
          <div className="flex flex-col gap-3 tab:flex-row tab:items-center tab:justify-between">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Downloading your records is on the paid plan.
            </p>
            <a
              href="#billing"
              className="press flex h-11 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] px-6 text-sm font-semibold"
            >
              See plans
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
