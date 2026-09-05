export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-canvas)] px-4">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-4 text-center">
        <span className="font-heading text-2xl font-bold text-[var(--color-primary)]">
          Reko
        </span>
        <h1 className="font-heading text-2xl font-bold">Check your email</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          We&apos;ve sent a confirmation link to your email address. Click it to
          verify your account and start setting up your shop.
        </p>
      </div>
    </div>
  );
}
