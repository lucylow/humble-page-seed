import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowDownUp, 
  TrendingUp, 
  Zap, 
  Shield,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Coins
} from 'lucide-react';

interface SwapRoute {
  aggregator: string;
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  fee: number;
  estimatedTime: string;
  slippage: number;
  liquidity: string;
}

const mockSwapRoutes: SwapRoute[] = [
  {
    aggregator: '1inch',
    fromToken: 'USDC',
    toToken: 'sBTC',
    fromAmount: 50000,
    toAmount: 0.8125,
    rate: 61538,
    fee: 0.3,
    estimatedTime: '~2 minutes',
    slippage: 0.5,
    liquidity: 'High'
  },
  {
    aggregator: 'ParaSwap',
    fromToken: 'USDC',
    toToken: 'sBTC',
    fromAmount: 50000,
    toAmount: 0.8098,
    rate: 61728,
    fee: 0.4,
    estimatedTime: '~3 minutes',
    slippage: 0.8,
    liquidity: 'Medium'
  },
  {
    aggregator: 'CoW Swap',
    fromToken: 'USDC',
    toToken: 'sBTC',
    fromAmount: 50000,
    toAmount: 0.8142,
    rate: 61424,
    fee: 0.25,
    estimatedTime: '~5 minutes',
    slippage: 0.3,
    liquidity: 'High'
  },
];

const supportedTokens = [
  { symbol: 'sBTC', name: 'Stacked Bitcoin', icon: '₿', color: 'orange' },
  { symbol: 'STX', name: 'Stacks', icon: 'Ⓢ', color: 'purple' },
  { symbol: 'USDC', name: 'USD Coin', icon: '$', color: 'blue' },
  { symbol: 'USDT', name: 'Tether', icon: '$', color: 'green' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', color: 'indigo' },
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: 'orange' },
];

export const CrossChainSwapPreview: React.FC = () => {
  const [fromToken, setFromToken] = useState('USDC');
  const [toToken, setToToken] = useState('sBTC');
  const [amount, setAmount] = useState('50000');
  const [isLoading, setIsLoading] = useState(false);

  const handleRefreshRates = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  const bestRoute = mockSwapRoutes[0]; // Highest toAmount

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Coins className="w-10 h-10 text-blue-600" />
          Cross-Chain Multi-Asset Swaps
        </h1>
        <p className="text-muted-foreground text-lg">
          Best rates aggregated from leading DEXs and liquidity providers
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Swap Interface */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Swap Tokens</CardTitle>
              <CardDescription>
                Convert between assets with the best available rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* From Token */}
              <div className="space-y-2">
                <Label htmlFor="from-token">From</Label>
                <div className="flex gap-3">
                  <select
                    id="from-token"
                    value={fromToken}
                    onChange={(e) => setFromToken(e.target.value)}
                    className="w-1/3 p-3 border rounded-lg font-semibold"
                  >
                    {supportedTokens.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.icon} {token.symbol}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 text-2xl font-bold"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Balance: 125,432.50 USDC
                </p>
              </div>

              {/* Swap Direction Arrow */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => {
                    const temp = fromToken;
                    setFromToken(toToken);
                    setToToken(temp);
                  }}
                >
                  <ArrowDownUp className="w-5 h-5" />
                </Button>
              </div>

              {/* To Token */}
              <div className="space-y-2">
                <Label htmlFor="to-token">To (estimated)</Label>
                <div className="flex gap-3">
                  <select
                    id="to-token"
                    value={toToken}
                    onChange={(e) => setToToken(e.target.value)}
                    className="w-1/3 p-3 border rounded-lg font-semibold"
                  >
                    {supportedTokens.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.icon} {token.symbol}
                      </option>
                    ))}
                  </select>
                  <div className="flex-1 p-3 border rounded-lg">
                    <p className="text-2xl font-bold">{bestRoute.toAmount}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  1 {fromToken} = {bestRoute.rate.toFixed(2)} {toToken}
                </p>
              </div>

              {/* Swap Details */}
              <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Best Rate From</span>
                  <span className="font-semibold">{bestRoute.aggregator}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span className="font-semibold">${bestRoute.fee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Max Slippage</span>
                  <span className="font-semibold">{bestRoute.slippage}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Time</span>
                  <span className="font-semibold">{bestRoute.estimatedTime}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                  size="lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Swap Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleRefreshRates}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rate Comparison */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Rate Comparison</CardTitle>
                  <CardDescription>
                    Live rates from multiple aggregators
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefreshRates}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockSwapRoutes.map((route, idx) => (
                  <Card 
                    key={idx} 
                    className={`${idx === 0 ? 'border-green-500 border-2' : ''}`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {route.aggregator.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{route.aggregator}</p>
                            <p className="text-xs text-muted-foreground">
                              Liquidity: {route.liquidity}
                            </p>
                          </div>
                        </div>
                        {idx === 0 && (
                          <Badge className="bg-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Best Rate
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">You Get</p>
                          <p className="font-bold">{route.toAmount} {toToken}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Fee</p>
                          <p className="font-bold">${route.fee}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Time</p>
                          <p className="font-bold">{route.estimatedTime}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Info & Benefits */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Why Cross-Chain Swaps?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Best Rates</p>
                  <p className="text-xs text-muted-foreground">
                    Aggregated from top DEXs and liquidity pools
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Multi-Chain Support</p>
                  <p className="text-xs text-muted-foreground">
                    Seamless swaps across Bitcoin, Ethereum, and more
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Low Slippage</p>
                  <p className="text-xs text-muted-foreground">
                    Smart routing minimizes price impact
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Fast Execution</p>
                  <p className="text-xs text-muted-foreground">
                    Swaps complete in minutes, not hours
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Security Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Audited smart contracts</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>MEV protection enabled</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Slippage protection</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Non-custodial swaps</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm mb-1">Note</p>
                  <p className="text-xs text-muted-foreground">
                    This is a preview UI mockup. Full cross-chain integration requires
                    bridge oracle contracts and liquidity provider partnerships.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supported Networks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Bitcoin</Badge>
                <Badge variant="outline">Stacks</Badge>
                <Badge variant="outline">Ethereum</Badge>
                <Badge variant="outline">Polygon</Badge>
                <Badge variant="outline">Avalanche</Badge>
                <Badge variant="outline">Cosmos</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CrossChainSwapPreview;

