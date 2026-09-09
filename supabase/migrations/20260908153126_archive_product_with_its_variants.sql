/*
  Removing a product must remove its sizes too.

  deleteProduct archived only the product row, so its variants stayed active
  forever — still holding stock, still belonging to a shop, but attached to a
  product that no longer exists as far as the app is concerned. Nothing wrong
  was ever shown to a shop owner, because the Add Sale picker builds its list
  by walking products and the Products page filters archived products out. But
  the rows accumulate, carry phantom stock, and make the data hard to trust.

  Done in one function so the two archives cannot half-happen: a product left
  visible with no sizes, or sizes with no product, are both worse than either
  outcome on its own.

  Archived, not deleted, for the same reason as before — past sales point at
  these rows and removing them would rewrite the record of what was sold.
*/
create or replace function public.archive_product(p_product_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_shop uuid := current_shop_id();
  v_now timestamptz := now();
begin
  if v_shop is null then
    raise exception 'Not authenticated';
  end if;

  if not shop_can_write() then
    raise exception 'This shop is read-only. Subscribe to make changes.';
  end if;

  -- Ownership is re-checked here rather than trusted from the caller: this is
  -- SECURITY DEFINER, so RLS does not apply inside it.
  if not exists (
    select 1 from products
    where id = p_product_id and shop_id = v_shop
  ) then
    raise exception 'That product is not in your shop';
  end if;

  update product_variants
  set archived_at = v_now
  where product_id = p_product_id
    and shop_id = v_shop
    and archived_at is null;

  update products
  set archived_at = v_now
  where id = p_product_id
    and shop_id = v_shop;
end;
$$;

revoke execute on function public.archive_product(uuid) from public;
revoke execute on function public.archive_product(uuid) from anon;
grant execute on function public.archive_product(uuid) to authenticated, service_role;

/*
  Tidy up what the old behaviour left behind: sizes still marked active whose
  product is already archived. Their product's archive time is used, so the
  history reads as though they had always gone together.
*/
update product_variants v
set archived_at = p.archived_at
from products p
where p.id = v.product_id
  and p.archived_at is not null
  and v.archived_at is null;
