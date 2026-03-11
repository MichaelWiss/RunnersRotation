/**
 * Format a money amount with currency using Intl.NumberFormat.
 * Shared across ProductCard, PurchaseCard, CartDrawer, etc.
 */
export function formatPrice(amount: string | number, currencyCode: string, locale = 'en-US'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(Number(amount));
  } catch {
    return `${currencyCode} ${amount}`;
  }
}
