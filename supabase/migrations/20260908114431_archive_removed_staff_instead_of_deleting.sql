/*
  Removing a staff member could not work, and failed silently.

  sales.seller_id references profiles with NO ACTION, so the database refuses
  to delete anyone whose name is on a sale — which is every staff member who
  has actually sold something. Deleting the auth user failed for the same
  reason, because profiles cascades from it. The owner pressed remove, nothing
  happened, and the staff member could still sign in.

  That foreign key is right: deleting the profile would erase who sold what.
  So staff are ARCHIVED instead, exactly as products and variants already are
  for the same reason. Their name stays on past sales; their access does not.
*/

alter table public.profiles
  add column if not exists removed_at timestamptz;

comment on column public.profiles.removed_at is
  'Set when the owner removes a staff member. The row is kept so past sales still say who sold them; the login is banned and its email freed separately.';

-- The staff list filters on this on every Settings load.
create index if not exists profiles_shop_active_idx
  on public.profiles (shop_id)
  where removed_at is null;

/*
  A removed staff member has no shop.

  Belt and braces: they are banned at the auth layer and their sessions are
  revoked, so they should never reach this. But if a token did survive, this
  makes current_shop_id() return null for them, and every RLS policy built on
  it then denies the row rather than trusting the ban alone.
*/
create or replace function public.current_shop_id()
returns uuid
language sql
stable
security definer
set search_path to 'public'
as $$
  select shop_id from profiles where id = auth.uid() and removed_at is null;
$$;

/*
  Same as revoke_shop_sessions, for one person rather than a whole shop.
  Needed because auth.admin.signOut() takes a JWT, not a user id.
*/
create or replace function public.revoke_user_sessions(target_user uuid)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  revoked integer;
begin
  with gone as (
    delete from auth.sessions where user_id = target_user returning 1
  )
  select count(*) into revoked from gone;

  delete from auth.refresh_tokens where user_id = target_user::text;

  return revoked;
end;
$$;

revoke execute on function public.revoke_user_sessions(uuid) from public;
revoke execute on function public.revoke_user_sessions(uuid) from anon, authenticated;
grant execute on function public.revoke_user_sessions(uuid) to service_role;
