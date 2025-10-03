// AI Valuation Panel Component
import React, { useState, useEffect } from 'react';
import { useAIValuation } from '../../hooks/useAdvancedFeatures';
import { useToast } from '../../hooks/use-toast';
import { Domain } from '../../types';

interface AIValuationPanelProps {
  domain: Domain;
  onClose: () => void;
}

export const AIValuationPanel: React.FC<AIValuationPanelProps> = ({ domain, onClose }) => {
  const { getValuation, loading, error, valuation } = useAIValuation();
  const { toast } = useToast();
  const [additionalData, setAdditionalData] = useState({
    industry: '',
    business_type: '',
    target_market: '',
    revenue_potential: Number(domain.price || 0),
  });

  useEffect(() => {
    if (domain) {
      handleGetValuation();
    }
  }, [domain]);

  const handleGetValuation = async () => {
    try {
      await getValuation({
        domain_id: Number(domain.tokenId || 0),
        additional_data: additionalData,
      });
      toast({ title: 'AI Valuation Complete', description: 'Domain valuation has been calculated successfully' });
    } catch (err) {
      toast({ title: 'Valuation Failed', description: 'Unable to get AI valuation for this domain', variant: 'destructive' });
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            AI Valuation for {domain.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Additional Data Input */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Additional Context (Optional)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <input
                type="text"
                value={additionalData.industry}
                onChange={(e) => setAdditionalData(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Technology, Finance"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Type
              </label>
              <input
                type="text"
                value={additionalData.business_type}
                onChange={(e) => setAdditionalData(prev => ({ ...prev, business_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., SaaS, E-commerce"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Market
              </label>
              <input
                type="text"
                value={additionalData.target_market}
                onChange={(e) => setAdditionalData(prev => ({ ...prev, target_market: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., B2B, Consumer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Revenue Potential
              </label>
              <input
                type="number"
                value={additionalData.revenue_potential}
                onChange={(e) => setAdditionalData(prev => ({ ...prev, revenue_potential: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10000"
              />
            </div>
          </div>
          <button
            onClick={handleGetValuation}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Calculating...' : 'Get AI Valuation'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Valuation Results */}
        {valuation?.success && valuation.valuation && (
          <div className="space-y-6">
            {/* Main Valuation */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {formatCurrency(valuation.valuation.estimated_value)}
                </h3>
                <p className="text-gray-600 mb-4">Estimated Value</p>
                <div className="flex items-center justify-center space-x-4">
                  <span className={`text-lg font-semibold ${getConfidenceColor(valuation.valuation.confidence_score)}`}>
                    {valuation.valuation.confidence_score}% Confidence
                  </span>
                </div>
              </div>
            </div>

            {/* Valuation Factors */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Valuation Factors</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Length Score</span>
                    <span className="font-semibold">{valuation.valuation.factors.length_score}/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Memorability</span>
                    <span className="font-semibold">{valuation.valuation.factors.memorability_score}/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Brandability</span>
                    <span className="font-semibold">{valuation.valuation.factors.brandability_score}/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">SEO Potential</span>
                    <span className="font-semibold">{valuation.valuation.factors.seo_potential}/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Extension Value</span>
                    <span className="font-semibold">{valuation.valuation.factors.extension_value}/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Market Trends</span>
                    <span className="font-semibold">{valuation.valuation.factors.market_trends}/100</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Value Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Base Value</span>
                    <span className="font-semibold">{formatCurrency(valuation.valuation.breakdown.base_value)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Keyword Premium</span>
                    <span className="font-semibold">{formatCurrency(valuation.valuation.breakdown.keyword_premium)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">TLD Multiplier</span>
                    <span className="font-semibold">{formatCurrency(valuation.valuation.breakdown.tld_multiplier)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Market Adjustment</span>
                    <span className="font-semibold">{formatCurrency(valuation.valuation.breakdown.market_adjustment)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparable Sales */}
            {valuation.valuation.comparable_sales && valuation.valuation.comparable_sales.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Comparable Sales</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Domain
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sale Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sale Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Similarity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {valuation.valuation.comparable_sales.map((sale, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {sale.domain}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(sale.sale_price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(sale.sale_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(sale.similarity_score * 100).toFixed(1)}%
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
