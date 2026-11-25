/**
 * Public Buildbase settings, checked once. Pass the NEXT_PUBLIC_* values in
 * from the app, written out in full (Next.js only inlines
 * `process.env.NEXT_PUBLIC_NAME` when it sees that exact text):
 *
 *   export const buildbase = buildbaseConfig({
 *     orgId: process.env.NEXT_PUBLIC_BUILDBASE_ORG_ID,
 *     environment: process.env.NEXT_PUBLIC_BUILDBASE_ENVIRONMENT,
 *     ...
 *   });
 *
 * Every value is public. The client secret and the org API token are server
 * secrets and never go through here.
 */
export interface BuildbaseInput {
  serverUrl?: string;
  orgId?: string;
  /** A development environment's key; empty means production. */
  environment?: string;
  clientId?: string;
  redirectUrl?: string;
  /** "on" turns on Buildbase web analytics. */
  analytics?: string;
}

export interface BuildbaseConfig {
  serverUrl: string;
  orgId: string;
  environment: string | undefined;
  clientId: string;
  redirectUrl: string;
  analytics: boolean;
  /** Sign-in needs the org, the sign-in client and its redirect URL. */
  isAuthConfigured: boolean;
}

export const BUILDBASE_DEFAULT_SERVER_URL = 'https://api.console.buildbase.app';

/** A Buildbase org id: 24 hexadecimal characters. */
export function isOrgId(value: string | undefined): value is string {
  return typeof value === 'string' && /^[0-9a-f]{24}$/i.test(value);
}

export function buildbaseConfig(input: BuildbaseInput): BuildbaseConfig {
  const orgId = input.orgId?.trim() ?? '';
  const clientId = input.clientId?.trim() ?? '';
  const redirectUrl = input.redirectUrl?.trim() ?? '';
  return {
    serverUrl: (
      input.serverUrl?.trim() || BUILDBASE_DEFAULT_SERVER_URL
    ).replace(/\/+$/, ''),
    orgId,
    environment: input.environment?.trim() || undefined,
    clientId,
    redirectUrl,
    analytics: input.analytics?.trim() === 'on',
    isAuthConfigured: isOrgId(orgId) && Boolean(clientId && redirectUrl),
  };
}

/**
 * The id Buildbase knows an environment by (the SDK's `environmentId`): the
 * org id for production, `<orgId>-<key>` for another environment. Null
 * before the org is set. Buildbase keeps referrals and takes public form
 * posts under this id.
 */
export function buildbaseEnvironmentId(config: {
  orgId: string;
  environment?: string | undefined;
}): string | null {
  const orgId = config.orgId.trim();
  if (!isOrgId(orgId)) return null;
  const key = config.environment?.trim();
  return key && key !== 'production' ? `${orgId}-${key}` : orgId;
}
