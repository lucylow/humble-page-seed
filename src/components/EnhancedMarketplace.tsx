import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useContractService, Offer } from '../services/contractService';
import { useToast } from '@/hooks/use-toast';
import { useNotificationHelpers } from './EnhancedNotificationSystem';
import { useWeb3 } from '../contexts/Web3Context';
import { 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  User, 
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Star,
  Eye,
  Heart,
  Share2,
  MoreHorizontal
} from 'lucide-react';

interface DomainListing {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: string;
  currency: string;
  owner: string;
  tokenId: string;
  nftContract: string;
  createdAt: string;
  views: number;
  offers: number;
  isActive: boolean;
  metadata: {
    category: string;
    tags: string[];
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    stats: {
      length: number;
      pronounceability: number;
      memorability: number;
      brandability: number;
    };
  };
}

interface MarketplaceFilters {
  category: string;
  priceRange: [number, number];
  currency: string;
  rarity: string;
  sortBy: 'price' | 'date' | 'views' | 'offers' | 'rating';
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
}

const EnhancedMarketplace: React.FC = () => {
  const contractService = useContractService();
  const { toast } = useToast();
  const { showSuccess, showError, showWarning, showTransaction } = useNotificationHelpers();
  const { account, isConnected } = useWeb3();
  
  const [domains, setDomains] = useState<DomainListing[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<DomainListing[]>([]);
  const [offers, setOffers] = useState<Map<string, Offer[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<DomainListing | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerDuration, setOfferDuration] = useState('7');
  const [offerCurrency, setOfferCurrency] = useState('ETH');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    category: 'all',
    priceRange: [0, 1000],
    currency: 'all',
    rarity: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
    searchQuery: ''
  });

  // Mock data - in production, this would come from your backend
  const mockDomains: DomainListing[] = [
    {
      id: '1',
      name: 'cryptoqueen.eth',
      description: 'Premium crypto domain perfect for DeFi projects',
      imageUrl: '/api/placeholder/300/200',
      price: '2.5',
      currency: 'ETH',
      owner: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      tokenId: '1',
      nftContract: '0x1234567890123456789012345678901234567890',
      createdAt: '2024-01-15T10:30:00Z',
      views: 1250,
      offers: 3,
      isActive: true,
      metadata: {
        category: 'crypto',
        tags: ['defi', 'crypto', 'premium'],
        rarity: 'rare',
        stats: {
          length: 12,
          pronounceability: 9,
          memorability: 8,
          brandability: 9
        }
      }
    },
    {
      id: '2',
      name: 'nftmarket.eth',
      description: 'Perfect domain for NFT marketplace platforms',
      imageUrl: '/api/placeholder/300/200',
      price: '1.8',
      currency: 'ETH',
      owner: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
      tokenId: '2',
      nftContract: '0x1234567890123456789012345678901234567890',
      createdAt: '2024-01-14T15:45:00Z',
      views: 890,
      offers: 1,
      isActive: true,
      metadata: {
        category: 'nft',
        tags: ['nft', 'marketplace', 'art'],
        rarity: 'common',
        stats: {
          length: 10,
          pronounceability: 8,
          memorability: 7,
          brandability: 8
        }
      }
    }
  ];

  // Load domains and offers
  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    setLoading(true);
    try {
      // In production, fetch from your backend API
      setDomains(mockDomains);
      
      // Load offers for each domain
      if (contractService) {
        const offersMap = new Map<string, Offer[]>();
        for (const domain of mockDomains) {
          try {
            const domainOffers = await contractService.getActiveDomainOffers(
              domain.nftContract,
              domain.tokenId
            );
            offersMap.set(domain.id, domainOffers);
          } catch (error) {
            console.error(`Error loading offers for domain ${domain.id}:`, error);
          }
        }
        setOffers(offersMap);
      }
    } catch (error) {
      showError('Failed to load domains', 'Please try again later');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...domains];

    // Search filter
    if (filters.searchQuery) {
      filtered = filtered.filter(domain =>
        domain.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        domain.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        domain.metadata.tags.some(tag => tag.toLowerCase().includes(filters.searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(domain => domain.metadata.category === filters.category);
    }

    // Currency filter
    if (filters.currency !== 'all') {
      filtered = filtered.filter(domain => domain.currency === filters.currency);
    }

    // Rarity filter
    if (filters.rarity !== 'all') {
      filtered = filtered.filter(domain => domain.metadata.rarity === filters.rarity);
    }

    // Price range filter
    filtered = filtered.filter(domain => {
      const price = parseFloat(domain.price);
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: unknown, bValue: unknown;
      
      switch (filters.sortBy) {
        case 'price':
          aValue = parseFloat(a.price);
          bValue = parseFloat(b.price);
          break;
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'views':
          aValue = a.views;
          bValue = b.views;
          break;
        case 'offers':
          aValue = a.offers;
          bValue = b.offers;
          break;
        case 'rating':
          aValue = (a.metadata.stats.pronounceability + a.metadata.stats.memorability + a.metadata.stats.brandability) / 3;
          bValue = (b.metadata.stats.pronounceability + b.metadata.stats.memorability + b.metadata.stats.brandability) / 3;
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return Number(aValue) - Number(bValue);
      } else {
        return Number(bValue) - Number(aValue);
      }
    });

    setFilteredDomains(filtered);
  }, [domains, filters]);

  const handleCreateOffer = async () => {
    if (!contractService || !selectedDomain) {
      showError('Contract not available', 'Please connect your wallet');
      return;
    }

    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      showError('Invalid amount', 'Please enter a valid offer amount');
      return;
    }

    setSubmittingOffer(true);
    try {
      const duration = parseInt(offerDuration) * 24 * 60 * 60; // Convert days to seconds
      const paymentToken = offerCurrency === 'ETH' 
        ? '0x0000000000000000000000000000000000000000' 
        : '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC

      const tx = await contractService.createOffer({
        nftContract: selectedDomain.nftContract,
        tokenId: selectedDomain.tokenId,
        paymentToken,
        amount: offerAmount,
        duration
      });

      showTransaction(
        'Offer Created',
        `Your offer of ${offerAmount} ${offerCurrency} has been submitted`,
        'Transaction sent'
      );

      setShowOfferModal(false);
      setOfferAmount('');
      await loadDomains(); // Refresh offers
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create offer';
      toast({ title: 'Offer Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleBuyNow = async (domain: DomainListing) => {
    if (!isConnected) {
      showWarning('Wallet Required', 'Please connect your wallet to make a purchase');
      return;
    }

    // In production, this would trigger the buy now flow
    showSuccess('Purchase Initiated', `Starting purchase of ${domain.name}`);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return '⚪';
      case 'rare': return '🔵';
      case 'epic': return '🟣';
      case 'legendary': return '🟡';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-6 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Domain Marketplace</h1>
          <p className="text-muted-foreground mt-1">
            Discover and trade premium domain names
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {filteredDomains.length} domains
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            {Array.from(offers.values()).flat().length} active offers
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search domains..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="nft">NFT</SelectItem>
                  <SelectItem value="defi">DeFi</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={filters.currency} onValueChange={(value) => setFilters(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All currencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Currencies</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={`${filters.sortBy}-${filters.sortOrder}`} onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('-');
                setFilters(prev => ({ ...prev, sortBy: sortBy as any, sortOrder: sortOrder as any }));
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="views-desc">Most Views</SelectItem>
                  <SelectItem value="offers-desc">Most Offers</SelectItem>
                  <SelectItem value="rating-desc">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDomains.map((domain) => (
          <Card key={domain.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="relative">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg flex items-center justify-center">
                <span className="text-4xl">🌐</span>
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                <Badge className={getRarityColor(domain.metadata.rarity)}>
                  {getRarityIcon(domain.metadata.rarity)} {domain.metadata.rarity}
                </Badge>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {domain.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {domain.description}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-bold text-lg">{domain.price}</span>
                  <span className="text-sm text-muted-foreground">{domain.currency}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  {domain.views}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <User className="h-4 w-4" />
                  {domain.owner.slice(0, 6)}...{domain.owner.slice(-4)}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {new Date(domain.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => handleBuyNow(domain)}
                  disabled={!isConnected}
                >
                  Buy Now
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedDomain(domain);
                    setShowOfferModal(true);
                  }}
                  disabled={!isConnected}
                >
                  Make Offer
                </Button>
              </div>

              {offers.get(domain.id) && offers.get(domain.id)!.length > 0 && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active Offers:</span>
                    <Badge variant="secondary">{offers.get(domain.id)!.length}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Offer Modal */}
      {showOfferModal && selectedDomain && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Make an Offer</CardTitle>
              <p className="text-sm text-muted-foreground">
                Offer for {selectedDomain.name}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Offer Amount</Label>
                <div className="flex gap-2">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.0"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                  />
                  <Select value={offerCurrency} onValueChange={setOfferCurrency}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Offer Duration (days)</Label>
                <Select value={offerDuration} onValueChange={setOfferDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <AlertDescription>
                  Your offer will be locked for {offerDuration} days. You can cancel it anytime before expiration.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowOfferModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleCreateOffer}
                  disabled={submittingOffer || !offerAmount}
                >
                  {submittingOffer ? 'Creating...' : 'Create Offer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedMarketplace;