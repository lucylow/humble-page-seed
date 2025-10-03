/**
 * Contract addresses and network configurations for DomaLand.AI
 * This file contains the deployed contract addresses and network settings
 */

// Network configurations
export const NETWORKS = {
  DOMA_TESTNET: {
    chainId: 1234,
    name: 'Doma Testnet',
    rpcUrl: 'https://testnet.doma.xyz/rpc',
    blockExplorer: 'https://testnet.domascan.xyz',
    nativeCurrency: {
      name: 'Doma',
      symbol: 'DOMA',
      decimals: 18
    }
  },
  DOMA_MAINNET: {
    chainId: 5678,
    name: 'Doma Mainnet',
    rpcUrl: 'https://mainnet.doma.xyz/rpc',
    blockExplorer: 'https://domascan.xyz',
    nativeCurrency: {
      name: 'Doma',
      symbol: 'DOMA',
      decimals: 18
    }
  },
  ETHEREUM_MAINNET: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  }
} as const;

// Contract addresses (Doma Testnet)
export const CONTRACT_ADDRESSES = {
  DOMA_TESTNET: {
    DOMA_OFFER_MANAGER: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    DOMA_PAGE_REGISTRY: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
    DOMA_MARKETPLACE: '0x6fC21092DA55B392b745d0B6c49543c4e30fC2b3',
    DOMA_INTEGRATION_HELPER: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
    DOMA_REGISTRAR: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    DOMA_RESOLVER: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
    USDC_TOKEN: '0xA0b86a33E6441b8dB2B2b0b0b0b0b0b0b0b0b0b0'
  },
  DOMA_MAINNET: {
    DOMA_OFFER_MANAGER: '0x0000000000000000000000000000000000000000', // To be deployed
    DOMA_PAGE_REGISTRY: '0x0000000000000000000000000000000000000000', // To be deployed
    DOMA_MARKETPLACE: '0x0000000000000000000000000000000000000000', // To be deployed
    DOMA_INTEGRATION_HELPER: '0x0000000000000000000000000000000000000000', // To be deployed
    DOMA_REGISTRAR: '0x0000000000000000000000000000000000000000', // To be deployed
    DOMA_RESOLVER: '0x0000000000000000000000000000000000000000', // To be deployed
    USDC_TOKEN: '0x0000000000000000000000000000000000000000' // To be deployed
  }
} as const;

// Current network (default to testnet)
export const CURRENT_NETWORK = 'DOMA_TESTNET';

// Contract addresses for current network
export const DOMA_OFFER_MANAGER_ADDRESS = CONTRACT_ADDRESSES[CURRENT_NETWORK].DOMA_OFFER_MANAGER;
export const DOMA_PAGE_REGISTRY_ADDRESS = CONTRACT_ADDRESSES[CURRENT_NETWORK].DOMA_PAGE_REGISTRY;
export const DOMA_MARKETPLACE_ADDRESS = CONTRACT_ADDRESSES[CURRENT_NETWORK].DOMA_MARKETPLACE;
export const DOMA_INTEGRATION_HELPER_ADDRESS = CONTRACT_ADDRESSES[CURRENT_NETWORK].DOMA_INTEGRATION_HELPER;
export const DOMA_REGISTRAR_ADDRESS = CONTRACT_ADDRESSES[CURRENT_NETWORK].DOMA_REGISTRAR;
export const DOMA_RESOLVER_ADDRESS = CONTRACT_ADDRESSES[CURRENT_NETWORK].DOMA_RESOLVER;
export const USDC_TOKEN_ADDRESS = CONTRACT_ADDRESSES[CURRENT_NETWORK].USDC_TOKEN;

// Supported payment tokens
export const SUPPORTED_TOKENS = {
  NATIVE: '0x0000000000000000000000000000000000000000',
  USDC: USDC_TOKEN_ADDRESS
} as const;

// IPFS configurations
export const IPFS_CONFIG = {
  GATEWAYS: [
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/'
  ],
  PINATA_API_URL: 'https://api.pinata.cloud',
  DEFAULT_GATEWAY: 'https://gateway.pinata.cloud/ipfs/'
} as const;

