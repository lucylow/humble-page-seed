// React component for domain marketplace interface

import React, { useState, useEffect, useCallback } from 'react';
import { useDomainMarketplace } from '../hooks/useDomainOperations';
import { DomainAsset, SearchFilters } from '../types/domain';

export const DomainMarketplace: React.FC = () => {
  const { 
    domains, 
    loading, 
    error, 
    searchDomains, 
    makeOffer, 
    acceptOffer, 
    clearError 
  } = useDomainMarketplace();

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    minValue: undefined,
    maxValue: undefined,
    tld: [],
    category: [],
    isTokenized: true,
    hasFractionalShares: undefined,
    sortBy: 'value',
    sortOrder: 'desc'
  });

  const [selectedDomain, setSelectedDomain] = useState<DomainAsset | null>(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');

  const handleSearch = useCallback(async () => {
    await searchDomains(searchFilters);
  }, [searchDomains, searchFilters]);

  useEffect(() => {
    // Load initial domains
    handleSearch();
  }, [handleSearch]);

  const handleFilterChange = (key: keyof SearchFilters, value: unknown) => {
    setSearchFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleMakeOffer = async (domain: DomainAsset) => {
    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      alert('Please enter a valid offer amount');
      return;
    }

    const offer = await makeOffer(domain.id, parseFloat(offerAmount), offerMessage);
    if (offer) {
      alert(`Offer submitted successfully! Offer ID: ${offer.id}`);
      setSelectedDomain(null);
      setOfferAmount('');
      setOfferMessage('');
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}K`;
    } else {
      return `$${price.toFixed(0)}`;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Domain Marketplace
        </h1>
        <p className="text-gray-600">
          Discover and invest in premium tokenized domains with fractional ownership opportunities.
        </p>
      </div>

      {/* Search Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Value ($)
            </label>
            <input
              type="number"
              value={searchFilters.minValue || ''}
              onChange={(e) => handleFilterChange('minValue', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Value ($)
            </label>
            <input
              type="number"
              value={searchFilters.maxValue || ''}
              onChange={(e) => handleFilterChange('maxValue', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="No limit"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={searchFilters.category?.[0] || ''}
              onChange={(e) => handleFilterChange('category', e.target.value ? [e.target.value] : [])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="technology">Technology</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="entertainment">Entertainment</option>
              <option value="ecommerce">E-commerce</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={searchFilters.sortBy || 'value'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="value">Value</option>
              <option value="traffic">Traffic</option>
              <option value="age">Age</option>
              <option value="created">Recently Added</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={searchFilters.isTokenized || false}
              onChange={(e) => handleFilterChange('isTokenized', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Tokenized Only</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={searchFilters.hasFractionalShares || false}
              onChange={(e) => handleFilterChange('hasFractionalShares', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Has Fractional Shares</span>
          </label>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={clearError}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Domain Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map((domain) => (
          <div key={domain.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {domain.fullName}
                  </h3>
                  <span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                    {domain.metadata.category}
                  </span>
                </div>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getConfidenceColor(domain.valuation.confidence)}`}>
                  {domain.valuation.confidence}% confidence
                </span>
              </div>

              <div className="mb-4">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatPrice(domain.valuation.estimatedValue)}
                </div>
                <div className="text-sm text-gray-600">
                  AI Valuation
                </div>
              </div>

              {domain.metadata.traffic && (
                <div className="mb-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Monthly Visitors:</span>
                    <span className="font-medium">{domain.metadata.traffic.monthlyVisitors.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {domain.fractionalShares && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="text-sm text-green-800">
                    <div className="font-medium mb-1">Fractional Ownership Available</div>
                    <div className="flex justify-between">
                      <span>Price per Share:</span>
                      <span className="font-medium">${domain.fractionalShares.pricePerShare}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shares Sold:</span>
                      <span className="font-medium">
                        {domain.fractionalShares.sharesSold.toLocaleString()} / {domain.fractionalShares.totalShares.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedDomain(domain)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Make Offer
                </button>
                <button
                  onClick={() => {/* Navigate to domain details */}}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {domains.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No domains found matching your criteria</div>
          <button
            onClick={() => {
              setSearchFilters({
                minValue: undefined,
                maxValue: undefined,
                tld: [],
                category: [],
                isTokenized: true,
                hasFractionalShares: undefined,
                sortBy: 'value',
                sortOrder: 'desc'
              });
              handleSearch();
            }}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Make Offer Modal */}
      {selectedDomain && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Make Offer for {selectedDomain.fullName}
            </h3>
            
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                AI Valuation: {formatPrice(selectedDomain.valuation.estimatedValue)}
              </div>
              <div className="text-sm text-gray-600">
                Confidence: {selectedDomain.valuation.confidence}%
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offer Amount ($)
              </label>
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                placeholder="Enter your offer"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                rows={3}
                placeholder="Add a message to the domain owner..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setSelectedDomain(null);
                  setOfferAmount('');
                  setOfferMessage('');
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMakeOffer(selectedDomain)}
                disabled={loading || !offerAmount}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Offer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
