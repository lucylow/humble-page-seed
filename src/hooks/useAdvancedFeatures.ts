// Custom React Hooks for Advanced Features Integration
import { useState, useEffect, useCallback } from 'react';
import { advancedApiService } from '../services/advancedApiService';
import type {
  AIValuationRequest,
  AIValuationResponse,
  FractionalizationProposal,
  FractionalizationResponse,
  SharePurchaseRequest,
  GovernanceProposal,
  VoteRequest,
  AMMPoolRequest,
  LiquidityRequest,
  TradeQuoteRequest,
  SwapRequest,
  AnalyticsDashboardRequest,
  DomainMetricsRequest,
  TrendingRequest,
} from '../services/advancedApiService';

// AI Valuation Hook
export const useAIValuation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [valuation, setValuation] = useState<AIValuationResponse | null>(null);

  const getValuation = useCallback(async (request: AIValuationRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.getAIValuation(request);
      setValuation(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const batchValuation = useCallback(async (domainNames: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.batchDomainValuation(domainNames);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    valuation,
    getValuation,
    batchValuation,
    clearError: () => setError(null),
  };
};

// Domain Fractionalization Hook
export const useDomainFractionalization = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareholders, setShareholders] = useState<any[]>([]);

  const proposeFractionalization = useCallback(async (proposal: FractionalizationProposal) => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.proposeFractionalization(proposal);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const executeFractionalization = useCallback(async (domainId: number, chainName?: string, data?: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.executeFractionalization(domainId, chainName, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const purchaseShares = useCallback(async (request: SharePurchaseRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.purchaseShares(request);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createGovernanceProposal = useCallback(async (proposal: GovernanceProposal) => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.createGovernanceProposal(proposal);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const voteOnProposal = useCallback(async (vote: VoteRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.voteOnProposal(vote);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getShareholders = useCallback(async (domainId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.getShareholders(domainId);
      setShareholders(result.shareholders || []);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const distributeRevenue = useCallback(async (domainId: number, totalRevenue: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.distributeRevenue(domainId, totalRevenue);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    shareholders,
    proposeFractionalization,
    executeFractionalization,
    purchaseShares,
    createGovernanceProposal,
    voteOnProposal,
    getShareholders,
    distributeRevenue,
    clearError: () => setError(null),
  };
};

// AMM (Automated Market Maker) Hook
export const useAMM = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pools, setPools] = useState<any[]>([]);
  const [userPositions, setUserPositions] = useState<any[]>([]);
  const [tradeQuote, setTradeQuote] = useState<any>(null);

  const createLiquidityPool = useCallback(async (request: AMMPoolRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.createLiquidityPool(request);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addLiquidity = useCallback(async (request: LiquidityRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.addLiquidity(request);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeLiquidity = useCallback(async (poolId: string, userId: number, liquidityTokens: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.removeLiquidity(poolId, userId, liquidityTokens);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTradeQuote = useCallback(async (request: TradeQuoteRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.getTradeQuote(request);
      setTradeQuote(result.quote || null);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const executeSwap = useCallback(async (request: SwapRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.executeSwap(request);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPoolAnalytics = useCallback(async (poolId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.getPoolAnalytics(poolId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserPositions = useCallback(async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.getUserLiquidityPositions(userId);
      setUserPositions(result.positions || []);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listPools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.listLiquidityPools();
      setPools(result.pools || []);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    pools,
    userPositions,
    tradeQuote,
    createLiquidityPool,
    addLiquidity,
    removeLiquidity,
    getTradeQuote,
    executeSwap,
    getPoolAnalytics,
    getUserPositions,
    listPools,
    clearError: () => setError(null),
  };
};

// Advanced Analytics Hook
export const useAdvancedAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [domainMetrics, setDomainMetrics] = useState<any>(null);
  const [trendingDomains, setTrendingDomains] = useState<any[]>([]);
  const [marketTrends, setMarketTrends] = useState<any[]>([]);
  const [networkHealth, setNetworkHealth] = useState<any>(null);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<any>(null);

  const getAnalyticsDashboard = useCallback(async (request: AnalyticsDashboardRequest = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.getAnalyticsDashboard(request);
      setDashboard(result.dashboard || null);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDomainMetrics = useCallback(async (request: DomainMetricsRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.getDomainMetrics(request);
      setDomainMetrics(result.metrics || null);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTrendingDomains = useCallback(async (request: TrendingRequest = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.getTrendingDomains(request);
      setTrendingDomains(result.trending_domains || []);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMarketTrends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.getMarketTrends();
      setMarketTrends(result.market_trends || []);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getNetworkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.getNetworkHealth();
      setNetworkHealth(result.network_health || null);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPortfolioAnalysis = useCallback(async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.getPortfolioAnalysis(userId);
      setPortfolioAnalysis(result.portfolio_analysis || null);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getHealthCheck = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedApiService.getAdvancedHealthCheck();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    dashboard,
    domainMetrics,
    trendingDomains,
    marketTrends,
    networkHealth,
    portfolioAnalysis,
    getAnalyticsDashboard,
    getDomainMetrics,
    getTrendingDomains,
    getMarketTrends,
    getNetworkHealth,
    getPortfolioAnalysis,
    getHealthCheck,
    clearError: () => setError(null),
  };
};

// Combined Advanced Features Hook
export const useAdvancedFeatures = () => {
  const aiValuation = useAIValuation();
  const fractionalization = useDomainFractionalization();
  const amm = useAMM();
  const analytics = useAdvancedAnalytics();

  const [overallLoading, setOverallLoading] = useState(false);
  const [overallError, setOverallError] = useState<string | null>(null);

  const initializeAdvancedFeatures = useCallback(async () => {
    setOverallLoading(true);
    setOverallError(null);
    
    try {
      // Initialize all services in parallel
      const promises = [
        analytics.getHealthCheck(),
        amm.listPools(),
        analytics.getMarketTrends(),
        analytics.getTrendingDomains({ limit: 10 }),
      ];

      await Promise.allSettled(promises);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setOverallError(errorMessage);
    } finally {
      setOverallLoading(false);
    }
  }, [analytics, amm]);

  useEffect(() => {
    initializeAdvancedFeatures();
  }, [initializeAdvancedFeatures]);

  return {
    // Individual hooks
    aiValuation,
    fractionalization,
    amm,
    analytics,
    
    // Combined state
    overallLoading,
    overallError,
    initializeAdvancedFeatures,
    
    // Clear all errors
    clearAllErrors: () => {
      aiValuation.clearError();
      fractionalization.clearError();
      amm.clearError();
      analytics.clearError();
      setOverallError(null);
    },
  };
};
