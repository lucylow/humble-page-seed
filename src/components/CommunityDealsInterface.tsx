import React, { useState, useEffect, useCallback } from 'react';
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
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  User, 
  Plus,
  Eye,
  Heart,
  Share2,
  CheckCircle,
  AlertCircle,
  Target,
  PieChart,
  Handshake,
  Vote
} from 'lucide-react';

interface CommunityDeal {
  id: string;
  domainName: string;
  domainDescription: string;
  targetPrice: string;
  currency: string;
  currentFunding: string;
  fundingPercentage: number;
  investorCount: number;
  maxInvestors: number;
  deadline: string;
  status: 'active' | 'funded' | 'completed' | 'expired';
  proposer: string;
  investors: Investor[];
  governanceRules: GovernanceRule[];
  createdAt: string;
  imageUrl?: string;
}

interface Investor {
  address: string;
  amount: string;
  percentage: number;
  joinedAt: string;
  avatar?: string;
}

interface GovernanceRule {
  type: 'sale' | 'development' | 'leasing' | 'monetization';
  description: string;
  votingThreshold: number;
}

interface FractionalDomain {
  id: string;
  domainName: string;
  domainDescription: string;
  totalValue: string;
  currency: string;
  fractionalizedValue: string;
  fractionalizationPercentage: number;
  fractionCount: number;
  availableFractions: number;
  pricePerFraction: string;
  revenuePerMonth: string;
  fractionOwners: FractionOwner[];
  status: 'active' | 'fully_fractionalized' | 'sold';
  createdAt: string;
  imageUrl?: string;
}

interface FractionOwner {
  address: string;
  fractionCount: number;
  percentage: number;
  monthlyRevenue: string;
  avatar?: string;
}

