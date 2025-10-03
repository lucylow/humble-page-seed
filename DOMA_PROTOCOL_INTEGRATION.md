# Doma Protocol Integration Guide

This document provides a comprehensive guide for integrating the Doma Protocol smart contracts API into your DomaLand.AI project.

## Overview

The Doma Protocol integration enables:
- **Domain Tokenization**: Convert domain names into blockchain tokens
- **Ownership Management**: Claim and manage domain ownership
- **Cross-Chain Bridging**: Bridge domains between different blockchain networks
- **Real-time Events**: Listen for token minting, renewals, and other events
- **Cost Estimation**: Calculate protocol fees and gas costs

## Architecture

### Core Services

1. **DomaContractService** - Base contract interaction class
2. **TokenizationService** - Handles domain tokenization
3. **DomainManagementService** - Manages ownership claims and bridging
4. **OwnershipTokenService** - Manages token metadata and events

### React Integration

1. **useDomaProtocol** - React hook for easy integration
2. **DomaContext** - Updated context with Doma Protocol integration
3. **DomainTokenization** - Example component for tokenization
4. **DomaProtocolDemo** - Comprehensive demo component

## File Structure

```
src/
├── config/
│   └── domaConfig.ts              # Configuration and contract addresses
├── services/
│   ├── DomaContractService.ts     # Base contract service
│   ├── TokenizationService.ts     # Domain tokenization
│   ├── DomainManagementService.ts # Ownership and bridging
│   └── OwnershipTokenService.ts   # Token metadata and events
├── hooks/
│   └── useDomaProtocol.ts         # React hook for integration
├── components/
│   ├── DomainTokenization.tsx     # Tokenization component
│   └── DomaProtocolDemo.tsx       # Comprehensive demo
├── utils/
│   └── domaErrorHandler.ts        # Error handling utilities
└── contexts/
    └── DomaContext.tsx            # Updated context with Doma integration
```

## Configuration

### Network Configuration

```typescript
// src/config/domaConfig.ts
export const DOMA_CONFIG = {
  networks: {
    ethereum: {
      proxyDomaRecord: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      ownershipToken: "0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c",
      chainId: "eip155:1",
      rpcUrl: process.env.ETHEREUM_RPC_URL
    },
    polygon: {
      proxyDomaRecord: "0x6fC21092DA55B392b745d0B6c49543c4e30fC2b3",
      ownershipToken: "0x1234567890abcdef1234567890abcdef12345678",
      chainId: "eip155:137",
      rpcUrl: process.env.POLYGON_RPC_URL
    }
  },
  protocolFees: {
    tokenization: "0.001",
    claim: "0.0005",
    bridge: "0.002"
  }
};
```

### Environment Variables

Create a `.env.local` file with:

```bash
# RPC URLs
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
POLYGON_RPC_URL=https://polygon-rpc.com
GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR_PROJECT_ID

# Doma API Endpoints
DOMA_VOUCHER_API_URL=https://api.doma.xyz/voucher
DOMA_BRIDGE_API_URL=https://api.doma.xyz/bridge
DOMA_CHAIN_RPC_URL=https://rpc.doma.xyz
```

## Usage Examples

### Basic Tokenization

```typescript
import { useDomaProtocol } from '../hooks/useDomaProtocol';

const MyComponent = () => {
  const { tokenizeDomains, isConnected, loading } = useDomaProtocol('polygon');

  const handleTokenize = async () => {
    try {
      const result = await tokenizeDomains(['example.com']);
      console.log('Tokenization successful:', result);
    } catch (error) {
      console.error('Tokenization failed:', error);
    }
  };

  return (
    <button onClick={handleTokenize} disabled={!isConnected || loading}>
      Tokenize Domain
    </button>
  );
};
```

### Ownership Management

```typescript
const { claimOwnership, getTokenMetadata } = useDomaProtocol('polygon');

const handleClaimOwnership = async (tokenId: number) => {
  try {
    const result = await claimOwnership(tokenId);
    console.log('Ownership claimed:', result);
  } catch (error) {
    console.error('Claim failed:', error);
  }
};

const handleGetMetadata = async (tokenId: number) => {
  try {
    const metadata = await getTokenMetadata(tokenId);
    console.log('Token metadata:', metadata);
  } catch (error) {
    console.error('Failed to get metadata:', error);
  }
};
```

### Cross-Chain Bridging

```typescript
const { bridgeDomain, getSupportedChains } = useDomaProtocol('polygon');

const handleBridge = async (tokenId: number, targetChainId: string) => {
  try {
    const result = await bridgeDomain(tokenId, targetChainId, userAddress);
    console.log('Domain bridged:', result);
  } catch (error) {
    console.error('Bridge failed:', error);
  }
};
```

### Event Listening

```typescript
const { setupEventListeners } = useDomaProtocol('polygon');

useEffect(() => {
  setupEventListeners({
    onTokenMinted: (event) => {
      console.log('New token minted:', event);
    },
    onTokenRenewed: (event) => {
      console.log('Token renewed:', event);
    },
    onTokenBurned: (event) => {
      console.log('Token burned:', event);
    }
  });
}, [setupEventListeners]);
```

