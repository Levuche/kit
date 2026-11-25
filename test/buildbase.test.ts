import { describe, expect, it } from 'vitest';
import { BUILDBASE_DEFAULT_SERVER_URL, buildbaseConfig, isOrgId } from '../src';

const ORG = '0123456789abcdef01234567';

describe('buildbaseConfig', () => {
  it('turns everything off when nothing is set', () => {
    const config = buildbaseConfig({});
    expect(config.serverUrl).toBe(BUILDBASE_DEFAULT_SERVER_URL);
    expect(config.environment).toBeUndefined();
    expect(config.analytics).toBe(false);
    expect(config.isAuthConfigured).toBe(false);
  });

  it('trims values and treats a blank environment as production', () => {
    const config = buildbaseConfig({
      orgId: ` ${ORG} `,
      environment: '  ',
      clientId: ' client ',
      redirectUrl: ' https://app.levuche.com ',
      serverUrl: 'https://api.example.test/',
      analytics: 'on',
    });
    expect(config).toMatchObject({
      orgId: ORG,
      environment: undefined,
      clientId: 'client',
      redirectUrl: 'https://app.levuche.com',
      serverUrl: 'https://api.example.test',
      analytics: true,
      isAuthConfigured: true,
    });
  });

  it('needs a real org id for sign-in', () => {
    const config = buildbaseConfig({
      orgId: 'not-an-org',
      clientId: 'client',
      redirectUrl: 'https://app.levuche.com',
    });
    expect(config.isAuthConfigured).toBe(false);
  });

  it('only turns analytics on for "on"', () => {
    expect(buildbaseConfig({ analytics: 'true' }).analytics).toBe(false);
  });
});

describe('isOrgId', () => {
  it('accepts 24 hexadecimal characters only', () => {
    expect(isOrgId(ORG)).toBe(true);
    expect(isOrgId(ORG.slice(1))).toBe(false);
    expect(isOrgId(undefined)).toBe(false);
  });
});
