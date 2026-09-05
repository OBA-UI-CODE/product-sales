import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, shop_id, shops(name)")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-canvas)] px-4">
      <div className="text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Signed in as {profile?.name ?? user.email}
        </p>
        <h1 className="mt-2 font-heading text-2xl font-bold">
          Dashboard — coming in Day 3
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Onboarding completed successfully. Shop ID: {profile?.shop_id}
        </p>
      </div>
    </div>
  );
}
