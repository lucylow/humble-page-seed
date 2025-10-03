import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Wallet, CreditCard, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

interface Domain {
  name: string;
  price: string;
  currency: string;
}

interface HybridPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain: Domain | null;
}

export const HybridPaymentModal: React.FC<HybridPaymentModalProps> = ({
  open,
  onOpenChange,
  domain
}) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'web3' | 'web2' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Web2 form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const ETH_TO_USD = 3500;
  const PLATFORM_FEE = 0.02;
  const GATEWAY_FEE = 0.015;

  const calculateWeb2Pricing = () => {
    if (!domain) return null;
    const ethPrice = parseFloat(domain.price);
    const subtotal = ethPrice * ETH_TO_USD;
    const platformFee = subtotal * PLATFORM_FEE;
    const gatewayFee = subtotal * GATEWAY_FEE;
    const total = subtotal + platformFee + gatewayFee;

    return {
      subtotal: subtotal.toFixed(2),
      platformFee: platformFee.toFixed(2),
      gatewayFee: gatewayFee.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const handleWeb3Payment = async () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      toast({
        title: "Payment Initiated",
        description: "Please confirm the transaction in your Web3 wallet",
      });
      setTimeout(() => {
        onOpenChange(false);
        resetModal();
      }, 2000);
    }, 1500);
  };

  const handleWeb2Payment = async () => {
    if (!cardNumber || !expiry || !cvv || !cardName || !billingAddress || !agreeTerms) {
      toast({
        title: "Missing Information",
        description: "Please fill in all payment details and accept the terms",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      toast({
        title: "Purchase Complete! 🎉",
        description: `${domain?.name} has been transferred to your DomaLand.AI wallet`,
      });
      setTimeout(() => {
        onOpenChange(false);
        resetModal();
      }, 2000);
    }, 2000);
  };

  const resetModal = () => {
    setPaymentMethod(null);
    setSuccess(false);
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setCardName('');
    setBillingAddress('');
    setAgreeTerms(false);
  };

  if (!domain) return null;

  const pricing = calculateWeb2Pricing();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {success ? '🎉 Purchase Complete!' : `Purchase ${domain.name}`}
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6 text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-green-900">
                  Congratulations!
                </h3>
                <p className="text-green-700 mt-2">
                  Your purchase of <strong>{domain.name}</strong> is complete!
                </p>
                <p className="text-sm text-green-600 mt-2">
                  The domain NFT has been transferred to your DomaLand.AI wallet.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : !paymentMethod ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Choose your preferred payment method to acquire this tokenized domain
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card 
                className="cursor-pointer hover:border-primary transition-all hover:shadow-md"
                onClick={() => setPaymentMethod('web3')}
              >
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Wallet className="h-8 w-8 text-primary" />
                    <Badge variant="outline" className="bg-primary/10">Web3</Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Pay with Crypto</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Use ETH, USDC, or other supported tokens
                    </p>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      ✓ Requires Web3 wallet connection
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ✓ Lower fees
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ✓ Direct blockchain ownership
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:border-primary transition-all hover:shadow-md"
                onClick={() => setPaymentMethod('web2')}
              >
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <CreditCard className="h-8 w-8 text-primary" />
                    <Badge variant="outline" className="bg-secondary/10">Web2</Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Pay with Card</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Credit card, debit card, or bank transfer
                    </p>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      ✓ No crypto wallet needed
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ✓ Traditional payment method
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ✓ Custodial wallet provided
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : paymentMethod === 'web3' ? (
          <div className="space-y-6">
            <Alert>
              <Wallet className="h-4 w-4" />
              <AlertDescription>
                Connect your Web3 wallet to complete this purchase using cryptocurrency
              </AlertDescription>
            </Alert>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Domain:</span>
                  <span className="font-semibold">{domain.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-semibold text-lg">{domain.price} {domain.currency}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold">{domain.price} {domain.currency}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setPaymentMethod(null)}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleWeb3Payment} disabled={processing}>
                {processing ? 'Processing...' : 'Connect Wallet & Pay'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="bg-muted/50">
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Domain:</span>
                  <span className="font-semibold">{domain.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Listed Price:</span>
                  <span className="font-semibold">{domain.price} {domain.currency}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Exchange Rate:</span>
                  <span className="font-semibold">1 ETH = ${ETH_TO_USD.toLocaleString()} USD</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>${pricing?.subtotal}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Platform Fee (2%):</span>
                  <span>${pricing?.platformFee}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Payment Gateway Fee (1.5%):</span>
                  <span>${pricing?.gatewayFee}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold">Total Due:</span>
                  <span className="font-bold text-primary">${pricing?.total} USD</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Secure Payment via Stripe</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry (MM/YY)</Label>
                  <Input
                    id="expiry"
                    placeholder="12/27"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    type="password"
                    maxLength={3}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName">Name on Card</Label>
                <Input
                  id="cardName"
                  placeholder="Jane Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing">Billing Address</Label>
                <Input
                  id="billing"
                  placeholder="123 Main St, Anytown, USA"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  I agree to the Terms & Conditions
                </label>
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-xs">
                Your domain NFT will be transferred to a custodial DomaLand.AI wallet. You can connect a non-custodial wallet anytime to take full control.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setPaymentMethod(null)}>
                Back
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleWeb2Payment} 
                disabled={processing || !agreeTerms}
              >
                {processing ? 'Processing Payment...' : 'Confirm Web2 Payment'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
