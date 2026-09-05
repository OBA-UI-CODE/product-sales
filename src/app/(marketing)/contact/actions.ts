"use server";

import { createClient } from "@/lib/supabase/server";

export interface ContactFormState {
  error?: string;
  success?: boolean;
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const inquiryType = formData.get("inquiryType") as string;
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !message) {
    return { error: "Please fill in every field." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    inquiry_type: inquiryType || "General inquiry",
    message,
  });

  if (error) {
    return { error: "Couldn't send your message. Please try again." };
  }

  return { success: true };
}
