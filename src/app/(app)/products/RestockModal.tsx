"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { restockProduct, restockVariant } from "./actions";

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
}

export function RestockModal({
  product,
  variantId,
  onClose,
}: {
  product: Product;
  /* When set, the stock being topped up belongs to a size rather than to the
     product itself, so the variant RPC is the one that must run. */
  variantId?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !submitting && Number(amount) > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      if (variantId) {
        await restockVariant(variantId, Number(amount));
      } else {
        await restockProduct(product.id, Number(amount));
      }
      router.refresh();
      onClose();
    } catch {
      setError("Couldn't restock this product. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center">
      <div className="w-full max-w-[400px] rounded-t-md bg-[var(--color-bg-surface)] p-8 md:rounded-md">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">Add Stock</h2>
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
          {product.name} &middot; currently {product.stock_quantity} in stock
        </p>

        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Quantity to add
        </label>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 10"
          autoFocus
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary-hover)]"
        />

        {error && (
          <p className="mt-4 rounded-md bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="rounded-md mt-6 w-full bg-[var(--color-primary)] py-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-40"
        >
          {submitting ? "Saving..." : "Add Stock"}
        </button>
      </div>
    </div>
  );
}
