// Centralized type definitions for DomaLand

export interface Domain {
  id?: string;
  tokenId: string;
  name: string;
  currentPrice: number;
  registrationDate: string;
  expirationDate: string;
  isTokenized: boolean;
  isListed: boolean;
  isFractionalized: boolean;
  category?: DomainCategory;
  traffic?: DomainTraffic;
  metadata?: DomainMetadata;
  owner?: string;
  price?: string;
}

export interface DomainTraffic {
  monthlyVisitors: number;
  pageViews?: number;
  bounceRate?: number;
}

export interface DomainMetadata {
  description: string;
  category: DomainCategory;
  tags: string[];
  fractionalization: boolean;
  royalties: number;
  imageUrl?: string;
  socialLinks?: SocialLinks;
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  website?: string;
}

export type DomainCategory = 
  | 'crypto' 
  | 'tech' 
  | 'finance' 
  | 'health' 
  | 'ecommerce' 
  | 'education' 
  | 'entertainment' 
  | 'other';

export interface Transaction {
  id: string;
  domainId: string;
  amount: number;
  timestamp: string;
  type: TransactionType;
  buyer?: string;
  seller?: string;
  status: TransactionStatus;
}

export type TransactionType = 'sale' | 'offer' | 'listing' | 'bid';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Metrics {
  totalTransactions: number;
  dailyTransactions: number;
  activeUsers: number;
  totalRevenue: number;
  projectedRevenue: number;
  domainStats: DomainStats;
}

export interface DomainStats {
  totalTokenized: number;
  totalListed: number;
  totalFractionalized: number;
}

export interface Conversation {
  id: string;
  domainId?: string;
  domainName?: string;
  lastMessage?: Message;
  unreadCount: number;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  type: 'text' | 'offer' | 'counter-offer';
}

export interface TourStep {
  selector: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface Tour {
  id: string;
  name: string;
  steps: TourStep[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: 'USD' | 'ETH' | 'BTC';
  notifications: NotificationSettings;
  accessibility: AccessibilitySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilterOptions {
  category?: DomainCategory;
  priceRange?: [number, number];
  isTokenized?: boolean;
  isListed?: boolean;
  isFractionalized?: boolean;
  sortBy?: 'name' | 'value' | 'date' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchOptions extends FilterOptions {
  query?: string;
  page?: number;
  limit?: number;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingStateProps extends BaseComponentProps {
  isLoading: boolean;
  error?: string;
  retry?: () => void;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Event Types
export interface DomainEvent {
  type: 'tokenized' | 'listed' | 'sold' | 'fractionalized';
  domain: Domain;
  timestamp: string;
  data?: Record<string, any>;
}

export interface UserEvent {
  type: 'login' | 'logout' | 'wallet_connected' | 'wallet_disconnected';
  user: string;
  timestamp: string;
  data?: Record<string, any>;
}

// Additional types for refactored components
export type UserType = 'investor' | 'buyer' | 'developer';

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  component: React.ReactNode;
  isComplete?: boolean;
}

export interface WalletOption {
  id: string;
  name: string;
  icon: string;
  isAvailable: boolean;
}

export interface OnboardingData {
  userType: UserType;
  walletType: string;
  preferences: {
    notifications: boolean;
    analytics: boolean;
  };
}
