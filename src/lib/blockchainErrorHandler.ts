/**
 * Enhanced blockchain error handling with user-friendly messages
 */

export interface BlockchainError {
  type: 'user_rejected' | 'insufficient_funds' | 'network_error' | 'contract_error' | 'timeout' | 'unknown';
  message: string;
  technicalDetails?: string;
  retryable: boolean;
}

/**
 * Parse blockchain transaction errors into user-friendly messages
 */
export function parseBlockchainError(error: any): BlockchainError {
  const errorString = error?.toString().toLowerCase() || '';
  const errorMessage = error?.message?.toLowerCase() || '';

  // User rejected transaction
  if (
    errorString.includes('user rejected') || 
    errorString.includes('cancelled') ||
    errorMessage.includes('user rejected') ||
    errorMessage.includes('cancelled')
  ) {
    return {
      type: 'user_rejected',
      message: 'Transaction was cancelled',
      technicalDetails: error?.message,
      retryable: true
    };
  }

  // Insufficient funds
  if (
    errorString.includes('insufficient') ||
    errorString.includes('not enough') ||
    errorMessage.includes('insufficient')
  ) {
    return {
      type: 'insufficient_funds',
      message: 'Insufficient funds to complete transaction. Please check your balance and try again.',
      technicalDetails: error?.message,
      retryable: false
    };
  }

  // Network/connection errors
  if (
    errorString.includes('network') ||
    errorString.includes('timeout') ||
    errorString.includes('fetch') ||
    errorString.includes('connection') ||
    errorMessage.includes('network')
  ) {
    return {
      type: 'network_error',
      message: 'Network connection error. Please check your internet connection and try again.',
      technicalDetails: error?.message,
      retryable: true
    };
  }

  // Timeout errors
  if (errorString.includes('timeout') || errorMessage.includes('timeout')) {
    return {
      type: 'timeout',
      message: 'Transaction timed out. The blockchain may be congested. Please try again.',
      technicalDetails: error?.message,
      retryable: true
    };
  }

  // Contract execution errors
  if (
    errorString.includes('contract') ||
    errorString.includes('clarity') ||
    errorString.includes('assertion') ||
    errorMessage.includes('contract')
  ) {
    return {
      type: 'contract_error',
      message: 'Smart contract execution failed. Please verify your transaction details and try again.',
      technicalDetails: error?.message,
      retryable: false
    };
  }

  // Generic unknown error
  return {
    type: 'unknown',
    message: 'An unexpected error occurred. Please try again or contact support if the issue persists.',
    technicalDetails: error?.message || String(error),
    retryable: true
  };
}

/**
 * Wrapper for blockchain transactions with enhanced error handling
 */
export async function executeBlockchainTransaction<T>(
  transactionFn: () => Promise<T>,
  options: {
    onStart?: () => void;
    onSuccess?: (result: T) => void;
    onError?: (error: BlockchainError) => void;
    onFinally?: () => void;
  } = {}
): Promise<{ success: boolean; data?: T; error?: BlockchainError }> {
  const { onStart, onSuccess, onError, onFinally } = options;

  try {
    onStart?.();
    const result = await transactionFn();
    onSuccess?.(result);
    return { success: true, data: result };
  } catch (error) {
    const parsedError = parseBlockchainError(error);
    onError?.(parsedError);
    return { success: false, error: parsedError };
  } finally {
    onFinally?.();
  }
}

/**
 * Check if error is retryable
 */
export function canRetryTransaction(error: BlockchainError): boolean {
  return error.retryable;
}

/**
 * Get appropriate action text based on error type
 */
export function getErrorActionText(error: BlockchainError): string {
  switch (error.type) {
    case 'user_rejected':
      return 'Try Again';
    case 'insufficient_funds':
      return 'Check Balance';
    case 'network_error':
    case 'timeout':
      return 'Retry';
    case 'contract_error':
      return 'Review Details';
    default:
      return 'Try Again';
  }
}
