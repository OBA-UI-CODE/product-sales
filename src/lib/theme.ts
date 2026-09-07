import type { CSSProperties } from "react";

/*
  Turns the accent colour a shop picked during onboarding into the four
  primary tokens the app is built on.

  The design only defines one accent — the green — so rather than inventing
  four new palettes by hand, the relationships already present in that green
  are measured and reapplied to whatever colour the owner chose.

  Reading the Figma tokens as HSL:

    picked / primary-border   #1D9E75   h161  s69%  l36.7%
    primary-default           #158060   h162  s72%  l29.2%   ->  l x 0.795
    primary-text              #5DCAA5   h160  s51%  l57.8%   ->  s x 0.735, l 57.8
    primary-subtle            #062E24   h165  s77%  l10.2%   ->  s x 1.11,  l 10.2

  The hue is carried straight through, so picking the default green reproduces
  the original tokens and the dashboard looks exactly as designed. Any other
  swatch gets the same relationships: a darker fill, a light tint for text on
  dark ground, and a very dark shade for subtle backgrounds.
*/

const FALLBACK = "#1D9E75";

function hexToHsl(hex: string): [number, number, number] | null {
  const clean = hex.trim().replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;

  if (d === 0) return [0, 0, l * 100];

  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;

  h = h * 60;
  if (h < 0) h += 360;

  return [h, s * 100, l * 100];
}

const clamp = (n: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, n));

const hsl = (h: number, s: number, l: number) =>
  `hsl(${h.toFixed(1)} ${clamp(s).toFixed(1)}% ${clamp(l).toFixed(1)}%)`;

/*
  Returns the CSS custom properties to set on a wrapper element. Because the
  Tailwind utilities (bg-primary-default, text-primary-text, ...) all resolve
  to these variables, overriding them on an ancestor re-themes everything
  inside without touching a single component.
*/
export function themeVars(themeColor?: string | null): CSSProperties {
  const parsed = hexToHsl(themeColor || FALLBACK) ?? hexToHsl(FALLBACK)!;
  const [h, s, l] = parsed;

  const border = hsl(h, s, l);
  const primary = hsl(h, s * 1.04, l * 0.795);
  const text = hsl(h, s * 0.735, 57.8);
  const subtle = hsl(h, s * 1.11, 10.2);

  return {
    "--color-primary-border": border,
    "--color-primary-default": primary,
    "--color-primary-text": text,
    "--color-primary-subtle": subtle,

    /*
      The legacy aliases are re-declared here too, and this is not redundant.

      globals.css defines them as --color-primary: var(--color-primary-default)
      on :root, and custom properties are resolved where they are DECLARED, not
      where they are used — so that alias computes to the default green at
      :root and inherits down already resolved. Overriding only the new token
      names would leave every screen still on the old variable names (Sales
      History, Products, Debts, Settings, the Add Sale modal) showing green on
      a pink shop. Delete these four lines along with the legacy block itself
      once those screens are rebuilt.
    */
    "--color-primary": primary,
    "--color-primary-hover": border,
    "--color-accent-light": text,
  } as CSSProperties;
}
