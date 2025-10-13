import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

/**
 * Comprehensive Governance + Escrow Security Tests
 * Tests multisig governance, pause mechanism, token whitelist, and attack scenarios
 */

Clarinet.test({
  name: "GOVERNANCE: Complete multisig workflow - whitelist token via governance",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const owner1 = accounts.get("wallet_1")!;
    const owner2 = accounts.get("wallet_2")!;
    const owner3 = accounts.get("wallet_3")!;

    // Initialize governance with 3 owners, threshold 2
    let block = chain.mineBlock([
      Tx.contractCall(
        "governance-multisig",
        "init-owners",
        [
          types.list([
            types.principal(owner1.address),
            types.principal(owner2.address),
            types.principal(owner3.address),
          ]),
          types.uint(2),
        ],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectOk();

    // Set escrow principal in governance
    block = chain.mineBlock([
      Tx.contractCall(
        "governance-multisig",
        "set-escrow",
        [types.principal(`${deployer.address}.escrow-governance`)],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectOk();

    // Set governance in escrow contract
    block = chain.mineBlock([
      Tx.contractCall(
        "escrow-governance",
        "set-governance",
        [types.principal(`${deployer.address}.governance-multisig`)],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectOk();

    // Propose whitelist token (action=3, token=mock-token, arg2=1 for approve)
    block = chain.mineBlock([
      Tx.contractCall(
        "governance-multisig",
        "propose",
        [
          types.uint(3), // action: whitelist-token
          types.principal(`${deployer.address}.mock-token`),
          types.uint(1), // approved=true
        ],
        owner1.address
      ),
    ]);
    const proposalId = block.receipts[0].result.expectOk().replace('u', '');

    // Confirm by owner2 (reaches threshold)
    block = chain.mineBlock([
      Tx.contractCall(
        "governance-multisig",
        "confirm",
        [types.uint(parseInt(proposalId))],
        owner2.address
      ),
    ]);
    block.receipts[0].result.expectOk();

    // Execute proposal
    block = chain.mineBlock([
      Tx.contractCall(
        "governance-multisig",
        "execute",
        [types.uint(parseInt(proposalId))],
        owner1.address
      ),
    ]);
    block.receipts[0].result.expectOk();

    // Verify token is whitelisted
    let result = chain.callReadOnlyFn(
      "escrow-governance",
      "is-token-whitelisted",
      [types.principal(`${deployer.address}.mock-token`)],
      owner1.address
    );
    result.result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "GOVERNANCE: Pause via multisig and verify invoice creation blocked",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const owner1 = accounts.get("wallet_1")!;
    const owner2 = accounts.get("wallet_2")!;
    const owner3 = accounts.get("wallet_3")!;
    const payer = accounts.get("wallet_4")!;
    const payee = accounts.get("wallet_5")!;

    // Setup governance
    let block = chain.mineBlock([
      Tx.contractCall(
        "governance-multisig",
        "init-owners",
        [
          types.list([
            types.principal(owner1.address),
            types.principal(owner2.address),
            types.principal(owner3.address),
          ]),
          types.uint(2),
        ],
        deployer.address
      ),
      Tx.contractCall(
        "governance-multisig",
        "set-escrow",
        [types.principal(`${deployer.address}.escrow-governance`)],
        deployer.address
      ),
      Tx.contractCall(
        "escrow-governance",
        "set-governance",
        [types.principal(`${deployer.address}.governance-multisig`)],
        deployer.address
      ),
    ]);

    // Create invoice should work (not paused yet)
    block = chain.mineBlock([
      Tx.contractCall(
        "escrow-governance",
        "create-invoice",
        [
          types.uint(1),
          types.principal(payee.address),
          types.uint(1000000),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(owner3.address),
          types.uint(99999999),
          types.none(),
        ],
        payer.address
      ),
    ]);
    block.receipts[0].result.expectOk();

    // Propose pause (action=1)
    block = chain.mineBlock([
      Tx.contractCall(
        "governance-multisig",
        "propose",
        [
          types.uint(1), // action: pause
          types.principal('SP000000000000000000000002Q6VF78'), // dummy arg
          types.uint(0),
        ],
        owner1.address
      ),
    ]);
    const pauseProposalId = block.receipts[0].result.expectOk().replace('u', '');

    // Confirm and execute pause
    block = chain.mineBlock([
      Tx.contractCall("governance-multisig", "confirm", [types.uint(parseInt(pauseProposalId))], owner2.address),
      Tx.contractCall("governance-multisig", "execute", [types.uint(parseInt(pauseProposalId))], owner1.address),
    ]);
    block.receipts[1].result.expectOk();

    // Verify paused
    let pausedResult = chain.callReadOnlyFn("escrow-governance", "is-paused", [], payer.address);
    pausedResult.result.expectOk().expectBool(true);

    // Try to create invoice (should fail)
    block = chain.mineBlock([
      Tx.contractCall(
        "escrow-governance",
        "create-invoice",
        [
          types.uint(2),
          types.principal(payee.address),
          types.uint(1000000),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(owner3.address),
          types.uint(99999999),
          types.none(),
        ],
        payer.address
      ),
    ]);
    block.receipts[0].result.expectErr().expectUint(107); // ERR-CONTRACT-PAUSED
  },
});

Clarinet.test({
  name: "GOVERNANCE: Unpause restores functionality",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const owner1 = accounts.get("wallet_1")!;
    const owner2 = accounts.get("wallet_2")!;
    const owner3 = accounts.get("wallet_3")!;
    const payer = accounts.get("wallet_4")!;
    const payee = accounts.get("wallet_5")!;

    // Setup and pause
    let block = chain.mineBlock([
      Tx.contractCall(
        "governance-multisig",
        "init-owners",
        [types.list([types.principal(owner1.address), types.principal(owner2.address), types.principal(owner3.address)]), types.uint(2)],
        deployer.address
      ),
      Tx.contractCall("governance-multisig", "set-escrow", [types.principal(`${deployer.address}.escrow-governance`)], deployer.address),
      Tx.contractCall("escrow-governance", "set-governance", [types.principal(`${deployer.address}.governance-multisig`)], deployer.address),
    ]);

    // Pause via direct admin call (faster for test)
    block = chain.mineBlock([
      Tx.contractCall("escrow-governance", "pause", [], deployer.address),
    ]);

    // Propose unpause (action=2)
    block = chain.mineBlock([
      Tx.contractCall(
        "governance-multisig",
        "propose",
        [types.uint(2), types.principal('SP000000000000000000000002Q6VF78'), types.uint(0)],
        owner1.address
      ),
    ]);
    const unpauseProposalId = block.receipts[0].result.expectOk().replace('u', '');

    // Confirm and execute
    block = chain.mineBlock([
      Tx.contractCall("governance-multisig", "confirm", [types.uint(parseInt(unpauseProposalId))], owner2.address),
      Tx.contractCall("governance-multisig", "execute", [types.uint(parseInt(unpauseProposalId))], owner1.address),
    ]);

    // Verify unpaused
    let pausedResult = chain.callReadOnlyFn("escrow-governance", "is-paused", [], payer.address);
    pausedResult.result.expectOk().expectBool(false);

    // Create invoice should work now
    block = chain.mineBlock([
      Tx.contractCall(
        "escrow-governance",
        "create-invoice",
        [
          types.uint(10),
          types.principal(payee.address),
          types.uint(500000),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(owner3.address),
          types.uint(99999999),
          types.none(),
        ],
        payer.address
      ),
    ]);
    block.receipts[0].result.expectOk();
  },
});

Clarinet.test({
  name: "SECURITY: Unauthorized user cannot propose",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const owner1 = accounts.get("wallet_1")!;
    const owner2 = accounts.get("wallet_2")!;
    const attacker = accounts.get("wallet_5")!;

    // Setup governance
    let block = chain.mineBlock([
      Tx.contractCall(
        "governance-multisig",
        "init-owners",
        [types.list([types.principal(owner1.address), types.principal(owner2.address)]), types.uint(2)],
        deployer.address
      ),
    ]);

    // Attacker tries to propose
    block = chain.mineBlock([
      Tx.contractCall(
        "governance-multisig",
        "propose",
        [types.uint(1), types.principal('SP000000000000000000000002Q6VF78'), types.uint(0)],
        attacker.address
      ),
    ]);
    block.receipts[0].result.expectErr().expectUint(100); // ERR-NOT-OWNER
  },
});

Clarinet.test({
  name: "SECURITY: Cannot execute proposal without threshold confirmations",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const owner1 = accounts.get("wallet_1")!;
    const owner2 = accounts.get("wallet_2")!;
    const owner3 = accounts.get("wallet_3")!;

    // Setup governance (threshold=2)
    let block = chain.mineBlock([
      Tx.contractCall(
        "governance-multisig",
        "init-owners",
        [types.list([types.principal(owner1.address), types.principal(owner2.address), types.principal(owner3.address)]), types.uint(2)],
        deployer.address
      ),
      Tx.contractCall("governance-multisig", "set-escrow", [types.principal(`${deployer.address}.escrow-governance`)], deployer.address),
      Tx.contractCall("escrow-governance", "set-governance", [types.principal(`${deployer.address}.governance-multisig`)], deployer.address),
    ]);

    // Propose pause
    block = chain.mineBlock([
      Tx.contractCall(
        "governance-multisig",
        "propose",
        [types.uint(1), types.principal('SP000000000000000000000002Q6VF78'), types.uint(0)],
        owner1.address
      ),
    ]);
    const proposalId = block.receipts[0].result.expectOk().replace('u', '');

    // Try to execute without confirmations (should fail)
    block = chain.mineBlock([
      Tx.contractCall("governance-multisig", "execute", [types.uint(parseInt(proposalId))], owner1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(121); // ERR-INSUFFICIENT-CONFIRMATIONS

    // Confirm once (still not enough)
    block = chain.mineBlock([
      Tx.contractCall("governance-multisig", "confirm", [types.uint(parseInt(proposalId))], owner2.address),
      Tx.contractCall("governance-multisig", "execute", [types.uint(parseInt(proposalId))], owner1.address),
    ]);
    block.receipts[1].result.expectOk(); // Now should work (1 confirm + proposal = 2)
  },
});

Clarinet.test({
  name: "SECURITY: Cannot execute proposal twice",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const owner1 = accounts.get("wallet_1")!;
    const owner2 = accounts.get("wallet_2")!;

    // Setup
    let block = chain.mineBlock([
      Tx.contractCall(
        "governance-multisig",
        "init-owners",
        [types.list([types.principal(owner1.address), types.principal(owner2.address)]), types.uint(1)],
        deployer.address
      ),
      Tx.contractCall("governance-multisig", "set-escrow", [types.principal(`${deployer.address}.escrow-governance`)], deployer.address),
      Tx.contractCall("escrow-governance", "set-governance", [types.principal(`${deployer.address}.governance-multisig`)], deployer.address),
    ]);

    // Propose, confirm, execute
    block = chain.mineBlock([
      Tx.contractCall("governance-multisig", "propose", [types.uint(1), types.principal('SP000000000000000000000002Q6VF78'), types.uint(0)], owner1.address),
    ]);
    const proposalId = block.receipts[0].result.expectOk().replace('u', '');

    block = chain.mineBlock([
      Tx.contractCall("governance-multisig", "confirm", [types.uint(parseInt(proposalId))], owner2.address),
      Tx.contractCall("governance-multisig", "execute", [types.uint(parseInt(proposalId))], owner1.address),
    ]);
    block.receipts[1].result.expectOk();

    // Try to execute again
    block = chain.mineBlock([
      Tx.contractCall("governance-multisig", "execute", [types.uint(parseInt(proposalId))], owner1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(120); // ERR-ALREADY-EXECUTED
  },
});

Clarinet.test({
  name: "INTEGRATION: Full invoice flow with governance-protected escrow",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const owner1 = accounts.get("wallet_1")!;
    const owner2 = accounts.get("wallet_2")!;
    const payer = accounts.get("wallet_3")!;
    const payee = accounts.get("wallet_4")!;
    const arbiter = accounts.get("wallet_5")!;

    const amount = 2000000;

    // Setup governance
    let block = chain.mineBlock([
      Tx.contractCall(
        "governance-multisig",
        "init-owners",
        [types.list([types.principal(owner1.address), types.principal(owner2.address)]), types.uint(2)],
        deployer.address
      ),
      Tx.contractCall("governance-multisig", "set-escrow", [types.principal(`${deployer.address}.escrow-governance`)], deployer.address),
      Tx.contractCall("escrow-governance", "set-governance", [types.principal(`${deployer.address}.governance-multisig`)], deployer.address),
    ]);

    // Mint tokens to payer
    block = chain.mineBlock([
      Tx.contractCall("mock-token", "mint", [types.uint(amount), types.principal(payer.address)], deployer.address),
    ]);

    // Create invoice
    block = chain.mineBlock([
      Tx.contractCall(
        "escrow-governance",
        "create-invoice",
        [
          types.uint(100),
          types.principal(payee.address),
          types.uint(amount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
          types.none(),
        ],
        payer.address
      ),
    ]);
    block.receipts[0].result.expectOk();

    // Transfer tokens to escrow
    block = chain.mineBlock([
      Tx.contractCall(
        "mock-token",
        "transfer",
        [types.uint(amount), types.principal(payer.address), types.principal(`${deployer.address}.escrow-governance`)],
        payer.address
      ),
    ]);

    // Acknowledge deposit
    block = chain.mineBlock([
      Tx.contractCall("escrow-governance", "ack-deposit", [types.uint(100)], payer.address),
    ]);
    block.receipts[0].result.expectOk();

    // Release funds
    block = chain.mineBlock([
      Tx.contractCall("escrow-governance", "release-funds", [types.uint(100)], payer.address),
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

