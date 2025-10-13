import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { StacksService } from '../services/stacks';
import { AIService } from '../services/ai';
import { IPFSService } from '../services/ipfs';
import { Logger } from '../utils/logger';
import { validationResult } from 'express-validator';
import { WebhookService } from '../services/webhooks';

interface CreateInvoiceRequest {
  description: string;
  clientWallet: string;
  contractorAddress: string;
  arbitratorAddress?: string;
  projectTitle?: string;
  metadata?: any;
}

interface ReleaseMilestoneRequest {
  invoiceId: string;
  milestoneId: string;
  clientWallet: string;
  proof?: string;
  signature?: string;
}

export class InvoiceController {
  private prisma: PrismaClient;
  private stacksService: StacksService;
  private aiService: AIService;
  private ipfsService: IPFSService;
  private webhookService: WebhookService;
  private logger: Logger;

  constructor() {
    this.prisma = new PrismaClient();
    this.stacksService = new StacksService();
    this.aiService = new AIService();
    this.ipfsService = new IPFSService();
    this.webhookService = new WebhookService();
    this.logger = new Logger('InvoiceController');
  }

  public createSmartInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const {
        description,
        clientWallet,
        contractorAddress,
        arbitratorAddress,
        projectTitle,
        metadata
      }: CreateInvoiceRequest = req.body;

      this.logger.info('Creating smart invoice', {
        clientWallet,
        contractorAddress,
        descriptionLength: description.length
      });

      // Step 1: AI Processing
      this.logger.info('Step 1: AI processing invoice description');
      const invoiceData = await this.aiService.parseInvoiceDescription(description);
      
      // Step 2: Risk Analysis
      this.logger.info('Step 2: Performing risk analysis');
      const riskAnalysis = await this.aiService.analyzeContractRisk(invoiceData);
      
      // Step 3: Generate Clarity Contract
      this.logger.info('Step 3: Generating Clarity contract');
      const contractResult = await this.aiService.generateClarityContract(invoiceData);
      
      // Step 4: Create Database Record
      this.logger.info('Step 4: Creating database record');
      const invoice = await this.prisma.$transaction(async (tx) => {
        // Create invoice record
        const invoice = await tx.invoice.create({
          data: {
            title: projectTitle || `Invoice ${Date.now()}`,
            description,
            clientAddress: clientWallet,
            contractorAddress,
            arbitratorAddress: arbitratorAddress || clientWallet, // Default to client
            totalAmount: invoiceData.total_amount,
            currency: invoiceData.currency,
            satsAmount: this.convertToSats(invoiceData.total_amount, invoiceData.currency),
            status: 'DRAFT',
            creatorWallet: clientWallet,
            metadata: {
              ...metadata,
              risk_analysis: riskAnalysis,
              ai_generation: {
                template_used: contractResult.template_used,
                functions_generated: contractResult.functions_generated,
                security_checks: contractResult.security_checks
              }
            }
          }
        });

        // Create milestones
        for (const milestoneData of invoiceData.milestones) {
          await tx.milestone.create({
            data: {
              invoiceId: invoice.id,
              sequence: milestoneData.sequence,
              title: `Milestone ${milestoneData.sequence}`,
              description: milestoneData.description,
              amount: milestoneData.amount,
              satsAmount: this.convertToSats(milestoneData.amount, invoiceData.currency),
              conditions: {
                description: milestoneData.condition,
                proof_required: milestoneData.proof_required || false,
                proof_type: milestoneData.proof_type,
                due_date: milestoneData.due_date
              }
            }
          });
        }

        // Store contract code on IPFS
        this.logger.info('Storing contract on IPFS');
        const ipfsHash = await this.ipfsService.storeJSON({
          contract_code: contractResult.clarity_code,
          invoice_data: invoiceData,
          generation_metadata: contractResult
        });

        // Update invoice with IPFS hash
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { ipfsHash }
        });

        // Create initial event
        await tx.invoiceEvent.create({
          data: {
            invoiceId: invoice.id,
            type: 'INVOICE_CREATED',
            data: {
              clientWallet,
              contractorAddress,
              milestones: invoiceData.milestones.length,
              totalAmount: invoiceData.total_amount
            },
            triggeredBy: clientWallet
          }
        });

