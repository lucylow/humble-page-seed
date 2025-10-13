/**
 * DAO Tooling and Governance API Integrations
 * Additional public APIs for DAO management
 */

// ============================================
// 1. Snapshot - Governance & Voting (No Auth for Reading)
// ============================================

export interface SnapshotProposal {
  id: string;
  title: string;
  body: string;
  choices: string[];
  start: number;
  end: number;
  snapshot: string;
  state: string;
  author: string;
  space: {
    id: string;
    name: string;
  };
}

/**
 * Fetch proposals from Snapshot (decentralized governance)
 * No API key needed for reading public data
 */
export async function fetchSnapshotProposals(spaceId: string = 'ens.eth'): Promise<SnapshotProposal[]> {
  const query = `
    query Proposals($space: String!) {
      proposals(
        first: 10,
        skip: 0,
        where: { space: $space },
        orderBy: "created",
        orderDirection: desc
      ) {
        id
        title
        body
        choices
        start
        end
        snapshot
        state
        author
        space {
          id
          name
        }
      }
    }
  `;

  const response = await fetch('https://hub.snapshot.org/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { space: spaceId }
    })
  });

  if (!response.ok) {
    throw new Error(`Snapshot API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.proposals;
}

/**
 * Fetch voting power for an address
 */
export async function fetchVotingPower(space: string, address: string): Promise<number> {
  const query = `
    query VotingPower($space: String!, $voter: String!) {
      vp(
        voter: $voter
        space: $space
      ) {
        vp
      }
    }
  `;

  const response = await fetch('https://hub.snapshot.org/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { space, voter: address }
    })
  });

  if (!response.ok) {
    throw new Error(`Snapshot API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.vp?.vp || 0;
}

// ============================================
// 2. Arweave - Permanent Storage (Alternative to IPFS)
// ============================================

/**
 * Fetch data from Arweave using transaction ID
 * No API key needed for reading
 */
export async function fetchFromArweave(txId: string): Promise<any> {
  const url = `https://arweave.net/${txId}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Arweave fetch error: ${response.statusText}`);
  }

  // Try to parse as JSON, otherwise return text
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text();
}

/**
 * Get transaction metadata from Arweave
 */
