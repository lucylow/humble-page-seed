import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ethers, parseEther, formatEther } from 'ethers';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DomaLandOfferManagerABI, 
  DomaLandPageRegistryABI,
  DOMA_MARKETPLACE_ABI 
} from '@/config/contracts';
import { 
  DOMA_OFFER_MANAGER_ADDRESS, 
  DOMA_PAGE_REGISTRY_ADDRESS,
  DOMA_MARKETPLACE_ADDRESS 
} from '@/config/constants';

interface DomainData {
  name: string;
  description?: string;
  imageUrl?: string;
  aiValuation?: number;
  tokenId: string;
  nftContract: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  owner?: string;
  isActive?: boolean;
}

interface Offer {
  buyer: string;
  paymentToken: string;
  amount: string;
  expirationTime: number;
  fulfilled: boolean;
  canceled: boolean;
}

interface ListingInfo {
  seller: string;
  price: string;
  isActive: boolean;
  expirationTime: number;
}

const DomainLandingPage: React.FC = () => {
  const { domainId } = useParams<{ domainId: string }>();
  const { isConnected, account, connectWallet } = useWeb3();
  
  const [domainData, setDomainData] = useState<DomainData | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [listingInfo, setListingInfo] = useState<ListingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userOffer, setUserOffer] = useState('');
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDomainData = useCallback(async () => {
    try {
      // For now, we'll use mock data since we don't have the actual contracts deployed
      // In production, this would fetch from the Doma protocol
      const mockDomainData: DomainData = {
        name: `domain-${domainId}.doma`,
        description: `Premium domain ${domainId} available for investment on DomaLand.AI`,
        imageUrl: `https://via.placeholder.com/400x200/6366f1/ffffff?text=${domainId}`,
        aiValuation: Math.floor(Math.random() * 100000) + 10000,
        tokenId: domainId,
        nftContract: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        attributes: [
          { trait_type: 'Length', value: domainId.length },
          { trait_type: 'Rarity', value: 'Premium' },
          { trait_type: 'Category', value: 'Business' },
          { trait_type: 'TLD', value: 'doma' }
        ],
        owner: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        isActive: true
      };

      setDomainData(mockDomainData);
    } catch (error) {
      console.error('Error fetching domain data:', error);
      setError('Failed to load domain information');
    }
  }, [domainId]);

  const fetchMarketData = useCallback(async () => {
    try {
      // Mock offers data
      const mockOffers: Offer[] = [
        {
          buyer: '0x1234567890123456789012345678901234567890',
          paymentToken: '0x0000000000000000000000000000000000000000',
          amount: parseEther('1.5').toString(),
          expirationTime: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
          fulfilled: false,
          canceled: false
        },
        {
          buyer: '0x0987654321098765432109876543210987654321',
          paymentToken: '0x0000000000000000000000000000000000000000',
          amount: parseEther('2.0').toString(),
          expirationTime: Math.floor(Date.now() / 1000) + 5 * 24 * 60 * 60,
          fulfilled: false,
          canceled: false
        }
      ];

      setOffers(mockOffers);

      // Mock listing info
      const mockListing: ListingInfo = {
        seller: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        price: parseEther('3.5').toString(),
        isActive: true,
        expirationTime: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
      };

      setListingInfo(mockListing);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setError('Failed to load market data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (domainId) {
      fetchDomainData();
      fetchMarketData();
    }
  }, [domainId, fetchDomainData, fetchMarketData]);

  const makeOffer = async () => {
    if (!isConnected || !userOffer) return;

    setIsSubmittingOffer(true);
    try {
      // In production, this would interact with the actual smart contract
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction
      
      alert('Offer submitted successfully!');
      setUserOffer('');
      fetchMarketData(); // Refresh offers
    } catch (error) {
      console.error('Error making offer:', error);
      alert('Error submitting offer');
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  const buyNow = async () => {
    if (!isConnected) return;

    setIsPurchasing(true);
    try {
      // In production, this would interact with the actual smart contract
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction
      
      alert('Purchase successful!');
    } catch (error) {
      console.error('Error purchasing domain:', error);
      alert('Error completing purchase');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <Skeleton className="h-8 w-64 mb-2 bg-white/20" />
              <Skeleton className="h-6 w-96 bg-white/20" />
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-32 w-full" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!domainData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🌐</div>
            <h2 className="text-2xl font-bold mb-2">Domain Not Found</h2>
            <p className="text-muted-foreground">The domain you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-indigo-600">DomaLand.AI</div>
            {!isConnected && (
              <Button
                onClick={() => connectWallet()}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Connect Wallet
              </Button>
            )}
            {isConnected && (
              <Badge variant="outline" className="px-3 py-1">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Domain Header */}
          <div className="p-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <h1 className="text-4xl font-bold mb-2">{domainData.name}</h1>
            <p className="text-indigo-100 text-lg">
              {domainData.description || 'Premium domain available for investment'}
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Left Column - Domain Info */}
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Domain Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TLD</span>
                    <span className="font-medium">.{domainData.name.split('.').pop()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AI Valuation</span>
                    <span className="font-medium text-green-600">
                      ${domainData.aiValuation?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token ID</span>
                    <span className="font-mono">{domainData.tokenId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner</span>
                    <span className="font-mono text-sm">
                      {domainData.owner?.slice(0, 8)}...{domainData.owner?.slice(-6)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attributes */}
              {domainData.attributes && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">Attributes</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {domainData.attributes.map((attr, index) => (
                      <div key={index} className="bg-muted/50 rounded-lg p-3">
                        <div className="text-sm text-muted-foreground">{attr.trait_type}</div>
                        <div className="font-medium">{attr.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Trading */}
            <div>
              {/* Buy Now Section */}
              {listingInfo && listingInfo.isActive && (
                <Card className="mb-8 border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-800">Buy Now</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-green-700">
                        {formatEther(listingInfo.price)} ETH
                      </span>
                      <Button
                        onClick={buyNow}
                        disabled={!isConnected || isPurchasing}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        {isPurchasing ? 'Processing...' : 'Buy Now'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Make Offer Section */}
              <Card className="mb-8 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-800">Make an Offer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      type="number"
                      placeholder="Offer amount (ETH)"
                      value={userOffer}
                      onChange={(e) => setUserOffer(e.target.value)}
                      disabled={!isConnected}
                    />
                    <Button
                      onClick={makeOffer}
                      disabled={!isConnected || !userOffer || isSubmittingOffer}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {isSubmittingOffer ? 'Submitting...' : 
                       isConnected ? 'Submit Offer' : 'Connect Wallet to Offer'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Current Offers */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Offers</CardTitle>
                </CardHeader>
                <CardContent>
                  {offers.length > 0 ? (
                    <div className="space-y-3">
                      {offers.slice(0, 5).map((offer, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span className="font-mono text-sm">
                            {offer.buyer.substring(0, 8)}...
                          </span>
                          <span className="font-semibold">
                            {formatEther(offer.amount)} ETH
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No offers yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="px-8 pb-8">
            <h3 className="text-xl font-semibold mb-4">Domain Analytics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">1.2K</div>
                <div className="text-muted-foreground">Monthly Visits</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">4.2%</div>
                <div className="text-muted-foreground">Conversion Rate</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">$3.8K</div>
                <div className="text-muted-foreground">Estimated Revenue</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">84</div>
                <div className="text-muted-foreground">Page Authority</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DomainLandingPage;