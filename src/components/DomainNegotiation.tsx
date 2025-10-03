import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Handshake, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  ExternalLink,
  Copy,
  Wallet
} from 'lucide-react';
import TradeChat from './TradeChat';
import OnChainLinks from './OnChainLinks';

interface DomainNegotiationProps {
  domainId: string;
  domainName: string;
  domainPrice: string;
  ownerAddress: string;
  className?: string;
}

interface Offer {
  id: string;
  amount: string;
  token: string;
  from: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt?: Date;
}

const DomainNegotiation: React.FC<DomainNegotiationProps> = ({
  domainId,
  domainName,
  domainPrice,
  ownerAddress,
  className
}) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [offerAmount, setOfferAmount] = useState('');
  const [offerToken, setOfferToken] = useState('ETH');
  const [offerExpiry, setOfferExpiry] = useState('7');
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [showOfferSuccess, setShowOfferSuccess] = useState(false);

  // Mock offers data
  const [offers] = useState<Offer[]>([
    {
      id: 'offer-1',
      amount: '4.5',
      token: 'ETH',
      from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'pending',
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'offer-2',
      amount: '5.0',
      token: 'ETH',
      from: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      status: 'pending',
      expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
    }
  ]);

  const handleSubmitOffer = async () => {
    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      return;
    }

    setIsSubmittingOffer(true);
    
    try {
      // Simulate offer submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowOfferSuccess(true);
      setOfferAmount('');
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowOfferSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to submit offer:', error);
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString();
  };

  const getStatusColor = (status: Offer['status']) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: Offer['status']) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      case 'expired':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const calculateOfferTrend = () => {
    if (offers.length < 2) return 'neutral';
    const latest = parseFloat(offers[0].amount);
    const previous = parseFloat(offers[1].amount);
    return latest > previous ? 'up' : latest < previous ? 'down' : 'neutral';
  };

  const trend = calculateOfferTrend();

  return (
    <div className={className}>
      {/* Domain Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{domainName}</CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  Listed: {domainPrice}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Owner: {formatAddress(ownerAddress)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Market Trend</div>
              <div className="flex items-center gap-1">
                {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                {trend === 'neutral' && <div className="w-4 h-4 bg-gray-400 rounded-full" />}
                <span className="text-sm font-medium">
                  {offers.length} active offers
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Chat & Negotiate
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Offers ({offers.length})
          </TabsTrigger>
          <TabsTrigger value="blockchain" className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            On-Chain Data
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TradeChat
              domainId={domainId}
              domainName={domainName}
              domainPrice={domainPrice}
              peerAddress={ownerAddress}
            />
            
            {/* Quick Offer Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="w-5 h-5" />
                  Quick Offer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {showOfferSuccess && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Offer submitted successfully! The seller has been notified.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Offer Amount</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder="0.0"
                      step="0.001"
                      className="flex-1"
                    />
                    <select
                      value={offerToken}
                      onChange={(e) => setOfferToken(e.target.value)}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="ETH">ETH</option>
                      <option value="USDC">USDC</option>
                      <option value="USDT">USDT</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Offer Expiry</label>
                  <select
                    value={offerExpiry}
                    onChange={(e) => setOfferExpiry(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="1">1 day</option>
                    <option value="3">3 days</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                  </select>
                </div>

                <Button
                  onClick={handleSubmitOffer}
                  disabled={!offerAmount || isSubmittingOffer}
                  className="w-full"
                >
                  {isSubmittingOffer ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Submit Offer
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  Your offer will be visible to the seller and other potential buyers
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Offers Tab */}
        <TabsContent value="offers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Active Offers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {offers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No offers yet</p>
                  <p className="text-sm">Be the first to make an offer!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className={`p-4 rounded-lg border ${getStatusColor(offer.status)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(offer.status)}
                          <span className="font-semibold">
                            {offer.amount} {offer.token}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {offer.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatTime(offer.timestamp)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          From: {formatAddress(offer.from)}
                        </div>
                        {offer.expiresAt && (
                          <div className="text-sm text-muted-foreground">
                            Expires: {formatTime(offer.expiresAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blockchain Tab */}
        <TabsContent value="blockchain">
          <OnChainLinks
            domainId={domainId}
            tokenId="123"
            contractAddress="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
            ownerAddress={ownerAddress}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DomainNegotiation;


