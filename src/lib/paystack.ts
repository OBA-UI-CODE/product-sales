/*
  Thin wrapper over the Paystack REST API.

  SERVER ONLY. Everything here reads PAYSTACK_SECRET_KEY, which must never
  reach the browser — import this from server actions and route handlers only,
  never from a "use client" component. (The env var has no NEXT_PUBLIC_ prefix,
  so Next will not inline it into client bundles even by accident.)

  Amounts are in KOBO. Paystack takes the smallest currency unit, so ₦1,599 is
  159900. Getting this wrong charges someone 100x, so the conversion lives here
  and nowhere else.
*/

const API = "https://api.paystack.co";

export const NAIRA_TO_KOBO = 100;

export type BillingPlan = "monthly" | "yearly";

export interface PlanDetails {
  key: BillingPlan;
  label: string;
  /** Naira, for display. */
  amount: number;
  cadence: string;
  note?: string;
}

/*
  Prices come from the public pricing page: ₦1,599/month, ₦15,990/year
  ("2 months free"). The plan CODES come from the Paystack dashboard, where
  the plans themselves are created — Paystack is the source of truth for what
  is actually charged, so these figures are for display only.
*/
export const PLANS: Record<BillingPlan, PlanDetails> = {
  monthly: {
    key: "monthly",
    label: "Monthly",
    amount: 1599,
    cadence: "per month",
  },
  yearly: {
    key: "yearly",
    label: "Yearly",
    amount: 15990,
    cadence: "per year",
    note: "2 months free",
  },
};

export function planCode(plan: BillingPlan): string | null {
  const code =
    plan === "monthly"
      ? process.env.PAYSTACK_PLAN_MONTHLY
      : process.env.PAYSTACK_PLAN_YEARLY;
  return code && code.trim() ? code.trim() : null;
}

export function secretKey(): string | null {
  const key = process.env.PAYSTACK_SECRET_KEY;
  return key && key.trim() ? key.trim() : null;
}

export function isConfigured(): boolean {
  return Boolean(secretKey() && planCode("monthly") && planCode("yearly"));
}

/*
  Turns Paystack's own error text into something a shop owner can act on.

  Paystack writes for developers. Its messages were being passed straight to
  the billing screen, so someone whose address it disliked was told:

      "email" must be a valid email

  which names a JSON field, uses developer punctuation, and does not say what
  to do. Anything unrecognised falls back to a plain sentence rather than
  leaking internals — a customer cannot act on "Invalid key" and should not be
  shown it, so those cases say the shop should contact us while the real text
  goes to the server log.
*/
function humanise(raw: string): string {
  const m = raw.toLowerCase();

  if (m.includes("email")) {
    return "Our payment provider would not accept that email address. Try signing up with a different one, or contact us and we will sort it out.";
  }
  if (m.includes("plan") && (m.includes("not found") || m.includes("invalid"))) {
    return "That plan is not available right now. Please contact us — this is a problem on our side, not with your card.";
  }
  if (m.includes("key") || m.includes("authorization") || m.includes("unauthorized")) {
    return "Payments are not set up correctly. Please contact us — do not try again, and you have not been charged.";
  }
  if (m.includes("amount") || m.includes("currency")) {
    return "There was a problem with the amount for this plan. Please contact us — you have not been charged.";
  }
  if (m.includes("declin") || m.includes("insufficient")) {
    return "Your bank declined the payment. Try another card, or check with your bank.";
  }
  return "We could not start the payment. Please try again in a moment — you have not been charged.";
}

async function paystack<T>(
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; data?: T; message: string; raw?: string }> {
  const key = secretKey();
  if (!key) return { ok: false, message: "Paystack is not configured." };

  try {
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    const body = (await res.json()) as {
      status?: boolean;
      message?: string;
      data?: T;
    };

    if (!res.ok || body.status === false) {
      const raw = body.message ?? `Paystack returned ${res.status}.`;
      /* The raw text is kept for us, not shown to the shop owner. */
      console.error(`Paystack ${path} failed: ${res.status} ${raw}`);
      return { ok: false, message: humanise(raw), raw };
    }

    return { ok: true, data: body.data, message: body.message ?? "" };
  } catch {
    return {
      ok: false,
      message: "Could not reach Paystack. Check your connection and try again.",
    };
  }
}

/*
  Starts a subscription by opening a checkout for the plan. Passing `plan`
  makes Paystack create the subscription itself once the card is charged, so
  renewals are handled on their side and reported back by webhook.

  The shop id is put in metadata so the webhook can find the shop even for
  events that carry no customer email.
*/
export function initializeSubscription(params: {
  email: string;
  plan: BillingPlan;
  shopId: string;
  callbackUrl: string;
}) {
  const code = planCode(params.plan);
  if (!code) {
    return Promise.resolve({
      ok: false as const,
      message: `No Paystack plan code configured for the ${params.plan} plan.`,
    });
  }

  return paystack<{ authorization_url: string; reference: string }>(
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        email: params.email,
        plan: code,
        callback_url: params.callbackUrl,
        metadata: {
          shop_id: params.shopId,
          billing_plan: params.plan,
        },
      }),
    }
  );
}

/* Both the code and the email token are required to cancel. */
export function disableSubscription(code: string, emailToken: string) {
  return paystack("/subscription/disable", {
    method: "POST",
    body: JSON.stringify({ code, token: emailToken }),
  });
}

export function fetchSubscription(code: string) {
  return paystack<{
    status: string;
    next_payment_date: string | null;
    email_token: string;
    subscription_code: string;
    customer: { customer_code: string; email: string };
  }>(`/subscription/${code}`);
}
