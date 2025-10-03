// src/components/MockDataExample.tsx
import React, { useState, useEffect } from 'react';
import { 
  mockDomains, 
  mockUsers, 
  mockTransactions, 
  mockAnalytics,
  mockDataUtils 
} from '../mockData';

const MockDataExample: React.FC = () => {
  const [domains, setDomains] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [metrics, setMetrics] = useState<Record<string, unknown>>({});
  const [trendingDomains, setTrendingDomains] = useState([]);

  useEffect(() => {
    // Simulate API calls with mock data
    setDomains(mockDomains);
    setUsers(mockUsers);
    setTransactions(mockTransactions.slice(0, 5)); // Recent transactions
    setMetrics(mockAnalytics.platformMetrics);
    setTrendingDomains(mockDataUtils.getTrendingDomains(3));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">DomaLand Mock Data Demo</h1>
      
      {/* Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Domains</h3>
          <p className="text-3xl font-bold text-blue-600">{metrics.totalDomains?.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Tokenized Domains</h3>
          <p className="text-3xl font-bold text-green-600">{metrics.tokenizedDomains?.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Volume</h3>
          <p className="text-3xl font-bold text-purple-600">${metrics.totalVolume?.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Users</h3>
          <p className="text-3xl font-bold text-orange-600">{metrics.activeUsers?.toLocaleString()}</p>
        </div>
      </div>

      {/* Trending Domains */}
      <div className="bg-white p-6 rounded-lg shadow-md border mb-8">
        <h2 className="text-2xl font-bold mb-4">Trending Domains</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trendingDomains.map((domain) => (
            <div key={domain.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">{domain.name}</h3>
              <p className="text-gray-600 mb-2">${domain.currentPrice.toLocaleString()}</p>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-sm ${
                  domain.isListed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {domain.isListed ? 'Listed' : 'Not Listed'}
                </span>
                <span className={`px-2 py-1 rounded text-sm ${
                  domain.isFractionalized ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {domain.isFractionalized ? 'Fractionalized' : 'Whole'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg shadow-md border mb-8">
        <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Domain</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b">
                  <td className="py-2 font-medium">{tx.domainName}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      tx.type === 'sale' ? 'bg-green-100 text-green-800' :
                      tx.type === 'offer' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {tx.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2">${tx.amount?.toLocaleString()}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                      tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-2 text-gray-600">
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Profiles */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-2xl font-bold mb-4">Top Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.slice(0, 6).map((user) => (
            <div key={user.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <img 
                  src={user.profileImage} 
                  alt={user.username}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div>
                  <h3 className="font-semibold">{user.username}</h3>
                  <p className="text-sm text-gray-600">{user.userType}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Domains:</span>
                  <span className="font-medium">{user.totalDomains}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Value:</span>
                  <span className="font-medium">${user.totalValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Reputation:</span>
                  <span className="font-medium">{user.reputation}/5.0</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MockDataExample;
