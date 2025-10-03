import { useState, useCallback } from 'react'
import { useAccount, useProvider } from 'wagmi'
import { domaClient, TokenizationParams, TokenizationResult } from '@/lib/domaClient'

export interface UseDomaTokenizationReturn {
  tokenizeDomain: (params: Omit<TokenizationParams, 'owner'>) => Promise<TokenizationResult>
  status: 'idle' | 'processing' | 'success' | 'error'
  transactionHash: string | null
  error: string | null
  reset: () => void
}

export function useDomaTokenization(): UseDomaTokenizationReturn {
  const { address } = useAccount()
  const provider = useProvider()
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const tokenizeDomain = useCallback(async (params: Omit<TokenizationParams, 'owner'>) => {
    if (!address) {
      setError('Wallet not connected')
      setStatus('error')
      return { success: false, error: 'Wallet not connected' }
    }

    setStatus('processing')
    setError(null)
    setTransactionHash(null)

    try {
      // Connect wallet to Doma client
      await domaClient.connectWallet()

      // Execute tokenization
      const result = await domaClient.tokenizeDomain({
        ...params,
        owner: address
      })

      if (result.success) {
        setStatus('success')
        setTransactionHash(result.transactionHash || null)
      } else {
        setStatus('error')
        setError(result.error || 'Tokenization failed')
      }

      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setStatus('error')
      return { success: false, error: errorMessage }
    }
  }, [address])

  const reset = useCallback(() => {
    setStatus('idle')
    setTransactionHash(null)
    setError(null)
  }, [])

  return {
    tokenizeDomain,
    status,
    transactionHash,
    error,
    reset
  }
}

