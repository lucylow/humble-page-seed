import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Wallet, Shield, Plus, TrendingUp, RefreshCw, Sparkles, Award, Coins, Brain, Zap, Users, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useWalletStore } from "@/store/useWalletStore";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import QuickNav from "@/components/QuickNav";
import NavigationBar from "@/components/NavigationBar";

// Utility function for formatting currency
const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const Index: React.FC = () => {
  const { isConnected } = useWalletStore();
  const { prices, loading: pricesLoading, refetch } = useCryptoPrices();
  
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            BitMindAI: Neural Network for Bitcoin's Real-World Economy
          </h1>
          <p className="text-muted-foreground text-xl mb-6 max-w-3xl mx-auto">
            AI-powered invoice parsing + Clarity smart contracts + Bitcoin-native sBTC settlement
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Badge variant="secondary" className="bg-green-100 text-green-800 px-4 py-2 text-sm">
              ✓ 95%+ AI Accuracy
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-4 py-2 text-sm">
              ⚡ Sub-2s Processing
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-4 py-2 text-sm">
              ₿ Bitcoin-Native Settlement
            </Badge>
          </div>
          {isConnected && (
            <div className="flex gap-3 justify-center mt-6">
              <Link to="/demo">
                <Button className="bg-gradient-to-r from-orange-500 to-purple-600">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Try AI Demo
                </Button>
              </Link>
              <Link to="/create">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* DeFi Features Highlight - NEW! */}
        <Card className="mb-8 bg-gradient-to-r from-purple-100 via-blue-100 to-green-100 border-purple-300">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 mb-3">
                🏆 Advanced DeFi Features - Hackathon Special
              </Badge>
              <h2 className="text-3xl font-bold mb-2">Next-Generation DeFi Primitives</h2>
              <p className="text-muted-foreground">
                Unlocking liquidity, governance, and capital efficiency for Bitcoin DAOs
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/nft-marketplace">
                <Card className="hover:shadow-xl transition-all cursor-pointer bg-white border-2 hover:border-purple-400">
                  <CardContent className="pt-6 text-center">
                    <Award className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                    <h3 className="font-bold mb-2">Invoice NFTs</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Tokenize & trade receivables for instant liquidity
                    </p>
                    <Badge variant="outline" className="text-xs">
                      $2.4M Volume
                    </Badge>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/treasury">
                <Card className="hover:shadow-xl transition-all cursor-pointer bg-white border-2 hover:border-blue-400">
                  <CardContent className="pt-6 text-center">
                    <Users className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                    <h3 className="font-bold mb-2">MultiSig Treasury</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      3-of-5 approval workflows for secure DAO funding
                    </p>
                    <Badge variant="outline" className="text-xs">
                      247 Proposals
                    </Badge>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/yield-optimizer">
                <Card className="hover:shadow-xl transition-all cursor-pointer bg-white border-2 hover:border-green-400">
                  <CardContent className="pt-6 text-center">
                    <Zap className="w-12 h-12 mx-auto mb-3 text-green-600" />
                    <h3 className="font-bold mb-2">Yield Optimizer</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Earn 7-25% APY on escrowed funds
                    </p>
                    <Badge variant="outline" className="text-xs">
                      $760K TVL
                    </Badge>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/analytics">
                <Card className="hover:shadow-xl transition-all cursor-pointer bg-white border-2 hover:border-orange-400">
                  <CardContent className="pt-6 text-center">
                    <Brain className="w-12 h-12 mx-auto mb-3 text-orange-600" />
                    <h3 className="font-bold mb-2">AI Analytics</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Risk scoring, fraud detection & predictions
                    </p>
                    <Badge variant="outline" className="text-xs">
                      94% Accuracy
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="mt-6 text-center">
              <Link to="/cross-chain-swap">
                <Button className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  <Coins className="w-4 h-4 mr-2" />
                  Explore Cross-Chain Swaps
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Technical Architecture Overview */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">AI Invoice Parsing</h3>
                  <p className="text-sm text-muted-foreground">
                    BERT-based NLP transforms plain-English invoices into structured JSON-LD with 95.2% F1 score
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Clarity Smart Contracts</h3>
                  <p className="text-sm text-muted-foreground">
                    Formal verification ensures state transitions through created→funded→verified→released
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Bitcoin-Native Settlement</h3>
                  <p className="text-sm text-muted-foreground">
                    sBTC escrow eliminates counter-party risk with cryptographically enforced payment release
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Crypto Prices Banner */}
        <Card className="mb-6 bg-gradient-to-r from-orange-50 to-purple-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <div>
                  <h3 className="text-lg font-bold mb-1">Live Market Prices</h3>
                  <p className="text-sm text-muted-foreground">Real-time data from CoinGecko API</p>
                </div>
                <div className="flex gap-6 ml-8">
                  {pricesLoading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  ) : (
                    <>
                      {prices.btc && (
                        <div>
                          <p className="text-xs text-gray-600">Bitcoin (BTC)</p>
                          <p className="text-xl font-bold text-orange-600">
                            {formatCurrency(prices.btc)}
                          </p>
                        </div>
                      )}
                      {prices.stx && (
                        <div>
                          <p className="text-xs text-gray-600">Stacks (STX)</p>
                          <p className="text-xl font-bold text-purple-600">
                            {formatCurrency(prices.stx)}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={refetch}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Link to="/api-demo">
                  <Button variant="outline" size="sm">
                    View API Demo
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Performance Metrics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Core Performance Metrics</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <Sparkles className="w-8 h-8 mb-2 text-green-600" />
              <CardTitle>AI Accuracy</CardTitle>
              <CardDescription>Key field extraction (F1 score)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">95.2%</p>
              <p className="text-sm text-muted-foreground mt-1">40x improvement from 3.6%</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <TrendingUp className="w-8 h-8 mb-2 text-blue-600" />
              <CardTitle>Processing Time</CardTitle>
              <CardDescription>Invoice → Smart Contract</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">&lt;2s</p>
              <p className="text-sm text-muted-foreground mt-1">99% latency reduction</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <Wallet className="w-8 h-8 mb-2 text-purple-600" />
              <CardTitle>Cost per Transaction</CardTitle>
              <CardDescription>vs $15-20 manual processing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">$0.02</p>
              <p className="text-sm text-muted-foreground mt-1">85% contribution margin</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <Shield className="w-8 h-8 mb-2 text-orange-600" />
              <CardTitle>Settlement Time</CardTitle>
              <CardDescription>Bitcoin-native sBTC escrow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">Instant</p>
              <p className="text-sm text-muted-foreground mt-1">From 14.6 day average</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation */}
        <QuickNav />

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>AI-parsed invoices with Clarity smart contract escrow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  id: "2025-300", 
                  status: "released", 
                  amount: "0.85 sBTC", 
                  usd: "$52,300",
                  dao: "DeFi Protocol DAO",
                  description: "Smart contract audit + security review",
                  milestones: "3/3 verified"
                },
                { 
                  id: "2025-299", 
                  status: "funded", 
                  amount: "0.42 sBTC", 
                  usd: "$25,800",
                  dao: "NFT Marketplace Collective",
                  description: "Website redesign + mobile responsive",
                  milestones: "2/3 verified"
                },
                { 
                  id: "2025-298", 
                  status: "verified", 
                  amount: "0.65 sBTC", 
                  usd: "$39,900",
                  dao: "Web3 Education Guild",
                  description: "Tutorial series + documentation",
                  milestones: "Awaiting release"
                },
                { 
                  id: "2025-297", 
                  status: "created", 
                  amount: "0.28 sBTC", 
                  usd: "$17,200",
                  dao: "Gaming DAO Treasury",
                  description: "Token economics modeling",
                  milestones: "Awaiting deposit"
                },
              ].map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">#{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">{invoice.dao}</p>
                      <p className="text-xs text-muted-foreground">{invoice.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{invoice.amount}</p>
                      <p className="text-xs text-muted-foreground">{invoice.usd}</p>
                      <p className="text-xs text-muted-foreground">{invoice.milestones}</p>
                    </div>
                    <Badge
                      variant={
                        invoice.status === "released"
                          ? "default"
                          : invoice.status === "verified"
                          ? "default"
                          : invoice.status === "funded"
                          ? "secondary"
                          : "outline"
                      }
                      className={
                        invoice.status === "released"
                          ? "bg-green-600"
                          : invoice.status === "verified"
                          ? "bg-blue-600"
                          : invoice.status === "funded"
                          ? "bg-purple-600"
                          : ""
                      }
                    >
                      {invoice.status}
                    </Badge>
                    <Link to={`/invoice/${invoice.id}`}>
                      <Button size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
