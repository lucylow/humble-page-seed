/**
 * Stacks Wallet Integration using @stacks/connect
 * Wallet-based authentication (no API keys needed)
 */

import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import {
  makeContractCall,
  makeContractDeploy,
  makeSTXTokenTransfer,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  FungibleConditionCode,
  uintCV,
  stringAsciiCV,
  principalCV,
  bufferCV
} from '@stacks/transactions';

// App configuration
const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

// Network configuration
const isTestnet = typeof window !== 'undefined' && window.location.hostname === 'localhost';
export const network = isTestnet ? STACKS_TESTNET : STACKS_MAINNET;

// ============================================
// Wallet Connection
// ============================================

export interface UserData {
  profile: {
    stxAddress: {
      mainnet: string;
      testnet: string;
    };
  };
  appPrivateKey?: string;
  authResponseToken?: string;
}

/**
 * Connect to Stacks wallet (Hiro, Leather, Xverse, etc.)
 */
export async function connectWallet(): Promise<void> {
  return new Promise((resolve, reject) => {
    showConnect({
      appDetails: {
        name: 'BitMind Smart Invoice',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        resolve();
      },
      onCancel: () => {
        reject(new Error('User cancelled wallet connection'));
      },
      userSession,
    });
  });
}

/**
 * Disconnect wallet
 */
export function disconnectWallet(): void {
  userSession.signUserOut();
  window.location.reload();
}

/**
 * Check if wallet is connected
 */
export function isWalletConnected(): boolean {
  return userSession.isUserSignedIn();
}

/**
 * Get current user data
 */
export function getUserData(): UserData | null {
  if (!userSession.isUserSignedIn()) {
    return null;
  }
  return userSession.loadUserData();
}

/**
 * Get user's STX address
 */
export function getAddress(): string | null {
  const userData = getUserData();
  if (!userData) return null;
  
  return isTestnet 
    ? userData.profile.stxAddress.testnet 
    : userData.profile.stxAddress.mainnet;
}

// ============================================
// Smart Contract Interactions
// ============================================

export interface ContractCallOptions {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: any[];
  postConditions?: any[];
  onFinish?: (data: any) => void;
  onCancel?: () => void;
}

/**
 * Call a smart contract function
 */
export async function callContract(options: ContractCallOptions): Promise<string> {
  const {
    contractAddress,
    contractName,
    functionName,
    functionArgs,
    postConditions = [],
    onFinish,
    onCancel
  } = options;

  return new Promise((resolve, reject) => {
    const txOptions = {
      contractAddress,
      contractName,
      functionName,
      functionArgs,
      postConditions,
      network,
      anchorMode: AnchorMode.Any,
      onFinish: (data: any) => {
        if (onFinish) onFinish(data);
        resolve(data.txId);
      },
      onCancel: () => {
        if (onCancel) onCancel();
        reject(new Error('Transaction cancelled'));
      },
    };

    // Use Stacks Connect to prompt wallet
    // @ts-ignore - Wallet provider methods
    if ((window as any).btc?.request) {
      (window as any).btc.request('stx_callContract', txOptions)
        .then((result: any) => {
          if (onFinish) onFinish(result);
          resolve(result.txId);
        })
        .catch((error: any) => {
          if (onCancel) onCancel();
          reject(error);
        });
    } else {
      reject(new Error('Wallet not available'));
    }
  });
}

/**
 * Transfer STX tokens
 */
export interface TransferOptions {
  recipient: string;
  amount: number; // in microSTX
  memo?: string;
  onFinish?: (data: any) => void;
  onCancel?: () => void;
}

export async function transferSTX(options: TransferOptions): Promise<string> {
  const { recipient, amount, memo, onFinish, onCancel } = options;

  return new Promise((resolve, reject) => {
    const txOptions = {
      recipient,
      amount: amount.toString(),
      memo: memo || '',
      network,
      anchorMode: AnchorMode.Any,
      onFinish: (data: any) => {
        if (onFinish) onFinish(data);
        resolve(data.txId);
      },
      onCancel: () => {
        if (onCancel) onCancel();
        reject(new Error('Transfer cancelled'));
      },
    };

    // Use Stacks Connect
    // @ts-ignore - Wallet provider methods
    if ((window as any).btc?.request) {
      (window as any).btc.request('stx_transferStx', txOptions)
        .then((result: any) => {
          if (onFinish) onFinish(result);
          resolve(result.txId);
        })
        .catch((error: any) => {
          if (onCancel) onCancel();
          reject(error);
        });
    } else {
      reject(new Error('Wallet not available'));
    }
  });
}

// ============================================
// Invoice-Specific Contract Calls
// ============================================

/**
 * Lock funds in invoice escrow
 */
export async function lockInvoiceFunds(
  contractAddress: string,
  contractName: string,
  amount: number // in microSTX or sats
): Promise<string> {
  const address = getAddress();
  if (!address) throw new Error('Wallet not connected');

  // Post conditions can be added for additional security
  const postConditions: any[] = [];

  return await callContract({
    contractAddress,
    contractName,
    functionName: 'lock-funds',
    functionArgs: [uintCV(amount)],
    postConditions,
  });
}

