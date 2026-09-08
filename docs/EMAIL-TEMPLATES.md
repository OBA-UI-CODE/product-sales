# JOHTA email templates

Paste these into **Supabase → Authentication → Email Templates**. They replace
Supabase's defaults, which say "Supabase" and point at the wrong route.

Two things have to change together:

1. **The link** must go to `/auth/confirm`, not `/auth/callback`. Email links
   carry `token_hash` + `type`; only OAuth carries a `code`. Sending them to
   the callback route was why "Confirm email address" dropped people on the
   landing page instead of onboarding.
2. **The wording** should say JOHTA, not Supabase.

---

## Confirm signup

**Subject**

```
Confirm your JOHTA account
```

**Message body**

```html
<h2 style="font-family: Helvetica, Arial, sans-serif; color: #158060;">JOHTA</h2>

<p style="font-family: Helvetica, Arial, sans-serif; font-size: 16px; color: #1a1a1a;">
  Welcome to JOHTA. Confirm your email address and your shop is ready to set up —
  it takes about five minutes.
</p>

<p style="font-family: Helvetica, Arial, sans-serif;">
  <a
    href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/onboarding"
    style="display: inline-block; background: #158060; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 16px; font-weight: 600;"
  >Confirm my email</a>
</p>

<p style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #5c5c5c;">
  Your first month is free and no card is required. If you didn't create a JOHTA
  account, you can ignore this email.
</p>
```

---

## Reset password

**Subject**

```
Reset your JOHTA password
```

**Message body**

```html
<h2 style="font-family: Helvetica, Arial, sans-serif; color: #158060;">JOHTA</h2>

<p style="font-family: Helvetica, Arial, sans-serif; font-size: 16px; color: #1a1a1a;">
  Someone asked to reset the password on your JOHTA account. Use the button
  below to choose a new one.
</p>

<p style="font-family: Helvetica, Arial, sans-serif;">
  <a
    href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password"
    style="display: inline-block; background: #158060; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 16px; font-weight: 600;"
  >Choose a new password</a>
</p>

<p style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #5c5c5c;">
  If you didn't ask for this, ignore this email and your password stays as it is.
</p>
```

---

## The sender name — where "Supabase Auth" comes from

The name in the inbox is **not** set by these templates. It comes from the SMTP
settings:

**Supabase → Project Settings → Authentication → SMTP Settings**

| Field | Value |
| --- | --- |
| Enable custom SMTP | **on** |
| Host | `smtp.resend.com` |
| Port | `587` |
| Username | `resend` |
| Password | the `re_…` Resend API key |
| Sender email | `hello@johta.click` |
| **Sender name** | **JOHTA** |

If mail still arrives from "Supabase Auth", custom SMTP is not actually enabled —
that name is Supabase's built-in sender. Enabling it is also what moves sending
onto Resend and off the few-per-hour development limit.

---

## Checking it worked

A correct signup email:

- comes from **JOHTA &lt;hello@johta.click&gt;**, not Supabase Auth
- has a button linking to `johta.click/auth/confirm?...`
- lands on the onboarding wizard, already signed in
- shows "signed-by: johta.click" in Gmail's details, meaning DKIM passed
