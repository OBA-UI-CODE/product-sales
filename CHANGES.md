# JOHTA — what changed on this branch

This branch is a near-total rebuild of the app that was on `main`. It is large
enough that a file-by-file diff is not the useful way to read it, so this
document explains what changed, why, and what still needs doing.

`main` was the first working version. This branch replaces the entire visual
layer with the Figma design, renames the product from **Reko** to **JOHTA**,
and adds billing, product variants and a paywall.

**Nothing here has been deployed.** It has only ever run locally.

---

## 1. The interface was rebuilt from Figma

Every public page and the signed-in dashboard were rebuilt to match the Figma
file (`DAmYfcjHZjuv2cDTBXSMIY`) at three breakpoints — **mobile 393**,
**tablet 834**, **web 1440** — matching the frame widths exactly.

Rebuilt from the design file:

- Marketing: home, about, pricing, how it works, contact, terms, privacy
- Auth: sign in, sign up
- Onboarding: all five steps
- Dashboard: sidebar, greeting header, stat cards, today's sales

Each screen was measured against the file's own coordinates rather than eyeballed —
panel positions, gaps, type sizes and row heights land on the numbers in Figma.

**Still on the old design:** Sales History, Products, Debts, Settings, and the
Add Sale modal. The Figma file has no designs for these. They work and are
responsive, but they use the previous visual style. `globals.css` keeps a
temporary block of legacy colour aliases purely so these screens still render;
that block should be deleted when they are rebuilt.

### Design tokens

`globals.css` now holds the design system from Figma variables: colours,
radii, breakpoints (`tab:` 834, `web:` 1440) and three fonts —
**DM Sans** (headings), **Inter** (body), **Dokdo** (the JOHTA wordmark).

---

## 2. Renamed Reko → JOHTA

77 occurrences across 32 files. The name is defined once in
`src/components/Brand.tsx` and imported, rather than typed as a literal.

Two rules taken from the design file, which differ:

- **Logo lockups** (nav, footer, auth screens, onboarding, the marquee) use
  **Dokdo**, the display face.
- **Mentions inside a sentence** (Terms, Privacy, FAQ answers, hero subheading)
  are **plain text** in the surrounding font, only coloured.

The footer gained a logo mark and a new JOHTA watermark, both from the file.

**Note:** the Figma file is inconsistent about casing — the Nav frame (19:225)
reads `JOhTA` while everything else reads `JOHTA`. `JOHTA` was confirmed as
correct; the Nav frame should be corrected in Figma.

Contact addresses in Terms and Privacy are now **johtahelp@gmail.com**,
replacing the `@reko.app` placeholders.

---

## 3. Billing — Paystack

A complete subscription flow: `₦1,599/month` or `₦15,990/year`.

- `src/lib/paystack.ts` — API wrapper, server-only
- `src/app/(app)/settings/billing-actions.ts` — subscribe / cancel
- `src/app/api/paystack/webhook/route.ts` — the webhook
- `src/app/(app)/settings/BillingSection.tsx` — the UI

**Only the signed webhook can mark a shop as paid.** The browser returning from
checkout is never trusted. Every webhook request is verified as an HMAC-SHA512
signature against the secret key before its body is read — without that, anyone
who found the URL could mark their own shop paid by posting JSON at it.

Card details never reach this app; checkout is hosted by Paystack.

Cancelling does **not** cut access off immediately — a cancelled shop keeps
full use until the period it has already paid for runs out.

**Known limitation:** Paystack charges as soon as a subscription is created,
and its `start_date` option needs a card authorisation that only exists after a
first transaction. So a shop owner cannot hand over their card during the trial
and be billed later — they either pay now or wait. The billing screen says this
plainly rather than surprising anyone.

---

## 4. Free trial and the paywall

The trial is **one month** (was 14 days), and it is enforced **in the database**,
not just the interface.

`shop_can_write()` is called at the top of every write function. A shop can
write while its trial is running, while its subscription is active, or while a
cancelled subscription still has time left. Otherwise it is **read-only**: the
owner keeps full sight of their records and can still sign in, but cannot log
new sales until they subscribe.

This is in the database deliberately. An app-level check could be bypassed by
calling the REST API directly with a valid token.

