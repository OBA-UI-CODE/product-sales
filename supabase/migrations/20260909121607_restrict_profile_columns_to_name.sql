/*
  Same class of problem as the shops grants, though far less severe.

  `authenticated` held UPDATE on every column of profiles, including role,
  shop_id and removed_at. The RLS policy limits WHO (an owner, within their own
  shop) but a policy cannot limit WHICH COLUMNS.

  Moving a profile to another shop is already blocked: with no WITH CHECK on an
  UPDATE policy, Postgres applies the USING expression to the new row as well,
  so the changed shop_id fails the same test. Verified against the live
  database — the attempt returns 403.

  What did work was an owner promoting their own staff to owner through the
  API, and clearing removed_at to revive a removed profile whose login is
  banned, leaving a profile that can never sign in.

  Neither is theft, and both are inside the owner's own shop, so this is
  tidiness rather than a breach. But role is exactly the sort of column that
  should only change through code that thinks about the consequences, and the
  app never writes any of these as the user: staff are added through an INSERT
  policy, and removal goes through the service role.
*/

revoke update on public.profiles from authenticated;
revoke update on public.profiles from anon;

/* Leaves room for an obvious future feature, "change your display name",
   without handing over role or shop membership with it. */
grant update (name) on public.profiles to authenticated;
