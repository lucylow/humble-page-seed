const { body, param, query, validationResult } = require('express-validator');

/**
 * Validate request and throw error if validation fails
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

/**
 * Validation rules for creating an invoice
 */
const createInvoiceValidation = [
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),
  
  body('clientAddress')
    .notEmpty()
    .withMessage('Client address is required')
    .matches(/^(SP|ST)[0-9A-Z]{38,41}$/)
    .withMessage('Invalid Stacks address format'),
  
  body('contractorAddress')
    .optional()
    .matches(/^(SP|ST)[0-9A-Z]{38,41}$/)
    .withMessage('Invalid Stacks address format'),
  
  body('arbitratorAddress')
    .optional()
    .matches(/^(SP|ST)[0-9A-Z]{38,41}$/)
    .withMessage('Invalid Stacks address format'),
  
  body('totalAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  
  body('currency')
    .optional()
    .isIn(['sBTC', 'STX', 'USD'])
    .withMessage('Invalid currency'),
  
  validate
];

/**
 * Validation rules for releasing a milestone
 */
const releaseMilestoneValidation = [
  param('id')
    .notEmpty()
    .withMessage('Invoice ID is required'),
  
  body('milestoneId')
    .notEmpty()
    .withMessage('Milestone ID is required'),
  
  body('clientKey')
    .notEmpty()
    .withMessage('Client private key is required'),
  
  validate
];

/**
 * Validation rules for raising a dispute
 */
const raiseDisputeValidation = [
  param('id')
    .notEmpty()
    .withMessage('Invoice ID is required'),
  
  body('raisedBy')
    .notEmpty()
    .withMessage('Raiser wallet address is required')
    .matches(/^(SP|ST)[0-9A-Z]{38,41}$/)
    .withMessage('Invalid Stacks address format'),
  
  body('reason')
    .notEmpty()
    .withMessage('Dispute reason is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Reason must be between 10 and 1000 characters'),
  
  body('evidence')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Evidence must not exceed 5000 characters'),
  
  validate
];

/**
 * Validation rules for resolving a dispute
 */
const resolveDisputeValidation = [
  param('id')
    .notEmpty()
    .withMessage('Dispute ID is required'),
  
  body('resolution')
    .notEmpty()
    .withMessage('Resolution is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Resolution must be between 10 and 1000 characters'),
  
  body('favorClient')
    .isBoolean()
    .withMessage('favorClient must be a boolean'),
  
  body('arbitratorKey')
    .notEmpty()
    .withMessage('Arbitrator private key is required'),
  
  validate
];

/**
 * Validation rules for wallet address parameter
 */
const walletAddressValidation = [
  param('wallet')
    .notEmpty()
    .withMessage('Wallet address is required')
    .matches(/^(SP|ST)[0-9A-Z]{38,41}$/)
    .withMessage('Invalid Stacks address format'),
  
  validate
];

/**
 * Validation rules for invoice ID parameter
 */
const invoiceIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Invoice ID is required'),
  
  validate
];

/**
 * Validation rules for AI parsing
 */
const aiParseValidation = [
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20, max: 10000 })
    .withMessage('Description must be between 20 and 10000 characters'),
  
  validate
];

/**
 * Check if address is valid Stacks address
 */
const isValidStacksAddress = (address) => {
  return /^(SP|ST)[0-9A-Z]{38,41}$/.test(address);
};

/**
 * Sanitize input to prevent injection attacks
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '')
    .trim();
};

module.exports = {
  validate,
  createInvoiceValidation,
  releaseMilestoneValidation,
  raiseDisputeValidation,
  resolveDisputeValidation,
  walletAddressValidation,
  invoiceIdValidation,
  aiParseValidation,
  isValidStacksAddress,
  sanitizeInput
};

