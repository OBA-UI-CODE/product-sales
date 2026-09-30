"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface OnboardingData {
  ownerName: string;
  shopName: string;
  categories: string[];
  themeColor: string;
  firstProductName?: string;
  firstProductPrice?: number;
  firstProductStock?: number;
}

export interface OnboardingState {
  error?: string;
  ok?: boolean;
}

export async function completeOnboarding(
  data: OnboardingData
): Promise<OnboardingState> {
  const ownerName = data.ownerName.trim();
  const shopName = data.shopName.trim();
  const categories = data.categories.map((category) => category.trim()).filter(Boolean);
  const firstProductName = data.firstProductName?.trim();

  if (!ownerName || ownerName.length > 200) {
    return { error: "Enter your name (up to 200 characters)." };
  }
  if (!shopName || shopName.length > 200) {
    return { error: "Enter a shop name (up to 200 characters)." };
  }
  if (
    categories.length === 0 ||
    categories.length > 20 ||
    categories.some((category) => category.length > 100)
  ) {
    return { error: "Choose at least one valid shop category." };
  }
  if (!/^#[0-9a-f]{6}$/i.test(data.themeColor)) {
    return { error: "Choose a valid theme colour." };
  }
  if (firstProductName && firstProductName.length > 200) {
    return { error: "The product name is too long." };
  }
  if (
    (data.firstProductPrice != null &&
      (!Number.isFinite(data.firstProductPrice) || data.firstProductPrice < 0)) ||
    (data.firstProductStock != null &&
      (!Number.isSafeInteger(data.firstProductStock) || data.firstProductStock < 0))
  ) {
    return { error: "Product price and stock cannot be negative." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.rpc("complete_onboarding", {
    p_owner_name: ownerName,
    p_shop_name: shopName,
    p_categories: categories,
    p_theme_color: data.themeColor,
    p_first_product_name: firstProductName || null,
    p_first_product_price: data.firstProductPrice ?? null,
    p_first_product_stock: data.firstProductStock ?? null,
  });

  if (error) {
    return { error: error.message };
  }

  /*
    Deliberately does NOT redirect. The design ends on a confirmation step
    ("You're all set!", Figma 198:2826) that the wizard shows after this
    resolves, and the user leaves it via its own "Go to shop" button. The RPC
    call itself is unchanged.
  */
  return { ok: true };
}
