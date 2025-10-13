# Public API Integrations Guide

## Overview

BitMind Smart Invoice includes comprehensive integrations with free, public APIs that require **no authentication or API keys**. These integrations enhance the application with real-time data and decentralized storage capabilities.

---

## 🌐 Integrated APIs

### 1. GitHub API
**Base URL**: `https://api.github.com`  
**Documentation**: https://docs.github.com/en/rest  
**Rate Limit**: 60 requests/hour (unauthenticated)

#### Features Integrated:
- ✅ Public user profile fetching
- ✅ Repository information
- ✅ User statistics (followers, repos, etc.)

#### Example Usage:

**Frontend (TypeScript):**
```typescript
import { fetchGitHubUser } from '@/services/publicApis';

const user = await fetchGitHubUser('octocat');
console.log(user.name, user.bio, user.followers);
```

**Backend (JavaScript):**
```javascript
const { fetchGitHubUser } = require('./utils/publicApis');

const user = await fetchGitHubUser('octocat');
```

#### Use Cases in BitMind:
- Display contributor profiles
- Link to project repositories
- Show developer credentials for arbitrators

---

### 2. IPFS (InterPlanetary File System)
**Public Gateways**: 
- `https://ipfs.io/ipfs/`
- `https://cloudflare-ipfs.com/ipfs/`
- `https://gateway.pinata.cloud/ipfs/`
- `https://dweb.link/ipfs/`

**Documentation**: https://docs.ipfs.tech/

#### Features Integrated:
- ✅ Multi-gateway fallback system
- ✅ JSON data fetching
- ✅ File/blob downloading
- ✅ Hash validation
- ✅ 10-second timeout per gateway

#### Example Usage:

**Frontend (TypeScript):**
```typescript
import { fetchIPFSJson, getIPFSUrl } from '@/services/publicApis';

// Fetch JSON data
const metadata = await fetchIPFSJson('QmYwAPJz...');

// Get gateway URL
const imageUrl = getIPFSUrl('QmXyz...', 0);
```

**Backend (JavaScript):**
```javascript
const { fetchFromIPFS } = require('./utils/publicApis');

const invoiceData = await fetchFromIPFS('QmAbc123...');
```

#### Use Cases in BitMind:
- ✅ Store invoice documents permanently
- ✅ Retrieve contract metadata
- ✅ Decentralized file sharing
- ✅ Immutable audit trails

---

### 3. CoinGecko API
**Base URL**: `https://api.coingecko.com/api/v3`  
**Documentation**: https://www.coingecko.com/en/api  
**Rate Limit**: 10-50 requests/minute (free tier)

#### Features Integrated:
- ✅ Bitcoin (BTC) price fetching
- ✅ Stacks (STX) price fetching
- ✅ Multiple cryptocurrency prices
- ✅ 24-hour price changes
- ✅ 1-minute caching to reduce API calls

#### Example Usage:

**Frontend (TypeScript):**
```typescript
import { 
  fetchBitcoinPrice, 
  fetchStacksPrice,
  convertUSDtoSatoshis 
} from '@/services/publicApis';

// Get current prices
const btcPrice = await fetchBitcoinPrice(); // in USD
const stxPrice = await fetchStacksPrice(); // in USD

// Convert USD to satoshis
const sats = await convertUSDtoSatoshis(100); // $100 → sats
```

**React Hook:**
```typescript
import { useCryptoPrices } from '@/hooks/useCryptoPrices';

function MyComponent() {
  const { prices, loading, refetch } = useCryptoPrices();
  
  return (
    <div>
      <p>BTC: ${prices.btc}</p>
      <p>STX: ${prices.stx}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

**Backend (JavaScript):**
```javascript
const { fetchBitcoinPriceCached } = require('./utils/publicApis');

// Cached for 1 minute to reduce API calls
const price = await fetchBitcoinPriceCached();
```

#### Use Cases in BitMind:
- ✅ Display live BTC/STX prices on dashboard
- ✅ Convert USD amounts to satoshis for invoices
- ✅ Show market data for payment decisions
- ✅ Calculate escrow values in real-time

---

### 4. Stacks Blockchain API
**Base URLs**: 
- Mainnet: `https://stacks-node-api.mainnet.stacks.co`
- Testnet: `https://stacks-node-api.testnet.stacks.co`

**Documentation**: https://docs.stacks.co/api

#### Features Integrated:
- ✅ Blockchain information fetching
- ✅ Account balance queries
- ✅ Transaction status checking
- ✅ Contract data reading

#### Example Usage:

