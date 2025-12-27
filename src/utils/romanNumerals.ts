/**
 * Roman numeral conversion utility
 * Supports numbers 1-20 (sufficient for menu items)
 */

const numerals: [number, string][] = [
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

/**
 * Convert a number to a roman numeral string
 * @param num Number to convert (1-20)
 * @returns Roman numeral string (e.g., "IV", "VII")
 */
export function toRomanNumeral(num: number): string {
  if (num < 1 || num > 20) {
    return String(num);
  }

  let result = '';
  let remaining = num;

  for (const [value, symbol] of numerals) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }

  return result;
}
