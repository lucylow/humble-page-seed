// Invoice Service - API communication layer
import { InvoiceData, AIParsedInvoice } from '../types';
import { mockInvoices, mockAIParseInvoice } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const USE_MOCK_DATA = true; // Set to false when backend is ready

export const invoiceService = {
  async createSmartInvoice(invoiceData: {
    description: string;
    projectTitle: string;
    clientWallet: string;
    contractorAddress: string;
    arbitratorAddress?: string;
  }): Promise<{ success: boolean; invoiceId: string; contractAddress: string }> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        invoiceId: `INV-${Date.now()}`,
        contractAddress: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      };
    }

    // Real API call
    const response = await fetch(`${API_BASE_URL}/invoice/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData),
    });

    return response.json();
  },

  async getAIPreview(description: string): Promise<AIParsedInvoice> {
    if (USE_MOCK_DATA) {
      return mockAIParseInvoice(description);
    }

    const response = await fetch(`${API_BASE_URL}/ai/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });

    return response.json();
  },

  async getUserInvoices(walletAddress: string): Promise<InvoiceData[]> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter invoices for this user (client or contractor)
      return mockInvoices.filter(
        inv => inv.clientAddress === walletAddress || inv.contractorAddress === walletAddress
      );
    }

    const response = await fetch(`${API_BASE_URL}/invoices/user/${walletAddress}`);
    return response.json();
  },

  async getInvoiceById(invoiceId: string): Promise<InvoiceData | null> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockInvoices.find(inv => inv.id === invoiceId) || null;
    }

    const response = await fetch(`${API_BASE_URL}/invoice/${invoiceId}`);
    return response.json();
  },

  async releaseMilestone(
    invoiceId: string,
    milestoneId: string,
    clientWallet: string
  ): Promise<{ success: boolean; txHash: string }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        txHash: `0x${Math.random().toString(16).slice(2)}`,
      };
    }

    const response = await fetch(`${API_BASE_URL}/invoice/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId, milestoneId, clientWallet }),
    });

    return response.json();
  },

  async raiseDispute(
    invoiceId: string,
    reason: string,
    raisedBy: string
  ): Promise<{ success: boolean; disputeId: string }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        disputeId: `DIS-${Date.now()}`,
      };
    }

    const response = await fetch(`${API_BASE_URL}/invoice/dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId, reason, raisedBy }),
    });

    return response.json();
  },

  async getAllInvoices(): Promise<InvoiceData[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockInvoices;
    }

    const response = await fetch(`${API_BASE_URL}/invoices/all`);
    return response.json();
  },
};

