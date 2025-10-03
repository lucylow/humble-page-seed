// @ts-nocheck
// Utility Functions for Doma Subgraph Data Formatting and Conversion

// Format price from base units
export const formatPrice = (price: string | number, decimals: number = 18): number => {
  const priceNum = typeof price === 'string' ? parseFloat(price) : price;
  return priceNum / Math.pow(10, decimals);
};

// Convert to CAIP-10 format
export const toCAIP10 = (address: string, chainId: string = 'eip155:1'): string => {
  return `${chainId}:${address}`;
};

// Parse CAIP-10 format
export const fromCAIP10 = (caipAddress: string): { chainId: string; address: string } => {
  const parts = caipAddress.split(':');
  return {
    chainId: parts.slice(0, 2).join(':'),
    address: parts[2]
  };
};

// Check if a domain is expiring soon
export const isExpiringSoon = (expiryDate: string, daysThreshold: number = 30): boolean => {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= daysThreshold;
};

// Get network name from CAIP-2 ID
export const getNetworkName = (networkId: string): string => {
  const networkMap: Record<string, string> = {
    'eip155:1': 'Ethereum Mainnet',
    'eip155:5': 'Goerli Testnet',
    'eip155:137': 'Polygon Mainnet',
    'eip155:80001': 'Mumbai Testnet',
    'eip155:56': 'BSC Mainnet',
    'eip155:97': 'BSC Testnet',
    'eip155:42161': 'Arbitrum One',
    'eip155:421614': 'Arbitrum Sepolia',
    'eip155:10': 'Optimism',
    'eip155:11155420': 'Optimism Sepolia',
    'eip155:8453': 'Base',
    'eip155:84532': 'Base Sepolia'
  };
  return networkMap[networkId] || networkId;
};

// Format domain activity for display
export const formatActivity = (activity: Record<string, unknown>): {
  type: string;
  description: string;
  date: string;
  timestamp: string;
  transactionHash?: string;
} => {
  const base = {
    type: activity.type,
    date: new Date(activity.createdAt).toLocaleDateString(),
    timestamp: activity.createdAt
  };

  switch (activity.type) {
    case 'TOKENIZED': {
      return {
        ...base,
        description: `Domain tokenized on ${getNetworkName(activity.networkId as string)}`,
        transactionHash: activity.txHash as string
      };
    }
    case 'CLAIMED': {
      return {
        ...base,
        description: `Domain claimed by ${activity.claimedBy as string}`,
        transactionHash: activity.txHash as string
      };
    }
    case 'RENEWED': {
      return {
        ...base,
        description: `Domain renewed until ${new Date(activity.expiresAt as string).toLocaleDateString()}`,
        transactionHash: activity.txHash as string
      };
    }
    case 'DETOKENIZED': {
      return {
        ...base,
        description: `Domain detokenized on ${getNetworkName(activity.networkId as string)}`,
        transactionHash: activity.txHash as string
      };
    }
    default: {
      return {
        ...base,
        description: `Activity: ${activity.type as string}`
      };
    }
  }
};

// Format token activity for display
export const formatTokenActivity = (activity: Record<string, unknown>): {
  type: string;
  description: string;
  date: string;
  timestamp: string;
  transactionHash?: string;
  price?: number;
  currency?: string;
} => {
  const base = {
    type: activity.type,
    date: new Date(activity.createdAt).toLocaleDateString(),
    timestamp: activity.createdAt,
    transactionHash: activity.txHash
  };

  switch (activity.type) {
    case 'MINTED':
      return {
        ...base,
        description: `Token minted`
      };
    case 'TRANSFERRED':
      return {
        ...base,
        description: `Token transferred from ${activity.transferredFrom} to ${activity.transferredTo}`
      };
    case 'LISTED':
      return {
        ...base,
        description: `Token listed for ${formatPrice(activity.payment.price, activity.payment.currency.decimals)} ${activity.payment.currency.symbol}`,
        price: formatPrice(activity.payment.price, activity.payment.currency.decimals),
        currency: activity.payment.currency.symbol
      };
    case 'PURCHASED':
      return {
        ...base,
        description: `Token purchased by ${activity.buyer} for ${formatPrice(activity.payment.price, activity.payment.currency.decimals)} ${activity.payment.currency.symbol}`,
        price: formatPrice(activity.payment.price, activity.payment.currency.decimals),
        currency: activity.payment.currency.symbol
      };
    case 'OFFER_RECEIVED':
      return {
        ...base,
        description: `Offer received from ${activity.buyer} for ${formatPrice(activity.payment.price, activity.payment.currency.decimals)} ${activity.payment.currency.symbol}`,
        price: formatPrice(activity.payment.price, activity.payment.currency.decimals),
        currency: activity.payment.currency.symbol
      };
    default:
      return {
        ...base,
        description: `Token activity: ${activity.type}`
      };
  }
};

