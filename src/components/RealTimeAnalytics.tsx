import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Users, 
  Globe,
  Zap,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { aiValuationService, ValuationResponse } from '../services/aiValuationService';

interface MarketData {
  timestamp: string;
  totalMarketCap: number;
  totalDomains: number;
  activeTraders: number;
  transactionVolume: number;
  avgDomainValue: number;
  networkHealth: {
    successRate: number;
    avgConfirmationTime: number;
    networkCongestion: number;
  };
}

interface PortfolioData {
  totalValue: number;
  totalDomains: number;
  totalShares: number;
  valueChange24h: number;
  valueChange7d: number;
  valueChange30d: number;
  topPerformers: Array<{
    domain: string;
    value: number;
    change: number;
    changePercent: number;
  }>;
  recentTransactions: Array<{
    type: string;
    domain: string;
    amount: number;
    timestamp: string;
  }>;
}

interface TrendData {
  domain: string;
  value: number;
  change: number;
  changePercent: number;
  volume: number;
  liquidity: number;
}

const RealTimeAnalytics: React.FC = () => {
  const { account, isConnected } = useWeb3();
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [trendingDomains, setTrendingDomains] = useState<TrendData[]>([]);
  const [marketSentiment, setMarketSentiment] = useState<'bullish' | 'bearish' | 'neutral'>('neutral');
  const [isLoading, setIsLoading] = useState(true);
  
  // Chart refs
  const marketCapChartRef = useRef<SVGSVGElement>(null);
  const portfolioChartRef = useRef<SVGSVGElement>(null);
  const volumeChartRef = useRef<SVGSVGElement>(null);
  const networkHealthChartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (isConnected) {
      fetchAnalyticsData();
      const interval = setInterval(fetchAnalyticsData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected, account]);

  useEffect(() => {
    if (marketData) {
      renderMarketCapChart();
      renderVolumeChart();
      renderNetworkHealthChart();
    }
  }, [marketData]);

  useEffect(() => {
    if (portfolioData) {
      renderPortfolioChart();
    }
  }, [portfolioData]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch market data
      const marketResponse = await fetch('/api/analytics/market');
      const marketData = await marketResponse.json();
      setMarketData(marketData);

      // Fetch portfolio data if connected
      if (account) {
        const portfolioResponse = await fetch(`/api/analytics/portfolio/${account}`);
        const portfolioData = await portfolioResponse.json();
        setPortfolioData(portfolioData);
      }

      // Fetch trending domains
      const trendsResponse = await fetch('/api/analytics/trends');
      const trendsData = await trendsResponse.json();
      setTrendingDomains(trendsData.trending);

      // Fetch market sentiment
      const sentimentResponse = await aiValuationService.getMarketSentiment('24h');
      setMarketSentiment(sentimentResponse.overallSentiment);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMarketCapChart = () => {
    if (!marketCapChartRef.current || !marketData) return;

    const svg = d3.select(marketCapChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 200;
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, marketData.totalMarketCap * 1.2])
      .range([height - margin.bottom, margin.top]);

    // Create line generator
    const line = d3.line<number>()
      .x((d, i) => xScale(i * 10))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX);

    // Generate sample data
    const data = Array.from({ length: 11 }, (_, i) => 
      marketData.totalMarketCap * (0.8 + Math.random() * 0.4)
    );

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}%`));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => `$${(d / 1000000).toFixed(1)}M`));

    // Add line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add area
    svg.append("path")
      .datum(data)
      .attr("fill", "url(#gradient)")
      .attr("d", d3.area<number>()
        .x((d, i) => xScale(i * 10))
        .y0(height - margin.bottom)
        .y1(d => yScale(d))
        .curve(d3.curveMonotoneX)
      );

    // Add gradient
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", height - margin.bottom)
      .attr("x2", 0).attr("y2", margin.top);

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3b82f6")
      .attr("stop-opacity", 0.3);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3b82f6")
      .attr("stop-opacity", 0);
  };

  const renderPortfolioChart = () => {
    if (!portfolioChartRef.current || !portfolioData) return;

    const svg = d3.select(portfolioChartRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 200;
    const radius = Math.min(width, height) / 2 - 10;

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Create pie chart data
    const pieData = [
      { label: 'Domains', value: portfolioData.totalDomains, color: '#3b82f6' },
      { label: 'Shares', value: portfolioData.totalShares, color: '#10b981' },
      { label: 'Liquidity', value: portfolioData.totalValue * 0.1, color: '#f59e0b' }
    ];

    const pie = d3.pie<typeof pieData[0]>()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<typeof pieData[0]>>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = g.selectAll(".arc")
      .data(pie(pieData))
      .enter().append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => d.data.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Add labels
    arcs.append("text")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#fff")
      .text(d => d.data.label);
  };

  const renderVolumeChart = () => {
    if (!volumeChartRef.current || !marketData) return;

    const svg = d3.select(volumeChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 150;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    // Generate sample volume data
    const data = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      volume: marketData.transactionVolume * (0.5 + Math.random() * 1.0)
    }));

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.hour.toString()))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.volume) || 0])
      .range([height - margin.bottom, margin.top]);

    // Add bars
    svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.hour.toString()) || 0)
      .attr("y", d => yScale(d.volume))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - margin.bottom - yScale(d.volume))
      .attr("fill", "#10b981")
      .attr("opacity", 0.8);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}h`));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => `$${(d / 1000).toFixed(0)}K`));
  };

  const renderNetworkHealthChart = () => {
    if (!networkHealthChartRef.current || !marketData) return;

    const svg = d3.select(networkHealthChartRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 150;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const data = [
      { metric: 'Success Rate', value: marketData.networkHealth.successRate, color: '#10b981' },
      { metric: 'Confirmation Time', value: 100 - (marketData.networkHealth.avgConfirmationTime / 60 * 100), color: '#f59e0b' },
      { metric: 'Network Health', value: 100 - marketData.networkHealth.networkCongestion, color: '#3b82f6' }
    ];

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.metric))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    // Add bars
    svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.metric) || 0)
      .attr("y", d => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - margin.bottom - yScale(d.value))
      .attr("fill", d => d.color)
      .attr("opacity", 0.8);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => `${d}%`));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Market Cap</p>
                <p className="text-2xl font-bold">{formatCurrency(marketData?.totalMarketCap || 0)}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {formatPercent(5.2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Domains</p>
                <p className="text-2xl font-bold">{marketData?.totalDomains.toLocaleString() || 0}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {formatPercent(2.1)}
                </p>
              </div>
              <Globe className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Traders</p>
                <p className="text-2xl font-bold">{marketData?.activeTraders.toLocaleString() || 0}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {formatPercent(8.7)}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">24h Volume</p>
                <p className="text-2xl font-bold">{formatCurrency(marketData?.transactionVolume || 0)}</p>
                <p className="text-sm text-red-600 flex items-center">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  {formatPercent(-1.3)}
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Sentiment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Market Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge 
                variant={marketSentiment === 'bullish' ? 'default' : marketSentiment === 'bearish' ? 'destructive' : 'secondary'}
                className="text-lg px-4 py-2"
              >
                {marketSentiment.toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-600">
                Based on AI analysis of market trends and trading patterns
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchAnalyticsData}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Tabs defaultValue="market" className="space-y-4">
        <TabsList>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="volume">Volume</TabsTrigger>
          <TabsTrigger value="network">Network Health</TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="w-5 h-5 mr-2" />
                Market Cap Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <svg ref={marketCapChartRef} width={400} height={200}></svg>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          {portfolioData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Portfolio Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg ref={portfolioChartRef} width={300} height={200}></svg>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Value</span>
                    <span className="text-lg font-bold">{formatCurrency(portfolioData.totalValue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">24h Change</span>
                    <span className={`text-sm font-medium ${portfolioData.valueChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(portfolioData.valueChange24h)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">7d Change</span>
                    <span className={`text-sm font-medium ${portfolioData.valueChange7d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(portfolioData.valueChange7d)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">30d Change</span>
                    <span className={`text-sm font-medium ${portfolioData.valueChange30d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(portfolioData.valueChange30d)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="volume" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                24h Trading Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <svg ref={volumeChartRef} width={400} height={150}></svg>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Network Health Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <svg ref={networkHealthChartRef} width={300} height={150}></svg>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Trending Domains */}
      <Card>
        <CardHeader>
          <CardTitle>Trending Domains</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendingDomains.slice(0, 5).map((domain, index) => (
              <div key={domain.domain} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{domain.domain}</p>
                    <p className="text-sm text-gray-600">Volume: {formatCurrency(domain.volume)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(domain.value)}</p>
                  <p className={`text-sm ${domain.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(domain.changePercent)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeAnalytics;
