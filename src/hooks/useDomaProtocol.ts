// @ts-nocheck
// React Hook for Easy Doma Protocol Integration
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { TokenizationService } from '../services/TokenizationService';
import { DomainManagementService } from '../services/DomainManagementService';
import { OwnershipTokenService } from '../services/OwnershipTokenService';
import { handleDomaError, getErrorMessage, logDomaError } from '../utils/domaErrorHandler';
import { DOMA_CONFIG, TokenMetadata } from '../config/domaConfig';

interface DomaServices {
  tokenization: TokenizationService;
  domain: DomainManagementService;
  token: OwnershipTokenService;
}

interface TokenizationResult {
  transactionHash: string;
  tokenId?: string;
  voucher: any;
}

interface ClaimResult {
  transactionHash: string;
  success: boolean;
}

interface BridgeResult {
  transactionHash: string;
  success: boolean;
}

export const useDomaProtocol = (network: keyof typeof DOMA_CONFIG.networks = 'ethereum') => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [services, setServices] = useState<DomaServices | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize services
  useEffect(() => {
    try {
      const tokenizationService = new TokenizationService(network);
      const domainService = new DomainManagementService(network);
      const tokenService = new OwnershipTokenService(network);
      
      setServices({
        tokenization: tokenizationService,
        domain: domainService,
        token: tokenService
      });
    } catch (err) {
      logDomaError(err, 'Service initialization');
      setError(getErrorMessage(err));
    }
  }, [network]);

  // Connect wallet
  const connectWallet = useCallback(async (): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not installed');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      // Connect all services to the wallet
      if (services) {
        Object.values(services).forEach(service => {
          service.connectWallet(signer);
        });
      }

      setAccount(address);
      setIsConnected(true);
      setLoading(false);
      
      return address;
    } catch (err) {
      const domaError = handleDomaError(err);
      logDomaError(domaError, 'Wallet connection');
      setError(getErrorMessage(domaError));
      setLoading(false);
      throw domaError;
    }
  }, [services]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setError(null);
    
    // Remove event listeners
    if (services?.token) {
      services.token.removeEventListeners();
    }
  }, [services]);

  // Tokenize domains
  const tokenizeDomains = useCallback(async (domainNames: string[]): Promise<TokenizationResult> => {
    if (!services?.tokenization) {
      throw new Error('Services not initialized');
    }

    try {
      setLoading(true);
      setError(null);
      
      // Validate domain names
      const { valid, invalid } = services.tokenization.validateDomainNames(domainNames);
      
      if (invalid.length > 0) {
        throw new Error(`Invalid domain names: ${invalid.join(', ')}`);
      }

      const result = await services.tokenization.requestTokenization(valid);
      setLoading(false);
      return result;
    } catch (err) {
      const domaError = handleDomaError(err);
      logDomaError(domaError, 'Domain tokenization');
      setError(getErrorMessage(domaError));
      setLoading(false);
      throw domaError;
    }
  }, [services]);

  // Claim domain ownership
  const claimOwnership = useCallback(async (tokenId: number, isSynthetic = false): Promise<ClaimResult> => {
    if (!services?.domain) {
      throw new Error('Services not initialized');
    }

    try {
      setLoading(true);
      setError(null);
      const result = await services.domain.claimOwnership(tokenId, isSynthetic);
      setLoading(false);
      return result;
    } catch (err) {
      const domaError = handleDomaError(err);
      logDomaError(domaError, 'Ownership claim');
      setError(getErrorMessage(domaError));
      setLoading(false);
      throw domaError;
    }
  }, [services]);

  // Bridge domain
  const bridgeDomain = useCallback(async (
    tokenId: number, 
    targetChainId: string, 
    targetOwnerAddress: string, 
    isSynthetic = false
  ): Promise<BridgeResult> => {
    if (!services?.domain) {
      throw new Error('Services not initialized');
    }

    try {
      setLoading(true);
      setError(null);
      const result = await services.domain.bridgeDomain(tokenId, targetChainId, targetOwnerAddress, isSynthetic);
      setLoading(false);
      return result;
    } catch (err) {
      const domaError = handleDomaError(err);
      logDomaError(domaError, 'Domain bridging');
      setError(getErrorMessage(domaError));
      setLoading(false);
      throw domaError;
    }
  }, [services]);

  // Request detokenization
  const requestDetokenization = useCallback(async (tokenId: number, isSynthetic = false): Promise<ClaimResult> => {
    if (!services?.domain) {
      throw new Error('Services not initialized');
    }

    try {
      setLoading(true);
      setError(null);
      const result = await services.domain.requestDetokenization(tokenId, isSynthetic);
      setLoading(false);
      return result;
    } catch (err) {
      const domaError = handleDomaError(err);
      logDomaError(domaError, 'Detokenization request');
      setError(getErrorMessage(domaError));
      setLoading(false);
      throw domaError;
    }
  }, [services]);

  // Get token metadata
  const getTokenMetadata = useCallback(async (tokenId: number): Promise<TokenMetadata> => {
    if (!services?.token) {
      throw new Error('Services not initialized');
    }

    try {
      setLoading(true);
      setError(null);
      const metadata = await services.token.getTokenMetadata(tokenId);
      setLoading(false);
      return metadata;
    } catch (err) {
      const domaError = handleDomaError(err);
      logDomaError(domaError, 'Get token metadata');
      setError(getErrorMessage(domaError));
      setLoading(false);
      throw domaError;
    }
  }, [services]);

  // Get multiple token metadata
  const getMultipleTokenMetadata = useCallback(async (tokenIds: number[]): Promise<TokenMetadata[]> => {
    if (!services?.token) {
      throw new Error('Services not initialized');
    }

    try {
      setLoading(true);
      setError(null);
      const metadata = await services.token.getMultipleTokenMetadata(tokenIds);
      setLoading(false);
      return metadata;
    } catch (err) {
      const domaError = handleDomaError(err);
      logDomaError(domaError, 'Get multiple token metadata');
      setError(getErrorMessage(domaError));
      setLoading(false);
      throw domaError;
    }
  }, [services]);

  // Calculate tokenization cost
  const calculateTokenizationCost = useCallback(async (domainNames: string[]) => {
    if (!services?.tokenization) {
      throw new Error('Services not initialized');
    }

    try {
      setError(null);
      return await services.tokenization.calculateTokenizationCost(domainNames);
    } catch (err) {
      const domaError = handleDomaError(err);
      logDomaError(domaError, 'Calculate tokenization cost');
      setError(getErrorMessage(domaError));
      throw domaError;
    }
  }, [services]);

  // Calculate bridge cost
  const calculateBridgeCost = useCallback(async (tokenId: number, targetChainId: string) => {
    if (!services?.domain) {
      throw new Error('Services not initialized');
    }

    try {
      setError(null);
      return await services.domain.calculateBridgeCost(tokenId, targetChainId);
    } catch (err) {
      const domaError = handleDomaError(err);
      logDomaError(domaError, 'Calculate bridge cost');
      setError(getErrorMessage(domaError));
      throw domaError;
    }
  }, [services]);

  // Get supported chains for bridging
  const getSupportedChains = useCallback(async () => {
    if (!services?.domain) {
      throw new Error('Services not initialized');
    }

    try {
      setError(null);
      return await services.domain.getSupportedChains();
    } catch (err) {
      const domaError = handleDomaError(err);
      logDomaError(domaError, 'Get supported chains');
      setError(getErrorMessage(domaError));
      throw domaError;
    }
  }, [services]);

  // Setup event listeners
  const setupEventListeners = useCallback((callbacks: {
    onTokenMinted?: (event: any) => void;
    onTokenRenewed?: (event: any) => void;
    onTokenBurned?: (event: any) => void;
    onLockStatusChanged?: (event: any) => void;
  }) => {
    if (services?.token) {
      services.token.setupEventListeners(callbacks);
    }
  }, [services]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isConnected,
    account,
    loading,
    error,
    services,
    
    // Actions
    connectWallet,
    disconnectWallet,
    tokenizeDomains,
    claimOwnership,
    bridgeDomain,
    requestDetokenization,
    getTokenMetadata,
    getMultipleTokenMetadata,
    calculateTokenizationCost,
    calculateBridgeCost,
    getSupportedChains,
    setupEventListeners,
    clearError
  };
};
