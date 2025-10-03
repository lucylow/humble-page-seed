# Doma Subgraph Integration Guide

This document provides a comprehensive guide for integrating the Doma Subgraph API into your DomaLand.AI project.

## Overview

The Doma Subgraph integration enables:
- **Real-time Domain Data**: Query tokenized domains, listings, and offers
- **Advanced Filtering**: Filter by TLD, network, owner, and more
- **Marketplace Analytics**: Get trending domains, popular domains, and marketplace overview
- **Activity Tracking**: Monitor domain and token activities
- **Search Functionality**: Search domains by name patterns
- **Portfolio Management**: Track domains owned by specific addresses

## Architecture

### Core Components

1. **DomaSubgraphClient** - GraphQL client for API communication
2. **DomaSubgraphService** - Service class with all query methods
3. **useDomaSubgraph** - React hook for easy integration
4. **Specialized Hooks** - Domain search, marketplace, and portfolio hooks
5. **Utility Functions** - Data formatting and conversion helpers

### GraphQL Queries

The integration includes comprehensive GraphQL queries for:
- Domain information and metadata
- Domain listings and offers
- Domain activities and statistics
- Token activities and transfers
- Search and trending functionality
- Marketplace analytics

## File Structure

```
src/
├── services/
│   └── domaSubgraphClient.ts      # GraphQL client configuration
├── graphql/
│   └── domaQueries.ts             # GraphQL query definitions
├── hooks/
│   └── useDomaSubgraph.ts         # React hooks for integration
├── utils/
│   └── domaSubgraphHelpers.ts     # Utility functions
├── components/
│   └── DomainExplorer.tsx         # Comprehensive explorer component
└── contexts/
    └── Dashboard.tsx              # Updated with subgraph integration
```

## Installation

The required dependencies have been installed:

```bash
npm install graphql graphql-request
```

## Configuration

### Environment Setup

Create a `.env.local` file with subgraph endpoints:

```bash
# Doma Subgraph Endpoints
DOMA_SUBGRAPH_TESTNET=https://api-testnet.doma.xyz/graphql
DOMA_SUBGRAPH_MAINNET=https://api-mainnet.doma.xyz/graphql
DOMA_SUBGRAPH_LOCAL=http://localhost:4000/graphql
```

### Client Configuration

```typescript
// src/services/domaSubgraphClient.ts
const DOMA_SUBGRAPH_ENDPOINTS = {
  testnet: 'https://api-testnet.doma.xyz/graphql',
  mainnet: 'https://api-mainnet.doma.xyz/graphql',
  local: 'http://localhost:4000/graphql'
};
```

## Usage Examples

### Basic Domain Querying

```typescript
import { useDomaSubgraph } from '../hooks/useDomaSubgraph';

const MyComponent = () => {
  const { getTokenizedDomains, loading, error } = useDomaSubgraph('testnet');

  const loadDomains = async () => {
    try {
      const domains = await getTokenizedDomains({
        take: 20,
        skip: 0,
        sortOrder: 'DESC'
      });
      console.log('Domains:', domains);
    } catch (error) {
      console.error('Failed to load domains:', error);
    }
  };

  return (
    <div>
      <button onClick={loadDomains} disabled={loading}>
        {loading ? 'Loading...' : 'Load Domains'}
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
};
```

### Domain Search with Debouncing

```typescript
import { useDomainSearch } from '../hooks/useDomaSubgraph';

const SearchComponent = () => {
  const { query, setQuery, results, loading, error } = useDomainSearch('testnet');

  return (
    <div>
      <input
        type="text"
        placeholder="Search domains..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && <p>Searching...</p>}
      {error && <p>Error: {error}</p>}
      {results && (
        <div>
          {results.items.map(domain => (
            <div key={domain.name}>{domain.name}</div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Marketplace Data

```typescript
import { useDomainMarketplace } from '../hooks/useDomaSubgraph';

const MarketplaceComponent = () => {
  const { overview, trendingDomains, popularDomains, loading } = useDomainMarketplace('testnet');

  if (loading) return <div>Loading marketplace data...</div>;

  return (
    <div>
      <h2>Marketplace Overview</h2>
      <p>Total Domains: {overview.totalDomains}</p>
      <p>Active Listings: {overview.totalListings}</p>
      <p>Active Offers: {overview.totalOffers}</p>
      <p>Average Price: {overview.averagePrice} ETH</p>

      <h3>Trending Domains</h3>
      {trendingDomains.map(domain => (
        <div key={domain.name}>{domain.name}</div>
      ))}

      <h3>Popular Domains</h3>
      {popularDomains.map(domain => (
        <div key={domain.name}>{domain.name}</div>
      ))}
    </div>
  );
};
```

### Portfolio Management

```typescript
import { useDomainPortfolio } from '../hooks/useDomaSubgraph';

