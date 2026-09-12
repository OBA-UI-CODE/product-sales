# JOHTA — what changed on this branch

This branch is a near-total rebuild of the app that was on `main`. It is large
enough that a file-by-file diff is not the useful way to read it, so this
document explains what changed, why, and what still needs doing.

`main` was the first working version. This branch replaces the entire visual
layer with the Figma design, renames the product from **Reko** to **JOHTA**,
and adds billing, product variants and a paywall.

**This is live at https://johta.click**, on its own domain with SSL, sending
email through Resend and holding live Paystack keys in production. Test keys
remain in preview and local development, so local work cannot charge a real
card.

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

Contact addresses in Terms and Privacy are now **johtaclick@gmail.com**,
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

## 4. Free and paid plans

There are two plans. An expired trial now lands on **Free**, not read-only.

| | Free | Paid (₦1,599/month or ₦15,990/year) |
|---|---|---|
| Sales, products, stock, dashboard, debts | yes | yes |
| Sizes and packs, low-stock warnings | yes | yes |
| Staff | 1 | unlimited |
| Sales history | last 30 days | all of it |
| Receipts | no | yes |
| Download records (CSV) | no | yes |
| Pause, delete | yes | yes |

Monthly and yearly are the same plan. The one-month trial counts as Paid.

**Enforced in the database** (`20260910152135_free_and_paid_plans.sql`), not
just the interface:

- `shop_is_paid(shop)` is the single definition of paid (active, trialing
  inside the trial, or cancelled with paid time left). `src/lib/plan.ts`
  mirrors it for display only.
- `shop_can_write()` no longer depends on paying. It refuses only paused or
  deleted shops, and staff without a seat.
- One staff on Free: a trigger on `profiles` refuses a second. When a paid
  shop drops to Free with several staff, the earliest-added (or whoever the
  owner picks with `set_free_staff_seat`) keeps access; the rest are sent to
  `/account/no-access` and their writes are refused. Nothing is deleted.
- 30 days on Free: the sales SELECT policy hides older sales, except ones
  still owed, so debts never disappear.
- The sales INSERT policy now also checks `shop_can_write()`; direct table
  inserts used to skip every check.
- Receipts (`/api/receipt`) and the CSV (`/api/account/export`) ask
  `current_shop_is_paid()` and return 402 on Free. The Receipt button opens
  an upgrade prompt instead.

Verified with a throwaway shop (35 checks: limits, seat swap, history window,
402s, helper functions not callable by users, paused shop), then deleted.

Terms, Privacy, FAQ and the pricing page were rewritten to match. Personal
data requests stay free on every plan (Nigeria Data Protection Act), by email.

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

## 6b. Staff removal was broken, and staff passwords

### The bug

Removing a staff member silently did nothing for anyone who had logged a sale.

`sales.seller_id` references profiles with `NO ACTION`, so the database refuses
to delete a profile whose name is on a sale. Deleting the auth user failed for
the same reason, because profiles cascades from it. Neither delete checked its
error, so the owner pressed remove, saw no complaint, and **the staff member
could still sign in**. It only ever worked for staff who had never sold
anything — which is why it looked fine.

Verified against the live database before fixing: profile delete failed, auth
user delete failed, the login remained usable.

### The fix

Staff are **archived**, not deleted — the same approach products and variants
already use, and for the same reason. Removing someone now:

- sets `profiles.removed_at`, so they leave the staff list but past sales still
  say who sold them
- bans the login, so they cannot sign in
- revokes their sessions, so an open tab stops working immediately
- moves their address to a `.invalid` one (reserved by RFC 2606, so it can
  never reach a real mailbox), which frees their real email to be added back

Only the Settings staff list filters `removed_at`. The dashboard, sales
history, debts and the CSV export deliberately do not — they are looking up a
seller's name and need people who have since left.

`current_shop_id()` now ignores removed profiles too, so RLS denies them even
if a token somehow outlived the ban.

### Staff passwords

Staff cannot change their own password, by design: the owner administers the
shop, including its logins. Each staff row now has a **Set new password**
button so the owner can rotate one directly — previously the only way was to
remove the person and add them back, which is what exposed the bug above. The
new password is checked against Have I Been Pwned, and setting it signs that
staff member out everywhere.

---

## 6c. The nav icons ignored the theme

On mobile, the active nav item showed a **green icon next to a themed label** —
a green house over the word "Home" in purple. The other four icons never
changed colour at all when their page was open.

The icons were `<img src="/figma/icon-nav-*.svg">`. An `<img>` paints the
colours baked into the file and cannot inherit anything from the page, so:

- `icon-nav-home-active.svg` had `stroke="#1D9E75"` hard-coded — brand green,
  regardless of the accent the owner picked
