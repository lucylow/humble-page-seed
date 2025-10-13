const logger = require('../utils/logger');

class StorageService {
  constructor() {
    this.pinataJWT = process.env.PINATA_JWT;
    this.pinataApiKey = process.env.PINATA_API_KEY;
    this.pinataSecretKey = process.env.PINATA_SECRET_KEY;
    this.pinataApiUrl = 'https://api.pinata.cloud';
  }

  /**
   * Upload JSON data to IPFS via Pinata
   * @param {Object} data - Data to upload
   * @param {string} name - Optional name for the upload
   * @returns {Promise<string>} IPFS hash
   */
  async uploadToIPFS(data, name = null) {
    try {
      logger.info('Uploading to IPFS', { dataSize: JSON.stringify(data).length });

      const metadata = {
        name: name || `invoice-${Date.now()}`,
        keyvalues: {
          type: 'invoice-document',
          timestamp: new Date().toISOString()
        }
      };

      const body = {
        pinataContent: data,
        pinataMetadata: metadata,
        pinataOptions: {
          cidVersion: 1
        }
      };

      const response = await fetch(`${this.pinataApiUrl}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.pinataJWT}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      logger.info('IPFS upload successful', { ipfsHash: result.IpfsHash });
      
      return result.IpfsHash;
    } catch (error) {
      logger.error('IPFS upload error', { error: error.message, stack: error.stack });
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  /**
   * Upload file to IPFS via Pinata
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} fileName - File name
   * @returns {Promise<string>} IPFS hash
   */
  async uploadFileToIPFS(fileBuffer, fileName) {
    try {
      logger.info('Uploading file to IPFS', { fileName, size: fileBuffer.length });

      const FormData = require('form-data');
      const formData = new FormData();
      
      formData.append('file', fileBuffer, fileName);
      
      const metadata = JSON.stringify({
        name: fileName,
        keyvalues: {
          type: 'invoice-attachment',
          timestamp: new Date().toISOString()
        }
      });
      formData.append('pinataMetadata', metadata);

      const response = await fetch(`${this.pinataApiUrl}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.pinataJWT}`,
          ...formData.getHeaders()
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata file upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      logger.info('File upload successful', { ipfsHash: result.IpfsHash, fileName });
      
      return result.IpfsHash;
    } catch (error) {
      logger.error('File upload error', { error: error.message });
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Retrieve data from IPFS
   * @param {string} ipfsHash - IPFS hash
   * @returns {Promise<Object>} Retrieved data
   */
  async retrieveFromIPFS(ipfsHash) {
    try {
      logger.info('Retrieving from IPFS', { ipfsHash });

      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      
      if (!response.ok) {
        throw new Error(`IPFS retrieval failed: ${response.status}`);
      }

      const data = await response.json();
      
      logger.info('IPFS retrieval successful', { ipfsHash });
      
      return data;
    } catch (error) {
      logger.error('IPFS retrieval error', { error: error.message, ipfsHash });
      throw new Error(`IPFS retrieval failed: ${error.message}`);
    }
  }

  /**
   * Pin existing IPFS hash to Pinata
   * @param {string} ipfsHash - IPFS hash to pin
   * @param {string} name - Optional name
   * @returns {Promise<Object>} Pin result
   */
  async pinByHash(ipfsHash, name = null) {
    try {
      logger.info('Pinning by hash', { ipfsHash });

      const body = {
        hashToPin: ipfsHash,
        pinataMetadata: {
          name: name || `pinned-${Date.now()}`
        }
      };

      const response = await fetch(`${this.pinataApiUrl}/pinning/pinByHash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.pinataJWT}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pin by hash failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      logger.info('Pin by hash successful', { ipfsHash });
      
      return result;
    } catch (error) {
      logger.error('Pin by hash error', { error: error.message });
      throw new Error(`Pin by hash failed: ${error.message}`);
    }
  }

  /**
   * Unpin data from Pinata
   * @param {string} ipfsHash - IPFS hash to unpin
   * @returns {Promise<boolean>} Success status
   */
  async unpinFromIPFS(ipfsHash) {
    try {
      logger.info('Unpinning from IPFS', { ipfsHash });

      const response = await fetch(`${this.pinataApiUrl}/pinning/unpin/${ipfsHash}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.pinataJWT}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Unpin failed: ${response.status} - ${errorText}`);
      }

      logger.info('Unpin successful', { ipfsHash });
      
      return true;
    } catch (error) {
      logger.error('Unpin error', { error: error.message });
      throw new Error(`Unpin failed: ${error.message}`);
    }
  }

  /**
   * List all pins for the account
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} List of pins
   */
  async listPins(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      const url = `${this.pinataApiUrl}/data/pinList?${queryParams}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.pinataJWT}`
        }
      });

      if (!response.ok) {
        throw new Error(`List pins failed: ${response.status}`);
      }

      const result = await response.json();
      
      return result.rows || [];
    } catch (error) {
      logger.error('List pins error', { error: error.message });
      throw new Error(`List pins failed: ${error.message}`);
    }
  }

  /**
   * Test Pinata connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.pinataApiUrl}/data/testAuthentication`, {
        headers: {
          'Authorization': `Bearer ${this.pinataJWT}`
        }
      });

      if (!response.ok) {
        throw new Error(`Authentication test failed: ${response.status}`);
      }

      const result = await response.json();
      logger.info('Pinata connection test successful', { result });
      
      return true;
    } catch (error) {
      logger.error('Pinata connection test failed', { error: error.message });
      return false;
    }
  }
}

module.exports = StorageService;

