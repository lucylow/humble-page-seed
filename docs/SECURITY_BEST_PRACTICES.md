# 🛡️ Security Best Practices & Operational Guide

## For Production Deployment of BitMind Smart Invoice System

---

## 🎯 Overview

This document provides security best practices, operational procedures, and incident response protocols for running the BitMind Smart Invoice System in production.

---

## 1. Pre-Deployment Security

### 1.1 Contract Preparation

#### ✅ Mandatory Steps
```bash
# 1. Run all tests
npm run contracts:test

# 2. Check for linter issues
clarinet check

# 3. Verify contract addresses
# Edit contracts/escrow-secure.clar
# Confirm no hardcoded test addresses

# 4. Set MAX-INVOICE-AMOUNT appropriately
# Default: 1000 sBTC (u100000000000)
# Adjust based on your use case
```

#### Token Whitelist Configuration
```clarity
;; Add official sBTC contract to whitelist
(whitelist-token 'SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.sbtc-token)

;; Remove mock token (testnet only!)
(remove-token-from-whitelist .mock-token)
```

### 1.2 Admin Multisig Setup

**Recommended: 2-of-3 or 3-of-5 multisig**

```clarity
;; Configure admin principals (hardware wallet addresses)
(var-set admin-1 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS)
(var-set admin-2 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE)
(var-set admin-3 'SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS)
```

**Key Management:**
- Use **Ledger** or **Trezor** hardware wallets
- Store backup seeds in **geographically distributed** secure locations
- Document key access procedures
- Implement **key rotation** every 6-12 months

---

## 2. Deployment Checklist

### Phase 1: Testnet Validation (2 weeks minimum)

- [ ] Deploy contracts to Stacks testnet
- [ ] Add real sBTC testnet contract to whitelist
- [ ] Complete 10+ full invoice cycles (create → fund → release)
- [ ] Test pause mechanism
- [ ] Test multisig admin operations
- [ ] Verify wallet post-conditions work correctly
- [ ] Test with multiple wallet providers (Hiro, Xverse)
- [ ] Monitor for any unexpected behavior
- [ ] Document gas costs and timing

### Phase 2: Security Audit (6-8 weeks)

- [ ] Engage external audit firm (CertiK, Halborn, etc.)
- [ ] Provide `SECURITY_AUDIT_CHECKLIST.md`
- [ ] Fix all critical/high findings
- [ ] Re-audit after fixes
- [ ] Obtain signed audit report

### Phase 3: Mainnet Deployment

- [ ] Final code review
- [ ] Deploy to mainnet with verified source
- [ ] Configure whitelists (sBTC only)
- [ ] Set up monitoring dashboards
- [ ] Launch limited beta (max 10 sBTC per invoice)
- [ ] Gradual rollout: increase limits after 30 days
- [ ] Launch public bug bounty

---

## 3. Operational Security

### 3.1 Daily Operations

#### Monitoring Dashboard

**Key Metrics to Track:**
```
1. Total Value Locked (TVL)
2. Number of active invoices
3. Average time to completion
4. Number of disputes
5. Pause events
6. Admin actions
7. Failed transactions
```

**Tools:**
- Stacks Explorer API
- Custom monitoring service
- Alerting system (PagerDuty, Opsgenie)

#### Alert Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| Single invoice > 100 sBTC | Immediate | Manual review required |
| Pause activated | Immediate | Investigate immediately |
| Failed release/refund | >3 in 1 hour | Check contract state |
| Unusual activity | >50 invoices/hour | Check for spam |
| Admin action | Any | Log and verify authorization |

### 3.2 Access Control

#### Admin Actions Log

**All admin actions MUST be logged:**

```typescript
interface AdminAction {
  timestamp: number;
  action: "pause" | "unpause" | "whitelist" | "remove-whitelist";
  initiator: string; // Principal address
  approvers: string[]; // All approvers
  txHash: string;
  notes: string;
}
```

**Example Log Entry:**
```json
{
  "timestamp": 1697299200,
  "action": "pause",
  "initiator": "SP2ZNGJ85...",
  "approvers": ["SP2ZNGJ85...", "SP3FBR2..."],
  "txHash": "0x1234...",
  "notes": "Emergency pause due to suspected exploit"
}
```

### 3.3 User Protection

#### Invoice Creation Guidelines

**Require human review for:**
- Invoices > 10 sBTC (~$100K at $10K/BTC)
- First-time payers
- Suspicious payee addresses
- AI-parsed invoices with low confidence

**Implement:**
```typescript
function requiresManualReview(invoice: InvoiceData): boolean {
  return (
    invoice.amount > btcToSatoshis(10) ||
    isNewPayer(invoice.payer) ||
    isSuspiciousAddress(invoice.payee) ||
    invoice.aiConfidence < 0.8
  );
}
```

