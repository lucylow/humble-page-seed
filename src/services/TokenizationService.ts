// @ts-nocheck
// Tokenization Service for Doma Protocol
import { ethers, parseEther, formatEther } from 'ethers';
import { DomaContractService } from './DomaContractService';
import { DOMA_CONFIG, TokenizationVoucher, NameInfo } from '../config/domaConfig';

export class TokenizationService extends DomaContractService {
  constructor(network: keyof typeof DOMA_CONFIG.networks = 'ethereum') {
    super(network);
  }
  
  // Get tokenization voucher from API
  async getTokenizationVoucher(names: string[], ownerAddress: string): Promise<{
    voucher: TokenizationVoucher;
    signature: string;
    protocolFee: string;
  }> {
    try {
      const response = await fetch(`${DOMA_CONFIG.api.voucher}/tokenization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          names: names.map(name => ({ name })),
          ownerAddress,
          network: this.networkConfig.chainId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get tokenization voucher: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        voucher: {
          names: data.names as NameInfo[],
          nonce: data.nonce,
          expiresAt: data.expiresAt,
          ownerAddress: data.ownerAddress
        },
        signature: data.signature,
        protocolFee: data.protocolFee || DOMA_CONFIG.protocolFees.tokenization
      };
    } catch (error) {
      console.error('Error getting tokenization voucher:', error);
      throw new Error(`Failed to get tokenization voucher: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Request domain tokenization
  async requestTokenization(domainNames: string[]): Promise<{
    transactionHash: string;
    tokenId?: string;
    voucher: TokenizationVoucher;
  }> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const ownerAddress = await this.getAddress();
      
      // Get voucher from Doma API
      const voucherData = await this.getTokenizationVoucher(domainNames, ownerAddress);
      
      // Estimate gas and protocol fees
      const gasEstimate = await this.estimateGas(
        'requestTokenization',
        [voucherData.voucher, voucherData.signature],
        voucherData.protocolFee
      );
      
      // Execute tokenization
      const tx = await this.proxyDomaRecord.requestTokenization(
        voucherData.voucher,
        voucherData.signature,
        {
          value: parseEther(voucherData.protocolFee),
          gasLimit: gasEstimate.mul(12).div(10) // 20% buffer
        }
      );
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Parse events to get token ID
      const mintEvent = receipt.events?.find(
        (e: any) => e.event === 'OwnershipTokenMinted'
      );
      
      return {
        transactionHash: receipt.transactionHash,
        tokenId: mintEvent?.args?.tokenId?.toString(),
        voucher: voucherData.voucher
      };
    } catch (error) {
      console.error('Tokenization request failed:', error);
      throw new Error(`Tokenization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Validate domain names
  validateDomainNames(domainNames: string[]): { valid: string[]; invalid: string[] } {
    const valid: string[] = [];
    const invalid: string[] = [];

    domainNames.forEach(domain => {
      if (this.isValidDomainName(domain)) {
        valid.push(domain);
      } else {
        invalid.push(domain);
      }
    });

    return { valid, invalid };
  }

  // Check if domain name is valid
  private isValidDomainName(domainName: string): boolean {
    // Basic domain validation
    const domainRegex = /^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?)*$/i;
    return domainRegex.test(domainName) && domainName.length <= 253;
  }

  // Calculate estimated costs
  async calculateTokenizationCost(domainNames: string[]): Promise<{
    protocolFee: string;
    gasEstimate: string;
    totalCost: string;
  }> {
    try {
      const ownerAddress = await this.getAddress();
      const voucherData = await this.getTokenizationVoucher(domainNames, ownerAddress);
      
      const gasEstimate = await this.estimateGas(
        'requestTokenization',
        [voucherData.voucher, voucherData.signature],
        voucherData.protocolFee
      );

      const gasPrice = await this.provider.getGasPrice();
      const gasCost = gasEstimate.mul(gasPrice);
      const protocolFeeWei = parseEther(voucherData.protocolFee);
      const totalCost = gasCost.add(protocolFeeWei);

      return {
        protocolFee: voucherData.protocolFee,
        gasEstimate: formatEther(gasCost),
        totalCost: formatEther(totalCost)
      };
    } catch (error) {
      console.error('Error calculating tokenization cost:', error);
      throw new Error(`Failed to calculate cost: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
