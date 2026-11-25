import { describe, expect, it } from 'vitest';
import { readEnv, requireEnv } from '../src/server';

describe('readEnv', () => {
  it('trims values and treats blank as unset', () => {
    expect(readEnv('A', { A: ' x ' })).toBe('x');
    expect(readEnv('A', { A: '  ' })).toBeUndefined();
    expect(readEnv('A', {})).toBeUndefined();
  });
});

describe('requireEnv', () => {
  it('returns a set value', () => {
    expect(requireEnv('A', { A: 'x' })).toBe('x');
  });

  it('names the missing variable without printing values', () => {
    expect(() => requireEnv('SECRET_TOKEN', { OTHER: 'hidden' })).toThrow(
      /SECRET_TOKEN is not set/
    );
    try {
      requireEnv('SECRET_TOKEN', { OTHER: 'hidden' });
    } catch (error) {
      expect(String(error)).not.toContain('hidden');
    }
  });
});
