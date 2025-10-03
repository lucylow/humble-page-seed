// @ts-nocheck
// Advanced API Service for DomaLand.AI Backend Integration
import { ApiService } from './api';

export interface AIValuationRequest {
  domain_id: number;
  additional_data?: Record<string, any>;
}

export interface AIValuationResponse {
  success: boolean;
  valuation?: {
    estimated_value: number;
    confidence_score: number;
    factors: {
      length_score: number;
      memorability_score: number;
      brandability_score: number;
      seo_potential: number;
      extension_value: number;
      market_trends: number;
    };
    breakdown: {
      base_value: number;
      keyword_premium: number;
      tld_multiplier: number;
      market_adjustment: number;
    };
    comparable_sales: Array<{
      domain: string;
      sale_price: number;
      sale_date: string;
      similarity_score: number;
    }>;
  };
  error?: string;
}

export interface FractionalizationProposal {
  domain_id: number;
  proposer_id: number;
  total_shares: number;
  share_price: number;
  governance_threshold: number;
  revenue_sharing_enabled: boolean;
}

export interface FractionalizationResponse {
  success: boolean;
  proposal_id?: string;
  fractional_token_address?: string;
  error?: string;
}

export interface SharePurchaseRequest {
  domain_id: number;
  buyer_id: number;
  share_amount: number;
  payment_details: {
    payment_method: 'crypto' | 'fiat';
    amount: number;
    currency: string;
  };
}

export interface GovernanceProposal {
  domain_id: number;
  proposer_id: number;
  proposal_type: 'sell_domain' | 'change_management' | 'distribute_revenue' | 'upgrade_domain';
  title: string;
  description: string;
  execution_data: Record<string, any>;
}

export interface VoteRequest {
  proposal_id: string;
  voter_id: number;
  vote: 'yes' | 'no' | 'abstain';
}

export interface AMMPoolRequest {
  domain_id: number;
  base_token: 'USDC' | 'ETH' | 'MATIC';
  initial_domain_amount: number;
  initial_base_amount: number;
  creator_id: number;
}

export interface LiquidityRequest {
  pool_id: string;
  user_id: number;
  domain_amount: number;
  base_amount: number;
}

export interface TradeQuoteRequest {
  pool_id: string;
  input_token: string;
  input_amount: number;
  slippage_tolerance?: number;
}

export interface TradeQuote {
  input_token: string;
  output_token: string;
  input_amount: number;
  output_amount: number;
  price_impact: number;
  fee_amount: number;
  minimum_output: number;
  valid_until: string;
}

export interface SwapRequest {
  pool_id: string;
  trader_id: number;
  quote: TradeQuote;
}

export interface AnalyticsDashboardRequest {
  user_id?: number;
}

export interface DomainMetricsRequest {
  domain_id: number;
}

export interface TrendingRequest {
  limit?: number;
}

