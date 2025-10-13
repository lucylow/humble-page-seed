/**
 * Helper utility functions
 */

/**
 * Format satoshis to BTC
 * @param {number} sats - Amount in satoshis
 * @returns {number} Amount in BTC
 */
function satsToBTC(sats) {
  return sats / 100000000;
}

/**
 * Format BTC to satoshis
 * @param {number} btc - Amount in BTC
 * @returns {number} Amount in satoshis
 */
function btcToSats(btc) {
  return Math.floor(btc * 100000000);
}

/**
 * Format Stacks address for display
 * @param {string} address - Full Stacks address
 * @returns {string} Shortened address
 */
function formatAddress(address) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Validate Stacks address format
 * @param {string} address - Address to validate
 * @returns {boolean} Is valid
 */
function isValidStacksAddress(address) {
  return /^(SP|ST)[0-9A-Z]{38,41}$/.test(address);
}

/**
 * Generate unique invoice number
 * @returns {string} Invoice number
 */
function generateInvoiceNumber() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `INV-${timestamp}-${random}`.toUpperCase();
}

/**
 * Calculate percentage
 * @param {number} part - Part value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
function calculatePercentage(part, total) {
  if (total === 0) return 0;
  return (part / total) * 100;
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} baseDelay - Base delay in ms
 * @returns {Promise} Result of function
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

/**
 * Paginate array
 * @param {Array} array - Array to paginate
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Items per page
 * @returns {Object} Paginated result
 */
function paginate(array, page = 1, pageSize = 10) {
  const totalItems = array.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    }
  };
}

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Generate random string
 * @param {number} length - String length
 * @returns {string} Random string
 */
function randomString(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Format date to ISO string
 * @param {Date} date - Date to format
 * @returns {string} ISO string
 */
function formatDate(date) {
  return new Date(date).toISOString();
}

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} Is empty
 */
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

module.exports = {
  satsToBTC,
  btcToSats,
  formatAddress,
  isValidStacksAddress,
  generateInvoiceNumber,
  calculatePercentage,
  sleep,
  retryWithBackoff,
  paginate,
  deepClone,
  randomString,
  formatDate,
  isEmpty
};

