/**
 * Affiliate links. A link like levuche.com/?ref=MAYA is turned into a signed
 * referral by Buildbase and kept in the browser, so a sale is credited to
 * the affiliate who sent the visitor.
 *
 * Buildbase keeps that referral for one site only (local storage), so a
 * link from one Levuche site into another carries the code along as ?ref=,
 * and the site it lands on keeps its own copy. Every site uses these
 * helpers, so the parameter and the check stay the same everywhere.
 *
 * Keep and read the referral with the SDK's `captureReferral()` and
 * `getReferral()`, under `buildbaseEnvironmentId(config)`.
 */

/** The query parameter an affiliate link carries the code in. */
export const REFERRAL_PARAM = 'ref';

/** Sent on window once a referral is kept, so links can pick the code up. */
export const REFERRAL_EVENT = 'levuche:referral';

/** An affiliate code as Buildbase makes them: 3 to 32 letters, digits, - or _. */
const REFERRAL_CODE = /^[A-Za-z0-9_-]{3,32}$/;

export function isReferralCode(value: unknown): value is string {
  return typeof value === 'string' && REFERRAL_CODE.test(value);
}

const BASE = 'https://levuche.invalid';

/**
 * `href` with the affiliate code as ?ref=, so the site it leads to credits
 * the same affiliate. Unchanged when there is no valid code. A relative
 * `href` stays relative.
 */
export function withReferral(
  href: string,
  code: string | null | undefined
): string {
  if (!isReferralCode(code)) return href;
  const url = new URL(href, BASE);
  url.searchParams.set(REFERRAL_PARAM, code);
  return url.origin === BASE
    ? `${url.pathname}${url.search}${url.hash}`
    : url.toString();
}

/**
 * `to` with the affiliate code from `from`'s ?ref=, for a redirect from one
 * Levuche site to another. An invalid code is dropped.
 */
export function forwardReferral(from: URL, to: string | URL): URL {
  const target = new URL(to);
  const code = from.searchParams.get(REFERRAL_PARAM);
  if (isReferralCode(code)) target.searchParams.set(REFERRAL_PARAM, code);
  return target;
}
