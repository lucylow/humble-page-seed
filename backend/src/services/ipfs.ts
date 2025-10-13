import axios from 'axios';
import { config } from '../config';
import { Logger } from '../utils/logger';

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export class IPFSService {
  private logger: Logger;
  private pinataApiUrl = 'https://api.pinata.cloud';

  constructor() {
    this.logger = new Logger('IPFSService');
  }

  public async storeJSON(data: any): Promise<string> {
    try {
      this.logger.info('Storing JSON on IPFS via Pinata', {
        dataSize: JSON.stringify(data).length
      });

      const response = await axios.post<PinataResponse>(
        `${this.pinataApiUrl}/pinning/pinJSONToIPFS`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': config.ipfs.pinata.apiKey,
            'pinata_secret_api_key': config.ipfs.pinata.secretKey
          }
        }
      );

      this.logger.info('JSON stored on IPFS successfully', {
        hash: response.data.IpfsHash,
        size: response.data.PinSize
      });

      return response.data.IpfsHash;
    } catch (error) {
      this.logger.error('Failed to store JSON on IPFS', { error });
      throw new Error(`IPFS storage failed: ${error.message}`);
    }
  }

  public async storeFile(file: Buffer, filename: string): Promise<string> {
    try {
      this.logger.info('Storing file on IPFS via Pinata', {
        filename,
        size: file.length
      });

      const formData = new FormData();
      formData.append('file', new Blob([file]), filename);

      const response = await axios.post<PinataResponse>(
        `${this.pinataApiUrl}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            'pinata_api_key': config.ipfs.pinata.apiKey,
            'pinata_secret_api_key': config.ipfs.pinata.secretKey
          }
        }
      );

      this.logger.info('File stored on IPFS successfully', {
        hash: response.data.IpfsHash,
        size: response.data.PinSize
      });

      return response.data.IpfsHash;
    } catch (error) {
      this.logger.error('Failed to store file on IPFS', { error, filename });
      throw new Error(`IPFS file storage failed: ${error.message}`);
    }
  }

  public async retrieveJSON(hash: string): Promise<any> {
    try {
      const url = `${config.ipfs.pinata.gateway}/ipfs/${hash}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to retrieve JSON from IPFS', { error, hash });
      throw new Error(`IPFS retrieval failed: ${error.message}`);
    }
  }

  public getGatewayUrl(hash: string): string {
    return `${config.ipfs.pinata.gateway}/ipfs/${hash}`;
  }
}

