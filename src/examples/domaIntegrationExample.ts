// @ts-nocheck
import { domaApiClient, createDomaApiClient } from '../services/domaApiClient';
import {
  GET_TOKENIZED_DOMAINS,
  GET_DOMAIN_INFO,
  GET_DOMAIN_LISTINGS,
  GET_DOMAIN_OFFERS,
  GET_DOMAIN_STATISTICS,
  GET_USER_PORTFOLIO,
  GET_MARKETPLACE_STATISTICS,
  SEARCH_DOMAINS,
} from '../services/domaQueries';
import {
  INITIATE_EMAIL_VERIFICATION,
  COMPLETE_EMAIL_VERIFICATION,
  UPLOAD_REGISTRANT_CONTACTS,
  CREATE_DOMAIN_LISTING,
  CREATE_DOMAIN_OFFER,
  PURCHASE_DOMAIN_LISTING,
  ACCEPT_DOMAIN_OFFER,
  TRANSFER_DOMAIN_OWNERSHIP,
  RENEW_DOMAIN,
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

/**
 * Comprehensive Doma Protocol API Integration Example
 * 
 * This file demonstrates how to use the Doma API client and all its features
 * including domain queries, mutations, and utility functions.
 */

class DomaIntegrationExample {
  private client: typeof domaApiClient;

  constructor(apiKey?: string) {
    this.client = createDomaApiClient({
      apiKey,
      environment: 'testnet',
      timeout: 30000,
    });
  }

  // Example: Fetch popular domains for sale
  async getPopularDomainsForSale(limit: number = 10) {
    try {
      const variables = {
        skip: 0,
        take: limit,
        sortOrder: 'DESC' as const,
      };

      const data = await this.client.query(GET_DOMAIN_LISTINGS, variables);
      
      return data.listings.items.map(listing => ({
        name: formatDomainName(listing.name),
        price: formatPriceDisplay(listing.price, listing.currency.decimals, listing.currency.symbol),
        currency: listing.currency.symbol,
        expires: listing.nameExpiresAt,
        network: getNetworkName(listing.chain.networkId),
        isExpiringSoon: isExpiringSoon(listing.nameExpiresAt),
        owner: truncateAddress(listing.offererAddress),
        avatar: getDomainAvatar(listing.name),
        thumbnail: getDomainThumbnail(listing.name),
        isPremium: isPremiumDomain(listing.name),
        estimatedValue: estimateDomainValue(listing.name),
      }));
    } catch (error) {
      console.error('Error fetching domain listings:', error);
      throw error;
    }
  }

  // Example: Get detailed domain information
  async getDomainDetails(domainName: string) {
    try {
      if (!isValidDomainName(domainName)) {
        throw new Error('Invalid domain name format');
      }

      const variables = { name: domainName };
      const data = await this.client.query(GET_DOMAIN_INFO, variables);
      
      return {
        name: formatDomainName(data.name.name),
        expiresAt: data.name.expiresAt,
        tokenizedAt: data.name.tokenizedAt,
        registrar: data.name.registrar.name,
        isTokenized: data.name.tokens.length > 0,
        isEOI: data.name.eoi,
        tokens: data.name.tokens.map(token => ({
          tokenId: token.tokenId,
          owner: truncateAddress(token.ownerAddress),
          network: getNetworkName(token.chain.networkId),
          explorerUrl: token.explorerUrl,
          startsAt: formatTimestamp(token.startsAt),
          expiresAt: formatTimestamp(token.expiresAt),
          daysUntilExpiry: getDaysUntilExpiry(token.expiresAt),
          isExpiringSoon: isExpiringSoon(token.expiresAt),
        })),
        activities: data.name.activities.map(activity => ({
          type: activity.type,
          date: formatTimestamp(activity.createdAt),
          relativeTime: formatRelativeTime(activity.createdAt),
          txHash: activity.txHash || 'N/A',
          networkId: activity.networkId || 'N/A',
        })),
        listings: data.name.tokens.flatMap(token => 
          token.listings?.map(listing => ({
            id: listing.id,
            price: formatPriceDisplay(listing.price, listing.currency.decimals, listing.currency.symbol),
            currency: listing.currency.symbol,
            expiresAt: formatTimestamp(listing.expiresAt),
          })) || []
        ),
        metadata: {
          avatar: getDomainAvatar(domainName),
          thumbnail: getDomainThumbnail(domainName),
          isPremium: isPremiumDomain(domainName),
          estimatedValue: estimateDomainValue(domainName),
          tld: extractTLD(domainName),
          sld: extractSLD(domainName),
        },
      };
    } catch (error) {
      console.error(`Error fetching details for ${domainName}:`, error);
      throw error;
    }
  }

  // Example: Domain claiming process
  async claimDomain(domainName: string, contactInfo: Record<string, unknown>, email: string) {
    try {
      if (!isValidDomainName(domainName)) {
        throw new Error('Invalid domain name format');
      }

      if (!isValidEmail(email)) {
        throw new Error('Invalid email format');
      }

      // Step 1: Initiate email verification
      console.log('Step 1: Initiating email verification...');
      await this.client.mutate(INITIATE_EMAIL_VERIFICATION, { email });
      
      // In a real application, you would wait for the user to input the code
      // For this example, we'll simulate the verification process
      console.log('Please check your email for the verification code');
      
      // Simulate user input
      const verificationCode = '123456'; // This would come from user input
      
      // Step 2: Complete email verification
      console.log('Step 2: Completing email verification...');
      const verificationProof = await this.client.mutate(
        COMPLETE_EMAIL_VERIFICATION, 
        { code: verificationCode, email }
      );
      
      // Step 3: Upload registrant contacts
      console.log('Step 3: Uploading registrant contacts...');
      const networkId = 'eip155:5'; // Example: Goerli testnet
      const registrarIanaId = 123; // Example registrar ID
      
      const result = await this.client.mutate(UPLOAD_REGISTRANT_CONTACTS, {
        contact: contactInfo,
        emailVerificationProof: verificationProof,
        networkId,
        registrarIanaId,
      });
      
      console.log('Domain claim process initiated successfully');
      return {
        success: true,
        proofOfContactsVoucher: result.proofOfContactsVoucher,
        signature: result.signature,
      };
    } catch (error) {
      console.error('Error claiming domain:', error);
      throw error;
    }
  }

  // Example: Monitor domain portfolio
  async monitorPortfolio(walletAddress: string) {
    try {
      if (!isValidEthereumAddress(walletAddress)) {
        throw new Error('Invalid Ethereum address');
      }

      const variables = {
        address: toCAIP10(walletAddress),
      };

      const data = await this.client.query(GET_USER_PORTFOLIO, variables);
      
      const portfolio = data.names.items.map(domain => ({
        name: formatDomainName(domain.name),
        expiresAt: formatTimestamp(domain.expiresAt),
        daysUntilExpiry: getDaysUntilExpiry(domain.expiresAt),
        isExpiringSoon: isExpiringSoon(domain.expiresAt),
        status: domain.eoi ? 'EOI' : 'Tokenized',
        tokens: domain.tokens.length,
        registrar: domain.registrar.name,
        network: domain.tokens[0]?.chain.name || 'Unknown',
        avatar: getDomainAvatar(domain.name),
        isPremium: isPremiumDomain(domain.name),
        estimatedValue: estimateDomainValue(domain.name),
        activities: domain.activities.map(activity => ({
          type: activity.type,
          date: formatTimestamp(activity.createdAt),
          relativeTime: formatRelativeTime(activity.createdAt),
        })),
      }));
      
      // Filter domains that are expiring soon
      const expiringSoon = portfolio.filter(domain => domain.isExpiringSoon);
      
      // Sort by expiration date
      const sortedPortfolio = sortDomains(portfolio, 'expiry', 'asc');
      
      return {
        totalDomains: data.names.totalCount,
        portfolio: sortedPortfolio,
        expiringSoon,
        stats: {
          total: portfolio.length,
          expiring: expiringSoon.length,
          eoi: portfolio.filter(d => d.status === 'EOI').length,
          tokenized: portfolio.filter(d => d.status === 'Tokenized').length,
          premium: portfolio.filter(d => d.isPremium).length,
        },
        summary: {
          totalEstimatedValue: portfolio.reduce((sum, domain) => sum + domain.estimatedValue.min, 0),
          averageDomainLength: portfolio.reduce((sum, domain) => sum + domain.name.length, 0) / portfolio.length,
          topTlds: this.getTopTlds(portfolio),
        },
      };
    } catch (error) {
      console.error('Error monitoring portfolio:', error);
      throw error;
    }
  }

  // Example: Create domain listing
  async createDomainListing(tokenId: string, price: string, currency: string = 'ETH') {
    try {
      const result = await this.client.mutate(CREATE_DOMAIN_LISTING, {
        tokenId,
        price,
        currency,
      });
      
      return {
        success: true,
        listingId: result.id,
        price: formatPriceDisplay(price, 18, currency),
        createdAt: formatTimestamp(result.createdAt),
      };
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  }

  // Example: Create domain offer
  async createDomainOffer(tokenId: string, price: string, currency: string = 'ETH') {
    try {
      const result = await this.client.mutate(CREATE_DOMAIN_OFFER, {
        tokenId,
        price,
        currency,
      });
      
      return {
        success: true,
        offerId: result.id,
        price: formatPriceDisplay(price, 18, currency),
        createdAt: formatTimestamp(result.createdAt),
      };
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  // Example: Purchase domain listing
  async purchaseDomainListing(listingId: string) {
    try {
      const result = await this.client.mutate(PURCHASE_DOMAIN_LISTING, {
        listingId,
      });
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        purchasedAt: formatTimestamp(result.purchasedAt),
      };
    } catch (error) {
      console.error('Error purchasing listing:', error);
      throw error;
    }
  }

  // Example: Accept domain offer
  async acceptDomainOffer(offerId: string) {
    try {
      const result = await this.client.mutate(ACCEPT_DOMAIN_OFFER, {
        offerId,
      });
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        acceptedAt: formatTimestamp(result.acceptedAt),
      };
    } catch (error) {
      console.error('Error accepting offer:', error);
      throw error;
    }
  }

  // Example: Transfer domain ownership
  async transferDomainOwnership(tokenId: string, toAddress: string) {
    try {
      if (!isValidEthereumAddress(toAddress)) {
        throw new Error('Invalid Ethereum address');
      }

      const result = await this.client.mutate(TRANSFER_DOMAIN_OWNERSHIP, {
        tokenId,
        toAddress,
      });
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        transferredAt: formatTimestamp(result.transferredAt),
        fromAddress: truncateAddress(result.fromAddress),
        toAddress: truncateAddress(result.toAddress),
      };
    } catch (error) {
      console.error('Error transferring ownership:', error);
      throw error;
    }
  }

  // Example: Renew domain
  async renewDomain(tokenId: string, duration: number) {
    try {
      const result = await this.client.mutate(RENEW_DOMAIN, {
        tokenId,
        duration,
      });
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        newExpirationDate: formatTimestamp(result.newExpirationDate),
        renewedAt: formatTimestamp(result.renewedAt),
        duration: formatDuration(duration * 365 * 24 * 60 * 60), // Convert years to seconds
      };
    } catch (error) {
      console.error('Error renewing domain:', error);
      throw error;
    }
  }

  // Example: Search domains
  async searchDomains(query: string, filters: {
    tlds?: string[];
    networkIds?: string[];
    maxResults?: number;
  } = {}) {
    try {
      const variables = {
        query,
        skip: 0,
        take: filters.maxResults || 20,
        tlds: filters.tlds,
        networkIds: filters.networkIds,
      };

      const data = await this.client.query(SEARCH_DOMAINS, variables);
      
      return data.searchDomains.items.map(domain => ({
        name: formatDomainName(domain.name),
        expiresAt: formatTimestamp(domain.expiresAt),
        isTokenized: domain.tokens.length > 0,
        isEOI: domain.eoi,
        registrar: domain.registrar.name,
        network: domain.tokens[0]?.chain.name || 'Unknown',
        avatar: getDomainAvatar(domain.name),
        isPremium: isPremiumDomain(domain.name),
        estimatedValue: estimateDomainValue(domain.name),
        tld: extractTLD(domain.name),
        sld: extractSLD(domain.name),
      }));
    } catch (error) {
      console.error('Error searching domains:', error);
      throw error;
    }
  }

  // Example: Get marketplace statistics
  async getMarketplaceStatistics() {
    try {
      const data = await this.client.query(GET_MARKETPLACE_STATISTICS);
      
      return {
        totalListings: data.marketplaceStats.totalListings,
        totalOffers: data.marketplaceStats.totalOffers,
        totalVolume: formatPriceDisplay(data.marketplaceStats.totalVolume, 18, 'ETH'),
        averagePrice: formatPriceDisplay(data.marketplaceStats.averagePrice, 18, 'ETH'),
        topTlds: data.marketplaceStats.topTlds.map((tld: any) => ({
          tld: tld.tld,
          count: tld.count,
          percentage: ((tld.count / data.marketplaceStats.totalListings) * 100).toFixed(1) + '%',
        })),
        recentActivity: data.marketplaceStats.recentActivity.map((activity: any) => ({
          type: activity.type,
          count: activity.count,
          timestamp: formatTimestamp(activity.timestamp),
          relativeTime: formatRelativeTime(activity.timestamp),
        })),
      };
    } catch (error) {
      console.error('Error fetching marketplace statistics:', error);
      throw error;
    }
  }

  // Example: Get domain statistics
  async getDomainStatistics(tokenId: string) {
    try {
      const variables = { tokenId };
      const data = await this.client.query(GET_DOMAIN_STATISTICS, variables);
      
      return {
        name: data.nameStatistics.name,
        highestOffer: data.nameStatistics.highestOffer ? {
          id: data.nameStatistics.highestOffer.id,
          price: formatPriceDisplay(
            data.nameStatistics.highestOffer.price,
            data.nameStatistics.highestOffer.currency.decimals,
            data.nameStatistics.highestOffer.currency.symbol
          ),
          offererAddress: truncateAddress(data.nameStatistics.highestOffer.offererAddress),
          expiresAt: formatTimestamp(data.nameStatistics.highestOffer.expiresAt),
        } : null,
        activeOffers: data.nameStatistics.activeOffers,
        offersLast3Days: data.nameStatistics.offersLast3Days,
      };
    } catch (error) {
      console.error('Error fetching domain statistics:', error);
      throw error;
    }
  }

  // Helper method to get top TLDs from portfolio
  private getTopTlds(portfolio: Array<{ name: string }>): Array<{ tld: string; count: number; percentage: string }> {
    const tldCounts: Record<string, number> = {};
    
    portfolio.forEach(domain => {
      const tld = extractTLD(domain.name);
      tldCounts[tld] = (tldCounts[tld] || 0) + 1;
    });
    
    return Object.entries(tldCounts)
      .map(([tld, count]) => ({
        tld,
        count,
        percentage: ((count / portfolio.length) * 100).toFixed(1) + '%',
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Example: Batch operations with retry logic
  async batchDomainOperations(operations: Array<{
    type: 'createListing' | 'createOffer' | 'transferOwnership' | 'renewDomain';
    params: Record<string, unknown>;
  }>) {
    const results = [];
    
    for (const operation of operations) {
      try {
        let result;
        
        switch (operation.type) {
          case 'createListing':
            result = await retry(
              () => this.createDomainListing(
                operation.params.tokenId as string, 
                operation.params.price as string, 
                operation.params.currency as string
              ),
              3,
              1000
            );
            break;
          case 'createOffer':
            result = await retry(
              () => this.createDomainOffer(
                operation.params.tokenId as string, 
                operation.params.price as string, 
                operation.params.currency as string
              ),
              3,
              1000
            );
            break;
          case 'transferOwnership':
            result = await retry(
              () => this.transferDomainOwnership(
                operation.params.tokenId as string, 
                operation.params.toAddress as string
              ),
              3,
              1000
            );
            break;
          case 'renewDomain':
            result = await retry(
              () => this.renewDomain(
                operation.params.tokenId as string, 
                operation.params.duration as number
              ),
              3,
              1000
            );
            break;
          default:
            throw new Error(`Unknown operation type: ${operation.type}`);
        }
        
        results.push({
          operation: operation.type,
          success: true,
          result,
        });
        
        // Add delay between operations to avoid rate limiting
        await sleep(500);
      } catch (error) {
        results.push({
          operation: operation.type,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    return results;
  }

  // Example: Health check
  async healthCheck(): Promise<boolean> {
    try {
      return await this.client.healthCheck();
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Usage example
export const runDomaIntegrationExample = async () => {
  try {
    const domaIntegration = new DomaIntegrationExample('your-api-key-here');
    
    // Health check
    console.log('🔍 Performing health check...');
    const isHealthy = await domaIntegration.healthCheck();
    console.log('Health check result:', isHealthy ? '✅ Healthy' : '❌ Unhealthy');
    
    if (!isHealthy) {
      console.log('❌ API is not healthy, skipping examples');
      return;
    }
    
    // Get popular domains for sale
    console.log('\n🏪 Fetching popular domains for sale...');
    const popularDomains = await domaIntegration.getPopularDomainsForSale(5);
    console.log('Popular domains:', popularDomains);
    
    // Get details for a specific domain
    console.log('\n🔍 Getting domain details...');
    const domainDetails = await domaIntegration.getDomainDetails('example.com');
    console.log('Domain details:', domainDetails);
    
    // Monitor a wallet's portfolio
    console.log('\n👤 Monitoring portfolio...');
    const portfolio = await domaIntegration.monitorPortfolio('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
    console.log('Portfolio summary:', portfolio.stats);
    
    // Search domains
    console.log('\n🔍 Searching domains...');
    const searchResults = await domaIntegration.searchDomains('crypto', {
      tlds: ['.com', '.io'],
      maxResults: 10,
    });
    console.log('Search results:', searchResults);
    
    // Get marketplace statistics
    console.log('\n📊 Getting marketplace statistics...');
    const marketplaceStats = await domaIntegration.getMarketplaceStatistics();
    console.log('Marketplace stats:', marketplaceStats);
    
    // Batch operations example
    console.log('\n⚡ Running batch operations...');
    const batchResults = await domaIntegration.batchDomainOperations([
      {
        type: 'createListing',
        params: { tokenId: '123', price: '1.0', currency: 'ETH' },
      },
      {
        type: 'createOffer',
        params: { tokenId: '456', price: '0.5', currency: 'ETH' },
      },
    ]);
    console.log('Batch operation results:', batchResults);
    
    console.log('\n✅ All examples completed successfully!');
    
  } catch (error) {
    console.error('❌ Integration example failed:', error);
  }
};

// Export the class for use in other parts of the application
export default DomaIntegrationExample;
