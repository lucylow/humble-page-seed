// @ts-nocheck
// Ownership Token Service for Doma Protocol
import { ethers } from 'ethers';
import { DomaContractService } from './DomaContractService';
import { TokenMetadata } from '../config/domaConfig';

export class OwnershipTokenService extends DomaContractService {
  constructor(network: keyof typeof DOMA_CONFIG.networks = 'ethereum') {
    super(network);
  }
  
  // Get token expiration date
  async getExpiration(tokenId: number): Promise<number> {
    try {
      const expiration = await this.ownershipToken.expirationOf(tokenId);
      return expiration.toNumber();
    } catch (error) {
      console.error('Failed to get token expiration:', error);
      throw new Error(`Failed to get token expiration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Get registrar IANA ID
  async getRegistrar(tokenId: number): Promise<number> {
    try {
      const registrar = await this.ownershipToken.registrarOf(tokenId);
      return registrar.toNumber();
    } catch (error) {
      console.error('Failed to get token registrar:', error);
      throw new Error(`Failed to get token registrar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Check if token transfer is locked
  async isTransferLocked(tokenId: number): Promise<boolean> {
    try {
      return await this.ownershipToken.lockStatusOf(tokenId);
    } catch (error) {
      console.error('Failed to get token lock status:', error);
      throw new Error(`Failed to get token lock status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Get token owner
  async getOwner(tokenId: number): Promise<string> {
    try {
      return await this.ownershipToken.ownerOf(tokenId);
    } catch (error) {
      console.error('Failed to get token owner:', error);
      throw new Error(`Failed to get token owner: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get token balance for address
  async getBalance(address: string): Promise<number> {
    try {
      const balance = await this.ownershipToken.balanceOf(address);
      return balance.toNumber();
    } catch (error) {
      console.error('Failed to get token balance:', error);
      throw new Error(`Failed to get token balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Get token metadata (simplified)
  async getTokenMetadata(tokenId: number): Promise<TokenMetadata> {
    try {
      const [expiration, registrar, isLocked, owner] = await Promise.all([
        this.getExpiration(tokenId),
        this.getRegistrar(tokenId),
        this.isTransferLocked(tokenId),
        this.getOwner(tokenId)
      ]);
      
      return {
        tokenId: tokenId.toString(),
        expiration: new Date(expiration * 1000), // Convert to JS Date
        registrar,
        isTransferLocked: isLocked,
        owner,
        isExpired: expiration < Math.floor(Date.now() / 1000)
      };
    } catch (error) {
      console.error('Failed to get token metadata:', error);
      throw new Error(`Failed to get token metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get multiple token metadata
  async getMultipleTokenMetadata(tokenIds: number[]): Promise<TokenMetadata[]> {
    try {
      const metadataPromises = tokenIds.map(id => this.getTokenMetadata(id));
      return await Promise.all(metadataPromises);
    } catch (error) {
      console.error('Failed to get multiple token metadata:', error);
      throw new Error(`Failed to get multiple token metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get tokens owned by address
  async getTokensByOwner(address: string): Promise<number[]> {
    try {
      // This is a simplified implementation
      // In a real scenario, you might need to query events or use a subgraph
      const balance = await this.getBalance(address);
      
      // For now, return empty array - in production you'd query events
      // to find which specific tokens are owned
      return [];
    } catch (error) {
      console.error('Failed to get tokens by owner:', error);
      throw new Error(`Failed to get tokens by owner: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Listen for token events
  setupEventListeners(callbacks: {
    onTokenMinted?: (event: any) => void;
    onTokenRenewed?: (event: any) => void;
    onTokenBurned?: (event: any) => void;
    onLockStatusChanged?: (event: any) => void;
  }): void {
    const { onTokenMinted, onTokenRenewed, onTokenBurned, onLockStatusChanged } = callbacks;
    
    if (onTokenMinted) {
      this.ownershipToken.on('OwnershipTokenMinted', 
        (tokenId: ethers.BigNumber, registrarIanaId: ethers.BigNumber, to: string, sld: string, tld: string, expiresAt: ethers.BigNumber, correlationId: string) => {
          onTokenMinted({
            tokenId: tokenId.toString(),
            registrarIanaId: registrarIanaId.toString(),
            to,
            domain: `${sld}.${tld}`,
            expiresAt: new Date(expiresAt.toNumber() * 1000),
            correlationId
          });
        }
      );
    }
    
    if (onTokenRenewed) {
      this.ownershipToken.on('OwnershipTokenRenewed', 
        (tokenId: ethers.BigNumber, newExpiration: ethers.BigNumber) => {
          onTokenRenewed({
            tokenId: tokenId.toString(),
            newExpiration: new Date(newExpiration.toNumber() * 1000)
          });
        }
      );
    }
    
    if (onTokenBurned) {
      this.ownershipToken.on('OwnershipTokenBurned', 
        (tokenId: ethers.BigNumber) => {
          onTokenBurned({
            tokenId: tokenId.toString()
          });
        }
      );
    }
    
    if (onLockStatusChanged) {
      this.ownershipToken.on('LockStatusChanged', 
        (tokenId: ethers.BigNumber, isLocked: boolean) => {
          onLockStatusChanged({
            tokenId: tokenId.toString(),
            isLocked
          });
        }
      );
    }
  }

  // Remove event listeners
  removeEventListeners(): void {
    this.ownershipToken.removeAllListeners();
  }

  // Check if token exists
  async tokenExists(tokenId: number): Promise<boolean> {
    try {
      await this.getOwner(tokenId);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get token age (time since minting)
  async getTokenAge(tokenId: number): Promise<number> {
    try {
      const expiration = await this.getExpiration(tokenId);
      const now = Math.floor(Date.now() / 1000);
      
      // Assuming 1 year registration duration
      const registrationDuration = 365 * 24 * 60 * 60; // 1 year in seconds
      const mintTime = expiration - registrationDuration;
      
      return now - mintTime;
    } catch (error) {
      console.error('Failed to get token age:', error);
      throw new Error(`Failed to get token age: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
