// @ts-nocheck
// Complete Doma Subgraph Service
import DomaSubgraphClient from './domaSubgraphClient';
import {
  GET_TOKENIZED_DOMAINS,
  GET_DOMAIN_INFO,
  GET_DOMAIN_LISTINGS,
  GET_DOMAIN_OFFERS,
  GET_DOMAIN_STATISTICS,
  GET_DOMAIN_ACTIVITIES,
  GET_TOKEN_ACTIVITIES,
  SEARCH_DOMAINS,
  GET_TRENDING_DOMAINS,
  GET_DOMAIN_ANALYTICS,
  Domain,
  DomainListing,
  DomainOffer,
  PaginatedResponse
} from '../graphql/domaQueries';
import {
  formatPrice,
  isExpiringSoon,
  getNetworkName,
  formatActivity,
  formatTokenActivity,
  formatListing,
  formatOffer,
  calculateDomainValueScore,
  sortDomains,
  filterDomains,
  generateDomainAnalytics,
  formatCurrency,
  toCAIP10
} from '../utils/domaSubgraphHelpers';

export interface SubgraphFilters {
  skip?: number;
  take?: number;
  ownedBy?: string[];
  claimStatus?: string;
  name?: string;
  networkIds?: string[];
  tlds?: string[];
  sortOrder?: 'ASC' | 'DESC';
  sld?: string;
  tokenId?: string;
  offeredBy?: string[];
  status?: string;
  type?: string;
  timeframe?: string;
  query?: string;
}

export class DomaSubgraphService {
  private client: DomaSubgraphClient;

  constructor(environment: 'testnet' | 'mainnet' | 'local' = 'testnet') {
    this.client = new DomaSubgraphClient(environment);
  }

  // Set environment (testnet/mainnet/local)
  setEnvironment(environment: 'testnet' | 'mainnet' | 'local'): void {
    this.client.setEnvironment(environment);
  }

  // Get tokenized domains with pagination and filtering
  async getTokenizedDomains(filters: SubgraphFilters = {}): Promise<PaginatedResponse<Domain>> {
    const variables = {
      skip: filters.skip || 0,
      take: filters.take || 20,
      ownedBy: filters.ownedBy,
      claimStatus: filters.claimStatus,
      name: filters.name,
      networkIds: filters.networkIds,
      tlds: filters.tlds,
      sortOrder: filters.sortOrder || 'DESC'
    };

    try {
      const data = await this.client.query(GET_TOKENIZED_DOMAINS, variables);
      return data.names;
    } catch (error) {
      console.error('Error fetching tokenized domains:', error);
      throw error;
    }
  }

  // Get detailed information about a specific domain
  async getDomainInfo(domainName: string): Promise<Domain | null> {
    try {
      const data = await this.client.query(GET_DOMAIN_INFO, { name: domainName });
      return data.name;
    } catch (error) {
      console.error(`Error fetching info for domain ${domainName}:`, error);
      throw error;
    }
  }

  // Get domain listings with filtering
  async getDomainListings(filters: SubgraphFilters = {}): Promise<PaginatedResponse<DomainListing>> {
    const variables = {
      skip: filters.skip || 0,
      take: filters.take || 20,
      tlds: filters.tlds,
      sld: filters.sld,
      networkIds: filters.networkIds
    };

    try {
      const data = await this.client.query(GET_DOMAIN_LISTINGS, variables);
      return data.listings;
    } catch (error) {
      console.error('Error fetching domain listings:', error);
      throw error;
    }
  }

  // Get domain offers with filtering
  async getDomainOffers(filters: SubgraphFilters = {}): Promise<PaginatedResponse<DomainOffer>> {
    const variables = {
      tokenId: filters.tokenId,
      offeredBy: filters.offeredBy,
      skip: filters.skip || 0,
      take: filters.take || 20,
      status: filters.status,
      sortOrder: filters.sortOrder || 'DESC'
    };

    try {
      const data = await this.client.query(GET_DOMAIN_OFFERS, variables);
      return data.offers;
    } catch (error) {
      console.error('Error fetching domain offers:', error);
      throw error;
    }
  }

  // Get domain statistics
  async getDomainStatistics(tokenId: string): Promise<any> {
    try {
      const data = await this.client.query(GET_DOMAIN_STATISTICS, { tokenId });
      return data.nameStatistics;
    } catch (error) {
      console.error(`Error fetching statistics for token ${tokenId}:`, error);
      throw error;
    }
  }

  // Get domain activities
  async getDomainActivities(domainName: string, filters: SubgraphFilters = {}): Promise<PaginatedResponse<any>> {
    const variables = {
      name: domainName,
      skip: filters.skip || 0,
      take: filters.take || 20,
      type: filters.type,
      sortOrder: filters.sortOrder || 'DESC'
    };

    try {
      const data = await this.client.query(GET_DOMAIN_ACTIVITIES, variables);
      return data.nameActivities;
    } catch (error) {
      console.error(`Error fetching activities for domain ${domainName}:`, error);
      throw error;
    }
  }

