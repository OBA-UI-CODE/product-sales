# Reko — Build Plan

**Status:** Living document — updated as decisions are made or scope changes.
**Owner:** Oba
**Target:** Working, launchable multi-tenant SaaS in 7 days from kickoff.
**Last updated:** 2026-09-04

---

## 0. Ground rules (do not violate these)

1. **Reko is a public multi-tenant product.** Every table that holds shop data MUST have a `shop_id` column and a Row-Level Security policy that scopes access to that shop. No exceptions, no "we'll add it later."
2. **Mom's app (`Sales-Accountability` / SaleBook) is a functional and UX reference only.** Its code is single-tenant and is NEVER copied wholesale. It tells us *what a feature should do and roughly how it should feel* — not what the schema or auth should look like.
3. **The Figma file "Product Sales Design" is the visual source of truth.** Colors, typography, spacing, card style, sidebar style, sale-row style — all pages must match it. Where a page isn't yet designed in Figma, it must visually match the already-designed Home dashboard (same design system), not invent a new style.
4. **No client-side gating for anything paid.** Trial/subscription access is enforced server-side via verified Paystack webhooks, never a flag checked only in the frontend.
5. **Every mistake gets flagged, not overlooked.** If something is a shortcut, a known simplification, or a risk, it is written down in the "Known risks / simplifications" section below — never silently shipped.
6. **Two-shop data isolation is a hard gate.** Nothing is marked "done" for a feature until it's been verified that Shop A cannot see, edit, or infer anything about Shop B's data through that feature.

---

## 1. Architecture overview

