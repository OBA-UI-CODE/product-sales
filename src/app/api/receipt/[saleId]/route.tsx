import { ImageResponse } from "next/og";
import { getCurrentShopContext } from "@/lib/shop-context";

/*
  A receipt for one sale, as a PNG.

  An IMAGE, not a PDF, on purpose. Shop owners here send things on WhatsApp,
  where an image appears in the chat and a PDF is a download the customer has
  to find and open. One tap versus four.

  A RECEIPT, and never an invoice. Nigeria's FIRS e-invoicing rules define a
  tax invoice as carrying sequential numbering, a tax identification number, a
  business registration number and a VAT line. This deliberately has none of
  those, and never says "invoice", because a slip that looks like a tax
  document could lead a shop owner to believe they are compliant when they are
  not. VAT registration starts at ₦25m of turnover, well above the shops using
  JOHTA, so staying plainly a receipt keeps them outside that regime instead of
  pretending to satisfy it.

  Reading is done with the SIGNED-IN user's client, so row-level security
  decides what comes back: a sale id from another shop simply is not found.
  The id in the url is not trusted for anything.
*/

export const dynamic = "force-dynamic";

const money = (n: number) =>
  "NGN " + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ saleId: string }> }
) {
  const { saleId } = await params;
  const { supabase, profile } = await getCurrentShopContext();

  const { data: sale } = await supabase
    .from("sales")
    .select(
      "id, custom_item_name, category, quantity, total_price, amount_paid, debtor_name, sold_at, edited_at, seller_id, products(name), product_variants(label)"
    )
    .eq("id", saleId)
    .eq("shop_id", profile.shop_id)
    .maybeSingle();

  if (!sale) {
    return new Response("Not found", { status: 404 });
  }

  const [{ data: shop }, { data: seller }] = await Promise.all([
    supabase
      .from("shops")
      .select("name, phone")
      .eq("id", profile.shop_id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("name")
      .eq("id", sale.seller_id)
      .maybeSingle(),
  ]);

  const item =
    sale.custom_item_name ??
    (sale.products as unknown as { name: string } | null)?.name ??
    "Item";
  const size = (sale.product_variants as unknown as { label: string } | null)
    ?.label;

  const total = Number(sale.total_price);
  const paid = Number(sale.amount_paid);
  const balance = Math.max(0, total - paid);

  const when = new Date(sale.sold_at).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  /*
    A short reference, not a sequential number. Sequential numbering is one of
    the things that makes a document a tax invoice, and it would also imply a
    guarantee of order this app does not make. The first eight characters of
    the sale's id are enough to tell two receipts apart when a customer brings
    one back.
  */
  const reference = sale.id.slice(0, 8).toUpperCase();

  const GREEN = "#158060";
  const LIGHT = "#5ddba4";

  const Row = ({
    label,
    value,
    strong = false,
    color = "#1a1a1a",
  }: {
    label: string;
    value: string;
    strong?: boolean;
    color?: string;
  }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        width: "100%",
        fontSize: strong ? 34 : 27,
        fontWeight: strong ? 700 : 400,
        color,
        marginBottom: 16,
      }}
    >
      <span style={{ color: strong ? color : "#6b6b6b" }}>{label}</span>
      <span>{value}</span>
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          padding: "56px 56px 40px",
          color: "#1a1a1a",
        }}
      >
        {/* Shop identity */}
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 26 }}>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700 }}>
            {shop?.name ?? "Shop"}
          </div>
          {shop?.phone ? (
            <div style={{ display: "flex", fontSize: 26, color: "#6b6b6b", marginTop: 6 }}>
              {shop.phone}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderBottom: `3px solid ${GREEN}`,
            paddingBottom: 18,
            marginBottom: 30,
          }}
        >
          <span style={{ fontSize: 30, letterSpacing: 3, color: GREEN, fontWeight: 700 }}>
            RECEIPT
          </span>
          <span style={{ fontSize: 24, color: "#6b6b6b" }}>{`No. ${reference}`}</span>
        </div>

        <div style={{ display: "flex", fontSize: 24, color: "#6b6b6b", marginBottom: 28 }}>
          {when}
        </div>

        {/* What was sold */}
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 22 }}>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700 }}>
            {`${item}${size ? ` · ${size}` : ""}`}
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#6b6b6b", marginTop: 8 }}>
            {`Quantity: ${sale.quantity}`}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", borderTop: "2px solid #e2e2e2", paddingTop: 26 }}>
          <Row label="Total" value={money(total)} />
          <Row label="Paid" value={money(paid)} />
          {balance > 0 ? (
            <Row label="Balance owing" value={money(balance)} strong color="#b3261e" />
          ) : (
            <Row label="Status" value="Paid in full" strong color={GREEN} />
          )}
        </div>

        {balance > 0 && sale.debtor_name ? (
          <div style={{ display: "flex", fontSize: 25, color: "#6b6b6b", marginTop: 4 }}>
            {`Owed by ${sale.debtor_name}`}
          </div>
        ) : null}

        <div style={{ display: "flex", flex: 1 }} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "2px solid #e2e2e2",
            paddingTop: 22,
            fontSize: 23,
            color: "#8a8a8a",
          }}
        >
          <span>
            {`Served by ${seller?.name ?? "Staff"}${sale.edited_at ? " · amended" : ""}`}
          </span>
          <span style={{ color: LIGHT, fontWeight: 700, letterSpacing: 2 }}>
            JOHTA
          </span>
        </div>
      </div>
    ),
    { width: 820, height: 900 }
  );
}
