# Smart Invoice Contract Deployment Guide

This guide walks you through deploying the BitMind Smart Invoice contracts to Stacks blockchain.

## 📋 Prerequisites

1. **Clarinet Installed**
   ```bash
   # Verify installation
   clarinet --version
   ```

2. **Stacks Wallet**
   - Testnet: Get testnet STX from [faucet](https://explorer.stacks.co/sandbox/faucet?chain=testnet)
   - Mainnet: Ensure you have sufficient STX for deployment

3. **Private Key/Seed Phrase**
   - Never commit these to version control!
   - Store securely in environment variables

## 🧪 Local Development & Testing

### 1. Test Contracts Locally

```bash
cd contracts

# Run all tests
clarinet test

# Run specific test
clarinet test --filter "Test: Create invoice"

# Check contract syntax
clarinet check
```

### 2. Interactive Console Testing

```bash
clarinet console

# In console:
::get_accounts
::get_assets_maps
::advance_chain_tip 10

# Test contract calls
(contract-call? .smart-invoice-escrow create-invoice 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC none u1000000)
```

### 3. Run Local DevNet

```bash
# Start local Stacks node
clarinet integrate

# In another terminal:
# Your frontend can now connect to http://localhost:20443
npm run dev
```

## 🚀 Testnet Deployment

### Step 1: Generate Deployment Plan

```bash
cd contracts

# Generate testnet deployment plan
clarinet deployments generate --testnet
```

This creates `deployments/default.testnet-plan.yaml`

### Step 2: Configure Deployment

Edit `deployments/default.testnet-plan.yaml`:

```yaml
---
id: 0
name: BitMind Smart Invoice Deployment
network: testnet
stacks-node: "https://stacks-node-api.testnet.stacks.co"
bitcoin-node: "http://blockstack:blockstacksystem@bitcoind.testnet.stacks.co:18332"
plan:
  batches:
    - id: 0
      transactions:
        - contract-publish:
            contract-name: smart-invoice-escrow
            expected-sender: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
            cost: 56980
            path: contracts/smart-invoice-escrow.clar
            anchor-block-only: true
```

### Step 3: Set Up Deployment Keys

**Option A: Using Environment Variables**

```bash
# Set your Stacks testnet private key
export STACKS_PRIVATE_KEY="your_testnet_private_key_here"
```

**Option B: Using Clarinet Configuration**

```bash
# Create deployment configuration
cat > deployments/.env << EOF
STACKS_PRIVATE_KEY=your_testnet_private_key_here
EOF

# Add to .gitignore
echo "deployments/.env" >> .gitignore
```

### Step 4: Deploy to Testnet

```bash
# Deploy using the plan
clarinet deployments apply -p deployments/default.testnet-plan.yaml

# Or use the deployment script
npm run deploy:testnet
```

### Step 5: Verify Deployment

```bash
# Check deployment status
clarinet deployments list

# View on explorer
# Visit: https://explorer.stacks.co/txid/YOUR_TX_ID?chain=testnet
```

## 🌐 Mainnet Deployment

⚠️ **CRITICAL**: Test thoroughly on testnet before mainnet deployment!

### Step 1: Final Testing Checklist

- [ ] All unit tests passing
- [ ] Integration tests successful on testnet
- [ ] Frontend integration tested
- [ ] Security audit completed (recommended)
- [ ] Gas costs estimated
- [ ] Rollback plan prepared

### Step 2: Generate Mainnet Plan

```bash
cd contracts

# Generate mainnet deployment plan
clarinet deployments generate --mainnet
```

### Step 3: Configure Mainnet Deployment

Edit `deployments/default.mainnet-plan.yaml`:

```yaml
---
id: 0
name: BitMind Smart Invoice - Mainnet
network: mainnet
stacks-node: "https://stacks-node-api.mainnet.stacks.co"
bitcoin-node: "http://blockstack:blockstacksystem@bitcoind.mainnet.stacks.co:8332"
plan:
  batches:
    - id: 0
      transactions:
        - contract-publish:
            contract-name: smart-invoice-escrow
            expected-sender: SP000000000000000000002Q6VF78
            cost: 56980
            path: contracts/smart-invoice-escrow.clar
            anchor-block-only: true
```

### Step 4: Set Mainnet Keys

```bash
# Use a DIFFERENT key than testnet!
export STACKS_MAINNET_PRIVATE_KEY="your_mainnet_private_key"
```

### Step 5: Deploy to Mainnet

```bash
# Deploy
clarinet deployments apply -p deployments/default.mainnet-plan.yaml --mainnet

# Confirm transaction
# Monitor: https://explorer.stacks.co
```

## 🔧 Post-Deployment Configuration

### Update Frontend Environment Variables

Create `.env.production`:

```bash
# Testnet
VITE_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
VITE_NETWORK=testnet

# Mainnet (when ready)
# VITE_CONTRACT_ADDRESS=SP000000000000000000002Q6VF78
# VITE_NETWORK=mainnet
```

### Verify Contract Functions

```bash
# Test read-only functions
curl -X POST https://stacks-node-api.testnet.stacks.co/v2/contracts/call-read/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM/smart-invoice-escrow/get-escrow-balance \
  -H 'Content-Type: application/json' \
  -d '{
    "sender": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "arguments": []
  }'
```

## 📊 Monitoring & Maintenance

### Transaction Monitoring

```bash
# Check contract transactions
# Testnet Explorer
https://explorer.stacks.co/address/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM?chain=testnet

# Mainnet Explorer
https://explorer.stacks.co/address/YOUR_ADDRESS?chain=mainnet
```

### Contract Upgrades

Clarity contracts are immutable. For upgrades:

1. Deploy new contract version
2. Migrate data (if needed)
3. Update frontend to use new contract
4. Deprecate old contract gracefully

## 🛡️ Security Best Practices

1. **Never Hardcode Keys**
   ```bash
   # Bad ❌
   const privateKey = "abc123...";
   
   # Good ✅
   const privateKey = process.env.STACKS_PRIVATE_KEY;
   ```

2. **Use Post Conditions**
   - Always add STX transfer post-conditions
   - Prevent unexpected token transfers

3. **Audit Before Mainnet**
   - Code review
   - Professional audit (recommended)
   - Bug bounty program

4. **Start Small**
   - Deploy with limited initial funds
   - Test with real users on testnet
   - Gradual rollout

## 🆘 Troubleshooting

### Deployment Fails

```bash
# Check balance
clarinet deployments check-balance ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM

# Verify contract syntax
clarinet check

# Check network connectivity
curl https://stacks-node-api.testnet.stacks.co/v2/info
```

### Transaction Stuck

- Check mempool: https://explorer.stacks.co/transactions
- Increase fee (if needed)
- Wait for Bitcoin block confirmation

### Contract Not Found

- Verify deployment transaction confirmed
- Check correct network (testnet vs mainnet)
- Wait for ~10 minutes for indexer sync

## 📚 Additional Resources

- [Clarinet Documentation](https://docs.hiro.so/clarinet)
- [Stacks Deployment Guide](https://docs.stacks.co/write-smart-contracts/deploy-contract)
- [Clarity Language Reference](https://docs.stacks.co/clarity)
- [Testnet Faucet](https://explorer.stacks.co/sandbox/faucet?chain=testnet)
- [Explorer](https://explorer.stacks.co)

## 📞 Support

- GitHub Issues: [bitmind-smart-invoice/issues](https://github.com/yourusername/bitmind-smart-invoice/issues)
- Discord: [Stacks Discord](https://discord.gg/stacks)
- Documentation: [docs.stacks.co](https://docs.stacks.co)

---

**Ready to deploy?** Start with local testing, then testnet, and finally mainnet! 🚀

