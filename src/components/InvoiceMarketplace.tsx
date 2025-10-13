import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award, TrendingUp, Clock, AlertCircle, Gavel } from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';

interface InvoiceNFT {
  tokenId: number;
  invoiceId: number;
  amount: number;
  currency: string;
  dueDate: number;
  debtor: string;
  riskScore: number;
  listing?: {
    seller: string;
    askPrice: number;
    isAuction: boolean;
    highestBid?: number;
    highestBidder?: string;
    auctionEnd?: number;
  };
}

const InvoiceMarketplace: React.FC = () => {
  const { isConnected } = useWalletStore();
  const [invoices, setInvoices] = useState<InvoiceNFT[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceNFT | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'auction' | 'fixed'>('all');

  useEffect(() => {
    loadListedInvoices();
  }, []);

  const loadListedInvoices = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockInvoices: InvoiceNFT[] = [
        {
          tokenId: 1,
          invoiceId: 2025001,
          amount: 0.85,
          currency: 'sBTC',
          dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
          debtor: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
          riskScore: 3,
          listing: {
            seller: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
            askPrice: 0.75,
            isAuction: true,
            highestBid: 0.70,
            highestBidder: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
            auctionEnd: Date.now() + 2 * 24 * 60 * 60 * 1000
          }
        },
        {
          tokenId: 2,
          invoiceId: 2025002,
          amount: 1.2,
          currency: 'sBTC',
          dueDate: Date.now() + 45 * 24 * 60 * 60 * 1000,
          debtor: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ8',
          riskScore: 2,
          listing: {
            seller: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
            askPrice: 1.1,
            isAuction: false
          }
        },
        {
          tokenId: 3,
          invoiceId: 2025003,
          amount: 0.42,
          currency: 'sBTC',
          dueDate: Date.now() + 60 * 24 * 60 * 60 * 1000,
          debtor: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ9',
          riskScore: 5,
          listing: {
            seller: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
            askPrice: 0.38,
            isAuction: false
          }
        }
      ];
      
      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const placeBid = async (tokenId: number, amount: string) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      // In production, call smart contract:
      // await callPublicFunction({
      //   contractAddress,
      //   contractName: 'invoice-nft-marketplace',
      //   functionName: 'place-bid',
      //   functionArgs: [types.uint(tokenId), types.uint(parseFloat(amount) * 1000000)]
      // });
      
      alert(`Bid of ${amount} STX placed successfully!`);
      loadListedInvoices();
    } catch (error: any) {
      console.error('Bid failed:', error);
      alert('Bid failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const buyInvoice = async (tokenId: number, askPrice: number) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      // In production, call smart contract
      alert(`Invoice purchased for ${askPrice} sBTC!`);
      loadListedInvoices();
    } catch (error: any) {
      console.error('Purchase failed:', error);
      alert('Purchase failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-600 bg-green-100';
    if (score <= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (activeTab === 'all') return true;
    if (activeTab === 'auction') return invoice.listing?.isAuction;
    if (activeTab === 'fixed') return !invoice.listing?.isAuction;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Invoice Receivables Marketplace</h1>
        <p className="text-muted-foreground text-lg">
          Trade tokenized invoices for instant liquidity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Award className="w-10 h-10 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">$2.4M</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-10 h-10 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Gavel className="w-10 h-10 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Auctions</p>
                <p className="text-2xl font-bold">
                  {invoices.filter(inv => inv.listing?.isAuction).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="w-10 h-10 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Discount</p>
                <p className="text-2xl font-bold">12.3%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveTab('all')}
        >
          All Listings
        </Button>
        <Button
          variant={activeTab === 'auction' ? 'default' : 'outline'}
          onClick={() => setActiveTab('auction')}
        >
          Auctions
        </Button>
        <Button
          variant={activeTab === 'fixed' ? 'default' : 'outline'}
          onClick={() => setActiveTab('fixed')}
        >
          Fixed Price
        </Button>
      </div>

      {/* Invoice Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading invoices...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.tokenId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>Invoice #{invoice.invoiceId}</CardTitle>
                  <Badge className={getRiskColor(invoice.riskScore)}>
                    Risk: {invoice.riskScore}/10
                  </Badge>
                </div>
                <CardDescription>
                  Token ID: {invoice.tokenId}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="font-semibold">{invoice.amount} {invoice.currency}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Due:</span>
                    <span className="font-semibold">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Debtor:</span>
                    <span className="font-mono text-xs">
                      {invoice.debtor.substring(0, 8)}...
                    </span>
                  </div>
                </div>

                {invoice.listing?.isAuction ? (
                  <div className="space-y-3 border-t pt-3">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Gavel className="w-4 h-4" />
                      <span className="text-sm font-semibold">Auction</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Bid:</span>
                      <span className="font-bold text-blue-600">
                        {invoice.listing.highestBid} sBTC
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Ends in:</span>
                      <span className="text-sm">
                        {Math.ceil((invoice.listing.auctionEnd! - Date.now()) / (24 * 60 * 60 * 1000))} days
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Your bid (sBTC)"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        step="0.01"
                      />
                      <Button 
                        onClick={() => placeBid(invoice.tokenId, bidAmount)}
                        disabled={!bidAmount || parseFloat(bidAmount) <= (invoice.listing.highestBid || 0)}
                      >
                        Bid
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Fixed Price:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {invoice.listing?.askPrice} sBTC
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount:</span>
                      <span className="text-green-600 font-semibold">
                        {((1 - (invoice.listing!.askPrice / invoice.amount)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={() => buyInvoice(invoice.tokenId, invoice.listing!.askPrice)}
                    >
                      Buy Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isConnected && (
        <Card className="mt-8 bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <p className="text-yellow-800">
                Connect your wallet to trade invoice NFTs
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvoiceMarketplace;

