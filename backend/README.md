# BitMind Smart Invoice Backend

AI-powered invoice escrow system backend built on Node.js with Stacks blockchain integration.

## 🏗️ Architecture Overview

### Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Blockchain**: Stacks.js + Clarity Smart Contracts
- **AI**: OpenAI GPT-4 for invoice parsing
- **Storage**: IPFS via Pinata
- **Cache**: Redis for rate limiting and sessions

### Core Features
- 🤖 AI-powered natural language invoice parsing
- 📝 Smart contract generation and deployment
- 💰 Milestone-based payment escrow
- ⚖️ Decentralized dispute resolution
- 📦 IPFS document storage
- 🔒 Secure blockchain transactions

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- PostgreSQL database
- Redis (optional, for rate limiting)
- Stacks wallet with testnet STX
- OpenAI API key
- Pinata account for IPFS

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up database**
```bash
npm run prisma:migrate
npm run prisma:generate
```

4. **Start development server**
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/         # Route handlers
│   │   └── invoiceController.js
│   ├── services/           # Business logic
│   │   ├── aiProcessor.js       # AI invoice parsing
│   │   ├── contractService.js   # Blockchain interactions
│   │   ├── invoiceService.js    # Invoice management
│   │   └── storageService.js    # IPFS storage
│   ├── middleware/         # Express middleware
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── requestLogger.js
│   ├── routes/             # API routes
│   │   ├── index.js
│   │   └── invoiceRoutes.js
│   ├── utils/              # Utilities
│   │   ├── logger.js
│   │   └── validators.js
│   └── server.js           # Express app entry point
├── prisma/
│   └── schema.prisma       # Database schema
├── scripts/                # Deployment scripts
├── tests/                  # Test suites
├── package.json
└── .env.example
```

## 🔌 API Endpoints

### Invoice Management

#### Parse Invoice with AI
```http
POST /api/v1/invoice/parse
Content-Type: application/json

{
  "description": "Natural language invoice description..."
}
```

#### Create Smart Invoice
```http
POST /api/v1/invoice/create
Content-Type: application/json

{
  "description": "Build a website...",
  "clientWallet": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  "useAI": true
}
```

#### Get Invoice
```http
GET /api/v1/invoice/:id
```

#### Get User Invoices
```http
GET /api/v1/invoice/user/:walletAddress
```

#### Get Invoice Status
```http
GET /api/v1/invoice/:id/status
```

### Invoice Actions

#### Lock Funds
```http
POST /api/v1/invoice/:id/lock
Content-Type: application/json

{
  "amount": 1000000,
  "clientKey": "private-key"
}
```

#### Release Milestone
```http
POST /api/v1/invoice/:id/release
Content-Type: application/json

{
  "milestoneId": "milestone-id",
  "clientKey": "private-key"
}
```

### Dispute Resolution

#### Raise Dispute
```http
POST /api/v1/invoice/:id/dispute
Content-Type: application/json

{
  "raisedBy": "wallet-address",
  "reason": "Dispute reason...",
  "evidence": "Evidence details...",
  "userKey": "private-key"
}
```

#### Resolve Dispute
```http
POST /api/v1/dispute/:id/resolve
Content-Type: application/json

{
  "resolution": "Resolution details...",
  "favorClient": true,
  "arbitratorKey": "private-key"
}
```

### Utility Endpoints

#### Health Check
```http
GET /api/health
```

#### API Info
```http
GET /api/info
```

## 🔐 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smartinvoice"

# Stacks Blockchain
STACKS_NODE_URL="https://stacks-node-api.testnet.stacks.co"
STACKS_NETWORK="testnet"
DEPLOYER_PRIVATE_KEY="your-private-key"

# OpenAI
OPENAI_API_KEY="your-openai-key"
OPENAI_MODEL="gpt-4"

# IPFS (Pinata)
PINATA_JWT="your-pinata-jwt"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# Server
NODE_ENV="development"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📊 Database Management

```bash
# Generate Prisma client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

## 🔧 Development

### Code Structure
- All business logic in `services/`
- Route handlers in `controllers/`
- Database operations use Prisma ORM
- Blockchain interactions via `contractService.js`
- AI processing in `aiProcessor.js`

### Error Handling
- Global error handler middleware
- Async error wrapper for controllers
- Detailed logging with Winston

### Validation
- Request validation with express-validator
- Stacks address format validation
- Input sanitization

### Security
- Helmet.js for HTTP headers
- CORS configuration
- Rate limiting with Redis
- Input validation and sanitization

## 📝 Logging

Logs are written to:
- Console (colored output in development)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)

Log levels: error, warn, info, http, debug

## 🚢 Deployment

### Production Build
```bash
npm run build
```

### Start Production Server
```bash
NODE_ENV=production npm start
```

### Environment Setup
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Start Redis (optional)
5. Deploy to hosting platform

### Recommended Hosting
- **Backend**: Heroku, Railway, DigitalOcean
- **Database**: Heroku Postgres, Supabase, Railway
- **Redis**: Redis Cloud, Heroku Redis
- **IPFS**: Pinata

## 📚 Additional Resources

- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language Reference](https://docs.stacks.co/clarity/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [OpenAI API Reference](https://platform.openai.com/docs/)
- [Pinata IPFS Documentation](https://docs.pinata.cloud/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check documentation
- Review API examples

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release
- AI-powered invoice parsing
- Smart contract deployment
- Milestone management
- Dispute resolution
- IPFS integration

