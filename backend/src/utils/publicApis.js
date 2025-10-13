/**
 * Public API Integration Examples for Backend
 * No authentication required
 */

const logger = require('./logger');

// ============================================
// 1. GitHub API - Public Data
// ============================================

/**
 * Fetch GitHub user profile (public data)
 */
async function fetchGitHubUser(username) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    logger.info('GitHub user fetched', { username, repos: data.public_repos });
    
    return {
      username: data.login,
      name: data.name,
      avatar: data.avatar_url,
      bio: data.bio,
      location: data.location,
      repos: data.public_repos,
      followers: data.followers,
      url: data.html_url
    };
  } catch (error) {
    logger.error('GitHub API fetch failed', { error: error.message, username });
    throw error;
  }
}

/**
 * Fetch GitHub repository info
 */
async function fetchGitHubRepo(owner, repo) {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    logger.error('GitHub repo fetch failed', { error: error.message, owner, repo });
    throw error;
  }
}

// ============================================
// 2. IPFS - Decentralized Storage
// ============================================

const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://dweb.link/ipfs/'
];

/**
 * Fetch data from IPFS with fallback gateways
 */
async function fetchFromIPFS(hash) {
  let lastError = null;

  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = `${gateway}${hash}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      logger.info('IPFS fetch successful', { hash, gateway });
      
      return data;
    } catch (error) {
      logger.warn('IPFS gateway failed', { gateway, error: error.message });
      lastError = error;
      continue;
    }
  }

  throw new Error(`Failed to fetch from IPFS: ${lastError?.message || 'All gateways failed'}`);
}

/**
 * Validate IPFS hash format
 */
function isValidIPFSHash(hash) {
  // CIDv0 (Qm...) or CIDv1 (bafy...)
  return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[0-9A-Za-z]{50,})$/.test(hash);
}

// ============================================
// 3. CoinGecko - Cryptocurrency Prices
// ============================================

/**
 * Fetch Bitcoin price (already used in aiProcessor.js)
 */
async function fetchBitcoinPrice(vsCurrency = 'usd') {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${vsCurrency}`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();
    logger.info('Bitcoin price fetched', { price: data.bitcoin[vsCurrency], currency: vsCurrency });
    
    return data.bitcoin[vsCurrency];
  } catch (error) {
    logger.error('CoinGecko API fetch failed', { error: error.message });
    throw error;
  }
}

/**
 * Fetch Stacks (STX) price
 */
async function fetchStacksPrice(vsCurrency = 'usd') {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=blockstack&vs_currencies=${vsCurrency}`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.blockstack[vsCurrency];
  } catch (error) {
    logger.error('Stacks price fetch failed', { error: error.message });
    throw error;
  }
}

/**
 * Fetch multiple cryptocurrency prices at once
 */
async function fetchMultipleCryptoPrices(coinIds = ['bitcoin', 'blockstack', 'ethereum'], vsCurrency = 'usd') {
  try {
    const coins = coinIds.join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coins}&vs_currencies=${vsCurrency}&include_24hr_change=true`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();
    logger.info('Multiple crypto prices fetched', { coins: coinIds });
    
    return data;
  } catch (error) {
    logger.error('Multiple crypto prices fetch failed', { error: error.message });
    throw error;
  }
}

// ============================================
// 4. Stacks Blockchain API - Public Data
// ============================================

const STACKS_API_MAINNET = 'https://stacks-node-api.mainnet.stacks.co';
const STACKS_API_TESTNET = 'https://stacks-node-api.testnet.stacks.co';

/**
 * Get Stacks blockchain info
 */
async function getStacksBlockchainInfo(testnet = false) {
  try {
    const apiUrl = testnet ? STACKS_API_TESTNET : STACKS_API_MAINNET;
    const response = await fetch(`${apiUrl}/v2/info`);

    if (!response.ok) {
      throw new Error(`Stacks API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    logger.error('Stacks info fetch failed', { error: error.message });
    throw error;
  }
}

/**
 * Get account balance from Stacks
 */
async function getStacksAccountBalance(address, testnet = false) {
  try {
    const apiUrl = testnet ? STACKS_API_TESTNET : STACKS_API_MAINNET;
    const response = await fetch(`${apiUrl}/v2/accounts/${address}?proof=0`);

    if (!response.ok) {
      throw new Error(`Stacks API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    logger.error('Stacks balance fetch failed', { error: error.message, address });
    throw error;
  }
}

// ============================================
// 5. Utility Functions
// ============================================

/**
 * Convert USD to satoshis using current BTC price
 */
async function convertUSDtoSatoshis(usdAmount) {
  const btcPrice = await fetchBitcoinPrice();
  const btcAmount = usdAmount / btcPrice;
  const satoshis = Math.floor(btcAmount * 100000000);
  
  logger.info('USD to satoshis conversion', { usd: usdAmount, btcPrice, satoshis });
  
  return satoshis;
}

/**
 * Format satoshis to BTC
 */
function satoshisToBTC(satoshis) {
  return satoshis / 100000000;
}

/**
 * Format BTC to satoshis
 */
function btcToSatoshis(btc) {
  return Math.floor(btc * 100000000);
}

// ============================================
// Rate Limiting Helper
// ============================================

class SimpleCache {
  constructor() {
    this.cache = new Map();
  }

  get(key, ttlMs = 60000) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new SimpleCache();

/**
 * Cached Bitcoin price (1 minute cache)
 */
async function fetchBitcoinPriceCached() {
  const cached = cache.get('btc-price');
  if (cached !== null) {
    logger.debug('Returning cached BTC price');
    return cached;
  }

  const price = await fetchBitcoinPrice();
  cache.set('btc-price', price);
  return price;
}

// ============================================
// Export All Functions
// ============================================

module.exports = {
  // GitHub
  fetchGitHubUser,
  fetchGitHubRepo,
  
  // IPFS
  fetchFromIPFS,
  isValidIPFSHash,
  
  // CoinGecko
  fetchBitcoinPrice,
  fetchStacksPrice,
  fetchMultipleCryptoPrices,
  fetchBitcoinPriceCached,
  
  // Stacks Blockchain
  getStacksBlockchainInfo,
  getStacksAccountBalance,
  
  // Utilities
  convertUSDtoSatoshis,
  satoshisToBTC,
  btcToSatoshis,
  
  // Cache
  cache
};

