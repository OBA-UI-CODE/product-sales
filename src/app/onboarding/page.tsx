import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingWizard from "./OnboardingWizard";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // If this user already has a profile (already completed onboarding),
  // send them to their dashboard instead of letting them re-run it.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    redirect("/dashboard");
  }

  /*
    The welcome screen greets the user by name (Figma 191:2137, "Welcome to
    JOHTA, Oba"), but the name field is not collected until step 3 — so it comes
    from the metadata that sign-up stashes on the auth user, and prefills the
    step 3 field too.
  */
  const initialOwnerName =
    (user.user_metadata?.full_name as string | undefined) ?? "";

  return <OnboardingWizard initialOwnerName={initialOwnerName} />;
}
