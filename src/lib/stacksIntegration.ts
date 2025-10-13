/**
 * Stacks.js Integration for Smart Invoice Escrow
 * Provides functions to interact with the Clarity escrow contract
 */

import {
  makeContractCall,
  broadcastTransaction,
  standardPrincipalCV,
  uintCV,
  AnchorMode,
  PostConditionMode,
} from '@stacks/transactions';
import { callReadOnlyFunction } from '@stacks/transactions';
import { StacksTestnet, StacksMainnet, StacksNetwork } from '@stacks/network';
import { openContractCall, showConnect } from '@stacks/connect';

// Configuration
const NETWORK = new StacksTestnet(); // Change to new StacksMainnet() for production
export const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Replace with your deployed contract
export const ESCROW_CONTRACT = 'escrow';
export const TOKEN_CONTRACT = 'mock-token';

/**
 * Connect to Hiro Wallet
 */
export function connectWallet(onFinish?: () => void, onCancel?: () => void) {
  showConnect({
    appDetails: {
      name: 'Smart Invoice Deals for DAOs',
      icon: typeof window !== 'undefined' ? window.location.origin + '/icon.png' : '',
    },
    onFinish: () => {
      console.log('✅ Wallet connected');
      if (onFinish) onFinish();
    },
    onCancel: () => {
      console.log('❌ Wallet connection cancelled');
      if (onCancel) onCancel();
    },
  });
}

/**
 * Create a new invoice on-chain
 */
export async function createInvoice(
  invoiceId: number,
  payee: string,
  amount: number,
  tokenContract: string,
  arbiter: string,
  deadline: number,
  userSession: any
) {
  const functionArgs = [
    uintCV(invoiceId),
    standardPrincipalCV(payee),
    uintCV(amount),
    standardPrincipalCV(tokenContract),
    standardPrincipalCV(arbiter),
    uintCV(deadline),
  ];

  const options = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: ESCROW_CONTRACT,
    functionName: 'create-invoice',
    functionArgs,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('✅ Invoice created:', data);
      return data;
    },
    onCancel: () => {
      console.log('❌ Invoice creation cancelled');
    },
  };

  await openContractCall(options);
}

/**
 * Transfer tokens to escrow contract
 * Step 1 of the deposit process
 */
export async function transferTokensToEscrow(
  amount: number,
  senderAddress: string,
  userSession: any
) {
  const escrowAddress = `${CONTRACT_ADDRESS}.${ESCROW_CONTRACT}`;

  const functionArgs = [
    uintCV(amount),
    standardPrincipalCV(senderAddress),
    standardPrincipalCV(escrowAddress),
  ];

  const options = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: TOKEN_CONTRACT,
    functionName: 'transfer',
    functionArgs,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('✅ Tokens transferred to escrow:', data);
      return data;
    },
    onCancel: () => {
      console.log('❌ Token transfer cancelled');
    },
  };

  await openContractCall(options);
}

/**
 * Acknowledge deposit
 * Step 2 of the deposit process - marks invoice as FUNDED
 */
export async function acknowledgeDeposit(invoiceId: number, userSession: any) {
  const functionArgs = [uintCV(invoiceId)];

  const options = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: ESCROW_CONTRACT,
    functionName: 'ack-deposit',
    functionArgs,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('✅ Deposit acknowledged:', data);
      return data;
    },
    onCancel: () => {
      console.log('❌ Deposit acknowledgement cancelled');
    },
  };

  await openContractCall(options);
}

/**
 * Release funds to payee
 * Can be called by payer or arbiter
 */
export async function releaseFunds(invoiceId: number, userSession: any) {
  const functionArgs = [uintCV(invoiceId)];

  const options = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: ESCROW_CONTRACT,
    functionName: 'release-funds',
    functionArgs,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('✅ Funds released to payee:', data);
      return data;
    },
    onCancel: () => {
      console.log('❌ Fund release cancelled');
    },
  };

  await openContractCall(options);
}

/**
 * Refund to payer
 * Can be called by payer or arbiter
 */
export async function refundToPayer(invoiceId: number, userSession: any) {
  const functionArgs = [uintCV(invoiceId)];

  const options = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: ESCROW_CONTRACT,
    functionName: 'refund',
    functionArgs,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('✅ Funds refunded to payer:', data);
      return data;
    },
    onCancel: () => {
      console.log('❌ Refund cancelled');
    },
  };

  await openContractCall(options);
}

/**
 * Get invoice details (read-only)
 */
export async function getInvoice(invoiceId: number): Promise<any> {
  const functionArgs = [uintCV(invoiceId)];

  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: ESCROW_CONTRACT,
    functionName: 'get-invoice',
    functionArgs,
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS,
  });

  return result;
}

/**
 * Get token balance (read-only)
 */
export async function getTokenBalance(address: string): Promise<any> {
  const functionArgs = [standardPrincipalCV(address)];

  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: TOKEN_CONTRACT,
    functionName: 'get-balance',
    functionArgs,
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS,
  });

  return result;
}

/**
 * Helper: Convert BTC amount to satoshis (base units)
 */
export function btcToSatoshis(btcAmount: number): number {
  return Math.floor(btcAmount * 100000000);
}

/**
 * Helper: Convert satoshis to BTC
 */
export function satoshisToBtc(satoshis: number): number {
  return satoshis / 100000000;
}

/**
 * Helper: Get invoice status string
 */
export function getInvoiceStatusString(statusCode: number): string {
  const statuses: { [key: number]: string } = {
    0: 'OPEN',
    1: 'FUNDED',
    2: 'RELEASED',
    3: 'DISPUTED',
    4: 'REFUNDED',
  };
  return statuses[statusCode] || 'UNKNOWN';
}

