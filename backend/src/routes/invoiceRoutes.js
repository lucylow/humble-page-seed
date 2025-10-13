const express = require('express');
const router = express.Router();
const InvoiceController = require('../controllers/invoiceController');
const {
  createInvoiceValidation,
  releaseMilestoneValidation,
  raiseDisputeValidation,
  resolveDisputeValidation,
  walletAddressValidation,
  invoiceIdValidation,
  aiParseValidation
} = require('../utils/validators');

const controller = new InvoiceController();

// AI Processing Routes
router.post(
  '/parse',
  aiParseValidation,
  controller.parseInvoice.bind(controller)
);

router.post(
  '/suggest',
  controller.getSuggestions.bind(controller)
);

// Invoice CRUD Routes
router.post(
  '/create',
  createInvoiceValidation,
  controller.createSmartInvoice.bind(controller)
);

router.get(
  '/:id',
  invoiceIdValidation,
  controller.getInvoice.bind(controller)
);

router.get(
  '/:id/status',
  invoiceIdValidation,
  controller.getInvoiceStatus.bind(controller)
);

router.get(
  '/user/:wallet',
  walletAddressValidation,
  controller.getUserInvoices.bind(controller)
);

router.get(
  '/stats/:wallet',
  walletAddressValidation,
  controller.getStatistics.bind(controller)
);

// Invoice Actions
router.post(
  '/:id/lock',
  invoiceIdValidation,
  controller.lockFunds.bind(controller)
);

router.post(
  '/:id/release',
  releaseMilestoneValidation,
  controller.releaseMilestone.bind(controller)
);

// Dispute Routes
router.post(
  '/:id/dispute',
  raiseDisputeValidation,
  controller.raiseDispute.bind(controller)
);

router.post(
  '/dispute/:id/resolve',
  resolveDisputeValidation,
  controller.resolveDispute.bind(controller)
);

module.exports = router;

