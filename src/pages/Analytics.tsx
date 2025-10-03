import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useDoma } from '@/contexts/DomaContext';
import { useMetrics } from '@/contexts/MetricsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Analytics: React.FC = () => {
  const { isConnected, connectWallet, account } = useWeb3();
  const { marketplaceDomains, userDomains } = useDoma();
  const { metrics } = useMetrics();
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for charts and analytics
  const generateMockData = (days: number) => {
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        transactions: Math.floor(Math.random() * 50) + 10,
        volume: Math.floor(Math.random() * 100) + 20,
        users: Math.floor(Math.random() * 30) + 5,
        revenue: Math.floor(Math.random() * 5000) + 1000,
      });
    }
    return data;
  };

  const chartData = generateMockData(timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90);

  const totalVolume = marketplaceDomains.reduce((sum, domain) => sum + parseFloat(domain.price), 0);
  const avgPrice = totalVolume / marketplaceDomains.length || 0;
  const totalUsers = new Set(marketplaceDomains.map(d => d.owner)).size;

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">        
        <Card className="w-full max-w-md bg-card border border-border shadow-lg relative z-10">
          <CardHeader className="text-center pb-6">
            <div className="mb-4">
              <span className="text-4xl animate-float">📊</span>
            </div>
            <CardTitle className="text-2xl text-foreground">
              DomainFi Analytics
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Connect your wallet to view detailed analytics and insights
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
              Access comprehensive analytics and growth metrics
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold text-black dark:text-white">
              DomainFi Analytics
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Connected: {account?.slice(0, 6)}...{account?.slice(-4)}</span>
              </div>
              <Badge variant="outline" className="px-3 py-1">
                Real-time Data
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 bg-background/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                setIsLoading(true);
                // Simulate data refresh
                setTimeout(() => {
                  setIsLoading(false);
                  // You could add a toast notification here
                }, 2000);
              }}
              variant="outline"
              size="sm"
              className="hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              ) : (
                <span>🔄</span>
              )}
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group relative overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Total Volume
              </CardTitle>
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300 animate-float">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-all duration-300">
                {totalVolume.toFixed(2)} ETH
              </div>
              <div className="flex items-center gap-2 text-xs mt-2">
                <span className="flex items-center font-medium text-emerald-500 group-hover:scale-105 transition-transform duration-300">
                  <span className="mr-1">↗</span>
                  +24.5%
                </span>
                <span className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                  vs last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Active Users
              </CardTitle>
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300 animate-float" style={{animationDelay: '0.5s'}}>👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-all duration-300">
                {totalUsers}
              </div>
              <div className="flex items-center gap-2 text-xs mt-2">
                <span className="flex items-center font-medium text-emerald-500 group-hover:scale-105 transition-transform duration-300">
                  <span className="mr-1">↗</span>
                  +18.2%
                </span>
                <span className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                  this month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Avg Price
              </CardTitle>
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300 animate-float" style={{animationDelay: '1s'}}>📊</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-all duration-300">
                {avgPrice.toFixed(3)} ETH
              </div>
              <div className="flex items-center gap-2 text-xs mt-2">
                <span className="flex items-center font-medium text-emerald-500 group-hover:scale-105 transition-transform duration-300">
                  <span className="mr-1">↗</span>
                  +12.8%
                </span>
                <span className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                  vs last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Protocol Revenue
              </CardTitle>
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300 animate-float" style={{animationDelay: '1.5s'}}>🏦</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-all duration-300">
                ${metrics.totalRevenue.toFixed(0)}
              </div>
              <div className="flex items-center gap-2 text-xs mt-2">
                <span className="flex items-center font-medium text-emerald-500 group-hover:scale-105 transition-transform duration-300">
                  <span className="mr-1">↗</span>
                  +35.7%
                </span>
                <span className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                  this quarter
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-background/50 backdrop-blur-sm border border-border/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Overview
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Users
            </TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Revenue
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Volume Chart */}
              <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">📈</span>
                    Trading Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {chartData.map((item, index) => (
                      <div key={index} className="flex flex-col items-center gap-2 flex-1 group">
                        <div 
                          className="w-full bg-gradient-to-t from-primary to-secondary rounded-t transition-all duration-500 hover:from-primary/80 hover:to-secondary/80 cursor-pointer hover:scale-105 relative"
                          style={{ height: `${(item.volume / Math.max(...chartData.map(d => d.volume))) * 200}px` }}
                          title={`Volume: ${item.volume} ETH`}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                            {item.volume} ETH
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Transaction Chart */}
              <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">🔄</span>
                    Daily Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {chartData.map((item, index) => (
                      <div key={index} className="flex flex-col items-center gap-2 flex-1">
                        <div 
                          className="w-full bg-gradient-to-t from-secondary to-accent rounded-t transition-all duration-500 hover:from-secondary/80 hover:to-accent/80"
                          style={{ height: `${(item.transactions / Math.max(...chartData.map(d => d.transactions))) * 200}px` }}
                        ></div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">📋</span>
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.slice(-5).map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border/30">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <div>
                          <div className="font-medium">{item.transactions} transactions</div>
                          <div className="text-sm text-muted-foreground">{item.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{item.volume} ETH</div>
                        <div className="text-sm text-muted-foreground">Volume</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">👥</span>
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {chartData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 flex-1">
                      <div 
                        className="w-full bg-gradient-to-t from-accent to-primary rounded-t transition-all duration-500 hover:from-accent/80 hover:to-primary/80"
                        style={{ height: `${(item.users / Math.max(...chartData.map(d => d.users))) * 200}px` }}
                      ></div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  Revenue Projections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-lg border border-emerald-500/20">
                      <div className="text-2xl font-bold text-emerald-600">${metrics.projectedRevenue.toFixed(0)}</div>
                      <div className="text-sm text-muted-foreground">Monthly Projection</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20">
                      <div className="text-2xl font-bold text-blue-600">${(metrics.projectedRevenue * 12).toFixed(0)}</div>
                      <div className="text-sm text-muted-foreground">Annual Projection</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20">
                      <div className="text-2xl font-bold text-purple-600">+{((metrics.projectedRevenue / metrics.totalRevenue - 1) * 100).toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Growth Rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