---

## 5. Product variants (sizes and packs)

One product can now have several sizes, each with **its own price and its own
stock** — "Relaxer" with Small, Medium, Big, Big 6-pack, Small 12-pack.

When logging a sale, searching "relaxer" lists every size with its price, and
picking one fills the price in. Search matches the size label too, so "12 pack"
finds it directly.

Stock is counted **separately per size**: selling a 12-pack takes one off the
packs and leaves the singles alone.

Variants are **optional** — a product without them behaves exactly as before.
Existing products were not touched.

Removing a size **archives** it rather than deleting, because past sales point
at it and deleting would corrupt the record of what was sold.

---

## 6. Other changes

- **Theme colour works.** The accent picked during onboarding now drives the
  whole signed-in app. Only the green is defined in Figma, so the other
  colours are derived by reapplying the relationships the green already has —
  picking green reproduces the original design exactly.
- **Staff accounts now work.** `addStaffAccount` was a stub that returned
  "Not yet implemented". Removing a staff member also deletes their login —
  previously the profile was deleted but the account remained, letting them
  sign in and create their own shop.
- **Password show/hide** on all four password fields.
- **Sales are editable from the dashboard**, opening the same modal Sales
  History uses.
- **Breached-password checking** (`src/lib/password-check.ts`) via Have I Been
  Pwned — the free equivalent of Supabase's paid feature. The password is never
  sent anywhere: only the first five characters of its SHA-1 hash go to the API,
  and the comparison happens locally. Fails **open** if HIBP is unreachable, so
  an outage abroad cannot block signups.

---

## 6a. Closing an account — pause and delete

Settings gained a **Your account** section. It is last on the page, below
billing, because nobody comes to Settings looking to close their shop.

### Pause

Cancels the subscription, closes the shop and signs everybody out — but keeps
every record. The owner signs back in, presses **Reopen my shop**, and carries
on. Meant as the softer option for someone about to delete out of frustration,
or who simply wants the billing to stop.

### Delete — with an export and 30 days' grace

Owner only, and confirmed by typing the shop's own name (not a checkbox, and
not "type DELETE" — the name is the thing being destroyed).

Before the confirmation, the flow offers **Download my records**: a CSV of
every sale, debt and product. A shop's sales are its business records and may
be needed for tax years after they stop using JOHTA, so destroying them without
ever offering a copy would be careless.

Deleting then:

1. cancels the Paystack subscription, so no further money is taken
2. closes the shop and revokes every session
3. keeps the data for **30 days**, then destroys it permanently

Within those 30 days, signing in lands on a screen showing the exact date it
will be destroyed and a **Keep my shop** button that undoes everything. The
export still works throughout.

`purge_expired_shops()` does the destroying, run nightly at 03:15 UTC by
**pg_cron**. Keeping it in the database means the grace period does not depend
on the app being deployed or a request arriving.

### Staff deleting themselves

A staff member gets **Delete my account** instead, which removes their login
only. Sales they logged stay in the shop's records — `sales.seller_id` is
NO ACTION precisely so that removing a person cannot rewrite the history of
what was sold. The shop keeps a complete record; the person keeps nothing.

### Where it is enforced

`shop_can_write()` refuses writes for a paused or pending-deletion shop, so it
holds for anyone calling the REST API directly, not just for these screens.
**Reads stay allowed** on purpose — that is what lets the export and the
restore screen work.

Sessions are revoked through `revoke_shop_sessions()` rather than the client
library, because `auth.admin.signOut()` takes a JWT, not a user id: there is no
way to end somebody else's session from the server through supabase-js. Without
this, an already-open tab keeps a valid access token for up to an hour.

The privacy policy was updated to match — deletion is now self-serve, and the
30-day retention is stated plainly instead of "as long as necessary".

---

## 7. Database changes

All applied to the live Supabase project (`ktpqywmtgswjmvdyvvlg`) as migrations.

