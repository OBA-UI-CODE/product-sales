/*
  Signs out everybody in a shop, for real.

  There is no admin API for this: GoTrueAdminApi.signOut() takes a JWT, not a
  user id, so a server cannot revoke someone else's session through the client
  library. It has to be done in the database.

  This matters when a shop is paused or queued for deletion. An access token
  stays valid for up to an hour after it is issued, so without this a staff
  member with the app already open keeps working against the API long after
  the owner closed the shop. Deleting the sessions makes the next refresh
  fail, which is what actually ends it.
*/
create or replace function public.revoke_shop_sessions(target_shop uuid)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  revoked integer;
begin
  with victims as (
    select id from profiles where shop_id = target_shop
  ), gone as (
    delete from auth.sessions
    where user_id in (select id from victims)
    returning 1
  )
  select count(*) into revoked from gone;

  -- Older refresh tokens are not always tied to a session row.
  delete from auth.refresh_tokens
  where user_id in (
    select u.email from auth.users u
    join profiles p on p.id = u.id
    where p.shop_id = target_shop
  );

  return revoked;
end;
$$;

comment on function public.revoke_shop_sessions(uuid) is
  'Deletes every auth session belonging to a shop. Called by the server when a shop is paused or scheduled for deletion. Service role only.';

-- The server calls this with the service role key. Nobody signed in should be
-- able to sign anyone out, so EXECUTE is taken away from PUBLIC explicitly.
revoke execute on function public.revoke_shop_sessions(uuid) from public;
revoke execute on function public.revoke_shop_sessions(uuid) from anon, authenticated;
grant execute on function public.revoke_shop_sessions(uuid) to service_role;
