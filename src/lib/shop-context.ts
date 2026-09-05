import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getCurrentShopContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, role, shop_id, shops(name, category)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  return { supabase, user, profile };
}
