import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DomainMintEvent {
  tokenId: string;
  contractAddress: string;
  to: string;
  blockNumber: number;
  transactionHash: string;
}

export class DomainEventListener {
  private provider: ethers.Provider;
  private domaDomainContract: string;
  private isListening: boolean = false;
  private lastProcessedBlock: number = 0;

  constructor(rpcUrl: string, domaDomainContract: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.domaDomainContract = domaDomainContract;
  }

  async startListening() {
    if (this.isListening) {
      console.log('Event listener is already running');
      return;
    }

    this.isListening = true;
    console.log('Starting domain event listener...');

    // Get the last processed block from database or start from current block
    const lastProcessed = await this.getLastProcessedBlock();
    this.lastProcessedBlock = lastProcessed;

    // Set up event filter for Transfer events where from is zero address (mint)
    const filter = {
      address: this.domaDomainContract,
      topics: [
        ethers.id('Transfer(address,address,uint256)'), // Transfer event signature
        '0x0000000000000000000000000000000000000000000000000000000000000000', // from = zero address (mint)
      ],
      fromBlock: this.lastProcessedBlock + 1,
    };

    // Listen for new events
    this.provider.on(filter, async (log) => {
      try {
        await this.processMintEvent(log);
      } catch (error) {
        console.error('Error processing mint event:', error);
      }
    });

    // Also poll for missed events every 30 seconds
    setInterval(async () => {
      try {
        await this.pollForMissedEvents();
      } catch (error) {
        console.error('Error polling for missed events:', error);
      }
    }, 30000);

    console.log('Event listener started successfully');
  }

  async stopListening() {
    this.isListening = false;
    this.provider.removeAllListeners();
    console.log('Event listener stopped');
  }

  private async processMintEvent(log: ethers.Log) {
    try {
      // Parse the Transfer event
      const iface = new ethers.Interface([
        'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
      ]);
      
      const parsedLog = iface.parseLog({
        topics: log.topics,
        data: log.data,
      });

      if (!parsedLog) {
        console.log('Could not parse log:', log);
        return;
      }

      const tokenId = parsedLog.args.tokenId.toString();
      const to = parsedLog.args.to;

      console.log(`New domain minted: Token ID ${tokenId} to ${to}`);

      // Add to page generation queue
      await this.addToGenerationQueue(tokenId, log.address, to, log.blockNumber, log.transactionHash);

      // Update last processed block
      this.lastProcessedBlock = log.blockNumber;
      await this.updateLastProcessedBlock(log.blockNumber);

    } catch (error) {
      console.error('Error processing mint event:', error);
    }
  }

  private async addToGenerationQueue(
    tokenId: string,
    contractAddress: string,
    owner: string,
    blockNumber: number,
    transactionHash: string
  ) {
    try {
      // Check if already in queue
      const existing = await prisma.pageGenerationQueue.findFirst({
        where: {
          tokenId: tokenId,
          contractAddress: contractAddress,
        },
      });

      if (existing) {
        console.log(`Token ${tokenId} already in generation queue`);
        return;
      }

      // Add to queue
      await prisma.pageGenerationQueue.create({
        data: {
          tokenId: tokenId,
          contractAddress: contractAddress,
          status: 'PENDING',
          attempts: 0,
          maxAttempts: 3,
        },
      });

      console.log(`Added token ${tokenId} to page generation queue`);

      // Also create domain record
      await this.createDomainRecord(tokenId, contractAddress, owner, blockNumber, transactionHash);

    } catch (error) {
      console.error('Error adding to generation queue:', error);
    }
  }

  private async createDomainRecord(
    tokenId: string,
    contractAddress: string,
    owner: string,
    blockNumber: number,
    transactionHash: string
  ) {
    try {
      // Check if domain already exists
      const existing = await prisma.domain.findUnique({
        where: { tokenId: tokenId },
      });

      if (existing) {
        console.log(`Domain ${tokenId} already exists in database`);
        return;
      }

      // Create domain record
      await prisma.domain.create({
        data: {
          tokenId: tokenId,
          contractAddress: contractAddress,
          name: `Domain #${tokenId}`, // Will be updated when metadata is fetched
          owner: owner,
          isListed: false,
        },
      });

      console.log(`Created domain record for token ${tokenId}`);

    } catch (error) {
      console.error('Error creating domain record:', error);
    }
  }

  private async pollForMissedEvents() {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      
      if (currentBlock <= this.lastProcessedBlock) {
        return;
      }

      console.log(`Polling for missed events from block ${this.lastProcessedBlock + 1} to ${currentBlock}`);

      const filter = {
        address: this.domaDomainContract,
        topics: [
          ethers.id('Transfer(address,address,uint256)'),
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        ],
        fromBlock: this.lastProcessedBlock + 1,
        toBlock: currentBlock,
      };

      const logs = await this.provider.getLogs(filter);

      for (const log of logs) {
        await this.processMintEvent(log);
      }

    } catch (error) {
      console.error('Error polling for missed events:', error);
    }
  }

  private async getLastProcessedBlock(): Promise<number> {
    try {
      // In a real implementation, you'd store this in the database
      // For now, we'll start from a recent block
      const currentBlock = await this.provider.getBlockNumber();
      return Math.max(0, currentBlock - 1000); // Start from 1000 blocks ago
    } catch (error) {
      console.error('Error getting last processed block:', error);
      return 0;
    }
  }

  private async updateLastProcessedBlock(blockNumber: number) {
    try {
      // In a real implementation, you'd store this in the database
      console.log(`Updated last processed block to ${blockNumber}`);
    } catch (error) {
      console.error('Error updating last processed block:', error);
    }
  }
}

// Export a singleton instance
export const domainEventListener = new DomainEventListener(
  process.env.DOMA_RPC_URL || 'https://rpc.doma-testnet.xyz',
  process.env.DOMA_DOMAIN_NFT_CONTRACT || '0x...'
);

