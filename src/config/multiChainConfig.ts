// Multi-chain configuration for cross-chain domain trading

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
    domaLand: string;
    tokenization: string;
    fractionalization: string;
    marketplace: string;
  };
  subgraph?: string;
  testnet?: boolean;
}

export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    contracts: {
      domaLand: '0x0000000000000000000000000000000000000000',
      tokenization: '0x0000000000000000000000000000000000000001',
      fractionalization: '0x0000000000000000000000000000000000000002',
      marketplace: '0x0000000000000000000000000000000000000003'
    },
    subgraph: 'https://api.thegraph.com/subgraphs/name/domaland/ethereum'
  },
  
  polygon: {
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
      domaLand: '0x0000000000000000000000000000000000000000',
      tokenization: '0x0000000000000000000000000000000000000001',
      fractionalization: '0x0000000000000000000000000000000000000002',
      marketplace: '0x0000000000000000000000000000000000000003'
    },
    subgraph: 'https://api.thegraph.com/subgraphs/name/domaland/polygon'
  },
  
  avalanche: {
    chainId: 43114,
    name: 'Avalanche C-Chain',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    blockExplorer: 'https://snowtrace.io',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18
    },
    contracts: {
      domaLand: '0x0000000000000000000000000000000000000000',
      tokenization: '0x0000000000000000000000000000000000000001',
      fractionalization: '0x0000000000000000000000000000000000000002',
      marketplace: '0x0000000000000000000000000000000000000003'
    },
    subgraph: 'https://api.thegraph.com/subgraphs/name/domaland/avalanche'
  },
  
  arbitrum: {
    chainId: 42161,
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    contracts: {
      domaLand: '0x0000000000000000000000000000000000000000',
      tokenization: '0x0000000000000000000000000000000000000001',
      fractionalization: '0x0000000000000000000000000000000000000002',
      marketplace: '0x0000000000000000000000000000000000000003'
    },
    subgraph: 'https://api.thegraph.com/subgraphs/name/domaland/arbitrum'
  },
  
  optimism: {
    chainId: 10,
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
    blockExplorer: 'https://optimistic.etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    contracts: {
      domaLand: '0x0000000000000000000000000000000000000000',
      tokenization: '0x0000000000000000000000000000000000000001',
      fractionalization: '0x0000000000000000000000000000000000000002',
      marketplace: '0x0000000000000000000000000000000000000003'
    },
    subgraph: 'https://api.thegraph.com/subgraphs/name/domaland/optimism'
  },
  
  // Testnets
  goerli: {
    chainId: 5,
    name: 'Goerli',
    rpcUrl: 'https://goerli.infura.io/v3/your-api-key',
    blockExplorer: 'https://goerli.etherscan.io',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18
    },
    contracts: {
      domaLand: '0x0000000000000000000000000000000000000000',
      tokenization: '0x0000000000000000000000000000000000000001',
      fractionalization: '0x0000000000000000000000000000000000000002',
      marketplace: '0x0000000000000000000000000000000000000003'
    },
    testnet: true
  }
};

export const DEFAULT_CHAIN = 'ethereum';

export const getChainConfig = (chainId: number): ChainConfig | undefined => {
  return Object.values(SUPPORTED_CHAINS).find(chain => chain.chainId === chainId);
};

export const isChainSupported = (chainId: number): boolean => {
  return Object.values(SUPPORTED_CHAINS).some(chain => chain.chainId === chainId);
};

// Gas optimization configs per chain
export const GAS_CONFIGS = {
  ethereum: { maxPriorityFeePerGas: 2e9, maxFeePerGas: 100e9 },
  polygon: { maxPriorityFeePerGas: 30e9, maxFeePerGas: 200e9 },
  avalanche: { maxPriorityFeePerGas: 2e9, maxFeePerGas: 50e9 },
  arbitrum: { maxPriorityFeePerGas: 0.1e9, maxFeePerGas: 5e9 },
  optimism: { maxPriorityFeePerGas: 0.1e9, maxFeePerGas: 5e9 }
} as const;
