import { describe, expect, it } from 'vitest';
import {
  expireHostOnlySessionCookie,
  SESSION_MAX_AGE,
  sessionCookieName,
  sessionCookieOptions,
  sharedCookieDomain,
} from '../src/server';

const url = (href: string) => new URL(href);

describe('sessionCookieName', () => {
  it('names the cookie as the Buildbase SDK does', () => {
    expect(sessionCookieName()).toBe('bb-session-id');
    expect(sessionCookieName('')).toBe('bb-session-id');
    expect(sessionCookieName('production')).toBe('bb-session-id');
    expect(sessionCookieName('nxhaiivt')).toBe('bb-session-id-nxhaiivt');
  });
});

describe('sharedCookieDomain', () => {
  it('shares the cookie across every levuche.com site', () => {
    for (const host of [
      'levuche.com',
      'dev.levuche.com',
      'app.levuche.com',
      'APP-DEV.Levuche.com.',
    ]) {
      expect(sharedCookieDomain(host), host).toBe('levuche.com');
    }
  });

  it('keeps a cookie per host anywhere else', () => {
    for (const host of [
      'localhost',
      'pr-65-levuche-com-dev.levuche-com.workers.dev',
      'evillevuche.com',
      'levuche.com.example.org',
      'levuche.page',
    ]) {
      expect(sharedCookieDomain(host), host).toBeUndefined();
    }
  });
});

describe('sessionCookieOptions', () => {
  it('sets a 30-day, http-only cookie on levuche.com', () => {
    expect(sessionCookieOptions(url('https://app.levuche.com/x'))).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
      domain: 'levuche.com',
    });
    expect(SESSION_MAX_AGE).toBe(60 * 60 * 24 * 30);
  });

  it('leaves the domain out elsewhere and follows the protocol', () => {
    const options = sessionCookieOptions(url('http://localhost:3000/'), 0);
    expect(options).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  });
});

describe('expireHostOnlySessionCookie', () => {
  it('removes the old per-host cookie on levuche.com', () => {
    expect(
      expireHostOnlySessionCookie('bb-session-id', url('https://levuche.com/'))
    ).toBe('bb-session-id=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure');
  });

  it('does nothing off levuche.com', () => {
    expect(
      expireHostOnlySessionCookie('bb-session-id', url('http://localhost/'))
    ).toBeNull();
  });
});
