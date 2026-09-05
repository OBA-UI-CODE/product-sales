"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { formatNaira } from "@/lib/format";
import { recordPayment } from "./actions";

interface Debt {
  id: string;
  itemName: string;
  debtorName: string | null;
  owed: number;
}

export function RecordPaymentModal({
  debt,
  onClose,
}: {
  debt: Debt;
  onClose: () => void;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !submitting && Number(amount) > 0 && Number(amount) <= debt.owed;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      await recordPayment(debt.id, Number(amount));
      router.refresh();
      onClose();
    } catch {
      setError("Couldn't record that payment. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center">
      <div className="w-full max-w-[400px] rounded-t-[24px] bg-[var(--color-bg-surface)] p-8 md:rounded-[24px]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">Record Payment</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-canvas)] text-[var(--color-text-secondary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
          {debt.itemName}
          {debt.debtorName && ` · ${debt.debtorName}`} &middot; owes{" "}
          {formatNaira(debt.owed)}
        </p>

        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Amount to pay
        </label>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={debt.owed}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          autoFocus
          className="w-full rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary-hover)]"
        />

        {error && (
          <p className="mt-4 rounded-[10px] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="mt-6 w-full rounded-2xl bg-[var(--color-primary)] py-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-40"
        >
          {submitting ? "Saving..." : "Record Payment"}
        </button>
      </div>
    </div>
  );
}
