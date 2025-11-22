/**
 * Currency formatting utilities for South African Rand (ZAR)
 */

/**
 * Formats a number as South African Rand currency
 * @param amount - The numeric amount to format
 * @returns Formatted currency string in the format "R 1,234.56"
 * @example
 * formatCurrency(1234.56) // "R 1,234.56"
 * formatCurrency(1000000) // "R 1,000,000.00"
 */
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  // Replace 'ZAR' prefix with 'R'
  return formatted.replace('ZAR', 'R');
}

/**
 * Parses a formatted currency string back to a number
 * @param formatted - The formatted currency string (e.g., "R 1,234.56")
 * @returns The numeric value
 * @example
 * parseCurrency("R 1,234.56") // 1234.56
 * parseCurrency("R 1,000,000.00") // 1000000
 */
export function parseCurrency(formatted: string): number {
  // Remove 'R', commas, and spaces, then parse as float
  const cleaned = formatted.replace(/[R,\s]/g, '');
  return parseFloat(cleaned);
}
