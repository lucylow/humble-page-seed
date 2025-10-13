# Smart Invoice Escrow Contracts

This directory contains the Clarity smart contracts for the BitMind Smart Invoice platform.

## 📋 Contract Overview

### `smart-invoice-escrow.clar`
The main escrow contract that handles:
- **Invoice Creation**: Create invoices with multiple milestones
- **Escrow Management**: Secure fund locking and release
- **Milestone Tracking**: Track completion, approval, and payment
- **Dispute Resolution**: Built-in arbitration mechanism
- **Multi-party Support**: Client, contractor, and optional arbitrator roles

## 🚀 Getting Started

### Prerequisites
- [Clarinet](https://github.com/hirosystems/clarinet) - Clarity development tool
- [Node.js](https://nodejs.org/) v18+ (for tests)

### Installation

```bash
# Install Clarinet (if not already installed)
# On macOS/Linux:
curl -L https://github.com/hirosystems/clarinet/releases/download/v1.5.4/clarinet-linux-x64.tar.gz | tar xz
sudo mv clarinet /usr/local/bin/

# On Windows (PowerShell):
# Download from: https://github.com/hirosystems/clarinet/releases
```

### Running Tests

```bash
cd contracts
clarinet test
```

### Console Testing

```bash
clarinet console

# Example commands in console:
(contract-call? .smart-invoice-escrow create-invoice 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC none u1000000)
```

## 📚 Contract Functions

### Public Functions

#### Invoice Management
- `create-invoice` - Create a new invoice
- `add-milestone` - Add a milestone to an invoice
- `fund-invoice` - Lock funds in escrow
- `complete-milestone` - Mark milestone as completed (contractor)
- `approve-and-pay-milestone` - Approve and release payment (client)

#### Dispute Management
- `raise-dispute` - Raise a dispute on an invoice
- `resolve-dispute` - Resolve dispute (arbitrator only)

### Read-Only Functions
- `get-invoice` - Get invoice details
- `get-milestone` - Get milestone details
- `get-dispute` - Get dispute information
- `get-escrow-balance` - Get contract balance
- `get-current-invoice-id` - Get next invoice ID

## 🔐 Security Features

1. **Authorization Checks**: All sensitive functions verify caller identity
2. **State Validation**: Prevents invalid state transitions
3. **Escrow Protection**: Funds locked in contract until approved
4. **Dispute Resolution**: Third-party arbitration for conflicts

## 💡 Usage Examples

### Create and Fund an Invoice

```clarity
;; 1. Client creates invoice
(contract-call? .smart-invoice-escrow create-invoice 
    'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC  ;; contractor
    (some 'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND)  ;; arbitrator
    u5000000  ;; 5 STX total
)

;; 2. Client adds milestones
(contract-call? .smart-invoice-escrow add-milestone 
    u0  ;; invoice-id
    "Design phase completed"
    u2000000  ;; 2 STX
)

(contract-call? .smart-invoice-escrow add-milestone 
    u0
    "Development completed"
    u3000000  ;; 3 STX
)

;; 3. Client funds the invoice
(contract-call? .smart-invoice-escrow fund-invoice u0)
```

### Complete Milestone Workflow

```clarity
;; 4. Contractor completes milestone
(contract-call? .smart-invoice-escrow complete-milestone u0 u0)

;; 5. Client approves and releases payment
(contract-call? .smart-invoice-escrow approve-and-pay-milestone u0 u0)
```

### Dispute Flow

```clarity
;; Raise dispute
(contract-call? .smart-invoice-escrow raise-dispute 
    u0 
    "Deliverables do not meet requirements"
)

;; Arbitrator resolves (60% to client, 40% to contractor)
(contract-call? .smart-invoice-escrow resolve-dispute 
    u0 
    "Work partially completed. Split 60-40"
    u3000000  ;; refund to client
)
```

## 🧪 Test Coverage

Our test suite covers:
- ✅ Invoice creation and initialization
- ✅ Milestone addition and tracking
- ✅ Escrow funding
- ✅ Payment release workflow
- ✅ Dispute handling
- ✅ Authorization and access control
- ✅ Read-only data retrieval

## 🔄 Integration with Frontend

To integrate with your React frontend:

1. Install Stacks.js packages (already in your project):
```bash
npm install @stacks/connect @stacks/network @stacks/transactions
```

2. Use the contract interaction utilities in `src/lib/contract-integration.ts` (see next section)

## 📝 Status Codes

### Invoice Status
- `0` - Created
- `1` - Funded
- `2` - In Progress
- `3` - Completed
- `4` - Disputed
- `5` - Cancelled

### Milestone Status
- `0` - Pending
- `1` - Completed
- `2` - Approved
- `3` - Paid

### Error Codes
- `100` - Owner only
- `101` - Not authorized
- `102` - Already exists
- `103` - Not found
- `104` - Invalid state
- `105` - Insufficient funds
- `106` - Invalid amount
- `107` - Milestone not ready
- `108` - Already disputed
- `109` - No dispute

## 🚀 Deployment

### Testnet Deployment

```bash
# Deploy to testnet
clarinet deployments generate --testnet

# Apply deployment
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

### Mainnet Deployment

⚠️ **Warning**: Thoroughly test on testnet before mainnet deployment!

```bash
clarinet deployments generate --mainnet
clarinet deployments apply -p deployments/default.mainnet-plan.yaml
```

## 🔗 Resources

- [Clarity Language Reference](https://docs.stacks.co/clarity)
- [Clarinet Documentation](https://docs.hiro.so/clarinet)
- [Stacks.js Documentation](https://stacks.js.org/)
- [sBTC Guide](https://docs.stacks.co/sbtc)

## 🤝 Contributing

When contributing to contracts:
1. Add comprehensive tests for new features
2. Document all public functions
3. Follow Clarity best practices
4. Test on devnet/testnet before PR

## 📄 License

MIT License - See LICENSE file for details

