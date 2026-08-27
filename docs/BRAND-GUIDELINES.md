# SaleBook — Brand Guidelines

**Version 1.0 · August 2026 · Owner: OBA**

These guidelines define how the SaleBook brand looks, sounds, and behaves. They exist so that every screen, page, and asset — whether designed in Figma, built by Claude Code, or made by anyone joining later — feels like the same product. When in doubt, this document wins.

---

## 1. Brand in one line

**SaleBook is the simplest way for a small shop to log its sales.** It replaces the paper notebook. The brand should feel *trustworthy, warm, and effortless* — never corporate, never complicated. The person using it is behind a counter with a customer waiting, not at a desk.

Three brand values guide every design decision:

- **Trustworthy** — a stranger has to feel safe typing in their details and paying. Green, clean layouts, and calm typography do this work.
- **Effortless** — nothing on screen should feel like homework. Generous spacing, one clear action per screen, plain words.
- **Warm** — made-for-here, human, friendly. Not a cold foreign bank app.

---

## 2. Logo

### 2.1 The mark
The SaleBook logo is a **rising-bars mark** (three ascending bars, suggesting sales going up) paired with the **wordmark "SaleBook"** set in DM Sans SemiBold.

- **Primary lockup:** mark + wordmark, horizontal.
- **Icon only:** the rising-bars mark inside a rounded square — used for the app icon, favicon, and any tight space.
- **Wordmark only:** acceptable in text-heavy contexts (footer, legal) where the mark would be too small to read.

### 2.2 Clear space
Always leave clear space around the logo equal to the height of the bars mark. Nothing — text, buttons, edges — intrudes into that space.

### 2.3 Minimum size
- Digital: the mark never renders below **24px** tall. The full lockup never below **20px** tall (below that, use the icon only).

### 2.4 Logo don'ts
- Don't recolour the mark outside the approved palette (green on light, white/tint on dark).
- Don't stretch, rotate, add shadows, outlines, or gradients.
- Don't place the full-colour logo on a busy photo — use the white version on a green or dark overlay instead.
- Don't recreate the wordmark in a different font.

---

## 3. Colour

Colour is the single strongest brand signal. **Emerald green is SaleBook's primary colour** — it carries the "money, growth, safe" meaning that makes the product feel trustworthy.

### 3.1 The system has three layers
1. **Primitives** — the raw colour ramps (below). Never reference a raw hex directly in a design or in code; always go through a semantic token.
2. **Semantic tokens** — role-based names (`primary`, `bg/surface`, `text/primary`…) that point at primitives, and switch per light/dark mode. **This is what you actually use.**
3. **Modes** — Light and Dark. Dark mode is a neutral near-black (not pure black, not a dark green wash), chosen so the green pops.

### 3.2 Primary — Emerald green
The brand colour. Used for primary buttons, active states, links, key totals, the logo, and anything that should say "this is SaleBook."

| Step | Hex | Typical use |
|------|-----|-------------|
| 50  | `#E1F5EE` | subtle green background / selected tint |
| 100 | `#B3E6D6` | |
| 200 | `#85D7BE` | |
| 300 | `#5DCAA5` | |
| 400 | `#1D9E75` | **primary default (buttons, key actions)** |
| 500 | `#158060` | |
| 600 | `#0F6E56` | primary hover / pressed |
| 700 | `#0B5544` | strong text on light |
| 800 | `#083D31` | |
| 900 | `#062E24` | deepest |

> Note: the primary emerald is a deliberately calmer, more readable green than a neon/electric green. It reads professional and is easy on the eyes for all-day use.

### 3.3 Lime — bright accent (use sparingly)
A punchy lime kept for rare high-energy accents (a celebratory "sale logged!" moment, a highlight). **Never** use it as the primary action colour — it's hard to read against and tiring in volume.
Key stop: `#47DF00` (400).

### 3.4 Neutrals — the workhorses
Backgrounds, surfaces, text, borders. Most of any screen is neutral; colour is the seasoning, not the meal.

