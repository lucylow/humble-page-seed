// Utility functions for Doma Protocol API integration

// Format price from wei/base units
export const formatPrice = (price: string | number, decimals: number = 18): number => {
  const priceNumber = typeof price === 'string' ? parseFloat(price) : price;
  return priceNumber / Math.pow(10, decimals);
};

// Format price to display string
export const formatPriceDisplay = (
  price: string | number, 
  decimals: number = 18, 
  currency: string = 'ETH',
  precision: number = 4
): string => {
  const formattedPrice = formatPrice(price, decimals);
  return `${formattedPrice.toFixed(precision)} ${currency}`;
};

// Convert to CAIP-10 format
export const toCAIP10 = (address: string, chainId: string = 'eip155:1'): string => {
  if (!address) throw new Error('Address is required');
  if (!address.startsWith('0x')) throw new Error('Address must start with 0x');
  return `${chainId}:${address}`;
};

// Parse CAIP-10 format
export const fromCAIP10 = (caipAddress: string): { chainId: string; address: string } => {
  if (!caipAddress) throw new Error('CAIP-10 address is required');
  
  const parts = caipAddress.split(':');
  if (parts.length < 3) throw new Error('Invalid CAIP-10 format');
  
  return {
    chainId: parts.slice(0, 2).join(':'),
    address: parts[2]
  };
};

// Check if a domain is expiring soon
export const isExpiringSoon = (expiryDate: string | Date, daysThreshold: number = 30): boolean => {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= daysThreshold && diffDays > 0;
};

// Get days until expiry
export const getDaysUntilExpiry = (expiryDate: string | Date): number => {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Format domain for display
export const formatDomainName = (domainName: string): string => {
  if (!domainName) return '';
  return domainName.toLowerCase().trim();
};

// Validate domain name format
export const isValidDomainName = (domainName: string): boolean => {
  if (!domainName) return false;
  
  // Basic domain validation regex
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return domainRegex.test(domainName);
};

// Extract TLD from domain name
export const extractTLD = (domainName: string): string => {
  if (!domainName) return '';
  const parts = domainName.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
};

// Extract SLD (Second Level Domain) from domain name
export const extractSLD = (domainName: string): string => {
  if (!domainName) return '';
  const parts = domainName.split('.');
  return parts.length > 1 ? parts[parts.length - 2] : domainName;
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
    'eip155:421613': 'Arbitrum Goerli',
    'eip155:10': 'Optimism',
    'eip155:420': 'Optimism Goerli',
    'eip155:250': 'Fantom Opera',
    'eip155:4002': 'Fantom Testnet',
    'eip155:43114': 'Avalanche C-Chain',
    'eip155:43113': 'Avalanche Fuji',
  };
  return networkMap[networkId] || networkId;
};

// Get chain ID from network name
export const getChainId = (networkName: string): string => {
  const chainMap: Record<string, string> = {
    'ethereum': 'eip155:1',
    'goerli': 'eip155:5',
    'polygon': 'eip155:137',
    'mumbai': 'eip155:80001',
    'bsc': 'eip155:56',
    'bsc-testnet': 'eip155:97',
    'arbitrum': 'eip155:42161',
    'arbitrum-goerli': 'eip155:421613',
    'optimism': 'eip155:10',
    'optimism-goerli': 'eip155:420',
    'fantom': 'eip155:250',
    'fantom-testnet': 'eip155:4002',
    'avalanche': 'eip155:43114',
    'avalanche-fuji': 'eip155:43113',
  };
  return chainMap[networkName.toLowerCase()] || networkName;
};

