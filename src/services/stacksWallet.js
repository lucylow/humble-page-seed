/**
 * Stacks Wallet Integration using @stacks/connect
 * Wallet-based authentication (no API keys needed)
 */
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { AnchorMode, uintCV, stringAsciiCV } from '@stacks/transactions';
// App configuration
const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });
// Network configuration
const isTestnet = typeof window !== 'undefined' && window.location.hostname === 'localhost';
export const network = isTestnet ? new StacksTestnet() : new StacksMainnet();
/**
 * Connect to Stacks wallet (Hiro, Leather, Xverse, etc.)
 */
export async function connectWallet() {
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
export function disconnectWallet() {
    userSession.signUserOut();
    window.location.reload();
}
/**
 * Check if wallet is connected
 */
export function isWalletConnected() {
    return userSession.isUserSignedIn();
}
/**
 * Get current user data
 */
export function getUserData() {
    if (!userSession.isUserSignedIn()) {
        return null;
    }
    return userSession.loadUserData();
}
/**
 * Get user's STX address
 */
export function getAddress() {
    const userData = getUserData();
    if (!userData)
        return null;
    return isTestnet
        ? userData.profile.stxAddress.testnet
        : userData.profile.stxAddress.mainnet;
}
/**
 * Call a smart contract function
 */
export async function callContract(options) {
    const { contractAddress, contractName, functionName, functionArgs, postConditions = [], onFinish, onCancel } = options;
    return new Promise((resolve, reject) => {
        const txOptions = {
            contractAddress,
            contractName,
            functionName,
            functionArgs,
            postConditions,
            network,
            anchorMode: AnchorMode.Any,
            onFinish: (data) => {
                if (onFinish)
                    onFinish(data);
                resolve(data.txId);
            },
            onCancel: () => {
                if (onCancel)
                    onCancel();
                reject(new Error('Transaction cancelled'));
            },
        };
        // Use Stacks Connect to prompt wallet
        // @ts-ignore - Wallet provider methods
        if (window.btc?.request) {
            window.btc.request('stx_callContract', txOptions)
                .then((result) => {
                if (onFinish)
                    onFinish(result);
                resolve(result.txId);
            })
                .catch((error) => {
                if (onCancel)
                    onCancel();
                reject(error);
            });
        }
        else {
            reject(new Error('Wallet not available'));
        }
    });
}
export async function transferSTX(options) {
    const { recipient, amount, memo, onFinish, onCancel } = options;
    return new Promise((resolve, reject) => {
        const txOptions = {
            recipient,
            amount: amount.toString(),
            memo: memo || '',
            network,
            anchorMode: AnchorMode.Any,
            onFinish: (data) => {
                if (onFinish)
                    onFinish(data);
                resolve(data.txId);
            },
            onCancel: () => {
                if (onCancel)
                    onCancel();
                reject(new Error('Transfer cancelled'));
            },
        };
        // Use Stacks Connect
        // @ts-ignore - Wallet provider methods
        if (window.btc?.request) {
            window.btc.request('stx_transferStx', txOptions)
                .then((result) => {
                if (onFinish)
                    onFinish(result);
                resolve(result.txId);
            })
                .catch((error) => {
                if (onCancel)
                    onCancel();
                reject(error);
            });
        }
        else {
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
export async function lockInvoiceFunds(contractAddress, contractName, amount // in microSTX or sats
) {
    const address = getAddress();
    if (!address)
        throw new Error('Wallet not connected');
    // Post conditions can be added for additional security
    const postConditions = [];
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
export async function approveMilestone(contractAddress, contractName, milestoneId) {
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
export async function releaseMilestone(contractAddress, contractName, milestoneId) {
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
export async function raiseDispute(contractAddress, contractName, reason) {
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
export async function resolveDispute(contractAddress, contractName, favorClient) {
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
export async function cancelInvoice(contractAddress, contractName) {
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
export async function readContract(contractAddress, contractName, functionName, functionArgs = []) {
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
export async function getInvoiceInfo(contractAddress, contractName) {
    return await readContract(contractAddress, contractName, 'get-contract-info');
}
/**
 * Get milestone details
 */
export async function getMilestoneDetails(contractAddress, contractName, milestoneId) {
    return await readContract(contractAddress, contractName, 'get-milestone', [uintCV(milestoneId)]);
}
/**
 * Get locked balance
 */
export async function getLockedBalance(contractAddress, contractName) {
    return await readContract(contractAddress, contractName, 'get-locked-balance');
}
// ============================================
// Utility Functions
// ============================================
/**
 * Convert STX to microSTX
 */
export function stxToMicroStx(stx) {
    return Math.floor(stx * 1000000);
}
/**
 * Convert microSTX to STX
 */
export function microStxToStx(microStx) {
    return microStx / 1000000;
}
/**
 * Format STX amount for display
 */
export function formatSTX(microStx) {
    const stx = microStxToStx(microStx);
    return `${stx.toLocaleString()} STX`;
}
/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(txId, maxAttempts = 20) {
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
        }
        catch (error) {
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
