/*
  Delivery receipts for reminders (12 September 2026).

  The server only learns that Google/Apple/Mozilla ACCEPTED a push, not that
  the phone got it. The owner's phone showed nothing for pushes the push
  service had accepted, and there was no way to tell "never reached the
  phone" (offline, battery saver) from "reached it but was hidden". The
  service worker now reports each push it receives; this is where that
  lands, per device.
*/
alter table public.push_subscriptions
  add column if not exists last_received_at timestamptz,
  add column if not exists last_received_tag text;
