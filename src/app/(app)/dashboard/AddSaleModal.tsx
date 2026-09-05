"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Minus, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatNaira } from "@/lib/format";
import { PaymentFields, type PaymentMode } from "./PaymentFields";
import { addSale } from "./actions";

interface Product {
  id: string;
  name: string;
  category: string | null;
  default_price: number;
}

type Mode = "catalog" | "manual";

export function AddSaleModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("catalog");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [customName, setCustomName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("paid");
  const [amountPaidInput, setAmountPaidInput] = useState("");
  const [debtorName, setDebtorName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("products")
      .select("id, name, category, default_price")
      .is("archived_at", null)
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setProducts(data);
        setLoadingProducts(false);
      });
  }, []);

  const matches = useMemo(() => {
    if (!query.trim() || selected) return [];
    const q = query.trim().toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query, products, selected]);

  function selectProduct(p: Product) {
    setSelected(p);
    setQuery(p.name);
    setPrice(String(p.default_price));
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setSelected(null);
    setQuery("");
    setCustomName("");
    setPrice("");
  }

  const total = (Number(price) || 0) * quantity;
  const canSubmit =
    !submitting &&
    Number(price) > 0 &&
    quantity > 0 &&
    (mode === "catalog" ? !!selected : customName.trim().length > 0) &&
    (paymentMode !== "part" ||
      (Number(amountPaidInput) > 0 && Number(amountPaidInput) < total));

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const amountPaidValue =
      paymentMode === "paid" ? total : paymentMode === "part" ? Number(amountPaidInput) : 0;
    const debtorNameValue =
      paymentMode === "paid" ? null : debtorName.trim() || null;

    const result = await addSale({
      productId: mode === "catalog" ? selected!.id : null,
      customItemName: mode === "manual" ? customName.trim() : null,
      category: mode === "catalog" ? selected?.category ?? null : null,
      quantity,
      totalPrice: total,
      amountPaid: amountPaidValue,
      debtorName: debtorNameValue,
    });

    setSubmitting(false);

    if (result.error) {
      setError("Couldn't save that sale. Try again.");
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center">
      <div className="flex max-h-[92vh] w-full max-w-[480px] flex-col gap-6 overflow-y-auto rounded-t-[24px] bg-[var(--color-bg-surface)] p-8 md:rounded-[24px]">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">Add Sale</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-canvas)] text-[var(--color-text-secondary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-canvas)] p-1">
          <button
            type="button"
            onClick={() => switchMode("catalog")}
            className={`flex-1 rounded-[9px] py-2 text-xs font-semibold transition ${
              mode === "catalog"
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            From Catalog
          </button>
          <button
            type="button"
            onClick={() => switchMode("manual")}
            className={`flex-1 rounded-[9px] py-2 text-xs font-semibold transition ${
              mode === "manual"
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            Type Manually
          </button>
        </div>

        {mode === "catalog" ? (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Product
            </label>
            <div className="relative">
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(null);
                }}
                placeholder="Search products by name"
                className={`w-full rounded-[14px] border bg-[var(--color-bg-canvas)] px-4 py-3 text-sm outline-none ${
                  selected ? "border-[var(--color-primary-hover)]" : "border-[var(--color-border)]"
                }`}
              />
              {matches.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-lg">
                  {matches.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => selectProduct(p)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-[var(--color-bg-canvas)]"
                      >
                        <span>{p.name}</span>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {formatNaira(p.default_price)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {!loadingProducts && query.trim() && !selected && matches.length === 0 && (
                <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                  No matching product. Switch to &quot;Type Manually&quot; to
                  log a one-off item.
                </p>
              )}
            </div>

            {selected && (
              <div className="flex items-center gap-3 rounded-[14px] bg-[var(--color-bg-canvas)] p-4">
                <div className="h-10 w-10 shrink-0 rounded-[10px] bg-[var(--color-border-strong)]" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{selected.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {selected.category ?? "General"} &middot; Default price{" "}
                    {formatNaira(selected.default_price)}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Product Name
            </label>
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Ankara Fabric - 2 yards"
              className="rounded-[14px] border border-[var(--color-primary-hover)] bg-[var(--color-bg-canvas)] px-4 py-3 text-sm outline-none"
            />
          </div>
        )}

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
              placeholder="0"
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

        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="w-full rounded-2xl bg-[var(--color-primary)] py-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-40"
        >
          {submitting ? "Saving..." : "Save Sale"}
        </button>
      </div>
    </div>
  );
}
