import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

/**
 * Security-Focused Tests for Smart Invoice Escrow
 * Tests attack scenarios, edge cases, and security invariants
 */

// ============================================
// A. Race Condition & Timing Attack Tests
// ============================================

Clarinet.test({
  name: "SECURITY: Race condition - deposit then immediate unauthorized withdrawal attempt",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;
    const attacker = accounts.get("wallet_4")!;

    const invoiceId = 100;
    const amount = 5000000;

    // Setup: mint, create invoice, deposit
    let block = chain.mineBlock([
      Tx.contractCall("mock-token", "mint", [types.uint(amount), types.principal(payer.address)], deployer.address),
      Tx.contractCall(
        "escrow",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(amount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
        ],
        payer.address
      ),
      Tx.contractCall(
        "mock-token",
        "transfer",
        [types.uint(amount), types.principal(payer.address), types.principal(`${deployer.address}.escrow`)],
        payer.address
      ),
    ]);

    // ATTACK: Attacker tries to release funds before ack-deposit
    block = chain.mineBlock([
      Tx.contractCall("escrow", "release-funds", [types.uint(invoiceId)], attacker.address),
    ]);
    
    // Should fail - invoice not funded yet
    block.receipts[0].result.expectErr().expectUint(103); // ERR-NO-FUNDS
  },
});

Clarinet.test({
  name: "SECURITY: Double-spend attempt via duplicate invoice creation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const invoiceId = 200;
    const amount = 1000000;

    // Create first invoice
    let block = chain.mineBlock([
      Tx.contractCall(
        "escrow",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(amount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
        ],
        payer.address
      ),
    ]);
    block.receipts[0].result.expectOk();

    // ATTACK: Try to create duplicate invoice with same ID
    block = chain.mineBlock([
      Tx.contractCall(
        "escrow",
        "create-invoice",
        [
          types.uint(invoiceId), // Same ID
          types.principal(payer.address), // Different payee (attacker)
          types.uint(amount * 10), // Different amount
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
        ],
        payer.address
      ),
    ]);

    // Should fail - duplicate invoice ID
    block.receipts[0].result.expectErr().expectUint(100); // ERR-INVOICE-EXISTS
  },
});

// ============================================
// B. Authorization & Access Control Tests
// ============================================

Clarinet.test({
  name: "SECURITY: Unauthorized release attempt by non-arbiter, non-payer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;
    const attacker = accounts.get("wallet_4")!;

    const invoiceId = 300;
    const amount = 2000000;

    // Setup funded invoice
    let block = chain.mineBlock([
      Tx.contractCall("mock-token", "mint", [types.uint(amount), types.principal(payer.address)], deployer.address),
      Tx.contractCall(
        "escrow",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(amount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
        ],
        payer.address
      ),
      Tx.contractCall(
        "mock-token",
        "transfer",
        [types.uint(amount), types.principal(payer.address), types.principal(`${deployer.address}.escrow`)],
        payer.address
      ),
      Tx.contractCall("escrow", "ack-deposit", [types.uint(invoiceId)], payer.address),
    ]);

    // ATTACK: Unauthorized user tries to release funds
    block = chain.mineBlock([
      Tx.contractCall("escrow", "release-funds", [types.uint(invoiceId)], attacker.address),
    ]);

    block.receipts[0].result.expectErr().expectUint(104); // ERR-NOT-ARBITER-OR-PAYER

    // Verify funds still in escrow
    let balanceResult = chain.callReadOnlyFn(
      "mock-token",
      "get-balance",
      [types.principal(`${deployer.address}.escrow`)],
      payer.address
    );
    balanceResult.result.expectOk().expectUint(amount);
  },
});

Clarinet.test({
  name: "SECURITY: Payee cannot unilaterally release own funds",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const invoiceId = 400;
    const amount = 1500000;

    // Setup funded invoice
    let block = chain.mineBlock([
      Tx.contractCall("mock-token", "mint", [types.uint(amount), types.principal(payer.address)], deployer.address),
      Tx.contractCall(
        "escrow",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(amount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
        ],
        payer.address
      ),
      Tx.contractCall(
        "mock-token",
        "transfer",
        [types.uint(amount), types.principal(payer.address), types.principal(`${deployer.address}.escrow`)],
        payer.address
      ),
      Tx.contractCall("escrow", "ack-deposit", [types.uint(invoiceId)], payer.address),
    ]);

    // ATTACK: Payee tries to release their own payment
    block = chain.mineBlock([
      Tx.contractCall("escrow", "release-funds", [types.uint(invoiceId)], payee.address),
    ]);

    block.receipts[0].result.expectErr().expectUint(104); // ERR-NOT-ARBITER-OR-PAYER
  },
});