| Migration | What it does |
|---|---|
| `add_multi_tenant_indexes` | Indexes on every `shop_id` and `sales(shop_id, sold_at)`. There were none — every dashboard load scanned every shop's rows. |
| `optimise_rls_policy_evaluation` | Wraps helper calls in `(select ...)` so they run once per query, not once per row. |
| `add_paystack_billing_columns` | Subscription columns + `shop_can_write()`. |
| `enforce_read_only_after_trial` | The paywall guard inside every write function. |
| `allow_writes_until_paid_period_ends` | Cancelling does not revoke time already paid for. |
| `extend_free_trial_to_one_month` | Trial default 14 days → 1 month. |
| `add_product_variants` | `product_variants` table, RLS, `sales.variant_id`. |
| `variant_aware_sale_functions` | Sale functions move stock on the variant. |
| `tighten_function_grants_before_deploy` | Drops a duplicate `create_sale`. |
| `revoke_function_execute_from_public` | Signed-out users can no longer execute the RPCs. |
| `add_account_pause_and_scheduled_deletion` | `deactivated_at` / `deletion_requested_at` / `purge_after` on shops, the write guard extended, and `purge_expired_shops()`. |
| `schedule_nightly_shop_purge` | pg_cron job at 03:15 UTC that runs the purge. |
| `add_revoke_shop_sessions` | Ends every session in a shop when it is closed. |
| `fix_revoke_shop_sessions_refresh_token_match` | `auth.refresh_tokens.user_id` holds the uuid as text, not the email — the first version matched nothing. |

### Tenant isolation

Row-level security is on for all tables, and the `SECURITY DEFINER` write
functions re-check ownership themselves. A signed-in user who guessed another
shop's UUID is refused. This was verified directly against the database.

---

## 8. Environment variables

`.env.local` is gitignored and never committed. `.env.local.example` lists what
is required. On Vercel these must be set in **Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY      # server-only
PAYSTACK_SECRET_KEY            # server-only
PAYSTACK_PLAN_MONTHLY
PAYSTACK_PLAN_YEARLY
NEXT_PUBLIC_SITE_URL           # must be the deployed URL, not localhost
```

---

## 9. Before this can serve real users

**Blocking:**

1. **Email.** Supabase's built-in email is development-only and rate-limited to
   a handful per hour. At any real signup volume most people never receive a
   confirmation and cannot get in. Needs a domain plus Resend or Brevo.
2. **A domain.** Required for email; a `.vercel.app` subdomain cannot be
   verified for sending.
3. **Paystack live approval.** Still in test mode — no real payments possible.
   Live mode needs new `PLN_` plan codes; test plans do not carry over.
4. **The webhook** needs a public URL, so payment confirmation is untested
   end-to-end.

**Not blocking, but wanted:**

- Rebuild the five screens still on the old design
- Staff cannot change their temporary password
- No "update card" flow for a failed payment
- `past_due` becomes read-only immediately; a few days' grace would be kinder
- No error monitoring — failures are currently invisible
- Any staff member can edit or delete any sale, including ones they did not log

---

## 10. What was verified, and how

Checked against the live database and a real browser, not assumed:

- Tenant isolation, including the functions that bypass RLS
- The paywall: writes allowed during trial, blocked after expiry, reads still
  working, allowed again once subscribed
- Staff creation end-to-end, including the RLS path
- Webhook signature: forged and missing signatures rejected (401), valid
  accepted, shop marked active
- Paystack: key valid, both plans correct, real checkout URL returned
- Variants: selling a 12-pack leaves the singles untouched
- Layout measured against Figma coordinates at all three breakpoints
- No horizontal overflow on any screen at 393 / 834 / 1440

- Pause and deletion: the write guard checked in all four states (open, paused,
  queued for deletion, restored) against the live database — writes refused,
  reads still working, writing allowed again after restoring
- The purge run against a throwaway shop carrying a sale, a payment, a stock
  adjustment, a variant and two users — every one of the NO ACTION foreign
  keys — leaving zero rows behind, and leaving the shop untouched while still
  inside its grace period
- Session revocation removes the rows (2 sessions in, 0 out)
- `purge_expired_shops()` and `revoke_shop_sessions()` not callable by `anon`
  or `authenticated`
- Owner and staff both signed in for real: the owner sees pause and delete,
  staff see neither and get "Delete my account" instead

All test accounts and shops created during this work were deleted, and row
counts were checked back to their exact starting values.
