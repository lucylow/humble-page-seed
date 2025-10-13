import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  principalCV,
  stringUtf8CV,
  cvToJSON,
  callReadOnlyFunction,
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export const connectWallet = (onFinish: (address: string) => void) => {
  showConnect({
    appDetails: {
      name: 'BitMind Smart Invoice',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      const userData = userSession.loadUserData();
      const address = userData.profile.stxAddress.testnet;
      onFinish(address);
    },
    userSession,
  });
};

export const disconnectWallet = () => {
  userSession.signUserOut('/');
};

export const getNetwork = (isMainnet: boolean = false) => {
  return isMainnet ? new StacksMainnet() : new StacksTestnet();
};

export const getContractAddress = () => {
  // Update this with your deployed contract address
  return import.meta.env.VITE_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
};

export const getContractName = () => {
  return 'smart-invoice';
};

// Contract interaction functions

export const createInvoice = async (
  client: string,
  arbitrator: string,
  totalAmount: number,
  milestoneCount: number,
  network: any
) => {
  const txOptions = {
    contractAddress: getContractAddress(),
    contractName: getContractName(),
    functionName: 'create-invoice',
    functionArgs: [
      principalCV(client),
      principalCV(arbitrator),
      uintCV(totalAmount),
      uintCV(milestoneCount),
    ],
    senderKey: '', // Will be provided by wallet
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const addMilestone = async (
  invoiceId: number,
  milestoneId: number,
  description: string,
  amount: number,
  network: any
) => {
  const txOptions = {
    contractAddress: getContractAddress(),
    contractName: getContractName(),
    functionName: 'add-milestone',
    functionArgs: [
      uintCV(invoiceId),
      uintCV(milestoneId),
      stringUtf8CV(description),
      uintCV(amount),
    ],
    senderKey: '',
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const fundInvoice = async (invoiceId: number, network: any) => {
  const txOptions = {
    contractAddress: getContractAddress(),
    contractName: getContractName(),
    functionName: 'fund-invoice',
    functionArgs: [uintCV(invoiceId)],
    senderKey: '',
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const approveMilestone = async (
  invoiceId: number,
  milestoneId: number,
  network: any
) => {
  const txOptions = {
    contractAddress: getContractAddress(),
    contractName: getContractName(),
    functionName: 'approve-milestone',
    functionArgs: [uintCV(invoiceId), uintCV(milestoneId)],
    senderKey: '',
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const releaseMilestonePayment = async (
  invoiceId: number,
  milestoneId: number,
  network: any
) => {
  const txOptions = {
    contractAddress: getContractAddress(),
    contractName: getContractName(),
    functionName: 'release-milestone-payment',
    functionArgs: [uintCV(invoiceId), uintCV(milestoneId)],
    senderKey: '',
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const raiseDispute = async (
  invoiceId: number,
  reason: string,
  network: any
) => {
  const txOptions = {
    contractAddress: getContractAddress(),
    contractName: getContractName(),
    functionName: 'raise-dispute',
    functionArgs: [uintCV(invoiceId), stringUtf8CV(reason)],
    senderKey: '',
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const resolveDispute = async (
  invoiceId: number,
  resolution: string,
  refundToClient: number,
  network: any
) => {
  const txOptions = {
    contractAddress: getContractAddress(),
    contractName: getContractName(),
    functionName: 'resolve-dispute',
    functionArgs: [
      uintCV(invoiceId),
      stringUtf8CV(resolution),
      uintCV(refundToClient),
    ],
    senderKey: '',
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

// Read-only functions

export const getInvoiceDetails = async (invoiceId: number, network: any) => {
  const options = {
    contractAddress: getContractAddress(),
    contractName: getContractName(),
    functionName: 'get-invoice-details',
    functionArgs: [uintCV(invoiceId)],
    network,
    senderAddress: getContractAddress(),
  };

  const result = await callReadOnlyFunction(options);
  return cvToJSON(result);
};

export const getMilestoneDetails = async (
  invoiceId: number,
  milestoneId: number,
  network: any
) => {
  const options = {
    contractAddress: getContractAddress(),
    contractName: getContractName(),
    functionName: 'get-milestone-details',
    functionArgs: [uintCV(invoiceId), uintCV(milestoneId)],
    network,
    senderAddress: getContractAddress(),
  };

  const result = await callReadOnlyFunction(options);
  return cvToJSON(result);
};

export const getDisputeDetails = async (invoiceId: number, network: any) => {
  const options = {
    contractAddress: getContractAddress(),
    contractName: getContractName(),
    functionName: 'get-dispute-details',
    functionArgs: [uintCV(invoiceId)],
    network,
    senderAddress: getContractAddress(),
  };

  const result = await callReadOnlyFunction(options);
  return cvToJSON(result);
};

