"use client";

import type { Dispatch, SetStateAction } from "react";
import { formatNaira } from "@/lib/format";

export type PaymentMode = "paid" | "part" | "unpaid";

const OPTIONS: [PaymentMode, string][] = [
  ["paid", "Paid"],
  ["part", "Part-paid"],
  ["unpaid", "Not paid"],
];

export function PaymentFields({
  mode,
  setMode,
  amountPaid,
  setAmountPaid,
  debtorName,
  setDebtorName,
  total,
}: {
  mode: PaymentMode;
  setMode: Dispatch<SetStateAction<PaymentMode>>;
  amountPaid: string;
  setAmountPaid: Dispatch<SetStateAction<string>>;
  debtorName: string;
  setDebtorName: Dispatch<SetStateAction<string>>;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        Payment
      </label>
      <div className="flex rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-canvas)] p-1">
        {OPTIONS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={`flex-1 rounded-[9px] py-2 text-xs font-semibold transition ${
              mode === value
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "part" && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Amount paid (of {formatNaira(total)})
          </label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            placeholder="0"
            className="rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary-hover)]"
          />
        </div>
      )}

      {mode !== "paid" && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Customer name (who owes) — optional
          </label>
          <input
            value={debtorName}
            onChange={(e) => setDebtorName(e.target.value)}
            placeholder="e.g. Chidi"
            className="rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary-hover)]"
          />
        </div>
      )}
    </div>
  );
}