- every other icon was `stroke="white"`, and its "active" variant pointed at
  the *same file*, so there was no active state to show

They are now inline SVG components (`NavIcons.tsx`) using `currentColor`, so an
icon is simply the colour of the text around it. Icon and label take the same
class, which makes the two impossible to drift apart again. Path data is
verbatim from the exports, including the logout icon's 1.5 stroke weight.

The sidebar was not affected — its active row is a filled pill in the accent
colour, which already themed correctly — but it now uses the same inline icons,
so no hard-coded colour is left anywhere in either nav.

This is the third instance of one bug: an exported SVG carrying a baked-in
colour, after the dashboard's trend arrow.

---

## 6d. Onboarding — back button, multiple categories, one illustration

**The illustration was printed three times.** On mobile, step 2's banner
rendered the same image at three positions, because the earlier Figma frame
stacked three instances and I reproduced them literally. It read as the same
woman repeated across the band. The frame (197:2288) now holds a single
rectangle at x134 y110, 259x201, and the code matches it.

**"What are you into?" takes several answers.** A Nigerian shop that sells
provisions usually sells drinks and snacks too, so one choice never described
a real shop. The pills are toggles now, with "Pick as many as you sell."
said plainly under the question, since a row of pills does not otherwise look
multi-select.

`shops.categories text[]` was added alongside `category` rather than replacing
it — the singular column is read in several places and by existing rows, so it
is kept and set to the FIRST category picked. `complete_onboarding` takes
`p_categories text[]`, drops blanks and duplicates, and preserves the order
they were chosen in (the first attempt used `array_agg(distinct ...)`, which
sorts alphabetically and made `category` name a category picked second).

**Steps 2-4 have a back arrow.** Not in the design file, which draws the flow
as one-way — but someone who mistypes their shop name should not have to
abandon onboarding and start again. Every answer lives in the wizard's state,
so going back and forward again shows what was already entered. Step 1 has
nothing to return to and step 5 is past the point of no return, so neither
has one.

## 6e. Customer receipts follow the Figma receipt design

`/api/receipt/[saleId]` now draws Figma's "receipt design" section (frame
`444:6548`, 595 x 842): the dark green band with the JOhTA wordmark, shop
name, RECEIPT and a short reference, date in Lagos time, item and quantity,
Total and Paid, Status, and "served by" pinned to the bottom. Rendered at 2x
so it stays sharp on WhatsApp.

Additions the frame does not show, because it only draws a paid sale: a debt
adds a red Balance line and the Customer's name, turns Status red ("Not fully
paid"), and makes the image taller by those rows rather than squeezing them
in. Product and shop names wrap to two lines at most; a size, when there is
one, sits beside the quantity. The shop's phone number, when set in
Settings, goes under the shop name (added 11 September; not in the frame).

Fonts are bundled in `assets/receipt-fonts` (all Open Font License) and named
in `next.config.ts` so Vercel ships them. DM Sans and Inter were cut from the
variable fonts at the settings Figma uses, because the image renderer cannot
read variable fonts or WOFF2.

---

## 6f. Google sign-in

The button and code were there, but Google was never switched on in Supabase,
so tapping it opened a raw error page on supabase.co. Now:

- `src/lib/google-auth.ts` is shared by sign-in and sign-up. It checks
  Supabase's public auth settings first; while Google is off, people come
  back to the page with a plain message. Once Google is switched on in the
  dashboard it works with no deploy.
- `/auth/callback` only redirects to paths on this site. `?next=@evil.com`
  used to produce `https://johta.click@evil.com`, an open redirect.
- Staff cannot sign in with Google (they are signed out with a message), so
  an owner changing a staff password still locks the old route out. Removing
  a staff member (ban) remains the complete lock.

**Live since 10 September 2026.** Google Cloud project "JOHTA", OAuth client
"JOHTA" (web), consent screen published (in production, no logo so no
verification needed). Redirect URI is Supabase's
`https://ktpqywmtgswjmvdyvvlg.supabase.co/auth/v1/callback`; the client id
and secret live only in the Supabase dashboard. Tested by the owner: Google
linked to the existing email account rather than creating a second one.

Known limits: Google's screen names `ktpqywmtgswjmvdyvvlg.supabase.co` (a
Supabase custom domain fixes that, paid add-on), and Google refuses sign-in
inside WhatsApp/Instagram/Facebook in-app browsers (403 disallowed_useragent).
The support email on the consent screen is still the owner's personal Gmail;
switch it to johtaclick@gmail.com in Branding once that account is a project
owner.

---

## 6g. Error monitoring

Crashes are recorded instead of only being seen by the person they happen to.

- **Server:** `src/instrumentation.ts` (`onRequestError`) records every error
  thrown while rendering a page, running a server action or handling a route.
