# BitMind Smart Invoice API Documentation

## Base URL
```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## API Version
Current version: `v1`

All endpoints are prefixed with `/api/v1`

---

## Authentication
Currently, the API uses wallet-based authentication. Private keys are provided in request bodies for signing transactions. In production, implement proper key management and authentication middleware.

---

## Endpoints

### Health & Info

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "BitMind Smart Invoice API is running",
  "version": "v1",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

#### API Info
```http
GET /api/info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "BitMind Smart Invoice API",
    "version": "v1",
    "description": "AI-powered invoice escrow system on Stacks blockchain",
    "endpoints": {
      "invoice": "/v1/invoice",
      "health": "/health",
      "info": "/info"
    }
  }
}
```

---

### AI Processing

#### Parse Invoice Description
Parse natural language invoice description into structured data using AI.

```http
POST /api/v1/invoice/parse
Content-Type: application/json
```

**Request Body:**
```json
{
  "description": "Build a decentralized application for $5000. First milestone: Smart contract development for $2000 due in 2 weeks. Second milestone: Frontend development for $2000 due in 4 weeks. Final milestone: Deployment and testing for $1000 due in 6 weeks."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_amount": 5000,
    "currency": "sBTC",
    "parties": {
      "client": "Client name from description",
      "contractor": "Contractor name from description"
    },
    "milestones": [
      {
        "sequence": 1,
        "amount": 2000,
        "title": "Smart contract development",
        "description": "Develop smart contracts",
        "condition": "Contracts deployed and tested",
        "due_date": "2024-02-15"
      }
    ],
    "arbitrator": "Default arbitrator",
    "project_scope": "Build a decentralized application"
  }
}
```

#### Get AI Suggestions
Get AI-powered suggestions for improving invoice structure.

```http
POST /api/v1/invoice/suggest
Content-Type: application/json
```

**Request Body:**
```json
{
  "partialData": {
    "description": "Build website",
    "amount": 5000
  }
}
```

---

### Invoice Management

#### Create Smart Invoice
Create a new invoice with optional AI processing and blockchain deployment.

```http
POST /api/v1/invoice/create
Content-Type: application/json
```

**Request Body (with AI):**
```json
{
  "description": "Natural language invoice description...",
  "clientWallet": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  "useAI": true,
  "deployerKey": "optional-deployer-private-key"
}
```

**Request Body (without AI - structured):**
```json
{
  "description": "Website development project",
  "projectScope": "Full-stack web development",
  "clientAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  "contractorAddress": "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
  "arbitratorAddress": "ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0",
  "totalAmount": 5000,
  "currency": "sBTC",
  "milestones": [
    {
      "sequence": 1,
      "title": "Design Phase",
      "description": "Complete UI/UX design",
      "amount": 2000,
      "condition": "Design approved by client",
      "due_date": "2024-02-15"
    }
  ],
  "clientWallet": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  "useAI": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invoiceId": "clx1234567890",
    "invoiceNumber": "INV-ABC123",
    "contractAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "contractName": "invoice-1234567890",
    "txId": "0xabcdef...",
    "ipfsHash": "QmXyz...",
    "status": "DEPLOYED",
    "clarityCode": "(define-public (initialize) ...)"
  },
  "message": "Invoice created successfully"
}
```

#### Get Invoice by ID
```http
GET /api/v1/invoice/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "invoiceNumber": "INV-ABC123",
    "description": "Website development",
    "clientAddress": "ST1...",
    "contractorAddress": "ST2...",
    "totalAmount": 5000,
    "paidAmount": 2000,
    "currency": "sBTC",
    "status": "ACTIVE",
    "contractAddress": "ST1...",
    "ipfsHash": "QmXyz...",
    "milestones": [...],
    "disputes": [],
    "transactions": [],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get User Invoices
Get all invoices for a specific wallet address.

```http
GET /api/v1/invoice/user/:walletAddress
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

#### Get Invoice Status
Get detailed status information for an invoice.

```http
GET /api/v1/invoice/:id/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invoiceId": "clx1234567890",
    "invoiceNumber": "INV-ABC123",
    "status": "ACTIVE",
    "totalAmount": 5000,
    "paidAmount": 2000,
    "currency": "sBTC",
    "contractAddress": "ST1...",
    "deploymentTxId": "0xabc...",
    "txStatus": {
      "txId": "0xabc...",
      "status": "success",
      "blockHeight": 12345
    },
    "milestones": [
      {
        "id": "clx...",
        "sequence": 1,
        "title": "Design Phase",
        "amount": 2000,
        "status": "RELEASED",
        "releasedAt": "2024-01-15T00:00:00.000Z"
      }
    ]
  }
}
```

#### Get User Statistics
```http
GET /api/v1/invoice/stats/:walletAddress
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "active": 3,
    "completed": 6,
    "disputed": 1,
    "totalEarned": 25000
  }
}
```

---

### Invoice Actions

#### Lock Funds in Escrow
```http
POST /api/v1/invoice/:id/lock
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 5000,
  "clientKey": "your-private-key"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "txId": "0xabc...",
    "amount": 5000,
    "status": "pending"
  },
  "message": "Funds locked successfully"
}
```

#### Release Milestone Payment
```http
POST /api/v1/invoice/:id/release
Content-Type: application/json
```

**Request Body:**
```json
{
  "milestoneId": "clx1234567890",
  "clientKey": "your-private-key"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "txId": "0xdef...",
    "milestoneId": "clx1234567890",
    "amount": 2000,
    "status": "released"
  },
  "message": "Milestone released successfully"
}
```

---

### Dispute Resolution

#### Raise Dispute
```http
POST /api/v1/invoice/:id/dispute
Content-Type: application/json
```

**Request Body:**
```json
{
  "raisedBy": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  "reason": "Work not completed as agreed",
  "evidence": "Screenshots and documentation showing incomplete work...",
  "userKey": "your-private-key"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "dispute-id",
    "invoiceId": "invoice-id",
    "raisedBy": "ST1...",
    "reason": "Work not completed",
    "status": "OPEN",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Dispute raised successfully"
}
```

#### Resolve Dispute
```http
POST /api/v1/dispute/:id/resolve
Content-Type: application/json
```

**Request Body:**
```json
{
  "resolution": "After reviewing evidence, favor contractor",
  "favorClient": false,
  "arbitratorKey": "arbitrator-private-key",
  "resolvedBy": "ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "dispute-id",
    "status": "RESOLVED",
    "resolution": "After reviewing evidence...",
    "resolvedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Dispute resolved successfully"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Headers included in response:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining

---

## Pagination

For endpoints that return lists, pagination is available:

```http
GET /api/v1/invoice/user/:wallet?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalItems": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Webhooks (Future)

Webhook support for real-time notifications will be added in future versions.

---

## Support

For API support:
- GitHub Issues: [your-repo/issues](https://github.com/your-repo/issues)
- Email: support@bitmind.example

