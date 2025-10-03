// Error Handling Utility for Doma Protocol
export class DomaError extends Error {
  public readonly code: string;
  public readonly details: unknown;

  constructor(message: string, code: string, details: unknown = null) {
    super(message);
    this.name = 'DomaError';
    this.code = code;
    this.details = details;
  }
}

export const handleDomaError = (error: unknown): DomaError => {
  if (error instanceof DomaError) {
    return error;
  }

  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorCode = error instanceof Error ? (error as any).code : 'UNKNOWN_ERROR';

  // Handle specific error cases
  if (errorCode === 4001) {
    // User rejected transaction
    return new DomaError('Transaction rejected by user', 'USER_REJECTED');
  }
  
  if (errorMessage.includes('insufficient funds')) {
    return new DomaError('Insufficient funds for transaction', 'INSUFFICIENT_FUNDS');
  }
  
  if (errorMessage.includes('voucher expired')) {
    return new DomaError('Voucher has expired', 'VOUCHER_EXPIRED');
  }

  if (errorMessage.includes('voucher invalid')) {
    return new DomaError('Voucher is invalid', 'VOUCHER_INVALID');
  }

  if (errorMessage.includes('token not found')) {
    return new DomaError('Token not found', 'TOKEN_NOT_FOUND');
  }

  if (errorMessage.includes('unauthorized')) {
    return new DomaError('Unauthorized access', 'UNAUTHORIZED');
  }

  if (errorMessage.includes('network error')) {
    return new DomaError('Network connection error', 'NETWORK_ERROR');
  }

  if (errorMessage.includes('gas')) {
    return new DomaError('Gas estimation or execution failed', 'GAS_ERROR');
  }

  if (errorMessage.includes('revert')) {
    return new DomaError('Transaction reverted', 'TRANSACTION_REVERTED');
  }

  // Add more specific error handling as needed
  return new DomaError(errorMessage, errorCode, error);
};

// Error codes enum for consistency
export const DOMA_ERROR_CODES = {
  USER_REJECTED: 'USER_REJECTED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  VOUCHER_EXPIRED: 'VOUCHER_EXPIRED',
  VOUCHER_INVALID: 'VOUCHER_INVALID',
  TOKEN_NOT_FOUND: 'TOKEN_NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  GAS_ERROR: 'GAS_ERROR',
  TRANSACTION_REVERTED: 'TRANSACTION_REVERTED',
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  INVALID_DOMAIN: 'INVALID_DOMAIN',
  API_ERROR: 'API_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

export type DomaErrorCode = typeof DOMA_ERROR_CODES[keyof typeof DOMA_ERROR_CODES];

// Helper function to check if error is a specific type
export const isDomaError = (error: unknown, code?: DomaErrorCode): error is DomaError => {
  if (!(error instanceof DomaError)) {
    return false;
  }
  
  if (code) {
    return error.code === code;
  }
  
  return true;
};

// Helper function to get user-friendly error messages
export const getErrorMessage = (error: unknown): string => {
  const domaError = handleDomaError(error);
  
  switch (domaError.code) {
    case DOMA_ERROR_CODES.USER_REJECTED:
      return 'Transaction was cancelled by user';
    case DOMA_ERROR_CODES.INSUFFICIENT_FUNDS:
      return 'Insufficient funds to complete transaction';
    case DOMA_ERROR_CODES.VOUCHER_EXPIRED:
      return 'The authorization voucher has expired. Please try again';
    case DOMA_ERROR_CODES.VOUCHER_INVALID:
      return 'Invalid authorization voucher';
    case DOMA_ERROR_CODES.TOKEN_NOT_FOUND:
      return 'Token not found';
    case DOMA_ERROR_CODES.UNAUTHORIZED:
      return 'You are not authorized to perform this action';
    case DOMA_ERROR_CODES.NETWORK_ERROR:
      return 'Network connection error. Please check your internet connection';
    case DOMA_ERROR_CODES.GAS_ERROR:
      return 'Transaction failed due to gas issues';
    case DOMA_ERROR_CODES.TRANSACTION_REVERTED:
      return 'Transaction was reverted by the smart contract';
    case DOMA_ERROR_CODES.WALLET_NOT_CONNECTED:
      return 'Please connect your wallet first';
    case DOMA_ERROR_CODES.INVALID_DOMAIN:
      return 'Invalid domain name format';
    case DOMA_ERROR_CODES.API_ERROR:
      return 'API request failed. Please try again later';
    default:
      return domaError.message || 'An unexpected error occurred';
  }
};

// Helper function to log errors with context
export const logDomaError = (error: unknown, context: string): void => {
  const domaError = handleDomaError(error);
  console.error(`[Doma Error] ${context}:`, {
    code: domaError.code,
    message: domaError.message,
    details: domaError.details,
    stack: domaError.stack
  });
};
