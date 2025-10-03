import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, ArrowLeft, X } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  target?: string; // CSS selector for highlighting
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to DomainFi! 🎉',
      description: 'Let\'s take a quick tour to get you started with domain tokenization.',
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🌐</div>
            <p className="text-muted-foreground">
              Transform your domains into liquid digital assets on the blockchain
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Tokenize domains</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Trade on marketplace</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Fractional ownership</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>DeFi integration</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'connect-wallet',
      title: 'Connect Your Wallet',
      description: 'First, you\'ll need to connect your Web3 wallet to interact with the platform.',
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-4">🔗</div>
            <p className="text-muted-foreground">
              Your wallet is your gateway to the decentralized web
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">1</span>
              </div>
              <span className="text-sm">Click "Connect Wallet" button</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">2</span>
              </div>
              <span className="text-sm">Select your preferred wallet (MetaMask, etc.)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">3</span>
              </div>
              <span className="text-sm">Approve the connection request</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tokenize-domain',
      title: 'Tokenize Your Domain',
      description: 'Convert your domain ownership into a blockchain token.',
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-4">🚀</div>
            <p className="text-muted-foreground">
              Turn your domain into a tradeable digital asset
            </p>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-2">Benefits of Tokenization:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Immutable proof of ownership</li>
                <li>• Enable trading and liquidity</li>
                <li>• Fractional ownership opportunities</li>
                <li>• Integration with DeFi protocols</li>
              </ul>
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Note:</strong> You must own the domain to tokenize it. The process creates a non-fungible token (NFT) representing your domain ownership.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'marketplace',
      title: 'Explore the Marketplace',
      description: 'Discover and trade tokenized domains from other users.',
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-4">🏪</div>
            <p className="text-muted-foreground">
              Buy, sell, and discover valuable domains
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-1">Search & Filter</h4>
              <p className="text-xs text-muted-foreground">Find domains by name, price, length, or TLD</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-1">Sort Options</h4>
              <p className="text-xs text-muted-foreground">Sort by price, name, length, or estimated value</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-1">Domain Details</h4>
              <p className="text-xs text-muted-foreground">View ownership history, estimated value, and metadata</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'analytics',
      title: 'Track Your Portfolio',
      description: 'Monitor your domain investments and market performance.',
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-muted-foreground">
              Stay informed with real-time analytics
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Total Transactions</span>
              <Badge variant="secondary">Live</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Active Users</span>
              <Badge variant="secondary">Growing</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Protocol Revenue</span>
              <Badge variant="secondary">$45K+</Badge>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'You\'re All Set! 🎯',
      description: 'You now have everything you need to start tokenizing and trading domains.',
      content: (
        <div className="space-y-4 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-muted-foreground">
            Ready to transform your domains into digital assets?
          </p>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Next Steps:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Connect your wallet if you haven't already</li>
              <li>• Tokenize your first domain</li>
              <li>• Explore the marketplace</li>
              <li>• Join our community for support</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isVisible) return null;

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl mx-4 animate-scale-in">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {currentStepData.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="min-h-[300px]">
            {currentStepData.content}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip Tour
            </Button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                className="flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingTour;