- **Frontend/Backend:** Next.js (App Router, TypeScript) — same stack as mom's app, so patterns carry over cleanly.
- **Database/Auth/Storage:** Supabase (separate project from mom's `salebook` project).
- **Billing:** Paystack (subscriptions, webhook-verified).
- **Hosting:** Netlify (per existing account) or Vercel — TBD, default to Netlify since it's already connected.
- **Styling:** Tailwind CSS v4, tokens matching the Figma variable collections (Primitives/Semantic/Scale) already built.
- **Fonts:** DM Sans (headings), Inter (body) — self-hosted, same as mom's app.

### Multi-tenancy model
- One Supabase project serves ALL shops (not one project per shop).
- Every shop-scoped table has a `shop_id uuid references shops(id)`.
- A `current_shop_id()` Postgres helper function resolves the logged-in user's active shop from their profile/membership.
- RLS policy pattern on every shop-scoped table:
  ```sql
  using (shop_id = current_shop_id())
  ```
- A user can belong to exactly one shop at a time in v1 (matches mom's app's model of one owner + staff per shop — no cross-shop staff in v1).

---

## 2. Data model (draft — refine during Day 1 build)

| Table | Key columns | Notes |
|---|---|---|
| `shops` | id, name, category, theme_color, logo_url, owner_id, trial_ends_at, subscription_status, created_at | New table — root of multi-tenancy |
| `profiles` | id, shop_id, name, role (owner/staff), created_at | Adapted from mom's app; adds shop_id |
| `products` | id, shop_id, name, category, default_price, stock_quantity, low_stock_threshold, archived_at | Adapted from mom's app; adds shop_id |
| `sales` | id, shop_id, product_id (nullable), custom_item_name, quantity, total_price, amount_paid, seller_id, debtor_name, sold_at, edited_at | Adapted from mom's app; adds shop_id |
| `stock_adjustments` | id, shop_id, product_id, quantity_change, reason, created_at | Adapted from mom's app; adds shop_id |
| `payments` | id, shop_id, sale_id, amount, paid_at | For debt/partial-payment tracking (mom's app's "payments" feature) |
| `subscriptions` | id, shop_id, paystack_customer_code, paystack_subscription_code, status, current_period_end | New — billing state, written only by verified webhook handler |

Stock-affecting operations (`create_sale`, `update_sale`, `delete_sale`, `restock_product`, `record_payment`) remain `SECURITY DEFINER` Postgres functions like mom's app — this was a real bug we fixed there, so we build it correctly from the start here rather than repeating the mistake.

---

## 3. Day-by-day plan

### Day 1 — Foundation
- [ ] Create new Supabase project for Reko (separate from `salebook`)
- [ ] Migration 0001: `shops`, `profiles` (with shop_id), `current_shop_id()` helper
- [ ] Migration 0002: `products`, `sales`, `stock_adjustments`, `payments` — all with `shop_id`, RLS from the start
- [ ] Migration 0003: stock-affecting Postgres functions (`SECURITY DEFINER` from day one, correct grants — not the two-step mistake from mom's app)
- [ ] Auth: email/password, Google OAuth provider, email confirmation required, forgot-password flow
- [ ] Next.js app scaffold pushed to `product-sales` repo
- [ ] **Gate before moving on:** two dummy shops created manually in the DB, confirm RLS blocks cross-shop reads via direct query

### Day 2 — Onboarding
- [ ] Sign up page (matches Figma) → email verification required before continuing
- [ ] Onboarding wizard: shop details → category → theme (accent colour + optional logo) → optional first product → creates `shops` row + `profiles` row (role=owner) + sets `trial_ends_at` = now + 14 days
- [ ] Redirect to Dashboard on completion

### Day 3 — Home Dashboard + Sales History
- [ ] Home dashboard: greeting, hero stat, metric cards (with sparkline charts matching Figma), "+ Add Sale" flow, today's sale list
- [ ] Add Sale modal (item, price, payment status, debtor name if partial) — mirrors mom's app logic, shop-scoped
- [ ] Sales History page: date picker, day total summary, sale list for selected day

### Day 4 — Products, Debts, Settings
- [ ] Products page: list, add/edit modal, restock modal, remove/archive — mirrors mom's app, shop-scoped
- [ ] Debts page: outstanding debt list, record payment / mark fully paid — mirrors mom's app's payments feature
- [ ] Settings page: Staff Accounts (add/remove staff, owner-protected), shop profile settings (name, theme, logo)

### Day 5 — Billing
- [ ] Paystack integration: checkout for subscription (monthly ₦3,599 / yearly TBD discount)
- [ ] Webhook handler: verifies Paystack signature, updates `subscriptions` table — this is the ONLY place subscription status is written
- [ ] Access gate: middleware checks `subscription_status`/`trial_ends_at` server-side on every protected route
- [ ] Trial countdown UI + "subscribe now" prompt when trial is ending/ended

### Day 6 — Two-shop isolation test (hard gate)
- [ ] Create two real test shops end-to-end (signup → onboarding → data entry)
- [ ] Verify Shop A cannot see Shop B's: sales, products, staff, debts, settings, dashboard numbers — via UI AND via direct API/query probing
- [ ] Fix anything that leaks, re-test until clean
- [ ] Run Supabase security advisor, resolve all flagged issues

### Day 7 — Landing page wiring + polish
- [ ] Connect existing marketing site (already designed/built) to real Sign Up / Sign In
- [ ] Final QA pass across all pages, both light of the design system and functionality
- [ ] Deploy

---

## 4. Known risks / simplifications

*(This section is filled in honestly as we go — nothing gets left out because it's inconvenient.)*

- Supabase's default shared email sender has low volume limits — fine for initial testing, but a custom domain sender (Resend/SendGrid) should be set up before real users depend on password reset / confirmation emails at scale. **Not blocking for the 7-day build, but flagged for pre-launch.**
- v1 assumes one shop per user (no staff working across multiple shops) — matches mom's app's model, documented here as an intentional scope limit, not an oversight.
- Timezone handling: mom's app hardcodes Africa/Lagos for "today" boundaries. Reko will need this to be configurable per shop if it expands beyond Nigeria — v1 will hardcode Lagos time same as mom's app, flagged as a future limitation.

---

## 5. Change log

- **2026-09-04:** Initial plan created. Confirmed `product-sales` repo has zero code (PRD + brand docs only). Confirmed no Supabase project exists yet for Reko (only mom's `salebook` project exists). Full 7-day sequence drafted above.
- **2026-09-04 (Day 1 progress):** Created Supabase project `reko` (id `ktpqywmtgswjmvdyvvlg`, region eu-west-1, free tier, $0/month). Applied migrations 0001–0005:
  - 0001: `shops`, `profiles`, `current_shop_id()`, `is_owner()`, RLS enabled with owner/staff-scoped policies
  - 0002: `products`, `sales`, `stock_adjustments`, `payments` — all shop-scoped, RLS enabled
  - 0003: `SECURITY DEFINER` functions (`create_sale`, `update_sale`, `delete_sale`, `restock_product`, `record_payment`) built correctly from day one, each with an internal `shop_id` ownership check (required since SECURITY DEFINER bypasses RLS)
  - 0004–0005: Security advisor flagged leftover default PUBLIC/anon execute grants on `current_shop_id()`/`is_owner()`; revoked. Re-ran advisor — clean except for expected `authenticated`-role warnings on the 5 action functions, which are intentional (shop-scoped checks happen inside each function body).
  - Verified RLS is enabled (`relrowsecurity = true`) on all 6 shop-scoped tables.
  - **Not yet done today:** auth setup (email/password, Google OAuth, email confirmation, forgot password), Next.js app scaffold, two-shop isolation test with real data (only schema-level RLS confirmed so far, not yet tested with actual rows from two different shops).