## Error Handling

The integration includes comprehensive error handling:

```typescript
import { handleDomaError, getErrorMessage, DOMA_ERROR_CODES } from '../utils/domaErrorHandler';

try {
  await tokenizeDomains(['example.com']);
} catch (error) {
  const domaError = handleDomaError(error);
  
  switch (domaError.code) {
    case DOMA_ERROR_CODES.USER_REJECTED:
      // Handle user rejection
      break;
    case DOMA_ERROR_CODES.INSUFFICIENT_FUNDS:
      // Handle insufficient funds
      break;
    case DOMA_ERROR_CODES.VOUCHER_EXPIRED:
      // Handle expired voucher
      break;
    default:
      // Handle other errors
      console.error(getErrorMessage(domaError));
  }
}
```

## Cost Estimation

Calculate costs before executing transactions:

```typescript
const { calculateTokenizationCost, calculateBridgeCost } = useDomaProtocol('polygon');

// Tokenization cost
const tokenizationCost = await calculateTokenizationCost(['example.com']);
console.log('Total cost:', tokenizationCost.totalCost, 'ETH');

// Bridge cost
const bridgeCost = await calculateBridgeCost(tokenId, 'eip155:1');
console.log('Bridge cost:', bridgeCost.totalCost, 'ETH');
```

## Integration with Existing Components

### Dashboard Integration

The Dashboard component has been updated to use the Doma Protocol:

```typescript
// In Dashboard.tsx
const { tokenizeDomains } = useDomaProtocol('polygon');

const handleTokenize = async (domainName: string) => {
  try {
    const result = await tokenizeDomains([domainName]);
    showSuccess('Domain Tokenized', `Successfully tokenized ${domainName}`);
  } catch (error) {
    showError('Tokenization Failed', getErrorMessage(error));
  }
};
```

### Context Integration

The DomaContext has been updated to integrate with the Doma Protocol:

```typescript
// In DomaContext.tsx
const domaProtocol = useDomaProtocol('polygon');

const tokenizeDomain = async (domainName: string) => {
  try {
    const result = await domaProtocol.tokenizeDomains([domainName]);
    // Update local state with new domain
    return { success: true, tokenId: result.tokenId };
  } catch (error) {
    const domaError = handleDomaError(error);
    throw domaError;
  }
};
```

## Testing

### Unit Tests

```typescript
// Example test for TokenizationService
import { TokenizationService } from '../services/TokenizationService';

describe('TokenizationService', () => {
  let service: TokenizationService;

  beforeEach(() => {
    service = new TokenizationService('polygon');
  });

  it('should validate domain names correctly', () => {
    const { valid, invalid } = service.validateDomainNames(['example.com', 'invalid..domain']);
    expect(valid).toEqual(['example.com']);
    expect(invalid).toEqual(['invalid..domain']);
  });
});
```

### Integration Tests

```typescript
// Example integration test
import { useDomaProtocol } from '../hooks/useDomaProtocol';

describe('Doma Protocol Integration', () => {
  it('should connect wallet successfully', async () => {
    const { connectWallet, isConnected } = useDomaProtocol('polygon');
    await connectWallet();
    expect(isConnected).toBe(true);
  });
});
```

## Security Considerations

1. **Private Keys**: Never expose private keys in client-side code
2. **API Keys**: Store API keys securely in environment variables
3. **Input Validation**: Always validate user inputs before processing
4. **Error Handling**: Don't expose sensitive error information to users
5. **Rate Limiting**: Implement rate limiting for API calls

## Performance Optimization

1. **Gas Estimation**: Cache gas estimates for similar transactions
2. **Event Listening**: Use efficient event filtering
3. **Batch Operations**: Group multiple operations when possible
4. **Error Retry**: Implement exponential backoff for failed requests

## Troubleshooting

### Common Issues

1. **Wallet Not Connected**
   - Ensure MetaMask is installed and unlocked
   - Check network connection

2. **Transaction Failures**
   - Verify sufficient ETH balance for gas
   - Check network congestion
   - Validate voucher expiration

3. **API Errors**
   - Check API endpoint availability
   - Verify API key configuration
   - Check rate limits

### Debug Mode

Enable debug logging:

```typescript
// In development
if (process.env.NODE_ENV === 'development') {
  console.log('Doma Protocol Debug Mode Enabled');
}
```

## Future Enhancements

1. **Multi-signature Support**: Add support for multi-sig wallets
2. **Batch Operations**: Implement batch tokenization and bridging
3. **Advanced Analytics**: Add detailed transaction analytics
4. **Mobile Support**: Optimize for mobile wallet connections
5. **Layer 2 Integration**: Add support for Layer 2 solutions

## Support

For issues and questions:
- Check the error logs in browser console
- Review the Doma Protocol documentation
- Contact the development team

## License

This integration follows the same license as the main DomaLand.AI project.
