import { createContext, useContext, useEffect, useState, ReactNode, FC, useCallback } from 'react';
import { ethers, BrowserProvider, JsonRpcProvider, Network } from 'ethers';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isBraveWallet?: boolean;
      isRabby?: boolean;
      isTrust?: boolean;
      isFrame?: boolean;
      isOpera?: boolean;
      isConnected?: () => boolean;
    };
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
    };
  }
}

// Supported blockchain networks
export enum SupportedChain {
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon',
  BSC = 'bsc',
  SOLANA = 'solana'
}

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  contracts: {
    domainTokenization?: string;
    fractionalOwnership?: string;
    royaltyDistribution?: string;
  };
}

export const CHAIN_CONFIGS: Record<SupportedChain, ChainConfig> = {
  [SupportedChain.ETHEREUM]: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    contracts: {
      domainTokenization: '0x...', // Deploy and update
      fractionalOwnership: '0x...',
      royaltyDistribution: '0x...'
    }
  },
  [SupportedChain.POLYGON]: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    contracts: {
      domainTokenization: '0x...',
      fractionalOwnership: '0x...',
      royaltyDistribution: '0x...'
    }
  },
  [SupportedChain.BSC]: {
    chainId: 56,
    name: 'Binance Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    contracts: {
      domainTokenization: '0x...',
      fractionalOwnership: '0x...',
      royaltyDistribution: '0x...'
    }
  },
  [SupportedChain.SOLANA]: {
    chainId: 0, // Solana doesn't use chainId
    name: 'Solana',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    blockExplorer: 'https://explorer.solana.com',
    nativeCurrency: {
      name: 'SOL',
      symbol: 'SOL',
      decimals: 9
    },
    contracts: {
      // Solana program addresses
      domainTokenization: '0x...',
      fractionalOwnership: '0x...',
      royaltyDistribution: '0x...'
    }
  }
};

interface Web3ContextType {
  // EVM chains
  account: string | null;
  provider: BrowserProvider | null;
  signer: ethers.Signer | null;
  isConnected: boolean;
  network: Network | null;
  currentChain: SupportedChain;
  chainId: number | null;
  
  // Solana
  solanaAccount: string | null;
  solanaProvider: {
    isPhantom?: boolean;
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
  } | null;
  isSolanaConnected: boolean;
  
  // General state
  isMockMode: boolean;
  isConnecting: boolean;
  error: string | null;
  
  // EVM methods
  connectWallet: (chain?: SupportedChain) => Promise<boolean>;
  switchChain: (chain: SupportedChain) => Promise<boolean>;
  disconnectWallet: () => void;
  connectMockWallet: () => void;
  clearError: () => void;
  
  // Solana methods
  connectSolanaWallet: () => Promise<boolean>;
  disconnectSolanaWallet: () => void;
  
  // Cross-chain methods
  bridgeAsset: (fromChain: SupportedChain, toChain: SupportedChain, amount: string) => Promise<boolean>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: FC<Web3ProviderProps> = ({ children }) => {
  // EVM chains state
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [network, setNetwork] = useState<Network | null>(null);
  const [currentChain, setCurrentChain] = useState<SupportedChain>(SupportedChain.POLYGON);
  const [chainId, setChainId] = useState<number | null>(null);
  
  // Solana state
  const [solanaAccount, setSolanaAccount] = useState<string | null>(null);
  const [solanaProvider, setSolanaProvider] = useState<{
    isPhantom?: boolean;
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
  } | null>(null);
  const [isSolanaConnected, setIsSolanaConnected] = useState(false);
  
  // General state
  const [isMockMode, setIsMockMode] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isManualConnection, setIsManualConnection] = useState(false);

  // Event listener references for cleanup
  const [eventListeners, setEventListeners] = useState<{
    accountsChanged?: (accounts: string[]) => void;
    chainChanged?: () => void;
  }>({});

  const connectMockWallet = useCallback(() => {
    setError(null);
    // Mock wallet for development
    const mockAccount = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    setAccount(mockAccount);
    setProvider(null); // No real provider in mock mode
    setSigner(null); // No real signer in mock mode
    setNetwork(null); // No real network in mock mode
    setChainId(CHAIN_CONFIGS[SupportedChain.POLYGON].chainId);
    setIsConnected(true);
    setIsMockMode(true);
    
    console.log('Connected to mock wallet for development');
  }, []);

