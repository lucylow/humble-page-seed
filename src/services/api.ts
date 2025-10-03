import { DomainAsset, DomainOffer, TradingRecord } from '../types/domain';

export interface User {
  id: string;
  address: string;
  email?: string;
}

export interface DomainTransaction {
  id: string;
  type: string;
  amount: number;
}

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  total_count?: number;
  has_more?: boolean;
}

// Domain API Types
interface DomainRegistrationData {
  user_id: number;
  domain_name: string;
  owner_address?: string;
  estimated_value?: number;
  registrar_iana_id?: number;
}

interface TokenizationData {
  chain_name: string;
  owner_address: string;
}

interface ClaimData {
  token_id: number;
  registrant_handle: number;
}

interface BridgeData {
  target_chain: string;
  target_address: string;
}

interface ListingData {
  price: number;
}

// AI Valuation Types
interface AIValuationRequest {
  domain_name: string;
  additional_data?: Record<string, unknown>;
}

interface AIValuationResponse {
  domain_name: string;
  estimated_value: number;
  confidence_score: number;
  valuation_breakdown: {
    length_score: number;
    memorability_score: number;
    brandability_score: number;
    seo_potential: number;
    extension_value: number;
    market_trends: number;
    overall_score: number;
  };
  value_drivers: string[];
  comparable_sales: Array<{
    domain: string;
    sale_price: number;
    sale_date: string;
    pattern_match: string;
    relevance_score: number;
  }>;
  market_analysis: {
    analysis: string;
    market_segment: string;
    liquidity_score: number;
    risk_level: string;
  };
  investment_recommendation: {
    recommendation: string;
    reasoning: string;
    confidence: number;
    target_price_range: {
      low: number;
      high: number;
    };
  };
  valuation_date: string;
}

// Fractionalization Types
interface FractionalizationProposal {
  domain_id: number;
  proposer_id: number;
  total_shares: number;
  share_price: number;
  minimum_investment: number;
  voting_threshold: number;
  proposal_expires: string;
  governance_model: string;
}

interface SharePurchaseData {
  share_amount: number;
  payment_details: {
    method: string;
    [key: string]: unknown;
  };
}

interface GovernanceProposal {
  proposal_id: string;
  domain_id: number;
  proposer_id: number;
  type: string;
  title: string;
  description: string;
  parameters: Record<string, unknown>;
  voting_starts: string;
  voting_ends: string;
  quorum_required: number;
  status: string;
  votes_for: number;
  votes_against: number;
  total_voting_power: number;
}

// AMM Types
interface LiquidityPool {
  pool_id: string;
  domain_id: number;
  base_token: string;
  domain_token_reserve: number;
  base_token_reserve: number;
  total_liquidity_tokens: number;
  fee_rate: number;
  created_at: string;
  last_updated: string;
}

interface LiquidityPosition {
  position_id: string;
  pool_id: string;
  user_id: number;
  liquidity_tokens: number;
  initial_domain_amount: number;
  initial_base_amount: number;
  created_at: string;
  rewards_earned: number;
}

interface TradeQuote {
  input_token: string;
  output_token: string;
  input_amount: number;
  output_amount: number;
  price_impact: number;
  fee_amount: number;
  minimum_output: number;
  valid_until: string;
}

// Analytics Types
interface DashboardData {
  timestamp: string;
  market_overview: {
    total_domains: number;
    tokenized_domains: number;
    total_market_cap: number;
    avg_domain_value: number;
    market_change_24h: number;
    active_traders: number;
    transaction_volume_24h: number;
    transaction_count_24h: number;
  };
  trending_domains: Array<{
    domain: DomainAsset;
    trending_score: number;
    metrics: Record<string, unknown>;
  }>;
  blockchain_metrics: Record<string, unknown>;
  portfolio_metrics: Record<string, unknown>;
  market_trends: Array<{
    trend_type: string;
    strength: number;
    duration_days: number;
    affected_domains: number[];
    trend_drivers: string[];
    confidence_score: number;
  }>;
  network_health: {
    overall_health: string;
    success_rate: number;
    avg_confirmation_time: number;
    network_congestion: number;
    total_transactions_24h: number;
  };
  alerts: Array<{
    type: string;
    severity: string;
    message: string;
    domain_id?: number;
    action_required: boolean;
  }>;
  recommendations: Array<{
    type: string;
    priority: string;
    title: string;
    description: string;
    action: string;
  }>;
}

