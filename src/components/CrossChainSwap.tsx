import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownUp, Coins, Zap, AlertCircle, TrendingUp } from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';

interface Token {
  symbol: string;
  name: string;
  balance: number;
  icon: string;
}

interface Chain {
  name: string;
  icon: string;
  status: 'active' | 'maintenance';
}

const CrossChainSwap: React.FC = () => {
  const { isConnected } = useWalletStore();
  const [fromToken, setFromToken] = useState('STX');
  const [toToken, setToToken] = useState('BTC');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromChain, setFromChain] = useState('stacks');
  const [toChain, setToChain] = useState('bitcoin');
  const [loading, setLoading] = useState(false);

  const tokens: Token[] = [
    { symbol: 'STX', name: 'Stacks', balance: 1250.50, icon: '🔷' },
    { symbol: 'BTC', name: 'Bitcoin', balance: 0.5, icon: '₿' },
    { symbol: 'sBTC', name: 'Stacks Bitcoin', balance: 0.25, icon: '🟠' },
    { symbol: 'USDC', name: 'USD Coin', balance: 5000, icon: '💵' },
    { symbol: 'ETH', name: 'Ethereum', balance: 2.5, icon: '⟠' }
  ];

  const chains: Chain[] = [
    { name: 'stacks', icon: '🔷', status: 'active' },
    { name: 'bitcoin', icon: '₿', status: 'active' },
    { name: 'ethereum', icon: '⟠', status: 'active' },
    { name: 'polygon', icon: '🟣', status: 'active' }
  ];

  const calculateSwap = (amount: string) => {
    if (!amount || isNaN(parseFloat(amount))) {
      setToAmount('');
      return;
    }

    // Mock exchange rate calculation
    const rates: { [key: string]: number } = {
      'STX-BTC': 0.00002,
      'BTC-STX': 50000,
      'STX-sBTC': 0.00002,
      'sBTC-STX': 50000,
      'STX-USDC': 1.2,
      'USDC-STX': 0.833,
      'BTC-ETH': 15.5,
      'ETH-BTC': 0.0645
    };

    const rateKey = `${fromToken}-${toToken}`;
    const rate = rates[rateKey] || 1;
    const fee = 0.005; // 0.5% fee
    const result = parseFloat(amount) * rate * (1 - fee);
    setToAmount(result.toFixed(6));
  };

  const executeSwap = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!fromAmount || !toAmount) {
      alert('Please enter an amount');
      return;
    }

    try {
      setLoading(true);
      // In production, call smart contract:
      // await callPublicFunction({
      //   contractName: 'payment-router',
      //   functionName: 'execute-cross-chain-payment',
      //   functionArgs: [...]
      // });
      
      alert(`Swap successful! ${fromAmount} ${fromToken} → ${toAmount} ${toToken}`);
      setFromAmount('');
      setToAmount('');
    } catch (error: any) {
      console.error('Swap failed:', error);
      alert('Swap failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const switchTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    const tempChain = fromChain;
    
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
    setFromChain(toChain);
    setToChain(tempChain);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
          <Coins className="w-10 h-10 text-blue-600" />
          Cross-Chain Swap
        </h1>
        <p className="text-muted-foreground text-lg">
          Seamless multi-asset payments across blockchains
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">24h Volume</p>
                <p className="text-2xl font-bold text-blue-900">$1.2M</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Supported Chains</p>
                <p className="text-2xl font-bold text-green-900">{chains.length}</p>
              </div>
              <Zap className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Avg Fee</p>
                <p className="text-2xl font-bold text-purple-900">0.5%</p>
              </div>
              <Coins className="w-10 h-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Swap Interface */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Swap Tokens</CardTitle>
          <CardDescription>Exchange assets across different blockchains</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* From Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">From</label>
            <div className="grid grid-cols-2 gap-4">
              <Select value={fromChain} onValueChange={setFromChain}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chains.map((chain) => (
                    <SelectItem key={chain.name} value={chain.name}>
                      <span className="flex items-center gap-2">
                        {chain.icon} {chain.name.charAt(0).toUpperCase() + chain.name.slice(1)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={fromToken} onValueChange={setFromToken}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <span className="flex items-center gap-2">
                        {token.icon} {token.symbol}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => {
                  setFromAmount(e.target.value);
                  calculateSwap(e.target.value);
                }}
                step="0.000001"
                className="text-2xl h-16 pr-20"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Badge variant="outline">
                  Balance: {tokens.find(t => t.symbol === fromToken)?.balance.toFixed(4)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Switch Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={switchTokens}
            >
              <ArrowDownUp className="w-6 h-6" />
            </Button>
          </div>

          {/* To Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            <div className="grid grid-cols-2 gap-4">
              <Select value={toChain} onValueChange={setToChain}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chains.map((chain) => (
                    <SelectItem key={chain.name} value={chain.name}>
                      <span className="flex items-center gap-2">
                        {chain.icon} {chain.name.charAt(0).toUpperCase() + chain.name.slice(1)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={toToken} onValueChange={setToToken}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <span className="flex items-center gap-2">
                        {token.icon} {token.symbol}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={toAmount}
                readOnly
                className="text-2xl h-16 bg-muted"
              />
            </div>
          </div>

          {/* Swap Details */}
          {fromAmount && toAmount && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exchange Rate:</span>
                <span className="font-semibold">
                  1 {fromToken} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fee (0.5%):</span>
                <span className="font-semibold">
                  {(parseFloat(fromAmount) * 0.005).toFixed(6)} {fromToken}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Time:</span>
                <span className="font-semibold">~2-5 minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Route:</span>
                <span className="font-semibold text-xs">
                  {fromChain} → Bridge → {toChain}
                </span>
              </div>
            </div>
          )}

          <Button
            className="w-full h-14 text-lg"
            onClick={executeSwap}
            disabled={!fromAmount || !toAmount || loading}
          >
            {loading ? 'Swapping...' : `Swap ${fromToken} → ${toToken}`}
          </Button>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-1">Fast & Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Powered by trusted bridge protocols with instant settlement and low fees
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Coins className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-1">Multi-Chain Support</h3>
                <p className="text-sm text-muted-foreground">
                  Swap between Stacks, Bitcoin, Ethereum, and more blockchains
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!isConnected && (
        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <p className="text-yellow-800">
                Connect your wallet to start swapping tokens
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CrossChainSwap;

