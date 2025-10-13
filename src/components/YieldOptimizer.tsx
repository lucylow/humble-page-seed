import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, TrendingUp, Shield, DollarSign, Percent, Clock } from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';

interface YieldStrategy {
  name: string;
  apy: number;
  riskLevel: number;
  minLockup: number;
  description: string;
  tvl: number;
}

const YieldOptimizer: React.FC = () => {
  const { isConnected } = useWalletStore();
  const [amount, setAmount] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [loading, setLoading] = useState(false);

  const strategies: YieldStrategy[] = [
    {
      name: 'conservative',
      apy: 7.5,
      riskLevel: 2,
      minLockup: 1000,
      description: 'Low-risk stable coin farming with established protocols',
      tvl: 250000
    },
    {
      name: 'balanced',
      apy: 12.8,
      riskLevel: 5,
      minLockup: 500,
      description: 'Mixed strategy with diversified yield opportunities',
      tvl: 320000
    },
    {
      name: 'aggressive',
      apy: 25.3,
      riskLevel: 8,
      minLockup: 100,
      description: 'High-yield farming with premium DeFi protocols',
      tvl: 190000
    }
  ];

  const createYieldPosition = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!amount || !selectedStrategy) {
      alert('Please enter amount and select strategy');
      return;
    }

    try {
      setLoading(true);
      // In production, call smart contract:
      // await callPublicFunction({
      //   contractName: 'yield-escrow',
      //   functionName: 'create-yield-position',
      //   functionArgs: [...]
      // });
      
      alert(`Yield position created successfully! Expected APY: ${strategies.find(s => s.name === selectedStrategy)?.apy}%`);
      setAmount('');
      setSelectedStrategy('');
    } catch (error: any) {
      console.error('Failed to create position:', error);
      alert('Failed to create position: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateProjectedYield = (principal: number, apy: number, days: number) => {
    return (principal * (apy / 100) * (days / 365)).toFixed(2);
  };

  const getRiskColor = (level: number) => {
    if (level <= 3) return 'text-green-600 bg-green-100';
    if (level <= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskLabel = (level: number) => {
    if (level <= 3) return 'Low Risk';
    if (level <= 6) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Zap className="w-10 h-10 text-yellow-500" />
          Yield Optimizer
        </h1>
        <p className="text-muted-foreground text-lg">
          Earn 7-25% APY on escrowed funds with automated yield strategies
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Total TVL</p>
                <p className="text-3xl font-bold text-green-900">$760K</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Avg APY</p>
                <p className="text-3xl font-bold text-blue-900">15.2%</p>
              </div>
              <Percent className="w-12 h-12 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Active Positions</p>
                <p className="text-3xl font-bold text-purple-900">124</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Total Earned</p>
                <p className="text-3xl font-bold text-orange-900">$42.8K</p>
              </div>
              <Zap className="w-12 h-12 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Create Position Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Create Yield Position</CardTitle>
            <CardDescription>Start earning passive income</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Amount (sBTC)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Strategy</label>
              <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map((strategy) => (
                    <SelectItem key={strategy.name} value={strategy.name}>
                      {strategy.name.charAt(0).toUpperCase() + strategy.name.slice(1)} - {strategy.apy}% APY
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {amount && selectedStrategy && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Projected Earnings (30 days)</p>
                <p className="text-2xl font-bold text-green-600">
                  {calculateProjectedYield(
                    parseFloat(amount),
                    strategies.find(s => s.name === selectedStrategy)?.apy || 0,
                    30
                  )} sBTC
                </p>
              </div>
            )}

            <Button 
              className="w-full"
              onClick={createYieldPosition}
              disabled={!amount || !selectedStrategy || loading}
            >
              {loading ? 'Creating...' : 'Create Position'}
            </Button>
          </CardContent>
        </Card>

        {/* Strategy Cards */}
        {strategies.map((strategy) => (
          <Card 
            key={strategy.name}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedStrategy === strategy.name ? 'ring-2 ring-purple-600' : ''
            }`}
            onClick={() => setSelectedStrategy(strategy.name)}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="capitalize">{strategy.name}</CardTitle>
                <Badge className={getRiskColor(strategy.riskLevel)}>
                  {getRiskLabel(strategy.riskLevel)}
                </Badge>
              </div>
              <CardDescription>{strategy.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <Percent className="w-6 h-6 text-green-600" />
                  <span className="text-sm text-muted-foreground">APY</span>
                </div>
                <span className="text-3xl font-bold text-green-600">{strategy.apy}%</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Min Lockup:</span>
                  <span className="font-semibold">${strategy.minLockup}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Risk Level:</span>
                  <span className="font-semibold">{strategy.riskLevel}/10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVL:</span>
                  <span className="font-semibold">${(strategy.tvl / 1000).toFixed(0)}K</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Example Returns
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">30 days (1 sBTC):</span>
                    <span className="text-green-600 font-semibold">
                      +{calculateProjectedYield(1, strategy.apy, 30)} sBTC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">90 days (1 sBTC):</span>
                    <span className="text-green-600 font-semibold">
                      +{calculateProjectedYield(1, strategy.apy, 90)} sBTC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1 year (1 sBTC):</span>
                    <span className="text-green-600 font-semibold">
                      +{calculateProjectedYield(1, strategy.apy, 365)} sBTC
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Your Active Positions</CardTitle>
          <CardDescription>Manage your yield farming positions</CardDescription>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="text-center py-8 text-muted-foreground">
              No active positions. Create one above to start earning!
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Connect your wallet to view positions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default YieldOptimizer;

