import React, { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useDoma } from '@/contexts/DomaContext';
import { useMetrics } from '@/contexts/MetricsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const FractionalOwnership: React.FC = () => {
  const { isConnected, connectWallet, account } = useWeb3();
  const { userDomains, marketplaceDomains } = useDoma();
  const { metrics } = useMetrics();
  const { toast } = useToast();
  
  const [selectedDomain, setSelectedDomain] = useState('');
  const [fractionCount, setFractionCount] = useState(100);
  const [pricePerFraction, setPricePerFraction] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock fractional domains data
  const fractionalDomains = [
    {
      id: 1,
      name: 'crypto.com',
      totalFractions: 1000,
      availableFractions: 250,
      pricePerFraction: 0.5,
      totalValue: 500,
      owner: '0x1234...5678',
      category: 'Premium',
      description: 'High-value crypto domain with strong brand recognition'
    },
    {
      id: 2,
      name: 'defi.io',
      totalFractions: 500,
      availableFractions: 100,
      pricePerFraction: 0.8,
      totalValue: 400,
      owner: '0x9876...5432',
      category: 'DeFi',
      description: 'DeFi-focused domain perfect for decentralized finance projects'
    },
    {
      id: 3,
      name: 'nft.market',
      totalFractions: 200,
      availableFractions: 50,
      pricePerFraction: 1.2,
      totalValue: 240,
      owner: '0x4567...8901',
      category: 'NFT',
      description: 'NFT marketplace domain with growing market demand'
    }
  ];

  const userFractionalHoldings = [
    {
      domainName: 'crypto.com',
      fractionsOwned: 25,
      totalFractions: 1000,
      ownershipPercentage: 2.5,
      currentValue: 12.5,
      purchasePrice: 10.0
    },
    {
      domainName: 'defi.io',
      fractionsOwned: 10,
      totalFractions: 500,
      ownershipPercentage: 2.0,
      currentValue: 8.0,
      purchasePrice: 6.0
    }
  ];

  const handleFractionalize = async () => {
    if (!selectedDomain || !pricePerFraction) {
      toast({
        title: "Missing Information",
        description: "Please select a domain and set a price per fraction.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate fractionalization process
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Domain Fractionalized!",
        description: `${selectedDomain} has been split into ${fractionCount} fractions.`,
      });
      setSelectedDomain('');
      setPricePerFraction('');
    } catch (error) {
      toast({
        title: "Fractionalization Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyFractions = async (domain: { id: string; name: string; price: number }, amount: number) => {
    setIsLoading(true);
    try {
      // Simulate buying fractions
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Fractions Purchased!",
        description: `Successfully purchased ${amount} fractions of ${domain.name}`,
      });
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        
        <Card className="w-full max-w-md bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border border-border/50 shadow-2xl shadow-primary/10 relative z-10">
          <CardHeader className="text-center pb-6">
            <div className="mb-4">
              <span className="text-4xl animate-float">🎯</span>
            </div>
            <CardTitle className="text-2xl text-foreground">
              Fractional Ownership
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Connect your wallet to manage fractional domain ownership
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              onClick={() => connectWallet()} 
              className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium py-3 transition-all duration-300 hover:shadow-lg"
              size="lg"
            >
              <div className="flex items-center gap-2">
                <span>🔗</span>
                Connect Wallet
              </div>
            </Button>
            <div className="text-sm text-muted-foreground text-center bg-muted/30 rounded-lg p-3">
              Own fractions of premium domains and earn from their value appreciation
            </div>
          </CardContent>
        </Card>
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
      
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold text-black dark:text-white">
              Fractional Ownership
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Connected: {account?.slice(0, 6)}...{account?.slice(-4)}</span>
              </div>
              <Badge variant="outline" className="px-3 py-1">
                {fractionalDomains.length} Fractional Domains
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-4 py-2 bg-emerald-50 border-emerald-500/20 text-emerald-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
              Live Trading
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Total Fractions
              </CardTitle>
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300 animate-float">🎯</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-all duration-300">
                {fractionalDomains.reduce((sum, domain) => sum + domain.totalFractions, 0)}
              </div>
              <div className="flex items-center gap-2 text-xs mt-2">
                <span className="flex items-center font-medium text-emerald-500 group-hover:scale-105 transition-transform duration-300">
                  <span className="mr-1">↗</span>
                  +15.3%
                </span>
                <span className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                  this month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Available Fractions
              </CardTitle>
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300 animate-float" style={{animationDelay: '0.5s'}}>🛒</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-all duration-300">
                {fractionalDomains.reduce((sum, domain) => sum + domain.availableFractions, 0)}
              </div>
              <div className="flex items-center gap-2 text-xs mt-2">
                <span className="flex items-center font-medium text-emerald-500 group-hover:scale-105 transition-transform duration-300">
                  <span className="mr-1">↗</span>
                  +8.7%
                </span>
                <span className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                  this week
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Avg Price/Fraction
              </CardTitle>
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300 animate-float" style={{animationDelay: '1s'}}>💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-all duration-300">
                {(fractionalDomains.reduce((sum, domain) => sum + domain.pricePerFraction, 0) / fractionalDomains.length).toFixed(2)} ETH
              </div>
              <div className="flex items-center gap-2 text-xs mt-2">
                <span className="flex items-center font-medium text-emerald-500 group-hover:scale-105 transition-transform duration-300">
                  <span className="mr-1">↗</span>
                  +12.1%
                </span>
                <span className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                  vs last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Your Holdings
              </CardTitle>
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300 animate-float" style={{animationDelay: '1.5s'}}>🏠</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-all duration-300">
                {userFractionalHoldings.length}
              </div>
              <div className="flex items-center gap-2 text-xs mt-2">
                <span className="flex items-center font-medium text-emerald-500 group-hover:scale-105 transition-transform duration-300">
                  <span className="mr-1">↗</span>
                  +{userFractionalHoldings.reduce((sum, holding) => sum + ((holding.currentValue - holding.purchasePrice) / holding.purchasePrice * 100), 0).toFixed(1)}%
                </span>
                <span className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                  total return
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="marketplace" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-background/50 backdrop-blur-sm border border-border/50">
            <TabsTrigger value="marketplace" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="my-holdings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              My Holdings
            </TabsTrigger>
            <TabsTrigger value="fractionalize" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Fractionalize
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fractionalDomains.map((domain) => (
                <Card key={domain.id} className="group relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-2">
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
                        {domain.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative z-10 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Available:</span>
                        <span className="font-medium">{domain.availableFractions}/{domain.totalFractions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price per fraction:</span>
                        <span className="font-medium">{domain.pricePerFraction} ETH</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total value:</span>
                        <span className="font-medium">{domain.totalValue} ETH</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {domain.description}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleBuyFractions({ id: domain.id.toString(), name: domain.name, price: domain.pricePerFraction }, 1)}
                        disabled={isLoading}
                        className="flex-1 bg-foreground text-background hover:bg-foreground/90 font-medium transition-all duration-300 hover:shadow-lg"
                      >
                        Buy 1
                      </Button>
                      <Button 
                        onClick={() => handleBuyFractions({ id: domain.id.toString(), name: domain.name, price: domain.pricePerFraction }, 10)}
                        disabled={isLoading}
                        variant="outline"
                        className="flex-1 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
                      >
                        Buy 10
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-holdings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userFractionalHoldings.map((holding, index) => (
                <Card key={index} className="group relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="text-xl">🏠</span>
                      <span className="text-foreground">
                        {holding.domainName}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg">
                        <div className="text-lg font-bold text-foreground">{holding.fractionsOwned}</div>
                        <div className="text-sm text-muted-foreground">Fractions Owned</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg">
                        <div className="text-lg font-bold text-foreground">{holding.ownershipPercentage}%</div>
                        <div className="text-sm text-muted-foreground">Ownership</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current Value:</span>
                        <span className="font-medium text-emerald-600">{holding.currentValue} ETH</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Purchase Price:</span>
                        <span className="font-medium">{holding.purchasePrice} ETH</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Return:</span>
                        <span className="font-medium text-emerald-600">
                          +{((holding.currentValue - holding.purchasePrice) / holding.purchasePrice * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="fractionalize" className="space-y-6">
            <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-xl animate-float">🎯</span>
                  <span className="text-foreground">
                    Fractionalize Your Domain
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="domain">Select Domain to Fractionalize</Label>
                    <select
                      id="domain"
                      value={selectedDomain}
                      onChange={(e) => setSelectedDomain(e.target.value)}
                      className="w-full p-3 bg-background/50 border border-border/50 rounded-md focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    >
                      <option value="">Choose a domain...</option>
                      {userDomains.map((domain) => (
                        <option key={domain.tokenId} value={domain.name}>
                          {domain.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fractions">Number of Fractions</Label>
                    <Input
                      id="fractions"
                      type="number"
                      value={fractionCount}
                      onChange={(e) => setFractionCount(parseInt(e.target.value) || 100)}
                      min="10"
                      max="10000"
                      className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Fraction (ETH)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.001"
                      value={pricePerFraction}
                      onChange={(e) => setPricePerFraction(e.target.value)}
                      placeholder="0.1"
                      className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleFractionalize}
                  disabled={isLoading || !selectedDomain || !pricePerFraction}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium py-3 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Fractionalizing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>🎯</span>
                      Fractionalize Domain
                    </div>
                  )}
                </Button>
                
                <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-border/30">
                  <p className="font-semibold mb-2 text-foreground flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    Benefits of Fractionalization:
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      Increase liquidity for your domain
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                      Share ownership with multiple investors
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                      Earn from domain value appreciation
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FractionalOwnership;
