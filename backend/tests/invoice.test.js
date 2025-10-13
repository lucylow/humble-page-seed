/**
 * Invoice Controller Tests
 * Run with: npm test
 */

const request = require('supertest');
const app = require('../src/server');

describe('Invoice API', () => {
  let testInvoiceId;
  const testWallet = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

  // Health check test
  describe('GET /api/health', () => {
    it('should return healthy status', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('running');
    });
  });

  // API info test
  describe('GET /api/info', () => {
    it('should return API information', async () => {
      const res = await request(app)
        .get('/api/info')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toContain('BitMind');
    });
  });

  // Parse invoice test
  describe('POST /api/v1/invoice/parse', () => {
    it('should parse invoice description with AI', async () => {
      const res = await request(app)
        .post('/api/v1/invoice/parse')
        .send({
          description: 'Build a website for $5000, with 3 milestones: design for $2000, development for $2000, and deployment for $1000'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total_amount');
      expect(res.body.data).toHaveProperty('milestones');
    }, 30000); // 30 second timeout for AI
  });

  // Create invoice test
  describe('POST /api/v1/invoice/create', () => {
    it('should create a new invoice', async () => {
      const res = await request(app)
        .post('/api/v1/invoice/create')
        .send({
          description: 'Test invoice for development work',
          clientAddress: testWallet,
          contractorAddress: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
          totalAmount: 1000,
          currency: 'sBTC',
          milestones: [
            {
              sequence: 1,
              title: 'Test Milestone',
              description: 'Complete test',
              amount: 1000,
              condition: 'Testing complete'
            }
          ],
          clientWallet: testWallet,
          useAI: false
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('invoiceId');
      testInvoiceId = res.body.data.invoiceId;
    }, 30000);
  });

  // Get invoice test
  describe('GET /api/v1/invoice/:id', () => {
    it('should get invoice by id', async () => {
      if (!testInvoiceId) {
        return; // Skip if no invoice created
      }

      const res = await request(app)
        .get(`/api/v1/invoice/${testInvoiceId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testInvoiceId);
    });

    it('should return 404 for non-existent invoice', async () => {
      const res = await request(app)
        .get('/api/v1/invoice/non-existent-id')
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  // Get user invoices test
  describe('GET /api/v1/invoice/user/:wallet', () => {
    it('should get invoices for a user', async () => {
      const res = await request(app)
        .get(`/api/v1/invoice/user/${testWallet}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // Get invoice status test
  describe('GET /api/v1/invoice/:id/status', () => {
    it('should get invoice status', async () => {
      if (!testInvoiceId) {
        return;
      }

      const res = await request(app)
        .get(`/api/v1/invoice/${testInvoiceId}/status`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('status');
      expect(res.body.data).toHaveProperty('milestones');
    });
  });

  // Get statistics test
  describe('GET /api/v1/invoice/stats/:wallet', () => {
    it('should get invoice statistics for a user', async () => {
      const res = await request(app)
        .get(`/api/v1/invoice/stats/${testWallet}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('active');
      expect(res.body.data).toHaveProperty('completed');
    });
  });

  // Validation tests
  describe('Validation', () => {
    it('should reject invalid wallet address', async () => {
      const res = await request(app)
        .get('/api/v1/invoice/user/invalid-address')
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should reject invoice creation with missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/invoice/create')
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });
});

