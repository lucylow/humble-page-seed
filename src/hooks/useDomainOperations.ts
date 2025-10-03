// React hooks for domain operations and Web3 integration

import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { domainService } from '../services/domainService';
import { 
  DomainAsset, 
  DomainValuation, 
  TokenizationParams, 
  FractionalizationParams,
  DomainOffer,
  TradingRecord,
  RoyaltyDistribution,
  DomainPortfolio,
  SearchFilters,
  DomainSearchResult
} from '../types/domain';

export const useDomainOperations = () => {
  const { account, signer, isConnected, currentChain } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tokenize domain (Use Case 8.1.1)
  const tokenizeDomain = useCallback(async (params: TokenizationParams): Promise<DomainAsset | null> => {
    if (!isConnected || !signer) {
      setError('Wallet not connected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const domainAsset = await domainService.tokenizeDomain(params);
      return domainAsset;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, signer]);

  // Fractionalize domain (Use Case 8.1.2)
  const fractionalizeDomain = useCallback(async (params: FractionalizationParams): Promise<DomainAsset | null> => {
    if (!isConnected || !signer) {
      setError('Wallet not connected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const domainAsset = await domainService.fractionalizeDomain(params);
      return domainAsset;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, signer]);

  // Buy fractional shares (Use Case 8.2.1)
  const buyFractionalShares = useCallback(async (domainId: string, shares: number): Promise<string | null> => {
    if (!isConnected || !signer) {
      setError('Wallet not connected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const transactionHash = await domainService.buyFractionalShares(domainId, shares);
      return transactionHash;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, signer]);

  // Sell fractional shares (Use Case 8.2.2)
  const sellFractionalShares = useCallback(async (domainId: string, shares: number): Promise<string | null> => {
    if (!isConnected || !signer) {
      setError('Wallet not connected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const transactionHash = await domainService.sellFractionalShares(domainId, shares);
      return transactionHash;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, signer]);

  // Search domains (Use Case 8.3.1)
  const searchDomains = useCallback(async (filters: SearchFilters): Promise<DomainSearchResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const results = await domainService.searchDomains(filters);
      return results;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user portfolio (Use Case 8.2)
  const getUserPortfolio = useCallback(async (): Promise<DomainPortfolio | null> => {
    if (!account) {
      setError('Wallet not connected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const portfolio = await domainService.getUserPortfolio(account);
      return portfolio;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [account]);

  // Get domain analytics (Use Case 8.3.1)
  const getDomainAnalytics = useCallback(async (domainId: string): Promise<Record<string, unknown> | null> => {
    setLoading(true);
    setError(null);

    try {
      const analytics = await domainService.getDomainAnalytics(domainId);
      return analytics;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Distribute royalties (Use Case 8.2.3)
  const distributeRoyalties = useCallback(async (domainId: string, revenue: number): Promise<RoyaltyDistribution | null> => {
    if (!isConnected || !signer) {
      setError('Wallet not connected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const distribution = await domainService.distributeRoyalties(domainId, revenue);
      return distribution;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, signer]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    isConnected,
    account,
    currentChain,
    
    // Operations
    tokenizeDomain,
    fractionalizeDomain,
    buyFractionalShares,
    sellFractionalShares,
    searchDomains,
    getUserPortfolio,
    getDomainAnalytics,
    distributeRoyalties,
    clearError
  };
};

// Hook for domain marketplace operations
export const useDomainMarketplace = () => {
  const { account, signer, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domains, setDomains] = useState<DomainAsset[]>([]);

  // Search and filter domains
  const searchDomains = useCallback(async (filters: SearchFilters) => {
    setLoading(true);
    setError(null);

    try {
      const results = await domainService.searchDomains(filters);
      if (results) {
        setDomains(results.domains);
      }
      return results;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Make an offer on a domain
  const makeOffer = useCallback(async (domainId: string, amount: number, message?: string): Promise<DomainOffer | null> => {
    if (!isConnected || !signer) {
      setError('Wallet not connected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // This would interact with smart contracts to make an offer
      const offer: DomainOffer = {
        id: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        domainId,
        offerer: account!,
        amount,
        currency: 'USDC',
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'pending',
        message,
        createdAt: Date.now()
      };

      // In a real implementation, this would call a smart contract
      console.log('Making offer:', offer);
      
      return offer;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, signer, account]);

  // Accept an offer
  const acceptOffer = useCallback(async (offerId: string): Promise<string | null> => {
    if (!isConnected || !signer) {
      setError('Wallet not connected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // This would interact with smart contracts to accept the offer
      const transactionHash = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Accepting offer:', offerId, 'Transaction:', transactionHash);
      
      return transactionHash;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, signer]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    domains,
    isConnected,
    account,
    
    // Operations
    searchDomains,
    makeOffer,
    acceptOffer,
    clearError
  };
};

// Hook for portfolio management
export const usePortfolio = () => {
  const { account, isConnected } = useWeb3();
  const [portfolio, setPortfolio] = useState<DomainPortfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user portfolio
  const loadPortfolio = useCallback(async () => {
    if (!account || !isConnected) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userPortfolio = await domainService.getUserPortfolio(account);
      setPortfolio(userPortfolio);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [account, isConnected]);

  // Refresh portfolio data
  const refreshPortfolio = useCallback(async () => {
    await loadPortfolio();
  }, [loadPortfolio]);

  // Load portfolio on mount and when account changes
  useEffect(() => {
    if (account && isConnected) {
      loadPortfolio();
    } else {
      setPortfolio(null);
    }
  }, [account, isConnected, loadPortfolio]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    portfolio,
    loading,
    error,
    isConnected,
    account,
    
    // Operations
    loadPortfolio,
    refreshPortfolio,
    clearError
  };
};
