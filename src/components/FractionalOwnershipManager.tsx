import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  Clock,
  Shield,
  Zap,
  BarChart3,
  Activity,
  User
} from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { DomainAsset } from '../types/domain';

interface FractionalOwnershipData {
  domainTokenId: number;
  totalShares: number;
  sharePrice: number;
  minimumInvestment: number;
  buyoutPrice: number;
  buyoutDeadline: string;
  sharesSold: number;
  monthlyRevenue: number;
  totalRevenue: number;
  owner: string;
  fractionalVaultAddress: string;
  isActive: boolean;
}

interface GovernanceProposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  votingDeadline: string;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  status: 'active' | 'passed' | 'failed' | 'executed';
  proposalType: 'sale' | 'development' | 'governance' | 'revenue';
}

interface TradeOrder {
  id: number;
  type: 'buy' | 'sell';
  shares: number;
  pricePerShare: number;
  totalValue: number;
  trader: string;
  status: 'active' | 'filled' | 'cancelled';
  timestamp: string;
}

interface SwapOrder {
  id: number;
  fromToken: string;
  toToken: string;
  amountIn: number;
  expectedOutput: number;
  feeAmount: number;
  minimumOutput: number;
  validUntil: string;
}

const FractionalOwnershipManager: React.FC<{ domain: DomainAsset }> = ({ domain }) => {
  const { account, isConnected } = useWeb3();
  const [fractionalData, setFractionalData] = useState<FractionalOwnershipData | null>(null);
  const [governanceProposals, setGovernanceProposals] = useState<GovernanceProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [tradeOrders, setTradeOrders] = useState<TradeOrder[]>([]);
  const [swapOrders, setSwapOrders] = useState<SwapOrder[]>([]);
  const [userShares, setUserShares] = useState(0);
  const [userRevenue, setUserRevenue] = useState(0);

  // Form states
  const [buyShares, setBuyShares] = useState('');
  const [sellShares, setSellShares] = useState('');
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [swapAmount, setSwapAmount] = useState('');
  const [swapToken, setSwapToken] = useState('ETH');

  useEffect(() => {
    loadFractionalData();
    loadGovernanceData();
    loadTradeData();
  }, [domain.id]);

  const loadFractionalData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data - in production, this would come from smart contracts
      const mockData: FractionalOwnershipData = {
        domainTokenId: parseInt(domain.id),
        totalShares: 1000,
        sharePrice: 0.05,
        minimumInvestment: 0.01,
        buyoutPrice: 75,
        buyoutDeadline: '2024-06-15',
        sharesSold: 650,
        monthlyRevenue: 2.5,
        totalRevenue: 18.75,
        owner: domain.owner,
        fractionalVaultAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        isActive: true
      };

      setFractionalData(mockData);

      // Mock user shares
      if (account) {
        setUserShares(25);
        setUserRevenue(0.625);
      }

    } catch (error) {
      console.error('Error loading fractional data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGovernanceData = async () => {
    const mockProposals: GovernanceProposal[] = [
      {
        id: 1,
        title: 'Increase Marketing Budget',
        description: 'Allocate 2 ETH from revenue for domain marketing and SEO optimization',
        proposer: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        votingDeadline: '2024-02-20',
        votesFor: 450,
        votesAgainst: 120,
        totalVotes: 570,
        status: 'active',
        proposalType: 'development'
      },
      {
        id: 2,
        title: 'Domain Sale Offer - 100 ETH',
        description: 'Accept offer of 100 ETH for the domain from buyer 0x5A0b...',
        proposer: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
        votingDeadline: '2024-02-25',
        votesFor: 200,
        votesAgainst: 350,
        totalVotes: 550,
        status: 'active',
        proposalType: 'sale'
      }
    ];

    setGovernanceProposals(mockProposals);
  };

  const loadTradeData = async () => {
    const mockTradeOrders: TradeOrder[] = [
      {
        id: 1,
        type: 'buy',
        shares: 10,
        pricePerShare: 0.052,
        totalValue: 0.52,
        trader: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        status: 'active',
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        type: 'sell',
        shares: 5,
        pricePerShare: 0.048,
        totalValue: 0.24,
        trader: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
        status: 'active',
        timestamp: '2024-01-15T09:20:00Z'
      }
    ];

    setTradeOrders(mockTradeOrders);

    const mockSwapOrders: SwapOrder[] = [
      {
        id: 1,
        fromToken: 'DOMAIN_SHARES',
        toToken: 'ETH',
        amountIn: 10,
        expectedOutput: 0.48,
        feeAmount: 0.02,
        minimumOutput: 0.46,
        validUntil: '2024-02-15'
      }
    ];

    setSwapOrders(mockSwapOrders);
  };

  const handleBuyShares = async () => {
    if (!isConnected || !fractionalData) return;

    try {
      const sharesToBuy = parseInt(buyShares);
      const totalCost = sharesToBuy * fractionalData.sharePrice;

      console.log(`Buying ${sharesToBuy} shares for ${totalCost} ETH`);
      
      // Mock contract interaction
      setUserShares(prev => prev + sharesToBuy);
      setBuyShares('');
      
    } catch (error) {
      console.error('Error buying shares:', error);
    }
  };

  const handleSellShares = async () => {
    if (!isConnected || !fractionalData) return;

    try {
      const sharesToSell = parseInt(sellShares);
      const totalValue = sharesToSell * fractionalData.sharePrice * 0.97; // 3% fee
      
      console.log(`Selling ${sharesToSell} shares for ${totalValue} ETH`);
      
      // Mock contract interaction
      setUserShares(prev => prev - sharesToSell);
      setSellShares('');
      
    } catch (error) {
      console.error('Error selling shares:', error);
    }
  };

  const handleVote = async (proposalId: number, vote: 'for' | 'against') => {
    if (!isConnected) return;

    try {
      console.log(`Voting ${vote} on proposal ${proposalId}`);
      
      // Mock contract interaction - update proposal votes
      setGovernanceProposals(prev => prev.map(proposal => 
        proposal.id === proposalId 
          ? {
              ...proposal,
              votesFor: vote === 'for' ? proposal.votesFor + userShares : proposal.votesFor,
              votesAgainst: vote === 'against' ? proposal.votesAgainst + userShares : proposal.votesAgainst,
              totalVotes: proposal.totalVotes + userShares
            }
          : proposal
      ));
      
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleCreateProposal = async () => {
    if (!isConnected || !proposalTitle.trim() || !proposalDescription.trim()) return;

    try {
      const newProposal: GovernanceProposal = {
        id: governanceProposals.length + 1,
        title: proposalTitle,
        description: proposalDescription,
        proposer: account!,
        votingDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        votesFor: 0,
        votesAgainst: 0,
        totalVotes: 0,
        status: 'active',
        proposalType: 'governance'
      };

      setGovernanceProposals(prev => [...prev, newProposal]);
      setProposalTitle('');
      setProposalDescription('');
      
    } catch (error) {
      console.error('Error creating proposal:', error);
    }
  };

  const handleSwap = async () => {
    if (!isConnected || !swapAmount) return;

    try {
      const amount = parseFloat(swapAmount);
      console.log(`Swapping ${amount} shares for ${swapToken}`);
      
      // Mock swap logic
      setSwapAmount('');
      
    } catch (error) {
      console.error('Error swapping:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!fractionalData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">This domain is not available for fractional ownership.</p>
        </CardContent>
      </Card>
    );
  }

  const ownershipPercentage = fractionalData.sharesSold / fractionalData.totalShares * 100;
  const userOwnershipPercentage = userShares / fractionalData.totalShares * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Fractional Ownership: {domain.fullName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {fractionalData.sharePrice} ETH
              </div>
              <div className="text-sm text-muted-foreground">Price per Share</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {fractionalData.sharesSold}/{fractionalData.totalShares}
              </div>
              <div className="text-sm text-muted-foreground">Shares Sold</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {fractionalData.monthlyRevenue} ETH
              </div>
              <div className="text-sm text-muted-foreground">Monthly Revenue</div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Ownership Progress</span>
              <span>{ownershipPercentage.toFixed(1)}% Sold</span>
            </div>
            <Progress value={ownershipPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* User Portfolio */}
      {isConnected && userShares > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{userShares}</div>
                <div className="text-xs text-muted-foreground">Shares Owned</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {userOwnershipPercentage.toFixed(2)}%
                </div>
                <div className="text-xs text-muted-foreground">Ownership</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {userRevenue} ETH
                </div>
                <div className="text-xs text-muted-foreground">Monthly Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {(userShares * fractionalData.sharePrice).toFixed(3)} ETH
                </div>
                <div className="text-xs text-muted-foreground">Portfolio Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Buy Shares */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Buy Shares
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="buy-shares">Number of Shares</Label>
                  <Input
                    id="buy-shares"
                    type="number"
                    placeholder="Enter shares to buy"
                    value={buyShares}
                    onChange={(e) => setBuyShares(e.target.value)}
                  />
                </div>
                {buyShares && (
                  <div className="text-sm text-muted-foreground">
                    Total Cost: {(parseInt(buyShares) * fractionalData.sharePrice).toFixed(3)} ETH
                  </div>
                )}
                <Button
                  onClick={handleBuyShares}
                  disabled={!isConnected || !buyShares}
                  className="w-full"
                >
                  Buy Shares
                </Button>
              </CardContent>
            </Card>

            {/* Sell Shares */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Sell Shares
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sell-shares">Number of Shares</Label>
                  <Input
                    id="sell-shares"
                    type="number"
                    placeholder="Enter shares to sell"
                    value={sellShares}
                    onChange={(e) => setSellShares(e.target.value)}
                    max={userShares}
                  />
                </div>
                {sellShares && (
                  <div className="text-sm text-muted-foreground">
                    You'll receive: {(parseInt(sellShares) * fractionalData.sharePrice * 0.97).toFixed(3)} ETH
                    <div className="text-xs">3% platform fee included</div>
                  </div>
                )}
                <Button
                  onClick={handleSellShares}
                  disabled={!isConnected || !sellShares || parseInt(sellShares) > userShares}
                  className="w-full"
                  variant="outline"
                >
                  Sell Shares
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Domain Information */}
          <Card>
            <CardHeader>
              <CardTitle>Domain Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Domain Name</div>
                  <div className="font-medium">{domain.fullName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Owner</div>
                  <div className="font-mono text-sm">{fractionalData.owner}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Fractional Vault</div>
                  <div className="font-mono text-sm">{fractionalData.fractionalVaultAddress}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                  <div className="font-medium">{fractionalData.totalRevenue} ETH</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trading Tab */}
        <TabsContent value="trading" className="space-y-6">
          {/* Active Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Active Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tradeOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant={order.type === 'buy' ? 'default' : 'secondary'}>
                        {order.type.toUpperCase()}
                      </Badge>
                      <div>
                        <div className="font-medium">{order.shares} shares @ {order.pricePerShare} ETH</div>
                        <div className="text-sm text-muted-foreground">
                          Total: {order.totalValue} ETH
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.timestamp).toLocaleString()}
                      </div>
                      <Badge variant="outline">{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cross-Chain Swaps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Cross-Chain Swaps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="swap-amount">Amount</Label>
                  <Input
                    id="swap-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="swap-token">To Token</Label>
                  <select
                    id="swap-token"
                    value={swapToken}
                    onChange={(e) => setSwapToken(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="ETH">ETH</option>
                    <option value="USDC">USDC</option>
                    <option value="DAI">DAI</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSwap} disabled={!isConnected || !swapAmount} className="w-full">
                    Swap
                  </Button>
                </div>
              </div>
              
              {/* Swap Orders */}
              <div className="space-y-2">
                {swapOrders.map((order) => (
                  <div key={order.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {order.amountIn} Shares → {order.expectedOutput} {order.toToken}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Min Output: {order.minimumOutput} {order.toToken}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        Valid until {order.validUntil}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Governance Tab */}
        <TabsContent value="governance" className="space-y-6">
          {/* Create Proposal */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Proposal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="proposal-title">Title</Label>
                <Input
                  id="proposal-title"
                  placeholder="Enter proposal title"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="proposal-description">Description</Label>
                <textarea
                  id="proposal-description"
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Describe your proposal"
                  value={proposalDescription}
                  onChange={(e) => setProposalDescription(e.target.value)}
                />
              </div>
              <Button
                onClick={handleCreateProposal}
                disabled={!isConnected || !proposalTitle.trim() || !proposalDescription.trim()}
              >
                Create Proposal
              </Button>
            </CardContent>
          </Card>

          {/* Active Proposals */}
          <div className="space-y-4">
            {governanceProposals.map((proposal) => (
              <Card key={proposal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{proposal.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={proposal.status === 'active' ? 'default' : 'secondary'}>
                          {proposal.status}
                        </Badge>
                        <Badge variant="outline">{proposal.proposalType}</Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      Deadline: {proposal.votingDeadline}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{proposal.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>For: {proposal.votesFor}</span>
                      <span>Against: {proposal.votesAgainst}</span>
                    </div>
                    <Progress 
                      value={(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  {proposal.status === 'active' && isConnected && userShares > 0 && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleVote(proposal.id, 'for')}
                        size="sm"
                        className="flex-1"
                      >
                        Vote For ({userShares} shares)
                      </Button>
                      <Button
                        onClick={() => handleVote(proposal.id, 'against')}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Vote Against
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{fractionalData.totalRevenue} ETH</div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{Math.floor(fractionalData.sharesSold / 10)}</div>
                <div className="text-sm text-muted-foreground">Shareholders</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">12%</div>
                <div className="text-sm text-muted-foreground">Annual Yield</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">+8.5%</div>
                <div className="text-sm text-muted-foreground">Price Change (30d)</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Shareholders (80%)</span>
                  <span>{(fractionalData.monthlyRevenue * 0.8).toFixed(2)} ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Domain Owner (15%)</span>
                  <span>{(fractionalData.monthlyRevenue * 0.15).toFixed(2)} ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Platform Fee (5%)</span>
                  <span>{(fractionalData.monthlyRevenue * 0.05).toFixed(2)} ETH</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FractionalOwnershipManager;