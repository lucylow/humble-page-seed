import { useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionFeedbackProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  txHash?: string;
  errorMessage?: string;
  successMessage?: string;
  onDismiss?: () => void;
}

export function TransactionFeedback({
  status,
  txHash,
  errorMessage,
  successMessage,
  onDismiss
}: TransactionFeedbackProps) {
  useEffect(() => {
    if (status === 'loading') {
      toast.loading('Transaction pending...', {
        description: 'Please confirm in your wallet',
        id: 'tx-pending'
      });
    }

    if (status === 'success' && txHash) {
      toast.success(successMessage || 'Transaction successful!', {
        id: 'tx-pending',
        description: (
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://etherscan.io/tx/${txHash}`, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View on Etherscan
            </Button>
          </div>
        ),
        duration: 5000
      });
      onDismiss?.();
    }

    if (status === 'error') {
      const message = parseErrorMessage(errorMessage);
      toast.error('Transaction failed', {
        id: 'tx-pending',
        description: message,
        duration: 7000
      });
      onDismiss?.();
    }
  }, [status, txHash, errorMessage, successMessage, onDismiss]);

  return null;
}

function parseErrorMessage(error?: string): string {
  if (!error) return 'An unknown error occurred';

  // User rejected transaction
  if (error.includes('User rejected') || error.includes('user rejected')) {
    return 'You cancelled the transaction';
  }

  // Insufficient funds
  if (error.includes('insufficient funds')) {
    return 'Insufficient funds to complete transaction';
  }

  // Gas estimation failed
  if (error.includes('gas required exceeds')) {
    return 'Transaction would fail. Please check your balance and try again';
  }

  // RPC errors
  if (error.includes('Internal JSON-RPC error')) {
    return 'Network error. Please check your connection and try again';
  }

  // Contract specific errors
  if (error.includes('execution reverted')) {
    const match = error.match(/execution reverted: (.+)/);
    if (match) {
      return `Contract error: ${match[1]}`;
    }
    return 'Transaction would fail. Please check requirements and try again';
  }

  // Rate limiting
  if (error.includes('429') || error.includes('rate limit')) {
    return 'Too many requests. Please wait a moment and try again';
  }

  return error.length > 100 ? 'Transaction failed. Please try again' : error;
}

// Export toast helpers for direct use
export const txToast = {
  pending: () => {
    toast.loading('Transaction pending...', {
      description: 'Please confirm in your wallet',
      id: 'tx-pending'
    });
  },
  
  success: (txHash: string, message?: string) => {
    toast.success(message || 'Transaction successful!', {
      id: 'tx-pending',
      description: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(`https://etherscan.io/tx/${txHash}`, '_blank')}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View on Etherscan
        </Button>
      ),
      duration: 5000
    });
  },
  
  error: (error: string) => {
    toast.error('Transaction failed', {
      id: 'tx-pending',
      description: parseErrorMessage(error),
      duration: 7000
    });
  }
};