**Frontend (TypeScript):**
```typescript
import { 
  fetchStacksBlockchainInfo,
  fetchStacksAccountBalance,
  fetchStacksTransaction
} from '@/services/publicApis';

// Get blockchain info
const info = await fetchStacksBlockchainInfo(false); // mainnet

// Get account balance
const account = await fetchStacksAccountBalance(address, true); // testnet

// Get transaction status
const tx = await fetchStacksTransaction(txId, true);
```

**Backend (JavaScript):**
```javascript
const { 
  getStacksBlockchainInfo,
  getStacksAccountBalance 
} = require('./utils/publicApis');

const info = await getStacksBlockchainInfo(false);
const balance = await getStacksAccountBalance(address, false);
```

#### Use Cases in BitMind:
- ✅ Check account balances before locking funds
- ✅ Verify transaction confirmations
- ✅ Display blockchain network status
- ✅ Read smart contract state

---

## 📦 File Structure

### Frontend Implementation
```
src/
├── services/
│   └── publicApis.ts        # Main API service (400+ lines)
│
├── hooks/
│   ├── useCryptoPrices.ts   # React hook for crypto prices
│   └── useIPFS.ts           # React hook for IPFS data
│
├── components/
│   └── PublicApiDemo.tsx    # Interactive demo component
│
└── pages/
    └── ApiDemo.tsx          # API demo page
```

### Backend Implementation
```
backend/src/
└── utils/
    └── publicApis.js        # Backend API utilities (300+ lines)
```

---

## 🎨 React Components & Hooks

### useCryptoPrices Hook
```typescript
function MyComponent() {
  const { 
    prices,      // { btc: number | null, stx: number | null }
    loading,     // boolean
    error,       // string | null
    refetch      // () => Promise<void>
  } = useCryptoPrices(
    true,        // autoFetch
    60000        // refresh interval (1 minute)
  );
  
  // Prices auto-refresh every minute
  // Cached to reduce API calls
}
```

### useIPFS Hook
```typescript
function MyComponent() {
  const { 
    data,        // T | null
    loading,     // boolean
    error,       // string | null
    fetchData,   // (hash: string) => Promise<void>
    reset        // () => void
  } = useIPFS<MyDataType>();
  
  // Fetch data manually
  await fetchData('QmXyz...');
}
```

### PublicApiDemo Component
Interactive demo showcasing all API integrations:
- GitHub user lookup
- Live crypto prices
- IPFS data fetching
- USD to satoshis converter

**Usage:**
```tsx
import { PublicApiDemo } from '@/components/PublicApiDemo';

<PublicApiDemo />
```

---

## 🚀 Live Features on Dashboard

### 1. Real-Time Price Banner
The main dashboard displays live BTC and STX prices:

```tsx
// Automatically updates every minute
// Data from CoinGecko API
// Cached to reduce API calls
```

**Location**: Home page (`src/pages/Index.tsx`)

### 2. API Demo Page
Interactive playground for testing all APIs:

**URL**: `/api-demo`  
**Features**:
- GitHub user search
- Live crypto price fetching
- IPFS hash lookup
- USD to satoshis converter

---

## 🔧 Utility Functions

### Currency Conversion
```typescript
// Convert USD to BTC
const btc = await convertUSDtoBTC(100); // $100 in BTC

// Convert USD to satoshis
const sats = await convertUSDtoSatoshis(100); // $100 in sats

// Convert between BTC and sats
const btc = satoshisToBTC(100000000); // 1 BTC
const sats = btcToSatoshis(0.5); // 50,000,000 sats
```

### Currency Formatting
```typescript
import { formatCurrency } from '@/services/publicApis';

formatCurrency(42000, 'USD');  // "$42,000.00"
formatCurrency(0.5, 'BTC');    // "₿0.50000000"
formatCurrency(50000000, 'sats'); // "50,000,000 sats"
```

### IPFS Validation
```typescript
import { isValidIPFSHash } from '@/services/publicApis';

isValidIPFSHash('QmYwAPJz...');  // true (CIDv0)
isValidIPFSHash('bafybeif...');  // true (CIDv1)
isValidIPFSHash('invalid');      // false
```

---

## 💾 Caching Strategy

### Frontend Cache
- **Implementation**: `SimpleCache` class in `publicApis.ts`
- **Default TTL**: 60 seconds (1 minute)
- **Cached APIs**: Bitcoin price, Stacks price
- **Benefits**: Reduces API calls, faster responses