- **Browser:** `components/ErrorReporter.tsx` (in the root layout) sends
  uncaught errors and promise rejections to `/api/errors`, which only accepts
  posts from johta.click itself and caps the body. Extension errors,
  "Script error." and ResizeObserver noise are dropped.
- **Error pages:** `app/error.tsx`, `app/(app)/error.tsx` and
  `app/global-error.tsx` replace Next's bare default with "Something went
  wrong", Try again, a way home, and a reference number that matches the
  `digest` stored with the error.
- **Storage:** `public.error_events` (migration `20260910192400`), service
  role only; `public.error_summary` groups them by problem. No user or shop
  id is stored. Deleted after 90 days by the `purge-old-error-events` cron job.
- **Alerts:** an email to `ALERT_EMAIL` (default johtaclick@gmail.com) the
  first time a problem appears, and again if it is still happening six hours
  later, capped at 10 an hour. Needs `RESEND_API_KEY` in Vercel; without it
  errors are recorded but not emailed. Sender defaults to
  `alerts@johta.click` (`ALERT_FROM`), which must be on the domain verified in
  Resend.

Chosen over Sentry so that no new company receives users' data (the Privacy
Policy's list of suppliers is unchanged) and it costs nothing. Sentry is the
upgrade if this outgrows a table and an inbox.

---

## 6h. Telling shops about Free and Paid

Agreed with the owner on 11 September 2026; the Terms promise notice before a
change like this takes effect.

- **Announcement email**, once, from Monday 14 September, to every shop that
  existed before then and is still in its free month: "Your JOHTA free month
  ends on <date>", what stays Free, what Paid adds, and a link to Billing.
- **Reminder email** three days before each shop's trial ends (a shop that
  gets the reminder first never gets the announcement after it).
- **Dashboard notice** for owners during the free month (again in the last
  three days, highlighted) and for a week after it ends. Closable. Not shown
  to staff or paying shops. `components/dashboard/TrialNotice.tsx`.

Sent by `/api/cron/notices`, run daily at 07:00 UTC by Vercel Cron
(`vercel.json`), authorised with `CRON_SECRET` (Vercel, production, and
`.env.local`). `public.shop_notices` records each email so it goes once;
a failed send is released and retried the next day. From
`hello@johta.click`, replies to the support inbox. Wording in
`lib/notices.ts`. `?dry=1` (optionally `&asOf=`) lists who would get what;
`?test=1` sends both emails to the support inbox only.

---

## 6i. Weekly and monthly totals

Sales History has **Day / Week / Month** tabs (owner's idea, 11 September
2026; built in the existing style, no Figma design).

- **Day:** every sale on one day, as before.
- **Week** (Monday to Sunday) and **Month:** total, number of sales,
  collected, still owed, a bar per day (week) or per week (month) that opens
  that day or week, the best day, and the top three items. Arrows step back
  and forward; "This week", "Last week", "This month" are named.
- Added up in the database by `sales_summary(from, to)` (migration
  `20260911212020`), SECURITY INVOKER so the sales policy applies unchanged,
  because the API returns at most 1000 rows and a busy month would have been
  short. Tested with 1,201 sales in a month.
- **Lagos days** everywhere (`lib/lagos-date.ts`). The old page used the
  server's UTC midnight, so sales between midnight and 1am went on the
  previous day.
- **Free:** periods that start inside the window (this week, last week,
  this month) show; older ones say they are on the paid plan. The window is
  now 31 days in the database (still described as 30) so the whole month is
  visible on the 31st.

---

## 6j. Downloading records, properly

"Download your records" is on the pricing page as a paid feature, but the
only way to it was the delete-my-shop flow. Now:

- **Settings > Your records** (owners only): "Download my records" on Paid,
  "on the paid plan" with See plans on Free. `settings/RecordsSection.tsx`.
- **Owner only** at `/api/account/export` too (403 for staff): the file
  holds every sale and every debtor's name.
- **Complete:** sales are read in pages of 1000; it used to stop silently
  at the API's 1000-row cap. Tested with 1,501 sales.
- **Lagos times** in the file (were UTC).

---

## 6k. Sales reminders on the phone (Web Push)

Free for everyone, owners and staff (agreed 12 September 2026). Settings >
Reminders: "Turn on reminders", a switch for each, a test, and "Turn off on
this phone".

- **08:00 Lagos** good morning; **14:00** only if the shop has logged
  nothing yet today; **20:00** today's total, or a nudge if nothing logged.
- `public/sw.js`: shows the notification, opens JOHTA when tapped. No fetch
  handler and no caching, on purpose.
