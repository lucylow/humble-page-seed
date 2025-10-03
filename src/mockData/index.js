// src/mockData/index.js
// Central export file for all mock data

// User data
export {
  mockUsers,
  mockUserProfiles
} from './users.js';

// Domain data
export {
  mockDomains,
  mockDomainCategories,
  mockTopLevelDomains
} from './domains.js';

// Transaction data
export {
  mockTransactions,
  mockTransactionTypes,
  mockTransactionStats
} from './transactions.js';

// Marketplace data
export {
  mockMarketplaceListings,
  mockAuctionBids,
  mockOffers,
  mockMarketplaceStats
} from './marketplace.js';

// Fractional ownership data
export {
  mockFractionalData,
  mockFractionalTransactions,
  mockGovernanceProposals,
  mockFractionalStats
} from './fractional.js';

// Analytics data
export {
  mockAnalytics,
  mockHistoricalData,
  mockTopPerformers,
  mockMarketTrends
} from './analytics.js';

// Messages and notifications
export {
  mockMessages,
  mockNotifications,
  mockMessageTypes,
  mockNotificationTypes,
  mockMessageStats
} from './messages.js';

// Utility functions for working with mock data
export const mockDataUtils = {
  // Get user by wallet address
  getUserByWallet: (walletAddress) => {
    return mockUsers.find(user => user.walletAddress === walletAddress);
  },

  // Get domains by owner
  getDomainsByOwner: (ownerAddress) => {
    return mockDomains.filter(domain => domain.owner === ownerAddress);
  },

  // Get transactions by domain
  getTransactionsByDomain: (domainId) => {
    return mockTransactions.filter(tx => tx.domainId === domainId);
  },

  // Get fractional data by domain
  getFractionalByDomain: (domainId) => {
    return mockFractionalData.find(data => data.domainId === domainId);
  },

  // Get messages by user
  getMessagesByUser: (userAddress) => {
    return mockMessages.filter(msg => msg.to === userAddress || msg.from === userAddress);
  },

  // Get notifications by user
  getNotificationsByUser: (userAddress) => {
    return mockNotifications.filter(notif => notif.to === userAddress);
  },

  // Calculate domain ROI
  calculateDomainROI: (domain) => {
    if (!domain.priceHistory || domain.priceHistory.length < 2) return 0;
    const originalPrice = domain.priceHistory[0].price;
    const currentPrice = domain.currentPrice;
    return ((currentPrice - originalPrice) / originalPrice) * 100;
  },

  // Get trending domains
  getTrendingDomains: (limit = 5) => {
    return mockDomains
      .sort((a, b) => b.currentPrice - a.currentPrice)
      .slice(0, limit);
  },

  // Get recent transactions
  getRecentTransactions: (limit = 10) => {
    return mockTransactions
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  },

  // Get active listings
  getActiveListings: () => {
    return mockMarketplaceListings.filter(listing => listing.status === 'active');
  },

  // Get fractional domains
  getFractionalDomains: () => {
    return mockDomains.filter(domain => domain.isFractionalized);
  },

  // Get user portfolio value
  getUserPortfolioValue: (userAddress) => {
    const userDomains = mockDomains.filter(domain => domain.owner === userAddress);
    return userDomains.reduce((total, domain) => total + domain.currentPrice, 0);
  },

  // Get domain price history
  getDomainPriceHistory: (domainId) => {
    const domain = mockDomains.find(d => d.id === domainId);
    return domain ? domain.priceHistory : [];
  },

  // Get marketplace stats by category
  getMarketplaceStatsByCategory: (category) => {
    const categoryListings = mockMarketplaceListings.filter(
      listing => listing.category === category
    );
    return {
      count: categoryListings.length,
      totalValue: categoryListings.reduce((sum, listing) => sum + listing.price, 0),
      averagePrice: categoryListings.length > 0 
        ? categoryListings.reduce((sum, listing) => sum + listing.price, 0) / categoryListings.length 
        : 0
    };
  }
};

// Sample data for testing and development
export const sampleData = {
  // Sample user for testing
  sampleUser: {
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    username: "crypto_domainer",
    email: "john@domaininvestor.com"
  },

  // Sample domain for testing
  sampleDomain: {
    name: "cryptoqueen.xyz",
    currentPrice: 25000,
    category: "crypto",
    isListed: true
  },

  // Sample transaction for testing
  sampleTransaction: {
    type: "sale",
    amount: 25000,
    currency: "USDC",
    status: "completed"
  }
};

// Constants for the application
export const mockConstants = {
  CURRENCIES: ['USDC', 'ETH', 'USDT'],
  DOMAIN_CATEGORIES: ['crypto', 'web3', 'defi', 'nft', 'metaverse', 'education', 'gaming', 'finance'],
  TRANSACTION_TYPES: ['sale', 'fractional_purchase', 'fractional_sale', 'offer', 'auction_bid', 'view', 'transfer', 'mint'],
  LISTING_TYPES: ['fixed_price', 'auction'],
  MESSAGE_TYPES: ['offer', 'message', 'notification', 'system'],
  NOTIFICATION_TYPES: ['domain_sale', 'new_offer', 'revenue_distribution', 'auction_ending', 'share_purchase', 'governance_vote'],
  PLATFORM_FEE: 0.025, // 2.5%
  MINIMUM_SHARES: 1,
  MAXIMUM_SHARES: 10000
};
