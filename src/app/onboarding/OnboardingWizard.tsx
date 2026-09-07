"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "./actions";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import CategoryStep from "@/components/onboarding/CategoryStep";
import ShopDetailsStep from "@/components/onboarding/ShopDetailsStep";
import ThemeStep from "@/components/onboarding/ThemeStep";
import DoneStep from "@/components/onboarding/DoneStep";
import { THEME_COLORS } from "@/components/onboarding/ColourSwatch";

/*
  Onboarding wizard — the five screens in the "Onboarding" sections of the
  Figma file, in the order the file lays them out:

    1  welcome            191:2007
    2  what are you into  196:2176
    3  shop details       197:2328
    4  accent colour      197:2616
    5  you're all set     198:2825

  The old wizard had a sixth "first product" screen. There is no such screen in
  the design, so it is gone from the flow; completeOnboarding still accepts the
  optional product arguments and simply receives none.

  The RPC is called on step 4's "Done" and, once it resolves, the wizard shows
  step 5 rather than jumping to the dashboard — the confirmation screen is part
  of the design and the user leaves it through "Go to shop".
*/

export default function OnboardingWizard({
  initialOwnerName = "",
}: {
  initialOwnerName?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [ownerName, setOwnerName] = useState(initialOwnerName);
  const [shopName, setShopName] = useState("");
  const [staffCount, setStaffCount] = useState("");
  const [category, setCategory] = useState("");
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0]);

  function handleChange(
    field: "ownerName" | "shopName" | "staffCount",
    value: string
  ) {
    setError(null);
    if (field === "ownerName") setOwnerName(value);
    else if (field === "shopName") setShopName(value);
    else setStaffCount(value);
  }

  function finish() {
    setError(null);
    startTransition(async () => {
      const result = await completeOnboarding({
        ownerName: ownerName.trim(),
        shopName: shopName.trim(),
        category,
        themeColor,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setStep(5);
    });
  }

  /*
    The screens are full-bleed and carry no error slot of their own, so a
    failed RPC is surfaced as a fixed banner rather than by pushing the layout
    around.
  */
  const errorBanner = error ? (
    <p
      role="alert"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-[553px] rounded-md bg-danger-bg px-4 py-3 text-center font-body text-[14px] leading-[20px] text-danger"
    >
      {error}
    </p>
  ) : null;

  return (
    <>
      {step === 1 && (
        <WelcomeStep
          ownerName={ownerName}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <CategoryStep
          category={category}
          onSelect={setCategory}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <ShopDetailsStep
          ownerName={ownerName}
          shopName={shopName}
          staffCount={staffCount}
          onChange={handleChange}
          onNext={() => setStep(4)}
        />
      )}

      {step === 4 && (
        <ThemeStep
          themeColor={themeColor}
          onSelect={setThemeColor}
          onDone={finish}
          pending={pending}
        />
      )}

      {step === 5 && <DoneStep onDone={() => router.push("/dashboard")} />}

      {errorBanner}
    </>
  );
}
