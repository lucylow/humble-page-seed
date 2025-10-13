import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Percent, 
  Clock, 
  Award,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface InvoiceNFT {
  tokenId: number;
  invoiceId: string;
  faceValue: number;
  askingPrice: number;
  discount: number;
  seller: string;
  dueDate: string;
  status: 'listed' | 'sold' | 'expired';
  tradingHistory: number;
  potentialReturn: number;
}

const mockNFTs: InvoiceNFT[] = [
  {
    tokenId: 1,
    invoiceId: '2025-300',
    faceValue: 85000,
    askingPrice: 75000,
    discount: 11.8,
    seller: 'SP2J6ZY...9EJ7',
    dueDate: '2025-12-15',
    status: 'listed',
    tradingHistory: 0,
    potentialReturn: 10000
  },
  {
    tokenId: 2,
    invoiceId: '2025-299',
    faceValue: 42000,
    askingPrice: 38000,
    discount: 9.5,
    seller: 'SP3FBR...5SVTE',
    dueDate: '2025-11-30',
    status: 'listed',
    tradingHistory: 2,
    potentialReturn: 4000
  },
  {
    tokenId: 3,
    invoiceId: '2025-298',
    faceValue: 65000,
    askingPrice: 60000,
    discount: 7.7,
    seller: 'SPAZ8N...42KWV',
    dueDate: '2026-01-10',
    status: 'listed',
    tradingHistory: 1,
    potentialReturn: 5000
  },
];

export const InvoiceNFTMarketplace: React.FC = () => {
  const [selectedNFT, setSelectedNFT] = useState<InvoiceNFT | null>(null);
  const [listingPrice, setListingPrice] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');

  const handleListForSale = () => {
    // Integration with invoice-nft.clar contract
    console.log('Listing NFT for sale:', listingPrice);
  };

  const handlePurchase = (nft: InvoiceNFT) => {
    // Integration with invoice-nft.clar purchase function
    console.log('Purchasing NFT:', nft.tokenId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Invoice NFT Marketplace</h1>
        <p className="text-muted-foreground text-lg">
          Trade tokenized invoice receivables for instant liquidity
        </p>
      </div>

      {/* Marketplace Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">$2.4M</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold">127</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Percent className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Discount</p>
                <p className="text-2xl font-bold">9.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Settlement</p>
                <p className="text-2xl font-bold">45 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="marketplace" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="marketplace">Browse Marketplace</TabsTrigger>
          <TabsTrigger value="my-nfts">My Invoice NFTs</TabsTrigger>
          <TabsTrigger value="list">List for Sale</TabsTrigger>
        </TabsList>

        {/* Browse Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Invoice NFTs</CardTitle>
              <CardDescription>
                Purchase tokenized invoices at a discount and earn when they settle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockNFTs.map((nft) => (
                  <Card key={nft.tokenId} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">Invoice #{nft.invoiceId}</CardTitle>
                          <CardDescription>Token ID: {nft.tokenId}</CardDescription>
                        </div>
                        <Badge variant="default" className="bg-green-600">
                          {nft.discount}% off
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Face Value</span>
                          <span className="font-semibold">${nft.faceValue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Asking Price</span>
                          <span className="font-bold text-lg text-blue-600">
                            ${nft.askingPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Potential Return</span>
                          <span className="font-semibold text-green-600">
                            +${nft.potentialReturn.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Due Date</span>
                          <span>{nft.dueDate}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Seller</span>
                          <span className="font-mono">{nft.seller}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Trading History</span>
                          <Badge variant="outline">{nft.tradingHistory} trades</Badge>
                        </div>
                      </div>

                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                        onClick={() => handlePurchase(nft)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Purchase NFT
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My NFTs Tab */}
        <TabsContent value="my-nfts">
          <Card>
            <CardHeader>
              <CardTitle>Your Invoice NFT Portfolio</CardTitle>
              <CardDescription>
                Manage your tokenized invoice receivables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  You don't own any invoice NFTs yet
                </p>
                <Button variant="outline">Browse Marketplace</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* List for Sale Tab */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>List Invoice NFT for Sale</CardTitle>
              <CardDescription>
                Tokenize your invoice and list it on the marketplace for instant liquidity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="invoice-select">Select Invoice</Label>
                    <select
                      id="invoice-select"
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      <option>Invoice #2025-300 - $85,000</option>
                      <option>Invoice #2025-299 - $42,000</option>
                      <option>Invoice #2025-298 - $65,000</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="asking-price">Asking Price (USD)</Label>
                    <Input
                      id="asking-price"
                      type="number"
                      placeholder="75000"
                      value={listingPrice}
                      onChange={(e) => setListingPrice(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Listing Duration</Label>
                    <select
                      id="duration"
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      <option>7 days</option>
                      <option>14 days</option>
                      <option>30 days</option>
                      <option>Until sold</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <Button 
                      className="w-full bg-gradient-to-r from-orange-500 to-purple-600"
                      onClick={handleListForSale}
                    >
                      Mint & List NFT
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
                    <CardHeader>
                      <CardTitle className="text-lg">Benefits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Instant Liquidity</p>
                          <p className="text-xs text-muted-foreground">
                            Get paid now instead of waiting 30-90 days
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Peer-to-Peer Trading</p>
                          <p className="text-xs text-muted-foreground">
                            Direct marketplace, no middlemen fees
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Bitcoin-Native</p>
                          <p className="text-xs text-muted-foreground">
                            Secured by Bitcoin via Stacks blockchain
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">2.5% Platform Fee</p>
                          <p className="text-xs text-muted-foreground">
                            Only charged on successful sales
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <DollarSign className="w-12 h-12 mx-auto text-orange-600 mb-2" />
                        <p className="text-sm font-semibold mb-1">Estimated Returns</p>
                        <p className="text-3xl font-bold text-orange-600 mb-1">8-12%</p>
                        <p className="text-xs text-muted-foreground">
                          For buyers purchasing at typical discounts
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* How It Works Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How Invoice NFT Trading Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Mint NFT</h3>
              <p className="text-sm text-muted-foreground">
                Convert your approved invoice into a tradeable NFT token
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">List for Sale</h3>
              <p className="text-sm text-muted-foreground">
                Set your asking price and list on the marketplace
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Get Paid</h3>
              <p className="text-sm text-muted-foreground">
                Receive immediate payment when a buyer purchases your NFT
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">4</span>
              </div>
              <h3 className="font-semibold mb-2">Settlement</h3>
              <p className="text-sm text-muted-foreground">
                Buyer receives full face value when invoice settles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceNFTMarketplace;

