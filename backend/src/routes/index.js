const express = require('express');
const router = express.Router();
const invoiceRoutes = require('./invoiceRoutes');

// API Version prefix
const API_VERSION = process.env.API_VERSION || 'v1';

// Mount routes
router.use(`/${API_VERSION}/invoice`, invoiceRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'BitMind Smart Invoice API is running',
    version: API_VERSION,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info endpoint
router.get('/info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'BitMind Smart Invoice API',
      version: API_VERSION,
      description: 'AI-powered invoice escrow system on Stacks blockchain',
      endpoints: {
        invoice: `/${API_VERSION}/invoice`,
        health: '/health',
        info: '/info'
      },
      features: [
        'AI-powered invoice parsing',
        'Smart contract deployment on Stacks',
        'Milestone-based payments',
        'Dispute resolution',
        'IPFS document storage'
      ]
    }
  });
});

// 404 handler
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

module.exports = router;

