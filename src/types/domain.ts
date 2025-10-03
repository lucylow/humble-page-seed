// Domain-related types and interfaces for DomaLand.AI

export interface DomainAsset {
  id: string;
  name: string;
  tld: string;
  fullName: string; // e.g., "web3hub.com"
  owner: string;
  tokenId?: string; // NFT token ID if tokenized
  isTokenized: boolean;
  valuation: DomainValuation;
  metadata: DomainMetadata;
  tradingHistory: TradingRecord[];
  fractionalShares?: FractionalShareInfo;
  createdAt: number;
  updatedAt: number;
}

export interface DomainValuation {
  estimatedValue: number; // in USD
  confidence: number; // 0-100
  factors: ValuationFactor[];
  lastUpdated: number;
  aiModel: string;
}

export interface ValuationFactor {
  type: 'traffic' | 'keywords' | 'length' | 'tld' | 'brandability' | 'market_comparison';
  weight: number;
  score: number;
  description: string;
}

export interface DomainMetadata {
  description?: string;
  category: string;
  keywords: string[];
  traffic?: TrafficData;
  backlinks?: number;
  age?: number;
  registrar?: string;
  expiryDate?: number;
  customLandingPage?: string;
}

export interface TrafficData {
  monthlyVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topCountries: { country: string; percentage: number }[];
  topReferrers: { source: string; percentage: number }[];
}

export interface TradingRecord {
  id: string;
  type: 'sale' | 'offer' | 'auction' | 'fractional_trade';
  price: number;
  currency: string;
  buyer?: string;
  seller?: string;
  timestamp: number;
  transactionHash?: string;
  shares?: number; // for fractional trades
}

export interface FractionalShareInfo {
  totalShares: number;
  sharesSold: number;
  pricePerShare: number;
  vaultAddress: string;
  tokenAddress: string;
  isActive: boolean;
  minimumInvestment: number;
  maximumInvestment?: number;
}

export interface DomainOffer {
  id: string;
  domainId: string;
  offerer: string;
  amount: number;
  currency: string;
  expiresAt: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  message?: string;
  createdAt: number;
}

export interface RoyaltyDistribution {
  domainId: string;
  totalRevenue: number;
  distribution: {
    owner: number;
    fractionalHolders: number;
    protocol: number;
  };
  lastDistribution: number;
  nextDistribution: number;
}

export interface DomainPortfolio {
  owner: string;
  domains: DomainAsset[];
  totalValue: number;
  totalShares: number;
  monthlyRevenue: number;
  performance: {
    totalReturn: number;
    monthlyReturn: number;
    bestPerformer: string;
    worstPerformer: string;
  };
}

// API Response types
export interface DomainSearchResult {
  domains: DomainAsset[];
  total: number;
  page: number;
  limit: number;
  filters: SearchFilters;
}

export interface SearchFilters {
  minValue?: number;
  maxValue?: number;
  tld?: string[];
  category?: string[];
  isTokenized?: boolean;
  hasFractionalShares?: boolean;
  sortBy?: 'value' | 'traffic' | 'age' | 'created';
  sortOrder?: 'asc' | 'desc';
}

// Smart contract interaction types
export interface TokenizationParams {
  domainName: string;
  valuation: DomainValuation;
  metadata: DomainMetadata;
  royaltyPercentage: number;
}

export interface FractionalizationParams {
  domainId: string;
  totalShares: number;
  pricePerShare: number;
  minimumInvestment: number;
  maximumInvestment?: number;
}

export interface TradeParams {
  domainId: string;
  shares: number;
  price: number;
  isBuy: boolean;
}

// Event types for real-time updates
export interface DomainEvent {
  type: 'tokenized' | 'fractionalized' | 'traded' | 'offer_made' | 'offer_accepted' | 'valuation_updated';
  domainId: string;
  data: Record<string, unknown>;
  timestamp: number;
  transactionHash?: string;
}