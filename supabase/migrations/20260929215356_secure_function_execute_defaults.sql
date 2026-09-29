/*
  PostgreSQL grants EXECUTE on new functions broadly unless the default ACL is
  tightened. In an exposed Supabase schema, that can turn an internal
  SECURITY DEFINER helper into an API endpoint by accident.

  New RPCs must now receive an explicit grant in the migration that creates
  them. Existing customer-facing RPC grants are unchanged.
*/

alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;

/*
  These helpers are implementation details. Customer-facing SECURITY DEFINER
  RPCs execute as their owner and can still call them; browser clients cannot.
*/
revoke execute on function public.can_modify_sale(public.sales)
  from public, anon, authenticated;

revoke execute on function public.shop_can_write()
  from public, anon, authenticated;