// API endpoints
export const API_ENDPOINTS = {
  BACKEND_BASE: 'http://localhost:5000',
  DOMAIN_METADATA: '/api/domains/metadata',
  DOMAIN_ANALYTICS: '/api/domains/analytics',
  DOMAIN_VALUATION: '/api/domains/valuation',
  USER_PROFILE: '/api/users/profile',
  MARKETPLACE_DATA: '/api/marketplace/data'
} as const;

// Default values
export const DEFAULTS = {
  OFFER_DURATION: 7 * 24 * 60 * 60, // 7 days in seconds
  MAX_OFFER_DURATION: 30 * 24 * 60 * 60, // 30 days in seconds
  MIN_OFFER_AMOUNT: '0.001', // Minimum offer amount in ETH
  PROTOCOL_FEE_BPS: 50, // 0.5% protocol fee
  MAX_PROTOCOL_FEE_BPS: 500, // 5% maximum protocol fee
  PAGE_SIZE: 20, // Default page size for pagination
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes cache duration
  TRANSACTION_TIMEOUT: 300000, // 5 minutes transaction timeout
  RETRY_ATTEMPTS: 3, // Number of retry attempts for failed requests
  RETRY_DELAY: 1000 // Delay between retry attempts in milliseconds
} as const;

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction',
  TRANSACTION_FAILED: 'Transaction failed. Please try again',
  NETWORK_ERROR: 'Network error. Please check your connection',
  DOMAIN_NOT_FOUND: 'Domain not found',
  OFFER_EXPIRED: 'This offer has expired',
  OFFER_ALREADY_FULFILLED: 'This offer has already been fulfilled',
  OFFER_CANCELED: 'This offer has been canceled',
  DOMAIN_NOT_TRANSFERABLE: 'This domain is not available for transfer',
  INVALID_AMOUNT: 'Please enter a valid amount',
  AMOUNT_TOO_LOW: 'Amount is too low',
  AMOUNT_TOO_HIGH: 'Amount is too high',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  RATE_LIMITED: 'Too many requests. Please try again later'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  OFFER_CREATED: 'Offer created successfully',
  OFFER_ACCEPTED: 'Offer accepted successfully',
  OFFER_CANCELED: 'Offer canceled successfully',
  DOMAIN_PURCHASED: 'Domain purchased successfully',
  DOMAIN_LISTED: 'Domain listed successfully',
  DOMAIN_UNLISTED: 'Domain unlisted successfully',
  WALLET_CONNECTED: 'Wallet connected successfully',
  TRANSACTION_CONFIRMED: 'Transaction confirmed',
  PROFILE_UPDATED: 'Profile updated successfully'
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  WALLET_CONNECTION: 'domaland-wallet-connection',
  USER_PREFERENCES: 'domaland-user-preferences',
  RECENT_TRANSACTIONS: 'domaland-recent-transactions',
  CACHED_DOMAINS: 'domaland-cached-domains',
  ONBOARDING_COMPLETED: 'domaland-onboarding-completed',
  THEME_PREFERENCE: 'domaland-theme-preference',
  LANGUAGE_PREFERENCE: 'domaland-language-preference'
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_DARK_MODE: true,
  ENABLE_MULTI_LANGUAGE: false,
  ENABLE_SOCIAL_SHARING: true,
  ENABLE_AI_VALUATION: true,
  ENABLE_FRACTIONALIZATION: true
} as const;

// Social media configurations
export const SOCIAL_CONFIG = {
  TWITTER_HANDLE: '@DomaLandAI',
  DISCORD_INVITE: 'https://discord.gg/domaland',
  TELEGRAM_GROUP: 'https://t.me/domaland',
  GITHUB_REPO: 'https://github.com/domaland/domaland-ai',
  DOCUMENTATION: 'https://docs.domaland.ai',
  SUPPORT_EMAIL: 'support@domaland.ai'
} as const;

// Analytics configurations
export const ANALYTICS_CONFIG = {
  GOOGLE_ANALYTICS_ID: '',
  MIXPANEL_TOKEN: '',
  HOTJAR_ID: '',
  SENTRY_DSN: ''
} as const;


