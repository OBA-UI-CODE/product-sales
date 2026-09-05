"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { formatNaira } from "@/lib/format";
import { PaymentFields, type PaymentMode } from "../dashboard/PaymentFields";
import { updateSale, deleteSale } from "./actions";

interface EditableSale {
  id: string;
  itemName: string;
  quantity: number;
  totalPrice: number;
  amountPaid: number;
  debtorName: string | null;
  sellerName: string;
  soldAt: string;
  edited: boolean;
}

function initialPaymentMode(sale: EditableSale): PaymentMode {
  if (sale.amountPaid <= 0) return "unpaid";
  if (sale.amountPaid < sale.totalPrice) return "part";
  return "paid";
}

export function EditSaleModal({
  sale,
  onClose,
}: {
  sale: EditableSale;
  onClose: () => void;
}) {
  const router = useRouter();
  const unitPrice = sale.quantity > 0 ? sale.totalPrice / sale.quantity : sale.totalPrice;
  const [price, setPrice] = useState(String(Math.round(unitPrice)));
  const [quantity, setQuantity] = useState(sale.quantity);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(initialPaymentMode(sale));
  const [amountPaidInput, setAmountPaidInput] = useState(String(sale.amountPaid));
  const [debtorName, setDebtorName] = useState(sale.debtorName ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = (Number(price) || 0) * quantity;
  const canSubmit =
    !submitting &&
    Number(price) > 0 &&
    quantity > 0 &&
    (paymentMode !== "part" ||
      (Number(amountPaidInput) > 0 && Number(amountPaidInput) < total));

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const amountPaidValue =
      paymentMode === "paid" ? total : paymentMode === "part" ? Number(amountPaidInput) : 0;
    const debtorNameValue = paymentMode === "paid" ? null : debtorName.trim() || null;

    try {
      await updateSale({
        saleId: sale.id,
        quantity,
        totalPrice: total,
        amountPaid: amountPaidValue,
        debtorName: debtorNameValue,
      });
      router.refresh();
      onClose();
    } catch {
      setError("Couldn't save those changes. Try again.");
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteSale(sale.id);
      router.refresh();
      onClose();
    } catch {
      setError("Couldn't delete this sale. Try again.");
      setDeleting(false);
    }
  }

  const time = new Date(sale.soldAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center">
      <div className="flex max-h-[92vh] w-full max-w-[480px] flex-col gap-6 overflow-y-auto rounded-t-[24px] bg-[var(--color-bg-surface)] p-8 md:rounded-[24px]">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">Edit Sale</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-canvas)] text-[var(--color-text-secondary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="-mt-4 text-xs text-[var(--color-text-muted)]">
          Logged {time} by {sale.sellerName}
          {sale.edited && " · edited"}
        </p>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Item
          </label>
          <div className="rounded-[14px] bg-[var(--color-bg-canvas)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
            {sale.itemName}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Price (NGN)
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-4 py-3 text-lg font-semibold outline-none focus:border-[var(--color-primary-hover)]"
            />
          </div>
          <div className="w-[110px]">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Quantity
            </label>
            <div className="flex items-center justify-between rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-2 py-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--color-bg-surface)]"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-lg font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <PaymentFields
          mode={paymentMode}
          setMode={setPaymentMode}
          amountPaid={amountPaidInput}
          setAmountPaid={setAmountPaidInput}
          debtorName={debtorName}
          setDebtorName={setDebtorName}
          total={total}
        />

        <div className="border-t border-[var(--color-border)] pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-secondary)]">Total</span>
            <span className="font-heading text-2xl font-bold">{formatNaira(total)}</span>
          </div>
        </div>

        {error && (
          <p className="rounded-[10px] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="w-full rounded-2xl bg-[var(--color-primary)] py-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-40"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>

          {!confirmingDelete ? (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-danger-bg)] py-3.5 text-sm font-semibold text-[var(--color-danger)]"
            >
              <Trash2 className="h-4 w-4" />
              Delete Sale
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="flex-1 rounded-2xl border border-[var(--color-border)] py-3.5 text-sm font-semibold text-[var(--color-text-secondary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-2xl bg-[var(--color-danger-bg)] py-3.5 text-sm font-semibold text-[var(--color-danger)] disabled:opacity-40"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
