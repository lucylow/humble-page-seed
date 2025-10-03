import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import MetricCard from '../MetricCard';

interface Domain {
  id?: string;
  name: string;
  currentPrice: number;
  isTokenized: boolean;
  category?: string;
  traffic?: {
    monthlyVisitors: number;
  };
  tokenId?: string;
  isListed?: boolean;
  isFractionalized?: boolean;
}

interface Transaction {
  id: string;
  domainId: string;
  amount: number;
  timestamp: string;
  type: 'sale' | 'offer' | 'listing';
}

interface VisualDashboardProps {
  domains: Domain[];
  transactions: Transaction[];
}

const VisualDashboard: React.FC<VisualDashboardProps> = ({ domains, transactions }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('value');

  // Process data for visualizations
  const portfolioValueData = processPortfolioValue(domains, timeRange);
  const transactionVolumeData = processTransactionVolume(transactions, timeRange);
  const domainCategoryData = processDomainCategories(domains);

  const calculateTotalValue = (domains: Domain[]) => {
    return domains.reduce((total, domain) => total + domain.currentPrice, 0);
  };

  const calculateValueChange = (domains: Domain[], timeRange: string) => {
    // Simulate value change calculation
    return Math.floor(Math.random() * 20) - 10; // Random change for demo
  };

  const calculateTokenizedChange = (domains: Domain[], timeRange: string) => {
    return domains.filter(d => d.isTokenized).length;
  };

  const calculateMonthlyRevenue = (transactions: Transaction[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(t => {
        const transactionDate = new Date(t.timestamp);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear &&
               t.type === 'sale';
      })
      .reduce((total, t) => total + t.amount, 0);
  };

  const calculateRevenueChange = (transactions: Transaction[], timeRange: string) => {
    return Math.floor(Math.random() * 30) - 15; // Random change for demo
  };

  const calculateDomainChange = (domain: Domain) => {
    return Math.floor(Math.random() * 40) - 20; // Random change for demo
  };

  const calculateROI = (domain: Domain) => {
    return Math.floor(Math.random() * 10000) + 1000; // Random ROI for demo
  };

  const getDomainStatus = (domain: Domain) => {
    if (domain.isTokenized) return 'Tokenized';
    return 'Available';
  };

  const calculateMarketComparison = (domains: Domain[], timeRange: string) => {
    // Simulate market comparison data
    return [];
  };

  return (
    <div className="analytics-dashboard space-y-6">
      <div className="dashboard-controls">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gradient-premium">Portfolio Analytics</h2>
            <p className="text-muted-foreground mt-2">Track your domain portfolio performance and market trends</p>
          </div>
          <div className="flex gap-3">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-background text-foreground"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <select 
              value={selectedMetric} 
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-background text-foreground"
            >
              <option value="value">Portfolio Value</option>
              <option value="growth">Growth Rate</option>
              <option value="transactions">Transaction Volume</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Total Portfolio Value"
          value={`$${calculateTotalValue(domains).toLocaleString()}`}
          change={calculateValueChange(domains, timeRange)}
          changeLabel="vs previous period"
          icon="💰"
        />
        <MetricCard
          title="Tokenized Domains"
          value={domains.filter(d => d.isTokenized).length}
          change={calculateTokenizedChange(domains, timeRange)}
          changeLabel="total tokenized"
          icon="🔗"
        />
        <MetricCard
          title="Monthly Revenue"
          value={`$${calculateMonthlyRevenue(transactions).toLocaleString()}`}
          change={calculateRevenueChange(transactions, timeRange)}
          changeLabel="vs last month"
          icon="📈"
        />
        <MetricCard
          title="Active Listings"
          value={domains.filter(d => !d.isTokenized).length}
          change={Math.floor(Math.random() * 10)}
          changeLabel="new this month"
          icon="📋"
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Value Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Portfolio Value Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/30 dark:border-blue-700/30">
              <div className="text-center">
                <div className="text-4xl mb-2">📈</div>
                <p className="text-muted-foreground">Chart visualization would be implemented here</p>
                <p className="text-sm text-muted-foreground mt-2">Using Chart.js or similar library</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Volume */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💹</span>
              Transaction Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/30 dark:border-emerald-700/30">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-muted-foreground">Transaction volume chart</p>
                <p className="text-sm text-muted-foreground mt-2">Bar chart showing daily/weekly volume</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Domain Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Domain Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/30 dark:border-purple-700/30">
              <div className="text-center">
                <div className="text-4xl mb-2">🥧</div>
                <p className="text-muted-foreground">Category distribution</p>
                <p className="text-sm text-muted-foreground mt-2">Pie chart of domain categories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance vs Market */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              Performance vs Market
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200/30 dark:border-orange-700/30">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-muted-foreground">Market comparison</p>
                <p className="text-sm text-muted-foreground mt-2">Line chart comparing portfolio vs market</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Detailed Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Domain</th>
                  <th className="text-left py-3 px-4 font-semibold">Current Value</th>
                  <th className="text-left py-3 px-4 font-semibold">30d Change</th>
                  <th className="text-left py-3 px-4 font-semibold">Traffic</th>
                  <th className="text-left py-3 px-4 font-semibold">ROI</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((domain, index) => (
                  <tr key={domain.id || domain.tokenId || index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{domain.name}</td>
                    <td className="py-3 px-4">${domain.currentPrice.toLocaleString()}</td>
                    <td className={`py-3 px-4 font-medium ${
                      calculateDomainChange(domain) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {calculateDomainChange(domain) >= 0 ? '+' : ''}{calculateDomainChange(domain)}%
                    </td>
                    <td className="py-3 px-4">{domain.traffic?.monthlyVisitors || 0}</td>
                    <td className="py-3 px-4">${calculateROI(domain).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={getDomainStatus(domain) === 'Tokenized' ? 'default' : 'secondary'}
                        className={
                          getDomainStatus(domain) === 'Tokenized' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                        }
                      >
                        {getDomainStatus(domain)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions for data processing
const processPortfolioValue = (domains: Domain[], timeRange: string) => {
  // Process domain value data for the selected time range
  return []; // Return formatted data for chart
};

const processTransactionVolume = (transactions: Transaction[], timeRange: string) => {
  // Process transaction volume data for the selected time range
  return []; // Return formatted data for chart
};

const processDomainCategories = (domains: Domain[]) => {
  // Process domain category data for pie chart
  return []; // Return formatted data for chart
};

export default VisualDashboard;
