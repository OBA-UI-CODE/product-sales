-- Pausing a shop, and deleting one with a 30-day grace period.
--
-- Two different states, deliberately kept as two columns rather than one
-- status enum, because a shop can be neither, and the questions asked of them
-- differ: "is this paused?" and "when does this get destroyed?".

alter table public.shops
  add column if not exists deactivated_at timestamptz,
  add column if not exists deletion_requested_at timestamptz,
  add column if not exists purge_after timestamptz;

comment on column public.shops.deactivated_at is
  'Set when the owner pauses the shop. Billing is cancelled and nobody can sign in, but every record is kept. Cleared when the owner reactivates.';

comment on column public.shops.deletion_requested_at is
  'Set when the owner asks for the account to be deleted. The data still exists until purge_after passes.';

comment on column public.shops.purge_after is
  'When purge_expired_shops() destroys this shop for good — 30 days after the request. Until then the owner can still change their mind.';

-- Finding the shops due for destruction must not scan the whole table.
create index if not exists shops_purge_after_idx
  on public.shops (purge_after)
  where purge_after is not null;

/*
  A paused shop, or one queued for deletion, is read-only.

  This is the same guard the paywall uses, so it is enforced for anyone calling
  the REST API directly with a valid token — not only for people using the
  interface. Reads stay allowed on purpose: the owner still needs to export
  their records and see what they are about to lose.
*/
create or replace function public.shop_can_write()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1
    from profiles p
    join shops s on s.id = p.shop_id
    where p.id = auth.uid()
      and s.deactivated_at is null
      and s.deletion_requested_at is null
      and (
        s.subscription_status = 'active'
        or (s.subscription_status = 'trialing' and s.trial_ends_at > now())
        or (
          s.subscription_status = 'canceled'
          and s.current_period_end is not null
          and s.current_period_end > now()
        )
      )
  );
$$;

/*
  Destroys every shop whose grace period has run out.

  Rows are deleted in dependency order rather than leaning on ON DELETE
  CASCADE. Several foreign keys into profiles (sales.seller_id,
  stock_adjustments.created_by, payments.recorded_by, shops.owner_id) are
  NO ACTION, so a cascade starting at shops can hit them in an order that
  raises a foreign key violation and rolls the whole thing back. Doing it
  explicitly means the order is not left to chance.

  The auth users go last. profiles.id references auth.users with CASCADE, so
  by then the profile rows are already gone and this only removes the logins.
*/
create or replace function public.purge_expired_shops()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  target uuid;
  user_ids uuid[];
  purged integer := 0;
begin
  for target in
    select id from shops
    where purge_after is not null
      and purge_after <= now()
  loop
    select array_agg(id) into user_ids from profiles where shop_id = target;

    delete from payments where shop_id = target;
    delete from sales where shop_id = target;
    delete from stock_adjustments where shop_id = target;
    delete from product_variants where shop_id = target;
    delete from products where shop_id = target;

    -- shops.owner_id -> profiles is NO ACTION, so break the link before the
    -- profile rows go.
    update shops set owner_id = null where id = target;

    delete from profiles where shop_id = target;
    delete from shops where id = target;

    if user_ids is not null then
      delete from auth.users where id = any(user_ids);
    end if;

    purged := purged + 1;
  end loop;

  return purged;
end;
$$;

comment on function public.purge_expired_shops() is
  'Permanently destroys shops past their 30-day deletion grace period. Run nightly by pg_cron.';

/*
  Nobody signed in should ever be able to call this. It is for the scheduler
  only — EXECUTE defaults to PUBLIC, so it has to be revoked explicitly.
*/
revoke execute on function public.purge_expired_shops() from public;
revoke execute on function public.purge_expired_shops() from anon, authenticated;
