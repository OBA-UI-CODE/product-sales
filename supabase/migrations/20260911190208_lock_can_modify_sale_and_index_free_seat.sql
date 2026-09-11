/*
  Two findings from Supabase's advisors, 11 September 2026.

  can_modify_sale() was the one SECURITY DEFINER function a signed-out
  visitor could call (/rest/v1/rpc/can_modify_sale). It could not leak or
  change anything, since with no user it always answers false, but nothing
  signed-out has any reason to call it, so it is locked like the rest.

  shops.free_staff_seat is a foreign key to profiles with no index, so
  deleting a profile scanned shops to check it. Tiny today; indexed so it
  stays that way.
*/
revoke execute on function public.can_modify_sale(public.sales) from public, anon;
grant execute on function public.can_modify_sale(public.sales) to authenticated;

create index if not exists shops_free_staff_seat_idx
  on public.shops (free_staff_seat)
  where free_staff_seat is not null;
