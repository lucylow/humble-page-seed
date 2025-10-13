// Core Types for BitMind Smart Invoice Application

export interface InvoiceData {
  id: string;
  description: string;
  projectTitle: string;
  clientAddress: string;
  contractorAddress: string;
  arbitratorAddress: string;
  totalAmount: number;
  currency: 'sBTC' | 'STX' | 'USD';
  status: 'DRAFT' | 'DEPLOYED' | 'ACTIVE' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
  contractAddress?: string;
  ipfsHash?: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
  daoName?: string;
  projectType?: string;
  timeline?: string;
}

export interface Milestone {
  id: string;
  invoiceId: string;
  amount: number;
  description: string;
  dueDate?: string;
  condition: string;
  status: 'PENDING' | 'APPROVED' | 'RELEASED' | 'DISPUTED';
  sequence: number;
  completedAt?: string;
  approvedBy?: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string;
  balance: number;
  network: 'mainnet' | 'testnet';
  userData: any;
}

export interface AIParsedInvoice {
  total_amount: number;
  currency: string;
  parties: {
    client: string;
    contractor: string;
  };
  milestones: {
    amount: number;
    percentage: number;
    description: string;
    condition: string;
    due_date?: string;
    sequence: number;
  }[];
  arbitrator?: string;
  project_scope: string;
  project_title: string;
  timeline: string;
  confidence: number;
}

export interface DAOProfile {
  id: string;
  name: string;
  treasuryAddress: string;
  totalBudget: number;
  availableBudget: number;
  activeInvoices: number;
  completedInvoices: number;
  members: number;
  focus: string[];
  createdAt: string;
}

export interface ContractorProfile {
  id: string;
  walletAddress: string;
  name: string;
  rating: number;
  completedProjects: number;
  totalEarned: number;
  skills: string[];
  bio: string;
  availability: 'available' | 'busy' | 'unavailable';
}

export interface DisputeCase {
  id: string;
  invoiceId: string;
  raisedBy: 'client' | 'contractor';
  raisedByAddress: string;
  reason: string;
  evidence: string[];
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED';
  arbitratorAddress?: string;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface PlatformStats {
  totalInvoices: number;
  totalVolume: number;
  activeDAOs: number;
  successRate: number;
  averageCompletionTime: number;
  disputeRate: number;
  growthRate: number;
}

export interface NotificationItem {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface TransactionRecord {
  id: string;
  invoiceId: string;
  type: 'DEPLOY' | 'FUND' | 'RELEASE' | 'REFUND' | 'DISPUTE';
  amount: number;
  from: string;
  to: string;
  txHash: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  timestamp: string;
  blockHeight?: number;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedBudget: number;
  estimatedDuration: string;
  milestones: {
    percentage: number;
    description: string;
    condition: string;
  }[];
  usageCount: number;
}

