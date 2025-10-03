import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Zap, Eye, ShoppingCart, Wallet, ArrowRight, CheckCircle, X } from 'lucide-react';

interface InteractionStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
}

export const MarketplaceInteractionGuide: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  const scenarios: Record<string, InteractionStep[]> = {
    card: [
      {
        id: 'click-card',
        title: 'Click Domain Card',
        description: 'Navigate to comprehensive domain details',
        icon: <Eye className="h-5 w-5" />,
        details: [
          'View complete domain information',
          'See AI valuation vs Listed price',
          'Check historical price fluctuations',
          'Review ownership history',
          'Explore associated NFT assets'
        ]
      },
      {
        id: 'doma-connection',
        title: 'Doma Protocol Integration',
        description: 'Real-time blockchain data retrieval',
        icon: <ArrowRight className="h-5 w-5" />,
        details: [
          'Fetch verifiable on-chain ownership',
          'Access smart contract details',
          'View governance proposals',
          'Check tokenization status',
          'Monitor fractionalization data'
        ]
      }
    ],
    details: [
      {
        id: 'view-details',
        title: 'View Details Button',
        description: 'Alternative entry to domain page',
        icon: <Eye className="h-5 w-5" />,
        details: [
          'Same comprehensive view as card click',
          'Quick access to domain metrics',
          'View token ID and contract address',
          'Check marketplace listing status',
          'Access fractionalization options'
        ]
      },
      {
        id: 'protocol-query',
        title: 'Protocol Data Query',
        description: 'Request domain state from Doma',
        icon: <ArrowRight className="h-5 w-5" />,
        details: [
          'Query Doma Protocol blockchain',
          'Retrieve current domain state',
          'Fetch DNS configuration',
          'Access metadata and attributes',
          'View active marketplace listings'
        ]
      }
    ],
    quickbuy: [
      {
        id: 'connect-prompt',
        title: 'Wallet Connection Required',
        description: 'First-time user experience',
        icon: <Wallet className="h-5 w-5" />,
        details: [
          'Prompt to connect Web3 wallet',
          'Support MetaMask, WalletConnect',
          'Secure authentication required',
          'No purchase without connection',
          'Safety-first approach'
        ]
      },
      {
        id: 'transaction-flow',
        title: 'Transaction Confirmation',
        description: 'Connected wallet purchase flow',
        icon: <ShoppingCart className="h-5 w-5" />,
        details: [
          'MetaMask confirmation dialog',
          'Display purchase price + gas',
          'Smart contract interaction',
          'ETH transfer to seller/escrow',
          'Domain NFT transfer to buyer'
        ]
      },
      {
        id: 'success',
        title: 'Ownership Update',
        description: 'Transaction confirmed on-chain',
        icon: <CheckCircle className="h-5 w-5" />,
        details: [
          'Success notification displayed',
          'Domain appears in Portfolio',
          'On-chain ownership verified',
          'Blockchain confirmation',
          'Full DomainFi integration'
        ]
      }
    ]
  };

  const scenarioTitles = {
    card: '🖱️ Scenario 1: Clicking Domain Card (web3pro.eth)',
    details: '👆 Scenario 2: Clicking "View Details" Button',
    quickbuy: '⚡ Scenario 3: Clicking "Quick Buy" Button'
  };

  if (!showGuide) {
    return (
      <Button
        onClick={() => setShowGuide(true)}
        className="fixed bottom-6 right-6 z-50 shadow-lg"
        size="lg"
      >
        📚 Marketplace Guide
      </Button>
    );
  }

  return (
    <>
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              🚀 DomaLand.AI Marketplace Interaction Guide
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Learn how to interact with tokenized domains on the Doma Protocol
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGuide(false)}
            className="hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Badge variant="outline" className="bg-yellow-50 border-yellow-300 text-yellow-800 px-3 py-1">
            ⚠️ Currently displaying mock data for demonstration
          </Badge>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(scenarioTitles).map(([key, title]) => (
              <Button
                key={key}
                onClick={() => setActiveScenario(key)}
                variant={activeScenario === key ? 'default' : 'outline'}
                className="h-auto py-4 text-left justify-start flex-col items-start gap-2"
              >
                <span className="font-semibold text-sm">{title}</span>
              </Button>
            ))}
          </div>

          {activeScenario && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
              {scenarios[activeScenario].map((step, index) => (
                <Card key={step.id} className="border-primary/20 hover:border-primary/40 transition-all">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2">
                          Step {index + 1}
                        </Badge>
                        <CardTitle className="text-base">{step.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-0.5">▸</span>
                          <span className="text-muted-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">
                    Key Takeaway for Doma Hackathon
                  </h4>
                  <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-1">
                    This flow demonstrates seamless integration with the Doma Protocol's core functionalities,
                    enabling direct, secure, and transparent domain asset acquisition on the blockchain.
                    The mock data illustrates the platform's potential when fully connected to the decentralized web!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Dialog open={activeScenario !== null} onOpenChange={() => setActiveScenario(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {activeScenario && scenarioTitles[activeScenario as keyof typeof scenarioTitles]}
            </DialogTitle>
            <DialogDescription>
              Step-by-step breakdown of user interactions and Doma Protocol integration
            </DialogDescription>
          </DialogHeader>
          
          {activeScenario && (
            <div className="space-y-6 pt-4">
              {scenarios[activeScenario].map((step, index) => (
                <div key={step.id} className="relative">
                  {index > 0 && (
                    <div className="absolute left-6 top-0 h-full w-0.5 bg-gradient-to-b from-primary to-transparent -translate-y-6"></div>
                  )}
                  <Card className="relative">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{step.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                        </div>
                        <div className="flex-shrink-0 text-2xl">{step.icon}</div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
