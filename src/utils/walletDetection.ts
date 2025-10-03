// @ts-nocheck
export interface WalletInfo {
  name: string;
  detected: boolean;
  installUrl: string;
  icon: string;
}

export const detectWallets = (): WalletInfo[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const wallets: WalletInfo[] = [
    {
      name: 'MetaMask',
      detected: !!(window as unknown as { ethereum?: { isMetaMask?: boolean } }).ethereum?.isMetaMask,
      installUrl: 'https://metamask.io/',
      icon: '🦊'
    },
    {
      name: 'Coinbase Wallet',
      detected: !!(window as unknown as { ethereum?: { isCoinbaseWallet?: boolean } }).ethereum?.isCoinbaseWallet,
      installUrl: 'https://wallet.coinbase.com/',
      icon: '🔵'
    },
    {
      name: 'Brave Wallet',
      detected: !!(window as unknown as { ethereum?: { isBraveWallet?: boolean } }).ethereum?.isBraveWallet,
      installUrl: 'https://brave.com/wallet/',
      icon: '🦁'
    },
    {
      name: 'Rabby',
      detected: !!(window as unknown as { ethereum?: { isRabby?: boolean } }).ethereum?.isRabby,
      installUrl: 'https://rabby.io/',
      icon: '🐰'
    },
    {
      name: 'Trust Wallet',
      detected: !!(window as unknown as { ethereum?: { isTrust?: boolean } }).ethereum?.isTrust,
      installUrl: 'https://trustwallet.com/',
      icon: '🔒'
    },
    {
      name: 'Frame',
      detected: !!(window as unknown as { ethereum?: { isFrame?: boolean } }).ethereum?.isFrame,
      installUrl: 'https://frame.sh/',
      icon: '🖼️'
    },
    {
      name: 'Opera Wallet',
      detected: !!(window as unknown as { ethereum?: { isOpera?: boolean } }).ethereum?.isOpera,
      installUrl: 'https://www.opera.com/crypto',
      icon: '🎭'
    }
  ];

  return wallets;
};

export const getDetectedWallet = (): string | null => {
  const wallets = detectWallets();
  const detected = wallets.find(w => w.detected);
  return detected ? detected.name : null;
};

export const hasAnyWallet = (): boolean => {
  return detectWallets().some(w => w.detected);
};

export const getWalletInstallInstructions = (): string => {
  const wallets = detectWallets();
  const detected = wallets.find(w => w.detected);
  
  if (detected) {
    return `${detected.name} is detected and ready to use!`;
  }
  
  return 'Please install a Web3 wallet to continue. We recommend MetaMask for the best experience.';
};

export const getWalletConnectionError = (error: unknown): string => {
  if (!error) return 'Unknown error occurred';
  
  // Handle specific error codes
  if (error.code === 4001) {
    return 'Connection rejected. Please approve the connection request in your wallet.';
  } else if (error.code === -32002) {
    return 'Connection request already pending. Please check your wallet.';
  } else if (error.code === -32003) {
    return 'Wallet is locked. Please unlock your wallet and try again.';
  } else if (error.code === 4900) {
    return 'Wallet not connected to any network. Please connect to a network.';
  } else if (error.code === 4901) {
    return 'Request rejected by user. Please try again.';
  } else if (error.code === 4902) {
    return 'Network not found. Please add the network to your wallet.';
  }
  
  // Handle error messages
  if (error.message?.includes('User rejected')) {
    return 'Connection rejected by user. Please approve the connection request.';
  } else if (error.message?.includes('already pending')) {
    return 'Connection request is already pending. Please check your wallet.';
  } else if (error.message?.includes('locked')) {
    return 'Wallet is locked. Please unlock your wallet and try again.';
  }
  
  return error.message || 'Failed to connect wallet. Please try again.';
};
