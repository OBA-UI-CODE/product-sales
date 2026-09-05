"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "./actions";

const CATEGORIES = [
  "Beauty & cosmetics",
  "Fashion & accessories",
  "Provisions & groceries",
  "Electronics",
  "General store",
];

const THEME_COLORS = [
  { name: "Emerald", value: "#1D9E75" },
  { name: "Blue", value: "#3366E6" },
  { name: "Purple", value: "#8C40D9" },
  { name: "Amber", value: "#D95933" },
  { name: "Magenta", value: "#CC3366" },
];

const TOTAL_STEPS = 5;

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all ${
            i + 1 === current
              ? "w-6 bg-[var(--color-primary)]"
              : "w-2 bg-[var(--color-border)]"
          }`}
        />
      ))}
    </div>
  );
}

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [ownerName, setOwnerName] = useState("");
  const [shopName, setShopName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0].value);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");

  function next() {
    setError(null);
    if (step === 2 && (!ownerName.trim() || !shopName.trim())) {
      setError("Please fill in your name and shop name.");
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function finish(includeProduct: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await completeOnboarding({
        ownerName,
        shopName,
        category,
        themeColor,
        firstProductName: includeProduct ? productName : undefined,
        firstProductPrice: includeProduct && productPrice ? Number(productPrice) : undefined,
        firstProductStock: includeProduct && productStock ? Number(productStock) : undefined,
      });
      if (result.error) {
        setError(result.error);
      }
      // On success, completeOnboarding redirects server-side.
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-7 bg-[var(--color-bg-canvas)] px-4 py-12">
      <StepDots current={step} />

      {error && (
        <p className="w-full max-w-[440px] rounded-xl bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}

      {step === 1 && (
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="font-heading text-2xl font-bold text-[var(--color-primary)]">
            Reko
          </span>
          <h1 className="font-heading text-4xl font-bold">Welcome to Reko</h1>
          <p className="max-w-[380px] text-[var(--color-text-secondary)]">
            Let&apos;s set up your shop. This takes about five minutes.
          </p>
          <button
            onClick={next}
            className="rounded-xl bg-[var(--color-primary)] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
          >
            Get Started
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex w-full max-w-[440px] flex-col gap-5">
          <h1 className="font-heading text-center text-2xl font-bold">
            Tell us about your shop
          </h1>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Owner name</label>
            <input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g. Ngozi Eze"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Shop name</label>
            <input
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g. T-Max Store"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">What do you sell?</label>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                    category === c
                      ? "border-[var(--color-primary)] bg-[var(--color-success-bg)] text-[var(--color-primary)]"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={next}
            className="rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
          >
            Continue
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="flex w-full max-w-[440px] flex-col items-center gap-5">
          <h1 className="font-heading text-center text-2xl font-bold">
            Make it yours
          </h1>
          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            Pick an accent colour for your dashboard. You can change this anytime.
          </p>
          <div className="flex gap-4">
            {THEME_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                aria-label={c.name}
                onClick={() => setThemeColor(c.value)}
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 transition"
                style={{
                  borderColor: themeColor === c.value ? "#fff" : "transparent",
                }}
              >
                <span
                  className="h-10 w-10 rounded-full"
                  style={{ backgroundColor: c.value }}
                />
              </button>
            ))}
          </div>
          <button
            onClick={next}
            className="rounded-xl bg-[var(--color-primary)] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
          >
            Continue
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="flex w-full max-w-[440px] flex-col gap-5">
          <h1 className="font-heading text-center text-2xl font-bold">
            Add your first product
          </h1>
          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            Optional — you can always add products later from your dashboard.
          </p>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Product name</label>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Brazilian weave-on"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Price (₦)</label>
            <input
              type="number"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              placeholder="15000"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Starting stock</label>
            <input
              type="number"
              value={productStock}
              onChange={(e) => setProductStock(e.target.value)}
              placeholder="10"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setProductName("");
                setStep(5);
              }}
              className="flex-1 rounded-xl border border-[var(--color-border)] py-3 text-sm font-semibold transition hover:bg-[var(--color-bg-surface)] disabled:opacity-50"
            >
              Skip for now
            </button>
            <button
              type="button"
              disabled={pending || !productName.trim()}
              onClick={() => setStep(5)}
              className="flex-1 rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
            >
              Add & continue
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-2xl text-white">
            ✓
          </div>
          <h1 className="font-heading text-3xl font-bold">You&apos;re all set!</h1>
          <p className="max-w-[380px] text-[var(--color-text-secondary)]">
            Your shop is ready. Start logging sales and watch your numbers grow.
          </p>
          <button
            disabled={pending}
            onClick={() => finish(Boolean(productName.trim()))}
            className="rounded-xl bg-[var(--color-primary)] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
          >
            {pending ? "Setting up your shop..." : "Go to Dashboard"}
          </button>
        </div>
      )}
    </div>
  );
}
