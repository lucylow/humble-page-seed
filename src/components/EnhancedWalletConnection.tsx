import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useWeb3, CHAIN_CONFIGS } from '@/contexts/Web3Context';
import { useNotificationHelpers } from './EnhancedNotificationSystem';
import { 
  Wallet, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  X,
  Copy,
  RefreshCw
} from 'lucide-react';

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  supported: boolean;
  installUrl?: string;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'The most popular Ethereum wallet',
    supported: true,
    installUrl: 'https://metamask.io/download/'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Connect any wallet',
    supported: true
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    description: 'Secure wallet by Coinbase',
    supported: true,
    installUrl: 'https://www.coinbase.com/wallet'
  },
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    description: 'Solana wallet support',
    supported: true,
    installUrl: 'https://phantom.app/'
  }
];

interface ConnectionStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed' | 'error';
  icon: React.ReactNode;
}

const EnhancedWalletConnection: React.FC = () => {
  const { 
    isConnected, 
    connectWallet, 
    connectSolanaWallet,
    account, 
    network, 
    currentChain,
    chainId,
    isConnecting,
    error,
    clearError,
    isMockMode,
    connectMockWallet
  } = useWeb3();
  
  const { showSuccess, showError, showWarning } = useNotificationHelpers();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [connectionSteps, setConnectionSteps] = useState<ConnectionStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const initializeSteps = (walletType: string): ConnectionStep[] => [
    {
      id: 'detect',
      title: 'Detecting Wallet',
      description: 'Checking if wallet is installed and accessible',
      status: 'pending',
      icon: <Wallet className="h-5 w-5" />
    },
    {
      id: 'connect',
      title: 'Requesting Connection',
      description: 'Asking for permission to connect to your wallet',
      status: 'pending',
      icon: <Shield className="h-5 w-5" />
    },
    {
      id: 'verify',
      title: 'Verifying Connection',
      description: 'Confirming wallet connection and network',
      status: 'pending',
      icon: <CheckCircle className="h-5 w-5" />
    }
  ];

  const handleWalletSelect = async (walletId: string) => {
    setSelectedWallet(walletId);
    const steps = initializeSteps(walletId);
    setConnectionSteps(steps);
    setCurrentStep(0);

    try {
      // Step 1: Detect wallet
      setConnectionSteps(prev => 
        prev.map(step => 
          step.id === 'detect' 
            ? { ...step, status: 'current' as const }
            : step
        )
      );

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate detection

      setConnectionSteps(prev => 
        prev.map(step => 
          step.id === 'detect' 
            ? { ...step, status: 'completed' as const }
            : step
        )
      );

      // Step 2: Connect wallet
      setConnectionSteps(prev => 
        prev.map(step => 
          step.id === 'connect' 
            ? { ...step, status: 'current' as const }
            : step
        )
      );

      let success = false;
      if (walletId === 'phantom') {
        success = await connectSolanaWallet();
      } else {
        success = await connectWallet();
      }

      if (success) {
        setConnectionSteps(prev => 
          prev.map(step => 
            step.id === 'connect' 
              ? { ...step, status: 'completed' as const }
              : step
          )
        );

        // Step 3: Verify connection
        setConnectionSteps(prev => 
          prev.map(step => 
            step.id === 'verify' 
              ? { ...step, status: 'current' as const }
              : step
          )
        );

        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate verification

        setConnectionSteps(prev => 
          prev.map(step => 
            step.id === 'verify' 
              ? { ...step, status: 'completed' as const }
              : step
          )
        );

        showSuccess('Wallet Connected!', 'Your wallet has been successfully connected.');
      } else {
        throw new Error('Failed to connect wallet');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      showError('Connection Failed', errorMessage);
      
      setConnectionSteps(prev => 
        prev.map(step => 
          step.status === 'current' 
            ? { ...step, status: 'error' as const }
            : step
        )
      );
    }
  };

  const handleMockConnection = () => {
    connectMockWallet();
    showSuccess('Mock Wallet Connected', 'Development mode activated');
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      showSuccess('Address Copied', 'Wallet address copied to clipboard');
    }
  };

  const openExplorer = () => {
    if (account && chainId) {
      const chainConfig = Object.values(CHAIN_CONFIGS).find(config => config.chainId === chainId);
      const explorerUrl = chainConfig?.blockExplorer || 'https://etherscan.io';
      window.open(`${explorerUrl}/address/${account}`, '_blank');
    }
  };

  if (isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600">Connected</span>
            {isMockMode && (
              <Badge variant="secondary" className="text-xs">
                DEV MODE
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg">Wallet Connected</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Address:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-6 px-2"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="font-mono text-xs bg-muted p-2 rounded break-all">
              {account}
            </div>
          </div>

          {network && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Network:</span>
              <div className="flex items-center justify-between">
                <Badge variant="outline">{network.name}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openExplorer}
                  className="h-6 px-2"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Steps */}
      {connectionSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Connecting Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={(currentStep / connectionSteps.length) * 100} className="h-2" />
            
            <div className="space-y-3">
              {connectionSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    step.status === 'current' ? 'bg-primary/10 border border-primary/20' :
                    step.status === 'completed' ? 'bg-green-50 border border-green-200' :
                    step.status === 'error' ? 'bg-red-50 border border-red-200' :
                    'bg-muted/50'
                  }`}
                >
                  <div className={`flex-shrink-0 ${
                    step.status === 'completed' ? 'text-green-600' :
                    step.status === 'error' ? 'text-red-600' :
                    step.status === 'current' ? 'text-primary' :
                    'text-muted-foreground'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : step.status === 'error' ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : step.status === 'current' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{step.title}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Connect Your Wallet</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose a wallet to connect to DomaLand.AI
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {WALLET_OPTIONS.map((wallet) => (
              <Button
                key={wallet.id}
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => handleWalletSelect(wallet.id)}
                disabled={isConnecting}
              >
                <div className="flex items-center gap-3 w-full">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{wallet.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {wallet.description}
                    </div>
                  </div>
                  {!wallet.supported && (
                    <Badge variant="secondary" className="text-xs">
                      Not Supported
                    </Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>

          {/* Advanced Options */}
          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>
            
            {showAdvanced && (
              <div className="mt-3 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMockConnection}
                  className="w-full"
                >
                  <span className="mr-2">🧪</span>
                  Connect Mock Wallet (Development)
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EnhancedWalletConnection;
