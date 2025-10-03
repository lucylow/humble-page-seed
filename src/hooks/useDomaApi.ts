import { useState, useEffect, useCallback, useMemo } from 'react';
import { domaApiClient, DomaApiClient } from '../services/domaApiClient';
import {
  GET_TOKENIZED_DOMAINS,
  GET_DOMAIN_INFO,
  GET_DOMAIN_LISTINGS,
  GET_DOMAIN_OFFERS,
  GET_DOMAIN_STATISTICS,
  GET_USER_PORTFOLIO,
  GET_DOMAIN_ACTIVITIES,
  GET_MARKETPLACE_STATISTICS,
  SEARCH_DOMAINS,
  GET_DOMAIN_METADATA,
  GET_EXPIRING_DOMAINS,
  DomainInfo,
  DomainListing,
  DomainOffer,
  PaginatedResponse,
} from '../services/domaQueries';
import {
  INITIATE_EMAIL_VERIFICATION,
  COMPLETE_EMAIL_VERIFICATION,
  UPLOAD_REGISTRANT_CONTACTS,
  CREATE_DOMAIN_LISTING,
  UPDATE_DOMAIN_LISTING,
  CANCEL_DOMAIN_LISTING,
  CREATE_DOMAIN_OFFER,
  UPDATE_DOMAIN_OFFER,
  CANCEL_DOMAIN_OFFER,
  ACCEPT_DOMAIN_OFFER,
  PURCHASE_DOMAIN_LISTING,
  TRANSFER_DOMAIN_OWNERSHIP,
  RENEW_DOMAIN,
  LOCK_DOMAIN_TRANSFER,
  UNLOCK_DOMAIN_TRANSFER,
  UPDATE_DOMAIN_METADATA,
  RegistrantContactInput,
  TokenMetadataInput,
} from '../services/domaMutations';
import {
  formatPrice,
  formatPriceDisplay,
  toCAIP10,
  fromCAIP10,
  isExpiringSoon,
  getDaysUntilExpiry,
  formatDomainName,
  isValidDomainName,
  extractTLD,
  extractSLD,
  getNetworkName,
  formatTimestamp,
  formatRelativeTime,
  truncateAddress,
  truncateDomain,
  getDomainAvatar,
  getDomainThumbnail,
  isPremiumDomain,
  estimateDomainValue,
  sortDomains,
  filterDomains,
  generatePaginationInfo,
  isValidEmail,
  generateNonce,
  formatDuration,
  isValidEthereumAddress,
  sleep,
  retry,
  debounce,
  throttle,
} from '../utils/domaHelpers';

