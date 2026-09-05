"use client";

import { useActionState } from "react";
import { submitContactForm, type ContactFormState } from "./actions";

const initialState: ContactFormState = {};

export default function ContactPage() {
  const [state, formAction, pending] = useActionState(
    submitContactForm,
    initialState
  );

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

      {state.success ? (
        <div className="flex w-full flex-col gap-3 rounded-[14px] bg-[var(--color-success-bg)] p-8 lg:w-[416px] lg:shrink-0">
          <h2 className="font-heading text-xl font-semibold text-[var(--color-success)]">
            Message sent
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Thanks for reaching out — we&apos;ll get back to you soon.
          </p>
        </div>
      ) : (
        <form
          action={formAction}
          className="flex w-full flex-col gap-7 lg:w-[416px] lg:shrink-0"
        >
          {state.error && (
            <p className="rounded-[10px] bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]">
              {state.error}
            </p>
          )}

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
            disabled={pending}
            className="flex h-12 items-center justify-center rounded-[10px] bg-[var(--color-primary)] font-heading text-xl font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
          >
            {pending ? "Sending..." : "Send Message"}
          </button>
        </form>
      )}
    </section>
  );
}
