/*
  Free and paid plans.

  Until now a shop was either writable (trial, or paid) or read-only. From
  here there are two plans, and an expired trial lands on Free instead of
  being locked:

    Free   log sales, products, stock, sizes and packs, low-stock warnings,
           debts, ONE staff account, the last 30 days of sales history,
           pause and delete.
    Paid   everything in Free, plus receipts, unlimited staff, all of the
           sales history, and downloading the shop's records.
           Monthly and yearly are the same plan, paid differently.

  A new shop's one-month trial counts as Paid.

  Nothing on a paid feature is ever deleted when a shop drops to Free. Old
  sales are hidden, extra staff are paused, and all of it returns the moment
  the shop subscribes again.

  What is enforced HERE, in the database, so it cannot be skipped by calling
  the API directly:
    · the one-staff limit (trigger on profiles)
    · paused staff cannot write (shop_can_write)
    · the 30-day history window (sales select policy)
  Receipts and the download are server routes; they check
  current_shop_is_paid() themselves.
*/

-- ------------------------------------------------------------------ plan

/*
  THE definition of "paid". Every other check calls this, so the rule lives in
  one place. src/lib/plan.ts mirrors it for display only; if this changes,
  change that too.

  past_due is deliberately not paid: Paystack is retrying a failed card, and
  the shop is on Free until it succeeds.
*/
create or replace function public.shop_is_paid(p_shop uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from shops s
    where s.id = p_shop
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

create or replace function public.current_shop_is_paid()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select public.shop_is_paid(public.current_shop_id());
$$;

-- ----------------------------------------------------------- staff seats

/*
  Which staff member keeps working when a shop is on Free.

  The owner can choose (free_staff_seat). If they have not, or the person
  they chose has since been removed, it is whoever was added first, so there
  is always a clear answer and it never changes by itself from one day to
  the next.
*/
alter table public.shops
  add column if not exists free_staff_seat uuid
    references public.profiles(id) on delete set null;

comment on column public.shops.free_staff_seat is
  'On the Free plan, the one staff member who keeps access. Null means the earliest-added staff member. Set only through set_free_staff_seat().';

create or replace function public.staff_seat_holder(p_shop uuid)
returns uuid
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce(
    (
      select s.free_staff_seat
      from shops s
      join profiles p on p.id = s.free_staff_seat
      where s.id = p_shop
        and p.shop_id = p_shop
        and p.role = 'staff'
        and p.removed_at is null
    ),
    (
      select p.id from profiles p
      where p.shop_id = p_shop
        and p.role = 'staff'
        and p.removed_at is null
      order by p.created_at, p.id
      limit 1
    )
  );
$$;

/* Owners always have a seat. Staff do on a paid shop, or if they hold the
   one Free seat. */
create or replace function public.current_user_has_seat()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid()
      and p.removed_at is null
      and (
        p.role = 'owner'
        or public.shop_is_paid(p.shop_id)
        or public.staff_seat_holder(p.shop_id) = p.id
      )
  );
$$;

create or replace function public.set_free_staff_seat(p_staff uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_shop uuid := public.current_shop_id();
begin
  if not public.is_owner() then
    raise exception 'Only the owner can choose who keeps access.';
  end if;

  if not exists (
    select 1 from profiles
    where id = p_staff and shop_id = v_shop
      and role = 'staff' and removed_at is null
  ) then
    raise exception 'That staff member is not in your shop.';
  end if;

  update shops set free_staff_seat = p_staff where id = v_shop;
end;
$$;

/*
  The one-staff limit. A trigger rather than a check in the server action,
  because the profile insert runs as the owner through the REST API, and an
  owner calling that API directly would otherwise walk straight past it.
*/
create or replace function public.enforce_free_staff_limit()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.role = 'staff'
     and new.removed_at is null
     and not public.shop_is_paid(new.shop_id)
     and exists (
       select 1 from profiles p
       where p.shop_id = new.shop_id
         and p.role = 'staff'
         and p.removed_at is null
         and p.id <> new.id
     )
  then
    raise exception 'The Free plan includes one staff account. Subscribe to add more.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_free_staff_limit on public.profiles;
create trigger profiles_free_staff_limit
  before insert on public.profiles
  for each row execute function public.enforce_free_staff_limit();

-- ----------------------------------------------------------- writing

/*
  Writing no longer depends on paying: a Free shop logs sales like any other.
  What still stops writes is a paused or deleted shop, and a staff member
  whose access is paused on Free.
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
      and p.removed_at is null
      and s.deactivated_at is null
      and s.deletion_requested_at is null
  )
  and public.current_user_has_seat();
$$;

/*
  The functions guarded by shop_can_write() still said "Your free trial has
  ended. Subscribe to ...". Their errors are shown to people word for word,
  and that is no longer why they would refuse. Each definition is rewritten in
  place with only that sentence changed, so nothing else about them moves.
*/
do $$
declare
  f record;
  def text;
begin
  for f in
    select p.oid
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'create_sale', 'update_sale', 'delete_sale', 'record_payment',
        'restock_product', 'restock_variant', 'archive_product'
      )
  loop
    def := pg_get_functiondef(f.oid);
    def := regexp_replace(
      def,
      '(Your free trial has ended\. Subscribe to [^'']*|This shop is read-only\. Subscribe to make changes\.)',
      'You cannot make changes right now. The shop may be paused, or your access is paused on the Free plan. Please speak to the owner.',
      'g'
    );
    execute def;
  end loop;
end;
$$;

/*
  Inserting a sale straight into the table skipped every check above, since
  the insert policy only looked at the shop. The app always goes through
  create_sale(); this closes the door for anyone who did not.
*/
drop policy if exists "shop members can insert sales" on public.sales;
create policy "shop members can insert sales" on public.sales
  for insert
  with check (
    shop_id = (select public.current_shop_id())
    and (select public.shop_can_write())
  );

-- ----------------------------------------------------------- history

/*
  Free shops see the last 30 days. Two exceptions, both so that money is never
  hidden: a sale that is still owed stays visible however old it is, because
  the debt is real whether or not the shop pays us.

  (select ...) around the function calls makes Postgres evaluate them once
  per query instead of once per row.
*/
drop policy if exists "shop members can view sales" on public.sales;
create policy "shop members can view sales" on public.sales
  for select
  using (
    shop_id = (select public.current_shop_id())
    and deleted_at is null
    and (
      (select public.current_shop_is_paid())
      or sold_at >= now() - interval '30 days'
      or amount_paid < total_price
    )
  );

-- ----------------------------------------------------------- grants

/* Internal helpers: called from inside other definer functions and
   policies, never directly by a signed-in user. shop_is_paid takes any shop
   id, so exposing it would let anyone ask about someone else's shop. */
revoke execute on function public.shop_is_paid(uuid) from public, anon, authenticated;
revoke execute on function public.staff_seat_holder(uuid) from public, anon, authenticated;
revoke execute on function public.enforce_free_staff_limit() from public, anon, authenticated;

/* The ones the app calls, only ever about the caller's own shop. */
revoke execute on function public.current_shop_is_paid() from public, anon;
revoke execute on function public.current_user_has_seat() from public, anon;
revoke execute on function public.set_free_staff_seat(uuid) from public, anon;
grant execute on function public.current_shop_is_paid() to authenticated;
grant execute on function public.current_user_has_seat() to authenticated;
grant execute on function public.set_free_staff_seat(uuid) to authenticated;

comment on column public.shops.trial_ends_at is
  'End of the one-month trial, during which the shop has every paid feature. After it, the shop is on Free unless it has subscribed.';
