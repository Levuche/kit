import { describe, expect, it } from 'vitest';
import {
  buildbaseEnvironmentId,
  forwardReferral,
  isReferralCode,
  withReferral,
} from '../src';

const ORG = '0123456789abcdef01234567';

describe('buildbaseEnvironmentId', () => {
  it('is the org id for production and org-key otherwise', () => {
    expect(buildbaseEnvironmentId({ orgId: ORG, environment: undefined })).toBe(
      ORG
    );
    expect(
      buildbaseEnvironmentId({ orgId: ORG, environment: 'production' })
    ).toBe(ORG);
    expect(
      buildbaseEnvironmentId({ orgId: ORG, environment: 'nxhaiivt' })
    ).toBe(`${ORG}-nxhaiivt`);
  });

  it('is null before the org is set', () => {
    expect(
      buildbaseEnvironmentId({ orgId: '', environment: undefined })
    ).toBeNull();
  });
});

describe('isReferralCode', () => {
  it('takes codes as Buildbase makes them', () => {
    expect(isReferralCode('MAYA_1')).toBe(true);
    expect(isReferralCode('ab')).toBe(false);
    expect(isReferralCode('<x>')).toBe(false);
    expect(isReferralCode('a'.repeat(33))).toBe(false);
    expect(isReferralCode(null)).toBe(false);
  });
});

describe('withReferral', () => {
  it('adds the code to relative and full links', () => {
    expect(withReferral('/dashboard', 'MAYA')).toBe('/dashboard?ref=MAYA');
    expect(withReferral('/a?x=1#top', 'MAYA')).toBe('/a?x=1&ref=MAYA#top');
    expect(withReferral('https://app.levuche.com', 'MAYA')).toBe(
      'https://app.levuche.com/?ref=MAYA'
    );
  });

  it('leaves the link alone without a valid code', () => {
    expect(withReferral('/dashboard', null)).toBe('/dashboard');
    expect(withReferral('/dashboard', '<x>')).toBe('/dashboard');
  });
});

describe('forwardReferral', () => {
  it('carries a valid code on to the next site', () => {
    const from = new URL('https://levuche.com/dashboard?ref=MAYA_1');
    expect(forwardReferral(from, 'https://app.levuche.com').toString()).toBe(
      'https://app.levuche.com/?ref=MAYA_1'
    );
  });

  it('drops an invalid code', () => {
    const from = new URL('https://levuche.com/dashboard?ref=%3Cx%3E');
    expect(forwardReferral(from, 'https://app.levuche.com').toString()).toBe(
      'https://app.levuche.com/'
    );
  });
});
