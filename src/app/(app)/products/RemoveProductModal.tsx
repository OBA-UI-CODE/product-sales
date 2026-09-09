"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2 } from "lucide-react";
import { deleteProduct } from "./actions";

interface Product {
  id: string;
  name: string;
}

export function RemoveProductModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);

    try {
      await deleteProduct(product.id);
      router.refresh();
      onClose();
    } catch {
      setError("Couldn't remove this product. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center">
      <div className="w-full max-w-[400px] rounded-t-md bg-[var(--color-bg-surface)] p-8 md:rounded-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">Remove Product</h2>
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
          Remove &quot;{product.name}&quot;? Past sales referencing it are
          kept. This just archives it from your catalog.
        </p>

        {error && (
          <p className="mb-4 rounded-md bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md flex-1 border border-[var(--color-border)] py-3.5 text-sm font-semibold text-[var(--color-text-secondary)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="rounded-md flex flex-1 items-center justify-center gap-2 bg-[var(--color-danger-bg)] py-3.5 text-sm font-semibold text-[var(--color-danger)] disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            {submitting ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}
