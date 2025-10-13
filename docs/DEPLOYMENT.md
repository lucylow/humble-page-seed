# 🚀 Deployment Guide

Complete guide for deploying BitMind Smart Invoice System to Stacks testnet and mainnet.

---

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ **Clarinet installed** - [Installation guide](https://github.com/hirosystems/clarinet)
2. ✅ **Stacks wallet with testnet STX** - Get from [faucet](https://explorer.stacks.co/sandbox/faucet)
3. ✅ **Node.js 18+** for front-end deployment
4. ✅ **Verified contracts** - Run `npm run contracts:check`

---

## 🧪 Testnet Deployment

### Step 1: Configure Deployment Plan

Create `contracts/deployments/default.testnet-plan.yaml`:

```yaml
---
id: 0
name: Smart Invoice Escrow - Testnet
network: testnet
stacks-node: "https://stacks-node-api.testnet.stacks.co"
bitcoin-node: "http://blockstack:blockstacksystem@bitcoind.testnet.stacks.co:18332"
plan:
  batches:
    - id: 0
      transactions:
        - contract-publish:
            contract-name: mock-token
            expected-sender: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
            cost: 5000
            path: contracts/mock-token.clar
            anchor-block-only: true
    - id: 1
      transactions:
        - contract-publish:
            contract-name: escrow
            expected-sender: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
            cost: 10000
            path: contracts/escrow.clar
            anchor-block-only: true
```

### Step 2: Generate Deployment Transactions

```bash
cd contracts
clarinet deployments generate --testnet
```

This creates unsigned transactions in `contracts/deployments/default.testnet.generated.json`

### Step 3: Deploy Contracts

```bash
# Option A: Using Clarinet
clarinet deployments apply -p deployments/default.testnet-plan.yaml

# Option B: Manual deployment via Hiro Platform
# 1. Go to https://platform.hiro.so/
# 2. Connect your wallet
# 3. Navigate to "Deploy Contract"
# 4. Paste contract code and deploy
```

### Step 4: Note Contract Addresses

After deployment, save the contract addresses:

```bash
# Example output:
# mock-token: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-token
# escrow: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.escrow
```

### Step 5: Update Front-End Configuration

Edit `src/lib/stacksIntegration.ts`:

```typescript
// Replace with your deployed addresses
export const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
export const ESCROW_CONTRACT = 'escrow';
export const TOKEN_CONTRACT = 'mock-token';
```

### Step 6: Test the Deployment

```bash
# In Clarinet console
clarinet console --testnet

# Test contract calls
>> (contract-call? .mock-token mint u1000000 tx-sender)
>> (contract-call? .escrow get-invoice u1)
```

---

## 🌐 Mainnet Deployment

### ⚠️ Pre-Deployment Checklist

Before deploying to mainnet:

- [ ] All tests passing (`npm run contracts:test`)
- [ ] Security audit completed (recommended)
- [ ] Contract addresses finalized
- [ ] sBTC token contract identified
- [ ] Arbitration process established
- [ ] Front-end thoroughly tested on testnet
- [ ] Sufficient STX for deployment fees (~50-100 STX)

### Step 1: Create Mainnet Plan

Create `contracts/deployments/default.mainnet-plan.yaml`:

```yaml
---
id: 0
name: Smart Invoice Escrow - Mainnet
network: mainnet
stacks-node: "https://stacks-node-api.stacks.co"
bitcoin-node: "http://blockstack:blockstacksystem@bitcoin.stacks.co:8332"
plan:
  batches:
    - id: 0
      transactions:
        - contract-publish:
            contract-name: escrow
            expected-sender: SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS
            cost: 50000
            path: contracts/escrow.clar
            anchor-block-only: true
```

**Note:** Do NOT deploy `mock-token` to mainnet. Use the official sBTC contract instead.

### Step 2: Update sBTC Integration

Edit `contracts/escrow.clar` to reference the mainnet sBTC contract:

```clarity
;; Change hardcoded references to use passed token-contract parameter
;; Or update the ack-deposit function to:

(define-public (ack-deposit (invoice-id uint))
  (let ((invoice (unwrap! (map-get? invoices {invoice-id: invoice-id}) (err ERR-INVOICE-EXISTS)))
        (token-contract (get token-contract invoice))  ;; Use invoice's token
        (needed (get amount invoice)))
    ;; ... rest of function
```

### Step 3: Deploy to Mainnet

```bash
# Generate transactions
clarinet deployments generate --mainnet

# Review the generated plan carefully
cat contracts/deployments/default.mainnet.generated.json

# Deploy (requires mainnet STX in wallet)
clarinet deployments apply -p deployments/default.mainnet-plan.yaml --mainnet
```

### Step 4: Verify Deployment

Check your contracts on Stacks Explorer:

```
https://explorer.stacks.co/txid/[TRANSACTION_ID]?chain=mainnet
```

### Step 5: Update Production Configuration

```typescript
// src/lib/stacksIntegration.ts
const NETWORK = new StacksMainnet(); // Changed from StacksTestnet
export const CONTRACT_ADDRESS = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS';
export const ESCROW_CONTRACT = 'escrow';
export const TOKEN_CONTRACT = 'SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.sbtc-token'; // Official sBTC
```

---

## 🎨 Front-End Deployment

### Option 1: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Build and deploy
npm run build
vercel --prod
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages

```bash
# Install gh-pages
npm i -g gh-pages

# Build with correct base path
npm run build

# Deploy
gh-pages -d dist
```

### Environment Variables

Set these in your deployment platform:

```bash
VITE_CONTRACT_ADDRESS=SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS
VITE_ESCROW_CONTRACT=escrow
VITE_TOKEN_CONTRACT=SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.sbtc-token
VITE_NETWORK=mainnet
VITE_OPENAI_API_KEY=sk-... (optional, client-side only)
```

---

## 🔧 Post-Deployment

### 1. Initialize Contract (if needed)

```clarity
;; If you have an init function
(contract-call? .escrow initialize tx-sender)
```

### 2. Test End-to-End Flow

Create a test invoice with a small amount:

```typescript
// Use the deployed contract
await createInvoice(
  999, // test ID
  'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  100000, // 0.001 sBTC
  'SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.sbtc-token',
  'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
  99999999,
  userSession
);
```

### 3. Monitor Transactions

Use these tools to monitor your contracts:

- **Stacks Explorer**: https://explorer.stacks.co/
- **Hiro Platform**: https://platform.hiro.so/
- **API Endpoint**: https://stacks-node-api.stacks.co/extended/v1/address/[YOUR_ADDRESS]/transactions

### 4. Set Up Analytics (Optional)

```typescript
// Add to your app
import { track } from '@vercel/analytics';

track('invoice_created', {
  invoiceId: invoice.id,
  amount: invoice.amount,
});
```

---

## 🐛 Troubleshooting

### Contract Deployment Fails

**Error:** `ContractAlreadyExists`
- Solution: Change contract name or use a different deployer address

**Error:** `InsufficientBalance`
- Solution: Add more STX to your wallet (need ~50-100 STX for mainnet)

**Error:** `BadFunctionArgument`
- Solution: Check contract syntax with `clarinet check`

### Front-End Issues

**Error:** `Contract not found`
- Solution: Verify contract addresses in `stacksIntegration.ts`

**Error:** `Failed to broadcast transaction`
- Solution: Check network configuration (testnet vs mainnet)

**Error:** `Post condition failed`
- Solution: Adjust post-condition mode or add explicit post-conditions

---

## 📊 Cost Estimates

### Testnet
- Contract deployment: FREE (testnet STX from faucet)
- Transaction fees: ~0.001 STX per transaction

### Mainnet
- `mock-token` deployment: ~30-40 STX
- `escrow` deployment: ~40-60 STX
- Each invoice creation: ~0.01-0.05 STX
- Token transfer: ~0.01-0.03 STX
- Release/refund: ~0.01-0.05 STX

**Total initial deployment cost: ~100-150 STX (~$100-150 at current prices)**

---

## 🔐 Security Considerations

### Before Mainnet Launch

1. **Audit smart contracts** - Consider professional audit
2. **Test dispute resolution** - Verify arbiter flow works
3. **Set limits** - Add max invoice amounts if needed
4. **Emergency pause** - Consider adding pause functionality
5. **Multi-sig for large amounts** - Implement for high-value invoices

### Recommended Contract Additions

```clarity
;; Add owner/admin
(define-data-var contract-owner principal tx-sender)

;; Add pause mechanism
(define-data-var contract-paused bool false)

;; Add max invoice amount
(define-constant MAX-INVOICE-AMOUNT u100000000000) ;; 1000 sBTC
```

---

## 📈 Monitoring & Maintenance

### Key Metrics to Track

1. Total invoices created
2. Total value locked in escrow
3. Average time to completion
4. Dispute rate
5. Failed transactions

### Regular Maintenance

- Monitor contract balance
- Review dispute cases
- Update front-end dependencies
- Check for Clarity updates
- Maintain arbiter list

---

## 🎉 Success!

Your Smart Invoice system is now live! Share it with:

- Stacks community on Discord
- Twitter with #Stacks #Bitcoin
- Product Hunt
- Hackathon judges

**Questions?** Open an issue or reach out on Discord!

---

**Last updated:** 2025-10-13

