/*
  Turning reminders on saves the device with an upsert (insert, or update if
  this phone is already known), and the on/off switches upsert
  notification_prefs. An upsert needs UPDATE as well as INSERT, which the
  first migration did not grant, so both failed. Found by testing the
  Settings flow end to end before anyone used it.

  Each user may update only their own rows, and the check keeps them there:
  a row cannot be moved to another user or another shop.
*/
grant update on public.push_subscriptions to authenticated;
create policy "users update their own devices" on public.push_subscriptions
  for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and shop_id = (select public.current_shop_id()));

grant update on public.notification_prefs to authenticated;
drop policy if exists "users change their own reminder settings" on public.notification_prefs;
create policy "users change their own reminder settings" on public.notification_prefs
  for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