export class AdvancedApiService extends ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    super();
    this.baseUrl = baseUrl;
  }

  // AI Valuation Engine
  async getAIValuation(request: AIValuationRequest): Promise<AIValuationResponse> {
    try {
      const response = await this.request(
        `${this.baseUrl}/domains/${request.domain_id}/ai-valuation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request.additional_data || {}),
        }
      );
      return response;
    } catch (error) {
      console.error('AI Valuation API Error:', error);
      throw error;
    }
  }

  async batchDomainValuation(domainNames: string[]): Promise<any> {
    try {
      const response = await this.request(`${this.baseUrl}/domains/batch-valuation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain_names: domainNames }),
      });
      return response;
    } catch (error) {
      console.error('Batch Valuation API Error:', error);
      throw error;
    }
  }

  // Domain Fractionalization
  async proposeFractionalization(proposal: FractionalizationProposal): Promise<FractionalizationResponse> {
    try {
      const response = await this.request(
        `${this.baseUrl}/domains/${proposal.domain_id}/fractionalize/propose`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(proposal),
        }
      );
      return response;
    } catch (error) {
      console.error('Fractionalization Proposal API Error:', error);
      throw error;
    }
  }

  async executeFractionalization(domainId: number, chainName: string = 'polygon', data: any = {}): Promise<any> {
    try {
      const response = await this.request(
        `${this.baseUrl}/domains/${domainId}/fractionalize/execute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chain_name: chainName, ...data }),
        }
      );
      return response;
    } catch (error) {
      console.error('Fractionalization Execution API Error:', error);
      throw error;
    }
  }

  async purchaseShares(request: SharePurchaseRequest): Promise<any> {
    try {
      const response = await this.request(
        `${this.baseUrl}/domains/${request.domain_id}/shares/purchase`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );
      return response;
    } catch (error) {
      console.error('Share Purchase API Error:', error);
      throw error;
    }
  }

  async createGovernanceProposal(proposal: GovernanceProposal): Promise<any> {
    try {
      const response = await this.request(
        `${this.baseUrl}/domains/${proposal.domain_id}/governance/propose`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(proposal),
        }
      );
      return response;
    } catch (error) {
      console.error('Governance Proposal API Error:', error);
      throw error;
    }
  }

  async voteOnProposal(vote: VoteRequest): Promise<any> {
    try {
      const response = await this.request(
        `${this.baseUrl}/governance/${vote.proposal_id}/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(vote),
        }
      );
      return response;
    } catch (error) {
      console.error('Vote API Error:', error);
      throw error;
    }
  }

  async getShareholders(domainId: number): Promise<any> {
    try {
      const response = await this.request(
        `${this.baseUrl}/domains/${domainId}/shareholders`,
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error) {
      console.error('Shareholders API Error:', error);
      throw error;
    }
  }

  async distributeRevenue(domainId: number, totalRevenue: number): Promise<any> {
    try {
      const response = await this.request(
        `${this.baseUrl}/domains/${domainId}/revenue/distribute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ total_revenue: totalRevenue }),
        }
      );
      return response;
    } catch (error) {
      console.error('Revenue Distribution API Error:', error);
      throw error;
    }
  }

  // Automated Market Maker (AMM)
  async createLiquidityPool(request: AMMPoolRequest): Promise<any> {
    try {
      const response = await this.request(`${this.baseUrl}/amm/pools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      return response;
    } catch (error) {
      console.error('Create Pool API Error:', error);
      throw error;
    }
  }

  async addLiquidity(request: LiquidityRequest): Promise<any> {
    try {
      const response = await this.request(
        `${this.baseUrl}/amm/pools/${request.pool_id}/add-liquidity`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );
      return response;
    } catch (error) {
      console.error('Add Liquidity API Error:', error);
      throw error;
    }
  }

  async removeLiquidity(poolId: string, userId: number, liquidityTokens: number): Promise<any> {
    try {
      const response = await this.request(
        `${this.baseUrl}/amm/pools/${poolId}/remove-liquidity`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            liquidity_tokens: liquidityTokens,
          }),
        }
      );
      return response;
    } catch (error) {
      console.error('Remove Liquidity API Error:', error);
      throw error;
    }
  }

  async getTradeQuote(request: TradeQuoteRequest): Promise<{ success: boolean; quote?: TradeQuote; error?: string }> {
    try {
      const response = await this.request(
        `${this.baseUrl}/amm/pools/${request.pool_id}/quote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );
      return response;
    } catch (error) {
      console.error('Trade Quote API Error:', error);
      throw error;
    }
  }

  async executeSwap(request: SwapRequest): Promise<any> {
    try {
      const response = await this.request(
        `${this.baseUrl}/amm/pools/${request.pool_id}/swap`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );
      return response;
    } catch (error) {
      console.error('Execute Swap API Error:', error);
      throw error;
    }
  }

  async getPoolAnalytics(poolId: string): Promise<any> {
    try {
      const response = await this.request(
        `${this.baseUrl}/amm/pools/${poolId}/analytics`,
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error) {
      console.error('Pool Analytics API Error:', error);
      throw error;
    }
  }

  async getUserLiquidityPositions(userId: number): Promise<any> {
    try {
      const response = await this.request(
        `${this.baseUrl}/amm/users/${userId}/positions`,
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error) {
      console.error('User Positions API Error:', error);
      throw error;
    }
  }

  async listLiquidityPools(): Promise<any> {
    try {
      const response = await this.request(`${this.baseUrl}/amm/pools`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('List Pools API Error:', error);
      throw error;
    }
  }

  // Advanced Analytics Engine
  async getAnalyticsDashboard(request: AnalyticsDashboardRequest = {}): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (request.user_id) {
        params.append('user_id', request.user_id.toString());
      }
      
      const response = await this.request(
        `${this.baseUrl}/analytics/dashboard?${params.toString()}`,
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error) {
      console.error('Analytics Dashboard API Error:', error);
      throw error;
    }
  }

  async getDomainMetrics(request: DomainMetricsRequest): Promise<any> {
    try {
      const response = await this.request(
        `${this.baseUrl}/analytics/domains/${request.domain_id}/metrics`,
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error) {
      console.error('Domain Metrics API Error:', error);
      throw error;
    }
  }

  async getTrendingDomains(request: TrendingRequest = {}): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (request.limit) {
        params.append('limit', request.limit.toString());
      }
      
      const response = await this.request(
        `${this.baseUrl}/analytics/trending?${params.toString()}`,
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error) {
      console.error('Trending Domains API Error:', error);
      throw error;
    }
  }

  async getMarketTrends(): Promise<any> {
    try {
      const response = await this.request(`${this.baseUrl}/analytics/market-trends`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Market Trends API Error:', error);
      throw error;
    }
  }

  async getNetworkHealth(): Promise<any> {
    try {
      const response = await this.request(`${this.baseUrl}/analytics/network-health`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Network Health API Error:', error);
      throw error;
    }
  }

  async getPortfolioAnalysis(userId: number): Promise<any> {
    try {
      const response = await this.request(
        `${this.baseUrl}/users/${userId}/portfolio/analysis`,
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error) {
      console.error('Portfolio Analysis API Error:', error);
      throw error;
    }
  }

  // Health Check
  async getAdvancedHealthCheck(): Promise<any> {
    try {
      const response = await this.request(`${this.baseUrl}/health/advanced`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Advanced Health Check API Error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const advancedApiService = new AdvancedApiService();
