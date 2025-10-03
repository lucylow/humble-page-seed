// Advanced Analytics Panel Component
import React, { useState, useEffect } from 'react';
import { useAdvancedAnalytics } from '../../hooks/useAdvancedFeatures';
import { useToast } from '../../hooks/use-toast';
import { Domain } from '../../types';

interface AdvancedAnalyticsPanelProps {
  domain?: Domain;
  onClose: () => void;
}

export const AdvancedAnalyticsPanel: React.FC<AdvancedAnalyticsPanelProps> = ({ domain, onClose }) => {
  const {
    getAnalyticsDashboard,
    getDomainMetrics,
    getTrendingDomains,
    getMarketTrends,
    getNetworkHealth,
    getPortfolioAnalysis,
    loading,
    error,
    dashboard,
    domainMetrics,
    trendingDomains,
    marketTrends,
    networkHealth,
    portfolioAnalysis,
  } = useAdvancedAnalytics();

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'domain' | 'trending' | 'market' | 'network' | 'portfolio'>('dashboard');
  const [userId, setUserId] = useState(1); // In real app, get from user context

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (domain && activeTab === 'domain') {
      loadDomainMetrics();
    }
  }, [domain, activeTab]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        getAnalyticsDashboard({ user_id: userId }),
        getTrendingDomains({ limit: 20 }),
        getMarketTrends(),
        getNetworkHealth(),
        getPortfolioAnalysis(userId),
      ]);
    } catch (err) {
      console.error('Failed to load initial analytics data:', err);
    }
  };

  const loadDomainMetrics = async () => {
    if (!domain) return;
    
    try {
      await getDomainMetrics({ domain_id: Number(domain.tokenId || 0) });
    } catch (err) {
      toast({ title: 'Metrics Failed', description: 'Unable to load domain metrics', variant: 'destructive' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Advanced Analytics {domain && `- ${domain.name}`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 overflow-x-auto">
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'domain', label: 'Domain Metrics' },
            { key: 'trending', label: 'Trending' },
            { key: 'market', label: 'Market Trends' },
            { key: 'network', label: 'Network Health' },
            { key: 'portfolio', label: 'Portfolio' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'dashboard' && dashboard && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Real-Time Analytics Dashboard
              </h3>
              <p className="text-blue-800 text-sm">
                Comprehensive overview of market performance and key metrics.
              </p>
            </div>

            {/* Market Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Total Market Cap</h4>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboard.market_overview?.total_market_cap || 0)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Average Domain Value</h4>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboard.market_overview?.average_domain_value || 0)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-1">24h Price Change</h4>
                <p className={`text-2xl font-bold ${getChangeColor(dashboard.market_overview?.price_change_24h || 0)}`}>
                  {formatPercentage(dashboard.market_overview?.price_change_24h || 0)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Active Traders</h4>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboard.market_overview?.active_traders || 0}
                </p>
              </div>
            </div>

            {/* Transaction Volume */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Transaction Volume</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">24h Volume</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(dashboard.transaction_volume?.volume_24h || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">7d Volume</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(dashboard.transaction_volume?.volume_7d || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">30d Volume</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(dashboard.transaction_volume?.volume_30d || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'domain' && domainMetrics && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Domain Metrics: {domainMetrics.domain_name}
              </h3>
              <p className="text-green-800 text-sm">
                Detailed performance metrics for this specific domain.
              </p>
            </div>

            {/* Domain Performance */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Current Value</h4>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(domainMetrics.current_value || 0)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-1">24h Change</h4>
                <p className={`text-2xl font-bold ${getChangeColor(domainMetrics.value_change_24h || 0)}`}>
                  {formatPercentage(domainMetrics.value_change_24h || 0)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-1">7d Change</h4>
                <p className={`text-2xl font-bold ${getChangeColor(domainMetrics.value_change_7d || 0)}`}>
                  {formatPercentage(domainMetrics.value_change_7d || 0)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-1">30d Change</h4>
                <p className={`text-2xl font-bold ${getChangeColor(domainMetrics.value_change_30d || 0)}`}>
                  {formatPercentage(domainMetrics.value_change_30d || 0)}
                </p>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Trading Activity</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">24h Volume</span>
                    <span className="font-semibold">{formatCurrency(domainMetrics.transaction_volume_24h || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">24h Transactions</span>
                    <span className="font-semibold">{domainMetrics.transaction_count_24h || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Market Cap</span>
                    <span className="font-semibold">{formatCurrency(domainMetrics.market_cap || 0)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Risk Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Liquidity Score</span>
                    <span className="font-semibold">{(domainMetrics.liquidity_score || 0).toFixed(1)}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Volatility Score</span>
                    <span className="font-semibold">{(domainMetrics.volatility_score || 0).toFixed(1)}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Holder Count</span>
                    <span className="font-semibold">{domainMetrics.holder_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Holding Period</span>
                    <span className="font-semibold">{domainMetrics.avg_holding_period || 0} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trending' && (
          <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Trending Domains
              </h3>
              <p className="text-purple-800 text-sm">
                Domains with the highest activity and performance gains.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      24h Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trending Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trendingDomains.map((domain, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {domain.domain_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(domain.current_value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={getChangeColor(domain.value_change_24h)}>
                          {formatPercentage(domain.value_change_24h)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {domain.activity_score.toFixed(1)}/10
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {domain.trending_score.toFixed(1)}/10
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                Market Trends Analysis
              </h3>
              <p className="text-yellow-800 text-sm">
                AI-powered analysis of current market trends and patterns.
              </p>
            </div>

            <div className="space-y-4">
              {marketTrends.map((trend, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{trend.trend_type}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        trend.strength >= 0.8 ? 'bg-green-100 text-green-800' :
                        trend.strength >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {formatPercentage(trend.strength * 100)} Strength
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {trend.confidence_score}% Confidence
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-semibold">{trend.duration_days} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Affected Domains</p>
                      <p className="font-semibold">{trend.affected_domains}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Trend Drivers</p>
                    <div className="flex flex-wrap gap-2">
                      {trend.trend_drivers.map((driver, driverIndex) => (
                        <span key={driverIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {driver}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'network' && networkHealth && (
          <div className="space-y-6">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                Network Health Status
              </h3>
              <p className="text-indigo-800 text-sm">
                Real-time monitoring of blockchain network performance and health.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Network Status</h4>
                <p className={`text-2xl font-bold ${
                  networkHealth.status === 'healthy' ? 'text-green-600' :
                  networkHealth.status === 'degraded' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {networkHealth.status}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Block Height</h4>
                <p className="text-2xl font-bold text-gray-900">
                  {networkHealth.block_height?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Gas Price</h4>
                <p className="text-2xl font-bold text-gray-900">
                  {networkHealth.gas_price ? `${networkHealth.gas_price} Gwei` : 'N/A'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Active Nodes</h4>
                <p className="text-2xl font-bold text-gray-900">
                  {networkHealth.active_nodes || 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">TPS (Transactions per Second)</span>
                    <span className="font-semibold">{networkHealth.tps || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Block Time</span>
                    <span className="font-semibold">{networkHealth.avg_block_time || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network Utilization</span>
                    <span className="font-semibold">{formatPercentage(networkHealth.utilization || 0)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Health Indicators</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sync Status</span>
                    <span className={`font-semibold ${
                      networkHealth.sync_status === 'synced' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {networkHealth.sync_status || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Update</span>
                    <span className="font-semibold">
                      {networkHealth.last_update ? new Date(networkHealth.last_update).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && portfolioAnalysis && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Portfolio Analysis
              </h3>
              <p className="text-green-800 text-sm">
                Comprehensive analysis of your domain portfolio performance.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Total Value</h4>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(portfolioAnalysis.total_value || 0)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Total Return</h4>
                <p className={`text-2xl font-bold ${getChangeColor(portfolioAnalysis.total_return || 0)}`}>
                  {formatPercentage(portfolioAnalysis.total_return || 0)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Domain Count</h4>
                <p className="text-2xl font-bold text-gray-900">
                  {portfolioAnalysis.domain_count || 0}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Diversification</h4>
                <p className="text-2xl font-bold text-gray-900">
                  {(portfolioAnalysis.diversification_score || 0).toFixed(1)}/10
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sharpe Ratio</span>
                    <span className="font-semibold">{(portfolioAnalysis.sharpe_ratio || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Volatility</span>
                    <span className="font-semibold">{formatPercentage(portfolioAnalysis.volatility || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Drawdown</span>
                    <span className="font-semibold text-red-600">{formatPercentage(portfolioAnalysis.max_drawdown || 0)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Risk Score</span>
                    <span className="font-semibold">{(portfolioAnalysis.risk_score || 0).toFixed(1)}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Beta</span>
                    <span className="font-semibold">{(portfolioAnalysis.beta || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Correlation</span>
                    <span className="font-semibold">{(portfolioAnalysis.correlation || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading analytics...</span>
          </div>
        )}
      </div>
    </div>
  );
};
