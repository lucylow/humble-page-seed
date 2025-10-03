# DomaLand.AI Backend - Blockchain Foundation

A comprehensive backend system for DomaLand.AI that integrates with Doma Protocol to enable domain tokenization, management, and trading on multiple blockchain networks.

## 🚀 Features

### Core Functionality
- **Domain Registration & Management**: Register and manage domain portfolios
- **Doma Protocol Integration**: Full integration with Doma Protocol for blockchain operations
- **Multi-Chain Support**: Ethereum, Polygon, and Base network support
- **Domain Tokenization**: Convert domains into ERC-721 NFTs using Doma Protocol
- **Cross-Chain Bridging**: Move domain tokens between supported chains
- **Ownership Claiming**: Claim ownership of tokenized domains with proof of contacts
- **Marketplace Integration**: List and trade tokenized domains
- **Transaction Tracking**: Monitor blockchain transactions and status updates

### Technical Features
- **RESTful API**: Comprehensive REST API for all domain operations
- **Database Integration**: SQLite database with SQLAlchemy ORM
- **Web3 Integration**: Direct blockchain interaction using Web3.py
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **Error Handling**: Comprehensive error handling and logging
- **Transaction Management**: Automatic transaction status updates

## 🏗️ Architecture

```
DomaLand Backend Architecture
├── Flask Application Layer
│   ├── REST API Endpoints (/api/*)
│   ├── CORS Configuration
│   └── Error Handling
├── Business Logic Layer
│   ├── Domain Service (domain operations)
│   ├── Doma Protocol Client (blockchain integration)
│   └── Transaction Management
├── Data Layer
│   ├── SQLAlchemy Models (Domain, User, Transaction)
│   ├── SQLite Database
│   └── Database Migrations
└── Blockchain Integration
    ├── Web3 Connections (Multi-chain)
    ├── Smart Contract Interfaces
    └── Transaction Signing & Submission
```

## 📦 Installation & Setup

### Prerequisites
- Python 3.11+
- Virtual environment support
- Git

### Quick Start

1. **Clone and Setup**
```bash
# The project is already set up in /home/ubuntu/domaland-backend
cd domaland-backend
source venv/bin/activate
```

2. **Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit configuration (optional for demo)
# nano .env
```

3. **Start the Application**
```bash
python src/main.py
```

The application will start on `http://0.0.0.0:5000`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_ENV` | Flask environment | `development` |
| `SECRET_KEY` | Flask secret key | Auto-generated |
| `DATABASE_URL` | Database connection string | SQLite local file |
| `DOMA_PRIVATE_KEY` | Private key for Doma operations | Demo key |
| `REGISTRAR_PRIVATE_KEY` | Registrar private key for vouchers | Demo key |

### Supported Blockchain Networks

| Network | Chain ID | Status | Features |
|---------|----------|--------|----------|
| Ethereum | `eip155:1` | Demo RPC | Full Doma Protocol support |
| Polygon | `eip155:137` | Connected | Lower fees, fast transactions |
| Base | `eip155:8453` | Demo RPC | Optimized for DeFi |

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Domain Operations

#### Register Domain
```http
POST /api/domains
Content-Type: application/json

{
  "user_id": 1,
  "domain_name": "example.com",
  "owner_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "estimated_value": 1000.0
}
```

#### Get User Domains
```http
GET /api/domains?user_id=1&status=registered
```

#### Get Domain Details
```http
GET /api/domains/1
```

#### Tokenize Domain
```http
POST /api/domains/1/tokenize
Content-Type: application/json

{
  "chain_name": "polygon",
  "owner_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}
```

#### Claim Domain Ownership
```http
POST /api/domains/1/claim
Content-Type: application/json

{
  "token_id": 12345,
  "registrant_handle": 67890
}
```

#### Bridge Domain Token
```http
POST /api/domains/1/bridge
Content-Type: application/json

{
  "target_chain": "ethereum",
  "target_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}
```

### Marketplace Operations

#### List Domain for Sale
```http
POST /api/domains/1/list
Content-Type: application/json

{
  "price": 5000.0
}
```

#### Get Marketplace Domains
```http
GET /api/marketplace?limit=20&min_price=100&max_price=10000
```

### Transaction Management

#### Get Transactions
```http
GET /api/transactions?user_id=1&type=tokenize&status=pending
```

#### Update Transaction Status
```http
PUT /api/transactions/1/status
```

### System Information

#### Get Supported Chains
```http
GET /api/chains
```

#### Get Domain Statistics
```http
GET /api/stats
```

## 🔐 Doma Protocol Integration

### Key Components

