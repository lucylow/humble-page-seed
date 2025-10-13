import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { InvoiceController } from '../controllers/invoiceController';

const router = Router();
const controller = new InvoiceController();

// Validation middleware
const createInvoiceValidation = [
  body('description').isString().notEmpty().withMessage('Description is required'),
  body('clientWallet').isString().notEmpty().withMessage('Client wallet is required'),
  body('contractorAddress').isString().notEmpty().withMessage('Contractor address is required'),
  body('arbitratorAddress').optional().isString(),
  body('projectTitle').optional().isString(),
  body('metadata').optional().isObject()
];

const releaseMilestoneValidation = [
  body('invoiceId').isString().notEmpty().withMessage('Invoice ID is required'),
  body('milestoneId').isString().notEmpty().withMessage('Milestone ID is required'),
  body('proof').optional().isString(),
  body('signature').optional().isString()
];

// Routes
router.post('/create', createInvoiceValidation, controller.createSmartInvoice);
router.post('/release-milestone', releaseMilestoneValidation, controller.releaseMilestone);
router.get('/list', controller.listUserInvoices);
router.get('/:invoiceId', param('invoiceId').isString(), controller.getInvoiceDetails);

export { router as invoiceRoutes };