const PortfolioComponent = ({ ownerAddress }: { ownerAddress: string }) => {
  const { domains, expiringDomains, loading } = useDomainPortfolio(ownerAddress, 'testnet');

  if (loading) return <div>Loading portfolio...</div>;

  return (
    <div>
      <h2>Your Domains ({domains.length})</h2>
      {domains.map(domain => (
        <div key={domain.name}>
          <h3>{domain.name}</h3>
          <p>Expires: {new Date(domain.expiresAt).toLocaleDateString()}</p>
        </div>
      ))}

      <h3>Expiring Soon ({expiringDomains.length})</h3>
      {expiringDomains.map(domain => (
        <div key={domain.name}>
          <h4>{domain.name}</h4>
          <p>⚠️ Expires: {new Date(domain.expiresAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};
```

## Advanced Features

### Domain Filtering

```typescript
const { getTokenizedDomains } = useDomaSubgraph('testnet');

// Filter by TLD
const comDomains = await getTokenizedDomains({
  tlds: ['.com'],
  take: 50
});

// Filter by network
const polygonDomains = await getTokenizedDomains({
  networkIds: ['eip155:137'],
  take: 50
});

// Filter by owner
const ownerDomains = await getTokenizedDomains({
  ownedBy: ['eip155:1:0x1234...'],
  take: 50
});

// Complex filtering
const filteredDomains = await getTokenizedDomains({
  tlds: ['.com', '.org'],
  networkIds: ['eip155:1', 'eip155:137'],
  sortOrder: 'DESC',
  take: 100
});
```

### Domain Analytics

```typescript
const { getDomainAnalytics, getDomainStatistics } = useDomaSubgraph('testnet');

// Get domain analytics
const analytics = await getDomainAnalytics('example.com');
console.log('Traffic:', analytics.totalViews);
console.log('Unique Visitors:', analytics.uniqueVisitors);

// Get domain statistics
const stats = await getDomainStatistics('tokenId123');
console.log('Active Offers:', stats.activeOffers);
console.log('Highest Offer:', stats.highestOffer);
```

### Activity Tracking

```typescript
const { getDomainActivities, getTokenActivities } = useDomaSubgraph('testnet');

// Get domain activities
const activities = await getDomainActivities('example.com', {
  take: 20,
  sortOrder: 'DESC'
});

// Get token activities
const tokenActivities = await getTokenActivities('tokenId123', {
  take: 20,
  type: 'TRANSFERRED'
});
```

## Utility Functions

### Data Formatting

```typescript
import {
  formatPrice,
  formatCurrency,
  formatActivity,
  formatListing,
  formatOffer,
  calculateDomainValueScore,
  isExpiringSoon,
  getNetworkName
} from '../utils/domaSubgraphHelpers';

// Format prices
const price = formatPrice('1000000000000000000', 18); // 1.0 ETH
const formatted = formatCurrency('1000000000000000000', 'ETH', 18); // "1.0000 ETH"

// Format activities
const activity = formatActivity({
  type: 'TOKENIZED',
  createdAt: '2024-01-01T00:00:00Z',
  txHash: '0x123...',
  networkId: 'eip155:1'
});

// Calculate domain value
const valueScore = calculateDomainValueScore(domain);
console.log('Value Score:', valueScore.score);
console.log('Factors:', valueScore.factors);

// Check expiration
const expiringSoon = isExpiringSoon(domain.expiresAt, 30); // 30 days

// Get network name
const networkName = getNetworkName('eip155:137'); // "Polygon Mainnet"
```

### Domain Sorting and Filtering

```typescript
import { sortDomains, filterDomains } from '../utils/domaSubgraphHelpers';

// Sort domains
const sortedByName = sortDomains(domains, 'name', 'asc');
const sortedByValue = sortDomains(domains, 'value', 'desc');
const sortedByExpiry = sortDomains(domains, 'expiresAt', 'asc');

// Filter domains
const filteredDomains = filterDomains(domains, {
  tlds: ['.com', '.org'],
  expiringSoon: true,
  hasTokens: true,
  minValueScore: 70,
  searchTerm: 'crypto'
});
```

## Integration with Existing Components

### Dashboard Integration

The Dashboard component has been updated to include:
- Real-time marketplace data from subgraph
- Trending domains section
- Popular domains section
- Enhanced metrics with subgraph data

```typescript
// In Dashboard.tsx
const { overview, trendingDomains, popularDomains } = useDomainMarketplace('testnet');

// Updated metrics
<MetricCard
  title="Domains Tokenized"
  value={overview ? overview.totalDomains : fallbackValue}
  change={overview ? overview.totalListings : fallbackChange}
  changeLabel={overview ? "active listings" : "listed for sale"}
  icon="🌐"
/>
```

### Domain Explorer Component

A comprehensive DomainExplorer component has been created with:
- Browse domains with filtering
- Search functionality
- Trending and popular domains
- Domain details and activities
- Listings and offers
- Marketplace overview

## Error Handling

The integration includes comprehensive error handling:

```typescript
try {
  const domains = await getTokenizedDomains(filters);
} catch (error) {
  console.error('Subgraph query failed:', error);
  // Handle specific error types
  if (error.message.includes('Network')) {
    // Handle network errors
  } else if (error.message.includes('Rate limit')) {
    // Handle rate limiting
  }
}
```

## Performance Optimization

### Caching

Implement caching for frequently accessed data:

```typescript
const useCachedDomains = (filters: SubgraphFilters) => {
  const [cache, setCache] = useState<Map<string, any>>(new Map());
  
  const getCachedDomains = useCallback(async (filters: SubgraphFilters) => {
    const cacheKey = JSON.stringify(filters);
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    
    const domains = await getTokenizedDomains(filters);
    setCache(prev => new Map(prev).set(cacheKey, domains));
    return domains;
  }, [cache]);
  
  return { getCachedDomains };
};
```

### Debouncing

The search functionality includes built-in debouncing:

```typescript
// Automatically debounced search
const { query, setQuery, results } = useDomainSearch('testnet');
```

### Pagination

All queries support pagination:

```typescript
const domains = await getTokenizedDomains({
  skip: 0,
  take: 20
});

// Check pagination info
if (domains.hasNextPage) {
  const nextPage = await getTokenizedDomains({
    skip: domains.currentPage * domains.pageSize,
    take: 20
  });
}
```

## Testing

### Unit Tests

```typescript
// Example test for utility functions
import { formatPrice, calculateDomainValueScore } from '../utils/domaSubgraphHelpers';

describe('Doma Subgraph Helpers', () => {
  it('should format price correctly', () => {
    expect(formatPrice('1000000000000000000', 18)).toBe(1);
  });

  it('should calculate domain value score', () => {
    const domain = {
      name: 'example.com',
      expiresAt: '2025-01-01T00:00:00Z',
      activities: []
    };
    const score = calculateDomainValueScore(domain);
    expect(score.score).toBeGreaterThan(0);
    expect(score.score).toBeLessThanOrEqual(100);
  });
});
```

### Integration Tests

```typescript
// Example integration test
import { useDomaSubgraph } from '../hooks/useDomaSubgraph';

describe('Doma Subgraph Integration', () => {
  it('should fetch domains successfully', async () => {
    const { getTokenizedDomains } = useDomaSubgraph('testnet');
    const domains = await getTokenizedDomains({ take: 10 });
    expect(domains.items).toBeDefined();
    expect(Array.isArray(domains.items)).toBe(true);
  });
});
```

## Security Considerations

1. **API Rate Limiting**: Implement rate limiting for API calls
2. **Input Validation**: Validate all user inputs before queries
3. **Error Handling**: Don't expose sensitive error information
4. **Caching**: Implement secure caching mechanisms
5. **Authentication**: Add authentication for sensitive queries

## Troubleshooting

### Common Issues

1. **Network Errors**
   - Check subgraph endpoint availability
   - Verify network connectivity
   - Check CORS settings

2. **Query Errors**
   - Validate GraphQL query syntax
   - Check query parameters
   - Verify data types

3. **Performance Issues**
   - Implement pagination
   - Use caching
   - Optimize queries

### Debug Mode

Enable debug logging:

```typescript
// In development
if (process.env.NODE_ENV === 'development') {
  console.log('Doma Subgraph Debug Mode Enabled');
}
```

## Future Enhancements

1. **Real-time Subscriptions**: Add WebSocket support for real-time updates
2. **Advanced Analytics**: Implement more sophisticated analytics
3. **Machine Learning**: Add ML-based domain recommendations
4. **Multi-chain Support**: Expand to more blockchain networks
5. **Offline Support**: Add offline data caching

## Support

For issues and questions:
- Check the GraphQL query syntax
- Verify subgraph endpoint availability
- Review error logs in browser console
- Contact the development team

## License

This integration follows the same license as the main DomaLand.AI project.
