// React component for fractional ownership interface

import React, { useState, useEffect } from 'react';
import { useDomainOperations } from '../hooks/useDomainOperations';
import { DomainAsset, FractionalizationParams } from '../types/domain';

interface FractionalOwnershipProps {
  domain: DomainAsset;
  onSuccess?: (updatedDomain: DomainAsset) => void;
  onCancel?: () => void;
}

export const FractionalOwnership: React.FC<FractionalOwnershipProps> = ({
  domain,
  onSuccess,
  onCancel
}) => {
  const { fractionalizeDomain, buyFractionalShares, sellFractionalShares, loading, error, clearError } = useDomainOperations();
  
  const [mode, setMode] = useState<'create' | 'buy' | 'sell'>('create');
  const [formData, setFormData] = useState({
    totalShares: 1000000,
    pricePerShare: 1,
    minimumInvestment: 100,
    maximumInvestment: 10000,
    sharesToBuy: 100,
    sharesToSell: 100
  });

  const [validation, setValidation] = useState({
    totalShares: '',
    pricePerShare: '',
    minimumInvestment: '',
    maximumInvestment: '',
    sharesToBuy: '',
    sharesToSell: ''
  });

  const [userShares, setUserShares] = useState(0);

  useEffect(() => {
    // In a real implementation, this would fetch user's current shares
    setUserShares(0);
  }, [domain.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));

    // Clear validation error when user starts typing
    if (validation[name as keyof typeof validation]) {
      setValidation(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newValidation = {
      totalShares: '',
      pricePerShare: '',
      minimumInvestment: '',
      maximumInvestment: '',
      sharesToBuy: '',
      sharesToSell: ''
    };

    let isValid = true;

    if (mode === 'create') {
      if (formData.totalShares <= 0) {
        newValidation.totalShares = 'Total shares must be greater than 0';
        isValid = false;
      }
      if (formData.pricePerShare <= 0) {
        newValidation.pricePerShare = 'Price per share must be greater than 0';
        isValid = false;
      }
      if (formData.minimumInvestment <= 0) {
        newValidation.minimumInvestment = 'Minimum investment must be greater than 0';
        isValid = false;
      }
      if (formData.maximumInvestment > 0 && formData.maximumInvestment < formData.minimumInvestment) {
        newValidation.maximumInvestment = 'Maximum investment must be greater than minimum investment';
        isValid = false;
      }
    } else if (mode === 'buy') {
      if (formData.sharesToBuy <= 0) {
        newValidation.sharesToBuy = 'Must buy at least 1 share';
        isValid = false;
      }
    } else if (mode === 'sell') {
      if (formData.sharesToSell <= 0) {
        newValidation.sharesToSell = 'Must sell at least 1 share';
        isValid = false;
      }
      if (formData.sharesToSell > userShares) {
        newValidation.sharesToSell = 'Cannot sell more shares than you own';
        isValid = false;
      }
    }

    setValidation(newValidation);
    return isValid;
  };

  const handleCreateVault = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    clearError();

    const fractionalizationParams: FractionalizationParams = {
      domainId: domain.id,
      totalShares: formData.totalShares,
      pricePerShare: formData.pricePerShare,
      minimumInvestment: formData.minimumInvestment,
      maximumInvestment: formData.maximumInvestment > 0 ? formData.maximumInvestment : undefined
    };

    const result = await fractionalizeDomain(fractionalizationParams);
    
    if (result) {
      onSuccess?.(result);
    }
  };

  const handleBuyShares = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    clearError();

    const result = await buyFractionalShares(domain.id, formData.sharesToBuy);
    
    if (result) {
      // Refresh user shares
      setUserShares(prev => prev + formData.sharesToBuy);
      alert(`Successfully purchased ${formData.sharesToBuy} shares! Transaction: ${result}`);
    }
  };

  const handleSellShares = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    clearError();

    const result = await sellFractionalShares(domain.id, formData.sharesToSell);
    
    if (result) {
      // Update user shares
      setUserShares(prev => prev - formData.sharesToSell);
      alert(`Successfully sold ${formData.sharesToSell} shares! Transaction: ${result}`);
    }
  };

  const getTotalCost = () => {
    if (mode === 'buy') {
      return formData.sharesToBuy * (domain.fractionalShares?.pricePerShare || 0);
    }
    return 0;
  };

  const getTotalValue = () => {
    if (mode === 'sell') {
      return formData.sharesToSell * (domain.fractionalShares?.pricePerShare || 0);
    }
    return 0;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Fractional Ownership
        </h2>
        <p className="text-gray-600">
          {domain.fullName} - ${domain.valuation.estimatedValue.toLocaleString()} valuation
        </p>
      </div>

      {/* Mode Selection */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              mode === 'create'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Create Vault
          </button>
          <button
            type="button"
            onClick={() => setMode('buy')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              mode === 'buy'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Buy Shares
          </button>
          <button
            type="button"
            onClick={() => setMode('sell')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              mode === 'sell'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sell Shares
          </button>
        </div>
      </div>

      {/* Current Status */}
      {domain.fractionalShares && (
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Vault Status</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Shares Sold:</span>
              <span className="ml-2 font-medium">
                {domain.fractionalShares.sharesSold.toLocaleString()} / {domain.fractionalShares.totalShares.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Price per Share:</span>
              <span className="ml-2 font-medium">${domain.fractionalShares.pricePerShare}</span>
            </div>
            <div>
              <span className="text-gray-600">Your Shares:</span>
              <span className="ml-2 font-medium">{userShares.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className={`ml-2 font-medium ${domain.fractionalShares.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {domain.fractionalShares.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Forms */}
      {mode === 'create' && !domain.fractionalShares && (
        <form onSubmit={handleCreateVault} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="totalShares" className="block text-sm font-medium text-gray-700 mb-2">
                Total Shares
              </label>
              <input
                type="number"
                id="totalShares"
                name="totalShares"
                value={formData.totalShares}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validation.totalShares ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validation.totalShares && (
                <p className="mt-1 text-sm text-red-600">{validation.totalShares}</p>
              )}
            </div>

            <div>
              <label htmlFor="pricePerShare" className="block text-sm font-medium text-gray-700 mb-2">
                Price per Share ($)
              </label>
              <input
                type="number"
                id="pricePerShare"
                name="pricePerShare"
                value={formData.pricePerShare}
                onChange={handleInputChange}
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validation.pricePerShare ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validation.pricePerShare && (
                <p className="mt-1 text-sm text-red-600">{validation.pricePerShare}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="minimumInvestment" className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Investment ($)
              </label>
              <input
                type="number"
                id="minimumInvestment"
                name="minimumInvestment"
                value={formData.minimumInvestment}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validation.minimumInvestment ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validation.minimumInvestment && (
                <p className="mt-1 text-sm text-red-600">{validation.minimumInvestment}</p>
              )}
            </div>

            <div>
              <label htmlFor="maximumInvestment" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Investment ($)
              </label>
              <input
                type="number"
                id="maximumInvestment"
                name="maximumInvestment"
                value={formData.maximumInvestment}
                onChange={handleInputChange}
                placeholder="0 for no limit"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validation.maximumInvestment ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validation.maximumInvestment && (
                <p className="mt-1 text-sm text-red-600">{validation.maximumInvestment}</p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Vault Summary</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>Total Value: ${(formData.totalShares * formData.pricePerShare).toLocaleString()}</p>
              <p>Your Ownership: 100% (until shares are sold)</p>
              <p>Minimum Investment: ${formData.minimumInvestment}</p>
              {formData.maximumInvestment > 0 && (
                <p>Maximum Investment: ${formData.maximumInvestment}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Vault'}
            </button>
          </div>
        </form>
      )}

      {mode === 'buy' && domain.fractionalShares && (
        <form onSubmit={handleBuyShares} className="space-y-6">
          <div>
            <label htmlFor="sharesToBuy" className="block text-sm font-medium text-gray-700 mb-2">
              Shares to Buy
            </label>
            <input
              type="number"
              id="sharesToBuy"
              name="sharesToBuy"
              value={formData.sharesToBuy}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validation.sharesToBuy ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validation.sharesToBuy && (
              <p className="mt-1 text-sm text-red-600">{validation.sharesToBuy}</p>
            )}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-green-800 mb-2">Purchase Summary</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p>Shares: {formData.sharesToBuy.toLocaleString()}</p>
              <p>Price per Share: ${domain.fractionalShares.pricePerShare}</p>
              <p className="font-medium">Total Cost: ${getTotalCost().toLocaleString()}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Buying...' : 'Buy Shares'}
            </button>
          </div>
        </form>
      )}

      {mode === 'sell' && domain.fractionalShares && userShares > 0 && (
        <form onSubmit={handleSellShares} className="space-y-6">
          <div>
            <label htmlFor="sharesToSell" className="block text-sm font-medium text-gray-700 mb-2">
              Shares to Sell (You own: {userShares.toLocaleString()})
            </label>
            <input
              type="number"
              id="sharesToSell"
              name="sharesToSell"
              value={formData.sharesToSell}
              onChange={handleInputChange}
              max={userShares}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validation.sharesToSell ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validation.sharesToSell && (
              <p className="mt-1 text-sm text-red-600">{validation.sharesToSell}</p>
            )}
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-orange-800 mb-2">Sale Summary</h4>
            <div className="text-sm text-orange-700 space-y-1">
              <p>Shares: {formData.sharesToSell.toLocaleString()}</p>
              <p>Price per Share: ${domain.fractionalShares.pricePerShare}</p>
              <p className="font-medium">Total Value: ${getTotalValue().toLocaleString()}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Selling...' : 'Sell Shares'}
            </button>
          </div>
        </form>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Information Panel */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">How Fractional Ownership Works</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Create a vault to split your domain into tradeable shares</li>
          <li>• Investors can buy shares with as little as the minimum investment</li>
          <li>• Shareholders receive proportional royalties from domain revenue</li>
          <li>• Shares can be traded on secondary markets</li>
          <li>• You retain control and majority ownership</li>
        </ul>
      </div>
    </div>
  );
};
