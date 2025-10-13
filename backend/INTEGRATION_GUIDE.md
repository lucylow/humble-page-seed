# Frontend Integration Guide

Complete guide for integrating the BitMind Smart Invoice backend with your React frontend.

## Overview

This backend provides a complete REST API for managing AI-powered invoices on the Stacks blockchain. The frontend should handle:
- User wallet connection (Hiro Wallet, Leather, etc.)
- API requests to backend
- Transaction signing
- UI/UX for invoice management

---

## Architecture Flow

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   React     │─────▶│   Backend   │─────▶│   Stacks     │
│   Frontend  │      │   API       │      │  Blockchain  │
└─────────────┘      └─────────────┘      └──────────────┘
      │                     │                      
      │                     │                      
      ▼                     ▼                      
┌─────────────┐      ┌─────────────┐              
│    Hiro     │      │   OpenAI    │              
│   Wallet    │      │   + IPFS    │              
└─────────────┘      └─────────────┘              
```

---

## Step 1: Environment Setup

### Frontend .env
```env
VITE_API_URL=http://localhost:3001/api
VITE_API_VERSION=v1
VITE_STACKS_NETWORK=testnet
```

### Install Dependencies
```bash
npm install @stacks/connect @stacks/transactions axios
```

---

## Step 2: API Client Setup

Create `src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

const api = axios.create({
  baseURL: `${API_BASE_URL}/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds for AI processing
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message;
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default api;
```

---

## Step 3: Invoice Service

Create `src/services/invoiceService.js`:

```javascript
import api from './api';

export const invoiceService = {
  // Parse invoice with AI
  async parseInvoice(description) {
    return await api.post('/invoice/parse', { description });
  },

  // Create invoice
  async createInvoice(invoiceData) {
    return await api.post('/invoice/create', invoiceData);
  },

  // Get invoice by ID
  async getInvoice(id) {
    return await api.get(`/invoice/${id}`);
  },

  // Get user invoices
  async getUserInvoices(walletAddress) {
    return await api.get(`/invoice/user/${walletAddress}`);
  },

  // Get invoice status
  async getInvoiceStatus(id) {
    return await api.get(`/invoice/${id}/status`);
  },

  // Get user statistics
  async getStatistics(walletAddress) {
    return await api.get(`/invoice/stats/${walletAddress}`);
  },

  // Lock funds
  async lockFunds(invoiceId, amount, clientKey) {
    return await api.post(`/invoice/${invoiceId}/lock`, {
      amount,
      clientKey,
    });
  },

  // Release milestone
  async releaseMilestone(invoiceId, milestoneId, clientKey) {
    return await api.post(`/invoice/${invoiceId}/release`, {
      milestoneId,
      clientKey,
    });
  },

  // Raise dispute
  async raiseDispute(invoiceId, disputeData) {
    return await api.post(`/invoice/${invoiceId}/dispute`, disputeData);
  },

  // Get suggestions
  async getSuggestions(partialData) {
    return await api.post('/invoice/suggest', { partialData });
  },
};
```

---

## Step 4: Wallet Integration

Create `src/hooks/useStacksWallet.js`:

```javascript
import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export function useStacksWallet() {
  const [userData, setUserData] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const data = userSession.loadUserData();
      setUserData(data);
      setAddress(data.profile.stxAddress.testnet);
    }
  }, []);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'BitMind Smart Invoice',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        const data = userSession.loadUserData();
        setUserData(data);
        setAddress(data.profile.stxAddress.testnet);
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setUserData(null);
    setAddress(null);
  };

  return {
    userData,
    address,
    isConnected: !!userData,
    connectWallet,
    disconnectWallet,
  };
}
```

---

## Step 5: React Component Example

Create `src/components/CreateInvoice.jsx`:

```javascript
import { useState } from 'react';
import { invoiceService } from '../services/invoiceService';
import { useStacksWallet } from '../hooks/useStacksWallet';

export function CreateInvoice() {
  const { address } = useStacksWallet();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Parse with AI
      const parsedData = await invoiceService.parseInvoice(description);
      
      // Create invoice
      const result = await invoiceService.createInvoice({
        description,
        clientWallet: address,
        useAI: true,
      });

      setResult(result);
      
      // Show success message
      alert(`Invoice created! ID: ${result.data.invoiceId}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-invoice">
      <h2>Create Smart Invoice</h2>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your project and payment terms in natural language..."
          rows={6}
          required
        />
        
        <button type="submit" disabled={loading || !address}>
          {loading ? 'Processing...' : 'Create Invoice'}
        </button>
      </form>

      {error && (
        <div className="error">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="success">
          <h3>Invoice Created!</h3>
          <p>Invoice ID: {result.data.invoiceId}</p>
          <p>Contract: {result.data.contractAddress}</p>
          <p>IPFS: {result.data.ipfsHash}</p>
        </div>
      )}
    </div>
  );
}
```

---

## Step 6: Display User Invoices

Create `src/components/InvoiceList.jsx`:

```javascript
import { useState, useEffect } from 'react';
import { invoiceService } from '../services/invoiceService';
import { useStacksWallet } from '../hooks/useStacksWallet';