// Format domain listing for display
export const formatListing = (listing: Record<string, unknown>): {
  id: string;
  name: string;
  price: number;
  currency: string;
  formattedPrice: string;
  expiresAt: string;
  daysUntilExpiry: number;
  network: string;
  owner: string;
} => {
  const price = formatPrice(listing.price, listing.currency.decimals);
  const expiresAt = new Date(listing.expiresAt);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    id: listing.id,
    name: listing.name,
    price,
    currency: listing.currency.symbol,
    formattedPrice: `${price.toFixed(4)} ${listing.currency.symbol}`,
    expiresAt: expiresAt.toLocaleDateString(),
    daysUntilExpiry,
    network: getNetworkName(listing.chain.networkId),
    owner: listing.offererAddress
  };
};

// Format domain offer for display
export const formatOffer = (offer: Record<string, unknown>): {
  id: string;
  name: string;
  price: number;
  currency: string;
  formattedPrice: string;
  expiresAt: string;
  daysUntilExpiry: number;
  network: string;
  offerer: string;
} => {
  const price = formatPrice(offer.price, offer.currency.decimals);
  const expiresAt = new Date(offer.expiresAt);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    id: offer.id,
    name: offer.name,
    price,
    currency: offer.currency.symbol,
    formattedPrice: `${price.toFixed(4)} ${offer.currency.symbol}`,
    expiresAt: expiresAt.toLocaleDateString(),
    daysUntilExpiry,
    network: getNetworkName(offer.chain.networkId),
    offerer: offer.offererAddress
  };
};

// Calculate domain value score based on various factors
export const calculateDomainValueScore = (domain: Record<string, unknown>): {
  score: number;
  factors: {
    length: number;
    tld: number;
    keywords: number;
    expiration: number;
    activity: number;
  };
} => {
  const factors = {
    length: 0,
    tld: 0,
    keywords: 0,
    expiration: 0,
    activity: 0
  };

  // Length factor (shorter domains are generally more valuable)
  const domainLength = domain.name.length;
  if (domainLength <= 3) factors.length = 100;
  else if (domainLength <= 5) factors.length = 80;
  else if (domainLength <= 8) factors.length = 60;
  else if (domainLength <= 12) factors.length = 40;
  else factors.length = 20;

  // TLD factor
  const tld = domain.name.split('.').pop()?.toLowerCase();
  const premiumTlds = ['.com', '.org', '.net', '.io', '.ai', '.xyz'];
  if (premiumTlds.includes(`.${tld}`)) {
    factors.tld = 100;
  } else if (['.co', '.me', '.us', '.uk'].includes(`.${tld}`)) {
    factors.tld = 80;
  } else {
    factors.tld = 60;
  }

  // Keywords factor (basic implementation)
  const keywords = ['crypto', 'nft', 'web3', 'defi', 'dao', 'metaverse', 'blockchain'];
  const hasKeywords = keywords.some(keyword => 
    domain.name.toLowerCase().includes(keyword)
  );
  factors.keywords = hasKeywords ? 80 : 50;

  // Expiration factor
  const expiryDate = new Date(domain.expiresAt);
  const now = new Date();
  const yearsUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365);
  if (yearsUntilExpiry >= 5) factors.expiration = 100;
  else if (yearsUntilExpiry >= 2) factors.expiration = 80;
  else if (yearsUntilExpiry >= 1) factors.expiration = 60;
  else factors.expiration = 30;

  // Activity factor
  const activityCount = domain.activities?.length || 0;
  if (activityCount >= 10) factors.activity = 100;
  else if (activityCount >= 5) factors.activity = 80;
  else if (activityCount >= 2) factors.activity = 60;
  else factors.activity = 40;

  // Calculate weighted score
  const weights = {
    length: 0.25,
    tld: 0.25,
    keywords: 0.15,
    expiration: 0.20,
    activity: 0.15
  };

  const score = Object.entries(factors).reduce((total, [key, value]) => {
    return total + (value * weights[key as keyof typeof weights]);
  }, 0);

  return { score: Math.round(score), factors };
};