// ============================================
// C. Edge Cases & Input Validation Tests
// ============================================

Clarinet.test({
  name: "SECURITY: Zero-amount invoice should fail or handle gracefully",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    // Try to create zero-amount invoice
    let block = chain.mineBlock([
      Tx.contractCall(
        "escrow",
        "create-invoice",
        [
          types.uint(500),
          types.principal(payee.address),
          types.uint(0), // Zero amount
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
        ],
        payer.address
      ),
    ]);

    // Currently allows - consider adding validation
    // For production, should either reject or handle specially
    block.receipts[0].result.expectOk();
  },
});

Clarinet.test({
  name: "SECURITY: Extremely large amount (near uint max) handling",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const maxAmount = 340282366920938463463374607431768211455; // u128 max

    // Try to create invoice with extreme amount
    let block = chain.mineBlock([
      Tx.contractCall(
        "escrow",
        "create-invoice",
        [
          types.uint(600),
          types.principal(payee.address),
          types.uint(maxAmount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
        ],
        payer.address
      ),
    ]);

    // Should create (Clarity handles uint overflow naturally)
    block.receipts[0].result.expectOk();
  },
});

Clarinet.test({
  name: "SECURITY: Acknowledge deposit without actual token transfer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const invoiceId = 700;
    const amount = 3000000;

    // Create invoice but DON'T transfer tokens
    let block = chain.mineBlock([
      Tx.contractCall(
        "escrow",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(amount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
        ],
        payer.address
      ),
    ]);

    // ATTACK: Try to acknowledge deposit without transferring
    block = chain.mineBlock([
      Tx.contractCall("escrow", "ack-deposit", [types.uint(invoiceId)], payer.address),
    ]);

    // Should fail - insufficient balance
    block.receipts[0].result.expectErr().expectUint(103); // ERR-NO-FUNDS
  },
});

// ============================================
// D. Double-Release & Reentrancy Tests
// ============================================

Clarinet.test({
  name: "SECURITY: Double-release attempt should fail",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const invoiceId = 800;
    const amount = 2500000;

    // Setup and release once
    let block = chain.mineBlock([
      Tx.contractCall("mock-token", "mint", [types.uint(amount), types.principal(payer.address)], deployer.address),
      Tx.contractCall(
        "escrow",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(amount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
        ],
        payer.address
      ),
      Tx.contractCall(
        "mock-token",
        "transfer",
        [types.uint(amount), types.principal(payer.address), types.principal(`${deployer.address}.escrow`)],
        payer.address
      ),
      Tx.contractCall("escrow", "ack-deposit", [types.uint(invoiceId)], payer.address),
      Tx.contractCall("escrow", "release-funds", [types.uint(invoiceId)], payer.address),
    ]);

    // First release should succeed
    block.receipts[4].result.expectOk();

    // ATTACK: Try to release again
    block = chain.mineBlock([
      Tx.contractCall("escrow", "release-funds", [types.uint(invoiceId)], payer.address),
    ]);

    // Should fail - already released (status changed, amount zero)
    block.receipts[0].result.expectErr().expectUint(103); // ERR-NO-FUNDS
  },
});

// ============================================
// E. State Machine Invariant Tests
// ============================================

Clarinet.test({
  name: "SECURITY: Cannot release from OPEN state",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const invoiceId = 900;
    const amount = 1000000;

    // Create invoice (OPEN state)
    let block = chain.mineBlock([
      Tx.contractCall(
        "escrow",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(amount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
        ],
        payer.address
      ),
    ]);

    // Try to release from OPEN state
    block = chain.mineBlock([
      Tx.contractCall("escrow", "release-funds", [types.uint(invoiceId)], payer.address),
    ]);

    block.receipts[0].result.expectErr().expectUint(103); // ERR-NO-FUNDS
  },
});

Clarinet.test({
  name: "SECURITY: Cannot refund from OPEN state",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const invoiceId = 1000;
    const amount = 1000000;

    // Create invoice (OPEN state)
    let block = chain.mineBlock([
      Tx.contractCall(
        "escrow",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(amount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
        ],
        payer.address
      ),
    ]);

    // Try to refund from OPEN state
    block = chain.mineBlock([
      Tx.contractCall("escrow", "refund", [types.uint(invoiceId)], payer.address),
    ]);

    block.receipts[0].result.expectErr().expectUint(103); // ERR-NO-FUNDS
  },
});

// ============================================
// F. Arbiter Security Tests
// ============================================

