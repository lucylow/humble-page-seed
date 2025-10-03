import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useContractService } from '../services/contractService';
import { useNotificationHelpers } from './EnhancedNotificationSystem';
import { useWeb3 } from '../contexts/Web3Context';
import { 
  Globe, 
  Shield, 
  Zap, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Eye,
  Heart,
  Share2,
  Plus,
  Settings,
  Lock,
  Unlock,
  ArrowRight,
  PieChart,
  Target,
  Handshake,
  Award,
  Link as LinkIcon,
  Layers,
  Activity,
  BarChart3,
  Wallet,
  RefreshCw,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  BookOpen,
  TrendingDown,
  ArrowUpDown,
  Minus,
  X
} from 'lucide-react';

interface OrderbookEntry {
  id: string;
  domainName: string;
  price: string;
  currency: string;
  type: 'bid' | 'ask';
  amount: string;
  total: string;
  owner: string;
  timestamp: string;
  expiresAt?: string;
  status: 'active' | 'filled' | 'cancelled' | 'expired';
  isFractionalized: boolean;
  fractionPrice?: string;
  availableFractions?: string;
  chainId: number;
  orderHash: string;
}

interface DomainListing {
  id: string;
  domainName: string;
  description: string;
  currentPrice: string;
  currency: string;
  priceChange24h: number;
  volume24h: string;
  marketCap: string;
  isTokenized: boolean;
  isFractionalized: boolean;
  totalSupply?: string;
  availableFractions?: string;
  pricePerFraction?: string;
  compliance: {
    icannCompliant: boolean;
    transferLock: boolean;
    verificationStatus: string;
  };
  orderbook: {
    bestBid: string;
    bestAsk: string;
    spread: string;
    spreadPercentage: number;
    totalBids: number;
    totalAsks: number;
    lastTrade?: {
      price: string;
      timestamp: string;
      volume: string;
    };
  };
  attributes: Array<{
    trait_type: string;
    value: string | number;
    rarity: string;
  }>;
  crossChainInfo: Array<{
    chainId: number;
    chainName: string;
    isActive: boolean;
    bridgeFee: string;
  }>;
  createdAt: string;
}

