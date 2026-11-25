import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../src/theme.css', import.meta.url), 'utf8');

/** The --lv-* names a selector's block defines. */
function tokens(selector: string): string[] {
  const start = css.indexOf(selector);
  expect(start, `${selector} should be in theme.css`).toBeGreaterThan(-1);
  const block = css.slice(start, css.indexOf('}', start));
  return [...block.matchAll(/(--lv-[a-z0-9-]+):/g)]
    .map((m) => m[1] ?? '')
    .sort();
}

describe('theme.css', () => {
  it('defines the same tokens in light and dark', () => {
    const light = tokens("[data-lv='light'] {");
    const dark = tokens("[data-lv='dark'] {");
    expect(light.length).toBeGreaterThan(20);
    expect(dark).toEqual(light);
  });

  it('maps every token for Tailwind', () => {
    for (const name of tokens("[data-lv='light'] {")) {
      if (name === '--lv-shadow') continue;
      expect(css).toContain(`--color-${name.slice(2)}: var(${name});`);
    }
  });

  it('does not import Tailwind itself', () => {
    expect(css).not.toMatch(/@import\s+['"]tailwindcss['"]/);
  });
});
