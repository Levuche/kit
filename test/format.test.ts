import { describe, expect, it } from 'vitest';
import { formatPercent, formatPrice } from '../src';

describe('formatPrice', () => {
  it('drops the decimals on whole amounts', () => {
    expect(formatPrice(900, 'usd')).toBe('$9');
  });

  it('keeps the decimals otherwise', () => {
    expect(formatPrice(1250, 'USD')).toBe('$12.50');
  });

  it('handles currencies without minor units', () => {
    expect(formatPrice(900, 'jpy')).toBe('¥900');
  });

  it('refuses amounts that are not numbers', () => {
    expect(() => formatPrice(Number.NaN, 'usd')).toThrow(RangeError);
  });
});

describe('formatPercent', () => {
  it('formats a share', () => {
    expect(formatPercent(0.09)).toBe('9%');
    expect(formatPercent(0.125)).toBe('12.5%');
  });
});