- `push_subscriptions` (one row per device, RLS: own rows only) and
  `notification_prefs` (no row = all on). `reminder_targets(slot)` decides
  who gets what and skips paused shops, removed staff and staff paused on
  Free. Migration `20260911221844`.
- Sent by `/api/cron/reminders?slot=`, called by **pg_cron + pg_net** in the
  database (Vercel's free plan only runs crons daily). The key the jobs send
  is generated inside the Supabase vault (`reminders_token`) and checked by
  `reminder_token_ok()`; it is never typed or shown anywhere.
- VAPID keys: `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (all environments) and
  `VAPID_PRIVATE_KEY` (production, and `.env.local`).
- iPhone: only works once JOHTA is installed to the home screen (Apple's
  rule); the section says so. Devices that are gone are deleted after a
  404/410.
- Privacy Policy: one sentence on what is kept for reminders.

---

## 6l. Insights

A new **Insights** page (sidebar and bottom bar, after History; the bottom
bar now has 6 items and fits at 320px) plus a **Top sellers this week**
card on the dashboard. Built 12 September 2026 in the existing style; the
owner will redesign it in Figma. Owners and staff both see it.

| Section | What it shows | Plan |
|---|---|---|
| Sales trend | 7 days (vs the 7 before, %), weeks, 12 months; bars open that period in Sales History | Free: 7 days, 4 weeks. Paid: 8 weeks, 12 months |
| Top sellers | last 30 days by money, with quantity | Free |
| Running out soon | sales rate over 14 days (or since added) against stock; items with 7 days or less, and sold-out best sellers | Paid |
| Not selling | stock with no sale in 30 days, value tied up, last sold; items younger than 30 days are left out | Paid |

- Database functions, all SECURITY INVOKER so RLS applies:
  `insights_top_items`, `insights_stock_lines`, `insights_running_out`,
  `insights_not_selling` (migrations `20260912001015`, `20260912002044`).
  A product with sizes is judged by its sizes, where the stock is.
- Typed-in sales have no product: top sellers groups them by name (case and
  spacing ignored); the stock-based two cannot see them. So the Add Sale
  form now offers **"Add Ankara to your products?"** to owners the second
  time the same name is typed within 60 days, and `/products?add=Name`
  opens the form prefilled. Insights also tells owners when 30% or more of
  the month's sales were typed in.
- Charts are plain elements (`insights/TrendChart.tsx`), no chart library.
- Tested with a year of history (20 checks, including the nudge through
  the real form and the Free locks).

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
| `archive_removed_staff_instead_of_deleting` | `profiles.removed_at`, `current_shop_id()` ignores removed staff, and `revoke_user_sessions()`. |
| `allow_multiple_shop_categories` | `shops.categories text[]`; `complete_onboarding` takes an array. |
| `preserve_category_pick_order` | Keeps the order categories were chosen in. |

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

### Done since this document was first written

1. **Email.** Sending moved from Supabase's development mailer to Resend on
   `johta.click`. Verified from a real delivered message: `From: JOHTA
   <hello@johta.click>`, SPF, DKIM and DMARC all pass, and it lands in the
   inbox rather than spam.
2. **A domain.** `johta.click`, live with SSL, used for both the site and email.
3. **The webhook** has a public URL and is live. It returns 401 to unsigned and
   forged requests — checked against the deployed endpoint.
4. **Email links.** Both templates point at `/auth/confirm`; following a real
   signup token lands on `/onboarding` and a recovery token on
   `/reset-password`.

### Still open

**The one that matters:**

- **No live payment has ever completed.** All four shops are `trialing` and
  none has a `paystack_subscription_code`. Two have a `billing_plan` set, which
  is written just before the redirect to Paystack — so checkout was reached
  twice and never finished. The live keys, live plan codes and the live-mode
  webhook registration are therefore unproven, and Paystack keeps test and live
  webhook configuration entirely separate: setting it up in test mode does not
  carry over. **The earliest trial ends 5 October 2026**, so this needs proving
  before then, ideally with a real card that is then refunded.

**Wanted, not blocking:**

- Rebuild the five screens still on the old design (Sales History, Products,
  Debts, Settings, Add Sale modal)
- No "update card" flow for a failed payment
- `past_due` becomes read-only immediately; a few days' grace would be kinder
- No error monitoring — failures are currently invisible
- Any staff member can edit or delete any sale, including ones they did not log

**Resolved:** staff removal (6b), staff passwords (6b), account deletion (6a),
nav theming (6c).

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
- Staff removal end to end for a staff member holding a sale: archived, banned,
  signed out, still named on the sale, gone from the staff list, and their
  email freed so the same person could be added back and sign in again
- Setting a staff password: the new one works, the old one is refused

All test accounts and shops created during this work were deleted, and row
counts were checked back to their exact starting values.
