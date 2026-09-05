"use client";

import { useState } from "react";
import { initials, formatNaira } from "@/lib/format";
import { EditSaleModal } from "./EditSaleModal";

export interface SaleRowData {
  id: string;
  itemName: string;
  category: string | null;
  quantity: number;
  totalPrice: number;
  amountPaid: number;
  debtorName: string | null;
  sellerName: string;
  soldAt: string;
  edited: boolean;
}

export function SaleList({ sales }: { sales: SaleRowData[] }) {
  const [editing, setEditing] = useState<SaleRowData | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {sales.map((sale) => {
        const isPaid = sale.amountPaid >= sale.totalPrice;
        const time = new Date(sale.soldAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });

        return (
          <button
            key={sale.id}
            onClick={() => setEditing(sale)}
            className="flex items-center justify-between rounded-[14px] bg-[var(--color-bg-surface)] px-4 py-3 text-left transition hover:bg-[var(--color-bg-canvas)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-border-strong)] text-sm">
                {initials(sale.sellerName)}
              </div>
              <div className="flex flex-col">
                <span className="text-lg">{sale.itemName}</span>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {sale.category ?? "General"} · {time}
                  {sale.edited && " · edited"}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium">
                  {formatNaira(sale.totalPrice)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    isPaid
                      ? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                      : "bg-[var(--color-danger-bg)] text-[var(--color-danger)]"
                  }`}
                >
                  {isPaid ? "Paid" : "Owing"}
                </span>
              </div>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {sale.sellerName}
              </span>
            </div>
          </button>
        );
      })}

      {editing && (
        <EditSaleModal
          sale={{
            id: editing.id,
            itemName: editing.itemName,
            quantity: editing.quantity,
            totalPrice: editing.totalPrice,
            amountPaid: editing.amountPaid,
            debtorName: editing.debtorName,
            sellerName: editing.sellerName,
            soldAt: editing.soldAt,
            edited: editing.edited,
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
