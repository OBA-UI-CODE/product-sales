# JOHTA Product Requirements Document

| | |
|---|---|
| **Product** | JOHTA: sales, stock and debt records for small shops |
| **Tagline** | Every sale, accounted for. |
| **Live at** | https://johta.click (website and app on one domain) |
| **Owner** | OBA (founder, product designer) |
| **Document status** | Living document. Describes the product as built and live on 13 September 2026 |
| **Related docs** | `CHANGES.md` (engineering handover), `supabase/migrations/` (database history), `PRD.md` at the repo root (the original 26 Aug 2026 plan, written as "SaleBook"), `docs/BUILD-PLAN.md`, `docs/BRAND-GUIDELINES.md` |

This document replaces the root `PRD.md` as the description of the product.
That file is kept as the record of the original plan; section 15 compares the
two.

---

## Contents

1. [Summary](#1-summary)
2. [The problem](#2-the-problem)
3. [Who it is for](#3-who-it-is-for)
4. [Goals and how we measure them](#4-goals-and-how-we-measure-them)
5. [Product principles](#5-product-principles)
6. [Plans and pricing](#6-plans-and-pricing)
7. [The website](#7-the-website)
8. [The app: feature requirements](#8-the-app-feature-requirements)
9. [Messages we send: email and phone notifications](#9-messages-we-send-email-and-phone-notifications)
10. [Design system](#10-design-system)
11. [Technical architecture](#11-technical-architecture)
12. [Security and privacy](#12-security-and-privacy)
13. [Operations](#13-operations)
14. [Decision log](#14-decision-log)
15. [The original plan vs what was built](#15-the-original-plan-vs-what-was-built)
16. [Build timeline](#16-build-timeline)
17. [Current status](#17-current-status)
18. [Known issues and limitations](#18-known-issues-and-limitations)
19. [Roadmap: changes and additions to make JOHTA better](#19-roadmap-changes-and-additions-to-make-johta-better)
20. [Open questions](#20-open-questions)
21. [Appendices](#21-appendices)

---

## 1. Summary

JOHTA replaces the paper notebook that small Nigerian shops use to record
sales. The owner and their staff log each sale on a phone in a few seconds.
JOHTA keeps the stock count up to date, remembers who still owes money, shows
what the shop made today, this week and this month, and sends a receipt the
customer can keep on WhatsApp.

It is a web app that installs to the home screen like a native app. There is
nothing to download from an app store and it works on any phone with a
browser and data.

**Where it came from.** JOHTA began as a private app built for one real shop:
OBA's mother's store, T-Max Store, which sells hair attachments and
cosmetics. It replaced her notebook and worked, and thousands of other shops
keep the same notebook. The product was planned in August 2026 as
"SaleBook", built in September 2026 under the working name "Reko", and
launched as JOHTA.

JOHTA has two plans. **Free** covers the daily work of a shop forever.
**Paid** (₦1,599 a month or ₦15,990 a year) adds receipts, unlimited staff,
full history and a download of every record. Every new shop gets one month of
Paid free, with no card required.

---

## 2. The problem

Small shops in Nigeria (hair and cosmetics, provisions, fabric, fashion,
shoes, food and drinks) run on a notebook. The notebook fails in predictable
ways:

- **Nobody can add it up.** At closing time the owner cannot tell whether the
  money in hand matches what was sold.
- **Sales go missing.** A page gets torn out, a sale is never written down, or
  it is written in the wrong notebook.
- **Staff disputes.** When two attendants share a notebook there is no record
  of who sold what.
- **Stock is a guess.** Nobody knows what is running out until a customer
  asks for it.
- **Debts are forgotten.** "I'll pay you next week" lives on a scrap of paper
  or in someone's memory.
- **Finding an old sale takes forever.** Flipping through three notebooks to
  find one sale from two weeks ago.
- **Existing tools do not fit.** Spreadsheets and accounting software are
  built for offices, not a busy counter, and many assume a laptop.

---

## 3. Who it is for

### Primary: the shop owner

- Runs one small shop, often with one to four attendants.
- Uses an Android phone first; may have a laptop, often does not.
- Comfortable with WhatsApp, not with spreadsheets.
- Price sensitive. Will pay for something that saves money or stops loss.
- Wants to know, from anywhere, what was sold today and by whom.

### Secondary: the staff member (attendant)

- Logs sales at the counter under their own name.
- Needs the fastest possible way to record a sale, nothing more.
- Should never see billing, shop settings or the ability to close the shop.

### Tertiary: the customer

- Never uses JOHTA directly.
- Receives a receipt image, usually on WhatsApp, as proof of payment or of
  what is still owed.

### Out of scope for now

Supermarkets with barcode tills, chains with many branches, businesses that
need full double-entry accounting or tax filing.

---

## 4. Goals and how we measure them

| Goal | Measure | How to read it today |
|---|---|---|
| Owners set up quickly | Share of sign-ups that finish onboarding | shops with a profile ÷ auth users |
| Shops actually use it | First sale logged within 24 hours of onboarding | first `sales.created_at` vs `shops.created_at` |
| It becomes a habit | Weekly active shops (logged at least one sale that week) | `sales` grouped by shop and ISO week |
| Teams use it together | Share of shops with at least one staff member | `profiles.role = 'staff'` |
| It earns money | Trial-to-paid conversion when the free month ends | `subscription_status = 'active'` after `trial_ends_at` |
| People stay | Shops still logging sales 30 days after sign-up | same as weekly active, by cohort |
| Reminders help | Reminder opt-in rate, and sales logged within an hour of a reminder | `push_subscriptions`, `sales.created_at` |

There is no product analytics tool yet (see [Roadmap](#19-roadmap-changes-and-additions-to-make-johta-better)).
All of the above can be computed directly from the database.

---

## 5. Product principles

These came up repeatedly while building and guide every decision.

1. **A sale in under ten seconds.** The counter is busy. Anything that slows
   logging a sale is a bug.
2. **Nothing is ever silently lost.** Deleted sales are archived, removed
   staff are archived, removed product sizes are archived. The shop's history
   cannot be rewritten by removing a person or a product.
3. **The database is the lock, not the screen.** Every rule (plan limits,
   who may edit a sale, paused shops) is enforced in the database, so it holds
   even for someone calling the API directly. The screens only explain.
4. **Show a locked feature, don't hide it.** On Free, the Receipt button is
   still there and explains that receipts are on Paid. People cannot want what
   they cannot see.
5. **Match the Figma file exactly.** The founder is the designer. Screens are
   measured against the file's coordinates, not eyeballed. Fixes for one
   screen size never change the others.
6. **Plain language.** No jargon, no em dashes, "Sep" not "Sept", amounts in
   naira with thousands separators, times in Lagos time.
7. **Built for Nigerian conditions.** Android first, WhatsApp as the sharing
   channel, Lagos time zone everywhere, careful with data usage, works in
   older browsers.
8. **Free should be genuinely useful.** Free is not a demo. A shop can run on
   it indefinitely. Paid is for shops that have grown into needing more.

---

## 6. Plans and pricing

### 6.1 The two plans

| Feature | Free | Paid |
|---|---|---|
| Log sales, dashboard, today's totals | ✅ | ✅ |
| Products and stock tracking | ✅ | ✅ |
| Sizes and packs (variants) | ✅ | ✅ |
| Low-stock warnings | ✅ | ✅ |
| Debts and recording payments | ✅ | ✅ |
| Sales reminders on the phone | ✅ | ✅ |
| Weekly and monthly totals | Recent periods | All periods |
| Insights | Trend (7 days, 4 weeks) and top sellers | Everything, including running out and not selling |
| Staff accounts | 1 | Unlimited |
| Sales history | Last 30 days (debts always visible) | All of it |
| Customer receipts | ❌ | ✅ |
| Download my records (CSV) | ❌ | ✅ |
| Pause or delete the shop | ✅ | ✅ |
| Personal data requests (NDPA) | Free, by email | Free, by email |

**Price:** ₦1,599 a month, or ₦15,990 a year (about two months free). Monthly
and yearly are the same plan.

**Trial:** every new shop gets one month of Paid features, no card needed.
When it ends the shop moves to Free automatically. Nothing is deleted and
nothing is read-only.

### 6.2 Rules

- **Paid** means: an active subscription, or trialing inside the trial, or
  cancelled with paid time still left. This single definition lives in the
  database function `shop_is_paid(shop)`.
- **Cancelling** never cuts access early. The shop keeps Paid until the end of
  the period already paid for.
- **Dropping to Free with several staff:** the earliest-added staff member (or
  whoever the owner picks) keeps working. The others see a "no access" page
  and their writes are refused. Nobody is deleted, and they come back the
  moment the shop pays again.
- **History on Free:** sales older than 30 days are hidden (31 in the
  database, so a whole calendar month is visible on the 31st), except sales
  still owed. Debts never disappear.
- **Payments** are handled by Paystack. Card details never touch JOHTA. Only
  Paystack's signed webhook can mark a shop as paid.

### 6.3 Why these limits

- Receipts, staff and history are what a growing shop needs, and what a
  one-person shop can live without. That makes them a fair line.
- Low-stock warnings and sizes stayed on Free on purpose: they make the daily
  record accurate, and an accurate record is the whole point.
- Downloads are Paid, but personal data requests stay free for everyone
  because the Nigeria Data Protection Act requires it.

---

## 7. The website

The public website sells the product and answers questions before sign-up.
All pages are built from Figma at three sizes: phone (393), tablet (834) and
web (1440).

### 7.1 Pages

| Page | Path | Purpose | Sections |
|---|---|---|---|
| Home | `/` | Explain JOHTA and get a sign-up | Nav, Hero, Trust strip (moving list of shop types), About, Features (six reasons), Testimonials, FAQ, Final call to action, Footer |
| About | `/about` | The story and the team's reasons | Hero, Story, Mission and vision, Why JOHTA |
| How it works | `/how-it-works` | The three steps from sign-up to first sale | Hero, Steps |
| Pricing | `/pricing` | Free vs Paid | Hero, Plans, Testimonials, FAQ |
| Contact | `/contact` | Reach the team | Form (name, email, type of enquiry, message) |
| Terms | `/terms` | Terms of service | Updated for Free and Paid |
| Privacy | `/privacy` | Privacy policy (NDPA) | Updated 12 Sep 2026, mentions reminders and suppliers |
| Page not found | any unknown address | Get people back on track from an old or mistyped link, on the website or in the app | Nav, "Error 404" badge, "This page doesn't exist.", Go to homepage and Go to my dashboard, links to How it works, Pricing, About, Contact, Footer. Real 404 status, kept out of search. Added 13 Sep 2026 in the website's style (no Figma design) |

### 7.2 Requirements

- **Hero:** "Every Sale, Accounted For." with "Every Sale," in light green and
  "Accounted For." in the darker green on every screen size, following the
  web frame (confirmed by the owner on 13 Sep 2026). Two buttons: Start Free
  Trial and See How It Works. A dashboard preview under them.
- **Testimonials:** four shop owners (Mrs. Tolulope O., Tunde A., Blessing H.,
  Fatima B.) with photos and five stars.
- **Footer:** Product, Company, Get Started and Social Media columns. Social
  links: X (@JOHTA_NG), Facebook, Instagram (@johta__), LinkedIn (company/johta).
- **Contact form:** saved to the database and emailed to the support inbox
  with Reply-To set to the sender, so answering is one tap. Capped at 20
  emails an hour against spam; past that, messages are still saved.
- **Support email:** johtaclick@gmail.com everywhere on the site.

### 7.3 Search and sharing

- Each page has its own title, description and canonical address.
- Structured data tells Google the site name (JOHTA) and logo, and links the
  four social profiles.
- A generated preview image, so links shared on WhatsApp, X and Facebook show
  a card.
- `sitemap.xml` and `robots.txt` are generated.
- `johta.vercel.app` and `www.johta.click` redirect permanently to
  `johta.click`, so there is only one address.

---

## 8. The app: feature requirements

### 8.1 Sign up and sign in

**Screens:** Sign up, Check your email, Sign in, Forgot password, Reset
password.

- Sign up with name, email and password, or with Google.
- Email confirmation link lands on onboarding. Password reset link lands on
  the reset screen.
- Passwords are checked against known data breaches (Have I Been Pwned) using
  a method that never sends the password anywhere. If the check service is
  down, sign-up still works.
- Show/hide on every password field.
- **Google sign-in** (live since 10 Sep 2026). Google linked to an existing
  email account instead of creating a second one.
  - Inside WhatsApp, Instagram and Facebook's built-in browsers, Google
    refuses to sign people in. JOHTA detects these browsers and tells people
    to open the page in Chrome or Safari instead.
  - Staff cannot use Google sign-in. This keeps an owner's password reset
    effective.
- The JOHTA logo on these screens links back to the homepage.
- Sign-up panel: shop-front illustration with "Open to everyday *trades*, easy
  on the budget." (updated 13 Sep 2026).

### 8.2 Onboarding

Five steps, with a back arrow on steps 2 to 4 so a typo does not mean
starting over. Answers are kept when going back.

1. **Welcome** to JOHTA.
2. **What are you into?** Pick one or more categories (Hairs and Cosmetics,
   Provisions, Foodstuff, Beverages and Wine, Snacks and Catering, Children
   wears, Adult wears, Shoes, Others). Several, because a provisions shop
   usually sells drinks and snacks too.
3. **Shop details:** owner name, shop name, staff count.
4. **Make it yours:** pick an accent colour (green, blue, purple, orange,
   pink). The whole signed-in app follows this colour.
5. **You're all set.** Go to your shop.

On phones the form keeps a 24px margin on both sides at every width (fixed
13 Sep 2026; it used to touch the edges on phones narrower than 393).

### 8.3 Dashboard (Home)

- Greeting by time of day and name ("Good morning, Mick").
- Four cards: Today's sales (with how much was collected), Sales logged (and
  by how many staff), Average sale, Low stock. Each compares with yesterday.
- **Top sellers this week** card.
- **Today's sales** list, newest first. Tap to edit (same form as Sales
  History). "See all" goes to Sales History.
- **+ Add Sale** button: in the header on tablet and web; on phones, a
  floating button.
- **Trial notice** for owners during the free month (highlighted in the last
  three days) and for a week after it ends. Closable. Not shown to staff or
  paying shops.

### 8.4 Adding a sale

The most important screen in the product.

- Search products by name or by size ("relaxer", "12 pack"). Every size is
  listed with its price, and picking one fills the price in.
- Or type an item that is not a product yet ("Ankara fabric, 2 yards").
- Quantity with plus and minus buttons, price, amount paid.
- If the amount paid is less than the total, the customer's name is asked
  for and the sale becomes a debt.
- Stock goes down automatically for the product or size sold.
- **"Add Ankara to your products?"**: when an owner types the same new item
  name a second time within 60 days, JOHTA offers to add it as a product with
  the name already filled in. This keeps stock and Insights accurate.

### 8.5 Sales History

- **Day / Week / Month** tabs.
  - **Day:** every sale on the chosen day.
  - **Week** (Monday to Sunday) and **Month:** total, number of sales,
    collected, still owed, a bar per day or per week (tap to open it), the
    best day, and the top three items.
  - Arrows step back and forward. "This week", "Last week" and "This month"
    are named.
- Date picker. On Free, dates older than the 30-day window are locked with a
  "See plans" prompt.
- "See insights" button beside the date picker (this is how phones reach
  Insights).
- Edit or delete a sale. **Owners** may change any sale; **staff** may change
  only sales they logged. Deleting archives the sale and puts the stock back.
- All days are Lagos days. A sale at 00:30 belongs to that day, not the day
  before.

### 8.6 Insights

Added 12 Sep 2026, built in the app's existing style; the owner will
redesign it in Figma.

| Section | What it shows | Plan |
|---|---|---|
| Sales trend | Last 7 days against the 7 before (%), weeks, 12 months. Bars open that period in Sales History | Free: 7 days, 4 weeks. Paid: 8 weeks, 12 months |
| Top sellers | Last 30 days by money, with quantity | Free |
| Running out soon | Items with 7 days of stock or less at the current rate of sale, and sold-out best sellers | Paid |
| Not selling | Stock with no sale in 30 days, the money tied up in it, and when it last sold | Paid |

- Owners and staff both see Insights.
- If 30% or more of the month's sales were typed in rather than picked from
  products, owners are told that stock-based insights cannot see them.
- On tablet and web, Insights is in the sidebar. On phones it is a button at
  the top of Sales History, so the bottom bar stays at five items.

### 8.7 Products and stock (called "Stock" on phones)

- Add a product with name, category, price and stock.
- **Sizes and packs:** one product can have several sizes, each with its own
  price and stock ("Relaxer": Small, Medium, Big, Big 6-pack). Selling a
  12-pack leaves the singles alone.
- Restock a product or a size.
- Low-stock warnings.
- Removing a product or size archives it, because past sales point at it.
- `/products?add=Name` opens the add form with the name filled in.

### 8.8 Debts

- Every sale where the amount paid is less than the total.
- Customer name, item, total, paid, balance, date, and who sold it.
- **Record payment** for part or all of the balance.
- Receipt button, because the receipt is the slip that settles a debt.
- Debts are always visible, even past the 30-day history window on Free.

### 8.9 Receipts (Paid)

- An image in the Figma receipt design: dark green band with the JOHTA
  wordmark, shop name, shop phone number (if set), RECEIPT and a short
  reference, date and time in Lagos time, item, size and quantity, Total,
  Paid, Status, and "served by".
- A debt adds the balance in red, the customer's name, and "Not fully paid".
- Drawn at double resolution so it stays sharp on WhatsApp.
- On a phone, the Receipt button opens the share sheet so it goes straight
  into a WhatsApp chat. Elsewhere it downloads.
- On Free the button explains that receipts are a Paid feature.

### 8.10 Settings (called "Account" on phones)

In this order:

1. **Staff** (owner): add a staff member with name, email and password; set a
   new password for them; remove them. On Free with more than one staff,
   choose who keeps the seat.
2. **Shop details** (owner): shop name, phone number for receipts.
3. **Billing** (owner): current plan, trial end date, subscribe monthly or
   yearly through Paystack, cancel.
4. **Reminders** (everyone): turn on for this phone, a switch for each of the
   three reminders, send a test, turn off on this phone.
5. **Your records** (owner): download every sale, debt and product as a CSV
   (Paid).
6. **Install JOHTA** on the home screen.
7. **Your account:** Logout (on phones), and:
   - Owners: **Pause** the shop, or **Delete** it.
   - Staff: **Delete my account**.

### 8.11 Staff accounts

- The owner creates staff logins. Staff cannot sign up by themselves, change
  their own password or use Google sign-in.
- Every sale records who logged it.
- Removing a staff member archives them: they leave the staff list, cannot
  sign in, are signed out of any open tab immediately, and their email is
  freed so the same person could be added again. Their past sales still show
  their name.

### 8.12 Pausing and deleting a shop

- **Pause:** cancels the subscription, closes the shop and signs everyone
  out, but keeps every record. The owner signs in and presses "Reopen my
  shop" to carry on.
- **Delete:** owner only, confirmed by typing the shop's name. The flow offers
  a download of all records first. Then the subscription is cancelled, the
  shop closed, everyone signed out, and the data kept for **30 days** before
  it is destroyed. Signing in during those 30 days shows the exact date and a
  "Keep my shop" button that undoes everything.
- Destruction runs every night in the database (03:15 UTC), so it does not
  depend on the website being deployed.

### 8.13 Install as an app

- JOHTA can be installed to the home screen (Android, and iPhone through
  Share, Add to Home Screen). It then opens full screen with its own icon.
- Settings has an Install section; the prompt is captured early so the
  button works on the first visit.

### 8.14 Navigation

- **Tablet and web:** sidebar with Home, Sales History, Insights, Products,
  Debts, Settings, Logout. Active item is a pill in the shop's colour.
- **Phones:** bottom bar with five items: Home, Sales, Stock, Debts, Account.
  Icons 18px, labels 13px. Sales stays highlighted while on Insights.

---

## 9. Messages we send: email and phone notifications

| Message | To | When | From |
|---|---|---|---|
| Confirm your email | New sign-ups | On sign-up | hello@johta.click (Resend) |
| Reset your password | Anyone who asks | On request | hello@johta.click |
| Free and Paid announcement | Shops that existed before 14 Sep 2026 and are still in their free month | Once, from Monday 14 Sep 2026 at 08:00 Lagos | hello@johta.click |
| Trial ends in 3 days | Owners | Three days before their trial ends | hello@johta.click |
| Contact form message | Support inbox | On each message | contact@johta.click |
| Error alert | Support inbox | First time a problem appears, again if it continues six hours later, at most 10 an hour | alerts@johta.click |
| Morning reminder | Owners and staff who turned reminders on | 08:00 Lagos | Phone notification |
| Afternoon reminder | Same | 14:00 Lagos, only if nothing has been logged today | Phone notification |
| Evening summary | Same | 20:00 Lagos, today's total, or a nudge if nothing logged | Phone notification |

Rules:

- Nothing is sent to customers without the owner's approval.
- Each announcement and reminder email goes once per shop (recorded in
  `shop_notices`). A failed send is retried the next day.
- Replies to JOHTA emails go to the support inbox.
- Phone reminders need the browser's permission. On iPhone they only work
  once JOHTA is installed to the home screen (Apple's rule), and the
  Reminders section says so.

---

## 10. Design system

- **Source of truth:** Figma file `DAmYfcjHZjuv2cDTBXSMIY`, page "Designs".
  Node IDs for every screen are in [Appendix C](#appendix-c-figma-map).
- **Breakpoints:** phone up to 833px (designed at 393), tablet from 834px
  (`tab:`), web from 1200px (`web:`, designed at 1440).
- **Fonts:** DM Sans (headings), Inter (body), Dokdo (the JOHTA wordmark in
  logo lockups only; inside a sentence JOHTA is plain text, coloured).
- **Colour:** dark theme. Brand green `#158060` (primary), `#5dcaa5` (primary
  text), `#b3e6d6` (light green), canvas `#0a0a0a`, surface `#1a1a1a`, text
  `#ffffff` and `#cacaca`. Highlight red `#eb6767`.
- **Shop colour:** the accent picked in onboarding replaces the green across
  the signed-in app. The other four colours are derived from the green's own
  relationships, so choosing green reproduces the design exactly.
- **Corners:** 10px everywhere, except deliberate circles.
- **Touch targets:** at least 44px; buttons and fields 48 to 52px tall.
- **Icons:** inline SVG using the current text colour, so they follow the
  shop's colour. Exported SVGs with baked-in colours caused three bugs and
  are no longer used for icons.
- **Copy rules:** no em dashes, "Sep" not "Sept", naira with thousands
  separators, Lagos time.
- **Screens without a Figma design** (Sales History, Products, Debts,
  Settings, Add Sale, Insights) use the app's existing style until the owner
  designs them.

---

## 11. Technical architecture

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React, TypeScript |
| Styling | Tailwind CSS v4 with design tokens in `globals.css` |
| Database and auth | Supabase (Postgres, Auth, Row Level Security, pg_cron, pg_net, Vault), project `ktpqywmtgswjmvdyvvlg`, eu-west-1 |
| Hosting | Vercel, region dub1, linked to GitHub `OBA-UI-CODE/product-sales`; pushing `main` deploys production |
| Payments | Paystack (hosted checkout, subscriptions, signed webhook) |
| Email | Resend on the verified `johta.click` domain (SPF, DKIM, DMARC pass) |
| Phone notifications | Web Push with VAPID keys, `public/sw.js` service worker |
| Receipt images | Satori (`ImageResponse`) with bundled fonts |
| Error monitoring | Own table and email alerts (no third-party tracker) |

### 11.1 How the pieces fit

- **All shop data is in Postgres** with Row Level Security on every table. A
  user can only ever read and write their own shop's rows.
- **Writes go through database functions** (`create_sale`, `update_sale`,
  `record_payment`, `complete_onboarding`, and others) that re-check the
  caller's shop, role and plan.
- **Totals are added up in the database** (`sales_summary`, the `insights_*`
  functions) because the API returns at most 1,000 rows and a busy month
  would come back short.
- **Scheduled jobs:**

  | Job | Schedule | Runs in |
  |---|---|---|
  | Plan notices (announcement and 3-day reminder) | Daily 07:00 UTC | Vercel Cron → `/api/cron/notices` |
  | Morning, afternoon, evening reminders | 07:00, 13:00, 19:00 UTC | pg_cron + pg_net → `/api/cron/reminders` |
  | Destroy shops past their 30-day grace | 03:15 UTC | pg_cron → `purge_expired_shops()` |
  | Delete error records older than 90 days | 03:30 UTC | pg_cron |

  Reminders run from the database because Vercel's free plan only allows
  daily crons.

### 11.2 Repository layout

```
src/app/(marketing)/     public website pages
src/app/(app)/           signed-in app (dashboard, sales-history, insights,
                         products, debts, settings)
src/app/api/             receipt, export, cron, push, errors, paystack webhook
src/app/auth/            OAuth callback and email confirmation
src/components/          marketing, dashboard, auth, onboarding, ui
src/lib/                 plan rules, dates, notices, push, paystack, site
supabase/migrations/     every database change, in order
public/sw.js             service worker for notifications
```

---

## 12. Security and privacy

### 12.1 What protects the data

- **Tenant isolation:** Row Level Security on every table, and the
  write functions re-check ownership. Guessing another shop's ID gets
  nothing. Verified directly against the database.
- **Plan and billing columns cannot be edited by users.** A bug found on
  9 Sep 2026 let an owner set their own shop to "active" with one request.
  Fixed with column-level grants; only the signed Paystack webhook can change
  billing state.
- **Profiles:** users can change only their own name.
- **Webhook:** every Paystack request is verified with an HMAC-SHA512
  signature before its body is read. Unsigned and forged requests get 401.
- **Sessions:** closing a shop or removing staff ends their sessions in the
  database, so an open tab stops working immediately.
- **Redirects:** sign-in only ever returns to paths on johta.click, and only
  from allowed origins.
- **Security headers** on every response: `Content-Security-Policy:
  frame-ancestors 'none'`, `X-Frame-Options: DENY`, HSTS (two years,
  subdomains), `X-Content-Type-Options: nosniff`, `Referrer-Policy:
  strict-origin-when-cross-origin`, and a `Permissions-Policy` that turns off
  camera, microphone, geolocation and topics. The `X-Powered-By` header is
  removed.
- **Owner-only endpoints:** the records download returns 403 for staff and
  402 on Free; receipts return 402 on Free.
- **Secrets** live only in Vercel environment variables and the gitignored
  `.env.local`. Every commit is scanned for key patterns before it is made.

### 12.2 Privacy

- Card details never reach JOHTA (Paystack hosts checkout).
- Error records store no user or shop ID and are deleted after 90 days.
- Error monitoring was built in-house instead of using Sentry, so no extra
  company receives users' data.
- Passwords are checked against breaches without being sent anywhere.
- Deletion is self-serve with 30 days' retention, stated plainly in the
  Privacy Policy.
- Personal data requests are free on every plan (Nigeria Data Protection Act).

---

## 13. Operations

### 13.1 Deploying

1. Work on branch `rebuild/johta-figma-billing`.
2. Commit (after the secret scan).
3. `git push origin rebuild/johta-figma-billing:main`. Vercel builds and
   deploys production in about a minute.
4. Check the change on https://johta.click.

Database changes are applied as Supabase migrations and saved to
`supabase/migrations/`.

### 13.2 Monitoring

- **Errors:** server errors (`instrumentation.ts`) and browser errors
  (`ErrorReporter`) are stored in `error_events`, grouped in `error_summary`,
  and emailed to the support inbox.
- **Error pages:** "Something went wrong" with Try again, a way home and a
  reference number matching the stored error.
- **Stale pages after a deploy:** a page left open across a deploy reloads
  itself once instead of breaking.
- **Health check (last run 13 Sep 2026):** every public page returns 200,
  all six security headers present, all scheduled jobs succeeding, 35 of 35
  live app checks passing, no new database security or performance warnings.

### 13.3 Environment variables

Set in Vercel (Settings, Environment Variables) and in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL          NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY         (server only)
PAYSTACK_SECRET_KEY               (server only)
PAYSTACK_PLAN_MONTHLY             PAYSTACK_PLAN_YEARLY
NEXT_PUBLIC_SITE_URL              https://johta.click in production
RESEND_API_KEY                    (server only)
ALERT_EMAIL, ALERT_FROM           optional, defaults to the support inbox and alerts@johta.click
CRON_SECRET                       (server only)
NEXT_PUBLIC_VAPID_PUBLIC_KEY      VAPID_PRIVATE_KEY (server only)
```

The reminders key is generated inside the Supabase Vault and never typed or
shown anywhere.

### 13.4 Testing approach

Changes are checked against the live database and a real browser, not
assumed:

- Throwaway shops and users (`@example.test`) are created for each test and
  deleted afterwards, with row counts checked back to their starting values.
- Layout is measured in headless Chrome at 320, 360, 393, 834 and 1440 and
  compared with Figma coordinates.
- There is no automated test suite or CI yet (see Roadmap).

---

## 14. Decision log

| Date | Decision | Why |
|---|---|---|
| 5 Sep 2026 | Build as a web app that installs to the home screen, not a native app | No app store, works on any phone, one codebase, instant updates |
| 5 Sep 2026 | Supabase with Row Level Security for every table | Multi-shop isolation enforced by the database itself |
| 6 Sep 2026 | Paystack for billing; only the signed webhook can mark a shop paid | The browser returning from checkout cannot be trusted |
| 6 Sep 2026 | Trial extended from 14 days to one month, no card required | Shops need a full month cycle to see the value |
| 7 Sep 2026 | Product sizes and packs, each with its own price and stock | Real shops sell the same product in several sizes |
| 8 Sep 2026 | Removed sizes, products and staff are archived, never deleted | Past sales point at them; deleting would rewrite history |
| 8 Sep 2026 | Delete has 30 days' grace and offers a download first | Sales are business records that may be needed for tax |
| 8 Sep 2026 | Pause as a softer option than delete | For someone about to delete in frustration, or who just wants billing to stop |
| 8 Sep 2026 | Several categories per shop, back arrow in onboarding | A provisions shop sells drinks too; a typo should not mean starting over |
| 9 Sep 2026 | Staff may change only their own sales; delete becomes archive | A deleted sale is the notebook page torn out, the exact problem JOHTA solves |
| 7 Sep 2026 | Rename Reko to JOHTA | Brand decision |
| 10 Sep 2026 | Free and Paid plans instead of read-only after the trial | Free keeps shops using JOHTA; Paid is for growth |
| 10 Sep 2026 | Paid = receipts, unlimited staff, full history, downloads | The needs of a growing shop; daily accuracy stays free |
| 10 Sep 2026 | Build error monitoring in-house, not Sentry | No new company gets users' data; costs nothing |
| 10 Sep 2026 | Support email johtaclick@gmail.com | The previous inbox stopped working |
| 10 Sep 2026 | Switch on Google sign-in; redirect johta.vercel.app to johta.click | Faster sign-up; the old address caused a double sign-in |
| 11 Sep 2026 | Tell existing shops about the plans by email, reminder and dashboard notice | The Terms promise notice before a change like this |
| 11 Sep 2026 | Weekly and monthly totals in Sales History only | Owner's idea; keeps the dashboard focused on today |
| 11 Sep 2026 | Download records made visible in Settings, owner only | It was advertised but only reachable through the delete flow; the file holds every debtor's name |
| 11 Sep 2026 | Security headers, locked `can_modify_sale`, stale-page reload | Health check findings |
| 12 Sep 2026 | Phone reminders free for everyone, staff included | Habit building benefits every plan; costs nothing to send |
| 12 Sep 2026 | Insights page with a Free/Paid split | Trend and top sellers help everyone; stock predictions are the upgrade |
| 12 Sep 2026 | Bottom bar stays at five items; Insights reached from Sales History on phones | Six items did not fit at a readable size |
| 12 Sep 2026 | Short phone labels: Home, Sales, Stock, Debts, Account | Fit at 13px without truncating |
| 12 Sep 2026 | Vercel linked to GitHub; pushing main deploys | Removes the need for a personal deploy token |
| 13 Sep 2026 | Landing hero follows the web frame on every screen size | Owner confirmed the phone and tablet frames were out of date |
| 13 Sep 2026 | Sign-up panel updated to the shop-front illustration | New Figma design |

---

## 15. The original plan vs what was built

The first PRD (repo root `PRD.md`, 26 Aug 2026) planned a multi-shop version
of T-Max Store's app. How each part turned out:

| Original plan | What was built | Why it changed |
|---|---|---|
| 14-day trial, then read-only until paid | One month of Paid, then Free forever | A read-only shop stops using JOHTA; Free keeps the habit and the data growing |
| One simple paid plan, price to be decided | ₦1,599 a month or ₦15,990 a year | Price set by OBA (lowered from ₦3,599 on 5 Sep 2026) |
| `past_due` shows a grace banner | `past_due` drops to Free straight away | Not built yet; on the roadmap |
| Paystack webhook in a Supabase Edge Function | Webhook is a Next.js route on Vercel | One codebase and one deploy |
| Six theme presets, custom accent colour and logo upload | Five accent colours picked in onboarding, applied across the app | Kept simple; presets and logos not built |
| Settings, Appearance to change the theme later | Not built | Colour is chosen once in onboarding |
| Reports by day, week and month with a chart | Day, Week, Month in Sales History, plus Insights | Built |
| Best-selling products | Top sellers (Insights and dashboard) | Built |
| Sales per staff member | Not built | Still useful; on the roadmap |
| Low-stock alerts with a threshold per product | Low-stock warnings using a fixed threshold of 5 (a database column exists per product and size, with no screen to change it) | Screen to set it is on the roadmap |
| Receipts shareable on WhatsApp, with the shop's logo | Receipt image in the Figma design, shared through the phone's share sheet; shop name and phone, no logo | Logo upload was not built |
| Friendly empty states | Present on the dashboard and products | Built |
| Installable as an app (PWA) | Built, with iPhone instructions | Built |
| Platform admin view for OBA | Not built; the Supabase dashboard is used | On the roadmap |
| No offline mode, no barcode, no multi-branch, no accounting | Still out of scope | Unchanged; offline and profit are now on the roadmap |
| Business registration (CAC) needed for live payouts | Live payments working through Paystack | Done |

Added that the original plan did not have: Free plan, sizes and packs, debts
with payments, pause and delete with 30 days' grace, staff archiving, Google
sign-in, error monitoring, plan emails, phone reminders, Insights, the
"Add to your products?" nudge, the full marketing website and SEO.

---

## 16. Build timeline

| Date | What shipped |
|---|---|
| 26 Aug 2026 | Original PRD ("SaleBook") and brand guidelines written |
| 5 Sep 2026 | First version in one day: Supabase with two-shop isolation tested, sign-up and sign-in, onboarding, the seven-page website, dashboard, products, debts, settings, Add Sale and Edit Sale, contact form, time-of-day greeting |
| 7 Sep 2026 | Rebuild from Figma at three sizes; renamed Reko to JOHTA; Paystack billing; one-month trial; product sizes and packs; app icon and manifest |
| 8 Sep 2026 | Pause and delete with 30 days' grace; staff archiving and passwords; several categories and back arrow in onboarding; nav icons follow the shop colour; product search; faster navigation |
| 9 Sep 2026 | Staff limited to their own sales, deletes archived; billing columns locked; receipts; Terms and Privacy rewritten for the NDPA; em dashes removed; 10px corners everywhere; robots, sitemap and link previews; iPhone install help |
| 10 Sep 2026 | Free and Paid plans; Figma receipt design; Google sign-in live; error monitoring; logo links home; X and Facebook links; johtaclick@gmail.com; contact messages emailed |
| 11 Sep 2026 | Security headers; plan announcement emails, reminders and dashboard notice; weekly and monthly totals; records download in Settings; phone logout under Your account |
| 12 Sep 2026 | Phone reminders; Insights and top sellers; "Add to your products?" nudge; shorter phone nav; testimonials from Figma; Instagram and LinkedIn in the footer; delivery receipts for reminders |
| 13 Sep 2026 | Test accounts removed; onboarding and sign-up margins on narrow phones; hero colours confirmed; new sign-up illustration; this document |

---

## 17. Current status

As of 13 September 2026:

| | |
|---|---|
| Shops | 10 (9 in their free month, 1 paid then cancelled) |
| Logins | 14 |
| Active staff | 1 |
| Live payment | Proven: one real Paystack subscription completed, then cancelled by its owner |
| Next trial to end | 8 Oct 2026 |
| Plan announcement | Scheduled for Monday 14 Sep 2026, 08:00 Lagos |
| Phone reminders | Working on the server and accepted by Google's push service, but not appearing on the owner's Android 10 phone (see below). 0 devices registered after the test accounts were removed |

---

## 18. Known issues and limitations

| Issue | Impact | Notes |
|---|---|---|
| Phone reminders not showing on the owner's Android phone | Reminders may not reach some Android users | The push service accepts them (HTTP 201) but the phone never shows them or confirms receipt. Paused at the owner's request. Next steps: test on a second Android phone, check Chrome's site notification settings and battery optimisation, check the phone's system-level notification setting for Chrome |
| Paystack cannot delay the first charge | Owners cannot hand over a card during the trial and pay later | Paystack's `start_date` needs an earlier card authorisation. Billing screen says this plainly |
| No "update card" flow | A failed renewal cannot be fixed from inside JOHTA | Planned |
| `past_due` drops straight to Free | No grace period after a failed payment | A few days' grace would be kinder |
| Google's sign-in screen shows `ktpqywmtgswjmvdyvvlg.supabase.co` | Looks less trustworthy | Fixed by a Supabase custom domain (paid add-on) |
| Google refuses sign-in inside in-app browsers | People tapping a link in WhatsApp or Instagram | JOHTA tells them to open Chrome or Safari |
| Five screens have no Figma design | Sales History, Products, Debts, Settings, Add Sale and Insights use the older style | Awaiting designs |
| Figma content bugs | Sign-up frames read "Don't have an account? Sign In"; the Nav frame reads "JOhTA" | The site uses the correct wording; fix at the source |
| Phone and tablet hero frames differ from web | Confusing for future work | The site follows the web frame (owner decision 13 Sep 2026) |
| Two hydration warnings on /login from one Windows Chrome | Low; likely a browser extension | Monitor |
| No offline mode | A sale cannot be logged without data | See Roadmap |
| No automated tests or CI | Regressions are caught by manual checks | See Roadmap |
| Old Vercel token file in the project folder | Unneeded since GitHub deploys | Owner to delete it |

---

## 19. Roadmap: changes and additions to make JOHTA better

Priorities: **P0** protects revenue or trust now, **P1** is the next big
step, **P2** makes it better, **P3** is for later.

### P0: before the first trials end (8 Oct 2026)

1. **Fix phone reminders on Android.** They are the main habit builder and
   they are free. Test on more devices, add a visible "Did you get it?"
   confirmation after the test notification, and show troubleshooting steps
   when the delivery receipt never arrives.
2. **Update card and payment retry.** Add Paystack's "manage subscription"
   link to Billing and a clear banner when a payment fails.
3. **Grace period for failed payments.** Keep Paid for 3 to 5 days on
   `past_due` before dropping to Free, with an email each day.
4. **Watch the announcement go out** on 14 Sep 2026 and the first 3-day
   reminders, and read replies in the support inbox.

### P1: next big steps

5. **Offline sales.** Let a sale be logged with no data and sent when the
   phone reconnects. Network drops are normal for many shops; today a sale
   cannot be recorded offline. The service worker exists; this adds a queue.
6. **Profit, not just sales.** Add an optional cost price to products so
   JOHTA can show profit per sale, per day and per item. This is the question
   owners ask next after "how much did I sell?".
7. **End-of-day cash check.** At closing, the owner enters the cash and
   transfers in hand and JOHTA compares it with what was logged. This
   directly answers the testimonial "I used to close some evenings not knowing
   if the money still matched".
8. **Debt reminders to customers.** A ready-made WhatsApp message ("Hi Ada,
   you have ₦3,000 balance at Joy Store") opened from the Debts page, sent by
   the owner. The owner stays in control of what customers receive.
9. **Design the remaining screens in Figma** (Sales History, Products,
   Debts, Settings, Add Sale, Insights) and rebuild them to match, then delete
   the legacy colour aliases in `globals.css`.
10. **Automated tests and CI.** Turn the throwaway-shop checks already used
    (plan limits, seat swap, history window, receipts, exports) into a test
    suite that runs on every push, so a deploy cannot silently break billing
    or permissions.

### P2: make it better

11. **Product analytics that respects privacy.** Self-hosted or EU-hosted
    (for example PostHog EU) to measure the goals in section 4: onboarding
    completion, time to first sale, weekly active shops. Update the Privacy
    Policy if a new supplier is added.
12. **Onboarding with a first product.** Offer to add two or three products
    during onboarding (the old wizard had this step), or a sample product to
    try the Add Sale flow.
13. **Expenses.** Record rent, transport and restock spending so the monthly
    view shows money in and money out.
14. **Suppliers and restock history.** Who supplied what, at what price, and
    when; feeds the profit and running-out views.
15. **A record of changes.** Show owners when a sale was edited or deleted
    and by whom (the data is already archived, it just is not shown).
16. **Languages.** Nigerian Pidgin first, then Yoruba, Igbo and Hausa, for
    staff who are more comfortable outside English.
17. **Referrals.** "Give a shop a month free, get a month free." Word of mouth
    is how shop owners find tools.
18. **Custom Supabase domain** so Google's sign-in screen shows johta.click.
19. **Faster Add Sale on repeat items.** Show the shop's most sold items as
    one-tap buttons at the top of the form.
20. **Sales per staff member** (from the original plan). A simple "who sold
    what this week" view for owners in Insights.
21. **Set the low-stock level per product** (from the original plan). The
    database already stores a threshold per product and size (default 5);
    only the screen to change it is missing.
22. **Shop logo on receipts** (from the original plan). Optional upload,
    shown on the receipt and in the sidebar, with the initials circle as the
    fallback.
23. **An admin view for OBA** (from the original plan). One private page
    showing shops by status, trial end dates, sign-ups per week and
    conversions, instead of reading the Supabase dashboard.

### P3: later

24. **Several shops under one owner**, with a switcher and combined totals.
25. **Barcode scanning** with the phone camera for shops with packaged goods.
26. **Bank transfer and POS matching** (for example through a Nigerian open
    banking provider) to reconcile payments automatically.
27. **Dedicated support address** on the johta.click domain, and a help
    centre with short videos.
28. **Native app wrappers** if app store presence becomes a growth channel.

---

## 20. Open questions

1. Should reminders also go by WhatsApp or SMS for phones where web
   notifications do not work? (Cost per message, and the WhatsApp Business
   API needs approval.)
2. Should the trial-end email offer a first-month discount to improve
   conversion?
3. Should staff see the shop's total sales on the dashboard, or only their
   own? (Today they see the shop's.)
4. Is ₦1,599 the right price after the first conversions? Review after the
   first ten trials end.
5. When the remaining screens are designed, should Insights move onto the
   phone bottom bar?

---

## 21. Appendices

### Appendix A: routes

**Website:** `/`, `/about`, `/how-it-works`, `/pricing`, `/contact`,
`/terms`, `/privacy`

**Auth and setup:** `/signup`, `/signup/check-email`, `/login`,
`/forgot-password`, `/reset-password`, `/onboarding`, `/auth/callback`,
`/auth/confirm`

**App:** `/dashboard`, `/sales-history`, `/insights`, `/products`, `/debts`,
`/settings`

**Account states:** `/account/paused` (paused or pending deletion),
`/account/no-access` (staff without a seat on Free)

**API:**

| Route | Purpose | Access |
|---|---|---|
| `/api/receipt/[saleId]` | Receipt image | Signed in, Paid |
| `/api/account/export` | CSV of all records | Owner, Paid |
| `/api/paystack/webhook` | Subscription events | Signed by Paystack |
| `/api/cron/notices` | Plan emails | `CRON_SECRET` |
| `/api/cron/reminders?slot=` | Phone reminders | Vault token |
| `/api/push/received` | Delivery receipts | Service worker |
| `/api/errors` | Browser error reports | johta.click only |

### Appendix B: database migrations

In order, all in `supabase/migrations/`:

| Migration | What it does |
|---|---|
| `0001_shops_and_profiles` to `0008_contact_messages` | First version: shops, profiles, products, sales, payments, stock functions, onboarding, contact messages |
| `add_multi_tenant_indexes` | Indexes on every `shop_id` |
| `optimise_rls_policy_evaluation` | Security checks run once per query, not once per row |
| `add_paystack_billing_columns` | Subscription columns and `shop_can_write()` |
| `enforce_read_only_after_trial`, `allow_writes_until_paid_period_ends` | Early paywall (later replaced by Free and Paid) |
| `extend_free_trial_to_one_month` | Trial 14 days to one month |
| `add_product_variants`, `variant_aware_sale_functions` | Sizes and packs |
| `tighten_function_grants_before_deploy`, `revoke_function_execute_from_public` | Signed-out users cannot call functions |
| `add_account_pause_and_scheduled_deletion`, `schedule_nightly_shop_purge` | Pause, delete, nightly purge |
| `add_revoke_shop_sessions`, `fix_revoke_shop_sessions_refresh_token_match` | End sessions when a shop closes |
| `archive_removed_staff_instead_of_deleting` | Staff archiving |
| `allow_multiple_shop_categories`, `preserve_category_pick_order` | Several categories |
| `archive_product_with_its_variants` | Archiving a product archives its sizes |
| `staff_may_only_change_their_own_sales` | Staff edit rule; delete becomes archive |
| `stop_owners_editing_their_own_billing_state` | Billing columns locked |
| `restrict_profile_columns_to_name` | Users can change only their name |
| `add_shop_phone_for_receipts` | Shop phone |
| `free_and_paid_plans` | Free and Paid enforcement |
| `add_error_events` | Error monitoring |
| `lock_can_modify_sale_and_index_free_seat` | Health check fixes |
| `add_shop_notices` | Plan email records |
| `add_sales_summary_and_31_day_free_window` | Weekly and monthly totals |
| `add_push_reminders`, `allow_updating_own_push_rows`, `push_delivery_receipts` | Phone reminders |
| `add_insights_functions`, `insights_prefer_capitalised_typed_name` | Insights |

### Appendix C: Figma map

File `DAmYfcjHZjuv2cDTBXSMIY`, page "Designs" (14:2). Web / tablet / phone:

| Screen | Web | Tablet | Phone |
|---|---|---|---|
| Landing page | 19:4 | 19:6 | 19:7 |
| Landing hero | 218:5536 | 218:5538 | 218:5543 |
| Pricing | 130:4604 | 130:4817 | 130:5031 |
| Contact | 146:8867 | 146:8969 | 146:9058 |
| Sign in | 180:10177 | 180:10139 | 180:10140 |
| Sign up | 183:1501 | 183:1535 | 183:1568 |
| Onboarding: welcome | 191:2007 | | |
| Onboarding: categories | 196:2177 | 196:2185 | 196:2193 |
| Onboarding: shop details | 197:2328 | | |
| Onboarding: colour | 197:2616 | | |
| Onboarding: all set | 198:2825 | | |
| Dashboard | 201:3069 | 201:3077 | 201:3085 |
| Receipt | 444:6548 | | |

### Appendix D: external accounts

| Service | Used for | Where settings live |
|---|---|---|
| Vercel | Hosting, cron, environment variables | Project linked to GitHub `OBA-UI-CODE/product-sales` |
| Supabase | Database, auth, scheduled jobs | Project `ktpqywmtgswjmvdyvvlg` |
| Paystack | Subscriptions | Live and test modes configured separately, including webhooks |
| Resend | Email on johta.click | Domain verified |
| Google Cloud | Google sign-in | Project and OAuth client "JOHTA", consent screen published |
| Figma | Designs | File `DAmYfcjHZjuv2cDTBXSMIY` |
| Social | Marketing | X @JOHTA_NG, Facebook, Instagram @johta__, LinkedIn company/johta |
