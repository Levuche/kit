/**
 * Formats an amount in minor units (cents for USD) as a price: 900 USD is
 * "$9", 1250 USD is "$12.50". Whole amounts drop the decimals; currencies
 * without minor units (such as JPY) are handled by Intl.
 */
export function formatPrice(
  minor: number,
  currency: string,
  locale = 'en-US'
): string {
  if (!Number.isFinite(minor)) {
    throw new RangeError(`formatPrice: ${minor} is not a finite amount`);
  }
  const code = currency.toUpperCase();
  const decimals =
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
    }).resolvedOptions().maximumFractionDigits ?? 2;
  const major = minor / 10 ** decimals;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: Number.isInteger(major) ? 0 : decimals,
  }).format(major);
}

/** A share as a percentage: 0.09 is "9%", 0.125 is "12.5%". */
export function formatPercent(share: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 2,
  }).format(share);
}