#### Wallet Post-Conditions

**Always enforce post-conditions for deposits:**

```typescript
import { makeStandardSTXPostCondition, FungibleConditionCode } from '@stacks/transactions';

const postConditions = [
  makeStandardFungiblePostCondition(
    payerAddress,
    FungibleConditionCode.Equal,
    invoiceAmount,
    tokenContract
  ),
];
```

---

## 4. Incident Response

### 4.1 Emergency Procedures

#### Severity Levels

| Level | Description | Response Time | Action |
|-------|-------------|---------------|--------|
| **P0 - Critical** | Active exploit, funds at risk | < 15 min | Emergency pause |
| **P1 - High** | Potential vulnerability | < 1 hour | Investigate, prepare pause |
| **P2 - Medium** | Unusual activity | < 4 hours | Monitor, document |
| **P3 - Low** | Minor issue | < 24 hours | Log, plan fix |

#### Emergency Pause Procedure

**When to pause:**
- Suspected smart contract exploit
- Unusual fund movements
- Critical vulnerability discovered
- Major sBTC bridge issue

**How to pause:**
```bash
# Step 1: Admin 1 proposes pause
clarinet console
>> (contract-call? .escrow-secure propose-pause)

# Step 2: Admin 2 approves (activates pause)
>> (contract-call? .escrow-secure approve-pause u1)

# Step 3: Verify paused
>> (contract-call? .escrow-secure is-paused)
# Expected: (ok true)
```

**Communication:**
1. **Immediate:** Post status on website/social media
2. **Within 1 hour:** Email all active users
3. **Within 4 hours:** Publish incident report
4. **Within 24 hours:** Publish resolution plan

### 4.2 Incident Response Playbook

#### Phase 1: Detection (0-15 minutes)
1. Receive alert or report
2. Verify incident is real
3. Assess severity (P0-P3)
4. Notify incident response team

#### Phase 2: Containment (15-30 minutes)
1. **If P0:** Execute emergency pause
2. Preserve logs and evidence
3. Isolate affected components
4. Prevent further damage

#### Phase 3: Investigation (1-4 hours)
1. Analyze transaction logs
2. Identify root cause
3. Assess extent of damage
4. Document findings

#### Phase 4: Remediation (4-24 hours)
1. Develop fix
2. Test fix on testnet
3. Deploy fix (if possible)
4. Verify resolution

#### Phase 5: Recovery (1-3 days)
1. **If paused:** Unpause contract after verification
2. Communicate with affected users
3. Process any refunds/compensations
4. Monitor for recurrence

#### Phase 6: Post-Mortem (1 week)
1. Write detailed incident report
2. Identify preventive measures
3. Update procedures
4. Implement improvements

### 4.3 Contact List

**Internal Team:**
```
Technical Lead: [Name] - [Phone] - [Email]
Security Lead: [Name] - [Phone] - [Email]
Operations Lead: [Name] - [Phone] - [Email]
Communications: [Name] - [Phone] - [Email]
```

**External Contacts:**
```
Auditor: [Firm Name] - [Emergency Contact]
sBTC Team: [Contact]
Stacks Foundation: security@stacks.org
Legal Counsel: [Firm] - [Contact]
```

---

## 5. User Security Guidelines

### 5.1 For Payers (DAOs/Clients)

**Before Creating Invoice:**
- [ ] Verify payee address carefully (no typos!)
- [ ] Set appropriate deadline
- [ ] Choose trusted arbiter
- [ ] Review AI-parsed data thoroughly
- [ ] Use hardware wallet for large amounts

**During Deposit:**
- [ ] Confirm wallet post-conditions match invoice
- [ ] Verify transaction on Stacks Explorer
- [ ] Save transaction hash
- [ ] Wait for confirmation before ack-deposit

### 5.2 For Payees (Contractors)

**Best Practices:**
- [ ] Provide clean invoice format for AI parsing
- [ ] Confirm invoice details before work begins
- [ ] Document milestone completion
- [ ] Never share private keys with anyone
- [ ] Use separate wallet for large payouts

### 5.3 For Arbiters

**Responsibilities:**
- [ ] Review dispute evidence fairly
- [ ] Respond within documented SLA
- [ ] Document all decisions
- [ ] Maintain neutrality
- [ ] Secure arbiter keys properly

**Decision Framework:**
```
1. Review contract/invoice terms
2. Examine evidence from both parties
3. Check blockchain records
4. Consult off-chain documentation (IPFS)
5. Make ruling and document rationale
6. Execute release or refund
```

---

## 6. Ongoing Security

### 6.1 Regular Security Reviews

**Monthly:**
- Review access logs
- Check for suspicious transactions
- Update monitoring alerts
- Test backup procedures

