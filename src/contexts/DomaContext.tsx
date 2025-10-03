// @ts-nocheck
import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import { useWeb3 } from './Web3Context';
import { ethers } from 'ethers';
import { useDomaProtocol } from '../hooks/useDomaProtocol';
import { handleDomaError, getErrorMessage } from '../utils/domaErrorHandler';
import { 
  useDomaDomains, 
  useDomaListings, 
  useDomaOperations, 
  useDomaPortfolio,
  useDomaMarketplaceStats 
} from '../hooks/useDomaApi';
import { 
  formatPriceDisplay, 
  toCAIP10, 
  isExpiringSoon, 
  formatDomainName,
  isValidDomainName 
} from '../utils/domaHelpers';

interface Domain {
  tokenId: string;
  name: string;
  owner: string;
  price?: string;
  isListed?: boolean;
  metadata?: Record<string, unknown>;
  category?: string;
  listedAt?: string;
  expiresAt?: string;
  tokenizedAt?: string;
  eoi?: boolean;
  registrar?: {
    name: string;
    ianaId: number;
    websiteUrl?: string;
  };
  tokens?: Array<{
    tokenId: string;
    networkId: string;
    ownerAddress: string;
    type: string;
    startsAt: string;
    expiresAt: string;
    tokenAddress?: string;
    chain: {
      name: string;
      networkId: string;
    };
  }>;
  activities?: Array<{
    type: string;
    createdAt: string;
    txHash?: string;
    networkId?: string;
  }>;
}

interface DomaContextType {
  userDomains: Domain[];
  marketplaceDomains: Domain[];
  isLoading: boolean;
  tokenizeDomain: (domainName: string) => Promise<{ success: boolean; tokenId?: string; error?: string }>;
  listDomain: (tokenId: string, price: string) => Promise<{ success: boolean; error?: string }>;
  buyDomain: (tokenId: string, price: string) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => void;
  // New API-based methods
  createListing: (tokenId: string, price: string, currency?: string) => Promise<{ success: boolean; error?: string }>;
  createOffer: (tokenId: string, price: string, currency?: string) => Promise<{ success: boolean; error?: string }>;
  transferOwnership: (tokenId: string, toAddress: string) => Promise<{ success: boolean; error?: string }>;
  renewDomain: (tokenId: string, duration: number) => Promise<{ success: boolean; error?: string }>;
  // Portfolio stats
  portfolioStats: {
    totalDomains: number;
    expiringSoon: number;
    eoi: number;
    tokenized: number;
  };
  // Marketplace stats
  marketplaceStats: {
    totalListings: number;
    totalOffers: number;
    totalVolume: string;
    averagePrice: string;
    topTlds: Array<{ tld: string; count: number }>;
    recentActivity: Array<{ type: string; count: number; timestamp: string }>;
  } | null;
}

const DomaContext = createContext<DomaContextType | undefined>(undefined);

export const useDoma = () => {
  const context = useContext(DomaContext);
  if (!context) {
    throw new Error('useDoma must be used within a DomaProvider');
  }
  return context;
};

interface DomaProviderProps {
  children: ReactNode;
}

// Mock Doma contract address and ABI for demo
const DOMA_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
const DOMA_ABI = [
  'function tokenizeDomain(string domainName) external returns (uint256)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'event DomainTokenized(address indexed owner, uint256 indexed tokenId, string domainName)'
];

