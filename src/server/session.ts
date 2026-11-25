/**
 * The signed-in visitor's session cookie, shared by every Levuche site on
 * levuche.com: the website (levuche.com, dev.levuche.com) and the app
 * (app.levuche.com, app-dev.levuche.com). Signing in on one shows you
 * signed in on the others, and signing out on one signs you out of all.
 *
 * Every site must use these helpers, not its own copy: a different name or
 * domain makes a second cookie, and shared sign-in quietly stops working.
 *
 * Creators' storefronts are on levuche.page and their own domains, so they
 * never receive this cookie.
 */

/** The domain Levuche's own sites share the session cookie on. */
export const SHARED_COOKIE_DOMAIN = 'levuche.com';

/** How long a sign-in lasts, in seconds: 30 days. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

/** The part of a URL the cookie helpers read (a URL or Next's nextUrl). */
export type CookieUrl = Pick<URL, 'hostname' | 'protocol'>;

/**
 * The session cookie's name, as the Buildbase SDK names it
 * (`sessionCookieName`): `bb-session-id`, with `-<key>` for a development
 * environment, so a development and a production build never read each
 * other's session. Pass the Buildbase environment key (empty or
 * "production" means production).
 */
export function sessionCookieName(environment?: string): string {
  const key = environment?.trim();
  return key && key !== 'production' ? `bb-session-id-${key}` : 'bb-session-id';
}

/**
 * levuche.com for a host on it (levuche.com, dev.levuche.com,
 * app.levuche.com), so the cookie reaches every Levuche site. Undefined for
 * any other host (localhost, a preview link), which keeps a cookie of its
 * own.
 */
export function sharedCookieDomain(hostname: string): string | undefined {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  return host === SHARED_COOKIE_DOMAIN ||
    host.endsWith(`.${SHARED_COOKIE_DOMAIN}`)
    ? SHARED_COOKIE_DOMAIN
    : undefined;
}

export interface SessionCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: '/';
  maxAge: number;
  domain?: string;
}

/**
 * Options for setting the session cookie on a response to `url`, in the
 * shape Next.js's `response.cookies.set()` takes. Pass a `maxAge` of 0 to
 * sign out.
 *
 * Secure follows the request's protocol, not NODE_ENV: `next start` on a
 * plain-http host is production, and a browser drops a Secure cookie sent
 * over http.
 */
export function sessionCookieOptions(
  url: CookieUrl,
  maxAge: number = SESSION_MAX_AGE
): SessionCookieOptions {
  const domain = sharedCookieDomain(url.hostname);
  return {
    httpOnly: true,
    secure: url.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge,
    ...(domain ? { domain } : {}),
  };
}

/**
 * A Set-Cookie header value that removes a session cookie kept for this
 * host alone, from before the cookie was shared. A browser keeps the two
 * apart, so without it someone signed in before the change keeps an old
 * session on this host. Null off levuche.com, where the only cookie is the
 * host's own.
 *
 * Append it after `cookies.set()`, which rewrites the Set-Cookie headers it
 * manages.
 */
export function expireHostOnlySessionCookie(
  name: string,
  url: CookieUrl
): string | null {
  if (!sharedCookieDomain(url.hostname)) return null;
  const secure = url.protocol === 'https:' ? '; Secure' : '';
  return `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;
}