| Step | Hex | Use |
|------|-----|-----|
| white | `#FFFFFF` | card / surface background (light mode) |
| 50  | `#F5F5F5` | page background (light mode) |
| 100 | `#E3E3E3` | subtle borders |
| 200 | `#CACACA` | default borders |
| 400 | `#9A9A9A` | muted text, placeholders |
| 600 | `#616161` | secondary text |
| 700 | `#3D3D3D` | dark-mode surface borders |
| 800 | `#303030` | dark-mode surface |
| 900 | `#0A0A0A` | primary text (light) / page bg (dark) |
| black | `#000000` | reserved, true black |

### 3.5 Status colours
Only for their meaning — never decoratively.
- **Success** — green (reuses the primary family): `#1D9E75`
- **Warning** — amber: `#E6A900` (400) / text `#8A6500`
- **Danger** — red: `#DD0202` (400) / text `#B10202`
- **Info** — sky: `#00A5D3` / text `#00637F`

### 3.6 Secondary — Blue
A supporting colour for secondary emphasis and the occasional informational accent. Not a second "brand" colour — green always leads.
Key stop: `#335C85`.

### 3.7 Full primitive palette
Beyond the above, the system also carries full 10-step ramps for **indigo, purple, magenta, cyan, and yellow** — available for data viz, illustration, or future needs, but not part of the core brand expression. Core brand = **green + neutrals**, with status colours as needed.

### 3.8 Semantic tokens (what to actually use)
Design and code reference these names, never raw hex. Each resolves differently in Light vs Dark.

| Token | Light → | Dark → |
|-------|---------|--------|
| `bg/canvas` | neutral 50 | neutral 900 |
| `bg/surface` | white | neutral 800 |
| `bg/muted` | neutral 100 | neutral 800 |
| `text/primary` | neutral 900 | neutral 50 |
| `text/secondary` | neutral 600 | neutral 300 |
| `text/muted` | neutral 400 | neutral 500 |
| `text/on-primary` | white | white |
| `border/default` | neutral 200 | neutral 700 |
| `primary/default` | green 400 | green 400 |
| `primary/hover` | green 600 | green 300 |
| `primary/subtle` | green 50 | green 900 |
| `primary/text` | green 700 | green 300 |

### 3.9 Colour rules
- **Green is for action and identity**, not for filling large areas. A screen that's mostly green feels heavy and cheap; a mostly-neutral screen with green actions feels premium.
- **One primary action per screen.** If two buttons are both green, neither stands out. Secondary actions use the outline/ghost styles.
- **Never put `text/primary` black on a green fill** — use `text/on-primary` (white) on green buttons.
- **Contrast is non-negotiable.** Body text must clear WCAG AA (4.5:1). When unsure, go darker on light / lighter on dark.

---

## 4. Typography

Two typefaces, both free and highly legible (important — many users are on cheap Android phones).

### 4.1 The pairing
- **DM Sans (SemiBold)** — all headings. Gives a bit of geometric character and confidence.
- **Inter (Regular / Medium / Semi Bold)** — all body text, labels, buttons, UI. A workhorse that stays crisp at small sizes on low-res screens.

### 4.2 Type scale (headings — DM Sans SemiBold)
| Style | Size | Line height |
|-------|------|-------------|
| Heading 5XL | 72 | 87 |
| Heading 4XL | 64 | 77 |
| Heading 3XL | 56 | 68 |
| Heading 2XL | 48 | 58 |
| Heading XL | 40 | 48 |
| Heading L | 32 | 39 |
| Heading M | 24 | 29 |
| Heading S | 20 | 24 |
| Heading XS | 18 | 22 |
| Heading 2XS | 14 | 17 |

Headings use a slightly tight letter-spacing (about -1px at large sizes) for a polished look.

### 4.3 Body text (Inter)
| Style | Size | Line height | Weight options |
|-------|------|-------------|----------------|
| Text lg | 18 | 28 | Regular / Medium / Semi Bold |
| Text md | 16 | 24 | Regular / Medium / Semi Bold |
| Text sm | 14 | 20 | Regular / Medium / Semi Bold |
| Text xs | 12 | 16 | Regular / Medium / Semi Bold |

### 4.4 Type rules
- **Sentence case everywhere** — headings, buttons, labels. Never Title Case, never ALL CAPS (except tiny legal/eyebrow labels if truly needed).
- **One heading level per section.** Don't stack two big headings.
- **Body copy is 16px minimum** on mobile — never smaller for anything the user needs to read.
- Buttons and labels: Inter Semi Bold or Medium, never Regular.

