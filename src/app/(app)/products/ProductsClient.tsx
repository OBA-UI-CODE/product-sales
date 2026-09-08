"use client";

import { useState, useTransition } from "react";
import { RefreshCw, X, Plus, Search } from "lucide-react";
import { addProduct, addVariant, deleteVariant } from "./actions";
import { matchesSearch } from "@/lib/search";
import { RestockModal } from "./RestockModal";
import { RemoveProductModal } from "./RemoveProductModal";

interface Product {
  id: string;
  name: string;
  category: string | null;
  default_price: number;
  stock_quantity: number;
}

export interface Variant {
  id: string;
  product_id: string;
  label: string;
  price: number;
  stock_quantity: number;
}

/* A draft row in the "sizes" section of the add form. */
interface DraftVariant {
  label: string;
  price: string;
  stock: string;
}

const EMPTY_DRAFT: DraftVariant = { label: "", price: "", stock: "" };

export default function ProductsClient({
  products,
  variants,
}: {
  products: Product[];
  variants: Variant[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  /*
    Sizes are opt-in. Most shops sell a thing at one price and should not have
    to think about variants at all; the ones that sell a relaxer in small,
    medium and big turn this on and price each size separately.
  */
  const [hasSizes, setHasSizes] = useState(false);
  const [drafts, setDrafts] = useState<DraftVariant[]>([{ ...EMPTY_DRAFT }]);
  const [addingSizeTo, setAddingSizeTo] = useState<string | null>(null);
  const [newSize, setNewSize] = useState<DraftVariant>({ ...EMPTY_DRAFT });
  const [restockTarget, setRestockTarget] = useState<Product | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Product | null>(null);
  const [restockVariantTarget, setRestockVariantTarget] =
    useState<Variant | null>(null);
  const [pending, startTransition] = useTransition();

  /*
    Which products survive the search.

    Size labels are part of the haystack, so a product is kept when the query
    matches the product itself OR any of its sizes — otherwise searching
    "6-pack" would return nothing, since no product is called that.

    Recomputed each render rather than memoised: it is a handful of string
    comparisons over one shop's catalogue, and useMemo here would cost more in
    complexity than it saves.
  */
  const visible = products.filter((p) => {
    const labels = variants
      .filter((v) => v.product_id === p.id)
      .map((v) => v.label)
      .join(" ");
    return matchesSearch(query, p.name, p.category, labels);
  });

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
              setHasSizes(false);
              setDrafts([{ ...EMPTY_DRAFT }]);
            })
          }
          className="flex flex-col gap-5 rounded-[14px] bg-[var(--color-bg-surface)] p-5 tab:gap-4 tab:p-6"
        >
          <input
            type="hidden"
            name="variants"
            value={hasSizes ? JSON.stringify(drafts.filter((d) => d.label.trim())) : "[]"}
          />

          <div className="flex flex-col gap-4 tab:flex-row tab:items-end">
            <input
              name="name"
              required
              placeholder="Product name (e.g. Relaxer)"
              className="h-11 w-full min-w-0 shrink-0 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-4 text-sm tab:flex-1"
            />
            <input
              name="category"
              placeholder="Category"
              className="h-11 w-full min-w-0 shrink-0 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-4 text-sm tab:flex-1"
            />
            {/* Only meaningful when the product has no sizes — otherwise each
                size carries its own price and stock. */}
            {!hasSizes && (
              <>
                <input
                  name="price"
                  type="number"
                  required
                  placeholder="Price"
                  className="h-11 w-full min-w-0 shrink-0 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-4 text-sm tab:w-32"
                />
                <input
                  name="stock"
                  type="number"
                  required
                  placeholder="Stock"
                  className="h-11 w-full min-w-0 shrink-0 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-4 text-sm tab:w-28"
                />
              </>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <input
              type="checkbox"
              checked={hasSizes}
              onChange={(e) => setHasSizes(e.target.checked)}
              className="size-4 accent-[var(--color-primary)]"
            />
            This product comes in different sizes or packs
          </label>

          {hasSizes && (
            <div className="flex flex-col gap-4 overflow-hidden rounded-[10px] bg-[var(--color-bg-canvas)] p-4 tab:gap-3">
              <p className="text-xs text-[var(--color-text-muted)]">
                Give each size its own price and stock. They are counted
                separately, so selling a 12-pack does not touch the singles.
              </p>
              {drafts.map((d, i) => (
                <div key={i} className="flex flex-col gap-3 tab:flex-row tab:gap-2">
                  <input
                    value={d.label}
                    onChange={(e) =>
                      setDrafts((rows) =>
                        rows.map((r, j) =>
                          j === i ? { ...r, label: e.target.value } : r
                        )
                      )
                    }
                    placeholder="Size (e.g. Small, Big 12-pack)"
                    className="h-11 w-full min-w-0 shrink-0 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 text-sm tab:flex-1"
                  />
                  <input
                    value={d.price}
                    onChange={(e) =>
                      setDrafts((rows) =>
                        rows.map((r, j) =>
                          j === i ? { ...r, price: e.target.value } : r
                        )
                      )
                    }
                    type="number"
                    inputMode="numeric"
                    placeholder="Price"
                    className="h-11 w-full min-w-0 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 text-sm shrink-0 tab:w-28 web:w-32"
                  />
                  <input
                    value={d.stock}
                    onChange={(e) =>
                      setDrafts((rows) =>
                        rows.map((r, j) =>
                          j === i ? { ...r, stock: e.target.value } : r
                        )
                      )
                    }
                    type="number"
                    inputMode="numeric"
                    placeholder="Stock"
                    className="h-11 w-full min-w-0 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 text-sm shrink-0 tab:w-24 web:w-28"
                  />
                  {drafts.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setDrafts((rows) => rows.filter((_, j) => j !== i))
                      }
                      aria-label="Remove this size"
                      className="flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-[10px] bg-[var(--color-border-strong)] tab:self-auto"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setDrafts((rows) => [...rows, { ...EMPTY_DRAFT }])}
                className="self-start text-sm font-semibold text-[var(--color-accent-light)]"
              >
                + Add another size
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="h-11 self-start rounded-[10px] bg-[var(--color-primary)] px-5 font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save"}
          </button>
        </form>
      )}

      {/*
        Search.

        Filtered here in the browser, not on the server: the whole list is
        already loaded, so results appear as fast as the owner types instead
        of waiting on a round trip for every keystroke. A shop's own catalogue
        is small enough that this stays instant.

        A product matches on its name, its category, or ANY of its size
        labels — so searching "12 pack" finds the Relaxer that has one, even
        though the word never appears in the product's own name.
      */}
      {products.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Search
              size={18}
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your products"
              aria-label="Search your products"
              className="h-12 w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] pl-11 pr-11 text-sm"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-border-strong)]"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {query.trim() && (
            <p role="status" className="text-sm text-[var(--color-text-secondary)]">
              {visible.length === 0
                ? "No product matches that."
                : `${visible.length} of ${products.length} products`}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {products.length === 0 && (
          <p className="rounded-[14px] border border-dashed border-[var(--color-border)] p-6 text-center text-[var(--color-text-secondary)]">
            No products yet. Add your first one above.
          </p>
        )}
        {products.length > 0 && visible.length === 0 && (
          <p className="rounded-[14px] border border-dashed border-[var(--color-border)] p-6 text-center text-[var(--color-text-secondary)]">
            Nothing matches &ldquo;{query.trim()}&rdquo;. Try a shorter word, or
            the size you are looking for.
          </p>
        )}
        {visible.map((p) => {
          const productVariants = variants.filter((v) => v.product_id === p.id);
          const hasVariants = productVariants.length > 0;
          /* With sizes, the product's own stock figure is meaningless — the
             real count is the sum of its sizes. */
          const totalStock = hasVariants
            ? productVariants.reduce((sum, v) => sum + v.stock_quantity, 0)
            : p.stock_quantity;
          const lowStock = totalStock <= 5;
          return (
            <div
              key={p.id}
              className="flex flex-col rounded-[14px] bg-[var(--color-bg-surface)]"
            >
            <div className="flex items-center justify-between gap-3 px-4 py-4 tab:py-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[10px] bg-[var(--color-border-strong)]" />
                <div className="flex flex-col">
                  <span className="text-lg">{p.name}</span>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {p.category ?? "General"}
                    {hasVariants
                      ? ` · ${productVariants.length} sizes`
                      : ` · ₦${p.default_price.toLocaleString()}`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className={lowStock ? "text-[var(--color-danger)]" : ""}>
                    {totalStock} in stock
                  </span>
                  {lowStock && (
                    <span className="text-xs text-[var(--color-danger)]">
                      Low stock
                    </span>
                  )}
                </div>
                {!hasVariants && (
                  <button
                    onClick={() => setRestockTarget(p)}
                    title="Restock"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-border-strong)]"
                  >
                    <RefreshCw size={16} />
                  </button>
                )}
                <button
                  onClick={() => setRemoveTarget(p)}
                  title="Remove product"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-border-strong)]"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Sizes, each with its own price and stock */}
            {hasVariants && (
              <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-4 py-4 tab:gap-2 tab:py-3">
                {productVariants.map((v) => {
                  const vLow = v.stock_quantity <= 5;
                  return (
                    <div
                      key={v.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      {/*
                        The price is outside the truncating span on purpose.
                        Both used to sit in one, so a long size name ate the
                        figure — "Small 12-pack · ₦7,6..." — which is the one
                        thing the row exists to show. The NAME clips instead.
                      */}
                      <span className="flex min-w-0 items-baseline gap-1">
                        <span className="truncate">{v.label}</span>
                        <span className="shrink-0 text-[var(--color-text-muted)]">
                          · ₦{Number(v.price).toLocaleString()}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-3">
                        <span
                          className={
                            vLow ? "text-[var(--color-danger)]" : "text-[var(--color-text-secondary)]"
                          }
                        >
                          {v.stock_quantity} in stock
                        </span>
                        <button
                          onClick={() => setRestockVariantTarget(v)}
                          title={`Restock ${v.label}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-border-strong)]"
                        >
                          <RefreshCw size={14} />
                        </button>
                        <button
                          onClick={() =>
                            startTransition(() => deleteVariant(v.id))
                          }
                          title={`Remove ${v.label}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-border-strong)]"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    </div>
                  );
                })}

                {addingSizeTo === p.id ? (
                  <div className="flex flex-col gap-3 pt-1 tab:flex-row tab:gap-2">
                    <input
                      value={newSize.label}
                      onChange={(e) =>
                        setNewSize((n) => ({ ...n, label: e.target.value }))
                      }
                      placeholder="Size"
                      className="h-10 w-full min-w-0 shrink-0 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-3 text-sm tab:flex-1"
                    />
                    <input
                      value={newSize.price}
                      onChange={(e) =>
                        setNewSize((n) => ({ ...n, price: e.target.value }))
                      }
                      type="number"
                      placeholder="Price"
                      className="h-10 w-full min-w-0 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-3 text-sm shrink-0 tab:w-24 web:w-28"
                    />
                    <input
                      value={newSize.stock}
                      onChange={(e) =>
                        setNewSize((n) => ({ ...n, stock: e.target.value }))
                      }
                      type="number"
                      placeholder="Stock"
                      className="h-10 w-full min-w-0 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-3 text-sm shrink-0 tab:w-20 web:w-24"
                    />
                    <button
                      onClick={() =>
                        startTransition(async () => {
                          await addVariant(p.id, {
                            label: newSize.label,
                            price: Number(newSize.price) || 0,
                            stock: Number(newSize.stock) || 0,
                          });
                          setNewSize({ ...EMPTY_DRAFT });
                          setAddingSizeTo(null);
                        })
                      }
                      disabled={pending || !newSize.label.trim()}
                      className="h-10 shrink-0 whitespace-nowrap rounded-[10px] bg-[var(--color-primary)] px-4 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAddingSizeTo(p.id);
                      setNewSize({ ...EMPTY_DRAFT });
                    }}
                    className="self-start pt-1 text-sm font-semibold text-[var(--color-accent-light)]"
                  >
                    + Add size
                  </button>
                )}
              </div>
            )}
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

      {/* Same dialog, but topping up one size rather than the product. */}
      {restockVariantTarget && (
        <RestockModal
          product={{
            id: restockVariantTarget.product_id,
            name: restockVariantTarget.label,
            stock_quantity: restockVariantTarget.stock_quantity,
          }}
          variantId={restockVariantTarget.id}
          onClose={() => setRestockVariantTarget(null)}
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
