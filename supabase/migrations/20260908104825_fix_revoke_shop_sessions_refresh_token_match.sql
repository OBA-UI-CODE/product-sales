/*
  auth.refresh_tokens.user_id is a VARCHAR holding the user's uuid as text —
  not the email, and not a uuid column. The first version of this function
  joined on auth.users.email, which matched nothing, so refresh tokens
  survived and a signed-out session could quietly renew itself.
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

  delete from auth.refresh_tokens
  where user_id in (
    select id::text from profiles where shop_id = target_shop
  );

  return revoked;
end;
$$;

revoke execute on function public.revoke_shop_sessions(uuid) from public;
revoke execute on function public.revoke_shop_sessions(uuid) from anon, authenticated;
grant execute on function public.revoke_shop_sessions(uuid) to service_role;
