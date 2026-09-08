import { getCurrentShopContext } from "@/lib/shop-context";
import { NextResponse } from "next/server";

/*
  Downloads the shop's records as CSV.

  This exists mainly because of account deletion. A shop's sales are its
  business records — what was sold, who still owes money — and someone may
  well need them for tax long after they have stopped using JOHTA. Destroying
  them without ever offering a copy would be careless, so the delete flow
  hands this over first.

  It is also just useful on its own: opening the file in Excel is the fastest
  way for an owner to do anything we have not built a screen for.

  Everything is read through the SIGNED-IN user's client, so row-level
  security decides what comes back. There is no shop id in the URL and nothing
  to tamper with — you get your own shop's rows or nothing.
*/

export const dynamic = "force-dynamic";

/*
  Escapes one CSV field.

  Wrapping every value in quotes and doubling any quote inside it is the
  RFC 4180 rule, and it is what keeps a shop called O'Brien & Sons, or a
  debtor's note containing a comma, from silently shifting every column after
  it one place to the left.

  The leading apostrophe guard is for spreadsheets, not for CSV: Excel treats
  a field starting with =, +, - or @ as a FORMULA. A customer name typed as
  "=cmd|..." becomes a live formula when the owner opens the file. Prefixing a
  single quote makes Excel treat it as text.
*/
function csvField(value: unknown): string {
  if (value === null || value === undefined) return '""';
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

function csvRows(rows: unknown[][]): string {
  return rows.map((row) => row.map(csvField).join(",")).join("\r\n");
}

export async function GET() {
  const { supabase, profile } = await getCurrentShopContext();

  const [{ data: sales }, { data: staff }, { data: products }] =
    await Promise.all([
      supabase
        .from("sales")
        .select(
          "sold_at, custom_item_name, category, quantity, total_price, amount_paid, debtor_name, seller_id, edited_at, products(name), product_variants(label)"
        )
        .eq("shop_id", profile.shop_id)
        .order("sold_at", { ascending: false }),
      supabase.from("profiles").select("id, name").eq("shop_id", profile.shop_id),
      supabase
        .from("products")
        .select("name, category, default_price, stock_quantity")
        .eq("shop_id", profile.shop_id)
        .is("archived_at", null),
    ]);

  const sellerName = new Map((staff ?? []).map((s) => [s.id, s.name]));

  const header = [
    "Date",
    "Item",
    "Size / pack",
    "Category",
    "Quantity",
    "Total price",
    "Amount paid",
    "Balance owed",
    "Owed by",
    "Sold by",
    "Edited",
  ];

  const saleRows = (sales ?? []).map((s) => {
    const total = Number(s.total_price);
    const paid = Number(s.amount_paid);
    return [
      new Date(s.sold_at).toISOString().replace("T", " ").slice(0, 16),
      s.custom_item_name ??
        (s.products as unknown as { name: string } | null)?.name ??
        "Item",
      (s.product_variants as unknown as { label: string } | null)?.label ?? "",
      s.category ?? "",
      s.quantity,
      total,
      paid,
      Math.max(0, total - paid),
      s.debtor_name ?? "",
      sellerName.get(s.seller_id) ?? "Staff",
      s.edited_at ? "yes" : "",
    ];
  });

  /*
    Products go in the same file, after a blank line and their own header.
    One attachment is easier for a shop owner to keep hold of than two, and
    Excel copes with it perfectly well.
  */
  const productHeader = ["Product", "Category", "Price", "Stock left"];
  const productRows = (products ?? []).map((p) => [
    p.name,
    p.category ?? "",
    Number(p.default_price),
    p.stock_quantity,
  ]);

  const csv =
    csvRows([header, ...saleRows]) +
    "\r\n\r\n" +
    csvRows([productHeader, ...productRows]) +
    "\r\n";

  /*
    The BOM is not decoration. Without it Excel on Windows reads the file as
    the system codepage and every ₦ and every Nigerian name with an accent
    comes out as mojibake.
  */
  const body = "﻿" + csv;

  const shop = profile.shops as unknown as { name: string } | null;
  const slug = (shop?.name ?? "johta")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-records-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
