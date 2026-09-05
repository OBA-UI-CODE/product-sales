export default function ContactPage() {
  return (
    <section className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-16 lg:flex-row lg:justify-between lg:gap-12 lg:py-20">
      <div className="flex flex-col gap-7 lg:max-w-[736px]">
        <h1 className="font-heading text-[56px] font-semibold leading-tight lg:text-[72px]">
          Get in Touch
        </h1>
        <p className="max-w-[736px] text-base text-[var(--color-text-secondary)] md:text-lg md:font-heading md:font-semibold">
          We&apos;re here to help! Whether you have questions, need support,
          or want to share feedback, drop us a message and our team will
          respond promptly
        </p>
      </div>

      <form className="flex w-full flex-col gap-7 lg:w-[416px] lg:shrink-0">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="font-heading text-sm font-semibold">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Name"
            className="h-11 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 text-base outline-none focus:border-[var(--color-primary-hover)]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="font-heading text-sm font-semibold">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="Email address"
            className="h-11 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 text-base outline-none focus:border-[var(--color-primary-hover)]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="inquiryType" className="font-heading text-sm font-semibold">
            Inquiry type
          </label>
          <select
            id="inquiryType"
            name="inquiryType"
            defaultValue="General inquiry"
            className="h-11 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 text-base outline-none focus:border-[var(--color-primary-hover)]"
          >
            <option>General inquiry</option>
            <option>Billing</option>
            <option>Technical support</option>
            <option>Partnership</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="message" className="font-heading text-sm font-semibold">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            placeholder="Your message"
            className="rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-base outline-none focus:border-[var(--color-primary-hover)]"
          />
        </div>

        <button
          type="submit"
          className="flex h-12 items-center justify-center rounded-[10px] bg-[var(--color-primary)] font-heading text-xl font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
        >
          Send Message
        </button>
      </form>
    </section>
  );
}
