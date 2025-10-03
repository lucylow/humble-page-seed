// @ts-nocheck
// React Hook for Easy Doma Subgraph Integration
import { useState, useEffect, useCallback } from 'react';
import DomaSubgraphService from '../services/domaSubgraphService';
import { SubgraphFilters, Domain, DomainListing, DomainOffer, PaginatedResponse } from '../services/domaSubgraphService';

export const useDomaSubgraph = (environment: 'testnet' | 'mainnet' | 'local' = 'testnet') => {
  const [service] = useState(() => new DomaSubgraphService(environment));
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set environment
  const setEnvironment = useCallback((env: 'testnet' | 'mainnet' | 'local') => {
    service.setEnvironment(env);
  }, [service]);

  // Get tokenized domains
  const getTokenizedDomains = useCallback(async (filters: SubgraphFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getTokenizedDomains(filters);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get domain info
  const getDomainInfo = useCallback(async (domainName: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getDomainInfo(domainName);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get domain listings
  const getDomainListings = useCallback(async (filters: SubgraphFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getDomainListings(filters);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get domain offers
  const getDomainOffers = useCallback(async (filters: SubgraphFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getDomainOffers(filters);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get domain statistics
  const getDomainStatistics = useCallback(async (tokenId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getDomainStatistics(tokenId);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get domain activities
  const getDomainActivities = useCallback(async (domainName: string, filters: SubgraphFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getDomainActivities(domainName, filters);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get token activities
  const getTokenActivities = useCallback(async (tokenId: string, filters: SubgraphFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getTokenActivities(tokenId, filters);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Search domains
  const searchDomains = useCallback(async (query: string, filters: SubgraphFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.searchDomains(query, filters);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get trending domains
  const getTrendingDomains = useCallback(async (filters: SubgraphFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getTrendingDomains(filters);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get domain analytics
  const getDomainAnalytics = useCallback(async (domainName: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getDomainAnalytics(domainName);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get domains by owner
  const getDomainsByOwner = useCallback(async (ownerAddress: string, filters: SubgraphFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getDomainsByOwner(ownerAddress, filters);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get expiring domains
  const getExpiringDomains = useCallback(async (daysThreshold: number = 30, filters: SubgraphFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getExpiringDomains(daysThreshold, filters);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get popular domains
  const getPopularDomains = useCallback(async (limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getPopularDomains(limit);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get marketplace overview
  const getMarketplaceOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getMarketplaceOverview();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get domain recommendations
  const getDomainRecommendations = useCallback(async (preferences: {
    tlds?: string[];
    networks?: string[];
    maxPrice?: number;
    minValueScore?: number;
    limit?: number;
  } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getDomainRecommendations(preferences);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get domain price history
  const getDomainPriceHistory = useCallback(async (domainName: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getDomainPriceHistory(domainName);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Compare domains
  const compareDomains = useCallback(async (domainNames: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.compareDomains(domainNames);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Reset data
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    data,
    loading,
    error,
    
    // Actions
    setEnvironment,
    getTokenizedDomains,
    getDomainInfo,
    getDomainListings,
    getDomainOffers,
    getDomainStatistics,
    getDomainActivities,
    getTokenActivities,
    searchDomains,
    getTrendingDomains,
    getDomainAnalytics,
    getDomainsByOwner,
    getExpiringDomains,
    getPopularDomains,
    getMarketplaceOverview,
    getDomainRecommendations,
    getDomainPriceHistory,
    compareDomains,
    reset,
    clearError
  };
};

// Specialized hooks for specific use cases

// Hook for domain search with debouncing
export const useDomainSearch = (environment: 'testnet' | 'mainnet' | 'local' = 'testnet') => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<PaginatedResponse<Domain> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      setLoading(true);
      setError(null);
      
      const service = new DomaSubgraphService(environment);
      service.searchDomains(debouncedQuery, { take: 20 })
        .then(result => {
          setResults(result);
          setLoading(false);
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : 'Search failed');
          setLoading(false);
        });
    } else {
      setResults(null);
      setLoading(false);
      setError(null);
    }
  }, [debouncedQuery, environment]);

  return {
    query,
    setQuery,
    results,
    loading,
    error
  };
};

// Hook for domain marketplace data
export const useDomainMarketplace = (environment: 'testnet' | 'mainnet' | 'local' = 'testnet') => {
  const [overview, setOverview] = useState<Record<string, unknown> | null>(null);
  const [trendingDomains, setTrendingDomains] = useState<Domain[]>([]);
  const [popularDomains, setPopularDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMarketplaceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const service = new DomaSubgraphService(environment);
      const [overviewData, trendingData, popularData] = await Promise.all([
        service.getMarketplaceOverview(),
        service.getTrendingDomains({ take: 10 }),
        service.getPopularDomains(10)
      ]);
      
      setOverview(overviewData);
      setTrendingDomains(trendingData.items);
      setPopularDomains(popularData);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load marketplace data');
      setLoading(false);
    }
  }, [environment]);

  useEffect(() => {
    loadMarketplaceData();
  }, [loadMarketplaceData]);

  return {
    overview,
    trendingDomains,
    popularDomains,
    loading,
    error,
    refresh: loadMarketplaceData
  };
};

// Hook for domain portfolio management
export const useDomainPortfolio = (ownerAddress: string, environment: 'testnet' | 'mainnet' | 'local' = 'testnet') => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [expiringDomains, setExpiringDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolio = useCallback(async () => {
    if (!ownerAddress) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const service = new DomaSubgraphService(environment);
      const [ownedDomains, expiringData] = await Promise.all([
        service.getDomainsByOwner(ownerAddress, { take: 100 }),
        service.getExpiringDomains(30, { ownedBy: [ownerAddress] })
      ]);
      
      setDomains(ownedDomains.items);
      setExpiringDomains(expiringData.items);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
      setLoading(false);
    }
  }, [ownerAddress, environment]);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  return {
    domains,
    expiringDomains,
    loading,
    error,
    refresh: loadPortfolio
  };
};
