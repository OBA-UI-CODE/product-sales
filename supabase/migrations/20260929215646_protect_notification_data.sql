/*
  Push endpoints include device-specific authentication material and reminder
  preferences are private account data. Only signed-in users should reach
  these tables; RLS then limits each user to their own rows.
*/

alter policy "users create their own reminder settings"
  on public.notification_prefs
  to authenticated
  with check (user_id = (select auth.uid()));

alter policy "users read their own reminder settings"
  on public.notification_prefs
  to authenticated
  using (user_id = (select auth.uid()));

alter policy "users change their own reminder settings"
  on public.notification_prefs
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

alter policy "users add their own devices, for their own shop"
  on public.push_subscriptions
  to authenticated
  with check (
    user_id = (select auth.uid())
    and shop_id = (select public.current_shop_id())
  );

alter policy "users see their own devices"
  on public.push_subscriptions
  to authenticated
  using (user_id = (select auth.uid()));

alter policy "users update their own devices"
  on public.push_subscriptions
  to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and shop_id = (select public.current_shop_id())
  );

alter policy "users remove their own devices"
  on public.push_subscriptions
  to authenticated
  using (user_id = (select auth.uid()));

revoke all privileges on table public.notification_prefs from anon;
revoke all privileges on table public.push_subscriptions from anon;

/* Keep only the operations used by the authenticated settings experience. */
revoke truncate, references, trigger
  on table public.notification_prefs
  from authenticated;
revoke truncate, references, trigger
  on table public.push_subscriptions
  from authenticated;

grant select, insert, update
  on table public.notification_prefs
  to authenticated;
grant select, insert, update, delete
  on table public.push_subscriptions
  to authenticated;

