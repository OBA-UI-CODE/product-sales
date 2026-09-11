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

/* Sale times in the file are Lagos times, as the owner saw them. */
const lagosStamp = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Africa/Lagos",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const formatStamp = (iso: string) => lagosStamp.format(new Date(iso)).replace(",", "");

/*
  The API returns at most 1000 rows per request. Asked once, as this used to
  be, a shop with more sales got a file that silently stopped at 1000. So
  the sales are read in pages until a short page says there are no more.
  Ordered by time and then id, so no row can fall between two pages.
*/
const PAGE = 1000;

export async function GET() {
  const { supabase, profile } = await getCurrentShopContext();

  /*
    Owner only. The file holds every sale and every customer who owes the
    shop money; whether that leaves the shop is the owner's call, not every
    staff member's. The Settings button is only shown to owners too.
  */
  if (profile.role !== "owner") {
    return new NextResponse("Only the shop owner can download the records.", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  /*
    Downloading the records is a paid feature. Checked against the database,
    which is the authority on the plan, so it holds for anyone typing this
    url in. Personal data requests are separate and free: the Privacy Policy
    sends those to the support email.
  */
  const { data: paid } = await supabase.rpc("current_shop_is_paid");
  if (paid !== true) {
    return new NextResponse(
      "Downloading your records is on the paid plan. Subscribe from Settings to download them.",
      { status: 402, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  const readAllSales = async () => {
    const all = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from("sales")
        .select(
          "id, sold_at, custom_item_name, category, quantity, total_price, amount_paid, debtor_name, seller_id, edited_at, products(name), product_variants(label)"
        )
        .eq("shop_id", profile.shop_id)
        .order("sold_at", { ascending: false })
        .order("id", { ascending: true })
        .range(from, from + PAGE - 1);
      if (error) throw new Error(`Could not read sales for export: ${error.message}`);
      all.push(...(data ?? []));
      if (!data || data.length < PAGE) return all;
    }
  };

  const [sales, { data: staff }, { data: products }] =
    await Promise.all([
      readAllSales(),
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

  const saleRows = sales.map((s) => {
    const total = Number(s.total_price);
    const paid = Number(s.amount_paid);
    return [
      formatStamp(s.sold_at),
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
