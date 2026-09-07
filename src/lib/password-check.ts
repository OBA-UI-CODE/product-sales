import crypto from "node:crypto";

/*
  Checks a password against Have I Been Pwned's Pwned Passwords list.

  This is the free equivalent of Supabase's "leaked password protection",
  which is only available on their paid plans. Same data source, same method.

  THE PASSWORD IS NEVER SENT ANYWHERE. It is hashed locally with SHA-1, and
  only the first FIVE characters of that hash go to the API. HIBP returns
  every hash suffix it holds beginning with those five characters — hundreds
  of them — and the comparison happens here. That is HIBP's documented
  k-anonymity model: they cannot tell which password was being checked, and
  they never receive enough to work it out.

  SHA-1 is not a security choice here. It is simply the digest HIBP indexes
  its corpus by; the hash is a lookup key, not a stored credential.

  Server-only: this must never run in the browser, or the password would be
  hashed client-side and the API called from the user's machine.
*/

const API = "https://api.pwnedpasswords.com/range";

export interface PwnedResult {
  pwned: boolean;
  /** How many separate breaches this password appears in. */
  count: number;
}

/*
  Returns null when the check could not be completed — network failure, HIBP
  down, timeout.

  Callers should treat null as "allow". This FAILS OPEN deliberately: if HIBP
  is unreachable, the alternative is that nobody in Nigeria can create an
  account or reset a password until a third-party service in another country
  comes back. A weak password is a smaller problem than a dead signup form.
*/
export async function checkPasswordPwned(
  password: string
): Promise<PwnedResult | null> {
  if (!password) return null;

  const hash = crypto
    .createHash("sha1")
    .update(password, "utf8")
    .digest("hex")
    .toUpperCase();

  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  try {
    const res = await fetch(`${API}/${prefix}`, {
      headers: {
        /* Pads the response with random entries so its SIZE leaks nothing
           either — without this, an observer could infer something from the
           length of the reply. */
        "Add-Padding": "true",
        "User-Agent": "JOHTA-password-check",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) return null;

    const body = await res.text();

    for (const line of body.split("\n")) {
      const [candidate, countRaw] = line.trim().split(":");
      if (candidate === suffix) {
        const count = Number(countRaw) || 0;
        /* Padded entries are returned with a count of 0 and are not real
           matches — treat them as clean. */
        if (count === 0) return { pwned: false, count: 0 };
        return { pwned: true, count };
      }
    }

    return { pwned: false, count: 0 };
  } catch {
    return null;
  }
}

/*
  The message shown to a shop owner.

  Deliberately says nothing about breaches, counts or danger. The earlier
  version read "this password has appeared in 70,606,000+ times in known data
  breaches, so it is unsafe to use" — which is accurate, alarming, blames the
  person, and tells them nothing about what to do next. Someone signing up for
  a shop app does not need a security lecture; they need to know the password
  is too common and what to type instead.

  (It also formatted the number wrongly, rendering 70,606,000 as "70606,000+".)
*/
export function pwnedPasswordMessage(_count: number): string {
  return "That password is too common to be safe. Try adding a few words or numbers only you would think of.";
}
