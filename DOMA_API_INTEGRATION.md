# Doma Protocol API Integration Guide

This guide provides comprehensive documentation for integrating with the Doma Protocol API in your React application. The integration includes GraphQL queries, mutations, utility functions, and React hooks for seamless domain management.

## Table of Contents

1. [Installation and Setup](#installation-and-setup)
2. [API Client Configuration](#api-client-configuration)
3. [GraphQL Queries](#graphql-queries)
4. [GraphQL Mutations](#graphql-mutations)
5. [Utility Functions](#utility-functions)
6. [React Hooks](#react-hooks)
7. [Context Integration](#context-integration)
8. [Usage Examples](#usage-examples)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)

## Installation and Setup

### Dependencies

First, install the necessary dependencies:

```bash
npm install graphql graphql-request axios
# or
yarn add graphql graphql-request axios
```

### Environment Variables

Create a `.env` file in your project root:

```env
# Doma API Configuration
REACT_APP_DOMA_API_KEY=your-api-key-here
REACT_APP_DOMA_ENVIRONMENT=testnet
REACT_APP_DOMA_TIMEOUT=30000

# Network RPC URLs
REACT_APP_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
REACT_APP_POLYGON_RPC_URL=https://polygon-rpc.com
REACT_APP_GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR_PROJECT_ID
```

## API Client Configuration

### Basic Setup

```typescript
import { createDomaApiClient } from './services/domaApiClient';

// Create a client instance
const domaClient = createDomaApiClient({
  apiKey: process.env.REACT_APP_DOMA_API_KEY,
  environment: 'testnet',
  timeout: 30000,
});

// Set API key for authenticated requests
domaClient.setApiKey('your-api-key-here');

// Switch between testnet and mainnet
domaClient.switchEnvironment('mainnet');
```

### Health Check

```typescript
// Check if the API is healthy
const isHealthy = await domaClient.healthCheck();
console.log('API Health:', isHealthy ? 'Healthy' : 'Unhealthy');
```

## GraphQL Queries

### Fetch Tokenized Domains

```typescript
import { GET_TOKENIZED_DOMAINS } from './services/domaQueries';

const variables = {
  skip: 0,
  take: 20,
  ownedBy: ['eip155:1:0x742d35Cc6634C0532925a3b844Bc454e4438f44e'],
  claimStatus: 'ALL',
  sortOrder: 'DESC',
};

const data = await domaClient.query(GET_TOKENIZED_DOMAINS, variables);
console.log('Domains:', data.names.items);
```

### Get Domain Information

```typescript
import { GET_DOMAIN_INFO } from './services/domaQueries';

const domainInfo = await domaClient.query(GET_DOMAIN_INFO, { 
  name: 'example.com' 
});
console.log('Domain Info:', domainInfo.name);
```

### Search Domains

```typescript
import { SEARCH_DOMAINS } from './services/domaQueries';

const searchResults = await domaClient.query(SEARCH_DOMAINS, {
  query: 'crypto',
  skip: 0,
  take: 10,
  tlds: ['.com', '.io'],
});
console.log('Search Results:', searchResults.searchDomains.items);
```

### Get Marketplace Statistics

```typescript
import { GET_MARKETPLACE_STATISTICS } from './services/domaQueries';

const stats = await domaClient.query(GET_MARKETPLACE_STATISTICS);
console.log('Marketplace Stats:', stats.marketplaceStats);
```

## GraphQL Mutations

### Email Verification

```typescript
import { 
  INITIATE_EMAIL_VERIFICATION, 
  COMPLETE_EMAIL_VERIFICATION 
} from './services/domaMutations';

// Step 1: Initiate email verification
await domaClient.mutate(INITIATE_EMAIL_VERIFICATION, { 
  email: 'user@example.com' 
});

// Step 2: Complete email verification (after user inputs code)
const verificationProof = await domaClient.mutate(
  COMPLETE_EMAIL_VERIFICATION, 
  { 
    code: '123456', 
    email: 'user@example.com' 
  }
);
```

### Domain Claiming

```typescript
import { UPLOAD_REGISTRANT_CONTACTS } from './services/domaMutations';

const contactInfo = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
  },
};

const result = await domaClient.mutate(UPLOAD_REGISTRANT_CONTACTS, {
  contact: contactInfo,
  emailVerificationProof: verificationProof,
  networkId: 'eip155:5',
  registrarIanaId: 123,
});
```

### Create Domain Listing

```typescript
import { CREATE_DOMAIN_LISTING } from './services/domaMutations';

const listing = await domaClient.mutate(CREATE_DOMAIN_LISTING, {
  tokenId: '123',
  price: '1000000000000000000', // 1 ETH in wei
  currency: 'ETH',
  expiresAt: '2024-12-31T23:59:59Z',
});
```

### Create Domain Offer

```typescript
import { CREATE_DOMAIN_OFFER } from './services/domaMutations';

const offer = await domaClient.mutate(CREATE_DOMAIN_OFFER, {
  tokenId: '123',
  price: '800000000000000000', // 0.8 ETH in wei
  currency: 'ETH',
  expiresAt: '2024-12-31T23:59:59Z',
});
```

### Purchase Domain Listing

```typescript
import { PURCHASE_DOMAIN_LISTING } from './services/domaMutations';

const purchase = await domaClient.mutate(PURCHASE_DOMAIN_LISTING, {
  listingId: 'listing-123',
});
```

### Transfer Domain Ownership

```typescript
import { TRANSFER_DOMAIN_OWNERSHIP } from './services/domaMutations';

const transfer = await domaClient.mutate(TRANSFER_DOMAIN_OWNERSHIP, {
  tokenId: '123',
  toAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
});
```

### Renew Domain

```typescript
import { RENEW_DOMAIN } from './services/domaMutations';

const renewal = await domaClient.mutate(RENEW_DOMAIN, {
  tokenId: '123',
  duration: 1, // 1 year
});
```

## Utility Functions

### Price Formatting

```typescript
import { formatPrice, formatPriceDisplay } from './utils/domaHelpers';

// Format price from wei/base units
const price = formatPrice('1000000000000000000', 18); // 1.0

// Format price for display
const displayPrice = formatPriceDisplay('1000000000000000000', 18, 'ETH', 4);
// Result: "1.0000 ETH"
```

### Address Conversion

```typescript
import { toCAIP10, fromCAIP10 } from './utils/domaHelpers';

// Convert to CAIP-10 format
const caipAddress = toCAIP10('0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 'eip155:1');
// Result: "eip155:1:0x742d35Cc6634C0532925a3b844Bc454e4438f44e"

// Parse CAIP-10 format
const { chainId, address } = fromCAIP10(caipAddress);
// Result: { chainId: "eip155:1", address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" }
```

### Domain Validation

```typescript
import { 
  isValidDomainName, 
  extractTLD, 
  extractSLD,
  isPremiumDomain,
  estimateDomainValue 
} from './utils/domaHelpers';

// Validate domain name
const isValid = isValidDomainName('example.com'); // true

// Extract TLD and SLD
const tld = extractTLD('example.com'); // '.com'
const sld = extractSLD('example.com'); // 'example'

// Check if domain is premium
const isPremium = isPremiumDomain('crypto.com'); // true

// Estimate domain value
const value = estimateDomainValue('crypto.com');
// Result: { min: 10000, max: 20000, confidence: 'high' }
```

### Time Utilities

```typescript
import { 
  isExpiringSoon, 
  getDaysUntilExpiry,
  formatTimestamp,
  formatRelativeTime 
} from './utils/domaHelpers';

// Check if domain is expiring soon
const expiringSoon = isExpiringSoon('2024-12-31T23:59:59Z', 30); // true if within 30 days

// Get days until expiry
const daysLeft = getDaysUntilExpiry('2024-12-31T23:59:59Z'); // number of days

// Format timestamps
const formattedDate = formatTimestamp('2024-01-01T00:00:00Z');
// Result: "Jan 1, 2024, 12:00 AM"

const relativeTime = formatRelativeTime('2024-01-01T00:00:00Z');
// Result: "2 hours ago"
```

### Domain Filtering and Sorting

```typescript
import { sortDomains, filterDomains } from './utils/domaHelpers';

// Sort domains
const sortedDomains = sortDomains(domains, 'price', 'desc');

// Filter domains
const filteredDomains = filterDomains(domains, {
  tld: ['.com', '.io'],
  priceRange: { min: 0.1, max: 10.0 },
  expiringSoon: true,
  isListed: true,
  searchTerm: 'crypto',
});
```

## React Hooks

### useDomaDomains Hook

```typescript
import { useDomaDomains } from './hooks/useDomaApi';

const MyComponent = () => {
  const { domains, loading, error, pagination, refetch } = useDomaDomains({
    skip: 0,
    take: 20,
    ownedBy: ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e'],
    claimStatus: 'ALL',
    sortOrder: 'DESC',
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {domains.map(domain => (
        <div key={domain.tokenId}>
          <h3>{domain.name}</h3>
          <p>Expires: {domain.expiresAt}</p>
        </div>
      ))}
    </div>
  );
};
```

### useDomaListings Hook

```typescript
import { useDomaListings } from './hooks/useDomaApi';

const MarketplaceComponent = () => {
  const { listings, loading, error, pagination } = useDomaListings({
    skip: 0,
    take: 20,
    tlds: ['.com', '.io'],
    networkIds: ['eip155:1'],
  });

  return (
    <div>
      {listings.map(listing => (
        <div key={listing.id}>
          <h3>{listing.name}</h3>
          <p>Price: {listing.price} {listing.currency.symbol}</p>
        </div>
      ))}
    </div>
  );
};
```

### useDomaOperations Hook

```typescript
import { useDomaOperations } from './hooks/useDomaApi';

const DomainManagementComponent = () => {
  const {
    loading,
    error,
    createListing,
    createOffer,
    transferOwnership,
    renewDomain,
  } = useDomaOperations();

  const handleCreateListing = async () => {
    try {
      const result = await createListing('123', '1.0', 'ETH');
      console.log('Listing created:', result);
    } catch (error) {
      console.error('Failed to create listing:', error);
    }
  };

  return (
    <div>
      <button onClick={handleCreateListing} disabled={loading}>
        {loading ? 'Creating...' : 'Create Listing'}
      </button>
      {error && <div>Error: {error}</div>}
    </div>
  );
};
```

### useDomaPortfolio Hook

```typescript
import { useDomaPortfolio } from './hooks/useDomaApi';

const PortfolioComponent = ({ address }: { address: string }) => {
  const { portfolio, stats, loading, error } = useDomaPortfolio(address);

  return (
    <div>
      <h2>Portfolio Statistics</h2>
      <p>Total Domains: {stats.totalDomains}</p>
      <p>Expiring Soon: {stats.expiringSoon}</p>
      <p>EOI: {stats.eoi}</p>
      <p>Tokenized: {stats.tokenized}</p>
      
      <h3>Domains</h3>
      {portfolio.map(domain => (
        <div key={domain.name}>
          <h4>{domain.name}</h4>
          <p>Status: {domain.eoi ? 'EOI' : 'Tokenized'}</p>
        </div>
      ))}
    </div>
  );
};
```

### useDomaSearch Hook

```typescript
import { useDomaSearch } from './hooks/useDomaApi';

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const { results, loading, error, pagination } = useDomaSearch(query, {
    tlds: ['.com', '.io'],
    maxResults: 20,
  });

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search domains..."
      />
      
      {loading && <div>Searching...</div>}
      {error && <div>Error: {error}</div>}
      
      {results.map(domain => (
        <div key={domain.name}>
          <h3>{domain.name}</h3>
          <p>Expires: {domain.expiresAt}</p>
        </div>
      ))}
    </div>
  );
};
```

## Context Integration

The DomaContext has been updated to use the real API instead of mock data:

```typescript
import { useDoma } from './contexts/DomaContext';

const MyComponent = () => {
  const {
    userDomains,
    marketplaceDomains,
    isLoading,
    tokenizeDomain,
    listDomain,
    buyDomain,
    createListing,
    createOffer,
    transferOwnership,
    renewDomain,
    portfolioStats,
    marketplaceStats,
  } = useDoma();

  return (
    <div>
      <h2>Your Domains ({portfolioStats.totalDomains})</h2>
      {userDomains.map(domain => (
        <div key={domain.tokenId}>
          <h3>{domain.name}</h3>
          <button onClick={() => listDomain(domain.tokenId, '1.0')}>
            List for Sale
          </button>
        </div>
      ))}
      
      <h2>Marketplace ({marketplaceStats?.totalListings})</h2>
      {marketplaceDomains.map(domain => (
        <div key={domain.tokenId}>
          <h3>{domain.name}</h3>
          <p>Price: {domain.price}</p>
          <button onClick={() => buyDomain(domain.tokenId, domain.price!)}>
            Buy Now
          </button>
        </div>
      ))}
    </div>
  );
};
```

## Usage Examples

### Complete Domain Management Flow

```typescript
import DomaIntegrationExample from './examples/domaIntegrationExample';

const runCompleteExample = async () => {
  const domaIntegration = new DomaIntegrationExample('your-api-key-here');
  
  try {
    // 1. Health check
    const isHealthy = await domaIntegration.healthCheck();
    if (!isHealthy) throw new Error('API is not healthy');
    
    // 2. Get popular domains
    const popularDomains = await domaIntegration.getPopularDomainsForSale(5);
    console.log('Popular domains:', popularDomains);
    
    // 3. Get domain details
    const domainDetails = await domaIntegration.getDomainDetails('example.com');
    console.log('Domain details:', domainDetails);
    
    // 4. Monitor portfolio
    const portfolio = await domaIntegration.monitorPortfolio('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
    console.log('Portfolio:', portfolio);
    
    // 5. Create listing
    const listing = await domaIntegration.createDomainListing('123', '1.0', 'ETH');
    console.log('Listing created:', listing);
    
    // 6. Create offer
    const offer = await domaIntegration.createDomainOffer('456', '0.8', 'ETH');
    console.log('Offer created:', offer);
    
    // 7. Search domains
    const searchResults = await domaIntegration.searchDomains('crypto');
    console.log('Search results:', searchResults);
    
    // 8. Get marketplace statistics
    const stats = await domaIntegration.getMarketplaceStatistics();
    console.log('Marketplace stats:', stats);
    
  } catch (error) {
    console.error('Example failed:', error);
  }
};
```

### Batch Operations

```typescript
const batchOperations = async () => {
  const domaIntegration = new DomaIntegrationExample('your-api-key-here');
  
  const operations = [
    {
      type: 'createListing' as const,
      params: { tokenId: '123', price: '1.0', currency: 'ETH' },
    },
    {
      type: 'createOffer' as const,
      params: { tokenId: '456', price: '0.5', currency: 'ETH' },
    },
    {
      type: 'transferOwnership' as const,
      params: { tokenId: '789', toAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
    },
  ];
  
  const results = await domaIntegration.batchDomainOperations(operations);
  console.log('Batch results:', results);
};
```

## Error Handling

### API Error Handling

```typescript
import { domaApiClient } from './services/domaApiClient';

const handleApiCall = async () => {
  try {
    const data = await domaApiClient.query(GET_TOKENIZED_DOMAINS, {});
    return data;
  } catch (error) {
    if (error.message.includes('Network Error')) {
      console.error('Network error - check your connection');
    } else if (error.message.includes('401')) {
      console.error('Unauthorized - check your API key');
    } else if (error.message.includes('429')) {
      console.error('Rate limited - wait before retrying');
    } else {
      console.error('API error:', error.message);
    }
    throw error;
  }
};
```

### Retry Logic

```typescript
import { retry } from './utils/domaHelpers';

const reliableApiCall = async () => {
  return retry(
    () => domaApiClient.query(GET_TOKENIZED_DOMAINS, {}),
    3, // max attempts
    1000 // delay between attempts
  );
};
```

### Error Boundaries

```typescript
import React from 'react';

class DomaErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Doma API Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong with the Doma API.</h2>
          <details>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Best Practices

### 1. API Key Management

```typescript
// Store API key securely
const apiKey = process.env.REACT_APP_DOMA_API_KEY;

// Don't expose API key in client-side code
if (process.env.NODE_ENV === 'development') {
  console.warn('Using development API key');
}
```

### 2. Caching and Performance

```typescript
import { useMemo } from 'react';

const MyComponent = () => {
  const { domains } = useDomaDomains();
  
  // Memoize expensive calculations
  const processedDomains = useMemo(() => {
    return domains.map(domain => ({
      ...domain,
      isExpiringSoon: isExpiringSoon(domain.expiresAt),
      estimatedValue: estimateDomainValue(domain.name),
    }));
  }, [domains]);
  
  return (
    <div>
      {processedDomains.map(domain => (
        <DomainCard key={domain.tokenId} domain={domain} />
      ))}
    </div>
  );
};
```

### 3. Loading States

```typescript
const DomainList = () => {
  const { domains, loading, error } = useDomaDomains();
  
  if (loading) {
    return <div className="loading-spinner">Loading domains...</div>;
  }
  
  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }
  
  return (
    <div>
      {domains.map(domain => (
        <DomainCard key={domain.tokenId} domain={domain} />
      ))}
    </div>
  );
};
```

### 4. Pagination

```typescript
const PaginatedDomainList = () => {
  const [page, setPage] = useState(1);
  const { domains, pagination, loading } = useDomaDomains({
    skip: (page - 1) * 20,
    take: 20,
  });
  
  return (
    <div>
      <div>
        {domains.map(domain => (
          <DomainCard key={domain.tokenId} domain={domain} />
        ))}
      </div>
      
      <div className="pagination">
        <button 
          disabled={!pagination.hasPreviousPage}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        
        <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
        
        <button 
          disabled={!pagination.hasNextPage}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

### 5. Debounced Search

```typescript
import { useDomaSearch } from './hooks/useDomaApi';
import { debounce } from './utils/domaHelpers';

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const { results, loading } = useDomaSearch(query);
  
  // Debounce search input
  const debouncedSetQuery = useMemo(
    () => debounce(setQuery, 300),
    []
  );
  
  return (
    <div>
      <input
        type="text"
        onChange={(e) => debouncedSetQuery(e.target.value)}
        placeholder="Search domains..."
      />
      
      {loading && <div>Searching...</div>}
      
      {results.map(domain => (
        <div key={domain.name}>{domain.name}</div>
      ))}
    </div>
  );
};
```

### 6. Error Recovery

```typescript
const ResilientComponent = () => {
  const [retryCount, setRetryCount] = useState(0);
  const { domains, error, refetch } = useDomaDomains();
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };
  
  if (error && retryCount < 3) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={handleRetry}>
          Retry ({retryCount}/3)
        </button>
      </div>
    );
  }
  
  if (error && retryCount >= 3) {
    return (
      <div>
        <p>Failed to load domains after 3 attempts</p>
        <button onClick={() => window.location.reload()}>
          Reload Page
        </button>
      </div>
    );
  }
  
  return (
    <div>
      {domains.map(domain => (
        <DomainCard key={domain.tokenId} domain={domain} />
      ))}
    </div>
  );
};
```

## Conclusion

This comprehensive integration provides everything you need to work with the Doma Protocol API in your React application. The modular design allows you to use only the components you need, while the extensive utility functions and React hooks make it easy to build powerful domain management interfaces.

Remember to:
- Keep your API keys secure
- Handle errors gracefully
- Implement proper loading states
- Use pagination for large datasets
- Cache expensive operations
- Test thoroughly with both testnet and mainnet environments

For more examples and advanced usage patterns, refer to the `src/examples/domaIntegrationExample.ts` file.