export function InvoiceList() {
  const { address } = useStacksWallet();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadInvoices();
    }
  }, [address]);

  const loadInvoices = async () => {
    try {
      const result = await invoiceService.getUserInvoices(address);
      setInvoices(result.data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="invoice-list">
      <h2>My Invoices</h2>
      
      {invoices.length === 0 ? (
        <p>No invoices yet</p>
      ) : (
        <div className="invoices">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="invoice-card">
              <h3>{invoice.invoiceNumber}</h3>
              <p>{invoice.description}</p>
              <p>Amount: {invoice.totalAmount} {invoice.currency}</p>
              <p>Status: {invoice.status}</p>
              <p>Paid: {invoice.paidAmount} / {invoice.totalAmount}</p>
              
              <div className="milestones">
                {invoice.milestones.map((milestone) => (
                  <div key={milestone.id} className="milestone">
                    <span>{milestone.title}</span>
                    <span>{milestone.status}</span>
                    <span>{milestone.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Step 7: Error Handling

Create `src/utils/errorHandler.js`:

```javascript
export function handleApiError(error) {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.error || 'Server error';
    return {
      type: 'server',
      message,
      status: error.response.status,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      type: 'network',
      message: 'Network error. Please check your connection.',
    };
  } else {
    // Other errors
    return {
      type: 'client',
      message: error.message || 'An unexpected error occurred',
    };
  }
}

// Usage in components:
// try {
//   await invoiceService.createInvoice(data);
// } catch (err) {
//   const error = handleApiError(err);
//   showNotification(error.message, 'error');
// }
```

---

## Step 8: Real-time Updates (Optional)

For real-time invoice updates, you can implement polling:

```javascript
import { useState, useEffect } from 'react';
import { invoiceService } from '../services/invoiceService';

export function useInvoicePolling(invoiceId, interval = 5000) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!invoiceId) return;

    const fetchInvoice = async () => {
      try {
        const result = await invoiceService.getInvoiceStatus(invoiceId);
        setInvoice(result.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch invoice:', error);
      }
    };

    fetchInvoice();
    const timer = setInterval(fetchInvoice, interval);

    return () => clearInterval(timer);
  }, [invoiceId, interval]);

  return { invoice, loading };
}
```

---

## Common Integration Patterns

### 1. Loading States
```javascript
{loading && <Spinner />}
{!loading && data && <Content data={data} />}
```

### 2. Error Boundaries
```javascript
<ErrorBoundary fallback={<ErrorMessage />}>
  <InvoiceComponent />
</ErrorBoundary>
```

### 3. Optimistic Updates
```javascript
// Update UI immediately, rollback on error
const optimisticUpdate = async () => {
  const backup = [...invoices];
  setInvoices([...invoices, newInvoice]);
  
  try {
    await invoiceService.createInvoice(data);
  } catch (error) {
    setInvoices(backup);
    showError(error);
  }
};
```

---

## Security Best Practices

1. **Never store private keys in frontend**
   - Use wallet extensions (Hiro, Leather)
   - Sign transactions client-side only

2. **Validate all inputs**
   - Sanitize user input before sending to API
   - Validate addresses using `isValidStacksAddress()`

3. **Handle errors gracefully**
   - Show user-friendly error messages
   - Log errors for debugging

4. **Rate limiting awareness**
   - Implement request debouncing
   - Show loading states during AI processing

---

## Testing

### Unit Tests
```javascript
import { render, screen, waitFor } from '@testing-library/react';
import { CreateInvoice } from './CreateInvoice';

test('creates invoice successfully', async () => {
  render(<CreateInvoice />);
  
  // Fill form and submit
  // Assert success message
});
```

### Integration Tests
```javascript
// Test actual API calls with mock server
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.post('/api/v1/invoice/create', (req, res, ctx) => {
    return res(ctx.json({ success: true, data: {...} }));
  })
);
```

---

## Deployment

### Frontend Environment Variables
```env
# Production
VITE_API_URL=https://api.yourdomain.com/api
VITE_API_VERSION=v1
VITE_STACKS_NETWORK=mainnet

# Staging
VITE_API_URL=https://staging-api.yourdomain.com/api
VITE_STACKS_NETWORK=testnet
```

---

## Troubleshooting

### CORS Issues
- Ensure `CORS_ORIGIN` in backend .env includes your frontend URL
- Use proxy in development (Vite config)

### Wallet Connection Issues
- Check network (testnet vs mainnet)
- Verify wallet extension is installed
- Clear browser cache/cookies

### API Timeout
- AI processing can take 10-30 seconds
- Increase axios timeout
- Show appropriate loading states

---

## Resources

- [Stacks.js Documentation](https://docs.stacks.co/stacks.js/)
- [Hiro Wallet](https://www.hiro.so/wallet)
- [Backend API Docs](./docs/API_DOCUMENTATION.md)
- [Example Frontend](https://github.com/your-repo/frontend-example)

---

## Support

For integration help:
- GitHub Issues
- Discord Community
- Email: dev@bitmind.example

