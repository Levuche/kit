import { describe, expect, it } from 'vitest';
import { cn } from '../src';

describe('cn', () => {
  it('joins class names and drops falsy ones', () => {
    expect(cn('a', false, undefined, 'b', { c: true, d: false })).toBe('a b c');
  });

  it('lets the later Tailwind class win', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('keeps a colour next to a size preset', () => {
    expect(cn('text-h1', 'text-lv-text')).toBe('text-h1 text-lv-text');
    expect(cn('text-h1', 'text-h2')).toBe('text-h2');
  });

  it('knows the spacing, width and corner presets', () => {
    expect(cn('py-section', 'py-4')).toBe('py-4');
    expect(cn('max-w-layout', 'max-w-form')).toBe('max-w-form');
    expect(cn('rounded-card', 'rounded-tile')).toBe('rounded-tile');
    expect(cn('min-h-control', 'min-h-control-lg')).toBe('min-h-control-lg');
  });
});
