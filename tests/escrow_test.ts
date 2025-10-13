import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "End-to-end escrow test: create → fund → release",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const invoiceId = 1;
    const invoiceAmount = 5000000; // 0.05 sBTC in satoshis

    // Step 1: Mint tokens to payer
    let block = chain.mineBlock([
      Tx.contractCall(
        "mock-token",
        "mint",
        [types.uint(invoiceAmount), types.principal(payer.address)],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Verify payer balance
    let balanceResult = chain.callReadOnlyFn(
      "mock-token",
      "get-balance",
      [types.principal(payer.address)],
      payer.address
    );
    balanceResult.result.expectOk().expectUint(invoiceAmount);

    // Step 2: Create invoice
    block = chain.mineBlock([
      Tx.contractCall(
        "escrow",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(invoiceAmount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
        ],
        payer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Verify invoice was created
    let invoiceResult = chain.callReadOnlyFn(
      "escrow",
      "get-invoice",
      [types.uint(invoiceId)],
      payer.address
    );
    invoiceResult.result.expectOk();

    // Step 3: Transfer tokens to escrow contract
    const escrowPrincipal = `${deployer.address}.escrow`;
    block = chain.mineBlock([
      Tx.contractCall(
        "mock-token",
        "transfer",
        [
          types.uint(invoiceAmount),
          types.principal(payer.address),
          types.principal(escrowPrincipal),
        ],
        payer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Verify escrow contract received tokens
    balanceResult = chain.callReadOnlyFn(
      "mock-token",
      "get-balance",
      [types.principal(escrowPrincipal)],
      payer.address
    );
    balanceResult.result.expectOk().expectUint(invoiceAmount);

    // Step 4: Acknowledge deposit
    block = chain.mineBlock([
      Tx.contractCall("escrow", "ack-deposit", [types.uint(invoiceId)], payer.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Step 5: Release funds to payee
    block = chain.mineBlock([
      Tx.contractCall("escrow", "release-funds", [types.uint(invoiceId)], payer.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Verify payee received the tokens
    balanceResult = chain.callReadOnlyFn(
      "mock-token",
      "get-balance",
      [types.principal(payee.address)],
      payee.address
    );
    balanceResult.result.expectOk().expectUint(invoiceAmount);

    // Verify escrow contract balance is now zero
    balanceResult = chain.callReadOnlyFn(
      "mock-token",
      "get-balance",
      [types.principal(escrowPrincipal)],
      payer.address
    );
    balanceResult.result.expectOk().expectUint(0);
  },
});

Clarinet.test({
  name: "Test refund functionality",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const invoiceId = 2;
    const invoiceAmount = 3000000;

    // Mint, create invoice, transfer, and ack deposit
    let block = chain.mineBlock([
      Tx.contractCall(
        "mock-token",
        "mint",
        [types.uint(invoiceAmount), types.principal(payer.address)],
        deployer.address
      ),
      Tx.contractCall(
        "escrow",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(invoiceAmount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
        ],
        payer.address
      ),
      Tx.contractCall(
        "mock-token",
        "transfer",
        [
          types.uint(invoiceAmount),
          types.principal(payer.address),
          types.principal(`${deployer.address}.escrow`),
        ],
        payer.address
      ),
      Tx.contractCall("escrow", "ack-deposit", [types.uint(invoiceId)], payer.address),
    ]);

    // Issue refund
    block = chain.mineBlock([
      Tx.contractCall("escrow", "refund", [types.uint(invoiceId)], payer.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Verify payer got tokens back
    let balanceResult = chain.callReadOnlyFn(
      "mock-token",
      "get-balance",
      [types.principal(payer.address)],
      payer.address
    );
    balanceResult.result.expectOk().expectUint(invoiceAmount);
  },
});

Clarinet.test({
  name: "Test unauthorized release attempt fails",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;
    const unauthorized = accounts.get("wallet_4")!;

    const invoiceId = 3;
    const invoiceAmount = 2000000;

    // Setup invoice
    let block = chain.mineBlock([
      Tx.contractCall(
        "mock-token",
        "mint",
        [types.uint(invoiceAmount), types.principal(payer.address)],
        deployer.address
      ),
      Tx.contractCall(
        "escrow",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(invoiceAmount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
        ],
        payer.address
      ),
      Tx.contractCall(
        "mock-token",
        "transfer",
        [
          types.uint(invoiceAmount),
          types.principal(payer.address),
          types.principal(`${deployer.address}.escrow`),
        ],
        payer.address
      ),
      Tx.contractCall("escrow", "ack-deposit", [types.uint(invoiceId)], payer.address),
    ]);

    // Try to release from unauthorized account
    block = chain.mineBlock([
      Tx.contractCall("escrow", "release-funds", [types.uint(invoiceId)], unauthorized.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(104); // ERR-NOT-ARBITER-OR-PAYER
  },
});