---

## 5. Currency & numbers

- Naira renders as **"₦ 4,500"** — with a **deliberate space** after the ₦ symbol (some fonts' ₦ crossbar bleeds into the next digit without it). This is a brand convention; keep it consistent everywhere.
- Thousands separators always (`₦ 84,500`, not `₦ 84500`).
- Totals — the number the shop owner cares about most — get the heaviest visual weight on any screen (largest, boldest, often in `text/primary` or on a green surface).

---

## 6. Spacing, shape & elevation

### 6.1 Spacing scale
Use the scale, not arbitrary values: **2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80**. Generous whitespace is part of the "effortless" feel — when unsure, add more space, not less.

### 6.2 Corner radius (soft & rounded — the SaleBook feel)
| Token | Value | Use |
|-------|-------|-----|
| sm | 6 | small chips, tags |
| md | 10 | buttons, inputs |
| lg | 14 | cards, option cards |
| xl | 20 | pricing cards, large surfaces |
| 2xl | 28 | hero / feature panels |
| full | 999 | pills, toggles, avatars |

Rounded, friendly corners are core to the brand. Sharp 0px corners are off-brand.

### 6.3 Elevation (shadows)
Soft, subtle, green-tinted shadows — four levels: **sm, md, lg, xl**. Shadows suggest gentle lift, never harsh drop. Use `md` for cards, `lg` for popovers/modals, `xl` for the rare hero element. Flat (no shadow) is fine and often better — don't shadow everything.

---

## 7. Components — how they should feel

The Figma component library is the source of truth; these are the principles behind them.

- **Buttons** — soft-rounded (radius md), comfortable padding, 48px tall on desktop with a 44px+ touch target always. Primary = solid green + white text. Secondary = white with a border. Ghost = green text, no fill. Google sign-in = white with border + Google mark.
- **Inputs** — clear label above, generous 48–52px field height, soft border that turns **green on focus** and **red on error**, helper text below. Placeholder in muted grey, real value in primary text.
- **Cards** — white surface (light) / neutral-800 (dark), soft border, lg radius, roomy padding.
- **Responsiveness** — buttons and inputs are single adaptive components (auto-layout), not separate size copies. They fill or hug to fit **1440 (web) / 834 (tablet) / 393 (mobile)**. On mobile, primary buttons typically go full-width; touch targets never drop below 44px.

---

## 8. Voice & tone

How SaleBook *sounds* is as much the brand as how it looks.

- **Plain, friendly, direct.** "Log a sale," not "Initiate transaction record." Talk like a helpful person, not a system.
- **Short.** The user is busy. One idea per sentence.
- **Encouraging, never condescending.** "You sold ₦84,500 today" celebrates without gushing. Never "simply," "just," or "easy" — they presume and can condescend.
- **Active and verb-first on buttons.** "Get started," "Add sale," "Choose your theme." Not "OK," "Submit," "Click here."
- **Errors say what happened + what to do**, no blame, no jargon: "That shop name's already taken. Try another."
- **No exclamation marks on system messages** (reads as shouty). Save warmth for genuine moments ("You're all set, Ada.").

---

## 9. Imagery & illustration

- Favour **clean product screenshots** (the app doing its job) over stock photos, à la modern SaaS landing pages.
- If photos are used: real, warm, relatable — a real small shop, real hands, real products. Not glossy corporate stock.
- Illustrations/icons: the **outline icon style** (24px, ~2px stroke, rounded caps) — consistent, light, friendly. Icons inherit theme colour; they're never multicolour clip-art.

---

## 10. Quick do / don't

**Do**
- Lead with green for actions and identity; keep everything else calm and neutral.
- Use the semantic tokens, not raw hex.
- Keep one clear primary action per screen.
- Give things room to breathe.
- Write like a friendly human.

**Don't**
- Flood screens with green or use the electric lime as primary.
- Use pure black text on green, or low-contrast grey on grey.
- Mix in fonts outside DM Sans + Inter.
- Use sharp 0px corners or heavy drop shadows.
- Title Case or shout in ALL CAPS.

---

*This is a living document. As SaleBook grows, update it here first, then the Figma library, then the code — in that order, so the source of truth stays consistent.*