const CommunityDealsInterface: React.FC = () => {
  const contractService = useContractService();
  const { showSuccess, showError, showWarning, showTransaction } = useNotificationHelpers();
  const { account, isConnected } = useWeb3();
  
  const [activeTab, setActiveTab] = useState('community-deals');
  const [communityDeals, setCommunityDeals] = useState<CommunityDeal[]>([]);
  const [fractionalDomains, setFractionalDomains] = useState<FractionalDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const [showFractionalize, setShowFractionalize] = useState(false);

  // Mock data - in production, this would come from your backend/contracts
  const mockCommunityDeals: CommunityDeal[] = [
    {
      id: '1',
      domainName: 'cryptoexchange.eth',
      domainDescription: 'Premium domain for cryptocurrency exchange platforms. Highly brandable with significant traffic potential in the growing crypto market.',
      targetPrice: '24.5',
      currency: 'ETH',
      currentFunding: '15.9',
      fundingPercentage: 65,
      investorCount: 17,
      maxInvestors: 25,
      deadline: '2024-02-15T23:59:59Z',
      status: 'active',
      proposer: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      investors: [
        { address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', amount: '2.5', percentage: 10.2, joinedAt: '2024-01-10T10:30:00Z' },
        { address: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c', amount: '1.8', percentage: 7.3, joinedAt: '2024-01-11T14:20:00Z' },
        { address: '0x6fC21092DA55B392b745d0B6c49543c4e30fC2b3', amount: '3.2', percentage: 13.1, joinedAt: '2024-01-12T09:15:00Z' }
      ],
      governanceRules: [
        { type: 'sale', description: 'Minimum 75% approval required for domain sale', votingThreshold: 75 },
        { type: 'development', description: 'Development plans require 60% community approval', votingThreshold: 60 },
        { type: 'leasing', description: 'Leasing agreements need 50% approval', votingThreshold: 50 }
      ],
      createdAt: '2024-01-08T12:00:00Z'
    },
    {
      id: '2',
      domainName: 'nftmarket.eth',
      domainDescription: 'Perfect domain for NFT marketplace platforms. Short, memorable, and highly relevant to the booming NFT ecosystem.',
      targetPrice: '18.75',
      currency: 'ETH',
      currentFunding: '7.9',
      fundingPercentage: 42,
      investorCount: 10,
      maxInvestors: 20,
      deadline: '2024-02-20T23:59:59Z',
      status: 'active',
      proposer: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
      investors: [
        { address: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c', amount: '2.0', percentage: 10.7, joinedAt: '2024-01-15T16:45:00Z' },
        { address: '0x6fC21092DA55B392b745d0B6c49543c4e30fC2b3', amount: '1.5', percentage: 8.0, joinedAt: '2024-01-16T11:30:00Z' }
      ],
      governanceRules: [
        { type: 'sale', description: 'Minimum 80% approval required for domain sale', votingThreshold: 80 },
        { type: 'monetization', description: 'Monetization strategies need 65% approval', votingThreshold: 65 }
      ],
      createdAt: '2024-01-14T08:30:00Z'
    }
  ];

  const mockFractionalDomains: FractionalDomain[] = [
    {
      id: '1',
      domainName: 'defi.eth',
      domainDescription: 'One of the most valuable DeFi domains available. Currently generating revenue through parking and affiliate marketing.',
      totalValue: '950',
      currency: 'ETH',
      fractionalizedValue: '760',
      fractionalizationPercentage: 80,
      fractionCount: 1000,
      availableFractions: 200,
      pricePerFraction: '0.95',
      revenuePerMonth: '12.5',
      fractionOwners: [
        { address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', fractionCount: 150, percentage: 15, monthlyRevenue: '1.875' },
        { address: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c', fractionCount: 100, percentage: 10, monthlyRevenue: '1.25' },
        { address: '0x6fC21092DA55B392b745d0B6c49543c4e30fC2b3', fractionCount: 80, percentage: 8, monthlyRevenue: '1.0' }
      ],
      status: 'active',
      createdAt: '2024-01-05T10:00:00Z'
    },
    {
      id: '2',
      domainName: 'crypto.eth',
      domainDescription: 'Extremely valuable generic domain with massive brand potential. Currently leased to a crypto news platform.',
      totalValue: '1250',
      currency: 'ETH',
      fractionalizedValue: '812.5',
      fractionalizationPercentage: 65,
      fractionCount: 1000,
      availableFractions: 350,
      pricePerFraction: '1.25',
      revenuePerMonth: '18.75',
      fractionOwners: [
        { address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', fractionCount: 200, percentage: 20, monthlyRevenue: '3.75' },
        { address: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c', fractionCount: 150, percentage: 15, monthlyRevenue: '2.81' }
      ],
      status: 'active',
      createdAt: '2024-01-03T14:20:00Z'
    }
  ];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // In production, fetch from your backend/contracts
      setCommunityDeals(mockCommunityDeals);
      setFractionalDomains(mockFractionalDomains);
    } catch (error) {
      showError('Failed to load data', 'Please try again later');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleJoinDeal = async (dealId: string, amount: string) => {
    if (!contractService || !isConnected) {
      showError('Wallet Required', 'Please connect your wallet to join deals');
      return;
    }

    try {
      // In production, this would interact with your smart contracts
      showSuccess('Deal Joined', `Successfully joined deal with ${amount} ETH investment`);
      await loadData();
    } catch (error: unknown) {
      showError('Failed to Join Deal', error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleBuyFractions = async (domainId: string, fractionCount: number) => {
    if (!contractService || !isConnected) {
      showError('Wallet Required', 'Please connect your wallet to buy fractions');
      return;
    }

    try {
      // In production, this would interact with your fractionalization contracts
      showSuccess('Fractions Purchased', `Successfully purchased ${fractionCount} fractions`);
      await loadData();
    } catch (error: unknown) {
      showError('Failed to Buy Fractions', error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'funded': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'fully_fractionalized': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <TrendingUp className="h-4 w-4" />;
      case 'funded': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <Target className="h-4 w-4" />;
      case 'expired': return <AlertCircle className="h-4 w-4" />;
      case 'fully_fractionalized': return <PieChart className="h-4 w-4" />;
      case 'sold': return <DollarSign className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gradient">
          Democratize Domain Ownership
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Join forces with other investors through community deals or own a fraction of premium domains with our fractionalization platform
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => setActiveTab('community-deals')}
            variant={activeTab === 'community-deals' ? 'default' : 'outline'}
            className="px-8"
          >
            <Users className="h-4 w-4 mr-2" />
            Community Deals
          </Button>
          <Button 
            onClick={() => setActiveTab('fractionalization')}
            variant={activeTab === 'fractionalization' ? 'default' : 'outline'}
            className="px-8"
          >
            <PieChart className="h-4 w-4 mr-2" />
            Fractionalization
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">$4.2M</div>
            <div className="text-sm text-muted-foreground">Total Community Deal Value</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-pink-600 mb-2">$12.8M</div>
            <div className="text-sm text-muted-foreground">Total Fractionalized Value</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">1,248</div>
            <div className="text-sm text-muted-foreground">Active Community Investors</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">27%</div>
            <div className="text-sm text-muted-foreground">Average Annual Return</div>
          </CardContent>
        </Card>
      </div>

      {/* Community Deals Tab */}
      {activeTab === 'community-deals' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Community Domain Deals</h2>
            <Dialog open={showCreateDeal} onOpenChange={setShowCreateDeal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Deal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Community Deal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="domain-name">Domain Name</Label>
                    <Input id="domain-name" placeholder="e.g., cryptoexchange.eth" />
                  </div>
                  <div>
                    <Label htmlFor="target-price">Target Price</Label>
                    <Input id="target-price" placeholder="24.5" />
                  </div>
                  <div>
                    <Label htmlFor="max-investors">Max Investors</Label>
                    <Input id="max-investors" placeholder="25" />
                  </div>
                  <div>
                    <Label htmlFor="deadline">Funding Deadline</Label>
                    <Input id="deadline" type="date" />
                  </div>
                  <Button className="w-full">Create Deal Proposal</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {communityDeals.map((deal) => (
              <Card key={deal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-purple-600">{deal.domainName}</CardTitle>
                      <Badge className={`mt-2 ${getStatusColor(deal.status)}`}>
                        {getStatusIcon(deal.status)}
                        <span className="ml-1 capitalize">{deal.status}</span>
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{deal.targetPrice} {deal.currency}</div>
                      <div className="text-sm text-muted-foreground">Target Price</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{deal.domainDescription}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{deal.fundingPercentage}% funded</span>
                      <span>{deal.currentFunding}/{deal.targetPrice} {deal.currency}</span>
                    </div>
                    <Progress value={deal.fundingPercentage} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{deal.investorCount}/{deal.maxInvestors} investors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(deal.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Governance Rules:</h4>
                    {deal.governanceRules.map((rule, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        • {rule.description} ({rule.votingThreshold}% threshold)
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      onClick={() => handleJoinDeal(deal.id, '1.0')}
                      disabled={!isConnected || deal.status !== 'active'}
                    >
                      Join Deal
                    </Button>
                    <Button variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Fractionalization Tab */}
      {activeTab === 'fractionalization' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Domain Fractionalization</h2>
            <Dialog open={showFractionalize} onOpenChange={setShowFractionalize}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Fractionalize Domain
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Fractionalize Your Domain</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fraction-domain">Domain Name</Label>
                    <Input id="fraction-domain" placeholder="e.g., mydomain.eth" />
                  </div>
                  <div>
                    <Label htmlFor="domain-value">Domain Value</Label>
                    <Input id="domain-value" placeholder="100" />
                  </div>
                  <div>
                    <Label htmlFor="fraction-count">Number of Fractions</Label>
                    <Input id="fraction-count" placeholder="1000" />
                  </div>
                  <div>
                    <Label htmlFor="retain-percentage">Percentage to Retain</Label>
                    <Input id="retain-percentage" placeholder="20" />
                  </div>
                  <Button className="w-full">Start Fractionalization</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {fractionalDomains.map((domain) => (
              <Card key={domain.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-pink-600">{domain.domainName}</CardTitle>
                      <Badge className={`mt-2 ${getStatusColor(domain.status)}`}>
                        {getStatusIcon(domain.status)}
                        <span className="ml-1 capitalize">{domain.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{domain.totalValue} {domain.currency}</div>
                      <div className="text-sm text-muted-foreground">Total Value</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{domain.domainDescription}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{domain.fractionalizationPercentage}% fractionalized</span>
                      <span>{domain.fractionalizedValue}/{domain.totalValue} {domain.currency}</span>
                    </div>
                    <Progress value={domain.fractionalizationPercentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-semibold">{domain.pricePerFraction} {domain.currency}</div>
                      <div className="text-muted-foreground">Price per fraction</div>
                    </div>
                    <div>
                      <div className="font-semibold">{domain.revenuePerMonth} {domain.currency}</div>
                      <div className="text-muted-foreground">Monthly revenue</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{domain.fractionOwners.length} fraction owners</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PieChart className="h-4 w-4" />
                      <span>{domain.availableFractions} available</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Top Fraction Owners:</h4>
                    {domain.fractionOwners.slice(0, 3).map((owner, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span>{owner.address.slice(0, 6)}...{owner.address.slice(-4)}</span>
                        <span>{owner.percentage}% ({owner.fractionCount} fractions)</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      onClick={() => handleBuyFractions(domain.id, 10)}
                      disabled={!isConnected || domain.availableFractions === 0}
                    >
                      Buy Fractions
                    </Button>
                    <Button variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* How It Works Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-purple-600 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Community Deals
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p><strong>1. Propose:</strong> Suggest a premium domain for community acquisition</p>
                <p><strong>2. Fund:</strong> Investors pool resources to reach the target price</p>
                <p><strong>3. Own:</strong> Shared ownership through smart contracts</p>
                <p><strong>4. Govern:</strong> Vote on sales, development, and monetization</p>
                <p><strong>5. Profit:</strong> Share returns proportionally</p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-pink-600 flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Fractionalization
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p><strong>1. Fractionalize:</strong> Break domain ownership into tradeable shares</p>
                <p><strong>2. Trade:</strong> Buy and sell fractions on our marketplace</p>
                <p><strong>3. Earn:</strong> Receive proportional revenue from domain monetization</p>
                <p><strong>4. Vote:</strong> Participate in governance decisions</p>
                <p><strong>5. Liquidate:</strong> Sell fractions anytime for liquidity</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityDealsInterface;