  // Get token activities
  async getTokenActivities(tokenId: string, filters: SubgraphFilters = {}): Promise<PaginatedResponse<any>> {
    const variables = {
      tokenId,
      skip: filters.skip || 0,
      take: filters.take || 20,
      type: filters.type,
      sortOrder: filters.sortOrder || 'DESC'
    };

    try {
      const data = await this.client.query(GET_TOKEN_ACTIVITIES, variables);
      return data.tokenActivities;
    } catch (error) {
      console.error(`Error fetching activities for token ${tokenId}:`, error);
      throw error;
    }
  }

  // Search domains by name pattern
  async searchDomains(query: string, filters: SubgraphFilters = {}): Promise<PaginatedResponse<Domain>> {
    const variables = {
      query,
      skip: filters.skip || 0,
      take: filters.take || 20,
      tlds: filters.tlds,
      networkIds: filters.networkIds
    };

    try {
      const data = await this.client.query(SEARCH_DOMAINS, variables);
      return data.searchDomains;
    } catch (error) {
      console.error(`Error searching domains with query "${query}":`, error);
      throw error;
    }
  }

  // Get trending domains
  async getTrendingDomains(filters: SubgraphFilters = {}): Promise<PaginatedResponse<Domain>> {
    const variables = {
      timeframe: filters.timeframe || 'WEEK',
      skip: filters.skip || 0,
      take: filters.take || 20,
      tlds: filters.tlds
    };

    try {
      const data = await this.client.query(GET_TRENDING_DOMAINS, variables);
      return data.trendingDomains;
    } catch (error) {
      console.error('Error fetching trending domains:', error);
      throw error;
    }
  }

  // Get domain analytics
  async getDomainAnalytics(domainName: string): Promise<any> {
    try {
      const data = await this.client.query(GET_DOMAIN_ANALYTICS, { name: domainName });
      return data.domainAnalytics;
    } catch (error) {
      console.error(`Error fetching analytics for domain ${domainName}:`, error);
      throw error;
    }
  }

  // Get domains owned by a specific address
  async getDomainsByOwner(ownerAddress: string, filters: SubgraphFilters = {}): Promise<PaginatedResponse<Domain>> {
    const caip10Address = toCAIP10(ownerAddress);
    return this.getTokenizedDomains({
      ...filters,
      ownedBy: [caip10Address]
    });
  }

  // Get domains that are expiring soon
  async getExpiringDomains(daysThreshold: number = 30, filters: SubgraphFilters = {}): Promise<PaginatedResponse<Domain>> {
    const domains = await this.getTokenizedDomains(filters);
    
    return {
      ...domains,
      items: domains.items.filter(domain => 
        isExpiringSoon(domain.expiresAt, daysThreshold)
      )
    };
  }

  // Get popular domains (with most offers)
  async getPopularDomains(limit: number = 10): Promise<Domain[]> {
    const domains = await this.getTokenizedDomains({ take: 100 });
    
    // For each domain, get statistics to see number of offers
    const domainsWithStats = await Promise.all(
      domains.items.map(async domain => {
        if (domain.tokens && domain.tokens.length > 0) {
          try {
            const stats = await this.getDomainStatistics(domain.tokens[0].tokenId);
            return {
              ...domain,
              activeOffers: stats.activeOffers || 0
            };
          } catch (error) {
            return {
              ...domain,
              activeOffers: 0
            };
          }
        }
        return {
          ...domain,
          activeOffers: 0
        };
      })
    );
    
    // Sort by number of offers (descending)
    domainsWithStats.sort((a, b) => b.activeOffers - a.activeOffers);
    
    return domainsWithStats.slice(0, limit);
  }

  // Get domains by TLD
  async getDomainsByTLD(tld: string, filters: SubgraphFilters = {}): Promise<PaginatedResponse<Domain>> {
    return this.getTokenizedDomains({
      ...filters,
      tlds: [tld]
    });
  }

  // Get domains by network
  async getDomainsByNetwork(networkId: string, filters: SubgraphFilters = {}): Promise<PaginatedResponse<Domain>> {
    return this.getTokenizedDomains({
      ...filters,
      networkIds: [networkId]
    });
  }

  // Get recent domain activities across all domains
  async getRecentActivities(limit: number = 50): Promise<any[]> {
    const domains = await this.getTokenizedDomains({ take: 100 });
    const allActivities: any[] = [];

    for (const domain of domains.items) {
      if (domain.activities) {
        const formattedActivities = domain.activities.map(activity => ({
          ...formatActivity(activity),
          domainName: domain.name
        }));
        allActivities.push(...formattedActivities);
      }
    }

    // Sort by timestamp (most recent first)
    allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return allActivities.slice(0, limit);
  }