        return invoice;
      });

      // Step 5: Deploy Smart Contract
      this.logger.info('Step 5: Deploying smart contract');
      const deployment = await this.stacksService.deployInvoiceContract(
        contractResult.clarity_code,
        { invoiceId: invoice.id },
        process.env.STACKS_DEPLOYER_PRIVATE_KEY!
      );

      // Step 6: Update invoice with contract details
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          contractAddress: deployment.contractAddress,
          transactionHash: deployment.transactionId,
          status: 'DEPLOYED',
          deployedAt: new Date()
        }
      });

      // Step 7: Wait for confirmation (async - don't block response)
      this.waitForDeploymentConfirmation(invoice.id, deployment.transactionId);

      this.logger.info('Smart invoice creation completed', {
        invoiceId: invoice.id,
        contractAddress: deployment.contractAddress
      });

      res.json({
        success: true,
        data: {
          invoice: {
            id: invoice.id,
            status: 'DEPLOYED',
            contractAddress: deployment.contractAddress,
            transactionHash: deployment.transactionId,
            ipfsHash: invoice.ipfsHash
          },
          riskAnalysis: riskAnalysis,
          contractGeneration: {
            functions: contractResult.functions_generated,
            securityChecks: contractResult.security_checks,
            estimatedGas: contractResult.estimated_gas
          }
        }
      });

    } catch (error: any) {
      this.logger.error('Smart invoice creation failed', { error });
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'INVOICE_CREATION_FAILED'
      });
    }
  };

  public releaseMilestone = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const {
        invoiceId,
        milestoneId,
        clientWallet,
        proof,
        signature
      }: ReleaseMilestoneRequest = req.body;

      this.logger.info('Releasing milestone', { invoiceId, milestoneId, clientWallet });

      // Verify invoice exists and user is authorized
      const invoice = await this.prisma.invoice.findFirst({
        where: {
          id: invoiceId,
          clientAddress: clientWallet,
          status: { in: ['ACTIVE', 'FUNDED'] }
        },
        include: {
          milestones: {
            where: { id: milestoneId },
            include: { approvals: true }
          }
        }
      });

      if (!invoice) {
        res.status(404).json({
          success: false,
          error: 'Invoice not found or unauthorized'
        });
        return;
      }

      const milestone = invoice.milestones[0];
      if (!milestone) {
        res.status(404).json({
          success: false,
          error: 'Milestone not found'
        });
        return;
      }

      // Check if milestone is ready for release
      if (milestone.status !== 'PENDING' && milestone.status !== 'APPROVED') {
        res.status(400).json({
          success: false,
          error: `Milestone cannot be released from status: ${milestone.status}`
        });
        return;
      }

      // For multi-sig, check if we have enough approvals
      if (milestone.approvals.length > 0) {
        const approvedCount = milestone.approvals.filter(a => a.approved).length;
        const requiredApprovals = Math.ceil(milestone.approvals.length / 2);
        
        if (approvedCount < requiredApprovals) {
          res.status(400).json({
            success: false,
            error: `Insufficient approvals: ${approvedCount}/${requiredApprovals}`
          });
          return;
        }
      }

      // Call blockchain to release funds
      const result = await this.stacksService.releaseMilestone(
        invoice.contractAddress!,
        invoice.contractAddress!.split('.')[1], // contract name
        milestone.sequence,
        process.env.STACKS_DEPLOYER_PRIVATE_KEY! // In practice, use client's key
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update database
      await this.prisma.$transaction(async (tx) => {
        // Update milestone status
        await tx.milestone.update({
          where: { id: milestoneId },
          data: {
            status: 'RELEASED',
            releasedAt: new Date()
          }
        });

        // Create release record
        await tx.milestoneRelease.create({
          data: {
            milestoneId,
            amount: milestone.amount,
            satsAmount: milestone.satsAmount!,
            transactionHash: result.transactionId!,
            releasedBy: clientWallet
          }
        });

        // Create event
        await tx.invoiceEvent.create({
          data: {
            invoiceId,
            type: 'MILESTONE_RELEASED',
            data: {
              milestoneId,
              amount: milestone.amount,
              transactionHash: result.transactionId
            },
            triggeredBy: clientWallet,
            transactionHash: result.transactionId
          }
        });

        // Check if all milestones are released
        const remainingMilestones = await tx.milestone.count({
          where: {
            invoiceId,
            status: { not: 'RELEASED' }
          }
        });

        if (remainingMilestones === 0) {
          await tx.invoice.update({
            where: { id: invoiceId },
            data: {
              status: 'COMPLETED',
              completedAt: new Date()
            }
          });

          await tx.invoiceEvent.create({
            data: {
              invoiceId,
              type: 'INVOICE_COMPLETED',
              data: { totalMilestones: invoice.milestones.length },
              triggeredBy: clientWallet
            }
          });
        }
      });

      // Trigger webhooks
      await this.webhookService.triggerInvoiceUpdate(invoiceId, 'milestone_released');

      this.logger.info('Milestone released successfully', {
        invoiceId,
        milestoneId,
        transactionHash: result.transactionId
      });

      res.json({
        success: true,
        data: {
          transactionHash: result.transactionId,
          milestoneId,
          amount: milestone.amount
        }
      });

    } catch (error: any) {
      this.logger.error('Milestone release failed', { error });
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'MILESTONE_RELEASE_FAILED'
      });
    }
  };

  public getInvoiceDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { invoiceId } = req.params;
      const { walletAddress } = req.body; // From auth middleware

      const invoice = await this.prisma.invoice.findFirst({
        where: {
          id: invoiceId,
          OR: [
            { clientAddress: walletAddress },
            { contractorAddress: walletAddress },
            { arbitratorAddress: walletAddress },
            { creatorWallet: walletAddress }
          ]
        },
        include: {
          milestones: {
            orderBy: { sequence: 'asc' },
            include: {
              approvals: true,
              releases: true
            }
          },
          disputes: true,
          events: {
            orderBy: { createdAt: 'desc' },
            take: 20
          }
        }
      });

      if (!invoice) {
        res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
        return;
      }

      // Get contract state from blockchain if deployed
      let contractState = null;
      if (invoice.contractAddress) {
        try {
          contractState = await this.stacksService.getContractState(
            invoice.contractAddress.split('.')[0],
            invoice.contractAddress.split('.')[1]
          );
        } catch (error) {
          this.logger.warn('Failed to fetch contract state', { error });
        }
      }

      res.json({
        success: true,
        data: {
          invoice,
          contractState,
          permissions: this.calculatePermissions(invoice, walletAddress)
        }
      });

    } catch (error: any) {
      this.logger.error('Failed to get invoice details', { error });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  public listUserInvoices = async (req: Request, res: Response): Promise<void> => {
    try {
      const { walletAddress } = req.body;
      const { page = 1, limit = 20, status, type } = req.query;

      const where: any = {
        OR: [
          { clientAddress: walletAddress },
          { contractorAddress: walletAddress },
          { arbitratorAddress: walletAddress }
        ]
      };

      if (status) {
        where.status = status;
      }

      if (type === 'client') {
        where.clientAddress = walletAddress;
      } else if (type === 'contractor') {
        where.contractorAddress = walletAddress;
      }

      const [invoices, total] = await Promise.all([
        this.prisma.invoice.findMany({
          where,
          include: {
            milestones: {
              select: {
                id: true,
                sequence: true,
                status: true,
                amount: true
              }
            },
            _count: {
              select: {
                disputes: {
                  where: { status: 'OPEN' }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit)
        }),
        this.prisma.invoice.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          invoices,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error: any) {
      this.logger.error('Failed to list user invoices', { error });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  private convertToSats(amount: number, currency: string): bigint {
    if (currency === 'sBTC') {
      return BigInt(Math.floor(amount * 100000000)); // Convert to satoshis
    }
    return BigInt(Math.floor(amount * 1000000)); // Convert to microSTX for STX
  }

  private calculatePermissions(invoice: any, walletAddress: string): any {
    const permissions = {
      canRelease: false,
      canApprove: false,
      canDispute: false,
      canCancel: false,
      role: null as string | null
    };

    if (invoice.clientAddress === walletAddress) {
      permissions.role = 'client';
      permissions.canRelease = true;
      permissions.canCancel = invoice.status === 'DRAFT';
    } else if (invoice.contractorAddress === walletAddress) {
      permissions.role = 'contractor';
      permissions.canDispute = true;
    } else if (invoice.arbitratorAddress === walletAddress) {
      permissions.role = 'arbitrator';
      permissions.canApprove = true;
    }

    return permissions;
  }

  private async waitForDeploymentConfirmation(invoiceId: string, transactionId: string): Promise<void> {
    try {
      const result = await this.stacksService.waitForTransactionConfirmation(transactionId);
      
      if (result.confirmed) {
        await this.prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            blockHeight: result.blockHeight
          }
        });

        this.logger.info('Contract deployment confirmed', {
          invoiceId,
          transactionId,
          blockHeight: result.blockHeight
        });

        // Trigger webhook for deployment confirmation
        await this.webhookService.triggerInvoiceUpdate(invoiceId, 'contract_deployed');
      }
    } catch (error: any) {
      this.logger.error('Failed to confirm deployment', { error, invoiceId, transactionId });
    }
  }
}

