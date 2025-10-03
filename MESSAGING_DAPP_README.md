# DomaLand.AI - Domain Messaging dApp

A comprehensive messaging dApp for domain sales and communication with XMTP integration, on-chain transaction links, and seamless negotiation features.

## 🚀 Features

### Core Messaging Features
- **XMTP Integration**: Decentralized messaging using XMTP protocol
- **Domain-Linked Chats**: Conversations tied to specific domain sales
- **Real-time Messaging**: Instant message delivery and updates
- **Message Types**: Support for text, offers, and transaction messages
- **Conversation Management**: Track multiple domain negotiations

### Trading & Negotiation
- **Offer Management**: Submit, track, and manage domain offers
- **Transaction Links**: Share blockchain transaction hashes in chat
- **Price Negotiation**: Real-time price discussions with sellers
- **Offer Expiry**: Time-limited offers with automatic expiration
- **Multi-token Support**: ETH, USDC, USDT payment options

### Blockchain Integration
- **On-Chain Links**: Direct links to Etherscan, OpenSea, and other explorers
- **Transaction Verification**: Verify transactions directly in chat
- **Smart Contract Integration**: Interact with domain tokenization contracts
- **Wallet Integration**: Seamless wallet connection and transaction signing

### User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Adaptive theming support
- **Real-time Updates**: Live conversation updates and notifications
- **SEO Optimization**: Structured data and meta tags for domain pages
- **Accessibility**: WCAG compliant interface components

## 📁 Project Structure

```
src/
├── contexts/
│   ├── XMTPContext.tsx          # XMTP messaging context
│   ├── Web3Context.tsx          # Web3 wallet integration
│   └── ...
├── components/
│   ├── TradeChat.tsx           # Main chat interface
│   ├── DomainNegotiation.tsx   # Complete negotiation UI
│   ├── OnChainLinks.tsx        # Blockchain explorer links
│   ├── SEOHead.tsx             # SEO optimization component
│   └── ...
├── pages/
│   ├── DomainNegotiationPage.tsx # Negotiation page
│   └── ...
├── config/
│   ├── contracts.ts            # Smart contract ABIs
│   └── constants.ts            # Configuration constants
└── utils/
    └── ipfs.ts                 # IPFS utilities
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Web3 wallet (MetaMask, WalletConnect, etc.)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd domaland-ai

# Install dependencies
npm install

# Install additional XMTP dependencies
npm install @xmtp/xmtp-js

# Start development server
npm run dev
```

### Environment Variables
Create a `.env.local` file:
```env
# XMTP Configuration
REACT_APP_XMTP_ENV=production
REACT_APP_XMTP_ENDPOINT=https://mainnet.xmtp.network

# IPFS Configuration
REACT_APP_PINATA_API_KEY=your_pinata_api_key
REACT_APP_PINATA_SECRET_KEY=your_pinata_secret_key

# Blockchain Configuration
REACT_APP_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
REACT_APP_CHAIN_ID=1
```

## 🔧 Usage

### Basic Messaging
```tsx
import { useXMTP } from '@/contexts/XMTPContext';

function MyComponent() {
  const { 
    isConnected, 
    conversations, 
    sendMessage, 
    startConversation 
  } = useXMTP();

  const handleSendMessage = async () => {
    await sendMessage('conversation-id', 'Hello!');
  };

  return (
    <div>
      {isConnected ? (
        <div>Connected to XMTP</div>
      ) : (
        <button onClick={connectXMTP}>Connect XMTP</button>
      )}
    </div>
  );
}
```

### Domain Negotiation
```tsx
import DomainNegotiation from '@/components/DomainNegotiation';

function DomainPage() {
  return (
    <DomainNegotiation
      domainId="domain-123"
      domainName="example.eth"
      domainPrice="5.2 ETH"
      ownerAddress="0x..."
    />
  );
}
```

### On-Chain Links
```tsx
import OnChainLinks from '@/components/OnChainLinks';

function DomainDetails() {
  return (
    <OnChainLinks
      domainId="domain-123"
      tokenId="123"
      contractAddress="0x..."
      ownerAddress="0x..."
    />
  );
}
```

