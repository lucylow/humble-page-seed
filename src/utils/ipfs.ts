/**
 * IPFS utilities for metadata storage and retrieval
 * Handles uploading domain metadata to IPFS and fetching it back
 */

export interface DomainMetadata {
  name: string;
  description?: string;
  image?: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties?: {
    [key: string]: unknown;
  };
  animation_url?: string;
  background_color?: string;
  youtube_url?: string;
}

export interface IPFSUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface IPFSError {
  error: {
    reason: string;
    details: string;
  };
}

/**
 * Fetch data from IPFS using various gateways
 * @param cid - IPFS content identifier
 * @param gateway - IPFS gateway URL (optional)
 * @returns Promise<DomainMetadata | null>
 */
export const fetchIPFSData = async (
  cid: string, 
  gateway?: string
): Promise<DomainMetadata | null> => {
  const gateways = gateway ? [gateway] : [
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/'
  ];

  for (const gatewayUrl of gateways) {
    try {
      const response = await fetch(`${gatewayUrl}${cid}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const data = await response.json();
        return data as DomainMetadata;
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${gatewayUrl}:`, error);
      continue;
    }
  }

  console.error('All IPFS gateways failed to fetch data for CID:', cid);
  return null;
};

/**
 * Upload metadata to IPFS using Pinata
 * @param metadata - Domain metadata to upload
 * @param apiKey - Pinata API key
 * @param secretKey - Pinata secret key
 * @returns Promise<string | null> - IPFS hash or null if failed
 */
export const uploadToIPFS = async (
  metadata: DomainMetadata,
  apiKey?: string,
  secretKey?: string
): Promise<string | null> => {
  const pinataApiKey = apiKey;
  const pinataSecretKey = secretKey;

  if (!pinataApiKey || !pinataSecretKey) {
    console.error('Pinata API credentials not provided');
    return null;
  }

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretKey,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `domain-${metadata.name}-metadata`,
          keyvalues: {
            type: 'domain-metadata',
            domain: metadata.name,
            timestamp: new Date().toISOString()
          }
        },
        pinataOptions: {
          cidVersion: 1
        }
      })
    });

    if (!response.ok) {
      const errorData: IPFSError = await response.json();
      throw new Error(`Pinata API error: ${errorData.error.reason}`);
    }

    const data: IPFSUploadResponse = await response.json();
    return data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return null;
  }
};

/**
 * Upload image to IPFS using Pinata
 * @param file - Image file to upload
 * @param apiKey - Pinata API key
 * @param secretKey - Pinata secret key
 * @returns Promise<string | null> - IPFS hash or null if failed
 */
export const uploadImageToIPFS = async (
  file: File,
  apiKey?: string,
  secretKey?: string
): Promise<string | null> => {
  const pinataApiKey = apiKey;
  const pinataSecretKey = secretKey;

  if (!pinataApiKey || !pinataSecretKey) {
    console.error('Pinata API credentials not provided');
    return null;
  }

  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({
    name: `domain-image-${file.name}`,
    keyvalues: {
      type: 'domain-image',
      timestamp: new Date().toISOString()
    }
  });

  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({
    cidVersion: 1
  });

  formData.append('pinataOptions', options);

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretKey,
      },
      body: formData
    });

    if (!response.ok) {
      const errorData: IPFSError = await response.json();
      throw new Error(`Pinata API error: ${errorData.error.reason}`);
    }

    const data: IPFSUploadResponse = await response.json();
    return data.IpfsHash;
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    return null;
  }
};

/**
 * Generate a placeholder image URL for domains
 * @param domainName - Domain name
 * @param size - Image size (width x height)
 * @returns Generated placeholder URL
 */
export const generatePlaceholderImage = (
  domainName: string, 
  size: string = '400x200'
): string => {
  const encodedName = encodeURIComponent(domainName);
  return `https://via.placeholder.com/${size}/6366f1/ffffff?text=${encodedName}`;
};

/**
 * Validate IPFS CID format
 * @param cid - IPFS content identifier
 * @returns boolean indicating if CID is valid
 */
export const isValidCID = (cid: string): boolean => {
  // Basic CID validation - should start with 'Qm' or 'bafy'
  const cidRegex = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z0-9]{50,})$/;
  return cidRegex.test(cid);
};

/**
 * Extract CID from IPFS URL
 * @param url - IPFS URL
 * @returns CID string or null if not found
 */
export const extractCIDFromURL = (url: string): string | null => {
  const cidMatch = url.match(/(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z0-9]{50,})/);
  return cidMatch ? cidMatch[0] : null;
};

/**
 * Convert IPFS URL to different gateway
 * @param ipfsUrl - Original IPFS URL
 * @param gateway - Target gateway URL
 * @returns New IPFS URL with different gateway
 */
export const convertIPFSGateway = (ipfsUrl: string, gateway: string): string => {
  const cid = extractCIDFromURL(ipfsUrl);
  if (!cid) return ipfsUrl;
  
  return `${gateway}${cid}`;
};

/**
 * Get the best available IPFS gateway
 * @returns Promise<string | null> - Best gateway URL or null if none available
 */
export const getBestIPFSGateway = async (): Promise<string | null> => {
  const gateways = [
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/'
  ];

  // Test each gateway with a small request
  for (const gateway of gateways) {
    try {
      const response = await fetch(`${gateway}QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        return gateway;
      }
    } catch (error) {
      continue;
    }
  }

  return null;
};

/**
 * Create domain metadata object
 * @param domainName - Domain name
 * @param description - Domain description
 * @param imageUrl - Domain image URL
 * @param attributes - Domain attributes
 * @returns DomainMetadata object
 */
export const createDomainMetadata = (
  domainName: string,
  description?: string,
  imageUrl?: string,
  attributes?: Array<{ trait_type: string; value: string | number }>
): DomainMetadata => {
  return {
    name: domainName,
    description: description || `Premium domain ${domainName} available on DomaLand.AI`,
    image: imageUrl || generatePlaceholderImage(domainName),
    external_url: `https://domaland.ai/domain/${domainName}`,
    attributes: attributes || [
      { trait_type: 'Length', value: domainName.length },
      { trait_type: 'TLD', value: domainName.split('.').pop() || 'unknown' },
      { trait_type: 'Category', value: 'Premium' }
    ],
    properties: {
      domain: domainName,
      platform: 'DomaLand.AI',
      created_at: new Date().toISOString()
    }
  };
};


