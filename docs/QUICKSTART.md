# ⚡ Quick Start Guide

Get up and running with BitMind Smart Invoice in **under 10 minutes**.

---

## 🎯 Choose Your Path

### 🧪 Path A: Test Locally (No Deployment)
**Best for:** Learning, development, hackathon prep  
**Time:** 5 minutes

### 🌐 Path B: Deploy to Testnet
**Best for:** Demos, testing with real transactions  
**Time:** 15 minutes

### 🚀 Path C: Production Deployment
**Best for:** Real DAO usage  
**Time:** 30 minutes + audit time

---

## 🧪 Path A: Local Testing (5 min)

### 1. Install Dependencies (2 min)

```bash
# Clone and enter directory
cd bitmind-smart-invoice-demo

# Install Node packages
npm install

# Install Clarinet (if not already installed)
# macOS:
brew install clarinet

# Linux:
wget -nv https://github.com/hirosystems/clarinet/releases/download/v1.7.0/clarinet-linux-x64-glibc.tar.gz -O clarinet.tar.gz
tar -xf clarinet.tar.gz
chmod +x ./clarinet
sudo mv ./clarinet /usr/local/bin

# Windows (use WSL2 or download from GitHub releases)
```

### 2. Test Smart Contracts (1 min)

```bash
npm run contracts:test
```

Expected output:
```
✓ End-to-end escrow test: create → fund → release (passed)
✓ Test refund functionality (passed)
✓ Test unauthorized release attempt fails (passed)

3 tests passed, 0 failed
```

### 3. Start Local Console (2 min)

```bash
npm run contracts:console
```

Try these commands:
```clarity
;; Mint test tokens
(contract-call? .mock-token mint u1000000 tx-sender)

;; Create invoice
(contract-call? .escrow create-invoice 
  u1 
  'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC 
  u500000 
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-token
  'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND
  u99999999)

;; Check invoice
(contract-call? .escrow get-invoice u1)
```

✅ **You're ready to develop!**

---

## 🌐 Path B: Testnet Deployment (15 min)

### 1. Setup (5 min)

```bash
# Get testnet STX from faucet
open https://explorer.stacks.co/sandbox/faucet

# Create Hiro Wallet account
open https://wallet.hiro.so/

# Save your Secret Key safely!
```

### 2. Deploy Contracts (5 min)

**Option A: Manual via Hiro Platform**
```bash
# 1. Go to https://platform.hiro.so/
# 2. Connect wallet (testnet)
# 3. Click "Deploy Contract"
# 4. Name: mock-token
# 5. Paste contents of contracts/mock-token.clar
# 6. Deploy (costs ~0.5 testnet STX)
# 7. Repeat for contracts/escrow.clar
```

**Option B: CLI with Clarinet**
```bash
cd contracts
clarinet deployments generate --testnet
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

### 3. Update Front-End Config (2 min)

Edit `src/lib/stacksIntegration.ts`:
```typescript
export const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // YOUR ADDRESS
```

### 4. Start Front-End (3 min)

```bash
npm run dev
```

Open http://localhost:5173

✅ **Live on testnet!**

---

## 🚀 Path C: Production Setup (30+ min)

### Prerequisites Checklist

- [ ] All tests passing
- [ ] Contracts audited (recommended)
- [ ] Mainnet STX (~100 STX for deployment)
- [ ] sBTC contract address confirmed
- [ ] Legal review (if required)
- [ ] Emergency procedures documented

### Steps

1. **Review Security** (10 min)
   - Read `DEPLOYMENT.md` security section
   - Consider adding pause mechanism
   - Set up multi-sig for admin functions

2. **Deploy to Mainnet** (10 min)
   ```bash
   clarinet deployments apply -p deployments/default.mainnet-plan.yaml --mainnet
   ```

3. **Verify & Test** (10 min)
   - Create test invoice with small amount
   - Complete full cycle
   - Monitor for 24 hours

4. **Go Live** (ongoing)
   - Announce to community
   - Set up monitoring
   - Establish support process

See `DEPLOYMENT.md` for full details.

---

## 🎨 Quick Demo (3 min)

### 1. Prepare Sample Invoice Text

```
Invoice #2024-001
To: SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7
From: DAO Treasury
Amount: 0.05 sBTC for website design
Milestone: Deliver mockups by 2025-12-31
Arbiter: SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE
```

### 2. Get API Key

- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/

### 3. Run AI Parser

```bash
# Option A: Front-end UI
npm run dev
# Navigate to /demo
# Paste invoice text
# Click "Parse with AI"

# Option B: CLI
echo '{...invoice json...}' | node scripts/ai-clarity-mapper.js --stdin --format clarity
```

### 4. See the Magic ✨

AI output → Clarity contract → Bitcoin escrow

---

## 🐛 Troubleshooting

### "Command not found: clarinet"
```bash
# Install Clarinet
brew install clarinet  # macOS
# or download from https://github.com/hirosystems/clarinet/releases
```

### "Tests failing"
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npm run contracts:check
```

### "Can't connect wallet"
- Make sure Hiro Wallet extension is installed
- Switch to testnet in wallet settings
- Refresh the page

### "Contract not found"
- Verify contract address in `stacksIntegration.ts`
- Check deployment succeeded on explorer
- Confirm network (testnet vs mainnet)

### "AI parsing fails"
- Check API key is valid
- Verify invoice text format
- Try simpler invoice first
- Check API rate limits

---

## 📚 Next Steps

### Learn More
- [ ] Read full `README.md`
- [ ] Review Clarity contracts in `contracts/`
- [ ] Study AI prompts in `src/lib/aiInvoiceParser.ts`
- [ ] Check example invoices in `examples/`

### Customize
- [ ] Add your logo/branding
- [ ] Modify invoice fields
- [ ] Add custom validation rules
- [ ] Integrate with your DAO tools

### Deploy
- [ ] Follow `DEPLOYMENT.md`
- [ ] Set up monitoring
- [ ] Create user documentation
- [ ] Plan go-to-market

### Hackathon
- [ ] Study `HACKATHON_DEMO.md`
- [ ] Practice demo 3x
- [ ] Prepare backup video
- [ ] Test everything morning-of

---

## 💬 Get Help

- **Issues:** Open on GitHub
- **Discord:** Stacks community server
- **Docs:** Read `README.md` and `DEPLOYMENT.md`
- **Examples:** Check `examples/` folder

---

## 🎉 You're Ready!

Pick your path above and start building. You'll be creating AI-powered Bitcoin invoices in minutes!

**Happy building! 🧠⚡**

