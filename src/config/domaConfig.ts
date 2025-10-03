// Doma Protocol Configuration
export const DOMA_CONFIG = {
  networks: {
    // Mainnet addresses (example - replace with actual addresses)
    ethereum: {
      proxyDomaRecord: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", // Proxy Doma Record contract address
      ownershipToken: "0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c",  // Ownership Token contract address
      chainId: "eip155:1",
      rpcUrl: "https://mainnet.infura.io/v3/YOUR_PROJECT_ID"
    },
    polygon: {
      proxyDomaRecord: "0x6fC21092DA55B392b745d0B6c49543c4e30fC2b3",
      ownershipToken: "0x1234567890abcdef1234567890abcdef12345678",
      chainId: "eip155:137",
      rpcUrl: "https://polygon-rpc.com"
    },
    // Testnet addresses
    goerli: {
      proxyDomaRecord: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      ownershipToken: "0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c",
      chainId: "eip155:5",
      rpcUrl: "https://goerli.infura.io/v3/YOUR_PROJECT_ID"
    }
  },
  
  // Doma Chain configuration
  domaChain: {
    rpcUrl: "https://rpc.doma.xyz",
    chainId: "eip155:123456", // Doma Chain ID - replace with actual
  },
  
  // API endpoints
  api: {
    voucher: "https://api.doma.xyz/voucher",
    bridge: "https://api.doma.xyz/bridge",
    // Other API endpoints
  },

  // Protocol fees (in ETH)
  protocolFees: {
    tokenization: "0.001",
    claim: "0.0005", 
    bridge: "0.002",
    detokenization: "0.0001"
  }
};

export const CONTRACT_ABIS = {
  ProxyDomaRecord: [
    "function requestTokenization((string[],uint256,uint256,address), bytes) external payable",
    "function claimOwnership(uint256, bool, (uint256,uint8,uint256,uint256), bytes) external payable", 
    "function bridge(uint256, bool, string, string) external payable",
    "function requestDetokenization(uint256, bool) public",
    "event OwnershipTokenMinted(uint256,uint256,address,string,string,uint256,string)"
  ],
  
  OwnershipToken: [
    "function expirationOf(uint256) external view returns (uint256)",
    "function registrarOf(uint256) external view returns (uint256)",
    "function lockStatusOf(uint256) external view returns (bool)",
    "function ownerOf(uint256) external view returns (address)",
    "function balanceOf(address) external view returns (uint256)",
    "event OwnershipTokenMinted(uint256,uint256,address,string,string,uint256,string)",
    "event OwnershipTokenRenewed(uint256,uint256)",
    "event OwnershipTokenBurned(uint256)",
    "event LockStatusChanged(uint256,bool)"
  ]
};

export const SUPPORTED_TLDS = [".com", ".org", ".xyz", ".io", ".ai", ".net", ".co"];

// Interface definitions
export interface TokenizationVoucher {
  names: NameInfo[];
  nonce: number;
  expiresAt: number;
  ownerAddress: string;
}

export interface NameInfo {
  name: string;
  tld: string;
  registrationDuration: number;
}

export interface ProofOfContactsVoucher {
  registrantHandle: number;
  proofSource: number; // 1 = Registrar, 2 = Doma
  nonce: number;
  expiresAt: number;
}

export interface TokenMetadata {
  tokenId: string;
  expiration: Date;
  registrar: number;
  isTransferLocked: boolean;
  owner: string;
  isExpired: boolean;
  domain?: string;
}
