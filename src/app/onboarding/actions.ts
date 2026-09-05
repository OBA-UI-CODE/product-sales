"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface OnboardingData {
  ownerName: string;
  shopName: string;
  category: string;
  themeColor: string;
  firstProductName?: string;
  firstProductPrice?: number;
  firstProductStock?: number;
}

export interface OnboardingState {
  error?: string;
}

export async function completeOnboarding(
  data: OnboardingData
): Promise<OnboardingState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.rpc("complete_onboarding", {
    p_owner_name: data.ownerName,
    p_shop_name: data.shopName,
    p_category: data.category,
    p_theme_color: data.themeColor,
    p_first_product_name: data.firstProductName || null,
    p_first_product_price: data.firstProductPrice ?? null,
    p_first_product_stock: data.firstProductStock ?? null,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}