  const disconnectWallet = useCallback(() => {
    console.log('🔌 Disconnecting wallet...');
    // Clean up event listeners
    if (window.ethereum && eventListeners.accountsChanged) {
      window.ethereum.removeListener('accountsChanged', eventListeners.accountsChanged);
    }
    if (window.ethereum && eventListeners.chainChanged) {
      window.ethereum.removeListener('chainChanged', eventListeners.chainChanged);
    }
    
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    setNetwork(null);
    setCurrentChain(SupportedChain.POLYGON);
    setChainId(null);
    setIsMockMode(false);
    setError(null);
    setEventListeners({});
    console.log('✅ Wallet disconnected');
  }, []); // Removed eventListeners dependency to prevent circular deps

  const switchChain = useCallback(async (chain: SupportedChain): Promise<boolean> => {
    if (!window.ethereum) {
      setError('Wallet not detected');
      return false;
    }
    
    try {
      const chainConfig = CHAIN_CONFIGS[chain];
      if (!chainConfig) {
        throw new Error(`Unsupported chain: ${chain}`);
      }
      
      // Check if already on the correct chain
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const targetChainId = `0x${chainConfig.chainId.toString(16)}`;
      
      if (currentChainId === targetChainId) {
        setCurrentChain(chain);
        setChainId(chainConfig.chainId);
        return true;
      }
      
      // Try to switch to the chain
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetChainId }],
        });
        setCurrentChain(chain);
        setChainId(chainConfig.chainId);
        return true;
      } catch (switchError: unknown) {
        // If the chain is not added to the wallet, add it
        if ((switchError as Record<string, unknown>).code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${chainConfig.chainId.toString(16)}`,
                chainName: chainConfig.name,
                rpcUrls: [chainConfig.rpcUrl],
                blockExplorerUrls: [chainConfig.blockExplorer],
                nativeCurrency: chainConfig.nativeCurrency,
              }],
            });
            setCurrentChain(chain);
            setChainId(chainConfig.chainId);
            return true;
          } catch (addError: unknown) {
            console.error('Failed to add chain:', addError);
            let errorMsg = `Failed to add ${chainConfig.name} to your wallet`;
            if ((addError as Record<string, unknown>).code === 4001) {
              errorMsg = `User rejected adding ${chainConfig.name} to wallet`;
            } else if ((addError as Record<string, unknown>).code === -32602) {
              errorMsg = `Invalid parameters for adding ${chainConfig.name}`;
            }
            setError(errorMsg);
            return false;
          }
        } else if ((switchError as Record<string, unknown>).code === 4001) {
          setError(`User rejected switching to ${chainConfig.name}`);
          return false;
        } else if ((switchError as Record<string, unknown>).code === -32002) {
          setError(`Request to switch to ${chainConfig.name} is already pending`);
          return false;
        }
        
        setError(`Failed to switch to ${chainConfig.name}. Please try again.`);
        return false;
      }
    } catch (error) {
      console.error('Chain switch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch chain';
      setError(errorMessage);
      return false;
    }
  }, []);

  const connectWallet = useCallback(async (chain: SupportedChain = SupportedChain.POLYGON): Promise<boolean> => {
    console.log('🔄 Starting wallet connection...');
    setIsConnecting(true);
    setIsManualConnection(true);
    setError(null);
    
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        // Check if any wallet is available (not just MetaMask)
        const isWalletAvailable = window.ethereum.isMetaMask || 
                                 window.ethereum.isCoinbaseWallet || 
                                 window.ethereum.isBraveWallet ||
                                 window.ethereum.isRabby ||
                                 window.ethereum.isTrust ||
                                 window.ethereum.isFrame ||
                                 window.ethereum.isOpera;

        if (!isWalletAvailable) {
          setError('No compatible wallet detected. Please install MetaMask, Coinbase Wallet, or another Web3 wallet.');
          return false;
        }

        // Check if wallet is already connected
        const existingAccounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
        if (existingAccounts.length > 0) {
          // Wallet is already connected, just switch chain if needed
          const chainSwitched = await switchChain(chain);
          if (!chainSwitched) {
            setError('Failed to switch to the requested network');
            return false;
          }
          
          const web3Provider = new BrowserProvider(window.ethereum);
          const accounts = await web3Provider.listAccounts();
          const network = await web3Provider.getNetwork();
          const signer = await web3Provider.getSigner();
          
          setProvider(web3Provider);
          setSigner(signer);
          setAccount(accounts[0].address);
          setNetwork(network);
          setCurrentChain(chain);
          setIsConnected(true);
          setIsMockMode(false);
          
          return true;
        }

        // Request connection
        const web3Provider = new BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Switch to the requested chain if not already on it
        const chainSwitched = await switchChain(chain);
        if (!chainSwitched) {
          setError('Failed to switch to the requested network');
          return false;
        }
        
        const accounts = await web3Provider.listAccounts();
        const network = await web3Provider.getNetwork();
        const signer = await web3Provider.getSigner();
        
        if (accounts.length === 0) {
          throw new Error('No accounts found. Please unlock your wallet.');
        }
        
        console.log('✅ Wallet connected successfully!');
        console.log('📍 Account:', accounts[0].address);
        console.log('🌐 Network:', network.name);
        console.log('⛓️ Chain:', chain);
        
        setProvider(web3Provider);
        setSigner(signer);
        setAccount(accounts[0].address);
        setNetwork(network);
        setCurrentChain(chain);
        setIsConnected(true);
        setIsMockMode(false);
        
        // Set up event listeners with proper cleanup
        const accountsChangedHandler = (accounts: string[]) => {
          console.log('👤 Accounts changed:', accounts);
          if (accounts.length === 0) {
            console.log('❌ No accounts found, disconnecting...');
            // Clean up event listeners
            if (window.ethereum && eventListeners.accountsChanged) {
              window.ethereum.removeListener('accountsChanged', eventListeners.accountsChanged);
            }
            if (window.ethereum && eventListeners.chainChanged) {
              window.ethereum.removeListener('chainChanged', eventListeners.chainChanged);
            }
            
            setAccount(null);
            setProvider(null);
            setSigner(null);
            setIsConnected(false);
            setNetwork(null);
            setCurrentChain(SupportedChain.POLYGON);
            setChainId(null);
            setIsMockMode(false);
            setError(null);
            setEventListeners({});
          } else {
            console.log('✅ Account updated:', accounts[0]);
            setAccount(accounts[0]);
          }
        };

        const chainChangedHandler = () => {
          console.log('🔗 Chain changed, reloading in 1 second...');
          // Instead of reloading, try to reconnect gracefully
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        };

        // Remove existing listeners first
        if (eventListeners.accountsChanged) {
          window.ethereum.removeListener('accountsChanged', eventListeners.accountsChanged);
        }
        if (eventListeners.chainChanged) {
          window.ethereum.removeListener('chainChanged', eventListeners.chainChanged);
        }

        // Add new listeners
        window.ethereum.on('accountsChanged', accountsChangedHandler);
        window.ethereum.on('chainChanged', chainChangedHandler);

        // Store references for cleanup
        setEventListeners({
          accountsChanged: accountsChangedHandler,
          chainChanged: chainChangedHandler
        });
        
        return true;
      } else {
        // Offer mock mode for development
        if (process.env.NODE_ENV === 'development') {
          const useMock = confirm('No wallet detected. Would you like to use mock wallet mode for development?');
          if (useMock) {
            connectMockWallet();
            return true;
          }
        }
        setError('No wallet detected. Please install MetaMask, Coinbase Wallet, or another Web3 wallet to continue.');
        return false;
      }
    } catch (error: unknown) {
      console.error('Failed to connect wallet:', error);
      let errorMessage = 'Failed to connect wallet';
      
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as { code: number }).code;
        if (errorCode === 4001) {
          errorMessage = 'Connection request was rejected. Please try again and approve the connection.';
        } else if (errorCode === -32002) {
          errorMessage = 'Connection request is already pending. Please check your wallet.';
        } else if (errorCode === -32003) {
          errorMessage = 'Wallet is locked. Please unlock your wallet and try again.';
        } else if (errorCode === 4900) {
          errorMessage = 'Wallet is not connected to any network. Please connect to a network first.';
        } else if (errorCode === 4901) {
          errorMessage = 'User rejected the request. Please try again.';
        } else if (errorCode === 4902) {
          errorMessage = 'Network not found. Please add the network to your wallet.';
        }
      }
      
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMsg = (error as { message: string }).message;
        if (errorMsg.includes('User denied')) {
          errorMessage = 'Connection request was denied. Please try again and approve the connection.';
        } else if (errorMsg.includes('already pending')) {
          errorMessage = 'Connection request is already pending. Please check your wallet.';
        } else {
          errorMessage = errorMsg;
        }
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setIsConnecting(false);
      setIsManualConnection(false);
    }
  }, [switchChain, connectMockWallet]); // Removed eventListeners and disconnectWallet to prevent circular deps

  const connectSolanaWallet = async (): Promise<boolean> => {
    try {
      if (typeof window !== 'undefined' && window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect();
        setSolanaAccount(response.publicKey.toString());
        setSolanaProvider(window.solana);
        setIsSolanaConnected(true);
        return true;
      } else {
        setError('Phantom wallet not detected. Please install Phantom wallet.');
        return false;
      }
    } catch (error: unknown) {
      console.error('Failed to connect Solana wallet:', error);
      setError('Failed to connect Solana wallet');
      return false;
    }
  };

  const disconnectSolanaWallet = () => {
    setSolanaAccount(null);
    setSolanaProvider(null);
    setIsSolanaConnected(false);
  };

  const bridgeAsset = async (fromChain: SupportedChain, toChain: SupportedChain, amount: string): Promise<boolean> => {
    try {
      // This is a placeholder for cross-chain bridging functionality
      // In a real implementation, this would interact with bridge contracts
      // like Chainlink CCIP, Axelar, or other cross-chain protocols
      
      console.log(`Bridging ${amount} from ${fromChain} to ${toChain}`);
      
      // For now, just simulate the bridge operation
      setError(null);
      return true;
    } catch (error: unknown) {
      console.error('Bridge operation failed:', error);
      setError('Bridge operation failed');
      return false;
    }
  };



  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          console.log('🔍 Checking existing wallet connection...');
          const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
          console.log('👥 Found accounts:', accounts);
          
          if (accounts.length > 0 && !isConnected) {
            console.log('🔄 Auto-reconnecting to previously connected wallet...');
            // Auto-reconnect if wallet was previously connected
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const chainIdNumber = parseInt(chainId as string, 16);
            console.log('⛓️ Current chain ID:', chainIdNumber);
            
            // Determine which chain we're on
            let detectedChain = SupportedChain.POLYGON;
            if (chainIdNumber === 1) detectedChain = SupportedChain.ETHEREUM;
            else if (chainIdNumber === 137) detectedChain = SupportedChain.POLYGON;
            else if (chainIdNumber === 56) detectedChain = SupportedChain.BSC;
            
            // Only auto-reconnect if we're on a supported chain
            const supportedChainIds = Object.values(CHAIN_CONFIGS).map(config => config.chainId);
            if (supportedChainIds.includes(chainIdNumber)) {
              console.log('✅ Supported chain detected, auto-reconnecting...');
              await connectWallet(detectedChain);
            } else {
              console.log('❌ Unsupported chain, skipping auto-reconnect');
            }
          }
        } catch (error) {
          console.error('❌ Failed to check wallet connection:', error);
        }
      }
    };

    // Only check connection on mount, not on every render and not during manual connection
    if (!isConnected && !isManualConnection) {
      checkConnection();
    }

    // Cleanup function
    return () => {
      if (window.ethereum && eventListeners.accountsChanged) {
        window.ethereum.removeListener('accountsChanged', eventListeners.accountsChanged);
      }
      if (window.ethereum && eventListeners.chainChanged) {
        window.ethereum.removeListener('chainChanged', eventListeners.chainChanged);
      }
    };
  }, [connectWallet, eventListeners.accountsChanged, eventListeners.chainChanged, isConnected, isManualConnection]);

  const value: Web3ContextType = {
    // EVM chains
    account,
    provider,
    signer,
    isConnected,
    network,
    currentChain,
    chainId,
    
    // Solana
    solanaAccount,
    solanaProvider,
    isSolanaConnected,
    
    // General state
    isMockMode,
    isConnecting,
    error,
    
    // EVM methods
    connectWallet,
    switchChain,
    disconnectWallet,
    connectMockWallet,
    clearError,
    
    // Solana methods
    connectSolanaWallet,
    disconnectSolanaWallet,
    
    // Cross-chain methods
    bridgeAsset
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};