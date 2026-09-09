/*
  A shop owner could grant themselves a free subscription.

  The "owner can update their shop" policy was written to let an owner rename
  their shop and change its colour. But an RLS policy cannot restrict WHICH
  COLUMNS are written — that needs column-level grants, and `authenticated`
  held UPDATE on every column of shops. So this worked, from any authenticated
  session, with one request:

      PATCH /rest/v1/shops?id=eq.<own shop>
      {"subscription_status": "active"}

  Verified against the live database: a shop whose trial expired yesterday had
  shop_can_write() = false, sent that request, got HTTP 200, and
  shop_can_write() returned true. Setting trial_ends_at to 2099 worked just as
  well, as did clearing purge_after to cancel a pending deletion.

  Every paywall check in the app reads these columns, so all of them were
  decorative. The comment in billing-actions.ts asserting that "shops has no
  INSERT/UPDATE policy for billing columns" described an intention that the
  grants never enforced.

  The fix is column-level: an owner may change how their shop LOOKS, and
  nothing about what it has PAID. Billing columns are written only by the
  Paystack webhook and the billing actions, both of which use the service role
  and are unaffected by these grants.
*/

revoke update on public.shops from authenticated;
revoke update on public.shops from anon;

grant update (
  name,
  category,
  categories,
  theme_color,
  logo_url
) on public.shops to authenticated;

/*
  Deliberately NOT granted, and each one is a way to steal the product or
  break the record:

    subscription_status, trial_ends_at, current_period_end, billing_plan
      -> free access forever
    paystack_customer_code, paystack_subscription_code, paystack_email_token
      -> point billing at somebody else's subscription
    deactivated_at, deletion_requested_at, purge_after
      -> escape or trigger a deletion outside the flow that cancels billing
    owner_id
      -> hand the shop to another account
    id, created_at
      -> rewrite identity and history
*/
