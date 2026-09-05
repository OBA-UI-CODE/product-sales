"use client";

import { useState } from "react";
import { formatNaira } from "@/lib/format";
import { RecordPaymentModal } from "./RecordPaymentModal";

interface Debt {
  id: string;
  custom_item_name: string | null;
  productName: string | null;
  debtor_name: string | null;
  total_price: number;
  amount_paid: number;
  sold_at: string;
  sellerName: string;
}

export default function DebtsClient({ debts }: { debts: Debt[] }) {
  const [payTarget, setPayTarget] = useState<Debt | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {debts.length === 0 && (
        <p className="rounded-[14px] border border-dashed border-[var(--color-border)] p-6 text-center text-[var(--color-text-secondary)]">
          No outstanding debts. Everyone&apos;s paid up.
        </p>
      )}
      {debts.map((d) => {
        const owed = d.total_price - d.amount_paid;
        const itemName = d.custom_item_name ?? d.productName ?? "Item";
        const date = new Date(d.sold_at).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        return (
          <div
            key={d.id}
            className="flex flex-col gap-3 rounded-[14px] bg-[var(--color-bg-surface)] p-5 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium">{itemName}</span>
                <span className="rounded-full bg-[var(--color-danger-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-danger)]">
                  Owing
                </span>
              </div>
              <span className="text-sm text-[var(--color-text-secondary)]">
                {d.debtor_name ?? "Customer"} · {date} · logged by {d.sellerName}
              </span>
              <span className="text-sm text-[var(--color-text-secondary)]">
                Total {formatNaira(d.total_price)} · Paid {formatNaira(d.amount_paid)} · Owes {formatNaira(owed)}
              </span>
            </div>
            <button
              onClick={() => setPayTarget(d)}
              className="h-11 shrink-0 rounded-[10px] border border-[var(--color-border)] px-5 font-semibold transition hover:bg-[var(--color-bg-canvas)]"
            >
              Record payment
            </button>
          </div>
        );
      })}

      {payTarget && (
        <RecordPaymentModal
          debt={{
            id: payTarget.id,
            itemName: payTarget.custom_item_name ?? payTarget.productName ?? "Item",
            debtorName: payTarget.debtor_name,
            owed: payTarget.total_price - payTarget.amount_paid,
          }}
          onClose={() => setPayTarget(null)}
        />
      )}
    </div>
  );
}