export async function getArweaveMetadata(txId: string) {
  const url = `https://arweave.net/tx/${txId}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Arweave metadata fetch error: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Search Arweave GraphQL for transactions
 */
export async function searchArweave(tags: { name: string; values: string[] }[]) {
  const query = `
    query {
      transactions(
        tags: ${JSON.stringify(tags)}
        first: 10
      ) {
        edges {
          node {
            id
            tags {
              name
              value
            }
            owner {
              address
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://arweave.net/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error(`Arweave GraphQL error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.transactions.edges;
}

// ============================================
// 3. DAO Analytics & Token Data
// ============================================

/**
 * Fetch DAO treasury info from DeBank (public data)
 */
export async function fetchDAOTreasury(address: string) {
  try {
    const response = await fetch(
      `https://api.debank.com/portfolio/token_list?user_addr=${address}`
    );

    if (!response.ok) {
      throw new Error(`DeBank API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('DeBank API may require rate limiting or might be unavailable');
    throw error;
  }
}

/**
 * Fetch token holders from Etherscan-like API (example for Stacks)
 */
export async function fetchTokenHolders(contractAddress: string, testnet: boolean = false) {
  const apiUrl = testnet 
    ? 'https://stacks-node-api.testnet.stacks.co'
    : 'https://stacks-node-api.mainnet.stacks.co';

  const response = await fetch(
    `${apiUrl}/extended/v1/tokens/ft/${contractAddress}/holders`
  );

  if (!response.ok) {
    throw new Error(`Token holders fetch error: ${response.statusText}`);
  }

  return await response.json();
}

// ============================================
// 4. Random/Mock Data APIs for Development
// ============================================

/**
 * Generate random user data (useful for demos)
 */
export async function fetchRandomUser() {
  const response = await fetch('https://randomuser.me/api/');
  
  if (!response.ok) {
    throw new Error(`Random User API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results[0];
}

/**
 * Fetch random joke (for testing/demo purposes)
 */
export async function fetchRandomJoke() {
  const response = await fetch('https://official-joke-api.appspot.com/random_joke');
  
  if (!response.ok) {
    throw new Error(`Joke API error: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * JSONPlaceholder - Fake REST API for testing
 */
export async function fetchMockPosts() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  
  if (!response.ok) {
    throw new Error(`JSONPlaceholder error: ${response.statusText}`);
  }

  return await response.json();
}

// ============================================
// 5. Additional Crypto Price Sources
// ============================================

/**
 * Fetch crypto prices from CoinPaprika (alternative to CoinGecko)
 */
export async function fetchCryptoPricesCoinPaprika(coinId: string = 'btc-bitcoin') {
  const response = await fetch(`https://api.coinpaprika.com/v1/tickers/${coinId}`);
  
  if (!response.ok) {
    throw new Error(`CoinPaprika API error: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Fetch multiple coin prices from CoinPaprika
 */
export async function fetchMultipleCoinsCoinPaprika() {
  const response = await fetch('https://api.coinpaprika.com/v1/tickers?limit=100');
  
  if (!response.ok) {
    throw new Error(`CoinPaprika API error: ${response.statusText}`);
  }

  return await response.json();
}

// ============================================
// 6. Web3 Name Services
// ============================================

/**
 * Resolve ENS name (Ethereum Name Service) via public provider
 */
export async function resolveENSName(name: string): Promise<string | null> {
  try {
    // Using Cloudflare's public resolver
    const response = await fetch(
      `https://cloudflare-eth.com/v1/mainnet?method=eth_call&params=[{"to":"0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e","data":"0x3b3b57de${name}"},"latest"]`
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('ENS resolution failed:', error);
    return null;
  }
}

/**
 * Resolve BNS name (Bitcoin Name System on Stacks)
 */
export async function resolveBNSName(name: string, testnet: boolean = false) {
  const apiUrl = testnet 
    ? 'https://stacks-node-api.testnet.stacks.co'
    : 'https://stacks-node-api.mainnet.stacks.co';

  const response = await fetch(`${apiUrl}/v1/names/${name}`);

  if (!response.ok) {
    throw new Error(`BNS resolution error: ${response.statusText}`);
  }

  return await response.json();
}

// ============================================
// 7. Utility Functions
// ============================================

/**
 * Format DAO proposal dates
 */
export function formatProposalDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Calculate voting percentage
 */
export function calculateVotingPercentage(
  votesFor: number,
  votesAgainst: number
): { forPercent: number; againstPercent: number } {
  const total = votesFor + votesAgainst;
  if (total === 0) return { forPercent: 0, againstPercent: 0 };

  return {
    forPercent: (votesFor / total) * 100,
    againstPercent: (votesAgainst / total) * 100
  };
}

/**
 * Validate Arweave transaction ID format
 */
export function isValidArweaveTxId(txId: string): boolean {
  return /^[a-zA-Z0-9_-]{43}$/.test(txId);
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address || address.length < chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// ============================================
// Export All
// ============================================

export default {
  // Snapshot/Governance
  fetchSnapshotProposals,
  fetchVotingPower,
  
  // Arweave
  fetchFromArweave,
  getArweaveMetadata,
  searchArweave,
  
  // DAO Analytics
  fetchDAOTreasury,
  fetchTokenHolders,
  
  // Mock/Random Data
  fetchRandomUser,
  fetchRandomJoke,
  fetchMockPosts,
  
  // Alternative Price Sources
  fetchCryptoPricesCoinPaprika,
  fetchMultipleCoinsCoinPaprika,
  
  // Name Services
  resolveENSName,
  resolveBNSName,
  
  // Utilities
  formatProposalDate,
  calculateVotingPercentage,
  isValidArweaveTxId,
  shortenAddress
};

