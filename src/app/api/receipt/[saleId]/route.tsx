import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getCurrentShopContext } from "@/lib/shop-context";

/*
  A receipt for one sale, as a PNG.

  LAYOUT: Figma "receipt design" section, frame "Receipt" (444:6548). The frame
  is 595 x 842 (A4 in points). It is drawn here in those same units and scaled
  up by SCALE, so every number below can be checked straight against the file
  while the image stays sharp when a customer zooms in on WhatsApp.

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

  FONTS live in /assets/receipt-fonts (all SIL Open Font License). The image
  renderer cannot read variable fonts or WOFF2, so DM Sans and Inter were cut
  from the site's variable files at the exact settings Figma renders them
  with (DM Sans at optical size 14), rather than using the static cuts, which
  are slightly wider. next.config.ts makes sure Vercel ships the folder.
*/

export const dynamic = "force-dynamic";

const SCALE = 2;
const W = 595;
const H = 842;

/* Figma colour tokens used by the frame. */
const C = {
  band: "#062e24", // color/green/900
  wordmark: "#5dcaa5", // color/primary/text (on dark)
  primary: "#0a0a0a", // color/text/primary
  secondary: "#3d3d3d", // color/text/secondary
  muted: "#9a9a9a", // color/text/muted
  receipt: "#0b5544", // color/primary/text
  green: "#158060", // color/green/500, also the divider stroke
  owing: "#b3261e", // not in the frame: the app's danger red, for debts
};

const FONT_DIR = join(process.cwd(), "assets", "receipt-fonts");

let fontsPromise: Promise<
  { name: string; data: Buffer; weight: 400 | 500 | 600; style: "normal" }[]
> | null = null;

/* Read once per server instance, not once per receipt. */
function loadFonts() {
  fontsPromise ??= Promise.all(
    (
      [
        ["Dokdo", "dokdo-latin-400-normal.woff", 400],
        ["DM Sans", "dm-sans-opsz14-400.woff", 400],
        ["DM Sans", "dm-sans-opsz14-500.woff", 500],
        ["DM Sans", "dm-sans-opsz14-600.woff", 600],
        ["Inter", "inter-500.woff", 500],
      ] as const
    ).map(async ([name, file, weight]) => ({
      name,
      data: await readFile(join(FONT_DIR, file)),
      weight,
      style: "normal" as const,
    }))
  );
  return fontsPromise;
}

const money = (n: number) =>
  "NGN " + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* "10 Sep 2026 - 10:47", in Lagos time. The server runs in UTC, so without
   the time zone every receipt would be an hour early. Month names are spelled
   out here because Node's own short month for September is "Sept". */
