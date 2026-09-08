"use client";

import { useEffect } from "react";

/*
  Reveals sections as they scroll into view.

  Mounted once in the marketing layout rather than wrapping each section in
  its own client component. The sections stay server components, nothing extra
  ships for them, and adding the effect to a new section is a `data-reveal`
  attribute rather than a client boundary.

  ---------------------------------------------------------------------------
  Why this does NOT use IntersectionObserver

  It did, and it had a bug that left sections permanently blank.

  IntersectionObserver only reports when intersection CHANGES. Scroll far
  enough in one movement — a fast fling, an anchor link, the End key, a
  restored scroll position — and a section goes from "below the viewport" to
  "above the viewport" without ever being inside it. isIntersecting was false
  before and false after, so no callback ever fires, and that section stays at
  opacity 0 for the rest of the visit. Measured: jumping to 4000px left the
  About section at top:-2609 and opacity:0, with no way to recover it.

  A position check on scroll cannot miss that, because it asks "is this above
  the fold NOW", not "did it just cross a boundary".

  ---------------------------------------------------------------------------
  Why it is cheap anyway

  · Work is proportional to what is still hidden, and the list shrinks as
    sections reveal. On a page of a dozen sections it is empty within a screen
    or two of scrolling.
  · Reads are batched inside one requestAnimationFrame, so scrolling never
    triggers more than one measurement per frame.
  · The listeners remove themselves once nothing is left to reveal, so a
    reader who scrolls to the bottom pays nothing for the rest of the visit.
  · The listeners are passive, so they cannot delay scrolling.

  Progressive enhancement is the other half: the CSS that hides a section is
  scoped to `.reveal-on`, and only this file adds that class. If the script
  fails, is blocked, or has not run yet, every section is simply visible.
  Reduced motion is handled in CSS so there is one place that decides it.
*/
export default function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    let pending = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.revealed)")
    );
    if (pending.length === 0) return;

    root.classList.add("reveal-on");

    let frame = 0;

    function sweep() {
      frame = 0;
      /* Slightly inside the viewport, so a section has finished arriving by
         the time it is properly on screen rather than animating under the
         reader's eyes. */
      const line = window.innerHeight * 0.92;
      const remaining: HTMLElement[] = [];

      for (const el of pending) {
        if (el.getBoundingClientRect().top < line) {
          el.classList.add("revealed");
        } else {
          remaining.push(el);
        }
      }

      pending = remaining;
      if (pending.length === 0) stop();
    }

    function schedule() {
      if (frame === 0) frame = requestAnimationFrame(sweep);
    }

    function stop() {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    /* Reveals whatever is already on screen, including anything the browser
       restored a scroll position into. */
    sweep();

    return () => {
      stop();
      root.classList.remove("reveal-on");
    };
  }, []);

  return null;
}
