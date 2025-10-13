import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.5.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

// Test Constants
const CONTRACT_NAME = 'smart-invoice-escrow';

Clarinet.test({
    name: "Test: Create invoice successfully",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const client = accounts.get('wallet_1')!;
        const contractor = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                CONTRACT_NAME,
                'create-invoice',
                [
                    types.principal(contractor.address),
                    types.none(),
                    types.uint(1000000) // 1 STX in micro-STX
                ],
                client.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectUint(0);
        assertEquals(block.receipts[0].result, '(ok u0)');
    },
});

Clarinet.test({
    name: "Test: Add milestones to invoice",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const client = accounts.get('wallet_1')!;
        const contractor = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            // Create invoice
            Tx.contractCall(
                CONTRACT_NAME,
                'create-invoice',
                [
                    types.principal(contractor.address),
                    types.none(),
                    types.uint(3000000) // 3 STX
                ],
                client.address
            ),
            // Add first milestone
            Tx.contractCall(
                CONTRACT_NAME,
                'add-milestone',
                [
                    types.uint(0),
                    types.ascii("Initial design mockups"),
                    types.uint(1000000)
                ],
                client.address
            ),
            // Add second milestone
            Tx.contractCall(
                CONTRACT_NAME,
                'add-milestone',
                [
                    types.uint(0),
                    types.ascii("Frontend implementation"),
                    types.uint(2000000)
                ],
                client.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectUint(0);
        block.receipts[1].result.expectOk().expectUint(0);
        block.receipts[2].result.expectOk().expectUint(1);
    },
});

Clarinet.test({
    name: "Test: Fund invoice escrow",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const client = accounts.get('wallet_1')!;
        const contractor = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            // Create invoice
            Tx.contractCall(
                CONTRACT_NAME,
                'create-invoice',
                [
                    types.principal(contractor.address),
                    types.none(),
                    types.uint(1000000)
                ],
                client.address
            ),
            // Add milestone
            Tx.contractCall(
                CONTRACT_NAME,
                'add-milestone',
                [
                    types.uint(0),
                    types.ascii("Complete project"),
                    types.uint(1000000)
                ],
                client.address
            ),
            // Fund invoice
            Tx.contractCall(
                CONTRACT_NAME,
                'fund-invoice',
                [types.uint(0)],
                client.address
            )
        ]);
        
        block.receipts[2].result.expectOk().expectBool(true);
    },
});

Clarinet.test({
    name: "Test: Complete milestone workflow",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const client = accounts.get('wallet_1')!;
        const contractor = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            // Create and setup invoice
            Tx.contractCall(
                CONTRACT_NAME,
                'create-invoice',
                [
                    types.principal(contractor.address),
                    types.none(),
                    types.uint(1000000)
                ],
                client.address
            ),
            Tx.contractCall(
                CONTRACT_NAME,
                'add-milestone',
                [
                    types.uint(0),
                    types.ascii("Deliverable 1"),
                    types.uint(1000000)
                ],
                client.address
            ),
            Tx.contractCall(
                CONTRACT_NAME,
                'fund-invoice',
                [types.uint(0)],
                client.address
            ),
            // Contractor completes milestone
            Tx.contractCall(
                CONTRACT_NAME,
                'complete-milestone',
                [types.uint(0), types.uint(0)],
                contractor.address
            ),
            // Client approves and pays
            Tx.contractCall(
                CONTRACT_NAME,
                'approve-and-pay-milestone',
                [types.uint(0), types.uint(0)],
                client.address
            )
        ]);
        
        block.receipts[3].result.expectOk().expectBool(true);
        block.receipts[4].result.expectOk().expectBool(true);
    },
});

Clarinet.test({
    name: "Test: Raise dispute",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const client = accounts.get('wallet_1')!;
        const contractor = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                CONTRACT_NAME,
                'create-invoice',
                [
                    types.principal(contractor.address),
                    types.none(),
                    types.uint(1000000)
                ],
                client.address
            ),
            Tx.contractCall(
                CONTRACT_NAME,
                'add-milestone',
                [
                    types.uint(0),
                    types.ascii("Work package"),
                    types.uint(1000000)
                ],
                client.address
            ),
            Tx.contractCall(
                CONTRACT_NAME,
                'fund-invoice',
                [types.uint(0)],
                client.address
            ),
            // Raise dispute
            Tx.contractCall(
                CONTRACT_NAME,
                'raise-dispute',
                [
                    types.uint(0),
                    types.ascii("Work not completed as agreed")
                ],
                client.address
            )
        ]);
        
        block.receipts[3].result.expectOk().expectBool(true);
    },
});

Clarinet.test({
    name: "Test: Read-only functions",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const client = accounts.get('wallet_1')!;
        const contractor = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                CONTRACT_NAME,
                'create-invoice',
                [
                    types.principal(contractor.address),
                    types.none(),
                    types.uint(1000000)
                ],
                client.address
            )
        ]);
        
        // Read invoice data
        let invoice = chain.callReadOnlyFn(
            CONTRACT_NAME,
            'get-invoice',
            [types.uint(0)],
            client.address
        );
        
        invoice.result.expectOk().expectSome();
        
        // Check escrow balance
        let balance = chain.callReadOnlyFn(
            CONTRACT_NAME,
            'get-escrow-balance',
            [],
            client.address
        );
        
        balance.result.expectOk();
    },
});

Clarinet.test({
    name: "Test: Unauthorized access prevention",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const client = accounts.get('wallet_1')!;
        const contractor = accounts.get('wallet_2')!;
        const unauthorized = accounts.get('wallet_3')!;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                CONTRACT_NAME,
                'create-invoice',
                [
                    types.principal(contractor.address),
                    types.none(),
                    types.uint(1000000)
                ],
                client.address
            ),
            // Unauthorized user tries to add milestone
            Tx.contractCall(
                CONTRACT_NAME,
                'add-milestone',
                [
                    types.uint(0),
                    types.ascii("Malicious milestone"),
                    types.uint(500000)
                ],
                unauthorized.address
            )
        ]);
        
        block.receipts[0].result.expectOk();
        block.receipts[1].result.expectErr().expectUint(101); // err-not-authorized
    },
});

