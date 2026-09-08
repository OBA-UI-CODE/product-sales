# Why the Vercel region is pinned to Dublin

`vercel.json` sets `"regions": ["dub1"]`.

The Supabase project lives in **eu-west-1** (AWS Ireland). With no region set,
Vercel runs server functions in **iad1** (Washington DC) by default, so every
database call crossed the Atlantic and back.

That is roughly **85ms per round trip**, and a single dashboard navigation makes
several in sequence:

| Step | Round trip |
| --- | --- |
| middleware `auth.getUser()` | 1 |
| middleware profile lookup | 1 |
| page `auth.getUser()` | 1 |
| page profile + shop query | 1 |
| the page's own queries | 1-3 |

Five to seven sequential crossings is 400-600ms of pure distance, before any
query actually runs. Measured against the deployed site, pages were taking
**1.0-1.6 seconds**.

`dub1` is Vercel's Dublin region, the same city as eu-west-1, which brings each
of those round trips down to single-digit milliseconds.

## If the database ever moves

These two must stay in the same place. Moving the Supabase project to another
region without changing `vercel.json` would silently restore the old latency —
nothing would break, it would just get slow again, which is much harder to
notice than an error.
