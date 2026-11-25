type Env = Record<string, string | undefined>;

/** Throws when server-only code is bundled into the browser. */
export function assertServer(where = 'This module'): void {
  if (typeof window !== 'undefined') {
    throw new Error(`${where} is server-only and was loaded in a browser.`);
  }
}

/** A trimmed environment value, or undefined when unset or blank. */
export function readEnv(
  name: string,
  env: Env = process.env
): string | undefined {
  const value = env[name]?.trim();
  return value ? value : undefined;
}

/**
 * An environment value that must be set. The error names the variable but
 * never prints any value.
 */
export function requireEnv(name: string, env: Env = process.env): string {
  const value = readEnv(name, env);
  if (value === undefined) {
    throw new Error(
      `${name} is not set. Add it to .env.local for local work, or to the host's secret store (see .env.example).`
    );
  }
  return value;
}
