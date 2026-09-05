import { getCurrentShopContext } from "@/lib/shop-context";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const { supabase, profile } = await getCurrentShopContext();

  const { data: staff } = await supabase
    .from("profiles")
    .select("id, name, role")
    .eq("shop_id", profile.shop_id)
    .order("role", { ascending: false });

  return (
    <SettingsClient
      staff={staff ?? []}
      currentUserId={profile.id}
      isOwner={profile.role === "owner"}
    />
  );
}
