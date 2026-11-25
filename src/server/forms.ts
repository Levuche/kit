import { buildbaseEnvironmentId } from '../buildbase';

/**
 * Forwards a form from a Levuche site to a form built in the Buildbase
 * console (Content, Forms), through the form's public submit endpoint, so
 * every message lands in Buildbase. The browser never talks to Buildbase
 * directly. In order, it:
 *
 * 1. refuses a post another site could have sent (`refuseCrossSitePost`);
 * 2. drops a bot submission: a person never fills the hidden honeypot field
 *    (`company` by default), and the bot is told it worked;
 * 3. trims each field and cuts it to its limit, and refuses the post when a
 *    required field is empty or an email field isn't an address;
 * 4. passes on the answer to Buildbase's spam check when the form has it
 *    on (the browser sends it as `captcha`; it goes on as `_captcha`).
 *
 * Every answer is JSON: `{ ok: true }`, or `{ error }` with one of
 * `not_configured` (503), `invalid_body`, `invalid_fields`, `captcha_failed`,
 * `email_refused`, `rejected` (400), `rate_limited` (429) or `unavailable`
 * (502). Limit how often one address can post before calling this; that
 * depends on where the site runs.
 *
 *   export const POST = (request: Request) =>
 *     forwardForm(request, {
 *       ...buildbase,
 *       formId: process.env.BUILDBASE_CONTACT_FORM_ID,
 *       fields: {
 *         name: { max: 200, required: true },
 *         email: { max: 320, required: true, email: true },
 *         message: { max: 5000, required: true },
 *       },
 *     });
 */

export interface FormField {
  /** The most characters kept; the rest is cut off. */
  max: number;
  /** Refuse the post when this is empty. */
  required?: boolean;
  /** Refuse the post when this isn't an email address. */
  email?: boolean;
}

export interface ForwardFormOptions {
  serverUrl: string;
  orgId: string;
  environment?: string;
  /** The form's public id from the console. Empty means not set up yet. */
  formId: string | undefined;
  /** The fields Buildbase's form has, by name. Anything else is dropped. */
  fields: Record<string, FormField>;
  /** The hidden field bots fill in, or false for none. Default `company`. */
  honeypot?: string | false;
  /** For tests. Default: the global fetch. */
  fetch?: typeof fetch;
  /** How long to wait for Buildbase, in milliseconds. Default 10 seconds. */
  timeoutMs?: number;
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function answer(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

/** `url` without slashes at its end, in linear time (no regular expression). */
function withoutTrailingSlashes(url: string): string {
  let end = url.length;
  while (end > 0 && url.charCodeAt(end - 1) === 47) end--;
  return url.slice(0, end);
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/**
 * The answer refusing a POST another site could have sent, or null to go
 * on. The same rules as the Buildbase SDK's `refuseCrossSiteAuthPost`:
 * 415 unless the body is `application/json` (a form on another site can't
 * send that without asking first), and 403 when the `Origin` names another
 * host, or is `null`.
 */
export function refuseCrossSitePost(request: Request): Response | null {
  const type = (request.headers.get('content-type') ?? '')
    .split(';')[0]!
    .trim()
    .toLowerCase();
  if (type !== 'application/json') {
    return answer({ error: 'Content-Type must be application/json' }, 415);
  }
  const origin = request.headers.get('origin');
  if (origin === null) return null;
  let sameHost = false;
  try {
    sameHost =
      origin !== 'null' &&
      new URL(origin).hostname === new URL(request.url).hostname;
  } catch {
    sameHost = false;
  }
  return sameHost
    ? null
    : answer({ error: 'Cross-origin request refused' }, 403);
}

export async function forwardForm(
  request: Request,
  options: ForwardFormOptions
): Promise<Response> {
  const refused = refuseCrossSitePost(request);
  if (refused) return refused;

  const org = buildbaseEnvironmentId(options);
  const formId = options.formId?.trim();
  if (!org || !formId) return answer({ error: 'not_configured' }, 503);

  const body = (await request.json().catch(() => null)) as unknown;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return answer({ error: 'invalid_body' }, 400);
  }
  const posted = body as Record<string, unknown>;

  const honeypot = options.honeypot ?? 'company';
  if (honeypot && text(posted[honeypot], 200)) return answer({ ok: true });

  const data: Record<string, string> = {};
  for (const [name, field] of Object.entries(options.fields)) {
    const value = text(posted[name], field.max);
    if (field.required && !value) {
      return answer({ error: 'invalid_fields' }, 400);
    }
    if (field.email && value && !EMAIL.test(value)) {
      return answer({ error: 'invalid_fields' }, 400);
    }
    if (value) data[name] = value;
  }
  const captcha = text(posted.captcha, 4000);
  if (captcha) data._captcha = captcha;

  const server = withoutTrailingSlashes(options.serverUrl.trim());
  const url = `${server}/api/forms/public/${org}/${encodeURIComponent(formId)}/submit`;
  const send = options.fetch ?? fetch;

  try {
    const res = await send(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      cache: 'no-store',
      signal: AbortSignal.timeout(options.timeoutMs ?? 10_000),
    });
    const reply = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
    };
    if (res.ok && reply.success !== false) return answer({ ok: true });
    if (res.status === 429) return answer({ error: 'rate_limited' }, 429);
    // The spam check failed or its provider didn't answer: worth a retry.
    if (res.status === 503 || /captcha/i.test(reply.message ?? '')) {
      return answer({ error: 'captcha_failed' }, 400);
    }
    // A throwaway email domain the form blocks.
    if (/different email/i.test(reply.message ?? '')) {
      return answer({ error: 'email_refused' }, 400);
    }
    return answer({ error: 'rejected' }, 400);
  } catch {
    return answer({ error: 'unavailable' }, 502);
  }
}
