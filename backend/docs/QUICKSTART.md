# BitMind Smart Invoice - Quick Start Guide

Get up and running with the BitMind Smart Invoice backend in 5 minutes!

## Prerequisites

Before you begin, ensure you have:
- ✅ Node.js v18+ installed
- ✅ PostgreSQL database running
- ✅ OpenAI API key
- ✅ Pinata account (for IPFS)
- ✅ Stacks wallet with testnet STX

## Step 1: Clone and Install

```bash
cd backend
npm install
```

## Step 2: Configure Environment

Create `.env` file from template:

```bash
cp .env.template .env
```

Edit `.env` and add your credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smartinvoice"

# Stacks (use testnet for development)
STACKS_NODE_URL="https://stacks-node-api.testnet.stacks.co"
STACKS_NETWORK="testnet"
DEPLOYER_PRIVATE_KEY="your-testnet-private-key"

# OpenAI
OPENAI_API_KEY="sk-..."

# Pinata
PINATA_JWT="your-pinata-jwt"

# Server
NODE_ENV="development"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

## Step 3: Set Up Database

Run Prisma migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

(Optional) Seed with sample data:

```bash
npm run prisma:seed
```

## Step 4: Verify Configuration

Run the deployment check:

```bash
npm run deploy:check
```

This will verify:
- ✅ Environment variables
- ✅ Database connection
- ✅ Stacks blockchain connection
- ✅ OpenAI API access
- ✅ Pinata IPFS access

## Step 5: Start the Server

```bash
npm run dev
```

You should see:

```
🚀 BitMind Smart Invoice API running on 0.0.0.0:3001
📝 Environment: development
🌐 CORS enabled for: http://localhost:5173
🔗 Stacks Network: testnet
```

## Step 6: Test the API

### Health Check

```bash
curl http://localhost:3001/api/health
```

### Parse an Invoice with AI

```bash
curl -X POST http://localhost:3001/api/v1/invoice/parse \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Build a website for $5000. First milestone: Design for $2000. Second milestone: Development for $2000. Final milestone: Deployment for $1000."
  }'
```

### Create an Invoice

```bash
curl -X POST http://localhost:3001/api/v1/invoice/create \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Website development project",
    "clientAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "contractorAddress": "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
    "totalAmount": 5000,
    "currency": "sBTC",
    "milestones": [
      {
        "sequence": 1,
        "title": "Design",
        "description": "UI/UX Design",
        "amount": 2000,
        "condition": "Design approved"
      },
      {
        "sequence": 2,
        "title": "Development",
        "description": "Build the website",
        "amount": 2000,
        "condition": "Site deployed"
      },
      {
        "sequence": 3,
        "title": "Final",
        "description": "Testing and handoff",
        "amount": 1000,
        "condition": "Client acceptance"
      }
    ],
    "clientWallet": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "useAI": false
  }'
```

## Common Issues

### Database Connection Error

**Problem:** `Error: connect ECONNREFUSED`

**Solution:** 
1. Make sure PostgreSQL is running
2. Check DATABASE_URL in .env
3. Create the database: `createdb smartinvoice`

### OpenAI Rate Limit

**Problem:** `Error: Rate limit exceeded`

**Solution:**
1. Wait a few minutes
2. Consider upgrading OpenAI plan
3. Use `OPENAI_MODEL="gpt-3.5-turbo"` for cheaper option

### Stacks Transaction Failed

**Problem:** `Contract deployment failed`

**Solution:**
1. Ensure you have testnet STX
2. Get free testnet STX from [faucet](https://explorer.stacks.co/sandbox/faucet?chain=testnet)
3. Verify DEPLOYER_PRIVATE_KEY is correct

### Pinata Upload Failed

**Problem:** `IPFS upload failed`

**Solution:**
1. Check PINATA_JWT is valid
2. Verify Pinata account has space
3. Invoice will still be created without IPFS hash

## Next Steps

1. **Explore the API** - Check out [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. **Run Tests** - `npm test`
3. **View Database** - `npm run prisma:studio`
4. **Integrate Frontend** - Connect your React app
5. **Deploy Smart Contracts** - Test on Stacks testnet

## Development Tools

### Prisma Studio
Visual database browser:
```bash
npm run prisma:studio
```

### Logs
Check logs in `logs/` directory:
- `combined.log` - All logs
- `error.log` - Errors only

### Testing
Run test suite:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

## Production Deployment

For production deployment guide, see [DEPLOYMENT.md](./DEPLOYMENT.md) (coming soon)

## Getting Help

- 📖 Documentation: `docs/` folder
- 🐛 Issues: GitHub Issues
- 💬 Community: Discord/Telegram
- 📧 Email: support@bitmind.example

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run prisma:studio` | Open database GUI |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:seed` | Seed sample data |
| `npm run deploy:check` | Verify configuration |

Happy coding! 🚀

