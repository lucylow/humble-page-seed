const AIInvoiceProcessor = require('../services/aiProcessor');
const ContractService = require('../services/contractService');
const InvoiceService = require('../services/invoiceService');
const logger = require('../utils/logger');

class InvoiceController {
  constructor() {
    this.aiProcessor = new AIInvoiceProcessor();
    this.contractService = new ContractService();
    this.invoiceService = new InvoiceService();
  }

  /**
   * Parse invoice description using AI
   * POST /api/v1/invoice/parse
   */
  async parseInvoice(req, res) {
    try {
      const { description } = req.body;

      logger.info('Parsing invoice with AI', { descriptionLength: description.length });

      const invoiceData = await this.aiProcessor.parseInvoiceDescription(description);

      res.json({
        success: true,
        data: invoiceData,
        message: 'Invoice parsed successfully'
      });
    } catch (error) {
      logger.error('Parse invoice error', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Create a new smart invoice with AI processing and blockchain deployment
   * POST /api/v1/invoice/create
   */
  async createSmartInvoice(req, res) {
    try {
      const { description, clientWallet, useAI = true } = req.body;

      logger.info('Creating smart invoice', { clientWallet, useAI });

      let invoiceData;
      
      if (useAI) {
        // 1. AI Processing - Parse natural language description
        invoiceData = await this.aiProcessor.parseInvoiceDescription(description);
      } else {
        // Use provided structured data
        invoiceData = req.body;
      }

      // Add creator wallet
      invoiceData.creatorWallet = clientWallet;

      // 2. Create Database Record
      const invoice = await this.invoiceService.createInvoice(invoiceData);

      // 3. Generate Clarity Contract Code
      const clarityCode = await this.aiProcessor.generateClarityCode(invoiceData);

      // 4. Deploy Smart Contract (if deployer key provided)
      let deployment = null;
      if (req.body.deployerKey || process.env.DEPLOYER_PRIVATE_KEY) {
        try {
          deployment = await this.contractService.deployInvoiceContract(
            clarityCode,
            invoiceData,
            req.body.deployerKey
          );

          // 5. Update invoice with contract address
          await this.invoiceService.updateInvoiceContract(invoice.id, deployment);
        } catch (deployError) {
          logger.warn('Contract deployment failed, invoice saved as draft', {
            error: deployError.message
          });
        }
      }

      res.status(201).json({
        success: true,
        data: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          contractAddress: deployment?.contractAddress,
          contractName: deployment?.contractName,
          txId: deployment?.txId,
          ipfsHash: invoice.ipfsHash,
          status: deployment ? 'DEPLOYED' : 'DRAFT',
          clarityCode
        },
        message: 'Invoice created successfully'
      });
    } catch (error) {
      logger.error('Create smart invoice error', { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get invoice by ID
   * GET /api/v1/invoice/:id
   */
  async getInvoice(req, res) {
    try {
      const { id } = req.params;

      const invoice = await this.invoiceService.getInvoice(id);

      res.json({
        success: true,
        data: invoice
      });
    } catch (error) {
      logger.error('Get invoice error', { error: error.message, id: req.params.id });
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get all invoices for a user
   * GET /api/v1/invoice/user/:wallet
   */
  async getUserInvoices(req, res) {
    try {
      const { wallet } = req.params;

      const invoices = await this.invoiceService.getUserInvoices(wallet);

      res.json({
        success: true,
        data: invoices,
        count: invoices.length
      });
    } catch (error) {
      logger.error('Get user invoices error', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get invoice status and details
   * GET /api/v1/invoice/:id/status
   */
  async getInvoiceStatus(req, res) {
    try {
      const { id } = req.params;

      const invoice = await this.invoiceService.getInvoice(id);

      // Get blockchain transaction status if deployed
      let txStatus = null;
      if (invoice.deploymentTxId) {
        try {
          txStatus = await this.contractService.getTransactionStatus(invoice.deploymentTxId);
        } catch (txError) {
          logger.warn('Failed to fetch tx status', { error: txError.message });
        }
      }

      res.json({
        success: true,
        data: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          status: invoice.status,
          totalAmount: invoice.totalAmount,
          paidAmount: invoice.paidAmount,
          currency: invoice.currency,
          contractAddress: invoice.contractAddress,
          deploymentTxId: invoice.deploymentTxId,
          txStatus,
          milestones: invoice.milestones.map(m => ({
            id: m.id,
            sequence: m.sequence,
            title: m.title,
            amount: m.amount,
            status: m.status,
            releasedAt: m.releasedAt
          })),
          createdAt: invoice.createdAt,
          updatedAt: invoice.updatedAt
        }
      });
    } catch (error) {
      logger.error('Get invoice status error', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Lock funds in escrow
   * POST /api/v1/invoice/:id/lock
   */
  async lockFunds(req, res) {
    try {
      const { id } = req.params;
      const { amount, clientKey } = req.body;

      const invoice = await this.invoiceService.getInvoice(id);

      if (!invoice.contractAddress) {
        return res.status(400).json({
          success: false,
          error: 'Invoice contract not deployed'
        });
      }

      const result = await this.contractService.lockFunds(
        invoice.contractAddress,
        invoice.contractName,
        amount || invoice.totalAmount,
        clientKey
      );

      res.json({
        success: true,
        data: result,
        message: 'Funds locked successfully'
      });
    } catch (error) {
      logger.error('Lock funds error', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Release milestone payment
   * POST /api/v1/invoice/:id/release
   */
  async releaseMilestone(req, res) {
    try {
      const { id } = req.params;
      const { milestoneId, clientKey } = req.body;

      const invoice = await this.invoiceService.getInvoice(id);
      const milestone = await this.invoiceService.getMilestone(milestoneId);

      if (!invoice.contractAddress) {
        return res.status(400).json({
          success: false,
          error: 'Invoice contract not deployed'
        });
      }

      // Call contract to release funds
      const result = await this.contractService.releaseMilestone(
        invoice.contractAddress,
        invoice.contractName,
        milestone.sequence,
        clientKey
      );

      // Update milestone status in database
      await this.invoiceService.updateMilestoneStatus(milestoneId, 'RELEASED', result.txId);

      res.json({
        success: true,
        data: {
          txId: result.txId,
          milestoneId,
          amount: milestone.amount,
          status: 'released'
        },
        message: 'Milestone released successfully'
      });
    } catch (error) {
      logger.error('Release milestone error', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Raise a dispute
   * POST /api/v1/invoice/:id/dispute
   */
  async raiseDispute(req, res) {
    try {
      const { id } = req.params;
      const { raisedBy, reason, evidence, userKey } = req.body;

      const invoice = await this.invoiceService.getInvoice(id);

      // Create dispute in database
      const dispute = await this.invoiceService.createDispute(id, raisedBy, reason, evidence);

      // Raise dispute on blockchain if contract deployed
      if (invoice.contractAddress && userKey) {
        try {
          await this.contractService.raiseDispute(
            invoice.contractAddress,
            invoice.contractName,
            reason,
            userKey
          );
        } catch (blockchainError) {
          logger.warn('Blockchain dispute failed, database record created', {
            error: blockchainError.message
          });
        }
      }

      res.status(201).json({
        success: true,
        data: dispute,
        message: 'Dispute raised successfully'
      });
    } catch (error) {
      logger.error('Raise dispute error', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Resolve a dispute (arbitrator only)
   * POST /api/v1/dispute/:id/resolve
   */
  async resolveDispute(req, res) {
    try {
      const { id } = req.params;
      const { resolution, favorClient, arbitratorKey } = req.body;

      // Get dispute details
      const dispute = await this.invoiceService.getInvoice(id);

      // Resolve on blockchain
      let txResult = null;
      if (dispute.contractAddress && arbitratorKey) {
        txResult = await this.contractService.resolveDispute(
          dispute.contractAddress,
          dispute.contractName,
          favorClient,
          arbitratorKey
        );
      }

      // Update database
      const resolvedDispute = await this.invoiceService.resolveDispute(
        id,
        req.body.resolvedBy || dispute.arbitratorAddress,
        resolution,
        txResult?.txId
      );

      res.json({
        success: true,
        data: resolvedDispute,
        message: 'Dispute resolved successfully'
      });
    } catch (error) {
      logger.error('Resolve dispute error', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get invoice statistics for a user
   * GET /api/v1/invoice/stats/:wallet
   */
  async getStatistics(req, res) {
    try {
      const { wallet } = req.params;

      const stats = await this.invoiceService.getInvoiceStatistics(wallet);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get statistics error', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Generate AI suggestions for invoice improvement
   * POST /api/v1/invoice/suggest
   */
  async getSuggestions(req, res) {
    try {
      const { partialData } = req.body;

      const suggestions = await this.aiProcessor.generateSuggestions(partialData);

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      logger.error('Get suggestions error', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = InvoiceController;