const DomaOrderbookIntegration: React.FC = () => {
  const contractService = useContractService();
  const { showSuccess, showError, showWarning, showTransaction } = useNotificationHelpers();
  const { account, isConnected, chainId } = useWeb3();
  
  const [activeTab, setActiveTab] = useState('marketplace');
  const [domainListings, setDomainListings] = useState<DomainListing[]>([]);
  const [orderbookEntries, setOrderbookEntries] = useState<OrderbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<DomainListing | null>(null);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showPlaceOrder, setShowPlaceOrder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChain, setFilterChain] = useState('all');
  const [sortBy, setSortBy] = useState('market_cap');
  const [orderType, setOrderType] = useState<'bid' | 'ask'>('bid');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderAmount, setOrderAmount] = useState('');

  // Mock data - in production, this would come from Doma Protocol APIs
  const mockDomainListings: DomainListing[] = [
    {
      id: '1',
      domainName: 'crypto.eth',
      description: 'Ultra-premium generic domain with massive brand potential and strong market presence.',
      currentPrice: '1250',
      currency: 'ETH',
      priceChange24h: 12.5,
      volume24h: '45.2',
      marketCap: '1250000',
      isTokenized: true,
      isFractionalized: true,
      totalSupply: '1000',
      availableFractions: '150',
      pricePerFraction: '1.25',
      compliance: {
        icannCompliant: true,
        transferLock: false,
        verificationStatus: 'verified'
      },
      orderbook: {
        bestBid: '1200',
        bestAsk: '1300',
        spread: '100',
        spreadPercentage: 8.0,
        totalBids: 15,
        totalAsks: 8,
        lastTrade: {
          price: '1225',
          timestamp: '2024-01-15T14:30:00Z',
          volume: '2.5'
        }
      },
      attributes: [
        { trait_type: 'Length', value: 6, rarity: 'rare' },
        { trait_type: 'TLD', value: 'eth', rarity: 'epic' },
        { trait_type: 'Category', value: 'Crypto', rarity: 'legendary' }
      ],
      crossChainInfo: [
        { chainId: 1, chainName: 'Ethereum', isActive: true, bridgeFee: '0.01' },
        { chainId: 137, chainName: 'Polygon', isActive: true, bridgeFee: '0.005' }
      ],
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      domainName: 'defi.eth',
      description: 'Highly valuable DeFi domain with strong community recognition and revenue potential.',
      currentPrice: '950',
      currency: 'ETH',
      priceChange24h: -2.3,
      volume24h: '23.8',
      marketCap: '950000',
      isTokenized: true,
      isFractionalized: false,
      compliance: {
        icannCompliant: true,
        transferLock: false,
        verificationStatus: 'verified'
      },
      orderbook: {
        bestBid: '920',
        bestAsk: '980',
        spread: '60',
        spreadPercentage: 6.3,
        totalBids: 12,
        totalAsks: 5,
        lastTrade: {
          price: '940',
          timestamp: '2024-01-15T12:15:00Z',
          volume: '1.8'
        }
      },
      attributes: [
        { trait_type: 'Length', value: 4, rarity: 'epic' },
        { trait_type: 'TLD', value: 'eth', rarity: 'epic' },
        { trait_type: 'Category', value: 'DeFi', rarity: 'legendary' }
      ],
      crossChainInfo: [
        { chainId: 1, chainName: 'Ethereum', isActive: true, bridgeFee: '0.01' }
      ],
      createdAt: '2024-01-02T00:00:00Z'
    }
  ];

  const mockOrderbookEntries: OrderbookEntry[] = [
    {
      id: '1',
      domainName: 'crypto.eth',
      price: '1300',
      currency: 'ETH',
      type: 'ask',
      amount: '1.0',
      total: '1300',
      owner: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      timestamp: '2024-01-15T10:30:00Z',
      expiresAt: '2024-01-22T10:30:00Z',
      status: 'active',
      isFractionalized: true,
      fractionPrice: '1.3',
      availableFractions: '100',
      chainId: 1,
      orderHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    },
    {
      id: '2',
      domainName: 'crypto.eth',
      price: '1200',
      currency: 'ETH',
      type: 'bid',
      amount: '1.0',
      total: '1200',
      owner: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
      timestamp: '2024-01-15T09:15:00Z',
      expiresAt: '2024-01-22T09:15:00Z',
      status: 'active',
      isFractionalized: true,
      fractionPrice: '1.2',
      availableFractions: '50',
      chainId: 1,
      orderHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // In production, fetch from Doma Protocol APIs
      setDomainListings(mockDomainListings);
      setOrderbookEntries(mockOrderbookEntries);
    } catch (error) {
      showError('Failed to load data', 'Please try again later');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!contractService || !isConnected) {
      showError('Wallet Required', 'Please connect your wallet to place orders');
      return;
    }

    if (!orderPrice || !orderAmount) {
      showError('Missing Information', 'Please fill in all required fields');
      return;
    }

    try {
      // In production, this would interact with Doma Protocol orderbook contracts
      showSuccess('Order Placed', `${orderType.toUpperCase()} order placed for ${orderAmount} at ${orderPrice} ETH`);
      setShowPlaceOrder(false);
      setOrderPrice('');
      setOrderAmount('');
      await loadData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Order failed';
      showError('Order Failed', errorMessage);
    }
  };

  const handleCreateListing = async (domainName: string, price: string, currency: string) => {
    if (!contractService || !isConnected) {
      showError('Wallet Required', 'Please connect your wallet to create listings');
      return;
    }

    try {
      // In production, this would interact with Doma Protocol marketplace contracts
      showSuccess('Listing Created', `${domainName} listed for ${price} ${currency}`);
      setShowCreateListing(false);
      await loadData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Listing failed';
      showError('Listing Failed', errorMessage);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!contractService || !isConnected) {
      showError('Wallet Required', 'Please connect your wallet to cancel orders');
      return;
    }

    try {
      // In production, this would interact with Doma Protocol orderbook contracts
      showSuccess('Order Cancelled', 'Order has been successfully cancelled');
      await loadData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Cancel failed';
      showError('Cancel Failed', errorMessage);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'uncommon': return 'bg-green-100 text-green-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderTypeColor = (type: string) => {
    return type === 'bid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'filled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredListings = domainListings.filter(listing => {
    const matchesSearch = listing.domainName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChain = filterChain === 'all' || listing.crossChainInfo.some(chain => chain.chainId.toString() === filterChain);
    return matchesSearch && matchesChain;
  });

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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gradient">
          Doma Orderbook Integration
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Trade tokenized domains with full ICANN compliance, cross-chain support, and advanced orderbook functionality
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">1,247</div>
            <div className="text-sm text-muted-foreground">Active Listings</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">$45.2M</div>
            <div className="text-sm text-muted-foreground">Total Volume</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">$2.8M</div>
            <div className="text-sm text-muted-foreground">24h Volume</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-orange-600 mb-2">3,456</div>
            <div className="text-sm text-muted-foreground">Active Orders</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search domains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterChain} onValueChange={setFilterChain}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Chain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chains</SelectItem>
                <SelectItem value="1">Ethereum</SelectItem>
                <SelectItem value="137">Polygon</SelectItem>
                <SelectItem value="8453">Base</SelectItem>
                <SelectItem value="43114">Avalanche</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market_cap">Market Cap</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
                <SelectItem value="recent">Recently Added</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={showCreateListing} onOpenChange={setShowCreateListing}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Listing
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Domain Listing</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="domain-name">Domain Name</Label>
                    <Input id="domain-name" placeholder="e.g., mydomain.eth" />
                  </div>
                  <div>
                    <Label htmlFor="listing-price">Price</Label>
                    <Input id="listing-price" placeholder="100" />
                  </div>
                  <div>
                    <Label htmlFor="listing-currency">Currency</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Your domain will remain fully ICANN compliant and functional after listing.
                    </AlertDescription>
                  </Alert>
                  <Button className="w-full" onClick={() => handleCreateListing('mydomain.eth', '100', 'ETH')}>
                    Create Listing
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="orderbook">Orderbook</TabsTrigger>
          <TabsTrigger value="my-orders">My Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedDomain(listing)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-blue-600">{listing.domainName}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getRarityColor(listing.attributes[0]?.rarity || 'common')}>
                          {listing.attributes[0]?.rarity || 'common'}
                        </Badge>
                        {listing.isFractionalized && (
                          <Badge className="bg-pink-100 text-pink-800">
                            <PieChart className="h-3 w-3 mr-1" />
                            Fractionalized
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{listing.currentPrice} {listing.currency}</div>
                      <div className={`text-sm ${listing.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {listing.priceChange24h >= 0 ? '+' : ''}{listing.priceChange24h}%
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm line-clamp-2">{listing.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Market Cap</span>
                      <span className="font-semibold">${listing.marketCap}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>24h Volume</span>
                      <span className="font-semibold">{listing.volume24h} {listing.currency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Spread</span>
                      <span className="font-semibold">{listing.orderbook.spreadPercentage}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span className={listing.compliance.icannCompliant ? 'text-green-600' : 'text-red-600'}>
                        {listing.compliance.icannCompliant ? 'ICANN Compliant' : 'Non-compliant'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>{listing.crossChainInfo.length} chains</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      Trade
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Orderbook Tab */}
        <TabsContent value="orderbook" className="space-y-6">
          {selectedDomain ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Orderbook for {selectedDomain.domainName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-green-600">Bids (Buy Orders)</h3>
                      <div className="space-y-2">
                        {orderbookEntries
                          .filter(entry => entry.type === 'bid' && entry.domainName === selectedDomain.domainName)
                          .map((entry) => (
                            <div key={entry.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                              <div>
                                <div className="font-semibold">{entry.price} {entry.currency}</div>
                                <div className="text-sm text-muted-foreground">Amount: {entry.amount}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground">{entry.owner.slice(0, 6)}...{entry.owner.slice(-4)}</div>
                                <Badge className={getStatusColor(entry.status)}>
                                  {entry.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-red-600">Asks (Sell Orders)</h3>
                      <div className="space-y-2">
                        {orderbookEntries
                          .filter(entry => entry.type === 'ask' && entry.domainName === selectedDomain.domainName)
                          .map((entry) => (
                            <div key={entry.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                              <div>
                                <div className="font-semibold">{entry.price} {entry.currency}</div>
                                <div className="text-sm text-muted-foreground">Amount: {entry.amount}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground">{entry.owner.slice(0, 6)}...{entry.owner.slice(-4)}</div>
                                <Badge className={getStatusColor(entry.status)}>
                                  {entry.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Place Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="order-type">Order Type</Label>
                      <Select value={orderType} onValueChange={(value: 'bid' | 'ask') => setOrderType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bid">Bid (Buy)</SelectItem>
                          <SelectItem value="ask">Ask (Sell)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="order-price">Price ({selectedDomain.currency})</Label>
                      <Input
                        id="order-price"
                        value={orderPrice}
                        onChange={(e) => setOrderPrice(e.target.value)}
                        placeholder="Enter price"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="order-amount">Amount</Label>
                    <Input
                      id="order-amount"
                      value={orderAmount}
                      onChange={(e) => setOrderAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </div>
                  <Button onClick={handlePlaceOrder} className="w-full">
                    Place {orderType.toUpperCase()} Order
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Domain</h3>
              <p className="text-muted-foreground">Choose a domain from the marketplace to view its orderbook</p>
            </div>
          )}
        </TabsContent>

        {/* My Orders Tab */}
        <TabsContent value="my-orders" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">My Active Orders</h3>
            <div className="space-y-2">
              {orderbookEntries
                .filter(entry => entry.owner === account)
                .map((entry) => (
                  <Card key={entry.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{entry.domainName}</div>
                          <div className="text-sm text-muted-foreground">
                            {entry.type.toUpperCase()} • {entry.price} {entry.currency} • Amount: {entry.amount}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getOrderTypeColor(entry.type)}>
                            {entry.type.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(entry.status)}>
                            {entry.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelOrder(entry.id)}
                            disabled={entry.status !== 'active'}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">$2.8M</div>
                    <div className="text-sm text-muted-foreground">24h Volume</div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-2 text-sm text-green-600">+12.5% from yesterday</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">1,247</div>
                    <div className="text-sm text-muted-foreground">Active Listings</div>
                  </div>
                  <Globe className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-2 text-sm text-blue-600">+5.2% this week</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">3,456</div>
                    <div className="text-sm text-muted-foreground">Active Orders</div>
                  </div>
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mt-2 text-sm text-purple-600">+8.1% this month</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Market Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Market Cap</span>
                  <span className="font-semibold">$45.2M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Price</span>
                  <span className="font-semibold">$36,250</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Most Traded TLD</span>
                  <span className="font-semibold">.eth (67%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Fractionalized Domains</span>
                  <span className="font-semibold">156 (12.5%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DomaOrderbookIntegration;
