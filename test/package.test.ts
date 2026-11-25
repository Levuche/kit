import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const root = new URL('../', import.meta.url);
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));

describe('package.json', () => {
  it('points every export at a file that exists', () => {
    for (const [entry, target] of Object.entries(pkg.exports)) {
      expect(existsSync(new URL(String(target), root)), entry).toBe(true);
    }
  });

  it('has a changelog entry for its version', () => {
    const changelog = readFileSync(new URL('CHANGELOG.md', root), 'utf8');
    expect(changelog).toContain(`## ${pkg.version}`);
  });
});
