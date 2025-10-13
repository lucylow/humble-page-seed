import { Router } from 'express';
import { body } from 'express-validator';
import { AIService } from '../services/ai';
import { Request, Response } from 'express';
import { Logger } from '../utils/logger';

const router = Router();
const aiService = new AIService();
const logger = new Logger('AIRoutes');

// Parse invoice description
router.post('/parse-invoice', 
  body('description').isString().notEmpty(),
  async (req: Request, res: Response) => {
    try {
      const { description } = req.body;
      const result = await aiService.parseInvoiceDescription(description);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('AI parsing failed', { error });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Generate contract
router.post('/generate-contract',
  body('invoiceData').isObject().notEmpty(),
  body('templateType').optional().isString(),
  async (req: Request, res: Response) => {
    try {
      const { invoiceData, templateType } = req.body;
      const result = await aiService.generateClarityContract(invoiceData, templateType);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Contract generation failed', { error });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Risk analysis
router.post('/analyze-risk',
  body('invoiceData').isObject().notEmpty(),
  async (req: Request, res: Response) => {
    try {
      const { invoiceData } = req.body;
      const result = await aiService.analyzeContractRisk(invoiceData);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Risk analysis failed', { error });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

export { router as aiRoutes };