### Backend Cache
- **Implementation**: `SimpleCache` class in `publicApis.js`
- **Default TTL**: 60 seconds
- **Cached APIs**: Bitcoin price (used in AI processor)
- **Benefits**: Rate limit compliance

**Example:**
```javascript
// First call fetches from API
const price1 = await fetchBitcoinPriceCached(); // API call

// Second call within 1 minute returns cached value
const price2 = await fetchBitcoinPriceCached(); // From cache
```

---

## 🛡️ Error Handling

### IPFS Multi-Gateway Fallback
If one gateway fails, automatically tries the next:

```typescript
// Tries 4 gateways in order:
1. ipfs.io
2. cloudflare-ipfs.com
3. gateway.pinata.cloud
4. dweb.link

// 10-second timeout per gateway
// Returns data from first successful gateway
```

### Graceful Degradation
All API calls include try-catch blocks:

```typescript
try {
  const price = await fetchBitcoinPrice();
  // Use price
} catch (error) {
  console.error('Failed to fetch price:', error);
  // Show cached/default value or error message
}
```

---

## 📊 Rate Limits & Best Practices

### GitHub API
- **Limit**: 60 requests/hour (unauthenticated)
- **Best Practice**: Cache user data, don't fetch on every page load
- **Header**: Check `X-RateLimit-Remaining` in response

### CoinGecko API
- **Limit**: 10-50 calls/minute (free tier)
- **Best Practice**: Use caching (implemented), batch requests
- **Recommendation**: Update prices every 1-5 minutes max

### IPFS Gateways
- **Limit**: Varies by gateway
- **Best Practice**: Use multiple gateways (implemented), cache CIDs
- **Recommendation**: 10-second timeout per request

### Stacks API
- **Limit**: Generally unrestricted for public endpoints
- **Best Practice**: Don't poll excessively, use websockets for real-time
- **Recommendation**: Cache blockchain info

---

## 🎯 Integration Examples

### Example 1: Display User with GitHub Data
```typescript
async function showContractorProfile(githubUsername: string) {
  const user = await fetchGitHubUser(githubUsername);
  
  return (
    <div>
      <img src={user.avatar_url} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
      <p>📦 {user.public_repos} repositories</p>
      <p>👥 {user.followers} followers</p>
    </div>
  );
}
```

### Example 2: Invoice with Real-Time USD→BTC Conversion
```typescript
async function createInvoiceWithConversion(usdAmount: number) {
  const satsAmount = await convertUSDtoSatoshis(usdAmount);
  const btcPrice = await fetchBitcoinPrice();
  
  return {
    usdAmount,
    satsAmount,
    btcPrice,
    displayText: `$${usdAmount} = ${satsAmount.toLocaleString()} sats`
  };
}
```

### Example 3: Fetch Invoice from IPFS
```typescript
async function loadInvoiceFromIPFS(ipfsHash: string) {
  const invoiceData = await fetchIPFSJson<InvoiceMetadata>(ipfsHash);
  
  return {
    ...invoiceData,
    ipfsUrl: getIPFSUrl(ipfsHash)
  };
}
```

---

## 🧪 Testing the APIs

### Quick Test Commands

**GitHub:**
```bash
curl https://api.github.com/users/octocat
```

**CoinGecko:**
```bash
curl 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
```

**IPFS:**
```bash
curl https://ipfs.io/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
```

**Stacks:**
```bash
curl https://stacks-node-api.testnet.stacks.co/v2/info
```

### Frontend Testing
Navigate to `/api-demo` in your application to test all APIs interactively.

---

## 📚 Additional Resources

- **GitHub API**: https://docs.github.com/en/rest
- **IPFS Docs**: https://docs.ipfs.tech/
- **CoinGecko API**: https://www.coingecko.com/en/api/documentation
- **Stacks API**: https://docs.stacks.co/api
- **IPFS Gateways**: https://ipfs.github.io/public-gateway-checker/

---

## ✨ Benefits of No-Auth APIs

1. **Zero Configuration**: No API keys to manage
2. **Instant Setup**: Works out of the box
3. **Public Data**: Perfect for demos and hackathons
4. **Free Tier**: No costs for basic usage
5. **Simple Integration**: Just `fetch()` calls
6. **Transparent**: No authentication complexity

---

## 🎓 Learning Resources

Want to add more public APIs? Check out:
- **Public APIs List**: https://github.com/public-apis/public-apis
- **RapidAPI Public**: https://rapidapi.com/category/Public
- **Any API**: https://any-api.com/

---

**All integrations are production-ready and included in the BitMind Smart Invoice application!** 🚀

