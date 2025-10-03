// Error handling utilities for DomaLand

import { ERROR_MESSAGES } from '../constants';

export interface AppError extends Error {
  code?: string;
  status?: number;
  context?: string;
  userMessage?: string;
}

export class DomainError extends Error implements AppError {
  code: string;
  status: number;
  context: string;
  userMessage: string;

  constructor(
    message: string,
    code: string = 'DOMAIN_ERROR',
    status: number = 400,
    context: string = 'domain',
    userMessage?: string
  ) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.status = status;
    this.context = context;
    this.userMessage = userMessage || ERROR_MESSAGES.SERVER_ERROR;
  }
}

export class WalletError extends Error implements AppError {
  code: string;
  status: number;
  context: string;
  userMessage: string;

  constructor(
    message: string,
    code: string = 'WALLET_ERROR',
    status: number = 400,
    context: string = 'wallet',
    userMessage?: string
  ) {
    super(message);
    this.name = 'WalletError';
    this.code = code;
    this.status = status;
    this.context = context;
    this.userMessage = userMessage || ERROR_MESSAGES.WALLET_NOT_CONNECTED;
  }
}

export class NetworkError extends Error implements AppError {
  code: string;
  status: number;
  context: string;
  userMessage: string;

  constructor(
    message: string,
    code: string = 'NETWORK_ERROR',
    status: number = 0,
    context: string = 'network',
    userMessage?: string
  ) {
    super(message);
    this.name = 'NetworkError';
    this.code = code;
    this.status = status;
    this.context = context;
    this.userMessage = userMessage || ERROR_MESSAGES.NETWORK_ERROR;
  }
}

export class ValidationError extends Error implements AppError {
  code: string;
  status: number;
  context: string;
  userMessage: string;
  field?: string;

  constructor(
    message: string,
    field?: string,
    code: string = 'VALIDATION_ERROR',
    status: number = 400,
    context: string = 'validation',
    userMessage?: string
  ) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.status = status;
    this.context = context;
    this.field = field;
    this.userMessage = userMessage || ERROR_MESSAGES.INVALID_INPUT;
  }
}

// Error handler function
export const handleError = (error: unknown): AppError => {
  if (error && typeof error === 'object' && 'code' in error && 'status' in error) {
    return error as AppError;
  }

  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return new NetworkError(error.message);
    }

    if (error.message.includes('wallet') || error.message.includes('metamask')) {
      return new WalletError(error.message);
    }

    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return new ValidationError(error.message);
    }

    // Generic error
    return new DomainError(error.message);
  }

  // Unknown error type
  return new DomainError('An unknown error occurred');
};

// Error boundary helper
export const getErrorBoundaryFallback = (error: AppError) => {
  return {
    title: 'Something went wrong',
    message: error.userMessage || ERROR_MESSAGES.SERVER_ERROR,
    action: 'Try again',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
  };
};

// Validation helpers
export const validateDomainName = (name: string): boolean => {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
  return domainRegex.test(name);
};

export const validatePrice = (price: number): boolean => {
  return price > 0 && price < Number.MAX_SAFE_INTEGER;
};

export const validateWalletAddress = (address: string): boolean => {
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  return addressRegex.test(address);
};

// Retry utility
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw handleError(error);
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }

  throw lastError!;
};

// Error logging utility
export const logError = (error: AppError, context?: string) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.status,
      context: error.context || context,
      stack: error.stack,
    },
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service (e.g., Sentry, LogRocket)
    console.error('Error logged:', errorLog);
  } else {
    // In development, log to console
    console.error('Development error:', errorLog);
  }
};

// Error recovery strategies
export const getRecoveryStrategy = (error: AppError): string[] => {
  const strategies: string[] = [];

  switch (error.code) {
    case 'NETWORK_ERROR':
      strategies.push('Check your internet connection');
      strategies.push('Try refreshing the page');
      strategies.push('Contact support if the issue persists');
      break;

    case 'WALLET_ERROR':
      strategies.push('Make sure your wallet is connected');
      strategies.push('Try reconnecting your wallet');
      strategies.push('Check if you have sufficient funds');
      break;

    case 'VALIDATION_ERROR':
      strategies.push('Check your input values');
      strategies.push('Make sure all required fields are filled');
      strategies.push('Verify the format of your data');
      break;

    case 'DOMAIN_ERROR':
      strategies.push('Verify the domain name is correct');
      strategies.push('Check if the domain is available');
      strategies.push('Try again in a few moments');
      break;

    default:
      strategies.push('Try refreshing the page');
      strategies.push('Contact support if the issue persists');
  }

  return strategies;
};
