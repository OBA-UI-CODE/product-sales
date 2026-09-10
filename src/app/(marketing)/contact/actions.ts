"use server";

import { createClient } from "@/lib/supabase/server";
import { SUPPORT_EMAIL } from "@/lib/site";

export interface ContactFormState {
  error?: string;
  success?: boolean;
}

/*
  Messages were only ever saved to contact_messages, and nothing told anyone
  one had arrived, so people who wrote in were never answered. Each one is
  now also emailed to SUPPORT_EMAIL through Resend, with Reply-To set to the
  sender so answering is one tap.

  The database copy is still the record: if the email fails (no Resend key,
  Resend down), the message is kept and the sender is still told it was
  sent, because it was. A cap stops a spam run from flooding the inbox; past
  it, messages are saved but not emailed.
*/
const MAX_EMAILS_PER_HOUR = 20;
let emailsThisHour = 0;
let emailHour = new Date().getUTCHours();

async function emailToSupport(msg: {
  name: string;
  email: string;
  inquiryType: string;
  message: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;

  const hour = new Date().getUTCHours();
  if (hour !== emailHour) {
    emailHour = hour;
    emailsThisHour = 0;
  }
  if (emailsThisHour >= MAX_EMAILS_PER_HOUR) return;
  emailsThisHour++;

  /* Only a plausible address goes into Reply-To; anything else would make
     Resend refuse the whole email. */
  const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg.email) ? [msg.email] : undefined;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM ?? "JOHTA Contact <contact@johta.click>",
        to: [process.env.CONTACT_EMAIL ?? SUPPORT_EMAIL],
        reply_to: replyTo,
        subject: `[JOHTA contact] ${msg.inquiryType}: ${msg.name}`.slice(0, 120),
        text: [
          `From: ${msg.name} <${msg.email}>`,
          `About: ${msg.inquiryType}`,
          "",
          msg.message,
          "",
          "Sent from the contact form on johta.click. Reply to this email to answer them.",
        ].join("\n"),
      }),
      cache: "no-store",
    });
  } catch {
    /* Saved already; the email is a convenience. */
  }
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const inquiryType = (formData.get("inquiryType") as string) || "General inquiry";
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !message) {
    return { error: "Please fill in every field." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    inquiry_type: inquiryType,
    message,
  });

  if (error) {
    return { error: "Couldn't send your message. Please try again." };
  }

  await emailToSupport({
    name: name.slice(0, 200),
    email: email.slice(0, 200),
    inquiryType: inquiryType.slice(0, 100),
    message: message.slice(0, 5000),
  });

  return { success: true };
}
