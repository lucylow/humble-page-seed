// Domain Fractionalization Panel Component
import React, { useState, useEffect } from 'react';
import { useDomainFractionalization } from '../../hooks/useAdvancedFeatures';
import { useToast } from '../../hooks/use-toast';
import { Domain } from '../../types';

interface FractionalizationPanelProps {
  domain: Domain;
  onClose: () => void;
}

export const FractionalizationPanel: React.FC<FractionalizationPanelProps> = ({ domain, onClose }) => {
  const {
    proposeFractionalization,
    executeFractionalization,
    purchaseShares,
    createGovernanceProposal,
    voteOnProposal,
    getShareholders,
    distributeRevenue,
    loading,
    error,
    shareholders,
  } = useDomainFractionalization();

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'propose' | 'governance' | 'shares' | 'revenue'>('propose');
  const [proposalData, setProposalData] = useState({
    total_shares: 1000,
    share_price: 10,
    governance_threshold: 51,
    revenue_sharing_enabled: true,
  });
  const [sharePurchaseData, setSharePurchaseData] = useState({
    share_amount: 10,
    payment_method: 'crypto' as 'crypto' | 'fiat',
    currency: 'ETH',
  });
  const [governanceData, setGovernanceData] = useState({
    proposal_type: 'sell_domain' as 'sell_domain' | 'change_management' | 'distribute_revenue' | 'upgrade_domain',
    title: '',
    description: '',
  });
  const [revenueData, setRevenueData] = useState({
    total_revenue: 0,
  });

  useEffect(() => {
    if (domain) {
      loadShareholders();
    }
  }, [domain]);

  const loadShareholders = async () => {
    try {
      await getShareholders(Number(domain.tokenId || 0));
    } catch (err) {
      console.error('Failed to load shareholders:', err);
    }
  };

  const handleProposeFractionalization = async () => {
    try {
      const result = await proposeFractionalization({
        domain_id: Number(domain.tokenId || 0),
        proposer_id: 1, // In real app, get from user context
        ...proposalData,
      });
      
      if (result.success) {
        toast({ title: 'Proposal Created', description: 'Fractionalization proposal has been created successfully' });
      } else {
        toast({ title: 'Proposal Failed', description: result.error || 'Failed to create fractionalization proposal', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Proposal Failed', description: 'Unable to create fractionalization proposal', variant: 'destructive' });
    }
  };

  const handleExecuteFractionalization = async () => {
    try {
      const result = await executeFractionalization(Number(domain.tokenId || 0), 'polygon');
      
      if (result.success) {
        toast({ title: 'Fractionalization Executed', description: 'Domain has been successfully fractionalized' });
        loadShareholders();
      } else {
        toast({ title: 'Execution Failed', description: result.error || 'Failed to execute fractionalization', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Execution Failed', description: 'Unable to execute fractionalization', variant: 'destructive' });
    }
  };

  const handlePurchaseShares = async () => {
    try {
      const result = await purchaseShares({
        domain_id: Number(domain.tokenId || 0),
        buyer_id: 1, // In real app, get from user context
        share_amount: sharePurchaseData.share_amount,
        payment_details: {
          payment_method: sharePurchaseData.payment_method,
          amount: sharePurchaseData.share_amount * proposalData.share_price,
          currency: sharePurchaseData.currency,
        },
      });
      
      if (result.success) {
        toast({ title: 'Shares Purchased', description: 'Domain shares have been purchased successfully' });
        loadShareholders();
      } else {
        toast({ title: 'Purchase Failed', description: result.error || 'Failed to purchase shares', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Purchase Failed', description: 'Unable to purchase shares', variant: 'destructive' });
    }
  };

  const handleCreateGovernanceProposal = async () => {
    try {
      const result = await createGovernanceProposal({
        domain_id: Number(domain.tokenId || 0),
        proposer_id: 1, // In real app, get from user context
        ...governanceData,
        execution_data: {},
      });
      
      if (result.success) {
        toast({ title: 'Proposal Created', description: 'Governance proposal has been created successfully' });
      } else {
        toast({ title: 'Proposal Failed', description: result.error || 'Failed to create governance proposal', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Proposal Failed', description: 'Unable to create governance proposal', variant: 'destructive' });
    }
  };

  const handleDistributeRevenue = async () => {
    try {
      const result = await distributeRevenue(Number(domain.tokenId || 0), revenueData.total_revenue);
      
      if (result.success) {
        toast({ title: 'Revenue Distributed', description: 'Revenue has been distributed among shareholders' });
      } else {
        toast({ title: 'Distribution Failed', description: result.error || 'Failed to distribute revenue', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Distribution Failed', description: 'Unable to distribute revenue', variant: 'destructive' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Fractionalization for {domain.name}
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
            { key: 'propose', label: 'Propose Fractionalization' },
            { key: 'governance', label: 'Governance' },
            { key: 'shares', label: 'Purchase Shares' },
            { key: 'revenue', label: 'Revenue Distribution' },
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
        {activeTab === 'propose' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Fractionalization Proposal
              </h3>
              <p className="text-blue-800 text-sm">
                Split your domain into tradeable shares. This allows multiple investors to own portions of your domain.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Shares
                </label>
                <input
                  type="number"
                  value={proposalData.total_shares}
                  onChange={(e) => setProposalData(prev => ({ ...prev, total_shares: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="100"
                  max="10000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Price (USD)
                </label>
                <input
                  type="number"
                  value={proposalData.share_price}
                  onChange={(e) => setProposalData(prev => ({ ...prev, share_price: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0.01"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Governance Threshold (%)
                </label>
                <input
                  type="number"
                  value={proposalData.governance_threshold}
                  onChange={(e) => setProposalData(prev => ({ ...prev, governance_threshold: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="100"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={proposalData.revenue_sharing_enabled}
                  onChange={(e) => setProposalData(prev => ({ ...prev, revenue_sharing_enabled: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Enable Revenue Sharing
                </label>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Proposal Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Total Shares: {proposalData.total_shares.toLocaleString()}</p>
                <p>Share Price: {formatCurrency(proposalData.share_price)}</p>
                <p>Total Value: {formatCurrency(proposalData.total_shares * proposalData.share_price)}</p>
                <p>Governance Threshold: {proposalData.governance_threshold}%</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleProposeFractionalization}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Proposal...' : 'Create Proposal'}
              </button>
              <button
                onClick={handleExecuteFractionalization}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Executing...' : 'Execute Fractionalization'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'shares' && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Purchase Domain Shares
              </h3>
              <p className="text-green-800 text-sm">
                Buy fractional shares of this domain to participate in ownership and governance.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Shares
                </label>
                <input
                  type="number"
                  value={sharePurchaseData.share_amount}
                  onChange={(e) => setSharePurchaseData(prev => ({ ...prev, share_amount: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={sharePurchaseData.payment_method}
                  onChange={(e) => setSharePurchaseData(prev => ({ ...prev, payment_method: e.target.value as 'crypto' | 'fiat' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="crypto">Cryptocurrency</option>
                  <option value="fiat">Fiat Currency</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={sharePurchaseData.currency}
                  onChange={(e) => setSharePurchaseData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                  <option value="MATIC">MATIC</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Purchase Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Shares to Purchase: {sharePurchaseData.share_amount}</p>
                <p>Price per Share: {formatCurrency(proposalData.share_price)}</p>
                <p>Total Cost: {formatCurrency(sharePurchaseData.share_amount * proposalData.share_price)}</p>
                <p>Payment Method: {sharePurchaseData.payment_method}</p>
                <p>Currency: {sharePurchaseData.currency}</p>
              </div>
            </div>

            <button
              onClick={handlePurchaseShares}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Purchase Shares'}
            </button>
          </div>
        )}

        {activeTab === 'governance' && (
          <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Governance Proposals
              </h3>
              <p className="text-purple-800 text-sm">
                Create proposals for domain governance decisions. Shareholders can vote on important domain decisions.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposal Type
                </label>
                <select
                  value={governanceData.proposal_type}
                  onChange={(e) => setGovernanceData(prev => ({ ...prev, proposal_type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sell_domain">Sell Domain</option>
                  <option value="change_management">Change Management</option>
                  <option value="distribute_revenue">Distribute Revenue</option>
                  <option value="upgrade_domain">Upgrade Domain</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposal Title
                </label>
                <input
                  type="text"
                  value={governanceData.title}
                  onChange={(e) => setGovernanceData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter proposal title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposal Description
                </label>
                <textarea
                  value={governanceData.description}
                  onChange={(e) => setGovernanceData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Describe your proposal in detail"
                />
              </div>
            </div>

            <button
              onClick={handleCreateGovernanceProposal}
              disabled={loading || !governanceData.title || !governanceData.description}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Proposal...' : 'Create Governance Proposal'}
            </button>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                Revenue Distribution
              </h3>
              <p className="text-yellow-800 text-sm">
                Distribute revenue among domain shareholders based on their ownership percentage.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Revenue to Distribute (USD)
              </label>
              <input
                type="number"
                value={revenueData.total_revenue}
                onChange={(e) => setRevenueData(prev => ({ ...prev, total_revenue: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>

            {shareholders.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Shareholder Distribution Preview</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {shareholders.map((shareholder, index) => (
                    <div key={index} className="flex justify-between">
                      <span>Shareholder {shareholder.user_id}</span>
                      <span>{formatCurrency((revenueData.total_revenue * shareholder.ownership_percentage) / 100)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleDistributeRevenue}
              disabled={loading || revenueData.total_revenue <= 0}
              className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Distributing...' : 'Distribute Revenue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
