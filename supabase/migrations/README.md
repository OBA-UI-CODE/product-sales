# Database migrations

Every schema change JOHTA has ever had, in order. The filename is
`<timestamp>_<name>.sql`, which is the order they were applied in.

## Why these are here

They were applied straight to the live Supabase project and, until now,
existed nowhere else. The repo described the app but not the database it
depends on, so:

- nobody reviewing the branch could see the rules that actually protect the
  data, only the code that assumes them
- a lost or recreated Supabase project could not be rebuilt from this repo
- the schema had no history alongside the code that relies on it

That last point matters most. Several of these are not schema at all but
security decisions: which columns a shop owner may write, who may edit a
sale, what a delete really does. Those belong in version control next to the
code, where they can be reviewed and blamed like anything else.

## Reading them

The interesting ones, roughly in order of how much they matter:

| File | What it decides |
| --- | --- |
| `..._enforce_read_only_after_trial` | The paywall, enforced in the database rather than the interface |
| `..._stop_owners_editing_their_own_billing_state` | Closes a bypass that let an owner grant themselves a free subscription |
| `..._staff_may_only_change_their_own_sales` | Who may edit or delete a sale, and archiving instead of deleting |
| `..._add_account_pause_and_scheduled_deletion` | Pausing, and the 30-day grace before data is destroyed |
| `..._schedule_nightly_shop_purge` | The pg_cron job that does the destroying |
| `..._optimise_rls_policy_evaluation` | Wraps policy helpers so they run once per query, not once per row |

## Applying them elsewhere

They are plain SQL and run in filename order. Against a fresh Supabase
project, `supabase db push` will apply them; by hand, run them in order.

Two are environment-specific and will need attention on a new project:
`schedule_nightly_shop_purge` needs the `pg_cron` extension available, and
the Paystack columns are only useful once the webhook is pointed at the new
deployment.
