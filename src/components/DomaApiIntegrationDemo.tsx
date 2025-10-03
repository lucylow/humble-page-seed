// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useDomaDomains, 
  useDomaListings, 
  useDomaOperations, 
  useDomaPortfolio,
  useDomaMarketplaceStats,
  useDomaSearch 
} from '../hooks/useDomaApi';
import { 
  formatPriceDisplay, 
  toCAIP10, 
  isExpiringSoon, 
  formatDomainName,
  isValidDomainName,
  truncateAddress,
  getDomainAvatar,
  isPremiumDomain,
  estimateDomainValue,
  formatTimestamp,
  formatRelativeTime
} from '../utils/domaHelpers';

interface DomaApiIntegrationDemoProps {
  walletAddress?: string;
  apiKey?: string;
}

export const DomaApiIntegrationDemo: React.FC<DomaApiIntegrationDemoProps> = ({ 
  walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  apiKey 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'domains' | 'listings' | 'portfolio' | 'search'>('domains');

  // API Hooks
  const { domains, loading: domainsLoading, error: domainsError, pagination: domainsPagination } = useDomaDomains({
    skip: 0,
    take: 10,
    sortOrder: 'DESC',
  });

  const { listings, loading: listingsLoading, error: listingsError, pagination: listingsPagination } = useDomaListings({
    skip: 0,
    take: 10,
  });

  const { portfolio, stats: portfolioStats, loading: portfolioLoading, error: portfolioError } = useDomaPortfolio(walletAddress);

  const { stats: marketplaceStats, loading: statsLoading, error: statsError } = useDomaMarketplaceStats();

  const { results: searchResults, loading: searchLoading, error: searchError } = useDomaSearch(searchQuery, {
    maxResults: 10,
  });

  const domaOperations = useDomaOperations();

  const [operationResult, setOperationResult] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);

  // Demo operations
  const handleCreateListing = async () => {
    setOperationLoading(true);
    try {
      const result = await domaOperations.createListing('demo-token-123', '1.0', 'ETH');
      setOperationResult(`✅ Listing created successfully! ID: ${result.id}`);
    } catch (error) {
      setOperationResult(`❌ Failed to create listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCreateOffer = async () => {
    setOperationLoading(true);
    try {
      const result = await domaOperations.createOffer('demo-token-456', '0.8', 'ETH');
      setOperationResult(`✅ Offer created successfully! ID: ${result.id}`);
    } catch (error) {
      setOperationResult(`❌ Failed to create offer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleTransferOwnership = async () => {
    setOperationLoading(true);
    try {
      const result = await domaOperations.transferOwnership('demo-token-789', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
      setOperationResult(`✅ Ownership transferred successfully! TX: ${result.transactionHash}`);
    } catch (error) {
      setOperationResult(`❌ Failed to transfer ownership: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleRenewDomain = async () => {
    setOperationLoading(true);
    try {
      const result = await domaOperations.renewDomain('demo-token-101', 1);
      setOperationResult(`✅ Domain renewed successfully! New expiry: ${result.newExpirationDate}`);
    } catch (error) {
      setOperationResult(`❌ Failed to renew domain: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setOperationLoading(false);
    }
  };

  const tabs = [
    { id: 'domains', label: 'Tokenized Domains', count: domainsPagination.totalCount },
    { id: 'listings', label: 'Marketplace Listings', count: listingsPagination.totalCount },
    { id: 'portfolio', label: 'Portfolio', count: portfolioStats.totalDomains },
    { id: 'search', label: 'Search', count: searchResults.length },
  ];

  const renderDomains = () => (
    <div className="space-y-4">
      {domainsLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))
      ) : domainsError ? (
        <Alert>
          <AlertDescription>Error loading domains: {domainsError}</AlertDescription>
        </Alert>
      ) : (
        domains.map((domain) => (
          <Card key={domain.name} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={getDomainAvatar(domain.name)} 
                    alt={domain.name}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTggMEMzLjU4IDAgMCAzLjU4IDAgOFMzLjU4IDE2IDggMTZTMTYgMTIuNDIgMTYgOFMxMi40MiAwIDggMFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik04IDRDNi45IDQgNiA0LjkgNiA2UzYuOSA4IDggOFMxMCA3LjEgMTAgNlM5LjEgNCA4IDRaIiBmaWxsPSIjNjM2NkYxIi8+CjxwYXRoIGQ9Ik04IDEwQzcuNCAxMCA3IDEwLjQgNyAxMVYxM0M3IDEzLjYgNy40IDE0IDggMTRTOSAxMy42IDkgMTNWMTFDOSAxMC40IDguNiAxMCA4IDEwWiIgZmlsbD0iIzYzNjZGMTIiLz4KPC9zdmc+Cjwvc3ZnPg==';
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{formatDomainName(domain.name)}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Expires: {formatTimestamp(domain.expiresAt)}</span>
                      {isExpiringSoon(domain.expiresAt) && (
                        <Badge variant="destructive" className="text-xs">Expiring Soon</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    {isPremiumDomain(domain.name) && (
                      <Badge variant="outline" className="text-xs">Premium</Badge>
                    )}
                    <Badge variant={domain.eoi ? 'secondary' : 'default'} className="text-xs">
                      {domain.eoi ? 'EOI' : 'Tokenized'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {domain.tokens?.length || 0} token(s)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderListings = () => (
    <div className="space-y-4">
      {listingsLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))
      ) : listingsError ? (
        <Alert>
          <AlertDescription>Error loading listings: {listingsError}</AlertDescription>
        </Alert>
      ) : (
        listings.map((listing) => (
          <Card key={listing.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={getDomainAvatar(listing.name)} 
                    alt={listing.name}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTggMEMzLjU4IDAgMCAzLjU4IDAgOFMzLjU4IDE2IDggMTZTMTYgMTIuNDIgMTYgOFMxMi40MiAwIDggMFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik04IDRDNi45IDQgNiA0LjkgNiA2UzYuOSA4IDggOFMxMCA3LjEgMTAgNlM5LjEgNCA4IDRaIiBmaWxsPSIjNjM2NkYxIi8+CjxwYXRoIGQ9Ik04IDEwQzcuNCAxMCA3IDEwLjQgNyAxMVYxM0M3IDEzLjYgNy40IDE0IDggMTRTOSAxMy42IDkgMTNWMTFDOSAxMC40IDguNiAxMCA4IDEwWiIgZmlsbD0iIzYzNjZGMTIiLz4KPC9zdmc+Cjwvc3ZnPg==';
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{formatDomainName(listing.name)}</h3>
                    <div className="text-sm text-muted-foreground">
                      Owner: {truncateAddress(listing.offererAddress)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">
                    {formatPriceDisplay(listing.price, listing.currency.decimals, listing.currency.symbol)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Listed {formatRelativeTime(listing.createdAt)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderPortfolio = () => (
    <div className="space-y-6">
      {/* Portfolio Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{portfolioStats.totalDomains}</div>
            <div className="text-sm text-muted-foreground">Total Domains</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{portfolioStats.expiringSoon}</div>
            <div className="text-sm text-muted-foreground">Expiring Soon</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{portfolioStats.eoi}</div>
            <div className="text-sm text-muted-foreground">EOI</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{portfolioStats.tokenized}</div>
            <div className="text-sm text-muted-foreground">Tokenized</div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Domains */}
      <div className="space-y-4">
        {portfolioLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : portfolioError ? (
          <Alert>
            <AlertDescription>Error loading portfolio: {portfolioError}</AlertDescription>
          </Alert>
        ) : (
          portfolio.map((domain) => (
            <Card key={domain.name} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={getDomainAvatar(domain.name)} 
                      alt={domain.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTggMEMzLjU4IDAgMCAzLjU4IDAgOFMzLjU4IDE2IDggMTZTMTYgMTIuNDIgMTYgOFMxMi40MiAwIDggMFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik04IDRDNi45IDQgNiA0LjkgNiA2UzYuOSA4IDggOFMxMCA3LjEgMTAgNlM5LjEgNCA4IDRaIiBmaWxsPSIjNjM2NkYxIi8+CjxwYXRoIGQ9Ik04IDEwQzcuNCAxMCA3IDEwLjQgNyAxMVYxM0M3IDEzLjYgNy40IDE0IDggMTRTOSAxMy42IDkgMTNWMTFDOSAxMC40IDguNiAxMCA4IDEwWiIgZmlsbD0iIzYzNjZGMTIiLz4KPC9zdmc+Cjwvc3ZnPg==';
                      }}
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{formatDomainName(domain.name)}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Expires: {formatTimestamp(domain.expiresAt)}</span>
                        {isExpiringSoon(domain.expiresAt) && (
                          <Badge variant="destructive" className="text-xs">Expiring Soon</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {isPremiumDomain(domain.name) && (
                        <Badge variant="outline" className="text-xs">Premium</Badge>
                      )}
                      <Badge variant={domain.eoi ? 'secondary' : 'default'} className="text-xs">
                        {domain.eoi ? 'EOI' : 'Tokenized'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Est. Value: ${estimateDomainValue(domain.name).min.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search domains..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={() => setSearchQuery('')} variant="outline">
          Clear
        </Button>
      </div>

      {searchQuery && (
        <div className="space-y-4">
          {searchLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-1/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : searchError ? (
            <Alert>
              <AlertDescription>Error searching domains: {searchError}</AlertDescription>
            </Alert>
          ) : (
            searchResults.map((domain) => (
              <Card key={domain.name} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={getDomainAvatar(domain.name)} 
                        alt={domain.name}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTggMEMzLjU4IDAgMCAzLjU4IDAgOFMzLjU4IDE2IDggMTZTMTYgMTIuNDIgMTYgOFMxMi40MiAwIDggMFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik04IDRDNi45IDQgNiA0LjkgNiA2UzYuOSA4IDggOFMxMCA3LjEgMTAgNlM5LjEgNCA4IDRaIiBmaWxsPSIjNjM2NkYxIi8+CjxwYXRoIGQ9Ik04IDEwQzcuNCAxMCA3IDEwLjQgNyAxMVYxM0M3IDEzLjYgNy40IDE0IDggMTRTOSAxMy42IDkgMTNWMTFDOSAxMC40IDguNiAxMCA4IDEwWiIgZmlsbD0iIzYzNjZGMTIiLz4KPC9zdmc+Cjwvc3ZnPg==';
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{formatDomainName(domain.name)}</h3>
                        <div className="text-sm text-muted-foreground">
                          {domain.isTokenized ? 'Tokenized' : 'Available'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {isPremiumDomain(domain.name) && (
                          <Badge variant="outline" className="text-xs">Premium</Badge>
                        )}
                        <Badge variant={domain.isTokenized ? 'default' : 'secondary'} className="text-xs">
                          {domain.isTokenized ? 'Tokenized' : 'EOI'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Est. Value: ${estimateDomainValue(domain.name).min.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🔗</span>
            Doma Protocol API Integration Demo
          </CardTitle>
          <p className="text-muted-foreground">
            Comprehensive demonstration of the Doma Protocol API integration with real-time data fetching,
            domain management operations, and utility functions.
          </p>
        </CardHeader>
        <CardContent>
          {/* Marketplace Stats */}
          {marketplaceStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{marketplaceStats.totalListings}</div>
                <div className="text-sm text-muted-foreground">Total Listings</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">{marketplaceStats.totalOffers}</div>
                <div className="text-sm text-muted-foreground">Total Offers</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-600">{marketplaceStats.totalVolume}</div>
                <div className="text-sm text-muted-foreground">Total Volume</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-xl font-bold text-orange-600">{marketplaceStats.averagePrice}</div>
                <div className="text-sm text-muted-foreground">Average Price</div>
              </div>
            </div>
          )}

          {/* Operation Demo */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">API Operations Demo</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleCreateListing} 
                disabled={operationLoading}
                variant="outline"
              >
                {operationLoading ? 'Creating...' : 'Create Listing'}
              </Button>
              <Button 
                onClick={handleCreateOffer} 
                disabled={operationLoading}
                variant="outline"
              >
                {operationLoading ? 'Creating...' : 'Create Offer'}
              </Button>
              <Button 
                onClick={handleTransferOwnership} 
                disabled={operationLoading}
                variant="outline"
              >
                {operationLoading ? 'Transferring...' : 'Transfer Ownership'}
              </Button>
              <Button 
                onClick={handleRenewDomain} 
                disabled={operationLoading}
                variant="outline"
              >
                {operationLoading ? 'Renewing...' : 'Renew Domain'}
              </Button>
            </div>
            {operationResult && (
              <Alert className="mt-3">
                <AlertDescription>{operationResult}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={selectedTab === tab.id ? 'default' : 'outline'}
                onClick={() => setSelectedTab(tab.id as 'domains' | 'listings' | 'portfolio' | 'search')}
                className="flex items-center gap-2"
              >
                {tab.label}
                <Badge variant="secondary" className="text-xs">
                  {tab.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          {selectedTab === 'domains' && renderDomains()}
          {selectedTab === 'listings' && renderListings()}
          {selectedTab === 'portfolio' && renderPortfolio()}
          {selectedTab === 'search' && renderSearch()}
        </CardContent>
      </Card>
    </div>
  );
};

export default DomaApiIntegrationDemo;
