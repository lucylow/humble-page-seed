const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const StorageService = require('./storageService');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

class InvoiceService {
  constructor() {
    this.storageService = new StorageService();
  }

  /**
   * Create a new invoice with milestones
   * @param {Object} createInvoiceDto - Invoice data
   * @returns {Promise<Object>} Created invoice
   */
  async createInvoice(createInvoiceDto) {
    const {
      description,
      projectScope,
      clientAddress,
      contractorAddress,
      arbitratorAddress,
      totalAmount,
      currency,
      milestones,
      creatorWallet
    } = createInvoiceDto;

    try {
      logger.info('Creating invoice', { clientAddress, contractorAddress, totalAmount });

      return await prisma.$transaction(async (tx) => {
        // Ensure users exist
        await this.ensureUserExists(tx, creatorWallet);
        await this.ensureUserExists(tx, clientAddress);
        await this.ensureUserExists(tx, contractorAddress);
        if (arbitratorAddress) {
          await this.ensureUserExists(tx, arbitratorAddress);
        }

        // Create invoice record
        const invoice = await tx.invoice.create({
          data: {
            description,
            projectScope: projectScope || description,
            clientAddress,
            contractorAddress,
            arbitratorAddress,
            totalAmount,
            currency: currency || 'sBTC',
            status: 'DRAFT',
            creatorId: creatorWallet,
            ipfsHash: null
          }
        });

        // Create milestones
        if (milestones && milestones.length > 0) {
          for (const milestone of milestones) {
            await tx.milestone.create({
              data: {
                invoiceId: invoice.id,
                sequence: milestone.sequence,
                title: milestone.title || `Milestone ${milestone.sequence}`,
                description: milestone.description,
                amount: milestone.amount,
                dueDate: milestone.due_date ? new Date(milestone.due_date) : null,
                condition: milestone.condition || 'Completion of deliverables',
                status: 'PENDING'
              }
            });
          }
        }

        // Store invoice documents on IPFS
        const ipfsHash = await this.storeInvoiceDocuments(invoice, milestones);
        
        // Update invoice with IPFS hash
        const updatedInvoice = await tx.invoice.update({
          where: { id: invoice.id },
          data: { ipfsHash },
          include: {
            milestones: {
              orderBy: { sequence: 'asc' }
            }
          }
        });

        // Create notification
        await tx.notification.create({
          data: {
            userId: creatorWallet,
            invoiceId: invoice.id,
            type: 'INVOICE_CREATED',
            title: 'Invoice Created',
            message: `Invoice ${invoice.invoiceNumber} has been created successfully`
          }
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            userId: creatorWallet,
            invoiceId: invoice.id,
            action: 'CREATE_INVOICE',
            entityType: 'Invoice',
            entityId: invoice.id,
            changes: { status: 'DRAFT', totalAmount, currency }
          }
        });

        logger.info('Invoice created successfully', { invoiceId: invoice.id });

        return updatedInvoice;
      });
    } catch (error) {
      logger.error('Create invoice failed', { error: error.message, stack: error.stack });
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  /**
   * Update invoice with contract deployment info
   * @param {string} invoiceId - Invoice ID
   * @param {Object} deployment - Deployment details
   * @returns {Promise<Object>} Updated invoice
   */
  async updateInvoiceContract(invoiceId, deployment) {
    try {
      const invoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          contractAddress: deployment.contractAddress,
          contractName: deployment.contractName,
          deploymentTxId: deployment.txId,
          status: 'DEPLOYED',
          deployedAt: new Date()
        },
        include: {
          milestones: true
        }
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          invoiceId,
          txId: deployment.txId,
          txType: 'DEPLOYMENT',
          from: deployment.contractAddress,
          to: deployment.contractAddress,
          amount: 0,
          status: 'PENDING'
        }
      });

      // Notify parties
      await this.createNotification(
        invoice.clientAddress,
        invoiceId,
        'INVOICE_DEPLOYED',
        'Contract Deployed',
        `Invoice contract has been deployed to ${deployment.contractAddress}`
      );

      logger.info('Invoice contract updated', { invoiceId, contractAddress: deployment.contractAddress });

      return invoice;
    } catch (error) {
      logger.error('Update invoice contract failed', { error: error.message, invoiceId });
      throw new Error(`Failed to update invoice contract: ${error.message}`);
    }
  }

  /**
   * Get invoice by ID
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<Object>} Invoice with relations
   */
  async getInvoice(invoiceId) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          milestones: {
            orderBy: { sequence: 'asc' }
          },
          disputes: {
            orderBy: { createdAt: 'desc' }
          },
          transactions: {
            orderBy: { createdAt: 'desc' }
          },
          creator: {
            select: {
              walletAddress: true,
              username: true
            }
          }
        }
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      return invoice;
    } catch (error) {
      logger.error('Get invoice failed', { error: error.message, invoiceId });
      throw error;
    }
  }

  /**
   * Get all invoices for a user
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<Array>} User's invoices
   */
  async getUserInvoices(walletAddress) {
    try {
      const invoices = await prisma.invoice.findMany({
        where: {
          OR: [
            { clientAddress: walletAddress },
            { contractorAddress: walletAddress },
            { arbitratorAddress: walletAddress }
          ]
        },
        include: {
          milestones: {
            orderBy: { sequence: 'asc' }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return invoices;
    } catch (error) {
      logger.error('Get user invoices failed', { error: error.message, walletAddress });
      throw new Error(`Failed to get user invoices: ${error.message}`);
    }
  }

  /**
   * Get milestone by ID
   * @param {string} milestoneId - Milestone ID
   * @returns {Promise<Object>} Milestone
   */
  async getMilestone(milestoneId) {
    try {
      const milestone = await prisma.milestone.findUnique({
        where: { id: milestoneId },
        include: {
          invoice: true
        }
      });

      if (!milestone) {
        throw new Error('Milestone not found');
      }

      return milestone;
    } catch (error) {
      logger.error('Get milestone failed', { error: error.message, milestoneId });
      throw error;
    }
  }

  /**
   * Update milestone status
   * @param {string} milestoneId - Milestone ID
   * @param {string} status - New status
   * @param {string} txId - Transaction ID (optional)
   * @returns {Promise<Object>} Updated milestone
   */
  async updateMilestoneStatus(milestoneId, status, txId = null) {
    try {
      const updateData = {
        status,
        updatedAt: new Date()
      };

      if (status === 'RELEASED') {
        updateData.releasedAt = new Date();
        updateData.releaseTxId = txId;
      } else if (status === 'APPROVED') {
        updateData.approvedAt = new Date();
      }

      const milestone = await prisma.milestone.update({
        where: { id: milestoneId },
        data: updateData,
        include: {
          invoice: true
        }
      });

      // Update invoice paid amount
      if (status === 'RELEASED') {
        await prisma.invoice.update({
          where: { id: milestone.invoiceId },
          data: {
            paidAmount: {
              increment: milestone.amount
            }
          }
        });

        // Check if all milestones are released
        await this.checkInvoiceCompletion(milestone.invoiceId);
      }

      logger.info('Milestone status updated', { milestoneId, status });

      return milestone;
    } catch (error) {
      logger.error('Update milestone status failed', { error: error.message, milestoneId });
      throw new Error(`Failed to update milestone status: ${error.message}`);
    }
  }

  /**
   * Create a dispute
   * @param {string} invoiceId - Invoice ID
   * @param {string} raisedBy - Wallet address of dispute raiser
   * @param {string} reason - Dispute reason
   * @param {string} evidence - Evidence/details
   * @returns {Promise<Object>} Created dispute
   */
  async createDispute(invoiceId, raisedBy, reason, evidence = null) {
    try {
      return await prisma.$transaction(async (tx) => {
        const dispute = await tx.dispute.create({
          data: {
            invoiceId,
            raisedBy,
            reason,
            evidence,
            status: 'OPEN'
          }
        });

        // Update invoice status
        await tx.invoice.update({
          where: { id: invoiceId },
          data: { status: 'DISPUTED' }
        });

        // Get invoice for notifications
        const invoice = await tx.invoice.findUnique({
          where: { id: invoiceId }
        });

        // Notify all parties
        const parties = [invoice.clientAddress, invoice.contractorAddress];
        if (invoice.arbitratorAddress) {
          parties.push(invoice.arbitratorAddress);
        }

        for (const party of parties) {
          await tx.notification.create({
            data: {
              userId: party,
              invoiceId,
              type: 'DISPUTE_RAISED',
              title: 'Dispute Raised',
              message: `A dispute has been raised for invoice ${invoice.invoiceNumber}`
            }
          });
        }

        logger.info('Dispute created', { disputeId: dispute.id, invoiceId });

        return dispute;
      });
    } catch (error) {
      logger.error('Create dispute failed', { error: error.message, invoiceId });
      throw new Error(`Failed to create dispute: ${error.message}`);
    }
  }

  /**
   * Resolve a dispute
   * @param {string} disputeId - Dispute ID
   * @param {string} resolvedBy - Arbitrator wallet address
   * @param {string} resolution - Resolution details
   * @param {string} txId - Resolution transaction ID
   * @returns {Promise<Object>} Resolved dispute
   */
  async resolveDispute(disputeId, resolvedBy, resolution, txId) {
    try {
      return await prisma.$transaction(async (tx) => {
        const dispute = await tx.dispute.update({
          where: { id: disputeId },
          data: {
            status: 'RESOLVED',
            resolvedBy,
            resolution,
            resolutionTxId: txId,
            resolvedAt: new Date()
          },
          include: {
            invoice: true
          }
        });

        // Update invoice status back to ACTIVE
        await tx.invoice.update({
          where: { id: dispute.invoiceId },
          data: { status: 'ACTIVE' }
        });

        // Notify parties
        await tx.notification.create({
          data: {
            userId: dispute.invoice.clientAddress,
            invoiceId: dispute.invoiceId,
            type: 'DISPUTE_RESOLVED',
            title: 'Dispute Resolved',
            message: `Dispute has been resolved: ${resolution}`
          }
        });

        logger.info('Dispute resolved', { disputeId });

        return dispute;
      });
    } catch (error) {
      logger.error('Resolve dispute failed', { error: error.message, disputeId });
      throw new Error(`Failed to resolve dispute: ${error.message}`);
    }
  }

  /**
   * Store invoice documents on IPFS
   * @param {Object} invoice - Invoice object
   * @param {Array} milestones - Milestones array
   * @returns {Promise<string>} IPFS hash
   */
  async storeInvoiceDocuments(invoice, milestones) {
    try {
      const documents = {
        invoice_id: invoice.id,
        invoice_number: invoice.invoiceNumber,
        project_agreement: invoice.description,
        project_scope: invoice.projectScope,
        parties: {
          client: invoice.clientAddress,
          contractor: invoice.contractorAddress,
          arbitrator: invoice.arbitratorAddress
        },
        financial: {
          total_amount: invoice.totalAmount,
          currency: invoice.currency
        },
        milestones: milestones || [],
        terms_and_conditions: this.generateStandardTerms(),
        created_at: new Date().toISOString()
      };

      const ipfsHash = await this.storageService.uploadToIPFS(documents);
      
      logger.info('Invoice documents stored on IPFS', { invoiceId: invoice.id, ipfsHash });
      
      return ipfsHash;
    } catch (error) {
      logger.warn('IPFS storage failed, continuing without hash', { error: error.message });
      return null; // Don't fail invoice creation if IPFS fails
    }
  }

  /**
   * Generate standard terms and conditions
   * @returns {Object} Standard terms
   */
  generateStandardTerms() {
    return {
      dispute_resolution: 'Any disputes will be resolved by the designated arbitrator',
      payment_terms: 'Payments are released upon milestone completion and client approval',
      cancellation: 'Either party may cancel with mutual consent. Completed work will be paid.',
      confidentiality: 'Both parties agree to maintain confidentiality of project details',
      intellectual_property: 'IP rights transfer upon full payment completion',
      force_majeure: 'Neither party liable for delays due to circumstances beyond control'
    };
  }

  /**
   * Check if invoice is complete
   * @param {string} invoiceId - Invoice ID
   */
  async checkInvoiceCompletion(invoiceId) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          milestones: true
        }
      });

      const allReleased = invoice.milestones.every(m => m.status === 'RELEASED');
      
      if (allReleased && invoice.status !== 'COMPLETED') {
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date()
          }
        });

        // Notify completion
        await this.createNotification(
          invoice.clientAddress,
          invoiceId,
          'CONTRACT_COMPLETED',
          'Contract Completed',
          `Invoice ${invoice.invoiceNumber} has been completed successfully`
        );

        logger.info('Invoice completed', { invoiceId });
      }
    } catch (error) {
      logger.error('Check invoice completion failed', { error: error.message, invoiceId });
    }
  }

  /**
   * Create a notification
   * @param {string} userId - User wallet address
   * @param {string} invoiceId - Invoice ID
   * @param {string} type - Notification type
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   */
  async createNotification(userId, invoiceId, type, title, message) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          invoiceId,
          type,
          title,
          message
        }
      });
    } catch (error) {
      logger.warn('Create notification failed', { error: error.message });
    }
  }

  /**
   * Ensure user exists in database
   * @param {Object} tx - Prisma transaction
   * @param {string} walletAddress - Wallet address
   */
  async ensureUserExists(tx, walletAddress) {
    const existing = await tx.user.findUnique({
      where: { walletAddress }
    });

    if (!existing) {
      await tx.user.create({
        data: {
          walletAddress,
          role: 'USER'
        }
      });
    }
  }

  /**
   * Get invoice statistics
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<Object>} Statistics
   */
  async getInvoiceStatistics(walletAddress) {
    try {
      const [total, active, completed, disputed, totalValue] = await Promise.all([
        prisma.invoice.count({
          where: {
            OR: [
              { clientAddress: walletAddress },
              { contractorAddress: walletAddress }
            ]
          }
        }),
        prisma.invoice.count({
          where: {
            OR: [
              { clientAddress: walletAddress },
              { contractorAddress: walletAddress }
            ],
            status: 'ACTIVE'
          }
        }),
        prisma.invoice.count({
          where: {
            OR: [
              { clientAddress: walletAddress },
              { contractorAddress: walletAddress }
            ],
            status: 'COMPLETED'
          }
        }),
        prisma.invoice.count({
          where: {
            OR: [
              { clientAddress: walletAddress },
              { contractorAddress: walletAddress }
            ],
            status: 'DISPUTED'
          }
        }),
        prisma.invoice.aggregate({
          where: {
            contractorAddress: walletAddress,
            status: 'COMPLETED'
          },
          _sum: {
            totalAmount: true
          }
        })
      ]);

      return {
        total,
        active,
        completed,
        disputed,
        totalEarned: totalValue._sum.totalAmount || 0
      };
    } catch (error) {
      logger.error('Get statistics failed', { error: error.message });
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }
}

module.exports = InvoiceService;

