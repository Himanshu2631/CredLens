/**
 * Localized Currency utilities for CredLens Spend Audit localization.
 * Base values are always calculated in USD and converted on-the-fly for display.
 */

export const EXCHANGE_RATE = 83; // 1 USD = 83 INR

/**
 * Converts a USD amount to the target currency.
 * 
 * @param {number} usdAmount Amount in USD
 * @param {string} currency 'USD' | 'INR'
 * @returns {number} Converted value
 */
export function convertAmount(usdAmount, currency = 'USD') {
  const value = Number(usdAmount) || 0;
  if (currency === 'INR') {
    return Math.round(value * EXCHANGE_RATE);
  }
  return Math.round(value);
}

/**
 * Formats a currency amount with appropriate locale formatting.
 * Supports standard localization and optional period suffix (e.g. 'mo', 'yr').
 * 
 * @param {number} usdAmount Amount in USD (to be converted and formatted)
 * @param {string} currency 'USD' | 'INR'
 * @param {string} period Optional period suffix (e.g. 'mo', 'yr')
 * @param {Object} options Formatting overrides
 * @returns {string} Locale-safe formatted currency string
 */
export function formatCurrency(usdAmount, currency = 'USD', period = '', options = {}) {
  const converted = convertAmount(usdAmount, currency);
  
  let formatted = '';
  if (currency === 'INR') {
    formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
      ...options
    }).format(converted);
  } else {
    formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
      ...options
    }).format(converted);
  }
  
  return period ? `${formatted}/${period}` : formatted;
}

/**
 * Centralized utility to transform USD symbols and formatted strings in text
 * to their respective INR representation when the active currency is INR.
 * 
 * @param {string} text Text that contains USD signs, e.g. "$150", "$1,500/mo"
 * @param {string} currency 'USD' | 'INR'
 * @returns {string} Fully localized text
 */
export function localizeText(text, currency = 'USD') {
  if (!text || typeof text !== 'string') return text;
  if (currency === 'USD') return text;

  // Regular expression to match dollar amounts like:
  // - $150, $1,500, $0
  // - Handles optional decimals and compact multipliers like k, K, m, M
  const regex = /\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)([kKmM]?)/g;
  
  return text.replace(regex, (match, numberStr, suffix) => {
    let usdVal = parseFloat(numberStr.replace(/,/g, ''));
    if (isNaN(usdVal)) return match;
    
    if (suffix) {
      const lower = suffix.toLowerCase();
      if (lower === 'k') {
        usdVal *= 1000;
      } else if (lower === 'm') {
        usdVal *= 1000000;
      }
    }
    
    const inrVal = Math.round(usdVal * EXCHANGE_RATE);
    
    // Format INR with Indian grouping system
    const formattedInr = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(inrVal);
    
    return formattedInr;
  });
}
