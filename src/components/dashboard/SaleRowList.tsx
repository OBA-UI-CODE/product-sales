"use client";

import { useState } from "react";
import SaleRow from "./SaleRow";
import { EditSaleModal } from "@/app/(app)/sales-history/EditSaleModal";

/*
  Makes the dashboard's "Today's Sales" rows open the same Edit Sale modal that
  Sales History uses, rather than a second copy of it. updateSale/deleteSale
  already revalidate /dashboard, so an edit made here refreshes this screen and
  the stat cards above it.

  The rows themselves are unchanged — SaleRow still renders exactly what the
  Figma frames specify. This only wraps each one in a button, adding a hover
  and a keyboard focus ring. There is no pressed/hover state for these rows in
  the design file, so both are kept deliberately subtle.
*/

export interface DashboardSale {
  id: string;
  initials: string;
  itemName: string;
  meta: string;
  price: string;
  paid: boolean;
  sellerName: string;
  quantity: number;
  totalPrice: number;
  amountPaid: number;
  debtorName: string | null;
  soldAt: string;
  edited: boolean;
}

export default function SaleRowList({ sales }: { sales: DashboardSale[] }) {
  const [editing, setEditing] = useState<DashboardSale | null>(null);

  if (sales.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border-strong p-6 text-center font-body text-[16px] text-text-secondary">
        No sales logged yet today.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {sales.map((sale) => (
        <button
          key={sale.id}
          type="button"
          onClick={() => setEditing(sale)}
          aria-label={`Edit sale: ${sale.itemName}, ${sale.price}`}
          className="block w-full rounded-lg text-left transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-border"
        >
          <SaleRow
            initials={sale.initials}
            name={sale.itemName}
            meta={sale.meta}
            price={sale.price}
            paid={sale.paid}
            seller={sale.sellerName}
          />
        </button>
      ))}

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
