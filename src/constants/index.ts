// Constants for DomaLand application

export const APP_CONFIG = {
  name: 'DomaLand',
  version: '1.0.0',
  description: 'Domain tokenization and trading platform',
  author: 'DomaLand Team',
} as const;

export const UI_CONSTANTS = {
  // Animation durations
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  
  // Breakpoints
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
  
  // Touch targets
  TOUCH_TARGET_SIZE: 44,
  
  // Z-index layers
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080,
  },
  
  // Spacing
  SPACING: {
    XS: '0.25rem',
    SM: '0.5rem',
    MD: '1rem',
    LG: '1.5rem',
    XL: '2rem',
    '2XL': '3rem',
  },
} as const;

export const DOMAIN_CONSTANTS = {
  // Default values
  DEFAULT_ROYALTIES: 2.5,
  MIN_ROYALTIES: 0,
  MAX_ROYALTIES: 10,
  
  // Categories
  CATEGORIES: [
    { value: 'crypto', label: 'Crypto & Blockchain', icon: '₿' },
    { value: 'tech', label: 'Technology', icon: '💻' },
    { value: 'finance', label: 'Finance', icon: '💰' },
    { value: 'health', label: 'Health & Wellness', icon: '🏥' },
    { value: 'ecommerce', label: 'E-commerce', icon: '🛒' },
    { value: 'education', label: 'Education', icon: '🎓' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'other', label: 'Other', icon: '🌐' },
  ] as const,
  
  // Price ranges
  PRICE_RANGES: [
    { label: 'Under $1K', min: 0, max: 1000 },
    { label: '$1K - $10K', min: 1000, max: 10000 },
    { label: '$10K - $100K', min: 10000, max: 100000 },
    { label: '$100K+', min: 100000, max: Infinity },
  ] as const,
  
  // Status colors
  STATUS_COLORS: {
    tokenized: 'green',
    listed: 'blue',
    fractionalized: 'purple',
    available: 'gray',
  } as const,
} as const;

export const WALLET_CONSTANTS = {
  // Supported wallets
  WALLETS: [
    { id: 'metamask', name: 'MetaMask', icon: '🦊' },
    { id: 'walletconnect', name: 'WalletConnect', icon: '🔗' },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵' },
  ] as const,
  
  // Network configurations
  NETWORKS: {
    ethereum: {
      chainId: 1,
      name: 'Ethereum',
      symbol: 'ETH',
      rpcUrl: 'https://mainnet.infura.io/v3/',
    },
    polygon: {
      chainId: 137,
      name: 'Polygon',
      symbol: 'MATIC',
      rpcUrl: 'https://polygon-rpc.com/',
    },
    testnet: {
      chainId: 5,
      name: 'Goerli Testnet',
      symbol: 'ETH',
      rpcUrl: 'https://goerli.infura.io/v3/',
    },
  } as const,
} as const;

export const TOUR_CONSTANTS = {
  // Tour configurations
  TOURS: {
    onboarding: {
      id: 'onboarding',
      name: 'Onboarding Tour',
      duration: 300000, // 5 minutes
    },
    marketplace: {
      id: 'marketplace',
      name: 'Marketplace Tour',
      duration: 180000, // 3 minutes
    },
    analytics: {
      id: 'analytics',
      name: 'Analytics Tour',
      duration: 240000, // 4 minutes
    },
  } as const,
  
  // Help content
  HELP_CONTENT: {
    tokenization: 'Tokenizing converts your domain into a blockchain asset that can be traded, fractionalized, or used as collateral.',
    fractionalization: 'Fractional ownership allows multiple investors to own shares of a high-value domain, increasing liquidity.',
    valuation: 'Our AI-powered valuation considers market trends, domain characteristics, and historical sales data.',
    marketplace: 'The marketplace allows you to buy and sell tokenized domains with transparent pricing and secure transactions.',
    analytics: 'Analytics provide insights into your portfolio performance, market trends, and investment opportunities.',
    messaging: 'Secure messaging enables direct communication with domain sellers for negotiations and inquiries.',
  } as const,
} as const;

export const ACCESSIBILITY_CONSTANTS = {
  // ARIA labels
  ARIA_LABELS: {
    CLOSE_MODAL: 'Close modal',
    OPEN_MENU: 'Open menu',
    CLOSE_MENU: 'Close menu',
    NEXT_STEP: 'Next step',
    PREVIOUS_STEP: 'Previous step',
    SKIP_TO_CONTENT: 'Skip to main content',
    LOADING: 'Loading content',
    ERROR: 'Error occurred',
  } as const,
  
  // Keyboard shortcuts
  KEYBOARD_SHORTCUTS: {
    ESCAPE: 'Escape',
    ENTER: 'Enter',
    SPACE: ' ',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
  } as const,
} as const;

export const API_CONSTANTS = {
  // Endpoints
  ENDPOINTS: {
    DOMAINS: '/api/domains',
    TRANSACTIONS: '/api/transactions',
    USERS: '/api/users',
    ANALYTICS: '/api/analytics',
    MARKETPLACE: '/api/marketplace',
  } as const,
  
  // Request timeouts
  TIMEOUTS: {
    DEFAULT: 10000,
    UPLOAD: 30000,
    ANALYTICS: 15000,
  } as const,
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
    BACKOFF_MULTIPLIER: 2,
  } as const,
} as const;

export const STORAGE_KEYS = {
  USER_PREFERENCES: 'domaland-user-preferences',
  ONBOARDING_COMPLETED: 'domaland-onboarding-completed',
  TOUR_COMPLETED: 'domaland-tour-completed',
  THEME: 'domaland-theme',
  LANGUAGE: 'domaland-language',
  WALLET_CONNECTION: 'domaland-wallet-connection',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue.',
  INSUFFICIENT_FUNDS: 'Insufficient funds for this transaction.',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  INVALID_INPUT: 'Please enter a valid value.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
} as const;

export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully!',
  DOMAIN_TOKENIZED: 'Domain tokenized successfully!',
  DOMAIN_LISTED: 'Domain listed for sale!',
  TRANSACTION_COMPLETED: 'Transaction completed successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  TOUR_COMPLETED: 'Tour completed! You\'re ready to explore.',
} as const;
