"use client";

import { useState, useTransition } from "react";
import { RefreshCw, X, Plus } from "lucide-react";
import { addProduct } from "./actions";
import { RestockModal } from "./RestockModal";
import { RemoveProductModal } from "./RemoveProductModal";

interface Product {
  id: string;
  name: string;
  category: string | null;
  default_price: number;
  stock_quantity: number;
}

export default function ProductsClient({ products }: { products: Product[] }) {
  const [showForm, setShowForm] = useState(false);
  const [restockTarget, setRestockTarget] = useState<Product | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Product | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-[32px] font-semibold">Products</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex h-11 items-center gap-2 rounded-[10px] bg-[var(--color-primary)] px-5 font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {showForm && (
        <form
          action={(fd) =>
            startTransition(async () => {
              await addProduct(fd);
              setShowForm(false);
            })
          }
          className="flex flex-col gap-4 rounded-[14px] bg-[var(--color-bg-surface)] p-6 md:flex-row md:items-end"
        >
          <input
            name="name"
            required
            placeholder="Product name"
            className="h-11 flex-1 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-4 text-sm"
          />
          <input
            name="category"
            placeholder="Category"
            className="h-11 flex-1 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-4 text-sm"
          />
          <input
            name="price"
            type="number"
            required
            placeholder="Price"
            className="h-11 w-32 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-4 text-sm"
          />
          <input
            name="stock"
            type="number"
            required
            placeholder="Stock"
            className="h-11 w-28 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-4 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="h-11 rounded-[10px] bg-[var(--color-primary)] px-5 font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save"}
          </button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {products.length === 0 && (
          <p className="rounded-[14px] border border-dashed border-[var(--color-border)] p-6 text-center text-[var(--color-text-secondary)]">
            No products yet. Add your first one above.
          </p>
        )}
        {products.map((p) => {
          const lowStock = p.stock_quantity <= 5;
          return (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-[14px] bg-[var(--color-bg-surface)] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[10px] bg-[var(--color-border-strong)]" />
                <div className="flex flex-col">
                  <span className="text-lg">{p.name}</span>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {p.category ?? "General"} · ₦{p.default_price.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className={lowStock ? "text-[var(--color-danger)]" : ""}>
                    {p.stock_quantity} in stock
                  </span>
                  {lowStock && (
                    <span className="text-xs text-[var(--color-danger)]">
                      Low stock
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setRestockTarget(p)}
                  title="Restock"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-border-strong)]"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  onClick={() => setRemoveTarget(p)}
                  title="Remove product"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-border-strong)]"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {restockTarget && (
        <RestockModal
          product={restockTarget}
          onClose={() => setRestockTarget(null)}
        />
      )}

      {removeTarget && (
        <RemoveProductModal
          product={removeTarget}
          onClose={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
}
