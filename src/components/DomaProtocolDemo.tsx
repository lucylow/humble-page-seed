// @ts-nocheck
// Comprehensive Doma Protocol Integration Demo
import React, { useState, useEffect } from 'react';
import { useDomaProtocol } from '../hooks/useDomaProtocol';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';

const DomaProtocolDemo: React.FC = () => {
  const [domainName, setDomainName] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [targetChainId, setTargetChainId] = useState('');
  const [supportedChains, setSupportedChains] = useState<Array<{
    chainId: string;
    name: string;
    isActive: boolean;
  }>>([]);
  const [costEstimate, setCostEstimate] = useState<{
    protocolFee: string;
    gasEstimate: string;
    totalCost: string;
  } | null>(null);
  const [bridgeCostEstimate, setBridgeCostEstimate] = useState<{
    protocolFee: string;
    gasEstimate: string;
    totalCost: string;
  } | null>(null);
  const [tokenMetadata, setTokenMetadata] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<Array<{
    type: string;
    hash: string;
    timestamp: Date;
    status: 'success' | 'pending' | 'failed';
  }>>([]);
  
  const {
    isConnected,
    account,
    loading,
    error,
    connectWallet,
    tokenizeDomains,
    claimOwnership,
    bridgeDomain,
    getTokenMetadata,
    calculateTokenizationCost,
    calculateBridgeCost,
    getSupportedChains,
    setupEventListeners,
    clearError
  } = useDomaProtocol('polygon');

  // Load supported chains on mount
  useEffect(() => {
    const loadSupportedChains = async () => {
      try {
        const chains = await getSupportedChains();
        setSupportedChains(chains);
      } catch (err) {
        console.error('Failed to load supported chains:', err);
      }
    };

    if (isConnected) {
      loadSupportedChains();
    }
  }, [isConnected, getSupportedChains]);

  // Setup event listeners
  useEffect(() => {
    if (isConnected) {
      setupEventListeners({
        onTokenMinted: (event) => {
          console.log('Token minted:', event);
          setTokenId(event.tokenId);
          addTransaction('Tokenization', event.tokenId, 'success');
        },
        onTokenRenewed: (event) => {
          console.log('Token renewed:', event);
          addTransaction('Renewal', event.tokenId, 'success');
        },
        onTokenBurned: (event) => {
          console.log('Token burned:', event);
          addTransaction('Burn', event.tokenId, 'success');
        }
      });
    }
  }, [isConnected, setupEventListeners]);

  // Calculate cost when domain name changes
  useEffect(() => {
    const calculateCost = async () => {
      if (domainName && isConnected) {
        try {
          const cost = await calculateTokenizationCost([domainName]);
          setCostEstimate(cost);
        } catch (err) {
          console.error('Failed to calculate cost:', err);
          setCostEstimate(null);
        }
      } else {
        setCostEstimate(null);
      }
    };

    const timeoutId = setTimeout(calculateCost, 500);
    return () => clearTimeout(timeoutId);
  }, [domainName, isConnected, calculateTokenizationCost]);

  // Calculate bridge cost when token ID or target chain changes
  useEffect(() => {
    const calculateBridgeCost = async () => {
      if (tokenId && targetChainId && isConnected) {
        try {
          const cost = await calculateBridgeCost(parseInt(tokenId), targetChainId);
          setBridgeCostEstimate(cost);
        } catch (err) {
          console.error('Failed to calculate bridge cost:', err);
          setBridgeCostEstimate(null);
        }
      } else {
        setBridgeCostEstimate(null);
      }
    };

    const timeoutId = setTimeout(calculateBridgeCost, 500);
    return () => clearTimeout(timeoutId);
  }, [tokenId, targetChainId, isConnected, calculateBridgeCost]);

  const addTransaction = (type: string, hash: string, status: 'success' | 'pending' | 'failed') => {
    setRecentTransactions(prev => [{
      type,
      hash,
      timestamp: new Date(),
      status
    }, ...prev.slice(0, 9)]); // Keep only last 10 transactions
  };

  const handleTokenize = async () => {
    if (!domainName.trim()) {
      alert('Please enter a domain name');
      return;
    }

    try {
      addTransaction('Tokenization', 'pending...', 'pending');
      const result = await tokenizeDomains([domainName]);
      console.log('Tokenization successful:', result);
      addTransaction('Tokenization', result.transactionHash, 'success');
      alert(`Domain tokenization initiated successfully! Transaction: ${result.transactionHash}`);
    } catch (err) {
      console.error('Tokenization failed:', err);
      addTransaction('Tokenization', 'failed', 'failed');
    }
  };

  const handleClaimOwnership = async () => {
    if (!tokenId) {
      alert('Please enter a token ID');
      return;
    }

    try {
      addTransaction('Claim Ownership', 'pending...', 'pending');
      const result = await claimOwnership(parseInt(tokenId));
      console.log('Ownership claim successful:', result);
      addTransaction('Claim Ownership', result.transactionHash, 'success');
      alert(`Domain ownership claimed successfully! Transaction: ${result.transactionHash}`);
    } catch (err) {
      console.error('Ownership claim failed:', err);
      addTransaction('Claim Ownership', 'failed', 'failed');
    }
  };

  const handleBridgeDomain = async () => {
    if (!tokenId || !targetChainId) {
      alert('Please enter token ID and select target chain');
      return;
    }

    try {
      addTransaction('Bridge', 'pending...', 'pending');
      const result = await bridgeDomain(parseInt(tokenId), targetChainId, account || '');
      console.log('Domain bridging successful:', result);
      addTransaction('Bridge', result.transactionHash, 'success');
      alert(`Domain bridged successfully! Transaction: ${result.transactionHash}`);
    } catch (err) {
      console.error('Domain bridging failed:', err);
      addTransaction('Bridge', 'failed', 'failed');
    }
  };

  const handleGetMetadata = async () => {
    if (!tokenId) {
      alert('Please enter a token ID');
      return;
    }

    try {
      const metadata = await getTokenMetadata(parseInt(tokenId));
      console.log('Token metadata:', metadata);
      setTokenMetadata(metadata);
    } catch (err) {
      console.error('Failed to get metadata:', err);
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Doma Protocol
            </Badge>
            Integration Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
            <p className="text-muted-foreground">
              Connect your wallet to start using the Doma Protocol for domain tokenization, 
              ownership management, and cross-chain bridging.
            </p>
          </div>
          
          <div className="space-y-4">
            <Button onClick={connectWallet} disabled={loading} size="lg" className="w-full">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                'Connect Wallet'
              )}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              <p>Supported Networks: Ethereum, Polygon, BSC</p>
              <p>Features: Domain Tokenization, Ownership Claims, Cross-Chain Bridging</p>
            </div>
          </div>
          
          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Connected
                </Badge>
                Doma Protocol Integration
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Advanced domain tokenization and management platform
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{account}</p>
              <p className="text-xs text-muted-foreground">Polygon Network</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Interface */}
      <Tabs defaultValue="tokenize" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tokenize">Tokenize</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="bridge">Bridge</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Tokenization Tab */}
        <TabsContent value="tokenize" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Domain Tokenization</CardTitle>
              <p className="text-sm text-muted-foreground">
                Convert domain names into blockchain tokens for ownership verification and trading
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="domain-name">Domain Name</Label>
                <Input
                  id="domain-name"
                  type="text"
                  placeholder="Enter domain name (e.g., example.com)"
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                />
              </div>
              
              {costEstimate && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">Cost Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-800">Protocol Fee:</span>
                      <span className="font-medium text-blue-900">{costEstimate.protocolFee} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Gas Estimate:</span>
                      <span className="font-medium text-blue-900">{costEstimate.gasEstimate} ETH</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-blue-900">Total Cost:</span>
                      <span className="text-blue-900">{costEstimate.totalCost} ETH</span>
                    </div>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleTokenize} 
                disabled={loading || !domainName.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Tokenization...
                  </>
                ) : (
                  'Tokenize Domain'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Management Tab */}
        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ownership Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Claim ownership, view metadata, and manage your tokenized domains
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="token-id">Token ID</Label>
                <Input
                  id="token-id"
                  type="text"
                  placeholder="Enter token ID"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={handleClaimOwnership} 
                  disabled={loading || !tokenId}
                  variant="outline"
                >
                  {loading ? 'Processing...' : 'Claim Ownership'}
                </Button>
                
                <Button 
                  onClick={handleGetMetadata} 
                  disabled={loading || !tokenId}
                  variant="outline"
                >
                  Get Metadata
                </Button>
              </div>

              {tokenMetadata && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-semibold mb-3">Token Metadata</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Token ID:</span>
                      <span className="font-medium">{tokenMetadata.tokenId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Owner:</span>
                      <span className="font-medium">{tokenMetadata.owner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expiration:</span>
                      <span className="font-medium">{tokenMetadata.expiration.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transfer Locked:</span>
                      <Badge variant={tokenMetadata.isTransferLocked ? "destructive" : "default"}>
                        {tokenMetadata.isTransferLocked ? 'Locked' : 'Unlocked'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={tokenMetadata.isExpired ? "destructive" : "default"}>
                        {tokenMetadata.isExpired ? 'Expired' : 'Active'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bridge Tab */}
        <TabsContent value="bridge" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cross-Chain Bridging</CardTitle>
              <p className="text-sm text-muted-foreground">
                Bridge your tokenized domains to other supported blockchain networks
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bridge-token-id">Token ID</Label>
                  <Input
                    id="bridge-token-id"
                    type="text"
                    placeholder="Enter token ID"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target-chain">Target Chain</Label>
                  <Select value={targetChainId} onValueChange={setTargetChainId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target chain" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedChains.map((chain) => (
                        <SelectItem 
                          key={chain.chainId} 
                          value={chain.chainId}
                          disabled={!chain.isActive}
                        >
                          {chain.name} {!chain.isActive && '(Inactive)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {bridgeCostEstimate && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-3">Bridge Cost Estimate</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-800">Protocol Fee:</span>
                      <span className="font-medium text-purple-900">{bridgeCostEstimate.protocolFee} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-800">Gas Estimate:</span>
                      <span className="font-medium text-purple-900">{bridgeCostEstimate.gasEstimate} ETH</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-purple-900">Total Cost:</span>
                      <span className="text-purple-900">{bridgeCostEstimate.totalCost} ETH</span>
                    </div>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleBridgeDomain} 
                disabled={loading || !tokenId || !targetChainId}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Bridging Domain...
                  </>
                ) : (
                  'Bridge Domain'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <p className="text-sm text-muted-foreground">
                View your recent Doma Protocol transactions and activity
              </p>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No transactions yet</p>
                  <p className="text-sm">Start by tokenizing a domain to see your transaction history</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          tx.status === 'success' ? 'default' : 
                          tx.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {tx.status}
                        </Badge>
                        <div>
                          <p className="font-medium">{tx.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {tx.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-gray-600">
                          {tx.hash === 'pending...' || tx.hash === 'failed' ? 
                            tx.hash : 
                            `${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)}`
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error Display */}
      {error && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={clearError}>
              ✕
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DomaProtocolDemo;
