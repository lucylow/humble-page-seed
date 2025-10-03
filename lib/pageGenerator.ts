import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

interface DomainMetadata {
  name: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

export class PageGenerator {
  private provider: ethers.Provider;
  private domaDomainContract: string;
  private domaMarketplaceContract: string;
  private offerFactoryContract: string;

  constructor(
    rpcUrl: string,
    domaDomainContract: string,
    domaMarketplaceContract: string,
    offerFactoryContract: string
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.domaDomainContract = domaDomainContract;
    this.domaMarketplaceContract = domaMarketplaceContract;
    this.offerFactoryContract = offerFactoryContract;
  }

  async processGenerationQueue() {
    console.log('Processing page generation queue...');

    const pendingItems = await prisma.pageGenerationQueue.findMany({
      where: {
        status: 'PENDING',
        attempts: {
          lt: 3, // Max 3 attempts
        },
      },
      take: 10, // Process 10 items at a time
    });

    console.log(`Found ${pendingItems.length} items to process`);

    for (const item of pendingItems) {
      try {
        await this.processQueueItem(item);
      } catch (error) {
        console.error(`Error processing queue item ${item.id}:`, error);
        await this.markQueueItemFailed(item.id, error.message);
      }
    }
  }

  private async processQueueItem(item: Record<string, unknown>) {
    console.log(`Processing queue item: ${item.tokenId}`);

    // Mark as processing
    await prisma.pageGenerationQueue.update({
      where: { id: item.id },
      data: { 
        status: 'PROCESSING',
        attempts: item.attempts + 1,
      },
    });

    try {
      // Fetch domain metadata
      const metadata = await this.fetchDomainMetadata(item.tokenId, item.contractAddress);
      
      // Fetch marketplace listing
      const listing = await this.fetchMarketplaceListing(item.tokenId, item.contractAddress);
      
      // Fetch active offers
      const offers = await this.fetchActiveOffers(item.tokenId, item.contractAddress);

      // Update domain record with fetched data
      await prisma.domain.update({
        where: { tokenId: item.tokenId },
        data: {
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          metadataUri: `ipfs://${metadata.image}`,
          isListed: listing.isListed,
          listingPrice: listing.price,
        },
      });

      // Generate static page (in a real implementation, this would generate actual HTML files)
      await this.generateStaticPage(item.tokenId, metadata, listing, offers);

      // Mark as completed
      await prisma.pageGenerationQueue.update({
        where: { id: item.id },
        data: { status: 'COMPLETED' },
      });

      console.log(`Successfully processed domain ${item.tokenId}`);

    } catch (error) {
      console.error(`Error processing domain ${item.tokenId}:`, error);
      throw error;
    }
  }

  private async fetchDomainMetadata(tokenId: string, contractAddress: string): Promise<DomainMetadata> {
    try {
      // Create contract instance
      const contract = new ethers.Contract(
        contractAddress,
        ['function tokenURI(uint256) view returns (string)'],
        this.provider
      );

      // Get token URI
      const tokenURI = await contract.tokenURI(tokenId);
      
      // Fetch metadata from IPFS
      const metadataUrl = this.resolveIPFSUrl(tokenURI);
      const response = await axios.get(metadataUrl);
      
      return response.data as DomainMetadata;

    } catch (error) {
      console.error(`Error fetching metadata for token ${tokenId}:`, error);
      
      // Return default metadata if fetch fails
      return {
        name: `Domain #${tokenId}`,
        description: 'A tokenized domain on the Doma protocol',
        image: '/placeholder-domain.png',
      };
    }
  }

  private async fetchMarketplaceListing(tokenId: string, contractAddress: string) {
    try {
      // Create marketplace contract instance
      const marketplaceContract = new ethers.Contract(
        this.domaMarketplaceContract,
        [
          'function getListing(address nftContract, uint256 tokenId) view returns (bool isListed, uint256 price, address seller)',
        ],
        this.provider
      );

      const listing = await marketplaceContract.getListing(contractAddress, tokenId);
      
      return {
        isListed: listing.isListed,
        price: listing.price.toString(),
        seller: listing.seller,
      };

    } catch (error) {
      console.error(`Error fetching marketplace listing for token ${tokenId}:`, error);
      
      return {
        isListed: false,
        price: null,
        seller: null,
      };
    }
  }

  private async fetchActiveOffers(tokenId: string, contractAddress: string) {
    try {
      // Create offer factory contract instance
      const offerFactoryContract = new ethers.Contract(
        this.offerFactoryContract,
        [
          'function getOffersForToken(address nftContract, uint256 tokenId) view returns (uint256[])',
          'function getOffer(uint256 offerId) view returns (tuple(uint256 offerId, address nftContract, uint256 tokenId, address buyer, address tokenAddress, uint256 amount, uint256 expiresAt, bool isActive))',
        ],
        this.provider
      );

      const offerIds = await offerFactoryContract.getOffersForToken(contractAddress, tokenId);
      
      const offers = [];
      for (const offerId of offerIds) {
        const offer = await offerFactoryContract.getOffer(offerId);
        if (offer.isActive && offer.expiresAt > Math.floor(Date.now() / 1000)) {
          offers.push({
            offerId: offer.offerId.toString(),
            buyer: offer.buyer,
            amount: offer.amount.toString(),
            tokenAddress: offer.tokenAddress,
            expiresAt: new Date(offer.expiresAt * 1000),
          });
        }
      }

      return offers;

    } catch (error) {
      console.error(`Error fetching offers for token ${tokenId}:`, error);
      return [];
    }
  }

  private async generateStaticPage(
    tokenId: string,
    metadata: DomainMetadata,
    listing: Record<string, unknown>,
    offers: Record<string, unknown>[]
  ) {
    // In a real implementation, this would generate actual HTML files
    // For now, we'll just log the page data
    console.log(`Generated page for domain ${tokenId}:`, {
      metadata,
      listing,
      offers: offers.length,
    });

    // You could also generate a React component and render it to HTML
    // or use Next.js's static generation features
  }

  private resolveIPFSUrl(uri: string): string {
    if (uri.startsWith('ipfs://')) {
      const hash = uri.replace('ipfs://', '');
      return `https://gateway.pinata.cloud/ipfs/${hash}`;
    }
    return uri;
  }

  private async markQueueItemFailed(itemId: string, errorMessage: string) {
    await prisma.pageGenerationQueue.update({
      where: { id: itemId },
      data: {
        status: 'FAILED',
        errorMessage: errorMessage,
      },
    });
  }
}

// Export a singleton instance
export const pageGenerator = new PageGenerator(
  process.env.DOMA_RPC_URL || 'https://rpc.doma-testnet.xyz',
  process.env.DOMA_DOMAIN_NFT_CONTRACT || '0x...',
  process.env.DOMA_MARKETPLACE_CONTRACT || '0x...',
  process.env.OFFER_FACTORY_CONTRACT || '0x...'
);