// Sort domains by various criteria
export const sortDomains = (domains: Record<string, unknown>[], criteria: string, order: 'asc' | 'desc' = 'desc'): Record<string, unknown>[] => {
  const sorted = [...domains].sort((a, b) => {
    let comparison = 0;

    switch (criteria) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'expiresAt':
        comparison = new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        break;
      case 'tokenizedAt':
        comparison = new Date(a.tokenizedAt || 0).getTime() - new Date(b.tokenizedAt || 0).getTime();
        break;
      case 'value': {
        const scoreA = calculateDomainValueScore(a).score;
        const scoreB = calculateDomainValueScore(b).score;
        comparison = scoreA - scoreB;
        break;
      }
      case 'activity': {
        const activityA = (a.activities as unknown[])?.length || 0;
        const activityB = (b.activities as unknown[])?.length || 0;
        comparison = activityA - activityB;
        break;
      }
      default:
        comparison = 0;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
};

// Filter domains by various criteria
export const filterDomains = (domains: Record<string, unknown>[], filters: {
  tlds?: string[];
  networks?: string[];
  expiringSoon?: boolean;
  hasTokens?: boolean;
  minValueScore?: number;
  searchTerm?: string;
}): Record<string, unknown>[] => {
  return domains.filter(domain => {
    // TLD filter
    if (filters.tlds && filters.tlds.length > 0) {
      const domainTld = `.${(domain.name as string).split('.').pop()}`;
      if (!filters.tlds.includes(domainTld)) return false;
    }

    // Network filter
    if (filters.networks && filters.networks.length > 0) {
      const domainNetworks = (domain.tokens as Record<string, unknown>[])?.map((token: Record<string, unknown>) => token.networkId) || [];
      const hasMatchingNetwork = domainNetworks.some((network: string) => 
        filters.networks!.includes(network)
      );
      if (!hasMatchingNetwork) return false;
    }

    // Expiring soon filter
    if (filters.expiringSoon) {
      if (!isExpiringSoon(domain.expiresAt as string)) return false;
    }

    // Has tokens filter
    if (filters.hasTokens !== undefined) {
      const hasTokens = domain.tokens && (domain.tokens as unknown[]).length > 0;
      if (hasTokens !== filters.hasTokens) return false;
    }

    // Minimum value score filter
    if (filters.minValueScore !== undefined) {
      const valueScore = calculateDomainValueScore(domain).score;
      if (valueScore < filters.minValueScore) return false;
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      if (!(domain.name as string).toLowerCase().includes(searchLower)) return false;
    }

    return true;
  });
};

// Generate domain analytics summary
export const generateDomainAnalytics = (domain: Record<string, unknown>): {
  totalTokens: number;
  networks: string[];
  totalActivity: number;
  valueScore: number;
  status: string;
  expiringSoon: boolean;
} => {
  const tokens = (domain.tokens as Record<string, unknown>[]) || [];
  const activities = (domain.activities as Record<string, unknown>[]) || [];
  const valueScore = calculateDomainValueScore(domain).score;
  const expiringSoon = isExpiringSoon(domain.expiresAt as string);

  return {
    totalTokens: tokens.length,
    networks: [...new Set(tokens.map((token: Record<string, unknown>) => token.networkId as string))],
    totalActivity: activities.length,
    valueScore,
    status: (domain.eoi as boolean) ? 'EOI' : 'Tokenized',
    expiringSoon
  };
};

// Format currency amount with proper decimals
export const formatCurrency = (amount: string | number, currency: string, decimals: number = 18): string => {
  const formattedAmount = formatPrice(amount, decimals);
  
  if (currency === 'ETH') {
    return `${formattedAmount.toFixed(4)} ETH`;
  } else if (currency === 'USDC' || currency === 'USDT') {
    return `$${formattedAmount.toFixed(2)}`;
  } else {
    return `${formattedAmount.toFixed(4)} ${currency}`;
  }
};

// Get domain status color for UI
export const getDomainStatusColor = (domain: Record<string, unknown>): string => {
  if (domain.eoi) return 'blue';
  if (isExpiringSoon(domain.expiresAt as string)) return 'orange';
  if (domain.tokens && (domain.tokens as unknown[]).length > 0) return 'green';
  return 'gray';
};

// Get domain status text for UI
export const getDomainStatusText = (domain: Record<string, unknown>): string => {
  if (domain.eoi) return 'EOI';
  if (isExpiringSoon(domain.expiresAt as string)) return 'Expiring Soon';
  if (domain.tokens && (domain.tokens as unknown[]).length > 0) return 'Tokenized';
  return 'Available';
};
