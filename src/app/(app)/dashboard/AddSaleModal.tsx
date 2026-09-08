"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Minus, Plus } from "lucide-react";
import { matchesSearch } from "@/lib/search";
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

interface Variant {
  id: string;
  product_id: string;
  label: string;
  price: number;
  stock_quantity: number;
}

/*
  One searchable line in the picker.

  A product with sizes contributes one option PER size, so typing "relaxer"
  lists "Relaxer — Small", "Relaxer — Big", "Relaxer — Big 6-pack" with their
  own prices, and picking one fills that price in. A product with no sizes
  contributes a single option and behaves exactly as it always has.
*/
interface SaleOption {
  key: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantLabel: string | null;
  category: string | null;
  price: number;
  stock: number | null;
}

type Mode = "catalog" | "manual";

export function AddSaleModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("catalog");
  const [options, setOptions] = useState<SaleOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SaleOption | null>(null);
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
    let cancelled = false;

    async function load() {
      const [{ data: products }, { data: variants }] = await Promise.all([
        supabase
          .from("products")
          .select("id, name, category, default_price")
          .is("archived_at", null)
          .order("name", { ascending: true }),
        supabase
          .from("product_variants")
          .select("id, product_id, label, price, stock_quantity")
          .is("archived_at", null)
          .order("price", { ascending: true }),
      ]);

      if (cancelled) return;

      const byProduct = new Map<string, Variant[]>();
      for (const v of (variants ?? []) as Variant[]) {
        const list = byProduct.get(v.product_id) ?? [];
        list.push(v);
        byProduct.set(v.product_id, list);
      }

      const built: SaleOption[] = [];
      for (const p of (products ?? []) as Product[]) {
        const vs = byProduct.get(p.id);
        if (vs && vs.length > 0) {
          for (const v of vs) {
            built.push({
              key: v.id,
              productId: p.id,
              variantId: v.id,
              productName: p.name,
              variantLabel: v.label,
              category: p.category,
              price: Number(v.price),
              stock: v.stock_quantity,
            });
          }
        } else {
          built.push({
            key: p.id,
            productId: p.id,
            variantId: null,
            productName: p.name,
            variantLabel: null,
            category: p.category,
            price: Number(p.default_price),
            stock: null,
          });
        }
      }

      setOptions(built);
      setLoadingProducts(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const matches = useMemo(() => {
    if (!query.trim() || selected) return [];
    /*
      The comment here used to claim that "12 pack" found the size as readily
      as "relaxer". It did not: this was a plain substring test, and
      "small 12-pack" does not contain "12 pack" because of the hyphen — so
      the one product being searched for was the one that never came back.

      matchesSearch strips punctuation and requires every word to appear
      somewhere across the name AND the size label, so "12 pack", "12-pack"
      and "relaxer big" all work.

      The cap is 8 rather than 6 because one product can now fill several rows
      on its own.
    */
    return options
      .filter((o) => matchesSearch(query, o.productName, o.variantLabel))
      .slice(0, 8);
  }, [query, options, selected]);

  function selectOption(o: SaleOption) {
    setSelected(o);
    setQuery(o.variantLabel ? `${o.productName} — ${o.variantLabel}` : o.productName);
    setPrice(String(o.price));
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
      productId: mode === "catalog" ? selected!.productId : null,
      variantId: mode === "catalog" ? selected!.variantId : null,
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
                placeholder="Search products by name or size"
                className={`w-full rounded-[14px] border bg-[var(--color-bg-canvas)] px-4 py-3 text-sm outline-none ${
                  selected ? "border-[var(--color-primary-hover)]" : "border-[var(--color-border)]"
                }`}
              />
              {matches.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-lg">
                  {matches.map((o) => (
                    <li key={o.key}>
                      <button
                        type="button"
                        onClick={() => selectOption(o)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-[var(--color-bg-canvas)]"
                      >
                        <span className="min-w-0">
                          <span className="block truncate">
                            {o.productName}
                            {o.variantLabel && (
                              <span className="text-[var(--color-text-secondary)]">
                                {" "}
                                — {o.variantLabel}
                              </span>
                            )}
                          </span>
                          {/* Stock is shown but never blocks the sale: the last
                              packet often goes out before anyone updates the
                              count, and an unrecorded sale is the worse error. */}
                          {o.stock !== null && (
                            <span
                              className={`block text-xs ${
                                o.stock <= 0
                                  ? "text-[var(--color-danger)]"
                                  : "text-[var(--color-text-muted)]"
                              }`}
                            >
                              {o.stock <= 0
                                ? "Out of stock"
                                : `${o.stock} in stock`}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs text-[var(--color-text-muted)]">
                          {formatNaira(o.price)}
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
                  <p className="truncate text-sm font-semibold">
                    {selected.productName}
                    {selected.variantLabel && ` — ${selected.variantLabel}`}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {selected.category ?? "General"} &middot;{" "}
                    {selected.variantLabel ? "Price" : "Default price"}{" "}
                    {formatNaira(selected.price)}
                    {selected.stock !== null && ` · ${selected.stock} in stock`}
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
