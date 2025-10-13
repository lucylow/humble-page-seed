const {
  makeContractDeploy,
  makeContractCall,
  broadcastTransaction,
  makeSTXTokenTransfer,
  AnchorMode,
  PostConditionMode,
  standardPrincipalCV,
  uintCV,
  stringAsciiCV,
  bufferCV,
  tupleCV,
  listCV
} = require('@stacks/transactions');
const { StacksTestnet, StacksMainnet } = require('@stacks/network');
const logger = require('../utils/logger');

class ContractService {
  constructor() {
    this.network = process.env.STACKS_NETWORK === 'mainnet' 
      ? new StacksMainnet() 
      : new StacksTestnet();
    
    this.apiUrl = process.env.STACKS_NODE_URL || 'https://stacks-node-api.testnet.stacks.co';
    
    logger.info('Contract service initialized', {
      network: process.env.STACKS_NETWORK || 'testnet',
      apiUrl: this.apiUrl
    });
  }

  /**
   * Deploy invoice smart contract to Stacks blockchain
   * @param {string} contractCode - Clarity contract code
   * @param {Object} invoiceData - Invoice metadata
   * @param {string} deployerKey - Deployer private key
   * @returns {Promise<Object>} Deployment result with txId and contract address
   */
  async deployInvoiceContract(contractCode, invoiceData, deployerKey) {
    try {
      const contractName = `invoice-${Date.now()}`;
      
      logger.info('Deploying contract', { contractName });

      const transaction = await makeContractDeploy({
        contractName,
        codeBody: contractCode,
        senderKey: deployerKey || process.env.DEPLOYER_PRIVATE_KEY,
        network: this.network,
        anchorMode: AnchorMode.Any,
        fee: 10000, // 0.01 STX
        postConditionMode: PostConditionMode.Allow,
        nonce: await this.getNonce(deployerKey)
      });

      const result = await broadcastTransaction(transaction, this.network);
      
      if (result.error) {
        logger.error('Contract deployment failed', { error: result });
        throw new Error(`Contract deployment failed: ${result.error} - ${result.reason}`);
      }

      const contractAddress = this.getContractAddress(deployerKey);
      
      logger.info('Contract deployed successfully', {
        txId: result.txid,
        contractAddress,
        contractName
      });

      return {
        txId: result.txid,
        contractAddress,
        contractName,
        fullContractId: `${contractAddress}.${contractName}`
      };
    } catch (error) {
      logger.error('Contract deployment error', {
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Contract deployment error: ${error.message}`);
    }
  }

  /**
   * Lock funds in escrow contract
   * @param {string} contractAddress - Contract address
   * @param {string} contractName - Contract name
   * @param {number} amount - Amount in sats
   * @param {string} userKey - User's private key
   * @returns {Promise<Object>} Transaction result
   */
  async lockFunds(contractAddress, contractName, amount, userKey) {
    try {
      logger.info('Locking funds', { contractAddress, contractName, amount });

      const functionArgs = [
        uintCV(amount)
      ];

      const transaction = await makeContractCall({
        contractAddress,
        contractName,
        functionName: 'lock-funds',
        functionArgs,
        senderKey: userKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 5000,
        nonce: await this.getNonce(userKey)
      });

      const result = await broadcastTransaction(transaction, this.network);
      
      if (result.error) {
        throw new Error(`Lock funds failed: ${result.error}`);
      }

      logger.info('Funds locked successfully', { txId: result.txid });

      return {
        txId: result.txid,
        amount,
        status: 'pending'
      };
    } catch (error) {
      logger.error('Lock funds error', { error: error.message });
      throw new Error(`Lock funds error: ${error.message}`);
    }
  }

  /**
   * Release milestone payment
   * @param {string} contractAddress - Contract address
   * @param {string} contractName - Contract name
   * @param {number} milestoneSequence - Milestone sequence number
   * @param {string} clientKey - Client's private key
   * @returns {Promise<Object>} Transaction result
   */
  async releaseMilestone(contractAddress, contractName, milestoneSequence, clientKey) {
    try {
      logger.info('Releasing milestone', { contractAddress, contractName, milestoneSequence });

      const functionArgs = [
        uintCV(milestoneSequence)
      ];

      const transaction = await makeContractCall({
        contractAddress,
        contractName,
        functionName: 'release-milestone',
        functionArgs,
        senderKey: clientKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 5000,
        nonce: await this.getNonce(clientKey)
      });

      const result = await broadcastTransaction(transaction, this.network);
      
      if (result.error) {
        throw new Error(`Release milestone failed: ${result.error}`);
      }

      logger.info('Milestone released successfully', { txId: result.txid });

      return {
        txId: result.txid,
        milestoneSequence,
        status: 'pending'
      };
    } catch (error) {
      logger.error('Release milestone error', { error: error.message });
      throw new Error(`Release milestone error: ${error.message}`);
    }
  }

  /**
   * Raise a dispute
   * @param {string} contractAddress - Contract address
   * @param {string} contractName - Contract name
   * @param {string} reason - Dispute reason
   * @param {string} userKey - User's private key
   * @returns {Promise<Object>} Transaction result
   */
  async raiseDispute(contractAddress, contractName, reason, userKey) {
    try {
      logger.info('Raising dispute', { contractAddress, contractName });

      const functionArgs = [
        stringAsciiCV(reason.substring(0, 256)) // Limit to 256 chars for Clarity
      ];

      const transaction = await makeContractCall({
        contractAddress,
        contractName,
        functionName: 'raise-dispute',
        functionArgs,
        senderKey: userKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 5000,
        nonce: await this.getNonce(userKey)
      });

      const result = await broadcastTransaction(transaction, this.network);
      
      if (result.error) {
        throw new Error(`Raise dispute failed: ${result.error}`);
      }

      logger.info('Dispute raised successfully', { txId: result.txid });

      return {
        txId: result.txid,
        status: 'pending'
      };
    } catch (error) {
      logger.error('Raise dispute error', { error: error.message });
      throw new Error(`Raise dispute error: ${error.message}`);
    }
  }

  /**
   * Resolve dispute (arbitrator only)
   * @param {string} contractAddress - Contract address
   * @param {string} contractName - Contract name
   * @param {boolean} favorClient - True if favoring client, false for contractor
   * @param {string} arbitratorKey - Arbitrator's private key
   * @returns {Promise<Object>} Transaction result
   */
  async resolveDispute(contractAddress, contractName, favorClient, arbitratorKey) {
    try {
      logger.info('Resolving dispute', { contractAddress, contractName, favorClient });

      const functionArgs = [
        uintCV(favorClient ? 1 : 0)
      ];

      const transaction = await makeContractCall({
        contractAddress,
        contractName,
        functionName: 'resolve-dispute',
        functionArgs,
        senderKey: arbitratorKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 5000,
        nonce: await this.getNonce(arbitratorKey)
      });

      const result = await broadcastTransaction(transaction, this.network);
      
      if (result.error) {
        throw new Error(`Resolve dispute failed: ${result.error}`);
      }

      logger.info('Dispute resolved successfully', { txId: result.txid });

      return {
        txId: result.txid,
        favorClient,
        status: 'pending'
      };
    } catch (error) {
      logger.error('Resolve dispute error', { error: error.message });
      throw new Error(`Resolve dispute error: ${error.message}`);
    }
  }

  /**
   * Get contract address from private key
   * @param {string} privateKey - Private key
   * @returns {string} Contract address
   */
  getContractAddress(privateKey) {
    const { getAddressFromPrivateKey, TransactionVersion } = require('@stacks/transactions');
    const txVersion = this.network.isMainnet() 
      ? TransactionVersion.Mainnet 
      : TransactionVersion.Testnet;
    
    return getAddressFromPrivateKey(privateKey || process.env.DEPLOYER_PRIVATE_KEY, txVersion);
  }

  /**
   * Get nonce for address
   * @param {string} privateKey - Private key
   * @returns {Promise<number>} Next nonce
   */
  async getNonce(privateKey) {
    try {
      const address = this.getContractAddress(privateKey);
      const url = `${this.apiUrl}/v2/accounts/${address}?proof=0`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      return data.nonce || 0;
    } catch (error) {
      logger.warn('Failed to fetch nonce, using 0', { error: error.message });
      return 0;
    }
  }

  /**
   * Get transaction status
   * @param {string} txId - Transaction ID
   * @returns {Promise<Object>} Transaction details
   */
  async getTransactionStatus(txId) {
    try {
      const url = `${this.apiUrl}/extended/v1/tx/${txId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transaction: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        txId: data.tx_id,
        status: data.tx_status,
        txType: data.tx_type,
        blockHeight: data.block_height,
        result: data.tx_result
      };
    } catch (error) {
      logger.error('Get transaction status error', { error: error.message, txId });
      throw new Error(`Get transaction status error: ${error.message}`);
    }
  }

  /**
   * Read contract data
   * @param {string} contractAddress - Contract address
   * @param {string} contractName - Contract name
   * @param {string} functionName - Read-only function name
   * @param {Array} functionArgs - Function arguments
   * @returns {Promise<Object>} Contract data
   */
  async readContractData(contractAddress, contractName, functionName, functionArgs = []) {
    try {
      const url = `${this.apiUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: contractAddress,
          arguments: functionArgs.map(arg => arg.toString())
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to read contract: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Read contract data error', { error: error.message });
      throw new Error(`Read contract data error: ${error.message}`);
    }
  }
}

module.exports = ContractService;