1. **DomaProtocolClient**: Main client for blockchain interactions
2. **Tokenization Vouchers**: EIP-712 signed vouchers for domain tokenization
3. **Proof of Contacts**: Verification system for domain ownership claims
4. **Cross-Chain Bridging**: Token movement between supported chains

### Smart Contract Interfaces

- **Proxy Doma Record**: Main contract for domain operations
- **Ownership Token**: ERC-721 NFT contract for domain tokens
- **Doma Gateway**: Cross-chain messaging contract

### Transaction Flow

1. **Registration**: Domain registered in local database
2. **Tokenization**: Voucher created and signed, transaction submitted to blockchain
3. **Claiming**: Proof of contacts verified, ownership claimed on-chain
4. **Bridging**: Token moved to target chain via Doma Gateway
5. **Trading**: Listed domains available in marketplace

## 🧪 Testing

### Manual API Testing

1. **Create a User**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com"}'
```

2. **Register a Domain**
```bash
curl -X POST http://localhost:5000/api/domains \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "domain_name": "test-domain.com",
    "owner_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  }'
```

3. **Tokenize Domain**
```bash
curl -X POST http://localhost:5000/api/domains/1/tokenize \
  -H "Content-Type: application/json" \
  -d '{
    "chain_name": "polygon",
    "owner_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  }'
```

### Database Inspection

```bash
# Access SQLite database
sqlite3 src/database/app.db

# View tables
.tables

# View domains
SELECT * FROM domains;

# View transactions
SELECT * FROM domain_transactions;
```

## 🚀 Deployment

### Local Development
```bash
python src/main.py
```

### Production Deployment
```bash
# Update requirements
pip freeze > requirements.txt

# Use production WSGI server
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 src.main:app
```

## 📊 Database Schema

### Domain Model
- **Basic Info**: name, sld, tld, owner
- **Status Tracking**: registration, tokenization, claiming status
- **Blockchain Data**: token_id, chain_id, contract_address
- **Marketplace**: listing_price, is_listed
- **Doma Protocol**: voucher_nonce, proof_of_contacts_handle

### Transaction Model
- **Transaction Details**: hash, block_number, gas_used
- **Status Tracking**: pending, confirmed, failed
- **Metadata**: chain_name, operation parameters
- **Error Handling**: error_message for failed transactions

## 🔍 Monitoring & Debugging

### Application Logs
- Database operations logged to console
- Blockchain connection status displayed on startup
- Transaction status updates tracked

### Common Issues

1. **Blockchain Connection Failures**: Check RPC URLs and network connectivity
2. **Transaction Failures**: Verify gas limits and account balances
3. **Database Errors**: Ensure proper migrations and schema updates

## 🤝 Integration Points

### Frontend Integration
- CORS enabled for all origins
- RESTful API with JSON responses
- Comprehensive error handling with status codes

### Blockchain Integration
- Multi-chain Web3 connections
- Automatic transaction monitoring
- Smart contract interaction abstractions

### External Services
- Doma Protocol smart contracts
- Blockchain RPC providers
- Domain registrar systems

## 📈 Performance Considerations

- **Database Indexing**: Optimized queries for domain lookups
- **Connection Pooling**: Efficient blockchain connection management
- **Caching**: Transaction status caching to reduce RPC calls
- **Async Operations**: Non-blocking blockchain interactions

## 🛡️ Security Features

- **Private Key Management**: Secure key storage and usage
- **Input Validation**: Comprehensive request validation
- **Error Sanitization**: Safe error message exposure
- **CORS Configuration**: Controlled cross-origin access

## 📝 Development Notes

### Code Structure
- **Models**: SQLAlchemy ORM models in `src/models/`
- **Services**: Business logic in `src/services/`
- **Routes**: API endpoints in `src/routes/`
- **Configuration**: Environment-based configuration

### Best Practices
- **Error Handling**: Try-catch blocks with proper error responses
- **Database Transactions**: Atomic operations for data consistency
- **Code Documentation**: Comprehensive docstrings and comments
- **Type Hints**: Python type annotations for better code clarity

## 🎯 Future Enhancements

- **Authentication & Authorization**: JWT-based user authentication
- **Rate Limiting**: API rate limiting for production use
- **Caching Layer**: Redis integration for improved performance
- **Event System**: Webhook notifications for transaction updates
- **Analytics**: Domain valuation and market analytics
- **Testing Suite**: Comprehensive unit and integration tests

---

**Built with ❤️ for the DomaLand.AI ecosystem**

This backend provides a solid foundation for domain tokenization and management using the Doma Protocol. The modular architecture allows for easy extension and customization based on specific requirements.