// Format timestamp to readable date
export const formatTimestamp = (timestamp: string | number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (timestamp: string | number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

// Truncate address for display
export const truncateAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

// Truncate domain name for display
export const truncateDomain = (domain: string, maxLength: number = 20): string => {
  if (!domain) return '';
  if (domain.length <= maxLength) return domain;
  return `${domain.slice(0, maxLength - 3)}...`;
};

// Generate domain avatar/icon URL
export const getDomainAvatar = (domainName: string, size: number = 64): string => {
  const cleanDomain = domainName.replace(/[^a-zA-Z0-9.-]/g, '');
  return `https://api.doma.xyz/avatar/${cleanDomain}?size=${size}`;
};

// Generate domain thumbnail URL
export const getDomainThumbnail = (domainName: string, size: number = 200): string => {
  const cleanDomain = domainName.replace(/[^a-zA-Z0-9.-]/g, '');
  return `https://api.doma.xyz/thumbnail/${cleanDomain}?size=${size}`;
};

// Check if domain is premium
export const isPremiumDomain = (domainName: string): boolean => {
  const premiumKeywords = [
    'crypto', 'bitcoin', 'ethereum', 'blockchain', 'defi', 'nft', 'web3',
    'ai', 'artificial', 'intelligence', 'tech', 'technology', 'finance',
    'bank', 'money', 'invest', 'trading', 'exchange', 'market'
  ];
  
  const cleanDomain = domainName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
  return premiumKeywords.some(keyword => cleanDomain.includes(keyword));
};

// Estimate domain value based on length and keywords
export const estimateDomainValue = (domainName: string): { min: number; max: number; confidence: 'low' | 'medium' | 'high' } => {
  const cleanDomain = domainName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
  const length = cleanDomain.length;
  
  let baseValue = 0;
  let confidence: 'low' | 'medium' | 'high' = 'low';
  
  // Length-based valuation
  if (length <= 3) {
    baseValue = 10000;
    confidence = 'high';
  } else if (length <= 5) {
    baseValue = 5000;
    confidence = 'high';
  } else if (length <= 8) {
    baseValue = 1000;
    confidence = 'medium';
  } else {
    baseValue = 100;
    confidence = 'low';
  }
  
  // Premium keyword multiplier
  if (isPremiumDomain(domainName)) {
    baseValue *= 2;
    confidence = confidence === 'low' ? 'medium' : 'high';
  }
  
  // TLD multiplier
  const tld = extractTLD(domainName);
  const tldMultipliers: Record<string, number> = {
    '.com': 1.0,
    '.org': 0.8,
    '.net': 0.7,
    '.io': 0.9,
    '.ai': 1.2,
    '.xyz': 0.6,
    '.co': 0.8,
  };
  
  const multiplier = tldMultipliers[tld] || 0.5;
  baseValue *= multiplier;
  
  return {
    min: Math.floor(baseValue * 0.5),
    max: Math.floor(baseValue * 2),
    confidence
  };
};

// Sort domains by various criteria
export const sortDomains = (
  domains: unknown[], 
  sortBy: 'name' | 'price' | 'expiry' | 'created' | 'length',
  order: 'asc' | 'desc' = 'asc'
): unknown[] => {
  return [...domains].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name': {
        const domainA = a as { name: string };
        const domainB = b as { name: string };
        comparison = domainA.name.localeCompare(domainB.name);
        break;
      }
      case 'price': {
        const domainA = a as { price?: string };
        const domainB = b as { price?: string };
        const priceA = parseFloat(domainA.price || '0');
        const priceB = parseFloat(domainB.price || '0');
        comparison = priceA - priceB;
        break;
      }
      case 'expiry': {
        const domainA = a as { expiresAt: string };
        const domainB = b as { expiresAt: string };
        comparison = new Date(domainA.expiresAt).getTime() - new Date(domainB.expiresAt).getTime();
        break;
      }
      case 'created': {
        const domainA = a as { createdAt?: string; tokenizedAt?: string };
        const domainB = b as { createdAt?: string; tokenizedAt?: string };
        comparison = new Date(domainA.createdAt || domainA.tokenizedAt || '').getTime() - new Date(domainB.createdAt || domainB.tokenizedAt || '').getTime();
        break;
      }
      case 'length': {
        const domainA = a as { name: string };
        const domainB = b as { name: string };
        comparison = domainA.name.length - domainB.name.length;
        break;
      }
      default:
        comparison = 0;
    }
    
    return order === 'desc' ? -comparison : comparison;
  });
};

// Filter domains by various criteria
export const filterDomains = (
  domains: unknown[],
  filters: {
    tld?: string[];
    priceRange?: { min: number; max: number };
    expiringSoon?: boolean;
    isListed?: boolean;
    networkIds?: string[];
    searchTerm?: string;
  }
): unknown[] => {
  return domains.filter(domain => {
    const domainObj = domain as {
      name: string;
      price?: string;
      expiresAt: string;
      isListed?: boolean;
      tokens?: Array<{ networkId: string }>;
    };

    // TLD filter
    if (filters.tld && filters.tld.length > 0) {
      const domainTld = extractTLD(domainObj.name);
      if (!filters.tld.includes(domainTld)) return false;
    }
    
    // Price range filter
    if (filters.priceRange) {
      const price = parseFloat(domainObj.price || '0');
      if (price < filters.priceRange.min || price > filters.priceRange.max) return false;
    }
    
    // Expiring soon filter
    if (filters.expiringSoon && !isExpiringSoon(domainObj.expiresAt)) return false;
    
    // Listed filter
    if (filters.isListed !== undefined && domainObj.isListed !== filters.isListed) return false;
    
    // Network filter
    if (filters.networkIds && filters.networkIds.length > 0) {
      const domainNetworks = domainObj.tokens?.map((token) => token.networkId) || [];
      if (!domainNetworks.some((networkId: string) => filters.networkIds!.includes(networkId))) return false;
    }
    
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      if (!domainObj.name.toLowerCase().includes(searchLower)) return false;
    }
    
    return true;
  });
};

// Generate pagination info
export const generatePaginationInfo = (
  currentPage: number,
  pageSize: number,
  totalCount: number
): {
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startIndex: number;
  endIndex: number;
} => {
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  
  return {
    totalPages,
    hasPreviousPage,
    hasNextPage,
    startIndex,
    endIndex,
  };
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate random nonce
export const generateNonce = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Convert seconds to human readable duration
export const formatDuration = (seconds: number): string => {
  const units = [
    { name: 'year', seconds: 31536000 },
    { name: 'month', seconds: 2592000 },
    { name: 'day', seconds: 86400 },
    { name: 'hour', seconds: 3600 },
    { name: 'minute', seconds: 60 },
    { name: 'second', seconds: 1 },
  ];
  
  for (const unit of units) {
    const value = Math.floor(seconds / unit.seconds);
    if (value > 0) {
      return `${value} ${unit.name}${value > 1 ? 's' : ''}`;
    }
  }
  
  return '0 seconds';
};

// Check if address is valid Ethereum address
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Convert hex string to number
export const hexToNumber = (hex: string): number => {
  return parseInt(hex, 16);
};

// Convert number to hex string
export const numberToHex = (num: number): string => {
  return '0x' + num.toString(16);
};

// Sleep utility for delays
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry utility for API calls
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) break;
      await sleep(delay * attempt);
    }
  }
  
  throw lastError!;
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