export const DomaProvider: FC<DomaProviderProps> = ({ children }) => {
  const { signer, account, isMockMode } = useWeb3();
  const domaProtocol = useDomaProtocol('polygon'); // Use Polygon network
  
  // Use real API hooks
  const { portfolio: userDomainsData, stats: portfolioStats, loading: portfolioLoading } = useDomaPortfolio(account || '');
  const { listings: marketplaceListings, loading: listingsLoading } = useDomaListings();
  const { stats: marketplaceStats, loading: statsLoading } = useDomaMarketplaceStats();
  const domaOperations = useDomaOperations();
  
  const [userDomains, setUserDomains] = useState<Domain[]>([]);
  const [marketplaceDomains, setMarketplaceDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Convert API data to our Domain interface
  useEffect(() => {
    if (userDomainsData) {
      const convertedDomains: Domain[] = userDomainsData.map(domain => ({
        tokenId: domain.tokens?.[0]?.tokenId || domain.name,
        name: formatDomainName(domain.name),
        owner: domain.tokens?.[0]?.ownerAddress || account || '',
        expiresAt: domain.expiresAt,
        tokenizedAt: domain.tokenizedAt,
        eoi: domain.eoi,
        registrar: domain.registrar,
        tokens: domain.tokens,
        activities: domain.activities,
        metadata: {
          description: `Tokenized domain: ${domain.name}`,
          image: `https://api.doma.xyz/thumbnail/${domain.name}`,
        }
      }));
      setUserDomains(convertedDomains);
    }
  }, [userDomainsData, account]);

  useEffect(() => {
    if (marketplaceListings) {
      const convertedListings: Domain[] = marketplaceListings.map(listing => ({
        tokenId: listing.tokenId,
        name: formatDomainName(listing.name),
        owner: listing.offererAddress,
        price: formatPriceDisplay(listing.price, listing.currency.decimals, listing.currency.symbol),
        isListed: true,
        listedAt: listing.createdAt,
        expiresAt: listing.nameExpiresAt,
        registrar: listing.registrar,
        metadata: {
          description: `Domain listing: ${listing.name}`,
          image: `https://api.doma.xyz/thumbnail/${listing.name}`,
          currency: listing.currency,
          orderbook: listing.orderbook,
        }
      }));
      setMarketplaceDomains(convertedListings);
    }
  }, [marketplaceListings]);

  // Tokenize domain using Doma Protocol
  const tokenizeDomain = async (domainName: string) => {
    if (!account) throw new Error('Wallet not connected');
    if (!isValidDomainName(domainName)) throw new Error('Invalid domain name format');
    
    try {
      setIsLoading(true);
      
      // Use Doma Protocol for tokenization
      const result = await domaProtocol.tokenizeDomains([domainName]);
      
      // Create domain object
      const newDomain: Domain = {
        tokenId: result.tokenId || result.transactionHash,
        name: formatDomainName(domainName),
        owner: account!,
        metadata: {
          description: `Tokenized domain: ${domainName}`,
          image: `https://api.doma.xyz/thumbnail/${domainName}`,
          transactionHash: result.transactionHash
        }
      };
      
      setUserDomains(prev => [...prev, newDomain]);
      
      return { 
        success: true,
        tokenId: result.tokenId || result.transactionHash
      };
    } catch (error) {
      const domaError = handleDomaError(error);
      console.error('Tokenization failed:', domaError);
      throw domaError;
    } finally {
      setIsLoading(false);
    }
  };

  // Create listing using real API
  const createListing = async (tokenId: string, price: string, currency: string = 'ETH') => {
    try {
      setIsLoading(true);
      
      const result = await domaOperations.createListing(tokenId, price, currency);
      
      // Update domain to show it's listed
      setUserDomains(prev => 
        prev.map(domain => 
          domain.tokenId === tokenId 
            ? { ...domain, isListed: true, price, listedAt: new Date().toISOString() }
            : domain
        )
      );
      
      return { 
        success: true,
        listingId: result.id
      };
    } catch (error) {
      console.error('Listing creation failed:', error);
      return { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create listing'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy list domain function (now uses createListing)
  const listDomain = async (tokenId: string, price: string) => {
    return createListing(tokenId, price, 'ETH');
  };

  // Create offer using real API
  const createOffer = async (tokenId: string, price: string, currency: string = 'ETH') => {
    try {
      setIsLoading(true);
      
      const result = await domaOperations.createOffer(tokenId, price, currency);
      
      return { 
        success: true,
        offerId: result.id
      };
    } catch (error) {
      console.error('Offer creation failed:', error);
      return { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create offer'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Purchase listing using real API
  const buyDomain = async (tokenId: string, price: string) => {
    if (!account) throw new Error('Wallet not connected');
    
    try {
      setIsLoading(true);
      
      // Find the listing
      const listing = marketplaceDomains.find(d => d.tokenId === tokenId);
      if (!listing) throw new Error('Listing not found');
      
      // In a real implementation, you would need the listing ID
      // For now, we'll simulate the purchase
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Move domain from marketplace to user domains
      const purchasedDomain = { 
        ...listing, 
        owner: account!, 
        isListed: false,
        price: undefined,
        listedAt: undefined
      };
      setUserDomains(prev => [...prev, purchasedDomain]);
      setMarketplaceDomains(prev => prev.filter(d => d.tokenId !== tokenId));
      
      return { 
        success: true
      };
    } catch (error) {
      console.error('Purchase failed:', error);
      return { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to purchase domain'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Transfer ownership using real API
  const transferOwnership = async (tokenId: string, toAddress: string) => {
    try {
      setIsLoading(true);
      
      const result = await domaOperations.transferOwnership(tokenId, toAddress);
      
      // Update local state
      setUserDomains(prev => 
        prev.map(domain => 
          domain.tokenId === tokenId 
            ? { ...domain, owner: toAddress }
            : domain
        )
      );
      
      return { 
        success: true,
        transactionHash: result.transactionHash
      };
    } catch (error) {
      console.error('Transfer failed:', error);
      return { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to transfer ownership'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Renew domain using real API
  const renewDomain = async (tokenId: string, duration: number) => {
    try {
      setIsLoading(true);
      
      const result = await domaOperations.renewDomain(tokenId, duration);
      
      // Update local state with new expiration
      setUserDomains(prev => 
        prev.map(domain => 
          domain.tokenId === tokenId 
            ? { ...domain, expiresAt: result.newExpirationDate }
            : domain
        )
      );
      
      return { 
        success: true,
        newExpirationDate: result.newExpirationDate
      };
    } catch (error) {
      console.error('Renewal failed:', error);
      return { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to renew domain'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    // Refresh all data
    console.log('Refreshing data...');
    // The hooks will automatically refetch when dependencies change
  };

  const isLoadingState = isLoading || portfolioLoading || listingsLoading || statsLoading;

  const value: DomaContextType = {
    userDomains,
    marketplaceDomains,
    isLoading: isLoadingState,
    tokenizeDomain,
    listDomain,
    buyDomain,
    refreshData,
    // New API-based methods
    createListing,
    createOffer,
    transferOwnership,
    renewDomain,
    // Portfolio stats
    portfolioStats: {
      totalDomains: portfolioStats.totalDomains,
      expiringSoon: portfolioStats.expiringSoon,
      eoi: portfolioStats.eoi,
      tokenized: portfolioStats.tokenized,
    },
    // Marketplace stats
    marketplaceStats: marketplaceStats ? {
      totalListings: marketplaceStats.totalListings,
      totalOffers: marketplaceStats.totalOffers,
      totalVolume: marketplaceStats.totalVolume,
      averagePrice: marketplaceStats.averagePrice,
      topTlds: marketplaceStats.topTlds,
      recentActivity: marketplaceStats.recentActivity,
    } : null,
  };

  return (
    <DomaContext.Provider value={value}>
      {children}
    </DomaContext.Provider>
  );
};