/**
 * Approve milestone
 */
export async function approveMilestone(
  contractAddress: string,
  contractName: string,
  milestoneId: number
): Promise<string> {
  return await callContract({
    contractAddress,
    contractName,
    functionName: 'approve-milestone',
    functionArgs: [uintCV(milestoneId)],
  });
}

/**
 * Release milestone payment
 */
export async function releaseMilestone(
  contractAddress: string,
  contractName: string,
  milestoneId: number
): Promise<string> {
  return await callContract({
    contractAddress,
    contractName,
    functionName: 'release-milestone',
    functionArgs: [uintCV(milestoneId)],
  });
}

/**
 * Raise dispute
 */
export async function raiseDispute(
  contractAddress: string,
  contractName: string,
  reason: string
): Promise<string> {
  return await callContract({
    contractAddress,
    contractName,
    functionName: 'raise-dispute',
    functionArgs: [stringAsciiCV(reason.substring(0, 256))],
  });
}

/**
 * Resolve dispute (arbitrator only)
 */
export async function resolveDispute(
  contractAddress: string,
  contractName: string,
  favorClient: boolean
): Promise<string> {
  return await callContract({
    contractAddress,
    contractName,
    functionName: 'resolve-dispute',
    functionArgs: [uintCV(favorClient ? 1 : 0)],
  });
}

/**
 * Cancel invoice and refund
 */
export async function cancelInvoice(
  contractAddress: string,
  contractName: string
): Promise<string> {
  return await callContract({
    contractAddress,
    contractName,
    functionName: 'cancel-and-refund',
    functionArgs: [],
  });
}

// ============================================
// Read-Only Contract Calls
// ============================================

/**
 * Read contract data without wallet interaction
 */
export async function readContract(
  contractAddress: string,
  contractName: string,
  functionName: string,
  functionArgs: any[] = []
) {
  const apiUrl = isTestnet 
    ? 'https://stacks-node-api.testnet.stacks.co'
    : 'https://stacks-node-api.mainnet.stacks.co';

  const url = `${apiUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: contractAddress,
      arguments: functionArgs.map(arg => `0x${arg.toString()}`),
    }),
  });

  if (!response.ok) {
    throw new Error(`Contract read error: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get invoice contract info
 */
export async function getInvoiceInfo(
  contractAddress: string,
  contractName: string
) {
  return await readContract(
    contractAddress,
    contractName,
    'get-contract-info'
  );
}

/**
 * Get milestone details
 */
export async function getMilestoneDetails(
  contractAddress: string,
  contractName: string,
  milestoneId: number
) {
  return await readContract(
    contractAddress,
    contractName,
    'get-milestone',
    [uintCV(milestoneId)]
  );
}

/**
 * Get locked balance
 */
export async function getLockedBalance(
  contractAddress: string,
  contractName: string
) {
  return await readContract(
    contractAddress,
    contractName,
    'get-locked-balance'
  );
}

// ============================================
// Utility Functions
// ============================================

/**
 * Convert STX to microSTX
 */
export function stxToMicroStx(stx: number): number {
  return Math.floor(stx * 1000000);
}

/**
 * Convert microSTX to STX
 */
export function microStxToStx(microStx: number): number {
  return microStx / 1000000;
}

/**
 * Format STX amount for display
 */
export function formatSTX(microStx: number): string {
  const stx = microStxToStx(microStx);
  return `${stx.toLocaleString()} STX`;
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  txId: string,
  maxAttempts: number = 20
): Promise<any> {
  const apiUrl = isTestnet 
    ? 'https://stacks-node-api.testnet.stacks.co'
    : 'https://stacks-node-api.mainnet.stacks.co';

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${apiUrl}/extended/v1/tx/${txId}`);
      
      if (response.ok) {
        const tx = await response.json();
        
        if (tx.tx_status === 'success' || tx.tx_status === 'abort_by_response') {
          return tx;
        }
      }
    } catch (error) {
      // Transaction not yet in mempool, keep waiting
    }

    // Wait 10 seconds before next check
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  throw new Error('Transaction confirmation timeout');
}

export default {
  // Connection
  connectWallet,
  disconnectWallet,
  isWalletConnected,
  getUserData,
  getAddress,
  
  // Transactions
  callContract,
  transferSTX,
  
  // Invoice Operations
  lockInvoiceFunds,
  approveMilestone,
  releaseMilestone,
  raiseDispute,
  resolveDispute,
  cancelInvoice,
  
  // Read-Only
  readContract,
  getInvoiceInfo,
  getMilestoneDetails,
  getLockedBalance,
  
  // Utilities
  stxToMicroStx,
  microStxToStx,
  formatSTX,
  waitForTransaction,
  
  // Network
  network,
  userSession
};

