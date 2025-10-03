// @ts-nocheck
// Comprehensive Domain Explorer Component using Doma Subgraph
import React, { useState, useEffect, useCallback } from 'react';
import { useDomaSubgraph, useDomainSearch, useDomainMarketplace } from '../hooks/useDomaSubgraph';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { 
  formatPrice, 
  isExpiringSoon, 
  getNetworkName, 
  formatActivity, 
  formatListing, 
  formatOffer,
  calculateDomainValueScore,
  getDomainStatusColor,
  getDomainStatusText,
  formatCurrency
} from '../utils/domaSubgraphHelpers';

const DomainExplorer: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('browse');
  const [filters, setFilters] = useState({
    take: 20,
    skip: 0,
    tlds: [] as string[],
    networks: [] as string[],
    sortOrder: 'DESC' as 'ASC' | 'DESC'
  });
  const [selectedDomain, setSelectedDomain] = useState<Record<string, unknown> | null>(null);
  const [domainDetails, setDomainDetails] = useState<Record<string, unknown> | null>(null);
  const [domainActivities, setDomainActivities] = useState<Record<string, unknown>[]>([]);
  const [domainListings, setDomainListings] = useState<Record<string, unknown>[]>([]);
  const [domainOffers, setDomainOffers] = useState<Record<string, unknown>[]>([]);

  const { 
    data: domainsData, 
    loading: domainsLoading, 
    error: domainsError, 
    getTokenizedDomains,
    getDomainInfo,
    getDomainActivities,
    getDomainListings,
    getDomainOffers,
    getTrendingDomains,
    getPopularDomains,
    clearError
  } = useDomaSubgraph('testnet');

  const { 
    query: searchQuery, 
    setQuery: setSearchQuery, 
    results: searchResults, 
    loading: searchLoading, 
    error: searchError 
  } = useDomainSearch('testnet');

  const { 
    overview, 
    trendingDomains, 
    popularDomains, 
    loading: marketplaceLoading, 
    error: marketplaceError,
    refresh: refreshMarketplace
  } = useDomainMarketplace('testnet');

  const loadDomains = useCallback(async () => {
    try {
      await getTokenizedDomains(filters);
    } catch (error) {
      console.error('Failed to load domains:', error);
    }
  }, [getTokenizedDomains, filters]);

  // Load initial data
  useEffect(() => {
    loadDomains();
  }, [filters, loadDomains]);

  const loadDomainDetails = async (domainName: string) => {
    try {
      const [info, activities, listings, offers] = await Promise.all([
        getDomainInfo(domainName),
        getDomainActivities(domainName, { take: 10 }),
        getDomainListings({ name: domainName, take: 10 }),
        getDomainOffers({ name: domainName, take: 10 })
      ]);

      setDomainDetails(info as unknown as Record<string, unknown>);
      setDomainActivities(activities.items as unknown as Record<string, unknown>[]);
      setDomainListings(listings.items as unknown as Record<string, unknown>[]);
      setDomainOffers(offers.items as unknown as Record<string, unknown>[]);
    } catch (error) {
      console.error('Failed to load domain details:', error);
    }
  };

  const handleDomainSelect = (domain: Record<string, unknown>) => {
    setSelectedDomain(domain);
    loadDomainDetails(domain.name as string);
  };

  const handleFilterChange = (key: string, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      skip: 0 // Reset pagination when filters change
    }));
  };

  const handlePagination = (direction: 'next' | 'prev') => {
    const newSkip = direction === 'next' 
      ? filters.skip + filters.take 
      : Math.max(0, filters.skip - filters.take);
    
    setFilters(prev => ({ ...prev, skip: newSkip }));
  };

  const renderDomainCard = (domain: Record<string, unknown>) => {
    const valueScore = calculateDomainValueScore(domain);
    const statusColor = getDomainStatusColor(domain);
    const statusText = getDomainStatusText(domain);
    const expiringSoon = isExpiringSoon(domain.expiresAt as string);

    return (
      <Card 
        key={domain.name as string} 
        className={`cursor-pointer transition-all hover:shadow-lg ${selectedDomain?.name === domain.name ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => handleDomainSelect(domain)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{domain.name as string}</CardTitle>
            <Badge variant="outline" className={`bg-${statusColor}-50 text-${statusColor}-700 border-${statusColor}-200`}>
              {statusText as string}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Expires:</span>
            <span className={expiringSoon ? 'text-orange-600 font-medium' : ''}>
              {new Date(domain.expiresAt as string).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Registrar:</span>
            <span>{(domain.registrar as Record<string, unknown>).name as string}</span>
          </div>

          {domain.tokens && (domain.tokens as unknown[]).length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Tokens:</div>
              {(domain.tokens as Record<string, unknown>[]).map((token: Record<string, unknown>, index: number) => (
                <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                  <div className="flex justify-between">
                    <span>Token ID:</span>
                    <span className="font-mono">{token.tokenId as string}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <span>{getNetworkName(token.networkId as string)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Owner:</span>
                    <span className="font-mono text-xs">{(token.ownerAddress as string).slice(0, 6)}...{(token.ownerAddress as string).slice(-4)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Value Score:</span>
              <div className="flex items-center gap-2">
                <Progress value={valueScore.score} className="w-16 h-2" />
                <span className="text-xs font-medium">{valueScore.score}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Activity:</span>
              <span>{(domain.activities as unknown[])?.length || 0} events</span>
            </div>
          </div>

          {expiringSoon && (
            <Alert className="mt-3">
              <AlertDescription className="text-orange-700">
                ⚠️ Domain expires soon!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderDomainDetails = () => {
    if (!domainDetails) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {domainDetails.name as string}
            <Badge variant="outline" className={`bg-${getDomainStatusColor(domainDetails)}-50 text-${getDomainStatusColor(domainDetails)}-700`}>
              {getDomainStatusText(domainDetails) as string}
            </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Expires:</span>
                <p className="font-medium">{new Date(domainDetails.expiresAt as string).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Registrar:</span>
                <p className="font-medium">{(domainDetails.registrar as Record<string, unknown>).name as string}</p>
              </div>
              <div>
                <span className="text-muted-foreground">IANA ID:</span>
                <p className="font-medium">{(domainDetails.registrar as Record<string, unknown>).ianaId as string}</p>
              </div>
              <div>
                <span className="text-muted-foreground">EOI:</span>
                <p className="font-medium">{domainDetails.eoi ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {domainDetails.tokens && (domainDetails.tokens as unknown[]).length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Token Information</h4>
                <div className="space-y-3">
                  {(domainDetails.tokens as Record<string, unknown>[]).map((token: Record<string, unknown>, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Token ID:</span>
                          <p className="font-mono">{token.tokenId as string}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Network:</span>
                          <p>{getNetworkName(token.networkId as string)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Owner:</span>
                          <p className="font-mono text-xs">{token.ownerAddress as string}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <p>{token.type as string}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {domainActivities.length === 0 ? (
              <p className="text-muted-foreground">No activities found</p>
            ) : (
              <div className="space-y-3">
                {domainActivities.map((activity, index) => {
                  const formatted = formatActivity(activity as Record<string, unknown>);
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{formatted.description}</p>
                        <p className="text-xs text-muted-foreground">{formatted.date}</p>
                      </div>
                      {formatted.transactionHash && (
                        <Button variant="ghost" size="sm" className="text-xs">
                          View TX
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Current Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {domainListings.length === 0 ? (
              <p className="text-muted-foreground">No listings found</p>
            ) : (
              <div className="space-y-3">
                {domainListings.map((listing, index) => {
                  const formatted = formatListing(listing as Record<string, unknown>);
                  return (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{formatted.formattedPrice}</p>
                          <p className="text-sm text-muted-foreground">Expires: {formatted.expiresAt}</p>
                        </div>
                        <Badge variant={formatted.daysUntilExpiry < 7 ? "destructive" : "default"}>
                          {formatted.daysUntilExpiry} days
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Offers */}
        <Card>
          <CardHeader>
            <CardTitle>Current Offers</CardTitle>
          </CardHeader>
          <CardContent>
            {domainOffers.length === 0 ? (
              <p className="text-muted-foreground">No offers found</p>
            ) : (
              <div className="space-y-3">
                {domainOffers.map((offer, index) => {
                  const formatted = formatOffer(offer as Record<string, unknown>);
                  return (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{formatted.formattedPrice}</p>
                          <p className="text-sm text-muted-foreground">From: {formatted.offerer.slice(0, 6)}...{formatted.offerer.slice(-4)}</p>
                        </div>
                        <Badge variant={formatted.daysUntilExpiry < 7 ? "destructive" : "default"}>
                          {formatted.daysUntilExpiry} days
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Doma Subgraph
            </Badge>
            Domain Explorer
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Explore tokenized domains, view listings, offers, and activities
          </p>
        </CardHeader>
      </Card>

      {/* Main Interface */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse Domains</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        {/* Browse Tab */}
        <TabsContent value="browse" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="page-size">Page Size</Label>
                    <Select value={filters.take.toString()} onValueChange={(value) => handleFilterChange('take', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="sort-order">Sort Order</Label>
                    <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange('sortOrder', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DESC">Newest First</SelectItem>
                        <SelectItem value="ASC">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={loadDomains} disabled={domainsLoading} className="w-full">
                    {domainsLoading ? 'Loading...' : 'Apply Filters'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Domain List */}
            <div className="lg:col-span-3">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Tokenized Domains</h3>
                  {domainsData && (
                    <p className="text-sm text-muted-foreground">
                      Showing {domainsData.items.length} of {domainsData.totalCount} domains
                    </p>
                  )}
                </div>

                {domainsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : domainsError ? (
                  <Alert>
                    <AlertDescription>{domainsError}</AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {domainsData?.items.map(renderDomainCard)}
                  </div>
                )}

                {/* Pagination */}
                {domainsData && (
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="outline" 
                      disabled={!domainsData.hasPreviousPage || domainsLoading}
                      onClick={() => handlePagination('prev')}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {domainsData.currentPage} of {domainsData.totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      disabled={!domainsData.hasNextPage || domainsLoading}
                      onClick={() => handlePagination('next')}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Domains</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search-input">Domain Name</Label>
                <Input
                  id="search-input"
                  placeholder="Search for domains..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {searchLoading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Searching...</p>
                </div>
              )}

              {searchError && (
                <Alert>
                  <AlertDescription>{searchError}</AlertDescription>
                </Alert>
              )}

              {searchResults && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Search Results</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchResults.totalCount} domains found
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.items.map(renderDomainCard)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trending Tab */}
        <TabsContent value="trending" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trending Domains</CardTitle>
              </CardHeader>
              <CardContent>
                {marketplaceLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(trendingDomains as Record<string, unknown>[]).map((domain, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{domain.name as string}</p>
                          <p className="text-sm text-muted-foreground">
                            Score: {(domain as Record<string, unknown>).trendScore as number || 0}
                          </p>
                        </div>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Domains</CardTitle>
              </CardHeader>
              <CardContent>
                {marketplaceLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(popularDomains as Record<string, unknown>[]).map((domain, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{domain.name as string}</p>
                          <p className="text-sm text-muted-foreground">
                            {(domain as Record<string, unknown>).activeOffers as number || 0} offers
                          </p>
                        </div>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Marketplace Overview
                <Button variant="outline" size="sm" onClick={refreshMarketplace}>
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {marketplaceLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : overview ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{overview.totalDomains as string}</p>
                    <p className="text-sm text-muted-foreground">Total Domains</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{overview.totalListings as string}</p>
                    <p className="text-sm text-muted-foreground">Active Listings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{overview.totalOffers as string}</p>
                    <p className="text-sm text-muted-foreground">Active Offers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{(overview.averagePrice as number).toFixed(4)}</p>
                    <p className="text-sm text-muted-foreground">Avg Price (ETH)</p>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>Failed to load marketplace data</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Domain Details Sidebar */}
      {selectedDomain && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Domain Details
              <Button variant="ghost" size="sm" onClick={() => setSelectedDomain(null)}>
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderDomainDetails()}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {(domainsError || searchError || marketplaceError) && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <span>{domainsError || searchError || marketplaceError}</span>
            <Button variant="ghost" size="sm" onClick={clearError}>
              ✕
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DomainExplorer;