// Hook for fetching tokenized domains
export const useDomaDomains = (filters: {
  skip?: number;
  take?: number;
  ownedBy?: string[];
  claimStatus?: 'ALL' | 'TOKENIZED' | 'EOI';
  name?: string;
  networkIds?: string[];
  tlds?: string[];
  sortOrder?: 'ASC' | 'DESC';
} = {}) => {
  const [domains, setDomains] = useState<DomainInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }>({
    totalCount: 0,
    pageSize: 20,
    currentPage: 1,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const fetchDomains = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const variables = {
        skip: filters.skip || 0,
        take: filters.take || 20,
        ownedBy: filters.ownedBy?.map(addr => toCAIP10(addr)),
        claimStatus: filters.claimStatus || 'ALL',
        name: filters.name,
        networkIds: filters.networkIds,
        tlds: filters.tlds,
        sortOrder: filters.sortOrder || 'DESC',
      };

      const data = await domaApiClient.query<{ names: PaginatedResponse<DomainInfo> }>(
        GET_TOKENIZED_DOMAINS,
        variables
      );
      
      setDomains(data.names.items);
      setPagination({
        totalCount: data.names.totalCount,
        pageSize: data.names.pageSize,
        currentPage: data.names.currentPage,
        totalPages: data.names.totalPages,
        hasPreviousPage: data.names.hasPreviousPage,
        hasNextPage: data.names.hasNextPage,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch domains');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  return {
    domains,
    loading,
    error,
    pagination,
    refetch: fetchDomains,
  };
};

// Hook for fetching domain listings
export const useDomaListings = (filters: {
  skip?: number;
  take?: number;
  tlds?: string[];
  sld?: string;
  networkIds?: string[];
} = {}) => {
  const [listings, setListings] = useState<DomainListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }>({
    totalCount: 0,
    pageSize: 20,
    currentPage: 1,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const variables = {
        skip: filters.skip || 0,
        take: filters.take || 20,
        tlds: filters.tlds,
        sld: filters.sld,
        networkIds: filters.networkIds,
      };

      const data = await domaApiClient.query<{ listings: PaginatedResponse<DomainListing> }>(
        GET_DOMAIN_LISTINGS,
        variables
      );
      
      setListings(data.listings.items);
      setPagination({
        totalCount: data.listings.totalCount,
        pageSize: data.listings.pageSize,
        currentPage: data.listings.currentPage,
        totalPages: data.listings.totalPages,
        hasPreviousPage: data.listings.hasPreviousPage,
        hasNextPage: data.listings.hasNextPage,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    loading,
    error,
    pagination,
    refetch: fetchListings,
  };
};

// Hook for fetching domain offers
export const useDomaOffers = (filters: {
  tokenId?: string;
  offeredBy?: string[];
  skip?: number;
  take?: number;
  status?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'ACCEPTED' | 'REJECTED';
  sortOrder?: 'ASC' | 'DESC';
} = {}) => {
  const [offers, setOffers] = useState<DomainOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }>({
    totalCount: 0,
    pageSize: 20,
    currentPage: 1,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const variables = {
        tokenId: filters.tokenId,
        offeredBy: filters.offeredBy?.map(addr => toCAIP10(addr)),
        skip: filters.skip || 0,
        take: filters.take || 20,
        status: filters.status,
        sortOrder: filters.sortOrder || 'DESC',
      };

      const data = await domaApiClient.query<{ offers: PaginatedResponse<DomainOffer> }>(
        GET_DOMAIN_OFFERS,
        variables
      );
      
      setOffers(data.offers.items);
      setPagination({
        totalCount: data.offers.totalCount,
        pageSize: data.offers.pageSize,
        currentPage: data.offers.currentPage,
        totalPages: data.offers.totalPages,
        hasPreviousPage: data.offers.hasPreviousPage,
        hasNextPage: data.offers.hasNextPage,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  return {
    offers,
    loading,
    error,
    pagination,
    refetch: fetchOffers,
  };
};

// Hook for fetching user portfolio
export const useDomaPortfolio = (address: string) => {
  const [portfolio, setPortfolio] = useState<DomainInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalDomains: number;
    expiringSoon: number;
    eoi: number;
    tokenized: number;
  }>({
    totalDomains: 0,
    expiringSoon: 0,
    eoi: 0,
    tokenized: 0,
  });

  const fetchPortfolio = useCallback(async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const variables = {
        address: toCAIP10(address),
      };

      const data = await domaApiClient.query<{ names: { items: DomainInfo[]; totalCount: number } }>(
        GET_USER_PORTFOLIO,
        variables
      );
      
      const domains = data.names.items;
      setPortfolio(domains);
      
      // Calculate stats
      const expiringSoon = domains.filter(domain => isExpiringSoon(domain.expiresAt)).length;
      const eoi = domains.filter(domain => domain.eoi).length;
      const tokenized = domains.filter(domain => !domain.eoi).length;
      
      setStats({
        totalDomains: data.names.totalCount,
        expiringSoon,
        eoi,
        tokenized,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return {
    portfolio,
    stats,
    loading,
    error,
    refetch: fetchPortfolio,
  };
};

// Hook for domain operations
export const useDomaOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email verification
  const initiateEmailVerification = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isValidEmail(email)) {
        throw new Error('Invalid email format');
      }
      
      const result = await domaApiClient.mutate(INITIATE_EMAIL_VERIFICATION, { email });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate email verification');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeEmailVerification = useCallback(async (code: string, email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await domaApiClient.mutate(COMPLETE_EMAIL_VERIFICATION, { code, email });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete email verification');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Domain claiming
  const uploadRegistrantContacts = useCallback(async (
    contact: RegistrantContactInput,
    emailVerificationProof: string,
    networkId: string,
    registrarIanaId: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await domaApiClient.mutate(UPLOAD_REGISTRANT_CONTACTS, {
        contact,
        emailVerificationProof,
        networkId,
        registrarIanaId,
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload registrant contacts');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Listing operations
  const createListing = useCallback(async (
    tokenId: string,
    price: string,
    currency: string = 'ETH',
    expiresAt?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await domaApiClient.mutate(CREATE_DOMAIN_LISTING, {
        tokenId,
        price,
        currency,
        expiresAt,
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateListing = useCallback(async (
    listingId: string,
    price?: string,
    expiresAt?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await domaApiClient.mutate(UPDATE_DOMAIN_LISTING, {
        listingId,
        price,
        expiresAt,
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listing');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelListing = useCallback(async (listingId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await domaApiClient.mutate(CANCEL_DOMAIN_LISTING, { listingId });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel listing');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const purchaseListing = useCallback(async (listingId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await domaApiClient.mutate(PURCHASE_DOMAIN_LISTING, { listingId });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase listing');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Offer operations
  const createOffer = useCallback(async (
    tokenId: string,
    price: string,
    currency: string = 'ETH',
    expiresAt?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await domaApiClient.mutate(CREATE_DOMAIN_OFFER, {
        tokenId,
        price,
        currency,
        expiresAt,
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create offer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOffer = useCallback(async (
    offerId: string,
    price?: string,
    expiresAt?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await domaApiClient.mutate(UPDATE_DOMAIN_OFFER, {
        offerId,
        price,
        expiresAt,
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update offer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelOffer = useCallback(async (offerId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await domaApiClient.mutate(CANCEL_DOMAIN_OFFER, { offerId });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel offer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptOffer = useCallback(async (offerId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await domaApiClient.mutate(ACCEPT_DOMAIN_OFFER, { offerId });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept offer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Domain management
  const transferOwnership = useCallback(async (tokenId: string, toAddress: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isValidEthereumAddress(toAddress)) {
        throw new Error('Invalid Ethereum address');
      }
      
      const result = await domaApiClient.mutate(TRANSFER_DOMAIN_OWNERSHIP, {
        tokenId,
        toAddress,
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transfer ownership');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const renewDomain = useCallback(async (tokenId: string, duration: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await domaApiClient.mutate(RENEW_DOMAIN, {
        tokenId,
        duration,
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to renew domain');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const lockTransfer = useCallback(async (tokenId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await domaApiClient.mutate(LOCK_DOMAIN_TRANSFER, { tokenId });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lock transfer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const unlockTransfer = useCallback(async (tokenId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await domaApiClient.mutate(UNLOCK_DOMAIN_TRANSFER, { tokenId });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock transfer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMetadata = useCallback(async (tokenId: string, metadata: TokenMetadataInput) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await domaApiClient.mutate(UPDATE_DOMAIN_METADATA, {
        tokenId,
        metadata,
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update metadata');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    // Email verification
    initiateEmailVerification,
    completeEmailVerification,
    // Domain claiming
    uploadRegistrantContacts,
    // Listing operations
    createListing,
    updateListing,
    cancelListing,
    purchaseListing,
    // Offer operations
    createOffer,
    updateOffer,
    cancelOffer,
    acceptOffer,
    // Domain management
    transferOwnership,
    renewDomain,
    lockTransfer,
    unlockTransfer,
    updateMetadata,
  };
};

// Hook for domain search
export const useDomaSearch = (query: string, filters: {
  skip?: number;
  take?: number;
  tlds?: string[];
  networkIds?: string[];
} = {}) => {
  const [results, setResults] = useState<DomainInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }>({
    totalCount: 0,
    pageSize: 20,
    currentPage: 1,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce(async (searchQuery: string): Promise<void> => {
      if (!searchQuery.trim()) {
        setResults([]);
        setPagination({
          totalCount: 0,
          pageSize: 20,
          currentPage: 1,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        });
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const variables = {
          query: searchQuery,
          skip: filters.skip || 0,
          take: filters.take || 20,
          tlds: filters.tlds,
          networkIds: filters.networkIds,
        };

        const data = await domaApiClient.query<{ searchDomains: PaginatedResponse<DomainInfo> }>(
          SEARCH_DOMAINS,
          variables
        );
        
        setResults(data.searchDomains.items);
        setPagination({
          totalCount: data.searchDomains.totalCount,
          pageSize: data.searchDomains.pageSize,
          currentPage: data.searchDomains.currentPage,
          totalPages: data.searchDomains.totalPages,
          hasPreviousPage: data.searchDomains.hasPreviousPage,
          hasNextPage: data.searchDomains.hasNextPage,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    }, 300),
    [filters]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return {
    results,
    loading,
    error,
    pagination,
  };
};

// Hook for marketplace statistics
export const useDomaMarketplaceStats = () => {
  const [stats, setStats] = useState<{
    totalListings: number;
    totalOffers: number;
    totalVolume: string;
    averagePrice: string;
    topTlds: Array<{ tld: string; count: number }>;
    recentActivity: Array<{ type: string; count: number; timestamp: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await domaApiClient.query<{ marketplaceStats: any }>(GET_MARKETPLACE_STATISTICS);
      setStats(data.marketplaceStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch marketplace stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

// Hook for expiring domains
export const useDomaExpiringDomains = (ownedBy?: string[], daysUntilExpiry: number = 30) => {
  const [domains, setDomains] = useState<DomainInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }>({
    totalCount: 0,
    pageSize: 20,
    currentPage: 1,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const fetchExpiringDomains = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const variables = {
        ownedBy: ownedBy?.map(addr => toCAIP10(addr)),
        daysUntilExpiry,
        skip: 0,
        take: 50,
      };

      const data = await domaApiClient.query<{ expiringDomains: PaginatedResponse<DomainInfo> }>(
        GET_EXPIRING_DOMAINS,
        variables
      );
      
      setDomains(data.expiringDomains.items);
      setPagination({
        totalCount: data.expiringDomains.totalCount,
        pageSize: data.expiringDomains.pageSize,
        currentPage: data.expiringDomains.currentPage,
        totalPages: data.expiringDomains.totalPages,
        hasPreviousPage: data.expiringDomains.hasPreviousPage,
        hasNextPage: data.expiringDomains.hasNextPage,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expiring domains');
    } finally {
      setLoading(false);
    }
  }, [ownedBy, daysUntilExpiry]);

  useEffect(() => {
    fetchExpiringDomains();
  }, [fetchExpiringDomains]);

  return {
    domains,
    loading,
    error,
    pagination,
    refetch: fetchExpiringDomains,
  };
};
