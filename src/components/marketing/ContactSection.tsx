"use client";

import { useActionState } from "react";
import { submitContactForm, type ContactFormState } from "@/app/(marketing)/contact/actions";

/*
  Contact — Figma nodes:
    web    146:9352 (1440x651) row, gap 48, px 120 py 72 · left flex-1 · form 416
    tablet 146:9482 (835x557)  row, gap 59, px 48  py 25 · form 318
    mobile 146:9594 (393x928)  column, gap 24, inset 16/24 · form 318

  Section sits on bg/surface. Heading is 72/87 on web and 64/77 on both tablet
  and mobile; the body copy stays 18/22 at every breakpoint.

  Form panel: r24, clipped. Body on bg/canvas with 24px padding and 20px between
  fields; each field is a 14/17 label over a 44px pill input (bg/surface, 1px
  border/strong, radius-full). The Message field is 120 tall with a 16px radius.
  The footer bar sits on bg/surface-raised above a 1px rgba(255,255,255,0.05)
  rule.

  Two deliberate deviations from the file, both flagged:
  1. Placeholders are set in "Geist" in Figma — a font that appears nowhere else
     in the design and is almost certainly left over from a pasted form
     component. Inter is used instead, matching every other input on the site.
  2. The Message field's placeholder in the file reads "Email address", a
     copy/paste slip. "Message" is used so the field is not mislabelled.

  The submit handler is the existing server action, which stores submissions in
  the contact_messages table.
*/

const INQUIRY_TYPES = [
  "General inquiry",
  "Sales",
  "Support",
  "Billing",
  "Feedback",
];

const LABEL =
  "w-full font-heading text-[14px] font-semibold leading-[17px] tracking-[-1px] text-text-secondary";
const FIELD =
  "h-11 w-full rounded-full border border-border-strong bg-bg-surface px-4 py-2 font-body text-[16px] leading-[24px] tracking-[0.32px] text-text-primary placeholder:text-text-muted focus:border-primary-border focus:outline-none";

export default function ContactSection() {
  const [state, formAction, pending] = useActionState<ContactFormState, FormData>(
    submitContactForm,
    {}
  );

  return (
    <section className="w-full bg-bg-surface px-4 py-6 tab:px-12 tab:py-[25px] web:px-[120px] web:py-[72px]">
      <div className="flex flex-col items-center gap-6 tab:flex-row tab:items-center tab:gap-[59px] web:items-start web:gap-12">
        {/* Copy */}
        {/*
          shrink-0 only from tablet up. On mobile it stopped this column
          shrinking below its content, so on a 360px phone the copy stayed
          361px wide, overflowed the section's 16px padding, and both the
          heading and the paragraph ended up flush against the screen edges.
          Allowed to shrink, the heading wraps and everything keeps its
          margin. Figma's mobile frame (146:9595) is 361 wide inside 16px
          padding, which is exactly what this now produces at 393.
        */}
        <div className="flex flex-col items-start gap-6 py-20 tab:shrink-0 tab:gap-7 web:min-w-px web:flex-1">
          <h1 className="font-heading text-[64px] font-semibold leading-[77px] tracking-[-1px] text-text-strong web:w-[560px] web:text-[72px] web:leading-[87px]">
            Get in Touch
          </h1>
          <p className="w-full font-heading text-[18px] font-semibold leading-[22px] tracking-[-1px] text-text-sub tab:w-[361px] web:w-full">
            We’re here to help! Whether you have questions, need support, or want
            to share feedback, drop us a message and our team will respond
            promptly
          </p>
        </div>

        {/* Form panel */}
        <form
          action={formAction}
          className="flex w-[318px] max-w-full shrink-0 flex-col items-start justify-end overflow-hidden rounded-md web:w-[416px]"
        >
          <div className="flex w-full flex-col items-center bg-bg-canvas p-6">
            <div className="flex w-full flex-col items-start gap-5">
              <div className="flex w-full flex-col items-start justify-center gap-1">
                <label htmlFor="name" className={LABEL}>
                  Name
                </label>
                <input id="name" name="name" type="text" placeholder="Name" required className={FIELD} />
              </div>

              <div className="flex w-full flex-col items-start justify-center gap-1">
                <label htmlFor="email" className={LABEL}>
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  required
                  className={FIELD}
                />
              </div>

              <div className="flex w-full flex-col items-start justify-center gap-1">
                <label htmlFor="inquiryType" className={LABEL}>
                  Inquiry type
                </label>
                <select
                  id="inquiryType"
                  name="inquiryType"
                  defaultValue={INQUIRY_TYPES[0]}
                  className={FIELD}
                >
                  {INQUIRY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex h-[120px] w-full flex-col items-start justify-center gap-1">
                <label htmlFor="message" className={LABEL}>
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Message"
                  required
                  className="min-h-px w-full flex-1 resize-none rounded-md border border-border-strong bg-bg-surface px-4 py-3 font-body text-[16px] leading-[24px] tracking-[0.32px] text-text-primary placeholder:text-text-muted focus:border-primary-border focus:outline-none"
                />
              </div>
            </div>

            {state.error && (
              <p className="mt-4 w-full font-body text-[14px] leading-[20px] text-danger">
                {state.error}
              </p>
            )}
            {state.success && (
              <p className="mt-4 w-full font-body text-[14px] leading-[20px] text-primary-text">
                Thanks, your message is with us. We’ll get back to you shortly.
              </p>
            )}
          </div>

          <div className="flex w-full items-center justify-center overflow-hidden border-t border-stroke-soft bg-bg-surface-raised px-6 pb-6 pt-3 web:justify-end">
            <button
              type="submit"
              disabled={pending}
              className="press flex h-12 min-h-12 w-full items-center justify-center whitespace-nowrap rounded-md bg-primary-default px-6 font-heading text-[20px] font-semibold leading-[24px] tracking-[-1px] text-text-on-primary disabled:opacity-70"
            >
              {pending ? "Sending…" : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
