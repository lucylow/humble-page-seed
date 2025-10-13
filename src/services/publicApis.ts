/**
 * Public API Integrations - No Authentication Required
 * These APIs provide free access to public data without API keys
 */

// ============================================
// Type Definitions
// ============================================

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  bio: string | null;
  location: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// GitHub API
// ============================================

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const response = await fetch(`https://api.github.com/users/${username}`);
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

export async function fetchGitHubRepos(username: string) {
  const response = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`
  );
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }
  return await response.json();
}

const IPFS_GATEWAYS = [
  { name: 'ipfs.io', url: 'https://ipfs.io/ipfs/' },
  { name: 'cloudflare', url: 'https://cloudflare-ipfs.com/ipfs/' },
  { name: 'pinata', url: 'https://gateway.pinata.cloud/ipfs/' },
  { name: 'dweb.link', url: 'https://dweb.link/ipfs/' },
];

/**
 * Fetch JSON data from IPFS
 * Tries multiple gateways for reliability
 */
export async function fetchIPFSJson<T = any>(hash: string): Promise<T> {
  let lastError: Error | null = null;

  // Try each gateway
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = `${gateway.url}${hash}`;
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ IPFS fetch successful via ${gateway.name}`);
      return data;
    } catch (error) {
      console.warn(`❌ Failed to fetch from ${gateway.name}:`, error);
      lastError = error as Error;
      continue;
    }
  }

  throw new Error(
    `Failed to fetch from IPFS: ${lastError?.message || 'All gateways failed'}`
  );
}

/**
 * Fetch file/blob from IPFS
 */
export async function fetchIPFSFile(hash: string) {
  const url = `${IPFS_GATEWAYS[0].url}${hash}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch IPFS file: ${response.statusText}`);
  }
  return await response.blob();
}

/**
 * Get IPFS gateway URL for a hash
 */
export function getIPFSUrl(hash: string, gatewayIndex = 0) {
  return `${IPFS_GATEWAYS[gatewayIndex].url}${hash}`;
}

/**
 * Validate IPFS hash format
 */
export function isValidIPFSHash(hash: string) {
  // IPFS v0 (Qm...) or v1 (bafy...)
  return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[0-9A-Za-z]{50,})$/.test(hash);
}

/**
 * Get current Bitcoin price
 */
export async function fetchBitcoinPrice(vsCurrency = 'usd') {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${vsCurrency}`
  );
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.statusText}`);
  }
  const data = await response.json();
  return data.bitcoin[vsCurrency];
}

/**
 * Get Stacks (STX) price
 */
export async function fetchStacksPrice(vsCurrency = 'usd') {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=blockstack&vs_currencies=${vsCurrency}`
  );
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.statusText}`);
  }
  const data = await response.json();
  return data.blockstack[vsCurrency];
}

/**
 * Get multiple cryptocurrency prices
 */
export async function fetchCryptoPrices(
  coinIds: string[],
  vsCurrencies: string[] = ['usd']
) {
  const coins = coinIds.join(',');
  const currencies = vsCurrencies.join(',');
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coins}&vs_currencies=${currencies}&include_24hr_change=true`
  );
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Get detailed coin data
 */
export async function fetchCoinDetails(coinId: string) {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
  );
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.statusText}`);
  }
  return await response.json();
}

// ============================================
// 4. Stacks Blockchain - Public Node API
// ============================================

const STACKS_API_URL = 'https://stacks-node-api.mainnet.stacks.co';
const STACKS_TESTNET_API_URL = 'https://stacks-node-api.testnet.stacks.co';

export async function fetchStacksBlockchainInfo(testnet = false) {
  const apiUrl = testnet ? STACKS_TESTNET_API_URL : STACKS_API_URL;
  const response = await fetch(`${apiUrl}/v2/info`);
  if (!response.ok) {
    throw new Error(`Stacks API error: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchStacksAccountBalance(
  address: string,
  testnet = false
) {
  const apiUrl = testnet ? STACKS_TESTNET_API_URL : STACKS_API_URL;
  const response = await fetch(`${apiUrl}/v2/accounts/${address}?proof=0`);
  if (!response.ok) {
    throw new Error(`Stacks API error: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchStacksTransaction(txId: string, testnet = false) {
  const apiUrl = testnet ? STACKS_TESTNET_API_URL : STACKS_API_URL;
  const response = await fetch(`${apiUrl}/extended/v1/tx/${txId}`);
  if (!response.ok) {
    throw new Error(`Stacks API error: ${response.statusText}`);
  }
  return await response.json();
}

// ============================================
// 5. Utility Functions
// ============================================

/**
 * Convert USD to BTC using current price
 */
export async function convertUSDtoBTC(usdAmount: number) {
  const btcPrice = await fetchBitcoinPrice();
  return usdAmount / btcPrice;
}

/**
 * Convert BTC to satoshis
 */
export function btcToSatoshis(btc: number) {
  return Math.floor(btc * 100000000);
}

/**
 * Convert satoshis to BTC
 */
export function satoshisToBTC(sats: number) {
  return sats / 100000000;
}

/**
 * Convert USD to satoshis
 */
export async function convertUSDtoSatoshis(usdAmount: number) {
  const btc = await convertUSDtoBTC(usdAmount);
  return btcToSatoshis(btc);
}

/**
 * Format currency with appropriate decimals
 */
export function formatCurrency(amount: number, currency = 'USD') {
  if (currency === 'BTC') {
    return `₿${amount.toFixed(8)}`;
  } else if (currency === 'sats') {
    return `${amount.toLocaleString()} sats`;
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
}

interface CacheEntry {
  data: any;
  timestamp: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL = 60000; // 1 minute

  get(key: string, ttl?: number): any {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    const maxAge = ttl || this.defaultTTL;

    if (age > maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new SimpleCache();

/**
 * Cached Bitcoin price fetch (1 minute cache)
 */
export async function fetchBitcoinPriceCached() {
  const cached = apiCache.get('btc-price');
  if (cached !== null) return cached;

  const price = await fetchBitcoinPrice();
  apiCache.set('btc-price', price);
  return price;
}

/**
 * Cached Stacks price fetch (1 minute cache)
 */
export async function fetchStacksPriceCached() {
  const cached = apiCache.get('stx-price');
  if (cached !== null) return cached;

  const price = await fetchStacksPrice();
  apiCache.set('stx-price', price);
  return price;
}

