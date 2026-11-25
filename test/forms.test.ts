import { describe, expect, it, vi } from 'vitest';
import { forwardForm, refuseCrossSitePost } from '../src/server';

const ORG = '0123456789abcdef01234567';

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://levuche.com/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://levuche.com',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function buildbase(reply: unknown, status = 200) {
  return vi.fn(
    async () =>
      new Response(JSON.stringify(reply), {
        status,
        headers: { 'Content-Type': 'application/json' },
      })
  );
}

const fields = {
  name: { max: 200, required: true },
  email: { max: 320, required: true, email: true },
  message: { max: 10, required: true },
};

const options = (fetch: typeof globalThis.fetch, environment?: string) => ({
  serverUrl: 'https://api.example.test/',
  orgId: ORG,
  environment,
  formId: 'form1',
  fields,
  fetch,
});

const GOOD = { name: ' Maya ', email: 'maya@example.com', message: 'Hello' };

describe('refuseCrossSitePost', () => {
  it('lets a same-site JSON post through', () => {
    expect(refuseCrossSitePost(post({}))).toBeNull();
  });

  it('refuses another content type, another site and an opaque origin', () => {
    expect(
      refuseCrossSitePost(post({}, { 'Content-Type': 'text/plain' }))?.status
    ).toBe(415);
    expect(
      refuseCrossSitePost(post({}, { Origin: 'https://evil.example' }))?.status
    ).toBe(403);
    expect(refuseCrossSitePost(post({}, { Origin: 'null' }))?.status).toBe(403);
  });
});

describe('forwardForm', () => {
  it('forwards the checked fields to the form', async () => {
    const fetch = buildbase({ success: true });
    const res = await forwardForm(
      post({ ...GOOD, message: 'Hello there, long', extra: 'x', captcha: 'c' }),
      options(fetch, 'nxhaiivt')
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(
      `https://api.example.test/api/forms/public/${ORG}-nxhaiivt/form1/submit`
    );
    expect(JSON.parse(String(init.body))).toEqual({
      name: 'Maya',
      email: 'maya@example.com',
      message: 'Hello ther',
      _captcha: 'c',
    });
  });

  it('answers a bot as if it worked and sends nothing', async () => {
    const fetch = buildbase({ success: true });
    const res = await forwardForm(
      post({ ...GOOD, company: 'Spam Inc' }),
      options(fetch)
    );
    expect(await res.json()).toEqual({ ok: true });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('refuses missing and malformed fields', async () => {
    const fetch = buildbase({ success: true });
    const missing = await forwardForm(
      post({ ...GOOD, name: ' ' }),
      options(fetch)
    );
    expect(missing.status).toBe(400);
    const email = await forwardForm(
      post({ ...GOOD, email: 'nope' }),
      options(fetch)
    );
    expect(await email.json()).toEqual({ error: 'invalid_fields' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('is not configured without a form or org', async () => {
    const fetch = buildbase({ success: true });
    const res = await forwardForm(post(GOOD), {
      ...options(fetch),
      formId: ' ',
    });
    expect(res.status).toBe(503);
  });

  it('turns Buildbase refusals into short codes', async () => {
    const cases: [unknown, number, string, number][] = [
      [{ message: 'Too many' }, 429, 'rate_limited', 429],
      [
        { success: false, message: 'Captcha failed' },
        400,
        'captcha_failed',
        400,
      ],
      [
        { success: false, message: 'Use a different email' },
        400,
        'email_refused',
        400,
      ],
      [{ success: false }, 400, 'rejected', 400],
    ];
    for (const [reply, status, error, ours] of cases) {
      const res = await forwardForm(
        post(GOOD),
        options(buildbase(reply, status))
      );
      expect(res.status, error).toBe(ours);
      expect(await res.json(), error).toEqual({ error });
    }
  });

  it('says unavailable when Buildbase cannot be reached', async () => {
    const fetch = vi.fn(async () => {
      throw new Error('down');
    });
    const res = await forwardForm(post(GOOD), options(fetch));
    expect(res.status).toBe(502);
  });
});
