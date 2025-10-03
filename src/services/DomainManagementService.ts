// @ts-nocheck
// Domain Management Service for Doma Protocol
import { ethers, parseEther, formatEther } from 'ethers';
import { DomaContractService } from './DomaContractService';
import { DOMA_CONFIG, ProofOfContactsVoucher } from '../config/domaConfig';

export class DomainManagementService extends DomaContractService {
  constructor(network: keyof typeof DOMA_CONFIG.networks = 'ethereum') {
    super(network);
  }
  
  // Get proof of contacts voucher
  async getProofOfContactsVoucher(tokenId: number): Promise<{
    voucher: ProofOfContactsVoucher;
    signature: string;
    protocolFee: string;
  }> {
    try {
      const response = await fetch(`${DOMA_CONFIG.api.voucher}/proof-of-contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId,
          ownerAddress: await this.getAddress(),
          network: this.networkConfig.chainId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get proof of contacts voucher: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        voucher: {
          registrantHandle: data.registrantHandle,
          proofSource: data.proofSource,
          nonce: data.nonce,
          expiresAt: data.expiresAt
        },
        signature: data.signature,
        protocolFee: data.protocolFee || DOMA_CONFIG.protocolFees.claim
      };
    } catch (error) {
      console.error('Error getting proof of contacts voucher:', error);
      throw new Error(`Failed to get proof of contacts voucher: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Claim domain ownership
  async claimOwnership(tokenId: number, isSynthetic = false): Promise<{
    transactionHash: string;
    success: boolean;
  }> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const voucherData = await this.getProofOfContactsVoucher(tokenId);
      
      const gasEstimate = await this.estimateGas(
        'claimOwnership',
        [tokenId, isSynthetic, voucherData.voucher, voucherData.signature],
        voucherData.protocolFee
      );
      
      const tx = await this.proxyDomaRecord.claimOwnership(
        tokenId,
        isSynthetic,
        voucherData.voucher,
        voucherData.signature,
        {
          value: parseEther(voucherData.protocolFee),
          gasLimit: gasEstimate.mul(12).div(10)
        }
      );
      
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.transactionHash,
        success: receipt.status === 1
      };
    } catch (error) {
      console.error('Ownership claim failed:', error);
      throw new Error(`Ownership claim failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Bridge domain to another chain
  async bridgeDomain(
    tokenId: number, 
    targetChainId: string, 
    targetOwnerAddress: string, 
    isSynthetic = false
  ): Promise<{
    transactionHash: string;
    success: boolean;
  }> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // Get bridge fees from API
      const feesResponse = await fetch(`${DOMA_CONFIG.api.bridge}/fees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId,
          sourceChain: this.networkConfig.chainId,
          targetChain: targetChainId
        })
      });
      
      if (!feesResponse.ok) {
        throw new Error(`Failed to get bridge fees: ${feesResponse.statusText}`);
      }
      
      const fees = await feesResponse.json();
      
      const gasEstimate = await this.estimateGas(
        'bridge',
        [tokenId, isSynthetic, targetChainId, targetOwnerAddress],
        fees.protocolFee || DOMA_CONFIG.protocolFees.bridge
      );
      
      const tx = await this.proxyDomaRecord.bridge(
        tokenId,
        isSynthetic,
        targetChainId,
        targetOwnerAddress,
        {
          value: parseEther(fees.protocolFee || DOMA_CONFIG.protocolFees.bridge),
          gasLimit: gasEstimate.mul(12).div(10)
        }
      );
      
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.transactionHash,
        success: receipt.status === 1
      };
    } catch (error) {
      console.error('Domain bridging failed:', error);
      throw new Error(`Domain bridging failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Request detokenization
  async requestDetokenization(tokenId: number, isSynthetic = false): Promise<{
    transactionHash: string;
    success: boolean;
  }> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const tx = await this.proxyDomaRecord.requestDetokenization(
        tokenId,
        isSynthetic
      );
      
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.transactionHash,
        success: receipt.status === 1
      };
    } catch (error) {
      console.error('Detokenization request failed:', error);
      throw new Error(`Detokenization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get supported target chains for bridging
  async getSupportedChains(): Promise<Array<{
    chainId: string;
    name: string;
    isActive: boolean;
  }>> {
    try {
      const response = await fetch(`${DOMA_CONFIG.api.bridge}/supported-chains`);
      
      if (!response.ok) {
        throw new Error(`Failed to get supported chains: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting supported chains:', error);
      // Return default chains if API fails
      return [
        { chainId: 'eip155:1', name: 'Ethereum', isActive: true },
        { chainId: 'eip155:137', name: 'Polygon', isActive: true },
        { chainId: 'eip155:56', name: 'BSC', isActive: true }
      ];
    }
  }

  // Calculate bridge costs
  async calculateBridgeCost(
    tokenId: number, 
    targetChainId: string
  ): Promise<{
    protocolFee: string;
    gasEstimate: string;
    totalCost: string;
  }> {
    try {
      const feesResponse = await fetch(`${DOMA_CONFIG.api.bridge}/fees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId,
          sourceChain: this.networkConfig.chainId,
          targetChain: targetChainId
        })
      });
      
      if (!feesResponse.ok) {
        throw new Error(`Failed to get bridge fees: ${feesResponse.statusText}`);
      }
      
      const fees = await feesResponse.json();
      const protocolFee = fees.protocolFee || DOMA_CONFIG.protocolFees.bridge;
      
      const gasEstimate = await this.estimateGas(
        'bridge',
        [tokenId, false, targetChainId, await this.getAddress()],
        protocolFee
      );

      const gasPrice = await this.provider.getGasPrice();
      const gasCost = gasEstimate.mul(gasPrice);
      const protocolFeeWei = parseEther(protocolFee);
      const totalCost = gasCost.add(protocolFeeWei);

      return {
        protocolFee,
        gasEstimate: formatEther(gasCost),
        totalCost: formatEther(totalCost)
      };
    } catch (error) {
      console.error('Error calculating bridge cost:', error);
      throw new Error(`Failed to calculate bridge cost: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