## 🔗 API Reference

### XMTPContext Methods

#### `connectXMTP()`
Connects to XMTP network using the current wallet.

#### `startConversation(peerAddress: string, domainId?: string)`
Starts a new conversation with a peer address.

#### `sendMessage(conversationId: string, content: string, messageType?: 'text' | 'offer' | 'transaction')`
Sends a message to a conversation.

#### `sendOffer(conversationId: string, amount: string, token: string)`
Sends a structured offer message.

#### `sendTransactionLink(conversationId: string, txHash: string)`
Shares a transaction hash in the conversation.

### Message Types

#### Text Message
```typescript
{
  id: string;
  content: string;
  senderAddress: string;
  timestamp: Date;
  conversationId: string;
  messageType: 'text';
}
```

#### Offer Message
```typescript
{
  id: string;
  content: string;
  senderAddress: string;
  timestamp: Date;
  conversationId: string;
  messageType: 'offer';
  metadata: {
    offerAmount: string;
    offerToken: string;
    domainId: string;
  };
}
```

#### Transaction Message
```typescript
{
  id: string;
  content: string;
  senderAddress: string;
  timestamp: Date;
  conversationId: string;
  messageType: 'transaction';
  metadata: {
    transactionHash: string;
    domainId: string;
  };
}
```

## 🔒 Security Features

### Message Encryption
- All messages are encrypted using XMTP's built-in encryption
- End-to-end encryption between participants
- No central server storing message content

### Transaction Verification
- Direct links to blockchain explorers
- Transaction hash verification
- Smart contract interaction verification

### Wallet Security
- Secure wallet connection
- Transaction signing with user confirmation
- No private key storage

## 🌐 Cross-Domain Communication

### Trusted Domains
Configure trusted domains for chat widget embedding:

```typescript
const TRUSTED_DOMAINS = [
  "https://yourdomain.com",
  "https://yourotherdomain.com"
];
```

### PostMessage API
Secure cross-domain communication:

```typescript
// Send message to iframe
iframe.contentWindow.postMessage(
  { type: 'CHAT_INIT', user: 'Alice' },
  'https://trusted-domain.com'
);

// Listen for messages
window.addEventListener('message', (event) => {
  if (TRUSTED_DOMAINS.includes(event.origin)) {
    // Handle trusted message
  }
});
```

## 📱 Mobile Support

### Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Optimized for small screens

### PWA Features
- Offline message caching
- Push notifications
- App-like experience

## 🚀 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## 📊 Analytics

### Message Analytics
- Conversation duration tracking
- Message response times
- Offer acceptance rates

### Domain Analytics
- Domain page views
- Offer frequency
- Conversion rates

## 🔧 Configuration

### XMTP Configuration
```typescript
const xmtpConfig = {
  env: 'production', // or 'dev'
  appVersion: '1.0.0',
  maxMessagesPerRequest: 50,
  messageRetentionPeriod: 30 * 24 * 60 * 60 * 1000 // 30 days
};
```

### Blockchain Configuration
```typescript
const blockchainConfig = {
  chainId: 1,
  rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY',
  contracts: {
    domainTokenization: '0x...',
    marketplace: '0x...',
    offerManager: '0x...'
  }
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Documentation: [docs.domaland.ai](https://docs.domaland.ai)
- Discord: [discord.gg/domaland](https://discord.gg/domaland)
- Email: support@domaland.ai

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ XMTP messaging integration
- ✅ Domain negotiation UI
- ✅ On-chain transaction links
- ✅ Offer management system

### Phase 2 (Next)
- 🔄 Voice messages
- 🔄 Video calls
- 🔄 Advanced analytics
- 🔄 Multi-chain support

### Phase 3 (Future)
- 📅 AI-powered negotiation
- 📅 Automated escrow
- 📅 Cross-platform sync
- 📅 Mobile app

---

Built with ❤️ for the DomainFi ecosystem


