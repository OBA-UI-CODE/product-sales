import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  fetchSubscription,
  planCode,
  PLANS,
} from "@/lib/paystack";

/*
  Paystack webhook — the only thing that may mark a shop as paid.

  The browser is never trusted for this. A user returning from checkout only
  gets the screen refreshed; whether money actually changed hands is decided
  here, from a request Paystack signs with the secret key.

  EVERY request is verified before it is read: the x-paystack-signature header
  is an HMAC SHA512 of the raw body. Without that check anyone who found this
  URL could mark their own shop paid by posting JSON at it.
*/

export const runtime = "nodejs";
// Signature verification needs the exact bytes Paystack sent, so this route
// must not be statically optimised or have its body re-parsed upstream.
export const dynamic = "force-dynamic";

interface PaystackEvent {
  event: string;
  data: {
    status?: string;
    subscription_code?: string;
    email_token?: string;
    next_payment_date?: string | null;
    plan?: { name?: string; interval?: string; plan_code?: string };
    customer?: { customer_code?: string; email?: string };
    metadata?: { shop_id?: string; billing_plan?: string };
    subscription?: { subscription_code?: string; next_payment_date?: string };
  };
}

type AdminClient = NonNullable<ReturnType<typeof admin>>;

async function verifiedSubscription(event: PaystackEvent) {
  const code =
    event.data.subscription_code ?? event.data.subscription?.subscription_code;
  if (!code) return { ok: false as const, retry: false };

  const result = await fetchSubscription(code);
  if (!result.ok || !result.data) {
    return { ok: false as const, retry: true };
  }

  const subscription = result.data;
  const plan = (["monthly", "yearly"] as const).find(
    (candidate) => planCode(candidate) === subscription.plan?.plan_code
  );
  if (!plan) return { ok: false as const, retry: false };

  const expectedAmount = PLANS[plan].amount * 100;
  const amount = subscription.amount ?? subscription.plan?.amount;
  const currency = subscription.plan?.currency?.toUpperCase();
  if (
    amount !== expectedAmount ||
    currency !== "NGN" ||
    !["active", "non-renewing"].includes(subscription.status)
  ) {
    return { ok: false as const, retry: false };
  }

  return {
    ok: true as const,
    plan,
    subscription,
  };
}

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/*
  Finds the shop an event belongs to. Paystack does not put metadata on every
  event type, so there are three routes in, tried in order of reliability.
*/
async function findShopId(
  db: AdminClient,
  event: PaystackEvent
): Promise<string | null> {
  const metaShop = event.data.metadata?.shop_id;
  if (metaShop) return metaShop;

  const subCode =
    event.data.subscription_code ?? event.data.subscription?.subscription_code;
  if (subCode) {
    const { data } = await db
      .from("shops")
      .select("id")
      .eq("paystack_subscription_code", subCode)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  const customerCode = event.data.customer?.customer_code;
  if (customerCode) {
    const { data } = await db
      .from("shops")
      .select("id")
      .eq("paystack_customer_code", customerCode)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  return null;
}

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";

  const expected = crypto
    .createHmac("sha512", secret)
    .update(raw)
    .digest("hex");

  // timingSafeEqual throws on length mismatch, so compare lengths first.
  const valid =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  if (!valid) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: PaystackEvent;
  try {
    event = JSON.parse(raw) as PaystackEvent;
  } catch {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }

  const db = admin();
  if (!db) {
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const shopId = await findShopId(db, event);
  if (!shopId) {
    // Nothing to do, but acknowledge — a non-200 makes Paystack retry forever.
    return NextResponse.json({ received: true, matched: false });
  }

  const patch: Record<string, unknown> = {};

  switch (event.event) {
    /*
      A successful charge — first payment or a renewal. This is the event that
      grants access.
    */
    case "charge.success":
    case "subscription.create": {
      const verified = await verifiedSubscription(event);
      if (!verified.ok) {
        if (verified.retry) {
          return NextResponse.json(
            { error: "subscription verification unavailable" },
            { status: 503 }
          );
        }
        return NextResponse.json({
          received: true,
          ignored: "unverified subscription",
        });
      }

      patch.subscription_status = "active";
      patch.billing_plan = verified.plan;
      patch.paystack_subscription_code =
        verified.subscription.subscription_code;
      patch.paystack_email_token = verified.subscription.email_token;
      patch.paystack_customer_code =
        verified.subscription.customer.customer_code;
      if (verified.subscription.next_payment_date) {
        patch.current_period_end =
          verified.subscription.next_payment_date;
      }
      break;
    }

    /* A renewal was attempted and failed — card expired, no funds. */
    case "invoice.payment_failed":
      patch.subscription_status = "past_due";
      break;

    /*
      Cancelled, by us or by them in the Paystack dashboard. Access continues
      until current_period_end, which shop_is_paid() honours;
      after that the shop is on Free.
    */
    case "subscription.disable":
    case "subscription.not_renew":
      patch.subscription_status = "canceled";
      break;

    /* An upcoming renewal notice — carries the new period end. */
    case "invoice.create":
    case "invoice.update": {
      const nextPayment =
        event.data.next_payment_date ??
        event.data.subscription?.next_payment_date;
      if (nextPayment) patch.current_period_end = nextPayment;
      break;
    }

    default:
      return NextResponse.json({ received: true, ignored: event.event });
  }

  if (Object.keys(patch).length > 0) {
    await db.from("shops").update(patch).eq("id", shopId);
  }

  return NextResponse.json({ received: true });
}
