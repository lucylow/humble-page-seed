// Example Usage Component for Doma Protocol Integration
import React, { useState, useEffect } from 'react';
import { useDomaProtocol } from '../hooks/useDomaProtocol';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const DomainTokenization: React.FC = () => {
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
  } = useDomaProtocol('polygon'); // Use Polygon network

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
        },
        onTokenRenewed: (event) => {
          console.log('Token renewed:', event);
        },
        onTokenBurned: (event) => {
          console.log('Token burned:', event);
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

    const timeoutId = setTimeout(calculateCost, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [domainName, isConnected, calculateTokenizationCost]);

  const handleTokenize = async () => {
    if (!domainName.trim()) {
      alert('Please enter a domain name');
      return;
    }

    try {
      const result = await tokenizeDomains([domainName]);
      console.log('Tokenization successful:', result);
      alert(`Domain tokenization initiated successfully! Transaction: ${result.transactionHash}`);
    } catch (err) {
      console.error('Tokenization failed:', err);
    }
  };

  const handleClaimOwnership = async () => {
    if (!tokenId) {
      alert('Please enter a token ID');
      return;
    }

    try {
      const result = await claimOwnership(parseInt(tokenId));
      console.log('Ownership claim successful:', result);
      alert(`Domain ownership claimed successfully! Transaction: ${result.transactionHash}`);
    } catch (err) {
      console.error('Ownership claim failed:', err);
    }
  };

  const handleBridgeDomain = async () => {
    if (!tokenId || !targetChainId) {
      alert('Please enter token ID and select target chain');
      return;
    }

    try {
      const result = await bridgeDomain(parseInt(tokenId), targetChainId, account || '');
      console.log('Domain bridging successful:', result);
      alert(`Domain bridged successfully! Transaction: ${result.transactionHash}`);
    } catch (err) {
      console.error('Domain bridging failed:', err);
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
      alert(`Token Metadata:\nOwner: ${metadata.owner}\nExpiration: ${metadata.expiration}\nLocked: ${metadata.isTransferLocked}`);
    } catch (err) {
      console.error('Failed to get metadata:', err);
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Connect Wallet to Continue</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Connect your wallet to start tokenizing domains and managing ownership tokens.
          </p>
          <Button onClick={connectWallet} disabled={loading} size="lg">
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </Button>
          {error && (
            <Alert className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Connected
            </Badge>
            Wallet Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            <strong>Address:</strong> {account}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Network:</strong> Polygon
          </p>
        </CardContent>
      </Card>

      {/* Domain Tokenization */}
      <Card>
        <CardHeader>
          <CardTitle>Tokenize Domain</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Cost Estimate</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p>Protocol Fee: {costEstimate.protocolFee} ETH</p>
                <p>Gas Estimate: {costEstimate.gasEstimate} ETH</p>
                <p className="font-semibold">Total Cost: {costEstimate.totalCost} ETH</p>
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleTokenize} 
            disabled={loading || !domainName.trim()}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Tokenize Domain'}
          </Button>
        </CardContent>
      </Card>

      {/* Ownership Management */}
      <Card>
        <CardHeader>
          <CardTitle>Ownership Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Domain Bridging */}
      <Card>
        <CardHeader>
          <CardTitle>Bridge Domain</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          
          <Button 
            onClick={handleBridgeDomain} 
            disabled={loading || !tokenId || !targetChainId}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Bridge Domain'}
          </Button>
        </CardContent>
      </Card>

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

export default DomainTokenization;