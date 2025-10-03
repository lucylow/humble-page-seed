import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useDoma } from '@/contexts/DomaContext';
import { useMetrics } from '@/contexts/MetricsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DemoDomainsGrid } from '@/components/DemoDomainsGrid';
import { TransactionFeedback, txToast } from '@/components/TransactionFeedback';
import { Wallet } from 'lucide-react';

const Marketplace: React.FC = () => {
  const { isConnected, connectWallet, account } = useWeb3();
  const { marketplaceDomains, buyDomain, listDomain } = useDoma();
  const { metrics } = useMetrics();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [filterBy, setFilterBy] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string>();
  const [txError, setTxError] = useState<string>();

  const filteredDomains = marketplaceDomains.filter(domain => {
    const matchesSearch = domain.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' || domain.category === filterBy;
    return matchesSearch && matchesFilter;
  });

  const sortedDomains = [...filteredDomains].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'recent':
        return new Date(b.listedAt || 0).getTime() - new Date(a.listedAt || 0).getTime();
      default:
        return 0;
    }
  });

  const handleBuyDomain = async (domain: { id: string; name: string; price: string; owner: string }) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to purchase domains.",
        variant: "destructive",
      });
      return;
    }

    // Show confirmation dialog
    const confirmed = confirm(
      `Are you sure you want to buy "${domain.name}" for ${domain.price} ETH?\n\nThis will initiate a blockchain transaction.`
    );
    
    if (!confirmed) return;

    setIsLoading(true);
    setTxStatus('loading');
    txToast.pending();
    
    try {
      const result = await buyDomain(domain.id, domain.price);
      if (result.success) {
        setTxStatus('success');
        toast({
          title: "Domain Purchased!",
          description: `Successfully purchased ${domain.name} for ${domain.price} ETH`,
        });
      } else {
        throw new Error(result.error || "Purchase failed");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
      setTxError(errorMsg);
      setTxStatus('error');
      txToast.error(errorMsg);
    } finally {
      setIsLoading(false);
      setTimeout(() => setTxStatus('idle'), 3000);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Explore Domain Marketplace</h1>
            <p className="text-muted-foreground">
              Discover premium tokenized domains powered by AI valuation
            </p>
          </div>

          <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Connect Your Wallet</h3>
                  <p className="text-sm text-muted-foreground">
                    List your domains, make offers, and unlock full platform features
                  </p>
                </div>
              </div>
              <Button size="lg" className="ml-4" onClick={() => connectWallet()}>
                Connect Wallet
              </Button>
            </CardContent>
          </Card>

          <DemoDomainsGrid />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-accent/5 to-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      <div className="container-padding space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold text-gradient">
              DomainFi Marketplace
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Connected: {account?.slice(0, 6)}...{account?.slice(-4)}</span>
              </div>
              <Badge variant="outline" className="px-3 py-1">
                {marketplaceDomains.length} Domains Available
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-4 py-2 bg-emerald-50 border-emerald-500/20 text-emerald-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
              Live Marketplace
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Total Domains
              </CardTitle>
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300 animate-float">🌐</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-all duration-300">
                {marketplaceDomains.length}
              </div>
              <div className="flex items-center gap-2 text-xs mt-2">
                <span className="flex items-center font-medium text-emerald-500 group-hover:scale-105 transition-transform duration-300">
                  <span className="mr-1">↗</span>
                  {Math.floor(marketplaceDomains.length * 0.15)}
                </span>
                <span className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                  this week
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Total Volume
              </CardTitle>
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300 animate-float" style={{animationDelay: '0.5s'}}>💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-all duration-300">
                {marketplaceDomains.reduce((sum, domain) => sum + parseFloat(domain.price), 0).toFixed(2)} ETH
              </div>
              <div className="flex items-center gap-2 text-xs mt-2">
                <span className="flex items-center font-medium text-emerald-500 group-hover:scale-105 transition-transform duration-300">
                  <span className="mr-1">↗</span>
                  +12.5%
                </span>
                <span className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                  this month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Avg Price
              </CardTitle>
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300 animate-float" style={{animationDelay: '1s'}}>📊</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-all duration-300">
                {(marketplaceDomains.reduce((sum, domain) => sum + parseFloat(domain.price), 0) / marketplaceDomains.length || 0).toFixed(3)} ETH
              </div>
              <div className="flex items-center gap-2 text-xs mt-2">
                <span className="flex items-center font-medium text-emerald-500 group-hover:scale-105 transition-transform duration-300">
                  <span className="mr-1">↗</span>
                  +8.2%
                </span>
                <span className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                  vs last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Active Sellers
              </CardTitle>
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300 animate-float" style={{animationDelay: '1.5s'}}>👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-all duration-300">
                {new Set(marketplaceDomains.map(d => d.owner)).size}
              </div>
              <div className="flex items-center gap-2 text-xs mt-2">
                <span className="flex items-center font-medium text-emerald-500 group-hover:scale-105 transition-transform duration-300">
                  <span className="mr-1">↗</span>
                  +5
                </span>
                <span className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                  this week
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search domains..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48 bg-background/50 border-border/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price (Low to High)</SelectItem>
                  <SelectItem value="name">Name (A to Z)</SelectItem>
                  <SelectItem value="recent">Recently Listed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-full md:w-48 bg-background/50 border-border/50">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="brand">Brand</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Domain Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedDomains.map((domain) => (
            <Card key={domain.tokenId} className="card-interactive">
              {/* Shimmer effect */}
              <div className="absolute inset-0 -top-2 -left-2 w-[calc(100%+1rem)] h-[calc(100%+1rem)] bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer"></div>
              
              <CardHeader className="relative z-10">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                      {domain.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-muted-foreground">
                        {domain.owner?.slice(0, 6)}...{domain.owner?.slice(-4)}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {domain.category || 'General'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      {domain.price} ETH
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ≈ ${(parseFloat(domain.price) * 2000).toFixed(0)} USD
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Listed</div>
                    <div className="text-sm font-medium">
                      {domain.listedAt ? new Date(domain.listedAt).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleBuyDomain({ id: domain.tokenId, name: domain.name, price: domain.price!, owner: domain.owner })}
                    disabled={isLoading}
                    className="flex-1 bg-foreground text-background hover:bg-foreground/90 font-medium transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>🛒</span>
                        Buy Domain
                      </div>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105"
                    onClick={() => {
                      // Navigate to chat for this domain
                      window.location.href = `/chat?domain=${domain.name}`;
                    }}
                  >
                    💬
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedDomains.length === 0 && (
          <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4 opacity-50">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No domains found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or check back later for new listings.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