**Quarterly:**
- Security training for team
- Review and update procedures
- Test incident response plan
- Evaluate new threats

**Annually:**
- Full security audit
- Key rotation
- Contract review for upgrades
- Insurance policy review

### 6.2 Bug Bounty Program

**Recommended Platform:** HackerOne or ImmuneFi

**Bounty Structure:**
| Severity | Payout | Example |
|----------|--------|---------|
| Critical | $50,000+ | Funds theft exploit |
| High | $10,000-$50,000 | Authorization bypass |
| Medium | $2,000-$10,000 | DOS attack |
| Low | $500-$2,000 | Information disclosure |

**Scope:**
- Smart contracts: `escrow-secure.clar`
- Frontend: Invoice creation flow
- AI integration: Parsing vulnerabilities

**Out of Scope:**
- Third-party services (Hiro Wallet, OpenAI)
- Social engineering
- Physical security

### 6.3 Insurance & Risk Management

**Recommended Coverage:**
1. **Smart Contract Insurance**
   - Provider: Nexus Mutual, Bridge Mutual
   - Coverage: Exploits, hacks, bugs
   - Amount: 50-100% of TVL

2. **Cyber Liability Insurance**
   - Coverage: Data breaches, system failures
   - Amount: $1-5M

3. **Professional Liability**
   - Coverage: Errors & omissions
   - Amount: $1-2M

---

## 7. Compliance & Legal

### 7.1 Terms of Service

**Must Include:**
- Service description
- User responsibilities
- Limitations of liability
- Dispute resolution
- Privacy policy
- Acceptable use policy

### 7.2 Risk Disclosures

**Users must acknowledge:**
- Smart contract risk
- sBTC peg risk
- Arbiter centralization risk
- Immutability of transactions
- Potential for loss of funds

### 7.3 Jurisdictional Considerations

- Consult local legal counsel
- Understand securities law implications
- Consider DAO legal structures
- Implement KYC/AML if required
- Document compliance procedures

---

## 8. Testing Procedures

### 8.1 Pre-Release Testing

**Run before every deployment:**

```bash
# 1. Unit tests
npm run contracts:test

# 2. Security tests
clarinet test tests/escrow_security_test.ts

# 3. Integration tests (testnet)
# - Create test invoice
# - Complete full cycle
# - Test edge cases

# 4. Gas analysis
clarinet check --costs

# 5. Manual review
# - Read contract line-by-line
# - Verify all changes
# - Check for TODOs/FIXMEs
```

### 8.2 Continuous Monitoring

**Automated Tests (run daily):**
```bash
# Check contract state
clarinet console --testnet
>> (contract-call? .escrow-secure is-paused)
>> (contract-call? .escrow-secure get-admins)

# Verify balances
# Check recent transactions
# Alert on anomalies
```

---

## 9. Backup & Recovery

### 9.1 Data Backup

**What to backup:**
- Contract source code (git)
- Deployment transactions
- Admin keys (secure offline storage)
- User data (off-chain database)
- Monitoring logs
- Incident reports

**Backup Frequency:**
- Real-time: Transaction logs
- Daily: User database
- Weekly: Full system snapshot
- Monthly: Archive to cold storage

### 9.2 Disaster Recovery

**Scenarios:**

**1. Contract Exploit:**
- Pause contract immediately
- Analyze exploit
- Prepare new contract version
- Migrate user funds (if possible)
- Re-deploy with fixes

**2. sBTC Bridge Failure:**
- Monitor sBTC status
- Pause new invoice creation
- Wait for bridge restoration
- Resume operations after verification

**3. Key Compromise:**
- Rotate compromised keys
- Review all recent actions
- Revoke permissions
- Audit for unauthorized actions

**4. Frontend Compromise:**
- Take down frontend
- Alert users immediately
- Investigate breach
- Re-deploy from clean source
- Restore service after verification

---

## 10. Security Contacts

**Report Security Issues:**
- Email: security@bitmind.io (create this!)
- PGP Key: [Publish public key]
- Bug Bounty: https://hackerone.com/bitmind

**Response SLA:**
- Critical: 2 hours
- High: 8 hours
- Medium: 24 hours
- Low: 72 hours

---

## Appendix: Security Resources

### Stacks Security
- [Clarity Security Guide](https://docs.stacks.co/clarity/security)
- [Stacks Security Best Practices](https://github.com/clarity-lang/overview)

### General Smart Contract Security
- [Smart Contract Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [SWC Registry](https://swcregistry.io/)

### Bitcoin Security
- [Bitcoin Security Guide](https://en.bitcoin.it/wiki/Securing_your_wallet)
- [sBTC Documentation](https://stacks-network.github.io/sbtc-docs/)

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-13  
**Next Review:** Before mainnet deployment

**Maintainer:** BitMind Security Team  
**Contact:** security@bitmind.io

