import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  FileText, 
  Coins, 
  History, 
  Shield, 
  Copy,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useState } from 'react';

interface OnChainLinksProps {
  domainId?: string;
  tokenId?: string;
  contractAddress?: string;
  transactionHash?: string;
  ownerAddress?: string;
  className?: string;
}

interface ChainLinkProps {
  icon: React.ReactNode;
  label: string;
  url: string;
  description?: string;
  status?: 'success' | 'pending' | 'failed';
}

const ChainLink: React.FC<ChainLinkProps> = ({ 
  icon, 
  label, 
  url, 
  description, 
  status 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'pending':
        return 'border-yellow-200 bg-yellow-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-border bg-card';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor()} transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm">{label}</span>
          {getStatusIcon()}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 w-6 p-0"
          >
            {copied ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(url, '_blank')}
            className="h-6 w-6 p-0"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      {description && (
        <p className="text-xs text-muted-foreground mb-2">{description}</p>
      )}
      
      <div className="text-xs font-mono text-muted-foreground break-all">
        {url.length > 50 ? `${url.slice(0, 50)}...` : url}
      </div>
    </div>
  );
};

const OnChainLinks: React.FC<OnChainLinksProps> = ({
  domainId,
  tokenId,
  contractAddress,
  transactionHash,
  ownerAddress,
  className
}) => {
  // Mock data - in production, these would be real blockchain addresses and hashes
  const mockData = {
    contractAddress: contractAddress || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    tokenId: tokenId || '123',
    transactionHash: transactionHash || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    ownerAddress: ownerAddress || '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
    domainId: domainId || 'domain-123'
  };

  const links = [
    {
      icon: <FileText className="w-4 h-4" />,
      label: 'Smart Contract',
      url: `https://etherscan.io/address/${mockData.contractAddress}`,
      description: 'View the domain tokenization contract',
      status: 'success' as const
    },
    {
      icon: <Coins className="w-4 h-4" />,
      label: 'Token Details',
      url: `https://etherscan.io/token/${mockData.contractAddress}?a=${mockData.tokenId}`,
      description: 'View token metadata and ownership',
      status: 'success' as const
    },
    {
      icon: <History className="w-4 h-4" />,
      label: 'Transaction History',
      url: `https://etherscan.io/tx/${mockData.transactionHash}`,
      description: 'View all transactions for this domain',
      status: 'pending' as const
    },
    {
      icon: <Shield className="w-4 h-4" />,
      label: 'Domain Registry',
      url: `https://etherscan.io/address/0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`,
      description: 'ENS registry contract',
      status: 'success' as const
    }
  ];

  const additionalLinks = [
    {
      icon: <ExternalLink className="w-4 h-4" />,
      label: 'OpenSea',
      url: `https://opensea.io/assets/ethereum/${mockData.contractAddress}/${mockData.tokenId}`,
      description: 'View on OpenSea marketplace'
    },
    {
      icon: <ExternalLink className="w-4 h-4" />,
      label: 'LooksRare',
      url: `https://looksrare.org/collections/${mockData.contractAddress}/${mockData.tokenId}`,
      description: 'View on LooksRare marketplace'
    },
    {
      icon: <ExternalLink className="w-4 h-4" />,
      label: 'Rarible',
      url: `https://rarible.com/token/${mockData.contractAddress}:${mockData.tokenId}`,
      description: 'View on Rarible marketplace'
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          On-Chain Links
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Ethereum Mainnet
          </Badge>
          <Badge variant="outline" className="text-xs">
            Verified Contract
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Primary Blockchain Links */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
            Blockchain Explorer
          </h4>
          <div className="space-y-3">
            {links.map((link, index) => (
              <ChainLink
                key={index}
                icon={link.icon}
                label={link.label}
                url={link.url}
                description={link.description}
                status={link.status}
              />
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
            Marketplace Links
          </h4>
          <div className="space-y-3">
            {additionalLinks.map((link, index) => (
              <ChainLink
                key={index}
                icon={link.icon}
                label={link.label}
                url={link.url}
                description={link.description}
              />
            ))}
          </div>
        </div>

        {/* Domain Information */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
            Domain Information
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Domain ID:</span>
              <div className="font-mono">{mockData.domainId}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Token ID:</span>
              <div className="font-mono">{mockData.tokenId}</div>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Contract:</span>
              <div className="font-mono break-all">{mockData.contractAddress}</div>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Owner:</span>
              <div className="font-mono break-all">{mockData.ownerAddress}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
            Quick Actions
          </h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = `https://etherscan.io/address/${mockData.contractAddress}`;
                window.open(url, '_blank');
              }}
            >
              <FileText className="w-3 h-3 mr-1" />
              View Contract
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = `https://opensea.io/assets/ethereum/${mockData.contractAddress}/${mockData.tokenId}`;
                window.open(url, '_blank');
              }}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              OpenSea
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(mockData.contractAddress);
                  // You could add a toast notification here
                } catch (err) {
                  console.error('Failed to copy:', err);
                }
              }}
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy Address
            </Button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="border-t pt-4">
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-800">
              <div className="font-semibold mb-1">Security Notice</div>
              <p>
                Always verify contract addresses and transaction hashes before interacting. 
                These links are provided for transparency and verification purposes.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnChainLinks;


