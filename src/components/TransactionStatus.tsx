import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Loader2, 
  XCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { BlockchainError, getErrorActionText, canRetryTransaction } from '@/lib/blockchainErrorHandler';

export type TransactionState = 'idle' | 'pending' | 'success' | 'error';

interface TransactionStatusProps {
  state: TransactionState;
  txId?: string;
  error?: BlockchainError;
  title?: string;
  successMessage?: string;
  pendingMessage?: string;
  onRetry?: () => void;
  onClose?: () => void;
  explorerUrl?: string;
}

export function TransactionStatus({
  state,
  txId,
  error,
  title = 'Transaction Status',
  successMessage = 'Transaction completed successfully',
  pendingMessage = 'Transaction pending...',
  onRetry,
  onClose,
  explorerUrl = 'https://explorer.hiro.so/txid'
}: TransactionStatusProps) {
  if (state === 'idle') return null;

  const getStatusIcon = () => {
    switch (state) {
      case 'pending':
        return <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-12 h-12 text-green-600" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-red-600" />;
      default:
        return <Clock className="w-12 h-12 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (state) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pending</Badge>;
      case 'success':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Success</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center py-6">
          {getStatusIcon()}
          
          {state === 'pending' && (
            <div className="text-center mt-4">
              <p className="font-semibold mb-2">{pendingMessage}</p>
              <p className="text-sm text-muted-foreground">
                Please confirm the transaction in your wallet and wait for blockchain confirmation
              </p>
            </div>
          )}

          {state === 'success' && (
            <div className="text-center mt-4">
              <p className="font-semibold text-green-700 mb-2">{successMessage}</p>
              {txId && (
                <div className="mt-3">
                  <a
                    href={`${explorerUrl}/${txId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    View on Explorer
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <div className="mt-2 text-xs text-muted-foreground font-mono bg-gray-50 p-2 rounded break-all">
                    {txId}
                  </div>
                </div>
              )}
            </div>
          )}

          {state === 'error' && error && (
            <div className="text-center mt-4 space-y-3 w-full">
              <div>
                <p className="font-semibold text-red-700 mb-2">Transaction Failed</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
              </div>
              
              {error.technicalDetails && (
                <details className="text-xs text-left">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Technical details
                  </summary>
                  <div className="mt-2 p-2 bg-gray-50 rounded font-mono break-all">
                    {error.technicalDetails}
                  </div>
                </details>
              )}

              {canRetryTransaction(error) && onRetry && (
                <Button
                  onClick={onRetry}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {getErrorActionText(error)}
                </Button>
              )}
            </div>
          )}
        </div>

        {(state === 'success' || state === 'error') && onClose && (
          <div className="pt-4 border-t">
            <Button onClick={onClose} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TransactionStatus;
