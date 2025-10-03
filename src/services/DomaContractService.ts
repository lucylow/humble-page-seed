// @ts-nocheck
// Base Contract Interaction Class for Doma Protocol
import { ethers, Contract, Signer, JsonRpcProvider, parseEther } from 'ethers';
import { DOMA_CONFIG, CONTRACT_ABIS } from '../config/domaConfig';

export class DomaContractService {
  protected provider: JsonRpcProvider;
  protected signer: Signer | null = null;
  protected proxyDomaRecord: Contract;
  protected ownershipToken: Contract;
  protected networkConfig: typeof DOMA_CONFIG.networks.ethereum;

  constructor(network: keyof typeof DOMA_CONFIG.networks = 'ethereum') {
    this.networkConfig = DOMA_CONFIG.networks[network];
    this.provider = new JsonRpcProvider(this.networkConfig.rpcUrl);
    
    // Initialize contracts
    this.proxyDomaRecord = new ethers.Contract(
      this.networkConfig.proxyDomaRecord,
      CONTRACT_ABIS.ProxyDomaRecord,
      this.provider
    );
    
    this.ownershipToken = new ethers.Contract(
      this.networkConfig.ownershipToken,
      CONTRACT_ABIS.OwnershipToken,
      this.provider
    );
  }
  
  // Connect wallet for write operations
  connectWallet(signer: Signer): void {
    this.proxyDomaRecord = this.proxyDomaRecord.connect(signer);
    this.ownershipToken = this.ownershipToken.connect(signer);
    this.signer = signer;
  }
  
  // Get signer address
  async getAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    return await this.signer.getAddress();
  }
  
  // Estimate gas for transactions
  async estimateGas(method: string, params: unknown[], value = '0'): Promise<ethers.BigNumber> {
    try {
      return await this.proxyDomaRecord.estimateGas[method](
        ...params,
        { value: parseEther(value) }
      );
    } catch (error) {
      console.error(`Gas estimation failed for ${method}:`, error);
      throw new Error(`Gas estimation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get current network info
  getNetworkInfo(): { chainId: string; name: string } {
    return {
      chainId: this.networkConfig.chainId,
      name: this.networkConfig.chainId.includes('1') ? 'Ethereum' : 
            this.networkConfig.chainId.includes('137') ? 'Polygon' : 'Unknown'
    };
  }

  // Check if wallet is connected
  isWalletConnected(): boolean {
    return this.signer !== null;
  }

  // Get contract instances
  getContracts(): { proxyDomaRecord: Contract; ownershipToken: Contract } {
    return {
      proxyDomaRecord: this.proxyDomaRecord,
      ownershipToken: this.ownershipToken
    };
  }
}