Clarinet.test({
  name: "SECURITY: Arbiter can release funds (authorized)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const invoiceId = 1100;
    const amount = 2000000;

    // Setup funded invoice
    let block = chain.mineBlock([
      Tx.contractCall("mock-token", "mint", [types.uint(amount), types.principal(payer.address)], deployer.address),
      Tx.contractCall(
        "escrow",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(amount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
        ],
        payer.address
      ),
      Tx.contractCall(
        "mock-token",
        "transfer",
        [types.uint(amount), types.principal(payer.address), types.principal(`${deployer.address}.escrow`)],
        payer.address
      ),
      Tx.contractCall("escrow", "ack-deposit", [types.uint(invoiceId)], payer.address),
    ]);

    // Arbiter releases funds (should succeed)
    block = chain.mineBlock([
      Tx.contractCall("escrow", "release-funds", [types.uint(invoiceId)], arbiter.address),
    ]);

    block.receipts[0].result.expectOk();

    // Verify payee received funds
    let balanceResult = chain.callReadOnlyFn(
      "mock-token",
      "get-balance",
      [types.principal(payee.address)],
      payee.address
    );
    balanceResult.result.expectOk().expectUint(amount);
  },
});

Clarinet.test({
  name: "SECURITY: Arbiter can refund (authorized)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const invoiceId = 1200;
    const amount = 1800000;

    // Setup funded invoice
    let block = chain.mineBlock([
      Tx.contractCall("mock-token", "mint", [types.uint(amount), types.principal(payer.address)], deployer.address),
      Tx.contractCall(
        "escrow",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(amount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
        ],
        payer.address
      ),
      Tx.contractCall(
        "mock-token",
        "transfer",
        [types.uint(amount), types.principal(payer.address), types.principal(`${deployer.address}.escrow`)],
        payer.address
      ),
      Tx.contractCall("escrow", "ack-deposit", [types.uint(invoiceId)], payer.address),
    ]);

    // Arbiter issues refund (should succeed)
    block = chain.mineBlock([
      Tx.contractCall("escrow", "refund", [types.uint(invoiceId)], arbiter.address),
    ]);

    block.receipts[0].result.expectOk();

    // Verify payer received refund
    let balanceResult = chain.callReadOnlyFn(
      "mock-token",
      "get-balance",
      [types.principal(payer.address)],
      payer.address
    );
    balanceResult.result.expectOk().expectUint(amount);
  },
});

// ============================================
// G. Property-Based Invariant Tests
// ============================================

Clarinet.test({
  name: "INVARIANT: Total escrowed amount equals sum of funded invoices",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const amount1 = 1000000;
    const amount2 = 2000000;
    const amount3 = 1500000;
    const totalAmount = amount1 + amount2 + amount3;

    // Create and fund multiple invoices
    let block = chain.mineBlock([
      Tx.contractCall("mock-token", "mint", [types.uint(totalAmount), types.principal(payer.address)], deployer.address),
      // Invoice 1
      Tx.contractCall(
        "escrow",
        "create-invoice",
        [
          types.uint(1), types.principal(payee.address), types.uint(amount1),
          types.principal(`${deployer.address}.mock-token`), types.principal(arbiter.address), types.uint(99999999),
        ],
        payer.address
      ),
      Tx.contractCall(
        "mock-token",
        "transfer",
        [types.uint(amount1), types.principal(payer.address), types.principal(`${deployer.address}.escrow`)],
        payer.address
      ),
      // Invoice 2
      Tx.contractCall(
        "escrow",
        "create-invoice",
        [
          types.uint(2), types.principal(payee.address), types.uint(amount2),
          types.principal(`${deployer.address}.mock-token`), types.principal(arbiter.address), types.uint(99999999),
        ],
        payer.address
      ),
      Tx.contractCall(
        "mock-token",
        "transfer",
        [types.uint(amount2), types.principal(payer.address), types.principal(`${deployer.address}.escrow`)],
        payer.address
      ),
      // Invoice 3
      Tx.contractCall(
        "escrow",
        "create-invoice",
        [
          types.uint(3), types.principal(payee.address), types.uint(amount3),
          types.principal(`${deployer.address}.mock-token`), types.principal(arbiter.address), types.uint(99999999),
        ],
        payer.address
      ),
      Tx.contractCall(
        "mock-token",
        "transfer",
        [types.uint(amount3), types.principal(payer.address), types.principal(`${deployer.address}.escrow`)],
        payer.address
      ),
    ]);

    // Verify total escrow balance
    let balanceResult = chain.callReadOnlyFn(
      "mock-token",
      "get-balance",
      [types.principal(`${deployer.address}.escrow`)],
      payer.address
    );
    balanceResult.result.expectOk().expectUint(totalAmount);
  },
});

