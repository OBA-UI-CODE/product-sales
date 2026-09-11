import { SITE_URL, SUPPORT_EMAIL } from "@/lib/site";

/*
  The account emails a shop owner gets about their plan, and sending them.

  Sent by the daily job in /api/cron/notices; which shop has had which email
  is recorded in public.shop_notices so each goes once. Wording agreed with
  the owner on 11 September 2026. No em dashes, by house style.

  From hello@johta.click (the domain verified in Resend); replies go to the
  support inbox.
*/

export type NoticeKind = "plans_announcement" | "trial_ending_3d";

export interface NoticeShop {
  shopName: string;
  firstName: string;
  trialEndsAt: string;
}

const FROM = process.env.NOTICES_FROM ?? "JOHTA <hello@johta.click>";

/* "8 October", in Lagos time, since that is the day on the owner's wall. */
export function formatDay(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

const FREE_LINE =
  "unlimited sales, stock tracking, sizes and packs, low-stock warnings, debts, 1 staff account, and your last 30 days of history.";
const PAID_LINE =
  "WhatsApp receipts for your customers, unlimited staff, your full sales history, and downloading your records.";
const BILLING_URL = `${SITE_URL}/settings#billing`;

function build(kind: NoticeKind, shop: NoticeShop) {
  const day = formatDay(shop.trialEndsAt);
  const hi = shop.firstName ? `Hi ${shop.firstName},` : "Hello,";

  if (kind === "plans_announcement") {
    return {
      subject: `Your JOHTA free month ends on ${day}`,
      paragraphs: [
        hi,
        `Thank you for using JOHTA for ${shop.shopName}.`,
        `Your free month ends on **${day}**. Nothing stops and nothing is deleted. On that day ${shop.shopName} moves to our Free plan, and you keep logging sales, products, stock and debts for as long as you like.`,
        `**Free, always:** ${FREE_LINE}`,
        `**Paid plan (₦1,599 a month or ₦15,990 a year):** ${PAID_LINE}`,
        `To keep everything, open JOHTA and go to Settings, then Billing: ${BILLING_URL}`,
        "Any questions, just reply to this email.",
      ],
    };
  }

  return {
    subject: `3 days left of your JOHTA free month`,
    paragraphs: [
      hi,
      `Your free month of JOHTA for ${shop.shopName} ends on **${day}**.`,
      `After that you move to the Free plan and keep working: ${FREE_LINE}`,
      `To keep ${PAID_LINE.replace(/\.$/, "")}, subscribe for ₦1,599 a month or ₦15,990 a year in Settings, then Billing: ${BILLING_URL}`,
      "Nothing is ever deleted, whichever you choose. Any questions, just reply to this email.",
    ],
  };
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* Plain text for any mail app, and a light HTML version for the rest: the
   same words, **bold** kept, the link clickable, the sign-off in brand
   green. No images, so nothing is blocked and it reads as a personal note. */
function render(paragraphs: string[]) {
  const text =
    paragraphs.map((p) => p.replace(/\*\*/g, "")).join("\n\n") +
    "\n\nJOHTA. Every sale, accounted for.";

  const html =
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a;max-width:560px">` +
    paragraphs
      .map((p) => {
        let h = escapeHtml(p).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        h = h.replace(
          /(https:\/\/[^\s<]+)/g,
          '<a href="$1" style="color:#158060;font-weight:bold">$1</a>'
        );
        return `<p style="margin:0 0 14px">${h}</p>`;
      })
      .join("") +
    `<p style="margin:22px 0 0;color:#158060;font-weight:bold">JOHTA. Every sale, accounted for.</p></div>`;

  return { text, html };
}

export async function sendNotice(
  kind: NoticeKind,
  shop: NoticeShop,
  to: string
): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "RESEND_API_KEY is not set" };

  const { subject, paragraphs } = build(kind, shop);
  const { text, html } = render(paragraphs);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      reply_to: [SUPPORT_EMAIL],
      subject,
      text,
      html,
    }),
    cache: "no-store",
  });
  if (!res.ok) return { ok: false, error: `Resend ${res.status}: ${(await res.text()).slice(0, 200)}` };
  return { ok: true };
}