// API Service Class
export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Domain Management APIs
  async getDomains(params?: {
    user_id?: number;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<DomainAsset[]>> {
    const queryParams = new URLSearchParams();
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const endpoint = `/domains${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<DomainAsset[]>(endpoint);
  }

  async registerDomain(data: DomainRegistrationData): Promise<ApiResponse<DomainAsset>> {
    return this.request<DomainAsset>('/domains', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDomainDetails(domainId: number): Promise<ApiResponse<DomainAsset>> {
    return this.request<DomainAsset>(`/domains/${domainId}`);
  }

  async tokenizeDomain(domainId: number, data: TokenizationData): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request(`/domains/${domainId}/tokenize`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async claimDomainOwnership(domainId: number, data: ClaimData): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request(`/domains/${domainId}/claim`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bridgeDomainToken(domainId: number, data: BridgeData): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request(`/domains/${domainId}/bridge`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listDomainForSale(domainId: number, data: ListingData): Promise<ApiResponse<DomainAsset>> {
    return this.request<DomainAsset>(`/domains/${domainId}/list`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async unlistDomain(domainId: number): Promise<ApiResponse<DomainAsset>> {
    return this.request<DomainAsset>(`/domains/${domainId}/unlist`, {
      method: 'POST',
    });
  }

  async getMarketplaceDomains(params?: {
    limit?: number;
    offset?: number;
    min_price?: number;
    max_price?: number;
    tld?: string;
  }): Promise<ApiResponse<DomainAsset[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.min_price) queryParams.append('min_price', params.min_price.toString());
    if (params?.max_price) queryParams.append('max_price', params.max_price.toString());
    if (params?.tld) queryParams.append('tld', params.tld);

    const endpoint = `/marketplace${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<DomainAsset[]>(endpoint);
  }

  // Transaction APIs
  async getTransactions(params?: {
    user_id?: number;
    domain_id?: number;
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<DomainTransaction[]>> {
    const queryParams = new URLSearchParams();
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
    if (params?.domain_id) queryParams.append('domain_id', params.domain_id.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const endpoint = `/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<DomainTransaction[]>(endpoint);
  }

  async updateTransactionStatus(transactionId: number): Promise<ApiResponse<DomainTransaction>> {
    return this.request<DomainTransaction>(`/transactions/${transactionId}/status`, {
      method: 'PUT',
    });
  }

  // Statistics APIs
  async getDomainStats(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request('/stats');
  }

  async getSupportedChains(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request('/chains');
  }

  // AI Valuation APIs
  async getAIValuation(domainId: number, data: AIValuationRequest): Promise<ApiResponse<AIValuationResponse>> {
    return this.request<AIValuationResponse>(`/domains/${domainId}/ai-valuation`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBatchValuation(domains: string[]): Promise<ApiResponse<AIValuationResponse[]>> {
    return this.request<AIValuationResponse[]>('/domains/batch-valuation', {
      method: 'POST',
      body: JSON.stringify({ domains }),
    });
  }

  // Fractionalization APIs
  async createFractionalizationProposal(domainId: number, data: Partial<FractionalizationProposal>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request(`/domains/${domainId}/fractionalize/propose`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async executeFractionalization(domainId: number, data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request(`/domains/${domainId}/fractionalize/execute`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async purchaseShares(domainId: number, data: SharePurchaseData): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request(`/domains/${domainId}/shares/purchase`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createGovernanceProposal(domainId: number, data: Partial<GovernanceProposal>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request(`/domains/${domainId}/governance/propose`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async voteOnProposal(proposalId: string, vote: 'for' | 'against'): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request(`/governance/${proposalId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    });
  }

  async getDomainShareholders(domainId: number): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request(`/domains/${domainId}/shareholders`);
  }

  async distributeRevenue(domainId: number, totalRevenue: number): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request(`/domains/${domainId}/revenue/distribute`, {
      method: 'POST',
      body: JSON.stringify({ total_revenue: totalRevenue }),
    });
  }

  // AMM APIs
  async createLiquidityPool(data: {
    domain_id: number;
    base_token: string;
    initial_domain_amount: number;
    initial_base_amount: number;
  }): Promise<ApiResponse<LiquidityPool>> {
    return this.request<LiquidityPool>('/amm/pools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addLiquidity(poolId: string, data: {
    domain_amount: number;
    base_amount: number;
  }): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request(`/amm/pools/${poolId}/add-liquidity`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeLiquidity(poolId: string, data: {
    liquidity_tokens: number;
  }): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request(`/amm/pools/${poolId}/remove-liquidity`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTradeQuote(poolId: string, data: {
    input_token: string;
    input_amount: number;
    slippage_tolerance?: number;
  }): Promise<ApiResponse<TradeQuote>> {
    return this.request<TradeQuote>(`/amm/pools/${poolId}/quote`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async executeTrade(poolId: string, quote: TradeQuote): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request(`/amm/pools/${poolId}/swap`, {
      method: 'POST',
      body: JSON.stringify(quote),
    });
  }

  async getPoolAnalytics(poolId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request(`/amm/pools/${poolId}/analytics`);
  }

  async getUserPositions(userId: number): Promise<ApiResponse<LiquidityPosition[]>> {
    return this.request<LiquidityPosition[]>(`/amm/users/${userId}/positions`);
  }

  async getPools(): Promise<ApiResponse<LiquidityPool[]>> {
    return this.request<LiquidityPool[]>('/amm/pools');
  }

  // Analytics APIs
  async getDashboard(userId?: number): Promise<ApiResponse<DashboardData>> {
    const endpoint = userId ? `/analytics/dashboard?user_id=${userId}` : '/analytics/dashboard';
    return this.request<DashboardData>(endpoint);
  }

  async getDomainMetrics(domainId: number): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request(`/analytics/domains/${domainId}/metrics`);
  }

  async getTrendingDomains(limit?: number): Promise<ApiResponse<Record<string, unknown>[]>> {
    const endpoint = limit ? `/analytics/trending?limit=${limit}` : '/analytics/trending';
    return this.request(endpoint);
  }

  async getMarketTrends(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request('/analytics/market-trends');
  }

  async getNetworkHealth(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request('/analytics/network-health');
  }

  async getPortfolioAnalysis(userId: number): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request(`/users/${userId}/portfolio/analysis`);
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

// Export types
export type {
  ApiResponse,
  PaginatedResponse,
  DomainRegistrationData,
  TokenizationData,
  ClaimData,
  BridgeData,
  ListingData,
  AIValuationRequest,
  AIValuationResponse,
  FractionalizationProposal,
  SharePurchaseData,
  GovernanceProposal,
  LiquidityPool,
  LiquidityPosition,
  TradeQuote,
  DashboardData,
};
