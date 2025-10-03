// Automated Market Maker (AMM) Panel Component
import React, { useState, useEffect } from 'react';
import { useAMM } from '../../hooks/useAdvancedFeatures';
import { useToast } from '@/hooks/use-toast';
import { Domain } from '../../types';

interface AMMPanelProps {
  domain: Domain;
  onClose: () => void;
}

export const AMMPanel: React.FC<AMMPanelProps> = ({ domain, onClose }) => {
  const {
    createLiquidityPool,
    addLiquidity,
    removeLiquidity,
    getTradeQuote,
    executeSwap,
    getPoolAnalytics,
    getUserPositions,
    listPools,
    loading,
    error,
    pools,
    userPositions,
    tradeQuote,
  } = useAMM();

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'create' | 'add-liquidity' | 'trade' | 'analytics'>('create');
  const [poolData, setPoolData] = useState({
    base_token: 'USDC' as 'USDC' | 'ETH' | 'MATIC',
    initial_domain_amount: 1,
    initial_base_amount: 1000,
  });
  const [liquidityData, setLiquidityData] = useState({
    pool_id: '',
    domain_amount: 0,
    base_amount: 0,
  });
  const [tradeData, setTradeData] = useState({
    pool_id: '',
    input_token: 'USDC',
    input_amount: 0,
    slippage_tolerance: 2,
  });
  const [selectedPool, setSelectedPool] = useState<any>(null);

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    try {
      await listPools();
    } catch (err) {
      console.error('Failed to load pools:', err);
    }
  };

  const handleCreatePool = async () => {
    try {
      const result = await createLiquidityPool({
        domain_id: Number(domain.tokenId || 0),
        base_token: poolData.base_token,
        initial_domain_amount: poolData.initial_domain_amount,
        initial_base_amount: poolData.initial_base_amount,
        creator_id: 1, // In real app, get from user context
      });
      
      if (result.success) {
        toast({ title: 'Pool Created', description: 'Liquidity pool has been created successfully' });
        loadPools();
      } else {
        toast({ title: 'Creation Failed', description: result.error || 'Failed to create liquidity pool', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Creation Failed', description: 'Unable to create liquidity pool', variant: 'destructive' });
    }
  };

  const handleAddLiquidity = async () => {
    try {
      const result = await addLiquidity({
        pool_id: liquidityData.pool_id,
        user_id: 1, // In real app, get from user context
        domain_amount: liquidityData.domain_amount,
        base_amount: liquidityData.base_amount,
      });
      
      if (result.success) {
        toast({ title: 'Liquidity Added', description: 'Liquidity has been added to the pool successfully' });
      } else {
        toast({ title: 'Addition Failed', description: result.error || 'Failed to add liquidity', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Addition Failed', description: 'Unable to add liquidity', variant: 'destructive' });
    }
  };

  const handleGetQuote = async () => {
    try {
      const result = await getTradeQuote({
        pool_id: tradeData.pool_id,
        input_token: tradeData.input_token,
        input_amount: tradeData.input_amount,
        slippage_tolerance: tradeData.slippage_tolerance,
      });
      
      if (result.success) {
        toast({ title: 'Quote Generated', description: 'Trade quote has been generated successfully' });
      } else {
        toast({ title: 'Quote Failed', description: result.error || 'Failed to generate trade quote', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Quote Failed', description: 'Unable to generate trade quote', variant: 'destructive' });
    }
  };

  const handleExecuteSwap = async () => {
    if (!tradeQuote) {
      toast({ title: 'No Quote', description: 'Please generate a trade quote first', variant: 'destructive' });
      return;
    }

    try {
      const result = await executeSwap({
        pool_id: tradeData.pool_id,
        trader_id: 1, // In real app, get from user context
        quote: tradeQuote,
      });
      
      if (result.success) {
        toast({ title: 'Swap Executed', description: 'Token swap has been executed successfully' });
      } else {
        toast({ title: 'Swap Failed', description: result.error || 'Failed to execute swap', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Swap Failed', description: 'Unable to execute swap', variant: 'destructive' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            AMM Trading for {domain.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          {[
            { key: 'create', label: 'Create Pool' },
            { key: 'add-liquidity', label: 'Add Liquidity' },
            { key: 'trade', label: 'Trade' },
            { key: 'analytics', label: 'Analytics' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
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
        {activeTab === 'create' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Create Liquidity Pool
              </h3>
              <p className="text-blue-800 text-sm">
                Create a new liquidity pool for {domain.name} to enable automated trading.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Token
                </label>
                <select
                  value={poolData.base_token}
                  onChange={(e) => setPoolData(prev => ({ ...prev, base_token: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USDC">USDC</option>
                  <option value="ETH">ETH</option>
                  <option value="MATIC">MATIC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Domain Amount
                </label>
                <input
                  type="number"
                  value={poolData.initial_domain_amount}
                  onChange={(e) => setPoolData(prev => ({ ...prev, initial_domain_amount: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0.01"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Base Amount
                </label>
                <input
                  type="number"
                  value={poolData.initial_base_amount}
                  onChange={(e) => setPoolData(prev => ({ ...prev, initial_base_amount: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Pool Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Domain: {domain.name}</p>
                <p>Base Token: {poolData.base_token}</p>
                <p>Initial Domain Amount: {poolData.initial_domain_amount}</p>
                <p>Initial Base Amount: {poolData.initial_base_amount}</p>
                <p>Initial Price: {formatCurrency(poolData.initial_base_amount / poolData.initial_domain_amount)} per domain</p>
              </div>
            </div>

            <button
              onClick={handleCreatePool}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Pool...' : 'Create Liquidity Pool'}
            </button>
          </div>
        )}

        {activeTab === 'add-liquidity' && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Add Liquidity
              </h3>
              <p className="text-green-800 text-sm">
                Provide liquidity to existing pools and earn trading fees.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Pool
                </label>
                <select
                  value={liquidityData.pool_id}
                  onChange={(e) => {
                    const pool = pools.find(p => p.pool_id === e.target.value);
                    setSelectedPool(pool);
                    setLiquidityData(prev => ({ ...prev, pool_id: e.target.value }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a pool</option>
                  {pools.map((pool) => (
                    <option key={pool.pool_id} value={pool.pool_id}>
                      {pool.domain_name} / {pool.base_token}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain Amount
                </label>
                <input
                  type="number"
                  value={liquidityData.domain_amount}
                  onChange={(e) => setLiquidityData(prev => ({ ...prev, domain_amount: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Token Amount
                </label>
                <input
                  type="number"
                  value={liquidityData.base_amount}
                  onChange={(e) => setLiquidityData(prev => ({ ...prev, base_amount: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {selectedPool && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Pool Information</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Pool ID: {selectedPool.pool_id}</p>
                  <p>Domain: {selectedPool.domain_name}</p>
                  <p>Base Token: {selectedPool.base_token}</p>
                  <p>TVL: {formatCurrency(selectedPool.tvl)}</p>
                  <p>APY: {formatPercentage(selectedPool.apy)}</p>
                  <p>24h Volume: {formatCurrency(selectedPool.volume_24h)}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleAddLiquidity}
              disabled={loading || !liquidityData.pool_id || liquidityData.domain_amount <= 0 || liquidityData.base_amount <= 0}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding Liquidity...' : 'Add Liquidity'}
            </button>
          </div>
        )}

        {activeTab === 'trade' && (
          <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Trade Tokens
              </h3>
              <p className="text-purple-800 text-sm">
                Swap between domain tokens and base tokens using automated market maker.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Pool
                </label>
                <select
                  value={tradeData.pool_id}
                  onChange={(e) => setTradeData(prev => ({ ...prev, pool_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a pool</option>
                  {pools.map((pool) => (
                    <option key={pool.pool_id} value={pool.pool_id}>
                      {pool.domain_name} / {pool.base_token}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Input Token
                </label>
                <select
                  value={tradeData.input_token}
                  onChange={(e) => setTradeData(prev => ({ ...prev, input_token: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USDC">USDC</option>
                  <option value="ETH">ETH</option>
                  <option value="MATIC">MATIC</option>
                  <option value="DOMAIN">Domain Token</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Input Amount
                </label>
                <input
                  type="number"
                  value={tradeData.input_amount}
                  onChange={(e) => setTradeData(prev => ({ ...prev, input_amount: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slippage Tolerance (%)
                </label>
                <input
                  type="number"
                  value={tradeData.slippage_tolerance}
                  onChange={(e) => setTradeData(prev => ({ ...prev, slippage_tolerance: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0.1"
                  max="50"
                  step="0.1"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleGetQuote}
                disabled={loading || !tradeData.pool_id || tradeData.input_amount <= 0}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Getting Quote...' : 'Get Quote'}
              </button>
              <button
                onClick={handleExecuteSwap}
                disabled={loading || !tradeQuote}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Executing...' : 'Execute Swap'}
              </button>
            </div>

            {/* Trade Quote Display */}
            {tradeQuote && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Trade Quote</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Input: {tradeQuote.input_amount} {tradeQuote.input_token}</p>
                  <p>Output: {tradeQuote.output_amount} {tradeQuote.output_token}</p>
                  <p>Price Impact: {formatPercentage(tradeQuote.price_impact)}</p>
                  <p>Fee: {tradeQuote.fee_amount} {tradeQuote.input_token}</p>
                  <p>Minimum Output: {tradeQuote.minimum_output} {tradeQuote.output_token}</p>
                  <p>Valid Until: {new Date(tradeQuote.valid_until).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                Pool Analytics
              </h3>
              <p className="text-yellow-800 text-sm">
                View detailed analytics and performance metrics for liquidity pools.
              </p>
            </div>

            {/* Available Pools */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Pools</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pool
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TVL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        APY
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        24h Volume
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pools.map((pool) => (
                      <tr key={pool.pool_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {pool.domain_name} / {pool.base_token}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(pool.tvl)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPercentage(pool.apy)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(pool.volume_24h)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(pool.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Positions */}
            {userPositions.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Liquidity Positions</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pool
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Liquidity Tokens
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Share
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userPositions.map((position, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {position.pool_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {position.liquidity_tokens}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatPercentage(position.share_percentage)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(position.value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
