-- Tighten grants flagged by the security advisor.
-- current_shop_id() and is_owner() are used inside RLS policies evaluated
-- in the querying (authenticated) user's context, so authenticated needs
-- EXECUTE. anon has no policies anywhere that need these, so anon (and
-- the implicit PUBLIC grant) is revoked entirely.

revoke all on function current_shop_id() from public;
revoke all on function is_owner() from public;

grant execute on function current_shop_id() to authenticated;
grant execute on function is_owner() to authenticated;

-- Explicitly revoke anon on the sale/stock/payment action functions too
-- (PUBLIC grant at creation time implicitly included anon; make it explicit
-- rather than relying on the earlier "revoke from public" alone).
revoke all on function create_sale(uuid, text, text, integer, numeric, numeric, text) from anon;
revoke all on function update_sale(uuid, integer, numeric, numeric, text) from anon;
revoke all on function delete_sale(uuid) from anon;
revoke all on function restock_product(uuid, integer, text) from anon;
revoke all on function record_payment(uuid, numeric, boolean) from anon;