  // Get domain marketplace overview
  async getMarketplaceOverview(): Promise<{
    totalDomains: number;
    totalListings: number;
    totalOffers: number;
    averagePrice: number;
    topTLDs: Array<{ tld: string; count: number }>;
    topNetworks: Array<{ network: string; count: number }>;
  }> {
    try {
      const [domains, listings, offers] = await Promise.all([
        this.getTokenizedDomains({ take: 1000 }),
        this.getDomainListings({ take: 1000 }),
        this.getDomainOffers({ take: 1000 })
      ]);

      // Calculate average price
      const prices = listings.items.map(listing => 
        formatPrice(listing.price, listing.currency.decimals)
      );
      const averagePrice = prices.length > 0 ? 
        prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;

      // Get top TLDs
      const tldCounts: Record<string, number> = {};
      domains.items.forEach(domain => {
        const tld = `.${domain.name.split('.').pop()}`;
        tldCounts[tld] = (tldCounts[tld] || 0) + 1;
      });
      const topTLDs = Object.entries(tldCounts)
        .map(([tld, count]) => ({ tld, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Get top networks
      const networkCounts: Record<string, number> = {};
      domains.items.forEach(domain => {
        domain.tokens?.forEach((token: any) => {
          const networkName = getNetworkName(token.networkId);
          networkCounts[networkName] = (networkCounts[networkName] || 0) + 1;
        });
      });
      const topNetworks = Object.entries(networkCounts)
        .map(([network, count]) => ({ network, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalDomains: domains.totalCount,
        totalListings: listings.totalCount,
        totalOffers: offers.totalCount,
        averagePrice,
        topTLDs,
        topNetworks
      };
    } catch (error) {
      console.error('Error fetching marketplace overview:', error);
      throw error;
    }
  }

  // Get domain recommendations based on user preferences
  async getDomainRecommendations(preferences: {
    tlds?: string[];
    networks?: string[];
    maxPrice?: number;
    minValueScore?: number;
    limit?: number;
  } = {}): Promise<Domain[]> {
    const filters: SubgraphFilters = {
      take: preferences.limit || 50,
      tlds: preferences.tlds,
      networkIds: preferences.networks
    };

    const domains = await this.getTokenizedDomains(filters);
    
    // Filter by preferences
    let filteredDomains = domains.items;

    if (preferences.minValueScore) {
      filteredDomains = filteredDomains.filter(domain => {
        const valueScore = calculateDomainValueScore(domain).score;
        return valueScore >= preferences.minValueScore!;
      });
    }

    // Sort by value score
    filteredDomains = sortDomains(filteredDomains, 'value', 'desc');

    return filteredDomains;
  }

  // Get domain price history (if available)
  async getDomainPriceHistory(domainName: string): Promise<any[]> {
    try {
      const activities = await this.getDomainActivities(domainName, { take: 100 });
      
      // Filter activities that involve price changes
      const priceActivities = activities.items.filter(activity => 
        ['LISTED', 'PURCHASED', 'OFFER_RECEIVED'].includes(activity.type)
      );

      return priceActivities.map(activity => ({
        date: activity.createdAt,
        price: activity.payment ? formatPrice(activity.payment.price, activity.payment.currency.decimals) : null,
        currency: activity.payment?.currency?.symbol || null,
        type: activity.type,
        transactionHash: activity.txHash
      }));
    } catch (error) {
      console.error(`Error fetching price history for domain ${domainName}:`, error);
      throw error;
    }
  }

  // Get domain comparison data
  async compareDomains(domainNames: string[]): Promise<Array<{
    name: string;
    analytics: any;
    valueScore: number;
    status: string;
    expiringSoon: boolean;
  }>> {
    const comparisons = await Promise.all(
      domainNames.map(async domainName => {
        try {
          const [domainInfo, analytics] = await Promise.all([
            this.getDomainInfo(domainName),
            this.getDomainAnalytics(domainName).catch(() => null)
          ]);

          if (!domainInfo) {
            return {
              name: domainName,
              analytics: null,
              valueScore: 0,
              status: 'Not Found',
              expiringSoon: false
            };
          }

          const domainAnalytics = generateDomainAnalytics(domainInfo);
          const valueScore = calculateDomainValueScore(domainInfo).score;

          return {
            name: domainName,
            analytics: analytics || domainAnalytics,
            valueScore,
            status: domainInfo.eoi ? 'EOI' : 'Tokenized',
            expiringSoon: isExpiringSoon(domainInfo.expiresAt)
          };
        } catch (error) {
          console.error(`Error comparing domain ${domainName}:`, error);
          return {
            name: domainName,
            analytics: null,
            valueScore: 0,
            status: 'Error',
            expiringSoon: false
          };
        }
      })
    );

    return comparisons;
  }
}

export default DomaSubgraphService;