function formatWhen(iso: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Lagos",
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value])
  );
  const month = MONTHS[Number(parts.month) - 1];
  return `${parts.day} ${month} ${parts.year} - ${parts.hour}:${parts.minute}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ saleId: string }> }
) {
  const { saleId } = await params;
  const { supabase, profile } = await getCurrentShopContext();

  /* Receipts are a paid feature. Asked of the database, which is the
     authority on the plan, so a Free shop cannot get one by calling this
     url directly. 402 tells the button to explain rather than fail. */
  const { data: shopIsPaid } = await supabase.rpc("current_shop_is_paid");
  if (shopIsPaid !== true) {
    return new Response("Receipts are on the paid plan.", { status: 402 });
  }

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

  const [{ data: shop }, { data: seller }, fonts] = await Promise.all([
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
    loadFonts(),
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
  const owing = balance > 0;

  /*
    A short reference, not a sequential number. Sequential numbering is one of
    the things that makes a document a tax invoice, and it would also imply a
    guarantee of order this app does not make. The first eight characters of
    the sale's id are enough to tell two receipts apart when a customer brings
    one back.
  */
  const reference = sale.id.slice(0, 8).toUpperCase();

  /* Design units in, image pixels out. */
  const u = (n: number) => n * SCALE;

  const Divider = () => (
    <div
      style={{ display: "flex", width: "100%", height: u(1), background: C.green }}
    />
  );

  /* Total / Paid (and Balance, Customer on a debt). The frame lays these out
     as a label column and a value column; one row per pair looks the same and
     keeps each label beside its value when an amount is long. */
  const Line = ({
    label,
    value,
    color = C.secondary,
  }: {
    label: string;
    value: string;
    color?: string;
  }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        fontFamily: "DM Sans",
        fontWeight: 500,
        fontSize: u(24),
        lineHeight: `${u(29)}px`,
        letterSpacing: u(-1),
      }}
    >
      <span style={{ color: C.muted }}>{label}</span>
      <span
        style={{
          color,
          maxWidth: u(380),
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </span>
    </div>
  );

  const lines = [
    <Line key="total" label="Total" value={money(total)} />,
    <Line key="paid" label="Paid" value={money(paid)} />,
  ];
  if (owing) {
    lines.push(
      <Line key="bal" label="Balance" value={money(balance)} color={C.owing} />
    );
    if (sale.debtor_name) {
      lines.push(<Line key="who" label="Customer" value={sale.debtor_name} />);
    }
  }

  const statusColor = owing ? C.owing : C.green;

  /*
    The frame is drawn for a paid sale: Total and Paid. A debt adds Balance
    and usually Customer, 53 each (a 29 line plus the 24 gap). Rather than
    squeeze those into the same A4 and push the footer off the bottom, the
    image grows by exactly that much, so the space under Status stays the same
    as on the design.
  */
  /*
    The shop's phone, when the owner has set one in Settings, sits under the
    shop name so a customer holding the receipt can call back. Not drawn in
    the Figma frame, which has no phone; it takes a 24px line plus the 12px
    gap (36), and the image grows by that, as for the debt rows.
  */
  const phone = shop?.phone?.trim() || null;

  const extra = (lines.length - 2) * 53 + (phone ? 36 : 0);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
        }}
      >
        {/* Header band, 595 x 140, wordmark 35 from the top. */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            width: "100%",
            height: u(140),
            paddingTop: u(35),
            background: C.band,
            fontFamily: "Dokdo",
            fontSize: u(56),
            letterSpacing: u(-1.5),
            color: C.wordmark,
          }}
        >
          JOhTA
        </div>

        {/* Body, 541 wide, 27 in from the left, 167 from the top, 648 tall,
            with the footer pinned to its bottom. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "absolute",
            left: u(27),
            top: u(167),
            width: u(541),
            height: u(648 + extra),
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: u(24) }}>
            {/* Shop, RECEIPT, reference */}
            <div style={{ display: "flex", flexDirection: "column", gap: u(12) }}>
              <div
                style={{
                  display: "block",
                  lineClamp: 2,
                  fontFamily: "DM Sans",
                  fontWeight: 600,
                  fontSize: u(32),
                  lineHeight: `${u(39)}px`,
                  letterSpacing: u(-1),
                  color: C.primary,
                }}
              >
                {shop?.name ?? "Shop"}
              </div>
              {phone ? (
                <div
                  style={{
                    display: "flex",
                    fontFamily: "DM Sans",
                    fontWeight: 400,
                    fontSize: u(20),
                    lineHeight: `${u(24)}px`,
                    letterSpacing: u(-0.5),
                    color: C.secondary,
                  }}
                >
                  {`Tel: ${phone}`}
                </div>
              ) : null}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    fontFamily: "DM Sans",
                    fontWeight: 500,
                    fontSize: u(24),
                    lineHeight: `${u(39)}px`,
                    letterSpacing: u(4),
                    color: C.receipt,
                  }}
                >
                  RECEIPT
                </span>
                <span
                  style={{
                    fontFamily: "DM Sans",
                    fontWeight: 400,
                    fontSize: u(20),
                    lineHeight: `${u(24)}px`,
                    letterSpacing: u(-1),
                    color: C.secondary,
                  }}
                >
                  {`No. ${reference}`}
                </span>
              </div>
            </div>

            <Divider />

            {/* 16 below the divider, where the other gaps are 24. */}
            <div
              style={{
                display: "flex",
                marginTop: u(-8),
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: u(18),
                lineHeight: `${u(28)}px`,
                color: C.secondary,
              }}
            >
              {formatWhen(sale.sold_at)}
            </div>

            {/* What was sold */}
            <div style={{ display: "flex", flexDirection: "column", gap: u(21) }}>
              {/*
                The frame sets this at 36px on a 29px line. That only works on
                one line; a long product name would wrap onto itself. So it is
                given a real 40px line, and the extra 11px is taken back with
                negative margins: one line lands exactly where the design has
                it, and two lines no longer collide. Capped at two lines so a
                very long name cannot push the footer off the image.
              */}
              <div
                style={{
                  display: "block",
                  lineClamp: 2,
                  margin: `${u(-5.5)}px 0`,
                  fontFamily: "DM Sans",
                  fontWeight: 500,
                  fontSize: u(36),
                  lineHeight: `${u(40)}px`,
                  letterSpacing: u(-1),
                  color: C.green,
                }}
              >
                {item}
              </div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "DM Sans",
                  fontWeight: 600,
                  fontSize: u(20),
                  lineHeight: `${u(24)}px`,
                  letterSpacing: u(-1),
                  color: C.muted,
                }}
              >
                {size ? `Size: ${size} · Quantity: ${sale.quantity}` : `Quantity: ${sale.quantity}`}
              </div>
            </div>

            <Divider />

            <div style={{ display: "flex", flexDirection: "column", gap: u(24) }}>
              {lines}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                fontFamily: "DM Sans",
                fontWeight: 500,
                letterSpacing: u(-1),
                color: statusColor,
              }}
            >
              {/* Line height set on each span, not the row: the renderer
                  rescales an inherited pixel line height by font size, which
                  pushed this row about 50px down. */}
              <span style={{ fontSize: u(36), lineHeight: `${u(29)}px` }}>Status</span>
              <span style={{ fontSize: u(32), lineHeight: `${u(29)}px` }}>
                {owing ? "Not fully paid" : "Paid in full"}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: u(24),
            }}
          >
            <Divider />
            <div
              style={{
                display: "flex",
                fontFamily: "DM Sans",
                fontWeight: 600,
                fontSize: u(24),
                lineHeight: `${u(29)}px`,
                letterSpacing: u(-1),
                color: C.secondary,
              }}
            >
              {`served by ${seller?.name ?? "staff"}${sale.edited_at ? " (amended)" : ""}`}
            </div>
          </div>
        </div>
      </div>
    ),
    { width: W * SCALE, height: (H + extra) * SCALE, fonts }
  );
}
