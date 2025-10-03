import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  RefreshCw
} from 'lucide-react';

interface TokenizedDomain {
  id: string;
  domainName: string;
  domainDescription: string;
  tld: string;
  tokenId: string;
  contractAddress: string;
  chainId: number;
  owner: string;
  isTokenized: boolean;
  isFractionalized: boolean;
  totalSupply?: string;
  availableFractions?: string;
  pricePerFraction?: string;
  marketCap?: string;
  currentPrice: string;
  currency: string;
  priceChange24h: number;
  volume24h: string;
  marketCapRank?: number;
  lastSale?: {
    price: string;
    currency: string;
    timestamp: string;
    buyer: string;
  };
  attributes: DomainAttribute[];
  compliance: ComplianceInfo;
  metadata: DomainMetadata;
  tradingHistory: TradingRecord[];
  fractionalOwners: FractionalOwner[];
  syntheticTokens: SyntheticToken[];
  crossChainInfo: CrossChainInfo[];
  createdAt: string;
  imageUrl?: string;
}

interface DomainAttribute {
  trait_type: string;
  value: string | number;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface ComplianceInfo {
  icannCompliant: boolean;
  transferLock: boolean;
  disputeStatus: 'none' | 'pending' | 'resolved';
  verificationStatus: 'verified' | 'pending' | 'failed';
  registrar: string;
  registrationDate: string;
  expirationDate: string;
  lastUpdated: string;
}

interface DomainMetadata {
  description: string;
  image: string;
  external_url: string;
  animation_url?: string;
  background_color?: string;
  attributes: DomainAttribute[];
  properties: {
    category: string;
    subcategory: string;
    tags: string[];
    language: string;
    region: string;
  };
}

interface TradingRecord {
  id: string;
  type: 'sale' | 'offer' | 'fraction_trade' | 'buyout';
  price: string;
  currency: string;
  quantity?: string;
  buyer: string;
  seller: string;
  timestamp: string;
  transactionHash: string;
  blockNumber: number;
}

interface FractionalOwner {
  address: string;
  fractionCount: string;
  percentage: number;
  joinedAt: string;
  avatar?: string;
}

interface SyntheticToken {
  id: string;
  name: string;
  symbol: string;
  type: 'dns_control' | 'subdomain_creation' | 'revenue_sharing' | 'voting_rights' | 'usage_rights';
  description: string;
  totalSupply: string;
  price: string;
  currency: string;
  isActive: boolean;
}

interface CrossChainInfo {
  chainId: number;
  chainName: string;
  contractAddress: string;
  isActive: boolean;
  bridgeFee: string;
  estimatedTime: string;
}

const DomainTokenizationInterface: React.FC = () => {
  const contractService = useContractService();
  const { showSuccess, showError, showWarning, showTransaction } = useNotificationHelpers();
  const { account, isConnected, chainId } = useWeb3();
  
  const [activeTab, setActiveTab] = useState('marketplace');
  const [tokenizedDomains, setTokenizedDomains] = useState<TokenizedDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<TokenizedDomain | null>(null);
  const [showTokenizeDialog, setShowTokenizeDialog] = useState(false);
  const [showFractionalizeDialog, setShowFractionalizeDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChain, setFilterChain] = useState('all');
  const [sortBy, setSortBy] = useState('market_cap');

  // Mock data - in production, this would come from Doma Protocol APIs
  const mockTokenizedDomains: TokenizedDomain[] = [
    {
      id: '1',
      domainName: 'crypto.eth',
      domainDescription: 'Ultra-premium generic domain with massive brand potential. Currently generating significant revenue through strategic partnerships.',
      tld: 'eth',
      tokenId: '12345',
      contractAddress: '0x1234567890123456789012345678901234567890',
      chainId: 1,
      owner: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      isTokenized: true,
      isFractionalized: true,
      totalSupply: '1000',
      availableFractions: '150',
      pricePerFraction: '1.25',
      marketCap: '1250000',
      currentPrice: '1250',
      currency: 'ETH',
      priceChange24h: 12.5,
      volume24h: '45.2',
      marketCapRank: 1,
      lastSale: {
        price: '1200',
        currency: 'ETH',
        timestamp: '2024-01-15T14:30:00Z',
        buyer: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c'
      },
      attributes: [
        { trait_type: 'Length', value: 6, rarity: 'rare' },
        { trait_type: 'TLD', value: 'eth', rarity: 'epic' },
        { trait_type: 'Category', value: 'Crypto', rarity: 'legendary' },
        { trait_type: 'Brandability', value: 95, rarity: 'legendary' },
        { trait_type: 'Traffic Score', value: 88, rarity: 'epic' }
      ],
      compliance: {
        icannCompliant: true,
        transferLock: false,
        disputeStatus: 'none',
        verificationStatus: 'verified',
        registrar: 'Ethereum Name Service',
        registrationDate: '2020-03-15T00:00:00Z',
        expirationDate: '2025-03-15T00:00:00Z',
        lastUpdated: '2024-01-15T10:00:00Z'
      },
      metadata: {
        description: 'Premium crypto domain with exceptional brand potential',
        image: 'https://api.doma.xyz/metadata/crypto.eth/image',
        external_url: 'https://crypto.eth',
        background_color: '000000',
        attributes: [],
        properties: {
          category: 'Technology',
          subcategory: 'Cryptocurrency',
          tags: ['crypto', 'blockchain', 'defi', 'nft'],
          language: 'en',
          region: 'global'
        }
      },
      tradingHistory: [
        {
          id: '1',
          type: 'sale',
          price: '1200',
          currency: 'ETH',
          buyer: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
          seller: '0x6fC21092DA55B392b745d0B6c49543c4e30fC2b3',
          timestamp: '2024-01-15T14:30:00Z',
          transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          blockNumber: 19000000
        }
      ],
      fractionalOwners: [
        { address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', fractionCount: '200', percentage: 20, joinedAt: '2024-01-10T10:00:00Z' },
        { address: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c', fractionCount: '150', percentage: 15, joinedAt: '2024-01-12T15:30:00Z' },
        { address: '0x6fC21092DA55B392b745d0B6c49543c4e30fC2b3', fractionCount: '100', percentage: 10, joinedAt: '2024-01-14T09:15:00Z' }
      ],
      syntheticTokens: [
        {
          id: '1',
          name: 'Crypto DNS Control',
          symbol: 'CDNS',
          type: 'dns_control',
          description: 'Controls DNS settings and subdomain creation for crypto.eth',
          totalSupply: '100',
          price: '12.5',
          currency: 'ETH',
          isActive: true
        },
        {
          id: '2',
          name: 'Crypto Revenue Share',
          symbol: 'CRS',
          type: 'revenue_sharing',
          description: 'Entitled to 20% of revenue generated by crypto.eth',
          totalSupply: '200',
          price: '6.25',
          currency: 'ETH',
          isActive: true
        }
      ],
      crossChainInfo: [
        { chainId: 1, chainName: 'Ethereum', contractAddress: '0x1234...', isActive: true, bridgeFee: '0.01', estimatedTime: '5 min' },
        { chainId: 137, chainName: 'Polygon', contractAddress: '0x5678...', isActive: true, bridgeFee: '0.005', estimatedTime: '2 min' },
        { chainId: 8453, chainName: 'Base', contractAddress: '0x9abc...', isActive: true, bridgeFee: '0.008', estimatedTime: '3 min' }
      ],
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      domainName: 'defi.eth',
      domainDescription: 'Highly valuable DeFi domain with strong community recognition and revenue generation potential.',
      tld: 'eth',
      tokenId: '12346',
      contractAddress: '0x1234567890123456789012345678901234567890',
      chainId: 1,
      owner: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
      isTokenized: true,
      isFractionalized: false,
      currentPrice: '950',
      currency: 'ETH',
      priceChange24h: -2.3,
      volume24h: '23.8',
      marketCapRank: 2,
      attributes: [
        { trait_type: 'Length', value: 4, rarity: 'epic' },
        { trait_type: 'TLD', value: 'eth', rarity: 'epic' },
        { trait_type: 'Category', value: 'DeFi', rarity: 'legendary' },
        { trait_type: 'Brandability', value: 92, rarity: 'legendary' },
        { trait_type: 'Traffic Score', value: 85, rarity: 'epic' }
      ],
      compliance: {
        icannCompliant: true,
        transferLock: false,
        disputeStatus: 'none',
        verificationStatus: 'verified',
        registrar: 'Ethereum Name Service',
        registrationDate: '2020-05-20T00:00:00Z',
        expirationDate: '2025-05-20T00:00:00Z',
        lastUpdated: '2024-01-15T10:00:00Z'
      },
      metadata: {
        description: 'Premium DeFi domain with exceptional utility',
        image: 'https://api.doma.xyz/metadata/defi.eth/image',
        external_url: 'https://defi.eth',
        background_color: '1a1a1a',
        attributes: [],
        properties: {
          category: 'Finance',
          subcategory: 'DeFi',
          tags: ['defi', 'yield', 'lending', 'trading'],
          language: 'en',
          region: 'global'
        }
      },
      tradingHistory: [],
      fractionalOwners: [],
      syntheticTokens: [],
      crossChainInfo: [
        { chainId: 1, chainName: 'Ethereum', contractAddress: '0x1234...', isActive: true, bridgeFee: '0.01', estimatedTime: '5 min' }
      ],
      createdAt: '2024-01-02T00:00:00Z'
    }
  ];

  useEffect(() => {
    loadTokenizedDomains();
  }, []);

  const loadTokenizedDomains = async () => {
    setLoading(true);
    try {
      // In production, fetch from Doma Protocol APIs
      setTokenizedDomains(mockTokenizedDomains);
    } catch (error) {
      showError('Failed to load domains', 'Please try again later');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenizeDomain = async (domainName: string) => {
    if (!contractService || !isConnected) {
      showError('Wallet Required', 'Please connect your wallet to tokenize domains');
      return;
    }

    try {
      // In production, this would interact with Doma Protocol smart contracts
      showSuccess('Domain Tokenized', `${domainName} has been successfully tokenized on the blockchain`);
      await loadTokenizedDomains();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Tokenization failed';
      showError('Tokenization Failed', errorMessage);
    }
  };

  const handleFractionalizeDomain = async (domainId: string, fractionCount: string, pricePerFraction: string) => {
    if (!contractService || !isConnected) {
      showError('Wallet Required', 'Please connect your wallet to fractionalize domains');
      return;
    }

    try {
      // In production, this would interact with Doma Protocol fractionalization contracts
      showSuccess('Domain Fractionalized', `Domain has been split into ${fractionCount} fractions`);
      await loadTokenizedDomains();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Fractionalization failed';
      showError('Fractionalization Failed', errorMessage);
    }
  };

  const handleBuyFractions = async (domainId: string, fractionCount: string) => {
    if (!contractService || !isConnected) {
      showError('Wallet Required', 'Please connect your wallet to buy fractions');
      return;
    }

    try {
      // In production, this would interact with Doma Protocol marketplace
      showSuccess('Fractions Purchased', `Successfully purchased ${fractionCount} fractions`);
      await loadTokenizedDomains();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Purchase failed';
      showError('Purchase Failed', errorMessage);
    }
  };

  const handleBridgeDomain = async (domainId: string, targetChainId: number) => {
    if (!contractService || !isConnected) {
      showError('Wallet Required', 'Please connect your wallet to bridge domains');
      return;
    }

    try {
      // In production, this would interact with Doma Protocol bridging contracts
      showSuccess('Domain Bridged', `Domain successfully bridged to chain ${targetChainId}`);
      await loadTokenizedDomains();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Bridge failed';
      showError('Bridge Failed', errorMessage);
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

  const getComplianceStatus = (compliance: ComplianceInfo) => {
    if (!compliance.icannCompliant) return { status: 'Non-compliant', color: 'text-red-600' };
    if (compliance.transferLock) return { status: 'Transfer Locked', color: 'text-yellow-600' };
    if (compliance.disputeStatus === 'pending') return { status: 'Dispute Pending', color: 'text-orange-600' };
    return { status: 'Fully Compliant', color: 'text-green-600' };
  };

  const filteredDomains = tokenizedDomains.filter(domain => {
    const matchesSearch = domain.domainName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChain = filterChain === 'all' || domain.chainId.toString() === filterChain;
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
          Domain Tokenization Marketplace
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover, trade, and manage tokenized domains with full ICANN compliance and cross-chain functionality
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">1,247</div>
            <div className="text-sm text-muted-foreground">Tokenized Domains</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">$45.2M</div>
            <div className="text-sm text-muted-foreground">Total Market Cap</div>
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
            <div className="text-3xl font-bold text-orange-600 mb-2">156</div>
            <div className="text-sm text-muted-foreground">Fractionalized Domains</div>
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
            <Dialog open={showTokenizeDialog} onOpenChange={setShowTokenizeDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tokenize Domain
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tokenize Your Domain</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="domain-name">Domain Name</Label>
                    <Input id="domain-name" placeholder="e.g., mydomain.eth" />
                  </div>
                  <div>
                    <Label htmlFor="target-chain">Target Chain</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select chain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Ethereum</SelectItem>
                        <SelectItem value="137">Polygon</SelectItem>
                        <SelectItem value="8453">Base</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Your domain will remain fully ICANN compliant and functional after tokenization.
                    </AlertDescription>
                  </Alert>
                  <Button className="w-full" onClick={() => handleTokenizeDomain('mydomain.eth')}>
                    Start Tokenization
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Domain Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDomains.map((domain) => (
          <Card key={domain.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedDomain(domain)}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-blue-600">{domain.domainName}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getRarityColor(domain.attributes[0]?.rarity || 'common')}>
                      {domain.attributes[0]?.rarity || 'common'}
                    </Badge>
                    {domain.isFractionalized && (
                      <Badge className="bg-pink-100 text-pink-800">
                        <PieChart className="h-3 w-3 mr-1" />
                        Fractionalized
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{domain.currentPrice} {domain.currency}</div>
                  <div className={`text-sm ${domain.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {domain.priceChange24h >= 0 ? '+' : ''}{domain.priceChange24h}%
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm line-clamp-2">{domain.domainDescription}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Market Cap</span>
                  <span className="font-semibold">${domain.marketCap || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>24h Volume</span>
                  <span className="font-semibold">{domain.volume24h} {domain.currency}</span>
                </div>
                {domain.isFractionalized && (
                  <div className="flex justify-between text-sm">
                    <span>Available Fractions</span>
                    <span className="font-semibold">{domain.availableFractions}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className={getComplianceStatus(domain.compliance).color}>
                    {getComplianceStatus(domain.compliance).status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>Chain {domain.chainId}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                {domain.isFractionalized ? (
                  <Button variant="outline" size="sm" onClick={() => handleBuyFractions(domain.id, '10')}>
                    Buy Fractions
                  </Button>
                ) : (
                  <Button variant="outline" size="sm">
                    Make Offer
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Domain Detail Modal */}
      {selectedDomain && (
        <Dialog open={!!selectedDomain} onOpenChange={() => setSelectedDomain(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedDomain.domainName}</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trading">Trading</TabsTrigger>
                <TabsTrigger value="fractions">Fractions</TabsTrigger>
                <TabsTrigger value="synthetic">Synthetic Tokens</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Domain Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Token ID:</span>
                        <span className="font-mono">{selectedDomain.tokenId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contract:</span>
                        <span className="font-mono">{selectedDomain.contractAddress.slice(0, 6)}...{selectedDomain.contractAddress.slice(-4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chain:</span>
                        <span>Ethereum (Chain {selectedDomain.chainId})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Owner:</span>
                        <span className="font-mono">{selectedDomain.owner.slice(0, 6)}...{selectedDomain.owner.slice(-4)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Compliance Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>ICANN Compliant:</span>
                        <Badge className={selectedDomain.compliance.icannCompliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedDomain.compliance.icannCompliant ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Transfer Lock:</span>
                        <Badge className={selectedDomain.compliance.transferLock ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                          {selectedDomain.compliance.transferLock ? 'Locked' : 'Unlocked'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Verification:</span>
                        <Badge className="bg-green-100 text-green-800">
                          {selectedDomain.compliance.verificationStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Domain Attributes</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedDomain.attributes.map((attr, index) => (
                      <Card key={index} className="p-4">
                        <div className="text-sm text-muted-foreground">{attr.trait_type}</div>
                        <div className="font-semibold">{attr.value}</div>
                        {attr.rarity && (
                          <Badge className={`mt-2 ${getRarityColor(attr.rarity)}`}>
                            {attr.rarity}
                          </Badge>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Cross-Chain Availability</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedDomain.crossChainInfo.map((chain, index) => (
                      <Card key={index} className={`p-4 ${chain.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{chain.chainName}</div>
                            <div className="text-sm text-muted-foreground">Chain {chain.chainId}</div>
                          </div>
                          <Badge className={chain.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {chain.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        {chain.isActive && (
                          <div className="mt-2 text-sm">
                            <div>Bridge Fee: {chain.bridgeFee} ETH</div>
                            <div>Est. Time: {chain.estimatedTime}</div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="trading" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-green-600">{selectedDomain.currentPrice} {selectedDomain.currency}</div>
                      <div className="text-sm text-muted-foreground">Current Price</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-blue-600">{selectedDomain.volume24h} {selectedDomain.currency}</div>
                      <div className="text-sm text-muted-foreground">24h Volume</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-purple-600">${selectedDomain.marketCap || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">Market Cap</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Trading History</h3>
                  <div className="space-y-2">
                    {selectedDomain.tradingHistory.length > 0 ? (
                      selectedDomain.tradingHistory.map((trade, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold">{trade.type.toUpperCase()}</div>
                              <div className="text-sm text-muted-foreground">
                                {trade.price} {trade.currency} • {new Date(trade.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-mono">{trade.buyer.slice(0, 6)}...{trade.buyer.slice(-4)}</div>
                              <div className="text-xs text-muted-foreground">Buyer</div>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">No trading history available</div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fractions" className="space-y-6">
                {selectedDomain.isFractionalized ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardContent className="p-6 text-center">
                          <div className="text-3xl font-bold text-pink-600">{selectedDomain.totalSupply}</div>
                          <div className="text-sm text-muted-foreground">Total Fractions</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6 text-center">
                          <div className="text-3xl font-bold text-blue-600">{selectedDomain.availableFractions}</div>
                          <div className="text-sm text-muted-foreground">Available</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6 text-center">
                          <div className="text-3xl font-bold text-green-600">{selectedDomain.pricePerFraction} {selectedDomain.currency}</div>
                          <div className="text-sm text-muted-foreground">Price per Fraction</div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Fraction Owners</h3>
                      <div className="space-y-2">
                        {selectedDomain.fractionalOwners.map((owner, index) => (
                          <Card key={index} className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-mono">{owner.address.slice(0, 6)}...{owner.address.slice(-4)}</div>
                                <div className="text-sm text-muted-foreground">
                                  {owner.fractionCount} fractions ({owner.percentage}%)
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{owner.percentage}%</div>
                                <div className="text-sm text-muted-foreground">Ownership</div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button onClick={() => handleBuyFractions(selectedDomain.id, '10')}>
                        Buy 10 Fractions
                      </Button>
                      <Button variant="outline">
                        Buy Custom Amount
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Not Fractionalized</h3>
                    <p className="text-muted-foreground mb-4">This domain is not currently fractionalized</p>
                    <Dialog open={showFractionalizeDialog} onOpenChange={setShowFractionalizeDialog}>
                      <DialogTrigger asChild>
                        <Button>Fractionalize Domain</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Fractionalize {selectedDomain.domainName}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="fraction-count">Number of Fractions</Label>
                            <Input id="fraction-count" placeholder="1000" />
                          </div>
                          <div>
                            <Label htmlFor="price-per-fraction">Price per Fraction</Label>
                            <Input id="price-per-fraction" placeholder="1.25" />
                          </div>
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Once fractionalized, you will retain control but share ownership with fraction holders.
                            </AlertDescription>
                          </Alert>
                          <Button 
                            className="w-full" 
                            onClick={() => handleFractionalizeDomain(selectedDomain.id, '1000', '1.25')}
                          >
                            Start Fractionalization
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="synthetic" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Synthetic Tokens</h3>
                  <p className="text-muted-foreground">
                    These tokens represent specific rights to the domain, allowing for granular control and trading of domain utilities.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDomain.syntheticTokens.map((token, index) => (
                      <Card key={index} className={`p-4 ${token.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold">{token.name}</div>
                            <div className="text-sm text-muted-foreground">{token.symbol}</div>
                          </div>
                          <Badge className={token.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {token.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{token.description}</p>
                        <div className="flex justify-between items-center text-sm">
                          <span>Price: {token.price} {token.currency}</span>
                          <span>Supply: {token.totalSupply}</span>
                        </div>
                        {token.isActive && (
                          <Button size="sm" className="w-full mt-3">
                            Trade {token.symbol}
                          </Button>
                        )}
                      </Card>
                    ))}
                  </div>

                  {selectedDomain.syntheticTokens.length === 0 && (
                    <div className="text-center py-8">
                      <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Synthetic Tokens</h3>
                      <p className="text-muted-foreground">This domain doesn't have any synthetic tokens yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DomainTokenizationInterface;
